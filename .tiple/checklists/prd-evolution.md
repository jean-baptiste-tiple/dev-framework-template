# PRD Evolution — Checklist quand les specs changent

> Passer point par point quand le PRD est modifié.

## Identification du changement

- [ ] La section modifiée du PRD est identifiée et passée en statut 🔶 Draft
- [ ] Le type de changement est clair : ajout, modification, suppression
- [ ] La raison du changement est documentée

## Impact cascade

### Architecture
- [ ] Les invariants d'architecture sont-ils impactés ? (si oui → ADR obligatoire)
- [ ] La structure du projet (`src/`) doit-elle évoluer ?
- [ ] Le modèle de données (tables, relations) est-il impacté ?
- [ ] De nouvelles migrations DB sont-elles nécessaires ?
- [ ] Les RLS policies doivent-elles être mises à jour ?

### Epics & Stories
- [ ] Des epics existantes sont-elles impactées ? (mettre à jour les fichiers)
- [ ] Des stories existantes sont-elles invalidées ou doivent-elles être modifiées ?
- [ ] De nouvelles stories doivent-elles être créées ?
- [ ] L'ordre de priorité des epics change-t-il ?

### Design
- [ ] Des maquettes existantes doivent-elles être mises à jour ?
- [ ] De nouvelles maquettes sont-elles nécessaires ?
- [ ] Le design system est-il impacté ?

### Code existant
- [ ] Du code déjà implémenté doit-il être modifié ? (créer des stories de refacto)
- [ ] Des tests existants doivent-ils être mis à jour ?

## Compatibility check

- [ ] Le changement est-il rétrocompatible avec le code existant ?
- [ ] Les données existantes en base sont-elles compatibles ? (migration de données ?)
- [ ] Les utilisateurs existants sont-ils impactés ?

## Traçabilité

- [ ] `docs/architecture.md` est mis à jour (si impacté)
- [ ] Les epics impactées sont mises à jour
- [ ] Les stories impactées sont mises à jour ou créées
- [ ] Une entrée est ajoutée dans `docs/changelog.md`
- [ ] La section modifiée du PRD est repassée en ✅ Validé après review
