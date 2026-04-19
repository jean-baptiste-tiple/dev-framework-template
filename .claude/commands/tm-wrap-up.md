---
description: "Capturer les apprentissages de la session (conventions, ADR, registry)"
argument-hint: "[scope optionnel]"
---

# /tm-wrap-up — Capturer les apprentissages de la session

> **Quand utiliser :** après un gros chantier (feature complète, fix non-trivial, refacto), avant ou après `/commit-push`, ou quand Claude le propose.
>
> **Différent de `/commit-push`** (qui fait les checks + commit) : `/tm-wrap-up` capture les **apprentissages méta** du projet — les patterns, gotchas et décisions qui ne sont pas évidents en lisant le code.

## Principe

Le code et le changelog disent **ce qu'on a fait**. `/tm-wrap-up` capture **ce qu'on a appris** — les règles implicites, les pièges rencontrés, les décisions d'archi.

Ne capture que ce qui va **revenir**. Si c'est un one-off qui n'est pas près de se reproduire → ne pas capturer.

---

## Phase 1 — Réflexion

Répondre mentalement à 3 questions sur la session qui se termine :

1. **Quel contexte manquait ?** — Commandes découvertes, quirks de config, gotchas rencontrés, docs incomplètes
2. **Quels patterns ont marché ?** — Approches testées, décisions de style, workflows qui ont émergé
3. **Qu'est-ce qui aiderait une session vierge ?** — Connaissance non-évidente qui ne se déduit pas du code

Ignorer ce qui est déjà évident en lisant le code ou le changelog.

---

## Phase 2 — Identifier les candidats

Parcourir le diff + la conversation, mapper chaque apprentissage vers son lieu de capture :

| Type d'apprentissage | Destination |
|---|---|
| Nouvelle règle / invariant technique | `.tiple/conventions/<tag>.md` (section Règles) |
| Décision d'architecture non-triviale | Nouveau ADR dans `docs/decisions/` |
| Gotcha / config / commande projet-spécifique | `CLAUDE.md` (section appropriée) |
| Composant/hook/util réutilisable créé | `.tiple/conventions/component-registry.md` |
| Pattern récurrent propre au projet | `.tiple/conventions/<tag>.md` ou nouvelle section |
| Story/bug découvert pendant la session | `docs/stories/` ou `.tiple/sprint/status.md` |

**Règles de sélection :**
- Une seule occurrence = pas encore un pattern. Attendre 2+ avant de promouvoir en convention.
- Si un skill shim existe (`.claude/skills/<tag>/`), les invariants ajoutés au fichier source remontent automatiquement (pas de duplication à faire).
- Préférer **mettre à jour un fichier existant** plutôt que d'en créer un nouveau.

---

## Phase 3 — Proposer à l'utilisateur

**NE PAS ÉCRIRE DIRECTEMENT.** Présenter un récap structuré :

```
## Apprentissages de la session

**Candidats à capturer :**

1. [CONVENTION] `.tiple/conventions/api-patterns.md` — Ajouter section "Error handling"
   → Pourquoi : découvert que Supabase error codes doivent être mappés à des messages user

2. [ADR] `docs/decisions/adr-004-rls-soft-delete.md` — Nouvelle décision
   → Pourquoi : on a choisi soft delete via `deleted_at` plutôt que hard delete, impact RLS

3. [REGISTRY] `.tiple/conventions/component-registry.md` — Ajouter `<ConfirmDialog>`
   → Pourquoi : nouveau composant utilisé 3× cette session

**Rejetés (ne revient pas) :**
- Fix de typo dans la migration → one-off
- Nom de variable mal choisi → déjà fixé
```

Attendre la validation utilisateur avant d'écrire.

---

## Phase 4 — Application (après validation)

Pour chaque candidat validé :
- Éditer le fichier cible (prefer Edit > Write)
- Si création d'un ADR : utiliser `.tiple/templates/adr.tmpl.md`
- Signaler chaque fichier modifié

---

## Phase 5 — Résumé

Afficher :

```
✅ Apprentissages capturés :
- Modifié : .tiple/conventions/api-patterns.md
- Créé : docs/decisions/adr-004-rls-soft-delete.md
- Modifié : .tiple/conventions/component-registry.md

⏭️ Non retenu : 2 items (one-off, pas de valeur future)
```

Ou si rien à capturer :

```
✅ Rien de méta à capturer cette session — le code et le changelog suffisent.
```

---

## Règles

1. **Ne JAMAIS écrire sans validation utilisateur** — toujours proposer d'abord
2. **Ne pas capturer le one-off** — attendre 2+ occurrences avant de promouvoir une règle
3. **Privilégier l'update** d'un fichier existant à la création d'un nouveau
4. **Ne pas doublonner** — si l'info existe déjà dans `.tiple/` ou `CLAUDE.md`, ne pas la redire
5. **Scope-aware** — si `$ARGUMENTS` est fourni (ex: `/tm-wrap-up auth`), limiter la réflexion à ce scope
6. **Pas de remplissage** — mieux vaut 0 capture qu'un faux positif qui pollue les conventions
