# Feedback Patterns — Toasts, Dialogs, Notifications

> Tag : `feedback`
> Lire ce fichier pour toute story avec des retours utilisateur (succès, erreurs, confirmations).

## Quand utiliser quoi

| Pattern | Quand | Exemple |
|---------|-------|---------|
| **Toast** | Action réussie/échouée, notification temporaire | "Projet créé", "Erreur de sauvegarde" |
| **Inline error** | Erreur de validation dans un formulaire | Champ email en rouge |
| **Alert banner** | Information persistante, avertissement | "Votre essai expire dans 3 jours" |
| **Dialog** | Confirmation avant action destructive | "Supprimer ce projet ?" |
| **Empty state** | Aucune donnée à afficher | "Aucun projet. Créez-en un !" |
| **Skeleton** | Chargement de données | Placeholder animé |

## Toasts

### Setup (avec Sonner — recommandé avec Shadcn)
```tsx
// app/layout.tsx
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
```

### Usage dans les Client Components
```tsx
"use client"
import { toast } from "sonner"

function handleSubmit(result: ActionResult<void>) {
  if (result.error) {
    toast.error(result.error)
  } else {
    toast.success("Projet créé avec succès")
  }
}
```

### Variantes
```typescript
toast.success("Sauvegardé")           // Vert
toast.error("Échec de la suppression") // Rouge
toast.info("Nouvelle version dispo")   // Bleu
toast.warning("Action irréversible")   // Orange
toast.loading("Envoi en cours...")     // Spinner
```

### Règles Toast
- **Durée :** 5 secondes par défaut, 8 secondes pour les erreurs
- **Position :** `bottom-right` (standard)
- **Max visible :** 3 toasts empilés
- **Pas de toast pour les validations de formulaire** → inline errors

## Dialogs de confirmation

```tsx
"use client"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DeleteProjectDialog({
  projectName,
  onConfirm,
}: {
  projectName: string
  onConfirm: () => Promise<void>
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">Supprimer</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer « {projectName} » ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Toutes les données associées seront supprimées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### Règles Dialogs
- **Confirmation obligatoire** pour : suppression, envoi d'email, actions irréversibles
- **Pas de confirmation** pour : sauvegarde, navigation, actions réversibles
- **Bouton destructif à droite**, annuler à gauche
- **Escape** et clic en dehors = annuler
- **Focus trap** : le focus reste dans le dialog (géré par Shadcn/Radix)

## Empty States

```tsx
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description: string
  action?: { label: string; href: string } | { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      {action && "href" in action && (
        <Link href={action.href}><Button>{action.label}</Button></Link>
      )}
      {action && "onClick" in action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}

// Usage
<EmptyState
  title="Aucun projet"
  description="Créez votre premier projet pour commencer."
  action={{ label: "Créer un projet", href: "/projects/new" }}
/>
```

## Loading States

### Les 3 niveaux
```tsx
// 1. Page entière → loading.tsx (Suspense automatique)
// 2. Section → Suspense explicite
<Suspense fallback={<ProjectListSkeleton />}>
  <ProjectList />
</Suspense>

// 3. Bouton/action → useTransition
const [isPending, startTransition] = useTransition()
<Button disabled={isPending}>
  {isPending ? "Chargement..." : "Sauvegarder"}
</Button>
```

### Skeleton pattern
```tsx
export function ProjectCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  )
}

export function ProjectListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  )
}
```

## Inline Errors (formulaires)

```tsx
// Géré automatiquement par React Hook Form + Zod
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} type="email" />
      </FormControl>
      <FormMessage /> {/* Affiche l'erreur Zod automatiquement */}
    </FormItem>
  )}
/>
```

## Erreur globale (Server Action)

```tsx
{form.formState.errors.root && (
  <Alert variant="destructive">
    <AlertDescription>
      {form.formState.errors.root.message}
    </AlertDescription>
  </Alert>
)}
```
