# Stratégie de Tests — Next.js + Supabase

## Setup

- `vitest.config.ts` avec `@vitejs/plugin-react`, alias `@/`
- `@testing-library/react` + `@testing-library/jest-dom`
- Playwright installé avec `npx playwright install`

## Unit Tests (Vitest)

### Quoi tester
- Server Actions (mock Supabase) — inputs valides, invalides, erreurs
- Zod schemas — valeurs valides, edge cases, messages d'erreur custom
- Hooks custom — comportement, états, effets
- Utils — fonctions pures, cas limites

### Où
- `tests/unit/` ou colocalisés (`fichier.test.ts` à côté du fichier)

### Mocker Supabase

```typescript
// tests/unit/actions/projects.test.ts
import { vi, describe, it, expect } from "vitest"
import { createProjectAction } from "@/lib/actions/projects"

// Mock le module Supabase server
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => ({
        data: { user: { id: "user-123" } },
      })),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: "project-1", name: "Test" },
            error: null,
          })),
        })),
      })),
    })),
  })),
}))

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

describe("createProjectAction", () => {
  it("crée un projet avec des données valides", async () => {
    const formData = new FormData()
    formData.set("name", "Mon projet")
    const result = await createProjectAction(formData)
    expect(result.data).toBeDefined()
  })
})
```

### Couverture cible
- \>80% sur `lib/actions/` et `lib/schemas/`

## Integration Tests (Vitest + Testing Library)

### Quoi tester
- Composants form complets : render → fill → submit → vérifier résultat
- Composants avec état : interactions user, transitions d'état

### Mocking
- Supabase client mocké
- Server Actions mockées pour les tests composants

### Où
- `tests/integration/`

```typescript
// tests/integration/login-form.test.tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LoginForm } from "@/components/auth/login-form"

describe("LoginForm", () => {
  it("affiche une erreur si email invalide", async () => {
    render(<LoginForm />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/email/i), "pas-un-email")
    await user.click(screen.getByRole("button", { name: /connexion/i }))

    expect(screen.getByText(/email invalide/i)).toBeInTheDocument()
  })
})
```

## E2E Tests (Playwright)

### Quoi tester
- Parcours critiques uniquement : login, CRUD principal, parcours de valeur core
- Pas de tests pour chaque edge case — c'est le rôle des unit/integ

### Environnement
- Supabase local (`npx supabase start`) ou projet staging dédié
- Seed : script dans `supabase/seed.sql` pour données reproductibles

### Où
- `tests/e2e/`
- Convention : un fichier par feature (`auth.spec.ts`, `projects.spec.ts`)

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from "@playwright/test"

test("login avec credentials valides", async ({ page }) => {
  await page.goto("/login")
  await page.fill('[name="email"]', "test@example.com")
  await page.fill('[name="password"]', "password123")
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL("/dashboard")
})
```

## Non-régression

- Avant chaque merge : TOUS les tests existants doivent passer
- CI minimale : `pnpm test` (unit + integ) sur chaque push
- E2E : avant chaque mise en prod (pas sur chaque push)

## Ce qu'on ne teste PAS

- Les composants Shadcn/ui (déjà testés en amont)
- Le CSS / le rendu pixel-perfect (les tests e2e vérifient les flows, pas le style)
- Les fonctions Supabase internes (RLS, triggers) → testées via l'app, pas en isolation

<!-- PERSONNALISER : ajouter les stratégies spécifiques au projet -->
