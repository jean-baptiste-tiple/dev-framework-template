# Component Registry

> Dernière MAJ : [date init]
> VÉRIFIER ce fichier AVANT de créer un composant/hook/util.

## UI Components (Shadcn/ui — installés à la demande)

| Composant | Path | Notes |
|-----------|------|-------|
<!-- Les composants Shadcn sont ajoutés via `npx shadcn@latest add [nom]`.
     Lister ici ceux qui ont été installés dans le projet. -->

## Composants métier partagés

| Composant | Path | Props clés | Notes |
|-----------|------|------------|-------|
<!-- Ajouter ici chaque composant métier réutilisable créé -->

## Hooks

| Hook | Path | Retourne | Notes |
|------|------|----------|-------|
<!-- Ajouter ici chaque hook custom créé -->

## Server Actions

| Action | Path | Input → Output | Notes |
|--------|------|-----------------|-------|
<!-- Ajouter ici chaque Server Action créée -->

## Shared Schemas (Zod)

| Schema | Path | Champs clés | Utilisé par |
|--------|------|-------------|-------------|
<!-- Ajouter ici chaque schema Zod partagé front/back -->

## Utils

| Util | Path | Usage |
|------|------|-------|
| cn | src/lib/utils/cn.ts | Merge Tailwind classes (clsx + tailwind-merge) |
<!-- Ajouter les autres utils ici -->

## Types partagés

| Type | Path | Usage |
|------|------|-------|
| Database | src/types/database.ts | Types auto-générés Supabase (npx supabase gen types) |
<!-- Ajouter les types métier custom ici -->
