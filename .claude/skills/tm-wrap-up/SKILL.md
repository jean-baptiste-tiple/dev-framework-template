---
name: tm-wrap-up
description: "Proposer à l'utilisateur de capturer les apprentissages de la session (conventions, ADR, registry). Déclenche-toi quand l'utilisateur signale une fin de session/chantier : 'on a fini', 'c'est bouclé', 'wrap up', 'done', 'on termine', 'on arrête', 'on récapitule', OU après la clôture de plusieurs stories/fix dans la même session. NE PAS exécuter silencieusement : toujours proposer d'abord et attendre la validation."
---

# tm-wrap-up — Proposition de capture d'apprentissages

**IMPORTANT : ce skill ne s'exécute PAS silencieusement.**

Quand il s'active, Claude doit **proposer** à l'utilisateur de lancer la capture des apprentissages, pas l'exécuter directement.

## Comportement attendu

1. **Détecter le moment** : l'utilisateur signale la fin d'un chantier (story bouclée, feature livrée, fix non-trivial, refacto fini) OU utilise un mot-clé de clôture.

2. **Proposer, ne pas exécuter** :

   > "On vient de clôturer [X]. Je peux lancer `/tm-wrap-up` pour capturer les apprentissages méta (nouvelles règles de convention, ADR, composants réutilisables) avant de clore la session. Tu veux que je le fasse ?"

3. **Si l'utilisateur accepte** : suivre le process complet dans [`.claude/commands/tm-wrap-up.md`](.claude/commands/tm-wrap-up.md) — la command est la source de vérité.

4. **Si l'utilisateur refuse ou ignore** : ne rien faire, continuer normalement.

## Quand NE PAS proposer

- Session exploratoire / lecture de code (rien n'a été modifié)
- Micro-modif (typo, rename d'une variable) — pas de méta à capturer
- L'utilisateur vient déjà de lancer `/commit-push` sans passer par wrap-up (respecter son choix)
- L'utilisateur a déjà refusé la proposition dans la session en cours

## Règle absolue

Ne JAMAIS écrire dans `.tiple/conventions/`, `docs/decisions/` ou `CLAUDE.md` sans validation explicite de l'utilisateur. Toujours proposer → attendre → exécuter (ou pas).
