# Monitoring & Observability Patterns

> Tag : `monitoring`
> Lire ce fichier pour configurer le suivi d'erreurs, les analytics et les health checks.

## Error Tracking

### Sentry (recommandé)
```typescript
// lib/utils/sentry.ts
import * as Sentry from "@sentry/nextjs"

// Initialisation dans next.config.ts via withSentryConfig
// ou sentry.client.config.ts / sentry.server.config.ts

// Capturer une erreur manuellement
export function captureError(error: unknown, context?: Record<string, unknown>) {
  console.error(error)
  Sentry.captureException(error, { extra: context })
}
```

### Usage dans les Server Actions
```typescript
"use server"
export async function riskyAction(formData: FormData) {
  try {
    // ... logique
  } catch (error) {
    captureError(error, { action: "riskyAction", formData: Object.fromEntries(formData) })
    return { error: "Une erreur est survenue" }
  }
}
```

### Règles Error Tracking
- **Capturer les erreurs inattendues** (catch blocks, error boundaries)
- **Ne PAS capturer** les erreurs de validation utilisateur (attendues)
- **Ajouter du contexte** : userId, action, données pertinentes (sans PII)
- **Ne JAMAIS logger de PII** (mots de passe, tokens, données personnelles)

## Logging

### Structure
```typescript
// lib/utils/logger.ts
type LogLevel = "debug" | "info" | "warn" | "error"

function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  }

  if (level === "error") {
    console.error(JSON.stringify(entry))
  } else if (level === "warn") {
    console.warn(JSON.stringify(entry))
  } else {
    console.log(JSON.stringify(entry))
  }
}

export const logger = {
  debug: (msg: string, data?: Record<string, unknown>) => log("debug", msg, data),
  info: (msg: string, data?: Record<string, unknown>) => log("info", msg, data),
  warn: (msg: string, data?: Record<string, unknown>) => log("warn", msg, data),
  error: (msg: string, data?: Record<string, unknown>) => log("error", msg, data),
}
```

### Usage
```typescript
logger.info("Order created", { orderId: order.id, userId: user.id })
logger.error("Payment failed", { orderId: order.id, errorCode: error.code })
// JAMAIS : logger.info("User login", { password: "..." })
```

### Niveaux de log
| Niveau | Quand | En prod ? |
|--------|-------|-----------|
| `debug` | Détails de débogage | Non |
| `info` | Événements métier normaux | Oui |
| `warn` | Situations anormales mais gérées | Oui |
| `error` | Erreurs inattendues | Oui |

## Web Analytics

### Vercel Analytics (si hébergé sur Vercel)
```tsx
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Events custom
```typescript
import { track } from "@vercel/analytics"

// Tracker un événement métier
track("project_created", { plan: "pro" })
track("order_completed", { total: 2999 })
```

## Health Check

```typescript
// app/api/health/route.ts
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("profiles").select("id").limit(1)

    if (error) throw error

    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      services: { database: "ok" },
    })
  } catch {
    return Response.json(
      { status: "error", timestamp: new Date().toISOString() },
      { status: 503 }
    )
  }
}
```

## Web Vitals

| Métrique | Cible | Impact |
|----------|-------|--------|
| LCP (Largest Contentful Paint) | < 2.5s | Vitesse perçue |
| FID / INP (Interaction to Next Paint) | < 200ms | Réactivité |
| CLS (Cumulative Layout Shift) | < 0.1 | Stabilité visuelle |
| TTFB (Time to First Byte) | < 800ms | Performance serveur |
