# CLAUDE.md — Méthode de développement

## Projet
<!-- À REMPLIR : nom du projet, description en 1 ligne -->

Stack : Next.js 15 (App Router) · TypeScript strict · Tailwind · Shadcn/ui.
Base de données et auth optionnelles via `.method/starters/supabase-auth/`.

## Style de réponse

- Réponses courtes, droit au but. Le minimum de mots possible.
- Pas de récap de ce que l'utilisateur vient de dire. Pas de tableau décoratif ni d'emoji sauf demande.
- Pas de « voici ce que j'ai fait », pas de phrase d'introduction ni de transition. L'état du résultat, rien d'autre.

## Avant de coder

- **Nommer les hypothèses.** Demande ambiguë ou à plusieurs lectures : dire le doute, proposer les options, demander. Ne jamais trancher en silence.
- **Edits chirurgicaux.** Chaque ligne changée trace à la demande. Pas de cleanup adjacent, pas de reformatage opportuniste, pas de refacto non demandé. Dead code repéré : le mentionner, pas le supprimer.
- **Critères de succès vérifiables d'abord.** Reformuler la tâche en checks concrets : test qui reproduit le bug, assertion qui valide la feature, type-check qui passe. Pas de « make it work » flou.
- **Push back quand c'est justifié.** Approche plus simple disponible ou dette évidente créée : le dire avant d'exécuter.
- **Base à jour avant un chantier documentaire.** `git fetch` et écart avec `origin/main` constatés avant d'écrire dans `docs/`, `.method/` ou `CLAUDE.md`. Une règle écrite sur une base périmée cite des chemins morts.

## Après une erreur

- **Corriger l'instance ne solde pas l'erreur** — qu'elle soit commise par l'agent, repérée dans le code ou signalée par l'utilisateur. Après le fix, s'arrêter avant de reprendre le fil : qu'est-ce qui a rendu l'erreur possible, et qu'est-ce qui l'empêchera de revenir ? Tant que la seconde question n'a pas de réponse **écrite**, la récidive est garantie — sous une autre forme, dans un contexte où personne ne fera le lien.
- **L'apprentissage s'écrit là où il sera relu au bon moment**, pas là où c'est commode. Une garde posée dans une convention routée ou une checklist devient **citable en review** (`conventions/<fichier>.md § <section>`) — c'est ce qui la fait relire au bon moment.

| Apprentissage | Emplacement | Accord requis |
|---|---|---|
| Invariant d'architecture absent, flou ou violé | ADR dans `docs/decisions/` (`.method/templates/adr.tmpl.md`) + màj `docs/architecture.md` | Oui — l'ADR est dû (règle absolue 4), son texte se propose (§ Modifications documentaires) |
| Règle technique manquante ou fausse | Fichier du tag dans `.method/conventions/` (globs : `_index.md`) | Oui (§ Modifications documentaires) |
| Point de contrôle absent de la review | `.method/checklists/code-review.md` | Oui |
| Story acceptée alors qu'elle était floue | `.method/checklists/story-ready.md` | Oui |
| Composant recréé au lieu de réutilisé | `.method/conventions/component-registry.md` | Non — dû au fil du code (workflow, étape 8) |
| Règle de travail globale / gotcha projet | `CLAUDE.md` | Oui (§ Modifications documentaires) |
| Contexte de l'erreur sur la story concernée | Section « Post-implémentation », `docs/stories/` | Non — dû (workflow, étape 8) |

- **Une erreur avérée vaut occurrence suffisante.** Le seuil « 2+ occurrences » de `wrap-up` vise les patterns observés, pas les gardes anti-récidive. Le plafond de 400 lignes par fichier de conventions s'applique en revanche à l'identique : si la garde fait déborder, élaguer plutôt qu'empiler. `wrap-up` reste le filet de fin de chantier ; il ne remplace pas cette boucle immédiate.
- **Trois écueils :**
  1. **Ne rien écrire parce que « ça ne se reproduira pas ».** La bonne foi n'est pas un mécanisme.
  2. **Contourner l'accord — dans les deux sens.** Écrire sans le go, ou ne rien proposer sous prétexte qu'il faut un go : l'analyse et la proposition sont dues sur-le-champ, seule l'écriture attend.
  3. **Écrire une règle qui décrit l'erreur au lieu de la rendre détectable.** « Faire attention à X » ne vaut rien. Test avant d'écrire : en relisant la règle, peut-on contrôler si elle a été tenue — par une machine (`pnpm verify`) ou par une citation en review ? « Toute affirmation porte sa source ou est marquée hypothèse » se contrôle ; « être rigoureux » non.

