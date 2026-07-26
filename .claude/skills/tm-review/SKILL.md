---
name: tm-review
description: "Code review conventions-driven : confronte les fichiers modifiés aux règles de .tiple/conventions/ routées par globs. Déclenche-toi automatiquement après toute implémentation de code (story, fix, feature, refacto) avant la finalisation, et quand l'utilisateur demande une relecture : 'review', 'relis', 'vérifie le code', 'c'est correct ?', 'code review'. NE PAS déclencher en mode explore/lecture seule ni sur des modifications purement documentaires."
allowed-tools: Read, Grep, Glob, Bash
---

# tm-review — Code review adossée aux conventions

**Principe : la review ne juge pas à l'instinct, elle confronte le code aux règles écrites.**
Chaque problème remonté doit pointer une règle existante dans `.tiple/conventions/`, dans
`CLAUDE.md` ou dans les critères d'acceptation de la story. Sans source citée, ce n'est pas
un défaut — c'est une suggestion, et elle ne bloque pas.

Cette review tourne dans le contexte courant (pas d'agent isolé). La contrepartie de cette
perte de recul est **la mécanique** : on ne demande pas au reviewer d'avoir des idées, on lui
demande de dérouler des règles lues juste avant. Ne jamais reviewer de mémoire.

## Étape 1 — Périmètre

```
git status --short
git diff --name-only
git diff --name-only --cached
```

Si le travail est déjà commité sur la branche : `git diff --name-only origin/main...HEAD`.

Produire la liste des fichiers **créés ou modifiés**. Les fichiers supprimés sont notés à part
(vérifier qu'aucune référence ne subsiste).

## Étape 2 — Routing (obligatoire, avant toute lecture de code)

1. Lire `.tiple/conventions/_index.md`.
2. Pour chaque fichier du périmètre, matcher la colonne **Globs** → liste de tags actifs.
3. Résoudre les tags en fichiers de conventions, dédupliquer.
4. Charger **en entier** :
   - les 3 conventions de base : `coding-standards.md`, `component-registry.md`, `tech-stack.md`
   - chaque fichier de conventions dont un tag est actif
5. **Annoncer le routing avant de continuer :**

```
Périmètre      : 6 fichiers
Tags actifs    : api, security, forms, testing, a11y
Conventions    : coding-standards, component-registry, tech-stack,
                 api-patterns, security-patterns, testing-strategy, accessibility-patterns
```

Si aucun tag n'est actif, le dire explicitement — c'est une information, pas un échec.

## Étape 3 — Contexte de la demande

- **Mode story** : lire la story dans `docs/stories/` — AC, tests attendus, référence UI, scope.
- **Mode libre** (fix/feature/refacto) : reprendre la demande initiale de l'utilisateur telle
  qu'elle a été formulée. C'est elle qui définit le périmètre légitime du diff.
- Lire `docs/architecture.md` uniquement si le diff touche un invariant.

## Étape 4 — Lecture

Lire **chaque fichier du périmètre en entier**, pas seulement le diff. Un diff correct dans un
fichier incohérent reste un problème.

## Étape 5 — Confrontation règle par règle

Pour **chaque fichier de conventions chargé**, dérouler ses règles et les confronter aux
fichiers du périmètre qui ont activé ce tag. Une règle non applicable est ignorée
silencieusement — ne pas la lister comme « OK ».

Puis passer `.tiple/checklists/code-review.md` — elle ne couvre que le transverse
(périmètre du diff, hygiène, documentation de méthode). Tout le reste est déjà couvert par
les conventions chargées : **ne pas re-vérifier, ne pas dupliquer**.

Enfin, vérifier les AC de la story (mode story) ou l'adéquation à la demande (mode libre).

## Étape 6 — Gravité (indexée sur la source, pas sur le ressenti)

| Gravité | Condition — les deux doivent être vraies |
|---------|------------------------------------------|
| 🔴 **HAUTE** | Une règle citée (`conventions/<fichier>.md § <section>`, `CLAUDE.md § <section>`, ou un AC de la story) est violée **ET** l'impact est sécurité, perte de données, build cassé, ou AC non livré |
| 🟠 **MOYENNE** | Une règle citée est violée, sans impact immédiat (dette, incohérence, test manquant) |
| 🔵 **BASSE** | Aucune règle citable — c'est un avis. **Non bloquant, jamais corrigé d'office.** |

**Règle absolue : pas de citation → pas de HAUTE ni de MOYENNE.** Si une règle te semble
manquante dans les conventions, remonte-la en BASSE avec la mention « convention à créer »
— c'est le rôle de `tm-wrap-up`, pas de la review, de l'ajouter.

## Étape 7 — Sortie

```
## Review — [Story ID | Mode libre : <demande>]

Périmètre   : <n> fichiers
Conventions : <liste>

### Problèmes

| # | Gravité | Fichier:ligne | Règle violée | Problème | Fix |
|---|---------|---------------|--------------|----------|-----|
| 1 | 🔴 HAUTE | src/lib/actions/x.ts:12 | api-patterns.md § Server Actions | Pas de vérification auth avant la mutation | Ajouter le guard `getUser()` en tête d'action |
| 2 | 🟠 MOYENNE | src/components/y.tsx:40 | coding-standards.md § Naming | Fichier en camelCase | Renommer en `y-list.tsx` |
| 3 | 🔵 BASSE | src/lib/utils/z.ts:8 | — | Nom peu explicite | Suggestion : `formatAmount` |

### Verdict

HAUTE : 1 · MOYENNE : 1 · BASSE : 1
❌ CHANGES REQUESTED
```

Verdict = ✅ **APPROVED** si 0 HAUTE et 0 MOYENNE. Les BASSE ne bloquent jamais.

S'il n'y a aucun problème, écrire le tableau vide et `✅ APPROVED` — ne pas inventer de
findings pour justifier la review, et ne pas produire de résumé décoratif par section.

## Étape 8 — Suite

- **❌ CHANGES REQUESTED** → appliquer les fix HAUTE et MOYENNE, relancer `tm-verify`
  (type-check + lint + test), puis relancer cette review. Les BASSE sont mentionnées à
  l'utilisateur, jamais appliquées sans son accord.
- **✅ APPROVED** → continuer vers la finalisation (changelog, registry, story, sprint status).

Plus de 2 cycles de review sans converger → s'arrêter et remonter le blocage à l'utilisateur.
