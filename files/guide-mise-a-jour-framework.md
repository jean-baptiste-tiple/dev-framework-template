# Guide de mise à jour — Tiple Method Framework

**Date :** 2026-04-16
**Auteur :** JB
**Pour :** Guillaume (et tout collègue utilisant le framework)

---

## Problème

Claude Code a 3 comportements toxiques récurrents + un problème d'environnement :

1. **Background + polling** : lance `pnpm type-check` ou `pnpm test` en background, redirige la sortie dans un fichier, puis poll avec `cat`/`tail` en boucle. L'output est bufferisé → le fichier reste vide → Claude boucle indéfiniment.
2. **Pipes** : ajoute `| tail -20` ou `2>&1 | head` aux commandes, ce qui tronque la sortie et masque les erreurs.
3. **Implémentation pendant `/tm-plan`** : la Phase 0 ordonnait à Claude d'installer des packages et copier des fichiers de code pendant le cadrage.
4. **Processus zombie vitest/tsc** : des processus vitest ou tsc qui ne se terminent pas s'accumulent, ralentissent tout, et poussent Claude à mettre les commandes en background "pour ne pas bloquer".

## Solution

4 niveaux de protection :

| Niveau | Mécanisme | Fiabilité |
|--------|-----------|-----------|
| **Hook système** | Script qui bloque les appels Bash interdits AVANT exécution | Bloque pipes/redirections/boucles. Le background peut parfois passer si le runtime VSCode l'impose |
| **CLAUDE.md** | Règles d'exécution Bash + règle `/tm-plan` = docs only | ~80% — lu mais parfois ignoré |
| **Commandes** | Warnings dans chaque Phase 3 de chaque commande | ~80% — rappel contextuel |
| **Environnement sain** | Pas de zombie, pas de conflit TS server, vitest avec timeout | Élimine la cause racine qui pousse Claude à backgrounder |

On supprime aussi la CI GitHub (type-check/lint/tests) et on la remplace par `/commit-push` qui fait tout en local.

---

## ÉTAPE 0 — Nettoyage environnement (FAIRE EN PREMIER)

> **C'est la cause racine.** Si vitest hang ou tsc est lent, Claude va chercher des contournements (background, polling). Nettoie l'environnement d'abord.

### Tuer les processus zombie (macOS)

```bash
# Tuer tous les processus vitest/tsc qui traînent
pkill -f vitest 2>/dev/null
pkill -f "tsc --noEmit" 2>/dev/null

# Vérifier qu'il n'en reste plus
pgrep -laf "vitest|tsc" || echo "Aucun processus résiduel"
```

### Nettoyer le cache pnpm et node_modules

```bash
# Depuis la racine du projet
rm -rf node_modules
pnpm store prune
pnpm install
```

### Redémarrer VSCode

Fermer complètement VSCode et le rouvrir. Ça tue le TypeScript Language Server qui peut entrer en conflit avec `tsc --noEmit` lancé par Claude.

### Vérifier que vitest tourne bien

```bash
# Doit finir en < 30 secondes
pnpm test
```

Si ça hang : vérifier le `vitest.config.ts`. Ajouter si nécessaire :
```ts
export default defineConfig({
  test: {
    testTimeout: 10000,      // 10s max par test
    hookTimeout: 10000,       // 10s max par hook (beforeEach, etc.)
    teardownTimeout: 5000,    // 5s max pour le cleanup
    // Si jsdom pose problème avec jose/Uint8Array :
    environment: 'node',      // au lieu de 'jsdom'
  },
})
```

> **Le bug jsdom + jose v6 :** `jsdom` crée un `TextEncoder` qui retourne un `Uint8Array` d'un autre "realm" JS. `jose` v6 fait `instanceof Uint8Array` qui échoue car les deux `Uint8Array` viennent de realms différents. Si aucun test n'utilise le DOM, passer en `environment: 'node'` règle le problème.

---

## Modifications à appliquer

> **Option rapide** : si ton projet est cloné depuis le template, un simple `git pull` du template + merge suffit.
>
> **Option manuelle** : copie-colle le prompt ci-dessous dans une nouvelle conversation Claude Code (VSCode), depuis la racine de ton projet.

---

## Prompt à copier-coller dans Claude Code

