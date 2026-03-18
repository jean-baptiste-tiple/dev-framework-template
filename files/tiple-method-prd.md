# PRD — Tiple Method Template

> Template Git réutilisable pour bootstrapper un projet avec la méthodologie Tiple Method.
> À donner à Claude Code pour développer le template.

---

## 1. Vue d'ensemble

### Quoi
Un repo Git template qui contient toute la structure, les templates de documents, les checklists, les conventions, et le CLAUDE.md de la Tiple Method. Le template est pré-configuré pour la stack **Next.js 15 (App Router) + Supabase + TypeScript + Tailwind CSS + Shadcn/ui** : les conventions, patterns, et pièges connus sont déjà documentés. Quand on démarre un nouveau projet client, on fait `git clone` de ce template et on est prêt à travailler en 5 minutes.

### Pour qui
JB (moi) et les futurs devs de Tiple, pour chaque nouveau projet client. Le template est utilisé exclusivement avec Claude Code.

### Problème résolu
Aujourd'hui, à chaque nouveau projet, on repart de zéro : pas de structure de docs, pas de conventions, pas de process. Résultat : les 2 premières heures sont perdues à setup, et au bout de 2 mois les projets dérivent (code dupliqué, docs obsolètes, pas de tests, architecture qui s'effrite).

### Succès
Le template est réussi si :
- On peut démarrer un nouveau projet en < 5 min (clone + personnaliser le CLAUDE.md)
- Claude Code suit la méthode sans qu'on ait à ré-expliquer les règles
- Les docs générées sont cohérentes et utiles (pas du remplissage)
- Le workflow story→dev→test→review fonctionne en boucle autonome

---

## 2. Périmètre

### IN — Ce que le template contient

1. **Structure de dossiers** complète (`docs/`, `.tiple/`, etc.)
2. **CLAUDE.md** — Instructions Claude Code pour suivre la méthode
3. **Templates de documents** (`.tiple/templates/`) :
   - `brief.tmpl.md` — Product brief
   - `prd.tmpl.md` — PRD avec statuts par section
   - `architecture.tmpl.md` — Architecture avec invariants/flexible
   - `epic.tmpl.md` — Epic détaillée
   - `story.tmpl.md` — Story complète (le plus important)
   - `adr.tmpl.md` — Architecture Decision Record
4. **Checklists** (`.tiple/checklists/`) :
   - `readiness-gate.md` — Gate avant de coder
   - `story-ready.md` — Definition of Ready
   - `story-done.md` — Definition of Done
   - `code-review.md` — Review post-implémentation
   - `prd-evolution.md` — Check quand les specs changent
5. **Conventions** (`.tiple/conventions/`) :
   - `coding-standards.md` — Patterns DRY, naming, structure (pré-rempli avec les bonnes pratiques, à personnaliser par projet)
   - `tech-stack.md` — Template à remplir (stack + versions)
   - `testing-strategy.md` — Stratégie unit/integ/e2e (pré-remplie)
   - `component-registry.md` — Registry vide avec structure et instructions
   - `api-patterns.md` — Patterns API standards (pré-rempli)
6. **Sprint tracking** (`.tiple/sprint/`) :
   - `status.md` — Template de sprint status
7. **Fichiers docs initiaux** (stubs) :
   - `docs/brief.md` — Placeholder avec instructions
   - `docs/prd.md` — Placeholder avec instructions
   - `docs/architecture.md` — Placeholder avec instructions
   - `docs/changelog.md` — Vide avec structure
   - `docs/design/system.md` — Template design system
   - `docs/design/flows/.gitkeep`
   - `docs/design/screens/.gitkeep`
   - `docs/epics/_index.md` — Placeholder
   - `docs/stories/.gitkeep`
   - `docs/decisions/.gitkeep`
8. **Slash commands Claude Code** (`.claude/commands/`) pour déclencher chaque phase
9. **README.md** — Explique la méthode et comment utiliser le template
10. **`.gitignore`** adapté

### OUT — Ce que le template ne contient PAS
- Pas de code métier — le `src/` contient uniquement le scaffolding vide Next.js (structure de dossiers, layout root, fichiers de config)
- Pas de CI/CD (chaque projet a sa propre CI)
- Pas d'agent/persona — le CLAUDE.md suffit
- Pas de Graybox — c'est un outil séparé utilisé en amont
- Pas de pages/features pré-construites — uniquement la structure et les configs

---

## 3. Détail des livrables

### 3.1 — CLAUDE.md

Le fichier le plus critique. Il doit être :
- **Concis** — Claude Code le lit à chaque message, donc pas de bloat
- **Directif** — Des règles claires, pas des suggestions
- **Auto-suffisant** — Il pointe vers les bons fichiers sans tout re-expliquer

Structure du CLAUDE.md :

```
# CLAUDE.md — Tiple Method

## Projet
<!-- À REMPLIR : Nom, description 1 ligne -->

## Stack
Next.js 15 (App Router) + Supabase + TypeScript strict + Tailwind CSS + Shadcn/ui
Voir .tiple/conventions/tech-stack.md pour les versions exactes.

## Méthode
Ce projet suit la Tiple Method. La documentation dans docs/ est la source
de vérité. Lis les fichiers pertinents avant chaque action.

## Règles absolues
[8 règles non-négociables — voir section 3.1.1]

## Règles Next.js + Supabase
[5-6 règles techniques critiques — voir section 3.1.2]

## Commandes
/tm-plan — Cadrage complet (brief→PRD→archi→design→stories) — début de projet
/tm-dev — Implémenter une story ou un bugfix/amélioration en mode libre
/tm-review — Code review adversariale
/tm-evolve — Évolution du scope + cascade impacts
/tm-status — Sprint status
/tm-sprint — Nouveau sprint

## Workflow quotidien
1. /tm-dev [story-id] ou /tm-dev (mode libre pour bugs/améliorations)
2. Lire le contexte → coder → tester → commit
3. À chaque commit : entrée dans docs/changelog.md
4. Non-régression : tous les tests existants passent
5. MAJ component-registry si nouveau composant/hook/action

## Quand le scope change
Lancer /tm-evolve — voir .tiple/checklists/prd-evolution.md

## Quand on crée un nouveau composant
1. Vérifier .tiple/conventions/component-registry.md — réutiliser si existe
2. Respecter docs/design/system.md (tokens, patterns)
3. Implémenter + tests
4. Ajouter au registry

## Conventions
[Pointe vers les fichiers dans .tiple/conventions/]
```

