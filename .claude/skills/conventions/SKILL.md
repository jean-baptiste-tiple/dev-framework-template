---
name: conventions
description: "Répondre à une question sur les règles techniques du projet en s'appuyant sur .method/conventions/ plutôt que sur des généralités. Déclenche-toi quand l'utilisateur demande comment quelque chose doit être fait ici — 'comment on gère les erreurs', 'quelle est la règle pour les Server Actions', 'on met les tests où', 'est-ce qu'on a une convention pour X', 'c'est quoi le pattern pour les formulaires' — sans qu'un fichier soit modifié. Dès qu'il y a une modification de code, c'est tm-dev qui route les conventions par globs : ne pas déclencher en doublon."
---

# conventions — répondre depuis les règles écrites, pas de mémoire

Ce skill couvre **un seul cas** : une question sur les règles du projet, posée sans qu'aucun
fichier ne soit touché. Dès qu'il y a un diff, le routing par globs de `tm-dev` et `tm-review`
prend le relais — il est plus précis, puisqu'il part des fichiers réels.

## Protocole

1. Lire [`.method/conventions/_index.md`](../../../.method/conventions/_index.md).
2. Identifier les tags concernés par la question. Le tableau donne, pour chaque tag, son
   fichier et le périmètre couvert par ses globs — c'est aussi la carte de « où vit quoi ».
3. **Lire les fichiers de conventions concernés en entier.** Ne jamais répondre depuis le
   souvenir d'une lecture précédente : ces fichiers évoluent, et une réponse plausible mais
   périmée est pire qu'un « je vais vérifier ».
4. Répondre en **citant la source** : `api-patterns.md § Error Handling`. Une règle sans
   source citable n'est pas une règle du projet, c'est un avis — le dire explicitement.

## Si la règle n'existe pas

Le dire franchement plutôt que d'inventer une réponse vraisemblable. Deux suites possibles,
à proposer, jamais à exécuter d'office :

- la règle mérite d'exister → candidate pour `tm-wrap-up`, qui l'écrira après validation
- le besoin est ponctuel → répondre selon l'état de l'art en signalant que ce n'est pas une
  règle du projet

## Ce que ce skill ne fait pas

- Il n'écrit **jamais** dans `.method/conventions/` — c'est le rôle de `tm-wrap-up`, sur accord explicite.
- Il ne remplace pas le routing par globs. Si la question mène à une modification de code,
  passer la main à `tm-dev`, qui repartira des fichiers touchés.
