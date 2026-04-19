---
name: deploy
description: "Déploiement : environnements, migrations staging/prod, rollback, secrets deploy, Vercel, CI. FR : déploiement, environnement, staging, production, rollback, retour arrière, déployer."
---

Consult [.tiple/conventions/deployment-patterns.md](.tiple/conventions/deployment-patterns.md) for the full patterns. Load it before deploying.

Key invariants:
- Jamais de migration destructive sans rollback prévu (code ET database)
- Deploy souvent, deploy petit — une feature à la fois ; jamais le vendredi soir (sauf hotfix critique)
- Monitorer systématiquement après un deploy (erreurs, performance, feedback)
