---
name: wrap-up
description: "Capturer les apprentissages méta d'une session (nouvelles conventions, ADR, composants du registry). Écrire directement dans .method/conventions/, docs/decisions/ ou CLAUDE.md, puis annoncer chaque écriture : fichier, section, règle en une phrase."
when_to_use: "Quand l'utilisateur signale une fin de chantier — 'on a fini', 'c'est bouclé', 'wrap up', 'on termine', 'on récapitule' — OU après la clôture de plusieurs stories/fix dans la même session. NE PAS déclencher : sur une session exploratoire ou de lecture seule (rien n'a été modifié) ; sur une micro-modif (typo, rename) ; si l'utilisateur a déjà refusé la proposition dans la session en cours ; s'il vient de lancer commit-push sans passer par wrap-up — respecter son choix."
argument-hint: "[scope optionnel]"
---

# wrap-up — Capturer ce qu'on a appris

Le code et le changelog disent **ce qu'on a fait**. Ce skill capture **ce qu'on a appris** :
les règles implicites, les pièges, les décisions d'archi qui ne se déduisent pas du code.

**Ne capturer que ce qui va revenir.** Un one-off ne devient pas une convention.

## Phase 1 — Réflexion

Sur la session qui se termine :
1. **Quel contexte manquait ?** — commandes découvertes, quirks de config, gotchas, docs incomplètes
2. **Quels patterns ont marché ?** — approches validées, décisions de style, workflows émergents
3. **Qu'est-ce qui aiderait une session vierge ?** — connaissance non déductible du code

Ignorer ce qui est déjà évident à la lecture du code ou du changelog.

## Phase 2 — Mapper les candidats

| Type d'apprentissage | Destination |
|---|---|
| Nouvelle règle / invariant technique | `.method/conventions/<fichier>.md` (section Règles) |
| Décision d'architecture non-triviale | Nouvel ADR dans `docs/decisions/` (`.method/templates/adr.tmpl.md`) |
| Gotcha / config / commande projet-spécifique | `CLAUDE.md` |
| Composant / hook / util réutilisable créé | `.method/conventions/component-registry.md` |
| Nouveau domaine technique récurrent | Nouveau tag : une ligne dans `_index.md` (avec ses **globs**) + le fichier de conventions. Rien d'autre. |
| Story / bug découvert en chemin | `docs/stories/` ou `.method/sprint/status.md` |

Règles de sélection :
- **Une seule occurrence = pas un pattern.** Attendre 2+ avant de promouvoir en convention.
- **Ne jamais créer de `.claude/skills/<tag>/`** : le routing passe par les globs, et
  `pnpm check:framework` rejette un skill inconnu. Enrichir le fichier de conventions suffit.
- Créer un tag implique de renseigner sa colonne **Globs** dans `_index.md`, sinon aucune
  review ne le chargera jamais. `pnpm check:framework` échoue si c'est oublié.
- Un fichier de conventions est plafonné à 400 lignes. Si l'ajout le fait déborder, c'est le
  signal qu'il faut le scinder — ou élaguer une règle devenue fausse plutôt qu'en empiler une.
- Préférer **mettre à jour** un fichier existant plutôt qu'en créer un.

## Phase 2 bis — Ce qui doit DISPARAÎTRE

Sans mécanisme inverse, les conventions ne font que croître, et le volume à lire devient le
problème. Chercher systématiquement :

- une règle **contredite par le code livré** — la session vient de prouver qu'elle est fausse
- une règle désormais **appliquée par ESLint ou TypeScript** — sa version en prose est du poids mort
- deux fichiers qui portent la **même règle** — en garder un, renvoyer depuis l'autre
- un exemple de code qui ne compile plus avec la version actuelle du framework

Ces suppressions se font au même titre que les ajouts, et s'annoncent pareil. Une session qui retire 40 lignes
périmées vaut mieux qu'une session qui en ajoute 10.

## Phase 3 — Écrire

Éditer les fichiers retenus (Edit plutôt que Write). Aucun accord préalable n'est requis, y
compris dans `.method/conventions/`, `docs/decisions/` et `CLAUDE.md`
(`CLAUDE.md § Modifications documentaires`, règle 1).

Une règle qui en contredit une existante la **remplace** — ne pas laisser les deux cohabiter.

## Phase 4 — Annoncer

```
## Apprentissages de la session

**Écrits :**
1. [CONVENTION] api-patterns.md § Error handling — mapper les codes Supabase vers des messages user
   → vu 3× cette session
2. [ADR] docs/decisions/adr-004-soft-delete.md — soft delete via `deleted_at`, impact RLS
3. [REGISTRY] component-registry.md — `<ConfirmDialog>`, utilisé 3×

**Écartés (one-off) :**
- Typo dans une migration
- Renommage d'une variable
```

Chaque ligne nomme le **fichier**, la **section** et la règle **en une phrase** : c'est ce qui
permet à l'utilisateur de revenir dessus. Une écriture non annoncée est le seul vrai défaut ici.

## Quand ne rien capturer

- Session exploratoire / lecture seule — rien n'a été modifié
- Micro-modif (typo, rename) — pas de méta à capturer
- L'utilisateur a déjà refusé la proposition dans la session en cours
- L'utilisateur vient de lancer `commit-push` sans passer par wrap-up — respecter son choix

## Règles

1. **Toute écriture est annoncée** — fichier, section, règle en une phrase. L'accord préalable n'est pas requis ; l'annonce, oui
2. Pas de capture du one-off — 2+ occurrences avant de promouvoir une règle
3. Pas de doublon : si l'info existe déjà dans `.method/` ou `CLAUDE.md`, ne pas la redire
4. Scope-aware : si un argument est fourni (ex: `wrap-up auth`), limiter la réflexion à ce scope
5. **Zéro capture vaut mieux qu'un faux positif** qui pollue les conventions
