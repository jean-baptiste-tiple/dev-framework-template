#!/bin/bash
# .claude/hooks/enforce-bash-rules.sh
# Hook PreToolUse — garde-fous d'exécution pour que la sortie des checks reste lisible.
# Exit 0 = autorisé, Exit 2 = bloqué (message renvoyé à Claude).
# Ce fichier EST la source de vérité de ces règles — ne pas les dupliquer dans CLAUDE.md.
# Pas de dépendance jq (compatibilité macOS / Windows / Linux).

INPUT=$(cat)

# --- Règle 1 : pas de run_in_background ---
# Un check lancé en background rend sa sortie invisible ; l'échec passe inaperçu.
if echo "$INPUT" | grep -qE '"run_in_background"[[:space:]]*:[[:space:]]*true'; then
  echo "BLOQUÉ: run_in_background=true. Relancer en foreground (timeout: 120000, jusqu'à 600000 pour un build). Règle définie dans .claude/hooks/enforce-bash-rules.sh." >&2
  exit 2
fi

# Matching sur le JSON brut : extraire le champ "command" avec grep tronque la commande au
# premier guillemet échappé (`\"`), ce qui laisse passer silencieusement toute commande qui
# contient des quotes. Le payload PreToolUse d'un appel Bash ne contient que la commande, sa
# description et son timeout.
COMMAND="$INPUT"

# --- Règle 2 : pas de troncature de la sortie des checks ---
# Cible UNIQUEMENT les commandes de check (type-check, lint, test, build, check:framework) :
# y tronquer la sortie fait manquer les erreurs. Les pipes restent autorisés partout ailleurs
# (git, ls, find, grep, et même `pnpm install`).
CHECKS='((pnpm|npm|yarn)[[:space:]]+(run[[:space:]]+)?(type-check|lint|test|test:e2e|build|check:framework)|tsc|vitest|playwright[[:space:]]+test|eslint|next[[:space:]]+build)'
if echo "$COMMAND" | grep -qE "$CHECKS"'\b[^|]*\|[[:space:]]*(tail|head|less|more|wc)\b'; then
  echo "BLOQUÉ: sortie de check tronquée par un pipe. Exécuter la commande brute — les erreurs sont souvent en fin de sortie. Règle définie dans .claude/hooks/enforce-bash-rules.sh." >&2
  exit 2
fi

# --- Règle 3 : pas de redirection fichier pour les checks ---
if echo "$COMMAND" | grep -qE "$CHECKS"'\b.*[[:space:]](>|>>)[[:space:]]'; then
  echo "BLOQUÉ: redirection de la sortie d'un check vers un fichier. La sortie doit rester dans le terminal. Règle définie dans .claude/hooks/enforce-bash-rules.sh." >&2
  exit 2
fi

# --- Règle 4 : pas de boucle d'attente / polling ---
if echo "$COMMAND" | grep -qE 'while[[:space:]]+(true|:)[[:space:]]*;|(^|[;&[:space:]])watch[[:space:]]|until[[:space:]].*;[[:space:]]*do'; then
  echo "BLOQUÉ: boucle d'attente/polling. Exécuter la commande une fois et lire le résultat. Règle définie dans .claude/hooks/enforce-bash-rules.sh." >&2
  exit 2
fi

exit 0
