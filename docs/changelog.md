# Changelog

<!-- Ce fichier est mis à jour à chaque commit via /tm-dev.
     Format de chaque entrée :

## [Date] — [Scope]
**Quoi :** Ce qui a été fait
**Pourquoi :** La raison / la story / le bug
**Problèmes :** Ce qui a bloqué et comment c'a été résolu (si applicable)
**Fichiers :** Liste des fichiers créés/modifiés
-->

## [2026-07-26] — Renommage : `.tiple/` devient `.method/`
**Quoi :** le nom commercial du framework disparaît de l'arborescence et du code. Il ne subsiste que dans le `README.md`, seul endroit où il est assumé.

- `.tiple/` → **`.method/`** (`git mv`, historique préservé) — conventions, checklists, templates, starters, sprint status
- marqueur d'échappement du gate : ` # tiple-gate-ok` → ` # checks-ok`
- variable d'environnement : `TIPLE_RECEIPT_PATH` → `VERIFY_RECEIPT_PATH`
- `package.json` : `tiple-method-template` → `dev-framework-template`
- prose « Tiple Method » → « le framework » / « la méthode » dans `CLAUDE.md`, les skills, les conventions, les checklists et les templates
- `docs/migration-tiple-v2.md` → `docs/migration-v2.md`, avec un **lot A « Renommer le dossier de méthode »** ajouté en tête et les lots suivants décalés (9 au lieu de 8)
- `docs/migration-renommage.md` (créé) : prompt court pour les projets **déjà migrés en v2** qui portent encore `.tiple/` — le guide v1→v2 fait désormais le renommage en une passe, ce second document ne sert qu'aux instances migrées avant ce changement

**Points d'attention traités :** trois fichiers contiennent le chemin **à l'intérieur d'expressions régulières**, où le point est échappé — un remplacement naïf de `.tiple/` les rate. `scripts/check-framework.mjs` (motif de validation des chemins cités), `scripts/verify-receipt.mjs` (liste `EXCLUS`) et `.claude/hooks/enforce-git-gate.mjs` (constante `MARKER`). Vérifiés un par un.

**Non renommés, volontairement :** `.claude/` (imposé par Claude Code) · les skills `tm-*`, qui sont les slash commands du quotidien et ne contiennent pas le terme visé · le dépôt GitHub et son propriétaire, qui sont une URL.

**Pourquoi :** un nom de produit dans un chemin de dossier est une dette de nommage — il se propage dans chaque import, chaque citation de convention et chaque message de hook, et devient coûteux à retirer plus tard.

**Fichiers :** 26 fichiers modifiés, `.tiple/` → `.method/`, `docs/migration-renommage.md` créé

## [2026-07-26] — Guide de migration v1 → v2 pour les projets existants
**Quoi :** `docs/migration-v2.md` — prompt à coller dans une session Claude Code ouverte sur un projet issu de l'ancienne version du template. Découpé en 9 lots (renommage, hooks, scripts, skills, conventions, checklists, config, code, docs), chacun expliquant *pourquoi* le changement a eu lieu, pour que les décisions puissent être adaptées au projet cible.

Trois garde-fous y sont posés en tête : ne jamais écraser le code métier ni les documents produits (`docs/prd.md`, stories, epics, ADR) ; préserver les conventions personnalisées en appliquant les corrections plutôt qu'en remplaçant les fichiers ; et **adapter les globs à l'arborescence réelle du projet** — un glob qui ne matche rien désactive silencieusement le chargement d'une convention.

Le lot E3 liste les 17 règles de la v1 techniquement fausses ou dangereuses, avec leur correction. Le document demande explicitement de **signaler sans corriger** le code métier qui suit l'une d'elles (middleware auth perdant les cookies rafraîchis, Server Actions exposant `error.message`, autorisation placée dans un layout) : c'est une décision qui revient au propriétaire du projet.

**Pourquoi :** la v2 change la structure de `.claude/` et de `.method/`, ce qu'aucun merge du template ne peut résoudre seul sur un projet qui a divergé.

