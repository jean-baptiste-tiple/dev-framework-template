# Stack Technique

> Versions et justifications de chaque techno utilisée.

| Techno | Version | Rôle | Justification |
|--------|---------|------|---------------|
| Next.js | 15 (App Router) | Framework fullstack | SSR/SSG, Server Components, Server Actions, routing fichiers |
| React | 19.x | UI | Concurrent features, Server Components natifs |
| TypeScript | 5.x (strict mode) | Typage | Sécurité du code, autocomplétion, refactoring |
| Supabase | Cloud | Backend-as-a-Service | Auth, DB PostgreSQL, RLS, Realtime, Storage |
| @supabase/ssr | latest | Helpers SSR | Gestion cookies Next.js pour auth server-side |
| Tailwind CSS | 4.x | Styling | Utility-first, design system via config, purge auto |
| Shadcn/ui | latest | Composants UI | Copy-paste, personnalisables, accessibles, basés sur Radix |
| Zod | 3.x | Validation | Schemas partagés front/back, inférence TypeScript |
| React Hook Form | 7.x | Formulaires | Performance, intégration Zod via resolver |
| @hookform/resolvers | latest | Bridge RHF ↔ Zod | Validation automatique des forms via schema |
| clsx | latest | Conditional classnames | Composition de classes CSS conditionnelles |
| tailwind-merge | latest | Merge classes | Résolution des conflits Tailwind (ex: `p-2` + `p-4` = `p-4`) |
| Vitest | latest | Tests unit/integ | Rapide, compatible ESM, API Jest-like |
| @testing-library/react | latest | Tests composants | Test du comportement user, pas de l'implémentation |
| @testing-library/jest-dom | latest | Matchers DOM | `.toBeInTheDocument()`, `.toHaveTextContent()`, etc. |
| Playwright | latest | Tests E2E | Cross-browser, fiable, auto-wait |
| pnpm | 9.x | Package manager | Rapide, strict, disk-efficient |
| Supabase CLI | latest | Dev local | Migrations, génération types, dev local |
| ESLint | 9.x | Linting | Qualité du code, règles Next.js |

<!-- PERSONNALISER : ajouter les libs spécifiques au projet ci-dessous -->
<!-- Exemples courants :
| @tanstack/query | 5.x | Data fetching client | Cache, invalidation, optimistic updates |
| date-fns | 3.x | Dates | Manipulation de dates, léger, tree-shakable |
| lucide-react | latest | Icônes | Icônes SVG cohérentes, tree-shakable |
| sonner | latest | Toasts | Notifications toast élégantes |
-->
