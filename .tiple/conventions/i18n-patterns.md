# Internationalization (i18n) Patterns

> Tag : `i18n`
> Lire ce fichier si l'app doit supporter plusieurs langues.

## Stack recommandée

- **next-intl** — intégration native App Router, Server Components, typesafe
- Alternative : `react-i18next` si déjà dans l'écosystème

## Setup (next-intl)

```
src/
├── i18n/
│   ├── request.ts        # Config pour Server Components
│   └── routing.ts        # Config routing (locale dans l'URL)
├── messages/
│   ├── fr.json           # Traductions françaises
│   └── en.json           # Traductions anglaises
```

### Structure des fichiers de traduction
```json
// messages/fr.json
{
  "common": {
    "save": "Sauvegarder",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "loading": "Chargement...",
    "error": "Une erreur est survenue"
  },
  "auth": {
    "login": "Se connecter",
    "logout": "Se déconnecter",
    "email": "Adresse email",
    "password": "Mot de passe"
  },
  "projects": {
    "title": "Mes projets",
    "empty": "Aucun projet. Créez-en un !",
    "create": "Créer un projet",
    "deleteConfirm": "Supprimer « {name} » ? Cette action est irréversible."
  }
}
```

### Naming conventions pour les clés
| Pattern | Exemple | Usage |
|---------|---------|-------|
| `namespace.key` | `auth.login` | Traduction simple |
| `namespace.key` avec `{var}` | `projects.deleteConfirm` | Interpolation |
| `namespace.key_plural` | `items.count` | Pluralisation (géré par la lib) |

## Usage

### Server Components
```tsx
import { useTranslations } from "next-intl"

export default function ProjectsPage() {
  const t = useTranslations("projects")
  return <h1>{t("title")}</h1>
}
```

### Client Components
```tsx
"use client"
import { useTranslations } from "next-intl"

export function DeleteButton({ name }: { name: string }) {
  const t = useTranslations("projects")
  return <span>{t("deleteConfirm", { name })}</span>
}
```

## Règles

- **Pas de texte en dur dans le JSX** — toujours une clé de traduction
- **Les clés sont en anglais** (snake_case ou camelCase, cohérent)
- **Un namespace par domaine** (auth, projects, common)
- **Les messages d'erreur** sont aussi traduits
- **Les dates, nombres, devises** utilisent `Intl` (voir `datetime-patterns.md`)
