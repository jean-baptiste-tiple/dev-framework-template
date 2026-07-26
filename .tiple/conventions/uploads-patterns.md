# Uploads Patterns — fichiers et images

> Policies Storage, URL signées et buckets : `supabase-patterns.md § Supabase Storage`.

## La limite de 1 Mo décide de l'architecture

Next.js 15 plafonne le corps d'une Server Action à **1 Mo** par défaut. Au-delà, l'appel
échoue avec « Body exceeded 1 MB limit » **avant** d'atteindre la moindre validation.

| Taille | Chemin |
|--------|--------|
| ≤ 1 Mo (avatar, pièce jointe légère) | Server Action classique, `FormData` |
| > 1 Mo (documents, vidéos, images non compressées) | **URL signée** : l'action délivre l'URL, le client uploade directement au storage |

Relever `serverActions.bodySizeLimit` dans `next.config.ts` est possible mais reste borné par
la plateforme (Vercel coupe à 4,5 Mo) : ce n'est pas une solution pour de gros fichiers.

## Validation — côté serveur, toujours

```typescript
const fileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size > 0, "Fichier vide")
    .refine((f) => f.size <= 1024 * 1024, "Max 1 Mo")
    .refine(
      (f) => ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(f.type),
      "Format non supporté"
    ),
})
```

**`file.type` vient du client : il est falsifiable.** Pour un contenu sensible, vérifier les
magic bytes côté serveur, ou servir le fichier avec `Content-Disposition: attachment` et un
`Content-Type` forcé. Ne jamais servir un upload utilisateur en `text/html` depuis le domaine
de l'application.

## Nommage du chemin

```typescript
// Le préfixe de dossier vaut auth.uid() : c'est lui qui porte l'isolation RLS.
// Le nom d'origine n'est JAMAIS repris dans le chemin (traversal, collisions, encodage).
const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "bin"
const path = `${user.id}/${crypto.randomUUID()}.${ext}`
```

Conserver le nom d'origine en métadonnée (colonne `original_name`), pas dans le chemin.

## Côté composant

- **Progression** : un upload > 1 Mo sans indicateur de progression est perçu comme figé.
  L'URL signée permet un `XMLHttpRequest` avec `upload.onprogress` ; `fetch` ne l'expose pas.
- **Preview** : `URL.createObjectURL(file)` avant l'envoi, avec `URL.revokeObjectURL` au
  démontage — sinon fuite mémoire.
- **Drag & drop** : la zone est aussi un `<input type="file">` accessible au clavier. Une zone
  de drop sans input est un défaut a11y.
- **Annulation** : tout upload long expose un bouton annuler (`AbortController`).
- Afficher la limite de taille et les formats acceptés **avant** la sélection, pas en erreur après.

## Règles

- **Vérifiable :** aucune Server Action ne reçoit un `File` sans schéma Zod validant taille ET type.
- **Vérifiable :** aucun chemin de storage ne contient `file.name` brut.
- Un fichier orphelin (uploadé puis échec de l'insertion en base) doit être supprimé : uploader
  **après** la validation métier, ou prévoir un nettoyage.
- Les images affichées passent par `next/image` avec `width`/`height` ou `fill`+`sizes`.