```
Applique TOUTES les modifications suivantes au framework Tiple Method. Ce sont des corrections critiques pour empêcher Claude de lancer des commandes en background, d'ajouter des pipes, de rediriger vers des fichiers, et de faire de l'implémentation pendant le cadrage.

Il y a 10 actions à faire. Fais-les toutes d'un coup, dans l'ordre.

---

### ACTION 1 — Créer le fichier `.claude/hooks/enforce-bash-rules.sh`

Créer ce fichier (nouveau) :

```bash
#!/bin/bash
# .claude/hooks/enforce-bash-rules.sh
# Bloque les violations des règles d'exécution Bash (CLAUDE.md)
# Hook PreToolUse — s'exécute AVANT chaque appel Bash
# Exit 0 = autorisé, Exit 2 = bloqué (message affiché à Claude)
# Compatible macOS + Windows (pas de dépendance jq)

INPUT=$(cat)

# --- Règle 1 : JAMAIS de run_in_background ---
# Vérifie plusieurs formats possibles du JSON (avec/sans espaces, minifié ou pretty-printed)
if echo "$INPUT" | grep -q '"run_in_background"'; then
  # Le champ existe — vérifier s'il est true
  if echo "$INPUT" | grep -qE '"run_in_background"\s*:\s*true'; then
    echo "BLOQUÉ: run_in_background=true est INTERDIT. Relance en foreground avec timeout: 120000 (ou jusqu'à 600000 pour les builds longs). Voir CLAUDE.md règle 1." >&2
    exit 2
  fi
fi

# Extraire la commande (entre les guillemets après "command":)
# On utilise grep + sed car jq n'est pas toujours disponible
COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"command"[[:space:]]*:[[:space:]]*"//;s/"$//')

# --- Règle 2 : Aucun pipe vers des commandes de troncature/filtrage ---
if echo "$COMMAND" | grep -qE '\|\s*(tail|head|grep|wc|tee|less|more|awk|sed)\b'; then
  echo "BLOQUÉ: Pipe interdit. Exécuter la commande brute sans '|'. Voir CLAUDE.md règle 2." >&2
  exit 2
fi

# --- Règle 3 : Aucune redirection fichier pour les commandes build/check ---
if echo "$COMMAND" | grep -qE '(pnpm|npm|npx|tsc|node)\b.*\s+(>|>>|2>&1\s*>)\s'; then
  echo "BLOQUÉ: Redirection de sortie interdite. La sortie doit aller dans le terminal. Voir CLAUDE.md règle 3." >&2
  exit 2
fi

# --- Règle 4 : Aucune boucle d'attente / polling ---
if echo "$COMMAND" | grep -qE 'while\s+(true|:)\s*;|watch\s+|until\s+.*;\s*do'; then
  echo "BLOQUÉ: Boucle d attente/polling interdite. Voir CLAUDE.md règle 4." >&2
  exit 2
fi

# Tout OK
exit 0
```

Puis rendre exécutable : `chmod +x .claude/hooks/enforce-bash-rules.sh`

---

### ACTION 2 — Créer le fichier `.claude/settings.json`

Créer ce fichier (nouveau) — c'est la config projet, pas le `.local` :

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/enforce-bash-rules.sh\""
          }
        ]
      }
    ]
  }
}
```

---

### ACTION 3 — Créer le fichier `.claude/commands/commit-push.md`

Créer ce fichier (nouveau) :

