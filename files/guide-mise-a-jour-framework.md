# Guide de mise à jour — Tiple Method Framework

**Date :** 2026-04-16
**Auteur :** JB

---

## Probleme

Claude Code a des comportements toxiques récurrents quand il lance des commandes :

1. **Background + polling** : lance `pnpm test` en background, redirige la sortie dans un fichier, puis poll avec `cat`/`tail` en boucle. L'output est bufferisé, le fichier reste vide, Claude boucle indéfiniment.
2. **Pipes** : ajoute `| tail -20` ou `2>&1 | head` aux commandes, ce qui tronque la sortie.
3. **Implémentation pendant `/tm-plan`** : installe des packages et écrit des fichiers `.ts` pendant le cadrage.
4. **Processus zombie vitest/tsc** sur Mac : des processus qui ne se terminent pas s'accumulent et poussent Claude à backgrounder.

## Solution

| Ce qui change | Avant | Apres |
|---------------|-------|-------|
| **Pendant le dev** (`/tm-dev`, `/tm-fix`) | type-check + lint + tests (3 commandes) | **type-check uniquement** |
| **Au push** (`/commit-push`) | type-check + lint + tests | **type-check + lint** (pas de tests) |
| **Apres le push** | Pas de CI | **CI GitHub : lint + tests** |
| **Vercel** | Auto-deploy sur push | Auto-deploy sur push (inchangé) |
| **`/tm-plan`** | Installait des deps et copiait du code | **Documentation uniquement** |

`pnpm test` ne tourne **plus jamais** sur ta machine. Seule la CI GitHub le fait.

---

## Etape 0 — Nettoyage environnement Mac (FAIRE EN PREMIER)

```bash
# 1. Tuer les processus zombie vitest/tsc
pkill -f vitest 2>/dev/null
pkill -f "tsc --noEmit" 2>/dev/null

# 2. Nettoyer
rm -rf node_modules
pnpm store prune
pnpm install

# 3. Redemarrer VSCode completement (fermer + rouvrir)

# 4. Verifier que type-check tourne vite
time pnpm type-check   # doit finir en < 15s
```

Si vitest hang quand tu le lances manuellement, ajouter dans `vitest.config.ts` :
```ts
test: {
  environment: 'node',    // evite le bug jsdom + jose (Uint8Array realm)
  testTimeout: 10000,
}
```

---

## Etape 1 — Appliquer les modifications

Ouvre une **nouvelle conversation** Claude Code (VSCode) a la racine de ton projet et copie-colle ce prompt :

---

