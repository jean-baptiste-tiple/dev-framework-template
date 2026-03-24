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
│   ├── api/                      # Route handlers (webhooks/cron uniquement)
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
│   │   ├── server.ts             # Supabase server client (cookies)
│   │   └── admin.ts              # Supabase service_role (si nécessaire)
│   └── utils/                    # Fonctions utilitaires pures
├── types/                        # Types TypeScript partagés
│   ├── database.ts               # Types générés depuis Supabase (npx supabase gen types)
│   └── index.ts                  # Types métier custom
└── middleware.ts                  # Auth middleware (redirect si non connecté)
```

## Server Components vs Client Components

- **Par défaut : Server Component** (pas de "use client")
- Passer en Client Component SEULEMENT si : useState, useEffect, event handlers, browser APIs, hooks custom qui utilisent du state
- Règle : pousser le "use client" le plus bas possible dans l'arbre
- Pattern : Server Component parent (fetch data) → Client Component enfant (interactivité)

## Server Actions

- Préférer les Server Actions aux API routes pour les mutations
- Toujours valider les inputs avec Zod côté serveur
- Toujours vérifier l'auth en début d'action
- Pattern standard :

```typescript
"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createProjectSchema } from "@/lib/schemas/project"

export async function createProjectAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Non authentifié")

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
- Le service_role client est UNIQUEMENT pour : les opérations admin qui bypass RLS (cron jobs, webhooks)

## DRY

- Schemas Zod : UN schema par entité dans `lib/schemas/`, utilisé par le form ET par l'action
- Types : générés depuis Supabase (`database.ts`), enrichis dans `types/index.ts`
- Composants : vérifier `component-registry.md` AVANT de créer
- Factoriser à partir de 2 occurrences, pas avant (pas d'abstraction prématurée)

## Imports

- Alias : `@/` pointe vers `src/`
- Ordre : 1) next/ react 2) libs externes 3) @/components 4) @/lib 5) @/types 6) relatifs

## Error Handling

- Jamais de catch vide
- Server Actions retournent `{ data }` ou `{ error }` — jamais de throw côté client
- Composants UI : toujours gérer loading + error + empty states
- Supabase : toujours vérifier le `.error` de la réponse

## Error Handling avancé

### Server Actions — pattern try/catch
```typescript
"use server"
export async function riskyAction(formData: FormData): Promise<ActionResult<Data>> {
  try {
    // ... logique
  } catch (error) {
    // Logger l'erreur côté serveur (détails techniques)
    console.error("[riskyAction]", error)
    // Retourner un message user-friendly côté client
    return { error: "Une erreur est survenue. Réessayez." }
  }
}
```

### Mapping des erreurs
```typescript
// lib/utils/errors.ts
const ERROR_MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: "Vous devez être connecté",
  VALIDATION_ERROR: "Données invalides",
  NOT_FOUND: "Élément introuvable",
  FORBIDDEN: "Accès non autorisé",
  DUPLICATE: "Cet élément existe déjà",
  INTERNAL_ERROR: "Une erreur est survenue",
}
```

### Règle : ne JAMAIS exposer les erreurs techniques au client
- Pas de `error.message` Supabase brut
- Pas de stack traces
- Pas de noms de tables/colonnes

## Comments & Documentation

### Quand commenter
- **OUI :** Logique métier non-évidente, décisions d'architecture, workarounds
- **NON :** Code auto-documenté (bon naming), re-description du code

### Format
```typescript
// Bon : explique le POURQUOI
// Le rate limit est plus strict sur /login car c'est la cible principale des brute force
const LOGIN_RATE_LIMIT = 5

// Mauvais : décrit le QUOI (redondant avec le code)
// Incrémente le compteur
counter++
```

### JSDoc — uniquement sur les fonctions exportées complexes
```typescript
/**
 * Calcule le prix total avec taxes et réductions.
 * Les réductions sont appliquées AVANT les taxes.
 */
export function calculateTotal(items: CartItem[], discount?: number): number {
  // ...
}
```

## File Size & Complexity

| Métrique | Limite | Action si dépassé |
|----------|--------|-------------------|
| Lignes par fichier | ~300 | Extraire des sous-composants/utils |
| Paramètres par fonction | 3-4 max | Utiliser un objet params |
| Niveaux d'imbrication | 3 max | Early return, extraction |
| Composant React | ~150 lignes | Extraire en sous-composants |

## Early Returns

```typescript
// BON : early returns
export async function updateItem(id: string, data: ItemData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non authentifié" }

  const parsed = itemSchema.safeParse(data)
  if (!parsed.success) return { error: "Données invalides" }

  // Logique principale sans indentation
  const { error } = await supabase.from("items").update(parsed.data).eq("id", id)
  if (error) return { error: "Échec de la mise à jour" }
  return { data: { success: true } }
}

// MAUVAIS : imbrication profonde
export async function updateItem(id: string, data: ItemData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const parsed = itemSchema.safeParse(data)
    if (parsed.success) {
      // ... 3 niveaux d'indentation
    }
  }
}
```

## TypeScript Strict Rules

- **`const` par défaut**, `let` uniquement si réassignation nécessaire, jamais `var`
- **Jamais de `any`** — utiliser `unknown` + type guard si type inconnu
- **Pas de `as` assertion** sauf si nécessaire (et documenté)
- **Enums :** préférer `as const` + type inféré aux `enum`

```typescript
// Préféré : const object
const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  DELIVERED: "delivered",
} as const
type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

// Éviter : TypeScript enum
enum OrderStatus { Pending, Confirmed, Delivered }
```
