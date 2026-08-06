
## Entraînement du jour — cours-csharp, lot 6 (leçons 21 à 24)

**Contenu.** 12 exercices, 60 indices, 12 corrigés C#. Leçon 21 *LINQ en
profondeur* — le refuge pour animaux, le tournoi d'échecs ; leçon 22 *Delegates,
events et lambdas* — la station de tri du recyparc, l'alarme de la chambre
froide ; leçon 23 *Nullable et sécurité anti-null* — le formulaire d'inscription
au stage, le carnet de vaccination ; leçon 24 *Programmation asynchrone* — le
tableau d'affichage de la gare, la chaîne de sauvegarde nocturne. Mini-série
**« Le marché du samedi »**, 1/4 → 4/4, sur les quatre leçons.

**Le fil du lot : un même marché, quatre fois élargi.** Les douze étals du lundi
sont encore là vendredi, avec les mêmes chiffres — ils servent de témoin. Lundi,
toutes les questions sont écrites en dur dans le code (« au-dessus de 400 € »,
« par catégorie »). Mardi, le critère, la mesure et la clé de tri deviennent des
paramètres, et le seuil sort du code. Mercredi, deux exposants ne déclarent rien,
et il faut décider question par question ce que devient une valeur absente.
Vendredi, les données viennent de trois marchés chargés en parallèle. Chaque
journée ajoute une capacité sans défaire la précédente : c'est la vérification
que la note finale demande à l'élève de faire lui-même.

**Le problème du temps, traité comme celui du hasard au lot 5.** La leçon 24
introduit `async`/`await`, donc des durées qui varient d'une machine à l'autre —
et aucun compilateur C# ici pour les observer. Les trois corrigés séparent
explicitement ce qui se mesure de ce qui se vérifie : les millisecondes sont
affichées pour être regardées, jamais assertées ; ce qui figure dans les
checklists, ce sont des affirmations vraies sur toute machine — le parallèle est
plus rapide que le séquentiel, les résultats reviennent dans l'ordre de
lancement et non d'achèvement, les deux stratégies copient la même quantité.

**Décisions pédagogiques.**
- 21.1 et 21.2 montrent l'exécution différée *en la provoquant* : une requête et
  une requête figée sont construites sur la même source, puis un élément est
  ajouté, et les deux comptes divergent. L'indice ④ prévient que l'ordre des
  trois gestes est ce qui fait marcher la démonstration.
- 22.1 fait déclencher l'événement **au seul franchissement** de la capacité, et
  la remarque explique pourquoi : une benne pleine qui alerte à chaque seau rend
  le système de surveillance inutile en trois jours.
- 22.2 impose deux abonnés de nature différente — la méthode d'un objet et une
  lambda capturant une liste extérieure — pour montrer qu'un événement ne demande
  qu'une forme, pas une origine. La réponse (d) explique la capture, et enchaîne
  sur la cause numéro un des fuites de mémoire dans les applications à
  événements.
- 22.3 mesure honnêtement le coût de la forme déclarative : la ventilation
  écrite en une expression par croisement traverse l'urne trois fois plus que la
  version en boucles. La remarque le dit sans détour.
- 23.1 fait calculer **deux moyennes d'âge** — sur les renseignés, puis en
  comptant les absents pour zéro (15,50 contre 10,33) — et la remarque nomme
  l'erreur : le calcul est juste, le chiffre n'a aucun sens.
- 23.3 pousse la même idée : la **somme** est identique qu'on ignore les absents
  ou qu'on les compte pour zéro, alors que les **moyennes** diffèrent de 62,20 €.
  « Une somme ne trahit jamais une absence — seule une moyenne le fait. »
- 24.2 met trois stratégies côte à côte sur un seul jeu de données, dont une qui
  perd 910 Mo correctement copiés à cause d'un seul volume vide. La réflexion
  demande ce que l'administrateur verrait au matin, puis ce que la troisième
  stratégie *cache* en échange — car elle cache quelque chose.

**Pièges certifiés (valeurs recalculées en Python).**
21.1 : 148,70 kg, âge moyen 34,00 mois, 5 chats après l'ajout contre 4 dans le
résultat figé. 21.2 : 60 demi-points pour 30 parties, l'Échiquier premier à l'Elo
moyen (1986,25) et dernier aux points (16). 21.3 : 4 151,00 €, 112 m², meilleur
rendement Ozturk à 58,55 €/m² alors que le plus gros chiffre est Haddad.
22.1 : 2 980 kg, 447,00 € au poids, 263,40 € au forfait. 22.2 : 6 alertes, puis
7 comptées contre 6 journalisées après désabonnement. 22.3 : 4 dépassements pour
439,00 €, puis 8 comptés contre 4 avis rédigés. 23.1 : 4 âges sur 6, 15,50 contre
10,33. 23.2 : 11 doses sur 18, 4 intervalles à 28 jours. 23.3 : 373,20 € contre
311,00 € de moyenne. 24.1 : 30 minutes de retard cumulé. 24.2 : 910 Mo, 4
réussites sur 5. 24.3 : 23 étals, 19 déclarants, 6 656,00 €, 6 dépassements pour
671,00 €.

**Vocabulaire vérifié avant écriture.** `Distinct()` ne figure pas dans la
théorie de la leçon 21 — remplacé par `GroupBy(...).Count()`. Le spécificateur
d'alignement `{x,2}` n'est enseigné nulle part — retiré. Une chaîne interpolée ne
peut pas s'étaler sur plusieurs lignes : deux chaînes LINQ multi-lignes ont dû
passer par une variable intermédiaire, et l'indice ④ de 21.2 prévient l'élève du
même piège.

**Anti-fuite.** 58 violations de l'indice ⑤ prises pendant l'écriture, toutes
masquées par `…`. Note pour la suite : `using System.Threading.Tasks;` fait 29
caractères et compte donc comme une fuite — le filtre du vérificateur ne
dispense pas les lignes `using`.

**Vérification.** `node _verify_entrainement.js` sur les fichiers réellement
injectés : **95 leçons équipées, 285 exercices, 0 problème**. Aucun champ `tests`
sur les 12 items.

**Reste à faire.** cours-csharp : lots 25-28, 29-31. Puis cours-php (31 leçons,
pas d'interpréteur → règle d'honnêteté), cours-c, cours-cpp-bas, cours-cpp-moderne
(gcc et g++ présents → le registre `EXECUTABLES` peut être étendu comme pour Java)
et cours-asm (NASM absent).