#### 3.1.1 — Les 8 règles absolues

1. Ne JAMAIS coder une feature sans story en statut 🟢 Ready dans `docs/stories/`. Exception : les bugfixes et petites améliorations peuvent être faits en mode libre via `/tm-dev` sans story formelle.
2. TOUJOURS lire avant de coder : la story (si applicable), la maquette design référencée, `docs/architecture.md`, `.tiple/conventions/component-registry.md`, `.tiple/conventions/coding-standards.md`
3. Ne JAMAIS créer un composant/hook/util sans vérifier le component-registry d'abord — s'il existe, réutiliser
4. Ne JAMAIS modifier un invariant d'architecture sans créer un ADR dans `docs/decisions/`
5. Les tests sont écrits AVEC le code, pas après — unit tests d'abord, puis intégration, puis e2e si applicable
6. Après implémentation d'une story : remplir la section "Post-implémentation" de la story
7. Après implémentation d'une story : passer `.tiple/checklists/code-review.md` point par point
8. À chaque commit, ajouter une entrée dans `docs/changelog.md` : date, scope, ce qui a été fait, pourquoi, problèmes rencontrés le cas échéant. Le changelog est la mémoire du projet.

#### 3.1.2 — Règles techniques Next.js + Supabase

Ces règles sont dans le CLAUDE.md car Claude Code doit les avoir en tête en permanence, pas seulement quand il lit les conventions.

1. **Server Components par défaut.** Ne pas mettre "use client" sauf si nécessaire (state, effects, event handlers). Pousser le "use client" le plus bas possible dans l'arbre.
2. **Server Actions pour les mutations.** Pas d'API routes sauf webhooks/cron. Chaque action : vérifier auth → valider Zod → exécuter → revalidatePath → retourner {data} ou {error}.
3. **Supabase côté serveur uniquement pour les mutations.** Le browser client est réservé au realtime et à l'auth listener. Jamais de `.insert()/.update()/.delete()` depuis un Client Component.
4. **RLS activé sur toute table.** Pas d'exception sans ADR documenté. Le service_role client est interdit sauf cas explicitement documenté.
5. **Schemas Zod partagés.** Un schema dans `lib/schemas/` = validé côté form + côté action. Pas de double validation manuelle.
6. **Migrations versionnées.** Chaque changement DB = `pnpm db:migrate [nom]` → fichier SQL dans `supabase/migrations/`. Jamais de modification en direct.

### 3.2 — Slash Commands (`.claude/commands/`)

Les commandes sont des fichiers markdown dans `.claude/commands/` qui donnent les instructions à Claude Code quand on tape `/nom-commande`. Préfixe `tm-` (Tiple Method) pour éviter les collisions.

**Principe : 2 commandes au quotidien, 4 commandes occasionnelles.**

| Commande | Fichier | Quand | Ce qu'elle fait |
|----------|---------|-------|-----------------|
| `/tm-plan` | `tm-plan.md` | Début de projet | Cadrage complet en une conversation fluide : brief → PRD → architecture → design system → stories. Gate de validation intégrée. |
| `/tm-dev` | `tm-dev.md` | Quotidien | Implémente une story OU un bugfix/amélioration en mode libre. Lit le contexte, code, teste, met à jour le changelog et le registry. |
| `/tm-review` | `tm-review.md` | Après dev | Code review avec checklist + review adversariale. Corrige les problèmes trouvés. |
| `/tm-evolve` | `tm-evolve.md` | Quand le scope change | Évolution du PRD avec analyse d'impact cascade → MAJ architecture, stories, changelog. Crée les nouvelles stories nécessaires. |
| `/tm-status` | `tm-status.md` | À la demande | Affiche le sprint actuel, les stories terminées/en cours/à venir, propose les prochaines actions. |
| `/tm-sprint` | `tm-sprint.md` | Début de sprint | Initialise un nouveau sprint dans status.md avec dates, epic focus, stories sélectionnées. |

#### Détail des commandes critiques

**`/tm-plan` (cadrage initial) :**

```markdown
# Cadrage complet du projet — conversation fluide

## Objectif
Une seule conversation continue qui produit tous les documents de cadrage.
Pas un formulaire — un dialogue. Claude pose des questions, l'utilisateur répond,
les docs se construisent progressivement.

## Process (conversation fluide, pas des étapes rigides)

### Phase 1 — Comprendre le problème (→ docs/brief.md)
- Poser les bonnes questions : quel problème ? pour qui ? pourquoi maintenant ?
- Identifier les personas avec nom/rôle/besoin/frustration
- Définir le scope IN/OUT du MVP
- Identifier les contraintes (techniques, business, légales, RGPD)
- Définir les métriques de succès (KPIs concrets, mesurables)
- Lister les risques connus
- Best practices : se concentrer sur les problèmes pas les solutions,
  quantifier la douleur ("perd 2h/semaine" > "c'est lent")
→ Générer docs/brief.md depuis .tiple/templates/brief.tmpl.md

### Phase 2 — Structurer les exigences (→ docs/prd.md)
- Transformer le brief en exigences fonctionnelles numérotées (FR-DOMAINE-01)
- Chaque FR a : ID, description, priorité MoSCoW, critères d'acceptation mesurables
- Ajouter les exigences non-fonctionnelles (NFR-01 : perf, sécu, accessibilité, RGPD)
- Découper en Epics avec priorités et dépendances
- Best practices : chaque FR doit être testable ("l'utilisateur peut X" pas "le système est bon"),
  utiliser MoSCoW avec discipline (max 60% Must), lister explicitement le hors-scope
→ Générer docs/prd.md depuis .tiple/templates/prd.tmpl.md

### Phase 3 — Concevoir l'architecture (→ docs/architecture.md)
- Modèle de données (tables, relations, diagramme Mermaid ER)
- Server Actions nécessaires (par domaine)
- Patterns d'auth et RLS policies
- Points d'attention performance
- Best practices : commencer simple (pas d'optimisation prématurée),
  RLS dès le jour 1, un schema Zod = une source de vérité
→ Générer docs/architecture.md depuis .tiple/templates/architecture.tmpl.md

### Phase 4 — Définir le design system (→ docs/design/system.md)
- Tokens : couleurs (palette + semantic), spacing, typography, radius, shadows
- Composants réutilisables identifiés (à partir des features du PRD)
- Patterns UI récurrents (listes filtrables, formulaires, cards, modals)
- Responsive breakpoints
- Best practices : tokens d'abord (pas de couleurs en dur),
  identifier les patterns avant de coder, réutiliser Shadcn/ui au maximum
→ Générer docs/design/system.md

### Phase 5 — Découper en stories (→ docs/epics/ + docs/stories/)
- Créer les epics depuis le PRD
- Découper chaque epic en stories implémentables
- Chaque story a : contexte, AC en Given/When/Then, fichiers à créer, tests attendus
- Ordonner les stories par dépendance et priorité
- Best practices : une story = un déploiement possible, taille S/M/L (pas XL),
  les AC doivent être vérifiables par un test automatisé
→ Générer docs/epics/*.md et docs/stories/*.md

### Phase 6 — Gate de validation
- Passer .tiple/checklists/readiness-gate.md
- Vérifier la cohérence entre PRD ↔ architecture ↔ design ↔ stories
- Si KO : corriger les incohérences avant de continuer
- Résumer : prêt à coder, voici la première story à implémenter
```