```markdown
# /commit-push — Commit & Push avec vérification complète

> Commande à utiliser pour chaque commit + push. Garantit la qualité avant d'envoyer sur le remote.
> Ne JAMAIS commit/push sans passer par cette commande.

## Règles d'exécution Bash

> **⚠️ TOUTES les commandes ci-dessous DOIVENT être exécutées en foreground, sans pipe, sans redirection, sans background.**
> Exécuter chaque commande brute avec `timeout: 120000`. Voir CLAUDE.md "Règles d'exécution Bash".

## Étapes

### 1. Vérification triple (type-check + lint + tests)

Lancer les 3 checks **séquentiellement**. Si l'un échoue, corriger avant de continuer.

1. **Type-check** — `pnpm type-check`
   - Si erreurs : lister, corriger, relancer (max 3 cycles)
2. **Lint** — `pnpm lint`
   - Si erreurs (pas warnings) : lister, corriger, relancer (max 3 cycles)
3. **Tests unitaires** — `pnpm test`
   - Si échecs : identifier les tests cassés, corriger, relancer (max 3 cycles)

Si un check ne passe pas après 3 cycles → signaler le blocage à l'utilisateur et **STOP**. Ne PAS continuer vers le commit.

### 2. Résumé des vérifications

Afficher :

    ✅ type-check : OK
    ✅ lint : OK (X warnings)
    ✅ tests : X passed, 0 failed

### 3. Analyser les changements

- `git status` pour voir les fichiers modifiés/ajoutés
- `git diff` pour voir le contenu des changements
- `git log --oneline -5` pour le style des commits récents

### 4. Mettre à jour le changelog

Ajouter une entrée en haut de `docs/changelog.md` (après le commentaire HTML) au format :

    ## [YYYY-MM-DD] — [Scope court]
    **Quoi :** Description concise de ce qui a été fait
    **Pourquoi :** La raison / le contexte / la story
    **Fichiers :** Liste des fichiers créés/modifiés (chemins relatifs)

- La date est celle du jour
- Le scope résume le domaine (ex: "Shipping sync order", "Fix PDF generation")
- Lister TOUS les fichiers modifiés dans ce commit

### 5. Commit

- Ajouter les fichiers pertinents au staging (`git add` — fichiers spécifiques, jamais `git add -A`)
  - Inclure `docs/changelog.md` dans le staging
  - Ne JAMAIS commit de fichiers sensibles (.env, credentials, etc.)
- Rédiger un message de commit concis qui explique le **pourquoi** :
  - Préfixe : `fix:`, `feat:`, `refactor:`, `docs:`, `chore:`, `perf:`
  - 1-2 lignes max
  - Terminer par `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`
- Créer le commit via HEREDOC

### 6. Push

- Vérifier que la branche track bien le remote (`git status` après commit)
- `git push`
- Confirmer le succès du push

### 7. Résumé final

Afficher :

    ✅ Vérifications : type-check + lint + tests OK
    ✅ Changelog : mis à jour
    ✅ Commit : <hash court> <message>
    ✅ Push : main → origin/main

## Règles

- Les 3 checks DOIVENT passer avant de commit — aucune exception
- Le changelog DOIT être mis à jour à chaque commit
- Ne JAMAIS utiliser `--no-verify` ou `--force`
- Ne JAMAIS amend un commit existant sauf demande explicite de l'utilisateur
- Si le push échoue (conflict, etc.) → signaler à l'utilisateur, ne pas force push
- Ne JAMAIS skip les vérifications même si l'utilisateur dit "juste push vite"
```

---

### ACTION 4 — Modifier `.gitignore`

Dans la section "Claude Code", remplacer :

```
# Claude Code
.claude/*
!.claude/commands/
```

par :

```
# Claude Code
.claude/*
!.claude/commands/
!.claude/settings.json
!.claude/hooks/
```

---

### ACTION 5 — Supprimer `.github/workflows/ci.yml`

Supprimer ce fichier. Les checks (type-check, lint, tests) sont maintenant exécutés localement via `/commit-push` avant chaque push. Plus de CI GitHub pour ça.

---

### ACTION 6 — Remplacer le contenu de `CLAUDE.md`

Remplacer le fichier CLAUDE.md entier par le contenu suivant (attention : adapter la section "Projet" si elle a déjà été remplie dans ton projet) :

