---
name: feedback
description: "Feedback UI : toasts, dialogs, confirmations, notifications, alertes, modales. FR : notification, confirmation, boîte de dialogue, alerte, message utilisateur, modale."
---

Consult [.tiple/conventions/feedback-patterns.md](.tiple/conventions/feedback-patterns.md) for the full patterns. Load it before writing feedback UI.

Key invariants:
- Pas de toast pour les erreurs de validation de formulaire → errors inline
- Confirmation obligatoire pour : suppression, envoi d'email, actions irréversibles
- Toast 5s par défaut / 8s pour erreurs ; bouton destructif à droite dans un dialog
