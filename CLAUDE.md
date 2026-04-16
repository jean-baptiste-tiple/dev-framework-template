# CLAUDE.md — Tiple Method

## Projet
<!-- À REMPLIR : Nom du projet, description en 1 ligne -->

## Stack
Next.js 15 (App Router) + TypeScript strict + Tailwind CSS + Shadcn/ui
Backend/DB optionnel : Supabase (à ajouter selon le projet — voir section "Supabase" ci-dessous).
Voir `.tiple/conventions/tech-stack.md` pour les versions exactes.

## Méthode
Ce projet suit la Tiple Method. La documentation dans `docs/` est la source de vérité. Lis les fichiers pertinents avant chaque action.

## Règles absolues
1. Ne JAMAIS coder sans story en statut 🟢 Ready dans `docs/stories/`
2. TOUJOURS lire avant de coder : la story, la référence UI de la story (maquette, Figma, description — si applicable), `docs/architecture.md`, et les **conventions par tags** (voir ci-dessous)
3. Ne JAMAIS créer un composant/hook/util sans vérifier le component-registry d'abord — s'il existe, réutiliser
4. Ne JAMAIS modifier un invariant d'architecture sans créer un ADR dans `docs/decisions/`
5. Les tests sont écrits AVEC le code, pas après — unit tests d'abord, puis intégration, puis e2e si applicable
6. Après implémentation : remplir la section "Post-implémentation" de la story
7. Après implémentation : passer `.tiple/checklists/code-review.md` point par point
8. **`/tm-plan` = documentation uniquement.** Ne JAMAIS installer de dépendances, créer de fichiers de code ou exécuter de builds pendant un cadrage. Seuls les fichiers dans `docs/` et `.tiple/sprint/` sont modifiés.

## Règles d'exécution Bash (TOUTES les commandes)

> **⚠️ Ces règles s'appliquent à TOUTES les commandes : `pnpm add`, `pnpm install`, `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm build`, `npx`, et toute autre commande shell.**

1. **TOUJOURS en foreground.** Ne JAMAIS utiliser `run_in_background: true` sauf si l'utilisateur le demande explicitement. Toujours exécuter avec un timeout adapté (défaut: 120000ms, max: 600000ms pour les builds longs).
2. **AUCUN pipe.** Ne JAMAIS ajouter `| tail`, `| head`, `| grep`, `| wc`, `2>&1 | ...` ou tout autre pipe. Exécuter la commande brute.
3. **AUCUNE redirection fichier.** Ne JAMAIS rediriger la sortie vers un fichier (`> output.txt`, `2>&1 > log.txt`, `| tee file.txt`). La sortie doit aller directement dans le terminal.
4. **AUCUNE boucle d'attente.** Ne JAMAIS utiliser `sleep` + `cat`/`tail` pour poll un fichier de sortie. Ne JAMAIS utiliser `while true; do ... done`, `watch`, ou toute boucle pour surveiller une commande.
5. **Si une commande en background a été lancée par erreur**, attendre la notification de fin. Ne JAMAIS poll manuellement.
6. **Si une commande dépasse le timeout**, ne PAS relancer en boucle — informer l'utilisateur et proposer d'augmenter le timeout ou de lancer manuellement.
7. **Commande brute = la commande et rien d'autre.** Exemples corrects : `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm add @supabase/supabase-js`. Exemples INTERDITS : `pnpm type-check 2>&1 | tail -20`, `pnpm install > log.txt`, `pnpm test &`.

## Conventions par tags (chargement intelligent)

Les conventions techniques sont dans `.tiple/conventions/`. Elles sont chargées **automatiquement** selon le contexte :

- **Index :** `.tiple/conventions/_index.md` liste tous les tags et les fichiers associés
- **Base (toujours lues) :** `coding-standards.md`, `component-registry.md`, `tech-stack.md`
- **Mode story (`/tm-dev E01-S01`) :** le champ `Conventions` de la story déclare les tags → les fichiers correspondants sont chargés
- **Mode libre (`/tm-dev` ou `/tm-fix`) :** les tags sont déduits des fichiers touchés (ex: `lib/actions/` → `api`, `supabase/migrations/` → `database`)

