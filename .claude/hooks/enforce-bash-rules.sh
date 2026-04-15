#!/bin/bash
# .claude/hooks/enforce-bash-rules.sh
# Bloque les violations des règles d'exécution Bash (CLAUDE.md)
# Hook PreToolUse — s'exécute AVANT chaque appel Bash
# Exit 0 = autorisé, Exit 2 = bloqué (message affiché à Claude)
# Compatible macOS + Windows (pas de dépendance jq)

INPUT=$(cat)

# --- Règle 1 : JAMAIS de run_in_background ---
if echo "$INPUT" | grep -q '"run_in_background"[[:space:]]*:[[:space:]]*true'; then
  echo "BLOQUÉ: run_in_background=true est INTERDIT. Relance en foreground avec timeout adapté (120000-600000ms). Voir CLAUDE.md 'Règles d exécution Bash' règle 1." >&2
  exit 2
fi

# Extraire la commande (entre les guillemets après "command":)
# On utilise grep + sed car jq n'est pas toujours disponible
COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"command"[[:space:]]*:[[:space:]]*"//;s/"$//')

# --- Règle 2 : Aucun pipe vers des commandes de troncature/filtrage ---
if echo "$COMMAND" | grep -qE '\|\s*(tail|head|grep|wc|tee|less|more|awk|sed)\b'; then
  echo "BLOQUÉ: Pipe interdit. Exécuter la commande brute sans '|'. Voir CLAUDE.md règle 2." >&2
  exit 2
fi

# --- Règle 3 : Aucune redirection fichier pour les commandes build/check ---
if echo "$COMMAND" | grep -qE '(pnpm|npm|npx|tsc|node)\b.*\s+(>|>>|2>&1\s*>)\s'; then
  echo "BLOQUÉ: Redirection de sortie interdite. La sortie doit aller dans le terminal. Voir CLAUDE.md règle 3." >&2
  exit 2
fi

# --- Règle 4 : Aucune boucle d'attente / polling ---
if echo "$COMMAND" | grep -qE 'while\s+(true|:)\s*;|watch\s+|until\s+.*;\s*do'; then
  echo "BLOQUÉ: Boucle d attente/polling interdite. Voir CLAUDE.md règle 4." >&2
  exit 2
fi

# Tout OK
exit 0
