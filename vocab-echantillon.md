# Échantillon de relecture — banques de vocabulaire

**Ce document n'est pas une vérification.** C'est une **fiche de relecture** à faire remplir par un
humain qui connaît la langue (professeur, locuteur, ou toi-même dictionnaire en main).

## Pourquoi cette fiche existe

Les banques de vocabulaire ont deux origines, et une seule pose problème.

| Origine | Volume | Risque |
|---|---|---|
| Reprise **telle quelle** des `lexique.html` des cours | 400 mots par langue (396–400 après fusion des doublons) | **Aucun risque nouveau** : la banque affiche exactement ce que le cours enseigne. `_verify_vocab.js` refuse le build si les deux divergent d'un seul mot. |
| **Extension écrite pour le volume** | 167 à 281 mots par langue | **C'est ici que le risque est réel.** Ces traductions n'ont été confrontées à aucune source externe : l'environnement de build n'a accès à aucun dictionnaire. Elles portent `source: "non-verifie"` et un repère ⚠ dans les questions. |

L'échantillon ci-dessous est tiré **uniquement de la partie non vérifiée**, au hasard mais de façon
reproductible (graine fixe), 50 mots par langue. Coche, corrige, et signale les erreurs — chaque
correction remontée retire un mot de la zone grise.

## Comment corriger un mot

Les extensions vivent dans `_outils/vocabulaire/vocab_ext_<code>.py` (`nl`, `en`, `es`, `de`) ; la banque publiée est
**générée** par `_outils/vocabulaire/vocabgen2.py`. On corrige donc la source, jamais le `.js`, puis on relance le
générateur et `node _verify_vocab.js`.

## Néerlandais — 563 mots (396 des lexiques, 167 à relire)

Échantillon de 50 mots sur les 167 non vérifiés (30 %).

| ✔ | Mot | Traduction proposée | Niveau | Catégorie |
|---|---|---|---|---|
| ☐ | gevaarlijk | dangereux | B1 | adjectifs |
| ☐ | makkelijk | facile | A2 | adjectifs |
| ☐ | slecht | mauvais | A1 | adjectifs |
| ☐ | veilig | sûr | B1 | adjectifs |
| ☐ | de neef | le cousin | A2 | famille |
| ☐ | de oom | l'oncle | A2 | famille |
| ☐ | het spel | le jeu | A1 | loisirs-sport |
| ☐ | de lamp | la lampe | A1 | maison |
| ☐ | de trap | l'escalier | A2 | maison |
| ☐ | de woning | le logement | B1 | maison |
| ☐ | het bad | le bain | A2 | maison |
| ☐ | het bed | le lit | A1 | maison |
| ☐ | hoe | comment | A1 | mots-outils |
| ☐ | waarom | pourquoi | A1 | mots-outils |
| ☐ | wanneer | quand | A1 | mots-outils |
| ☐ | wie | qui | A1 | mots-outils |
| ☐ | de kat | le chat | A1 | nature-environnement |
| ☐ | de lucht | l'air | A2 | nature-environnement |
| ☐ | de rivier | la rivière | A2 | nature-environnement |
| ☐ | het bos | la forêt | A2 | nature-environnement |
| ☐ | het paard | le cheval | A2 | nature-environnement |
| ☐ | de maand | le mois | A1 | nombres-dates |
| ☐ | de minuut | la minute | A2 | nombres-dates |
| ☐ | het jaar | l'année | A1 | nombres-dates |
| ☐ | vaak | souvent | A2 | nombres-dates |
| ☐ | zaterdag | samedi | A1 | nombres-dates |
| ☐ | de boter | le beurre | A1 | nourriture |
| ☐ | het fruit | le fruit | A1 | nourriture |
| ☐ | het zout | le sel | A1 | nourriture |
| ☐ | moe | fatigué | A1 | sentiments |
| ☐ | rustig | calme | A2 | sentiments |
| ☐ | de belasting | l'impôt | B2 | societe-actualite |
| ☐ | de verkiezing | l'élection | B2 | societe-actualite |
| ☐ | de lente | le printemps | A2 | temps-meteo |
| ☐ | de zomer | l'été | A2 | temps-meteo |
| ☐ | het onweer | l'orage | B1 | temps-meteo |
| ☐ | de halte | l'arrêt | B1 | transports-voyage |
| ☐ | de les | le cours | A2 | travail-etudes |
| ☐ | de school | l'école | A1 | travail-etudes |
| ☐ | de vergadering | la réunion | B1 | travail-etudes |
| ☐ | doen | faire | A1 | verbes |
| ☐ | proberen | essayer | B1 | verbes |
| ☐ | sluiten | fermer | A2 | verbes |
| ☐ | weten | savoir | A1 | verbes |
| ☐ | de bibliotheek | la bibliothèque | A2 | ville |
| ☐ | de hoek | le coin | B1 | ville |
| ☐ | de stad | la ville | A1 | ville |
| ☐ | de wijk | le quartier | B1 | ville |
| ☐ | het dorp | le village | A2 | ville |
| ☐ | het park | le parc | A2 | ville |

## Anglais — 664 mots (400 des lexiques, 264 à relire)

