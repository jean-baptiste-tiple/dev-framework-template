# Tiple Method Template

Template Git réutilisable pour bootstrapper un projet avec la Tiple Method. Contient toute la structure, les templates de documents, les checklists, les conventions, et les slash commands Claude Code. Pré-configuré pour la stack Next.js 15 + Supabase + TypeScript + Tailwind CSS + Shadcn/ui.

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

## Commandes principales

3 commandes composites couvrent 90% des cas d'usage :

| Commande | Workflow | Description |
|----------|----------|-------------|
| `/tm-init` | A — Nouveau projet | Brief → PRD → Architecture → Design → Epics/Stories → Gate → Sprint |
| `/tm-feature` | B — Nouvelle feature | Evolve PRD si besoin → Stories → Dev/Review loop |
| `/tm-fix` | C — Bug fix | Story allégée → Dev → Review rapide |

## Commandes atomiques

Les commandes composites orchestrent ces commandes atomiques, qui restent utilisables individuellement :

| Commande | Description |
|----------|-------------|
| `/tm-brief` | Génère `docs/brief.md` par discussion interactive |
| `/tm-prd` | Génère `docs/prd.md` depuis le brief + template |
| `/tm-architecture` | Génère `docs/architecture.md` depuis le PRD + template |
| `/tm-design-system` | Initialise `docs/design/system.md` |
| `/tm-gate` | Passe la readiness-gate checklist avant de coder |
| `/tm-epic` | Crée une epic dans `docs/epics/` |
| `/tm-story` | Crée une story dans `docs/stories/` |
| `/tm-dev` | Implémente une story (lit tout, code, teste) |
| `/tm-review` | Code review checklist sur la dernière story |
| `/tm-evolve` | Process d'évolution du PRD (impact + cascade) |
| `/tm-status` | Affiche et met à jour le sprint status |
| `/tm-sprint` | Démarre un nouveau sprint |

## Structure

```
├── CLAUDE.md                    # Instructions Claude Code (Tiple Method)
├── .claude/commands/            # 15 slash commands /tm-* (3 composites + 12 atomiques)
├── .tiple/
│   ├── templates/               # 6 templates de documents
│   ├── checklists/              # 5 checklists quality gates
│   ├── conventions/             # 5 fichiers conventions (pré-remplis)
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
├── src/                         # Code Next.js (App Router)
├── supabase/                    # Config + migrations Supabase
└── tests/                       # Unit, integration, e2e
```

## Personnaliser le template

Après le clone, modifier :

1. **`CLAUDE.md`** — Section "Projet" : nom et description
2. **`.env.local`** — Variables Supabase (URL, clés)
3. **`docs/design/system.md`** — Tokens visuels du projet
4. **`.tiple/conventions/tech-stack.md`** — Ajouter les libs spécifiques
5. **`package.json`** — Nom du projet, dépendances spécifiques

Puis lancer `/tm-init` pour démarrer la phase de planification (ou `/tm-brief` pour commencer étape par étape).

## CI/CD

La CI est configurée via `.github/workflows/ci.yml` et s'exécute automatiquement sur chaque push :
- **Type check** (`pnpm type-check`)
- **Lint** (`pnpm lint`)
- **Tests unitaires & intégration** (`pnpm test`)

Le déploiement Vercel est automatique (connecter le repo). Pour Supabase, utiliser `supabase db push` qui applique uniquement les nouvelles migrations.

---

## Workflows détaillés

### Workflow A — Création d'un nouveau projet

