---
name: tm-wrap-up
description: "Capturer les apprentissages méta d'une session (nouvelles conventions, ADR, composants du registry). Déclenche-toi quand l'utilisateur signale une fin de chantier — 'on a fini', 'c'est bouclé', 'wrap up', 'on termine', 'on récapitule' — OU après la clôture de plusieurs stories/fix dans la même session. TOUJOURS proposer d'abord et attendre validation : ne jamais écrire dans .tiple/conventions/, docs/decisions/ ou CLAUDE.md sans accord explicite."
argument-hint: "[scope optionnel]"
---

# tm-wrap-up — Capturer ce qu'on a appris

Le code et le changelog disent **ce qu'on a fait**. Ce skill capture **ce qu'on a appris** :
les règles implicites, les pièges, les décisions d'archi qui ne se déduisent pas du code.

**Ne capturer que ce qui va revenir.** Un one-off ne devient pas une convention.

## Phase 1 — Réflexion

Sur la session qui se termine :
1. **Quel contexte manquait ?** — commandes découvertes, quirks de config, gotchas, docs incomplètes
2. **Quels patterns ont marché ?** — approches validées, décisions de style, workflows émergents
3. **Qu'est-ce qui aiderait une session vierge ?** — connaissance non déductible du code

Ignorer ce qui est déjà évident à la lecture du code ou du changelog.

## Phase 2 — Mapper les candidats

| Type d'apprentissage | Destination |
|---|---|
| Nouvelle règle / invariant technique | `.tiple/conventions/<fichier>.md` (section Règles) |
| Décision d'architecture non-triviale | Nouvel ADR dans `docs/decisions/` (`.tiple/templates/adr.tmpl.md`) |
| Gotcha / config / commande projet-spécifique | `CLAUDE.md` |
| Composant / hook / util réutilisable créé | `.tiple/conventions/component-registry.md` |
| Nouveau domaine technique récurrent | Nouveau tag : ligne dans `_index.md` (avec ses **globs**) + fichier de conventions + `.claude/skills/<tag>/SKILL.md` |
| Story / bug découvert en chemin | `docs/stories/` ou `.tiple/sprint/status.md` |

Règles de sélection :
- **Une seule occurrence = pas un pattern.** Attendre 2+ avant de promouvoir en convention.
- Les skills `.claude/skills/<tag>/` sont des **pointeurs sans règles** : enrichir le fichier de
  conventions suffit, il n'y a jamais de duplication à propager.
- Créer un tag implique de renseigner sa colonne **Globs** dans `_index.md`, sinon aucune
  review ne le chargera jamais. `pnpm check:framework` échoue si c'est oublié.
- Préférer **mettre à jour** un fichier existant plutôt qu'en créer un.

## Phase 3 — Proposer (ne pas écrire)

```
## Apprentissages de la session

**Candidats :**
1. [CONVENTION] api-patterns.md § Error handling — mapper les codes Supabase vers des messages user
   → vu 3× cette session
2. [ADR] docs/decisions/adr-004-soft-delete.md — soft delete via `deleted_at`, impact RLS
3. [REGISTRY] component-registry.md — `<ConfirmDialog>`, utilisé 3×

**Rejetés (one-off) :**
- Typo dans une migration
- Renommage d'une variable
```

Attendre la validation. Si l'utilisateur refuse ou ignore : ne rien faire, continuer.

## Phase 4 — Appliquer (après validation seulement)

Éditer les fichiers validés (Edit plutôt que Write), puis lister ce qui a été modifié.

## Quand ne PAS proposer

- Session exploratoire / lecture seule — rien n'a été modifié
- Micro-modif (typo, rename) — pas de méta à capturer
- L'utilisateur a déjà refusé la proposition dans la session en cours
- L'utilisateur vient de lancer `commit-push` sans passer par wrap-up — respecter son choix

## Règles

1. **Jamais d'écriture sans validation explicite** dans `.tiple/conventions/`, `docs/decisions/`, `CLAUDE.md`
2. Pas de capture du one-off — 2+ occurrences avant de promouvoir une règle
3. Pas de doublon : si l'info existe déjà dans `.tiple/` ou `CLAUDE.md`, ne pas la redire
4. Scope-aware : si un argument est fourni (ex: `wrap-up auth`), limiter la réflexion à ce scope
5. **Zéro capture vaut mieux qu'un faux positif** qui pollue les conventions