Tags disponibles : `auth`, `database`, `supabase`, `api`, `forms`, `realtime`, `security`, `nextjs`, `typescript`, `state`, `feedback`, `performance`, `tables`, `uploads`, `seo`, `a11y`, `i18n`, `datetime`, `monitoring`, `flags`, `deploy`, `testing`

## Règles avant push
1. **TOUJOURS utiliser `/commit-push`** pour commit et push. Cette commande exécute `pnpm type-check` + `pnpm lint` (checks locaux), met à jour le changelog, commit et push.
2. **Ne JAMAIS lancer `pnpm test` localement** — les tests tournent exclusivement sur la CI GitHub (`.github/workflows/ci.yml`). Vercel ne déploie que si la CI est verte.
3. Ne JAMAIS commit/push en dehors de `/commit-push` sauf demande explicite de l'utilisateur
4. Voir "Règles d'exécution Bash" ci-dessus pour les contraintes d'exécution des commandes.

## Règles Next.js
1. **Server Components par défaut.** Pas de `"use client"` sauf si nécessaire (state, effects, event handlers). Pousser le `"use client"` le plus bas possible dans l'arbre.
2. **Server Actions pour les mutations.** Pas d'API routes sauf webhooks/cron. Chaque action : vérifier auth → valider Zod → exécuter → `revalidatePath` → retourner `{data}` ou `{error}`.
3. **Schemas Zod partagés.** Un schema dans `lib/schemas/` = validé côté form + côté action. Pas de double validation manuelle.
4. **Route groups : toujours un `page.tsx`.**  Un route group (ex: `(dashboard)`) avec un `layout.tsx` DOIT avoir au moins un `page.tsx`, sinon le build Next.js échoue (`ENOENT: client-reference-manifest.js`). Si le route group n'est pas utilisé, supprimer le dossier entier.

## Starters

Le template est minimal par défaut. Les starters dans `.tiple/starters/` ajoutent des fonctionnalités complètes. Ils sont **identifiés** par `/tm-plan` (Phase 0) et **installés** par `/tm-dev` lors de la story E01-S01 (Setup technique).

### Supabase + Auth (`.tiple/starters/supabase-auth/`)
Ajoute : base de données, auth (login/signup/reset), middleware, Server Actions, pages auth, CI migrations.
Activé quand le projet a besoin d'une base de données et/ou d'authentification.
Voir `.tiple/starters/supabase-auth/README.md` pour le détail.

### Règles Supabase (quand activé)
- **Supabase côté serveur uniquement pour les mutations.** Le browser client est réservé au realtime et à l'auth listener. Jamais de `.insert()/.update()/.delete()` depuis un Client Component.
- **RLS activé sur toute table.** Pas d'exception sans ADR documenté. Le `service_role` client est interdit sauf cas explicitement documenté.
- **Migrations versionnées.** Chaque changement DB = `pnpm db:migrate [nom]` → fichier SQL dans `supabase/migrations/`. Jamais de modification en direct. CI auto-deploy via `.github/workflows/supabase-migrations.yml`.
- **Auth vérifiée dans chaque Server Action** (pas seulement le middleware).

