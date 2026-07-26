# Changelog

<!-- Ce fichier est mis à jour à chaque commit via /tm-dev.
     Format de chaque entrée :

## [Date] — [Scope]
**Quoi :** Ce qui a été fait
**Pourquoi :** La raison / la story / le bug
**Problèmes :** Ce qui a bloqué et comment c'a été résolu (si applicable)
**Fichiers :** Liste des fichiers créés/modifiés
-->

## [2026-07-26] — Simplification tm-dev / tm-plan : échelles au lieu de modes, cadrage à la carte
**Quoi :**
- **`tm-dev` : 5 modes → 2 modes × 3 échelles.** La détection par verbes français (`corrige`, `ajoute`, `nettoie`…) est supprimée : elle était fragile et ne changeait quasiment rien (fix et feature ne différaient que par une phrase de « review focus »). Restent 2 modes réels — lecture (read-only) et écriture — et 3 **échelles** déterminées par ce que le changement touche : **Micro** (1-2 fichiers, aucune nouvelle surface) · **Standard** (3-5 fichiers, ou création d'une fonction/composant/action) · **Module** (nouvelle surface, changement DB, ou ≥ 6 fichiers).
- **Les garanties ne dépendent plus du chemin choisi.** Conventions chargées + type-check s'appliquent à toute échelle, y compris sur un changement d'une ligne. Ce qui s'échelonne est le cérémonial : rapport de review, changelog, registry, story. Avant, le workflow en 5 phases était contourné sur les petits changements — et en le contournant on perdait aussi le chargement des conventions et la review.
- **Story proposée, pas imposée** — uniquement à l'échelle Module, avec sa justification : c'est le seul endroit où les AC sont écrits avant le code, donc le seul moyen pour la review de statuer « AC non livré » au lieu de donner un avis.
- **2 garde-fous conditionnels** remplacent les modes fix/refacto : correction d'un comportement cassé → test qui reproduit d'abord ; changement sans effet sur le comportement observable → tests identiques avant/après. Ils se déclenchent sur la nature réelle du travail, pas sur le vocabulaire.
- **`tm-plan` : pipeline → artefacts à la carte.** Les 6 phases séquentielles deviennent une liste d'artefacts dont seuls les manquants ou les impactés sont produits. Trois niveaux : **initial**, **évolution ciblée**, et **refus** — le cadrage peut désormais se déclarer inutile et basculer en implémentation, ce que rien ne l'autorisait à faire.
- **Principe des artefacts optionnels écrit noir sur blanc** : aucun artefact n'est obligatoire, son absence est déclarée et non subie. Une référence UI à `N/A` n'est jamais un défaut et la review ne la pénalise pas.

**Pourquoi :** en rythme de croisière, le workflow lourd n'était pas utilisé — donc les garanties de qualité ne s'appliquaient presque jamais. En attachant les garanties au changement plutôt qu'au workflow, et en faisant varier le seul cérémonial, il n'y a plus de chemin à contourner.

**Fichiers :**
- `.claude/skills/tm-dev/SKILL.md`, `.claude/skills/tm-plan/SKILL.md`, `.claude/skills/tm-review/SKILL.md`
- `CLAUDE.md`, `README.md`

## [2026-07-26] — Refonte du système d'agent : skills auto-déclenchés, review conventions-driven, gate git par hook
**Quoi :**
- **Routing unique par globs.** `.tiple/conventions/_index.md` gagne une colonne **Globs** — seule source de vérité `fichier → tag → convention`, consommée par `tm-dev` et `tm-review`. Le mapping en prose (7 tags sur 22) qui vivait dans `tm-dev.md` est supprimé.
- **Review adossée aux conventions.** Nouveau skill `tm-review` : il route les conventions par globs sur le diff, les lit **en entier**, puis confronte le code aux règles. La gravité est indexée sur la source — HAUTE/MOYENNE seulement si le finding cite `conventions/<fichier>.md § <section>` ou un AC de la story ; sans citation, c'est BASSE et non bloquant. Avant, la review ne lisait que 2 fichiers de conventions sur 22.
- **`code-review.md` réduit au transverse** (périmètre du diff, hygiène, conformité à la demande, documentation de méthode). Les ~40 règles qui doublonnaient les conventions sont supprimées — fin de la 3ᵉ source de vérité.
- **Suppression de l'agent isolé.** La review tourne dans le contexte courant. La perte de recul est compensée par la mécanique : on ne demande plus au reviewer d'avoir des idées, mais de dérouler des règles lues juste avant.
- **`.claude/commands/` supprimé, tout devient skill.** Un skill s'auto-déclenche sur l'intention *et* reste invocable en `/<nom>` ; une command n'offrait que le second. `tm-dev`, `tm-plan`, `tm-review`, `tm-verify`, `tm-wrap-up`, `commit-push` migrent. `tm-fix` et `tm-feature` (dépréciés) sont supprimés.
- **Gate git déterministe.** `enforce-git-gate.sh` bloque tout `git commit`/`git push` hors du skill `commit-push` (échappement explicite par le marqueur ` # tiple-gate-ok`, posé après les checks). `--no-verify` et `--force` bloqués sans échappement. Le déclenchement d'un skill est probabiliste : acceptable pour charger des conventions, pas pour un gate de push.
- **22 skills de tag réduits à des pointeurs.** Les 3 invariants recopiés dans chacun sont supprimés : ils divergeaient de la convention et donnaient l'illusion d'être informé sans lire la source.
- **`pnpm check:framework`.** Valide tags ↔ conventions ↔ skills ↔ hooks ↔ références croisées. A détecté 8 incohérences existantes au premier run (`/tm-evolve`, `/tm-gate`, `/tm-sprint`, `/tm-status` référencés partout, inexistants) — toutes corrigées.
- **`enforce-bash-rules.sh` réparé** : ne bloque plus `git log | head` (les règles ne ciblent plus que les commandes de check) et ne renvoie plus vers une section de `CLAUDE.md` supprimée en mai.
- **`files/*.md` marqués ARCHIVE** — ces documents citaient des commandes disparues et étaient lus comme normatifs.

**Pourquoi :** le système d'agent avait trois sources de vérité divergentes (conventions, checklist, skills), aucune review ne lisait les conventions, et les règles de qualité n'étaient appliquées que si Claude pensait à les appliquer. Les garanties sont maintenant soit mécaniques (routing par globs, citation obligatoire), soit appliquées par un hook.

**Fichiers :**
- `.tiple/conventions/_index.md`, `.tiple/checklists/code-review.md`, `.tiple/checklists/prd-evolution.md`, `.tiple/checklists/readiness-gate.md`, `.tiple/sprint/status.md`, `.tiple/templates/epic.tmpl.md`, `.tiple/templates/story.tmpl.md`
- `.claude/skills/{tm-dev,tm-plan,tm-review,tm-verify,tm-wrap-up,commit-push}/SKILL.md` (créés) + 22 skills de tag réécrits
- `.claude/commands/` (supprimé), `.claude/hooks/enforce-git-gate.sh` (créé), `.claude/hooks/enforce-bash-rules.sh`, `.claude/settings.json`
- `scripts/check-framework.mjs` (créé), `package.json`, `CLAUDE.md`, `README.md`, `files/*.md`

## [2026-05-02] — CLAUDE.md : ajout section "Avant de coder (CRITIQUE)"
**Quoi :** Ajout d'une section "Avant de coder" en tête du CLAUDE.md avec 4 règles : surfacer les hypothèses (pas trancher en silence), edits chirurgicaux (chaque ligne trace à la demande), critères de succès vérifiables, push back quand justifié. Suppression de la référence orpheline à "Règles d'exécution Bash" dans "Règles avant push" (section déjà retirée).
**Pourquoi :** cadrer le comportement de Claude en amont du code : éviter les implémentations trop larges, les refactos non demandés, et le "make it work" flou. Pousse l'agent à clarifier au lieu d'inventer.
**Fichiers :**
- `CLAUDE.md`

## [2026-05-02] — Tests rapatriés en local : CI = build only
**Quoi :**
- `/commit-push` exécute désormais 3 checks locaux : type-check + lint + tests (au lieu de 2).
- CI GitHub réduite à `pnpm build` uniquement (validation Vercel + erreurs Linux). Plus de duplication local/CI.
- CLAUDE.md "Règles avant push" mises à jour : suppression de l'interdiction "Ne JAMAIS lancer pnpm test localement".

**Pourquoi :** la séparation "lint/test sur CI uniquement" n'avait plus de sens depuis que l'environnement local est stable (TS 5.8.3 pin + hook PreToolUse). Lancer les tests en local accélère le feedback (plus besoin d'attendre la CI pour voir un test cassé), simplifie le mental model, et la CI reste un filet de sécurité Linux/build via `pnpm build`.

**Fichiers :**
- `.claude/commands/commit-push.md`
- `.github/workflows/ci.yml` (renommé "CI — Build", suppression des steps lint/tests)
- `CLAUDE.md` (section "Règles avant push")

## [2026-04-30] — CLAUDE.md : retrait de la section "Règles d'exécution Bash"
**Quoi :** Suppression de la section "Règles d'exécution Bash (TOUTES les commandes)" du CLAUDE.md (7 règles : pas de background, pas de pipe, pas de redirection, pas de boucle d'attente…).
**Pourquoi :** ces règles sont désormais appliquées par le hook `PreToolUse` (`.claude/hooks/enforce-bash-rules.sh`) au niveau système, plus besoin de les répéter dans le prompt. Réduit le bruit au chargement de chaque conversation et évite la duplication source de divergence.
**Fichiers :**
- `CLAUDE.md`

## [2026-04-30] — CLAUDE.md : règle de style de réponse (concis, pas de récap)
**Quoi :** Ajout d'une section "Style de réponse (CRITIQUE)" en tête du CLAUDE.md imposant des réponses courtes, sans récap qui répète l'user, sans tableaux décoratifs ni emojis non demandés, sans phrases d'intro/transition.
**Pourquoi :** réduire le bruit dans les réponses Claude pendant les workflows Tiple Method, particulièrement utile dans les sessions longues où chaque tour répétait inutilement le contexte.
**Fichiers :**
- `CLAUDE.md` (nouvelle section au début)

## [2026-04-19] — Consolidation : /tm-dev absorbe /tm-fix et /tm-feature, ajoute modes refacto et explore
**Quoi :**
- `/tm-dev` devient le **point d'entrée unique** pour toute action code avec 5 modes auto-détectés depuis l'argument : **story** (ID/`next`), **fix** (bug/corrige/cassé…), **feature** (ajoute/implémente…), **refacto** (nettoie/factorise, tests identiques avant/après), **explore** (comprends/analyse, **read-only**).
- `/tm-fix` et `/tm-feature` deviennent des **alias rétro-compatibles dépréciés** qui affichent un warning et exécutent le bon workflow de `/tm-dev`. Seront supprimés dans une prochaine version.
- CLAUDE.md et README.md mis à jour : nouvelle table commandes (2 points d'entrée principaux + 5 modes), table dépréciation, détail des 5 modes.

**Pourquoi :** retirer les redondances (tm-fix ≡ tm-dev libre, tm-feature ≡ tm-plan évolution) et combler les trous (mode refacto avec garde-fous "tests identiques", mode explore read-only). Une heuristique simple pour l'utilisateur : *docs → `/tm-plan`, code → `/tm-dev`*.

**Fichiers :**
- `.claude/commands/tm-dev.md` (refonte avec 5 modes + détection auto)
- `.claude/commands/tm-fix.md` (alias déprécié avec warning)
- `.claude/commands/tm-feature.md` (alias déprécié avec warning)
- `CLAUDE.md` (table commandes + ajustement "Mode libre")
- `README.md` (table commandes, table dépréciation, section "Les 5 modes de /tm-dev")

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
