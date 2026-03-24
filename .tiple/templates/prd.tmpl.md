# PRD — [Nom du projet]

<!-- INSTRUCTIONS : Ce PRD est généré par /tm-plan (phase 2) depuis le brief.
     Organisé par PARCOURS UTILISATEUR : chaque parcours regroupe ses écrans,
     flows, exigences fonctionnelles et non-fonctionnelles.
     Statuts : ✅ Validé | 🔶 Draft | ⬜ Placeholder -->

**Statut global :** 🔶 Draft
**Dernière MAJ :** [date]

## 1. Vision

### Résumé exécutif
<!-- 3-5 phrases. Problème, solution, valeur. -->

### Vision
<!-- En une phrase : où va ce produit à 6-12 mois ? -->

## 2. Personas

<!-- Enrichis depuis le brief. Chaque persona liste ses parcours clés. -->

| Persona | Rôle | Objectif principal | Parcours clés |
|---------|------|-------------------|---------------|

## 3. Design System (résumé)

<!-- Résumé des tokens clés. Détail complet dans docs/design/system.md -->

| Token | Valeur | Usage |
|-------|--------|-------|
| --primary | | Couleur principale |
| --font-sans | | Corps de texte |
| --space-4 | 16px | Espacement standard |

**Composants partagés :** voir `docs/design/components/_index.md`
**Design system complet :** voir `docs/design/system.md`

## 4. Parcours utilisateur

<!-- Le cœur du PRD. Chaque parcours est un bloc auto-suffisant :
     flow + écrans + FR + NFR. Un LLM peut lire un seul parcours
     et avoir tout le contexte pour l'implémenter.

     Conventions :
     - FR-[PARCOURS]-[XX] : exigence fonctionnelle
     - NFR-[PARCOURS]-[XX] : exigence non-fonctionnelle liée au parcours
     - Priorité MoSCoW : Must / Should / Could / Won't
     - Max 60% de Must. Chaque FR doit être testable.
     - Statuts : ✅ Validé | 🔶 Draft | ⬜ Placeholder -->

### 4.X [Nom du parcours]

**Persona :** [Nom]
**Objectif :** <!-- Ce que l'utilisateur accomplit dans ce parcours -->

#### Flow

```mermaid
graph LR
    %% Diagramme du parcours utilisateur
```

#### Écrans

| Écran | Fichier JSX | Description |
|-------|-------------|-------------|
| | docs/design/screens/[fichier].jsx | |

#### Exigences fonctionnelles

| ID | Description | Priorité | Écran(s) | Statut |
|----|------------|----------|----------|--------|
| FR-XXX-01 | | Must | [fichier].jsx | 🔶 |

**Critères d'acceptation FR-XXX-01 :**
- [ ] Given ... When ... Then ...
- [ ] Given ... When ... Then ...

#### Exigences non-fonctionnelles

| ID | Catégorie | Description | Cible | Écran(s) | Statut |
|----|-----------|------------|-------|----------|--------|
| NFR-XXX-01 | Performance | | | [fichier].jsx | 🔶 |

---

<!-- Répéter la structure ### 4.X pour chaque parcours -->

## 5. Modèle de données (résumé)

<!-- Vue consolidée des entités. Détail complet dans docs/architecture.md -->

```mermaid
erDiagram
    %% Diagramme ER résumé
```

| Entité | Parcours concernés | Description |
|--------|-------------------|-------------|

## 6. Epics

<!-- Les epics regroupent les stories par parcours. -->

| ID | Titre | Parcours | Priorité | Dépendances | Statut |
|----|-------|----------|----------|-------------|--------|
| E01 | | [Parcours] | P0 | — | 🔶 |

## 7. Hors scope

<!-- Liste explicite de ce qui n'est PAS dans ce produit. -->

## 8. Hypothèses & Risques

### Hypothèses
<!-- Ce qu'on tient pour vrai sans preuve. -->

### Risques
| Risque | Impact | Mitigation |
|--------|--------|------------|

## 9. Métriques de succès

| Métrique | Parcours | Baseline | Cible | Échéance |
|----------|----------|----------|-------|----------|
