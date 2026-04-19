---
name: datetime
description: Use when handling dates, times, timezones, date formatting, currency formatting, or monetary amounts.
---

Consult [.tiple/conventions/datetime-patterns.md](.tiple/conventions/datetime-patterns.md) for the full patterns. Load it before writing date/money code.

Key invariants:
- Stockage toujours en UTC (`timestamptz`), affichage toujours en locale utilisateur via `Intl`
- Argent toujours en centimes (int), formaté avec `Intl.NumberFormat`
- Pas de `moment.js` — utiliser `date-fns` ou API natives
