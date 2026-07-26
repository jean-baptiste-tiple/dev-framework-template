# Tiple Method Template

Template Git réutilisable pour bootstrapper un projet avec la Tiple Method : structure, templates
de documents, checklists, conventions techniques routées, et skills Claude Code auto-déclenchés.
Stack de base : Next.js 15 + TypeScript strict + Tailwind + Shadcn/ui. Base de données et auth
optionnelles via starter (Supabase).

Le principe : **les garanties de qualité s'attachent au changement, pas à un workflow qu'il faut
penser à lancer.** Les conventions se chargent depuis les fichiers touchés, la review confronte le
code aux règles écrites plutôt qu'à une opinion, et le gate de commit est appliqué par un hook —
pas par une consigne qu'on peut oublier.

## Design System

Un design system **violet corporate** complet est inclus, prêt à l'emploi :

- **Thème :** Violet profond corporate avec dark mode (class-based, next-themes)
- **34 composants Shadcn/ui** installés (style new-york) dans `src/components/ui/`
- **6 composants métier** : PageContainer, EmptyState, StatCard, DataTable, ThemeToggle, ThemeProvider
- **Preview interactive** : route `/design-system` pour voir tous les composants
- **Tokens complets** : couleurs (oklch), typographie (Inter), spacing, radius, shadows
- **Documentation** : `docs/design/system.md`

## Starters

Le template est minimal par défaut. Les starters dans `.tiple/starters/` ajoutent des fonctionnalités complètes. Ils sont **identifiés** par `/tm-plan` (qui ne fait que documenter) et **installés** par `/tm-dev` dans la story de setup technique.

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

# 3. Vérifier que le template est sain (4 checks)
pnpm verify

# 4. Lancer le dev server — `/` sert le dashboard placeholder
pnpm dev
```

Puis, dans Claude Code : **`/tm-plan`** pour cadrer le projet. C'est la seule commande à taper —
tout le reste se déclenche sur l'intention. Le cadrage identifie les starters nécessaires et
crée la story de setup ; c'est `tm-dev` qui les installera ensuite.

Rien n'oblige à passer par `/tm-plan` : sur un besoin qui tient en quelques fichiers, décrire ce
qu'on veut suffit, et le cadrage se refusera lui-même s'il n'apporte rien.

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
| `conventions` | auto — question sur une règle, sans fichier touché | Répond depuis `.tiple/conventions/` en citant la source, jamais de mémoire. |

`tm-plan` est le seul à ne jamais s'auto-déclencher : un cadrage réécrit PRD, architecture et
stories. Claude le **propose** face à un besoin produit large, il ne le lance pas.

### Le gate de commit

`git commit` et `git push` directs sont **bloqués** par `.claude/hooks/enforce-git-gate.mjs`.
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

**Il n'y a pas de skill par tag.** `tm-dev` et `tm-review` lisent `_index.md` et matchent les
globs eux-mêmes : un skill intermédiaire par domaine n'ajouterait qu'un niveau d'indirection et
une occasion de diverger. Le skill `conventions` couvre le seul cas que les globs ne peuvent pas
atteindre — une question posée sans qu'aucun fichier ne soit touché.

Une seule convention est lue systématiquement (`coding-standards.md`, 133 lignes). Le registry
et la stack sont routés comme les autres : vérifier le registry n'a de sens qu'en créant un
composant, la stack qu'en touchant aux dépendances.

`pnpm check:framework` échoue si un tag n'a pas de globs, si **aucun glob d'un tag ne peut
matcher** (le mode de pourrissement principal : une réorganisation de `src/` désactive le
routing en silence), si une section citée en review n'existe plus, si un fichier de conventions
dépasse 400 lignes, si une checklist n'est appelée par rien, si un composant de
`src/components/` manque au registry, ou si la doc référence un `/skill` inexistant.

## Structure

```
├── CLAUDE.md                    # Instructions Claude Code (Tiple Method)
├── .claude/
│   ├── skills/                  # 6 skills de workflow + conventions
│   ├── hooks/                   # enforce-git-gate.mjs (gate commit/push) + enforce-bash-rules.mjs
│   └── settings.json            # Déclaration des hooks
├── scripts/
│   └── check-framework.mjs      # Cohérence tags ↔ conventions ↔ skills ↔ hooks ↔ références
├── .tiple/
│   ├── templates/               # 6 templates de documents
│   ├── checklists/              # 5 checklists quality gates
│   ├── conventions/             # Conventions techniques routées par globs (_index.md = routing)
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
│   │   ├── (dashboard)/         # Layout principal + page servant `/`
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

