# Story [ID] — [Titre]

<!-- INSTRUCTIONS : Créé par /tm-plan (phase 5) ou /tm-evolve.
     Ce template est le plus important — il doit contenir TOUT ce dont
     Claude Code a besoin pour implémenter de manière autonome.
     IMPORTANT : Vérifier .tiple/conventions/component-registry.md avant de créer. -->

## Meta

| Champ | Valeur |
|-------|--------|
| **Epic** | E[XX] — [Titre] |
| **Parcours** | [Nom du parcours PRD — section 4.X] |
| **Statut** | ⬜ Draft / 🟢 Ready / 🔵 In Progress / ✅ Done |
| **Priorité** | Must / Should / Could |
| **Référence UI** | _Fichier JSX, lien Figma, wireframe, description texte, ou N/A_ |
| **Conventions** | auth, database, forms, security (tags depuis `.tiple/conventions/_index.md`) |
| **Estimation** | S / M / L |

## Contexte

<!-- Pourquoi cette story existe. Quel problème elle résout. -->

**Refs :**
- PRD : FR-XXX-01, FR-XXX-02 (parcours [X])
- Architecture : section [X]
- Référence UI : _(voir champ Meta — si applicable)_

## Critères d'acceptation

<!-- Format Given/When/Then. Chaque AC doit être vérifiable par un test. -->

- [ ] **Given** [contexte] **When** [action] **Then** [résultat attendu]
- [ ] **Given** [contexte] **When** [action] **Then** [résultat attendu]

## Implémentation

### Fichiers à créer
<!-- Liste avec le chemin complet -->
- `src/...`

### Fichiers à modifier
- `src/...`

### Patterns à suivre
- Voir `.tiple/conventions/coding-standards.md` — section [X]
- Voir `.tiple/conventions/api-patterns.md` — section [X]

## Tests attendus

### Unit tests
- [ ] <!-- Décrire chaque test unitaire attendu -->

### Integration tests
- [ ] <!-- Décrire chaque test d'intégration attendu -->

### E2E tests (si applicable)
- [ ] <!-- Décrire chaque test E2E attendu -->

## Post-implémentation

<!-- Rempli APRÈS le dev par /tm-dev -->

### Écarts avec la référence UI
<!-- Lister les écarts entre l'implémentation et la référence UI, et pourquoi -->
<!-- Si Référence UI = N/A, supprimer cette section -->

### Écarts avec l'architecture
<!-- Si un invariant a été modifié → ADR créé ? -->

### Composants créés
<!-- Lister pour ajout au component-registry -->
| Composant/Hook/Action | Path | Notes |
|----------------------|------|-------|

### Notes
<!-- Observations, dette technique identifiée, suggestions -->
