# Cadrage complet du projet

Une seule conversation continue qui produit tous les documents de cadrage.
Pas un formulaire — un dialogue naturel.

## Process

### Phase 1 — Comprendre le problème (→ docs/brief.md)

Poser les bonnes questions :
- Quel problème résout-on ? Pour qui ? Pourquoi maintenant ?
- Qui sont les utilisateurs ? (personas avec nom/rôle/besoin/frustration)
- Quel est le scope MVP ? (IN/OUT explicites)
- Quelles contraintes ? (techniques, business, légales, RGPD)
- Comment mesure-t-on le succès ? (KPIs concrets)
- Quels risques connus ?

Quantifier la douleur : "perd 2h/semaine" > "c'est lent".

→ Générer `docs/brief.md` depuis `.tiple/templates/brief.tmpl.md`

### Phase 2 — Structurer les exigences (→ docs/prd.md)

Transformer le brief en exigences numérotées :
- FR-[DOMAINE]-[XX] : chaque exigence fonctionnelle avec ID, description, priorité MoSCoW, AC mesurables
- NFR-[XX] : exigences non-fonctionnelles (perf, sécu, accessibilité, RGPD)
- Epics avec priorités et dépendances
- Hors scope explicite

Max 60% de Must. Chaque FR doit être testable.

→ Générer `docs/prd.md` depuis `.tiple/templates/prd.tmpl.md`

### Phase 3 — Concevoir l'architecture (→ docs/architecture.md)

Définir :
- Modèle de données (tables, relations, diagramme Mermaid ER)
- RLS policies pour chaque table
- Server Actions nécessaires (par domaine)
- Points d'attention performance

Commencer simple. RLS dès le jour 1. Un schema Zod = une source de vérité.

→ Générer `docs/architecture.md` depuis `.tiple/templates/architecture.tmpl.md`

### Phase 4 — Définir le design system (→ docs/design/system.md)

Définir :
- Tokens : couleurs (palette + semantic), spacing, typography, radius, shadows
- Composants réutilisables identifiés (depuis les features du PRD)
- Patterns UI récurrents (listes, formulaires, cards, modals)
- Responsive breakpoints

Tokens d'abord, pas de couleurs en dur. Réutiliser Shadcn/ui au maximum.

→ Générer `docs/design/system.md`

### Phase 5 — Découper en stories (→ docs/epics/ + docs/stories/)

Depuis le PRD :
- Créer les epics dans `docs/epics/` depuis `.tiple/templates/epic.tmpl.md`
- Découper chaque epic en stories dans `docs/stories/` depuis `.tiple/templates/story.tmpl.md`
- Chaque story a : contexte, AC en Given/When/Then, fichiers à créer, tests attendus
- Ordonner par dépendance et priorité

Une story = un déploiement possible. Taille S/M/L, pas XL.

→ Mettre à jour `docs/epics/_index.md`

### Phase 6 — Gate de validation

Passer `.tiple/checklists/readiness-gate.md` point par point.
Vérifier la cohérence PRD ↔ architecture ↔ design ↔ stories.
Si KO : corriger avant de continuer.

→ Résumer : prêt à coder, première story à implémenter.
→ Initialiser `.tiple/sprint/status.md` via `/tm-sprint`.
