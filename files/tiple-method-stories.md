# Epics & Stories — Tiple Method Template

> Découpage en stories exécutables par Claude Code.
> Chaque story peut être implémentée avec `/tm-dev` (ou directement).
> Les stories sont ordonnées pour exécution séquentielle autonome.

---

## E01 — Fondation

### E01-S01 — Structure de dossiers + .gitignore + .env.example

**Status :** 🟢 Ready
**Estimation :** S

**Ce qu'il faut faire :**
Créer toute l'arborescence de dossiers avec les `.gitkeep` là où les dossiers sont vides. Créer le `.gitignore` adapté Next.js + Supabase + Tiple Method. Créer le `.env.example` avec toutes les variables commentées.

**Fichiers à créer :**
- `.gitignore`
- `.env.example`
- `docs/brief.md` (stub : 3 lignes, pointe vers `/tm-brief`)
- `docs/prd.md` (stub)
- `docs/architecture.md` (stub)
- `docs/changelog.md` (structure vide avec header + format d'entrée en exemple commenté)
- `docs/design/system.md` (template design system avec structure tokens : colors, spacing, typography, radius, breakpoints — valeurs placeholder)
- `docs/design/flows/.gitkeep`
- `docs/design/screens/.gitkeep`
- `docs/epics/_index.md` (stub avec structure : tableau priorités + dépendances)
- `docs/epics/.gitkeep`
- `docs/stories/.gitkeep`
- `docs/decisions/.gitkeep`
- `.tiple/sprint/status.md` (template sprint vide avec structure)
- `tests/unit/.gitkeep`
- `tests/integration/.gitkeep`
- `tests/e2e/.gitkeep`

**Acceptance Criteria :**
- [ ] Tous les dossiers existent
- [ ] Chaque stub a 3-5 lignes qui expliquent son rôle et la commande pour le remplir
- [ ] Le .gitignore couvre : node_modules, .next, .env*.local, .supabase, test-results, playwright-report, .DS_Store
- [ ] Le .env.example a les variables Supabase + App + Supabase CLI avec commentaires

---

### E01-S02 — CLAUDE.md

**Status :** 🟢 Ready
**Estimation :** M

**Ce qu'il faut faire :**
Créer le CLAUDE.md < 150 lignes avec toutes les sections décrites dans le PRD (section 3.1). C'est le fichier le plus important du template.

**Fichiers à créer :**
- `CLAUDE.md`

**Acceptance Criteria :**
- [ ] < 150 lignes
- [ ] Section Projet avec placeholder à remplir
- [ ] Section Stack (Next.js 15 + Supabase + TS + Tailwind + Shadcn)
- [ ] Section Méthode (1 phrase + pointeur docs/)
- [ ] 7 règles absolues (section 3.1.1 du PRD)
- [ ] 6 règles techniques Next.js + Supabase (section 3.1.2 du PRD)
- [ ] Workflow quotidien (résumé 10 lignes)
- [ ] Process évolution PRD (résumé 7 étapes)
- [ ] Process nouveau composant (4 étapes)
- [ ] Section Conventions (pointe vers .tiple/conventions/)
- [ ] Aucune règle n'est dupliquée — renvoie vers les fichiers pour le détail

---

### E01-S03 — README.md

**Status :** 🟢 Ready
**Estimation :** S

**Ce qu'il faut faire :**
Créer le README qui explique le template : ce que c'est, comment démarrer, le workflow, les commandes, la structure.

**Fichiers à créer :**
- `README.md`

**Acceptance Criteria :**
- [ ] Titre + description 3 phrases
- [ ] Quick start (clone, pnpm install, configurer .env, pnpm dev)
- [ ] Schéma ASCII du workflow (phases 1→8)
- [ ] Tableau des 12 commandes /tm-* avec description 1 ligne
- [ ] Arborescence des dossiers (version simplifiée)
- [ ] Section "Personnaliser le template" (quoi changer après clone)

---

## E02 — Scaffolding Next.js + Supabase

### E02-S01 — Fichiers de config (package.json, tsconfig, tailwind, etc.)

**Status :** 🟢 Ready
**Estimation :** M

**Ce qu'il faut faire :**
Créer tous les fichiers de configuration du projet Next.js. Le `package.json` doit lister toutes les dépendances avec versions et les scripts. Les configs doivent être fonctionnelles.

**Fichiers à créer :**
- `package.json` — toutes les deps listées dans l'architecture (section 2), tous les scripts (dev, build, test, db:types, db:migrate, db:push, db:reset, lint, type-check)
- `next.config.ts` — config minimale
- `tsconfig.json` — strict true, alias `@/*` → `./src/*`, target ES2017+
- `tailwind.config.ts` — config avec les CSS custom properties Shadcn/ui
- `postcss.config.js` — standard
- `vitest.config.ts` — plugin react, alias @/, include tests/**
- `playwright.config.ts` — baseURL localhost:3000, webServer qui lance next dev
- `components.json` — config Shadcn/ui (alias @/components/ui, tailwind CSS variables)

**Acceptance Criteria :**
- [ ] `pnpm install` fonctionne sans erreur (les deps doivent être cohérentes)
- [ ] `pnpm dev` lance le serveur Next.js (après création des fichiers src/ dans E02-S02)
- [ ] `pnpm type-check` passe
- [ ] `pnpm test` fonctionne (même si 0 tests)
- [ ] tsconfig a strict: true et les paths alias
- [ ] vitest.config résout les imports @/

---

### E02-S02 — Code source minimal (src/)

**Status :** 🟢 Ready
**Estimation :** M

**Ce qu'il faut faire :**
Créer les fichiers de code source minimaux pour que le projet démarre. Le middleware auth doit être fonctionnel. Les clients Supabase doivent être corrects.

**Fichiers à créer :**
- `src/middleware.ts` — Auth middleware Supabase complet (refresh token, redirect /login, matcher)
- `src/lib/supabase/server.ts` — `createClient()` async avec cookies Next.js 15
- `src/lib/supabase/client.ts` — `createClient()` browser
- `src/lib/utils/cn.ts` — clsx + tailwind-merge
- `src/app/layout.tsx` — Root layout (html lang="fr", Inter font, globals.css, metadata template)
- `src/app/page.tsx` — Redirect vers /dashboard (ou /login si non auth, géré par middleware)
- `src/app/not-found.tsx` — Page 404 minimale
- `src/app/globals.css` — Import Tailwind + CSS custom properties Shadcn/ui
- `src/app/(auth)/layout.tsx` — Layout centré (flex center, max-w-md)
- `src/app/(dashboard)/layout.tsx` — Layout authentifié (check session, sidebar placeholder + main)
- `src/types/database.ts` — Placeholder commenté (régénérer avec `pnpm db:types`)
- `src/types/index.ts` — Fichier vide avec commentaire
- `src/components/ui/.gitkeep`
- `src/hooks/.gitkeep`
- `src/lib/actions/.gitkeep`
- `src/lib/schemas/.gitkeep`

**Acceptance Criteria :**
- [ ] `pnpm dev` démarre sans erreur
- [ ] Le middleware intercepte les requêtes et gère le refresh token Supabase
- [ ] Le middleware redirige vers /login si non authentifié sur les routes (dashboard)
- [ ] Les clients Supabase suivent le pattern officiel @supabase/ssr pour Next.js 15
- [ ] Le root layout a lang="fr", la font Inter, les metadata avec title template
- [ ] Le layout (auth) centre son contenu
- [ ] Le layout (dashboard) vérifie la session côté serveur
- [ ] Pas de "use client" sauf si strictement nécessaire
- [ ] `pnpm type-check` passe sans erreur

---

### E02-S03 — Config Supabase locale

**Status :** 🟢 Ready
**Estimation :** S

**Fichiers à créer :**
- `supabase/config.toml` — Config standard Supabase CLI (port, project_id placeholder)
- `supabase/migrations/.gitkeep`
- `supabase/seed.sql` — Template commenté avec exemples de seed data

**Acceptance Criteria :**
- [ ] config.toml est valide et a les settings par défaut
- [ ] seed.sql a des commentaires qui expliquent comment ajouter des données de test
- [ ] Le dossier migrations/ existe

---

## E03 — Templates de documents

### E03-S01 — Templates brief + PRD + architecture

**Status :** 🟢 Ready
**Estimation :** M

**Ce qu'il faut faire :**
Les 3 templates de planification. Doivent être suffisamment détaillés pour qu'un LLM produise un bon document, mais pas verbeux. L'architecture template est pré-rempli avec les invariants/flexible Next.js+Supabase.

**Fichiers à créer :**
- `.tiple/templates/brief.tmpl.md`
- `.tiple/templates/prd.tmpl.md`
- `.tiple/templates/architecture.tmpl.md`

**Acceptance Criteria :**
- [ ] brief.tmpl.md a les 7 sections (Problème, Solution, Users, Scope IN/OUT, Contraintes, Métriques, Risques)
- [ ] prd.tmpl.md a les sections avec IDs (FR-XXX-01, NFR-01), statuts (✅🔶⬜), priorités MoSCoW
- [ ] architecture.tmpl.md a les invariants pré-remplis (Next.js, Supabase, TS strict, Server Actions, Zod, migrations)
- [ ] architecture.tmpl.md a la structure de projet src/ pré-remplie
- [ ] architecture.tmpl.md a la section auth pré-remplie (Supabase Auth + RLS + middleware)
- [ ] Chaque template a des instructions `<!-- -->` pour guider le remplissage
- [ ] Pas de section vide sans instruction

---

### E03-S02 — Templates epic + story + ADR

**Status :** 🟢 Ready
**Estimation :** M

**Ce qu'il faut faire :**
Les 3 templates d'exécution. La story template est le plus critique — elle doit contenir tout ce que Claude Code a besoin pour implémenter de manière autonome.

**Fichiers à créer :**
- `.tiple/templates/epic.tmpl.md`
- `.tiple/templates/story.tmpl.md`
- `.tiple/templates/adr.tmpl.md`

**Acceptance Criteria :**
- [ ] epic.tmpl.md a : ID, Priorité, Dépendances, PRD Refs, Objectif, Scope IN/OUT, Stories prévues, Design requis
- [ ] story.tmpl.md a : Meta (tableau), Contexte (avec refs PRD/archi/design), AC en Given/When/Then, Implémentation (fichiers à créer/modifier, patterns à suivre), Tests attendus (unit/integ/e2e), Post-implémentation (écarts, registry updates)
- [ ] story.tmpl.md mentionne explicitement de vérifier le component-registry avant de créer
- [ ] adr.tmpl.md a : Titre+numéro, Date, Statut, Contexte, Décision, Conséquences, Alternatives
- [ ] Chaque template a des exemples inline commentés

---

## E04 — Checklists

### E04-S01 — Toutes les checklists

**Status :** 🟢 Ready
**Estimation :** M

**Ce qu'il faut faire :**
Les 5 checklists. Chaque item est une checkbox actionnable. La code-review checklist doit inclure des points spécifiques Next.js + Supabase.

**Fichiers à créer :**
- `.tiple/checklists/readiness-gate.md` — 4 catégories : Documents, Cohérence, Conventions, Infra minimale
- `.tiple/checklists/story-ready.md` — Definition of Ready
- `.tiple/checklists/story-done.md` — Definition of Done (inclut tests)
- `.tiple/checklists/code-review.md` — 7 catégories : DRY, Qualité, Sécurité, Tests, Design, Architecture, Documentation + points Next.js/Supabase spécifiques
- `.tiple/checklists/prd-evolution.md` — 4 catégories : Identification, Impact cascade, Compatibility, Traçabilité

**Acceptance Criteria :**
- [ ] Chaque checklist est une liste de `- [ ]` prête à être cochée
- [ ] code-review.md inclut : Server Component vs Client justifié, pas de mutation Supabase côté client, RLS policies pour nouvelles tables, Zod partagé, middleware pas contourné, revalidatePath après mutations
- [ ] readiness-gate.md vérifie que le project démarre (`pnpm dev` sans erreur)
- [ ] story-done.md vérifie que tous les tests passent (y compris les existants = non-régression)
- [ ] prd-evolution.md inclut le check sur les migrations DB

---

## E05 — Conventions

### E05-S01 — Toutes les conventions

**Status :** 🟢 Ready
**Estimation :** L

**Ce qu'il faut faire :**
Les 5 fichiers de conventions, pré-remplis avec les patterns Next.js + Supabase détaillés dans le PRD (section 3.5). C'est la story la plus lourde en contenu.

**Fichiers à créer :**
- `.tiple/conventions/tech-stack.md` — Tableau complet de la stack avec versions et justifications
- `.tiple/conventions/coding-standards.md` — Naming, structure src/, Server Components vs Client, Server Actions pattern, Supabase client rules, DRY, imports, error handling
- `.tiple/conventions/testing-strategy.md` — Unit (Vitest), Integration (RTL), E2E (Playwright), mock Supabase, non-régression
- `.tiple/conventions/component-registry.md` — Structure vide pré-seedée (cn + Database types), instructions d'utilisation
- `.tiple/conventions/api-patterns.md` — Server Actions standard, ActionResult type, Form pattern (Zod→RHF→Action→revalidate), Fetch pattern (Server Components), Auth pattern (middleware + action), Error handling codes

**Acceptance Criteria :**
- [ ] tech-stack.md a le tableau complet de la section 2 de l'architecture
- [ ] coding-standards.md a la structure src/ commentée complète
- [ ] coding-standards.md a le pattern Server Action avec exemple de code
- [ ] coding-standards.md a les règles Server Component vs Client Component
- [ ] testing-strategy.md explique comment mocker Supabase dans les tests
- [ ] component-registry.md a les tableaux vides avec les bonnes colonnes + cn pré-enregistré
- [ ] api-patterns.md a le type ActionResult<T> défini
- [ ] api-patterns.md a l'exemple complet form → action → revalidate
- [ ] Chaque fichier a des sections `<!-- PERSONNALISER -->`
- [ ] Pas de contenu générique/flou — chaque pattern a un exemple de code concret

---

## E06 — Slash Commands

### E06-S01 — Commandes de planification (brief, prd, architecture, design-system, gate)

**Status :** 🟢 Ready
**Estimation :** M

**Fichiers à créer :**
- `.claude/commands/tm-brief.md` — Discussion interactive → produit docs/brief.md
- `.claude/commands/tm-prd.md` — Lit brief + template → produit docs/prd.md
- `.claude/commands/tm-architecture.md` — Lit PRD + template → produit docs/architecture.md
- `.claude/commands/tm-design-system.md` — Initialise docs/design/system.md
- `.claude/commands/tm-gate.md` — Passe la readiness-gate checklist

**Acceptance Criteria :**
- [ ] Chaque commande < 100 lignes
- [ ] Chaque commande indique quels fichiers lire en input
- [ ] Chaque commande indique quel fichier produire en output
- [ ] /tm-brief est conversationnel (pas un formulaire)
- [ ] /tm-prd et /tm-architecture référencent leurs templates respectifs
- [ ] /tm-gate liste explicitement chaque item de la checklist à vérifier

---

### E06-S02 — Commandes d'exécution (epic, story, dev, review)

**Status :** 🟢 Ready
**Estimation :** L

**Ce qu'il faut faire :**
Les 4 commandes les plus critiques. `/tm-dev` et `/tm-review` sont les plus complexes — voir le PRD section 3.2 pour le détail.

**Fichiers à créer :**
- `.claude/commands/tm-epic.md` — Lit PRD + archi → crée docs/epics/E0X-*.md + MAJ _index.md
- `.claude/commands/tm-story.md` — Lit epic + archi + conventions → crée docs/stories/E0X-S0X-*.md
- `.claude/commands/tm-dev.md` — Le gros : lit story + tout le contexte, implémente, teste, MAJ registry + sprint
- `.claude/commands/tm-review.md` — Lit story + code + checklists, review adversariale, fixes

**Acceptance Criteria :**
- [ ] /tm-dev accepte un identifiant de story ou "next"
- [ ] /tm-dev lit dans cet ordre : story → story-ready checklist → maquette → architecture → component-registry → coding-standards → api-patterns
- [ ] /tm-dev implémente dans l'ordre : schemas → backend → tests unit backend → UI → tests unit UI → page → tests integ → tests e2e
- [ ] /tm-dev vérifie la non-régression (tous les tests existants passent)
- [ ] /tm-dev met à jour : story (post-implémentation), component-registry, sprint status
- [ ] /tm-review accepte un identifiant ou "last"
- [ ] /tm-review passe chaque point de code-review.md avec verdict ✅/❌
- [ ] /tm-review fait une review adversariale (edge cases, sécu, DRY, archi)
- [ ] /tm-review corrige les problèmes trouvés (pas juste les lister)

---

### E06-S03 — Commandes transversales (evolve, status, sprint)

**Status :** 🟢 Ready
**Estimation :** S

**Fichiers à créer :**
- `.claude/commands/tm-evolve.md` — Process évolution PRD (impact analysis + cascade)
- `.claude/commands/tm-status.md` — Affiche .tiple/sprint/status.md, propose les prochaines actions
- `.claude/commands/tm-sprint.md` — Initialise un nouveau sprint dans status.md

**Acceptance Criteria :**
- [ ] /tm-evolve suit le process en 6 étapes du PRD : modifier PRD → checklist prd-evolution → cascader impacts → MAJ changelog
- [ ] /tm-evolve vérifie les impacts sur : architecture, epics, stories, design, DB (migrations)
- [ ] /tm-status affiche le sprint actuel avec les statuts de chaque story
- [ ] /tm-sprint crée une nouvelle section dans status.md avec dates, epic focus, tableau stories vide

---

## E07 — Validation

### E07-S01 — Vérification de cohérence

**Status :** ⬜ Draft (après E01-E06)
**Estimation :** M

**Ce qu'il faut faire :**
Relire tous les fichiers et vérifier :
1. Pas de référence à un fichier qui n'existe pas
2. Les conventions dans coding-standards.md correspondent à la structure dans src/
3. Les checklists sont cohérentes avec les templates (pas d'item qui vérifie quelque chose que le template ne demande pas)
4. Les slash commands référencent les bons fichiers templates/checklists
5. Le CLAUDE.md pointe vers les bons chemins
6. `pnpm install` + `pnpm dev` fonctionnent sans erreur
7. `pnpm type-check` passe
8. `pnpm test` fonctionne (0 tests, 0 erreurs)

---

## Ordre d'exécution pour Claude Code autonome

Pour lancer Claude Code en mode autonome sur 2-3h :

```
Session 1 (fondation + scaffolding) :
  E01-S01 → E01-S02 → E01-S03 → E02-S01 → E02-S02 → E02-S03

Session 2 (méthode) :
  E03-S01 → E03-S02 → E04-S01 → E05-S01

Session 3 (commandes + validation) :
  E06-S01 → E06-S02 → E06-S03 → E07-S01
```

Chaque session fait ~4-6 stories, ce qui est dans la zone de confort de Claude Code (contexte gérable). La session 2 est la plus lourde en contenu (E05-S01 notamment).
