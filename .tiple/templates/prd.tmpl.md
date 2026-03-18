# PRD — [Nom du projet]

> Statuts : ✅ Validé | 🔶 Draft | ⬜ Placeholder

## 1. Vue d'ensemble ⬜

### Résumé exécutif
<!-- 3-5 phrases : quoi, pour qui, pourquoi, comment. -->

### Vision
<!-- Où va le produit à 6-12 mois ? Une phrase inspirante mais réaliste. -->

## 2. Personas ⬜

<!-- Enrichis depuis le brief. Ajouter contexte d'usage et scénarios. -->

### Persona 1 — [Nom]
- **Rôle** :
- **Contexte d'usage** : <!-- Quand et comment utilise-t-il le produit ? -->
- **Besoin principal** :
- **Frustration actuelle** :
- **Scénario type** : <!-- Décrire un parcours concret en 3-4 étapes. -->

### Persona 2 — [Nom]
- **Rôle** :
- **Contexte d'usage** :
- **Besoin principal** :
- **Frustration actuelle** :
- **Scénario type** :

## 3. Functional Requirements ⬜

<!-- Regrouper par domaine fonctionnel. Chaque FR a :
     - Un ID unique : FR-DOMAINE-01
     - Une description claire
     - Une priorité MoSCoW : Must / Should / Could / Won't
     - Des acceptance criteria -->

### 3.1 — [Domaine 1 : ex. Authentification]

| ID | Description | Priorité | Statut |
|----|-------------|----------|--------|
| FR-AUTH-01 | <!-- ex: L'utilisateur peut s'inscrire avec email + mot de passe --> | Must | ⬜ |
| FR-AUTH-02 | | | ⬜ |

**Acceptance Criteria FR-AUTH-01 :**
- [ ] <!-- Given/When/Then -->

### 3.2 — [Domaine 2]

| ID | Description | Priorité | Statut |
|----|-------------|----------|--------|
| FR-XXX-01 | | | ⬜ |

<!-- Ajouter autant de domaines que nécessaire. -->

## 4. Non-Functional Requirements ⬜

| ID | Catégorie | Description | Priorité |
|----|-----------|-------------|----------|
| NFR-01 | Performance | <!-- ex: Temps de chargement < 2s sur 3G --> | Must |
| NFR-02 | Sécurité | <!-- ex: Auth Supabase, RLS sur toutes les tables --> | Must |
| NFR-03 | Accessibilité | <!-- ex: WCAG 2.1 AA minimum --> | Should |
| NFR-04 | RGPD | <!-- ex: Données hébergées en EU, droit à l'oubli --> | Must |
| NFR-05 | Scalabilité | <!-- ex: Supporter 1000 utilisateurs concurrents --> | Could |

## 5. Epics ⬜

<!-- Liste des epics avec priorité et dépendances inter-epics. -->

| ID | Titre | Priorité | Dépendances | Statut |
|----|-------|----------|-------------|--------|
| E01 | | P0 | — | ⬜ |
| E02 | | P0 | E01 | ⬜ |
| E03 | | P1 | E01, E02 | ⬜ |

## 6. Hors scope ⬜

<!-- Lister explicitement ce qui ne sera PAS fait dans cette version.
     Chaque item doit être clair et non ambigu. -->
-

## 7. Hypothèses & Risques ⬜

### Hypothèses
<!-- Ce qu'on tient pour vrai sans preuve formelle.
     Ex: "Les utilisateurs ont un compte email". -->
-

### Risques
| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| | | | |

## 8. Métriques de succès ⬜

<!-- KPIs mesurables avec objectifs chiffrés et horizon temporel.
     Ex: "Taux d'inscription > 20% des visiteurs — J+30". -->
| Métrique | Objectif | Horizon |
|----------|----------|---------|
| | | |
