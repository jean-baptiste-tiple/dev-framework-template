# Tiple Method Template

Template Git réutilisable pour bootstrapper un projet avec la Tiple Method. Contient toute la structure, les templates de documents, les checklists, les conventions, et les slash commands Claude Code. Pré-configuré pour la stack Next.js 15 + Supabase + TypeScript + Tailwind CSS + Shadcn/ui.

## Design System

Un design system **violet corporate** complet est inclus, prêt à l'emploi :

- **Thème :** Violet profond corporate avec dark mode (class-based, next-themes)
- **34 composants Shadcn/ui** installés (style new-york) dans `src/components/ui/`
- **6 composants métier** : PageContainer, EmptyState, StatCard, DataTable, ThemeToggle, ThemeProvider
- **Preview interactive** : route `/design-system` pour voir tous les composants
- **Tokens complets** : couleurs (oklch), typographie (Inter), spacing, radius, shadows
- **Documentation** : `docs/design/system.md`

### Pages Auth incluses

| Route | Description |
|-------|-------------|
| `/login` | Connexion email/password |
| `/signup` | Inscription avec confirmation |
| `/forgot-password` | Demande de réinitialisation |
| `/reset-password` | Nouveau mot de passe |
| `/auth/callback` | Callback Supabase (email confirm, password reset) |

Server actions dans `src/lib/actions/auth.ts` : `login`, `signup`, `forgotPassword`, `resetPassword`, `logout`.

## Quick Start

```bash
# 1. Cloner le template
git clone <url-du-template> mon-projet
cd mon-projet

# 2. Installer les dépendances
pnpm install

# 3. Configurer l'environnement
cp .env.example .env.local
# Remplir les variables Supabase dans .env.local

# 4. Lancer le dev server
pnpm dev
```

## Commandes

3 slash commands principales + 2 commandes de qualité :

| Commande | Usage | Description |
|----------|-------|-------------|
| `/tm-plan` | Nouveau projet ou feature | Cadrage complet : brief → PRD → architecture → design → epics/stories → gate |
| `/tm-dev` | Implémentation | `E01-S01` (story), `next` (prochaine 🟢 Ready), ou sans arg (mode libre) |
| `/tm-fix` | Bug fix / petite modif | Correction rapide avec chargement auto des conventions par tags |
| `/tm-verify` | Vérification triple | `pnpm type-check` + `pnpm lint` + `pnpm test` (obligatoire avant review) |
| `/tm-review` | Code review agent isolé | Agent autonome séparé passe `code-review.md` point par point |

## Structure

```
├── CLAUDE.md                    # Instructions Claude Code (Tiple Method)
├── .claude/commands/            # 5 slash commands : /tm-plan, /tm-dev, /tm-fix, /tm-verify, /tm-review
├── .tiple/
│   ├── templates/               # 6 templates de documents
│   ├── checklists/              # 5 checklists quality gates
│   ├── conventions/             # Conventions techniques par tags (22 fichiers, voir _index.md)
│   └── sprint/status.md         # Sprint tracking
├── docs/
│   ├── brief.md                 # Brief produit
│   ├── prd.md                   # PRD
│   ├── architecture.md          # Architecture technique
│   ├── changelog.md             # Journal des évolutions
│   ├── design/                  # Design system, maquettes, flows
│   ├── epics/                   # Epics détaillées
│   ├── stories/                 # Stories implémentables
│   └── decisions/               # ADRs (Architecture Decision Records)
├── src/
│   ├── app/
│   │   ├── (auth)/              # Pages auth (login, signup, forgot/reset password)
│   │   ├── (dashboard)/         # Layout dashboard protégé
│   │   ├── auth/callback/       # Callback Supabase
│   │   └── design-system/       # Preview du design system
│   ├── components/
│   │   ├── ui/                  # 34 composants Shadcn/ui
│   │   ├── theme-provider.tsx   # Provider next-themes
│   │   ├── theme-toggle.tsx     # Toggle light/dark
│   │   ├── page-container.tsx   # Wrapper page
│   │   ├── empty-state.tsx      # État vide
│   │   ├── stat-card.tsx        # Card KPI
│   │   └── data-table.tsx       # Table générique
│   ├── lib/
│   │   ├── actions/auth.ts      # Server actions auth
│   │   ├── supabase/            # Clients Supabase (browser + server)
│   │   └── utils/cn.ts          # Tailwind class merge
│   └── middleware.ts            # Auth middleware
├── supabase/                    # Config + migrations Supabase
└── tests/                       # Unit, integration, e2e
```

## Personnaliser le template

Après le clone, modifier :

1. **`CLAUDE.md`** — Section "Projet" : nom et description
2. **`.env.local`** — Variables Supabase (URL, clés) + `NEXT_PUBLIC_SITE_URL`
3. **`docs/design/system.md`** — Ajuster les tokens si besoin (couleurs, radius)
4. **`.tiple/conventions/tech-stack.md`** — Ajouter les libs spécifiques
5. **`package.json`** — Nom du projet, dépendances spécifiques

Puis lancer `/tm-plan` pour démarrer la phase de cadrage.

## Conventions par tags

Les conventions techniques sont dans `.tiple/conventions/` et chargées **automatiquement** selon le contexte :

- **Base (toujours chargées)** : `coding-standards.md`, `component-registry.md`, `tech-stack.md`
- **Par tags** : chaque story déclare ses tags (ex: `auth`, `database`, `api`) → les fichiers de conventions correspondants sont chargés automatiquement
- **Index** : `.tiple/conventions/_index.md` liste tous les tags disponibles et les fichiers associés

**Chargement selon le mode :**