Échantillon de 50 mots sur les 264 non vérifiés (19 %).

| ✔ | Mot | Traduction proposée | Niveau | Catégorie |
|---|---|---|---|---|
| ☐ | busy | occupé | A2 | adjectifs |
| ☐ | light | léger | A2 | adjectifs |
| ☐ | silence | silence | B1 | communication |
| ☐ | tooth | dent | A2 | corps-sante |
| ☐ | adult | adulte | B1 | famille |
| ☐ | cousin | cousin | A2 | famille |
| ☐ | girl | fille (enfant) | A1 | famille |
| ☐ | husband | mari | A2 | famille |
| ☐ | wife | épouse | A2 | famille |
| ☐ | audience | public | B1 | loisirs-sport |
| ☐ | ball | ballon | A1 | loisirs-sport |
| ☐ | bedroom | chambre | A1 | maison |
| ☐ | cupboard | armoire | A2 | maison |
| ☐ | fridge | réfrigérateur | A2 | maison |
| ☐ | kitchen | cuisine (pièce) | A1 | maison |
| ☐ | shelf | étagère | B1 | maison |
| ☐ | already | déjà | A2 | mots-outils |
| ☐ | nobody | personne (aucun) | A2 | mots-outils |
| ☐ | together | ensemble | A2 | mots-outils |
| ☐ | when | quand | A1 | mots-outils |
| ☐ | where | où | A1 | mots-outils |
| ☐ | why | pourquoi | A1 | mots-outils |
| ☐ | without | sans | A1 | mots-outils |
| ☐ | animal | animal | A1 | nature-environnement |
| ☐ | beach | plage | A2 | nature-environnement |
| ☐ | bird | oiseau | A1 | nature-environnement |
| ☐ | sand | sable | B1 | nature-environnement |
| ☐ | tree | arbre | A1 | nature-environnement |
| ☐ | hunger | faim | A2 | nourriture |
| ☐ | knife | couteau | A2 | nourriture |
| ☐ | soup | soupe | A2 | nourriture |
| ☐ | anger | colère | B1 | sentiments |
| ☐ | relief | soulagement | B2 | sentiments |
| ☐ | trust | confiance | B1 | sentiments |
| ☐ | court | tribunal | B2 | societe-actualite |
| ☐ | law | loi | B1 | societe-actualite |
| ☐ | autumn | automne | A2 | temps-meteo |
| ☐ | spring | printemps | A2 | temps-meteo |
| ☐ | winter | hiver | A1 | temps-meteo |
| ☐ | factory | usine | B1 | travail-etudes |
| ☐ | pupil | élève | A1 | travail-etudes |
| ☐ | school | école | A1 | travail-etudes |
| ☐ | to borrow | emprunter | B1 | verbes |
| ☐ | to build | construire | B1 | verbes |
| ☐ | to help | aider | A1 | verbes |
| ☐ | to listen | écouter | A1 | verbes |
| ☐ | to pay | payer | A2 | verbes |
| ☐ | to pull | tirer | B1 | verbes |
| ☐ | pocket | poche | A2 | vetements |
| ☐ | scarf | écharpe | B1 | vetements |

## Espagnol — 678 mots (397 des lexiques, 281 à relire)

Échantillon de 50 mots sur les 281 non vérifiés (18 %).

| ✔ | Mot | Traduction proposée | Niveau | Catégorie |
|---|---|---|---|---|
| ☐ | bajo | bas | A2 | adjectifs |
| ☐ | cansado | fatigué | A2 | adjectifs |
| ☐ | grande | grand | A1 | adjectifs |
| ☐ | nuevo | nouveau | A1 | adjectifs |
| ☐ | pequeño | petit | A1 | adjectifs |
| ☐ | el anuncio | la publicité | B1 | communication |
| ☐ | el rumor | la rumeur | B2 | communication |
| ☐ | el significado | la signification | B1 | communication |
| ☐ | el silencio | le silence | B1 | communication |
| ☐ | la frase | la phrase | A2 | communication |
| ☐ | la historia | l'histoire | A2 | communication |
| ☐ | el dedo | le doigt | A2 | corps-sante |
| ☐ | el hueso | l'os | B1 | corps-sante |
| ☐ | la espalda | le dos | A2 | corps-sante |
| ☐ | la sangre | le sang | B1 | corps-sante |
| ☐ | el cajón | le tiroir | B1 | maison |
| ☐ | el edificio | l'immeuble | A2 | maison |
| ☐ | el espejo | le miroir | A2 | maison |
| ☐ | el techo | le toit | A2 | maison |
| ☐ | la cocina | la cuisine (pièce) | A1 | maison |
| ☐ | la manta | la couverture | B1 | maison |
| ☐ | a menudo | souvent | A2 | mots-outils |
| ☐ | casi | presque | A2 | mots-outils |
| ☐ | cuándo | quand | A1 | mots-outils |
| ☐ | el perro | le chien | A1 | nature-environnement |
| ☐ | la vaca | la vache | A2 | nature-environnement |
| ☐ | el desayuno | le petit-déjeuner | A2 | nourriture |
| ☐ | el hambre | la faim | A2 | nourriture |
| ☐ | el pastel | le gâteau | A2 | nourriture |
| ☐ | la ensalada | la salade | A2 | nourriture |
| ☐ | la patata | la pomme de terre | A1 | nourriture |
| ☐ | el aburrimiento | l'ennui | B2 | sentiments |
| ☐ | la confianza | la confiance | B1 | sentiments |
| ☐ | la ira | la colère | B1 | sentiments |
| ☐ | el tribunal | le tribunal | B2 | societe-actualite |
| ☐ | la cárcel | la prison | B2 | societe-actualite |
| ☐ | la encuesta | le sondage | B2 | societe-actualite |
| ☐ | la guerra | la guerre | B1 | societe-actualite |
| ☐ | la primavera | le printemps | A2 | temps-meteo |
| ☐ | el conductor | le conducteur | A2 | transports-voyage |
| ☐ | el tren | le train | A1 | transports-voyage |
| ☐ | comprar | acheter | A1 | verbes |
| ☐ | enseñar | enseigner | B1 | verbes |
| ☐ | escuchar | écouter | A1 | verbes |
| ☐ | explicar | expliquer | B1 | verbes |
| ☐ | ganar | gagner | A2 | verbes |
| ☐ | lavar | laver | A2 | verbes |
| ☐ | olvidar | oublier | A2 | verbes |
| ☐ | reír | rire | A2 | verbes |
| ☐ | el cinturón | la ceinture | B1 | vetements |

