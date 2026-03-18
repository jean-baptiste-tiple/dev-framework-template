# Code Review — Checklist post-implémentation

> Passer CHAQUE point après l'implémentation d'une story.
> Verdict par item : ✅ OK ou ❌ KO (avec explication et fix).

## DRY & Réutilisation

- [ ] Pas de composant/hook/util dupliqué — vérifié dans le component-registry
- [ ] Les schemas Zod sont dans `lib/schemas/` et partagés entre form et action
- [ ] Pas de logique copiée-collée entre fichiers (factoriser si ≥ 2 occurrences)
- [ ] Les types Supabase (`database.ts`) sont utilisés, pas redéfinis manuellement

## Qualité du code

- [ ] Nommage cohérent (kebab-case fichiers, PascalCase composants, camelCase fonctions)
- [ ] Pas de `any` non justifié
- [ ] Les fonctions font une seule chose
- [ ] Les composants sont petits et focalisés (< 150 lignes de JSX)
- [ ] Error handling : pas de `catch` vide, erreurs Supabase vérifiées
- [ ] Loading, error et empty states gérés dans les composants UI

## Sécurité

- [ ] Les Server Actions vérifient l'auth en premier (`supabase.auth.getUser()`)
- [ ] Les inputs sont validés avec Zod côté serveur (pas uniquement côté client)
- [ ] Pas de mutation Supabase depuis un Client Component (`.insert()/.update()/.delete()`)
- [ ] Les nouvelles tables ont des RLS policies en place
- [ ] Pas de `service_role` client utilisé sans ADR documenté
- [ ] Pas de données sensibles exposées côté client (clés, tokens, secrets)
- [ ] Les messages d'erreur Supabase ne sont pas exposés bruts au client

## Tests

- [ ] Tests unitaires couvrent les Server Actions (inputs valides et invalides)
- [ ] Tests unitaires couvrent les schemas Zod (edge cases)
- [ ] Tests d'intégration couvrent les composants form (render → fill → submit)
- [ ] Tous les tests existants passent (non-régression)

## Design & UX

- [ ] L'implémentation correspond à la maquette design
- [ ] Les tokens du design system (`docs/design/system.md`) sont utilisés
- [ ] L'interface est responsive (si applicable)
- [ ] Les écarts avec le design sont documentés dans la story

## Architecture

- [ ] Server Components par défaut — `"use client"` justifié et poussé le plus bas possible
- [ ] Server Actions pour les mutations (pas d'API routes sauf webhooks)
- [ ] Le middleware auth n'est pas contourné
- [ ] `revalidatePath` ou `revalidateTag` après chaque mutation
- [ ] La structure de fichiers respecte `coding-standards.md` (actions dans `lib/actions/`, etc.)
- [ ] Pas d'invariant d'architecture violé sans ADR

## Documentation

- [ ] Le component-registry est à jour avec les nouveaux composants/hooks/actions
- [ ] La story a sa section post-implémentation remplie
- [ ] Les ADRs nécessaires sont créés dans `docs/decisions/`
