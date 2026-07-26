# Story Ready — Definition of Ready

<!--
  Vérifiée par tm-dev avant d'implémenter une story.
  Les items marqués « (story fonctionnelle) » ne s'appliquent pas à une story technique
  (setup, migration d'outillage, dette) : celle-ci n'a ni parcours ni FR à référencer, et ses
  AC ne sont pas tous vérifiables par un test automatisé. Les déclarer sans objet, avec la
  raison — pas les cocher de force, pas les ignorer.
-->

- [ ] La story a le statut 🟢 Ready
- [ ] Les critères d'acceptation sont en Given/When/Then
- [ ] La section « Implémentation » liste les fichiers à créer ou modifier
- [ ] La section « Tests attendus » liste les tests à écrire
- [ ] La référence UI est renseignée (fichier JSX, lien, description texte, **ou `N/A`**)
- [ ] Les stories prérequises sont ✅ Done
- [ ] Le champ **Conventions** est renseigné dans la section Meta — utile surtout pour les tags que les globs ne peuvent pas déduire (`datetime`, `i18n`, `flags`), voir `.tiple/conventions/_index.md`
- [ ] (story fonctionnelle) Chaque AC est vérifiable par un test automatisé
- [ ] (story fonctionnelle) Les refs PRD (parcours + FR) et architecture sont renseignées

Si un item bloque, le signaler et s'arrêter : implémenter une story non prête produit un
travail que la review ne pourra pas juger.
