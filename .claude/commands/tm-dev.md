# Implémenter du code

## Input

- **Identifiant de story** (ex: E01-S01) → mode story
- **"next"** → prochaine story 🟢 Ready du sprint
- **Aucun argument** → mode libre (bugfix, amélioration, refacto)

---

## Mode Story

1. Si "next" : lire `.tiple/sprint/status.md`, trouver la prochaine story 🟢 Ready
2. Lire la story complète dans `docs/stories/`
3. Vérifier `.tiple/checklists/story-ready.md` — si KO, signaler et s'arrêter
4. **Charger les conventions pertinentes :**
   - Lire `.tiple/conventions/_index.md` (index des conventions)
   - Lire les **conventions de base** (toujours) : `coding-standards.md`, `component-registry.md`
   - Lire le champ **Conventions** de la story → charger les fichiers correspondants aux tags
   - Exemple : tags `auth, database, forms` → lire `auth-patterns.md`, `database-patterns.md`, `api-patterns.md`
5. Lire le contexte projet :
   - Le(s) écran(s) JSX référencés dans la story (`docs/design/screens/*.jsx`)
   - Le guide de lecture JSX (`docs/design/guide.md`)
   - `docs/architecture.md` (sections pertinentes)
   - `docs/design/system.md` (tokens, composants)
6. Implémenter dans cet ordre :
   a. Migration DB si nécessaire (`supabase/migrations/`)
   b. Schemas Zod (`lib/schemas/`)
   c. Server Actions (`lib/actions/`) + tests unitaires
   d. Composants UI (`components/`) + tests unitaires
   e. Page/route (`app/`) + tests d'intégration
   f. Tests E2E si listés dans la story
7. À CHAQUE COMMIT : ajouter une entrée dans `docs/changelog.md`
8. Vérifier la non-régression (`pnpm test`)
9. Mettre à jour la story : section Post-implémentation
10. Mettre à jour `.tiple/conventions/component-registry.md`
11. Mettre à jour `.tiple/sprint/status.md` (story → ✅ Done)

## Mode Libre

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
5. Implémenter en respectant les conventions chargées
6. Écrire les tests nécessaires
7. À CHAQUE COMMIT : entrée dans `docs/changelog.md`
8. Vérifier la non-régression (`pnpm test`)
9. Si nouveau composant réutilisable → ajouter au registry

## Changelog (les deux modes)

```markdown
## [YYYY-MM-DD] — [Scope : story ID / bugfix / amélioration / refacto]
**Quoi :** Ce qui a été fait (concis)
**Pourquoi :** La raison
**Problèmes :** Ce qui a bloqué (si applicable)
**Fichiers :** Liste des fichiers créés/modifiés
```

## Rappels

- Vérifier le component-registry AVANT de créer (DRY)
- Server Components par défaut, "use client" le plus bas possible
- Zod schema partagé = une seule source de vérité
- RLS sur toute nouvelle table
- Gérer les 3 états UI : loading, error, empty
- Pas d'abstraction prématurée (factoriser à 2+ occurrences)
