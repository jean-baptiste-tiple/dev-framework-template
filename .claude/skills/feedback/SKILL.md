---
name: feedback
description: Use when adding toasts, dialogs, confirmations, or any user feedback after a mutation or action.
---

Consult [.tiple/conventions/feedback-patterns.md](.tiple/conventions/feedback-patterns.md) for the full patterns. Load it before writing feedback UI.

Key invariants:
- Pas de toast pour les erreurs de validation de formulaire → errors inline
- Confirmation obligatoire pour : suppression, envoi d'email, actions irréversibles
- Toast 5s par défaut / 8s pour erreurs ; bouton destructif à droite dans un dialog