## Règles absolues

1. **Conventions chargées + `pnpm type-check` : à toute échelle, sans exception** — y compris pour un changement d'une ligne.
2. Lire avant de coder : la story si applicable, sa référence UI si elle n'est pas `N/A`, `docs/architecture.md`, et les conventions routées.
3. Ne jamais créer un composant, hook ou util sans avoir vérifié `.method/conventions/component-registry.md`. S'il existe, le réutiliser.
4. Ne jamais modifier un invariant d'architecture sans ADR dans `docs/decisions/`.
5. Les tests s'écrivent AVEC le code : unit, puis intégration, puis e2e si applicable.
6. **Aucun artefact n'est obligatoire ; son absence est déclarée, pas subie.** Pas de maquette, pas de story, pas de base de données : le travail se fait quand même. Une référence UI à `N/A` n'est jamais un défaut et la review ne la pénalise pas.
7. **Cadrage = documentation uniquement.** Pendant un `/plan` : aucune dépendance installée, aucun fichier de code créé, aucun build lancé. Seuls `docs/` et `.method/sprint/` sont modifiés.

### Ce qui est appliqué, et ce qui ne l'est pas

Ces règles n'ont pas la même force, et confondre les deux fait croire à des garanties qui
n'existent pas.

| Garanti par une machine | Tenu par jugement |
|---|---|
| `type-check`, `lint`, `test`, `check:framework` (`pnpm verify`) | Conventions réellement **lues** avant d'écrire (règles 1-2) |
| Le gate de commit : reçu obligatoire, `--no-verify` / `--force` bloqués | Registry consulté avant de créer (règle 3) |
| Routing, citations, globs morts, RLS, routes dupliquées (`check:framework`) | ADR posé sur un invariant touché (règle 4) |
| | Échelle du changement correctement estimée |

Rien ne vérifie qu'une convention a été lue — seulement qu'elle a été **annoncée**. L'annonce
est donc la seule trace : la produire avant d'implémenter, et la produire fausse est un
mensonge, pas un raccourci. Quand un doute existe sur la colonne de droite, le dire plutôt que
de laisser supposer que la colonne de gauche le couvre.

## Échelle du changement

L'ampleur du process dépend de **ce que le changement touche**, jamais des mots employés dans la
demande. En cas de doute entre deux échelles, prendre la plus haute et le dire.

| Échelle | Reconnaissance | Process |
|---------|----------------|---------|
| **Micro** | 1-2 fichiers, aucune nouvelle surface | conventions → implémentation → type-check → **review inline** |
| **Standard** | 3-5 fichiers, ou création d'une fonction / composant / action | + tests → skill `revue` → changelog |
| **Module** | nouvelle surface (route, table, parcours), changement DB, ou ≥ 6 fichiers | **proposer une story avant de coder** → tout le Standard → registry → ADR si invariant → sprint status |

Micro ne veut pas dire « sans garantie » : ce qui disparaît est le cérémonial (rapport de review,
entrée de changelog pour un changement invisible), pas la vérification.

À l'échelle Module, la story se **propose**, ne s'impose pas. Sa raison d'être est précise : c'est
le seul endroit où les AC sont écrits avant le code, donc le seul moyen pour la review de statuer
« AC non livré » au lieu de donner un avis. Si l'utilisateur refuse, **rester en Module sans
story** — registry, ADR et changelog restent dus ; seuls post-implémentation et sprint status
tombent.

### Garde-fous conditionnels

Déclenchés par la **nature réelle** du travail, quel que soit le vocabulaire employé.

- **Correction d'un comportement cassé** → écrire d'abord un test qui reproduit le bug et échoue.
- **Changement qui ne doit rien modifier au comportement observable** (réorganisation, extraction, renommage) → lire les tests existants avant · tests **identiques** avant/après · si la zone n'est pas testée, écrire les tests avant.

