#!/usr/bin/env node
/**
 * Hook PreToolUse — aucune écriture git en dehors du skill commit-push.
 *
 * Exit 0 = autorisé, exit 2 = bloqué (stderr renvoyé à Claude).
 *
 * Pourquoi un hook plutôt qu'un skill : le déclenchement d'un skill est un jugement du modèle,
 * donc probabiliste. Acceptable pour charger des conventions, pas pour un gate de push.
 *
 * Pourquoi Node plutôt que bash : le payload est du JSON, et toute extraction du champ
 * `command` à coups de grep/sed est fausse dans un sens ou dans l'autre — soit elle tronque la
 * commande au premier guillemet échappé, soit elle matche le JSON brut. `JSON.parse` supprime
 * la classe de bug entière.
 *
 * CE QUE CE HOOK NE PEUT PAS VOIR — limite structurelle, pas un oubli.
 * Il ne reçoit qu'une chaîne de commande. Un `git commit` écrit dans un `.sh`, un Makefile ou
 * un script npm lui est invisible : `bash deploy.sh` est une commande parfaitement anodine.
 * C'est le hook git `.githooks/pre-commit` qui couvre ce chemin — lui s'exécute quel que soit
 * l'appelant. Les deux sont complémentaires et aucun ne remplace l'autre.
 *
 * Échappement : ` # checks-ok` **en fin de commande**, posé par le skill commit-push une fois
 * `pnpm verify` passé. Le marqueur seul ne suffit pas : le reçu doit couvrir l'état exact du
 * code ET déclarer les 4 checks. C'est un garde-fou contre l'oubli, pas une barrière de
 * sécurité — quelqu'un de déterminé écrira le reçu à la main.
 */

const MARKER = /#\s*checks-ok\s*$/

/** Les 4 checks que `pnpm verify` enchaîne. Un reçu qui n'en déclare pas la totalité est refusé. */
const CHECKS_REQUIS = ['check:framework', 'type-check', 'lint', 'test']

const BLOCK_MESSAGE = `BLOQUÉ: écriture git directe interdite.

Passer par le skill \`commit-push\` (.claude/skills/commit-push/SKILL.md) :
  1. pnpm verify:cached   (les 4 checks, sans les rejouer s'ils viennent de passer)
  2. mise à jour de docs/changelog.md
  3. commit + push

Le skill pose lui-même le marqueur d'échappement une fois \`pnpm verify\` réellement passé.`

const deny = (msg) => {
  process.stderr.write(msg + '\n')
  process.exit(2)
}

