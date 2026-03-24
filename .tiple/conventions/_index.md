# Index des conventions

> Ce fichier est lu par `/tm-dev` pour charger uniquement les conventions pertinentes à la story en cours.
> Chaque convention a des **tags** — la story déclare ses tags, `/tm-dev` charge les fichiers correspondants.

## Conventions de base (toujours lues)

| Fichier | Description |
|---------|-------------|
| `coding-standards.md` | Naming, structure, imports, error handling, complexité |
| `component-registry.md` | Registry DRY — vérifier avant de créer |
| `tech-stack.md` | Versions exactes de la stack |

## Conventions par tag

| Tag | Fichier | Description |
|-----|---------|-------------|
| `auth` | `auth-patterns.md` | Signup, login, reset, session, OAuth |
| `database` | `database-patterns.md` | Migrations, transactions, indexes, naming, soft deletes |
| `supabase` | `supabase-patterns.md` | Storage, RLS avancé, triggers, realtime, error codes |
| `api` | `api-patterns.md` | Server Actions, fetch, forms, pagination, caching, uploads |
| `forms` | `api-patterns.md` | Formulaires RHF + Zod + Server Actions, validation async |
| `realtime` | `supabase-patterns.md` | Subscriptions, presence, cleanup |
| `security` | `security-patterns.md` | XSS, CSRF, rate limiting, secrets, validation |
| `nextjs` | `nextjs-patterns.md` | App Router, layouts, loading, error, routes dynamiques |
| `typescript` | `typescript-patterns.md` | Utility types, unions, branded types, generics |
| `state` | `state-management.md` | URL state, context, composant state, mémo |
| `feedback` | `feedback-patterns.md` | Toasts, dialogs, confirmations, notifications |
| `performance` | `performance-patterns.md` | Code splitting, Web Vitals, bundle, images, fonts |
| `tables` | `api-patterns.md` | Tri, filtres, sélection, bulk actions, pagination |
| `uploads` | `api-patterns.md` | File upload, Supabase Storage, validation |
| `seo` | `seo-patterns.md` | Metadata API, Open Graph, sitemap, structured data |
| `a11y` | `accessibility-patterns.md` | WCAG, ARIA, keyboard, focus, contrast |
| `i18n` | `i18n-patterns.md` | Traductions, pluriel, dates, devises, RTL |
| `datetime` | `datetime-patterns.md` | Dates, heures, timezones, formatage, devises |
| `monitoring` | `monitoring-patterns.md` | Error tracking, analytics, health checks, logs |
| `flags` | `feature-flags-patterns.md` | Feature flags, A/B testing, rollouts |
| `deploy` | `deployment-patterns.md` | Environnements, rollback, migrations, secrets |
| `testing` | `testing-strategy.md` | Unit, integ, E2E, mocks, fixtures, coverage |
