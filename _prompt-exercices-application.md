# Prompt — Section « Exercices d'application » (3 exercices par jour)

> À copier-coller tel quel dans une conversation avec Claude Opus 5, en y joignant
> les deux PDF de référence (`Chapitre 5 — Les fonctions récursives`, `Chapitre 7 — Les
> principes du concept objet`).

---

## CONTEXTE

Tu interviens sur un site de formation **100 % statique** (HTML/CSS/JS sans framework ni
build), publié via GitHub Pages, **entièrement en français**. Il contient 82 cours, dont
**51 cours de programmation** de 21 ou 31 leçons chacun. Chaque leçon est un fichier
autonome `lecon<NN>.html` ou `jour<NN>.html` contenant des objets JavaScript en clair.

Une leçon comporte aujourd'hui trois blocs, dans cet ordre :

| Bloc | Objet JS | Moteur | Contenu |
|---|---|---|---|
| Théorie + QCM | `DAY` | `engine.js` | théorie, 15 QCM à 4 options, 1 exercice `final` |
| Écriture | `ECRITURE` | `exo-ecriture.js` | **1** exercice de code, 3 indices, solution, `tests`, checklist |
| Fil rouge | `FILROUGE` | `fil-rouge.js` | projet transversal du cours |

**Ta mission : ajouter un quatrième bloc, « Exercices d'application », avec 3 exercices
par leçon, 5 indices par exercice et affichage de la solution à la demande.**

L'objectif n'est pas d'ajouter du volume. C'est de faire **appliquer** ce qui vient d'être
lu. Un exercice qui se résout en recopiant la théorie ne sert à rien.

---

## LE STYLE À REPRODUIRE

Les deux PDF joints sont des chapitres du cours d'école de l'élève. C'est **exactement** ce
style qu'il faut reproduire. Lis-les avant d'écrire quoi que ce soit. Voici ce qui les
caractérise, et que la plupart des exercices générés par IA ratent.

**1. L'énoncé est en prose, et ne donne aucun squelette de code.**
Le PDF écrit : *« Ecrire un algorithme qui permet d'effectuer le calcul du PGCD de deux
nombres entiers positifs non nuls a et b. »* Pas de `def pgcd(a, b):` à compléter, pas de
`# TODO ici`. L'élève part de la feuille blanche. Un exercice à trous n'est pas un exercice
d'application, c'est une dictée.

**2. Un bloc « Principe : » peut donner la clé, jamais la solution.**
Le PDF donne pour le PGCD : *« Nous nous basons sur le fait que PGCD(a,0) = a et que
PGCD(a,b) = PGCD(b, a mod b) »*. C'est la propriété mathématique, pas l'algorithme. La
traduction en code reste entièrement à faire. Utilise `principe` quand le sujet repose sur
une règle que l'élève ne peut pas deviner ; laisse-le vide sinon.

**3. Les sous-questions s'enchaînent et construisent.**
Le chapitre 7 déroule : *1. rendre les propriétés privées → que se passe-t-il à la
compilation ? pourquoi ? → 2.a écrire `setTitre()` → 2.b en déduire les autres → 2.c adapter
l'application → 2.d est-il nécessaire de créer `setCode()` ? pourquoi ?* Chaque sous-question
s'appuie sur la précédente. **Au moins un des trois exercices du jour doit être construit
ainsi**, avec des sous-questions `a`, `b`, `c`, `d`.

**4. Certaines questions ne demandent pas de code, mais une explication.**
*« Que se passe-t-il lors de la compilation ? Pourquoi ? »* — c'est là que se joue la
compréhension. **Chaque jour doit comporter au moins une question réflexive de ce type.**
Sa « solution » est une explication rédigée, pas du code.

**5. Un fil rouge relie les exercices.**
Le chapitre 7 reprend l'application `Bibliothèque` et la classe `Livre` du chapitre
précédent. Sur ce site, le fil rouge est **la Ludothèque** (jeux, membres, locations,
exemplaires) : réutilise-la d'un jour à l'autre pour que l'élève construise quelque chose,
au lieu de résoudre 93 énigmes sans lien.

**6. Quand le sujet s'y prête, la démarche est explicitée en étapes numérotées.**
Le chapitre 5 impose pour toute récursivité : *Étape 1 — trouver l'expression commune ;
Étape 2 — trouver le point d'arrêt ; Étape 3 — vérifier qu'on s'en rapproche.* Quand une
méthode existe, nomme-la dans l'énoncé et exige que l'élève la suive.

---

## LES 5 INDICES : UNE GRADATION, PAS CINQ REFORMULATIONS