```markdown
# CLAUDE.md — Tiple Method

## Projet
<!-- À REMPLIR : Nom du projet, description en 1 ligne -->

## Stack
Next.js 15 (App Router) + TypeScript strict + Tailwind CSS + Shadcn/ui
Backend/DB optionnel : Supabase (à ajouter selon le projet — voir section "Supabase" ci-dessous).
Voir `.tiple/conventions/tech-stack.md` pour les versions exactes.

## Méthode
Ce projet suit la Tiple Method. La documentation dans `docs/` est la source de vérité. Lis les fichiers pertinents avant chaque action.

## Règles absolues
1. Ne JAMAIS coder sans story en statut 🟢 Ready dans `docs/stories/`
2. TOUJOURS lire avant de coder : la story, la référence UI de la story (maquette, Figma, description — si applicable), `docs/architecture.md`, et les **conventions par tags** (voir ci-dessous)
3. Ne JAMAIS créer un composant/hook/util sans vérifier le component-registry d'abord — s'il existe, réutiliser
4. Ne JAMAIS modifier un invariant d'architecture sans créer un ADR dans `docs/decisions/`
5. Les tests sont écrits AVEC le code, pas après — unit tests d'abord, puis intégration, puis e2e si applicable
6. Après implémentation : remplir la section "Post-implémentation" de la story
7. Après implémentation : passer `.tiple/checklists/code-review.md` point par point
8. **`/tm-plan` = documentation uniquement.** Ne JAMAIS installer de dépendances, créer de fichiers de code ou exécuter de builds pendant un cadrage. Seuls les fichiers dans `docs/` et `.tiple/sprint/` sont modifiés.

## Règles d'exécution Bash (TOUTES les commandes)

> **⚠️ Ces règles s'appliquent à TOUTES les commandes : `pnpm add`, `pnpm install`, `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm build`, `npx`, et toute autre commande shell.**

1. **TOUJOURS en foreground.** Ne JAMAIS utiliser `run_in_background: true` sauf si l'utilisateur le demande explicitement. Toujours exécuter avec un timeout adapté (défaut: 120000ms, max: 600000ms pour les builds longs).
2. **AUCUN pipe.** Ne JAMAIS ajouter `| tail`, `| head`, `| grep`, `| wc`, `2>&1 | ...` ou tout autre pipe. Exécuter la commande brute.
3. **AUCUNE redirection fichier.** Ne JAMAIS rediriger la sortie vers un fichier (`> output.txt`, `2>&1 > log.txt`, `| tee file.txt`). La sortie doit aller directement dans le terminal.
4. **AUCUNE boucle d'attente.** Ne JAMAIS utiliser `sleep` + `cat`/`tail` pour poll un fichier de sortie. Ne JAMAIS utiliser `while true; do ... done`, `watch`, ou toute boucle pour surveiller une commande.
5. **Si une commande en background a été lancée par erreur**, attendre la notification de fin. Ne JAMAIS poll manuellement.
6. **Si une commande dépasse le timeout**, ne PAS relancer en boucle — informer l'utilisateur et proposer d'augmenter le timeout ou de lancer manuellement.
7. **Commande brute = la commande et rien d'autre.** Exemples corrects : `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm add @supabase/supabase-js`. Exemples INTERDITS : `pnpm type-check 2>&1 | tail -20`, `pnpm install > log.txt`, `pnpm test &`.

## Conventions par tags (chargement intelligent)

Les conventions techniques sont dans `.tiple/conventions/`. Elles sont chargées **automatiquement** selon le contexte :

- **Index :** `.tiple/conventions/_index.md` liste tous les tags et les fichiers associés
- **Base (toujours lues) :** `coding-standards.md`, `component-registry.md`, `tech-stack.md`
- **Mode story (`/tm-dev E01-S01`) :** le champ `Conventions` de la story déclare les tags → les fichiers correspondants sont chargés
- **Mode libre (`/tm-dev` ou `/tm-fix`) :** les tags sont déduits des fichiers touchés (ex: `lib/actions/` → `api`, `supabase/migrations/` → `database`)

Tags disponibles : `auth`, `database`, `supabase`, `api`, `forms`, `realtime`, `security`, `nextjs`, `typescript`, `state`, `feedback`, `performance`, `tables`, `uploads`, `seo`, `a11y`, `i18n`, `datetime`, `monitoring`, `flags`, `deploy`, `testing`

## Règles avant push
1. **TOUJOURS utiliser `/commit-push`** pour commit et push. Cette commande exécute la vérification triple (type-check + lint + tests) avant le commit, met à jour le changelog, et push.
2. Ne JAMAIS push du code qui casse le build ou les tests
3. Ne JAMAIS commit/push en dehors de `/commit-push` sauf demande explicite de l'utilisateur
4. Voir "Règles d'exécution Bash" ci-dessus pour les contraintes d'exécution des commandes.

## Règles Next.js
1. **Server Components par défaut.** Pas de `"use client"` sauf si nécessaire (state, effects, event handlers). Pousser le `"use client"` le plus bas possible dans l'arbre.
2. **Server Actions pour les mutations.** Pas d'API routes sauf webhooks/cron. Chaque action : vérifier auth → valider Zod → exécuter → `revalidatePath` → retourner `{data}` ou `{error}`.
3. **Schemas Zod partagés.** Un schema dans `lib/schemas/` = validé côté form + côté action. Pas de double validation manuelle.
4. **Route groups : toujours un `page.tsx`.**  Un route group (ex: `(dashboard)`) avec un `layout.tsx` DOIT avoir au moins un `page.tsx`, sinon le build Next.js échoue (`ENOENT: client-reference-manifest.js`). Si le route group n'est pas utilisé, supprimer le dossier entier.

## Starters

Le template est minimal par défaut. Les starters dans `.tiple/starters/` ajoutent des fonctionnalités complètes. Ils sont **identifiés** par `/tm-plan` (Phase 0) et **installés** par `/tm-dev` lors de la story E01-S01 (Setup technique).

### Supabase + Auth (`.tiple/starters/supabase-auth/`)
Ajoute : base de données, auth (login/signup/reset), middleware, Server Actions, pages auth, CI migrations.
Activé quand le projet a besoin d'une base de données et/ou d'authentification.
Voir `.tiple/starters/supabase-auth/README.md` pour le détail.

### Règles Supabase (quand activé)
- **Supabase côté serveur uniquement pour les mutations.** Le browser client est réservé au realtime et à l'auth listener. Jamais de `.insert()/.update()/.delete()` depuis un Client Component.
- **RLS activé sur toute table.** Pas d'exception sans ADR documenté. Le `service_role` client est interdit sauf cas explicitement documenté.
- **Migrations versionnées.** Chaque changement DB = `pnpm db:migrate [nom]` → fichier SQL dans `supabase/migrations/`. Jamais de modification en direct. CI auto-deploy via `.github/workflows/supabase-migrations.yml`.
- **Auth vérifiée dans chaque Server Action** (pas seulement le middleware).

## Workflow quotidien
1. Lire `.tiple/sprint/status.md` → identifier la prochaine story 🟢 Ready
2. Lire la story complète + ses refs (parcours PRD, référence UI, archi, conventions)
3. Vérifier `.tiple/checklists/story-ready.md`
4. Implémenter : schemas Zod → backend → tests unit → UI → tests unit UI → page → tests integ
5. Écrire les tests (unit + integ) au fur et à mesure
6. Vérifier que les tests de la story passent
7. **Vérification triple** (OBLIGATOIRE — `/tm-verify`) :
   - `pnpm type-check` → doit passer sans erreur
   - `pnpm lint` → doit passer sans erreur
   - `pnpm test` → tous les tests doivent passer (non-régression)
8. **Code Review en agent isolé** (OBLIGATOIRE — `/tm-review`) :
   - Lancer un agent autonome séparé (regard neuf, sans biais d'implémentation)
   - L'agent passe `.tiple/checklists/code-review.md` point par point
   - Couvrir : sécurité, qualité, DRY, tests, conventions, architecture, documentation
   - Si problèmes HAUTE/MOYENNE → corriger puis relancer l'étape 7, puis nouveau review agent
9. Mettre à jour la story (post-implémentation)
10. Mettre à jour `.tiple/conventions/component-registry.md` si nouveaux composants
11. Mettre à jour `.tiple/sprint/status.md` → story ✅ Done
12. Ajouter une entrée dans `docs/changelog.md` si changement significatif
13. Résumer ce qui a été fait

## Quand le PRD évolue
1. Modifier `docs/prd.md` — parcours concerné, statut 🔶 Draft
2. Passer `.tiple/checklists/prd-evolution.md` point par point
3. Identifier les impacts : parcours, maquettes/références UI (si applicable), architecture, epics, stories, DB
4. Mettre à jour `docs/architecture.md` (+ ADR si invariant touché)
5. (si maquettes) Mettre à jour les maquettes si nécessaire (`docs/design/screens/`)
6. Mettre à jour les epics et stories impactées
7. Ajouter une entrée dans `docs/changelog.md`
8. Lister les nouvelles stories à créer

## Quand on crée un nouveau composant
1. Vérifier `.tiple/conventions/component-registry.md` — s'il existe déjà, réutiliser
2. Implémenter en suivant `.tiple/conventions/coding-standards.md`
3. Ajouter au component-registry (nom, path, props, notes)
4. Respecter `docs/design/system.md` pour les tokens visuels

## Commandes disponibles

Slash commands dans `.claude/commands/` :

| Commande | Usage | Description |
|----------|-------|-------------|
| `/tm-plan` | Nouveau projet / nouvelle feature | Cadrage complet : brief → PRD → archi → design → epics/stories → gate |
| `/tm-dev` | Implémentation | `E01-S01` (story), `next` (prochaine), ou sans arg (mode libre) |
| `/tm-fix` | Bug fix / petite modif | Correction rapide avec chargement auto des conventions |
| `/commit-push` | Commit & push | Vérification triple + changelog + commit + push (OBLIGATOIRE) |

## Design System

Le projet inclut un design system violet corporate complet. Toujours s'y référer avant de créer un composant UI.

- **Tokens & documentation :** `docs/design/system.md` — couleurs, typographie, spacing, radius, shadows
- **Preview interactive :** route `/design-system` — tous les composants rendus
- **Composants Shadcn/ui :** `src/components/ui/` — 34 composants installés (style new-york)
- **Composants métier :** `src/components/` — PageContainer, EmptyState, StatCard, DataTable, ThemeToggle, ThemeProvider
- **Registry complet :** `.tiple/conventions/component-registry.md` — TOUJOURS vérifier avant de créer un composant
- **Thème :** Violet profond corporate, dark mode class-based (next-themes), Inter font
- **CSS Variables :** `src/app/globals.css` — tous les tokens (light + dark)
- **Tailwind config :** `tailwind.config.ts` — couleurs, radius, animations

### Règles UI
1. **Réutiliser les composants existants** — vérifier le registry et `src/components/ui/` avant de créer
2. **Respecter les tokens** — utiliser les classes Tailwind sémantiques (`bg-primary`, `text-muted-foreground`, `border-border`)
3. **Pas de couleurs en dur** — toujours passer par les CSS variables/tokens
4. **Dark mode compatible** — tester les deux thèmes

## Conventions
- Index des tags : `.tiple/conventions/_index.md`
- Coding standards : `.tiple/conventions/coding-standards.md`
- Stack technique : `.tiple/conventions/tech-stack.md`
- Stratégie de tests : `.tiple/conventions/testing-strategy.md`
- Registry composants : `.tiple/conventions/component-registry.md`
- Patterns API : `.tiple/conventions/api-patterns.md`
```