## Conventions routées par globs

Le routing `fichier touché → tag → convention` a **une seule source de vérité** : la colonne
**Globs** de [`.method/conventions/_index.md`](.method/conventions/_index.md).

- **Base, toujours lue :** `coding-standards.md` — une seule, volontairement courte.
- **Par globs :** chaque fichier créé ou modifié active des tags ; les fichiers correspondants sont lus **en entier**.
- **Mode story :** les tags du champ `Conventions` s'ajoutent (union avec les globs). C'est le seul moyen d'activer `datetime`, `i18n` et `flags`, qu'aucun chemin ne révèle.
- **Annoncer la liste chargée** avant d'implémenter et avant de reviewer.

Registry et stack sont **routés**, pas systématiques : vérifier le registry n'a de sens qu'en
créant un composant, la stack qu'en touchant aux dépendances.

Ne jamais déduire ce mapping de mémoire ni le recopier ailleurs. Il n'existe **pas** de skill par
tag : `dev` et `revue` matchent les globs eux-mêmes.

**Ce qu'ESLint ou TypeScript applique n'est jamais répété en prose.** Une règle mécanisée est
vérifiée à chaque `pnpm lint` ; la recopier n'ajoute que du volume à lire.

## Skills

Tout vit dans `.claude/skills/`. Un skill se déclenche **sur l'intention** et reste invocable en
`/<nom>`.

| Skill | Déclenchement | Rôle |
|-------|---------------|------|
| `dev` | auto — modification de `src/`, `tests/`, `supabase/`, config | 2 modes (lecture / écriture) × 3 échelles |
| `revue` | auto — fin d'implémentation dès l'échelle Standard | Conventions routées, confrontées au diff |
| `verify` | auto — « vérifie », « ça compile ? », après un fix | `pnpm verify` : 4 checks + reçu |
| `commit-push` | auto — « commit », « push », « envoie » | Checks (sans les rejouer) + changelog + commit + push |
| `wrap-up` | auto — « on a fini », « c'est bouclé » | **Propose** de capturer les apprentissages, n'écrit jamais sans accord |
| `conventions` | auto — question sur une règle, sans fichier touché | Répond depuis `.method/conventions/` en citant la source |
| `audit` | demande explicite d'audit large | Confronte la **codebase existante** aux conventions, par lots |
| `plan` | **explicite uniquement** | Cadrage : refus / story seule / évolution / initial |

`revue` audite un **diff**, `audit` audite **l'existant** — du code écrit avant les conventions,
que personne n'a relu depuis. Mêmes sources citables, même barème de gravité.

`plan` ne s'auto-déclenche jamais (`disable-model-invocation`) : un cadrage réécrit PRD,
architecture et stories. Face à un besoin produit large, le **proposer** et attendre l'accord.

## Modifications documentaires

Éditer `docs/`, `.method/` ou `README.md` sans toucher au code ne déclenche **aucun skill** :
`dev` s'en exclut, `revue` ne review pas de la prose, `conventions` répond mais n'écrit pas.
C'est volontaire — mais trois règles s'appliquent quand même, et personne d'autre ne les porte :

1. **Ne jamais écrire dans `.method/conventions/`, `docs/decisions/` ou `CLAUDE.md` sans accord
   explicite de l'utilisateur.** Une règle ajoutée en silence sera lue comme vraie par toutes les
   sessions suivantes. Proposer, attendre — c'est la règle 1 de `wrap-up`, qui ne se charge pas
   ici.
2. **`pnpm check:framework`** reste dû : le routing, les citations et les références de skills se
   vérifient sur les documents, pas sur le code. Un glob mort ou un `§` inexistant ne se voit
   qu'ici.
3. **Une entrée de changelog** seulement si la modification change ce qu'un lecteur doit faire.
   Une reformulation n'en mérite pas.

`docs/changelog.md`, `.method/sprint/`, `docs/stories/`, `docs/decisions/` et le registry sont
exclus du reçu de vérification : les éditer n'invalide pas des checks déjà passés.

## Vérifier, commiter, pousser

