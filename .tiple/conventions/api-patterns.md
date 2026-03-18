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

<!-- PERSONNALISER : ajouter les patterns spécifiques au projet -->
