---
name: seo
description: Use when adding page metadata, Open Graph tags, sitemap, structured data, or canonical URLs.
---

Consult [.tiple/conventions/seo-patterns.md](.tiple/conventions/seo-patterns.md) for the full patterns. Load it before writing SEO metadata.

Key invariants:
- Toute page publique a un `title` et une `description` uniques (Metadata API Next.js)
- Pages auth (login/signup/reset) en `noindex`
- Un seul `h1` par page, hiérarchie de headings logique, images avec `alt` descriptif