**`/tm-dev` (la plus importante — usage quotidien) :**

```markdown
# Implémente du code — story OU mode libre

## Input
- Identifiant de story (ex: E01-S01) → mode story
- "next" → prochaine story 🟢 Ready
- Aucun argument → mode libre (bugfix, amélioration, refacto)

## Mode Story (avec identifiant ou "next")
1. Si "next" : lire .tiple/sprint/status.md, trouver la prochaine story 🟢 Ready
2. Lire la story complète dans docs/stories/
3. Vérifier la checklist .tiple/checklists/story-ready.md — si KO, signaler et s'arrêter
4. Lire le contexte :
   - La maquette design référencée (si elle existe)
   - docs/architecture.md (sections pertinentes)
   - docs/design/system.md (tokens, composants identifiés)
   - .tiple/conventions/component-registry.md
   - .tiple/conventions/coding-standards.md
   - .tiple/conventions/api-patterns.md
5. Implémenter dans cet ordre :
   a. Migration DB si nécessaire (supabase/migrations/)
   b. Schemas Zod partagés (lib/schemas/)
   c. Server Actions (lib/actions/) + tests unitaires
   d. Composants UI (components/) + tests unitaires
   e. Page/route (app/) + tests d'intégration
   f. Tests E2E si listés dans la story
6. À CHAQUE COMMIT : ajouter une entrée dans docs/changelog.md
7. Vérifier la non-régression (tous les tests existants passent)
8. Mettre à jour la story : section Post-implémentation
9. Mettre à jour .tiple/conventions/component-registry.md
10. Mettre à jour .tiple/sprint/status.md (story → ✅ Done)

## Mode Libre (sans argument — bugfix, amélioration, refacto)
1. L'utilisateur décrit le problème ou l'amélioration souhaitée
2. Lire le contexte existant :
   - docs/architecture.md
   - docs/design/system.md
   - .tiple/conventions/component-registry.md
   - .tiple/conventions/coding-standards.md
   - Les fichiers de code concernés
3. Analyser le problème, proposer un plan (fichiers à modifier, approche)
4. Implémenter :
   - Respecter les mêmes conventions que le mode story
   - Écrire les tests nécessaires
   - Si un nouveau composant réutilisable est créé → l'ajouter au registry
5. À CHAQUE COMMIT : ajouter une entrée dans docs/changelog.md
6. Vérifier la non-régression

## Format changelog (pour les deux modes)
Chaque entrée :
  ## [Date] — [Scope : story ID, bugfix, amélioration, refacto]
  **Quoi :** Ce qui a été fait (concis)
  **Pourquoi :** La raison (story, bug report, amélioration UX, dette technique...)
  **Problèmes :** Ce qui a bloqué et comment c'a été résolu (si applicable)
  **Fichiers :** Liste des fichiers créés/modifiés

## Best practices appliquées systématiquement
- Vérifier le component-registry AVANT de créer quoi que ce soit (DRY)
- Server Components par défaut, "use client" le plus bas possible
- Zod schema partagé = une seule source de vérité (form + action)
- RLS sur toute nouvelle table, sans exception
- Gestion des 3 états UI : loading, error, empty
- Pas d'abstraction prématurée (factoriser à partir de 2 occurrences)
- Imports dans l'ordre : next/react → libs externes → @/components → @/lib → @/types → relatifs
```

**`/tm-review` :**

```markdown
# Code review

## Input
Argument : identifiant de la story (ex: E01-S01), "last" pour la dernière, ou rien (review les derniers changements).

## Process
1. Identifier les fichiers à reviewer (story ou git diff)
2. Lire tous les fichiers créés/modifiés
3. Passer CHAQUE point de .tiple/checklists/code-review.md :
   - Pour chaque item : verdict ✅ ou ❌ avec explication si KO
4. Review adversariale :
   - Edge cases non gérés (null, vide, concurrent, permissions)
   - Failles de sécurité (OWASP top 10 : injection, XSS, CSRF, auth bypass)
   - Violations DRY (vérifier le component-registry)
   - Problèmes de performance (N+1 queries, re-renders inutiles, bundles trop gros)
   - Accessibilité (labels, keyboard nav, contrast)
   - Incohérences avec l'architecture
   - Ce qui cassera quand la codebase grandira
5. Si des problèmes trouvés : les lister avec des fix concrets, et les appliquer
6. Si des composants manquent dans le registry : les ajouter
7. Résumer : X items OK, Y items fixés, Z items à discuter
```

**`/tm-evolve` :**

```markdown
# Évolution du PRD — quand le scope change

## Input
L'utilisateur décrit le changement souhaité.

## Process
1. Modifier docs/prd.md — section concernée, statut 🔶 Draft
2. Passer .tiple/checklists/prd-evolution.md point par point :
   - Identifier les impacts sur architecture, epics, stories, design, DB, tests
3. Pour chaque impact identifié :
   - Architecture → mettre à jour docs/architecture.md (+ ADR si invariant touché)
   - Design system → mettre à jour docs/design/system.md si nouveaux patterns/tokens
   - Epics → mettre à jour les fichiers d'epic impactés
   - Stories existantes → créer des stories de refacto si nécessaire
   - Design → signaler si des maquettes sont à créer/mettre à jour
   - DB → estimer les migrations nécessaires
4. Créer les nouvelles stories dans docs/stories/
5. Ajouter une entrée dans docs/changelog.md
6. Résumer tous les changements effectués
```

### 3.3 — Templates de documents

