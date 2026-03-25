# Corriger un bug / petite modification

## Input

- **Description du problème** ou de la modification demandée
- **Fichier(s) concerné(s)** (optionnel — sinon Claude cherche)

---

## Workflow

### Phase 1 — Contexte

1. Comprendre le problème (reproduire si possible)
2. **Charger les conventions pertinentes :**
   - Lire `.tiple/conventions/_index.md` (index des conventions)
   - Lire les **conventions de base** (toujours) : `coding-standards.md`, `component-registry.md`
   - Analyser les fichiers concernés → **déduire les tags** depuis l'index :
     - Fichiers dans `lib/actions/` ou `lib/schemas/` → tags `api`, `forms`
     - Fichiers dans `lib/supabase/` ou `supabase/migrations/` → tags `database`, `supabase`
     - Fichiers dans `app/` (layouts, pages, routes) → tag `nextjs`
     - Fichiers dans `components/` avec state/effects → tag `state`
     - Fichiers d'auth (`middleware.ts`, `(auth)/`) → tag `auth`
     - Fichiers de test → tag `testing`
   - Charger les conventions correspondantes
3. Lire le contexte :
   - `docs/architecture.md` (sections pertinentes)
   - Les fichiers de code concernés

### Phase 2 — Implémentation

4. Corriger le bug / implémenter la modification
5. Écrire ou mettre à jour les tests

### Phase 3 — Vérification triple (OBLIGATOIRE)

6. **`pnpm type-check`** — Doit passer sans erreur.
7. **`pnpm lint`** — Doit passer sans erreur.
8. **`pnpm test`** — Tous les tests doivent passer (non-régression).

> Maximum 3 cycles de correction. Au-delà, signaler le blocage.

### Phase 4 — Code Review en agent isolé (OBLIGATOIRE)

9. Lancer un **agent reviewer autonome** (voir `.claude/commands/tm-review.md`) — focus sur :
   - Le fix résout-il vraiment le bug ?
   - Pas d'effets de bord ? Pas de régression ?
   - Sécurité : le fix n'introduit pas de faille ?
   - Registry à jour si composant modifié ?
10. Si ❌ CHANGES REQUESTED → corriger puis relancer phase 3, puis nouveau review agent

### Phase 5 — Finalisation

11. Entrée dans `docs/changelog.md`
12. Si nouveau composant réutilisable → ajouter au component-registry

## Ce n'est PAS un /tm-fix si…

- La modification touche plusieurs fichiers et nécessite une story → utiliser `/tm-dev`
- La modification change l'architecture → créer un ADR + story
- C'est une nouvelle feature → utiliser `/tm-dev` avec story

## Rappels

- Vérifier le component-registry AVANT de créer un composant
- Server Components par défaut
- Zod schema partagé = une seule source de vérité
- Ne pas casser les tests existants
