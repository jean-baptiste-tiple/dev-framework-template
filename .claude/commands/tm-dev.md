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
4. Lire le contexte :
   - Le(s) écran(s) JSX référencés dans la story (`docs/design/screens/*.jsx`)
   - Le guide de lecture JSX (`docs/design/guide.md`)
   - `docs/architecture.md` (sections pertinentes)
   - `docs/design/system.md` (tokens, composants)
   - `.tiple/conventions/component-registry.md`
   - `.tiple/conventions/coding-standards.md`
   - `.tiple/conventions/api-patterns.md`
5. Implémenter dans cet ordre :
   a. Migration DB si nécessaire (`supabase/migrations/`)
   b. Schemas Zod (`lib/schemas/`)
   c. Server Actions (`lib/actions/`) + tests unitaires
   d. Composants UI (`components/`) + tests unitaires
   e. Page/route (`app/`) + tests d'intégration
   f. Tests E2E si listés dans la story
6. À CHAQUE COMMIT : ajouter une entrée dans `docs/changelog.md`
7. Vérifier la non-régression (`pnpm test`)
8. Mettre à jour la story : section Post-implémentation
9. Mettre à jour `.tiple/conventions/component-registry.md`
10. Mettre à jour `.tiple/sprint/status.md` (story → ✅ Done)

## Mode Libre

1. L'utilisateur décrit le problème ou l'amélioration
2. Lire le contexte :
   - `docs/architecture.md`
   - `.tiple/conventions/component-registry.md`
   - `.tiple/conventions/coding-standards.md`
   - Les fichiers de code concernés
3. Proposer un plan (fichiers à modifier, approche)
4. Implémenter en respectant les mêmes conventions
5. Écrire les tests nécessaires
6. À CHAQUE COMMIT : entrée dans `docs/changelog.md`
7. Vérifier la non-régression (`pnpm test`)
8. Si nouveau composant réutilisable → ajouter au registry

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
