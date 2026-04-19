---
name: uploads
description: "Uploads de fichiers : file upload, Supabase Storage, validation taille/mime, drag and drop. FR : upload, téléversement, fichier, image, pièce jointe, validation fichier."
---

Consult [.tiple/conventions/api-patterns.md](.tiple/conventions/api-patterns.md) (section Uploads) for the full patterns. Load it before writing upload code.

Key invariants:
- Validation côté serveur : taille max, mime-type (pas seulement l'extension)
- RLS sur le bucket Supabase Storage — même logique que les tables
- Nom de fichier sanitizé (pas de path traversal), upload par userId/projectId