| Mode | Chargement des conventions |
|------|----------------------------|
| `/tm-dev E01-S01` | Tags déclarés dans le champ `Conventions` de la story |
| `/tm-dev` (libre) | Tags déduits des fichiers touchés (ex: `lib/actions/` → `api`) |
| `/tm-fix` | Même déduction automatique que le mode libre |

Tags disponibles : `auth`, `database`, `supabase`, `api`, `forms`, `realtime`, `security`, `nextjs`, `typescript`, `state`, `feedback`, `performance`, `tables`, `uploads`, `seo`, `a11y`, `i18n`, `datetime`, `monitoring`, `flags`, `deploy`, `testing`

## CI/CD

La CI est configurée via `.github/workflows/ci.yml` et s'exécute automatiquement sur chaque push :
- **Type check** (`pnpm type-check`)
- **Lint** (`pnpm lint`)
- **Tests unitaires & intégration** (`pnpm test`)

Le déploiement Vercel est automatique (connecter le repo). Pour Supabase, utiliser `supabase db push` qui applique uniquement les nouvelles migrations.

---

## Workflows détaillés

### Workflow A — Nouveau projet (`/tm-plan`)

Ce workflow se fait une seule fois, au démarrage du projet. `/tm-plan` orchestre toutes les phases en une seule conversation continue.

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 0 — Setup                                        │
├─────────────────────────────────────────────────────────┤
│  1. git clone <template> mon-projet && cd mon-projet    │
│  2. pnpm install                                        │
│  3. cp .env.example .env.local → remplir les clés       │
│  4. Éditer CLAUDE.md → section "Projet" (nom + desc)    │
│  5. pnpm dev → vérifier que ça tourne                   │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  /tm-plan — Cadrage complet (phases 1 à 6)              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Phase 1 — Brief                                        │
│    Discussion interactive : problème, personas, scope    │
│    → docs/brief.md                                      │
│                                                          │
│  Phase 2 — PRD                                          │
│    FRs par parcours, NFRs, epics identifiées             │
│    → docs/prd.md                                        │
│                                                          │
│  Phase 3 — Architecture                                 │
│    Modèle de données, RLS, Server Actions                │
│    → docs/architecture.md                               │
│                                                          │
│  Phase 4 — Design                                       │
│    Valider tokens, JSX, composants partagés              │
│    → docs/design/                                       │
│                                                          │
│  Phase 5 — Epics & Stories                              │
│    Découper en stories 🟢 Ready avec tags Conventions    │
│    → docs/epics/ + docs/stories/                        │
│                                                          │
│  Phase 6 — Gate                                         │
│    Passe readiness-gate.md → prêt à coder               │
│                                                          │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Sprint & Dev (`/tm-dev`)                                │
├─────────────────────────────────────────────────────────┤
│  Boucler sur chaque story :                              │
│    /tm-dev E0X-S0X (ou /tm-dev next)                    │
│      → lit story + archi + conventions par tags          │
│      → implémente : Zod → actions → tests → UI → page   │
│      → vérification triple :                             │
│          pnpm type-check + pnpm lint + pnpm test         │
│      → code review par agent isolé :                     │
│          .tiple/checklists/code-review.md point par point│
│      → si problèmes HAUTE/MOYENNE : fix + re-verify     │
│      → MAJ story, registry, sprint status, changelog     │
│                                                          │
│  Répéter /tm-dev jusqu'à sprint terminé.                │
└─────────────────────────────────────────────────────────┘
```

### Workflow B — Nouvelle feature (`/tm-plan` + `/tm-dev`)

Une feature = un changement fonctionnel significatif qui nécessite une ou plusieurs stories.

```
1. Si la feature modifie le PRD existant :
   → Mettre à jour docs/prd.md (section concernée → 🔶)
   → Passer .tiple/checklists/prd-evolution.md
   → Cascade : MAJ architecture, epics, stories si besoin
   → Entrée dans docs/changelog.md

2. Créer les stories
   → /tm-plan (relancer pour le cadrage de la feature)
   → Ou créer manuellement dans docs/stories/ depuis le template

3. Implémenter story par story
   └─ /tm-dev E0X-S0X
       → Charge conventions par tags de la story
       → Zod schemas → Server Actions → tests unit
       → composants UI → tests unit UI → page → tests integ
       → vérification triple : type-check + lint + test
       → code review par agent isolé (regard neuf)
       → si problèmes HAUTE/MOYENNE : fix + re-verify
       → MAJ story + registry + sprint status + changelog

4. Vérifier
   └─ pnpm type-check && pnpm lint && pnpm test → tout passe
```

### Workflow C — Bug fix (`/tm-fix` ou `/tm-dev`)

Pour les corrections de bugs, ajustements UI, ou modifications mineures. Deux modes :

**Bug significatif** (avec story) :
```
1. Créer une story dans docs/stories/ :
   - Conventions : tags pertinents (ex: api, database)
   - AC : Given/When/Then
   - Tests : le test qui couvre le cas corrigé

2. /tm-dev E0X-S0X
   → Charge conventions par tags de la story
   → Test red → fix → test green
   → Vérification triple : type-check + lint + test
   → Code review par agent isolé (focus bug fix)
   → Si problèmes HAUTE/MOYENNE : fix + re-verify
   → MAJ story + sprint status + changelog
```

**Modification mineure** (sans story) :
```
/tm-fix → décris le problème
   → Déduit les tags depuis les fichiers touchés
   → Charge les conventions pertinentes automatiquement
   → Corrige + tests
   → Vérification triple : type-check + lint + test
   → Code review par agent isolé
   → Changelog
```
