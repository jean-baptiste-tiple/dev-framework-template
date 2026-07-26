---
name: tm-dev
description: "Écrire ou explorer du code en respectant les conventions du projet. Déclenche-toi avant toute modification de src/, tests/, supabase/ ou de la config applicative — correction, ajout, refacto, story — et pour toute demande d'exploration read-only du code. NE PAS déclencher pour des modifications purement documentaires (docs/, .tiple/, README) ni pour répondre à une question sans toucher au code."
argument-hint: "[E01-S01 | next | description de ce qu'il faut faire]"
---

# tm-dev — Écrire du code

Deux modes seulement. **Lecture** (aucune écriture) ou **écriture**. Tout le reste — l'ampleur
du process — est déterminé par l'**échelle du changement**, pas par les mots employés dans la
demande.

Si la demande contient `comprends`, `explique`, `analyse`, `audit`, `explore`, `lis` → mode
lecture. Sinon, mode écriture.

---

## Mode lecture — read-only strict

Aucune écriture, aucun type-check, aucune review, aucun changelog. Lire les fichiers concernés,
les conventions correspondantes (pour savoir ce qui *devrait* être respecté), puis répondre :

vue d'ensemble · entrées/sorties · flow principal avec `fichier:ligne` · dépendances internes et
externes · points d'attention (dettes, complexités, écarts aux conventions) · fichiers clés.

Si l'utilisateur veut agir ensuite, il le demandera — ne pas enchaîner sur une implémentation.

---

## Mode écriture

### 1. Déterminer l'échelle

L'échelle se lit sur **ce que le changement touche**, pas sur la façon dont il est formulé.
En cas de doute entre deux échelles, prendre la plus haute et le dire.

| Échelle | Reconnaissance | Process |
|---------|----------------|---------|
| **Micro** | 1-2 fichiers, aucune nouvelle surface (pas de route, table, Server Action ou dépendance nouvelle) | conventions → implémentation → type-check → **review inline** (pas de rapport) |
| **Standard** | 3-5 fichiers, ou création d'une fonction / composant / action | + tests écrits avec le code → **review complète** (skill `tm-review`) → changelog |
| **Module** | nouvelle surface (route, table, parcours), changement DB, ou ≥ 6 fichiers | **proposer une story avant de coder** → tout le Standard → registry → ADR si invariant → sprint status |

**Micro** ne veut pas dire « sans garantie » : les conventions sont chargées et le type-check
tourne. Ce qui disparaît, c'est le cérémonial (rapport de review, entrée de changelog pour un
changement invisible), pas la vérification.

**Module** : proposer une story, ne pas l'imposer. Formuler :
> « Ça touche [surface] sur [n] fichiers — je propose de cadrer une story d'abord (`/tm-plan`),
> les AC servent ensuite de critère de review. Sinon je code directement. »

Si l'utilisateur refuse la story, continuer en Standard et le noter : la review n'aura pas d'AC
à vérifier, seulement les conventions.

### 2. Charger le contexte

**Toujours** — lire `.tiple/conventions/_index.md`, charger les 3 conventions de base
(`coding-standards.md`, `component-registry.md`, `tech-stack.md`) puis les conventions dont un
tag est activé par les **globs** des fichiers visés. **Annoncer la liste chargée.**

**Si une story pilote le travail** (`E01-S01` ou `next` → `.tiple/sprint/status.md`) — lire la
story, vérifier `.tiple/checklists/story-ready.md`, ajouter les tags de son champ `Conventions`
(union avec les globs), lire sa référence UI **si elle n'est pas `N/A`**.

**Sinon** — reformuler la demande en **critères de succès vérifiables** (test qui reproduit,
assertion qui valide, type-check qui passe). Nommer les ambiguïtés et proposer les options :
ne pas trancher en silence. À partir de l'échelle Standard, **proposer le plan avant d'éditer**.

Lire `docs/architecture.md` uniquement sur les sections concernées.

### 3. Implémenter

Ordre quand plusieurs couches sont touchées : migration DB → schemas Zod → Server Actions +
tests unit → composants + tests unit → page + tests d'intégration → E2E si demandé.

Placement des tests (`testing-strategy.md`) : `tests/unit/` · `tests/integration/` · `tests/e2e/`.

**Edits chirurgicaux** : chaque ligne changée trace à la demande. Pas de cleanup adjacent, pas de
reformatage opportuniste. Dead code repéré → le mentionner, pas le supprimer.

### 4. Garde-fous conditionnels

Ils se déclenchent sur la **nature réelle** du travail, quel que soit le vocabulaire employé.

**Le travail corrige un comportement cassé** → écrire d'abord un test qui reproduit le bug et
qui échoue. Pas de fix sans test de non-régression.

**Le travail ne doit rien changer au comportement observable** (réorganisation, extraction,
renommage) → lire les tests existants **avant** de toucher au code · les tests doivent être
**identiques avant/après** — un test modifié signifie un comportement modifié, donc ce n'est
plus une réorganisation · si la zone n'est pas testée, écrire les tests **avant**.

### 5. Vérifier

`pnpm type-check` — doit passer. Max 3 cycles, au-delà remonter le blocage. Lint et tests
complets tournent dans `commit-push`, pas à chaque itération.

### 6. Reviewer

- **Micro** : review inline — relire le diff contre les conventions chargées, signaler ce qui
  cloche. Pas de rapport formaté.
- **Standard et Module** : skill `tm-review`. ❌ CHANGES REQUESTED → corriger HAUTE et MOYENNE →
  `tm-verify` → re-reviewer. Les BASSE sont signalées, jamais appliquées sans accord.

Au-delà de 2 cycles sans converger → s'arrêter et remonter à l'utilisateur.

### 7. Finaliser

| | Micro | Standard | Module |
|---|---|---|---|
| `docs/changelog.md` | si comportement visible | oui | oui |
| `component-registry.md` | — | si composant réutilisable | oui |
| Story post-implémentation | — | si story | oui |
| `.tiple/sprint/status.md` | — | si story | oui |
| ADR `docs/decisions/` | — | si invariant touché | si invariant touché |

En mode story, passer `.tiple/checklists/story-done.md` avant de basculer la story en ✅ Done.

Le commit et le push passent par le skill `commit-push` — un `git commit`/`git push` direct est
bloqué par le hook.

---

## Artefacts optionnels

**Aucun artefact n'est obligatoire. Son absence est déclarée, pas subie.** Pas de maquette, pas
de story, pas de Supabase, pas de design system personnalisé : le travail se fait quand même.
Une référence UI à `N/A` n'est jamais un défaut et la review ne la pénalise pas — elle retire
simplement le critère « conforme à la maquette ».

## Règles transverses

- Conventions chargées et type-check : **à toutes les échelles**, sans exception
- Vérifier le component-registry **avant** de créer un composant
- Server Components par défaut, `"use client"` poussé le plus bas possible
- Un schema Zod = une source de vérité (form + action)
- RLS sur toute nouvelle table
- Les 3 états UI gérés : loading, error, empty
- Pas d'abstraction prématurée — factoriser à partir de 2 occurrences