## Workflow quotidien
1. Lire `.tiple/sprint/status.md` → identifier la prochaine story 🟢 Ready
2. Lire la story complète + ses refs (parcours PRD, référence UI, archi, conventions)
3. Vérifier `.tiple/checklists/story-ready.md`
4. Implémenter : schemas Zod → backend → tests unit → UI → tests unit UI → page → tests integ
5. Écrire les tests (unit + integ) au fur et à mesure
6. Vérifier que les tests de la story passent
7. **Type-check** (OBLIGATOIRE) : `pnpm type-check` → doit passer sans erreur
8. **Code Review en agent isolé** (OBLIGATOIRE — `/tm-review`) :
   - Lancer un agent autonome séparé (regard neuf, sans biais d'implémentation)
   - L'agent passe `.tiple/checklists/code-review.md` point par point
   - Couvrir : sécurité, qualité, DRY, tests, conventions, architecture, documentation
   - Si problèmes HAUTE/MOYENNE → corriger puis relancer l'étape 7, puis nouveau review agent
9. Mettre à jour la story (post-implémentation)
10. Mettre à jour `.tiple/conventions/component-registry.md` si nouveaux composants
11. Mettre à jour `.tiple/sprint/status.md` → story ✅ Done
12. Ajouter une entrée dans `docs/changelog.md` si changement significatif
13. Résumer ce qui a été fait

## Quand le PRD évolue
1. Modifier `docs/prd.md` — parcours concerné, statut 🔶 Draft
2. Passer `.tiple/checklists/prd-evolution.md` point par point
3. Identifier les impacts : parcours, maquettes/références UI (si applicable), architecture, epics, stories, DB
4. Mettre à jour `docs/architecture.md` (+ ADR si invariant touché)
5. (si maquettes) Mettre à jour les maquettes si nécessaire (`docs/design/screens/`)
6. Mettre à jour les epics et stories impactées
7. Ajouter une entrée dans `docs/changelog.md`
8. Lister les nouvelles stories à créer

## Quand on crée un nouveau composant
1. Vérifier `.tiple/conventions/component-registry.md` — s'il existe déjà, réutiliser
2. Implémenter en suivant `.tiple/conventions/coding-standards.md`
3. Ajouter au component-registry (nom, path, props, notes)
4. Respecter `docs/design/system.md` pour les tokens visuels

## Commandes disponibles

Slash commands dans `.claude/commands/` :

| Commande | Usage | Description |
|----------|-------|-------------|
| `/tm-plan` | Nouveau projet / nouvelle feature | Cadrage complet : brief → PRD → archi → design → epics/stories → gate |
| `/tm-dev` | Implémentation | `E01-S01` (story), `next` (prochaine), ou sans arg (mode libre) |
| `/tm-fix` | Bug fix / petite modif | Correction rapide avec chargement auto des conventions |
| `/commit-push` | Commit & push | Vérification triple + changelog + commit + push (OBLIGATOIRE) |

## Design System

Le projet inclut un design system violet corporate complet. Toujours s'y référer avant de créer un composant UI.

- **Tokens & documentation :** `docs/design/system.md` — couleurs, typographie, spacing, radius, shadows
- **Preview interactive :** route `/design-system` — tous les composants rendus
- **Composants Shadcn/ui :** `src/components/ui/` — 34 composants installés (style new-york)
- **Composants métier :** `src/components/` — PageContainer, EmptyState, StatCard, DataTable, ThemeToggle, ThemeProvider
- **Registry complet :** `.tiple/conventions/component-registry.md` — TOUJOURS vérifier avant de créer un composant
- **Thème :** Violet profond corporate, dark mode class-based (next-themes), Inter font
- **CSS Variables :** `src/app/globals.css` — tous les tokens (light + dark)
- **Tailwind config :** `tailwind.config.ts` — couleurs, radius, animations

### Règles UI
1. **Réutiliser les composants existants** — vérifier le registry et `src/components/ui/` avant de créer
2. **Respecter les tokens** — utiliser les classes Tailwind sémantiques (`bg-primary`, `text-muted-foreground`, `border-border`)
3. **Pas de couleurs en dur** — toujours passer par les CSS variables/tokens
4. **Dark mode compatible** — tester les deux thèmes

## Conventions
- Index des tags : `.tiple/conventions/_index.md`
- Coding standards : `.tiple/conventions/coding-standards.md`
- Stack technique : `.tiple/conventions/tech-stack.md`
- Stratégie de tests : `.tiple/conventions/testing-strategy.md`
- Registry composants : `.tiple/conventions/component-registry.md`
- Patterns API : `.tiple/conventions/api-patterns.md`
