---
name: flags
description: "Feature flags : flags, A/B testing, rollouts progressifs, gating, toggles. FR : feature flag, drapeau, A/B test, déploiement progressif, toggle, activation."
---

Consult [.tiple/conventions/feature-flags-patterns.md](.tiple/conventions/feature-flags-patterns.md) for the full patterns. Load it before adding a flag.

Key invariants:
- Nommage clair en snake_case (`new_dashboard`, `beta_editor`) ; un flag = une feature
- Nettoyer : supprimer le flag ET le code associé quand la feature est stable
- Tester les deux chemins (avec et sans le flag), pas de flags imbriqués