C'est le point sur lequel une IA échoue le plus souvent : elle écrit cinq fois la même
chose en changeant les mots. Chaque indice doit franchir une marche que le précédent n'a pas
franchie. Ordre imposé :

| # | Rôle | Ce qu'il donne | Ce qu'il ne donne pas |
|---|---|---|---|
| 1 | **Recadrer** | Reformule ce qui est réellement demandé, écarte la fausse piste évidente | Aucune piste de résolution |
| 2 | **La démarche** | Le raisonnement, en langage courant | Aucun nom d'outil du langage |
| 3 | **L'outil** | *Quelle* construction du langage employer (boucle `for`, dictionnaire, `try/except`…) | Comment l'écrire |
| 4 | **La structure** | Le squelette en pseudocode ou en commentaires numérotés | Aucune ligne exécutable |
| 5 | **L'amorce** | La ou les deux premières lignes réelles, celles qui débloquent | La suite, et surtout pas la fin |

Test à t'appliquer : si tu supprimes l'indice n°3, l'indice n°4 doit devenir plus difficile
à comprendre. Si ce n'est pas le cas, tes indices sont des paraphrases — réécris-les.

L'indice 5 ne doit **jamais** contenir la ligne qui résout le problème. Pour un exercice de
tri, il donne la déclaration du tableau, pas la comparaison. Pour une récursivité, il donne
la signature de la fonction, pas le cas d'arrêt.

---

## LA SOLUTION

- Affichée **uniquement à la demande**, par un bouton, jamais dépliée par défaut.
- Commentée : chaque ligne non triviale porte un commentaire de fin de ligne expliquant
  *pourquoi* elle est là, pas *ce qu'elle fait*.
- Suivie d'un court paragraphe `pourquoi` : le choix de conception, et ce qui se passerait
  si on avait fait autrement.
- Pour une question réflexive, la « solution » est une explication rédigée, pas du code.

**Interdiction absolue de fuite.** La solution ne doit apparaître ni dans l'énoncé, ni dans
le `principe`, ni dans un indice, ni dans la checklist. Ce site a déjà eu ce défaut : des
encadrés « 1) 2) 3) » qui donnaient la réponse au-dessus de la zone de saisie, et l'élève ne
cherchait plus. Le vérificateur demandé plus bas doit rendre cette faute impossible à
committer.

---

## CONTRAT DE DONNÉES

Ajoute dans chaque leçon un bloc `<script>` déclarant `APPLICATION`, suivi de
`<script src="exo-application.js"></script>`. Aucun bloc existant n'est modifié.

```js
var APPLICATION = {
  cours: "cours-algorithmes",       // identifiant du dossier
  jour: 12,                          // numéro de leçon
  langue: "pseudocode",              // pseudocode | python | java | sql | ...
  items: [
    {
      num: "12.1",                   // numérotation hiérarchique, style PDF
      titre: "Le PGCD de deux nombres",
      niveau: 1,                     // 1 application directe · 2 combinaison · 3 transfert
      enonce: "…",                   // prose, sans squelette de code
      principe: "…",                 // facultatif : la règle, jamais l'algorithme
      remarque: "…",                 // facultatif
      sousQuestions: [               // facultatif, mais présent sur >= 1 des 3
        { ref: "a", texte: "…" },
        { ref: "b", texte: "…" }
      ],
      reflexion: "…",                // facultatif : la question « pourquoi ? »
      indices: [ "…", "…", "…", "…", "…" ],   // EXACTEMENT 5, gradation ci-dessus
      solution: "…",                 // code commenté, ou explication rédigée
      pourquoi: "…",                 // le choix de conception, en 2-3 phrases
      tests: [ … ],                  // UNIQUEMENT si le langage est exécutable (voir plus bas)
      checklist: [ "…", "…", "…" ]   // critères OBSERVABLES, sans donner la réponse
    }
  ]
};
```

**Progression imposée des 3 exercices du jour** : `niveau: 1` applique une seule notion du
jour ; `niveau: 2` la combine avec une notion des jours précédents ; `niveau: 3` transfère
dans un contexte nouveau et porte les sous-questions en cascade.

---

## CONTRAINTES TECHNIQUES — NON NÉGOCIABLES

**Honnêteté sur ce qui est vérifié.** La CI n'exécute réellement que **python, js, sql,
java, c, cpp, bash**. Pour C#, PHP, l'assembleur et le pseudocode, **n'invente pas de champ
`tests`** : un test qui ne tourne jamais est un mensonge affiché à l'élève. Ces exercices
portent à la place une note de transparence, comme le reste du site le fait déjà.

