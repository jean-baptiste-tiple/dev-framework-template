# Cadrage complet du projet

Une seule conversation continue qui produit tous les documents de cadrage.
Pas un formulaire — un dialogue naturel.

> **🚫 RÈGLE CRITIQUE — `/tm-plan` = ZÉRO code, ZÉRO commande système**
>
> Cette commande produit UNIQUEMENT des fichiers Markdown dans `docs/` et `.tiple/sprint/`.
> Pendant toute la durée du `/tm-plan`, il est INTERDIT de :
> - Exécuter `pnpm add`, `pnpm install`, `npm install`, `npx`, ou toute installation de dépendances
> - Créer ou modifier des fichiers `.ts`, `.tsx`, `.js`, `.css`, `.json` (sauf les Markdown de docs)
> - Exécuter `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm build` ou tout build/check
> - Copier des fichiers de code depuis les starters
> - Créer des dossiers dans `src/`, `supabase/`, `.github/`
>
> L'installation technique sera faite par `/tm-dev` lors de la première story (E01-S01 Setup).

## Pré-requis : livrables d'entrée

### Requis
- **Design tokens** → `docs/design/system.md` (design system par défaut inclus dans le template)
- **Flows utilisateur** → intégrés dans les parcours du PRD
- **App spec** → alimente le brief et le PRD

### Optionnel (si maquettes disponibles)
- **Maquettes JSX par écran** → `docs/design/screens/*.jsx`
- **Composants partagés JSX** → `docs/design/components/*.jsx`

Vérifier la présence de ces fichiers avant de démarrer. Si aucune maquette n'est fournie, le cadrage fonctionnera en mode sans maquettes — les stories utiliseront des descriptions textuelles ou N/A comme référence UI.

## Process

### Phase 0 — Starters (identification uniquement — PAS d'installation)

Identifier les besoins techniques du projet et **documenter** les starters à activer.

> ⚠️ **IMPORTANT : `/tm-plan` est un cadrage documentaire.**
> - Ne JAMAIS installer de dépendances (`pnpm add`, `npm install`)
> - Ne JAMAIS créer ou modifier de fichiers de code (`.ts`, `.tsx`, `.js`, `.css`)
> - Ne JAMAIS exécuter de commandes de build, lint ou test
> - Ne JAMAIS copier les fichiers du starter
> - Seuls les fichiers dans `docs/` et `.tiple/sprint/` sont modifiés par `/tm-plan`
>
> L'installation des starters est faite par `/tm-dev` lors de la première story (typiquement E01-S01 "Setup technique").

**Question à poser :** Le projet a-t-il besoin d'une base de données et/ou d'authentification ?

#### Si oui → Documenter l'activation du starter Supabase + Auth

1. Lire `.tiple/starters/supabase-auth/README.md` pour comprendre ce qui sera installé
2. **Créer une story E01-S01 "Setup technique"** dans la Phase 5 qui inclura :
   - Installation des dépendances Supabase
   - Copie des fichiers du starter vers leur destination
   - Configuration `.env.local`
   - Vérification `pnpm type-check`
3. Noter dans `docs/architecture.md` que le starter Supabase + Auth sera activé
4. Adapter les starters si le projet a des besoins auth spécifiques (ex: auth par code chantier au lieu de login classique → ne pas copier les pages auth du starter)

#### Si non → Continuer sans Supabase

Le template fonctionne tel quel sans base de données. Passer directement à la Phase 1.

---

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
   - Chaque FR a une référence UI (maquette, description, ou N/A)
   - (si maquettes) Chaque écran JSX est dans un flow
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
→ Consulter `.tiple/conventions/_index.md` pour identifier les conventions techniques à respecter

### Phase 4 — Design (→ docs/design/)

Deux chemins selon la présence ou non de maquettes.

#### Chemin A : Maquettes disponibles

Si des maquettes existent dans `docs/design/screens/` :

