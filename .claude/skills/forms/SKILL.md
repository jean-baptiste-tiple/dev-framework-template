---
name: forms
description: Use when building forms with React Hook Form, Zod validation, Server Actions submission, or async validation.
---

Consult [.tiple/conventions/api-patterns.md](.tiple/conventions/api-patterns.md) (section Forms) for the full patterns. Load it before writing form code.

Key invariants:
- Un schéma Zod dans `lib/schemas/` = validé côté form ET côté Server Action (source unique)
- Errors inline dans le form (pas de toast pour la validation)
- Bouton submit désactivé pendant `isSubmitting`, pas de double-submit
