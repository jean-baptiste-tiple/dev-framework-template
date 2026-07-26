---
name: tm-plan
description: "Cadrage produit : brief, PRD par parcours, architecture, design, epics/stories. À invoquer explicitement (/tm-plan). Si l'utilisateur décrit un besoin produit large sans le demander, PROPOSER un cadrage et attendre son accord — ne jamais en lancer un de sa propre initiative : il réécrit PRD, architecture et stories."
argument-hint: "[scope / version optionnels]"
---

# tm-plan — Cadrage

Un dialogue qui produit les documents de cadrage. Pas un formulaire, pas un pipeline
obligatoire : **une liste d'artefacts dont seuls les manquants ou les impactés sont produits.**

> **RÈGLE CRITIQUE — zéro code, zéro commande système.**
> Ce skill ne modifie que des Markdown dans `docs/` et `.tiple/sprint/`. Interdit pendant un
> cadrage : installer des dépendances, créer/modifier `.ts` `.tsx` `.js` `.css` `.json`, lancer
> un build/lint/test, copier des fichiers de starter, créer des dossiers dans `src/`,
> `supabase/`, `.github/`. L'installation technique est faite par `tm-dev`, dans la story de setup.

## Étape 0 — Choisir le niveau (ou refuser)

Regarder ce qui existe déjà (`docs/prd.md`, `docs/architecture.md`, `docs/stories/`) et ce que
la demande touche :

| Niveau | Quand | Ce qui est produit |
|--------|-------|--------------------|
| **Refus** | La demande tient en quelques fichiers, sans nouveau parcours ni changement de modèle de données | **Rien.** Le dire et basculer sur `tm-dev`. |
| **Évolution** | `docs/prd.md` est rempli et la demande touche un parcours (existant ou nouveau) | Le parcours concerné + la cascade réellement impactée |
| **Initial** | `docs/prd.md` absent, vide ou placeholder | La chaîne complète |

**Le refus est une issue normale, pas un échec.** Formuler :
> « Ça ne mérite pas un cadrage : pas de nouveau parcours, pas de changement de modèle de
> données. Je passe directement en implémentation — dis-moi si tu veux une story quand même. »

En **Évolution**, confirmer avant d'écrire :
> « `docs/prd.md` est déjà rempli. Je fais évoluer le parcours [X] et je cascade sur ce qui est
> réellement impacté — je ne recrée rien. OK ? »

### Règles absolues en Évolution

1. **Jamais de réécriture** d'un document existant — Edit, pas Write
2. Préserver le contenu existant sauf demande explicite
3. **ADR obligatoire** dans `docs/decisions/` pour tout invariant touché (structure, sécurité, modèle de données)
4. Stories et epics existants non retouchés, sauf si leur scope change (le noter dans leur historique)
5. Passer `.tiple/checklists/prd-evolution.md` en plus du readiness-gate

## Les artefacts

Produire **uniquement** ceux qui manquent ou que la demande impacte. Pour chacun, dire
explicitement s'il est produit, mis à jour, ou volontairement laissé de côté.

### `docs/brief.md` — comprendre le problème

Quel problème, pour qui, pourquoi maintenant · personas (nom/rôle/besoin/frustration) · scope
MVP IN/OUT explicites · contraintes (techniques, business, légales, RGPD) · KPIs concrets ·
risques. Quantifier la douleur : « perd 2h/semaine » > « c'est lent ».

En Évolution : ajouter une section de version, ne pas réécrire l'existant.
→ `.tiple/templates/brief.tmpl.md`

### `docs/prd.md` — le PRD par parcours

Un parcours = un objectif utilisateur complet. Pour chacun : flow Mermaid · écrans · FR
`FR-[PARCOURS]-[XX]` avec priorité MoSCoW et AC en Given/When/Then · NFR liés.

Cohérence à vérifier : chaque FR a une référence UI (maquette, description **ou `N/A`**) ·
chaque écran est dans un flow · max 60 % de Must · chaque FR est testable.

En Évolution : les nouvelles sections sont marquées 🔶 Draft, les parcours existants intacts.
→ `.tiple/templates/prd.tmpl.md`

### `docs/architecture.md` — le socle technique

Modèle de données (Mermaid ER) · RLS par table · Server Actions par parcours · points
performance. Commencer simple. RLS dès le jour 1. Un schema Zod = une source de vérité.

→ `.tiple/templates/architecture.tmpl.md` · consulter `.tiple/conventions/_index.md`

### `docs/design/` — le design

Trois situations, toutes valides :

- **Maquettes fournies** → vérifier qu'un fichier existe pour chaque écran du PRD, signaler les
  manquants, mettre à jour `docs/design/screens/_index.md` et `components/_index.md`
- **Pas de maquettes, design system à personnaliser** → questions ciblées (couleur primaire,
  secondaire, font, style) → mettre à jour `docs/design/system.md`. Les fichiers de code
  (`globals.css`, `tailwind.config.ts`) seront modifiés par `tm-dev` à la story de setup
- **Pas de maquettes, design system par défaut** → ne rien faire, le dire, passer à la suite

L'absence de maquette n'est jamais un blocage : les stories portent alors une description
textuelle ou `N/A`.

### `docs/epics/` et `docs/stories/` — le découpage

Epics (`.tiple/templates/epic.tmpl.md`) référençant leur parcours. Stories
(`.tiple/templates/story.tmpl.md`) avec contexte, AC Given/When/Then, fichiers à créer, tests
attendus, référence UI.

Chaque story déclare ses tags `Conventions` (liste dans `.tiple/conventions/_index.md`). Ils
s'ajoutent aux tags déduits des globs au moment du dev — les déclarer sert à couvrir ce que les
chemins de fichiers ne révèlent pas encore.

Ordonner par dépendance et priorité. Une story = un déploiement possible. Taille S/M/L, pas XL.

En Évolution : **uniquement les nouveaux** epics et stories.
→ Mettre à jour `docs/epics/_index.md`

### Starters — identification, jamais installation

Le projet a-t-il besoin d'une base de données et/ou d'authentification ?

**Oui** → lire `.tiple/starters/supabase-auth/README.md`, prévoir une story « Setup technique »
(dépendances, copie des fichiers du starter, `.env.local`, type-check), noter l'activation dans
`docs/architecture.md`. Adapter si les besoins auth sont spécifiques (ex : accès par code →
ne pas copier les pages auth du starter).

**Non** → le template fonctionne sans base de données. Ne rien prévoir.

## Gate de sortie

Passer `.tiple/checklists/readiness-gate.md` (+ `prd-evolution.md` en Évolution). Vérifier la
cohérence PRD ↔ architecture ↔ design ↔ stories. Si KO, corriger avant de clore.

Initialiser ou mettre à jour `.tiple/sprint/status.md` : dates, epic focus, stories
sélectionnées. Puis résumer : ce qui a été produit, ce qui a été volontairement laissé de côté,
et la première story à implémenter.