Ce workflow se fait une seule fois, au démarrage du projet. Il produit toute la documentation nécessaire avant d'écrire la moindre ligne de code métier.

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 0 — Setup (5 min)                                │
├─────────────────────────────────────────────────────────┤
│  1. git clone <template> mon-projet && cd mon-projet    │
│  2. pnpm install                                        │
│  3. cp .env.example .env.local → remplir les clés       │
│  4. Éditer CLAUDE.md → section "Projet" (nom + desc)    │
│  5. pnpm dev → vérifier que ça tourne                   │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 1 — Brief (/tm-brief)                            │
├─────────────────────────────────────────────────────────┤
│  Discussion interactive avec Claude Code.                │
│  Décris ton projet : problème, solution, personas,       │
│  scope MVP, contraintes.                                 │
│  → Produit : docs/brief.md                              │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 2 — PRD (/tm-prd)                                │
├─────────────────────────────────────────────────────────┤
│  Claude Code enrichit le brief en PRD complet :          │
│  - Functional Requirements avec IDs (FR-AUTH-01...)      │
│  - Non-Functional Requirements (perf, sécu, RGPD)       │
│  - Epics identifiées avec priorités et dépendances       │
│  Valider chaque section (⬜ → 🔶 → ✅).                │
│  → Produit : docs/prd.md                                │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 3 — Architecture (/tm-architecture)              │
├─────────────────────────────────────────────────────────┤
│  Claude Code génère l'architecture depuis le PRD :       │
│  - Diagramme Mermaid, modèle de données (ER)            │
│  - RLS policies par table                                │
│  - Server Actions par domaine                            │
│  - Invariants et choix flexibles                         │
│  → Produit : docs/architecture.md                       │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 4 — Design System (/tm-design-system)            │
├─────────────────────────────────────────────────────────┤
│  Définir les tokens visuels : couleurs, typo, spacing,   │
│  radius. Met à jour globals.css en conséquence.          │
│  → Produit : docs/design/system.md + globals.css        │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 5 — Epics & Stories (/tm-epic puis /tm-story)    │
├─────────────────────────────────────────────────────────┤
│  Pour chaque epic du PRD :                               │
│    /tm-epic → crée docs/epics/E0X-titre.md              │
│    /tm-story (×N) → crée docs/stories/E0X-S0X-titre.md │
│  Chaque story doit être 🟢 Ready avec AC testables.     │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 6 — Gate (/tm-gate)                              │
├─────────────────────────────────────────────────────────┤
│  Vérification finale avant de coder :                    │
│  - Docs complètes ? Cohérentes ? Conventions OK ?        │
│  - pnpm dev / type-check / test passent ?                │
│  Si tout est ✅ → prêt à coder.                         │
│  Si ❌ → corriger avant de continuer.                    │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 7 — Sprint & Dev (/tm-sprint puis /tm-dev)       │
├─────────────────────────────────────────────────────────┤
│  /tm-sprint → initialise le premier sprint               │
│  Puis boucler sur chaque story :                         │
│    /tm-dev E0X-S0X (ou /tm-dev next)                    │
│      → lit story + archi + conventions + registry        │
│      → implémente : Zod → actions → tests → UI → page   │
│      → vérifie non-régression (pnpm test)                │
│      → MAJ story, registry, sprint status                │
│    /tm-review E0X-S0X                                   │
│      → code-review checklist + review adversariale       │
│      → corrige les problèmes trouvés                     │
│                                                          │
│  Répéter /tm-dev + /tm-review jusqu'à sprint terminé.   │
│  /tm-status pour suivre l'avancement.                    │
└─────────────────────────────────────────────────────────┘
```

### Workflow B — Nouvelle feature

Une feature = un changement fonctionnel significatif qui nécessite une ou plusieurs stories.

```
1. Vérifier le contexte
   └─ /tm-status → où en est le sprint actuel ?

2. Documenter la feature
   ├─ Si la feature est dans le PRD → passer à l'étape 3
   └─ Si la feature est nouvelle :
       └─ /tm-evolve → décrire le changement
           ├─ Met à jour docs/prd.md (section concernée → 🔶)
           ├─ Cascade : MAJ architecture, epics, stories si besoin
           └─ Entrée dans docs/changelog.md

3. Créer l'epic (si nécessaire)
   └─ /tm-epic "Titre de la feature"
       → docs/epics/E0X-titre.md

4. Découper en stories
   └─ /tm-story E0X "Titre story 1"
   └─ /tm-story E0X "Titre story 2"
       → chaque story en 🟢 Ready avec AC en Given/When/Then

5. Implémenter story par story
   └─ Pour chaque story, dans l'ordre :
       ├─ /tm-dev E0X-S0X
       │   → Zod schemas → Server Actions → tests unit
       │   → composants UI → tests unit UI → page → tests integ
       │   → vérif non-régression
       │   → MAJ story (post-implémentation) + registry + sprint
       └─ /tm-review E0X-S0X
           → checklist code-review.md
           → review adversariale (edge cases, sécu, DRY)
           → fix des problèmes

6. Vérifier
   └─ pnpm type-check && pnpm test → tout passe
   └─ /tm-status → stories ✅ Done
```

### Workflow C — Bug fix ou petite modification

Pour les corrections de bugs, ajustements UI, ou modifications mineures d'une feature existante. Pas besoin de créer une epic — une story suffit.

```
1. Créer une story de fix
   └─ /tm-story E0X "Fix : description du bug"
       Contenu allégé :
       - Meta : estimation S, priorité Must
       - Contexte : décrire le bug / la modification demandée
       - AC : Given [situation actuelle], When [action], Then [comportement corrigé]
       - Implémentation : fichiers à modifier (pas à créer en général)
       - Tests : ajouter le test qui couvre le cas corrigé

2. Implémenter
   └─ /tm-dev E0X-S0X
       → Lire la story
       → Identifier le code concerné
       → Écrire le test qui reproduit le bug (red)
       → Corriger le code (green)
       → Vérifier la non-régression (pnpm test)
       → MAJ story + sprint status

3. Review rapide
   └─ /tm-review E0X-S0X
       → Focus sur : le fix résout-il vraiment le bug ?
       → Pas d'effets de bord ? Pas de régression ?
       → Registry à jour si composant modifié ?

Variante — modification très mineure (typo, padding, couleur) :
   Pas besoin de story. Modifier directement, vérifier
   que pnpm type-check && pnpm test passent, commit.
```
