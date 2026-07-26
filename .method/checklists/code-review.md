# Checklist de review — transverse uniquement

<!--
  Lue par le skill revue, APRÈS le chargement des conventions routées par globs.

  RÈGLE DE MAINTENANCE : ce fichier ne contient QUE ce qui n'appartient à aucune convention.
  Sécurité, tests, Next.js, Supabase, performance, a11y, naming, types → ces règles vivent
  dans `.method/conventions/` et sont confrontées au code directement. Les recopier ici
  créerait une seconde source de vérité qui divergerait. Ne pas le faire.
-->

## Périmètre du diff

- [ ] Chaque fichier modifié trace à la demande (story, bug rapporté, demande utilisateur)
- [ ] Aucun cleanup adjacent, reformatage opportuniste ou refacto non demandé
- [ ] Le diff ne contient pas de changement de comportement non demandé
- [ ] (si refacto) Les tests sont **identiques** avant/après — un test modifié = un comportement modifié = ce n'est plus un refacto
- [ ] (si bugfix) Un test reproduit le bug et échouait avant le fix

## Hygiène

- [ ] Pas de `console.log` / `debugger` oublié
- [ ] Pas de TODO / FIXME / HACK sans explication ni ticket
- [ ] Pas de code mort ajouté (fonction, import, variable, prop non utilisée)
- [ ] Aucun fichier sensible dans le diff (`.env`, credentials, clés, dumps)
- [ ] Pas de dépendance ajoutée sans nécessité (vérifier `package.json` dans le diff)

## Conformité à la demande

- [ ] (mode story) Tous les AC de la story sont couverts par le code livré
- [ ] (mode story) Tous les tests listés dans « Tests attendus » existent
- [ ] (mode libre) Ce qui est livré correspond à ce qui a été demandé — ni moins, ni plus
- [ ] Les hypothèses prises face à une ambiguïté sont explicitées à l'utilisateur
- [ ] (si référence UI fournie) L'écart avec la référence est documenté — **si `N/A`, ne pas pénaliser l'absence de maquette**

## Documentation de méthode

- [ ] `docs/changelog.md` mis à jour
- [ ] `.method/conventions/component-registry.md` mis à jour si nouveau composant réutilisable
- [ ] (mode story) Section « Post-implémentation » de la story remplie
- [ ] ADR créé dans `docs/decisions/` si un invariant d'architecture a été touché
- [ ] Si une règle a dû être inventée pendant l'implémentation → la signaler (candidate à `wrap-up`), ne pas l'écrire d'office dans les conventions
