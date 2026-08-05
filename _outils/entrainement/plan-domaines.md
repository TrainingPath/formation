# Plan de rotation des domaines — Entraînement du jour

## Pourquoi ce fichier

Trois exercices par leçon, 21 leçons pour `cours-python` seul : sans plan, les énoncés retombent
inévitablement sur les deux ou trois mêmes univers. Le fil rouge Ludothèque du site avait le mérite
de la cohérence, mais 63 exercices sur les jeux de société lassent avant la moitié.

Règle retenue : **les exercices 1 et 2 changent de domaine à chaque fois**, l'exercice 3 seul garde
une continuité — mais **courte, 3 à 4 jours**, puis change complètement de sujet.

`_verify_entrainement.js` contrôle mécaniquement le respect de ce plan : chaque exercice porte un
champ `domaine`, et le vérificateur refuse deux domaines identiques dans une même leçon ou un domaine
déjà servi dans les quatre leçons précédentes.

## Réservoir de domaines (exercices 1 et 2)

météo · sport · cuisine · musique · astronomie · banque et budget · transports · jardinage ·
bibliothèque et lecture · cinéma · santé et pharmacie · voyages · photographie · élevage et animaux ·
géographie · commerce de quartier · école et notes · bricolage · pêche · météorologie marine ·
horlogerie · archéologie · brasserie · apiculture · cartographie · théâtre · randonnée · informatique
elle-même (fichiers, réseau, journalisation)

Aucun domaine n'est réutilisé avant quatre leçons d'écart. Le vérificateur le fait respecter ; ce
réservoir sert à s'assurer qu'il en reste toujours assez pour tenir la distance.

## Mini-séries de l'exercice 3 — `cours-python` (21 leçons)

| Jours | Série | Ce qu'on construit | Notions couvertes |
|---|---|---|---|
| 1 → 3 | **Le panneau d'un cinéma** | l'affichage d'entrée, puis les tarifs et la recette | affichage, variables, opérateurs |
| 4 → 7 | **Le carnet de recettes** | saisie des ingrédients, conversions de portions, liste de courses | `input`, conditions, boucles, listes |
| 8 → 11 | **Le carnet d'entraînement** | séances, allures, statistiques de la semaine | fonctions, chaînes, tuples, traduction d'algorithmes |
| 12 → 14 | **La station météo** | relevés, capteurs, familles de capteurs | classes, `__init__`, héritage |
| 15 → 18 | **Le journal d'observation** | modules, pannes, sauvegarde sur disque, index | modules, exceptions, fichiers, dictionnaires |
| 19 → 21 | **Le budget d'un festival** | plannings, tirage au sort, bilan complet | dates et `random`, projet guidé, examen |

Chaque série est **autonome** : elle démarre d'une page blanche au premier de ses jours et se termine
au dernier. Une élève qui rejoint le cours en cours de route n'a jamais plus de trois jours de retard
à rattraper, et le lien « pars de la solution d'hier » couvre le cas où elle a sauté une leçon.

## Ce que le champ `serie` déclare

```js
serie: { nom: "Le panneau d'un cinéma", jour: 2, sur: 3 }
```

Le vérificateur contrôle que `jour` va de 1 à `sur` sans trou ni doublon sur des leçons consécutives,
et qu'aucune série ne dépasse **4 jours** — au-delà, ce n'est plus une mini-série, c'est un fil rouge
déguisé, exactement ce qu'on cherchait à éviter.
