---
name: commit-push
description: "Commit + push avec checks obligatoires (framework, type-check, lint, tests) et mise à jour du changelog. Déclenche-toi dès que l'utilisateur demande d'enregistrer ou d'envoyer le travail : 'commit', 'push', 'pousse', 'envoie', 'c'est bon tu peux pousser', 'enregistre', 'sauvegarde ça', OU quand un chantier code est terminé et validé par une review. NE PAS déclencher au milieu d'une implémentation, ni sur une session de lecture seule."
argument-hint: "[message de commit optionnel]"
---

# commit-push — le seul chemin vers un commit

Un `git commit` ou `git push` lancé hors de ce skill est **bloqué par le hook**
`.claude/hooks/enforce-git-gate.mjs`. Ce n'est pas une convention à respecter : c'est appliqué.

## Étape 1 — Checks (bloquants, dans cet ordre)

| # | Commande | Si échec |
|---|----------|----------|
| 1 | `pnpm check:framework` | Corriger l'incohérence de framework signalée, relancer |
| 2 | `pnpm type-check` | Corriger, relancer (max 3 cycles) |
| 3 | `pnpm lint` | Corriger, relancer (max 3 cycles) |
| 4 | `pnpm test` | Corriger, relancer (max 3 cycles) |

Au-delà de 3 cycles sur un même check → **s'arrêter et remonter à l'utilisateur**. Ne jamais
désactiver une règle de lint, skipper un test ou élargir un type pour faire passer un check.

Ces 4 checks sont aussi disponibles seuls via le skill `tm-verify` (debug local sans commit).

## Étape 2 — Analyser le diff

```
git status --short
git diff
git log --oneline -5
```

Vérifier qu'aucun fichier sensible n'est présent (`.env`, credentials, clés, dumps).

## Étape 3 — Changelog

Ajouter une entrée en haut de `docs/changelog.md` (après le commentaire HTML) :

```markdown
## [YYYY-MM-DD] — [Scope court]
**Quoi :** Description concise de ce qui a été fait
**Pourquoi :** La raison / le contexte / la story
**Fichiers :** Chemins relatifs des fichiers créés/modifiés
```

Une entrée par chantier, pas par fichier. Un commit de typo ne mérite pas d'entrée — dans ce
cas, le dire plutôt que d'écrire une entrée vide de sens.

## Étape 4 — Commit

- `git add <fichiers explicites>` — **jamais `git add -A`**, inclure `docs/changelog.md`
- Message : préfixe `fix:` / `feat:` / `refactor:` / `docs:` / `chore:` / `perf:`, 1-2 lignes,
  centré sur le **pourquoi**
- Le marqueur `# tiple-gate-ok` atteste que les 4 checks de l'étape 1 sont réellement passés.
  Ne jamais l'ajouter pour contourner un check en échec.

```
git commit -m "prefixe: message concis" -m "Co-Authored-By: Claude <noreply@anthropic.com>" # tiple-gate-ok
```

## Étape 5 — Push

```
git push -u origin <branche-courante> # tiple-gate-ok
```

En cas d'échec réseau : réessayer jusqu'à 4 fois (2s, 4s, 8s, 16s). En cas de conflit ou de
divergence : **remonter à l'utilisateur**, ne jamais forcer.

## Étape 6 — Résumé

```
Framework : OK
Type-check: OK
Lint      : OK
Tests     : OK
Changelog : mis à jour
Commit    : <hash> <message>
Push      : <branche> → origin/<branche>
CI        : pnpm build en cours
```

## Règles

- Les 4 checks passent **avant** le commit, sans exception
- `--no-verify`, `--force`, `--force-with-lease` : bloqués par le hook, sans échappement
- `--amend` : uniquement sur demande explicite de l'utilisateur
- Ne jamais commiter sur `main` si une branche de travail est attendue
