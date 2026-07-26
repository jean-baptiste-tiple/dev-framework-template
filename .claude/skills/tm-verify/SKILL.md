---
name: tm-verify
description: "Lance les vérifications du projet : cohérence framework, type-check, lint, tests. Déclenche-toi quand l'utilisateur demande de vérifier que tout passe : 'vérifie', 'ça compile ?', 'lance les tests', 'type-check', 'tout passe ?', OU après avoir appliqué des corrections issues d'une review. Pour un commit, c'est le skill commit-push qui prend le relais (il inclut ces checks)."
---

# tm-verify — Vérifications projet

Utilisable seul (debug local) ou appelé par `tm-review` (après application des fix) et par
`commit-push` (étape 1).

## Séquence

| # | Commande | Vérifie |
|---|----------|---------|
| 1 | `pnpm check:framework` | Cohérence du framework : tags ↔ conventions ↔ skills ↔ références |
| 2 | `pnpm type-check` | `tsc --noEmit` |
| 3 | `pnpm lint` | ESLint |
| 4 | `pnpm test` | Vitest (unit + integration) |

`pnpm test:e2e` n'est pas dans la séquence — le lancer explicitement quand la story le demande.

Chaque check doit passer avant de lancer le suivant. Sur un test cassé, distinguer :
**cassé par le code livré** (à corriger) vs **flaky préexistant** (à documenter et signaler,
pas à masquer).

## Sortie

```
Framework : OK
Type-check: OK
Lint      : OK
Tests     : 42 passed, 0 failed
```

En cas d'échec, afficher le check en échec et le nombre d'erreurs restantes — ne jamais
marquer OK un check qui a échoué.

## Règles

- Maximum **3 cycles** de correction par check. Au-delà → s'arrêter et remonter le blocage.
- Ne jamais faire passer un check en désactivant une règle, en skippant un test, ou en
  élargissant un type. Si c'est la seule issue, c'est une décision utilisateur.
- Exécution en foreground, sans pipe ni redirection : les erreurs sont souvent en fin de
  sortie et la troncature les masque (règle appliquée par `.claude/hooks/enforce-bash-rules.mjs`).
