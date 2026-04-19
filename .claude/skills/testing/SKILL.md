---
name: testing
description: Use when writing unit/integration/E2E tests, mocking Supabase, creating fixtures, or deciding what to test.
---

Consult [.tiple/conventions/testing-strategy.md](.tiple/conventions/testing-strategy.md) for the full patterns. Load it before writing tests.

Key invariants:
- Placement strict : unit → `tests/unit/` ; integration → `tests/integration/` ; e2e → `tests/e2e/`. Ne JAMAIS mélanger.
- Mocker Supabase côté unit/integration (`vi.mock("@/lib/supabase/server")`), vraie DB uniquement en E2E
- Tester le comportement, pas l'implémentation — couverture cible >80% sur `lib/actions/` et `lib/schemas/`
