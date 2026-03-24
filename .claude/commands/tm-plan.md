# Cadrage complet du projet

Une seule conversation continue qui produit tous les documents de cadrage.
Pas un formulaire — un dialogue naturel.

## Pré-requis : livrables du framework Design

Le framework Design (en amont) produit les livrables suivants qui servent d'**input** à ce cadrage :
- **Design tokens** → `docs/design/system.md`
- **Maquettes JSX par écran** → `docs/design/screens/*.jsx`
- **Composants partagés JSX** → `docs/design/components/*.jsx`
- **Flows utilisateur** → intégrés dans les parcours du PRD
- **App spec** → alimente le brief et le PRD

Vérifier que ces fichiers sont présents avant de démarrer. Si absents, demander à l'utilisateur de les fournir.

## Process

### Phase 1 — Comprendre le problème (→ docs/brief.md)

Lire l'app spec fournie par le framework Design, puis compléter par des questions :
- Quel problème résout-on ? Pour qui ? Pourquoi maintenant ?
- Qui sont les utilisateurs ? (personas avec nom/rôle/besoin/frustration)
- Quel est le scope MVP ? (IN/OUT explicites)
- Quelles contraintes ? (techniques, business, légales, RGPD)
- Comment mesure-t-on le succès ? (KPIs concrets)
- Quels risques connus ?

Quantifier la douleur : "perd 2h/semaine" > "c'est lent".

→ Générer `docs/brief.md` depuis `.tiple/templates/brief.tmpl.md`

### Phase 2 — Structurer le PRD par parcours (→ docs/prd.md)

Transformer le brief + les livrables Design en PRD organisé par **parcours utilisateur** :

1. **Identifier les parcours** depuis les personas, le scope MVP et les flows du framework Design
   - Chaque parcours = un objectif utilisateur complet (ex: "S'authentifier", "Gérer son menu")
2. **Pour chaque parcours, définir :**
   - Le flow Mermaid (repris/adapté depuis les flows du framework Design)
   - Les écrans (référencer les fichiers JSX existants dans `docs/design/screens/`)
   - Les FR avec ID `FR-[PARCOURS]-[XX]`, description, priorité MoSCoW, AC en Given/When/Then
   - Les NFR liés au parcours (performance, sécurité, accessibilité)
3. **Vérifier la cohérence :**
   - Chaque FR est rattachée à un écran JSX existant
   - Chaque écran JSX est dans un flow
   - Max 60% de Must
   - Chaque FR est testable
4. **Résumé du modèle de données** : entités inférées des parcours

→ Générer `docs/prd.md` depuis `.tiple/templates/prd.tmpl.md`

### Phase 3 — Concevoir l'architecture (→ docs/architecture.md)

Définir :
- Modèle de données (tables, relations, diagramme Mermaid ER)
- RLS policies pour chaque table
- Server Actions nécessaires (par parcours)
- Points d'attention performance

Commencer simple. RLS dès le jour 1. Un schema Zod = une source de vérité.

→ Générer `docs/architecture.md` depuis `.tiple/templates/architecture.tmpl.md`

### Phase 4 — Valider le design (→ docs/design/)

Les livrables Design (tokens, JSX, composants) sont déjà fournis par le framework Design en amont.
Cette phase **valide et inventorie**, elle ne génère pas.

#### 4a. Design System (→ docs/design/system.md)
Vérifier que `docs/design/system.md` est complet :
- Tokens : couleurs (palette + semantic), spacing, typography, radius, shadows
- Composants réutilisables identifiés
- Patterns UI récurrents
- Responsive breakpoints

Compléter si nécessaire avec les infos du PRD. Tokens d'abord, pas de couleurs en dur. Réutiliser Shadcn/ui au maximum.

#### 4b. Maquettes JSX (→ docs/design/screens/)
Pour chaque écran listé dans les parcours du PRD :
- Vérifier que le fichier `.jsx` existe dans `docs/design/screens/`
- Vérifier la cohérence avec les parcours du PRD (routes, actions, données)
- Si un écran du PRD n'a pas de JSX → le signaler à l'utilisateur
- Lire les conventions dans `docs/design/guide.md`

#### 4c. Composants partagés (→ docs/design/components/)
- Vérifier que les composants partagés sont dans `docs/design/components/`
- Mettre à jour `docs/design/components/_index.md`

#### 4d. Inventaire (→ docs/design/screens/_index.md)
Mettre à jour l'inventaire des écrans avec le tableau :
écran → fichier JSX → parcours → persona → description

→ Valider `docs/design/system.md` (compléter si besoin)
→ Valider les fichiers JSX dans `docs/design/screens/` et `docs/design/components/`
→ Mettre à jour `docs/design/screens/_index.md` et `docs/design/components/_index.md`

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
