# /tm-verify — Vérification triple (type-check + lint + test)

> Lance les 3 vérifications obligatoires avant toute review ou push.
> Utilisable seul ou appelé automatiquement par `/tm-dev` et `/tm-feature`.

## Étapes

1. **Type-check** — Lancer `pnpm type-check`
   - Si erreurs : lister les erreurs, les corriger, relancer
   - Ne passer à l'étape suivante que quand c'est clean

2. **Lint** — Lancer `pnpm lint`
   - Si erreurs : lister les erreurs, les corriger, relancer
   - Ne passer à l'étape suivante que quand c'est clean

3. **Tests (non-régression)** — Lancer `pnpm test`
   - Si échecs : identifier les tests cassés
   - Distinguer : test cassé par mon code (à fixer) vs test flakey (à documenter)
   - Corriger et relancer jusqu'à 100% pass

4. **Résumé** — Afficher un résumé :
   ```
   ✅ type-check : OK
   ✅ lint : OK
   ✅ tests : X passed, 0 failed
   ```
   Ou si problèmes non résolus :
   ```
   ❌ type-check : X erreurs restantes
   ❌ lint : X erreurs restantes
   ❌ tests : X failed
   ```

## Règles
- Les 3 checks DOIVENT passer avant de continuer
- Si un check échoue, corriger AVANT de passer au suivant
- Maximum 3 cycles de correction par check — au-delà, signaler le blocage à l'utilisateur
- Ne JAMAIS skip un check ou le marquer OK s'il a échoué
