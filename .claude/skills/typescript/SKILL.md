---
name: typescript
description: Use when writing TypeScript types, generics, utility types, unions, branded types, or type guards.
---

Consult [.tiple/conventions/typescript-patterns.md](.tiple/conventions/typescript-patterns.md) for the full patterns. Load it before writing non-trivial types.

Key invariants:
- Jamais de `any` — utiliser `unknown` + type guard
- `const` par défaut, `let` uniquement si réassignation, jamais `var`
- Pas de `as` assertion sauf cas documenté (ex: Supabase types générés)