let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (c) => (raw += c))
process.stdin.on('end', async () => {
  let command = ''
  try {
    command = JSON.parse(raw)?.tool_input?.command ?? ''
  } catch {
    process.exit(0) // payload illisible : ne pas bloquer un appel qu'on ne comprend pas
  }
  if (typeof command !== 'string' || !command.trim()) process.exit(0)

  const marked = MARKER.test(command)

  // Neutraliser les chaînes entre quotes : sans ça, `--force` écrit dans un message de commit
  // déclencherait l'interdit absolu, et `grep "git push"` serait bloqué.
  const bare = command
    .replace(MARKER, '')
    .replace(/'[^']*'/g, "''")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')

  // Un shell imbriqué remet la commande dans une chaîne, que la neutralisation ci-dessus efface :
  // `bash -c "git commit -m x"` passerait sans être vu. On ne refuse que si la commande BRUTE
  // mentionne git — sinon `docker run … sh -c "ls"` et `timeout 5 bash -c "echo"` étaient
  // bloqués avec un message parlant de commit-push, ce qui est absurde et fait désactiver le hook.
  const SHELL_IMBRIQUE = /(?:^|[;&|\s])(?:sh|bash|zsh|env)\s+(?:-\S+\s+)*-c\b|(?:^|[;&|\s])eval\b|\|\s*(?:sh|bash|zsh)\b/
  if (/\bgit\b/.test(command) && SHELL_IMBRIQUE.test(command)) {
    deny(
      "BLOQUÉ: commande git dans un shell imbriqué (`bash -c`, `eval`, pipe vers un shell). Son contenu n'est pas analysable : lancer la commande git directement, via le skill commit-push."
    )
  }

  // Verbes qui créent ou publient des commits. `merge`, `revert`, `cherry-pick`, `rebase` et
  // `am` produisent des commits sans passer par `commit` : les exclure laissait un chemin
  // complet pour publier du code jamais vérifié.
  const VERBES = 'commit|push|merge|revert|cherry-pick|rebase|am'
  // `git` peut porter des options globales avant la sous-commande : -C <path>, -c k=v, --no-pager…
  const GIT_WRITE = new RegExp(
    `(?:^|[;&|\\n]|\\s)git((?:\\s+-{1,2}[^\\s]+(?:\\s+[^-\\s][^\\s]*)?)*)\\s+(${VERBES})\\b`
  )

  if (!GIT_WRITE.test(bare)) process.exit(0)

  if (/\s--no-verify\b/.test(bare)) {
    deny(
      'BLOQUÉ: --no-verify est interdit, sans échappement possible. Les hooks git font partie du gate.'
    )
  }
  // `-[a-z]*f[a-z]*` et pas `-f\b` : `git push -fu origin main` — la forme la plus courante d'un
  // push forcé — franchissait l'interdit, parce que `\b` ne coupe pas entre `f` et `u`.
  if (/\s(?:--force\b|--force-with-lease\b|-[a-zA-Z]*f[a-zA-Z]*\b)/.test(bare)) {
    deny(
      "BLOQUÉ: --force est interdit, sans échappement possible. Si le push est refusé (conflit, divergence), remonter le problème à l'utilisateur au lieu de le forcer."
    )
  }
  if (/\s--amend\b/.test(bare) && !marked) {
    deny(
      "BLOQUÉ: --amend interdit sans demande explicite de l'utilisateur. Si l'utilisateur l'a demandé et que `pnpm verify` est passé, ajouter ' # checks-ok' en fin de commande."
    )
  }

  if (!marked) deny(BLOCK_MESSAGE)

  // Le marqueur est une déclaration ; le reçu est une preuve. Il est exigé sur TOUTES les
  // écritures, y compris `push` : l'ancienne exemption reposait sur « le commit poussé a déjà
  // passé ce contrôle », ce qui est faux dès que les commits viennent d'un merge, d'un revert
  // ou d'un cherry-pick — lesquels ne passaient eux-mêmes par aucun gate.
  let receipt
  try {
    receipt = await import('../../scripts/verify-receipt.mjs').then((m) => m.checkReceipt())
  } catch {
    process.exit(0) // outillage absent ou illisible : ne pas bloquer sur le framework lui-même
  }

  if (!receipt.valid) {
    deny(
      `BLOQUÉ: marqueur posé mais ${receipt.reason}.\n\n` +
        `Le marqueur atteste que les 4 checks sont passés sur CE code. Lancer :\n` +
        `  pnpm verify\n\n` +
        `puis relancer la commande. Ne pas contourner en supprimant le reçu.`
    )
  }

  // Le champ `checks` du reçu était écrit puis jamais relu : un reçu déclarant
  // « aucun-check-na-tourne » ouvrait le gate. Le reçu prouvait l'identité de l'arbre, pas que
  // quoi que ce soit avait été vérifié.
  const declares = Array.isArray(receipt.receipt?.checks) ? receipt.receipt.checks : []
  const manquants = CHECKS_REQUIS.filter((c) => !declares.includes(c))
  if (manquants.length) {
    deny(
      `BLOQUÉ: le reçu ne déclare pas tous les checks — manquant(s) : ${manquants.join(', ')}.\n\n` +
        `Reçu trouvé : ${declares.join(', ') || '(aucun)'}\n` +
        `Lancer \`pnpm verify\`, qui les enchaîne tous les quatre et écrit le reçu.`
    )
  }

  process.exit(0)
})
