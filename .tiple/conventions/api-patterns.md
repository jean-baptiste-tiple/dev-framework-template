# API Patterns — Next.js Server Actions + Supabase

## Principe : Server Actions > Route Handlers

Utiliser les Server Actions pour toutes les mutations.
Les Route Handlers (`app/api/`) sont réservés aux : webhooks externes, cron jobs, intégrations tierces qui doivent appeler une URL.

## Type de retour standard

```typescript
// lib/types/index.ts ou directement dans le fichier d'actions
type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string }
```

JAMAIS de `throw` dans une Server Action appelée par un formulaire.
Le `throw` est réservé aux cas critiques (auth manquante = `redirect`, pas `throw`).

## Pattern Server Action standard

### Structure

Chaque fichier dans `lib/actions/` regroupe les actions d'un domaine.
Chaque action :
1. Vérifie l'auth
2. Valide l'input (Zod)
3. Exécute la mutation (Supabase)
4. Revalide le cache (`revalidatePath` / `revalidateTag`)
5. Retourne `{ data }` ou `{ error }`

### Exemple complet

```typescript
// lib/actions/projects.ts
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createProjectSchema, updateProjectSchema } from "@/lib/schemas/project"

export async function createProjectAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const parsed = createProjectSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: "Données invalides" }

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) return { error: "Impossible de créer le projet" }
  revalidatePath("/projects")
  return { data }
}

export async function updateProjectAction(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const parsed = updateProjectSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: "Données invalides" }

  const { data, error } = await supabase
    .from("projects")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single()

  if (error) return { error: "Impossible de mettre à jour le projet" }
  revalidatePath(`/projects/${id}`)
  return { data }
}

export async function deleteProjectAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)

  if (error) return { error: "Impossible de supprimer le projet" }
  revalidatePath("/projects")
  return { data: true }
}
```

## Pattern Form

### Flow complet

1. Schema Zod dans `lib/schemas/` (1 schema = 1 form = 1 action)
2. Composant form avec React Hook Form + `zodResolver`
3. Server Action qui revalide le même schema côté serveur
4. Le composant gère : loading (pending), error (affichage inline), success (redirect ou toast)

### Exemple

```typescript
// lib/schemas/project.ts
import { z } from "zod"

export const createProjectSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  description: z.string().max(500).optional(),
})

export type CreateProjectData = z.infer<typeof createProjectSchema>
```

```tsx
// components/projects/create-project-form.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
import { createProjectSchema, type CreateProjectData } from "@/lib/schemas/project"
import { createProjectAction } from "@/lib/actions/projects"

export function CreateProjectForm() {
  const [isPending, startTransition] = useTransition()
  const { register, handleSubmit, formState: { errors }, setError } = useForm<CreateProjectData>({
    resolver: zodResolver(createProjectSchema),
  })

  function onSubmit(data: CreateProjectData) {
    startTransition(async () => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) formData.set(key, value)
      })
      const result = await createProjectAction(formData)
      if (result.error) {
        setError("root", { message: result.error })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} placeholder="Nom du projet" />
      {errors.name && <p>{errors.name.message}</p>}

      <textarea {...register("description")} placeholder="Description" />
      {errors.description && <p>{errors.description.message}</p>}

      {errors.root && <p>{errors.root.message}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? "Création..." : "Créer le projet"}
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
- Matcher : exclure les routes publiques, les assets, les API webhooks

### Dans les Server Actions

Toujours revérifier l'auth (le middleware ne suffit pas, on peut appeler une action directement) :

```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect("/login")
```

### Supabase RLS

Toute table a des RLS policies activées. Le dev ne bypass JAMAIS RLS sauf avec le `service_role` client dans des cas documentés (ADR).

## Error Handling

### Codes d'erreur

| Code | Signification | Usage |
|------|---------------|-------|
| AUTH_REQUIRED | Utilisateur non connecté | `redirect("/login")` |
| VALIDATION_ERROR | Input invalide | Retourner les détails Zod |
| NOT_FOUND | Ressource inexistante | `return { error: "..." }` |
| FORBIDDEN | Pas les droits | `return { error: "..." }` |
| INTERNAL_ERROR | Erreur inattendue | Logger côté serveur, message générique côté client |

### Messages user-friendly

Ne JAMAIS exposer les messages d'erreur Supabase bruts au client.
Mapper vers des messages en français compréhensibles.

```typescript
// ❌ MAUVAIS
if (error) return { error: error.message }

// ✅ BON
if (error) return { error: "Impossible de créer le projet. Réessayez." }
```

<!-- PERSONNALISER : ajouter les patterns spécifiques au projet -->
