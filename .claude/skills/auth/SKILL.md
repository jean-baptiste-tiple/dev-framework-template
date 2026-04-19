---
name: auth
description: Use when implementing signup, login, logout, password reset, session management, OAuth, or auth middleware with Supabase Auth.
---

Consult [.tiple/conventions/auth-patterns.md](.tiple/conventions/auth-patterns.md) for the full patterns. Load it before writing auth code.

Key invariants:
- Vérifier l'auth dans CHAQUE Server Action — le middleware ne suffit pas
- Messages génériques côté client ("Email ou mot de passe incorrect"), jamais révéler l'existence d'un compte
- Rate limiting sur login/signup/reset (5 tentatives / minute / IP)
