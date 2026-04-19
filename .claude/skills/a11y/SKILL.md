---
name: a11y
description: Use when building interactive UI — forms, buttons, modals, menus — or checking WCAG compliance, ARIA, keyboard nav, or focus management.
---

Consult [.tiple/conventions/accessibility-patterns.md](.tiple/conventions/accessibility-patterns.md) for the full patterns. Load it before writing interactive components.

Key invariants:
- HTML sémantique d'abord (`<button>`, `<nav>`, `<main>`), ARIA seulement en complément
- Toute action clavier-accessible ; focus trap dans les dialogs (géré par Shadcn/Radix)
- Contraste WCAG AA minimum (4.5:1 texte, 3:1 UI) ; labels associés à chaque input
