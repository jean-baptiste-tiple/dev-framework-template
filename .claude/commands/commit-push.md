# /commit-push — Commit & Push avec vérification complète

> Commande à utiliser pour chaque commit + push. Garantit la qualité avant d'envoyer sur le remote.
> Ne JAMAIS commit/push sans passer par cette commande.

## Règles d'exécution Bash

> **⚠️ TOUTES les commandes ci-dessous DOIVENT être exécutées en foreground, sans pipe, sans redirection, sans background.**
> Exécuter chaque commande brute avec `timeout: 120000`. Voir CLAUDE.md "Règles d'exécution Bash".

## Étapes

### 1. Vérification triple (type-check + lint + tests)

Lancer les 3 checks **séquentiellement**. Si l'un échoue, corriger avant de continuer.

1. **Type-check** — `pnpm type-check`
   - Si erreurs : lister, corriger, relancer (max 3 cycles)
2. **Lint** — `pnpm lint`
   - Si erreurs (pas warnings) : lister, corriger, relancer (max 3 cycles)
3. **Tests unitaires** — `pnpm test`
   - Si échecs : identifier les tests cassés, corriger, relancer (max 3 cycles)

Si un check ne passe pas après 3 cycles → signaler le blocage à l'utilisateur et **STOP**. Ne PAS continuer vers le commit.

### 2. Résumé des vérifications

Afficher :
```
✅ type-check : OK
✅ lint : OK (X warnings)
✅ tests : X passed, 0 failed
```

### 3. Analyser les changements

- `git status` pour voir les fichiers modifiés/ajoutés
- `git diff` pour voir le contenu des changements
- `git log --oneline -5` pour le style des commits récents

### 4. Mettre à jour le changelog

Ajouter une entrée en haut de `docs/changelog.md` (après le commentaire HTML) au format :

```markdown
## [YYYY-MM-DD] — [Scope court]
**Quoi :** Description concise de ce qui a été fait
**Pourquoi :** La raison / le contexte / la story
**Fichiers :** Liste des fichiers créés/modifiés (chemins relatifs)
```

- La date est celle du jour
- Le scope résume le domaine (ex: "Shipping sync order", "Fix PDF generation")
- Lister TOUS les fichiers modifiés dans ce commit

### 5. Commit

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

### 6. Push

- Vérifier que la branche track bien le remote (`git status` après commit)
- `git push`
- Confirmer le succès du push

### 7. Résumé final

Afficher :
```
✅ Vérifications : type-check + lint + tests OK
✅ Changelog : mis à jour
✅ Commit : <hash court> <message>
✅ Push : main → origin/main
```

## Règles

- Les 3 checks DOIVENT passer avant de commit — aucune exception
- Le changelog DOIT être mis à jour à chaque commit
- Ne JAMAIS utiliser `--no-verify` ou `--force`
- Ne JAMAIS amend un commit existant sauf demande explicite de l'utilisateur
- Si le push échoue (conflict, etc.) → signaler à l'utilisateur, ne pas force push
- Ne JAMAIS skip les vérifications même si l'utilisateur dit "juste push vite"
