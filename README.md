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

## Skills

Tout est un **skill** (`.claude/skills/`) : il se déclenche **tout seul** sur l'intention, et
reste invocable explicitement en `/<nom>` quand tu veux forcer le passage.

| Skill | Déclenchement | Description |
|-------|---------------|-------------|
| `tm-dev` | auto — avant toute modif de `src/`, `tests/`, `supabase/` | 2 modes (lecture / écriture), 3 échelles (Micro / Standard / Module). |
| `tm-review` | auto — dès l'échelle Standard, « review », « relis » | Route les conventions par globs sur le diff et confronte le code aux règles lues. |
| `tm-verify` | auto — « vérifie », « ça compile ? », après un fix | `check:framework` + `type-check` + `lint` + `test`. |
| `commit-push` | auto — « commit », « push », « envoie » | Les 4 checks + changelog + commit + push. **Seul chemin autorisé** (gate par hook). |
| `tm-wrap-up` | auto — « on a fini », « c'est bouclé » | Propose de capturer les apprentissages. N'écrit jamais sans accord. |
| `tm-plan` | **explicite uniquement** (`/tm-plan`) | Cadrage à la carte : brief, PRD par parcours, archi, design, epics/stories. 3 niveaux — initial, évolution ciblée, ou **refus** quand ça n'en vaut pas la peine. |
| 22 skills de tag | auto — via les globs de `_index.md` | Pointeurs vers `.tiple/conventions/`, sans aucune règle recopiée. |

`tm-plan` est le seul à ne jamais s'auto-déclencher : un cadrage réécrit PRD, architecture et
stories. Claude le **propose** face à un besoin produit large, il ne le lance pas.

### Le gate de commit

`git commit` et `git push` directs sont **bloqués** par `.claude/hooks/enforce-git-gate.sh`.
Tout passe par le skill `commit-push`, qui exécute d'abord `check:framework`, `type-check`,
`lint` et `test`. `--no-verify` et `--force` sont refusés sans échappement possible.

Le déclenchement d'un skill est un jugement du modèle, donc probabiliste — acceptable pour
charger des conventions, pas pour un gate de push. D'où le hook, qui lui est déterministe.

### L'échelle, pas les mots-clés

`tm-dev` a **2 modes** — lecture (read-only) ou écriture — et l'ampleur du process est déterminée
par **ce que le changement touche**, jamais par le vocabulaire de la demande :

| Échelle | Reconnaissance | Process |
|---|---|---|
| **Micro** | 1-2 fichiers, aucune nouvelle surface | conventions → impl → type-check → review inline |
| **Standard** | 3-5 fichiers, ou création d'une fonction / composant / action | + tests → `tm-review` → changelog |
| **Module** | nouvelle surface (route, table, parcours), changement DB, ou ≥ 6 fichiers | **propose une story avant de coder** → tout le Standard → registry → ADR si invariant → sprint status |

Micro ne veut pas dire « sans garantie » : conventions et type-check s'appliquent **à toute
échelle**. Ce qui s'adapte, c'est le cérémonial — pas la vérification.

Deux garde-fous se déclenchent sur la nature réelle du travail, pas sur le verbe employé :
une **correction de bug** exige d'abord un test qui reproduit ; une **réorganisation sans
changement de comportement** exige des tests **identiques avant/après** (un test modifié signifie
un comportement modifié).

### Le cadrage à la carte

`/tm-plan` regarde ce qui existe déjà et choisit son niveau :

- **Initial** — `docs/prd.md` absent → chaîne complète
- **Évolution** — PRD rempli, la demande touche un parcours → ce parcours + la cascade réellement impactée, jamais de réécriture
- **Refus** — la demande ne touche ni parcours ni modèle de données → **aucun document produit**, bascule directe en implémentation

Le refus est une issue normale : un cadrage ne doit pas se dérouler pour une demande de 20 lignes.

**Rien n'est obligatoire.** Pas de maquette, pas de story, pas de Supabase, pas de design system
custom : le travail se fait quand même. Une référence UI à `N/A` est une donnée déclarée, jamais
un défaut — la review ne la pénalise pas, elle retire simplement le critère correspondant.

Détail : [.claude/skills/tm-plan/SKILL.md](.claude/skills/tm-plan/SKILL.md).

### Routing des conventions

Le mapping `fichier touché → tag → convention` a **une seule source de vérité** : la colonne
**Globs** de [`.tiple/conventions/_index.md`](.tiple/conventions/_index.md). Elle est consommée
par `tm-dev` (avant d'écrire) et par `tm-review` (avant de reviewer).

Les 22 skills de tag sont des **pointeurs sans règles** : ils disent quel fichier de conventions
lire, rien d'autre. Un résumé recopié dans un skill finirait par diverger de la convention tout
en donnant l'illusion d'être informé — c'est pour ça qu'il n'y en a aucun.

`pnpm check:framework` vérifie que tags, conventions, skills, hooks et références croisées
restent cohérents. Il échoue si un tag n'a pas de globs, si un skill pointe vers un fichier
disparu, ou si la doc référence un `/skill` inexistant.

## Structure

```
├── CLAUDE.md                    # Instructions Claude Code (Tiple Method)
├── .claude/
│   ├── skills/                  # 6 skills de workflow + 22 skills de tag (pointeurs conventions)
│   ├── hooks/                   # enforce-git-gate.sh (gate commit/push) + enforce-bash-rules.sh
│   └── settings.json            # Déclaration des hooks
├── scripts/
│   └── check-framework.mjs      # Cohérence tags ↔ conventions ↔ skills ↔ hooks ↔ références
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

Les conventions techniques sont dans `.tiple/conventions/`, chargées automatiquement :

- **Base (toujours)** : `coding-standards.md`, `component-registry.md`, `tech-stack.md`
- **Par globs** : chaque fichier créé ou modifié active des tags → les conventions sont lues **en entier**
- **Mode story** : les tags du champ `Conventions` de la story s'ajoutent (union avec les globs)

| Contexte | Chargement |
|---|---|
| `/tm-dev E01-S01` | Globs du diff **∪** tags déclarés dans la story |
| `/tm-dev` (libre) | Globs des fichiers visés |
| `tm-review` | Globs du diff — mêmes règles, même source |
| Hors workflow (édit libre, Q&A) | Skills de tag auto-déclenchés par mots-clés FR+EN |

## Qualité & Déploiement

Répartition claire des checks :

| Check | Où | Quand |
|---|---|---|
| `pnpm check:framework` | **Local** (via `commit-push`) | Avant chaque push |
| `pnpm type-check` | **Local** (via `commit-push`) | Avant chaque push |
| `pnpm lint` | **Local** (via `commit-push`) | Avant chaque push |
| `pnpm test` | **Local** (via `commit-push`) | Avant chaque push |
| `pnpm build` | **CI GitHub** (`.github/workflows/ci.yml`) | Après chaque push — validation Vercel + erreurs spécifiques Linux |

Pourquoi cette séparation : les 4 checks locaux bloquent le push, donc rien de cassé ne part ; la
CI ne refait pas ce travail et se concentre sur ce qui ne peut être vérifié qu'en environnement
Linux propre — le build de production.

Deux hooks Claude Code appliquent ces règles sans dépendre du raisonnement du modèle :
`enforce-git-gate.sh` (aucun commit/push hors du skill `commit-push`) et `enforce-bash-rules.sh`
(sortie des checks jamais tronquée ni redirigée). Chaque hook documente ses propres règles.

Le déploiement Vercel est automatique (connecter le repo). La CI migrations Supabase est ajoutée par le starter Supabase + Auth si activé.