- **Pendant l'implémentation :** `pnpm type-check` seul, à chaque itération.
- **Une fois terminé :** `pnpm verify` — les 4 checks (`check:framework`, `type-check`, `lint`, `test`) **et** l'écriture du reçu. Ne jamais lancer les 4 commandes séparément.
- **Pour commiter :** skill `commit-push`. Il lance `pnpm verify:cached`, qui ne rejoue les checks que si le code a bougé depuis le dernier passage.
- **C'est un gate appliqué, pas une convention.** `.claude/hooks/enforce-git-gate.mjs` bloque tout `git commit` / `git push` direct, et refuse un commit dont le reçu ne couvre pas l'état exact du code. `--no-verify` et `--force` sont bloqués sans échappement possible.
- La CI ne lance que `pnpm build` — validation Vercel et erreurs spécifiques à Linux. Pas de duplication avec le local.

## Invariants techniques

Le détail vit dans les conventions routées ; ces quatre points s'appliquent partout et ne se
déduisent d'aucun chemin de fichier.

1. **Server Components par défaut.** `"use client"` seulement pour state, effets ou event handlers, et poussé le plus bas possible dans l'arbre.
2. **Server Actions pour les mutations.** Pas de Route Handler sauf webhook ou cron. Chaque action : auth → Zod → exécution → revalidation → `{data}` ou `{error}`.
3. **Un schema Zod = une source de vérité**, partagé entre le formulaire et l'action.
4. **RLS activée sur toute table**, sans exception non documentée par un ADR. Auth revérifiée dans chaque Server Action — le middleware ne suffit pas.

Route groups : un groupe (`(dashboard)`) avec un `layout.tsx` doit avoir au moins un `page.tsx`,
et **deux `page.tsx` ne doivent jamais résoudre le même chemin** une fois les segments `(...)`
retirés — Next ne le signale pas, il en choisit un en silence.

## Design system

Violet corporate, dark mode class-based (next-themes), Inter. Tokens dans `src/app/globals.css`,
documentation dans `docs/design/system.md`, preview sur la route `/design-system`.

- **Réutiliser avant de créer** : `.method/conventions/component-registry.md` puis `src/components/ui/`.
- **Classes sémantiques uniquement** (`bg-primary`, `text-muted-foreground`, `border-border`). Aucune couleur Tailwind numérotée (`bg-emerald-500`) dans `src/`.
- **Tester les deux thèmes** avant de considérer un écran terminé.

## Workflow

1. Déterminer l'échelle (Micro / Standard / Module).
2. Charger les conventions routées par globs, plus les tags de la story si applicable. **Annoncer la liste.**
3. Story : la lire entièrement, passer `.method/checklists/story-ready.md`, lire la référence UI si ≠ `N/A`. Sinon : reformuler en critères vérifiables et, dès l'échelle Standard, proposer le plan avant d'éditer.
4. Implémenter : migration DB → schemas Zod → Server Actions + tests → composants + tests → page + tests d'intégration.
5. Appliquer les garde-fous conditionnels.
6. `pnpm verify`.
7. Review — inline en Micro, skill `revue` dès Standard. Tout problème HAUTE ou MOYENNE **cite sa source** (`conventions/<fichier>.md § <section>`, `CLAUDE.md § <section>`, `checklists/code-review.md § <section>`, ou un AC). Sans source : BASSE, non bloquant.
8. Finaliser selon l'échelle : changelog · registry · post-implémentation · sprint status · ADR.
9. `commit-push`.

## Quand le PRD évolue

1. Modifier `docs/prd.md` — parcours concerné, statut 🔶 Draft.
2. Passer `.method/checklists/prd-evolution.md`.
3. Identifier les impacts **réels** : parcours, référence UI, architecture, epics, stories, DB. Ne pas cascader par principe.
4. Mettre à jour `docs/architecture.md`, plus un ADR si un invariant est touché.
5. Mettre à jour les epics et stories impactées, créer uniquement les nouvelles.
6. Ajouter une entrée dans `docs/changelog.md`.

Un changement qui ne touche ni parcours ni modèle de données ne relève pas d'une évolution de
PRD : passer directement en implémentation.
