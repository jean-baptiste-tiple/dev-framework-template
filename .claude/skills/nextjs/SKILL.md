---
name: nextjs
description: "Next.js 15 App Router : page.tsx, layout.tsx, loading.tsx, error.tsx, route groups, dynamic routes, metadata. FR : page, layout, groupe de routes, route dynamique, App Router."
---

Consult [.tiple/conventions/nextjs-patterns.md](.tiple/conventions/nextjs-patterns.md) for the full patterns. Load it before writing App Router code.

Key invariants:
- Server Components par défaut — `"use client"` uniquement si state/effects/event handlers, poussé le plus bas possible
- Server Actions pour les mutations, pas d'API routes (sauf webhooks/cron)
- Route group avec `layout.tsx` DOIT avoir un `page.tsx` sinon le build échoue
