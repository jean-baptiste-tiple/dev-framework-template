---
name: monitoring
description: Use when adding error tracking, analytics, health checks, logging, or observability instrumentation.
---

Consult [.tiple/conventions/monitoring-patterns.md](.tiple/conventions/monitoring-patterns.md) for the full patterns. Load it before writing logging/tracking code.

Key invariants:
- Capturer les erreurs inattendues (catch blocks, error boundaries) ; pas les erreurs de validation attendues
- Ne JAMAIS logger de PII (mots de passe, tokens, emails en clair, données personnelles)
- Ajouter du contexte (userId, action) mais filtré — utile au debug, pas un risque RGPD
