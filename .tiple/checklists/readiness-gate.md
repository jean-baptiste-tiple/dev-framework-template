# Readiness Gate — Checklist avant de coder

> Vérifier TOUS les points avant de commencer la première story.

## Documents

- [ ] `docs/brief.md` est rempli et validé (pas un stub)
- [ ] `docs/prd.md` est rempli avec au moins les sections 1-5 en statut ✅ ou 🔶
- [ ] `docs/architecture.md` est rempli avec les sections 1-6 minimum
- [ ] Au moins une epic existe dans `docs/epics/`
- [ ] Au moins une story en statut 🟢 Ready existe dans `docs/stories/`

## Cohérence

- [ ] Les FRs du PRD sont couverts par au moins une epic
- [ ] Les epics ont des stories associées
- [ ] Les stories référencent les bons FRs et sections d'architecture
- [ ] `docs/design/system.md` a les tokens visuels définis (couleurs, typo, spacing)
- [ ] Les maquettes référencées dans les stories existent dans `docs/design/`

## Conventions

- [ ] `.tiple/conventions/tech-stack.md` est personnalisé pour le projet
- [ ] `.tiple/conventions/coding-standards.md` est relu et adapté si nécessaire
- [ ] `.tiple/conventions/component-registry.md` a les colonnes correctes

## Infra minimale

- [ ] `pnpm install` s'exécute sans erreur
- [ ] `pnpm dev` démarre le serveur Next.js sans erreur
- [ ] `pnpm type-check` passe sans erreur
- [ ] `pnpm test` fonctionne (même avec 0 tests)
- [ ] `.env.local` est configuré avec les variables Supabase
- [ ] La connexion Supabase fonctionne (le middleware ne crashe pas)
