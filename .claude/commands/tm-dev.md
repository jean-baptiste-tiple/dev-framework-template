---
description: "Implémenter une story ou du code (mode story / next / mode libre)"
argument-hint: "[E01-S01 | next | (vide pour mode libre)]"
---

# Implémenter du code

## Input

- **Identifiant de story** (ex: E01-S01) → mode story
- **"next"** → prochaine story 🟢 Ready du sprint
- **Aucun argument** → mode libre (bugfix, amélioration, refacto)

---

## Mode Story

### Phase 1 — Contexte

1. Si "next" : lire `.tiple/sprint/status.md`, trouver la prochaine story 🟢 Ready
2. Lire la story complète dans `docs/stories/`
3. Vérifier `.tiple/checklists/story-ready.md` — si KO, signaler et s'arrêter
4. **Charger les conventions pertinentes :**
   - Lire `.tiple/conventions/_index.md` (index des conventions)
   - Lire les **conventions de base** (toujours) : `coding-standards.md`, `component-registry.md`
   - Lire le champ **Conventions** de la story → charger les fichiers correspondants aux tags
   - Exemple : tags `auth, database, forms` → lire `auth-patterns.md`, `database-patterns.md`, `api-patterns.md`
5. Lire le contexte projet :
   - (si référence UI ≠ N/A) La maquette ou description référencée dans la story
   - (si maquettes JSX) Le guide de lecture JSX (`docs/design/guide.md`)
   - `docs/architecture.md` (sections pertinentes)
   - `docs/design/system.md` (tokens, composants)

### Phase 2 — Implémentation

6. Implémenter dans cet ordre :
   a. Migration DB si nécessaire (`supabase/migrations/`)
   b. Schemas Zod (`lib/schemas/`)
   c. Server Actions (`lib/actions/`) + tests unitaires dans `tests/unit/`
   d. Composants UI (`components/`) + tests unitaires dans `tests/unit/`
   e. Page/route (`app/`) + tests d'intégration dans `tests/integration/`
   f. Tests E2E si listés dans la story (dans `tests/e2e/`)

> **Placement des tests :** Respecter strictement l'arborescence définie dans `testing-strategy.md` :
> - Tests unitaires → `tests/unit/` (actions, schemas, hooks, utils, composants isolés)
> - Tests d'intégration → `tests/integration/` (composants form complets, pages avec interactions, flows multi-composants)
> - Tests E2E → `tests/e2e/`
> Ne JAMAIS mettre un test d'intégration dans `tests/unit/` ou inversement.

### Phase 3 — Type-check (OBLIGATOIRE)

7. **`pnpm type-check`** — Doit passer sans erreur. Si erreurs → corriger et relancer (max 3 cycles).

> Le lint et les tests ne sont PAS lancés ici. Ils seront exécutés par `/commit-push` avant le push.

### Phase 4 — Code Review en agent isolé (OBLIGATOIRE)

> La review est lancée dans un **agent autonome séparé** pour garantir un regard neuf.
> L'agent reviewer ne partage PAS le contexte d'implémentation — il découvre le code.

10. Récupérer la liste des fichiers modifiés : `git diff --name-only HEAD~1`
11. Lancer un agent autonome pour la review :
    ```
    Agent(
      subagent_type="general-purpose",
      prompt="Tu es un code reviewer autonome. Review le code modifié en suivant
      .claude/commands/tm-review.md comme guide.
      Story: [STORY_ID]
      Fichiers modifiés: [LISTE_FICHIERS]
      Lis chaque fichier modifié, lis la checklist .tiple/checklists/code-review.md,
      et produis une review structurée avec verdict par section."
    )
    ```
12. Analyser le résultat de l'agent :
    - **Si ❌ CHANGES REQUESTED** → appliquer les fix, relancer `pnpm type-check`, puis relancer un nouvel agent review
    - **Si ✅ APPROVED** → continuer vers la finalisation

### Phase 5 — Finalisation

13. Ajouter une entrée dans `docs/changelog.md`
14. Mettre à jour la story : section Post-implémentation
15. Mettre à jour `.tiple/conventions/component-registry.md`
16. Mettre à jour `.tiple/sprint/status.md` (story → ✅ Done)

---

## Mode Libre

### Phase 1 — Contexte

1. L'utilisateur décrit le problème ou l'amélioration
2. **Charger les conventions pertinentes :**
   - Lire `.tiple/conventions/_index.md` (index des conventions)
   - Lire les **conventions de base** (toujours) : `coding-standards.md`, `component-registry.md`
   - Analyser les fichiers de code concernés → **déduire les tags** depuis l'index :
     - Fichiers dans `lib/actions/` ou `lib/schemas/` → tags `api`, `forms`
     - Fichiers dans `lib/supabase/` ou `supabase/migrations/` → tags `database`, `supabase`
     - Fichiers dans `app/` (layouts, pages, routes) → tag `nextjs`
     - Fichiers dans `components/` avec state/effects → tag `state`
     - Fichiers d'auth (`middleware.ts`, `(auth)/`) → tag `auth`
     - Fichiers de test → tag `testing`
   - Charger les conventions correspondantes
3. Lire le contexte projet :
   - `docs/architecture.md`
   - Les fichiers de code concernés
4. Proposer un plan (fichiers à modifier, approche)

### Phase 2 — Implémentation

5. Implémenter en respectant les conventions chargées
6. Écrire les tests nécessaires

### Phase 3 — Type-check (OBLIGATOIRE)

7. **`pnpm type-check`** — Doit passer sans erreur. Si erreurs → corriger et relancer (max 3 cycles).

> Le lint et les tests ne sont PAS lancés ici. Ils seront exécutés par `/commit-push` avant le push.

### Phase 4 — Code Review en agent isolé (OBLIGATOIRE)

10. Récupérer la liste des fichiers modifiés
11. Lancer un agent reviewer autonome (voir `.claude/commands/tm-review.md`)
12. Si ❌ CHANGES REQUESTED → fix → relancer `pnpm type-check` → nouvel agent review

### Phase 5 — Finalisation

13. Entrée dans `docs/changelog.md`
14. Si nouveau composant réutilisable → ajouter au registry

---

## Changelog (les deux modes)

```markdown
## [YYYY-MM-DD] — [Scope : story ID / bugfix / amélioration / refacto]
**Quoi :** Ce qui a été fait (concis)
**Pourquoi :** La raison
**Problèmes :** Ce qui a bloqué (si applicable)
**Fichiers :** Liste des fichiers créés/modifiés
```

## Règles

- Ne JAMAIS skip les phases 3 et 4 — elles sont obligatoires
- Si la phase 4 (review) trouve des problèmes HAUTE/MOYENNE, il faut corriger ET relancer `pnpm type-check`
- Le cycle est : Implémenter → Tests → Type-check → Review → Fix si nécessaire → Type-check à nouveau → Docs
- Le lint et les tests complets sont exécutés par `/commit-push` avant le push — pas pendant le dev
- Vérifier le component-registry AVANT de créer (DRY)
- Server Components par défaut, "use client" le plus bas possible
- Zod schema partagé = une seule source de vérité
- RLS sur toute nouvelle table
- Gérer les 3 états UI : loading, error, empty
- Pas d'abstraction prématurée (factoriser à 2+ occurrences)