## Allemand — 666 mots (400 des lexiques, 266 à relire)

Échantillon de 50 mots sur les 266 non vérifiés (19 %).

| ✔ | Mot | Traduction proposée | Niveau | Catégorie |
|---|---|---|---|---|
| ☐ | eng | étroit | B1 | adjectifs |
| ☐ | heiß | chaud | A1 | adjectifs |
| ☐ | hoch | haut | A2 | adjectifs |
| ☐ | laut | bruyant | B1 | adjectifs |
| ☐ | leicht | léger | A2 | adjectifs |
| ☐ | neu | nouveau | A1 | adjectifs |
| ☐ | nutzlos | inutile | B1 | adjectifs |
| ☐ | schlecht | mauvais | A1 | adjectifs |
| ☐ | schmutzig | sale | A2 | adjectifs |
| ☐ | stark | fort | A2 | adjectifs |
| ☐ | der Satz | la phrase | A2 | communication |
| ☐ | das Krankenhaus | l'hôpital | A2 | corps-sante |
| ☐ | der Zahn | la dent | A2 | corps-sante |
| ☐ | die Schulter | l'épaule | A2 | corps-sante |
| ☐ | das Paar | le couple | A2 | famille |
| ☐ | der Ehemann | le mari | A2 | famille |
| ☐ | der Junge | le garçon | A1 | famille |
| ☐ | die Cousine | la cousine | A2 | famille |
| ☐ | die Nichte | la nièce | B1 | famille |
| ☐ | der Spaziergang | la promenade | A2 | loisirs-sport |
| ☐ | der Spieler | le joueur | A2 | loisirs-sport |
| ☐ | die Zeichnung | le dessin | B1 | loisirs-sport |
| ☐ | der Boden | le sol | A2 | maison |
| ☐ | der Kühlschrank | le réfrigérateur | A2 | maison |
| ☐ | jemand | quelqu'un | A2 | mots-outils |
| ☐ | zusammen | ensemble | A2 | mots-outils |
| ☐ | das Tier | l'animal | A1 | nature-environnement |
| ☐ | der Hund | le chien | A1 | nature-environnement |
| ☐ | der Wald | la forêt | A2 | nature-environnement |
| ☐ | das Abendessen | le dîner | A2 | nourriture |
| ☐ | das Fleisch | la viande | A1 | nourriture |
| ☐ | das Frühstück | le petit-déjeuner | A2 | nourriture |
| ☐ | das Hähnchen | le poulet | A2 | nourriture |
| ☐ | der Hunger | la faim | A2 | nourriture |
| ☐ | der Löffel | la cuillère | A2 | nourriture |
| ☐ | der Wein | le vin | A2 | nourriture |
| ☐ | die Gabel | la fourchette | A2 | nourriture |
| ☐ | das Gefängnis | la prison | B2 | societe-actualite |
| ☐ | der Krieg | la guerre | B1 | societe-actualite |
| ☐ | die Sicherheit | la sécurité | B1 | societe-actualite |
| ☐ | die Umfrage | le sondage | B2 | societe-actualite |
| ☐ | der Nebel | le brouillard | B1 | temps-meteo |
| ☐ | bekommen | recevoir | B1 | verbes |
| ☐ | lernen | apprendre | A1 | verbes |
| ☐ | putzen | nettoyer | A2 | verbes |
| ☐ | versuchen | essayer | A2 | verbes |
| ☐ | werfen | jeter | B1 | verbes |
| ☐ | der Handschuh | le gant | B1 | vetements |
| ☐ | der Stiefel | la botte | B1 | vetements |
| ☐ | das Museum | le musée | A2 | ville |

