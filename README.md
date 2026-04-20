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
| `/tm-plan` | Cadrage initial **OU** évolution (V2, V3...) | Cadrage complet : starters → brief → PRD → architecture → design → epics/stories → gate. Détecte auto le mode initial vs évolution. |
| `/tm-dev` | Implémentation | `E01-S01` (story), `next` (prochaine 🟢 Ready), ou sans arg (mode libre) |
| `/tm-fix` | Bug fix / petite modif | Correction rapide avec chargement auto des conventions par tags |
| `/tm-feature` | Ajouter une feature | Évolution du PRD (si besoin) → stories → dev/review loop |
| `/tm-review` | Code review agent isolé | Agent autonome séparé passe `code-review.md` point par point |
| `/tm-verify` | Vérification triple | `pnpm type-check` + `pnpm lint` + `pnpm test` (pour debug local) |
| `/tm-wrap-up` | Après un gros chantier | Capture les apprentissages méta (conventions, ADR, registry). Peut aussi être proposé auto par Claude. |
| `/commit-push` | Commit & push | Type-check + lint + changelog + commit + push (OBLIGATOIRE pour tout push) |

### Planifier une V2 (ou une grosse évolution versionnée)

**`/tm-plan` gère les deux modes** — cadrage initial ET évolution versionnée :

- **Mode initial** (auto) : `docs/prd.md` n'existe pas → création from scratch de tous les documents
- **Mode évolution** (auto) : `docs/prd.md` existe déjà ET tu mentionnes "V2", "V3", "évolution", "nouvelle version" → Claude **édite** les docs existants au lieu de les recréer, crée uniquement les nouveaux epics/stories, ajoute un ADR par invariant d'archi touché, et applique `.tiple/checklists/prd-evolution.md` en plus du readiness-gate.

Claude confirme toujours le mode détecté avant de continuer. Voir [.claude/commands/tm-plan.md](.claude/commands/tm-plan.md) pour le détail des différences.

### Skills auto-déclenchés

En plus des slash commands, `.claude/skills/` contient 22 skills "shim" (un par tag de `.tiple/conventions/_index.md`) qui s'auto-activent selon le contexte — même **hors** de `/tm-dev`. Exemple : éditer un fichier d'auth en mode libre déclenche le skill `auth` qui charge les patterns de `.tiple/conventions/auth-patterns.md`. Les descriptions sont bilingues FR+EN pour un trigger robuste.

## Structure

```
├── CLAUDE.md                    # Instructions Claude Code (Tiple Method)
├── .claude/
│   ├── commands/                # 8 slash commands (tm-plan, tm-dev, tm-fix, tm-feature, tm-review, tm-verify, tm-wrap-up, commit-push)
│   ├── skills/                  # 22 skills shim pour auto-déclenchement des conventions + tm-wrap-up
│   └── hooks/                   # enforce-bash-rules.sh (foreground, no pipe, no redirect)
├── .tiple/
│   ├── templates/               # 6 templates de documents
│   ├── checklists/              # 5 checklists quality gates
│   ├── conventions/             # Conventions techniques par tags (22 fichiers + _index.md)
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
| **Hors workflow** (édit libre, Q&A) | Skills de `.claude/skills/` auto-déclenchés par mots-clés FR+EN |

## Qualité & Déploiement

Répartition claire des checks :

| Check | Où | Quand |
|---|---|---|
| `pnpm type-check` | **Local** (via `/commit-push`) | Avant chaque push |
| `pnpm lint` | **Local** (via `/commit-push`) | Avant chaque push |
| `pnpm test` | **CI GitHub** (`.github/workflows/ci.yml`) | Après chaque push — Vercel ne déploie que si la CI est verte |

Pourquoi cette séparation : type-check + lint sont rapides et doivent bloquer le push ; les tests tournent sur CI pour profiter d'un environnement Linux propre, éviter les timeouts locaux, et laisser Vercel gater le déploiement sur le résultat.

Un hook Claude Code (`.claude/hooks/enforce-bash-rules.sh`) garantit que les commandes sont exécutées correctement (foreground, sans pipe, sans redirection) — voir la section "Règles d'exécution Bash" de `CLAUDE.md`.

Le déploiement Vercel est automatique (connecter le repo). La CI migrations Supabase est ajoutée par le starter Supabase + Auth si activé.
