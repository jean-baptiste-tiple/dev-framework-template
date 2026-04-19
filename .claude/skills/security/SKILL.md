---
name: security
description: "Sécurité : inputs users, secrets, rate limiting, XSS, CSRF, validation Zod serveur, données sensibles. FR : sécurité, limite de taux, injection, faille, validation serveur, secret exposé."
---

Consult [.tiple/conventions/security-patterns.md](.tiple/conventions/security-patterns.md) for the full patterns. Load it before writing security-sensitive code.

Key invariants:
- Ne jamais faire confiance au client — toute donnée du navigateur est suspecte
- Valider côté serveur avec Zod en PREMIER (client = confort UX, pas sécurité)
- Défense en profondeur : middleware + Server Action + RLS
