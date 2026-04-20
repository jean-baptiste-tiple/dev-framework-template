---
description: "[DÉPRÉCIÉ] Alias de /tm-dev en mode fix — utilise /tm-dev directement"
argument-hint: "[description du bug — préférer /tm-dev]"
---

# /tm-fix — Alias déprécié

> ⚠️ **Commande dépréciée.** `/tm-fix` est maintenant un alias de `/tm-dev` en mode fix. Le workflow est identique — seul le nom change.
>
> Cette commande sera **supprimée dans une prochaine version**. Migre vers `/tm-dev`.

## Comportement

1. **Afficher à l'utilisateur** : *"⚠️ `/tm-fix` est déprécié. Utilise `/tm-dev` à l'avenir — Claude détecte automatiquement le mode fix depuis des mots-clés comme 'bug', 'corrige', 'cassé', 'erreur'. Je continue pour cette session en mode fix."*

2. **Exécuter le workflow** de `.claude/commands/tm-dev.md` en **Mode Fix** (section "Modes Fix / Feature / Refacto (sans story)" + règles spécifiques "Mode Fix — spécificités") :
   - Phase 1 — Contexte (charger conventions par tags déduits)
   - Phase 2 — Implémentation (reproduire avant corriger, diff minimal, test de non-régression obligatoire)
   - Phase 3 — Type-check
   - Phase 4 — Review agent isolé (focus : le fix résout le bug ? pas de régression ?)
   - Phase 5 — Finalisation (changelog, registry si applicable)

## Migration

| Avant | Après |
|---|---|
| `/tm-fix "le bouton login crash"` | `/tm-dev "corrige : le bouton login crash"` |
| `/tm-fix` (sans arg, puis description au prompt) | `/tm-dev` (sans arg, puis description — mode détecté auto) |
