---
name: api
description: "API : Server Actions, data fetching, pagination, caching, revalidatePath, API response. FR : action serveur, requête API, fetch de données, pagination, cache, revalidation."
---

Consult [.tiple/conventions/api-patterns.md](.tiple/conventions/api-patterns.md) for the full patterns. Load it before writing actions or fetch logic.

Key invariants:
- Pattern Server Action : auth → valider Zod → exécuter → `revalidatePath` → retourner `{data}` ou `{error}`
- JAMAIS de `throw` dans une Server Action appelée par un formulaire — retourner `{error}`
- Ne JAMAIS exposer les messages d'erreur Supabase bruts au client
