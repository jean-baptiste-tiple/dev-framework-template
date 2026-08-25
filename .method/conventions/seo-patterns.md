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

## GEO — moteurs génératifs

Le SEO vise un classement, le GEO vise une **citation**. Ce qu'un moteur génératif extrait est
une phrase, pas une page : elle doit tenir **hors de son contexte visuel**. Quatre surfaces,
toutes rendues côté serveur (un contenu monté après hydratation n'est pas extrait).

- **TL;DR** — 1 à 2 phrases factuelles en tête de page publique, autonomes : aucun « comme vu
  plus haut », aucun renvoi à un visuel, aucun pronom sans antécédent dans la phrase. Rendu
  visible, pas caché en `sr-only`.
- **FAQ** — questions/réponses autonomes, rendues en HTML **et** déclarées en JSON-LD
  `FAQPage`. C'est le levier d'extraction le plus fort ; une réponse qui dépend de la question
  précédente ne s'extrait pas.
- **Entités nommées** — produits, lieux, personnes, technologies écrits explicitement dans le
  texte. Un pronom ne se cite pas.
- **`llms.txt`** — index des pages publiques (titre, description, TL;DR) servi à la racine.

```tsx
// app/llms.txt/route.ts — réponse GET statique, pas une API de mutation :
// l'invariant « pas de Route Handler » (CLAUDE.md § Invariants techniques) vise les mutations.
export const dynamic = "force-static"

export async function GET() {
  const pages = await getPublicPages() // MÊME source que app/sitemap.ts
  const body = [
    `# ${SITE_NAME}`,
    `> ${SITE_DESCRIPTION}`,
    "",
    "## Quand utiliser ce site",
    WHEN_TO_USE, // cas d'usage concrets — « facturation récurrente en SaaS B2B », pas « la
    //              meilleure solution du marché ». Un agent arbitre sur des faits.
    "",
    "## Pages",
    ...pages.map((p) => `- [${p.title}](${p.url}) : ${p.tldr ?? p.description}`),
  ].join("\n")

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
```

**Vérifiable :** `llms.txt` et `app/sitemap.ts` dérivent de la même fonction. Deux listes de
pages maintenues à la main divergent — la seconde silencieusement. Une page en `noindex` est
absente des deux.

## Agentic readiness

Les agents IA sont des visiteurs. Ils lisent le HTML servi et ne cliquent nulle part.

- **`robots.ts` n'exclut aucun crawler IA.** `GPTBot`, `ClaudeBot`, `PerplexityBot`,
  `Google-Extended` et `CCBot` sont couverts par la règle `userAgent: "*"`. Un blocage ciblé
  est une **décision** : elle passe par un ADR (`docs/decisions/`), jamais par un copier-coller
  de blocklist trouvée en ligne. Les `disallow` existants portent sur des zones privées
  (`/dashboard/`, `/api/`, `/auth/`), pas sur des agents.
- **404 réelle.** Un chemin inexistant renvoie le **statut HTTP 404**. `not-found.tsx` le fait ;
  un `redirect()` vers l'accueil ou un rendu conditionnel dans une `page.tsx` renvoie 200 et
  fait indexer des pages vides.
  Contrôle : `curl -s -o /dev/null -w "%{http_code}" <domaine>/chemin-inexistant` → `404`.
- **Mesure, après mise en ligne :** `npx is-agentic <domaine> --json` — audit public, sans clé.
  Objectif : zéro issue de tier `essential`. Les rapports sont des snapshots rafraîchis au plus
  toutes les 6 h : comparer `scanned_at` avant de conclure qu'un correctif a porté. Les checks
  orientés API (OAuth, en-têtes de rate limit, serveur MCP, OpenAPI) sont N/A pour une app de
  contenu et ne comptent pas contre le score — **ne pas construire une API pour un point de
  score** (`CLAUDE.md § Justifier une surface nouvelle`).

## Règles SEO

- **Toute page publique** a un `title` et une `description` uniques
- **Les pages authentifiées** n'ont pas besoin de SEO (pas indexées)
- **`noindex`** sur les pages de login, signup, reset password
- **Canonical : une seule forme déclarée.** `metadataBase` dans le root layout,
  `alternates.canonical` par page. La forme déclarée (avec ou sans slash final) est celle
  servie, celle du sitemap et celle du JSON-LD — jamais deux formes pour une même page
- **Aucun déploiement de preview n'est indexable.** Une preview (`*.vercel.app`, staging) sert
  le même HTML que la prod : sans garde, c'est du contenu dupliqué qui concurrence la prod.
  Poser `X-Robots-Tag: noindex` côté hébergeur, ou brancher `robots.ts` sur
  `process.env.VERCEL_ENV !== "production"`
- **URL renommée ou supprimée** → redirection `permanent: true` (301) dans le bloc
  `redirects()` de `next.config.ts`, source unique. Une 302 ne transmet pas le référencement
- **Images** : toujours un `alt` descriptif
- **Headings** : un seul `h1` par page, hiérarchie logique
