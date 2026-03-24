# CLAUDE.md — Tiple Method

## Projet
<!-- À REMPLIR : Nom du projet, description en 1 ligne -->

## Stack
Next.js 15 (App Router) + Supabase + TypeScript strict + Tailwind CSS + Shadcn/ui
Voir `.tiple/conventions/tech-stack.md` pour les versions exactes.

## Méthode
Ce projet suit la Tiple Method. La documentation dans `docs/` est la source de vérité. Lis les fichiers pertinents avant chaque action.

## Règles absolues
1. Ne JAMAIS coder sans story en statut 🟢 Ready dans `docs/stories/`
2. TOUJOURS lire avant de coder : la story, le(s) écran(s) JSX référencés (`docs/design/screens/`), `docs/architecture.md`, et les **conventions par tags** (voir ci-dessous)
3. Ne JAMAIS créer un composant/hook/util sans vérifier le component-registry d'abord — s'il existe, réutiliser
4. Ne JAMAIS modifier un invariant d'architecture sans créer un ADR dans `docs/decisions/`
5. Les tests sont écrits AVEC le code, pas après — unit tests d'abord, puis intégration, puis e2e si applicable
6. Après implémentation : remplir la section "Post-implémentation" de la story
7. Après implémentation : passer `.tiple/checklists/code-review.md` point par point

## Conventions par tags (chargement intelligent)

Les conventions techniques sont dans `.tiple/conventions/`. Elles sont chargées **automatiquement** selon le contexte :

- **Index :** `.tiple/conventions/_index.md` liste tous les tags et les fichiers associés
- **Base (toujours lues) :** `coding-standards.md`, `component-registry.md`, `tech-stack.md`
- **Mode story (`/tm-dev E01-S01`) :** le champ `Conventions` de la story déclare les tags → les fichiers correspondants sont chargés
- **Mode libre (`/tm-dev` ou `/tm-fix`) :** les tags sont déduits des fichiers touchés (ex: `lib/actions/` → `api`, `supabase/migrations/` → `database`)

Tags disponibles : `auth`, `database`, `supabase`, `api`, `forms`, `realtime`, `security`, `nextjs`, `typescript`, `state`, `feedback`, `performance`, `tables`, `uploads`, `seo`, `a11y`, `i18n`, `datetime`, `monitoring`, `flags`, `deploy`, `testing`

## Règles avant push
1. **`pnpm type-check`** doit passer sans erreur
2. **`pnpm lint`** doit passer sans erreur
3. **`pnpm test`** doit passer sans erreur (non-régression)
4. Ne JAMAIS push du code qui casse le build ou les tests
5. La CI (`.github/workflows/ci.yml`) vérifie automatiquement type-check + lint + tests sur chaque push

## Règles Next.js + Supabase
1. **Server Components par défaut.** Pas de `"use client"` sauf si nécessaire (state, effects, event handlers). Pousser le `"use client"` le plus bas possible dans l'arbre.
2. **Server Actions pour les mutations.** Pas d'API routes sauf webhooks/cron. Chaque action : vérifier auth → valider Zod → exécuter → `revalidatePath` → retourner `{data}` ou `{error}`.
3. **Supabase côté serveur uniquement pour les mutations.** Le browser client est réservé au realtime et à l'auth listener. Jamais de `.insert()/.update()/.delete()` depuis un Client Component.
4. **RLS activé sur toute table.** Pas d'exception sans ADR documenté. Le `service_role` client est interdit sauf cas explicitement documenté.
5. **Schemas Zod partagés.** Un schema dans `lib/schemas/` = validé côté form + côté action. Pas de double validation manuelle.
6. **Migrations versionnées.** Chaque changement DB = `pnpm db:migrate [nom]` → fichier SQL dans `supabase/migrations/`. Jamais de modification en direct.

## Workflow quotidien
1. Lire `.tiple/sprint/status.md` → identifier la prochaine story 🟢 Ready
2. Lire la story complète + ses refs (parcours PRD, écrans JSX, archi, conventions)
3. Vérifier `.tiple/checklists/story-ready.md`
4. Implémenter : schemas Zod → backend → tests unit → UI → tests unit UI → page → tests integ
5. Vérifier que TOUS les tests passent (non-régression)
6. Mettre à jour la story (post-implémentation)
7. Mettre à jour `.tiple/conventions/component-registry.md` si nouveaux composants
8. Mettre à jour `.tiple/sprint/status.md` → story ✅ Done
9. Passer `.tiple/checklists/code-review.md`
10. Résumer ce qui a été fait

## Quand le PRD évolue
1. Modifier `docs/prd.md` — parcours concerné, statut 🔶 Draft
2. Passer `.tiple/checklists/prd-evolution.md` point par point
3. Identifier les impacts : parcours, écrans JSX, architecture, epics, stories, DB
4. Mettre à jour `docs/architecture.md` (+ ADR si invariant touché)
5. Mettre à jour les écrans JSX si nécessaire (`docs/design/screens/`)
6. Mettre à jour les epics et stories impactées
7. Ajouter une entrée dans `docs/changelog.md`
8. Lister les nouvelles stories à créer

## Quand on crée un nouveau composant
1. Vérifier `.tiple/conventions/component-registry.md` — s'il existe déjà, réutiliser
2. Implémenter en suivant `.tiple/conventions/coding-standards.md`
3. Ajouter au component-registry (nom, path, props, notes)
4. Respecter `docs/design/system.md` pour les tokens visuels

## Commandes disponibles

3 slash commands dans `.claude/commands/` :

| Commande | Usage | Description |
|----------|-------|-------------|
| `/tm-plan` | Nouveau projet / nouvelle feature | Cadrage complet : brief → PRD → archi → design → epics/stories → gate |
| `/tm-dev` | Implémentation | `E01-S01` (story), `next` (prochaine), ou sans arg (mode libre) |
| `/tm-fix` | Bug fix / petite modif | Correction rapide avec chargement auto des conventions |

## Conventions
- Index des tags : `.tiple/conventions/_index.md`
- Coding standards : `.tiple/conventions/coding-standards.md`
- Stack technique : `.tiple/conventions/tech-stack.md`
- Stratégie de tests : `.tiple/conventions/testing-strategy.md`
- Registry composants : `.tiple/conventions/component-registry.md`
- Patterns API : `.tiple/conventions/api-patterns.md`
