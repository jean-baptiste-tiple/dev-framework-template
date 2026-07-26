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
 * s'en sert pour que le marqueur ` # tiple-gate-ok` ne puisse plus être posé par réflexe sur un
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
const RECEIPT = join(ROOT, '.claude/.verify-receipt.json')
const MAX_AGE_MS = 60 * 60 * 1000 // 1 h : au-delà, l'environnement a pu bouger (deps, node)

// Le changelog est exclu de l'empreinte : `commit-push` l'édite APRÈS les checks, et son
// contenu n'influence ni le type-check, ni le lint, ni les tests. Sans cette exclusion, le reçu
// serait systématiquement invalidé par l'étape qui le suit.
const EXCLUS = ['docs/changelog.md']

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
  const head = git(['rev-parse', 'HEAD']).trim()

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
  for (const line of lines(git(['diff', 'HEAD', '--name-status']))) {
    const [status, ...rest] = line.split('\t')
    const path = rest[rest.length - 1]
    if (status.startsWith('D')) supprimes.add(path)
    else modifies.push(path)
  }

  const paths = [
    ...modifies, // modifié ou ajouté, indexé ou non
    ...lines(git(['ls-files', '--others', '--exclude-standard'])), // jamais commité
  ]

  const uniques = [...new Set([...paths, ...supprimes])].filter((f) => !EXCLUS.includes(f)).sort()

  const entries = uniques.map((path) =>
    supprimes.has(path) ? `${path}:supprimé` : `${path}:${git(['hash-object', '--', path]).trim()}`
  )

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
