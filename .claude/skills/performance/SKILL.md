---
name: performance
description: Use when optimizing bundle size, Web Vitals, code splitting, image/font loading, or lazy loading.
---

Consult [.tiple/conventions/performance-patterns.md](.tiple/conventions/performance-patterns.md) for the full patterns. Load it before optimizing.

Key invariants:
- Mesurer avant d'optimiser — Lighthouse + Web Vitals, pas de devinettes
- Server Components par défaut (zéro JS côté client = meilleure perf)
- Imports nommés, tree-shaking ESM ; `date-fns` > `moment`, natif > lodash
