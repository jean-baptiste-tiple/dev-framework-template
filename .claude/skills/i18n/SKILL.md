---
name: i18n
description: Use when adding translations, handling plurals, formatting dates/currencies by locale, or supporting RTL.
---

Consult [.tiple/conventions/i18n-patterns.md](.tiple/conventions/i18n-patterns.md) for the full patterns. Load it before writing i18n code.

Key invariants:
- Pas de texte en dur dans le JSX — toujours une clé de traduction
- Clés en anglais (snake_case ou camelCase, cohérent), un namespace par domaine
- Dates/nombres/devises via `Intl` (voir skill `datetime`)
