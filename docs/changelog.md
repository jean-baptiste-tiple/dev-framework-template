# Changelog

<!-- Ce fichier est mis à jour à chaque commit via /tm-dev.
     Format de chaque entrée :

## [Date] — [Scope]
**Quoi :** Ce qui a été fait
**Pourquoi :** La raison / la story / le bug
**Problèmes :** Ce qui a bloqué et comment c'a été résolu (si applicable)
**Fichiers :** Liste des fichiers créés/modifiés
-->

## [2026-04-19] — /tm-plan gère le mode évolution (V2) + README synchronisé
**Quoi :**
- `/tm-plan` détecte automatiquement si c'est un cadrage initial (pas de `docs/prd.md`) ou une évolution versionnée (V2/V3). En mode évolution : Edit > Write sur les docs existants, ADR obligatoire par invariant touché, création des nouveaux epics/stories uniquement, gate avec `prd-evolution.md` en plus du readiness-gate.
- README mis à jour : table des commandes complétée (ajout de `tm-feature`, `tm-wrap-up`, `commit-push` qui manquaient), `/tm-plan` décrit comme couvrant les deux modes, structure `.claude/` détaillée (commands/skills/hooks), section Qualité corrigée (type-check + lint local via `/commit-push`, tests sur CI GitHub).

**Pourquoi :** combler le trou méthodologique pour les grosses évolutions versionnées sans introduire un `/tm-plan-v2` redondant, et aligner le README sur l'état réel du framework (3 commandes + skills auto-déclenchés n'y figuraient pas).

**Fichiers :**
- `.claude/commands/tm-plan.md` (ajout de la section "Mode : initial ou évolution")
- `README.md` (table commandes, structure, section qualité, section V2)

## [2026-04-19] — Template : triggers bilingues, argument-hints, nouveau skill/command tm-wrap-up
**Quoi :**
- `argument-hint` ajoutés aux 3 slash commands qui prennent des arguments (tm-dev, tm-fix, tm-feature).
- Descriptions des 22 skills `.claude/skills/*/SKILL.md` enrichies avec des triggers bilingues FR+EN (mots-clés métier en français pour améliorer le déclenchement automatique).
- Nouveau workflow `/tm-wrap-up` (hybride) : command `.claude/commands/tm-wrap-up.md` pour le process complet + skill shim `.claude/skills/tm-wrap-up/` qui auto-propose à l'utilisateur de capturer les apprentissages méta (conventions, ADR, registry) à la fin d'un chantier. La règle : proposer, jamais exécuter silencieusement.

**Pourquoi :** inspiré de l'analyse du repo AlexisLaporte/claude-skills. L'objectif est (a) de fiabiliser le déclenchement automatique des conventions hors des workflows `/tm-dev` (les triggers FR couvrent la langue de travail), et (b) d'introduire un mécanisme de capture des **apprentissages méta** du projet, que le couple changelog+code ne couvre pas aujourd'hui.

**Fichiers :**
- `.claude/commands/tm-dev.md`, `tm-fix.md`, `tm-feature.md` (frontmatter)
- `.claude/commands/tm-wrap-up.md` (nouveau)
- `.claude/skills/tm-wrap-up/SKILL.md` (nouveau)
- `.claude/skills/{a11y,api,auth,database,datetime,deploy,feedback,flags,forms,i18n,monitoring,nextjs,performance,realtime,security,seo,state,supabase,tables,testing,typescript,uploads}/SKILL.md` (descriptions bilingues)
- `CLAUDE.md` (ajout de `/tm-wrap-up` dans la table des commandes)

## [2026-04-19] — Template : skills "shim" pour conventions
**Quoi :** Ajout de 22 skills Claude Code (un par tag de `.tiple/conventions/_index.md`) dans `.claude/skills/`. Chaque skill est un shim ~8 lignes (frontmatter `name`+`description` + pointeur vers `.tiple/conventions/<file>.md` + 2-3 invariants-clés).
**Pourquoi :** Les conventions étaient chargées uniquement par `/tm-dev` / `/tm-fix` via déduction de tags manuelle. Hors de ces workflows (édit libre, Q&A), elles étaient ignorées. Les skills permettent à Claude de les auto-déclencher contextuellement sans toucher à la source de vérité (`.tiple/conventions/` inchangé) ni aux slash commands.
**Fichiers :**
- `.claude/skills/{auth,database,supabase,api,forms,realtime,security,nextjs,typescript,state,feedback,performance,tables,uploads,seo,a11y,i18n,datetime,monitoring,flags,deploy,testing}/SKILL.md` (22 nouveaux shims)
- `.gitignore` : whitelist `!.claude/skills/`
