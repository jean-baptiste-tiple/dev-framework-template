---
name: supabase
description: Use when working with Supabase Storage, RLS policies, database triggers, RPC functions, or error codes.
---

Consult [.tiple/conventions/supabase-patterns.md](.tiple/conventions/supabase-patterns.md) for the full patterns. Load it before writing Supabase code.

Key invariants:
- RLS activée sur TOUTE table — sans exception (ADR obligatoire pour dérogation)
- Pas de `service_role` sauf cas documenté par ADR
- USING filtre les lignes visibles, WITH CHECK valide les données insérées/modifiées
