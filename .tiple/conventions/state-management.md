# State Management

> Tag : `state`
> Lire ce fichier pour comprendre où et comment gérer le state dans l'app.

## Hiérarchie des sources de state

| Source | Quand l'utiliser | Exemples |
|--------|-----------------|----------|
| **Server (Supabase)** | Données persistées, partagées entre utilisateurs | Projets, commandes, profils |
| **URL (query params)** | État partageable par lien, filtres, pagination | `?page=2&status=active&q=test` |
| **React state** | UI locale, temporaire, non-partageable | Modal ouvert/fermé, formulaire en cours |
| **Context** | État partagé entre composants distants dans l'arbre | Theme, user courant, toast queue |

## Règle d'or

**Pas de state côté client pour ce qui vient du serveur.** Les Server Components fetchent directement. Pas de `useEffect` + `fetch` + `useState` pour charger des données.

## URL State (recommandé pour les filtres)

```tsx
"use client"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"

export function useQueryParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return { searchParams, setParam }
}
```

**Pourquoi l'URL :**
- Partage par lien (copier l'URL = partager les filtres)
- Back/forward du navigateur fonctionne
- SSR compatible (Server Component lit les searchParams)
- Bookmarkable

## React State (local)

```tsx
"use client"
import { useState } from "react"

export function DeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [isConfirming, setIsConfirming] = useState(false)

  if (isConfirming) {
    return (
      <div className="flex gap-2">
        <Button variant="destructive" onClick={onDelete}>Confirmer</Button>
        <Button variant="outline" onClick={() => setIsConfirming(false)}>Annuler</Button>
      </div>
    )
  }

  return <Button variant="ghost" onClick={() => setIsConfirming(true)}>Supprimer</Button>
}
```

**Utiliser useState pour :**
- Toggle UI (modal, dropdown, sidebar)
- État de formulaire en cours de saisie
- Animations, transitions
- État temporaire qui disparaît au refresh

## Context (état global léger)

```tsx
// providers/toast-provider.tsx
"use client"
import { createContext, useContext, useState, useCallback } from "react"

type Toast = { id: string; message: string; variant: "success" | "error" | "info" }

type ToastContextType = {
  toasts: Toast[]
  addToast: (message: string, variant?: Toast["variant"]) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, variant: Toast["variant"] = "info") => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => removeToast(id), 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}
```

**Règles Context :**
- **Un provider par préoccupation** (toast, theme, user) — pas un mega-provider
- **Placer le provider le plus bas possible** dans l'arbre
- **Pas de data fetching dans le context** — utiliser les Server Components

## Quand NE PAS utiliser de state

| Situation | Pourquoi pas de state | Alternative |
|-----------|----------------------|-------------|
| Données serveur | Server Component fetch directement | `async function Page()` |
| Valeur dérivée | Calculer à la volée | `const total = items.reduce(...)` |
| Props drilling sur 2 niveaux | Pas assez profond pour context | Passer les props |
| État partageable par URL | Le state se perd au refresh | Query params |

## Memo / useCallback / useMemo

**Règle : ne pas optimiser prématurément.**

```tsx
// Utiliser useMemo SEULEMENT si :
// 1. Le calcul est coûteux (> 1ms)
// 2. Les dépendances changent rarement
const expensiveResult = useMemo(() => {
  return items.filter(complexFilter).sort(complexSort)
}, [items])

// Utiliser useCallback SEULEMENT si :
// 1. La fonction est passée en prop à un composant mémoïsé
// 2. La fonction est dans les deps d'un useEffect
const handleDelete = useCallback((id: string) => {
  // ...
}, [dependency])
```

**Ne PAS mémoïser :**
- Des calculs simples (addition, string concat)
- Des fonctions utilisées uniquement dans le même composant
- Des valeurs qui changent à chaque render de toute façon
