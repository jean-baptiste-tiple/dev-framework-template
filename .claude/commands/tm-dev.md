---
description: "Implémenter/explorer du code — modes story, fix, feature, refacto, explore (auto-détectés)"
argument-hint: "[E01-S01 | next | description : bug/feature/refacto/explore]"
---

# Implémenter du code

Point d'entrée **unique** pour toute action code : implémentation de story, bugfix, nouvelle feature, refacto, ou exploration read-only. Le mode est détecté automatiquement depuis l'argument.

## Détection du mode

Ordre de détection :

| Argument / contenu | Mode déclenché |
|---|---|
| ID de story (ex: `E01-S01`) | **Story** |
| `next` | **Story** (prochaine 🟢 Ready du sprint) |
| Description contient : `comprends`, `explique`, `comment ça marche`, `analyse`, `audit`, `lis`, `parcours`, `explore`, `understand`, `explain` | **Explore** (read-only) |
| Description contient : `refacto`, `refactor`, `nettoie`, `factorise`, `simplifie`, `réorganise`, `DRY`, `clean up`, `dédoublonne` | **Refacto** |
| Description contient : `bug`, `corrige`, `cassé`, `erreur`, `crash`, `ne marche pas`, `broken`, `régression`, `fix` | **Fix** |
| Description contient : `ajoute`, `implémente`, `nouvelle feature`, `nouvelle fonctionnalité`, `add` | **Feature** |
| Argument vide ou ambigu | **Demander à l'utilisateur** quel mode |

Si plusieurs mots-clés matchent, privilégier dans cet ordre : Explore > Refacto > Fix > Feature.

En cas d'ambiguïté, **demander** : *"Tu veux que je corrige un bug, ajoute une feature, refacto un module, ou explore/comprenne un bout de code ?"*

---

## Mode Story

Workflow complet quand une story `docs/stories/` pilote l'implémentation.

### Phase 1 — Contexte

1. Si `next` : lire `.tiple/sprint/status.md`, trouver la prochaine story 🟢 Ready
2. Lire la story complète dans `docs/stories/`
3. Vérifier `.tiple/checklists/story-ready.md` — si KO, signaler et s'arrêter
4. **Charger les conventions pertinentes :**
   - Lire `.tiple/conventions/_index.md` (index des conventions)
   - Lire les **conventions de base** (toujours) : `coding-standards.md`, `component-registry.md`
   - Lire le champ **Conventions** de la story → charger les fichiers correspondants aux tags
   - Exemple : tags `auth, database, forms` → lire `auth-patterns.md`, `database-patterns.md`, `api-patterns.md`
5. Lire le contexte projet :
   - (si référence UI ≠ N/A) La maquette ou description référencée dans la story
   - (si maquettes JSX) Le guide de lecture JSX (`docs/design/guide.md`)
   - `docs/architecture.md` (sections pertinentes)
   - `docs/design/system.md` (tokens, composants)

### Phase 2 — Implémentation

6. Implémenter dans cet ordre :
   a. Migration DB si nécessaire (`supabase/migrations/`)
   b. Schemas Zod (`lib/schemas/`)
   c. Server Actions (`lib/actions/`) + tests unitaires dans `tests/unit/`
   d. Composants UI (`components/`) + tests unitaires dans `tests/unit/`
   e. Page/route (`app/`) + tests d'intégration dans `tests/integration/`
   f. Tests E2E si listés dans la story (dans `tests/e2e/`)

> **Placement des tests :** Respecter strictement l'arborescence de `testing-strategy.md` :
> - Tests unitaires → `tests/unit/` (actions, schemas, hooks, utils, composants isolés)
> - Tests d'intégration → `tests/integration/` (composants form complets, pages, flows multi-composants)
> - Tests E2E → `tests/e2e/`

### Phase 3 — Type-check (OBLIGATOIRE)

7. `pnpm type-check` — Doit passer sans erreur. Si erreurs → corriger et relancer (max 3 cycles).

### Phase 4 — Code Review en agent isolé (OBLIGATOIRE)

8. `git diff --name-only HEAD~1` pour récupérer la liste des fichiers modifiés
9. Lancer un agent autonome :
   ```
   Agent(
     subagent_type="general-purpose",
     prompt="Tu es un code reviewer autonome. Review le code modifié en suivant
     .claude/commands/tm-review.md comme guide.
     Story: [STORY_ID]
     Fichiers modifiés: [LISTE_FICHIERS]
     Lis chaque fichier modifié, lis la checklist .tiple/checklists/code-review.md,
     et produis une review structurée avec verdict par section."
   )
   ```
10. Analyser le résultat :
    - ❌ CHANGES REQUESTED → appliquer les fix, relancer type-check, puis nouvel agent review
    - ✅ APPROVED → continuer

### Phase 5 — Finalisation

11. Entrée dans `docs/changelog.md`
12. Mettre à jour la story : section Post-implémentation
13. Mettre à jour `.tiple/conventions/component-registry.md` si nouveaux composants
14. Mettre à jour `.tiple/sprint/status.md` (story → ✅ Done)

---

## Modes Fix / Feature / Refacto (sans story)

Ces trois modes partagent le même squelette (Phases 1-5 ci-dessous) avec des **règles spécifiques** par mode. Aucune story n'est créée — l'implémentation est directe.

### Phase 1 — Contexte (commun)

