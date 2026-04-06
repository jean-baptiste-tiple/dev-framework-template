# Component Registry

> Derniere MAJ : 2026-04-06
> VERIFIER ce fichier AVANT de creer un composant/hook/util.

## UI Components (Shadcn/ui — installes)

| Composant | Path | Notes |
|-----------|------|-------|
| Accordion | `src/components/ui/accordion.tsx` | Radix, animation chevron |
| Alert | `src/components/ui/alert.tsx` | default, destructive |
| AlertDialog | `src/components/ui/alert-dialog.tsx` | Confirmation modale |
| Avatar | `src/components/ui/avatar.tsx` | Image + fallback initiales |
| Badge | `src/components/ui/badge.tsx` | 6 variants (default, secondary, destructive, outline, success, warning) |
| Breadcrumb | `src/components/ui/breadcrumb.tsx` | Fil d'ariane avec separateurs |
| Button | `src/components/ui/button.tsx` | 6 variants, 4 sizes, asChild |
| Calendar | `src/components/ui/calendar.tsx` | react-day-picker v9 |
| Card | `src/components/ui/card.tsx` | Header, Title, Description, Content, Footer |
| Checkbox | `src/components/ui/checkbox.tsx` | Radix Checkbox |
| Command | `src/components/ui/command.tsx` | Palette de commandes (cmdk) |
| Dialog | `src/components/ui/dialog.tsx` | Modal Radix |
| DropdownMenu | `src/components/ui/dropdown-menu.tsx` | Menu contextuel complet |
| Form | `src/components/ui/form.tsx` | Integration react-hook-form |
| Input | `src/components/ui/input.tsx` | Focus ring violet |
| Label | `src/components/ui/label.tsx` | Radix Label |
| Popover | `src/components/ui/popover.tsx` | Contenu flottant |
| Progress | `src/components/ui/progress.tsx` | Barre de progression |
| RadioGroup | `src/components/ui/radio-group.tsx` | Radix RadioGroup |
| ScrollArea | `src/components/ui/scroll-area.tsx` | Zone scrollable custom |
| Select | `src/components/ui/select.tsx` | Radix Select |
| Separator | `src/components/ui/separator.tsx` | Horizontal/vertical |
| Sheet | `src/components/ui/sheet.tsx` | Panneau lateral (4 directions) |
| Skeleton | `src/components/ui/skeleton.tsx` | Placeholder anime |
| Slider | `src/components/ui/slider.tsx` | Range input |
| Sonner | `src/components/ui/sonner.tsx` | Toast notifications |
| Spinner | `src/components/ui/spinner.tsx` | SVG anime, 3 tailles |
| Switch | `src/components/ui/switch.tsx` | Toggle on/off |
| Table | `src/components/ui/table.tsx` | Wrappers HTML table |
| Tabs | `src/components/ui/tabs.tsx` | Navigation par onglets |
| Textarea | `src/components/ui/textarea.tsx` | Champ multi-lignes |
| Toggle | `src/components/ui/toggle.tsx` | Bouton toggle |
| ToggleGroup | `src/components/ui/toggle-group.tsx` | Groupe de toggles |
| Tooltip | `src/components/ui/tooltip.tsx` | Info-bulle |

## Composants metier partages

| Composant | Path | Props cles | Notes |
|-----------|------|------------|-------|
| ThemeProvider | `src/components/theme-provider.tsx` | children, attribute, defaultTheme | Provider next-themes (client) |
| ThemeToggle | `src/components/theme-toggle.tsx` | — | Bouton toggle light/dark (client) |
| PageContainer | `src/components/page-container.tsx` | heading?, description?, children | Wrapper page max-w-7xl |
| EmptyState | `src/components/empty-state.tsx` | icon?, heading, description?, action? | Etat vide (listes, tables) |
| StatCard | `src/components/stat-card.tsx` | label, value, description?, icon?, trend? | KPI card pour dashboards |
| DataTable | `src/components/data-table.tsx` | columns, data, emptyMessage? | Table generique typee |

## Hooks

| Hook | Path | Retourne | Notes |
|------|------|----------|-------|
<!-- Ajouter ici chaque hook custom cree -->

## Server Actions

| Action | Path | Input -> Output | Notes |
|--------|------|-----------------|-------|
<!-- Ajouter ici chaque Server Action creee -->

## Shared Schemas (Zod)

| Schema | Path | Champs cles | Utilise par |
|--------|------|-------------|-------------|
<!-- Ajouter ici chaque schema Zod partage front/back -->

## Utils

| Util | Path | Usage |
|------|------|-------|
| cn | src/lib/utils/cn.ts | Merge Tailwind classes (clsx + tailwind-merge) |

## Types partages

| Type | Path | Usage |
|------|------|-------|
| Database | src/types/database.ts | Types auto-generes Supabase (npx supabase gen types) |
