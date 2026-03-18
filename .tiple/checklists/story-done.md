# Story Done — Definition of Done

<!-- Vérifier APRÈS l'implémentation d'une story.
     La story ne passe en ✅ Done que si TOUS les items sont cochés. -->

## Code

- [ ] Le code est écrit et commité
- [ ] Le code respecte les conventions de `.tiple/conventions/coding-standards.md`
- [ ] Pas de code dupliqué (DRY vérifié via component-registry)
- [ ] Pas de TODO/FIXME/HACK laissé sans explication

## Tests

- [ ] Les tests unitaires listés dans la story sont écrits et passent
- [ ] Les tests d'intégration listés dans la story sont écrits et passent
- [ ] Les tests E2E listés dans la story sont écrits et passent (si applicable)
- [ ] TOUS les tests existants passent (non-régression)

## Documentation

- [ ] La section "Post-implémentation" de la story est remplie
- [ ] Le component-registry est à jour (nouveaux composants/hooks/actions ajoutés)
- [ ] Le changelog est à jour
- [ ] Un ADR est créé si un invariant d'architecture a été modifié

## Qualité

- [ ] `pnpm type-check` passe sans erreur
- [ ] `pnpm lint` passe sans erreur
- [ ] Les 3 états UI sont gérés (loading, error, empty) pour les composants data-driven
- [ ] Le sprint status est à jour