1. L'utilisateur décrit le besoin (le mode est détecté depuis sa description)
2. **Charger les conventions pertinentes :**
   - Lire `.tiple/conventions/_index.md`
   - Lire les conventions de base (toujours) : `coding-standards.md`, `component-registry.md`
   - Déduire les tags depuis les fichiers concernés :
     - `lib/actions/` ou `lib/schemas/` → `api`, `forms`
     - `lib/supabase/` ou `supabase/migrations/` → `database`, `supabase`
     - `app/` (layouts, pages) → `nextjs`
     - `components/` avec state/effects → `state`
     - `middleware.ts` ou `(auth)/` → `auth`
     - Fichiers de test → `testing`
   - Charger les conventions correspondantes
   - Note : les skills de `.claude/skills/` peuvent aussi se déclencher automatiquement sur les mêmes tags
3. Lire `docs/architecture.md` (sections pertinentes) et les fichiers concernés
4. **Proposer un plan** (fichiers à modifier, approche) **avant d'éditer**

### Phase 2 — Implémentation (commun)

5. Implémenter en respectant les conventions chargées
6. Écrire/mettre à jour les tests nécessaires

### Phase 3 — Type-check (commun, OBLIGATOIRE)

7. `pnpm type-check` — doit passer. Si erreurs → corriger (max 3 cycles)

### Phase 4 — Review agent isolé (commun, OBLIGATOIRE)

8. Lancer un agent reviewer autonome (voir `.claude/commands/tm-review.md`) — passer en paramètre le mode (fix/feature/refacto) pour orienter le focus
9. Si ❌ CHANGES REQUESTED → fix → relancer type-check → nouvel agent review

### Phase 5 — Finalisation (commun)

10. Entrée dans `docs/changelog.md`
11. Si nouveau composant réutilisable → ajouter au `component-registry.md`

---

### Mode Fix — spécificités

**Focus :** corriger le bug, point.

Règles :
- **Reproduire avant de corriger** si possible (test qui échoue d'abord)
- **Diff minimal** — ne pas faire de cleanup opportuniste
- **Test de non-régression obligatoire** pour chaque bug fixé (unit ou integ selon le scope)
- Review focus : le fix résout-il vraiment le bug ? Pas d'effets de bord ? Pas de régression ? Sécurité préservée ?

### Mode Feature — spécificités

**Focus :** ajouter une capacité, sans casser l'existant.

Règles :
- **Si la feature est non-triviale** (≥ 2 fichiers impactés, nouveau parcours UI, modification DB), **proposer d'abord** de cadrer via `/tm-plan` en mode évolution pour créer une story propre. L'utilisateur peut refuser → continuer en mode libre.
- **Respecter le component-registry AVANT de créer** — réutiliser si possible
- **Loading / error / empty states** sur toute UI nouvelle
- **Respecter le design system** (tokens, pas de couleurs en dur)
- Review focus : UX cohérente ? Accessibilité ? Design system respecté ? RLS si nouvelle table ?

### Mode Refacto — spécificités

**Focus :** améliorer le code **sans changer son comportement**.

Règles absolues :
- **Lire les tests existants AVANT** de toucher au code
- **Aucun changement de comportement** — les mêmes entrées doivent produire les mêmes sorties
- **Tests IDENTIQUES avant/après** — mêmes assertions, même couverture. Si tu dois modifier un test, c'est que tu changes un comportement → ce n'est plus du refacto.
- **Diff minimal** — ne pas embarquer de nouveautés fonctionnelles
- **Si pas de tests sur la zone refactorée** → en écrire AVANT de refactorer (filet de sécurité)
- Review focus : comportement préservé ? Tests identiques ? Lisibilité améliorée ? Pas de régression ?

---

## Mode Explore — read-only

**Focus :** comprendre un bout de code sans le toucher.

Ce mode **n'écrit rien**. Pas de type-check, pas de review agent, pas de finalisation, pas de changelog.

### Workflow

1. Identifier le scope (fichier, module, feature, flow)
2. Lire les fichiers pertinents + `docs/architecture.md` (section correspondante)
3. Charger les conventions pertinentes en lecture (pour comprendre les patterns attendus)
4. Produire un **retour structuré** :

```
## Exploration : [scope]

### Vue d'ensemble
[1-2 phrases sur le rôle du module]

### Entrées / sorties
- Inputs : [d'où viennent les données]
- Outputs : [où vont les données]

### Flow principal
[étape par étape, avec références fichier:ligne]

### Dépendances clés
- Internes : [modules du projet]
- Externes : [packages npm]

### Points d'attention
- [risques, dettes, complexités cachées]
- [conventions respectées ou non]

### Fichiers clés
- [path:line] — [rôle]
```

### Règle absolue

**NE JAMAIS écrire de code ou modifier un fichier en mode Explore.** Si l'utilisateur veut agir après l'exploration, il relancera `/tm-dev` en mode fix/feature/refacto.

---

## Changelog (tous modes sauf Explore)

```markdown
## [YYYY-MM-DD] — [Scope : story ID / fix / feature / refacto]
**Quoi :** Ce qui a été fait (concis)
**Pourquoi :** La raison
**Problèmes :** Ce qui a bloqué (si applicable)
**Fichiers :** Liste des fichiers créés/modifiés
```

## Règles transverses

- Ne JAMAIS skip les phases 3 (type-check) et 4 (review) — elles sont obligatoires en modes Story/Fix/Feature/Refacto
- Si la phase 4 trouve des problèmes HAUTE/MOYENNE → corriger ET relancer type-check avant nouvelle review
- Cycle : Implémenter → Tests → Type-check → Review → Fix si nécessaire → Type-check → Docs
- Le lint et les tests complets sont exécutés par `/commit-push` avant le push, pas pendant le dev
- Vérifier le component-registry AVANT de créer un composant (DRY)
- Server Components par défaut, `"use client"` le plus bas possible
- Schema Zod partagé = une seule source de vérité
- RLS sur toute nouvelle table
- Gérer les 3 états UI : loading, error, empty
- Pas d'abstraction prématurée (factoriser à 2+ occurrences)
