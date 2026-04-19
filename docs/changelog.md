# Changelog

<!-- Ce fichier est mis à jour à chaque commit via /tm-dev.
     Format de chaque entrée :

## [Date] — [Scope]
**Quoi :** Ce qui a été fait
**Pourquoi :** La raison / la story / le bug
**Problèmes :** Ce qui a bloqué et comment c'a été résolu (si applicable)
**Fichiers :** Liste des fichiers créés/modifiés
-->

## [2026-04-19] — Template : skills "shim" pour conventions
**Quoi :** Ajout de 22 skills Claude Code (un par tag de `.tiple/conventions/_index.md`) dans `.claude/skills/`. Chaque skill est un shim ~8 lignes (frontmatter `name`+`description` + pointeur vers `.tiple/conventions/<file>.md` + 2-3 invariants-clés).
**Pourquoi :** Les conventions étaient chargées uniquement par `/tm-dev` / `/tm-fix` via déduction de tags manuelle. Hors de ces workflows (édit libre, Q&A), elles étaient ignorées. Les skills permettent à Claude de les auto-déclencher contextuellement sans toucher à la source de vérité (`.tiple/conventions/` inchangé) ni aux slash commands.
**Fichiers :**
- `.claude/skills/{auth,database,supabase,api,forms,realtime,security,nextjs,typescript,state,feedback,performance,tables,uploads,seo,a11y,i18n,datetime,monitoring,flags,deploy,testing}/SKILL.md` (22 nouveaux shims)
- `.gitignore` : whitelist `!.claude/skills/`
