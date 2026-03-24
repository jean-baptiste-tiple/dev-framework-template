# Plan d'implémentation — PRD parcours-centered + maquettes JSX

## Contexte
Restructurer le PRD pour qu'il soit organisé par **parcours utilisateur** (et non par domaine technique). Chaque parcours intègre ses écrans, flows, FR et NFR. Ajouter le support des maquettes JSX comme spec visuelle.

## Étapes

### Étape 1 — Template PRD (`prd.tmpl.md`)
Restructurer le template en :
1. Vision
2. Personas (avec parcours clés listés)
3. Design System (résumé + renvoi `docs/design/system.md`)
4. **Parcours utilisateur** — le cœur : chaque parcours contient :
   - Flow Mermaid
   - Tableau des écrans (nom, fichier JSX, description)
   - Tableau des FR (ID, description, priorité, écran, AC)
   - Tableau des NFR liés à ce parcours
5. Modèle de données (résumé ER Mermaid, renvoi `architecture.md`)
6. Hors scope
7. Hypothèses & Risques
8. Métriques de succès

### Étape 2 — Template Epic (`epic.tmpl.md`)
Ajouter dans le tableau Meta :
- `Parcours` : quel(s) parcours du PRD
- `Écrans` : refs vers `docs/design/screens/[fichier].jsx`

### Étape 3 — Template Story (`story.tmpl.md`)
- Remplacer `Design ref` par `Écran(s)` pointant vers les JSX
- Ajouter `Parcours` dans les refs du contexte
- Garder les refs PRD (FR-xxx) et architecture

### Étape 4 — Commande `/tm-plan` (`tm-plan.md`)
- **Phase 2** : expliquer la structure parcours-centered (flow → écrans → FR/NFR par parcours)
- **Phase 4** : ajouter la génération des maquettes JSX dans `docs/design/screens/`, des composants partagés dans `docs/design/components/`, et du guide de lecture `docs/design/guide.md`

### Étape 5 — Commande `/tm-dev` (`tm-dev.md`)
- Étape 4 "Lire le contexte" : remplacer "maquette design référencée" par "écran(s) JSX du parcours"

### Étape 6 — Checklists
- **`readiness-gate.md`** : ajouter vérifications parcours + écrans JSX
- **`prd-evolution.md`** : ajouter "Quels parcours impactés ?" + "Quels écrans JSX à mettre à jour ?"
- **`story-ready.md`** : adapter vérification design → écran JSX
- **`code-review.md`** : adapter vérification design → écran JSX

### Étape 7 — `CLAUDE.md`
- Ajuster "maquette design référencée" → "écran JSX du parcours"
- Ajuster le workflow quotidien en conséquence

### Étape 8 — Nouveaux fichiers
- Créer `docs/design/screens/_index.md` (inventaire écrans)
- Créer `docs/design/components/` + `_index.md` (composants partagés design)
- Créer `docs/design/guide.md` (guide de lecture JSX)

### Étape 9 — Vérification
- Relire tous les fichiers modifiés pour cohérence croisée
- Vérifier que les refs entre fichiers sont correctes
- `pnpm type-check && pnpm lint && pnpm test`
- Commit + push
