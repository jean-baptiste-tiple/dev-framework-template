# Deployment Patterns

> Tag : `deploy`
> Lire ce fichier pour configurer les environnements, les déploiements et les rollbacks.

## Environnements

| Env | Usage | DB | URL |
|-----|-------|-----|-----|
| `local` | Développement | Supabase local (`npx supabase start`) | `localhost:3000` |
| `preview` | PR review | Supabase staging (branch) | `pr-123.vercel.app` |
| `staging` | Test pré-prod | Supabase staging | `staging.monapp.com` |
| `production` | Prod | Supabase production | `monapp.com` |

## Variables d'environnement

```bash
# .env.local (dev — JAMAIS commité)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# .env.example (template — commité, sans valeurs)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

**En production :** variables dans le dashboard de l'hébergeur (Vercel, Coolify, etc.), JAMAIS dans des fichiers.

## Database Migrations en Production

### Workflow
```
1. Développer la migration en local
2. Tester : supabase db reset (local)
3. Appliquer en staging : supabase db push --linked
4. Vérifier en staging
5. Appliquer en prod : supabase db push --linked (projet prod)
```

### Règles
- **Jamais de migration destructive sans rollback prévu**
- **Migrations additives d'abord** : ajouter une colonne, puis migrer les données, puis supprimer l'ancienne
- **Tester avec des données réalistes** avant la prod

### Rollback SQL
```sql
-- Chaque migration devrait avoir un rollback documenté
-- Dans un commentaire en fin de fichier

-- ROLLBACK:
-- ALTER TABLE orders DROP COLUMN IF EXISTS discount_cents;
-- DROP TYPE IF EXISTS discount_type;
```

## CI/CD

### GitHub Actions (déjà configuré)
```yaml
# .github/workflows/ci.yml vérifie :
# 1. pnpm type-check
# 2. pnpm lint
# 3. pnpm test
```

### Pre-deploy checklist
- [ ] Tous les tests passent
- [ ] Type-check OK
- [ ] Lint OK
- [ ] Migrations testées en local
- [ ] Variables d'environnement configurées
- [ ] Pas de `console.log` oublié
- [ ] Pas de secrets dans le code

## Rollback

### Code (Vercel)
```bash
# Rollback au déploiement précédent
# Via le dashboard Vercel : Deployments → Promote to production

# Ou via CLI
vercel rollback
```

### Database
```bash
# Appliquer le rollback SQL documenté dans la migration
# ATTENTION : tester en staging d'abord
supabase db execute --file rollback.sql
```

## Health & Monitoring post-deploy

```bash
# Vérifier le health check
curl https://monapp.com/api/health

# Vérifier les Web Vitals
# → Vercel Analytics ou Lighthouse CI

# Vérifier les erreurs
# → Sentry dashboard
```

## Règles de déploiement

- **Jamais de deploy le vendredi soir** (sauf hotfix critique)
- **Deploy souvent, deploy petit** — une feature à la fois
- **Toujours avoir un rollback** — code ET database
- **Monitorer après chaque deploy** — erreurs, performance, feedback