**localStorage.** Uniquement des clés nouvelles, préfixées `appli-<cours>-j<N>-e<K>`.
**Aucune clé existante ne doit être lue, écrite ou renommée** — les scores déjà enregistrés
par l'élève doivent survivre.

**Statique.** Aucun `fetch`, aucune dépendance nouvelle, aucun CDN supplémentaire. Le site
doit continuer à fonctionner ouvert en `file://`.

**Français.** Interface, énoncés, indices, commentaires de code et commentaires du code
source : tout en français.

**Lisibilité.** Les encadrés doivent être lisibles sur fond clair *et* dans le `.hero`
(fond foncé, `color:#fff`), et leur contenu centré. Le site a déjà été corrigé sur ce point,
ne réintroduis pas le défaut.

---

## VÉRIFICATEUR — `_verify_application.js`

Écris-le, et branche-le dans `.github/workflows/verify.yml` à côté des autres. Il doit faire
**échouer le build** sur chacun de ces points :

1. **Structure** — exactement 3 items par leçon ; `num`, `titre`, `enonce`, `indices`,
   `solution`, `checklist` présents et non vides ; `niveau` valant 1, 2 puis 3.
2. **Exactement 5 indices**, tous non vides, **tous distincts après normalisation**.
3. **Anti-paraphrase** — deux indices dont la similarité dépasse un seuil (mots communs
   rapportés au plus court des deux) sont refusés. Journalise la paire fautive.
4. **Anti-fuite** — aucune ligne de `solution` de plus de 25 caractères ne se retrouve, même
   partiellement, dans `enonce`, `principe`, `indices` ou `checklist`. **C'est le contrôle le
   plus important du fichier.**
5. **Tests honnêtes** — champ `tests` présent **si et seulement si** le langage figure dans
   la liste des langages réellement exécutés ; et pour ceux-là, la solution de référence doit
   **passer ses propres tests** via `_verify.js`.
6. **Sous-questions et réflexion** — au moins un item par leçon avec `sousQuestions`, au
   moins un avec `reflexion`.
7. **Longueur d'énoncé** — un énoncé de moins de 120 caractères est refusé : c'est un
   télégramme, pas un énoncé.
8. **Unicité** — `num` et clés localStorage uniques dans tout le site.

Pour chaque contrôle, **écris un contre-test** : casse volontairement un cas, montre que le
vérificateur le refuse, remets en état. Un contrôle qui n'a jamais échoué n'a jamais été
testé — cette leçon a déjà été apprise ici à propos d'un test qui passait par chance.

---

## DÉCOUPAGE DU TRAVAIL

**Mission 1 — le moteur.** `exo-application.js` + styles + le vérificateur + son
branchement CI, avec **une seule leçon** remplie en démonstration. Rien d'autre.

**Mission 2 — le pilote.** `cours-algorithmes` en entier : 31 leçons × 3 exercices = 93
exercices, fil rouge Ludothèque, respect du contrat. **Arrête-toi là et rends la main pour
validation.**

**Mission 3 et suivantes — généralisation**, un cours par mission, seulement après feu vert.

51 cours × 93 exercices ≈ 4 700 exercices. Généré d'un bloc, ce volume produit des énoncés
interchangeables et des indices creux. Le pilote existe pour qu'on constate la qualité
avant de la multiplier par cinquante.

À chaque mission : **un seul commit**, `CHANGELOG-IA.md` complété fidèlement (y compris ce
qui n'a pas marché), aucun artefact d'exécution commité, CI verte.

---

## CE QUE TU NE DOIS PAS FAIRE

- Donner un squelette de code à compléter dans l'énoncé.
- Écrire cinq indices qui disent la même chose.
- Laisser la solution transparaître dans l'énoncé, un indice ou la checklist.
- Inventer un champ `tests` pour un langage que la CI n'exécute pas.
- Toucher à une clé localStorage existante.
- Écrire une checklist du type « As-tu utilisé une boucle `while` ? » quand la solution est
  justement une boucle `while` : la checklist vérifie un **résultat observable**, elle ne
  souffle pas la méthode.
- Annoncer « vérifié » ce qui ne l'est pas. Si un contrôle n'a pas pu tourner, écris-le dans
  le CHANGELOG plutôt que de le passer sous silence.

---

## AVANT DE COMMENCER

Lis les deux PDF joints, puis **écris trois exercices d'exemple** pour une seule leçon de
`cours-algorithmes` et **montre-les-moi avant de générer quoi que ce soit d'autre**. Nous
ajusterons le ton, la longueur et le calibrage des indices sur ces trois-là. Générer 93
exercices avant d'avoir calé le style, c'est 93 exercices à refaire.
