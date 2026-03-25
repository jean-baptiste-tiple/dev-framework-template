# Story Done — Definition of Done

> Vérifier APRÈS l'implémentation pour considérer la story terminée.

## Code

- [ ] Tous les acceptance criteria sont implémentés
- [ ] Pas de `any` non justifié dans le code TypeScript
- [ ] Les imports suivent l'ordre défini dans coding-standards.md
- [ ] Pas de `console.log` oublié (sauf logging intentionnel)

## Tests

- [ ] Les tests unitaires listés dans la story sont écrits et passent
- [ ] Les tests d'intégration listés dans la story sont écrits et passent
- [ ] Les tests E2E listés dans la story sont écrits et passent (si applicable)
- [ ] Pas de test skip/pending sans justification

## Vérification triple (OBLIGATOIRE)

- [ ] **`pnpm type-check`** passe sans erreur
- [ ] **`pnpm lint`** passe sans erreur
- [ ] **`pnpm test`** — TOUS les tests passent (non-régression)

## Documentation

- [ ] La section "Post-implémentation" de la story est remplie
- [ ] Les écarts avec le design sont documentés
- [ ] Les écarts avec l'architecture sont documentés (+ ADR si invariant touché)
- [ ] Les nouveaux composants/hooks/actions sont ajoutés au component-registry
- [ ] `.tiple/sprint/status.md` est mis à jour (story → ✅ Done)

## Code Review (OBLIGATOIRE)

- [ ] La checklist `code-review.md` a été passée point par point (`/tm-review`)
- [ ] DRY & Réutilisation : vérifié
- [ ] Qualité du code : vérifié
- [ ] Sécurité : vérifié
- [ ] Tests : vérifié
- [ ] Design & UX : vérifié
- [ ] Architecture : vérifié
- [ ] Documentation : vérifié
- [ ] Les problèmes HAUTE/MOYENNE identifiés sont corrigés
- [ ] La vérification triple a été relancée après les corrections
