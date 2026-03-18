# E[XX]-S[XX] — [Titre de la story]

## Meta

| Champ | Valeur |
|-------|--------|
| **Epic** | E[XX] — [Titre epic] |
| **Status** | ⬜ Draft / 🟢 Ready / 🔵 In Progress / ✅ Done |
| **Priorité** | Must / Should / Could |
| **Design ref** | <!-- ex: docs/design/screens/login.md — ou "N/A" --> |
| **Estimation** | S / M / L |

## Contexte

<!-- Pourquoi cette story existe. Quel problème résout-elle ?
     Liens vers les documents de référence. -->

- **PRD** : <!-- ex: FR-AUTH-01, FR-AUTH-02 -->
- **Architecture** : <!-- ex: sections 4 (modèle de données), 6 (auth) -->
- **Design** : <!-- ex: docs/design/screens/login.md -->

## Acceptance Criteria

<!-- Format Given/When/Then. Chaque critère est une checkbox.
     Être spécifique et testable. -->

- [ ] **Given** [contexte initial], **when** [action], **then** [résultat attendu]
- [ ] **Given** [contexte initial], **when** [action], **then** [résultat attendu]
- [ ] **Given** [contexte initial], **when** [action], **then** [résultat attendu]

## Implémentation

<!-- IMPORTANT : vérifier .tiple/conventions/component-registry.md avant de créer
     un composant, hook, ou util. S'il existe déjà, réutiliser. -->

### Fichiers à créer
<!-- Liste des nouveaux fichiers avec leur rôle. -->
- `src/...` — <!-- rôle -->

### Fichiers à modifier
<!-- Liste des fichiers existants à modifier. -->
- `src/...` — <!-- nature de la modification -->

### Patterns à suivre
<!-- Refs vers les conventions pertinentes. -->
- `.tiple/conventions/coding-standards.md` — <!-- section spécifique -->
- `.tiple/conventions/api-patterns.md` — <!-- section spécifique -->

## Tests attendus

### Unit tests
- [ ] <!-- ex: loginAction valide les inputs avec loginSchema -->
- [ ] <!-- ex: loginAction retourne { error } si credentials invalides -->

### Integration tests
- [ ] <!-- ex: LoginForm affiche une erreur si email invalide -->
- [ ] <!-- ex: LoginForm redirige vers /dashboard après login réussi -->

### E2E tests
<!-- Uniquement si le parcours est critique. Sinon supprimer cette section. -->
- [ ] <!-- ex: Parcours complet login → dashboard → logout -->

## Post-implémentation

<!-- Rempli APRÈS le développement. Ne pas supprimer cette section. -->

### Écarts avec le design
<!-- Différences entre la maquette et l'implémentation finale. -->
- Aucun / <!-- décrire les écarts -->

### Écarts avec l'architecture
<!-- Si un invariant a été touché, créer un ADR dans docs/decisions/. -->
- Aucun / <!-- décrire les écarts + ref ADR -->

### Composants créés
<!-- À ajouter dans .tiple/conventions/component-registry.md -->
| Composant/Hook/Action | Path | Notes |
|-----------------------|------|-------|
| | | |

### Notes
<!-- Observations, dette technique identifiée, suggestions pour la suite. -->
-
