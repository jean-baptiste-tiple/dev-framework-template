# /commit-push — Commit & Push

> Commande à utiliser pour chaque commit + push.
> Type-check + lint + tests vérifiés EN LOCAL avant push (PAS de duplication CI).
> Ne JAMAIS commit/push sans passer par cette commande.

## Étapes

### 1. Type-check + Lint + Tests

1. **`pnpm type-check`** — Doit passer sans erreur. Si erreurs → corriger et relancer (max 3 cycles).
2. **`pnpm lint`** — Doit passer sans erreur. Si erreurs → corriger et relancer (max 3 cycles).
3. **`pnpm test`** — Tous les tests doivent passer. Si échecs → corriger et relancer (max 3 cycles).

### 2. Analyser les changements

- `git status` pour voir les fichiers modifiés/ajoutés
- `git diff` pour voir le contenu des changements
- `git log --oneline -5` pour le style des commits récents

### 3. Mettre à jour le changelog

Ajouter une entrée en haut de `docs/changelog.md` (après le commentaire HTML) au format :

```markdown
## [YYYY-MM-DD] — [Scope court]
**Quoi :** Description concise de ce qui a été fait
**Pourquoi :** La raison / le contexte / la story
**Fichiers :** Liste des fichiers créés/modifiés (chemins relatifs)
```

### 4. Commit

- Ajouter les fichiers pertinents au staging (`git add` — fichiers spécifiques, jamais `git add -A`)
  - Inclure `docs/changelog.md` dans le staging
  - Ne JAMAIS commit de fichiers sensibles (.env, credentials, etc.)
- Rédiger un message de commit concis qui explique le **pourquoi** :
  - Préfixe : `fix:`, `feat:`, `refactor:`, `docs:`, `chore:`, `perf:`
  - 1-2 lignes max
  - Terminer par `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`
- Créer le commit via HEREDOC :
  ```
  git commit -m "$(cat <<'EOF'
  prefixe: message concis

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

### 5. Push

- `git push`
- Confirmer le succès du push

### 6. Résumé final

Afficher :
```
✅ Type-check : OK
✅ Lint : OK
✅ Tests : OK
✅ Changelog : mis à jour
✅ Commit : <hash court> <message>
✅ Push : main → origin/main
⏳ CI GitHub : pnpm build en cours (validation Vercel)
```

## Règles

- `pnpm type-check`, `pnpm lint` et `pnpm test` DOIVENT passer avant de commit
- Le changelog DOIT être mis à jour à chaque commit
- Ne JAMAIS utiliser `--no-verify` ou `--force`
- Ne JAMAIS amend un commit existant sauf demande explicite de l'utilisateur
- Si le push échoue (conflict, etc.) → signaler à l'utilisateur, ne pas force push
