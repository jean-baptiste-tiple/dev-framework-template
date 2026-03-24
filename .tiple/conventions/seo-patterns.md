# SEO Patterns

> Tag : `seo`
> Lire ce fichier pour toute story touchant aux pages publiques, au marketing, ou au référencement.

## Metadata API

### Statique (pages connues)
```tsx
// app/(marketing)/pricing/page.tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tarifs | MonApp",
  description: "Découvrez nos offres et tarifs. Essai gratuit de 14 jours.",
  openGraph: {
    title: "Tarifs | MonApp",
    description: "Découvrez nos offres et tarifs.",
    type: "website",
  },
}
```

### Dynamique (pages avec données)
```tsx
// app/(dashboard)/projects/[id]/page.tsx
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: project } = await supabase
    .from("projects")
    .select("name, description")
    .eq("id", id)
    .single()

  return {
    title: project?.name ?? "Projet",
    description: project?.description ?? "Détail du projet",
  }
}
```

### Layout-level metadata (défauts)
```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: "%s | MonApp",
    default: "MonApp — Description courte",
  },
  description: "Description par défaut de l'app",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "MonApp",
  },
}
```

## Sitemap

```tsx
// app/sitemap.ts
import type { MetadataRoute } from "next"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from("projects")
    .select("id, updated_at")
    .eq("is_public", true)

  const projectUrls = (projects ?? []).map((p) => ({
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/projects/${p.id}`,
    lastModified: p.updated_at,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [
    { url: process.env.NEXT_PUBLIC_SITE_URL!, lastModified: new Date(), priority: 1 },
    { url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`, priority: 0.9 },
    ...projectUrls,
  ]
}
```

## Robots

```tsx
// app/robots.ts
import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/", "/auth/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  }
}
```

## Structured Data (JSON-LD)

```tsx
// Composant réutilisable
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Usage dans une page
<JsonLd data={{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MonApp",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "29",
    priceCurrency: "EUR",
  },
}} />
```

## Règles SEO

- **Toute page publique** a un `title` et une `description` uniques
- **Les pages authentifiées** n'ont pas besoin de SEO (pas indexées)
- **`noindex`** sur les pages de login, signup, reset password
- **Canonical URLs** pour éviter le contenu dupliqué
- **Images** : toujours un `alt` descriptif
- **Headings** : un seul `h1` par page, hiérarchie logique
