# Renommage : `.tiple/` → `.method/`, et suppression du préfixe `tm-`

> **Mode d'emploi.** Prompt à coller dans une session Claude Code ouverte sur un projet **déjà
> migré en v2** mais dont le dossier de méthode s'appelle encore `.tiple/`.
>
> Si le projet n'est pas encore en v2, ne pas utiliser ce document : `docs/migration-v2.md`
> contient déjà le renommage (lot A) et fait tout en une passe.
>
> Avant de coller : branche dédiée (`git checkout -b chore/renommage-method`) et arbre propre.

---

Tu vas renommer le dossier de méthode de ce projet et purger le nom commercial du framework.
C'est un renommage **mécanique** : aucune règle, aucun comportement, aucun workflow ne change.

## Ce qui change exactement

| Avant | Après |
|---|---|
| dossier `.tiple/` | `.method/` |
| skill `tm-dev` | `dev` |
| skill `tm-plan` | `plan` |
| skill `tm-review` | **`revue`** |
| skill `tm-verify` | `verify` |
| skill `tm-wrap-up` | `wrap-up` |
| marqueur d'échappement du gate ` # tiple-gate-ok` | ` # checks-ok` |
| variable d'env `TIPLE_RECEIPT_PATH` | `VERIFY_RECEIPT_PATH` |
| `"name": "tiple-method-template"` dans `package.json` | le vrai nom du projet |
| « Tiple Method » en prose | « le framework » / « la méthode » |

Le nom reste dans le **README** — c'est le seul endroit où il est assumé.

**Pourquoi `revue` et pas `review` :** `/review` est une slash command intégrée à Claude Code
(et `/code-review` aussi). Un skill projet portant l'un de ces noms entre en collision. Le reste
du framework étant rédigé en français, `revue` est cohérent et sans ambiguïté.

## Étape 1 — État des lieux (lecture seule)

```
git status --short
ls -a | head -20
grep -rli "tiple" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next .
```

Vérifie et **affiche** :
- le dossier s'appelle-t-il bien `.tiple/` ? (s'il est déjà en `.method/`, arrête-toi : rien à faire)
- l'arbre est-il propre ? (sinon, demande-moi de commiter ou stasher avant)
- combien de fichiers contiennent le terme ?

## Étape 2 — Renommer le dossier

```
git mv .tiple .method
```

`git mv` préserve l'historique des fichiers. Ne pas faire `mv` + `git add` : git perdrait le
suivi de renommage sur certains fichiers.

## Étape 3 — Renommer les skills

```
cd .claude/skills
git mv tm-dev dev && git mv tm-plan plan && git mv tm-review revue
git mv tm-verify verify && git mv tm-wrap-up wrap-up
```

Puis, dans chaque `SKILL.md` renommé, mettre à jour le champ **`name:`** du frontmatter — il doit
être identique au nom du dossier, sinon `check:framework` échoue.

## Étape 4 — Remplacer les références

Applique ces remplacements sur **tous les fichiers versionnés** (`git ls-files`), en excluant
`pnpm-lock.yaml` et les binaires :

**Partout, README compris** — un chemin faux casse le routing :
- `.tiple/` → `.method/`
- `` `.tiple` `` → `` `.method` ``
- `tm-dev` → `dev` · `tm-plan` → `plan` · `tm-review` → `revue` · `tm-verify` → `verify` · `tm-wrap-up` → `wrap-up`
- `tm-fix` et `tm-feature` (skills supprimés en v2, mentions résiduelles possibles) → `dev`
- `tiple-gate-ok` → `checks-ok`
- `TIPLE_RECEIPT_PATH` → `VERIFY_RECEIPT_PATH`
- `tiple-method-template` → le nom réel du projet (regarde `package.json` et le nom du dépôt)

`tm-dev` et consorts sont des **tokens uniques** : les remplacer ne peut pas abîmer de prose.
Trier du plus long au plus court avant de remplacer, et remplacer `tm-wrap-up` avant tout motif
plus court qui en serait un préfixe.

**Partout SAUF `README.md`** — la prose :
- « Tiple Method » → « le framework » ou « la méthode » selon la phrase
- « la Tiple Method » → « le framework »
- toute occurrence isolée de « Tiple »

Fais-le par script plutôt qu'à la main : `git ls-files` + un remplacement regex, puis affiche la
liste des fichiers touchés. Un `sed -i` global sur le dépôt est acceptable ici — c'est un
renommage, pas une réécriture.

### Points d'attention — les regex

Trois fichiers contiennent `.tiple` **à l'intérieur d'expressions régulières**, où le point est
échappé. Un remplacement naïf de `.tiple/` les rate :

- `scripts/check-framework.mjs` — le motif qui valide les chemins cités dans `CLAUDE.md` et
  `README.md` : `/`((?:\.tiple|\.claude|docs|src|scripts|tests)\/...)`/`
- `scripts/verify-receipt.mjs` — la liste `EXCLUS` : `/^\.tiple\/sprint\//`
- `.claude/hooks/enforce-git-gate.mjs` — la constante `MARKER` et les messages de blocage

Vérifie explicitement ces trois fichiers après le remplacement.

## Étape 5 — Ce qu'il ne faut PAS renommer

- **`.claude/`** — imposé par Claude Code.
- **`commit-push` et `conventions`** — déjà sans préfixe, ne pas y toucher.
- **Le nom du dépôt GitHub et de son propriétaire** — même s'il contient le terme, c'est une URL.
- **Le code métier, les stories, le PRD, les ADR** — sauf pour les chemins et les slash commands qu'ils citent.

Attention aussi à `scripts/check-framework.mjs` : il porte une liste `SLASH_OBSOLETES` des noms
de skills disparus, qui doit **conserver** les anciens noms `tm-*`. C'est elle qui détecte une
référence oubliée dans la doc — la vider reviendrait à désactiver le filet juste après l'avoir
tendu.

## Étape 6 — Vérification

```
pnpm verify
pnpm build
grep -rn "tiple" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next .
```

Le `grep` final ne doit remonter que le README, l'URL du dépôt, et les faux positifs du mot
« multiple ».

Si `check:framework` signale un **chemin cité inexistant**, c'est une référence `.tiple/` oubliée
dans `CLAUDE.md` ou `README.md`. S'il signale une **checklist orpheline** ou un **glob mort**,
c'est un chemin oublié ailleurs.

Teste le nouveau marqueur en conditions réelles :

```
git push --dry-run          # doit être BLOQUÉ
```

Puis un cycle complet `pnpm verify` → commit avec ` # checks-ok` en fin de commande.

## Étape 7 — Rapport

1. Fichiers renommés et nombre de fichiers dont le contenu a changé.
2. Les trois fichiers à regex : confirmés corrigés, un par un.
3. Sortie de `pnpm verify`, de `pnpm build` et du `grep` final.
4. Tout ce que tu as choisi de **ne pas** renommer, avec la raison.

Commite en une fois : `chore: renomme .tiple en .method et supprime le prefixe tm-`. Le renommage est mécanique et se relit
mieux d'un bloc que réparti sur plusieurs commits.