- **Base (toujours)** : `coding-standards.md` — une seule, volontairement courte
- **Par globs** : chaque fichier créé ou modifié active des tags → les conventions sont lues **en entier**
- **Mode story** : les tags du champ `Conventions` de la story s'ajoutent (union avec les globs)

Ce qui est appliqué par ESLint ou TypeScript n'est jamais répété en prose : une règle mécanisée
est vérifiée à chaque `pnpm lint`, la recopier ne fait qu'alourdir ce qu'il y a à lire.

| Contexte | Chargement |
|---|---|
| `/tm-dev E01-S01` | Globs du diff **∪** tags déclarés dans la story |
| `/tm-dev` (libre) | Globs des fichiers visés |
| `tm-review` | Globs du diff — mêmes règles, même source |
| Question sans fichier touché | Skill `conventions` : lit `_index.md`, puis les fichiers concernés |

Trois tags — `datetime`, `i18n`, `flags` — portent sur des préoccupations transverses qu'aucun
chemin ne révèle : formater un montant ou gater une fonctionnalité se fait dans n'importe quel
composant. Ils se déclarent explicitement, via le champ `Conventions` de la story.

## Qualité & Déploiement

```bash
pnpm verify          # les 4 checks + écriture du reçu
pnpm verify:cached   # ne relance les checks que si le code a bougé
```

| Check | Où | Quand |
|---|---|---|
| `check:framework` · `type-check` · `lint` · `test` | **Local**, via `pnpm verify` | Avant chaque push |
| `pnpm build` | **CI GitHub** (`.github/workflows/ci.yml`) | Après chaque push — validation Vercel, erreurs spécifiques à Linux |

Les 4 checks locaux bloquent le push : rien de cassé ne part. La CI ne les refait pas et se
concentre sur ce qui ne peut être vérifié qu'en environnement Linux propre.

### Le reçu de vérification

`pnpm verify` enregistre l'empreinte exacte du code au moment où les checks passent. `commit-push`
compare : **code identique → il ne rejoue rien**. C'est ce qui supprime le scénario le plus
coûteux du framework — une implémentation qui se termine par une suite complète, suivie d'un
commit qui rejoue la même chose trente secondes plus tard.

L'empreinte couvre le HEAD, le diff complet et le contenu des fichiers non suivis. Elle exclut
`docs/changelog.md`, édité après les checks et sans effet sur eux.

Le reçu sert aussi de **preuve** : le hook refuse un commit dont le reçu ne couvre pas l'état
exact du code, ce qui empêche le marqueur d'échappement d'être posé par réflexe sur un arbre
jamais vérifié.

### Les deux hooks

`enforce-git-gate.mjs` — aucun commit ni push hors du skill `commit-push`.
`enforce-bash-rules.mjs` — sortie des checks jamais tronquée, redirigée ou lancée en arrière-plan.

Ils sont écrits en Node, pas en bash : le payload est du JSON, et toute extraction du champ
`command` par grep ou sed est fausse dans un sens (troncature au premier guillemet échappé) ou
dans l'autre (matching du JSON entier). `tests/unit/hooks.test.ts` verrouille leur comportement
sur les cas de contournement connus.

Le déploiement Vercel est automatique (connecter le repo). La CI migrations Supabase arrive avec
le starter Supabase + Auth.
