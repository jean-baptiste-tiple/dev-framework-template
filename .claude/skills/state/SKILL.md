---
name: state
description: Use when deciding where state lives — server, URL, React state, or Context — or when creating providers.
---

Consult [.tiple/conventions/state-management.md](.tiple/conventions/state-management.md) for the full patterns. Load it before adding new state.

Key invariants:
- Hiérarchie : Server (Supabase) > URL (query params) > React state > Context
- Pas de state côté client pour ce qui vient du serveur — Server Components fetchent directement
- Un provider par préoccupation, placé le plus bas possible dans l'arbre
