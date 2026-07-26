#!/usr/bin/env node
/**
 * verify-receipt — évite de rejouer les checks déjà passés sur un arbre inchangé.
 *
 * Le problème : `tm-dev` termine par une vérification complète, puis `commit-push` relance
 * exactement les 4 mêmes commandes trente secondes plus tard sur le même code. Sur un projet
 * réel (tests + build), c'est plusieurs minutes perdues à chaque chantier.
 *
 * Le reçu enregistre l'empreinte exacte de l'arbre de travail au moment où les checks sont
 * passés. `commit-push` ne les rejoue que si l'empreinte a changé — donc si le code a bougé.
 *
 * Effet de bord voulu : le reçu est une PREUVE que les checks ont tourné sur CE code. Le hook
 * s'en sert pour que le marqueur ` # checks-ok` ne puisse plus être posé par réflexe sur un
 * arbre jamais vérifié.
 *
 *   node scripts/verify-receipt.mjs write [check1,check2,...]   → écrit le reçu
 *   node scripts/verify-receipt.mjs check                        → exit 0 si valide, 1 sinon
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// `VERIFY_RECEIPT_PATH` permet aux tests d'écrire un reçu ISOLÉ. Sans ça, la suite de tests
// écrivait dans le vrai reçu un document déclarant les 4 checks passés alors que seul vitest
// avait tourné : un `pnpm test` interrompu laissait derrière lui un reçu valide, et le gate
// autorisait un commit sans que type-check ni lint n'aient jamais été lancés.
const RECEIPT = process.env.VERIFY_RECEIPT_PATH ?? join(ROOT, '.claude/.verify-receipt.json')
const MAX_AGE_MS = 60 * 60 * 1000 // 1 h : au-delà, l'environnement a pu bouger (deps, node)

// Documents de méthode écrits APRÈS les checks, par la finalisation puis par `commit-push` :
// changelog, sprint status, stories, ADR. Aucun n'influence le type-check, le lint ni les tests.
// Sans ces exclusions, le reçu serait systématiquement invalidé par les étapes qui le suivent —
// et ne servirait donc qu'aux changements Micro, c'est-à-dire là où il ne fait pas gagner grand
// chose. Le registry n'est PAS exclu : `check:framework` le compare à `src/components/`.
const EXCLUS = [/^docs\/changelog\.md$/, /^\.method\/sprint\//, /^docs\/stories\//, /^docs\/decisions\//]
const estExclu = (path) => EXCLUS.some((r) => r.test(path))

const git = (args) =>
  execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'], // sans ça, les erreurs git polluent la sortie de `pnpm verify`
  })

/**
 * Empreinte de tout ce qui est susceptible de faire échouer un check :
 * le HEAD, le diff complet (indexé et non indexé), et le contenu des fichiers non suivis.
 */
