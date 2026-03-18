# Story Done — Definition of Done

> Vérifier APRÈS l'implémentation pour considérer la story terminée.

## Code

- [ ] Tous les acceptance criteria sont implémentés
- [ ] Le code compile sans erreur (`pnpm type-check`)
- [ ] Pas de `any` non justifié dans le code TypeScript
- [ ] Les imports suivent l'ordre défini dans coding-standards.md
- [ ] Pas de `console.log` oublié (sauf logging intentionnel)

## Tests

- [ ] Les tests unitaires listés dans la story sont écrits et passent
- [ ] Les tests d'intégration listés dans la story sont écrits et passent
- [ ] Les tests E2E listés dans la story sont écrits et passent (si applicable)
- [ ] **TOUS les tests existants passent** (non-régression) : `pnpm test`
- [ ] Pas de test skip/pending sans justification

## Documentation

- [ ] La section "Post-implémentation" de la story est remplie
- [ ] Les écarts avec le design sont documentés
- [ ] Les écarts avec l'architecture sont documentés (+ ADR si invariant touché)
- [ ] Les nouveaux composants/hooks/actions sont ajoutés au component-registry
- [ ] `.tiple/sprint/status.md` est mis à jour (story → ✅ Done)

## Qualité

- [ ] La checklist `code-review.md` a été passée
- [ ] Les problèmes identifiés par la review sont corrigés
