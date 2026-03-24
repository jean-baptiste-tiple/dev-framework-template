# API Patterns — Next.js Server Actions + Supabase

## Principe : Server Actions > Route Handlers

Utiliser les Server Actions pour toutes les mutations.
Les Route Handlers (`app/api/`) sont réservés aux : webhooks externes, cron jobs, intégrations tierces qui doivent appeler une URL.

## Type de retour standard

```typescript
type ActionResult<T> = { data: T; error?: never } | { data?: never; error: string }
```

JAMAIS de throw dans une Server Action appelée par un formulaire.
Le throw est réservé aux cas critiques (auth manquante = redirect, pas throw).

## Pattern Server Action standard

Chaque fichier dans `lib/actions/` regroupe les actions d'un domaine.
Chaque action :

1. Vérifie l'auth
2. Valide l'input (Zod)
3. Exécute la mutation (Supabase)
4. Revalide le cache (revalidatePath/revalidateTag)
5. Retourne `{ data }` ou `{ error }`

```typescript
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createProjectSchema } from "@/lib/schemas/project"
import type { ActionResult } from "@/types"

export async function createProjectAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  // 1. Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // 2. Validation
  const parsed = createProjectSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: "Données invalides" }

  // 3. Mutation
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...parsed.data, user_id: user.id })
    .select("id")
    .single()

  if (error) return { error: "Impossible de créer le projet" }

  // 4. Revalidation
  revalidatePath("/projects")

  // 5. Retour
  return { data: { id: data.id } }
}
```

## Pattern Form

1. Schema Zod dans `lib/schemas/` (1 schema = 1 form = 1 action)
2. Composant form avec React Hook Form + zodResolver
3. Server Action qui revalide le même schema côté serveur
4. Le composant gère : loading (pending), error (affichage inline), success (redirect ou toast)

```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createProjectSchema, type CreateProjectData } from "@/lib/schemas/project"
import { createProjectAction } from "@/lib/actions/project"
import { useTransition } from "react"

export function CreateProjectForm() {
  const [isPending, startTransition] = useTransition()
  const form = useForm<CreateProjectData>({
    resolver: zodResolver(createProjectSchema),
  })

  function onSubmit(data: CreateProjectData) {
    startTransition(async () => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => formData.append(key, value))
      const result = await createProjectAction(formData)
      if (result.error) {
        form.setError("root", { message: result.error })
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Champs du formulaire */}
      {form.formState.errors.root && (
        <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
      )}
      <button type="submit" disabled={isPending}>
        {isPending ? "Création..." : "Créer"}
      </button>
    </form>
  )
}
```

## Pattern Fetch (Server Components)

Les données sont fetchées dans les Server Components, pas dans les Client Components.

```tsx
// app/(dashboard)/projects/page.tsx
import { createClient } from "@/lib/supabase/server"
import { ProjectList } from "@/components/projects/project-list"

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })

  return <ProjectList projects={projects ?? []} />
}
```

Le Client Component reçoit les données en props. Il ne fetch pas.

## Auth Pattern

### Middleware (`src/middleware.ts`)

- Vérifie la session Supabase sur chaque requête
- Redirige vers `/login` si non authentifié sur les routes protégées
- Rafraîchit le token si expiré

### Dans les Server Actions

Toujours revérifier l'auth (le middleware ne suffit pas) :

```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect("/login")
```

### Supabase RLS

Toute table a des RLS policies activées. Le dev ne bypass JAMAIS RLS sauf avec le service_role client dans des cas documentés (ADR).

## Error Handling

### Codes d'erreur

- `AUTH_REQUIRED` : utilisateur non connecté
- `VALIDATION_ERROR` : input invalide (retourner les détails Zod)
- `NOT_FOUND` : ressource inexistante
- `FORBIDDEN` : pas les droits
- `INTERNAL_ERROR` : erreur inattendue (logger côté serveur, message générique côté client)

### Messages user-friendly

Ne JAMAIS exposer les messages d'erreur Supabase bruts au client.
Mapper vers des messages en français compréhensibles.

## Pagination

### Server-side (recommandé)
```typescript
// Server Component avec query params
export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; size?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const size = Number(params.size) || 20
  const from = (page - 1) * size
  const to = from + size - 1

  const supabase = await createClient()
  const { data, count } = await supabase
    .from("items")
    .select("*", { count: "exact" })
    .range(from, to)
    .order("created_at", { ascending: false })

  return <ItemList items={data ?? []} total={count ?? 0} page={page} size={size} />
}
```

