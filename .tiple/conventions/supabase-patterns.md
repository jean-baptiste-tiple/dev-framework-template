# Supabase Patterns

> Tag : `supabase`
> Lire ce fichier pour toute story touchant à Supabase (auth, storage, realtime, RLS, RPC).

## Clients Supabase

### Server Client (mutations + data fetching)
```typescript
// lib/supabase/server.ts — utilisé dans Server Components et Server Actions
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* getAll, setAll */ } }
  )
}
```

### Browser Client (realtime + auth listener uniquement)
```typescript
// lib/supabase/client.ts — JAMAIS de mutations (.insert/.update/.delete)
import { createBrowserClient } from "@supabase/ssr"

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Règle absolue :** Le browser client est réservé au realtime et à l'auth listener. Toute mutation passe par une Server Action avec le server client.

## RLS Patterns

### Policies standard
```sql
-- L'utilisateur ne voit que ses données
CREATE POLICY users_select_own ON profiles
  FOR SELECT USING (auth.uid() = id);

-- L'utilisateur ne modifie que ses données
CREATE POLICY users_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- L'utilisateur ne crée que pour lui-même
CREATE POLICY users_insert_own ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Multi-tenant (organisation)
```sql
-- L'utilisateur ne voit que les données de son organisation
CREATE POLICY org_select ON items
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
  );
```

### Rôle admin
```sql
-- Les admins voient tout dans leur org
CREATE POLICY admin_select_all ON items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE user_id = auth.uid()
        AND org_id = items.org_id
        AND role = 'admin'
    )
  );
```

### Règles RLS
- **RLS activé sur TOUTE table** — sans exception
- **Tester les policies** : se connecter en tant qu'utilisateur et vérifier l'accès
- **Pas de `service_role`** sauf cas documenté (ADR obligatoire)
- **USING** = filtre les lignes visibles (SELECT, UPDATE, DELETE)
- **WITH CHECK** = valide les données insérées/modifiées (INSERT, UPDATE)

## Supabase Storage

### Upload
```typescript
"use server"
export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non authentifié" }

  const file = formData.get("avatar") as File
  if (!file) return { error: "Fichier manquant" }

  // Validation
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) return { error: "Fichier trop volumineux (max 2MB)" }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
  if (!allowedTypes.includes(file.type)) return { error: "Format non supporté" }

  // Upload
  const ext = file.name.split(".").pop()
  const path = `${user.id}/avatar.${ext}`

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true })

  if (error) return { error: "Échec de l'upload" }

  // Mettre à jour le profil
  await supabase.from("profiles").update({ avatar_path: path }).eq("id", user.id)
  revalidatePath("/settings")
  return { data: { path } }
}
```

### Policies Storage
```sql
-- Bucket avatars : chacun gère ses fichiers
CREATE POLICY avatars_select ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY avatars_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

### URL publique
```typescript
const { data } = supabase.storage.from("avatars").getPublicUrl(path)
// data.publicUrl = https://xxx.supabase.co/storage/v1/object/public/avatars/path
```

## Realtime

### Subscription dans un Client Component
```tsx
"use client"
import { useEffect, useState } from "react"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

export function OrderUpdates({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<string>()

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()
    const channel = supabase
      .channel(`order-${orderId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `id=eq.${orderId}`,
      }, (payload) => {
        setStatus(payload.new.status)
      })
      .subscribe()

    // CLEANUP obligatoire
    return () => { supabase.removeChannel(channel) }
  }, [orderId])

  return status ? <Badge>{status}</Badge> : null
}
```

### Règles Realtime
- **Toujours cleanup** : `removeChannel` dans le `return` du `useEffect`
- **Un channel par composant** — pas de channel global sauf cas justifié
- **Filter les events** — ne pas écouter toute la table
- **RLS s'applique** au realtime — l'utilisateur ne reçoit que ce qu'il a le droit de voir

## Error Handling

```typescript
// Mapping des erreurs Supabase courantes
function handleSupabaseError(error: { code: string; message: string }): string {
  const errorMap: Record<string, string> = {
    "23505": "Cette entrée existe déjà",
    "23503": "Référence invalide",
    "42501": "Accès non autorisé",
    "PGRST116": "Aucun résultat trouvé",
    "PGRST301": "Trop de résultats",
  }
  return errorMap[error.code] ?? "Une erreur est survenue"
}
```

**Règle :** Ne JAMAIS exposer `error.message` de Supabase au client — il peut contenir des infos techniques (noms de tables, colonnes).

## PostgreSQL Functions (RPC)

```sql
-- Fonction avec logique métier complexe
CREATE FUNCTION get_dashboard_stats(p_user_id uuid)
RETURNS json AS $$
  SELECT json_build_object(
    'total_orders', (SELECT count(*) FROM orders WHERE user_id = p_user_id),
    'pending_orders', (SELECT count(*) FROM orders WHERE user_id = p_user_id AND status = 'pending'),
    'total_revenue', (SELECT coalesce(sum(total_cents), 0) FROM orders WHERE user_id = p_user_id AND status = 'delivered')
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

```typescript
// Appel depuis une Server Action
const { data, error } = await supabase.rpc("get_dashboard_stats", {
  p_user_id: user.id,
})
```

**Règles RPC :**
- `SECURITY DEFINER` = s'exécute avec les permissions du créateur (bypass RLS)
- `SECURITY INVOKER` = s'exécute avec les permissions de l'appelant (RLS appliqué)
- Préférer `SECURITY INVOKER` sauf si la fonction DOIT accéder à des données cross-user
