# Design System — Violet Corporate SaaS

> Preview interactive : `/design-system` (route Next.js)

## Identité visuelle

- **Couleur primaire :** Violet profond corporate (oklch 0.42 0.2 285 ~ #6C2BD9)
- **Font :** Inter (Google Fonts)
- **Style :** Clean, corporate, moderne
- **Dark mode :** Oui (class-based, toggle ou system)

## Tokens

### Couleurs

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--primary` | oklch(0.42 0.2 285) | oklch(0.6 0.2 285) | CTA, liens, actions principales |
| `--primary-foreground` | oklch(0.98 0.005 285) | oklch(0.13 0.02 285) | Texte sur primary |
| `--secondary` | oklch(0.94 0.02 285) | oklch(0.22 0.03 285) | Boutons secondaires, badges |
| `--muted` | oklch(0.95 0.01 285) | oklch(0.2 0.02 285) | Fonds neutres, zones inactives |
| `--accent` | oklch(0.92 0.04 285) | oklch(0.25 0.05 285) | Hover, sélection, surbrillance |
| `--destructive` | oklch(0.55 0.2 25) | oklch(0.55 0.2 25) | Erreurs, actions irréversibles |
| `--success` | oklch(0.55 0.18 155) | oklch(0.55 0.18 155) | Succès, validations |
| `--warning` | oklch(0.7 0.16 75) | oklch(0.7 0.16 75) | Avertissements |
| `--card` | oklch(1 0 0) | oklch(0.18 0.02 285) | Fond des cards |
| `--popover` | oklch(1 0 0) | oklch(0.18 0.02 285) | Fond des popovers/dropdowns |
| `--border` | oklch(0.9 0.01 285) | oklch(0.26 0.03 285) | Bordures |
| `--input` | oklch(0.88 0.015 285) | oklch(0.26 0.03 285) | Bordure des inputs |
| `--ring` | = primary | = primary | Focus ring |

#### Couleurs Sidebar

| Token | Usage |
|-------|-------|
| `--sidebar` | Fond du sidebar |
| `--sidebar-foreground` | Texte du sidebar |
| `--sidebar-accent` | Hover/actif dans le sidebar |
| `--sidebar-border` | Bordures du sidebar |

#### Couleurs Charts (5 niveaux)

`--chart-1` à `--chart-5` — palette dégradée violet → teal pour graphiques.

### Typographie

| Style | Classes Tailwind | Usage |
|-------|------------------|-------|
| H1 | `text-4xl font-bold tracking-tight` | Titres de page |
| H2 | `text-3xl font-semibold tracking-tight` | Sections |
| H3 | `text-2xl font-semibold tracking-tight` | Sous-sections |
| H4 | `text-xl font-medium` | Sous-titres |
| Body | `text-base leading-7` | Corps de texte |
| Small | `text-sm text-muted-foreground` | Descriptions, labels |
| Caption | `text-xs text-muted-foreground` | Métadonnées, timestamps |
| Font | Inter (`next/font/google`) | Tout le texte |

### Spacing

Utilise l'échelle Tailwind standard (multiples de 4px) :

| Token | Valeur | Tailwind |
|-------|--------|----------|
| space-1 | 4px | `p-1`, `gap-1` |
| space-2 | 8px | `p-2`, `gap-2` |
| space-3 | 12px | `p-3`, `gap-3` |
| space-4 | 16px | `p-4`, `gap-4` |
| space-6 | 24px | `p-6`, `gap-6` |
| space-8 | 32px | `p-8`, `gap-8` |
| space-10 | 40px | `p-10`, `gap-10` |
| space-12 | 48px | `p-12`, `gap-12` |

### Radius

| Token | Valeur | Tailwind | Usage |
|-------|--------|----------|-------|
| `--radius` | 0.625rem (10px) | `rounded-lg` | Valeur de base |
| sm | radius - 4px | `rounded-sm` | Badges, tags |
| md | radius - 2px | `rounded-md` | Inputs, boutons |
| lg | radius | `rounded-lg` | Cards, modals |
| xl | radius + 4px | `rounded-xl` | Panels larges |
| full | 9999px | `rounded-full` | Avatars, pills |

### Shadows

Utilise les shadows Tailwind standards :

| Classe | Usage |
|--------|-------|
| `shadow-sm` | Boutons, badges |
| `shadow` | Cards surélevées |
| `shadow-md` | Dropdowns, popovers |
| `shadow-lg` | Modals, sheets |

### Breakpoints

| Nom | Valeur | Usage |
|-----|--------|-------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablette |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |

## Composants UI (Shadcn/ui)

Tous installés dans `src/components/ui/`. Style **new-york**.

### Formulaires
| Composant | Fichier | Notes |
|-----------|---------|-------|
| Button | `button.tsx` | 6 variants (default, secondary, destructive, outline, ghost, link), 4 sizes |
| Input | `input.tsx` | Focus ring violet |
| Textarea | `textarea.tsx` | Multi-lignes |
| Select | `select.tsx` | Radix Select complet |
| Checkbox | `checkbox.tsx` | Radix Checkbox |
| Switch | `switch.tsx` | Radix Switch |
| RadioGroup | `radio-group.tsx` | Radix RadioGroup |
| Label | `label.tsx` | Radix Label |
| Form | `form.tsx` | Intégration react-hook-form |
| Slider | `slider.tsx` | Range input stylisé |
| Calendar | `calendar.tsx` | react-day-picker v9 |

### Layout & Navigation
| Composant | Fichier | Notes |
|-----------|---------|-------|
| Card | `card.tsx` | Header, Title, Description, Content, Footer |
| Separator | `separator.tsx` | Horizontal/vertical |
| Tabs | `tabs.tsx` | Radix Tabs |
| Accordion | `accordion.tsx` | Radix Accordion, animation chevron |
| Breadcrumb | `breadcrumb.tsx` | Navigation fil d'ariane |
| ScrollArea | `scroll-area.tsx` | Radix ScrollArea |

### Feedback
| Composant | Fichier | Notes |
|-----------|---------|-------|
| Badge | `badge.tsx` | 6 variants (default, secondary, destructive, outline, success, warning) |
| Alert | `alert.tsx` | Default + destructive |
| Progress | `progress.tsx` | Barre animée, couleur primary |
| Skeleton | `skeleton.tsx` | Pulse animation |
| Spinner | `spinner.tsx` | SVG animé, 3 tailles |
| Sonner | `sonner.tsx` | Toast notifications (thème-aware) |

### Overlays
| Composant | Fichier | Notes |
|-----------|---------|-------|
| Dialog | `dialog.tsx` | Radix Dialog modal |
| AlertDialog | `alert-dialog.tsx` | Confirmation destructive |
| Sheet | `sheet.tsx` | Panneau latéral (4 directions) |
| DropdownMenu | `dropdown-menu.tsx` | Radix DropdownMenu complet |
| Popover | `popover.tsx` | Radix Popover |
| Tooltip | `tooltip.tsx` | Radix Tooltip |
| Command | `command.tsx` | Palette de commandes (cmdk) |

### Data Display
| Composant | Fichier | Notes |
|-----------|---------|-------|
| Table | `table.tsx` | HTML table wrappers stylisés |
| Avatar | `avatar.tsx` | Radix Avatar avec fallback |
| Toggle | `toggle.tsx` | Bouton toggle |
| ToggleGroup | `toggle-group.tsx` | Groupe de toggles |

## Composants métier réutilisables

Dans `src/components/` (hors `ui/`) :

| Composant | Fichier | Props | Usage |
|-----------|---------|-------|-------|
| ThemeProvider | `theme-provider.tsx` | children, attribute, defaultTheme | Provider next-themes |
| ThemeToggle | `theme-toggle.tsx` | — | Bouton toggle light/dark |
| PageContainer | `page-container.tsx` | heading?, description?, children | Wrapper de page avec max-width |
| EmptyState | `empty-state.tsx` | icon?, heading, description?, action? | État vide (listes, tables) |
| StatCard | `stat-card.tsx` | label, value, description?, icon?, trend? | KPI dashboard |
| DataTable | `data-table.tsx` | columns, data, emptyMessage? | Table de données générique |

## Patterns UI récurrents

### Page standard
```tsx
<PageContainer heading="Titre" description="Description">
  {/* contenu */}
</PageContainer>
```

### Dashboard avec stats
```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <StatCard label="..." value="..." trend={{...}} icon={...} />
</div>
```

### Liste avec empty state
```tsx
{data.length === 0 ? (
  <EmptyState heading="..." action={<Button>Ajouter</Button>} />
) : (
  <DataTable columns={...} data={data} />
)}
```

### Formulaire avec validation
```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField control={form.control} name="..." render={({field}) => (
      <FormItem>
        <FormLabel>...</FormLabel>
        <FormControl><Input {...field} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  </form>
</Form>
```
