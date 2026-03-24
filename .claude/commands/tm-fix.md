# Corriger un bug / petite modification

## Input

- **Description du problème** ou de la modification demandée
- **Fichier(s) concerné(s)** (optionnel — sinon Claude cherche)

---

## Workflow

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
4. Corriger le bug / implémenter la modification
5. Écrire ou mettre à jour les tests
6. Vérifier la non-régression : `pnpm type-check && pnpm lint && pnpm test`
7. À CHAQUE COMMIT : entrée dans `docs/changelog.md`
8. Si nouveau composant réutilisable → ajouter au component-registry

## Ce n'est PAS un /tm-fix si…

- La modification touche plusieurs fichiers et nécessite une story → utiliser `/tm-dev`
- La modification change l'architecture → créer un ADR + story
- C'est une nouvelle feature → utiliser `/tm-dev` avec story

## Rappels

- Vérifier le component-registry AVANT de créer un composant
- Server Components par défaut
- Zod schema partagé = une seule source de vérité
- Ne pas casser les tests existants
