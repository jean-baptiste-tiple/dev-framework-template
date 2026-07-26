#!/usr/bin/env node
/**
 * Hook PreToolUse — aucun `git commit` / `git push` en dehors du skill commit-push.
 *
 * Exit 0 = autorisé, exit 2 = bloqué (stderr renvoyé à Claude).
 *
 * Pourquoi un hook plutôt qu'un skill : le déclenchement d'un skill est un jugement du modèle,
 * donc probabiliste. Acceptable pour charger des conventions, pas pour un gate de push.
 *
 * Pourquoi Node plutôt que bash : le payload est du JSON, et toute extraction du champ
 * `command` à coups de grep/sed est fausse dans un sens ou dans l'autre — soit elle tronque la
 * commande au premier guillemet échappé (et laisse passer tout `git commit -m "..."`), soit
 * elle matche le JSON brut (et bloque `grep "git commit"`, ou laisse passer un marqueur écrit
 * dans le message de commit). `JSON.parse` supprime la classe de bug entière.
 *
 * Échappement : ` # tiple-gate-ok` **en fin de commande**, posé par le skill commit-push une
 * fois les 4 checks passés. C'est un garde-fou contre l'oubli, pas une barrière de sécurité.
 */

const MARKER = /#\s*tiple-gate-ok\s*$/

const BLOCK_MESSAGE = `BLOQUÉ: commit/push direct interdit.

Passer par le skill \`commit-push\` (.claude/skills/commit-push/SKILL.md), qui exécute dans l'ordre :
  1. pnpm check:framework
  2. pnpm type-check
  3. pnpm lint
  4. pnpm test
  5. mise à jour de docs/changelog.md
  6. commit + push

Une fois ces étapes réellement exécutées et passées, relancer la commande git en ajoutant
' # tiple-gate-ok' à la fin. Ne pas ajouter ce marqueur pour contourner des checks qui échouent.`

const deny = (msg) => {
  process.stderr.write(msg + '\n')
  process.exit(2)
}

let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (c) => (raw += c))
process.stdin.on("end", async () => {
  let command = ''
  try {
    command = JSON.parse(raw)?.tool_input?.command ?? ''
  } catch {
    process.exit(0) // payload illisible : ne pas bloquer un appel qu'on ne comprend pas
  }
  if (typeof command !== 'string' || !command.trim()) process.exit(0)

  const marked = MARKER.test(command)

  // Un shell imbriqué remet la commande dans une chaîne, que la neutralisation ci-dessous
  // efface : `bash -c "git commit -m x"` passerait le gate sans être vu. On refuse donc de
  // raisonner sur une commande qu'on ne peut pas analyser.
  if (/(?:^|[;&|\s])(?:sh|bash|zsh|env)\s+(?:-\S+\s+)*-c\b|(?:^|[;&|\s])eval\b|\|\s*(?:sh|bash|zsh)\b/.test(command)) {
    deny(
      "BLOQUÉ: shell imbriqué (`bash -c`, `eval`, pipe vers un shell). Le contenu d'une commande imbriquée n'est pas analysable : lancer la commande git directement, via le skill commit-push."
    )
  }

  // Retirer le marqueur puis neutraliser les chaînes entre quotes : sans ça, `-f` ou `--force`
  // écrit dans un message de commit déclencherait l'interdit absolu, et un `grep "git push"`
  // serait bloqué.
  const bare = command
    .replace(MARKER, '')
    .replace(/'[^']*'/g, "''")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')

  // `git` peut porter des options globales avant la sous-commande : -C <path>, -c k=v, --no-pager…
  const GIT_WRITE = /(?:^|[;&|\n]|\s)git((?:\s+-{1,2}[^\s]+(?:\s+[^-\s][^\s]*)?)*)\s+(commit|push)\b/

  if (!GIT_WRITE.test(bare)) process.exit(0)

  if (/\s--no-verify\b/.test(bare)) {
    deny(
      "BLOQUÉ: --no-verify est interdit sur commit/push, sans échappement possible. Les hooks git font partie du gate."
    )
  }
  if (/\s(?:--force\b|--force-with-lease\b|-f\b)/.test(bare)) {
    deny(
      "BLOQUÉ: --force est interdit sur commit/push, sans échappement possible. Si le push est refusé (conflit, divergence), remonter le problème à l'utilisateur au lieu de le forcer."
    )
  }
  if (/\s--amend\b/.test(bare) && !marked) {
    deny(
      "BLOQUÉ: --amend interdit sans demande explicite de l'utilisateur. Si l'utilisateur l'a demandé et que les checks sont passés, ajouter ' # tiple-gate-ok' en fin de commande."
    )
  }

  if (!marked) deny(BLOCK_MESSAGE)

  // Le marqueur est une déclaration ; le reçu est une preuve. Sans cette vérification, il
  // suffirait d'avoir lu une fois le message de blocage pour poser le marqueur par réflexe sur
  // un arbre jamais vérifié — et le gate ne serait plus qu'une formalité.
  // Le push n'est pas concerné : le commit qu'il envoie a déjà passé ce contrôle.
  if (/\s(commit)\b/.test(bare)) {
    let receipt
    try {
      receipt = await import('../../scripts/verify-receipt.mjs').then((m) => m.checkReceipt())
    } catch {
      process.exit(0) // script absent ou illisible : ne pas bloquer sur l'outillage lui-même
    }
    if (!receipt.valid) {
      deny(
        `BLOQUÉ: marqueur posé mais ${receipt.reason}.\n\n` +
          `Le marqueur atteste que les 4 checks sont passés sur CE code. Lancer :\n` +
          `  pnpm verify\n\n` +
          `puis relancer le commit. Ne pas contourner en supprimant le reçu.`
      )
    }
  }

  process.exit(0)
})
