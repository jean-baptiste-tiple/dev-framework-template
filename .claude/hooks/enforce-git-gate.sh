#!/bin/bash
# .claude/hooks/enforce-git-gate.sh
# Hook PreToolUse — bloque `git commit` / `git push` qui ne passent pas par le skill commit-push.
# Exit 0 = autorisé, Exit 2 = bloqué (le message stderr est renvoyé à Claude).
#
# Pourquoi un hook et pas seulement un skill : le déclenchement d'un skill est un jugement du
# modèle, donc probabiliste. Acceptable pour charger des conventions, pas pour un gate de push.
# Le hook est déterministe : il s'exécute à chaque appel, sans dépendre du raisonnement.
#
# Échappement : ajouter ` # tiple-gate-ok` à la fin de la commande. Le skill commit-push le fait
# après avoir validé type-check + lint + test. Un humain peut le faire sciemment — c'est un
# garde-fou contre l'oubli, pas une barrière de sécurité.
# Le marqueur est un commentaire shell : valide en bash comme en PowerShell.

INPUT=$(cat)

# On matche sur le JSON brut, pas sur une extraction du champ "command".
# Une extraction naïve (`grep -o '"command"...[^"]*'`) s'arrête au premier guillemet échappé
# (`\"`) et tronque silencieusement toute commande contenant des quotes — donc la plupart des
# `git commit -m "..."`. Le payload PreToolUse d'un appel Bash ne contient que la commande, sa
# description et son timeout : matcher le JSON entier est plus robuste et sans faux négatif.
COMMAND="$INPUT"

# --- Interdits absolus : jamais d'échappement possible ---
if echo "$COMMAND" | grep -qE 'git\s+(commit|push).*(--no-verify|--force\b|--force-with-lease|[[:space:]]-f\b)'; then
  echo "BLOQUÉ: --no-verify et --force sont interdits sur commit/push. Si le push est refusé (conflit, divergence), remonter le problème à l'utilisateur au lieu de le forcer." >&2
  exit 2
fi

if echo "$COMMAND" | grep -qE 'git\s+commit.*--amend'; then
  echo "BLOQUÉ: --amend interdit sans demande explicite de l'utilisateur. Si l'utilisateur l'a demandé, ajouter ' # tiple-gate-ok' en fin de commande." >&2
  # amend reste échappable via le marqueur : on ne sort en erreur que si absent
  if ! echo "$COMMAND" | grep -q 'tiple-gate-ok'; then exit 2; fi
fi

# --- Marqueur présent : le skill commit-push a déjà validé les checks ---
if echo "$COMMAND" | grep -q 'tiple-gate-ok'; then
  exit 0
fi

# --- Gate : commit / push nus ---
if echo "$COMMAND" | grep -qE '(^|[;&|"'"'"'[:space:]])git[[:space:]]+(commit|push)\b'; then
  cat >&2 <<'MSG'
BLOQUÉ: commit/push direct interdit.

Passer par le skill `commit-push` (.claude/skills/commit-push/SKILL.md), qui exécute dans l'ordre :
  1. pnpm check:framework
  2. pnpm type-check
  3. pnpm lint
  4. pnpm test
  5. mise à jour de docs/changelog.md
  6. commit + push

Une fois ces étapes réellement exécutées et passées, relancer la commande git en ajoutant
' # tiple-gate-ok' à la fin. Ne pas ajouter ce marqueur pour contourner des checks qui échouent.
MSG
  exit 2
fi

exit 0
