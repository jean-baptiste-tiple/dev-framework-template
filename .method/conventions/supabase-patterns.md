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

  // Validation — Next.js 15 limite le corps d'une Server Action à 1 Mo par défaut.
  // Au-delà, l'appel échoue AVANT d'atteindre ce code ("Body exceeded 1 MB limit").
  // Pour des fichiers plus gros : URL signée côté client (voir plus bas), pas de Server Action.
  const maxSize = 1024 * 1024 // 1 Mo — aligné sur serverActions.bodySizeLimit
  if (file.size > maxSize) return { error: "Fichier trop volumineux (max 1 Mo)" }

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
-- Bucket avatars : chacun gère ses fichiers.
-- Le préfixe de dossier vaut auth.uid() — c'est lui qui porte l'isolation.
CREATE POLICY avatars_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY avatars_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- `upsert: true` fait un UPDATE quand l'objet existe déjà : sans cette policy, le
-- deuxième changement d'avatar renvoie 403.
CREATE POLICY avatars_update ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  ) WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
```

Un `USING (bucket_id = 'avatars')` sans contrainte de dossier rend le bucket lisible par
**tout le monde, `anon` compris**. Si le bucket est réellement public, le déclarer public et
le documenter ; sinon, toujours filtrer sur le préfixe.

### Fichiers de plus de 1 Mo

```typescript
// Server Action : ne transporte PAS le fichier, ne délivre qu'une URL signée
const { data, error } = await supabase.storage
  .from("documents")
  .createSignedUploadUrl(`${user.id}/${crypto.randomUUID()}.pdf`)
// Le client uploade ensuite directement vers data.signedUrl — la limite de 1 Mo des
// Server Actions ne s'applique pas.
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
- **Vérifiable :** un `supabase.channel()` est créé dans un `useEffect`, avec un nom incluant l'identifiant de la ressource, et un `removeChannel` dans sa fonction de cleanup. Un `channel()` au niveau module ou hors `useEffect` est un défaut.
- **Filtrer les events** — un `postgres_changes` sans `filter` écoute toute la table
- **RLS s'applique** au realtime : l'utilisateur ne reçoit que ce qu'il a le droit de voir

### Presence

```typescript
// Qui est connecté sur cette ressource — état éphémère, jamais persisté en base
const channel = supabase.channel(`room:${roomId}`, {
  config: { presence: { key: user.id } },
})

channel
  .on("presence", { event: "sync" }, () => setOnline(Object.keys(channel.presenceState())))
  .subscribe(async (status) => {
    if (status === "SUBSCRIBED") await channel.track({ name: user.name })
  })

return () => { supabase.removeChannel(channel) }  // untrack implicite
```

La presence n'est pas une source de vérité : elle se perd à la reconnexion. Ne jamais en
dériver une donnée métier.

## Error Handling

```typescript
// Les erreurs Supabase n'ont pas toutes la même forme : PostgrestError expose `code`,
// StorageError expose `statusCode`, AuthError expose `status` + `name`.
type SupabaseLikeError = { code?: string; statusCode?: string; status?: number }

const ERROR_MESSAGES: Record<string, string> = {
  "23505": "Cette entrée existe déjà",
  "23503": "Référence invalide",
  "23514": "Valeur non autorisée",          // violation de CHECK
  "40001": "Conflit temporaire, réessayez", // serialization failure — rejouable
  "42501": "Accès non autorisé",
  "57014": "La requête a pris trop de temps", // statement timeout (8 s en lecture chez Supabase)
  PGRST116: "Aucun résultat trouvé",          // 0 OU plusieurs lignes avec .single()
  PGRST301: "Session expirée, reconnectez-vous", // JWT expiré / vérification échouée
  PGRST202: "Opération indisponible",         // fonction RPC introuvable (renommage non déployé)
  PGRST204: "Schéma désynchronisé",           // colonne absente du cache après migration
}

function handleSupabaseError(error: SupabaseLikeError): string {
  const code = error.code ?? error.statusCode ?? String(error.status ?? "")
  return ERROR_MESSAGES[code] ?? "Une erreur est survenue"
}
```

**Règles :**
- Ne JAMAIS exposer `error.message` de Supabase au client — il contient des noms de tables et de colonnes. **Vérifiable :** aucune Server Action ne place `error.message`, `error.details` ou `error.hint` dans sa valeur de retour ; le retour est soit une constante littérale, soit `handleSupabaseError(error)`.
- **Toute réponse Supabase déstructure `error` et le traite.** Un `const { data } = await supabase...` sans `error` est un défaut.
- `PGRST301` signifie **JWT expiré**, pas « trop de résultats » : le traiter comme une session à rafraîchir, pas comme une erreur de requête.

## PostgreSQL Functions (RPC)

```sql
-- Fonction avec logique métier complexe.
-- Pas de paramètre p_user_id : il serait falsifiable par l'appelant. La fonction lit
-- l'identité depuis le JWT, ce qui rend l'accès aux données d'un tiers impossible.
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json
LANGUAGE sql
SECURITY INVOKER          -- RLS s'applique : rien à valider à la main
SET search_path = ''
AS $$
  SELECT json_build_object(
    'total_orders',   (SELECT count(*) FROM public.orders WHERE user_id = (SELECT auth.uid())),
    'pending_orders', (SELECT count(*) FROM public.orders WHERE user_id = (SELECT auth.uid()) AND status = 'pending'),
    'total_revenue',  (SELECT coalesce(sum(total_cents), 0) FROM public.orders WHERE user_id = (SELECT auth.uid()) AND status = 'delivered')
  );
$$;
```

**`SECURITY INVOKER` (le défaut) par principe.** Ne passer en `SECURITY DEFINER` que pour ce
que RLS ne peut pas exprimer — et alors appliquer les trois règles de
`database-patterns.md § Règles SECURITY DEFINER`.

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
