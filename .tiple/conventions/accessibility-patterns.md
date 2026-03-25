# Accessibility Patterns (WCAG 2.1 AA)

> Tag : `a11y`
> Lire ce fichier pour toute story avec des composants UI interactifs.

## Principes

1. **Perceivable** — Le contenu est visible/audible par tous
2. **Operable** — L'interface est utilisable au clavier et à la souris
3. **Understandable** — Le contenu et la navigation sont compréhensibles
4. **Robust** — Compatible avec les technologies d'assistance

## HTML Sémantique

```tsx
// BON : structure sémantique
<header>
  <nav aria-label="Navigation principale">
    <ul>
      <li><Link href="/projects">Projets</Link></li>
    </ul>
  </nav>
</header>
<main>
  <h1>Mes projets</h1>
  <section aria-labelledby="active-projects">
    <h2 id="active-projects">Projets actifs</h2>
    {/* ... */}
  </section>
</main>
<footer>{/* ... */}</footer>

// MAUVAIS : div soup
<div className="header">
  <div className="nav">
    <div onClick={navigate}>Projets</div>
  </div>
</div>
<div className="main">
  <div className="title">Mes projets</div>
</div>
```

## Keyboard Navigation

### Ordre de focus
- L'ordre de tab suit l'ordre visuel (pas de `tabIndex > 0`)
- Tous les éléments interactifs sont focusables
- Le focus est visible (outline, ring)

```css
/* Ne JAMAIS supprimer le focus visible */
/* MAUVAIS : *:focus { outline: none; } */

/* BON : style de focus personnalisé */
.focus-visible:focus-visible {
  @apply ring-2 ring-ring ring-offset-2;
}
```

### Raccourcis clavier
| Touche | Action |
|--------|--------|
| `Tab` | Focus suivant |
| `Shift+Tab` | Focus précédent |
| `Enter` / `Space` | Activer le bouton/lien |
| `Escape` | Fermer modal/dropdown |
| `Arrow keys` | Naviguer dans les listes/menus |

### Skip link
```tsx
// app/layout.tsx — premier élément du body
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:px-4 focus:py-2"
>
  Aller au contenu principal
</a>
{/* ... */}
<main id="main-content">{children}</main>
```

## Formulaires

```tsx
// Chaque input a un label associé
<label htmlFor="email">Email</label>
<input id="email" name="email" type="email" required aria-describedby="email-error" />
{error && <p id="email-error" role="alert" className="text-destructive">{error}</p>}

// Champs obligatoires
<label htmlFor="name">
  Nom <span aria-hidden="true">*</span>
  <span className="sr-only">(obligatoire)</span>
</label>

// Groupe de champs
<fieldset>
  <legend>Adresse de livraison</legend>
  {/* champs */}
</fieldset>
```

## Images

```tsx
// Image informative — alt descriptif
<Image src="/chart.png" alt="Graphique montrant une croissance de 25% sur Q4" />

// Image décorative — alt vide
<Image src="/decoration.svg" alt="" aria-hidden="true" />

// Icône avec action — label accessible
<button aria-label="Supprimer le projet">
  <TrashIcon aria-hidden="true" />
</button>

// Icône informative — sr-only text
<span>
  <CheckIcon aria-hidden="true" />
  <span className="sr-only">Validé</span>
</span>
```

## ARIA

### Régions dynamiques (toasts, notifications)
```tsx
// Les mises à jour sont annoncées aux lecteurs d'écran
<div role="status" aria-live="polite">
  {successMessage}
</div>

<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

### États
```tsx
// Bouton loading
<button disabled={isPending} aria-busy={isPending}>
  {isPending ? "Chargement..." : "Sauvegarder"}
</button>

// Expandable
<button aria-expanded={isOpen} aria-controls="menu-content">
  Menu
</button>
<div id="menu-content" hidden={!isOpen}>
  {/* contenu */}
</div>

// Sélection
<div role="option" aria-selected={isSelected}>
  {item.name}
</div>
```

## Focus Management

### Modal
```tsx
// Shadcn/Radix gère automatiquement :
// - Focus trap (Tab reste dans la modal)
// - Focus restore (retour au trigger à la fermeture)
// - Escape pour fermer
```

### Après une action
```tsx
// Après suppression d'un item dans une liste
// → Déplacer le focus vers l'item suivant ou le titre de la liste
const nextItem = listRef.current?.querySelector("[data-index]")
nextItem?.focus()
```

## Couleurs & Contraste

| Élément | Ratio minimum | Outil de vérification |
|---------|--------------|----------------------|
| Texte normal | 4.5:1 | Lighthouse, axe |
| Grand texte (> 18px bold) | 3:1 | Lighthouse, axe |
| Éléments UI (bordures, icônes) | 3:1 | Lighthouse, axe |

**Règle :** Ne JAMAIS utiliser la couleur seule pour transmettre une information.
```tsx
// MAUVAIS : statut indiqué uniquement par la couleur
<span className="text-red-500">Erreur</span>

// BON : couleur + icône + texte
<span className="text-destructive flex items-center gap-1">
  <AlertCircle className="h-4 w-4" aria-hidden="true" />
  Erreur
</span>
```

## Testing

```bash
# Lighthouse accessibility audit
npx lighthouse http://localhost:3000 --only-categories=accessibility

# axe-core dans les tests
pnpm add -D jest-axe @axe-core/playwright
```

```typescript
// Test unitaire avec jest-axe
import { axe } from "jest-axe"

it("should have no accessibility violations", async () => {
  const { container } = render(<ProjectCard project={mockProject} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Checklist rapide

- [ ] Chaque image a un `alt` (vide si décorative)
- [ ] Chaque input a un `label` associé
- [ ] Le focus est visible sur tous les éléments interactifs
- [ ] L'app est utilisable uniquement au clavier
- [ ] Les contrastes respectent 4.5:1 (texte) et 3:1 (UI)
- [ ] Les régions dynamiques ont `role="status"` ou `role="alert"`
- [ ] Un seul `h1` par page, hiérarchie logique
- [ ] Les icônes d'action ont un `aria-label`
- [ ] `lang="fr"` sur la balise `<html>`
