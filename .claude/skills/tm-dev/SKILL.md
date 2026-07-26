---
name: tm-dev
description: "Workflow d'implémentation complet : chargement des conventions routées par globs, implémentation, tests, type-check, review, finalisation. Déclenche-toi avant toute modification de code applicatif (src/, tests/, supabase/) — implémentation de story, bugfix, feature, refacto — et pour toute demande d'exploration read-only du code. NE PAS déclencher pour des modifications purement documentaires (docs/, .tiple/, README) ni pour répondre à une question sans toucher au code."
argument-hint: "[E01-S01 | next | description : bug/feature/refacto/explore]"
---

# tm-dev — Implémenter du code

Point d'entrée unique pour toute action code. Le mode est détecté depuis l'argument.

| Argument / contenu | Mode |
|---|---|
| ID de story (`E01-S01`) ou `next` | **Story** |
| `comprends`, `explique`, `analyse`, `audit`, `lis`, `parcours`, `explore` | **Explore** (read-only) |
| `refacto`, `nettoie`, `factorise`, `simplifie`, `réorganise`, `DRY`, `dédoublonne` | **Refacto** |
| `bug`, `corrige`, `cassé`, `erreur`, `crash`, `ne marche pas`, `régression`, `fix` | **Fix** |
| `ajoute`, `implémente`, `nouvelle feature`, `nouvelle fonctionnalité` | **Feature** |
| Vide ou ambigu | **Demander** |

Priorité si plusieurs matchent : Explore > Refacto > Fix > Feature.

---

## Phase 1 — Contexte

**Mode story :**
1. Si `next` : lire `.tiple/sprint/status.md`, prendre la prochaine story 🟢 Ready
2. Lire la story complète dans `docs/stories/`
3. Vérifier `.tiple/checklists/story-ready.md` — si KO, signaler et s'arrêter
4. Lire la référence UI **si elle n'est pas `N/A`** (maquette JSX + `docs/design/guide.md`,
   capture, ou description textuelle). Si `N/A`, le dire et continuer — ce n'est pas un blocage.
5. Lire `docs/architecture.md` (sections concernées) et `docs/design/system.md`

**Mode libre (fix / feature / refacto) :**
1. Reformuler la demande en **critères de succès vérifiables** avant d'écrire quoi que ce soit
   (test qui reproduit, assertion qui valide, type-check qui passe)
2. Nommer les ambiguïtés et proposer les options — ne pas trancher en silence
3. Lire `docs/architecture.md` (sections concernées) et les fichiers visés
4. **Proposer un plan** (fichiers, approche) **avant d'éditer**

**Chargement des conventions (tous modes) :**
- Lire `.tiple/conventions/_index.md`
- Charger les 3 conventions de base : `coding-standards.md`, `component-registry.md`, `tech-stack.md`
- Déterminer les tags actifs par **matching des globs** sur les fichiers qui vont être touchés
- Mode story : ajouter les tags déclarés dans le champ `Conventions` de la story (union)
- **Annoncer la liste des conventions chargées** avant d'implémenter

Le routing vit uniquement dans `_index.md`. Ne pas le déduire de mémoire, ne pas le recopier ici.

## Phase 2 — Implémentation

Ordre : migration DB (`supabase/migrations/`) → schemas Zod (`src/lib/schemas/`) → Server Actions
(`src/lib/actions/`) + tests unit → composants (`src/components/`) + tests unit → page (`src/app/`)
+ tests d'intégration → E2E si la story le demande.

Placement des tests (voir `testing-strategy.md`) : `tests/unit/` (actions, schemas, hooks, utils,
composants isolés) · `tests/integration/` (forms complets, pages, flows) · `tests/e2e/`.

**Edits chirurgicaux** : chaque ligne changée trace à la demande. Pas de cleanup adjacent, pas de
reformatage opportuniste. Dead code repéré → le mentionner, pas le supprimer.

## Phase 3 — Type-check (obligatoire)

`pnpm type-check` — doit passer. Max 3 cycles de correction, au-delà remonter le blocage.

Lint et tests complets sont exécutés par `commit-push` avant le push, pas à chaque itération.

## Phase 4 — Review (obligatoire)

Lancer le skill **`tm-review`**. Il route les conventions par globs sur le diff et confronte le
code aux règles lues.

- ❌ CHANGES REQUESTED → appliquer les fix HAUTE et MOYENNE → `tm-verify` → relancer `tm-review`
- ✅ APPROVED → continuer. Les BASSE sont signalées, pas appliquées sans accord.

Au-delà de 2 cycles sans converger → s'arrêter et remonter à l'utilisateur.

## Phase 5 — Finalisation

1. Entrée dans `docs/changelog.md`
2. Mode story : remplir la section « Post-implémentation », passer la story à ✅ Done dans
   `.tiple/sprint/status.md`
3. Nouveau composant réutilisable → `.tiple/conventions/component-registry.md`

Le commit et le push passent par le skill `commit-push` (un `git commit`/`git push` direct est
bloqué par le hook).

---

## Spécificités par mode

**Fix** — reproduire avant de corriger (test qui échoue d'abord) · diff minimal ·
test de non-régression obligatoire.

**Feature** — si la feature est non triviale (≥ 2 fichiers, nouveau parcours UI, changement DB),
**proposer** un cadrage via `tm-plan` pour créer une story propre ; l'utilisateur peut refuser →
continuer en mode libre. Vérifier le registry avant de créer. Les 3 états UI (loading, error,
empty). Tokens du design system, pas de couleurs en dur.

**Refacto** — lire les tests existants **avant** de toucher au code · aucun changement de
comportement · **tests identiques avant/après** (un test modifié = un comportement modifié = ce
n'est plus un refacto) · si la zone n'est pas testée, écrire les tests **avant** de refactorer.

**Explore** — read-only strict. Aucune écriture, pas de type-check, pas de review, pas de
changelog. Sortie structurée : vue d'ensemble · entrées/sorties · flow principal avec
`fichier:ligne` · dépendances · points d'attention · fichiers clés. Si l'utilisateur veut agir
ensuite, il relance en mode fix/feature/refacto.

## Règles transverses

- Phases 3 et 4 jamais skippées en modes Story / Fix / Feature / Refacto
- Vérifier le component-registry **avant** de créer un composant
- Server Components par défaut, `"use client"` poussé le plus bas possible
- Un schema Zod = une source de vérité (form + action)
- RLS sur toute nouvelle table
- Les 3 états UI gérés : loading, error, empty
- Pas d'abstraction prématurée — factoriser à partir de 2 occurrences