**Fichiers :** `docs/migration-v2.md`

## [2026-07-26] — Régressions de la refonte, trouvées par contre-audit
**Quoi :** un audit indépendant a été passé sur le résultat de la refonte précédente, avec pour consigne de chercher ce qu'elle avait cassé. Douze findings, tous vérifiés avant correction.

- **Instructions devenues fausses, qui faisaient échouer le check.** `_index.md` et `tm-wrap-up` disaient encore « ajouter un tag = ligne + convention + `.claude/skills/<tag>/` » alors que `check:framework` **rejette** désormais un skill par tag. Suivre la doc cassait le gate de commit. Reproduit puis corrigé des deux côtés.
- **Le gate était contournable par shell imbriqué.** `bash -c "git commit -m x"` et `eval "git push"` passaient : la neutralisation des chaînes entre quotes — nécessaire pour ne pas bloquer `grep "git commit"` — effaçait la commande. Le hook refuse maintenant tout shell imbriqué, faute de pouvoir l'analyser.
- **Le reçu plantait sur un dépôt sans commit.** `git rev-parse HEAD` échouait, donc `pnpm verify` mourait **après** avoir passé les 4 checks, et le hook refusait ensuite le commit en boucle — sans échappement, `--no-verify` étant bloqué. Le premier commit d'un projet issu du template était impossible. Garde ajouté, plus un fallback par fichier pour les chemins que git ne sait pas hacher.
- **Les tests écrivaient dans le vrai reçu.** Un `pnpm test` interrompu laissait derrière lui un reçu déclarant les 4 checks passés alors que seul vitest avait tourné — le gate autorisait alors un commit sans type-check ni lint. Les tests écrivent désormais dans un reçu isolé (`VERIFY_RECEIPT_PATH`).
- **Renommage non détecté.** `git diff --name-status` n'émet qu'une ligne `R100 ancien nouveau` ; en ne retenant que la destination, la disparition de l'ancien chemin n'était pas enregistrée. Restaurer l'ancien fichier à côté du nouveau laissait le reçu valide alors que les deux coexistaient. Résolu par `--no-renames`.
- **Le reçu ne servait qu'en Micro.** Il n'excluait que le changelog, alors que la finalisation écrit ensuite dans le sprint status, les stories et les ADR — tout chantier Standard ou Module invalidait donc le reçu et rejouait les 4 checks, c'est-à-dire exactement ce que le mécanisme prétendait supprimer. Exclusions étendues.
- **Trous de routing.** Le tag `api` n'était pas routé sur `src/app/**/page.tsx`, alors que trois sections d'`api-patterns.md` sont du code de page — dont la règle sur les `searchParams` validés par Zod, jamais chargée sur le fichier qu'elle vise. Et `supabase-patterns.md` n'était pas chargé sur `src/lib/actions/**` alors qu'`api-patterns.md` y impose `handleSupabaseError`.
- **`max-lines` et `max-lines-per-function` étaient en `warn`** alors que `coding-standards.md` annonçait « appliquée par ESLint, ne pas revérifier à la main » : la règle avait disparu des deux côtés. Passées en `error`.
- **Divers** : `readiness-gate.md` exigeait `pnpm check:framework`, que `tm-plan` n'a pas le droit d'exécuter · renvoi vers un pattern `useOptimistic` qui n'existait nulle part (section écrite dans `forms-patterns.md`) · `generateMetadata` dupliqué et déjà divergent entre `nextjs-patterns.md` et `seo-patterns.md` · sortie d'exemple de `tm-review` listant des conventions absentes de ses propres tags actifs · `enforce-bash-rules` prenait `eslint.config.mjs` pour un lancement d'ESLint.
- **`tm-wrap-up` gagne une phase « ce qui doit disparaître »** : sans mécanisme inverse, les conventions ne faisaient que croître, et le volume redevenait le problème.

