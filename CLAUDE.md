# CLAUDE.md — Tiple Method

## Style de réponse (CRITIQUE)
- **Réponses courtes, droit au but. Le minimum de mots possibles.**
- Pas de récap qui répète ce que l'user vient de dire. Pas de tableaux décoratifs ni d'emojis sauf si demandé.
- Pas de "voici ce que j'ai fait", pas de phrases d'intro/transition. État du résultat seulement.

## Avant de coder (CRITIQUE)
- **Surfacer les hypothèses, pas les masquer.** Si la story/fix est ambigu ou admet plusieurs interprétations : nommer le doute, proposer les options, demander — ne pas trancher en silence.
- **Edits chirurgicaux.** Chaque ligne changée doit tracer à la demande. Pas de cleanup adjacent, pas de reformatage opportuniste, pas de refacto non demandé. Dead code repéré : le mentionner, pas le supprimer.
- **Critères de succès vérifiables avant d'implémenter.** Reformuler la tâche en checks concrets (test qui reproduit le bug, assertion qui valide la feature, type-check qui passe). Pas de "make it work" flou.
- **Push back quand justifié.** Si une approche plus simple existe ou si la demande crée une dette évidente, le dire avant d'exécuter.

## Projet
<!-- À REMPLIR : Nom du projet, description en 1 ligne -->

## Stack
Next.js 15 (App Router) + TypeScript strict + Tailwind CSS + Shadcn/ui
Backend/DB optionnel : Supabase (à ajouter selon le projet — voir section "Supabase" ci-dessous).
Voir `.tiple/conventions/tech-stack.md` pour les versions exactes.

## Méthode
Ce projet suit la Tiple Method. La documentation dans `docs/` est la source de vérité. Lis les fichiers pertinents avant chaque action.

## Règles absolues
1. Un travail à l'échelle d'un module (nouveau parcours, changement DB, ≥ 6 fichiers) passe par une story 🟢 Ready dans `docs/stories/`. Un fix ou un petit ajout se fait en mode libre — mais **jamais sans conventions chargées ni review**.
2. TOUJOURS lire avant de coder : la story (si applicable), sa référence UI si elle n'est pas `N/A`, `docs/architecture.md`, et les **conventions routées** (voir ci-dessous)
3. Ne JAMAIS créer un composant/hook/util sans vérifier le component-registry d'abord — s'il existe, réutiliser
4. Ne JAMAIS modifier un invariant d'architecture sans créer un ADR dans `docs/decisions/`
5. Les tests sont écrits AVEC le code, pas après — unit d'abord, puis intégration, puis e2e si applicable
6. Après implémentation : review (skill `tm-review`) puis, en mode story, section "Post-implémentation" remplie
7. **Cadrage = documentation uniquement.** Ne JAMAIS installer de dépendances, créer des fichiers de code ou lancer un build pendant un `/tm-plan`. Seuls `docs/` et `.tiple/sprint/` sont modifiés.

## Conventions routées par globs

Les conventions techniques vivent dans `.tiple/conventions/`. Le routing
`fichier touché → tag → fichier de conventions` a **une seule source de vérité** :
la colonne **Globs** de [`.tiple/conventions/_index.md`](.tiple/conventions/_index.md).

- **Base, toujours lues :** `coding-standards.md`, `component-registry.md`, `tech-stack.md`
- **Par globs :** chaque fichier créé ou modifié active des tags → les fichiers correspondants sont lus **en entier**
- **Mode story :** les tags du champ `Conventions` de la story s'ajoutent (union avec les globs)
- **Annoncer les conventions chargées** avant d'implémenter et avant de reviewer

Ne jamais déduire ce mapping de mémoire ni le recopier ailleurs. Les skills `.claude/skills/<tag>/`
sont des **pointeurs sans règles** — la règle est dans le fichier de conventions, nulle part ailleurs.

## Déclencheurs automatiques

Il n'y a rien à taper : les skills se déclenchent sur l'intention. Les slash commands
(`/tm-dev`, `/commit-push`…) restent disponibles comme raccourci explicite.

| Situation | Skill déclenché | Automatique ? |
|---|---|---|
| Modification de code applicatif (`src/`, `tests/`, `supabase/`) | `tm-dev` | oui |
| Fichier touché matchant un glob de `_index.md` | skill du tag → convention lue | oui |
| Fin d'implémentation, avant finalisation | `tm-review` | oui |
| « vérifie », « ça compile ? », après application de fix | `tm-verify` | oui |
| « commit », « push », « envoie », chantier terminé et reviewé | `commit-push` | oui |
| Fin de session / chantier bouclé | `tm-wrap-up` | **propose**, n'exécute pas |
| Cadrage produit (PRD, archi, stories) | `tm-plan` | **non — invocation explicite** |

`tm-plan` n'est jamais auto-déclenché : un cadrage réécrit PRD, architecture et stories. Face à
un besoin produit large, le **proposer** et attendre l'accord.

## Règles avant push
1. Le commit et le push passent par le skill **`commit-push`** : `check:framework` + `type-check` + `lint` + `test`, changelog, commit, push.
2. Ce n'est pas une convention mais un **gate appliqué** : `.claude/hooks/enforce-git-gate.sh` bloque tout `git commit`/`git push` direct. `--no-verify` et `--force` sont bloqués sans échappement possible.
3. Les 4 checks tournent **en local**. La CI ne lance que `pnpm build` (validation Vercel + erreurs spécifiques Linux). Pas de duplication.

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
8. **Review** (OBLIGATOIRE — skill `tm-review`) :
   - Router les conventions par globs sur le diff, les lire, confronter le code aux règles
   - Puis passer `.tiple/checklists/code-review.md` (transverse uniquement)
   - Chaque problème HAUTE/MOYENNE **cite sa source** (`conventions/<fichier>.md § <section>` ou un AC). Sans source → BASSE, non bloquant.
   - Si HAUTE/MOYENNE → corriger, relancer l'étape 7, puis re-reviewer
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

## Skills

Tout vit dans `.claude/skills/` — le dossier `commands` a disparu. Un skill se déclenche
**automatiquement** sur l'intention (voir « Déclencheurs automatiques ») et reste invocable
explicitement en `/<nom>`.

| Skill | Usage | Description |
|-------|-------|-------------|
| `tm-plan` | Cadrage (initial ou évolution) | brief → PRD par parcours → archi → design → epics/stories → gate. Mode détecté auto. **Invocation explicite uniquement.** |
| `tm-dev` | Toute action code | Modes story (`E01-S01`/`next`), fix, feature, refacto, explore (read-only). |
| `tm-review` | Review | Conventions routées par globs, confrontées au diff. Gravité indexée sur la source citée. |
| `tm-verify` | Vérifications | `check:framework` + `type-check` + `lint` + `test`. |
| `commit-push` | Commit & push | Les 4 checks + changelog + commit + push. Seul chemin autorisé (gate par hook). |
| `tm-wrap-up` | Fin de chantier | Capture des apprentissages méta. Propose, n'écrit jamais sans accord. |
| 22 skills de tag | `api`, `auth`, `security`… | Pointeurs vers `.tiple/conventions/` — aucune règle recopiée. |

`pnpm check:framework` vérifie la cohérence de l'ensemble (tags ↔ conventions ↔ skills ↔ hooks
↔ références). Il est exécuté en premier par `commit-push`.

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