**4a. Design System** (→ `docs/design/system.md`)
Vérifier que `docs/design/system.md` est complet :
- Tokens : couleurs (palette + semantic), spacing, typography, radius, shadows
- Composants réutilisables identifiés
- Patterns UI récurrents
- Responsive breakpoints

Compléter si nécessaire avec les infos du PRD. Tokens d'abord, pas de couleurs en dur. Réutiliser Shadcn/ui au maximum.

**4b. Maquettes** (→ `docs/design/screens/`)
Pour chaque écran listé dans les parcours du PRD :
- Vérifier que le fichier `.jsx` existe dans `docs/design/screens/`
- Vérifier la cohérence avec les parcours du PRD (routes, actions, données)
- Si un écran du PRD n'a pas de JSX → le signaler à l'utilisateur
- Lire les conventions dans `docs/design/guide.md`

**4c. Composants partagés** (→ `docs/design/components/`)
- Vérifier que les composants partagés sont dans `docs/design/components/`
- Mettre à jour `docs/design/components/_index.md`

**4d. Inventaire** (→ `docs/design/screens/_index.md`)
Mettre à jour l'inventaire des écrans avec le tableau :
écran → fichier → parcours → persona → description

→ Valider `docs/design/system.md` (compléter si besoin)
→ Valider les fichiers dans `docs/design/screens/` et `docs/design/components/`
→ Mettre à jour `docs/design/screens/_index.md` et `docs/design/components/_index.md`

#### Chemin B : Sans maquettes

Si aucune maquette n'est fournie :

**4a. Personnalisation du design system**
Le template inclut un design system par défaut (Violet Corporate SaaS). Demander à l'utilisateur :
- Veut-il personnaliser le design system par défaut ?
- Si oui → questions ciblées :
  - Couleur primaire (défaut : Violet #6C2BD9)
  - Couleur secondaire (défaut : dérivée de la primaire)
  - Font principale (défaut : Inter)
  - Style général (corporate, playful, minimal, autre)
- → Mettre à jour `docs/design/system.md` avec les tokens choisis (les fichiers de code `globals.css` et `tailwind.config.ts` seront mis à jour par `/tm-dev` lors de la story de setup)
- Si non → garder le design system par défaut tel quel

**4b. Vérifier** que `docs/design/system.md` reflète les tokens choisis

→ Passer directement à la Phase 5

### Phase 5 — Découper en stories (→ docs/epics/ + docs/stories/)

Depuis le PRD :
- Créer les epics dans `docs/epics/` depuis `.tiple/templates/epic.tmpl.md`
  - Chaque epic référence son parcours et sa référence UI
- Découper chaque epic en stories dans `docs/stories/` depuis `.tiple/templates/story.tmpl.md`
  - Chaque story référence : parcours, FR, référence UI, architecture
  - Chaque story a : contexte, AC en Given/When/Then, fichiers à créer, tests attendus
  - **Chaque story déclare ses tags Conventions** dans le champ Meta :
    - Lire `.tiple/conventions/_index.md` pour la liste des tags disponibles
    - Sélectionner les tags pertinents selon le périmètre technique de la story
    - Exemples : story de formulaire → `api, forms, security` / story de dashboard → `nextjs, state, performance`
    - Ces tags seront utilisés par `/tm-dev` pour charger automatiquement les conventions
- Ordonner par dépendance et priorité

Une story = un déploiement possible. Taille S/M/L, pas XL.

→ Mettre à jour `docs/epics/_index.md`

### Phase 6 — Gate de validation

Passer `.tiple/checklists/readiness-gate.md` point par point.
Vérifier la cohérence PRD (parcours) ↔ architecture ↔ design (référence UI) ↔ stories.
Si KO : corriger avant de continuer.

→ Résumer : prêt à coder, première story à implémenter.
→ Initialiser `.tiple/sprint/status.md` via `/tm-sprint`.
