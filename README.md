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
| `tm-dev` | auto — avant toute modif de `src/`, `tests/`, `supabase/` | 5 modes : story (`E01-S01`/`next`), fix, feature, refacto, explore (read-only). |
| `tm-review` | auto — fin d'implémentation, « review », « relis » | Route les conventions par globs sur le diff et confronte le code aux règles lues. |
| `tm-verify` | auto — « vérifie », « ça compile ? », après un fix | `check:framework` + `type-check` + `lint` + `test`. |
| `commit-push` | auto — « commit », « push », « envoie » | Les 4 checks + changelog + commit + push. **Seul chemin autorisé** (gate par hook). |
| `tm-wrap-up` | auto — « on a fini », « c'est bouclé » | Propose de capturer les apprentissages. N'écrit jamais sans accord. |
| `tm-plan` | **explicite uniquement** (`/tm-plan`) | Cadrage : brief → PRD par parcours → archi → design → epics/stories → gate. Mode initial vs évolution détecté auto. |
| 22 skills de tag | auto — via les globs de `_index.md` | Pointeurs vers `.tiple/conventions/`, sans aucune règle recopiée. |

`tm-plan` est le seul à ne jamais s'auto-déclencher : un cadrage réécrit PRD, architecture et
stories. Claude le **propose** face à un besoin produit large, il ne le lance pas.

### Le gate de commit

`git commit` et `git push` directs sont **bloqués** par `.claude/hooks/enforce-git-gate.sh`.
Tout passe par le skill `commit-push`, qui exécute d'abord `check:framework`, `type-check`,
`lint` et `test`. `--no-verify` et `--force` sont refusés sans échappement possible.

Le déclenchement d'un skill est un jugement du modèle, donc probabiliste — acceptable pour
charger des conventions, pas pour un gate de push. D'où le hook, qui lui est déterministe.

### Les 5 modes de `/tm-dev`

| Mode | Déclencheur | Ce que ça fait |
|---|---|---|
| **Story** | ID (`E01-S01`) ou `next` | Flow complet piloté par la story : conventions auto-chargées, impl, type-check, review, finalisation (changelog, post-impl, registry, sprint status) |
| **Fix** | mots-clés : `bug`, `corrige`, `cassé`, `erreur`, `crash`, `ne marche pas`, `broken`, `régression` | Reproduire avant corriger, diff minimal, test de non-régression obligatoire |
| **Feature** | mots-clés : `ajoute`, `implémente`, `nouvelle feature`, `nouvelle fonctionnalité`, `add` | Si non-trivial → propose `/tm-plan` pour cadrer d'abord. Sinon : respect registry/design system/a11y |
| **Refacto** | mots-clés : `refacto`, `refactor`, `nettoie`, `factorise`, `simplifie`, `DRY`, `clean up` | Pas de changement de comportement, tests identiques avant/après, diff minimal |
| **Explore** | mots-clés : `comprends`, `explique`, `analyse`, `audit`, `lis`, `parcours` | **Read-only** : aucune écriture. Retour structuré (vue d'ensemble, I/O, flow, dépendances, points d'attention) |

Priorité en cas d'ambiguïté : Explore > Refacto > Fix > Feature. Sinon Claude demande.

### Planifier une V2 (ou une grosse évolution versionnée)

**`/tm-plan` gère les deux modes** — cadrage initial ET évolution versionnée :

- **Mode initial** (auto) : `docs/prd.md` n'existe pas → création from scratch de tous les documents
- **Mode évolution** (auto) : `docs/prd.md` existe déjà ET tu mentionnes "V2", "V3", "évolution", "nouvelle version" → Claude **édite** les docs existants au lieu de les recréer, crée uniquement les nouveaux epics/stories, ajoute un ADR par invariant d'archi touché, et applique `.tiple/checklists/prd-evolution.md` en plus du readiness-gate.

Claude confirme toujours le mode détecté avant de continuer. Voir [.claude/skills/tm-plan/SKILL.md](.claude/skills/tm-plan/SKILL.md) pour le détail.

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
