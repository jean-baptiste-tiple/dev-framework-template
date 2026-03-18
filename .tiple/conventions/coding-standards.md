# Coding Standards — Next.js 15 + Supabase

## Naming

- Fichiers : kebab-case (`user-profile.tsx`, `use-auth.ts`)
- Composants : PascalCase (`UserProfile`, `LoginForm`)
- Variables/fonctions : camelCase
- Types/Interfaces : PascalCase avec suffixe descriptif (`UserRow`, `LoginFormData`)
- Server Actions : camelCase avec suffixe `Action` (`loginAction`, `createProjectAction`)
- Zod schemas : camelCase avec suffixe `Schema` (`loginSchema`, `projectSchema`)

## Structure des fichiers

<!-- NOTE IMPORTANTE POUR CLAUDE CODE :
     Cette section définit où placer chaque type de fichier.
     La LIRE AVANT de créer tout nouveau fichier. -->

```
src/
├── app/                          # Routes Next.js (App Router)
│   ├── (auth)/                   # Groupe : pages publiques (login, signup)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/              # Groupe : pages authentifiées
│   │   ├── layout.tsx            # Layout avec sidebar, auth check
│   │   ├── page.tsx              # Dashboard home
│   │   └── projects/
│   │       ├── page.tsx          # Liste projets
│   │       └── [id]/page.tsx     # Détail projet
│   ├── api/                      # Route handlers (si nécessaire, préférer Server Actions)
│   ├── layout.tsx                # Root layout (providers, fonts, metadata)
│   └── not-found.tsx
├── components/
│   ├── ui/                       # Composants Shadcn/ui (ne pas modifier directement)
│   ├── shared/                   # Composants métier réutilisables
│   └── [feature]/                # Composants spécifiques à une feature
├── hooks/                        # Custom hooks
├── lib/
│   ├── actions/                  # Server Actions (regroupés par domaine)
│   ├── schemas/                  # Zod schemas (PARTAGÉS front + back)
│   ├── supabase/
│   │   ├── client.ts             # Supabase browser client
│   │   └── server.ts             # Supabase server client (cookies)
│   └── utils/                    # Fonctions utilitaires pures
├── types/                        # Types TypeScript partagés
│   ├── database.ts               # Types générés depuis Supabase (npx supabase gen types)
│   └── index.ts                  # Types métier custom
└── middleware.ts                  # Auth middleware (redirect si non connecté)
```

## Server Components vs Client Components

- **Par défaut : Server Component** (pas de `"use client"`)
- Passer en Client Component SEULEMENT si : `useState`, `useEffect`, event handlers, browser APIs, hooks custom qui utilisent du state
- Règle : pousser le `"use client"` le plus bas possible dans l'arbre
- Pattern : Server Component parent (fetch data) → Client Component enfant (interactivité)

```tsx
// ✅ BON — Server Component fetch, Client Component interagit
// app/(dashboard)/projects/page.tsx (Server Component)
export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase.from("projects").select("*")
  return <ProjectList projects={projects ?? []} />
}

// components/projects/project-list.tsx (Client Component)
"use client"
export function ProjectList({ projects }: { projects: Project[] }) {
  const [search, setSearch] = useState("")
  // ...interactivité
}
```

## Server Actions

- Préférer les Server Actions aux API routes pour les mutations
- Toujours valider les inputs avec Zod côté serveur
- Toujours vérifier l'auth en début d'action
- Pattern standard :

```typescript
// lib/actions/projects.ts
"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createProjectSchema } from "@/lib/schemas/project"

export async function createProjectAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non authentifié" }

  const parsed = createProjectSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath("/projects")
  return { data }
}
```

## Supabase Client

- JAMAIS de client Supabase côté client pour les mutations → Server Actions
- Le browser client est UNIQUEMENT pour : realtime subscriptions, storage uploads, auth listeners
- Le server client (avec cookies) est pour : Server Components (fetch), Server Actions (mutations), Route Handlers
- Le `service_role` client est UNIQUEMENT pour : opérations admin qui bypass RLS (cron jobs, webhooks — ADR obligatoire)

## DRY

- Schemas Zod : UN schema par entité dans `lib/schemas/`, utilisé par le form ET par l'action
- Types : générés depuis Supabase (`database.ts`), enrichis dans `types/index.ts`
- Composants : vérifier `component-registry.md` AVANT de créer
- Factoriser à partir de 2 occurrences, pas avant (pas d'abstraction prématurée)

## Imports

- Alias : `@/` pointe vers `src/`
- Ordre : 1) next/ react 2) libs externes 3) @/components 4) @/lib 5) @/types 6) relatifs

## Error Handling

- Jamais de `catch` vide
- Server Actions retournent `{ data }` ou `{ error }` — jamais de throw côté client
- Composants UI : toujours gérer loading + error + empty states
- Supabase : toujours vérifier le `.error` de la réponse

<!-- PERSONNALISER : ajouter les conventions spécifiques au projet -->
