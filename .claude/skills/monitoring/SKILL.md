---
name: monitoring
description: "Observability : error tracking (Sentry), analytics, health checks, logging, instrumentation. FR : monitoring, erreurs, logs, suivi d'erreurs, analyse, santé, observabilité."
---

Consult [.tiple/conventions/monitoring-patterns.md](.tiple/conventions/monitoring-patterns.md) for the full patterns. Load it before writing logging/tracking code.

Key invariants:
- Capturer les erreurs inattendues (catch blocks, error boundaries) ; pas les erreurs de validation attendues
- Ne JAMAIS logger de PII (mots de passe, tokens, emails en clair, données personnelles)
- Ajouter du contexte (userId, action) mais filtré — utile au debug, pas un risque RGPD
