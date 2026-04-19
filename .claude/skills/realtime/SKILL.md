---
name: realtime
description: "Realtime : Supabase Realtime subscriptions, presence, channels, live updates, websocket. FR : temps réel, abonnement, souscription, mise à jour live, canal realtime."
---

Consult [.tiple/conventions/supabase-patterns.md](.tiple/conventions/supabase-patterns.md) (section Realtime) for the full patterns. Load it before writing realtime code.

Key invariants:
- Toujours cleanup : `removeChannel` dans le `return` du `useEffect`
- Un channel par composant — pas de channel global sans justification
- Filtrer les events côté serveur — ne pas écouter toute la table