Chaque template est un fichier markdown dans `.tiple/templates/` avec :
- La structure du document (sections, sous-sections)
- Des instructions entre `<!-- -->` pour guider le remplissage
- Des exemples inline quand c'est utile
- Les statuts là où c'est pertinent (PRD)

Les templates doivent être suffisamment détaillés pour qu'un LLM produise un bon document du premier coup, mais pas tellement verbeux qu'ils deviennent du bruit.

#### `brief.tmpl.md`
Sections : Problème, Solution (2-3 phrases), Utilisateurs cibles (personas avec nom/rôle/besoin/frustration), Scope MVP (IN/OUT explicites), Contraintes (techniques, business, légales), Métriques de succès (KPIs concrets), Risques connus.

#### `prd.tmpl.md`
Sections : Vue d'ensemble (résumé exécutif, vision), Personas (enrichis depuis brief), Functional Requirements par domaine (chaque FR a un ID `FR-DOMAINE-01`, description, priorité Must/Should/Could/Won't, acceptance criteria), Non-Functional Requirements (performance, sécurité, accessibilité, RGPD, scalabilité — chaque NFR a un ID `NFR-01`), Epics (liste avec priorité et dépendances inter-epics), Hors scope (explicite), Hypothèses & Risques, Métriques de succès.

Chaque section/feature porte un statut : ✅ Validé, 🔶 Draft, ⬜ Placeholder.

#### `architecture.tmpl.md`
Sections : Vue d'ensemble (diagramme Mermaid haut niveau), Stack technique (tableau pré-rempli depuis tech-stack.md), Structure du projet (arborescence commentée — pré-remplie avec la structure Next.js du scaffolding), Modèle de données (schéma DB avec diagramme Mermaid ER — vide, à remplir par projet), API Design (conventions Server Actions pré-remplies, format de réponse standard), Patterns de code (renvoi vers coding-standards.md et api-patterns.md), Auth & Sécurité (pré-rempli : Supabase Auth + RLS + middleware), Infrastructure & Déploiement (à remplir par projet).

Sections spéciales pré-remplies :
- **Invariants** — Next.js 15 App Router, Supabase (Auth + DB + RLS), TypeScript strict, Server Actions pour mutations, Zod pour validation, migrations SQL versionnées
- **Flexible** — Composants UI (Shadcn/ui par défaut), state management client (aucun par défaut), provider emails, stratégie de cache

#### `epic.tmpl.md`
Sections : Titre + ID, Priorité (P0/P1/P2), Dépendances (autres epics), PRD Refs (IDs des FRs), Objectif (1-2 phrases), Périmètre IN/OUT, Stories prévues (liste numérotée), Design requis (checklist des maquettes nécessaires).

#### `story.tmpl.md`
C'est le template le plus important. Sections :

**Meta** (tableau) : Epic, Status (⬜ Draft / 🟢 Ready / 🔵 In Progress / ✅ Done), Priorité, Design ref, Estimation (S/M/L).

**Contexte** : Pourquoi cette story existe. Refs au PRD (IDs des FRs), à l'architecture (sections), au design (fichier maquette).

**Acceptance Criteria** : Liste de checkboxes en format Given/When/Then.

**Implémentation** : Fichiers à créer (liste), fichiers à modifier (liste), patterns à suivre (refs vers conventions/).

**Tests attendus** : Unit (liste de checkboxes), Integration (liste), E2E (liste).

**Post-implémentation** (rempli après le dev) : Écarts avec le design, écarts avec l'archi (+ ADR si nécessaire), composants créés à ajouter au registry, notes.

