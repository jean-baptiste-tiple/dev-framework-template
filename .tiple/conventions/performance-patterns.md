# Performance Patterns

> Tag : `performance`
> Lire ce fichier pour optimiser le chargement, le rendu et la taille du bundle.

## Principes

1. **Mesurer avant d'optimiser.** Ne pas deviner — utiliser Lighthouse et les Web Vitals.
2. **Server Components par défaut.** Zéro JS côté client = meilleure performance.
3. **Charger uniquement ce qui est visible.** Lazy load, code splitting, images optimisées.

## Code Splitting

```tsx
// Lazy load des composants lourds (éditeurs, graphiques, modals)
import dynamic from "next/dynamic"

const RichEditor = dynamic(() => import("@/components/shared/rich-editor"), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false, // Si le composant utilise des APIs browser
})

const ChartDashboard = dynamic(() => import("@/components/dashboard/chart"), {
  loading: () => <Skeleton className="h-80" />,
})
```

**Quand lazy load :**
- Composants > 50KB (éditeurs, graphiques, calendriers)
- Composants dans des onglets/modals (pas visibles au premier render)
- Composants qui utilisent des libs browser-only

**Ne PAS lazy load :**
- Composants au-dessus du fold (visibles immédiatement)
- Composants légers (< 10KB)
- Navigation, header, footer

## Images

```tsx
import Image from "next/image"

// Image au-dessus du fold → priority
<Image src="/hero.jpg" alt="Hero" width={1200} height={600} priority />

// Image en dessous du fold → lazy (défaut)
<Image src="/feature.jpg" alt="Feature" width={600} height={400} />

// Image responsive
<Image
  src="/photo.jpg"
  alt="Photo"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

**Règles :**
- Toujours utiliser `next/image` (jamais `<img>`)
- Toujours renseigner `width` + `height` ou `fill` + `sizes`
- `priority` uniquement pour le LCP (Largest Contentful Paint)
- Format : laisser Next.js optimiser (WebP/AVIF automatique)

## Fonts

```tsx
// app/layout.tsx — chargement optimisé
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",     // Texte visible immédiatement
  variable: "--font-sans",
})
```

**Règle :** Toujours utiliser `next/font` — pas de `<link>` vers Google Fonts (bloque le rendu).

## Bundle Size

### Analyser
```bash
# Ajouter au package.json
# "analyze": "ANALYZE=true next build"
```

### Bonnes pratiques
- **Imports nommés** : `import { Button } from "@/components/ui/button"` (pas `import * as UI`)
- **Pas de libs géantes pour un usage simple** : `date-fns` > `moment`, natif > lodash
- **Tree shaking** : vérifier que les libs sont ESM-compatible

### Tailles cibles
| Métrique | Cible | Comment |
|----------|-------|---------|
| First Load JS | < 100KB | Server Components, lazy load |
| LCP | < 2.5s | `priority` sur l'image principale |
| FID / INP | < 200ms | Pas de JS lourd au load |
| CLS | < 0.1 | `width/height` sur les images, fonts `swap` |

## Data Fetching Performance

### Parallel fetching
```tsx
// BON : requêtes parallèles
export default async function DashboardPage() {
  const [stats, orders, notifications] = await Promise.all([
    getStats(),
    getRecentOrders(),
    getNotifications(),
  ])
  return <Dashboard stats={stats} orders={orders} notifications={notifications} />
}

// MAUVAIS : requêtes séquentielles (waterfall)
export default async function DashboardPage() {
  const stats = await getStats()
  const orders = await getRecentOrders()  // attend stats
  const notifications = await getNotifications()  // attend orders
  return <Dashboard stats={stats} orders={orders} notifications={notifications} />
}
```

### Streaming avec Suspense
```tsx
// Les sections se chargent indépendamment
export default function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />  {/* Peut prendre 500ms */}
      </Suspense>
      <Suspense fallback={<OrdersSkeleton />}>
        <RecentOrders />  {/* Peut prendre 200ms — s'affiche avant Stats */}
      </Suspense>
    </div>
  )
}
```

## React Performance

### Éviter les re-renders inutiles
```tsx
// Extraire les Client Components au plus bas
// MAUVAIS : toute la page est client
"use client"
export default function ProjectsPage({ projects }) { /* ... */ }

// BON : seule l'interactivité est client
export default function ProjectsPage({ projects }) {
  return (
    <div>
      <h1>Projets</h1>  {/* Server */}
      <ProjectList projects={projects} />  {/* Server */}
      <CreateButton />  {/* Client — "use client" ici seulement */}
    </div>
  )
}
```

## N+1 Queries Prevention

```typescript
// Voir database-patterns.md pour les détails
// Toujours utiliser les jointures Supabase
const { data } = await supabase
  .from("orders")
  .select("*, items:order_items(*, product:products(name, price))")
```