```
Applique TOUTES les modifications suivantes. Ce sont 8 actions. Fais-les toutes d'un coup.
NE LANCE AUCUNE commande pnpm, npm, npx — c'est uniquement de l'edition de fichiers.

---

### ACTION 1 — Creer `.claude/hooks/enforce-bash-rules.sh`

Creer ce NOUVEAU fichier :

#!/bin/bash
# .claude/hooks/enforce-bash-rules.sh
# Hook PreToolUse — bloque les violations des regles Bash AVANT execution
# Exit 0 = autorise, Exit 2 = bloque
# Compatible macOS + Windows (pas de dependance jq)

INPUT=$(cat)

# Regle 1 : JAMAIS de run_in_background
if echo "$INPUT" | grep -q '"run_in_background"'; then
  if echo "$INPUT" | grep -qE '"run_in_background"\s*:\s*true'; then
    echo "BLOQUE: run_in_background=true est INTERDIT. Relance en foreground avec timeout: 120000." >&2
    exit 2
  fi
fi

COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"command"[[:space:]]*:[[:space:]]*"//;s/"$//')

# Regle 2 : Aucun pipe
if echo "$COMMAND" | grep -qE '\|\s*(tail|head|grep|wc|tee|less|more|awk|sed)\b'; then
  echo "BLOQUE: Pipe interdit. Executer la commande brute sans '|'." >&2
  exit 2
fi

# Regle 3 : Aucune redirection fichier pour pnpm/npm/tsc
if echo "$COMMAND" | grep -qE '(pnpm|npm|npx|tsc|node)\b.*\s+(>|>>|2>&1\s*>)\s'; then
  echo "BLOQUE: Redirection de sortie interdite." >&2
  exit 2
fi

# Regle 4 : Aucune boucle d'attente
if echo "$COMMAND" | grep -qE 'while\s+(true|:)\s*;|watch\s+|until\s+.*;\s*do'; then
  echo "BLOQUE: Boucle d attente interdite." >&2
  exit 2
fi

exit 0

Puis rendre executable : `chmod +x .claude/hooks/enforce-bash-rules.sh`

---

### ACTION 2 — Creer `.claude/settings.json`

Creer ce NOUVEAU fichier (config projet, PAS le .local) :

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

---

### ACTION 3 — Creer `.claude/commands/commit-push.md`

Creer ce NOUVEAU fichier :

# /commit-push — Commit & Push

> Commande a utiliser pour chaque commit + push.
> Ne JAMAIS commit/push sans passer par cette commande.

## Etapes

### 1. Type-check + Lint

1. **`pnpm type-check`** — Doit passer sans erreur. Si erreurs → corriger et relancer (max 3 cycles).
2. **`pnpm lint`** — Doit passer sans erreur. Si erreurs → corriger et relancer (max 3 cycles).

> Les tests (`pnpm test`) ne sont PAS lances localement — ils tournent sur la CI GitHub apres le push.

### 2. Analyser les changements

- `git status` pour voir les fichiers modifies/ajoutes
- `git diff` pour voir le contenu des changements
- `git log --oneline -5` pour le style des commits recents

### 3. Mettre a jour le changelog

Ajouter une entree en haut de `docs/changelog.md` (apres le commentaire HTML) au format :

## [YYYY-MM-DD] — [Scope court]
**Quoi :** Description concise
**Pourquoi :** La raison / le contexte / la story
**Fichiers :** Liste des fichiers crees/modifies

### 4. Commit

- `git add` des fichiers pertinents (specifiques, jamais `git add -A`)
- Inclure `docs/changelog.md`
- Ne JAMAIS commit de fichiers sensibles (.env, credentials)
- Message : prefixe (`fix:`, `feat:`, `refactor:`, `docs:`, `chore:`, `perf:`) + description concise
- Terminer par `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`

### 5. Push

- `git push`
- Confirmer le succes

### 6. Resume final

Afficher :

    ✅ Type-check : OK
    ✅ Lint : OK
    ✅ Changelog : mis a jour
    ✅ Commit : <hash court> <message>
    ✅ Push : main → origin/main
    ⏳ CI GitHub : tests en cours

## Regles

- `pnpm type-check` et `pnpm lint` DOIVENT passer avant de commit
- Ne JAMAIS lancer `pnpm test` localement — la CI GitHub s'en charge
- Le changelog DOIT etre mis a jour a chaque commit
- Ne JAMAIS utiliser `--no-verify` ou `--force`
- Ne JAMAIS amend un commit existant sauf demande explicite

---

### ACTION 4 — Creer `.github/workflows/ci.yml`

Creer ce fichier (remplacer s'il existe deja) :

name: CI — Lint & Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    name: Lint & Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Unit & integration tests
        run: pnpm test

---

### ACTION 5 — Modifier `.gitignore`

Dans la section "Claude Code", remplacer :

    # Claude Code
    .claude/*
    !.claude/commands/

par :

    # Claude Code
    .claude/*
    !.claude/commands/
    !.claude/settings.json
    !.claude/hooks/

---

### ACTION 6 — Remplacer `CLAUDE.md`

Remplacer le CONTENU ENTIER du fichier `CLAUDE.md` par celui ci-dessous.
ATTENTION : si la section "Projet" a deja ete remplie dans ton projet, recopie-la.

# CLAUDE.md — Tiple Method

## Projet
<!-- A REMPLIR : Nom du projet, description en 1 ligne -->

## Stack
Next.js 15 (App Router) + TypeScript strict + Tailwind CSS + Shadcn/ui
Backend/DB optionnel : Supabase (a ajouter selon le projet — voir section "Supabase" ci-dessous).
Voir `.tiple/conventions/tech-stack.md` pour les versions exactes.

## Methode
Ce projet suit la Tiple Method. La documentation dans `docs/` est la source de verite. Lis les fichiers pertinents avant chaque action.

## Regles absolues
1. Ne JAMAIS coder sans story en statut 🟢 Ready dans `docs/stories/`
2. TOUJOURS lire avant de coder : la story, la reference UI de la story (maquette, Figma, description — si applicable), `docs/architecture.md`, et les **conventions par tags** (voir ci-dessous)
3. Ne JAMAIS creer un composant/hook/util sans verifier le component-registry d'abord — s'il existe, reutiliser
4. Ne JAMAIS modifier un invariant d'architecture sans creer un ADR dans `docs/decisions/`
5. Les tests sont ecrits AVEC le code, pas apres — unit tests d'abord, puis integration, puis e2e si applicable
6. Apres implementation : remplir la section "Post-implementation" de la story
7. Apres implementation : passer `.tiple/checklists/code-review.md` point par point
8. **`/tm-plan` = documentation uniquement.** Ne JAMAIS installer de dependances, creer de fichiers de code ou executer de builds pendant un cadrage. Seuls les fichiers dans `docs/` et `.tiple/sprint/` sont modifies.

## Regles d'execution Bash (TOUTES les commandes)

> **⚠️ Ces regles s'appliquent a TOUTES les commandes : `pnpm add`, `pnpm install`, `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm build`, `npx`, et toute autre commande shell.**

1. **TOUJOURS en foreground.** Ne JAMAIS utiliser `run_in_background: true` sauf si l'utilisateur le demande explicitement. Toujours executer avec un timeout adapte (defaut: 120000ms, max: 600000ms pour les builds longs).
2. **AUCUN pipe.** Ne JAMAIS ajouter `| tail`, `| head`, `| grep`, `| wc`, `2>&1 | ...` ou tout autre pipe. Executer la commande brute.
3. **AUCUNE redirection fichier.** Ne JAMAIS rediriger la sortie vers un fichier (`> output.txt`, `2>&1 > log.txt`, `| tee file.txt`). La sortie doit aller directement dans le terminal.
4. **AUCUNE boucle d'attente.** Ne JAMAIS utiliser `sleep` + `cat`/`tail` pour poll un fichier de sortie. Ne JAMAIS utiliser `while true; do ... done`, `watch`, ou toute boucle pour surveiller une commande.
5. **Si une commande en background a ete lancee par erreur**, attendre la notification de fin. Ne JAMAIS poll manuellement.
6. **Si une commande depasse le timeout**, ne PAS relancer en boucle — informer l'utilisateur et proposer d'augmenter le timeout ou de lancer manuellement.
7. **Commande brute = la commande et rien d'autre.** Exemples corrects : `pnpm type-check`, `pnpm lint`, `pnpm add @supabase/supabase-js`. Exemples INTERDITS : `pnpm type-check 2>&1 | tail -20`, `pnpm install > log.txt`, `pnpm test &`.

## Conventions par tags (chargement intelligent)

Les conventions techniques sont dans `.tiple/conventions/`. Elles sont chargees **automatiquement** selon le contexte :

- **Index :** `.tiple/conventions/_index.md` liste tous les tags et les fichiers associes
- **Base (toujours lues) :** `coding-standards.md`, `component-registry.md`, `tech-stack.md`
- **Mode story (`/tm-dev E01-S01`) :** le champ `Conventions` de la story declare les tags → les fichiers correspondants sont charges
- **Mode libre (`/tm-dev` ou `/tm-fix`) :** les tags sont deduits des fichiers touches (ex: `lib/actions/` → `api`, `supabase/migrations/` → `database`)

Tags disponibles : `auth`, `database`, `supabase`, `api`, `forms`, `realtime`, `security`, `nextjs`, `typescript`, `state`, `feedback`, `performance`, `tables`, `uploads`, `seo`, `a11y`, `i18n`, `datetime`, `monitoring`, `flags`, `deploy`, `testing`

## Regles avant push
1. **TOUJOURS utiliser `/commit-push`** pour commit et push. Cette commande execute `pnpm type-check` + `pnpm lint` (checks locaux), met a jour le changelog, commit et push.
2. **Ne JAMAIS lancer `pnpm test` localement** — les tests tournent exclusivement sur la CI GitHub (`.github/workflows/ci.yml`).
3. Ne JAMAIS commit/push en dehors de `/commit-push` sauf demande explicite de l'utilisateur
4. Voir "Regles d'execution Bash" ci-dessus pour les contraintes d'execution des commandes.

## Regles Next.js
1. **Server Components par defaut.** Pas de `"use client"` sauf si necessaire (state, effects, event handlers). Pousser le `"use client"` le plus bas possible dans l'arbre.
2. **Server Actions pour les mutations.** Pas d'API routes sauf webhooks/cron. Chaque action : verifier auth → valider Zod → executer → `revalidatePath` → retourner `{data}` ou `{error}`.
3. **Schemas Zod partages.** Un schema dans `lib/schemas/` = valide cote form + cote action. Pas de double validation manuelle.
4. **Route groups : toujours un `page.tsx`.**  Un route group (ex: `(dashboard)`) avec un `layout.tsx` DOIT avoir au moins un `page.tsx`, sinon le build Next.js echoue (`ENOENT: client-reference-manifest.js`). Si le route group n'est pas utilise, supprimer le dossier entier.

## Starters

Le template est minimal par defaut. Les starters dans `.tiple/starters/` ajoutent des fonctionnalites completes. Ils sont **identifies** par `/tm-plan` (Phase 0) et **installes** par `/tm-dev` lors de la story E01-S01 (Setup technique).

### Supabase + Auth (`.tiple/starters/supabase-auth/`)
Ajoute : base de donnees, auth (login/signup/reset), middleware, Server Actions, pages auth, CI migrations.
Active quand le projet a besoin d'une base de donnees et/ou d'authentification.
Voir `.tiple/starters/supabase-auth/README.md` pour le detail.

### Regles Supabase (quand active)
- **Supabase cote serveur uniquement pour les mutations.** Le browser client est reserve au realtime et a l'auth listener. Jamais de `.insert()/.update()/.delete()` depuis un Client Component.
- **RLS active sur toute table.** Pas d'exception sans ADR documente. Le `service_role` client est interdit sauf cas explicitement documente.
- **Migrations versionnees.** Chaque changement DB = `pnpm db:migrate [nom]` → fichier SQL dans `supabase/migrations/`. Jamais de modification en direct. CI auto-deploy via `.github/workflows/supabase-migrations.yml`.
- **Auth verifiee dans chaque Server Action** (pas seulement le middleware).

## Workflow quotidien
1. Lire `.tiple/sprint/status.md` → identifier la prochaine story 🟢 Ready
2. Lire la story complete + ses refs (parcours PRD, reference UI, archi, conventions)
3. Verifier `.tiple/checklists/story-ready.md`
4. Implementer : schemas Zod → backend → tests unit → UI → tests unit UI → page → tests integ
5. Ecrire les tests (unit + integ) au fur et a mesure
6. Verifier que les tests de la story passent
7. **Type-check** (OBLIGATOIRE) : `pnpm type-check` → doit passer sans erreur
8. **Code Review en agent isole** (OBLIGATOIRE — `/tm-review`)
9. Mettre a jour la story (post-implementation)
10. Mettre a jour `.tiple/conventions/component-registry.md` si nouveaux composants
11. Mettre a jour `.tiple/sprint/status.md` → story ✅ Done
12. `/commit-push` pour envoyer sur le remote

## Commandes disponibles

Slash commands dans `.claude/commands/` :

| Commande | Usage | Description |
|----------|-------|-------------|
| `/tm-plan` | Nouveau projet / nouvelle feature | Cadrage complet : brief → PRD → archi → design → epics/stories → gate |
| `/tm-dev` | Implementation | `E01-S01` (story), `next` (prochaine), ou sans arg (mode libre) |
| `/tm-fix` | Bug fix / petite modif | Correction rapide avec chargement auto des conventions |
| `/commit-push` | Commit & push | Type-check + lint + changelog + commit + push (OBLIGATOIRE) |

## Design System

Le projet inclut un design system violet corporate complet. Toujours s'y referer avant de creer un composant UI.

- **Tokens & documentation :** `docs/design/system.md`
- **Preview interactive :** route `/design-system`
- **Composants Shadcn/ui :** `src/components/ui/` — 34 composants installes (style new-york)
- **Composants metier :** `src/components/` — PageContainer, EmptyState, StatCard, DataTable, ThemeToggle, ThemeProvider
- **Registry complet :** `.tiple/conventions/component-registry.md` — TOUJOURS verifier avant de creer un composant

### Regles UI
1. **Reutiliser les composants existants**
2. **Respecter les tokens** — classes Tailwind semantiques (`bg-primary`, `text-muted-foreground`, `border-border`)
3. **Pas de couleurs en dur** — toujours passer par les CSS variables/tokens
4. **Dark mode compatible** — tester les deux themes

## Conventions
- Index des tags : `.tiple/conventions/_index.md`
- Coding standards : `.tiple/conventions/coding-standards.md`
- Stack technique : `.tiple/conventions/tech-stack.md`
- Strategie de tests : `.tiple/conventions/testing-strategy.md`
- Registry composants : `.tiple/conventions/component-registry.md`
- Patterns API : `.tiple/conventions/api-patterns.md`

---

### ACTION 7 — Modifier les Phase 3 de `tm-dev.md`, `tm-fix.md`, `tm-feature.md`

Dans chacun de ces 3 fichiers, remplacer chaque section "Phase 3" (qui contient type-check + lint + test) par :

    ### Phase 3 — Type-check (OBLIGATOIRE)

    7. **`pnpm type-check`** — Doit passer sans erreur. Si erreurs → corriger et relancer (max 3 cycles).

    > Le lint et les tests ne sont PAS lances ici. Ils seront executes par `/commit-push` (lint) et la CI GitHub (tests).

ATTENTION : `tm-dev.md` a DEUX sections Phase 3 (mode Story et mode Libre) — modifier les deux.

Dans `tm-feature.md`, remplacer aussi l'etape 11 de la Phase 5 par :

    11. `pnpm type-check` → doit passer (le lint et les tests seront verifies par `/commit-push` et la CI)

Dans les 3 fichiers, remplacer toute mention de "relancer phase 3" ou "relancer etape 8" par "relancer `pnpm type-check`".

---

### ACTION 8 — Ajouter le blockquote dans `tm-plan.md`

Juste apres "Pas un formulaire — un dialogue naturel.", ajouter :

> **🚫 REGLE CRITIQUE — `/tm-plan` = ZERO code, ZERO commande systeme**
>
> Cette commande produit UNIQUEMENT des fichiers Markdown dans `docs/` et `.tiple/sprint/`.
> Pendant toute la duree du `/tm-plan`, il est INTERDIT de :
> - Executer `pnpm add`, `pnpm install`, `npm install`, `npx`, ou toute installation de dependances
> - Creer ou modifier des fichiers `.ts`, `.tsx`, `.js`, `.css`, `.json` (sauf les Markdown de docs)
> - Executer `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm build` ou tout build/check
> - Copier des fichiers de code depuis les starters
> - Creer des dossiers dans `src/`, `supabase/`, `.github/`
>
> L'installation technique sera faite par `/tm-dev` lors de la premiere story (E01-S01 Setup).

Et remplacer la Phase 0 pour qu'elle ne fasse que DOCUMENTER les starters (pas les installer).
Le plus simple : copier le fichier `tm-plan.md` depuis le template a jour.

---

Applique toutes ces modifications maintenant. NE LANCE AUCUNE commande pnpm/npm/npx — c'est uniquement de l'edition de fichiers.
```

---

## Verification apres application

1. `.claude/hooks/enforce-bash-rules.sh` existe et est executable
2. `.claude/settings.json` existe avec la config hooks
3. `.claude/commands/commit-push.md` existe
4. `.github/workflows/ci.yml` existe (lint + tests)
5. `CLAUDE.md` contient "Ne JAMAIS lancer pnpm test localement"
6. `tm-dev.md` Phase 3 = type-check uniquement (pas de lint/test)

## Flow final

| Quand | Quoi | Ou |
|-------|------|----|
| **Dev** (`/tm-dev`, `/tm-fix`) | `pnpm type-check` | Local |
| **Push** (`/commit-push`) | `pnpm type-check` + `pnpm lint` | Local |
| **Apres push** | `pnpm lint` + `pnpm test` | CI GitHub |
| **Apres push** | Deploy | Vercel (auto) |
