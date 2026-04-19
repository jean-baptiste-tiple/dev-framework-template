---
name: forms
description: "Formulaires : React Hook Form, Zod validation, Server Action submit, validation async, erreurs inline. FR : formulaire, form, champ, validation, soumission, erreur de saisie."
---

Consult [.tiple/conventions/api-patterns.md](.tiple/conventions/api-patterns.md) (section Forms) for the full patterns. Load it before writing form code.

Key invariants:
- Un schéma Zod dans `lib/schemas/` = validé côté form ET côté Server Action (source unique)
- Errors inline dans le form (pas de toast pour la validation)
- Bouton submit désactivé pendant `isSubmitting`, pas de double-submit
