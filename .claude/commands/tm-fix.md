# /tm-fix — Bug fix ou petite modification

> Workflow allégé pour corriger un bug ou faire une modification mineure.
> Usage : `/tm-fix "Description du bug ou de la modification"`
> Pour les modifications très mineures (typo, padding, couleur) : pas besoin de story.

## Étapes

### Si modification très mineure (typo, padding, couleur)

1. Modifier directement le code
2. **Vérification triple** (OBLIGATOIRE) :
   - `pnpm type-check` → doit passer
   - `pnpm lint` → doit passer
   - `pnpm test` → doit passer (non-régression)
3. Commit et c'est fait

### Si bug fix ou modification plus conséquente

#### Phase 1 — Story allégée

1. Créer une story de fix dans `docs/stories/` :
   - Meta : estimation S, priorité Must
   - Contexte : décrire le bug / la modification
   - AC : Given [situation actuelle], When [action], Then [comportement corrigé]
   - Implémentation : fichiers à modifier
   - Tests : le test qui couvre le cas corrigé

#### Phase 2 — Implémentation

2. Lire la story
3. Identifier le code concerné
4. Écrire le test qui reproduit le bug (red)
5. Corriger le code (green)
6. Vérifier que le test passe

#### Phase 3 — Vérification triple (OBLIGATOIRE)

7. **`pnpm type-check`** → doit passer
8. **`pnpm lint`** → doit passer
9. **`pnpm test`** → tous les tests doivent passer (non-régression)

> Si erreurs → corriger et relancer. Maximum 3 cycles.

#### Phase 4 — Code Review (OBLIGATOIRE)

10. Lancer un **agent reviewer autonome** (voir `.claude/commands/tm-review.md`) — focus sur :
    - Le fix résout-il vraiment le bug ?
    - Pas d'effets de bord ? Pas de régression ?
    - Sécurité : le fix n'introduit pas de faille ?
    - Registry à jour si composant modifié ?
11. Si ❌ CHANGES REQUESTED → corriger puis relancer phase 3, puis nouveau review agent

#### Phase 5 — Finalisation

12. Mettre à jour la story (post-implémentation)
13. Mettre à jour `.tiple/sprint/status.md` → story ✅ Done
14. Résumer ce qui a été fait