export function worktreeHash() {
  // Un dépôt fraîchement initialisé n'a pas de HEAD : c'est le cas du premier commit d'un
  // projet issu du template. Sans ce garde, `pnpm verify` mourait sur une exception APRÈS avoir
  // passé les 4 checks, et le hook refusait ensuite le commit en boucle — sans échappement,
  // puisque `--no-verify` est bloqué.
  let head = 'sans-commit'
  try {
    head = git(['rev-parse', 'HEAD']).trim()
  } catch {
    /* dépôt sans commit : tout le contenu est « non suivi », ce qui suffit à l'empreinte */
  }

  const lines = (out) => out.split('\n').map((f) => f.trim()).filter(Boolean)

  // L'empreinte doit être INDÉPENDANTE DU STAGING : `git add` déplace un fichier de la liste
  // des non-suivis vers l'index sans changer une ligne de code. Une empreinte fondée sur la
  // sortie de `git diff` ou sur l'énumération des non-suivis changerait à ce moment-là et
  // invaliderait le reçu juste avant le commit — exactement quand on en a besoin.
  // On hache donc le CONTENU de chaque chemin concerné, quel que soit son état d'indexation.
  // `--name-status` distingue les suppressions : les hacher provoquerait une erreur git par
  // fichier et ferait dépendre le résultat d'une exception.
  const supprimes = new Set()
  const modifies = []
  // `--no-renames` : sur un rename, git n'émet qu'une ligne `R100 ancien nouveau`. En ne
  // retenant que la destination, la disparition de l'ancien chemin n'était jamais enregistrée —
  // restaurer l'ancien fichier à côté du nouveau laissait le reçu valide alors que les deux
  // coexistaient. Sans détection de rename, git émet un D et un A distincts.
  if (head !== 'sans-commit') {
    for (const line of lines(git(['diff', 'HEAD', '--name-status', '--no-renames']))) {
      const [status, path] = line.split('\t')
      if (!path) continue
      if (status.startsWith('D')) supprimes.add(path)
      else modifies.push(path)
    }
  }

  const paths = [
    ...modifies, // modifié ou ajouté, indexé ou non
    ...lines(git(['ls-files', '--others', '--exclude-standard'])), // jamais commité
  ]

  const uniques = [...new Set([...paths, ...supprimes])].filter((f) => !estExclu(f)).sort()

  const entries = uniques.map((path) => {
    if (supprimes.has(path)) return `${path}:supprimé`
    try {
      return `${path}:${git(['hash-object', '--', path]).trim()}`
    } catch {
      // Chemin que git ne sait pas hacher (symlink cassé, socket, permission). Le signaler
      // dans l'empreinte plutôt que de faire échouer toute la vérification.
      return `${path}:illisible`
    }
  })

  return createHash('sha256').update([head, ...entries].join('\n')).digest('hex')
}

function readReceipt() {
  if (!existsSync(RECEIPT)) return null
  try {
    return JSON.parse(readFileSync(RECEIPT, 'utf8'))
  } catch {
    return null
  }
}

/** @returns {{valid: boolean, reason: string, receipt: object|null}} */
export function checkReceipt() {
  const receipt = readReceipt()
  if (!receipt) return { valid: false, reason: 'aucun reçu — les checks n\'ont pas été lancés', receipt: null }

  const age = Date.now() - new Date(receipt.at).getTime()
  if (!(age >= 0) || age > MAX_AGE_MS) {
    return { valid: false, reason: `reçu périmé (${Math.round(age / 60000)} min)`, receipt }
  }

  let current
  try {
    current = worktreeHash()
  } catch {
    return { valid: false, reason: 'empreinte de l\'arbre illisible', receipt }
  }
  if (current !== receipt.hash) {
    return { valid: false, reason: 'le code a changé depuis les derniers checks', receipt }
  }
  return { valid: true, reason: `checks déjà passés il y a ${Math.max(1, Math.round(age / 60000))} min sur ce code`, receipt }
}

// Ce module est aussi importé par le hook git-gate : sans ce garde, l'import exécuterait la
// partie CLI ci-dessous, afficherait « usage » et sortirait en erreur.
const executeDirectement =
  process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])

if (!executeDirectement) {
  // rien : les fonctions exportées suffisent
} else runCli()

function runCli() {
const [, , command, checksArg] = process.argv

if (command === 'write') {
  const checks = (checksArg ?? 'check:framework,type-check,lint,test').split(',').map((c) => c.trim())
  writeFileSync(
    RECEIPT,
    JSON.stringify({ hash: worktreeHash(), checks, at: new Date().toISOString() }, null, 2) + '\n'
  )
  console.log(`Reçu écrit — ${checks.join(', ')}`)
} else if (command === 'check') {
  const { valid, reason, receipt } = checkReceipt()
  if (valid) {
    console.log(`✔  ${reason} : ${receipt.checks.join(', ')}. Inutile de les rejouer.`)
    process.exit(0)
  }
  console.log(`→  Checks à lancer : ${reason}.`)
  process.exit(1)
} else if (command === 'clear') {
  if (existsSync(RECEIPT)) unlinkSync(RECEIPT)
} else {
  console.error('usage: verify-receipt.mjs write|check|clear')
  process.exit(2)
}
}