**Pourquoi :** une refonte de cette ampleur introduit ses propres régressions, et les plus dangereuses sont celles qui rendent une garantie inopérante sans rien signaler. Trois des quatre HAUTE touchaient le gate de commit ou le reçu — c'est-à-dire précisément ce qui doit être infaillible.

**Fichiers :** `.claude/hooks/enforce-git-gate.mjs`, `enforce-bash-rules.mjs` · `scripts/verify-receipt.mjs` · `tests/unit/hooks.test.ts` (16 cas) · `.method/conventions/_index.md`, `api-patterns.md`, `forms-patterns.md`, `nextjs-patterns.md` · `.claude/skills/tm-wrap-up/SKILL.md`, `tm-review/SKILL.md` · `.method/checklists/readiness-gate.md` · `eslint.config.mjs`, `README.md`

## [2026-07-26] — Refonte issue de l'audit : conventions corrigées, volume divisé par 2, reçu de vérification
**Quoi :**

**Sécurité — les conventions enseignaient des patterns dangereux.**
- `database-patterns.md` : le pattern de transaction de référence était une escalade de privilèges (`SECURITY DEFINER` sans `search_path`, sans validation de l'appelant, `EXECUTE` ouvert à `public` par défaut). Réécrit avec garde `auth.uid()`, verrouillage ordonné, `REVOKE`/`GRANT` explicites, et trois règles vérifiables. Ajout du `WITH CHECK` manquant sur la policy `FOR UPDATE` — sans lui, un utilisateur peut réassigner `user_id` et donner sa ligne à un tiers.
- Starter `auth-actions.ts` : renvoyait `error.message` brut, donc « User already registered » à l'inscription — énumération de comptes en clair. Réécrit avec Zod et messages constants ; `forgotPassword` répond désormais à l'identique que le compte existe ou non.
- `auth-patterns.md` et starter `middleware.ts` : `NextResponse.redirect` ne recopiait pas les cookies rafraîchis par `getUser()`. Le refresh token était consommé côté Supabase et le nouveau jeté — déconnexions aléatoires et boucles de redirection (footgun n°1 de `@supabase/ssr`).
- `nextjs-patterns.md` : l'exemple canonique plaçait le contrôle d'autorisation dans un `layout.tsx`, que le même fichier décrit comme non ré-exécuté en navigation client. Remplacé par la règle « un layout n'est jamais une frontière d'autorisation ».
- `api-patterns.md` : `params.sort` était injecté brut dans `.order()` — énumération du schéma et tri sur colonnes non exposées. L'exemple valide désormais les `searchParams` par un `z.enum`.
- `security-patterns.md` : « les Server Actions ont un token CSRF » est faux (c'est une comparaison `Origin`/`Host`) ; `headers()` était appelé sans `await`, donc ne compilait pas en Next 15 ; le rate limiter en `Map` mémoire ne limite rien sur Vercel et lisait le mauvais segment de `x-forwarded-for`. Ajout d'une section idempotence / lost update.
- `supabase-patterns.md` : `PGRST301` était documenté « Trop de résultats » alors qu'il signifie **JWT expiré** — une session expirée s'affichait comme une erreur de requête. Table d'erreurs complétée (`23514`, `40001`, `57014`, `PGRST202`, `PGRST204`) et signature élargie aux erreurs Storage et Auth.
- Uploads : la limite de 1 Mo des Server Actions rendait les exemples (2 et 5 Mo) inopérants ; `upsert: true` sans policy `FOR UPDATE` renvoyait 403 au deuxième changement d'avatar ; le bucket était lisible par `anon`.
- `api-patterns.md` : le curseur de pagination filtrait sur `created_at` seul — perte silencieuse de lignes en infinite scroll. `bulkDelete` lisait `count` sans `{ count: "exact" }`, donc `succeeded` valait toujours 0 et un DELETE refusé par RLS était compté comme un succès.
- `redirect()` et `notFound()` sont des `throw` : le pattern `try/catch` recommandé les avalait. Règle `unstable_rethrow` ajoutée.

**Volume — le corpus n'était pas lisible en une passe.**
- Mesuré avant : 923 lignes de conventions pour une ligne changée dans une Server Action, 2 640 pour un module — **lues deux fois**, par `tm-dev` puis par `tm-review`.
- `api-patterns.md` (478 lignes, servant 4 tags) scindé en `api-patterns.md` (352), `forms-patterns.md`, `tables-patterns.md`, `uploads-patterns.md`. Reviewer un composant de tableau ne charge plus 267 lignes de Server Actions.
- `coding-standards.md` : 240 → 133 lignes. Les sections Server Actions et Supabase, qui **contredisaient** les conventions routées (trois traitements différents de l'auth manquante : `throw`, `return`, `redirect`), sont supprimées au profit de renvois.
- **Conventions de base : 3 → 1.** `component-registry.md` et `tech-stack.md` deviennent des tags routés — vérifier le registry n'a de sens qu'en créant un composant, la stack qu'en touchant aux dépendances.
- Ce qu'ESLint peut appliquer sort de la prose : `max-lines`, `max-lines-per-function`, `max-params`, `max-depth`, `no-empty`, interdiction des `enum`, `import/order`. Une règle mécanisée est vérifiée à chaque lint, la recopier n'ajoutait que du volume.
- Globs resserrés ou élargis selon les mesures : `feedback`, `state` et `performance` ne matchaient quasiment rien (un composant de filtres ne chargeait pas `state-management.md`) ; `seo` payait 147 lignes sur chaque layout imbriqué pour 17 lignes utiles une seule fois.

**Les 22 skills de tag supprimés, remplacés par un seul.**
Depuis le routing par globs, `tm-dev` et `tm-review` matchent `_index.md` eux-mêmes : les 22 skills n'étaient plus qu'un niveau d'indirection. Il restait un cas — la question posée sans qu'aucun fichier soit touché — désormais couvert par le skill `conventions`.

**Reçu de vérification — plus de suite de tests jouée deux fois.**
`pnpm verify` enregistre l'empreinte exacte du code (HEAD + diff complet + contenu des fichiers non suivis, hors changelog). `commit-push` lance `pnpm verify:cached` : code identique → aucun check rejoué. Effet de bord voulu : le reçu est une **preuve** que les checks ont tourné sur ce code, et le hook refuse un commit dont le reçu ne couvre pas l'état courant — le marqueur d'échappement ne peut plus être posé par réflexe.

**Trous de process comblés.**
- `tm-plan` gagne un niveau **« story seule »** : accepter la proposition de story de `tm-dev` déclenchait une évolution de PRD complète, ce qui rendait la proposition dissuasive. Le cadrage rend maintenant la main explicitement à `tm-dev`.
- Sur refus de la story en Module, `tm-dev` rétrogradait en Standard — registry, ADR et sprint status disparaissaient en silence, en contradiction avec « l'échelle est déterminée par ce que le changement touche ». Il reste en Module ; seules les obligations liées à la story tombent.
- `checklists/code-review.md` devient une **source citable** par `tm-review`. Sans cela, aucun de ses items ne pouvait dépasser BASSE : « ce qui est livré ne correspond pas à ce qui a été demandé » n'était structurellement jamais bloquant.
- `readiness-gate.md` exigeait `pnpm install`, `.env.local` et un serveur démarré — impossible, puisque `tm-plan` s'interdit toute commande système. Ces points deviennent les AC de la story de setup. `story-ready.md` marque conditionnels les items qu'une story technique ne peut pas satisfaire.

**`check:framework` durci** — il ne détectait aucun des modes de pourrissement réels.
Ajout : parsing de `_index.md` **par nom de colonne** (ajouter une colonne tuait le routing en silence), détection des **globs morts** (une réorganisation de `src/` désactivait le routing sans un mot), tags dupliqués, budget de 400 lignes par convention, **sections citées inexistantes** (`fichier.md § Section` — la gravité HAUTE repose sur ces citations), checklists orphelines, et comparaison `component-registry.md` ↔ `src/components/` dans les deux sens.

**Divers.** `<Toaster>` et skip link ajoutés au root layout (tout `toast.success()` était silencieux, et le template violait sa propre convention a11y) · `badge.tsx` passait par `bg-emerald-500` en dur au lieu des tokens · `.env.example` déclarait `NEXT_PUBLIC_APP_URL`, inutilisée, alors que tout le template lit `NEXT_PUBLIC_SITE_URL` · `CLAUDE.md` ramené de 201 à 149 lignes (cible officielle : < 200), sans les sections qui doublonnaient les conventions routées · `tm-plan` porte `disable-model-invocation`, `tm-dev` un filtre `paths`, et les skills un champ `when_to_use` séparé de `description`.

**Pourquoi :** neuf audits indépendants ont convergé sur le même diagnostic — le framework demandait de lire trop pour que la lecture soit réelle, et ce qu'il donnait à lire contenait des règles fausses. Corriger l'un sans l'autre n'aurait servi à rien.

**Fichiers :** 8 conventions réécrites, 3 créées (`forms`, `tables`, `uploads`), 22 skills supprimés, `conventions` créé · `scripts/verify-receipt.mjs` et `scripts/check-framework.mjs` · `eslint.config.mjs`, `package.json`, `.gitignore` · `src/app/layout.tsx`, `src/components/ui/badge.tsx` · `CLAUDE.md`, `README.md` · 3 checklists · starter `auth-actions.ts` et `middleware.ts`

## [2026-07-26] — Correctifs issus de l'audit multi-agents : gate git réparé et testé, 404 au premier lancement, lint impassable
**Quoi :** neuf audits indépendants (4 scénarios d'usage, 4 lots de conventions, 1 sur l'architecture des skills) ont été passés sur le framework. Cette entrée ne couvre que les défauts **vérifiés et corrigés** ; le reste est arbitré séparément.

- **Gate git réparé — c'était une régression introduite le jour même.** Le hook cherchait le marqueur d'échappement dans le payload JSON brut : `git commit -m "docs: expliquer checks-ok"` passait le gate sans qu'aucun check n'ait tourné. Trois autres contournements : `git -C /repo commit`, `git --no-pager push`, `git -c k=v push` (le motif exigeait `git` suivi immédiatement de la sous-commande). Et deux faux positifs : `grep -rn "git commit" docs/` était bloqué, et un message de commit contenant `--force` était bloqué définitivement.
- **Les deux hooks passent de bash à Node.** La cause racine était unique : bash ne sait pas parser du JSON. Toute extraction du champ `command` par grep/sed est fausse dans un sens (troncature au premier guillemet échappé) ou dans l'autre (matching du JSON entier). `JSON.parse` supprime la classe de bug. Les chaînes entre quotes sont neutralisées avant analyse, et le marqueur n'est accepté qu'**en fin de commande**.
- **`tests/unit/hooks.test.ts`** : 18 cas de non-régression sur les deux hooks, exécutés par `pnpm test`, donc par `commit-push`. Le gate ne peut plus se casser en silence.
- **404 au premier lancement.** `src/app/page.tsx` et `src/app/(dashboard)/page.tsx` résolvaient tous les deux `/`. Next 15 n'échoue pas : il en choisit un silencieusement. `app/page.tsx` gagnait et redirigeait vers `/dashboard`, route qu'aucun fichier ne produit — un clone frais tombait donc sur un 404, et la page du route group ainsi que son layout n'étaient jamais rendus. `src/app/page.tsx` supprimé.
- **`pnpm lint` impassable après un build.** `eslint.config.mjs` n'avait aucune liste `ignores` : `eslint .` parcourait `.next/`, remontait des milliers d'erreurs sur du code généré, et rendait le gate `commit-push` infranchissable dès qu'un `pnpm build` avait été lancé une fois.
- **`vitest.config.ts` : `setupFiles` vide** alors que `tests/setup.ts` importe les matchers jest-dom. Le premier `expect(...).toBeInTheDocument()` écrit selon `testing-strategy.md` aurait échoué sur « is not a function ».
- **`story-done.md` réécrit.** Checklist orpheline (référencée nulle part), elle avait échappé à la refonte : elle exigeait une review « par un agent reviewer isolé » que `tm-review` interdit explicitement, et cochait 7 rubriques de `code-review.md` supprimées depuis. Elle ne vérifie plus que livraison, review et traçabilité, et `tm-dev` la référence désormais.
- **Contradiction sur les starters** : `README.md` annonçait une installation automatique par `/tm-plan`, alors que `tm-plan` s'interdit toute commande système et que l'installation revient à `tm-dev`. Aligné, et les mentions d'une « Phase 0 » qui n'existe plus sont supprimées.

**Pourquoi :** le gate git est la seule garantie non probabiliste du framework — un contournement silencieux vaut pire que pas de gate, puisqu'il donne une fausse assurance. Les trois autres défauts cassaient l'expérience du premier jour sur un clone neuf.

**Fichiers :**
- `.claude/hooks/enforce-git-gate.mjs`, `.claude/hooks/enforce-bash-rules.mjs` (créés) — versions `.sh` supprimées
- `.claude/settings.json`, `tests/unit/hooks.test.ts` (créé), `eslint.config.mjs`, `vitest.config.ts`
- `src/app/page.tsx` (supprimé), `.method/checklists/story-done.md`, `.claude/skills/tm-dev/SKILL.md`
- `CLAUDE.md`, `README.md`, `.claude/skills/commit-push/SKILL.md`, `.claude/skills/tm-verify/SKILL.md`

## [2026-07-26] — Ménage : suppression des documents morts et des références obsolètes
**Quoi :**
- **`plan.md` supprimé** — plan d'implémentation ponctuel d'un chantier terminé (restructuration du PRD en parcours), laissé à la racine où Claude le lisait comme normatif.
- **`files/` supprimé** (2 341 lignes) — PRD, architecture, stories et guide de migration de la méthode elle-même. Ces documents décrivaient une version passée de la méthode, citaient trois commandes qui n'ont jamais existé dans le template (`/tm-evolve`, `/tm-status`, `/tm-sprint`) et n'étaient référencés par rien de normatif. Historique conservé dans git.
- **`.gitignore`** : suppression de l'exception `!.claude/commands/` — le dossier n'existe plus.
- **Références « phase N » de `/tm-plan` remplacées** dans les 4 templates, les 2 checklists, `.method/sprint/status.md` et les 6 placeholders de `docs/` : `tm-plan` ne fonctionne plus par phases numérotées mais par artefacts produits à la demande.
- **`check:framework`** : l'exclusion de `files/` disparaît, seul le changelog reste exclu (son rôle de journal est de citer des commandes supprimées).

**Pourquoi :** ces fichiers étaient lus comme source de vérité par Claude alors qu'ils décrivaient un état révolu du framework. Un template qui embarque 2 400 lignes de méta-documentation périmée fait porter cette dette à chaque projet cloné.

**Fichiers :**
- Supprimés : `plan.md`, les 4 documents d'archive de `files/`
- Modifiés : `.gitignore`, `scripts/check-framework.mjs`, `.method/templates/{brief,prd,architecture,epic,story}.tmpl.md`, `.method/checklists/readiness-gate.md`, `.method/sprint/status.md`, `docs/{brief,prd,architecture}.md`, `docs/epics/_index.md`, `docs/design/{screens,components}/_index.md`

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
- **Routing unique par globs.** `.method/conventions/_index.md` gagne une colonne **Globs** — seule source de vérité `fichier → tag → convention`, consommée par `tm-dev` et `tm-review`. Le mapping en prose (7 tags sur 22) qui vivait dans `tm-dev.md` est supprimé.
- **Review adossée aux conventions.** Nouveau skill `tm-review` : il route les conventions par globs sur le diff, les lit **en entier**, puis confronte le code aux règles. La gravité est indexée sur la source — HAUTE/MOYENNE seulement si le finding cite `conventions/<fichier>.md § <section>` ou un AC de la story ; sans citation, c'est BASSE et non bloquant. Avant, la review ne lisait que 2 fichiers de conventions sur 22.
- **`code-review.md` réduit au transverse** (périmètre du diff, hygiène, conformité à la demande, documentation de méthode). Les ~40 règles qui doublonnaient les conventions sont supprimées — fin de la 3ᵉ source de vérité.
- **Suppression de l'agent isolé.** La review tourne dans le contexte courant. La perte de recul est compensée par la mécanique : on ne demande plus au reviewer d'avoir des idées, mais de dérouler des règles lues juste avant.
- **`.claude/commands/` supprimé, tout devient skill.** Un skill s'auto-déclenche sur l'intention *et* reste invocable en `/<nom>` ; une command n'offrait que le second. `tm-dev`, `tm-plan`, `tm-review`, `tm-verify`, `tm-wrap-up`, `commit-push` migrent. `tm-fix` et `tm-feature` (dépréciés) sont supprimés.
- **Gate git déterministe.** `enforce-git-gate.sh` bloque tout `git commit`/`git push` hors du skill `commit-push` (échappement explicite par le marqueur ` # checks-ok`, posé après les checks). `--no-verify` et `--force` bloqués sans échappement. Le déclenchement d'un skill est probabiliste : acceptable pour charger des conventions, pas pour un gate de push.
- **22 skills de tag réduits à des pointeurs.** Les 3 invariants recopiés dans chacun sont supprimés : ils divergeaient de la convention et donnaient l'illusion d'être informé sans lire la source.
- **`pnpm check:framework`.** Valide tags ↔ conventions ↔ skills ↔ hooks ↔ références croisées. A détecté 8 incohérences existantes au premier run (`/tm-evolve`, `/tm-gate`, `/tm-sprint`, `/tm-status` référencés partout, inexistants) — toutes corrigées.
- **`enforce-bash-rules.sh` réparé** : ne bloque plus `git log | head` (les règles ne ciblent plus que les commandes de check) et ne renvoie plus vers une section de `CLAUDE.md` supprimée en mai.
- **`files/*.md` marqués ARCHIVE** — ces documents citaient des commandes disparues et étaient lus comme normatifs.

**Pourquoi :** le système d'agent avait trois sources de vérité divergentes (conventions, checklist, skills), aucune review ne lisait les conventions, et les règles de qualité n'étaient appliquées que si Claude pensait à les appliquer. Les garanties sont maintenant soit mécaniques (routing par globs, citation obligatoire), soit appliquées par un hook.

**Fichiers :**
- `.method/conventions/_index.md`, `.method/checklists/code-review.md`, `.method/checklists/prd-evolution.md`, `.method/checklists/readiness-gate.md`, `.method/sprint/status.md`, `.method/templates/epic.tmpl.md`, `.method/templates/story.tmpl.md`
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
**Pourquoi :** réduire le bruit dans les réponses Claude pendant les workflows framework, particulièrement utile dans les sessions longues où chaque tour répétait inutilement le contexte.
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
**Quoi :** Ajout de 22 skills Claude Code (un par tag de `.method/conventions/_index.md`) dans `.claude/skills/`. Chaque skill est un shim ~8 lignes (frontmatter `name`+`description` + pointeur vers `.method/conventions/<file>.md` + 2-3 invariants-clés).
**Pourquoi :** Les conventions étaient chargées uniquement par `/tm-dev` / `/tm-fix` via déduction de tags manuelle. Hors de ces workflows (édit libre, Q&A), elles étaient ignorées. Les skills permettent à Claude de les auto-déclencher contextuellement sans toucher à la source de vérité (`.method/conventions/` inchangé) ni aux slash commands.
**Fichiers :**
- `.claude/skills/{auth,database,supabase,api,forms,realtime,security,nextjs,typescript,state,feedback,performance,tables,uploads,seo,a11y,i18n,datetime,monitoring,flags,deploy,testing}/SKILL.md` (22 nouveaux shims)
- `.gitignore` : whitelist `!.claude/skills/`
