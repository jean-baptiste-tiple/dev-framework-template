# PRD Evolution Checklist

<!-- Utilisé par /tm-evolve quand le scope change.
     Identifier tous les impacts avant de modifier. -->

## Identification du changement

- [ ] Le parcours impacté du PRD est identifié
- [ ] Le changement est décrit clairement (quoi change, pourquoi)
- [ ] La priorité MoSCoW est mise à jour
- [ ] Le statut de la section est passé en 🔶 Draft

## Impact cascade

### Parcours & Design
- [ ] Le flow du parcours doit-il être modifié ?
- [ ] De nouveaux écrans sont-ils nécessaires ? (→ créer JSX dans `docs/design/screens/`)
- [ ] Des écrans JSX existants doivent-ils être mis à jour ?
- [ ] `docs/design/screens/_index.md` est-il à jour ?
- [ ] De nouveaux composants partagés sont-ils nécessaires ? (→ `docs/design/components/`)
- [ ] Le design system est-il impacté ? (nouveaux tokens, composants)

### Architecture
- [ ] Le modèle de données est-il impacté ? (nouvelles tables, colonnes, relations)
- [ ] Les Server Actions sont-elles impactées ? (nouvelles, modifiées, supprimées)
- [ ] Les RLS policies sont-elles impactées ?
- [ ] Un invariant d'architecture est-il touché ? → ADR obligatoire

### Stories
- [ ] Des stories existantes sont-elles impactées ? (AC modifiés, scope élargi)
- [ ] De nouvelles stories doivent-elles être créées ?
- [ ] Des stories existantes doivent-elles être annulées ?
- [ ] L'ordre de priorité des stories change-t-il ?

### Base de données
- [ ] Une migration SQL est-elle nécessaire ?
- [ ] Les données existantes sont-elles compatibles ? (migration de données)
- [ ] Les seeds de test doivent-elles être mises à jour ?

## Compatibility check

- [ ] Les changements sont-ils rétro-compatibles avec le code existant ?
- [ ] Les tests existants doivent-ils être modifiés ?
- [ ] Le component-registry doit-il être mis à jour ?

## Traçabilité

- [ ] Le PRD est mis à jour (parcours + FR/NFR)
- [ ] Les écrans JSX sont mis à jour ou créés
- [ ] L'architecture est mise à jour si impactée
- [ ] Les stories impactées sont mises à jour ou créées
- [ ] Le changelog est mis à jour
- [ ] Le sprint status reflète les changements
