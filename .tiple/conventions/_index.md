# Index des conventions

> **Source de vérité unique du routing `fichier → tag → convention`.**
> Lu par le skill `tm-dev` (avant d'écrire) et par le skill `tm-review` (avant de reviewer).
> Ne PAS dupliquer ce mapping ailleurs — ni dans une commande, ni dans un skill, ni dans `CLAUDE.md`.

## Conventions de base (toujours lues)

| Fichier | Description |
|---------|-------------|
| `coding-standards.md` | Naming, structure, imports, error handling, complexité |
| `component-registry.md` | Registry DRY — vérifier avant de créer |
| `tech-stack.md` | Versions exactes de la stack |

## Conventions par tag

La colonne **Globs** est la règle de routing : si un fichier touché (créé ou modifié) matche
un glob, le tag est actif et son fichier de conventions **doit être lu en entier**.

En mode story, les tags déclarés dans le champ `Conventions` de la story s'ajoutent aux tags
déduits des globs — l'union des deux est chargée.

| Tag | Fichier | Globs | Description |
|-----|---------|-------|-------------|
| `auth` | `auth-patterns.md` | `src/middleware.ts`, `src/app/(auth)/**`, `src/lib/actions/auth*.ts`, `src/lib/supabase/**` | Signup, login, reset, session, OAuth |
| `database` | `database-patterns.md` | `supabase/migrations/**`, `supabase/seed.sql`, `src/types/database.ts` | Migrations, transactions, indexes, naming, soft deletes |
| `supabase` | `supabase-patterns.md` | `src/lib/supabase/**`, `supabase/**` | Storage, RLS avancé, triggers, realtime, error codes |
| `api` | `api-patterns.md` | `src/lib/actions/**`, `src/lib/schemas/**`, `src/app/api/**` | Server Actions, fetch, pagination, caching |
| `forms` | `api-patterns.md` | `src/lib/schemas/**`, `src/components/**/*form*.tsx` | Formulaires RHF + Zod + Server Actions, validation async |
| `realtime` | `supabase-patterns.md` | `src/hooks/**realtime**`, `src/hooks/**subscription**` | Subscriptions, presence, cleanup |
| `security` | `security-patterns.md` | `src/lib/actions/**`, `src/app/api/**`, `src/middleware.ts`, `.env.example` | XSS, CSRF, rate limiting, secrets, validation serveur |
| `nextjs` | `nextjs-patterns.md` | `src/app/**/page.tsx`, `src/app/**/layout.tsx`, `src/app/**/loading.tsx`, `src/app/**/error.tsx`, `src/app/**/not-found.tsx`, `next.config.ts` | App Router, layouts, loading, error, routes dynamiques |
| `typescript` | `typescript-patterns.md` | `src/types/**`, `tsconfig.json` | Utility types, unions, branded types, generics |
| `state` | `state-management.md` | `src/hooks/**`, `src/components/**/*provider*.tsx` | URL state, context, composant state, mémo |
| `feedback` | `feedback-patterns.md` | `src/components/ui/toast*.tsx`, `src/components/ui/sonner.tsx`, `src/components/ui/*dialog*.tsx` | Toasts, dialogs, confirmations, notifications |
| `performance` | `performance-patterns.md` | `next.config.ts`, `src/app/**/loading.tsx`, `src/components/**/*chart*.tsx` | Code splitting, Web Vitals, bundle, images, fonts |
| `tables` | `api-patterns.md` | `src/components/**/*table*.tsx` | Tri, filtres, sélection, bulk actions, pagination |
| `uploads` | `api-patterns.md` | `src/components/**/*upload*.tsx`, `src/lib/actions/*upload*.ts` | File upload, Supabase Storage, validation |
| `seo` | `seo-patterns.md` | `src/app/**/sitemap.ts`, `src/app/**/robots.ts`, `src/app/**/opengraph-image.*`, `src/app/**/layout.tsx` | Metadata API, Open Graph, sitemap, structured data |
| `a11y` | `accessibility-patterns.md` | `src/components/**/*.tsx`, `src/app/**/*.tsx` | WCAG, ARIA, keyboard, focus, contrast |
| `i18n` | `i18n-patterns.md` | `messages/**`, `src/i18n/**`, `src/middleware.ts` | Traductions, pluriel, dates, devises, RTL |
| `datetime` | `datetime-patterns.md` | `src/lib/utils/*date*.ts`, `src/lib/utils/*format*.ts`, `src/lib/utils/*currency*.ts` | Dates, heures, timezones, formatage, devises |
| `monitoring` | `monitoring-patterns.md` | `instrumentation.ts`, `sentry.*.config.ts`, `src/app/**/error.tsx`, `src/app/**/global-error.tsx`, `src/app/api/health/**` | Error tracking, analytics, health checks, logs |
| `flags` | `feature-flags-patterns.md` | `src/lib/flags/**`, `src/lib/*flag*.ts` | Feature flags, A/B testing, rollouts |
| `deploy` | `deployment-patterns.md` | `.github/workflows/**`, `vercel.json`, `.env.example`, `supabase/config.toml` | Environnements, rollback, migrations, secrets |
| `testing` | `testing-strategy.md` | `tests/**`, `**/*.test.ts`, `**/*.test.tsx`, `vitest.config.ts`, `playwright.config.ts` | Unit, integ, E2E, mocks, fixtures, coverage |

## Règles de routing

1. **Un fichier peut activer plusieurs tags** — charger tous les fichiers de conventions correspondants (dédupliqués : plusieurs tags pointent vers le même fichier).
2. **Aucun glob ne matche** → seules les conventions de base s'appliquent. Ce n'est pas une erreur.
3. **Annoncer les conventions chargées** avant d'agir : `Conventions chargées : coding-standards, component-registry, tech-stack, api-patterns, security-patterns`. Si la liste est vide au-delà des bases, le dire aussi.
4. **Lire le fichier en entier**, pas un résumé. Les skills `.claude/skills/<tag>/` ne contiennent aucune règle — ce sont des pointeurs vers ce tableau.
5. **Ajouter un tag** = ajouter une ligne ici + créer `.claude/skills/<tag>/SKILL.md` + le fichier de conventions. `pnpm check:framework` vérifie la cohérence des trois.
