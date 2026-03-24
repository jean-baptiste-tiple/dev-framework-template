# Cadrage complet du projet

Une seule conversation continue qui produit tous les documents de cadrage.
Pas un formulaire — un dialogue naturel.

## Process

### Phase 1 — Comprendre le problème (→ docs/brief.md)

Poser les bonnes questions :
- Quel problème résout-on ? Pour qui ? Pourquoi maintenant ?
- Qui sont les utilisateurs ? (personas avec nom/rôle/besoin/frustration)
- Quel est le scope MVP ? (IN/OUT explicites)
- Quelles contraintes ? (techniques, business, légales, RGPD)
- Comment mesure-t-on le succès ? (KPIs concrets)
- Quels risques connus ?

Quantifier la douleur : "perd 2h/semaine" > "c'est lent".

→ Générer `docs/brief.md` depuis `.tiple/templates/brief.tmpl.md`

### Phase 2 — Structurer le PRD par parcours (→ docs/prd.md)

Transformer le brief en PRD organisé par **parcours utilisateur** :

1. **Identifier les parcours** depuis les personas et le scope MVP
   - Chaque parcours = un objectif utilisateur complet (ex: "S'authentifier", "Gérer son menu")
2. **Pour chaque parcours, définir :**
   - Le flow Mermaid (enchaînement des écrans)
   - Les écrans nécessaires (nom + description, les fichiers JSX seront créés en phase 4)
   - Les FR avec ID `FR-[PARCOURS]-[XX]`, description, priorité MoSCoW, AC en Given/When/Then
   - Les NFR liés au parcours (performance, sécurité, accessibilité)
3. **Vérifier la cohérence :**
   - Chaque FR est rattachée à un écran
   - Chaque écran est dans un flow
   - Max 60% de Must
   - Chaque FR est testable
4. **Résumé du modèle de données** : entités inférées des parcours

→ Générer `docs/prd.md` depuis `.tiple/templates/prd.tmpl.md`

### Phase 3 — Concevoir l'architecture (→ docs/architecture.md)

Définir :
- Modèle de données (tables, relations, diagramme Mermaid ER)
- RLS policies pour chaque table
- Server Actions nécessaires (par parcours/domaine)
- Points d'attention performance

Commencer simple. RLS dès le jour 1. Un schema Zod = une source de vérité.

→ Générer `docs/architecture.md` depuis `.tiple/templates/architecture.tmpl.md`

### Phase 4 — Design : tokens + maquettes JSX (→ docs/design/)

#### 4a. Design System (→ docs/design/system.md)
Définir :
- Tokens : couleurs (palette + semantic), spacing, typography, radius, shadows
- Composants réutilisables identifiés (depuis les parcours du PRD)
- Patterns UI récurrents (listes, formulaires, cards, modals)
- Responsive breakpoints

Tokens d'abord, pas de couleurs en dur. Réutiliser Shadcn/ui au maximum.

#### 4b. Maquettes JSX (→ docs/design/screens/)
Pour chaque écran listé dans les parcours du PRD :
- Créer un fichier `.jsx` dans `docs/design/screens/`
- Utiliser les composants de `docs/design/guide.md` (Screen, Card, Form, Input, Button, etc.)
- Annoter avec `data-*` pour les variants, actions, navigation
- Référencer les tokens du design system (pas de valeurs en dur)

#### 4c. Composants partagés (→ docs/design/components/)
Identifier les composants utilisés dans plusieurs écrans :
- Créer un fichier `.jsx` par composant partagé dans `docs/design/components/`
- Mettre à jour `docs/design/components/_index.md`

#### 4d. Inventaire (→ docs/design/screens/_index.md)
Mettre à jour l'inventaire des écrans avec le tableau :
écran → fichier JSX → parcours → persona → description

→ Générer `docs/design/system.md`
→ Générer les fichiers JSX dans `docs/design/screens/` et `docs/design/components/`
→ Générer `docs/design/screens/_index.md` et `docs/design/components/_index.md`

### Phase 5 — Découper en stories (→ docs/epics/ + docs/stories/)

Depuis le PRD :
- Créer les epics dans `docs/epics/` depuis `.tiple/templates/epic.tmpl.md`
  - Chaque epic référence son parcours et ses écrans JSX
- Découper chaque epic en stories dans `docs/stories/` depuis `.tiple/templates/story.tmpl.md`
  - Chaque story référence : parcours, FR, écran(s) JSX, architecture
  - Chaque story a : contexte, AC en Given/When/Then, fichiers à créer, tests attendus
- Ordonner par dépendance et priorité

Une story = un déploiement possible. Taille S/M/L, pas XL.

→ Mettre à jour `docs/epics/_index.md`

### Phase 6 — Gate de validation

Passer `.tiple/checklists/readiness-gate.md` point par point.
Vérifier la cohérence PRD (parcours) ↔ architecture ↔ design (JSX) ↔ stories.
Si KO : corriger avant de continuer.

→ Résumer : prêt à coder, première story à implémenter.
→ Initialiser `.tiple/sprint/status.md` via `/tm-sprint`.
