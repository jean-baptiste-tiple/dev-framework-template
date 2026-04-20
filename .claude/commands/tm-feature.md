---
description: "[DÉPRÉCIÉ] Remplacé par /tm-plan (cadrage) + /tm-dev (code)"
argument-hint: "[description de la feature — préférer /tm-plan ou /tm-dev]"
---

# /tm-feature — Alias déprécié

> ⚠️ **Commande dépréciée.** `/tm-feature` est remplacé par la combinaison :
> - **`/tm-plan`** en mode évolution → pour le cadrage (PRD, architecture, stories)
> - **`/tm-dev`** en mode feature → pour l'implémentation directe (sans cadrage)
>
> Cette commande sera **supprimée dans une prochaine version**.

## Comportement

1. **Afficher à l'utilisateur** : *"⚠️ `/tm-feature` est déprécié. Deux options :*
   - *Si la feature nécessite un cadrage (PRD/archi/stories) → `/tm-plan` détecte auto le mode évolution, puis `/tm-dev E0x-S0y` par story créée.*
   - *Si la feature est petite et tient en un dev direct → `/tm-dev` avec une description (le mode feature est détecté auto).*
   *Je t'aide à choisir selon la taille :"*

2. **Évaluer la taille de la feature** :
   - Plusieurs parcours / écrans / modifs DB → recommander `/tm-plan` mode évolution
   - Une modification ciblée, pas de story nécessaire → recommander `/tm-dev` mode feature

3. **Exécuter le bon workflow** selon la décision de l'utilisateur :
   - Si `/tm-plan` → suivre `.claude/commands/tm-plan.md` en mode évolution
   - Si `/tm-dev` feature → suivre `.claude/commands/tm-dev.md` en Mode Feature

## Migration

| Scénario | Avant | Après |
|---|---|---|
| Grosse feature (plusieurs stories, PRD à faire évoluer) | `/tm-feature "nom"` | `/tm-plan` (+ mention "nouvelle feature X") → stories créées → `/tm-dev E0x-S0y` |
| Petite feature (1-2 fichiers, pas de story) | `/tm-feature "nom"` | `/tm-dev "ajoute X qui fait Y"` |
