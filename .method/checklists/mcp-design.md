# Checklist — Concevoir un MCP

> Passée par `/plan` pour tout produit MCP-first (phases 1 et 2), puis rejouée avant chaque lancement.
> Version produit, lisible sans être développeur : « Recette : concevoir un bon MCP » (https://claude.ai/artifact/JEJkL2m2zbYyoGBAzqpgWU).
> Faits mesurés sur le banc MCP (campagnes des 22 et 23/09/2026) ; détail et limites : `.method/conventions/mcp-patterns.md`. Les hosts changent : à revérifier chaque trimestre.

## 1. Intentions
- [ ] 10 à 20 phrases réelles d'utilisateurs par cas d'usage, plus 2 ou 3 phrases voisines hors sujet : elles deviennent les golden queries (`docs/mcp-golden-queries.md`)
- [ ] Un outil = une intention, dite avec les mots de l'utilisateur ; moins de 10 outils par cas d'usage
- [ ] Lectures séparées des écritures et des suppressions
- [ ] Un seul MCP tant que les cas d'usage partagent les mêmes utilisateurs, les mêmes droits et une quinzaine d'outils au plus ; plusieurs dès que l'un de ces points diverge

## 2. Fiche de chaque outil, avant tout code
- [ ] Nom `verb_noun` en anglais avec le mot du domaine, 64 caractères ASCII au plus, sans accent ni point
- [ ] Titre humain, dans la langue des utilisateurs
- [ ] Première phrase de la description : quoi et quand, compréhensible seule ; puis « Use this when… » et « Do not use for… » ; moins de 1 000 caractères
- [ ] Toute règle vitale est dans la description de l'outil concerné, jamais seulement dans les `instructions` du serveur
- [ ] Chaque champ a une explication, un exemple et une valeur par défaut ; aucun champ obligatoire que l'utilisateur ne donnerait pas ; schéma plat
- [ ] Résultat : un résumé en texte ET le même texte dans `structuredContent`, avec les données en champs (ids, dates, montants) et les suites possibles (`next_actions`) ; 45 000 caractères au plus, paginé au-delà (mcp-patterns §4)
- [ ] `readOnlyHint: true` sur chaque outil de lecture : sans lui, claude.ai le range parmi les outils d'écriture et demande une autorisation à son premier appel
- [ ] Chaque erreur dit quoi faire ensuite
- [ ] Niveau de risque noté (lecture, écriture, suppression) ; une suppression ou un envoi se fait en deux temps (récapitulatif, puis accord) et n'est jamais proposé en suite d'un autre résultat ; si le contenu a déjà été approuvé à une étape précédente, cette approbation vaut récapitulatif ; le compte-rendu liste ce qui est réellement parti
- [ ] Phrases de test : 3 qui doivent y mener, 1 qui ne doit pas

## 3. Répartition de l'intelligence
- [ ] Aucune IA côté serveur par défaut : `prepare`, puis le modèle de l'host, puis `save` validé ; « enregistrer dans le même tour » est écrit dans la description du `prepare`
- [ ] Aucune consigne glissée dans un résultat pour faire agir le modèle hors de la demande de l'utilisateur : il la traite comme une donnée
- [ ] Une règle d'usage qui ne tient pas dans les descriptions passe par un outil « mode d'emploi » dont le code est exigé par tous les autres (mcp-patterns §2.4) ; quand ce code expire, le refus dit « rappelle-le avec la même demande, puis rejoue cet appel »
- [ ] Une liste de candidats dit quoi faire selon la demande : chercher et répondre pour une question de données, demander pour une action

## 4. Sécurité
- [ ] Connexion au compte (OAuth 2.1) dès qu'il y a des données personnelles ; chaque utilisateur ne voit que ses données
- [ ] Aucune identification par adresse réseau
- [ ] L'organisation vient de l'adresse appelée et l'appartenance est revérifiée à chaque appel : le jeton OAuth n'est lié à aucune ressource, et révoquer un assistant ne coupe qu'au rafraîchissement du jeton (mcp-patterns §6)
- [ ] Tout ce que le modèle envoie est revalidé comme un formulaire public

## 5. Évolutions, avant chaque publication
- [ ] Le changement est classé : sans risque (ajouter un outil, un champ facultatif avec défaut, améliorer une description) ou cassant (champ rendu obligatoire, outil renommé ou retiré, sens d'un champ ou du résultat changé)
- [ ] Tout changement cassant passe par un nouvel outil au nom qui dit la différence ; l'ancien reste en service, ou répond par un message qui dit quoi utiliser à la place
- [ ] Les journaux suivent les appels à l'ancien outil ; il est retiré quand ils tombent à zéro, ou à une date annoncée
- [ ] Le guide utilisateur donne le geste de rafraîchissement propre à chaque host (mcp-patterns §8) : sans lui, claude.ai et ChatGPT ne voient jamais une description modifiée
- [ ] Prompts suggérés : titre et première ligne compréhensibles seuls (claude.ai les joint en fichier, ChatGPT ne les montre pas)
- [ ] Phrase de préférences proposée aux utilisateurs de claude.ai qui n'ont qu'un connecteur du genre, sans clause « dis-le au lieu de deviner » ; aucune sur ChatGPT (mcp-patterns §9)

## 6. Tests avant lancement, sur Claude et sur ChatGPT
- [ ] Golden queries rejouées après le geste de rafraîchissement, y compris les phrases hors sujet, qui ne doivent rien déclencher
- [ ] Rapport de frictions demandé à l'assistant hôte, puis recoupé avec le journal du serveur : le récit du modèle ne fait pas foi
