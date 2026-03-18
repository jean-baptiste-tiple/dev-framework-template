# Readiness Gate — Prêt à coder ?

<!-- Passer cette checklist avec /tm-gate ou à la fin de /tm-plan.
     TOUS les items doivent être ✅ avant de commencer à implémenter. -->

## Documents

- [ ] `docs/brief.md` est rempli et validé
- [ ] `docs/prd.md` est rempli, chaque FR a un ID et des AC
- [ ] `docs/architecture.md` est rempli, modèle de données défini
- [ ] `docs/design/system.md` a les tokens (couleurs, typo, spacing)
- [ ] Au moins 1 epic existe dans `docs/epics/`
- [ ] Au moins 1 story 🟢 Ready existe dans `docs/stories/`

## Cohérence

- [ ] Chaque FR du PRD est couvert par au moins une story
- [ ] Chaque story référence les FRs du PRD qu'elle implémente
- [ ] Le modèle de données couvre les entités nécessaires aux stories Ready
- [ ] Les RLS policies sont définies pour chaque table du modèle
- [ ] Les stories ont des AC en format Given/When/Then

## Conventions

- [ ] `.tiple/conventions/tech-stack.md` est à jour
- [ ] `.tiple/conventions/coding-standards.md` est personnalisé si nécessaire
- [ ] `.tiple/conventions/component-registry.md` existe avec la structure de base

## Infra minimale

- [ ] `pnpm install` fonctionne sans erreur
- [ ] `pnpm dev` démarre le serveur Next.js
- [ ] `pnpm type-check` passe
- [ ] `pnpm test` fonctionne (même si 0 tests)
- [ ] `.env.local` est configuré avec les clés Supabase
- [ ] Le middleware auth redirige correctement vers /login
