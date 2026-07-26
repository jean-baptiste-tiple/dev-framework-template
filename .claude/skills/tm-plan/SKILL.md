---
name: tm-plan
description: "Cadrage documentaire d'un projet ou d'une évolution : brief, PRD par parcours, architecture, design, epics/stories, gate. À invoquer explicitement (/tm-plan). Si l'utilisateur décrit un besoin produit large sans le demander, PROPOSER un cadrage et attendre son accord — ne jamais lancer un cadrage de sa propre initiative : il réécrit PRD, architecture et stories."
argument-hint: "[scope / version optionnels]"
---

# tm-plan — Cadrage

Une conversation continue qui produit les documents de cadrage. Pas un formulaire — un dialogue.

> **RÈGLE CRITIQUE — zéro code, zéro commande système.**
> Ce skill ne modifie que des Markdown dans `docs/` et `.tiple/sprint/`. Interdit pendant un cadrage :
> installer des dépendances, créer/modifier `.ts` `.tsx` `.js` `.css` `.json`, lancer un build,
> un lint, un test, copier des fichiers de starter, créer des dossiers dans `src/` `supabase/` `.github/`.
> L'installation technique est faite par `tm-dev` lors de la story de setup (typiquement E01-S01).

## Mode : initial ou évolution

Détection au démarrage :
- **Initial** : `docs/prd.md` absent, vide ou placeholder → création from scratch
- **Évolution** : `docs/prd.md` rempli **et** l'utilisateur mentionne une version / une grosse feature / un nouveau scope

En mode évolution, **confirmer avant de continuer** :
> « `docs/prd.md` est déjà rempli. On est sur une évolution ? Je fais évoluer les docs existants, je ne les recrée pas. OK ? »

| Aspect | Initial | Évolution |
|---|---|---|
| `docs/brief.md` | Créé depuis le template | Édité — section de version ajoutée |
| `docs/prd.md` | Créé depuis le template | Édité — nouvelles sections 🔶 Draft, parcours existants conservés |
| `docs/architecture.md` | Créé depuis le template | Édité + **ADR obligatoire** pour chaque invariant touché |
| `docs/design/` | Design system + toutes les maquettes | Maquettes des **nouveaux écrans** uniquement |
| `docs/epics/`, `docs/stories/` | Tous créés | **Uniquement les nouveaux** |
| Gate | `readiness-gate.md` | `readiness-gate.md` **+** `prd-evolution.md` |

Règles absolues en mode évolution :
1. **Jamais de réécriture** d'un document existant — Edit, pas Write
2. Préserver le contenu existant sauf demande explicite
3. ADR obligatoire pour tout changement d'invariant (structure, sécurité, modèle de données)
4. Stories/epics existants non retouchés, sauf si leur scope change (le noter dans leur historique)

## Livrables d'entrée

**Requis** : design tokens (`docs/design/system.md`, fourni par défaut dans le template), flows
utilisateur, spec applicative.

**Optionnels** : maquettes JSX (`docs/design/screens/*.jsx`), composants partagés
(`docs/design/components/*.jsx`).

**Sans maquettes, le cadrage fonctionne normalement** — les stories utilisent une description
textuelle ou `N/A` comme référence UI. L'absence de maquette est une donnée déclarée, pas un
manque à combler.

## Phase 0 — Starters (identification, pas installation)

Question : le projet a-t-il besoin d'une base de données et/ou d'authentification ?

**Oui** → lire `.tiple/starters/supabase-auth/README.md`, prévoir une story « Setup technique »
en phase 5 (dépendances, copie des fichiers du starter, `.env.local`, type-check), noter
l'activation dans `docs/architecture.md`. Adapter si les besoins auth sont spécifiques
(ex : auth par code d'accès → ne pas copier les pages auth du starter).

**Non** → le template fonctionne sans base de données. Passer à la phase 1.

## Phase 1 — Comprendre le problème (→ `docs/brief.md`)

Quel problème, pour qui, pourquoi maintenant · personas (nom/rôle/besoin/frustration) ·
scope MVP IN/OUT explicites · contraintes (techniques, business, légales, RGPD) ·
KPIs concrets · risques connus.

Quantifier la douleur : « perd 2h/semaine » > « c'est lent ».

→ `.tiple/templates/brief.tmpl.md`

## Phase 2 — PRD par parcours (→ `docs/prd.md`)

1. **Identifier les parcours** — un parcours = un objectif utilisateur complet
2. **Par parcours** : flow Mermaid · écrans · FR `FR-[PARCOURS]-[XX]` avec priorité MoSCoW et
   AC en Given/When/Then · NFR liés
3. **Cohérence** : chaque FR a une référence UI (maquette, description ou `N/A`) · chaque écran
   est dans un flow · max 60 % de Must · chaque FR est testable
4. **Modèle de données** : entités inférées des parcours

→ `.tiple/templates/prd.tmpl.md`

## Phase 3 — Architecture (→ `docs/architecture.md`)

Modèle de données (Mermaid ER) · RLS par table · Server Actions par parcours · points
performance. Commencer simple. RLS dès le jour 1. Un schema Zod = une source de vérité.

→ `.tiple/templates/architecture.tmpl.md` · consulter `.tiple/conventions/_index.md`

## Phase 4 — Design (→ `docs/design/`)

**Avec maquettes** : vérifier que `docs/design/system.md` est complet (tokens, composants,
patterns, breakpoints) · vérifier qu'un `.jsx` existe pour chaque écran du PRD et signaler les
manquants · mettre à jour `docs/design/screens/_index.md` et `docs/design/components/_index.md`.

**Sans maquettes** : proposer de personnaliser le design system par défaut (couleur primaire,
secondaire, font, style général) et mettre à jour `docs/design/system.md`. Les fichiers de code
(`globals.css`, `tailwind.config.ts`) seront modifiés par `tm-dev` lors de la story de setup.

## Phase 5 — Epics & stories (→ `docs/epics/`, `docs/stories/`)

- Epics depuis `.tiple/templates/epic.tmpl.md` — chaque epic référence son parcours
- Stories depuis `.tiple/templates/story.tmpl.md` — contexte, AC Given/When/Then, fichiers à
  créer, tests attendus, référence UI
- **Chaque story déclare ses tags `Conventions`** (liste dans `.tiple/conventions/_index.md`).
  Ces tags s'ajoutent à ceux déduits des globs au moment du dev — les déclarer sert à couvrir
  ce que les chemins de fichiers ne révèlent pas encore.
- Ordonner par dépendance et priorité. Une story = un déploiement possible. Taille S/M/L, pas XL.

→ Mettre à jour `docs/epics/_index.md`

## Phase 6 — Gate

Passer `.tiple/checklists/readiness-gate.md` point par point. Vérifier la cohérence
PRD ↔ architecture ↔ design ↔ stories. Si KO, corriger avant de clore.

→ Initialiser `.tiple/sprint/status.md` : dates, epic focus, tableau des stories sélectionnées.
→ Résumer : prêt à coder, première story à implémenter.
