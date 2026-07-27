#!/usr/bin/env node
/**
 * Hook PreToolUse — garde-fous d'exécution pour que la sortie des checks reste lisible.
 *
 * Exit 0 = autorisé, exit 2 = bloqué (stderr renvoyé à Claude).
 * Ce fichier EST la source de vérité de ces règles — ne pas les dupliquer dans CLAUDE.md.
 *
 * PÉRIMÈTRE : les 3 règles ne s'appliquent QU'AUX COMMANDES DE CHECK. Un hook qui bloque une
 * commande légitime finit désactivé — c'est son mode d'échec le plus probable, et il coûte plus
 * cher que la règle ne rapporte.
 *
 * `run_in_background` n'est PAS bloqué — voir la justification en ligne plus bas.
 */

// Le motif doit matcher un check EN POSITION DE COMMANDE. Sans les ancres, le simple mot
// `eslint` ou `vitest` n'importe où déclenchait la règle : `ls node_modules/.bin | grep eslint`,
// `which vitest`, `rg "pnpm test" docs/` étaient bloqués.
// `(?![\w.-])` et pas `\b` : `pnpm add -D eslint-plugin-import` et `sed -i … eslint.config.mjs`
// ne sont pas des lancements d'ESLint.
// `\n` fait partie des débuts de commande : une Bash multi-lignes est une seule chaîne, et sans
// lui `git status\npnpm type-check | tail` échappait à la règle.
const DEBUT = '(?:^|\\n\\s*|[;&|]\\s*|&&\\s*|\\|\\|\\s*)'
const CHECK = new RegExp(
  DEBUT +
    '(?:' +
    '(?:pnpm|npm|yarn)\\s+(?:run\\s+)?(?:type-check|lint|test|test:e2e|build|check:framework|verify|verify:cached)(?![\\w.-])' +
    '|(?:npx\\s+)?(?:tsc|vitest|eslint)(?![\\w.-])' +
    '|(?:npx\\s+)?playwright\\s+test(?![\\w.-])' +
    '|next\\s+build(?![\\w.-])' +
    ')'
)

const deny = (msg) => {
  process.stderr.write(msg + ' Règle définie dans .claude/hooks/enforce-bash-rules.mjs.\n')
  process.exit(2)
}

let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (c) => (raw += c))
process.stdin.on('end', () => {
  let input
  try {
    input = JSON.parse(raw)
  } catch {
    process.exit(0)
  }
  const command = input?.tool_input?.command
  if (typeof command !== 'string' || !command.trim()) process.exit(0)

  // Neutraliser les chaînes entre quotes : `grep "pnpm test | head"` n'est pas un check tronqué,
  // et un heredoc qui écrit un workflow contenant `pnpm build` n'en est pas un non plus.
  const bare = command.replace(/'[^']*'/g, "''").replace(/"(?:\\.|[^"\\])*"/g, '""')

  // Toutes les règles sont conditionnées au fait qu'il s'agisse d'un check.
  if (!CHECK.test(bare)) process.exit(0)

  // `run_in_background` EST AUTORISÉ, y compris sur un check. La règle qui le bloquait reposait
  // sur « sa sortie serait invisible » — c'est faux : le harness notifie à la fin de la commande
  // et sa sortie reste récupérable. Et surtout, ce n'est pas la lecture de la sortie qui atteste
  // qu'un check est passé, c'est le REÇU : `pnpm verify` l'écrit en arrière-plan comme au
  // premier plan, et le gate de commit le relit dans les deux cas. La garantie est intacte.
  // Le coût, lui, était réel : une suite de tests ou un build long monopolisait la session.

  // --- Règle 1 : pas de troncature de la sortie d'un check ---
  // Les erreurs sont souvent en fin de sortie : la tronquer les masque.
  if (/\|\s*(?:tail|head|less|more|wc)\b/.test(bare)) {
    deny('BLOQUÉ: sortie de check tronquée par un pipe. Exécuter la commande brute.')
  }

  // --- Règle 2 : pas de redirection fichier pour un check ---
  if (/(?:^|[^0-9>])>{1,2}\s*\S/.test(bare) || /\|\s*tee\b/.test(bare)) {
    deny('BLOQUÉ: sortie de check redirigée vers un fichier. Elle doit rester dans le terminal.')
  }

  // --- Règle 3 : pas de boucle d'attente / polling ---
  if (/\bwhile\s+(?:true|:)|(?:^|[;&\s])watch\s|\buntil\s+.*;\s*do/.test(bare)) {
    deny("BLOQUÉ: boucle d'attente/polling. Exécuter la commande une fois et lire le résultat.")
  }

  process.exit(0)
})
