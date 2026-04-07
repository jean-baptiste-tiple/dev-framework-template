# Readiness Gate — Prêt à coder ?

<!-- Passer cette checklist avec /tm-gate ou à la fin de /tm-plan.
     TOUS les items doivent être ✅ avant de commencer à implémenter. -->

## Documents

- [ ] `docs/brief.md` est rempli et validé
- [ ] `docs/prd.md` est rempli, organisé par parcours utilisateur
- [ ] `docs/architecture.md` est rempli, modèle de données défini
- [ ] `docs/design/system.md` a les tokens (couleurs, typo, spacing)
- [ ] Au moins 1 epic existe dans `docs/epics/`
- [ ] Au moins 1 story 🟢 Ready existe dans `docs/stories/`

## Parcours & Design

- [ ] Chaque parcours du PRD a un flow Mermaid
- [ ] Chaque parcours a une référence UI (maquettes, description, ou N/A)
- [ ] (si maquettes) Les écrans JSX existent dans `docs/design/screens/`
- [ ] (si maquettes) `docs/design/screens/_index.md` est à jour (inventaire)
- [ ] (si maquettes) Les composants partagés sont dans `docs/design/components/`
- [ ] (si maquettes) `docs/design/guide.md` est présent

## Cohérence

- [ ] Chaque FR du PRD est dans un parcours et a une référence UI
- [ ] Chaque FR du PRD est couverte par au moins une story
- [ ] Chaque story référence les FRs et le parcours qu'elle implémente
- [ ] Chaque story a une référence UI renseignée (maquette, description, ou N/A)
- [ ] Le modèle de données couvre les entités nécessaires aux stories Ready
- [ ] Les RLS policies sont définies pour chaque table du modèle
- [ ] Les stories ont des AC en format Given/When/Then

## Conventions

- [ ] `.tiple/conventions/tech-stack.md` est à jour
- [ ] `.tiple/conventions/coding-standards.md` est personnalisé si nécessaire
- [ ] `.tiple/conventions/component-registry.md` existe avec la structure de base
- [ ] `.tiple/conventions/_index.md` est à jour (index des tags → fichiers de conventions)
- [ ] Chaque story 🟢 Ready a son champ **Conventions** (tags) renseigné

## Infra minimale

- [ ] `pnpm install` fonctionne sans erreur
- [ ] `pnpm dev` démarre le serveur Next.js
- [ ] `pnpm type-check` passe
- [ ] `pnpm test` fonctionne (même si 0 tests)
- [ ] `.env.local` est configuré (variables requises par le projet)
- [ ] (si Supabase) Les clés Supabase sont dans `.env.local`
- [ ] (si auth) Le middleware auth redirige correctement vers /login