### Type de réponse paginée
```typescript
type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

### Cursor-based (pour l'infinite scroll)
```typescript
const { data } = await supabase
  .from("items")
  .select("*")
  .lt("created_at", cursor)
  .order("created_at", { ascending: false })
  .limit(20)
```

## Search & Filter

```typescript
// Server Component avec filtres en query params
export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; sort?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase.from("items").select("*", { count: "exact" })

  // Recherche texte
  if (params.q) {
    query = query.ilike("name", `%${params.q}%`)
  }

  // Filtre par statut
  if (params.status) {
    query = query.eq("status", params.status)
  }

  // Tri
  const [column, direction] = (params.sort ?? "created_at:desc").split(":")
  query = query.order(column, { ascending: direction === "asc" })

  const { data, count } = await query
  return <ItemList items={data ?? []} total={count ?? 0} />
}
```

**Règle :** Les filtres sont dans l'URL (query params), pas dans un state local. Ça permet le partage de lien et le back/forward du navigateur.

## Optimistic Updates

```tsx
"use client"
import { useOptimistic, useTransition } from "react"

export function TodoList({ items }: { items: Todo[] }) {
  const [optimisticItems, addOptimistic] = useOptimistic(
    items,
    (state, newItem: Todo) => [...state, newItem]
  )
  const [, startTransition] = useTransition()

  function handleAdd(formData: FormData) {
    const title = formData.get("title") as string
    const tempItem = { id: crypto.randomUUID(), title, completed: false }

    startTransition(async () => {
      addOptimistic(tempItem)
      await createTodoAction(formData)
    })
  }

  return (
    <form action={handleAdd}>
      {/* ... */}
    </form>
  )
}
```

## File Upload

```typescript
// Schema de validation fichier
const fileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, "Max 5MB")
    .refine(
      (f) => ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(f.type),
      "Format non supporté"
    ),
})

// Server Action
"use server"
export async function uploadFile(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const file = formData.get("file") as File
  const parsed = fileSchema.safeParse({ file })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const ext = file.name.split(".").pop()
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from("uploads")
    .upload(path, file)

  if (error) return { error: "Échec de l'upload" }

  const { data } = supabase.storage.from("uploads").getPublicUrl(path)
  revalidatePath("/files")
  return { data: { url: data.publicUrl } }
}
```

## Caching & Revalidation

### Stratégies
| Stratégie | Quand | Comment |
|-----------|-------|---------|
| **revalidatePath** | Après une mutation qui change une page | `revalidatePath("/projects")` |
| **revalidateTag** | Après une mutation qui change des données taguées | `revalidateTag("projects")` |
| **Time-based** | Données qui changent rarement | `{ next: { revalidate: 3600 } }` dans fetch |
| **No cache** | Données temps réel | `{ cache: "no-store" }` dans fetch |

### Avec Supabase (Server Components)
Les requêtes Supabase via le SDK ne passent pas par le cache fetch de Next.js.
Pour les données qui changent rarement, utiliser `unstable_cache` :

```typescript
import { unstable_cache } from "next/cache"

const getCachedSettings = unstable_cache(
  async () => {
    const supabase = await createClient()
    const { data } = await supabase.from("settings").select("*").single()
    return data
  },
  ["settings"],
  { revalidate: 3600, tags: ["settings"] }
)
```

## Bulk Operations

```typescript
type BulkResult = {
  succeeded: number
  failed: number
  errors: Array<{ id: string; error: string }>
}

"use server"
export async function bulkDeleteItems(ids: string[]): Promise<ActionResult<BulkResult>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error, count } = await supabase
    .from("items")
    .delete()
    .in("id", ids)

  if (error) return { error: "Échec de la suppression" }

  revalidatePath("/items")
  return { data: { succeeded: count ?? 0, failed: 0, errors: [] } }
}
```

## Webhook Pattern

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from "next/headers"

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) return new Response("Missing signature", { status: 400 })

  // Vérifier la signature
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    // Traiter l'event...
    return new Response("OK", { status: 200 })
  } catch {
    return new Response("Invalid signature", { status: 400 })
  }
}
```
