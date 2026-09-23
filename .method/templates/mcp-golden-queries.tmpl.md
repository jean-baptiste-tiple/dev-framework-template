# Golden Queries — éval AX du canal MCP

> Jeu de prompts anti-régression du routage des tools. Règles d'usage : `.method/conventions/mcp-patterns.md` §8.
> À rejouer sur **Claude ET ChatGPT (developer mode)** à chaque évolution de tool/description. Un champ de métadonnée corrigé à la fois ; noter chaque révision dans le journal en bas.
> Seed : reprendre les prompts d'exemple du brief produit, puis enrichir story par story.

## Directs (nomment l'action — doivent router, dans l'ordre)

| # | Prompt | Attendu |
|---|--------|---------|
| D1 | <!-- prompt utilisateur qui nomme l'action --> | <!-- tool(s) attendus, dans l'ordre --> |
| D2 | | |

## Indirects (décrivent le résultat — doivent quand même router)

| # | Prompt | Attendu |
|---|--------|---------|
| I1 | <!-- prompt qui décrit le besoin sans nommer l'action --> | <!-- tool(s) attendus --> |
| I2 | | |

## Négatifs (ne doivent PAS déclencher nos tools)

| # | Prompt | Attendu |
|---|--------|---------|
| N1 | <!-- prompt proche du domaine mais hors périmètre --> | Aucun tool |
| N2 | | |

## Journal des révisions de métadonnées

> ⚠️ Les hosts figent instructions et descriptions : avant de tester une révision, faire le geste de rafraîchissement du host (mcp-patterns §8), sinon on évalue l'ancienne version. Claude Code : nouvelle session. claude.ai : « Actualiser la liste d'outils » (menu ⋯ de la fiche du connecteur), puis nouvelle conversation dont le premier message part quelques secondes après l'ouverture de la page. ChatGPT : bouton « Actualiser » en bas de la fiche du connecteur, puis nouvelle conversation avec le connecteur sélectionné (`@nom`). Déconnecter/reconnecter ne rafraîchit rien de façon fiable.

| Date | Champ modifié | Raison (quel prompt échouait) | Résultat |
|------|---------------|-------------------------------|----------|
| — | — | — | — |

## Rapports de frictions agent (mcp-patterns §8)

> Après chaque évolution significative : demander à l'agent hôte un rapport structuré — déroulé step-by-step, points de blocage/ressenti, hypothèses de cause, repro minimale — sur les DEUX hosts. Coller ici la synthèse et les actions décidées.

| Date | Host | Friction observée | Cause | Action |
|------|------|-------------------|-------|--------|
| — | — | — | — | — |
