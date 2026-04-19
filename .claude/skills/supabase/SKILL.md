---
name: supabase
description: "Supabase : Storage, RLS policies, triggers DB, fonctions RPC, error codes, postgres. FR : policy RLS, bucket Storage, fonction stockée, trigger DB, code erreur Supabase."
---

Consult [.tiple/conventions/supabase-patterns.md](.tiple/conventions/supabase-patterns.md) for the full patterns. Load it before writing Supabase code.

Key invariants:
- RLS activée sur TOUTE table — sans exception (ADR obligatoire pour dérogation)
- Pas de `service_role` sauf cas documenté par ADR
- USING filtre les lignes visibles, WITH CHECK valide les données insérées/modifiées
