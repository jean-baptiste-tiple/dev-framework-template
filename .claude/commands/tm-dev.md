# /tm-dev — Implémentation d'une story

> Implémente une story de bout en bout : lecture contexte → code → tests → vérification → review → docs.
> Usage : `/tm-dev E01-S03` ou `/tm-dev next` (prend la prochaine story 🟢 Ready).

## Pré-requis

Vérifier que la story existe et est en statut 🟢 Ready dans `docs/stories/`.

## Étapes

### Phase 1 — Contexte (lecture obligatoire)

1. Lire la story complète dans `docs/stories/`
2. Lire `docs/architecture.md` — sections pertinentes
3. Lire `.tiple/conventions/coding-standards.md`
4. Lire `.tiple/conventions/component-registry.md` — vérifier ce qui existe déjà
5. Lire `.tiple/conventions/api-patterns.md` — si Server Actions concernées
6. Lire la maquette design référencée dans la story (si applicable)
7. Mettre la story en statut 🔵 In Progress dans `.tiple/sprint/status.md`

### Phase 2 — Implémentation

8. **Schemas Zod** — Créer/modifier les schemas dans `lib/schemas/`
9. **Backend** — Server Actions dans `lib/actions/`, types, helpers
10. **Tests unitaires backend** — Tester les actions et schemas (inputs valides + invalides + edge cases)
11. **Composants UI** — Créer les composants nécessaires (vérifier le registry d'abord !)
12. **Tests unitaires UI** — Tester les composants isolément
13. **Pages** — Assembler les composants dans les pages/layouts
14. **Tests d'intégration** — Tester le flow complet (render → fill → submit → result)

### Phase 3 — Vérification triple (OBLIGATOIRE)

15. **`pnpm type-check`** — Doit passer sans erreur. Si erreurs → corriger et relancer.
16. **`pnpm lint`** — Doit passer sans erreur. Si erreurs → corriger et relancer.
17. **`pnpm test`** — Tous les tests doivent passer (non-régression). Si échecs → corriger et relancer.

> Les 3 checks doivent être verts avant de passer à la phase suivante.
> Maximum 3 cycles de correction par check. Au-delà, signaler le blocage.

### Phase 4 — Code Review en agent isolé (OBLIGATOIRE)

> La review est lancée dans un **agent autonome séparé** pour garantir un regard neuf.
> L'agent reviewer ne partage PAS le contexte d'implémentation — il découvre le code.

18. Récupérer la liste des fichiers modifiés : `git diff --name-only HEAD~1`
19. Lancer un agent autonome pour la review :
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
20. Analyser le résultat de l'agent :
    - **Si ❌ CHANGES REQUESTED** → appliquer les fix, relancer phase 3 (verify), puis relancer un nouvel agent review
    - **Si ✅ APPROVED** → continuer vers la finalisation

### Phase 5 — Finalisation

21. Remplir la section "Post-implémentation" de la story
22. Mettre à jour `.tiple/conventions/component-registry.md` si nouveaux composants/hooks/actions
23. Mettre à jour `.tiple/sprint/status.md` → story ✅ Done
24. Ajouter une entrée dans `docs/changelog.md` si changement significatif
25. Résumer ce qui a été fait

## Règles

- Ne JAMAIS skip les phases 3 et 4 — elles sont obligatoires
- Si la phase 4 (review) trouve des problèmes HAUTE/MOYENNE, il faut corriger ET relancer la phase 3
- Le cycle est : Implémenter → Tests → Verify → Review → Fix si nécessaire → Verify à nouveau → Docs
- Ne pas créer de composant sans vérifier le component-registry d'abord
- Écrire les tests AVEC le code, pas après
