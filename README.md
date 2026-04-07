# Tiple Method Template

Template Git réutilisable pour bootstrapper un projet avec la Tiple Method. Contient toute la structure, les templates de documents, les checklists, les conventions, et les slash commands Claude Code. Stack de base : Next.js 15 + TypeScript + Tailwind CSS + Shadcn/ui. Backend optionnel via starters (Supabase + Auth).

## Design System

Un design system **violet corporate** complet est inclus, prêt à l'emploi :

- **Thème :** Violet profond corporate avec dark mode (class-based, next-themes)
- **34 composants Shadcn/ui** installés (style new-york) dans `src/components/ui/`
- **6 composants métier** : PageContainer, EmptyState, StatCard, DataTable, ThemeToggle, ThemeProvider
- **Preview interactive** : route `/design-system` pour voir tous les composants
- **Tokens complets** : couleurs (oklch), typographie (Inter), spacing, radius, shadows
- **Documentation** : `docs/design/system.md`

## Starters

Le template est minimal par défaut. Les starters dans `.tiple/starters/` ajoutent des fonctionnalités complètes. Ils sont activés automatiquement par `/tm-plan` (Phase 0) selon les besoins du projet.

| Starter | Dossier | Ce qu'il ajoute |
|---------|---------|-----------------|
| **Supabase + Auth** | `.tiple/starters/supabase-auth/` | Base de données, auth (login/signup/reset), middleware, Server Actions, pages auth, CI migrations |

## Quick Start

```bash
# 1. Cloner le template
git clone <url-du-template> mon-projet
cd mon-projet

# 2. Installer les dépendances
pnpm install

# 3. Lancer le dev server
pnpm dev

# 4. Lancer le cadrage (active les starters si besoin)
# /tm-plan dans Claude Code
```

## Commandes

| Commande | Usage | Description |
|----------|-------|-------------|
| `/tm-plan` | Nouveau projet ou feature | Cadrage complet : starters → brief → PRD → architecture → design → epics/stories → gate |
| `/tm-dev` | Implémentation | `E01-S01` (story), `next` (prochaine 🟢 Ready), ou sans arg (mode libre) |
| `/tm-fix` | Bug fix / petite modif | Correction rapide avec chargement auto des conventions par tags |
| `/tm-verify` | Vérification triple | `pnpm type-check` + `pnpm lint` + `pnpm test` (obligatoire avant review) |
| `/tm-review` | Code review agent isolé | Agent autonome séparé passe `code-review.md` point par point |

## Structure

```
├── CLAUDE.md                    # Instructions Claude Code (Tiple Method)
├── .claude/commands/            # 5 slash commands
├── .tiple/
│   ├── templates/               # 6 templates de documents
│   ├── checklists/              # 5 checklists quality gates
│   ├── conventions/             # Conventions techniques par tags (22 fichiers)
│   ├── starters/                # Starters optionnels (supabase-auth, ...)
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
│   │   ├── (dashboard)/         # Layout principal + page placeholder
│   │   └── design-system/       # Preview du design system
│   ├── components/
│   │   ├── ui/                  # 34 composants Shadcn/ui
│   │   └── ...                  # Composants métier (PageContainer, EmptyState, etc.)
│   └── lib/
│       └── utils/cn.ts          # Tailwind class merge
└── tests/                       # Unit, integration, e2e
```

## Personnaliser le template

Après le clone :

1. **`CLAUDE.md`** — Section "Projet" : nom et description
2. **`docs/design/system.md`** — Ajuster les tokens si besoin (couleurs, radius)
3. **`.tiple/conventions/tech-stack.md`** — Ajouter les libs spécifiques
4. **`package.json`** — Nom du projet

Puis lancer `/tm-plan` pour démarrer la phase de cadrage (qui activera les starters si nécessaire).

## Conventions par tags

Les conventions techniques sont dans `.tiple/conventions/` et chargées **automatiquement** selon le contexte :

- **Base (toujours chargées)** : `coding-standards.md`, `component-registry.md`, `tech-stack.md`
- **Par tags** : chaque story déclare ses tags (ex: `auth`, `database`, `api`) → les fichiers correspondants sont chargés
- **Index** : `.tiple/conventions/_index.md`

| Mode | Chargement des conventions |
|------|----------------------------|
| `/tm-dev E01-S01` | Tags déclarés dans le champ `Conventions` de la story |
| `/tm-dev` (libre) | Tags déduits des fichiers touchés (ex: `lib/actions/` → `api`) |
| `/tm-fix` | Même déduction automatique que le mode libre |

## CI/CD

La CI est configurée via `.github/workflows/ci.yml` et s'exécute sur chaque push :
- **Type check** (`pnpm type-check`)
- **Lint** (`pnpm lint`)
- **Tests unitaires & intégration** (`pnpm test`)

Le déploiement Vercel est automatique (connecter le repo). La CI migrations Supabase est ajoutée par le starter si activé.
