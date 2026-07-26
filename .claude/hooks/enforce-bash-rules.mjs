#!/usr/bin/env node
/**
 * Hook PreToolUse — garde-fous d'exécution pour que la sortie des checks reste lisible.
 *
 * Exit 0 = autorisé, exit 2 = bloqué (stderr renvoyé à Claude).
 * Ce fichier EST la source de vérité de ces règles — ne pas les dupliquer dans CLAUDE.md.
 *
 * En Node et pas en bash : le payload est du JSON, et toute extraction du champ `command`
 * par grep/sed est fausse dès que la commande contient un guillemet échappé.
 */

// `(?![\w-])` et pas `\b` : sans ça, `pnpm add -D eslint-plugin-import` est pris pour un
// lancement d'ESLint (le `-` de `eslint-plugin` valide une frontière de mot).
const CHECK =
  /(?:(?:pnpm|npm|yarn)\s+(?:run\s+)?(?:type-check|lint|test|test:e2e|build|check:framework)(?![\w-])|(?:^|[;&|\s])(?:tsc|vitest|eslint)(?![\w-])|playwright\s+test(?![\w-])|next\s+build(?![\w-]))/

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

  // --- Règle 1 : pas de run_in_background ---
  // Un check lancé en arrière-plan rend sa sortie invisible ; l'échec passe inaperçu.
  if (input?.tool_input?.run_in_background === true) {
    deny(
      'BLOQUÉ: run_in_background=true. Relancer en foreground (timeout: 120000, jusqu\'à 600000 pour un build).'
    )
  }

  // Neutraliser les chaînes entre quotes : `grep "pnpm test | head"` n'est pas un check tronqué.
  const bare = command.replace(/'[^']*'/g, "''").replace(/"(?:\\.|[^"\\])*"/g, '""')
  if (!CHECK.test(bare)) process.exit(0)

  // --- Règle 2 : pas de troncature de la sortie d'un check ---
  // Les erreurs sont souvent en fin de sortie : la tronquer les masque.
  if (/\|\s*(?:tail|head|less|more|wc)\b/.test(bare)) {
    deny('BLOQUÉ: sortie de check tronquée par un pipe. Exécuter la commande brute.')
  }

  // --- Règle 3 : pas de redirection fichier pour un check ---
  if (/(?:^|[^0-9>])>{1,2}\s*\S/.test(bare) || /\|\s*tee\b/.test(bare)) {
    deny('BLOQUÉ: sortie de check redirigée vers un fichier. Elle doit rester dans le terminal.')
  }

  // --- Règle 4 : pas de boucle d'attente / polling ---
  if (/\bwhile\s+(?:true|:)|(?:^|[;&\s])watch\s|\buntil\s+.*;\s*do/.test(bare)) {
    deny('BLOQUÉ: boucle d\'attente/polling. Exécuter la commande une fois et lire le résultat.')
  }

  process.exit(0)
})
