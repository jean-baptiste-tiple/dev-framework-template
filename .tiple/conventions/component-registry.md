# Component Registry

> Dernière MAJ : init
> VÉRIFIER ce fichier AVANT de créer un composant/hook/util.
> Si un composant similaire existe déjà, le réutiliser ou l'enrichir.

## UI Components (Shadcn/ui — installés à la demande)

| Composant | Path | Notes |
|-----------|------|-------|
<!-- Les composants Shadcn sont ajoutés via `npx shadcn@latest add [nom]`.
     Lister ici ceux qui ont été installés dans le projet.
     Ex: | Button | src/components/ui/button.tsx | Variantes: default, destructive, outline, ghost | -->

## Composants métier partagés

| Composant | Path | Props clés | Notes |
|-----------|------|------------|-------|
<!-- Ajouter ici chaque composant métier réutilisable créé.
     Ex: | PageHeader | src/components/shared/page-header.tsx | title, description?, action? | Utilisé dans toutes les pages dashboard | -->

## Hooks

| Hook | Path | Retourne | Notes |
|------|------|----------|-------|
<!-- Ajouter ici chaque hook custom créé.
     Ex: | useDebounce | src/hooks/use-debounce.ts | T (valeur debouncée) | Délai configurable, 300ms par défaut | -->

## Server Actions

| Action | Path | Input → Output | Notes |
|--------|------|-----------------|-------|
<!-- Ajouter ici chaque Server Action créée.
     Ex: | createProjectAction | src/lib/actions/projects.ts | FormData → ActionResult<Project> | Valide avec createProjectSchema | -->

## Shared Schemas (Zod)

| Schema | Path | Champs clés | Utilisé par |
|--------|------|-------------|-------------|
<!-- Ajouter ici chaque schema Zod partagé front/back.
     Ex: | createProjectSchema | src/lib/schemas/project.ts | name (string, 1-100), description? | CreateProjectForm + createProjectAction | -->

## Utils

| Util | Path | Usage |
|------|------|-------|
| cn | src/lib/utils/cn.ts | Merge Tailwind classes (clsx + tailwind-merge) |
<!-- Ajouter les autres utils ici.
     Ex: | formatDate | src/lib/utils/format.ts | Formate une date ISO en "DD/MM/YYYY" | -->

## Types partagés

| Type | Path | Usage |
|------|------|-------|
| Database | src/types/database.ts | Types auto-générés Supabase (`pnpm db:types`) |
<!-- Ajouter les types métier custom ici.
     Ex: | Project | src/types/index.ts | Type enrichi avec relations | -->
