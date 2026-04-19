---
name: tables
description: Use when building data tables with sorting, filtering, selection, bulk actions, or pagination.
---

Consult [.tiple/conventions/api-patterns.md](.tiple/conventions/api-patterns.md) (sections Tables / Pagination) for the full patterns. Load it before writing table logic.

Key invariants:
- Filtres et pagination dans l'URL (query params) — state partageable par lien
- Pagination serveur (`range()` Supabase), pas de load-all puis filtrer côté client
- Bulk actions : confirmation obligatoire, passer les IDs (pas "all") au serveur
