---
name: auth
description: "Authentification : login, signup, signin, logout, password reset, session, OAuth, middleware auth, callback. FR : connexion, inscription, déconnexion, mot de passe oublié, authentification, session utilisateur."
---

Consult [.tiple/conventions/auth-patterns.md](.tiple/conventions/auth-patterns.md) for the full patterns. Load it before writing auth code.

Key invariants:
- Vérifier l'auth dans CHAQUE Server Action — le middleware ne suffit pas
- Messages génériques côté client ("Email ou mot de passe incorrect"), jamais révéler l'existence d'un compte
- Rate limiting sur login/signup/reset (5 tentatives / minute / IP)
