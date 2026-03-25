# /tm-review — Code Review Agent (contexte isolé)

> Lance une review de code dans un **agent autonome séparé** pour garantir un regard neuf,
> sans le biais du contexte d'implémentation.
> Argument optionnel : identifiant de la story (ex: `/tm-review E01-S03`).

## IMPORTANT — Exécution en agent isolé

Cette review DOIT être lancée via l'outil `Agent` (subagent) pour :
- **Regard neuf** : l'agent reviewer n'a pas le contexte d'implémentation, il découvre le code comme un vrai reviewer
- **Pas de biais** : l'implémenteur ne review pas son propre code dans le même contexte
- **Adversarial** : l'agent cherche activement les problèmes, pas à confirmer que "ça marche"

### Comment lancer

Le caller (`/tm-dev`, `/tm-feature`, `/tm-fix`, ou l'utilisateur) doit utiliser :

```
Agent(subagent_type="general-purpose", prompt="[le prompt ci-dessous]")
```

Le prompt envoyé à l'agent doit contenir :
1. La story ID (ou "Mode Libre" si pas de story)
2. La liste des fichiers modifiés (obtenue via `git diff --name-only`)
3. L'instruction de suivre ce fichier `/tm-review` comme guide

---

## Contexte à charger (par l'agent reviewer)

1. Lire `.tiple/checklists/code-review.md` — c'est la checklist de référence
2. Lire `.tiple/conventions/coding-standards.md` — pour vérifier les conventions
3. Lire `.tiple/conventions/component-registry.md` — pour vérifier DRY/réutilisation
4. Si story spécifiée : lire la story dans `docs/stories/` pour connaître le scope et les AC
5. Identifier les fichiers modifiés : `git diff --name-only HEAD~1` (ou utiliser la liste fournie)
6. Lire CHAQUE fichier modifié en entier — ne pas se contenter du diff

## Posture du reviewer

- Tu es un **reviewer externe** qui découvre le code pour la première fois
- Tu ne sais PAS ce que l'implémenteur avait en tête — tu juges uniquement ce qui est dans le code
- Tu cherches **activement** les problèmes : sécurité, bugs, violations de conventions
- Tu ne fais PAS de compromis : si un point de la checklist n'est pas respecté, c'est ❌
- Tu proposes un **fix concret** pour chaque problème trouvé (pas juste "à améliorer")

## Process de review

Passer CHAQUE section de `code-review.md` dans l'ordre :

### 1. DRY & Réutilisation
- Vérifier le component-registry : pas de composant/hook/util dupliqué
- Vérifier que les schemas Zod sont dans `lib/schemas/` et partagés
- Chercher du code copié-collé entre fichiers (factoriser si ≥ 2 occurrences)
- Vérifier que les types Supabase sont utilisés (pas redéfinis)

### 2. Qualité du code
- Nommage cohérent (kebab-case fichiers, PascalCase composants, camelCase fonctions)
- Pas de `any` non justifié
- Fonctions à responsabilité unique
- Composants < 150 lignes de JSX
- Error handling correct (pas de catch vide, erreurs Supabase vérifiées)
- Loading, error et empty states gérés

### 3. Sécurité
- Server Actions vérifient l'auth en premier
- Inputs validés avec Zod côté serveur
- Pas de mutation Supabase depuis un Client Component
- Nouvelles tables ont des RLS policies
- Pas de `service_role` sans ADR
- Pas de données sensibles exposées côté client
- Messages d'erreur Supabase pas exposés bruts

### 4. Tests
- Tests unitaires couvrent les Server Actions (valides et invalides)
- Tests unitaires couvrent les schemas Zod (edge cases)
- Tests d'intégration couvrent les composants form, pages complètes et flows multi-composants
- **Placement correct des fichiers de test :**
  - Tests unitaires (actions, schemas, hooks, utils, composants isolés) → `tests/unit/`
  - Tests d'intégration (form complets, pages, flows) → `tests/integration/`
  - Tests E2E → `tests/e2e/`
  - Si un test d'intégration est dans `tests/unit/` (ou inversement) → **[MOYENNE] mauvais placement** → proposer le déplacement
- Tous les tests listés dans la section "Tests attendus" de la story sont implémentés
- Tous les tests existants passent

### 5. Design & UX
- Implémentation correspond à la maquette
- Tokens du design system utilisés
- Interface responsive (si applicable)
- Écarts documentés

### 6. Architecture
- Server Components par défaut — `"use client"` justifié
- Server Actions pour les mutations
- Middleware auth pas contourné
- `revalidatePath`/`revalidateTag` après mutations
- Structure fichiers respecte coding-standards
- Pas d'invariant violé sans ADR

### 7. Documentation
- Component-registry à jour
- Story post-implémentation remplie
- ADRs créés si nécessaire

## Output de la review

Pour chaque section, produire :

```
## [Section] — [✅ OK | ⚠️ MOYENNE | 🔴 HAUTE]

### Constat
[Ce qui a été vérifié et le résultat]

### Problèmes trouvés (si applicable)
- [HAUTE] Description du problème → Fix proposé (fichier:ligne)
- [MOYENNE] Description du problème → Fix proposé (fichier:ligne)
- [BASSE] Description du problème → Suggestion

### Verdict : ✅ ou ❌
```

## Résumé final

L'agent DOIT terminer par ce résumé :

```
═══════════════════════════════════════
  CODE REVIEW — [Story ID ou "Mode Libre"]
  (Agent reviewer autonome)
═══════════════════════════════════════
  DRY & Réutilisation    : ✅/❌
  Qualité du code        : ✅/❌
  Sécurité               : ✅/❌
  Tests                  : ✅/❌
  Design & UX            : ✅/❌
  Architecture           : ✅/❌
  Documentation          : ✅/❌
───────────────────────────────────────
  PROBLÈMES HAUTE        : X
  PROBLÈMES MOYENNE      : X
  PROBLÈMES BASSE        : X
───────────────────────────────────────
  VERDICT GLOBAL         : ✅ APPROVED / ❌ CHANGES REQUESTED
═══════════════════════════════════════
```

Si VERDICT = ❌ CHANGES REQUESTED, lister tous les problèmes HAUTE et MOYENNE avec les fix concrets.

## Ce que fait le caller après la review

Le caller (contexte principal) récupère le résultat de l'agent et :

1. **Si ❌ CHANGES REQUESTED** :
   - Appliquer les fix proposés par le reviewer
   - Relancer `/tm-verify` (type-check + lint + test)
   - Relancer `/tm-review` (un nouvel agent, encore un regard neuf)

2. **Si ✅ APPROVED avec des BASSE** :
   - Les documenter mais ne pas bloquer
   - Continuer le flow

3. **Si ✅ APPROVED sans problèmes** :
   - Continuer vers la finalisation (changelog, registry, sprint status)
