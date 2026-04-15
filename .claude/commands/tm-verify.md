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

## Règles d'exécution (CRITIQUE — lire avant de lancer)

> **⚠️ Ces commandes DOIVENT être exécutées en foreground, sans pipe, sans redirection.**
> Claude a tendance à lancer ces commandes en background puis à poll le fichier de sortie — c'est INTERDIT.

- **Foreground uniquement** : `run_in_background: false` (défaut). Timeout : `120000` ms minimum.
- **Aucun pipe** : pas de `| tail`, `| head`, `| grep`, `2>&1 | ...`
- **Aucune redirection fichier** : pas de `> output.txt`, `2>&1 > log.txt`, `| tee file.txt`
- **Aucune boucle d'attente** : pas de `sleep` + `cat`, `while true; do tail ...`, `watch`
- **Commande brute** : exécuter exactement `pnpm type-check`, `pnpm lint`, `pnpm test` — rien d'autre
- Si le timeout est dépassé : **ne PAS relancer en boucle**. Informer l'utilisateur et proposer de laisser la CI vérifier.

## Règles métier
- Les 3 checks DOIVENT passer avant de continuer
- Si un check échoue, corriger AVANT de passer au suivant
- Maximum 3 cycles de correction par check — au-delà, signaler le blocage à l'utilisateur
- Ne JAMAIS skip un check ou le marquer OK s'il a échoué