---

### ACTION 7 — Remplacer `.claude/commands/tm-plan.md`

Remplacer le fichier entier par : le contenu complet est dans le template Git (trop long pour ce prompt). Les changements clés :
- Blockquote rouge en haut : "RÈGLE CRITIQUE — /tm-plan = ZÉRO code, ZÉRO commande système"
- Phase 0 réécrite : "identification uniquement — PAS d'installation" avec double warning
- Phase 4 : plus de référence à modifier `globals.css` ou `tailwind.config.ts`

Le plus simple : copier le fichier depuis le template à jour (`git pull` du template).

---

### ACTION 8 — Modifier `.claude/commands/tm-verify.md`

Remplacer la section "## Règles" (à la fin du fichier) par :

```markdown
## Règles d'exécution (CRITIQUE — lire avant de lancer)

> **⚠️ Ces commandes DOIVENT être exécutées en foreground, sans pipe, sans redirection.**
> Claude a tendance à lancer ces commandes en background puis à poll le fichier de sortie — c'est INTERDIT.

- **Foreground uniquement** : `run_in_background: false` (défaut). Timeout : `120000` ms minimum.
- **Aucun pipe** : pas de `| tail`, `| head`, `| grep`, `2>&1 | ...`
- **Aucune redirection fichier** : pas de `> output.txt`, `2>&1 > log.txt`, `| tee file.txt`
- **Aucune boucle d'attente** : pas de `sleep` + `cat`, `while true; do tail ...`, `watch`
- **Commande brute** : exécuter exactement `pnpm type-check`, `pnpm lint`, `pnpm test` — rien d'autre
- Si le timeout est dépassé : **ne PAS relancer en boucle**. Informer l'utilisateur et proposer d'augmenter le timeout ou de lancer manuellement.

## Règles métier
- Les 3 checks DOIVENT passer avant de continuer
- Si un check échoue, corriger AVANT de passer au suivant
- Maximum 3 cycles de correction par check — au-delà, signaler le blocage à l'utilisateur
- Ne JAMAIS skip un check ou le marquer OK s'il a échoué
```

