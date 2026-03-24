# Feature Flags Patterns

> Tag : `flags`
> Lire ce fichier pour gérer les déploiements progressifs et le A/B testing.

## Approche simple (env vars)

```typescript
// Pour les features ON/OFF par environnement
const FEATURES = {
  NEW_DASHBOARD: process.env.NEXT_PUBLIC_FF_NEW_DASHBOARD === "true",
  BETA_EDITOR: process.env.FF_BETA_EDITOR === "true", // server-only
} as const

// Usage dans un Server Component
export default function DashboardPage() {
  if (FEATURES.NEW_DASHBOARD) {
    return <NewDashboard />
  }
  return <Dashboard />
}
```

## Approche avancée (database-driven)

```sql
-- Table de feature flags
CREATE TABLE feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  description text,
  percentage integer DEFAULT 100, -- Pour le rollout progressif (0-100)
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Flags par utilisateur (override)
CREATE TABLE user_feature_flags (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  flag_name text REFERENCES feature_flags(name) ON DELETE CASCADE,
  enabled boolean NOT NULL,
  PRIMARY KEY (user_id, flag_name)
);
```

```typescript
// lib/utils/feature-flags.ts
export async function isFeatureEnabled(
  flagName: string,
  userId?: string
): Promise<boolean> {
  const supabase = await createClient()

  // Check user override first
  if (userId) {
    const { data: userFlag } = await supabase
      .from("user_feature_flags")
      .select("enabled")
      .eq("user_id", userId)
      .eq("flag_name", flagName)
      .single()

    if (userFlag) return userFlag.enabled
  }

  // Check global flag
  const { data: flag } = await supabase
    .from("feature_flags")
    .select("enabled, percentage")
    .eq("name", flagName)
    .single()

  if (!flag || !flag.enabled) return false

  // Rollout progressif
  if (flag.percentage < 100 && userId) {
    const hash = hashUserId(userId, flagName)
    return hash % 100 < flag.percentage
  }

  return true
}
```

## Règles

- **Nommer clairement** : `new_dashboard`, `beta_editor` (snake_case)
- **Nettoyer** : supprimer le flag ET le code quand la feature est stable
- **Pas de flags imbriqués** : un flag = une feature, pas de dépendances entre flags
- **Tester les deux chemins** : le code avec ET sans le flag
