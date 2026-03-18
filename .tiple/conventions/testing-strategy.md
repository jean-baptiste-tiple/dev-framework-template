# Stratégie de Tests — Next.js + Supabase

## Setup

- `vitest.config.ts` avec `@vitejs/plugin-react`, resolve alias `@/`
- `@testing-library/react` + `@testing-library/jest-dom`
- Playwright installé avec `npx playwright install`

## Unit Tests (Vitest)

- **Quoi :** Server Actions (mock Supabase), Zod schemas (edge cases), hooks custom, utils
- **Où :** `tests/unit/` ou colocalisés (fichier.test.ts à côté du fichier)
- **Mock Supabase :** `vi.mock("@/lib/supabase/server")` → retourner des réponses fake
- **Couverture cible :** >80% sur `lib/actions/` et `lib/schemas/`

### Exemple mock Supabase

```typescript
import { vi } from "vitest"

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => ({
        data: { user: { id: "test-user-id", email: "test@test.com" } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(() => ({ data: { id: 1 }, error: null })),
    })),
  })),
}))
```

## Integration Tests (Vitest + Testing Library)

- **Quoi :** Composants form complets (render → fill → submit → vérifier résultat)
- **Mock :** Supabase client mocké, Server Actions mockées pour les tests composants
- **Où :** `tests/integration/`

## E2E Tests (Playwright)

- **Quoi :** Parcours critiques uniquement (login, CRUD principal, parcours de valeur core)
- **Env :** Supabase local (`npx supabase start`) ou projet staging dédié
- **Seed :** Script de seed pour données de test reproductibles
- **Où :** `tests/e2e/`
- **Convention :** un fichier par feature (`auth.spec.ts`, `projects.spec.ts`)

## Non-régression

- Avant chaque merge : TOUS les tests existants doivent passer
- CI minimale : `pnpm test` (unit + integ) sur chaque push
- E2E : avant chaque mise en prod (pas sur chaque push)

## Ce qu'on ne teste PAS

- Les composants Shadcn/ui (déjà testés en amont)
- Le CSS / le rendu pixel-perfect (les tests e2e vérifient les flows, pas le style)
- Les fonctions Supabase internes (RLS, triggers) → testées via l'app, pas en isolation

<!-- PERSONNALISER : adapter la stratégie au projet -->