---

### ACTION 9 — Ajouter un warning dans la Phase 3 de `tm-dev.md`, `tm-fix.md` et `tm-feature.md`

Dans chacun de ces 3 fichiers, trouver chaque section "Phase 3 — Vérification triple" et ajouter ce blockquote JUSTE AVANT les lignes `pnpm type-check` / `pnpm lint` / `pnpm test` :

```markdown
> **⚠️ EXÉCUTION : foreground, sans pipe, sans redirection, sans background.**
> Exécuter chaque commande brute avec `timeout: 120000`. Voir `.claude/commands/tm-verify.md` pour les règles complètes.
```

Attention : `tm-dev.md` a DEUX sections Phase 3 (mode Story et mode Libre) — ajouter le warning dans les deux.

Dans `tm-feature.md`, remplacer aussi la ligne de la Phase 5 :
```
11. `pnpm type-check && pnpm lint && pnpm test` → tout passe
```
par :
```
11. Lancer séparément (en foreground, sans pipe) : `pnpm type-check`, puis `pnpm lint`, puis `pnpm test` → tout passe
```

---

### ACTION 10 — Mettre à jour les conventions

Dans `.tiple/conventions/deployment-patterns.md`, remplacer la section "## CI/CD" et son contenu GitHub Actions par :

```markdown
## Qualité avant push

### Vérification locale via `/commit-push`

    # La commande /commit-push exécute automatiquement :
    # 1. pnpm type-check
    # 2. pnpm lint
    # 3. pnpm test
    # Puis commit + push si tout passe.
    # Pas de CI GitHub pour les checks — tout se fait en local.
```

