# Code Review Checklist

<!-- Utilisé par /tm-review. Pour chaque item : ✅ OK ou ❌ + explication. -->

## DRY & Réutilisation

- [ ] Pas de composant/hook/util dupliqué (vérifié dans component-registry)
- [ ] Les schemas Zod sont partagés (pas de double validation manuelle)
- [ ] Les types sont réutilisés depuis `types/` (pas de types inline redondants)
- [ ] Factorisation à partir de 2 occurrences (pas d'abstraction prématurée)

## Qualité du code

- [ ] Naming cohérent (kebab-case fichiers, PascalCase composants, camelCase fonctions)
- [ ] Pas de `any` TypeScript (sauf cas documenté)
- [ ] Pas de `console.log` oublié
- [ ] Pas de TODO/FIXME/HACK sans explication
- [ ] Imports dans l'ordre : next/react → libs → @/components → @/lib → @/types → relatifs
- [ ] Pas de magic numbers/strings (constantes nommées)

## Sécurité

- [ ] Pas d'injection SQL (Supabase paramétrise automatiquement, mais vérifier les `.rpc()`)
- [ ] Pas de XSS (pas de `dangerouslySetInnerHTML` sans sanitization)
- [ ] Pas de secrets exposés côté client
- [ ] Les inputs sont validés avec Zod côté serveur
- [ ] Les messages d'erreur Supabase ne sont pas exposés bruts au client

## Next.js + Supabase (spécifique)

- [ ] **Server Component vs Client Component justifié** — "use client" uniquement si nécessaire
- [ ] **"use client" poussé le plus bas possible** dans l'arbre de composants
- [ ] **Pas de mutation Supabase côté client** — .insert()/.update()/.delete() uniquement dans Server Actions
- [ ] **RLS policies en place** pour chaque nouvelle table
- [ ] **Schemas Zod partagés** — le même schema valide le form ET l'action
- [ ] **Auth vérifiée dans chaque Server Action** (pas seulement le middleware)
- [ ] **revalidatePath/revalidateTag après les mutations**
- [ ] **Middleware auth pas contourné** (pas de route non protégée par erreur)

## Tests

- [ ] Les tests couvrent les cas nominaux ET les cas d'erreur
- [ ] Les tests vérifient le comportement, pas l'implémentation
- [ ] Supabase est mocké dans les tests unitaires
- [ ] Les tests existants passent toujours (non-régression)
- [ ] Le naming des tests suit la convention (`describe/it` — voir `testing-strategy.md`)

## Design & UX

- [ ] L'implémentation respecte la référence UI (si maquette fournie)
- [ ] Les tokens du design system sont utilisés (pas de couleurs/spacing en dur)
- [ ] Les 3 états sont gérés : loading, error, empty
- [ ] L'accessibilité est respectée (labels, keyboard nav, contrast — voir `accessibility-patterns.md`)
- [ ] Les toasts/feedbacks suivent les patterns (voir `feedback-patterns.md`)

## Performance

- [ ] Pas de N+1 queries (utiliser les jointures Supabase)
- [ ] Les images utilisent `next/image` avec `width/height` ou `fill+sizes`
- [ ] Les composants lourds sont lazy-loaded si non-critiques
- [ ] Les données parallèles sont fetchées avec `Promise.all`

## Architecture

- [ ] La structure des fichiers suit les conventions (coding-standards.md)
- [ ] Pas de violation des invariants d'architecture
- [ ] Les Server Actions suivent le pattern standard (auth → validate → execute → revalidate → return)
- [ ] Le state est au bon endroit (server > URL > state > context — voir `state-management.md`)
- [ ] Les migrations DB ont un rollback documenté (si applicable)

## Sécurité

- [ ] Pas de secrets exposés (API keys, tokens, PII dans les logs)
- [ ] Les erreurs Supabase ne sont pas exposées brutes au client
- [ ] Les inputs sont validés côté serveur avec Zod
- [ ] Rate limiting en place sur les actions sensibles (login, signup, reset)

## Documentation

- [ ] Le changelog est à jour
- [ ] Le component-registry est à jour
- [ ] La story post-implémentation est remplie (si mode story)
