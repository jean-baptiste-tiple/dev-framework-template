---
name: nextjs
description: Use when creating App Router pages, layouts, loading/error files, route groups, or dynamic routes in Next.js 15.
---

Consult [.tiple/conventions/nextjs-patterns.md](.tiple/conventions/nextjs-patterns.md) for the full patterns. Load it before writing App Router code.

Key invariants:
- Server Components par défaut — `"use client"` uniquement si state/effects/event handlers, poussé le plus bas possible
- Server Actions pour les mutations, pas d'API routes (sauf webhooks/cron)
- Route group avec `layout.tsx` DOIT avoir un `page.tsx` sinon le build échoue
