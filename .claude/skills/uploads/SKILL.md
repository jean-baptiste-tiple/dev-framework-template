---
name: uploads
description: Use when implementing file uploads, Supabase Storage integration, or file validation (size/mime).
---

Consult [.tiple/conventions/api-patterns.md](.tiple/conventions/api-patterns.md) (section Uploads) for the full patterns. Load it before writing upload code.

Key invariants:
- Validation côté serveur : taille max, mime-type (pas seulement l'extension)
- RLS sur le bucket Supabase Storage — même logique que les tables
- Nom de fichier sanitizé (pas de path traversal), upload par userId/projectId
