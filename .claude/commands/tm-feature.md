# /tm-feature — Ajouter une feature

> Workflow complet pour ajouter une feature : evolve PRD si besoin → stories → dev/review loop.
> Usage : `/tm-feature "Titre ou description de la feature"`

## Étapes

### Phase 1 — Contexte

1. Lire `.tiple/sprint/status.md` → état actuel du sprint
2. Lire `docs/prd.md` → la feature est-elle déjà dans le PRD ?

### Phase 2 — Documentation (si feature nouvelle)

3. Si la feature n'est PAS dans le PRD :
   - Mettre à jour `docs/prd.md` — section concernée → statut 🔶 Draft
   - Passer `.tiple/checklists/prd-evolution.md` point par point
   - Identifier les impacts : architecture, epics, stories, design, DB
   - Mettre à jour `docs/architecture.md` (+ ADR si invariant touché)
   - Ajouter une entrée dans `docs/changelog.md`

4. Si la feature est déjà dans le PRD → passer directement à la phase 3

### Phase 3 — Découpage

5. Créer l'epic dans `docs/epics/` si nécessaire
6. Découper en stories dans `docs/stories/`
   - Chaque story doit être 🟢 Ready avec AC en Given/When/Then
   - Vérifier `.tiple/checklists/story-ready.md` pour chaque story

### Phase 4 — Implémentation (boucle par story)

Pour chaque story, dans l'ordre :

7. **Implémenter** — Suivre le flow `/tm-dev` :
   - Lire contexte (story + archi + conventions + registry)
   - Coder : Zod → actions → tests unit → UI → tests unit UI → page → tests integ

8. **Type-check** (OBLIGATOIRE) :
   - `pnpm type-check` → doit passer. Si erreurs → corriger et relancer (max 3 cycles).
   - Le lint et les tests seront exécutés par `/commit-push` avant le push.

9. **Code Review en agent isolé** (OBLIGATOIRE) :
   - Lancer un agent autonome séparé (voir `.claude/commands/tm-review.md`)
   - L'agent reviewer découvre le code avec un regard neuf, sans biais d'implémentation
   - Il passe `.tiple/checklists/code-review.md` point par point
   - Si ❌ CHANGES REQUESTED → corriger puis relancer `pnpm type-check`, puis nouveau review agent

10. **Finalisation story** :
    - Remplir post-implémentation de la story
    - Mettre à jour component-registry si nouveaux composants
    - Mettre à jour sprint status → story ✅ Done
    - Entrée changelog si changement significatif

Répéter 7-10 pour chaque story de la feature.

### Phase 5 — Vérification finale

11. `pnpm type-check` → doit passer (le lint et les tests seront vérifiés par `/commit-push`)
12. `/tm-status` → toutes les stories de la feature sont ✅ Done
13. Résumé global de la feature implémentée