Dans `.tiple/conventions/testing-strategy.md`, remplacer :
```
- CI minimale : `pnpm test` (unit + integ) sur chaque push
```
par :
```
- `/commit-push` exécute `pnpm test` (unit + integ) avant chaque push
```

---

Applique toutes ces modifications maintenant. Ne lance PAS de commande pnpm, type-check, lint ou test — c'est juste de l'édition de fichiers Markdown, JSON et un script Bash.
```

---

## Vérification après application

Une fois le prompt exécuté, vérifie que :

1. `.claude/hooks/enforce-bash-rules.sh` existe et est exécutable
2. `.claude/settings.json` existe avec la config hooks
3. `.claude/commands/commit-push.md` existe
4. `.github/workflows/ci.yml` n'existe plus
5. `CLAUDE.md` contient la section "Règles d'exécution Bash" et la règle absolue 8

Test rapide du hook : dans une nouvelle conversation Claude Code, demande "lance pnpm type-check en background". Claude devrait recevoir un message "BLOQUÉ" et relancer en foreground automatiquement.

---

## Troubleshooting — Si les commandes partent encore en background

Le hook bloque les pipes, redirections et boucles de manière fiable. Pour le `run_in_background`, le hook essaie de le bloquer mais le runtime VSCode peut parfois imposer le background automatiquement quand une commande est lente.

### Checklist si ça arrive encore

1. **Tuer les zombies** : `pkill -f vitest; pkill -f "tsc --noEmit"` puis relancer
2. **Vérifier que vitest finit en < 30s** : `time pnpm test` — si ça prend plus, c'est un problème vitest (pas Claude)
3. **Redémarrer VSCode** — le TS Language Server peut monopoliser le CPU et ralentir tsc
4. **Vérifier le hook** : `echo '{"tool_input":{"command":"pnpm test","run_in_background":true}}' | bash .claude/hooks/enforce-bash-rules.sh` — doit afficher "BLOQUÉ" et exit 2
5. **Dernier recours** : ajouter dans `vitest.config.ts` :
   ```ts
   test: {
     environment: 'node',       // évite le bug jsdom + jose
     testTimeout: 10000,
     forceExit: true,           // force la sortie après les tests
   }
   ```

### Le vrai fix

Le background n'est qu'un **symptôme**. La cause racine est que les commandes sont lentes. Si `pnpm type-check` finit en 5s et `pnpm test` en 10s, Claude n'a aucune raison de les mettre en background. Investir 10 min pour nettoyer l'environnement (étape 0) vaut plus que n'importe quel hook.