#### `adr.tmpl.md`
Sections : Titre + numéro (`ADR-001`), Date, Statut (Proposé/Accepté/Déprécié), Contexte (pourquoi cette décision), Décision (ce qu'on a choisi), Conséquences (ce que ça implique), Alternatives considérées (et pourquoi rejetées).

### 3.4 — Checklists

Chaque checklist est une liste de checkboxes markdown avec des catégories claires. Le contenu exact de chaque checklist est décrit dans le document de méthode (voir le guide Tiple Method livré précédemment). Les checklists à créer :

- `readiness-gate.md` — Catégories : Documents, Cohérence, Conventions, Infra minimale
- `story-ready.md` — Vérifications avant de commencer une story
- `story-done.md` — Vérifications pour considérer une story terminée (tests inclus)
- `code-review.md` — Catégories : DRY & Réutilisation, Qualité du code, Sécurité, Tests, Design & UX, Architecture, Documentation. Inclut des points spécifiques Next.js/Supabase : Server Component vs Client Component justifié, pas de mutation Supabase côté client, RLS policies en place pour les nouvelles tables, schemas Zod partagés (pas de double validation), middleware auth pas contourné, revalidatePath/revalidateTag après mutations
- `prd-evolution.md` — Catégories : Identification du changement, Impact cascade, Compatibility check, Traçabilité

### 3.5 — Conventions pré-remplies (Next.js + Supabase)

Les fichiers de conventions sont pré-remplis avec les bonnes pratiques de la stack Next.js 15 + Supabase. Chaque fichier a des sections `<!-- PERSONNALISER -->` pour les parties spécifiques au projet.

**`tech-stack.md`** — Pré-rempli avec :

| Techno | Version | Rôle | Justification |
|--------|---------|------|---------------|
| Next.js | 15 (App Router) | Framework fullstack | SSR/SSG, Server Components, Server Actions, routing fichiers |
| TypeScript | 5.x (strict mode) | Typage | Sécurité du code, autocomplétion, refactoring |
| Supabase | Cloud | Backend-as-a-Service | Auth, DB PostgreSQL, RLS, Realtime, Storage |
| Tailwind CSS | 4.x | Styling | Utility-first, design system via config, purge auto |
| Shadcn/ui | latest | Composants UI | Copy-paste, personnalisables, accessibles, basés sur Radix |
| Zod | 3.x | Validation | Schemas partagés front/back, inférence TypeScript |
| React Hook Form | 7.x | Formulaires | Performance, intégration Zod via resolver |
| Vitest | latest | Tests unit/integ | Rapide, compatible ESM, API Jest-like |
| Testing Library | latest | Tests composants | Test du comportement user, pas de l'implémentation |
| Playwright | latest | Tests E2E | Cross-browser, fiable, auto-wait |
| pnpm | 9.x | Package manager | Rapide, strict, disk-efficient |

Section `<!-- PERSONNALISER : ajouter les libs spécifiques au projet (ex: @tanstack/query, date-fns, etc.) -->`

**`coding-standards.md`** — Pré-rempli avec les patterns Next.js + Supabase :

```markdown
# Coding Standards — Next.js 15 + Supabase

## Naming
- Fichiers : kebab-case (`user-profile.tsx`, `use-auth.ts`)
- Composants : PascalCase (`UserProfile`, `LoginForm`)
- Variables/fonctions : camelCase
- Types/Interfaces : PascalCase avec suffixe descriptif (`UserRow`, `LoginFormData`)
- Server Actions : camelCase avec suffixe `Action` (`loginAction`, `createProjectAction`)
- Zod schemas : camelCase avec suffixe `Schema` (`loginSchema`, `projectSchema`)

## Structure des fichiers
<!-- NOTE IMPORTANTE POUR CLAUDE CODE :
     Cette section définit où placer chaque type de fichier.
     La LIRE AVANT de créer tout nouveau fichier. -->

src/
├── app/                          # Routes Next.js (App Router)
│   ├── (auth)/                   # Groupe : pages publiques (login, signup)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/              # Groupe : pages authentifiées
│   │   ├── layout.tsx            # Layout avec sidebar, auth check
│   │   ├── page.tsx              # Dashboard home
│   │   └── projects/
│   │       ├── page.tsx          # Liste projets
│   │       └── [id]/page.tsx     # Détail projet
│   ├── api/                      # Route handlers (si nécessaire, préférer Server Actions)
│   ├── layout.tsx                # Root layout (providers, fonts, metadata)
│   └── not-found.tsx
├── components/
│   ├── ui/                       # Composants Shadcn/ui (ne pas modifier directement)
│   ├── shared/                   # Composants métier réutilisables
│   └── [feature]/                # Composants spécifiques à une feature
├── hooks/                        # Custom hooks
├── lib/
│   ├── actions/                  # Server Actions (regroupés par domaine)
│   ├── schemas/                  # Zod schemas (PARTAGÉS front + back)
│   ├── supabase/
│   │   ├── client.ts             # Supabase browser client
│   │   ├── server.ts             # Supabase server client (cookies)
│   │   └── admin.ts              # Supabase service_role (si nécessaire)
│   └── utils/                    # Fonctions utilitaires pures
├── types/                        # Types TypeScript partagés
│   ├── database.ts               # Types générés depuis Supabase (npx supabase gen types)
│   └── index.ts                  # Types métier custom
└── middleware.ts                  # Auth middleware (redirect si non connecté)

## Server Components vs Client Components
- **Par défaut : Server Component** (pas de "use client")
- Passer en Client Component SEULEMENT si : useState, useEffect, event handlers,
  browser APIs, hooks custom qui utilisent du state
- Règle : pousser le "use client" le plus bas possible dans l'arbre
- Pattern : Server Component parent (fetch data) → Client Component enfant (interactivité)

## Server Actions
- Préférer les Server Actions aux API routes pour les mutations
- Toujours valider les inputs avec Zod côté serveur
- Toujours vérifier l'auth en début d'action
- Pattern standard :

  export async function createProjectAction(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non authentifié")

    const parsed = createProjectSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { error: parsed.error.flatten() }

    const { data, error } = await supabase
      .from("projects")
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single()

    if (error) return { error: error.message }
    revalidatePath("/projects")
    return { data }
  }

## Supabase Client
- JAMAIS de client Supabase côté client pour les mutations → Server Actions
- Le browser client est UNIQUEMENT pour : realtime subscriptions, storage uploads, auth listeners
- Le server client (avec cookies) est pour : Server Components (fetch), Server Actions (mutations), Route Handlers
- Le service_role client est UNIQUEMENT pour : les opérations admin qui bypass RLS (cron jobs, webhooks)

## DRY
- Schemas Zod : UN schema par entité dans lib/schemas/, utilisé par le form ET par l'action
- Types : générés depuis Supabase (database.ts), enrichis dans types/index.ts
- Composants : vérifier component-registry.md AVANT de créer
- Factoriser à partir de 2 occurrences, pas avant (pas d'abstraction prématurée)

## Imports
- Alias : @/ pointe vers src/
- Ordre : 1) next/ react 2) libs externes 3) @/components 4) @/lib 5) @/types 6) relatifs

## Error Handling
- Jamais de catch vide
- Server Actions retournent { data } ou { error } — jamais de throw côté client
- Composants UI : toujours gérer loading + error + empty states
- Supabase : toujours vérifier le .error de la réponse
```

Section `<!-- PERSONNALISER : ajouter les conventions spécifiques au projet -->`

**`testing-strategy.md`** — Pré-rempli avec :

```markdown
# Stratégie de Tests — Next.js + Supabase

## Setup
- vitest.config.ts avec @vitejs/plugin-react, resolve alias @/
- @testing-library/react + @testing-library/jest-dom
- Playwright installé avec npx playwright install

## Unit Tests (Vitest)
- Quoi : Server Actions (mock Supabase), Zod schemas (edge cases), hooks custom, utils
- Où : tests/unit/ ou colocalisés (fichier.test.ts à côté du fichier)
- Mock Supabase : vi.mock("@/lib/supabase/server") → retourner des réponses fake
- Couverture cible : >80% sur lib/actions/ et lib/schemas/

## Integration Tests (Vitest + Testing Library)
- Quoi : Composants form complets (render → fill → submit → vérifier résultat)
- Mock : Supabase client mocké, Server Actions mockées pour les tests composants
- Où : tests/integration/

## E2E Tests (Playwright)
- Quoi : Parcours critiques uniquement (login, CRUD principal, parcours de valeur core)
- Env : Supabase local (npx supabase start) ou projet staging dédié
- Seed : Script de seed pour données de test reproductibles
- Où : tests/e2e/
- Convention : un fichier par feature (auth.spec.ts, projects.spec.ts)

## Non-régression
- Avant chaque merge : TOUS les tests existants doivent passer
- CI minimale : pnpm test (unit + integ) sur chaque push
- E2E : avant chaque mise en prod (pas sur chaque push)

## Ce qu'on ne teste PAS
- Les composants Shadcn/ui (déjà testés en amont)
- Le CSS / le rendu pixel-perfect (les tests e2e vérifient les flows, pas le style)
- Les fonctions Supabase internes (RLS, triggers) → testées via l'app, pas en isolation
```

**`component-registry.md`** — Pré-seedé avec les composants de base :

```markdown
# Component Registry

> Dernière MAJ : [date init]
> VÉRIFIER ce fichier AVANT de créer un composant/hook/util.

## UI Components (Shadcn/ui — installés à la demande)
| Composant | Path | Notes |
|-----------|------|-------|
<!-- Les composants Shadcn sont ajoutés via `npx shadcn@latest add [nom]`.
     Lister ici ceux qui ont été installés dans le projet. -->

## Composants métier partagés
| Composant | Path | Props clés | Notes |
|-----------|------|------------|-------|
<!-- Ajouter ici chaque composant métier réutilisable créé -->

## Hooks
| Hook | Path | Retourne | Notes |
|------|------|----------|-------|
<!-- Ajouter ici chaque hook custom créé -->

## Server Actions
| Action | Path | Input → Output | Notes |
|--------|------|-----------------|-------|
<!-- Ajouter ici chaque Server Action créée -->

## Shared Schemas (Zod)
| Schema | Path | Champs clés | Utilisé par |
|--------|------|-------------|-------------|
<!-- Ajouter ici chaque schema Zod partagé front/back -->

## Utils
| Util | Path | Usage |
|------|------|-------|
| cn | src/lib/utils/cn.ts | Merge Tailwind classes (clsx + tailwind-merge) |
<!-- Ajouter les autres utils ici -->

## Types partagés
| Type | Path | Usage |
|------|------|-------|
| Database | src/types/database.ts | Types auto-générés Supabase (npx supabase gen types) |
<!-- Ajouter les types métier custom ici -->
```

**`api-patterns.md`** — Pré-rempli avec les patterns Next.js + Supabase :

```markdown
# API Patterns — Next.js Server Actions + Supabase

## Principe : Server Actions > Route Handlers
Utiliser les Server Actions pour toutes les mutations.
Les Route Handlers (app/api/) sont réservés aux : webhooks externes, cron jobs, intégrations tierces qui doivent appeler une URL.

## Pattern Server Action standard

### Structure
Chaque fichier dans lib/actions/ regroupe les actions d'un domaine.
Chaque action :
1. Vérifie l'auth
2. Valide l'input (Zod)
3. Exécute la mutation (Supabase)
4. Revalide le cache (revalidatePath/revalidateTag)
5. Retourne { data } ou { error }

### Retour standard
type ActionResult<T> = { data: T; error?: never } | { data?: never; error: string }

JAMAIS de throw dans une Server Action appelée par un formulaire.
Le throw est réservé aux cas critiques (auth manquante = redirect, pas throw).

## Pattern Form
1. Schema Zod dans lib/schemas/ (1 schema = 1 form = 1 action)
2. Composant form avec React Hook Form + zodResolver
3. Server Action qui revalide le même schema côté serveur
4. Le composant gère : loading (pending), error (affichage inline), success (redirect ou toast)

## Pattern Fetch (Server Components)
Les données sont fetchées dans les Server Components, pas dans les Client Components.

  // app/(dashboard)/projects/page.tsx
  export default async function ProjectsPage() {
    const supabase = await createClient()
    const { data: projects } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })

    return <ProjectList projects={projects ?? []} />
  }

Le Client Component reçoit les données en props. Il ne fetch pas.

## Auth Pattern
### Middleware (src/middleware.ts)
- Vérifie la session Supabase sur chaque requête
- Redirige vers /login si non authentifié sur les routes protégées
- Rafraîchit le token si expiré
- Matcher : exclure les routes publiques, les assets, les API webhooks

### Dans les Server Actions
Toujours revérifier l'auth (le middleware ne suffit pas, on peut appeler une action directement) :
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

### Supabase RLS
Toute table a des RLS policies activées. Le dev ne bypass JAMAIS RLS sauf avec le service_role client dans des cas documentés (ADR).

## Error Handling
### Codes d'erreur
- AUTH_REQUIRED : utilisateur non connecté
- VALIDATION_ERROR : input invalide (retourner les détails Zod)
- NOT_FOUND : ressource inexistante
- FORBIDDEN : pas les droits
- INTERNAL_ERROR : erreur inattendue (logger côté serveur, message générique côté client)

### Messages user-friendly
Ne JAMAIS exposer les messages d'erreur Supabase bruts au client.
Mapper vers des messages en français compréhensibles.

<!-- PERSONNALISER : ajouter les patterns spécifiques au projet -->
```

### 3.6 — Scaffolding Next.js + Supabase

Le template inclut un scaffolding minimal de la stack pour que Claude Code n'ait pas à deviner la structure. Ce n'est PAS un starter kit complet — c'est la structure de dossiers + les fichiers de config + les fichiers critiques qui doivent exister dès le départ.

**Fichiers de config inclus :**

```
next.config.ts               # Config Next.js minimale
tsconfig.json                # TypeScript strict, alias @/ → src/
tailwind.config.ts           # Config Tailwind avec le thème du design system
postcss.config.js            # PostCSS standard
package.json                 # Dépendances de base (next, react, supabase, shadcn deps, zod, rhf, vitest, playwright)
pnpm-lock.yaml               # Lock file
vitest.config.ts             # Config Vitest avec aliases
playwright.config.ts         # Config Playwright de base
components.json              # Config Shadcn/ui
.env.example                 # Variables d'environnement requises (avec commentaires)
```

**Structure src/ initiale (fichiers vides ou minimaux) :**

```
src/
├── app/
│   ├── layout.tsx            # Root layout minimal (html, body, fonts, metadata)
│   ├── page.tsx              # Page d'accueil redirect vers /login ou /dashboard
│   ├── not-found.tsx         # Page 404
│   ├── globals.css           # Import Tailwind + variables CSS design system
│   ├── (auth)/
│   │   └── layout.tsx        # Layout centré pour pages d'auth
│   └── (dashboard)/
│       └── layout.tsx        # Layout avec sidebar pour pages authentifiées
├── components/
│   └── ui/                   # Dossier Shadcn/ui (vide, on ajoute à la demande)
├── hooks/
│   └── .gitkeep
├── lib/
│   ├── actions/
│   │   └── .gitkeep
│   ├── schemas/
│   │   └── .gitkeep
│   ├── supabase/
│   │   ├── client.ts         # createBrowserClient() — client-side
│   │   └── server.ts         # createServerClient() — server-side avec cookies
│   └── utils/
│       └── cn.ts             # clsx + tailwind-merge
├── types/
│   ├── database.ts           # Placeholder (régénéré via npx supabase gen types)
│   └── index.ts              # Types métier (vide)
└── middleware.ts              # Auth middleware Supabase (fonctionnel dès le départ)
```

**Supabase local :**

```
supabase/
├── config.toml               # Config Supabase locale
├── migrations/
│   └── .gitkeep              # Les migrations SQL vivent ici
└── seed.sql                  # Seed data pour dev/test (vide, structure commentée)
```

**Points critiques du scaffolding :**

1. **`middleware.ts` doit être fonctionnel** — C'est le premier truc qui casse si mal configuré. Inclure le code de refresh de session + redirect Supabase Auth.
2. **`lib/supabase/client.ts` et `server.ts`** — Les deux clients Supabase doivent être configurés correctement (le server client avec les cookies Next.js). C'est du boilerplate mais c'est le #1 piège.
3. **`.env.example`** — Doit lister toutes les variables requises :
   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # JAMAIS côté client

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
4. **`package.json` scripts** — Doit inclure les scripts essentiels :
   ```json
   {
     "dev": "next dev --turbopack",
     "build": "next build",
     "start": "next start",
     "lint": "next lint",
     "type-check": "tsc --noEmit",
     "test": "vitest run",
     "test:watch": "vitest",
     "test:e2e": "playwright test",
     "db:types": "npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/database.ts",
     "db:migrate": "npx supabase migration new",
     "db:push": "npx supabase db push",
     "db:reset": "npx supabase db reset"
   }
   ```

### 3.7 — Fichiers docs initiaux (stubs)

Chaque fichier dans `docs/` est un placeholder minimal qui :
- Explique ce qu'il contiendra (1-2 lignes)
- Pointe vers le template correspondant
- Indique quelle commande utiliser pour le remplir

Exemple `docs/brief.md` :

```markdown
# Brief Produit

> Ce fichier sera généré par la commande `/tm-plan` (phase 1).
> Template : .tiple/templates/brief.tmpl.md
```

`docs/changelog.md` a un format spécifique (mis à jour automatiquement à chaque commit) :

```markdown
# Changelog

<!-- Ce fichier est mis à jour automatiquement à chaque commit.
     Format de chaque entrée :

## [Date] — [Scope]
**Quoi :** Ce qui a été fait
**Pourquoi :** La raison / la story / le bug
**Problèmes :** Ce qui a bloqué et comment c'a été résolu (si applicable)
**Fichiers :** Liste des fichiers créés/modifiés
-->
```

### 3.8 — README.md

Le README du template explique :
1. Ce qu'est la Tiple Method (3 phrases)
2. Comment démarrer (clone, personnaliser CLAUDE.md, `pnpm install`, `pnpm dev`)
3. Le workflow en un schéma ASCII (2 phases : `/tm-plan` une fois → `/tm-dev` en boucle)
4. La liste des 6 commandes `/tm-*` avec description et usage
5. Les 3 cas d'usage quotidiens : story planifiée, bugfix, amélioration
6. La structure des dossiers
7. Le lien vers le guide complet de la méthode (si on le publie)

### 3.9 — .gitignore

Ignorer :
- `node_modules/`
- `.env`, `.env.local`, `.env.*.local`
- `.next/`, `dist/`, `build/`
- `.DS_Store`
- `*.log`
- `.supabase/` (runtime local Supabase, pas les configs)
- `test-results/`, `playwright-report/`

Ne PAS ignorer :
- `.tiple/` (c'est la méthode, ça doit être versionné)
- `docs/` (c'est la source de vérité, ça doit être versionné)
- `.claude/` (les commandes Claude Code)
- `supabase/` (config + migrations, ça doit être versionné)
- `.env.example` (template des variables)

---

## 4. Contraintes techniques

- **Stack figée : Next.js 15 + Supabase + TypeScript + Tailwind + Shadcn/ui.** C'est notre stack standard pour tous les projets clients. Le template reflète cette stack. Si un projet nécessite une stack différente, on forke le template.
- **Scaffolding fonctionnel.** Après `git clone` + `pnpm install` + copie de `.env.example` en `.env.local` + remplissage des clés Supabase, le projet doit se lancer avec `pnpm dev` sans erreur. Le middleware auth, les clients Supabase, et le layout de base doivent fonctionner out-of-the-box.
- **Claude Code natif.** Tout passe par CLAUDE.md + slash commands. Pas de framework externe, pas de BMAD, pas d'outil tiers.
- **Langue : français.** Les templates, checklists, et le CLAUDE.md sont en français. Le code et les noms de fichiers restent en anglais.
- **Supabase migrations versionnées.** Le dossier `supabase/migrations/` est versionné dans Git. Chaque changement de schéma DB = un fichier de migration SQL daté. Jamais de modification manuelle de la DB en prod sans migration.

---

## 5. Structure de fichiers cible

```
tiple-method-template/
├── README.md
├── .gitignore
├── CLAUDE.md
├── .env.example
│
├── .claude/
│   └── commands/
│       ├── tm-plan.md                 # Cadrage complet (brief→PRD→archi→design→stories→gate)
│       ├── tm-dev.md                  # Implémenter (story ou mode libre)
│       ├── tm-review.md              # Code review + review adversariale
│       ├── tm-evolve.md              # Évolution PRD + cascade impacts
│       ├── tm-status.md              # Sprint status
│       └── tm-sprint.md              # Nouveau sprint
│
├── docs/
│   ├── brief.md                    # Stub
│   ├── prd.md                      # Stub
│   ├── architecture.md             # Stub
│   ├── changelog.md                # Vide avec structure
│   ├── design/
│   │   ├── system.md               # Template design system
│   │   ├── flows/
│   │   │   └── .gitkeep
│   │   └── screens/
│   │       └── .gitkeep
│   ├── epics/
│   │   ├── _index.md               # Stub
│   │   └── .gitkeep
│   ├── stories/
│   │   └── .gitkeep
│   └── decisions/
│       └── .gitkeep
│
├── .tiple/
│   ├── templates/
│   │   ├── brief.tmpl.md
│   │   ├── prd.tmpl.md
│   │   ├── architecture.tmpl.md
│   │   ├── epic.tmpl.md
│   │   ├── story.tmpl.md
│   │   └── adr.tmpl.md
│   ├── checklists/
│   │   ├── readiness-gate.md
│   │   ├── story-ready.md
│   │   ├── story-done.md
│   │   ├── code-review.md
│   │   └── prd-evolution.md
│   ├── conventions/
│   │   ├── coding-standards.md     # Pré-rempli Next.js + Supabase
│   │   ├── tech-stack.md           # Pré-rempli avec la stack complète
│   │   ├── testing-strategy.md     # Pré-rempli Vitest + Playwright
│   │   ├── component-registry.md   # Pré-seedé avec cn + Database types
│   │   └── api-patterns.md         # Pré-rempli Server Actions + Supabase
│   └── sprint/
│       └── status.md               # Template sprint status
│
├── package.json                    # Next.js 15, React, Supabase, Zod, RHF, Vitest, Playwright
├── pnpm-lock.yaml
├── next.config.ts
├── tsconfig.json                   # Strict, alias @/ → src/
├── tailwind.config.ts
├── postcss.config.js
├── vitest.config.ts
├── playwright.config.ts
├── components.json                 # Shadcn/ui config
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (providers, fonts, metadata)
│   │   ├── page.tsx                # Redirect vers /login ou /dashboard
│   │   ├── not-found.tsx           # 404
│   │   ├── globals.css             # Tailwind imports + CSS variables
│   │   ├── (auth)/
│   │   │   └── layout.tsx          # Layout centré pages d'auth
│   │   └── (dashboard)/
│   │       └── layout.tsx          # Layout sidebar pages authentifiées
│   ├── components/
│   │   └── ui/                     # Shadcn/ui (vide, ajout à la demande)
│   ├── hooks/
│   │   └── .gitkeep
│   ├── lib/
│   │   ├── actions/
│   │   │   └── .gitkeep
│   │   ├── schemas/
│   │   │   └── .gitkeep
│   │   ├── supabase/
│   │   │   ├── client.ts           # Supabase browser client
│   │   │   └── server.ts           # Supabase server client (cookies)
│   │   └── utils/
│   │       └── cn.ts               # clsx + tailwind-merge
│   ├── types/
│   │   ├── database.ts             # Placeholder (régénéré via Supabase CLI)
│   │   └── index.ts                # Types métier (vide)
│   └── middleware.ts               # Auth middleware Supabase (fonctionnel)
│
├── supabase/
│   ├── config.toml                 # Config Supabase locale
│   ├── migrations/
│   │   └── .gitkeep
│   └── seed.sql                    # Seed data (vide, structure commentée)
│
└── tests/
    ├── unit/
    │   └── .gitkeep
    ├── integration/
    │   └── .gitkeep
    └── e2e/
        └── .gitkeep
```

Total : **~55 fichiers** à créer.

---

## 6. Epics

### E01 — Fondation (structure + CLAUDE.md + README + .gitignore) `P0`
La structure de dossiers complète, le CLAUDE.md avec les règles Next.js/Supabase, les stubs docs, le README, le .gitignore, le .env.example.
Dépendances : aucune.

### E02 — Scaffolding Next.js + Supabase `P0`
Tous les fichiers de config (package.json, tsconfig, tailwind, vitest, playwright, components.json, supabase/config.toml), la structure src/ initiale, les clients Supabase (client.ts, server.ts), le middleware auth, le root layout, cn.ts, globals.css, les layouts auth/dashboard.
Dépendances : E01.

### E03 — Templates de documents `P0`
Les 6 fichiers `.tiple/templates/*.tmpl.md`.
Dépendances : E01.

### E04 — Checklists `P0`
Les 5 fichiers `.tiple/checklists/*.md`. La code-review checklist doit inclure des points spécifiques Next.js/Supabase (Server Component vs Client Component, RLS, etc.).
Dépendances : E01.

### E05 — Conventions `P0`
Les 5 fichiers `.tiple/conventions/*.md` pré-remplis avec les patterns Next.js + Supabase détaillés dans ce PRD.
Dépendances : E01.

### E06 — Slash Commands `P0`
Les 6 fichiers `.claude/commands/tm-*.md`. `/tm-plan` est la commande de cadrage (fusionne brief+PRD+archi+design+stories+gate). `/tm-dev` est la commande quotidienne (story + mode libre pour bugs/améliorations, avec changelog à chaque commit). `/tm-review` fait la review adversariale. `/tm-evolve` gère les changements de scope.
Dépendances : E03, E04, E05 (les commandes référencent les templates, checklists, et conventions).

### E07 — Validation end-to-end `P1`
Vérifier que le template fonctionne : `git clone` → `pnpm install` → `pnpm dev` démarre sans erreur → les slash commands fonctionnent → pas d'incohérence entre les fichiers. Test sur un projet fictif minimal.
Dépendances : E01-E06 toutes.

---

## 7. Hors scope

- Pas de pages/features pré-construites (pas de login page, pas de dashboard, etc. — juste les layouts vides)
- Pas de CI/CD (chaque projet configure la sienne)
- Pas de Graybox (outil séparé)
- Pas de documentation de la méthode elle-même (le guide complet est un document séparé)
- Pas de multilingue (français uniquement pour cette V1)
- Pas de tooling automatisé (scripts d'init, CLI, etc.)
- Pas de Supabase Edge Functions dans le scaffolding (ajoutées par projet)
- Pas de provider email/payment pré-configuré

---

## 8. Risques

| Risque | Impact | Mitigation |
|--------|--------|------------|
| CLAUDE.md trop long → Claude Code ignore des parties | Élevé | Garder le CLAUDE.md < 150 lignes. Les règles Next.js/Supabase (section 3.1.2) sont le seul ajout technique inline — le reste pointe vers les fichiers conventions/ |
| Templates trop prescriptifs → rigides pour certains projets | Moyen | Sections `<!-- PERSONNALISER -->` explicites. Garder les templates comme guides, pas comme formulaires |
| Slash commands mal comprises → mauvais usage | Faible | 6 commandes seulement. 2 au quotidien (/tm-dev, /tm-status). README avec cas d'usage concrets |
| Les checklists sont ignorées en pratique | Moyen | Les intégrer dans les slash commands (`/tm-dev` appelle automatiquement la story-ready checklist) |
| Dépendances npm obsolètes dans package.json | Moyen | Lister les versions majeures uniquement (ex: `"next": "^15"` pas `"15.1.3"`). Mettre à jour le template tous les trimestres |
| Supabase clients mal configurés → bugs auth subtils | Élevé | Le scaffolding inclut les clients fonctionnels testés. Le middleware est pré-écrit. Documenter les pièges connus dans coding-standards.md |
| Conventions trop spécifiques → bloquantes sur des cas edge | Faible | Les conventions sont des guidelines, pas des lois. La section `<!-- PERSONNALISER -->` et les ADRs permettent de dévier quand justifié |
