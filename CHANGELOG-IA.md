# CHANGELOG — Améliorations assistées par IA

Ce fichier trace les modifications apportées au site dans le cadre du plan d'amélioration
(missions 1 à 6). Chaque entrée précise ce qui a changé et, le cas échéant, les corrections
factuelles de contenu.

---

## Pilote — cours-python (missions 1, 2 et 6)

Périmètre : uniquement `cours-python/`. Les autres cours sont inchangés (généralisation à venir).

### Mission 1 — Exécution réelle du code (Pyodide)
- **`cours-python/exo-ecriture.js`** : ajout d'un bouton **« ▶ Exécuter mon code »** sous chaque
  exercice d'écriture. Python tourne dans le navigateur via **Pyodide** (CDN jsdelivr, `v0.26.4`),
  **chargé à la demande** (au premier clic, pas au chargement de la page).
  - Sortie affichée ; erreurs Python nettoyées et lisibles.
  - `input()` est simulé (liste `stdin` de l'exercice) pour ne jamais bloquer le navigateur.
  - La sortie affichée est exposée aux tests sous le nom `__output__`.
- **Tests automatiques** : nouveau champ `tests` (liste d'assertions) dans chaque item `ECRITURE`.
  Affichage « ✅ N/N tests passés ». Le point n'est enregistré **que si tous les tests passent**.
- **Scoring d'écriture séparé** : nouvelle clé localStorage `ecrpass-<id>` + badge « ✍️ écriture validée ».
  **Aucune clé existante modifiée** (`py21-l*`, `ecr-*` intactes) — les scores déjà enregistrés survivent.

### Mission 2 — QCM imprévisibles
- **`cours-python/engine.js`** : les options des QCM sont désormais **mélangées à l'affichage**
  (mélange déterministe par question, index correct recalculé). La bonne réponse n'est plus
  jamais à une position fixe. `balanceOpts()` (équilibrage des longueurs) est conservé.
- **Distracteurs réécrits** sur les 21 leçons : suppression des distracteurs absurdes
  (« Rien », « Impossible », « Par la couleur », etc.) au profit d'erreurs de compréhension
  plausibles, de longueur comparable à la bonne réponse. **L'ordre des options et l'index `a`
  n'ont jamais été modifiés** (seul le texte des options fausses a changé) ; bonnes réponses et
  explications intactes.
- **Mode examen** : nouvelle page **`cours-python/examen.html`** (+ `examen.js`). Tire 10 questions
  au hasard parmi les leçons **déjà validées**, sans explication avant la fin, puis affiche le score.
  100 % statique (lecture des leçons via `fetch`, fonctionne sur GitHub Pages).

### Mission 6 — Approcher le feedback humain
- **Grille d'auto-relecture** : nouveau champ `checklist` (3-4 critères concrets) affiché **avant**
  le bouton « Voir la solution ». Défaut générique si une leçon n'en fournit pas.
- **`tuteur-ia.html`** (racine) : mode d'emploi d'un assistant IA comme tuteur socratique,
  6 prompts prêts à copier, avertissement sur le risque de se faire donner les réponses.
- **`cours-python/index.html`** : liens vers le mode examen et la page tuteur ajoutés.

### Corrections factuelles de contenu
- **`cours-python/lecon09.html`** : le commentaire de la solution indiquait `# 2` pour le nombre
  de « o » dans `"bonjour le monde"` ; il y en a **3**. Commentaire corrigé (`# 3`). Le code était
  déjà correct ; seul le commentaire était faux.

### Outils ajoutés (racine, non publiés dans les cours)
- **`_verify_py.js`** : vérificateur qui exécute la solution de référence + ses tests sous Python
  pour garantir que chaque jeu de tests est correct (la solution doit passer 100 % de ses tests).

### Validation
- 21/21 leçons : `DAY`/`ECRITURE` parsent, tous les QCM ont 4 options et un index `a` valide.
- 21/21 leçons : la solution de référence passe **tous** ses tests (`_verify_py.js`).
- Clés localStorage historiques préservées ; nouvelles clés (`ecrpass-*`) purement additives.

### Vérification navigateur — statut honnête

**Non réalisée automatiquement.** L'agent qui a produit ces modifications n'a pas d'accès à un
navigateur avec Internet ; il ne peut donc pas exécuter réellement Pyodide. Ce qui a été vérifié
par programme : syntaxe de tous les JS (`node --check`), parsing de `DAY`/`ECRITURE`, intégrité des
QCM (4 options, index `a` valide), et surtout **exécution des solutions de référence + de leurs tests
sous Python 3 réel** via `_verify_py.js` (21/21 leçons à `pass:N/N`). Cela prouve que les tests sont
corrects, mais **pas** que le rendu Pyodide dans un vrai navigateur est parfait.

Reste donc à valider **par un humain, dans un navigateur connecté** (cocher une fois fait) :

- [ ] Ouvrir `cours-python/lecon12.html`, écrire la classe `CompteBancaire`, cliquer **▶ Exécuter**
      → la sortie s'affiche puis « 3/3 tests passés » et le badge « écriture validée » apparaît.
- [ ] Le mélange des options de QCM est **stable au rechargement** d'une même leçon (choix assumé :
      seed = énoncé, donc même question → même ordre). Ce qui doit varier, c'est **la position de la
      bonne réponse d'une question à l'autre** — vérifier qu'elle n'est plus systématiquement au même rang.
- [ ] Après avoir validé au moins une leçon, ouvrir `cours-python/examen.html` (en ligne ou via
      `python -m http.server`) → 10 questions, corrections et score à la fin. En `file://`, un message
      d'explication doit s'afficher au lieu d'un écran vide.
- [ ] Un ancien score (`py21-l*`) enregistré avant ces changements est toujours affiché sur le sommaire.

---

## Phase 0 — Correctifs demandés par l'audit du pilote

Corrigés avant toute généralisation.

- **0.1 — Artefact de test.** Suppression de `taches.json` (généré par l'exercice « carnet en JSON »
  de la leçon 17) du disque et du suivi Git (`git rm --cached`). Ajout au `.gitignore` de motifs pour
  les artefacts d'exécution (`taches.json`, `carnet.json`, `*.out`, `cours-*/*.json` sauf données de fil rouge).
- **0.2 — Garde-fou `file://` dans le mode examen.** `cours-python/examen.js` : si `fetch()` échoue
  (site ouvert en `file://`), un message explique la cause et propose la version en ligne ou
  `python -m http.server`, au lieu d'un écran vide. À reprendre dans tout futur `examen.js`.
- **0.3 — README + accueil.** Précisé que le site s'utilise **sans installation**, que **seule**
  l'exécution du code dans le navigateur nécessite Internet (CDN Pyodide), et que le mode examen en
  local demande un petit serveur (`python -m http.server`) car `file://` bloque `fetch()`.
- **0.4 — Correction d'une consigne fausse.** L'ancienne étape « recharger change l'ordre des options »
  était erronée : le mélange est **déterministe** (seed = énoncé), donc stable au rechargement d'une même
  question. La consigne a été corrigée (c'est la position de la bonne réponse *entre questions* qui varie).
- **0.5 — `balanceOpts` désactivé dans `cours-python`.** Ce mécanisme (allongement artificiel du pire
  distracteur) datait d'avant la réécriture manuelle des distracteurs et pouvait produire des phrases
  bancales. L'appel est neutralisé dans `cours-python/engine.js` (`var _opts = ex.opts.slice()`). La
  fonction reste définie mais inerte. `balanceOpts` demeure actif dans les cours **pas encore traités**.
- **0.6 — Honnêteté de la vérification navigateur.** Voir la section « Vérification navigateur » ci-dessus :
  l'exécution Pyodide réelle **n'a pas** été testée en navigateur (pas d'accès), c'est explicitement indiqué
  et laissé en cases à cocher pour un humain. Ce qui est prouvé automatiquement : les solutions de référence
  passent 100 % de leurs tests sous Python 3 réel.

---

## Généralisation — étapes préparatoires

- **Prep-A — Vérificateur universel `_verify.js`.** Étend `_verify_py.js` à trois langages :
  Python (via `python3`), JavaScript (via le module `vm` de node, jsdom utilisé si disponible pour les
  tests DOM), SQL (via le module `sqlite3` intégré de python3, aucune installation requise). Chaque cours
  exécutable doit afficher `pass:N/N` pour toutes ses solutions de référence avant d'être commité.
  Testé sur les trois modes (Python sur `lecon12`, SQL et JS sur des cas témoins) : OK.
- **Prep-B — Mélange QCM porté mécaniquement sur les 80 `engine.js` restants.** Même logique que le pilote
  (drapeau `correct` par option, seed = énoncé, index recalculé). `balanceOpts` reste **actif** dans ces
  cours (il ne sera désactivé qu'au lot où leurs distracteurs sont réécrits). Contrôles : `node --check`
  sur les 81 (0 erreur) ; test fonctionnel sur 10 cours-échantillons → **133/133 QCM** conservent la bonne
  réponse après mélange, et la position de la bonne réponse est désormais répartie sur les 4 rangs
  (39/26/38/30) au lieu d'être fixe. Le mélange reste déterministe (stable au rechargement d'une question).
- **Prep-C — `exo-ecriture.js` canonique déployé sur 76 cours (Phase 6.1).** Nouvelle version qui rend
  systématiquement une **grille d'auto-relecture** (champ `checklist`, ou 3 critères génériques par défaut)
  avant le bouton « Voir la solution ». Elle intègre aussi le **runner Python conditionnel** : le bouton
  ▶ n'apparaît **que** pour un item réellement exécutable (`lang:"python"` + `tests`). Un exercice de
  pseudocode, de conception ou d'un langage non exécutable n'a donc **pas** de bouton ▶ — aucun faux
  interpréteur. Les 4 cours à runner spécialisé (`cours-web` en JS, `cours-sql`/`initiation-bdd`/`sgbd-avance`
  en SQL) sont volontairement exclus de ce déploiement : ils recevront leur runner dédié au lot 2.
  `node --check` OK sur l'échantillon vérifié.

### Correction de périmètre (Phase 1) constatée par inspection
Le plan initial supposait `cours-projet-python`, `cours-projet-python-pro` et `cours-algorithmes`
« exécutables en Python ». **L'inspection du contenu réel contredit cette hypothèse** :
- `cours-projet-python` / `-pro` sont des projets **Django / architecture / CI-CD** : les exercices
  d'écriture sont des descriptions de conception (« Décris ton architecture… »), non du Python autonome ;
- `cours-algorithmes` rédige ses solutions — y compris dans les pages bonus — en **pseudocode français**
  (`ALGORITHME … DÉBUT … FIN`, `FONCTION … : ENTIER`), non en Python.

Conclusion : le **seul** cours à écriture Python réellement exécutable est le pilote `cours-python`.
La Phase 1 (exécution réelle) se concentre donc sur `cours-web` (JS) et les cours SQL. Les trois cours
ci-dessus relèvent des Phases 2 (distracteurs, examen) et 6 (checklist), plus — pour les deux projets —
des encadrés « 🖥️ À toi de jouer » et de la leçon finale « Publier et faire relire ». Aucun interpréteur
n'a été inventé pour du pseudocode ou du Django.

---

## Lot 2 — Web (JS) et SQL exécutables

Cours traités : `cours-web`, `cours-sql`, `cours-initiation-bdd`, `cours-sgbd-avance`.

### Runner unifié (déployé sur les 81 cours)
`exo-ecriture.js` gère désormais trois moteurs, choisis par `item.lang` :
- **python** : Pyodide (déjà en place) ;
- **sql** : SQLite WASM (sql.js, CDN, chargé à la demande) — `item.schema` crée les tables, la requête de
  l'élève s'exécute et son résultat s'affiche en tableau ; `tests = [{query?, expect, label, seed?}]`.
  `seed:true` = requête de test auto-portante évaluée sur les données de départ ;
- **js** : exécution dans une `<iframe>` sandboxée avec **prévisualisation live** ; `tests = [{code, label}]`
  où `document`/`window` désignent l'aperçu (tests DOM).
Le bouton ▶ n'apparaît que pour un item réellement exécutable ; `item.runnable:false` le neutralise.

### Vérificateur `_verify.js` étendu et durci
- Mode **SQL** : chaque test repart d'une base fraîche (schéma re-appliqué) ; par défaut la solution est
  appliquée avant la requête de contrôle (cas CREATE/INSERT/UPDATE), sauf `seed:true`. `runnable:false` → ignoré.
- Mode **JS** : mini-DOM maison (jsdom étant bloqué par la politique du bac à sable), suffisant pour le
  vocabulaire des tests (createElement, get/querySelector(All), appendChild, textContent, value,
  addEventListener('click')/click(), classList, children). Testé : clic ajoutant un `<li>` → OK.

### Résultat vérifié (gate à 100 %)
`_verify.js` sur les 4 cours : **59 exercices exécutables passent 100 % de leurs tests, 0 échec**.
Répartition — cours-sql : 19 exécutables ; initiation-bdd : 20 ; sgbd-avance : 12 ; cours-web : 8.
Parse `DAY`/`ECRITURE` : 0 fichier invalide ; **1303 QCM**, tous avec un index de bonne réponse valide.
Aucun artefact de test dans le dépôt.

### Corrections & décisions de contenu
- **`initiation-bdd/jour24`** : la solution SQL contenait `&gt;`/`&lt;` (entités HTML) au lieu de `>`/`<`,
  ce qui cassait l'exécution SQLite (« no such column: gt »). Corrigé en opérateurs réels.
- **`sgbd-avance` — 12 jours passés en non-exécutables (`runnable:false` + `sqlnote`)** : jours
  04, 05, 06, 09, 11, 16, 22, 23, 24, 26, 28, 31. Ils utilisent une syntaxe/des fonctions non supportées
  par SQLite (DATEDIFF, EXCEPT avec alias, LIMIT avant UNION, certaines fonctions chaîne/date, plus
  quelques schémas incomplets). Conformément à la règle « ne pas inventer d'exécution », ils affichent
  un `sqlnote` expliquant la différence SQLite/MySQL et gardent solution + grille d'auto-relecture.
  (Certains — 23/28/31 — sont en réalité corrigeables via un schéma complété : à ré-activer plus tard.)
- **Balise `balanceOpts`** désactivée dans les 4 `engine.js` (distracteurs pris en charge à la main).
- **Mode examen** (`examen.html`/`examen.js` avec garde-fou `file://`) créé pour les 4 cours ; liens
  « Mode examen » + « Tuteur IA » ajoutés à leurs sommaires.

### Audit des distracteurs (Phase 2.2) — terminé sur ce lot
La réécriture des distracteurs, interrompue lors du premier passage, a été **reprise et achevée** par un
audit dédié (un agent par cours, Tâche B seule, sans toucher aux tests/checklists). Sur les 104 leçons :
les distracteurs déjà plausibles ont été conservés ; seuls les distracteurs absurdes/vides ont été réécrits
en erreurs de compréhension crédibles (cours-sql : 6 QCM ; initiation-bdd : 19 ; sgbd-avance : 4 + jour31 ;
cours-web : 5). Contrôle final : **1303 QCM, tous avec un index de bonne réponse valide**, 0 fichier invalide,
`_verify.js` toujours à 0 échec.

### Corrections factuelles (Lot 2)
- **`cours-sql/lecon04`** : un QCM avait **deux bonnes réponses** — le distracteur `prixLocation tarif`
  (alias implicite sans `AS`) est en réalité valide, ce que la leçon enseigne. Remplacé par une option
  sans ambiguïté fausse ; l'index `a` et l'option correcte inchangés.
- **`cours-sgbd-avance/jour05`** : **erreur factuelle sur `CONCAT` et `NULL`**. La leçon affirmait que
  « CONCAT ignore les NULL » y compris en MySQL — c'est **faux** : en MySQL, `CONCAT` renvoie `NULL` dès
  qu'un argument est `NULL`. Seuls PostgreSQL et SQL Server (2012+) l'ignorent. Corrigé de façon cohérente :
  théorie (ligne MySQL → `NULL`), encadré de règle (le comportement dépend du SGBD ; `CONCAT_WS` ignore
  toujours les NULL), et l'exercice EX#3 « en MySQL » dont la bonne réponse passe de `'Jean '` à `NULL`
  (avec explication corrigée).
- **`cours-sgbd-avance/jour31`** : un second exercice d'écriture (`sgbd-j31b`) référençait une table absente
  de son schéma → passé en non-exécutable (`runnable:false` + `sqlnote`), comme les 12 autres jours avancés.
  Total sgbd-avance : **12 exécutables verts, 13 en `sqlnote`, 7 checklist**.

### Bug d'outillage corrigé
Ma première boucle de vérification pouvait **masquer** un item en échec quand un autre item du même fichier
était `disabled`. Boucle refaite pour compter **chaque item** séparément — c'est ainsi que le `sgbd-j31b`
caché a été retrouvé et corrigé.

---

## Lot 3 — Java / JVM (non exécutables dans le navigateur)

Cours traités : `cours-java` (31 leçons), `cours-projet-java`, `cours-projet-java-pro`, `cours-spring`,
`cours-hibernate` (21 chacun). Java ne tourne pas dans le navigateur : **aucun interpréteur inventé**.

### Nouveau bloc « 🖥️ À toi de jouer » (runner)
Le runner canonique rend désormais un champ `atoi: { cmd, expected }` : la **commande locale exacte**
(ex. `javac X.java && java X`, `./mvnw spring-boot:run`, `docker compose up`, `curl …`) et la **sortie
attendue exacte** à comparer, plus une `checklist` d'auto-vérification. Déployé sur les 81 cours.

### Vérification réelle des sorties Java attendues
Le sandbox a `java` (JDK 11) mais pas `javac` ; `_verify.js` gagne un **mode `java`** qui lance la solution
de référence via `java Fichier.java` (mode fichier unique, JEP 330) et compare sa sortie à `atoi.expected`.
Ce n'est pas une exécution navigateur : c'est un **contrôle que la sortie annoncée à l'élève est correcte**.

### Résultat vérifié
- **115 leçons**, toutes parsées (0 fichier invalide) ; **1894 QCM**, tous avec un index de bonne réponse valide.
- **108 encadrés « À toi de jouer »** ajoutés.
- **13 programmes Java** de `cours-java` sont réellement exécutés et leur sortie attendue vérifiée
  (`_verify.js` → `pass:1/1`). Les autres exercices Java (programmes interactifs à `Scanner`, code Spring/JPA
  non autonome, `record`/JUnit non compilables sous JDK 11) reçoivent un `atoi` descriptif + checklist,
  sans `lang:"java"` (donc ignorés par le gate, à dessein).
- Distracteurs réécrits sur les 5 cours (~590 QCM retouchés d'après les rapports) ; `balanceOpts` désactivé
  dans les 5 `engine.js` ; mode examen + liens Tuteur IA ajoutés aux 5 sommaires. Aucun artefact `.class`/`.java`.
- **Corrections factuelles : aucune** (les agents n'ont trouvé aucune mauvaise réponse). Un ajustement
  technique dans `cours-java/lecon14` : réordonnancement des classes pour que celle contenant `main` soit
  en tête (exigence du mode fichier unique de `java`), sans changer la logique.

### Note de structure
Les cours du parcours « fil rouge » (Java/Spring…) regroupent `var DAY` et `var ECRITURE` dans un **même
bloc `<script>`** (+ scripts `fil-rouge`). Le vérificateur et les contrôles d'intégrité ont été ajustés
pour gérer les deux structures ; `_verify.js` (qui ne lit que `ECRITURE`) n'était pas affecté.

---

## Lot 4 — C# / .NET (non exécutables, sans compilateur disponible)

Cours traités : `cours-csharp` (31 leçons), `cours-projet-csharp`, `cours-projet-csharp-pro`,
`cours-dotnet`, `cours-efcore` (21 chacun).

### Traitement
Même dispositif que les langages non navigateur : encadré « 🖥️ À toi de jouer » (`atoi: {cmd, expected}`)
avec la commande locale réelle (`dotnet run`, `dotnet test`, `dotnet ef …`, `docker compose up`, `curl -i …`)
et la sortie/le comportement attendu, plus une `checklist`. Distracteurs réécrits, `balanceOpts` désactivé,
mode examen + lien Tuteur IA sur les 5 sommaires.

### Résultat vérifié
- **115 leçons**, 0 parse-KO ; **1867 QCM**, tous avec un index de bonne réponse valide.
- **76 encadrés « À toi de jouer »**, **113 checklists** ; `_verify.js` : 0 FAIL ; aucun champ `lang` parasite ;
  aucun artefact `.cs`/`.dll`. `balanceOpts` off dans les 5 `engine.js`.
- Distracteurs : ~600 QCM retouchés d'après les rapports ; **aucune correction factuelle** signalée.

### ⚠️ Limite honnête — sorties C# NON vérifiées par machine
Contrairement au Java (où `java Fichier.java` permet de contrôler la sortie réelle), le sandbox **n'a pas de
compilateur C#** (`dotnet`/`mono`/`csc` absents). Les `atoi.expected` de ces cours **n'ont donc pas pu être
exécutés/gates** : leur exactitude repose sur le raisonnement des rédacteurs, qui ont privilégié des sorties
sûres (lignes `Console.WriteLine` littérales, codes HTTP, DDL généré par `dotnet ef`, résumés `dotnet test`).
C'est une différence de garantie assumée par rapport aux cours Python/JS/SQL/Java — signalée, pas masquée.

### Reprise après coupures de session
4 des 5 agents de ce lot ont été **coupés par la limite de session**. En reprenant, j'ai constaté que
`cours-projet-csharp-pro` avait ses distracteurs (Tâche B) faits mais **aucun `atoi`/checklist** (Tâche A),
et que `cours-dotnet` était incomplet sur 4 leçons (15, 19, 20, 21) — complétés par deux agents ciblés,
puis re-vérifiés item par item.

---

## Lot 5 — C / C++ (compilés et exécutés pour de vrai)

Cours traités : `cours-c`, `cours-projet-c`, `cours-projet-c-pro`, `cours-cpp-bas`, `cours-cpp-moderne`
(21 leçons chacun).

### Vérification réelle des sorties (gcc / g++)
Le sandbox a `gcc` et `g++` (Ubuntu 11.4, C++17). `_verify.js` gagne des modes **`c`** et **`cpp`** :
il **compile** la solution de référence puis **l'exécute** et compare la sortie à `atoi.expected`
(avec `stdin` simulé pour les programmes lisant au clavier). Contrairement au C# (non gaté),
les sorties C/C++ sont donc **réellement contrôlées**, comme pour Java et Python.

### Résultat vérifié
- **105 leçons**, 0 parse-KO ; **1997 QCM**, tous avec un index de bonne réponse valide.
- **67 programmes C/C++** effectivement **compilés + exécutés** et leur sortie vérifiée (`pass:1/1`) —
  cours-c 19, cpp-bas 17, cpp-moderne 19, projet-c 6, projet-c-pro 6. **98 encadrés « À toi de jouer »**.
- Fragments (fonction seule sans `main`), code lié à MySQL/Docker/CI, ou fonctionnalités C++20+ non
  compilables en C++17 → `atoi` descriptif sans `lang` (ignorés par le gate, à dessein).
- Distracteurs réécrits (~500 QCM), `balanceOpts` désactivé dans les 5 `engine.js`, mode examen + Tuteur IA
  sur les 5 sommaires. Aucun artefact `.o`/`.out`/binaire ni fichier généré (`locations.txt`, etc.) commité.

### Correction factuelle
- **`cours-projet-c-pro/lecon20`** : un QCM « Le rollback est possible car… » avait une **incohérence
  `a`/`exp`** (l'explication désignait l'option 0 « images versionnées conservées », mais `a` valait 1
  « on recompile tout »). Corrigé `a: 1 → a: 0`. Aucune autre correction factuelle sur le lot.

---

## Lot 6 — PHP (non exécutables, pas de php CLI dans le sandbox)

Cours traités : `cours-php` (31 leçons), `cours-projet-php`, `cours-projet-php-pro`, `cours-laravel`,
`cours-eloquent` (21 chacun).

### Traitement
Comme le C# : encadré « 🖥️ À toi de jouer » (`atoi: {cmd, expected}`) avec la commande locale réelle
(`php script.php`, `php -S`, `php artisan serve`/`migrate`/`tinker`/`test`, `docker compose up`, `curl`) et
la sortie/le comportement attendu, plus une `checklist`. Distracteurs réécrits, `balanceOpts` désactivé,
mode examen + Tuteur IA sur les 5 sommaires.

### Résultat vérifié
- **105 leçons**, 0 parse-KO ; **1904 QCM**, tous avec un index valide ; **99 encadrés « À toi de jouer »**,
  **113 checklists** (0 exercice sans checklist) ; `_verify.js` 0 FAIL ; aucun `lang` parasite ; aucun artefact.
  `balanceOpts` off dans les 5 `engine.js`.
- Distracteurs : audit complet — cours-php 18 QCM, projet-php 61, projet-php-pro 298, laravel 15, eloquent 9.
  **Aucune correction factuelle** signalée.

### ⚠️ Limite honnête + reprise après coupures
Le sandbox **n'a pas de `php`** : les `atoi.expected` **ne sont pas machine-vérifiés** (comme le C#) ; leur
exactitude repose sur le raisonnement des rédacteurs (sorties `echo` sûres, statuts HTTP, SQL généré par Eloquent).
Par ailleurs 3 des 5 agents ont été **coupés par la limite de session** : en reprenant, j'ai complété la
Tâche A manquante (`projet-php-pro` leçons 06-14, `cours-php` leçons 12/15/16/17/24) puis lancé un audit de
distracteurs dédié sur les 3 cours coupés (`cours-php`, `projet-php`, `projet-php-pro`), le tout re-vérifié item par item.

---

## Lot 7 — Assembleur (NASM x86-64, non gaté)

Cours traités : `cours-asm` (21 leçons), `cours-projet-asm` (8 leçons — projet « ludostat »).

### Traitement
Encadré « 🖥️ À toi de jouer » (`atoi`) avec la vraie chaîne d'assemblage/lien/exécution
(`nasm -felf64 prog.asm -o prog.o && ld prog.o -o prog && ./prog`, parfois `; echo $?` pour le code de
retour, ou liaison libc via `gcc -no-pie`) et la sortie/valeur attendue, plus une `checklist`.
Distracteurs réécrits, `balanceOpts` désactivé, mode examen + Tuteur IA sur les 2 sommaires.

### Résultat vérifié
- **29 leçons**, 0 parse-KO ; **551 QCM**, tous avec un index valide ; **24 encadrés « À toi de jouer »**,
  **29 checklists** (0 exercice sans checklist) ; `_verify.js` 0 FAIL ; aucun `lang` parasite ; aucun artefact.
- Distracteurs : cours-asm 37 QCM (61 options), projet-asm 48 QCM. **Aucune correction factuelle**.

### ⚠️ Limite honnête
`nasm` **n'est pas installé** et je n'ai pas les droits pour l'installer → les sorties assembleur **ne sont
pas machine-vérifiées** (comme C#/PHP). Les rédacteurs sont restés sur du sûr (chaîne écrite littérale via
`write`, code de retour via `exit`/`echo $?`). Les fragments non autonomes reçoivent une petite terminaison
(`mov rax,60 / syscall`) dans l'`expected` pour rester observables.

---

## Lot 8 — Python-serveur (Django/API) & SGBD-projets (Java/C#)

Cours traités : `cours-django`, `cours-django-orm`, `cours-api` (21 leçons chacun), `cours-projet-sgbd` (Java),
`cours-projet-sgbd-csharp` (C#) — ces deux derniers sur 31 jours.

### Traitement
Encadré « 🖥️ À toi de jouer » (`atoi`) avec la commande locale réelle (`python manage.py runserver`+`curl -i`,
`migrate`, `shell` avec `print(qs.query)`, `test` ; `javac/java` ou `dotnet run`, `mysql`) et sortie/comportement
attendu, plus une `checklist`. Distracteurs réécrits, `balanceOpts` désactivé, mode examen + Tuteur IA.

### Résultat vérifié
- **125 leçons**, 0 parse-KO ; **1491 QCM**, tous avec un index valide ; **113 encadrés « À toi de jouer »**,
  **127 checklists** (0 exercice sans checklist) ; `_verify.js` 0 FAIL ; aucun artefact.
- **5 items réellement gates** dans `cours-projet-sgbd` : 4 programmes Java autonomes (compilés+exécutés) +
  1 requête SQL standard (SQLite) → `pass:1/1`. Le reste (Django/DRF, C#/ADO.NET, MySQL-spécifique, conceptuel)
  est en `atoi` descriptif **non gaté** — honnêtement, faute de Django/dotnet dans le sandbox.
- **Aucune correction factuelle** dans les bonnes réponses.

### Amélioration de cohérence signalée
- **`cours-projet-sgbd-csharp`** : plusieurs distracteurs QCM contenaient des résidus de l'écosystème **Java/JavaFX**
  (JavaFX, `Scanner`, `ResultSet`, `Stage/Scene`, `stage.show()`) inadaptés à un cours **C#/.NET** — remplacés par
  leurs équivalents .NET (`System.Data.SqlClient`, `StreamReader`, `DataAdapter`, `DataTable`…). Cohérence
  pédagogique, pas une erreur de corrigé.

---

## Lot 9 — DevOps & outillage (Docker, CI/CD, Git, GitHub, Tests)

Cours traités : `cours-docker`, `cours-cicd`, `cours-tests` (21 leçons), `cours-git` (10),
`cours-github-debutant`, `cours-github-avance` (31 jours).

### Traitement
Encadré « 🖥️ À toi de jouer » (`atoi`) avec les commandes locales réelles (`docker build/run/compose`,
`git rebase -i/cherry-pick/bisect`, `git init/add/commit/log`, `gh`/workflows GitHub Actions, `pytest`/`mvn test`)
et la sortie/comportement attendu, plus une `checklist`. Distracteurs réécrits, `balanceOpts` désactivé,
mode examen + Tuteur IA sur les 6 sommaires.

### Résultat vérifié
- **135 leçons**, 0 parse-KO ; **1673 QCM**, tous avec un index valide ; **90 encadrés « À toi de jouer »**,
  **137 checklists** (0 exercice sans checklist) ; `_verify.js` 0 FAIL ; aucun `lang` (non machine-vérifié,
  comme C#/PHP) ; aucun artefact. **Aucune correction factuelle**.

### Reprise après coupures
4 des 6 agents ont été **coupés par la limite de session**. En reprenant : `cours-cicd` n'avait **aucun**
`atoi`/checklist (Tâche A refaite entièrement) ; `cours-github-avance` en manquait sur les jours 16-31
(complétés) ; les distracteurs de `cours-cicd`, `cours-docker` et `cours-github-avance` ont reçu leur audit
dédié. Le tout re-vérifié item par item (y compris le second exercice de `github-avance/jour31`).

---

## Lot 10 — Système (Linux, terminal, sécurité, Merise, MySQL, SQL Server, Active Directory ×2)

Cours traités : `cours-linux` (31), `cours-terminal` (31), `cours-securite` (21), `cours-merise` (21),
`cours-mysql` (21), `cours-sqlserver` (21), `cours-ad-scripts` (31), `cours-ad-interface` (31).

### Nouveau mode de vérification : `bash`
`_verify.js` gagne un mode **`bash`** : il exécute un script shell autonome et déterministe (le script crée
lui-même ses fichiers d'exemple) dans un dossier jetable et compare la sortie à `atoi.expected`. Pour les
commandes Linux.

### Résultat vérifié (structure)
- **208 leçons**, 0 parse-KO ; **2736 QCM**, tous avec un index valide ; **148 encadrés « À toi de jouer »**,
  **209 checklists** (0 exercice sans checklist) ; `_verify.js` 0 FAIL ; `balanceOpts` off partout.
- **28 items réellement gates** : `cours-linux` 10 (bash), `cours-mysql` 11 (SQLite), `cours-sqlserver` 7 (SQLite).
  Le reste (terminal multi-shell, PowerShell/AD, Merise conceptuel, T-SQL/MySQL-spécifique) est descriptif,
  souvent avec un `sqlnote` expliquant la spécificité (MySQL/T-SQL vs SQLite).
- Adaptations de portabilité SQL signalées : `cours-mysql/lecon05` (`REGEXP` → `LIKE` portable) et calibrage des
  jeux de données de test pour rester déterministes. **Aucune correction factuelle** de corrigé.

### Distracteurs de la 2ᵉ vague — audit terminé
Les 4 cours de la 2ᵉ vague (`cours-securite`, `cours-merise`, `cours-ad-scripts`, `cours-ad-interface`) avaient
leur Tâche B interrompue par la limite hebdomadaire ; elle a été **reprise et achevée** par un audit dédié
(un agent par cours). Distracteurs réécrits : sécurité 225 QCM, Merise 10, AD-scripts 17, AD-interface 23.
Contrôle final : **1250 QCM sur ces 4 cours, 0 index invalide, `_verify.js` 0 FAIL**. Aucune correction factuelle.
Le Lot 10 est donc **entièrement terminé et vérifié**.

---

## Phase 2 — cours sans code (réseau, Cisco, Office, langues)

Ces cours n'ont pas d'exécution de code : Phase 2 seulement (le mélange des QCM et les checklists y étaient déjà
en place via Prep-B/C).

### Infra mécanique (30 cours)
Sur les 6 cours réseau, 4 Cisco, 4 Office et 16 langues : **mode examen** (`examen.html`/`examen.js`, préfixe
localStorage auto-détecté par cours) + **lien Tuteur IA** ajoutés au sommaire, et **`balanceOpts` désactivé**
dans les 30 `engine.js`. Vérifié : 0 problème sur les 30.

### Distracteurs réseau + Cisco
Audit des 10 cours (réseau 6 + Cisco 4, soit 310 leçons, 3134 QCM). Distracteurs absurdes/hors-sujet
(« la couleur du câble », « Photoshop », « la météo du datacenter »…) réécrits en erreurs de compréhension
plausibles et cohérentes (mauvais protocole/port/couche, commande IOS crédible mais fausse, etc.). Les QCM déjà
solides ont été laissés intacts. **0 index invalide, `_verify.js` 0 FAIL, aucune correction factuelle.**
Distracteurs **Office (4)** audités ensuite (Excel/Excel-pro/Word/PowerPoint, 1265 QCM, 0 invalide, 0 FAIL,
aucune correction factuelle). Les **langues (16)** sont laissées telles quelles : leurs QCM testent du
vocabulaire/de la grammaire, où les distracteurs sont d'autres mots réels — les réécrire risquerait
d'introduire des ambiguïtés (choix assumé, signalé).

---

## Phase 3 — Orientation et priorisation

- **`orientation.html`** (nouvelle page, liée en évidence depuis l'accueil) : mini-questionnaire de 3 questions
  (niveau, objectif, centre d'intérêt) qui recommande **un seul parcours** parmi les 7 (Python, Java, C#, PHP,
  C, C++) et affiche un **planning honnête** (leçons totales réelles du parcours, semaines/mois selon un rythme
  choisi de 3 à 10 leçons/semaine). 100 % statique, logique de reco testée sur plusieurs cas.
- **Règle « un parcours à la fois »** ajoutée à l'accueil (encadré + bouton) et au `README.md` : le reste du
  site est présenté comme une **bibliothèque** où l'on pioche selon ses besoins, pas une liste à tout faire.
- Totaux réels par parcours (pour un planning non trompeur) : Python 335, Java 345, C# 345, PHP 345, C 293,
  C++ 314 leçons.

---

## Phase 5 — Sources et promesses recalibrées

- **Section « 📚 Sources et références »** ajoutée en bas des **81 sommaires** de cours : 2 à 4 liens
  **officiels** adaptés à chaque famille (docs.python.org, MDN, docs Oracle Java, Microsoft Learn .NET,
  cppreference, php.net/laravel, docs Django/DRF, docs Docker/Git/GitHub, RFC Editor, Cisco NetAcad,
  support.microsoft.com pour Office, dictionnaires de référence pour les langues, OWASP pour la sécurité…).
- **Version des technologies + date de dernière révision** affichées sur chaque sommaire
  (ex. « Python 3.14 · Août 2026 », « Java 21 (LTS) », « Laravel 11 », « .NET 8 »…).
- **Intitulés recalibrés** : `cours-securite` est déjà « **Sécurité applicative** » (pas de pentest) ;
  avertissements explicites ajoutés en tête des sommaires **CCNP** et **CCIE** (« ce cours couvre les
  concepts et la méthode ; la certification réelle exige des années de pratique et du labo, ce n'est pas
  un raccourci »).

---

## Phase 4 — Labs pratiques

- Nouveau champ **`lab: {title, intro, steps, check}`** rendu par le runner en encadré **« 🔬 Lab »**
  (étapes concrètes + **résultat vérifiable** : ping OK/KO, sortie d'un `show`, valeur d'une cellule…).
- **Réseau (6) + Cisco (4)** : un lab **Packet Tracer / GNS3 / CML** par leçon (topologie + config IOS réelle +
  résultat vérifiable), avec la mention d'installation de l'outil une seule fois par cours. Sujets non
  simulables (SD-WAN, SD-Access, automatisation) → lab alternatif réaliste (sandbox DevNet, Netmiko/Ansible…).
- **Office (Excel, Excel-pro, Word, PowerPoint)** : un mini-exercice **« À reproduire »** par leçon (manip
  précise + **résultat attendu exact** : valeur de cellule, apparence, nombre d'éléments).
- **Linux, terminal, Active Directory** : déjà couverts par les encadrés « À toi de jouer » à commandes
  vérifiables ajoutés au Lot 10 (dont 10 labs Linux réellement exécutés via bash).
- Contrôle : **429/429 leçons réseau/Cisco/Office ont un lab**, 0 sans lab, `_verify.js` 0 FAIL.

---

## Phase 6 — Feedback humain approximé (complément)

Le gros de la Phase 6 était déjà livré au fil des lots : **grille d'auto-relecture (`checklist`) sur tous les
exercices d'écriture du site**, et **`tuteur-ia.html`** liée depuis chaque sommaire de cours traité. Complément final :

- **`publier-et-faire-relire.html`** (nouvelle page capstone) : les 4 étapes pour qu'un projet fini « compte »
  vraiment — le pousser sur **GitHub**, écrire un **README** qui donne envie, le faire **relire** par un pair
  (Pull Request, revue), et savoir le **présenter en 2 minutes en entretien**. Avec un rappel de transparence :
  le site n'octroie **aucun diplôme** ; les vraies validations sont les examens du bachelier, les certifications
  officielles et le jugement d'humains.
- Liée par un bouton « 🚀 Étape finale » depuis les **15 sommaires `cours-projet-*`**.

---

## Correctifs post-audit (comblement des trous relevés)

Un audit point par point du prompt a révélé des manques réels, corrigés ici :

- **5 cours passés entre les mailles** — `cours-algorithmes`, `cours-projet-python`, `cours-projet-python-pro`,
  `cours-projet-cpp`, `cours-projet-cpp-pro` : ils avaient le mélange QCM (Prep-B) et la checklist par défaut
  (Prep-C), mais **pas** d'examen, de lien tuteur, de distracteurs audités ni de `balanceOpts` désactivé.
  Comblé : **mode examen + lien Tuteur IA + `balanceOpts` off** sur les 5, et **audit des distracteurs**
  (algorithmes 4 QCM, projet-python×2 177 options, projet-cpp×2 542 QCM). **1889 QCM, 0 index invalide, 0 FAIL.**
  Une **correction factuelle** : `cours-projet-cpp/lecon02` avait un mauvais index `a` (la bonne réponse était
  `target_link_libraries`, pas l'include) — corrigé `a:1 → a:0`. Nettoyage de caractères parasites (projet-cpp-pro).
- **Phase 3.2 (faite)** — sur les 7 `parcours-*.html` : marqueur **🎯 cœur du bachelier** / **🧭 optionnel · plus tard**
  sur chaque cours, **durée estimée par étape** (somme réelle des leçons), et une **légende** explicative.

### Écarts restants assumés (signalés, non masqués) — voir « Clôture » pour les corrections
- **Distracteurs des 16 cours de langues** : volontairement non réécrits (QCM de vocabulaire — les distracteurs
  y sont d'autres mots réels, les réécrire risquerait d'introduire des ambiguïtés).
- ~~**Titre CCIE** non renommé littéralement~~ → **résolu en Finition 3** (voir Clôture).
- **Sources** : 2 à 4 liens officiels par cours (le prompt suggérait 3 à 6).
- **« Publier et faire relire »** livré en **page transversale liée** depuis les 15 projets, pas en leçon interne à chaque cours.
- **Anti-bâclage** : relecture de 2 leçons/lot faite par échantillonnage/rapports d'agents, mais **pas consignée
  systématiquement** dans ce CHANGELOG.
- **Vérification navigateur de Pyodide** : non réalisable dans le bac à sable, laissée en cases à cocher pour un humain.

---

## Clôture — 5 finitions finales

### Finition 1 — Hygiène du dépôt (fait)
- `locations.txt` (résidu d'exécution des programmes C++ du Lot 5) **retiré du suivi Git** (`git rm --cached`) et du disque.
- `.gitignore` **élargi** : toutes les extensions d'artefacts que les exercices/vérificateurs génèrent
  (`*.txt`, `*.json`, `*.csv`, `*.dat`, `*.log`, `*.db`, `*.sqlite`) — le site ne contient **aucun** fichier de
  contenu portant ces extensions, donc l'ignorance est sûre ; + noms précis écrits par des solutions
  (`taches.json`, `carnet.json`, `locations.txt`, `catalogue.txt/json`, `classe.txt`, `data.json`, `jeu.txt`,
  `jeux.dat`, `journal.txt`, `notes.txt`, `scores.txt`, `f.txt`) ; + binaires (`a.out`, `*.exe`, `*.o`, `*.class`,
  `*.jar`, `prog`, `prog.out`) ; + le répertoire de travail dédié **`/_verify_tmp/`** (désormais utilisé pour toute
  vérification, jamais commité).
- **Balayage final** des fichiers suivis par Git hors `.html/.js/.css/.md/.gitignore/.nojekyll/.github` :
  **un seul** résultat, `cours-projet-asm/ludostat.s` — **source assembleur légitime** (134 lignes, syntaxe GAS
  Intel) du projet « ludostat », **référencée** dans le sommaire et 2 leçons du cours. **Conservée et justifiée.**
  Aucun autre artefact suivi.

### Finition 5 — GitHub Action : la qualité en continu (fait)
- **`_verify_all.js`** : lanceur qui découvre automatiquement les leçons « gatées » (champ `tests`, ou
  `lang` java/c/cpp avec sortie attendue) en scannant `cours-*/lecon*.html` et `jour*.html`, puis exécute
  `_verify.js` sur chacune. Sort en erreur au moindre FAIL. Validé localement (38/38 verts sur un sous-ensemble
  web/Java/C/MySQL ; les cours ont été vérifiés lot par lot pendant tout le chantier).
- **`_check_qcm.js`** : contrôle d'intégrité de TOUS les QCM — index `a` valide et **mélange déterministe
  préservant la bonne réponse** (échec bloquant) ; les QCM à 2 options (questions booléennes `true/false`
  légitimes) sont **comptés à titre informatif, sans bloquer** — imposer « exactement 4 » ferait échouer la CI
  à tort. Contrôle logique : 0 index invalide, 0 mélange cassé sur l'échantillon.
- **`.github/workflows/verify.yml`** : déclenché sur `push` et `pull_request` ; `ubuntu-latest`, `timeout 10 min` ;
  installe Node 20 et un JDK 17 (gcc/g++/python3 préinstallés) ; lance `_check_qcm.js` puis `_verify_all.js` ;
  **compile réellement C/C++/Java** (aucun langage silencieusement exclu) ; un dernier pas `git status --porcelain`
  **échoue si un artefact a été écrit** dans le dépôt (les exécutions ont lieu dans le dossier temp du système, hors dépôt).
- **`README.md`** : section « Qualité vérifiée automatiquement » ajoutée.
- **Activation** : je n'ai pas d'accès réseau vers GitHub depuis l'environnement de travail, donc je **ne peux pas
  fournir le lien d'un premier run vert**. Le workflow est **prêt et commité** ; il s'activera automatiquement au
  **premier `git push` vers GitHub** (aucune action supplémentaire requise — GitHub Actions détecte
  `.github/workflows/verify.yml`). Vérifie ensuite l'onglet **Actions** du dépôt pour le premier run.
- **Correctif d'isolation (`_verify.js`)** : les exécutions Python/Java/C/C++/bash tournent désormais **dans un
  dossier temporaire jetable** (`cwd`), pas dans le dépôt. Une solution qui écrit un fichier (le `taches.json` de
  Python, le `locations.txt` du C++) ne pollue donc plus le dépôt — c'était la cause racine des artefacts commités.
  Prouvé : relancer toutes les leçons C++/Python ne crée plus aucun fichier dans le dépôt.

### Finition 2 — Tests du cours web (fait)
Décompte final : **10 leçons testées / 11 exceptions justifiées / 21**.
- **+2 leçons nouvellement testées** (vrais tests JS, `lang:"js"`, `pass:4/4`) : `lecon15` (variables/types :
  `nomSite`, `nbJeux`=12, `estOuverte` booléen) et `lecon16` (fonctions du catalogue : `estPourEnfants`,
  `compterRapides` testées sur des cas construits + tableau vide). S'ajoutent aux 8 déjà équipées (02-07, 17, 18).
- **11 exceptions** (grille d'auto-relecture renforcée à 4 critères observables, pas de test artificiel) :
  01 (analyse rédactionnelle), 08 (guide couleurs), 09 (box model en prose), 10 (charte typo — Google Font),
  11 (repérage flex + CSS), 12 (audit Flexbox/Grid), 13 (plan responsive), 14 (feuille `style.css` complète),
  19 (validation d'un formulaire dont le DOM n'est pas fourni + `submit` non simulable), 20 (`fetch` réseau/async),
  21 (revue de son propre site). Justification commune : exercice **rédactionnel/visuel/réseau** dont un test
  automatique serait artificiel ou fragile — conformément à la consigne « ne force pas ».
- Gate : `_verify.js` sans FAIL sur les 21 (les testées en `pass:N/N`, les exceptions en `no-tests`).

### Finition 3 — Titre CCIE aligné sur son avertissement (fait)
- Sommaire `cours-cisco-ccie/index.html` : `<title>` et `<h1>` passent de « CCIE — Expert » à
  **« Théorie du niveau expert (concepts CCIE) »**.
- Vitrine `cisco.html` : la carte passe de « CCIE — Expert » à **« Théorie du niveau expert (concepts CCIE) »**.
- Balayage « CCIE » dans tout le dépôt : plus **aucune** page n'affiche « CCIE — Expert » comme titre. Les autres
  occurrences (`reseau.html` « CCST, CCNA, CCNP et CCIE » ; prose de `cisco.html` « l'expertise (CCIE) ») sont des
  mentions contextuelles exactes de l'acronyme, pas des titres survendeurs — laissées telles quelles.
- Contenu des leçons **non touché** (seul l'affichage du titre change). L'écart correspondant a été retiré de la
  liste « Écarts restants assumés ».

### Finition 4 — Transparence C#/PHP : sorties non certifiées par exécution (fait)
`dotnet` et `php` ne sont **pas disponibles** dans l'environnement de génération (vérifié) : les sorties
attendues des encadrés « À toi de jouer » de ces cours ne peuvent pas être certifiées par exécution réelle,
contrairement à Python, SQL, C, C++ et Java (eux vérifiés automatiquement par la CI). Plutôt que de le taire,
c'est désormais **affiché honnêtement** :
- **Note visible sur chaque sommaire** (encadré ambré, juste sous l'en-tête) des **11 cours concernés** :
  `cours-csharp`, `cours-dotnet`, `cours-efcore`, `cours-projet-csharp`, `cours-projet-csharp-pro`,
  `cours-projet-sgbd-csharp` (C#) ; `cours-php`, `cours-laravel`, `cours-eloquent`, `cours-projet-php`,
  `cours-projet-php-pro` (PHP). Texte : sorties relues mais **non certifiées par une exécution réelle** ;
  invitation à se fier à sa propre exécution en cas d'écart.
- **Une ligne discrète dans l'encadré « À toi de jouer » lui-même** (pas un pavé par leçon) : le runner
  `exo-ecriture.js` ajoute la note **uniquement** quand la constante `ATOI_UNCERTIFIED` vaut `true`. Cette
  constante est à `false` dans le runner canonique et passée à `true` dans les **11 copies** de ces cours
  (drapeau par cours, aucune leçon éditée individuellement). Balayage : 11 copies à `true`, 70 à `false`.
- **Choix assumé** : si `dotnet`/`php` deviennent disponibles un jour, la voie « vérifier » remplace la voie
  « noter » (comme fait pour Java/C/C++). En attendant, l'honnêteté prime sur l'apparence de complétude.

---

## Clôture du chantier — récapitulatif

Les 5 finitions demandées sont livrées, dans l'ordre 1 → 5 → 2 → 3 → 4, sans élargissement de périmètre :

1. **Hygiène du dépôt** — `locations.txt` retiré du suivi et du disque ; `.gitignore` couvre tous les artefacts
   d'exécution (fichiers écrits par les solutions, binaires, `/_verify_tmp/`) ; balayage final : seuls des
   `.html/.js/.css/.md/.gitignore/.nojekyll` et l'unique source légitime `cours-projet-asm/ludostat.s` sont suivis.
5. **Intégration continue** — `.github/workflows/verify.yml` + `_verify_all.js` + `_check_qcm.js` : exécutent les
   solutions de référence contre leurs tests (Python/JS/SQL) **et compilent C/C++/Java**, contrôlent l'intégrité
   des QCM, et échouent si un artefact est écrit. Correctif racine : `_verify.js` s'exécute hors dépôt (`cwd` temp).
   S'activera au premier `git push` (pas d'accès GitHub depuis l'environnement, donc pas de lien de run fourni).
2. **Tests cours web** — 10 leçons testées / 11 exceptions justifiées / 21 ; aucun FAIL.
3. **Titre CCIE** — « CCIE — Expert » → « Théorie du niveau expert (concepts CCIE) » sur le sommaire et la vitrine ;
   écart correspondant retiré.
4. **Transparence C#/PHP** — note honnête « sorties non certifiées par exécution » sur 11 sommaires + 1 ligne dans
   l'encadré « À toi de jouer » (drapeau `ATOI_UNCERTIFIED`).

**Aucune fausse affirmation** dans ce fichier : ce qui est vérifié par programme est décrit comme tel ; ce qui ne
peut pas l'être (rendu Pyodide en navigateur, sorties C#/PHP) est signalé explicitement.

### Correctif — l'encadré « Lab / À reproduire » ne divulgue plus la formule (fait)
Même problème que pour « À toi de jouer » : dans les cours Office, l'encadré **Lab — À reproduire** listait
les étapes 1) 2) 3) et **l'étape « tape : =SI(...) » donnait la formule exacte** demandée par l'exercice, donc
la solution était visible sans cliquer sur « Voir la solution ».
- **32 labs corrigés** dans **31 leçons** (`cours-excel` 15, `cours-excel-pro` 15, `cours-word` 2). La formule
  est remplacée par « **saisis ta formule (voir la consigne)** » ; on **conserve** la mise en place des données,
  la cellule cible, la recopie, et le **résultat vérifiable** (qui est la cible à atteindre, pas la formule).
- Détection programmatique : toute formule `=FONCTION(...)` (parenthèses équilibrées) ou `tape/Formule : =…`
  dans `lab.steps`. Après passe : **0 formule résiduelle**, **0 lab cassé** (JSON revalidé sur les 108 labs Office).
- **Cours réseau/Cisco non modifiés** : là, le Lab est un TP Packet Tracer **distinct** de l'exercice écrit
  (scénario et adresses différents de la solution de l'ECRITURE) — les étapes sont la consigne du TP, pas la
  réponse de l'exercice. Vérifié (ex. CCNA jour05 : lab sur 192.168.1.x, solution de l'exercice sur 192.168.20.0/24).
- Aucun changement de moteur (`exo-ecriture.js`) : correctif de **contenu** (`lab.steps`) uniquement.

## Cohérence & véracité (audits permanents)

### Mission 3.2 — Sondage aléatoire de véracité : 1 leçon par cours (81 leçons)

Tirage **réellement aléatoire et reproductible** : pour chaque cours, graine = `SHA-256("veracite-2026-08-02|" + nom_du_cours)`, puis `random.choice` sur la liste triée des fichiers de leçon. La liste tirée est consignée **ci-dessous avant toute lecture** (pas de sélection a posteriori). Fact-check en cours ; verdict et corrections ajoutés ensuite.

- `cours-ad-interface` → `jour29.html`
- `cours-ad-scripts` → `jour09.html`
- `cours-algorithmes` → `jour10.html`
- `cours-allemand-a1` → `jour25.html`
- `cours-allemand-a2` → `jour03.html`
- `cours-allemand-b1` → `jour30.html`
- `cours-allemand-b2` → `jour11.html`
- `cours-anglais-a1` → `jour03.html`
- `cours-anglais-a2` → `jour25.html`
- `cours-anglais-b1` → `jour25.html`
- `cours-anglais-b2` → `jour12.html`
- `cours-api` → `lecon15.html`
- `cours-asm` → `lecon17.html`
- `cours-c` → `lecon17.html`
- `cours-cicd` → `lecon03.html`
- `cours-cisco-ccie` → `jour10.html`
- `cours-cisco-ccna` → `jour02.html`
- `cours-cisco-ccnp` → `jour19.html`
- `cours-cisco-ccst` → `jour12.html`
- `cours-cpp-bas` → `lecon12.html`
- `cours-cpp-moderne` → `lecon19.html`
- `cours-csharp` → `lecon22.html`
- `cours-django` → `lecon09.html`
- `cours-django-orm` → `lecon20.html`
- `cours-docker` → `lecon19.html`
- `cours-dotnet` → `lecon21.html`
- `cours-efcore` → `lecon11.html`
- `cours-eloquent` → `lecon12.html`
- `cours-espagnol-a1` → `jour14.html`
- `cours-espagnol-a2` → `jour15.html`
- `cours-espagnol-b1` → `jour15.html`
- `cours-espagnol-b2` → `jour03.html`
- `cours-excel` → `jour11.html`
- `cours-excel-pro` → `jour16.html`
- `cours-git` → `lecon01.html`
- `cours-github-avance` → `jour04.html`
- `cours-github-debutant` → `jour31.html`
- `cours-hibernate` → `lecon16.html`
- `cours-initiation-bdd` → `jour19.html`
- `cours-java` → `lecon17.html`
- `cours-laravel` → `lecon06.html`
- `cours-linux` → `lecon06.html`
- `cours-merise` → `lecon16.html`
- `cours-mysql` → `lecon10.html`
- `cours-neerlandais-a1` → `jour25.html`
- `cours-neerlandais-a2` → `jour04.html`
- `cours-neerlandais-b1` → `jour02.html`
- `cours-neerlandais-b2` → `jour18.html`
- `cours-php` → `lecon13.html`
- `cours-powerpoint` → `jour06.html`
- `cours-projet-asm` → `lecon04.html`
- `cours-projet-c` → `lecon14.html`
- `cours-projet-c-pro` → `lecon04.html`
- `cours-projet-cpp` → `lecon11.html`
- `cours-projet-cpp-pro` → `lecon06.html`
- `cours-projet-csharp` → `lecon07.html`
- `cours-projet-csharp-pro` → `lecon08.html`
- `cours-projet-java` → `lecon12.html`
- `cours-projet-java-pro` → `lecon11.html`
- `cours-projet-php` → `lecon01.html`
- `cours-projet-php-pro` → `lecon16.html`
- `cours-projet-python` → `lecon02.html`
- `cours-projet-python-pro` → `lecon13.html`
- `cours-projet-sgbd` → `jour08.html`
- `cours-projet-sgbd-csharp` → `jour02.html`
- `cours-python` → `lecon05.html`
- `cours-reseau-avance` → `jour10.html`
- `cours-reseau-fondamentaux` → `jour14.html`
- `cours-reseau-ip-routage` → `jour16.html`
- `cours-reseau-securite` → `jour18.html`
- `cours-reseau-services-admin` → `jour13.html`
- `cours-reseau-transport-app` → `jour11.html`
- `cours-securite` → `lecon18.html`
- `cours-sgbd-avance` → `jour07.html`
- `cours-spring` → `lecon19.html`
- `cours-sql` → `lecon10.html`
- `cours-sqlserver` → `lecon15.html`
- `cours-terminal` → `jour04.html`
- `cours-tests` → `lecon18.html`
- `cours-web` → `lecon16.html`
- `cours-word` → `jour19.html`


**Verdict du sondage (81 leçons lues intégralement) : 78 propres / 3 corrigées.**
Chaque trouvaille de sous-agent a été contre-vérifiée par moi dans le code avant correction.

Corrigées :
- **`cours-eloquent/lecon12.html`** — `withCount()` était compté comme une requête SQL séparée. En réalité il
  ajoute une **sous-requête COUNT à l'intérieur** de la requête principale (0 requête en plus), comme l'affirme
  la théorie de la leçon elle-même. La requête `Jeu::with('editeur')->withCount('avis')->get()` fait donc
  **2 requêtes, pas 3**. Corrigé aux 3 endroits contradictoires (explication du QCM final, solution d'écriture,
  et bilan « → 8 » devenu « → 7 »). L'`atoi.expected` disait déjà « 2 requêtes » : la contradiction interne est levée.
- **`cours-neerlandais-b1/jour02.html`** — l'exercice imposait « Ze **hadden** het uur vergeten » (auxiliaire
  *hebben*) alors que le texte de la leçon écrit « Ze **waren** … vergeten » (auxiliaire *zijn*). Au sens « ne plus
  se souvenir », *vergeten* prend *zijn* (et admet les deux auxiliaires selon le sens). Exercice réaligné sur le
  texte (`waren`) avec une explication de la nuance ; plus de contradiction interne.
- **`cours-initiation-bdd/jour19.html`** — la théorie affirmait « `LENGTH(s)` retourne le nombre de caractères ».
  En MySQL, `LENGTH` compte les **octets** (`LENGTH('été')`=5 en UTF-8), `CHAR_LENGTH` compte les caractères.
  Théorie corrigée, et l'exercice qui acceptait `LENGTH` comme réponse à « compte correct des accents » n'accepte
  plus que `CHAR_LENGTH`.

Observations examinées mais **non retenues** comme erreurs (jugées correctes ou acceptables après vérification) :
`cours-merise/lecon16` note les cardinalités à regard croisé (inverse de la convention Merise « classique » mais
**cohérent dans toute la leçon** et produisant des schémas justes — convention, pas erreur) ; `cours-spring/lecon19`
appelle SLF4J une « bibliothèque de journalisation » (c'est une façade, simplification admissible) ;
`cours-projet-python-pro/lecon13` teste l'anti-XSS via `assertContains(r, "<script>")` (interprétable selon le
niveau d'encodage, non tranchable avec certitude) ; `cours-cisco-*` IPsec parle de « phase 1/2 » avec IKEv2
(terminologie IKEv1, mais présentation pédagogique courante et concept juste).

### Mission 2 — Cohérence sémantique (angle mort des audits automatiques)
**2.1 — Prérequis : ~138 mentions recensées, 0 incohérence.** Balayage de tous les `cours-*/index.html`, des
7 `parcours-*.html` et d'`orientation.html`. Vérifié pour chaque mention : le cours désigné existe, le niveau est
le bon, et l'ordre est cohérent (un prérequis vient avant dans les niveaux). Les deux pièges cherchés sont absents :
aucun « le cours SQL » ne renvoie par erreur vers MySQL/SQL Server (les trois sont bien distingués, et le parcours C#
utilise SQL Server de bout en bout), et aucun projet n'est donné comme prérequis de son propre cours de base.

**2.2 — Ateliers de langues (16 cours) :**
- **Clés localStorage propres au cours** : chaque `atelier.html` définit un préfixe unique (`at-en-a1`, `at-de-a1`,
  … `at-nl-b2`) → aucune collision de progression entre cours. Conforme.
- **1 erreur de contenu corrigée** — `cours-espagnol-a1/atelier.html` : le QCM « Es un ___ chico » marquait
  « grande » correct devant le nom (agrammatical : *grande* s'apocope en *gran* devant un nom singulier). Trou
  déplacé après le nom (« Es un chico ___ » → *grande* = grand par la taille), explication clarifiée.
- **Réponses non devinables** — l'audit a montré que le moteur `atelier.js` **ne mélangeait pas** les options :
  de nombreux onglets avaient toutes les bonnes réponses au même rang (souvent la 1re), donc devinables sans lire.
  Ajout d'un **mélange déterministe** (graine = énoncé, comme le moteur des leçons) : la bonne réponse est
  répartie sur toutes les positions, l'ordre restant stable au rechargement. Déployé sur les **16** cours.
- Liens internes des 16 ateliers : tous valides.

**2.3 — Orthographe (passe conservatrice) :** balayage heuristique du contenu français (mots doublés, coquilles
fréquentes) sur toutes les leçons. **0 faute indiscutable** : tous les mots doublés détectés sont légitimes (labels
de crontab « jour-du-mois mois », variables shell `$lignes lignes`, gabarit CSS `"pied pied"`, ou tournures valides
« le reste reste… »). Cohérent avec le sondage des 81 leçons et les audits de langues, qui n'ont relevé aucune
faute d'orthographe. Aucune réécriture de style (respect de la consigne « conservateur »).

### Mission 3.3/3.4 — Inventaire d'obsolescence + dates de révision
- **`_veille.md`** créé (racine) : carte des affirmations **périssables**. Une section transverse (Pyodide `v0.26.4`,
  sql.js, `bleach`→`nh3`, dates « Août 2026 », watchlist d'outils dépréciés) + un tableau **par cours** (81 cours,
  5 familles) donnant la techno couverte, les versions citées (scan automatique, signalé comme indicatif) et les
  chiffres datés. Le scan de la watchlist d'outils dépréciés n'a trouvé **aucun** cas dormant en plus de `bleach`.
- **Dates de révision** : les 81 sommaires portaient déjà « 🗓️ Dernière révision : Août 2026 » + la techno couverte
  (phase 5). La campagne se déroulant en août 2026, les cours modifiés restent correctement datés — aucune date à
  corriger.

### Mission 4 — Armer le lecteur
- **Lien « ⚠️ Signaler une erreur »** ajouté en pied des **81** sommaires (section Sources) : ouvre une **issue GitHub
  préremplie** (`github.com/TrainingPath/formation/issues/new`) avec le **nom du cours** dans le titre et le corps, et
  le label `erreur-contenu`. Suppose le dépôt public avec issues activées ; sinon, remplacer l'URL par un `mailto:`.
- **`tuteur-ia.html`** : ajout d'un encadré **« réflexe anti-hallucination »** — si l'exécution contredit le cours
  alors que le code semble juste, croire l'exécution, vérifier sur la source officielle, puis signaler l'écart via le
  lien de signalement du cours.

### Bilan « Cohérence & véracité » et ce qui reste non couvert
**Fait :** scanner de cohérence permanent vert et branché en CI (liens, compteurs, structure, orphelins) ; `bleach`
remplacée par `nh3` partout ; sondage aléatoire d'1 leçon/cours (81) documenté avant lecture, **78 propres / 3
corrigées** ; prérequis (~138 mentions) sans incohérence ; ateliers de langues audités (1 erreur corrigée + mélange
des QCM ajouté aux 16) ; passe orthographique conservatrice (0 faute indiscutable) ; `_veille.md` construit ;
signalement d'erreur en deux clics sur les 81 sommaires ; règle anti-hallucination publiée.

**Ce qui reste non couvert (honnêtement) :**
- La cohérence **sémantique** n'est pas vérifiée par la CI : `_coherence.js` garantit la structure (liens/compteurs/
  fichiers), pas l'exactitude d'une phrase. Seule une relecture humaine ou un nouveau sondage l'étend.
- Le **fact-check reste un échantillon** : 81 leçons sur ~2 080 (1 par cours). Le taux d'erreur observé est faible
  (~4 % des leçons tirées, erreurs mineures), mais les ~1 999 leçons non tirées n'ont pas été relues cette fois.
- Le **rendu navigateur réel** (Pyodide/sql.js en conditions Internet) n'est toujours pas exécuté par la CI (pas
  d'accès navigateur) — cases à cocher humaines, déjà documentées.
- L'**orthographe** a été balayée par heuristique, sans correcteur orthographique français (indisponible dans
  l'environnement) : une passe outillée reste souhaitable pour une garantie exhaustive.
- Les **versions/outils** vieilliront : `_veille.md` en est la carte, mais la revérification demande une action
  humaine périodique (la CI ne peut pas juger qu'une version est « périmée »).

---

## Catégorie « Analyse » et formation UML (31 jours)

### Mission A — La catégorie Analyse
- **`analyse.html`** (racine) : nouveau hub à deux cartes — 🧩 **Merise** (`cours-merise`, **inchangé**) et 📐 **UML**
  (`cours-uml`, nouveau). Intro : analyser et concevoir avant de coder ; deux écoles complémentaires (Merise = les
  données, école française ; UML = l'objet, standard international), plus une section « laquelle choisir ».
- **`index.html`** : nouvelle tuile « 🧠 Analyse — 2 cours ».
- **Comptage, règle « un cours = une seule catégorie »** : `cours-merise` **déménage** de Programmation vers Analyse.
  Compteur Programmation **41 → 40** dans `index.html`, `programmation.html` et `README.md`. Les `parcours-*.html`
  ne sont pas des catégories : **Merise y reste à sa place (niveau 4), rien n'y a été touché**.
- **`_coherence.js` non affaibli** : aucune attente n'était codée en dur. Le scanner attribue un cours au hub qui le
  **liste directement** ; `analyse.html` listant Merise et UML, l'arithmétique se vérifie d'elle-même.
  Run final : **82 dossiers = somme des compteurs**, 82/82 atteignables, **750 liens vérifiés, 0 écart**.

### Mission B.1 — Les sources : inventaire du dossier PAC (lu intégralement)
16 PDF, ~180 pages, convertis en texte et lus : `1 - Cours d'analyse et de conception` (7 p) · `Cahier des charges V2`
(13 p) · `User_stories - ET` (11 p) · `Chapitre 4-2 — Le MCD avec UML` (**61 p**) · `2 - Les diagrammes structurels —
ClasseObjet` (28 p) · `3 - Composant` (6 p) · `4 - Déploiement` (5 p) · `5 - Paquetage` (4 p) · `6 - Structure
composite` (2 p) · `7 - Use case` (15 p) · `8 - État-transition` (8 p) · `9 - Activité` (10 p) · `10 - Séquence`
(13 p) · `11 - Communication` (3 p) · `12 - Global d'interaction` (2 p) · `13 - Temps` (2 p).

**Dialecte de l'école repris dans le cours** : sigles DCU/DCL/DOB/DCP/DPL/DPA/DSC/DET/DAC/DSE/DCO/DGI/DTP ;
« multiplicité » (jamais « cardinalité ») ; « paquetage », « nœud », « couloir d'activités », « point de jonction /
de choix » ; gabarit de description textuelle en 3 blocs **IDENTIFICATION / SÉQUENCEMENT / RUBRIQUES OPTIONNELLES**.

**Écarts école ↔ UML 2.5.1** — le standard est enseigné, la variante de l'école signalée dans un encadré `warn` :
1. le support annonce **13 diagrammes** (il omet le **diagramme de profils**) — la norme en compte **14** ;
2. l'identifiant est noté **`{Unique}`**, non normatif (l'usage est le soulignement) ;
3. « la super-classe est par définition une classe abstraite » — **faux** en UML ;
4. la généralisation est décrite avec une « pointe triangulaire **pleine** » — elle est **creuse** ;
5. le sens de `<<extend>>` est formulé de façon contradictoire ;
6. le **diagramme de structure composite** est réduit aux collaborations de rôles (ni parts, ni ports, ni connecteurs) ;
7. « **treize** opérateurs » de séquence — UML en définit **12** (`ref` est une InteractionUse ; `weak` s'appelle `seq`
   et conserve l'ordre sur chaque ligne de vie) ;
8. le diagramme d'activités garde le vocabulaire « transition / état initial » d'**UML 1.x** ;
9. `junction` (statique) et `choice` (dynamique) présentés sans leur distinction ; H et H\* non distingués ;
10. contraintes traduites en français (`{interdit}`, `{chevauchement}`…) au lieu des mots-clés normatifs.

### Mission B.2-B.4 — La formation `cours-uml/`
**31 jours**, préfixe localStorage propre **`uml31-j*`** (aucune clé existante touchée), moteur du gabarit
(borne 31, mélange des options actif, `balanceOpts` neutralisé), `examen.html`/`examen.js` avec garde-fou `file://`.

Squelette livré : **S1 Comprendre et cadrer** (pourquoi modéliser ; UML vs Merise ; cas d'utilisation ×2 ; activités
×2 ; cahier des charges et user stories) · **S2 La structure** (classes ×3 ; objets ; paquetages ; classes → code ;
classes → base de données) · **S3 Le comportement** (séquence ×2 ; communication ; machine à états ×2 ; temps ; vue
d'ensemble des interactions) · **S4 Architecture et synthèse** (composants ; déploiement ; structure composite ;
profils ; cohérence entre diagrammes ; étude de cas ×2 ; modélisation avancée des données ; révision ; examen final).

**Les 14 diagrammes ont chacun au moins une leçon dédiée**, profils compris (jour 25) — celui que le support de
l'école omet.

**Fil rouge** : la **vraie** Ludothèque du site (Jeu, Catégorie, Membre, Employé, Exemplaire, Location, Vente,
Achat, Réservation, Avis, Éditeur ; `stock_location`, `stock_vente`, `prix_location`, `prix_vente`, `date_debut`,
`date_fin`, `caution` ; service `louer(client, jeu_id, nb_jours=7)`). Le diagramme de classes du jour 14 correspond
au MCD Merise, et les tables SQL générées sont en **MySQL** (`AUTO_INCREMENT`, `ENGINE=InnoDB`), comme `cours-merise`
et `cours-mysql`.

**Rendu des diagrammes** : chaque solution est donnée en **syntaxe PlantUML commentée ligne par ligne** (texte que
l'élève peut retaper et comparer). **Aucun rendu Mermaid n'a été intégré** : plusieurs types au programme (temps,
structure composite, profils, communication, vue d'ensemble) ne sont pas rendus par Mermaid, et le cours ne promet
donc nulle part une prévisualisation qui n'existerait pas. Le dossier `cours-uml/img/` est créé mais **vide** : les
diagrammes sont décrits en art ASCII commenté dans la théorie et en PlantUML dans les solutions — **aucun SVG n'a
été produit à ce stade** (voir « reste à faire »).

**Pas de champ `tests`** dans les exercices d'écriture : un diagramme ne s'auto-corrige pas. C'est la **grille de
relecture renforcée** (4 critères observables par jour) qui joue ce rôle, comme pour les leçons HTML/CSS.

### Mission B.5 — Qualité
- **Contrôle structurel automatisé sur les 31 jours** : `DAY` et `ECRITURE` parsent, **exactement 15 exercices**,
  QCM à **4 options** avec index valide, `exp` partout, `final` à 5 questions, `ECRITURE` avec 3 indices +
  checklist de 4 critères, **aucun champ `tests`**. Résultat : **31/31 conformes**.
- **`_check_qcm.js`** sur tout le dépôt : 0 index invalide, 0 mélange cassé.
- **Code exécuté, pas seulement relu** : le Python du jour 13 passe `ast.parse` ; les `CREATE TABLE` du jour 14 ont
  été **réellement exécutés** (5/5 tables créées : `categorie`, `jeu`, `exemplaire`, `membre`, `location`, avec
  clés primaires, clés étrangères et `ON DELETE CASCADE` pour la composition).
- **Relecture de 3 jours tirés au hasard** (graine `relecture-uml-2026-08-02` → **jours 10, 12 et 20**), consignée
  avant lecture. Verdict : **2 propres / 1 corrigé**.
  - `jour12` — **deux incohérences réelles corrigées** : (a) le schéma d'architecture de la §9 dessinait deux
    `«import»` vers `Persistance` alors que sa propre légende annonçait un `«access»`, ce qui **ruinait la
    démonstration de non-transitivité** enseignée par la leçon ; (b) la démonstration de l'exercice d'écriture était
    invalidée par son propre découpage (elle accordait un accès direct à `Persistance` puis affirmait que ce
    paquetage ne la voyait pas). Schéma redressé, accès directs retirés, et « (un stéréotype) » supprimé —
    `«import»`/`«access»`/`«merge»` sont des **mots-clés**, pas des stéréotypes.
  - `jour10` et `jour20` : propres (notation, index des QCM et cohérence des explications vérifiés).

### Mission C — Intégrations
- **`README.md`** : ligne « 🧠 Analyse | Merise · UML (31 jours, les 14 diagrammes, fil rouge Ludothèque) ».
- **`orientation.html`** : section « Et l'analyse dans tout ça ? » — Merise est déjà une étape des parcours ;
  **UML est optionnel** (avant ou pendant un parcours) et **recommandé si l'école enseigne l'analyse**. Le
  questionnaire n'est pas modifié.
- **Carte UML « 🧭 optionnel »** ajoutée à côté de Merise dans les **6 parcours** qui contiennent Merise
  (`java, python, csharp, php, c, cpp`) — conforme au marquage 🎯/🧭 existant. Les pieds de page comportant un
  décompte sont passés de **16 à 17 cours** (4 fichiers) ; `parcours-asm/c/cpp` ont un pied descriptif sans
  décompte, donc inchangé.
- **`_veille.md`** : entrées ajoutées pour **UML 2.5.1** (revérifier le nombre de diagrammes et la notation si l'OMG
  publie une révision ; la comparaison « 13 vs 14 » est datée du support 2025-2026) et pour les **outils cités**
  (PlantUML, draw.io).

### Ce qui reste à faire, honnêtement
- **Les SVG de `cours-uml/img/` ne sont pas produits.** Le dossier existe mais est vide : les diagrammes vivent
  aujourd'hui en art ASCII (théorie) et en PlantUML (solutions), ce qui est lisible et comparable, mais moins
  confortable qu'une image. Le prompt demandait aussi des SVG rendus — ils restent à générer.
- **Le PlantUML n'a pas été rendu réellement** (pas d'accès à un serveur PlantUML depuis l'environnement) : la
  syntaxe a été relue et vérifiée manuellement, pas compilée. À passer une fois dans plantuml.com pour confirmation.
- **Le fact-check ne couvre que 3 jours sur 31** (le tirage aléatoire demandé). Les 28 autres ont été validés
  structurellement et sur les points de notation sensibles, pas relus ligne à ligne.

---

## Test de placement par langue (4 langues)

### M1 — Le référentiel, extrait des 16 syllabus réels
Lecture des `TITLES` des 16 `cours-<langue>-<niveau>/index.html` (30 leçons chacun) et des lexiques
thématiques. Principe directeur : le test mesure l'adéquation avec **ces cours-ci**, pas un niveau CECRL
abstrait. Les 4 langues ont une **architecture parallèle** (mêmes thèmes aux mêmes paliers), d'où un moteur
unique et 4 banques symétriques.

- **A1** — alphabet, se présenter, pronoms sujets, les deux verbes piliers (*to be/have got* · *zijn/hebben* ·
  *ser/estar/tener* · *sein/haben*), articles, pluriel, nombres et âge, possessifs, présent des réguliers,
  négation et questions, heure/jours/dates, famille, nourriture et goûts, capacité, *there is/er is/hay/es gibt*,
  prépositions de lieu, routine, courses, chemin, passé d'être/avoir.
  Spécifiques : **NL** ordre V2, particules séparables · **ES** ser/estar, diphtongues, *ir a* ·
  **DE** accusatif, datif, verbes forts · **EN** présent simple vs continu.
- **A2** — passés (composé, prétérit, *Perfekt*, *indefinido/imperfecto*), auxiliaire avoir/être, futur,
  comparatif et superlatif, adverbes de fréquence, quantifieurs, pronoms compléments, prépositions de temps,
  connecteurs, conditionnel simple ; thèmes corps, vêtements, voyage, restaurant, ville, météo, loisirs.
  Spécifiques : **EN** present perfect vs prétérit, modaux · **NL** subordonnées *omdat/dat/als*, *er* +
  préposition · **ES** *por/para*, impératif affirmatif · **DE** déclinaison de l'adjectif, *Wechselpräpositionen*.
- **B1** — temps composés avancés, passif, discours indirect, relatives, conditionnel irréel, connecteurs
  avancés, registre ; thèmes travail/CV, entretien, émotions, environnement, médias, opinion.
  Spécifiques : **EN** past perfect, conditionnels 2-3, gérondif/infinitif, phrasal verbs · **NL** *om…te*,
  *waarmee*, particules modales, diminutifs · **ES** **subjonctif présent**, impératif négatif ·
  **DE** **génitif**, *Relativsätze*, Konjunktiv I et II.
- **B2** — aspect, hypothèses complexes, passif avancé, modaux au passé, inversion et mise en relief, style
  nominal, collocations, idiomes, registre, argumentation, implicite et ironie.
  Spécifiques : **EN** conditionnels mixtes, *wish*, clivées · **NL** *als/wanneer/toen*, participes adjectivaux ·
  **ES** **subjonctif imparfait**, concordance des temps · **DE** *Konjunktiv II* du passé, *Zustandspassiv*.

### M2 — Un moteur, quatre banques
**`test-niveau.js`** (racine) — escalier adaptatif, utilisable sans DOM (donc testable en CI).
- **Bloc = 6 questions** : 4 QCM (1 pt) + **2 saisies libres (2 pts)** = 8 points. Les QCM ne pèsent que 4 pts :
  **un bloc ne peut pas être réussi par les seuls QCM**, et une saisie juste est **éliminatoire** pour monter.
- **Seuils** : `>= 7/8` et `>= 1` saisie juste → on monte ; `= 6/8` → **on s'arrête** (règle du doute) ;
  sinon → échec. Documentés en commentaire au-dessus du code.
- **Départ au bloc A2** (on teste d'abord si l'élève dépasse le débutant).
- **Sortie rapide** : 3 erreurs consécutives dans le premier bloc **et aucune bonne réponse jusque-là** → arrêt,
  résultat A1, message chaleureux. *La condition « aucune bonne réponse » a été ajoutée après que la CI a montré
  qu'un élève maîtrisant A1 mais butant sur A2 était renvoyé en A1 sans jamais voir le bloc A1 — voir M3.*
- **Mapping** : le palier recommandé est celui du **premier bloc non franchement réussi**. Réussir A2 signifie
  que A2 est acquis → entrée B1 ; échouer B1 confirme B1 comme point de départ.
- Longueur réelle : **12 à 18 questions**, ≤ 6 en sortie rapide (plafond de 25 jamais approché).
- Résultat mémorisé dans **`placement-<langue>`** (palier + date) — **clé additive**, aucune clé existante touchée.
  Bouton « refaire le test » ; le moteur relit la clé pour afficher le dernier résultat.
- Mélange des options : **exactement le mécanisme déterministe des engines du site** (graine = énoncé, LCG,
  index recalculé). Normalisation des saisies : le même `norm()` (minuscules, accents, espaces).
- **Pas d'audio ni de synthèse vocale** : périmètre fermé, conformément à l'avis du Conseil.

**Les 4 banques** (`test-niveau-<langue>.js`) : **48 questions par langue**, soit **12 par palier**
(8 QCM + 4 saisies), chacune étiquetée par son `palier` et par le `point` de syllabus qu'elle vise.
Saisies libres = **conjugaison** (forme à produire) et **traduction** depuis le français, avec réponses
acceptées multiples. Distracteurs = erreurs réelles de francophones (*seid/seit*, ser/estar, *de/het*, mauvais
auxiliaire, verbe non rejeté après *weil*/*omdat*, faux amis).

**Les 4 pages** : `test-anglais.html`, `test-neerlandais.html`, `test-espagnol.html`, `test-allemand.html` —
intro d'une phrase, avertissement de périmètre affiché **avant** le test, le test, le résultat.

### M3 — La logique de placement, testée en CI
**`_verify_placement.js`** (famille `_verify`, branché dans `.github/workflows/verify.yml`). Personas simulés
sur les 4 langues, résultats du run final :

| Persona | Attendu | Obtenu |
|---|---|---|
| Débutante complète (0 bonne réponse) | A1, sortie rapide, ≤ 8 q | **A1 en 3 questions** ✔ |
| A1 solide, A2 échoué | A2 | **A2 (12 q)** ✔ |
| 1 bonne réponse puis échec total | pas de sortie rapide | **pas de sortie rapide** ✔ |
| A2 solide, B1 échoué | B1 | **B1 (12 q)** ✔ |
| A2+B1 acquis, B2 échoué | B2 | **B2 (18 q)** ✔ |
| Réussit tout | B2 + mention plafond | **B2 + mention (18 q)** ✔ |
| A2 réussi de justesse (6/8) | A2 (pas de montée) | **A2** ✔ |
| B1 réussi de justesse | B1 (pas de montée) | **B1** ✔ |
| QCM seuls, aucune saisie | ne doit pas passer | **A1** ✔ |

Contrôle des banques : ≥ 10 questions par palier, ≥ 6 QCM et ≥ 3 saisies (de quoi varier le tirage), 4 options
par QCM, index valides, pas de doublon d'énoncé, mélange préservant la bonne réponse.
**Non-contamination** : les 192 questions sont confrontées aux **~14 000 énoncés** extraits des leçons, ateliers
et examens des 16 cours → **0 recouvrement**.

**Deux défauts trouvés par la CI et corrigés** (c'est précisément pourquoi ces tests existent) :
1. **Sortie rapide trop large** — un élève maîtrisant A1 mais ratant les 3 premières questions A2 était placé en
   A1 sans jamais voir le bloc A1, alors que le mapping le destine à A2. Correctif : la sortie rapide exige
   désormais qu'**aucune** réponse juste n'ait été donnée (signature de la vraie débutante).
2. **3 énoncés contaminés** — deux formulations génériques (« Choisis la phrase correcte. », « Quelle phrase est
   correcte ? ») coïncidaient avec des questions des cours, et l'idiome espagnol « estar en las nubes » est
   réellement enseigné en B2. Énoncés rendus spécifiques, idiome remplacé par « estar como una cabra » (absent
   des cours, vérifié).

### M4 — Intégrations
- **`langue.html`** : encadré « Tu connais déjà un peu la langue ? » avec les 4 boutons de test.
- **Les 4 pages de langue** (`anglais.html`, `neerlandais.html`, `espagnol.html`, `allemand.html`) : bouton
  « 🧭 Je ne sais pas par où commencer — teste ton niveau », et **rappel du résultat mémorisé** s'il existe
  (« Ton point de départ conseillé : A2 (test du JJ/MM) »).
- **`orientation.html`** : la section « Et tout le reste ? » renvoie vers les tests de langue. Le questionnaire
  existant n'est pas modifié.
- **Boucle de sortie** : ligne ajoutée sur les **16 sommaires** — « Palier terminé ? L'examen du cours te sert de
  test de sortie ; réussi confortablement → passe au palier suivant. » Aucun nouvel exercice : l'examen existe déjà.
- **`README.md`** : mention du test de placement dans la ligne Langues.
- **`_veille.md`** : dépendance **banque ↔ syllabus** notée (si un syllabus change, la banque doit suivre ; le
  champ `point` de chaque question sert de point d'entrée pour la mise à jour).

**Validation finale** : `_coherence.js` **783 liens, 82 cours, 0 écart** · `_verify_placement.js` **conforme** ·
`_check_qcm.js` **0 échec**.

**Périmètre assumé, affiché à l'élève** : « Ce test est une boussole, pas un diplôme : il évalue la lecture et la
grammaire sur le contenu de ces cours ; il ne mesure ni l'oral ni l'expression. En cas d'hésitation, commence au
palier en dessous. » Le mot « CECRL » ne sert qu'à nommer les paliers des cours, jamais à qualifier l'élève.

---

## Blocs « Visualiser ce diagramme » (cours UML)

Chaque diagramme décrit dans `cours-uml/` a désormais son **jumeau visuel** ouvrable en un clic. Les schémas
ASCII restent : ils enseignent la structure, le bloc visuel la confirme.

### Le composant
**`cours-uml/mermaid-bloc.js`** — injecté par le moteur, **aucun code dupliqué dans les 31 leçons**. Chaque bloc
contient : le code du diagramme, un bouton **📋 Copier le code**, un lien **▶ Ouvrir dans Mermaid Live / PlantUML**
déjà chargé avec le diagramme, un bouton **👁 Afficher le rendu ici** (Mermaid chargé depuis le CDN **à la demande**,
comme Pyodide — hors ligne, le bloc reste utile), et l'encadré d'honnêteté :
« Mermaid t'aide à VOIR le diagramme ; à l'examen, tu dessines la notation UML officielle montrée dans la théorie. »

**Le piège des backticks a été contourné, pas affronté.** `DAY.theory` est une template literal : y insérer du code
de diagramme aurait imposé d'échapper backticks et `${...}`, avec un risque réel de casser le parsing. Les diagrammes
vivent donc dans un tableau **`DIAGRAMMES` séparé**, où `code` est une chaîne JS ordinaire. **`DAY.theory` n'est pas
modifié du tout.** Chaque bloc s'ancre par index sur le `<pre class="pseudo">` qu'il illustre.

Les **URL sont pré-calculées hors ligne** (deflate + base64url pour Mermaid, deflate brut + alphabet PlantUML) :
aucune bibliothèque de compression dans le navigateur, et la CI peut vérifier lien ↔ code.

### Couverture : 28 leçons / 31 · 36 blocs
Non couvertes, **volontairement** : **jour 1** (pourquoi modéliser — cadrage, MOA/MOE, cycle de vie : aucun
diagramme décrit), **jour 7** (cahier des charges et user stories — méthodologie rédactionnelle), **jour 30**
(révision : catalogue de pièges en prose « à tort / pourquoi / il faut »). Aucun bloc décoratif n'a été ajouté.

### Tableau type de diagramme → outil → justification

| Diagramme UML | Outil | Justification |
|---|---|---|
| Classes | **Mermaid** `classDiagram` | type natif et fidèle ; rendu inline |
| Séquence | **Mermaid** `sequenceDiagram` | natif, y compris `alt/opt/loop/par` |
| Machine à états | **Mermaid** `stateDiagram-v2` | natif, états composites compris |
| Activités | **Mermaid** `flowchart` | représentation standard des activités |
| Schéma relationnel (jour 14) | **Mermaid** `erDiagram` | natif |
| **Cas d'utilisation** | **PlantUML** | Mermaid n'a pas ce type. PlantUML connaît `actor`/`usecase`/`rectangle` : l'étudiante voit la **notation officielle** (bonshommes, ellipses), pas une approximation. *Choix validé explicitement.* |
| Objets | **PlantUML** `object` | Mermaid ne le connaît pas |
| Paquetages | **PlantUML** `package` | idem |
| Communication | **PlantUML** | idem |
| Temps (timing) | **PlantUML** `robust`/`concise` | idem |
| Vue d'ensemble des interactions | **PlantUML** | idem |
| Composants | **PlantUML** `component` + interfaces | idem |
| Déploiement | **PlantUML** `node`/`artifact` | idem |
| Structure composite | **PlantUML** ports/parts | idem |
| Profils | **PlantUML** `<<Profile>>` | idem |

**Aucun bloc « Mermaid-approximation » ne subsiste** : soit le type est natif chez Mermaid, soit c'est PlantUML.
Répartition finale : **19 Mermaid natif · 17 PlantUML · 0 approximation**.

### Vérification — `_verify_mermaid.js` (branché dans la CI)
Contrôle : les 31 leçons parsent toujours (DAY + DIAGRAMMES) ; chaque bloc a un outil connu, un titre et un code
non vide ; l'ancre `apres` désigne un `<pre class="pseudo">` existant ; **chaque lien se décode exactement vers le
code affiché à côté** (aucun lien désynchronisé) ; validité du code.
Dernier run : **36 blocs, 0 problème**. Le script sait aussi recalculer les URL (`--fix-urls`).

**Il a trouvé trois vraies erreurs pendant le chantier**, ce qui justifie son existence :
1. un `re.sub` de mon générateur réinterprétait les `\n` de la chaîne de remplacement et **corrompait le JSON
   injecté** — leçon cassée, détectée immédiatement ;
2. `/valeurStock : Real` (attribut dérivé UML) n'est **pas** de la syntaxe Mermaid valide — notation déportée
   dans une note ;
3. un faux positif de mon propre contrôle (la patte-d'oie `||--o{` d'un `erDiagram` contient une accolade qui
   n'ouvre rien) — le **contrôle** a été corrigé, pas le contenu, et un contre-test confirme qu'il mord toujours
   sur un vrai déséquilibre et sur un lien désynchronisé.

### Ce qui est prouvé, et ce qui ne l'est pas — à lire avant de croire ce chantier
- **Encodage PlantUML : prouvé de bout en bout.** J'ai encodé un diagramme, appelé l'endpoint `/txt/` du serveur
  officiel, et il a renvoyé le diagramme attendu (séquence, puis acteur + cas d'utilisation). L'encodage est donc
  réellement accepté par le serveur, pas seulement auto-cohérent.
- **Rendu Mermaid : vu pour 4 types sur 4 utilisés.** `classDiagram`, `sequenceDiagram`, `stateDiagram-v2` et
  `erDiagram` ont été **réellement rendus** et regardés (Mermaid 11 via CDN), ainsi que les `flowchart` d'activités.
- **Parseur Mermaid officiel : NON utilisé.** `npm install mermaid` est refusé (403) dans l'environnement de
  génération. Le contrôle de `_verify_mermaid.js` est donc **structurel** (en-tête reconnu, délimiteurs équilibrés,
  syntaxe par type), pas un passage par le parseur. Un diagramme peut être structurellement correct et mal rendre.
- **Syntaxe PlantUML des types rares : non rendue.** L'endpoint `/txt/` ne produit de l'ASCII que pour les
  séquences ; il renvoie vide aussi bien pour du bon que du mauvais code sur les diagrammes de temps, de structure
  composite ou de profil. Ces syntaxes sont écrites d'après la documentation PlantUML mais **n'ont pas été rendues**.

**☐ Vérification visuelle humaine — reste à faire.** Ouvrir quelques leçons dans un navigateur connecté et cliquer
« Afficher le rendu ici » puis « Ouvrir dans PlantUML », en particulier **jour 20** (temps), **jour 24** (structure
composite) et **jour 25** (profils), dont la syntaxe n'a pas pu être rendue ici.

### Relecture de 3 leçons tirées au sort
Graine `relecture-mermaid-2026-08-04` → **jours 3, 20 et 26**, tirés parmi les 28 couvertes. Vérifié pour chacune :
le bloc est ancré sous le bon schéma ASCII (jour 3 : frontière / généralisation / récapitulatif ; jour 20 : la
frise de l'Exemplaire n°42 ; jour 26 : la machine à états de `Location`), le contenu reprend les entités
Ludothèque du schéma, et aucun backtick ne traîne dans le code. **3 leçons propres.**

### Intégration
`cours-uml/index.html` : bandeau « 🧪 Nouveau : chaque diagramme décrit se visualise en un clic » + mention du bloc
dans la section « Avant de commencer ». Le cours n'a pas de page fil-rouge distincte : les diagrammes récapitulatifs
sont dans les leçons 26 et 31, qui ont reçu leurs blocs.

---

## Onglet « Vocabulaire » (4 langues)

Le lexique d'un cours **montre** les mots. L'onglet Vocabulaire **interroge** : sessions de 20 QCM générés,
filtrables par niveau, catégorie et sens (langue → français, ou l'inverse), avec révision espacée à trois boîtes.
Pages `vocabulaire-<langue>.html`, moteur unique `vocab.js`, une banque par langue.

### Le risque identifié dès le départ, et la parade
Le danger de ce module n'est pas technique : c'est **une banque de mots générée de mémoire — des traductions
inventées, apprises par cœur par une élève confiante**. La parade est structurelle plutôt que déclarative.

**La banque est DÉRIVÉE des lexiques du site.** `_outils/vocabulaire/vocabgen2.py` lit les quatre `lexique.html`
de chaque langue et en extrait mot, traduction et phrase d'exemple **tels quels**. Aucune traduction n'est créée
à cette étape, donc aucune ne peut être fausse d'une façon dont le cours ne le serait pas déjà. Et
`_verify_vocab.js` reconfronte chaque mot du lexique à la banque : **400 entrées par langue, 0 absente,
0 divergente** — une divergence d'un seul mot fait échouer le build.

**Le reste est écrit à la main, puis passé au crible.** Pour atteindre un volume utile, une extension a été
écrite (`_outils/vocabulaire/vocab_ext_<code>.py`), limitée au vocabulaire concret et fréquent. Les mots à double
sens ont été écartés dès l'écriture : `bank`, `letter`, `right`, `still` en anglais ; `die Decke`
(couverture/plafond), `das Gericht` (tribunal/plat), `die Tasche` (poche/sac) en allemand.

| Langue | Total | Des lexiques | Extension (relue) |
|---|---|---|---|
| Néerlandais | 553 | 396 | 157 |
| Anglais | 657 | 400 | 257 |
| Espagnol | 667 | 397 | 270 |
| Allemand | 655 | 400 | 255 |

Les intitulés de thèmes diffèrent d'une langue à l'autre (« Nourriture & boisson » / « La nourriture » /
« Au restaurant »…). La classification en 19 catégories se fait donc **par mots-clés du titre de thème**, pas par
table figée. Un bug attrapé au passage : sans limite de mot, le motif `verbe` matchait `adverbes`, et le thème
allemand « Nuances & adverbes de modalité » atterrissait chez les verbes.

### Le défaut le plus sérieux trouvé pendant ce chantier : les QCM à deux bonnes réponses
Le moteur excluait déjà tout distracteur partageant une traduction **identique** avec le mot visé. Un audit a
montré que ça ne suffisait pas. **22 paires** de traductions synonymes cohabitaient dans le même vivier — dont
plusieurs **venant des lexiques eux-mêmes**, donc antérieures à ce chantier :

- `salary` = salaire et `wage` = paie (anglais) — deux chaînes différentes, une seule bonne réponse ;
- `spreken` et `praten`, tous deux « parler » (néerlandais) ;
- `laufen` et `rennen`, tous deux « courir » (allemand) ;
- `het huis` = la maison et `de woning` = le logement ;
- `el enfado` et `la ira`, tous deux « la colère » (espagnol).

L'élève qui coche « paie » a raison, et le site lui compte une erreur. Nouveau fichier **`vocab-synonymes.js`** :
une table de familles de mots français interchangeables, partagée par le moteur et le vérificateur. Deux entrées
dont les traductions tombent dans la même famille ne peuvent plus se retrouver dans le même QCM.

Deux limites, dites franchement. **La table est incomplète** — le français a plus de synonymes qu'elle n'en liste ;
elle couvre les collisions effectivement constatées et se complètera au fil des signalements. Et **le vérificateur
partage cette table avec le moteur** : il ne peut donc pas détecter une paire absente de la table. Ce n'est pas un
oracle, c'est un filet dont on connaît la maille.

### Ce que la CI vérifie désormais (`_verify_vocab.js`, branché dans `verify.yml`)
1. Schéma, niveaux et catégories connus, aucun mot en double.
2. Concordance lexiques ↔ banque (400 entrées par langue confrontées).
3. **Épreuve du feu** : le vrai moteur produit **les 5 136 questions possibles**, dans les deux sens, et chacune
   est inspectée — exactement une bonne réponse, aucune option en double, aucune paire synonyme. 6 questions sont
   *refusées* par le moteur faute de distracteurs sûrs : c'est le comportement voulu, pas de question plutôt
   qu'une mauvaise.
4. **Contrôle du vivier, pas seulement du tirage.** Première version du test : inspecter les 3 distracteurs tirés.
   Elle passait **même avec l'exclusion des synonymes désactivée** — le distracteur dangereux restait admissible
   sans jamais sortir dans l'échantillon. Le test a donc été refait pour interroger le moteur sur **l'ensemble des
   distracteurs qu'il s'autorise** (`Vocab.vivierPour`). Contre-test : exclusion désactivée → **13 alertes**,
   exclusion active → **0**.
5. Personas Leitner (mot raté → boîte 1, révision servant les boîtes basses).

### Correctif de fond : la normalisation ignorait les parenthèses
Les lexiques écrivent « bonjour (le matin) » à côté de « bonjour, salut ». `norm()` ne retirait pas les
parenthèses : le moteur voyait deux réponses distinctes et pouvait proposer les deux. Retrait ajouté dans
`vocab.js`, `_verify_vocab.js` et `vocab-synonymes.js` — les trois doivent normaliser à l'identique, sans quoi le
vérificateur ne teste pas ce que le moteur fait.

### Signalement d'erreur : le lien GitHub retiré
Le module affichait « ⚠️ Signaler une traduction douteuse » pointant vers une issue GitHub. **Le site est public** :
un visiteur aurait eu besoin d'un compte GitHub, et le dépôt était exposé. Le lien est maintenant piloté par une
constante unique en tête de `vocab.js` (`URL_SIGNALEMENT`), à remplir avec l'URL d'un formulaire hébergé. **Tant
qu'elle est vide, aucun lien n'est affiché** — rien plutôt qu'un lien mort. *(Les mêmes liens GitHub subsistent en
pied des 82 sommaires de cours : même problème, pas encore traité.)*

### Ce qui n'est PAS vérifié — à lire avant de faire confiance à ce module
- **Les ~940 mots de l'extension n'ont été confrontés à aucune source externe.** Vérifié pendant ce chantier :
  PyPI répond **403**, `apt` n'a pas les droits, `web_fetch` expire. Aucun dictionnaire n'est atteignable. La revue
  décrite ci-dessus a donc été faite **par le même auteur que les listes** : c'est un durcissement du critère
  d'admission, pas une vérification indépendante.
- **☐ Relecture humaine — reste à faire.** C'est la seule chose qui lèverait le point précédent. Les corrections se
  portent sur `_outils/vocabulaire/vocab_ext_<code>.py` et `revue_extension.py`, jamais sur le `.js` généré.
- **☐ Vérification navigateur — reste à faire.** Les quatre pages n'ont pas été ouvertes dans un navigateur :
  le moteur a été testé en Node. Reste à vérifier l'affichage réel des compteurs à trois boîtes et le repère ⚠.

### Stockage
Nouvelles clés `vocab-<langue>-boxes` uniquement. **Aucune clé localStorage existante n'a été touchée** : les
scores des cours et des tests de placement sont intacts.

### Intégration
Bouton « 📚 Vocabulaire — se faire interroger » sur les 4 pages de langue et bloc dédié sur `langue.html`.
`README.md` : ligne Langues complétée et section CI enrichie. `.gitignore` : ajout de `__pycache__/`.

### Suite — revue mot à mot, et retrait du repère ⚠
Le repère ⚠ posé sur chaque mot d'extension gênait plus qu'il n'aidait : il s'affichait aussi bien sur `adult` =
adulte que sur un mot réellement douteux, donc il n'informait de rien. Demande explicite de retirer le repère et
l'encadré « D'où viennent ces mots ? ». Ce qui ne peut pas se faire en cachant l'incertitude : il fallait la
supprimer.

**Recherche préalable d'une source externe — échec.** `pip` : proxy **403 Forbidden** sur PyPI. `apt-get update` :
pas de droits sur `/var/lib/apt/lists`. `web_fetch` sur un dictionnaire : **expiration à 180 s**. Aucune
vérification indépendante n'est possible depuis cet environnement, et il fallait le dire avant de promettre quoi
que ce soit.

**Revue appliquée** (`_outils/vocabulaire/revue_extension.py`, appelée par le générateur) : les 978 mots
d'extension relus un par un, avec suppression — et non signalement — de tout ce qui n'est pas d'une évidence
absolue. **44 mots retirés, 12 traductions corrigées.** Trois motifs, portés par chaque entrée :

- **Polysémie source** — `de neef` (cousin ET neveu), `esperar` (attendre ET espérer), `das Schloss` (château ET
  serrure), `leihen` (prêter ET emprunter), `la estación` (gare ET saison).
- **Glose française ambiguë** — `to carry` = « porter » recouvre aussi *to wear* ; `sicher`/`seguro`/`veilig` =
  « sûr » se comprend aussi comme « certain » (corrigés en « sûr (sans danger) »).
- **Variante régionale** — décisif ici, l'élève est en Belgique : `lopen` = marcher aux Pays-Bas mais **courir**
  en Belgique ; `schoon` = propre aux Pays-Bas mais **beau** en Flandre ; `pavement` = trottoir au Royaume-Uni mais
  **chaussée** aux États-Unis.

Le générateur **échoue** si un mot listé dans la revue est absent des extensions : sans ce garde-fou, une faute de
frappe passerait pour une suppression effectuée. Compte rendu complet et reproductible dans `vocab-revue.md`,
généré depuis la revue elle-même — il ne peut pas raconter autre chose que ce qui est appliqué.

**Conséquences dans l'interface** : `source` passe de `non-verifie` à `revu` ; le ⚠ disparaît des questions ;
l'encadré « D'où viennent ces mots ? » et la ligne de comptage « N ajoutés pour le volume » sont retirés des
4 pages. Volumes après revue : 553 nl, 657 en, 667 es, 655 de. `_verify_vocab.js` reste vert : 5 060 questions
générées, 0 défaut, 0 divergence avec les lexiques.

**Ce que ce retrait ne signifie pas.** Le site n'affirme plus « non vérifié », mais il n'affirme pas non plus
« vérifié ». La transparence a été déplacée de l'interface vers `vocab-revue.md` et `_veille.md`, où elle est plus
complète — et non supprimée. L'élève voit un module propre ; la personne qui maintient le site sait exactement ce
qui a été relu, par qui, et ce que ça vaut.

### Suite — le formulaire de signalement existe
Créé dans Google Forms et publié : **« Signaler une erreur — Mes formations »**.

- **Accès « toute personne disposant du lien »** : ni compte Google, ni connexion. Le paramètre *Collecter les
  adresses e-mail* est sur « Ne pas collecter » et *Limiter à une réponse* est désactivé — les deux forceraient
  une connexion, ce qui recréerait exactement le problème du lien GitHub qu'on venait de retirer.
- **Quatre champs** : cours ou page concernée (obligatoire), ce qui est affiché (obligatoire), ce qui semble
  juste, où ça a été vu.
- **Pré-remplissage vérifié** : `URL_SIGNALEMENT` contient `{cours}`, substitué par `signalement.js` dans le
  paramètre `entry.1187902726`. Testé en ouvrant l'URL avec `cours-uml` : le champ arrive rempli. Le visiteur n'a
  donc pas à recopier l'identifiant du cours, et la mention « (cours : …) » disparaît automatiquement du lien
  puisqu'elle ne sert plus à rien.
- Le `&` de l'URL est échappé en `&amp;` dans l'attribut `href` — correct pour un analyseur strict, indifférent
  pour un navigateur.
- `_coherence.js` rapporte désormais **« formulaire CONFIGURÉ »** : 82/82 sommaires équipés, 82 chargent le
  script, 0 lien GitHub résiduel.

**☐ Vérification navigateur — toujours à faire.** L'extension Chrome ne peut pas ouvrir d'URL `file://` : le rendu
réel du lien sur un sommaire et sur une page de vocabulaire n'a pas été vu. Le HTML produit a été contrôlé en Node
(les trois états : non configuré, configuré simple, configuré avec pré-remplissage), ce qui n'est pas la même chose
que l'avoir regardé.

---

## Entraînement du jour — 3 exercices d'application par leçon

### Phase 0 — Contrat de style, extrait des deux PDF de l'école
Deux chapitres du cours de l'élève servent de modèle : *Chapitre 5 — Les fonctions récursives* (8 pages,
théorie + 6 exercices) et *Chapitre 7 — Les principes du concept objet, TP1* (2 pages, exercices seuls).
Lecture faite avant toute rédaction. Sept traits en ressortent ; ils forment le contrat auquel chaque
exercice produit doit se conformer, et que `_verify_entrainement.js` contrôle mécaniquement là où c'est
possible.

**C1 — L'énoncé décrit un programme complet, en prose.** Le PDF écrit : « On demande à l'utilisateur de
saisir un entier. La valeur sera ensuite transmise à une procédure récursive qui affichera la même valeur
traduite en binaire. » Entrée, traitement, sortie : les trois sont dits. Jamais de squelette de code
pré-rempli, jamais de `# TODO`. L'élève part de la page blanche.

**C2 — Le principe est donné quand il est mathématique, jamais l'algorithme.** Pour le PGCD, le PDF fournit
la relation de récurrence — `PGCD(a,0) = a` et `PGCD(a,b) = PGCD(b, a mod b)` — puis laisse l'implémentation
entière à faire. L'exercice teste la traduction en code, pas la redécouverte d'un théorème.

**C3 — Une application filée évolue d'exercice en exercice.** Le TP objet ouvre sur « Reprendre l'application
Bibliothèque et la classe Livre développées au cours de l'exercice 2 du chapitre précédent ». L'élève ne
résout pas des énigmes indépendantes : il fait grandir un programme.

**C4 — Les sous-questions s'enchaînent en a/b/c/d et se répondent l'une l'autre.** Le TP déroule : rendre les
propriétés privées → *que se passe-t-il à la compilation ? pourquoi ?* → écrire `setTitre()` → en déduire les
autres accesseurs → adapter l'application → *est-il nécessaire de créer `setCode()` ? pourquoi ?* La question
2.d ne trouve sa réponse qu'à la question 4.

**C5 — Des questions de prédiction et de réflexion, sans code.** « Exécutez l'application. Que se passe-t-il ?
Pourquoi ? » Ces questions ne sont pas de la décoration : elles vérifient que l'élève a compris le mécanisme,
pas seulement recopié une forme. Leur corrigé est une explication rédigée.

**C6 — Des remarques de bonne pratique dans l'énoncé.** « L'utilisation des méthodes d'accès en écriture au
sein du constructeur n'est pas réellement obligatoire. Mais plus généralement, cela peut être utile pour
s'assurer de la validité des données. » Le PDF enseigne le métier en marge de l'exercice.

**C7 — Une méthode nommée et imposée quand le sujet en a une.** Le chapitre 5 impose pour toute récursivité :
*Étape 1* trouver l'expression commune à tous les appels ; *Étape 2* trouver le point d'arrêt ; *Étape 3*
vérifier qu'à chaque appel on s'en rapproche. La démarche fait partie de ce qui est évalué.

### Ce que le contrat implique pour les 5 indices
Le risque de l'indiçage généré est d'écrire cinq fois la même phrase. La gradation est donc imposée et
contrôlée : ① reformuler et découper le problème · ② le plan, en français, sans nommer d'outil du langage ·
③ le pseudocode partiel ou la signature · ④ le morceau de code du point dur, seul · ⑤ le quasi-squelette
commenté. L'indice 5 aide encore ; il ne donne pas la solution. Le vérificateur refuse deux indices trop
proches et refuse toute ligne de solution qui réapparaîtrait dans un indice, dans l'énoncé ou dans la
checklist — c'est le défaut « l'encadré donne la réponse » déjà corrigé sur ce site, il ne doit pas revenir
par une autre porte.

### Moteur, vérificateur et pilote — leçons 1 et 2 de `cours-python`

**`cours-python/entrainement.js`** — moteur unique, aucun code dupliqué dans les leçons : elles ne portent que
l'objet `ENTRAINEMENT`. Trois garanties tenues par le code, pas par la consigne :
les **indices se révèlent un par un** (impossible de tomber sur le cinquième en cherchant le premier) ; la
**solution n'est pas dans le DOM avant d'être demandée** — elle est construite au clic, une inspection de la page
ne la révèle pas ; la **checklist s'affiche avant** le bouton de solution. Le chargeur Pyodide est partagé avec
`exo-ecriture.js` (ajout d'une seule ligne d'export, rien de modifié) : sans ce partage, une leçon téléchargerait
deux fois 6 Mo d'interpréteur.

**`_verify_entrainement.js`**, branché dans la CI. Sept contrôles, dont trois méritent d'être nommés :

- **Anti-paraphrase.** Deux indices dont le vocabulaire se recouvre à 72 % ou plus sont refusés. C'est le défaut
  attendu de l'indiçage généré : cinq phrases qui disent la même chose et ne font franchir aucune marche.
- **Anti-fuite.** Aucune ligne de code de la solution (26 caractères ou plus, commentaires exclus) ne peut
  apparaître dans l'énoncé, le principe, un indice ou la checklist. **Ce contrôle a immédiatement servi** : il a
  refusé mon propre indice 5 de l'exercice 2.2, qui reprenait `print(reference, type(reference))` mot pour mot.
  Le défaut « l'encadré donne la réponse » avait déjà été corrigé une fois sur ce site ; il revenait par une
  autre porte.
- **Solutions rejouées.** Les solutions de référence ne sont pas déclarées justes, elles sont **exécutées** par
  `python3` contre leurs propres tests, avec la même sémantique que le navigateur (stdout capturé et exposé sous
  `__output__`, `input()` alimenté par `stdin`). 6 solutions, 32 tests, tous verts.

**Contre-tests — six fautes injectées, six refus.** Deux indices rendus quasi identiques → refusés à 94 % de
recouvrement. Une ligne de solution glissée dans un indice → fuite détectée. Quatre indices au lieu de cinq →
refusé. Une solution rendue fausse (`Colfontaine` → `Mons`) → le test correspondant échoue à l'exécution. Un
énoncé réduit à 21 caractères → refusé. Toutes les questions de réflexion retirées → contrat C5 signalé.

*Une précision honnête sur ce dernier cas :* ma première tentative n'a **pas** déclenché l'alerte, parce que je
n'avais retiré qu'une des deux questions de réflexion de la leçon — or le contrôle s'applique **par leçon**, pas
par exercice. Le contre-test était faux, pas le contrôle. Corrigé, il déclenche.

**Pilote — leçons 1 et 2.** 6 exercices, 30 indices, 32 tests. Le fil rouge Ludothèque démarre : l'enseigne
écrite en dur au jour 1, puis sortie du code vers des variables au jour 2, l'exercice 2.3 partant explicitement
du programme de la veille avec un lien de rattrapage pour qui a sauté un jour. La question de réflexion du jour 1
(« quelle version sera la plus pénible à modifier demain ? ») trouve sa réponse dans l'exercice du jour 2 : c'est
le mécanisme du TP objet de l'école, où la question 2.d ne se résout qu'à la question 4.

**Adaptation nécessaire au contrat C1.** Le PDF de l'école écrit systématiquement « on demande à l'utilisateur de
saisir… ». Impossible aux leçons 1 à 3 de ce cours : `input()` n'est enseigné qu'en leçon 4. Les énoncés
décrivent donc un programme complet **sans saisie** jusque-là, puis reprennent la formulation de l'école ensuite.
C'est un écart assumé au modèle, pas un oubli.

**☐ Reste à faire.** Les 19 autres leçons de `cours-python`, puis les 8 cours suivants. Et la vérification
navigateur : l'extension Chrome ne peut pas ouvrir d'URL `file://`, donc le rendu réel de la section — révélation
des indices, bouton d'exécution, affichage de la solution — n'a pas été vu. Tout a été contrôlé en Node.

### Correctif de cadrage — sortie du fil rouge Ludothèque
Première version du pilote : les trois exercices se déroulaient dans l'univers Ludothèque du site, par cohérence
avec le fil rouge existant. **Refusé, et à juste titre** : 63 exercices sur les jeux de société pour le seul
`cours-python`, c'est une monotonie garantie. Nouvelle règle, arbitrée avec l'élève :

- **Exercices 1 et 2 : un domaine différent à chaque fois**, tiré d'un réservoir de trente sujets
  (`_outils/entrainement/plan-domaines.md`). Le jour 1 se joue en météo et au théâtre, le jour 2 en cuisine et
  en course à pied.
- **Exercice 3 : une mini-série de 3 à 4 jours**, puis changement complet de sujet. On garde le bénéfice du
  « reprends ton programme d'hier » — c'est le mécanisme du TP objet de l'école — sans imposer un thème unique
  pendant 21 leçons. Six séries planifiées pour `cours-python` : panneau de cinéma, carnet de recettes, carnet
  d'entraînement, station météo, journal d'observation, budget de festival.

Le plan n'est pas qu'une intention : chaque exercice porte un champ `domaine`, et **le vérificateur refuse**
deux domaines identiques dans une même leçon, un domaine déjà servi à moins de quatre leçons d'écart, et toute
série déclarée sur plus de quatre jours — « au-delà, ce n'est plus une mini-série mais un fil rouge déguisé ».
Trois contre-tests supplémentaires le confirment (domaines identiques, domaine trop récent, série de 6 jours) :
neuf contre-tests au total, neuf refus.

Il contrôle aussi la continuité des séries : jours numérotés sans trou ni doublon, sur des leçons consécutives.

**Bug rencontré et corrigé pendant cette réécriture.** `re.sub` interprète les séquences d'échappement du texte
de **remplacement** : les `\n` des solutions Python sont devenus de vrais retours à la ligne, et les deux leçons
ont cessé de parser. Le vérificateur l'a signalé immédiatement (« ENTRAINEMENT ne parse pas »). Corrigé en
passant par un `lambda`. C'est la deuxième fois que ce piège se referme sur ce dépôt — la première remontait au
chantier UML, où il avait corrompu du JSON injecté.

### État réel du déploiement — 4 leçons sur 229
`cours-python` leçons 1 à 4 : **12 exercices, 60 indices, 61 tests rejoués, tous verts.** Deux mini-séries
engagées — le panneau de cinéma (3/3, terminée) et le carnet de recettes (1/4). Douze domaines distincts déjà
servis : météo, théâtre, cinéma, cuisine, sport, banque, astronomie, transports, jardinage.

**Le volume réel de la mission demandée.** Les neuf cours de langages totalisent **229 leçons, soit 687
exercices** : 93 pour algorithmes, java, csharp et php ; 63 pour python, c, cpp-bas, cpp-moderne et asm. À la
densité du pilote — énoncé en prose, principe, sous-questions, réflexion, 5 indices gradués, solution commentée,
corrigé des questions de réflexion, tests exécutés, checklist — un exercice représente une quarantaine de lignes
écrites à la main. L'ensemble dépasse les 27 000 lignes.

Ce n'est pas un travail qui se termine en une séance, et le dire maintenant vaut mieux que livrer un quart du
chantier en laissant croire qu'il est presque fini. Le rythme réalisable est d'environ **quatre à six leçons par
séance** en gardant ce niveau ; au-delà, les énoncés deviennent interchangeables et les indices se paraphrasent —
ce que le vérificateur attrape parfois, mais qui reste surtout une question de soin.

**Deux erreurs de calcul attrapées par le vérificateur pendant ce lot.** L'exercice 3.3 annonçait une recette de
1 009,90 € là où 9,50 × 84 + 5,70 × 37 donne 1 008,90 € ; le test correspondant a échoué à l'exécution et la
valeur a été corrigée. Sans exécution réelle des corrigés, cette faute serait partie en production et l'élève
aurait cherché son erreur là où il n'y en avait pas.

**Garde-fou ajouté par anticipation.** La leçon 17 portera sur les fichiers : les corrigés écriront sur le
disque. Le lanceur Python du vérificateur bascule désormais dans un dossier temporaire hors du dépôt avant toute
exécution. L'erreur `locations.txt` / `taches.json` a déjà été commise deux fois sur ce site ; cette fois elle
est prévenue avant d'arriver.

### Lot suivant — `cours-python` leçons 5 à 7
**21 exercices au total, 105 indices, 104 tests rejoués, tous verts.** Deux mini-séries achevées : le panneau de
cinéma (3 jours) et le carnet de recettes (4 jours). Le carnet suit une progression qui suit celle du cours :
il enregistre une recette (jour 4), refuse les saisies absurdes (jour 5), lit les ingrédients à la chaîne
(jour 6), puis les garde en mémoire pour produire une liste de courses (jour 7). Chaque jour répond à un défaut
que la question de réflexion de la veille avait fait constater — c'est le mécanisme du TP objet de l'école.

Domaines servis : météo, théâtre, cinéma, cuisine, sport, banque, astronomie, transports, jardinage, santé,
musique, géographie, photographie, bibliothèque, brasserie. Quinze sujets sur sept leçons, aucun réemploi à moins
de quatre leçons d'écart.

**Trois fautes attrapées par le vérificateur sur ce lot, toutes les miennes.**
1. Exercice 3.3 : recette annoncée à 1 009,90 € au lieu de 1 008,90 €.
2. Exercice 6.1 : `range(0, 551, 50)` produit **douze** lignes et non onze — 550 tombe encore dans l'intervalle.
   La borne correcte est `dernière valeur + 1`, et le paragraphe « pourquoi » qui défendait l'écriture `551` a été
   réécrit, puisqu'il défendait une erreur.
3. Exercice 7.3 : l'indice 5 reprenait `for i in range(len(noms)):` mot pour mot — deuxième fuite détectée depuis
   la mise en place du contrôle.

Aucune de ces trois n'aurait été visible à la relecture : deux erreurs de calcul dans des corrigés d'apparence
correcte, et une fuite dans un indice qui semblait générique. C'est l'exécution réelle des solutions et la
comparaison mécanique indice/solution qui les ont trouvées, pas l'attention.

### Lot suivant — `cours-python` leçons 8 et 9
**27 exercices, 135 indices, 133 tests rejoués, tous verts.** Troisième mini-série engagée : le carnet
d'entraînement du coureur (2 jours sur 4). Il pose d'abord un outillage de fonctions — allure, vitesse,
appréciation — puis apprend à lire des séances écrites au format texte, en ignorant les lignes mal formées sans
s'interrompre. Domaines ajoutés : apiculture, horlogerie, archéologie, randonnée.

**Assouplissement du contrôle anti-fuite, et sa justification.** Le contrôle refusait les indices contenant une
ligne de `def` reprise de la solution. C'était un faux positif : l'énoncé lui-même écrit « écris
`allure(distance, duree)` », donc la signature n'est pas la réponse mais l'interface, et la masquer dans les
indices n'aurait protégé personne tout en les rendant flous. Les lignes de déclaration (`def`, `class`) sont
désormais exclues du contrôle ; **la logique du corps reste protégée**. Contre-test à l'appui : en glissant
`return round(kilos / ruches, 1)` dans un indice, le vérificateur refuse toujours. Dixième contre-test.

**Cinq fautes attrapées sur ce lot.** Deux longueurs de chaîne annoncées de tête et fausses (43 et 35 au lieu de
40 et 36) ; une séance de 21 km en 115 minutes classée « allure rapide » alors qu'elle donne 11 km/h, soit
« endurance » — les données de test ont été changées, pas le seuil ; et deux fuites de logique dans des indices 5.

Le rythme se confirme : sur ce chantier, **une faute sur trois exercices environ** est attrapée par l'exécution
des corrigés ou par le contrôle anti-fuite. Aucune n'aurait été visible à la relecture.

### `cours-algorithmes` — démarrage, sans tests, décision assumée
Le cours est en pseudocode : rien n'y est exécutable. **Décision de l'élève, prise en connaissance du taux
d'erreur mesuré** (une faute pour trois exercices sur `cours-python`, toutes détectées par exécution) : écrire
ces exercices **sans champ `tests`**, et remettre à plus tard la parade — transcrire chaque corrigé en Python,
faire exécuter la transcription, n'afficher que le pseudocode. Motif invoqué : ne pas épuiser le quota
hebdomadaire trop vite. La décision et son risque sont consignés dans `_veille.md` pour qu'ils ne se perdent pas :
**ces corrigés sont en ligne sans filet, et il faut s'attendre à ce qu'ils contiennent des erreurs.**

En compensation, les checklists passent de quatre à **cinq critères** et deviennent le seul garde-fou : elles
portent sur des propriétés vérifiables à la lecture (« chaque ligne contient-elle une seule action ? », « le
client récupère-t-il sa carte dans tous les cas ? ») plutôt que sur des impressions.

Leçon 1 écrite : la marche à suivre du distributeur · l'algorithme du café dans le désordre, à corriger en
justifiant chaque déplacement par une dépendance · le protocole du refuge (1/3). Le fil conducteur des trois
exercices est le même : **un ordre erroné ne provoque presque jamais d'erreur visible, il produit un résultat
faux en silence** — la machine à café ne proteste pas si le réservoir est vide.

**Bug du vérificateur corrigé au passage.** La règle « pas deux fois le même domaine à moins de quatre leçons
d'écart » comparait les numéros de jour **sans distinguer les cours** : le jour 1 d'algorithmes se heurtait au
jour 2 de python. La monotonie se juge à l'intérieur d'un parcours, pas entre deux. Corrigé et contre-testé —
onzième contre-test.

### `cours-algorithmes` leçons 1 à 3 — mini-série « Le protocole du refuge » achevée
**36 exercices au total sur les deux cours** (27 python + 9 algorithmes), 180 indices. Le refuge de montagne
traverse les trois premières leçons : marche à suivre en actions élémentaires (jour 1), variables typées et
constantes tarifaires (jour 2), indicateurs de saison (jour 3).

Trois questions de réflexion tirent le même fil, celui qui manque le plus aux débutants — **savoir qu'un
résultat peut être faux sans que rien ne le signale** : la machine à café ne proteste pas si le réservoir est
vide ; l'hypothèse « le randonneur repartira » échoue en silence là où « il peut payer » échoue au comptoir ; et
un taux d'occupation de 2,67 % n'annonce pas une faillite, il annonce un dénominateur mal choisi.

**Compensation de l'absence de tests.** Aucun corrigé n'étant exécutable ici, tous les nombres avancés ont été
vérifiés au coup par coup avec `python3` avant d'être écrits — capacité de saison, taux, prix moyen, reste de
division, part de randonneurs ayant pris le petit-déjeuner. C'est manuel, donc faillible, et cela ne remplace
pas la vérification à chaque build : le risque reste consigné dans `_veille.md`.

Domaines servis : banque, cuisine, randonnée, musique, transports, astronomie, commerce de quartier.

### `cours-algorithmes` leçons 4 et 5 — et une exception ajoutée au contrôle anti-fuite
**42 exercices** au total (27 python + 15 algorithmes), 210 indices. Deuxième mini-série lancée : la borne de
péage d'autoroute (2 jours sur 4). Elle progresse comme le cours : calcul pur au jour 4, saisies au jour 5, et
elle bute volontairement sur ce qui manque — au jour 5, la borne doit choisir un tarif selon la classe du
véhicule et n'a pas encore les conditions. La solution provisoire (demander le tarif au conducteur) est écrite
**avec le commentaire qui dit en quoi elle ne tient pas**, et la question de réflexion demande de formuler
l'instruction manquante : « il me faudrait une instruction qui… ». La leçon du lendemain y répond.

**Nouvelle exception au contrôle anti-fuite, déclarée et bornée.** L'exercice 5.2 donne trois versions d'un même
dialogue et demande laquelle est correcte : le code y est le **sujet** de l'énoncé, pas une fuite. Le contrôle le
refusait. Plutôt que de dénaturer l'exercice, un champ `analyseDeCode` permet de lever le contrôle — mais
**uniquement sur l'énoncé**, et seulement s'il porte une justification écrite, que le vérificateur exige non
vide. Indices, principe et checklist restent couverts : c'est là qu'une fuite serait un cadeau et non un sujet.
Contre-test : en glissant la formule des plaques dans un indice de ce même exercice, le refus tombe toujours.
Douzième contre-test.

**Vérification des nombres, à défaut de tests.** IMC 22,9 · moyenne 45 · `42 + 58 + 31 + 49 / 4` = 143,25 ·
distance 153 km · total 17,03 € contre 17,04 € si l'on arrondit la TVA trop tôt · 21 jours DIV 2 = 10 jours
d'amende · 61 graines pour 6 plaques. Tous calculés avec `python3` avant rédaction.

### `cours-algorithmes` leçons 6 et 7 — mini-série « La borne de péage » achevée
**48 exercices** (27 python + 21 algorithmes), 240 indices. La borne est complète en quatre jours : calcul pur,
saisies, déduction du tarif par classe, statuts d'usager. Elle illustre volontairement le manque avant l'outil —
au jour 5 elle demandait son tarif au conducteur faute de conditions, au jour 6 elle le déduit.

Trois pièges classiques traités de front, chacun par une question de réflexion :
- **L'intervalle qui franchit minuit.** « Entre 22 h et 6 h » s'écrit avec un OU, jamais avec un ET — la forme
  spontanée `heure ≥ 22 ET heure < 6` est *toujours* fausse. Règle dégagée : dès que la borne basse dépasse la
  borne haute, l'intervalle boucle et le ET devient un OU.
- **La négation d'une conjonction.** Le contraire de « densité correcte ET température correcte » est
  « NON l'une **OU** NON l'autre ». Le test qui sépare les deux écritures est celui où *une seule* condition est
  fausse — c'est le seul cas qui les distingue.
- **L'explosion combinatoire.** Deux facteurs donnent 4 cas, trois en donnent 8, quatre en donnent 16. La
  réflexion demande à quel moment on cesse d'écrire des conditions pour changer d'approche.

**Deux fuites d'indice attrapées** (`SI statut = "exonere" ALORS` et sa jumelle), et tous les montants vérifiés
au préalable avec `python3` : le déroulé manuel de l'abonné de classe 3 passant à 2 h du matin donne bien
43,50 €.

### `cours-python` leçons 10 à 14 — mini-séries « carnet d'entraînement » et « station météo »
**63 exercices** au total (42 python + 21 algorithmes), 315 indices, 227 tests rejoués. `cours-python` est à
14 leçons sur 21.

Le carnet d'entraînement s'achève en montrant l'intérêt des structures apprises : au jour 7 il tenait deux listes
parallèles dont la question de réflexion pointait la fragilité ; au jour 10 il devient une liste de tuples, et le
problème disparaît. La station météo suit la même logique sur trois jours — classe simple, puis constructeur et
encapsulation, puis héritage — chaque jour corrigeant un défaut que la veille avait fait constater.

Quatre questions de réflexion portent sur le même sujet, celui qui sépare un programme qui marche d'un programme
sur lequel on peut construire : **quand faut-il interroger le type d'un objet ?** Réponse dégagée au jour 14 :
jamais quand seul le comportement varie — le polymorphisme s'en charge — et légitimement quand la *capacité*
varie, d'où `hasattr(r, "pluie")` plutôt que `isinstance(r, RelevePluvio)`. On demande à un objet ce qu'il sait
faire, pas ce qu'il est.

**Quatre fautes attrapées sur ce lot.** Une valeur de stock à 505,80 € au lieu de 529,80 €. Un total pondéré
annoncé à 91 pour un jeu de coefficients qui donne 98 — et j'ai reproduit l'erreur *deux fois* en tentant de la
corriger de tête, avant de me résoudre à calculer les quatre jeux possibles et à choisir celui qui tombe juste.
Un prix au mètre de 18,50 € rendant impossible le jeu de données à 100 € pile exigé par la réflexion, corrigé en
passant à 20,00 €. Et un test écrit avec un opérateur d'affectation dans une expression, qui ne compile pas.

Ce lot illustre exactement le constat du chantier : **les erreurs viennent des affirmations non calculées**, et
la seule parade qui tienne est de calculer avant d'écrire, puis de faire rejouer les corrigés.

### `cours-python` leçon 15 — modules, et la mini-série « journal d'observation »
**66 exercices** (45 python + 21 algorithmes), 330 indices, 239 tests rejoués. `cours-python` : 15 leçons sur 21.

La leçon insiste sur ce que la bibliothèque standard dispense d'écrire : `math.gcd`, `math.lcm`, `math.dist`,
`math.atan2`, `math.log10`. Trois questions de réflexion, toutes sur des erreurs qui ne se signalent pas :
- **Radians contre degrés.** Oublier `math.degrees` donne 0,6 au lieu de 36,9 — un angle parfaitement plausible
  pour un relevé de terrain, et faux d'un facteur cinquante-sept.
- **Millimètres contre centimètres.** La formule de magnitude limite attend des centimètres ; la conversion est
  placée *dans* la fonction plutôt que laissée à l'appelant, précisément pour que personne ne l'oublie.
- **Le hasard reproductible.** `random.seed` ne rend pas le tirage moins aléatoire, il le rend rejouable — ce qui
  est indispensable dès qu'un test porte dessus, sans quoi il passerait un jour et échouerait le lendemain.

Toutes les valeurs ont été calculées avec `python3` avant rédaction : PGCD 6, PPCM 72, périmètre 75,4 mm,
distances 150 / 100 / 202,24 m, angle 36,87°, magnitude limite 14,0 pour un 200 mm, et la sélection produite par
la graine 42.

### `cours-python` leçon 16 — les exceptions
**69 exercices** (48 python + 21 algorithmes), 345 indices, 251 tests rejoués. `cours-python` : 16 sur 21.

Le fil de la leçon est la répartition des rôles : **la fonction constate, l'appelant décide.** `lire_ligne`
lève une exception, la boucle la rattrape et choisit d'ignorer et de compter — un autre programme pourrait
choisir de s'arrêter au premier rejet sans qu'on touche à la fonction. Les trois questions de réflexion
développent la même idée sous trois angles : pourquoi lever plutôt qu'afficher, pourquoi ne jamais renvoyer
`None` en cas de problème, et les deux dangers concrets d'un `except` sans type — la `NameError` avalée en
silence, et le Ctrl-C qui n'arrête plus rien.

L'exercice 16.3 illustre aussi qu'on n'a pas à tout prévoir : le champ vide de `"M104;"` passe le contrôle du
nombre de champs et échoue à la conversion, ce qui est le comportement voulu — vérifier d'avance qu'un texte
« ressemble à un nombre » finirait par refuser des valeurs valides que `float` accepte.

### `cours-python` leçons 17 à 21 — le cours est complet
**84 exercices** au total (63 python + 21 algorithmes), 420 indices, 353 tests rejoués, tous verts.
`cours-python` : **21 leçons sur 21**. Premier cours du chantier entièrement équipé.

Les deux mini-séries qui restaient s'achèvent. **Le journal d'observation** finit ses quatre jours : après
les modules (15) et les exceptions (16), il apprend le disque (17) puis l'indexation (18) — il passe d'un
calcul jetable à une application qui lit un catalogue abîmé, écarte ce qui ne tient pas debout, sauvegarde
son état et retrouve un objet par son nom. **Le budget d'un festival** ouvre et se referme en trois jours :
planning et cachets (19), les couples deviennent des objets et l'état se persiste (20), puis le bilan de
l'édition avec seuil de rentabilité (21). Six mini-séries au total sur le cours, toutes closes.

**Cinq questions de réflexion tirent le même fil, celui de la dernière semaine : la faute qui ne provoque
aucune erreur.**
- **Le mode d'ouverture inversé.** Le carnet de pêche est un *historique* et se complète ; le journal
  d'observation est un *état* et se réécrit. Échanger les deux modes ne lève aucune exception : l'un ne
  garde plus qu'une ligne, l'autre double son contenu à chaque soirée. On ne s'en aperçoit que le lendemain.
- **Le rechargement qui étend au lieu de remplacer.** Même famille, un cran plus haut : dans un budget
  neuf l'anomalie est *invisible*, les totaux coïncident et le test passe. Elle ne se révèle qu'au second
  chargement d'un budget déjà rempli — c'est-à-dire le jour où l'on ajoute un bouton « recharger ».
- **Le tirage non reproductible.** L'affiche imprimée le lundi ne correspond plus au fichier régénéré le
  mercredi. La faute est indétectable à la relecture parce que chaque exécution prise isolément est
  irréprochable : le défaut n'existe qu'*entre* deux exécutions, et une relecture n'en regarde qu'une.
- **Le seuil arrondi au plus proche.** 1 888,9 entrées nécessaires, 1 888 vendues : le tableau de bord
  affiche « seuil atteint » et le festival est en déficit. Personne ne relit un chiffre qui dit ce qu'on
  espérait.
- **La charge de bus qui ne revient pas à zéro.** Seule des cinq à laisser une trace visible — et l'exercice
  enseigne à lire cette trace du bon côté : une charge finale non nulle accuse presque toujours une ligne
  *écartée à la lecture*, pas le calcul.

**Le test préalable contre le rattrapage d'exception (17.2).** La question posée à l'élève — « dans quelle
situation le test d'existence devient-il faux ? » — a pour réponse la fenêtre entre la question et
l'ouverture. Demander l'autorisation puis agir n'équivaut jamais à agir puis assumer l'échec, dès que le
monde peut changer entre les deux. C'est le premier endroit du cours où cette distinction est nommée.

**Une contrainte de plateforme, traitée comme un sujet plutôt que contournée (20.2).** Le menu du projet
guidé est une boucle alimentée par `input()`. Sous le vérificateur comme dans le navigateur, l'entrée
finit par se tarir et `input()` rend une chaîne vide : une boucle qui ne prévoit que « 4 » pour sortir
tourne alors indéfiniment et fige la page. Plutôt que de retirer la boucle ou de truquer le jeu de saisies,
la sortie sur entrée épuisée est devenue une **exigence écrite de la question d), justifiée par son usage
réel** — une application console finit toujours par être alimentée par un fichier de commandes. Le corrigé
la traite en une ligne commentée.

**Trois fuites d'indice attrapées par le vérificateur, toutes dans l'indice 5.** `conformes = presentes &
AGREMENT` et `trouves = index.get(demande, [])` en 18.2, la ligne de déballage du catalogue en 18.3, et la
ligne d'import `datetime` en 19.2 et 19.3. Les deux premières étaient de vraies fuites — l'indice donnait
l'opération d'ensembles que l'exercice demande de trouver. La dernière est plus discutable : un import
n'est pas une réponse. Elle a malgré tout été masquée plutôt que de créer une exception au contrôle : une
exception ouverte pour un cas anodin finit toujours par servir à un cas qui ne l'est pas.

**Chaîne des exercices filés vérifiée, pas seulement affirmée.** Les deux séries ont été rejouées jour après
jour dans un même dossier temporaire : le jour 3 du festival, exécuté *après* le jour 2, recharge bien les
quatre groupes laissés par celui-ci depuis `festival.json` et annonce 34 000 € de dépenses pour 7 220 € de
résultat. Exécuté seul — cas de l'élève qui a sauté un jour —, il tombe sur le repli codé en dur et donne
**exactement les mêmes chiffres**. Le jour 4 du journal s'exécute sans dommage après le jour 3. La rupture
est donc volontaire et sans conséquence, et le lien « pars de la solution d'hier » couvre le reste.

**Aucun artefact d'exécution.** Cinq des quinze corrigés écrivent sur le disque — `carnet-peche.txt`,
`classe.txt`, `bulletin.json`, `journal.txt`, `journal.json`, `armoire.json`, `festival.json`, `course.txt`,
`bilan.json`. Le lanceur bascule dans un dossier temporaire hors du dépôt avant toute exécution (garde-fou
posé au lot précédent, précisément en prévision de la leçon 17). Contrôle fait après coup : aucun `.txt`
ni `.json` nouveau à la racine ni dans `cours-python`. L'erreur `locations.txt` / `taches.json`, commise
deux fois sur ce site, ne s'est pas reproduite une troisième.

**Relecture contradictoire de deux leçons tirées au sort — 18 et 21.** Énoncés de 490 à 590 caractères de
prose, décrivant entrée, traitement et sortie ; aucun squelette de code, aucun `def` ni `print` dans un
énoncé (contrôlé par expression régulière, pas à l'œil). Les six exercices portent une remarque de bonne
pratique ou un principe ; les quatre exercices de niveau 2 et 3 portent des sous-questions et une question
de réflexion avec son corrigé rédigé. **Recouvrement de vocabulaire maximal entre deux indices d'un même
exercice : 55 %**, pour un seuil de refus à 72 % — les cinq marches sont réelles, et la vérification de la
gradation elle-même (reformuler · plan · pseudocode · point dur · quasi-squelette) a été faite à la lecture,
indice par indice, car aucune mesure ne peut la prouver.

**Résultat des vérifications.** `_verify_entrainement.js` : 28 leçons équipées, 84 exercices, 63 solutions
exécutées, 353 tests rejoués, aucune fuite, aucune paraphrase — vert. `_verify.js` sur les cinq leçons
nouvelles : 4/4 chacune. Sommaire de `cours-python` mis à jour : la mention passe de « déployé sur les
leçons 1 à 16 » à « déployé sur les 21 leçons du cours ».

**☐ Reste à faire.** Les huit autres cours, soit **206 leçons et 618 exercices** : algorithmes (24 jours),
java, csharp et php (31 chacun), c, cpp-bas, cpp-moderne et asm (21 chacun). Et toujours la même réserve
d'honnêteté : le rendu réel de la section dans un navigateur n'a jamais été vu, l'extension ne pouvant pas
ouvrir d'URL `file://`. Tout est contrôlé en Node et en Python.

### `cours-algorithmes` jours 8 à 15 — deux mini-séries complètes
**108 exercices** au total (63 python + 45 algorithmes), 540 indices. `cours-algorithmes` : **15 jours sur 31**.
Toujours sans champ `tests` — le cours est en pseudocode, rien n'y est exécutable — donc toujours avec
checklists renforcées à cinq critères et vérification préalable de tous les nombres avec `python3`.

**La borne d'arrosage (jours 8 → 11)** suit le programme des quatre leçons : la décision d'arroser en logique
booléenne, la session qui surveille en boucle à condition, la tournée des huit massifs en boucle à compteur,
le pupitre et la tournée interruptible. Le jour 10 se termine volontairement sur un **mur** — la boucle à
compteur s'engage à faire ses huit tours et rien dans son corps ne peut revenir sur cet engagement — et la
question de réflexion demande de nommer ce qui manque. Le jour 11 y répond, et fait constater que le
changement n'est pas une retouche mais une reprise des trois responsabilités que le compteur automatique
assurait : initialiser, tester, faire progresser.

**Le carnet du gardien de phare (jours 12 → 15)** raconte la même progression du côté des données : un relevé
quotidien traité au vol, puis quatre créneaux par jour en boucles imbriquées, puis un tableau qui conserve,
puis le bilan complet par parcours. La réflexion du jour 15 demande, question par question, à quel jour de la
série chacune serait devenue possible — et le corrigé montre que la plus longue série consécutive de mauvaise
mer aurait été calculable **dès le premier jour**, parce qu'elle ne demande jamais de revenir en arrière,
seulement de se souvenir de ce qui vient de se passer. Contre-exemple utile à l'idée que « conserver » et
« traiter dans l'ordre » seraient la même chose.

**Le fil des huit jours est le même que celui de la fin de `cours-python` : la faute qui ne se signale pas.**
- **Le mode d'ouverture, l'ordre des tests, la borne d'un intervalle** — au jour 8, une condition d'accès
  correcte sauf sur la borne de 19 h refuse l'entrée à une personne par jour, et personne ne comprend pourquoi.
- **Le compteur qui ne progresse pas** (jour 11) : c'est la seule des trois responsabilités dont l'oubli soit
  *silencieux*. Sans initialisation, l'environnement proteste ; sans test, on déborde bruyamment ; sans
  progression, l'algorithme arrose le massif n° 1 indéfiniment sans qu'aucune erreur ne survienne.
- **Le produit initialisé à zéro** (jour 12) : il ne plante pas, il rend zéro. La remise cumulée devient 100 %
  et l'algorithme annonce que le client ne paie rien.
- **La remise à zéro au mauvais étage** (jour 13) : remontée au-dessus des deux boucles, elle fait croître les
  moyennes journalières de jour en jour — ce qui *ressemble à une tempête qui se lève*. L'erreur qui donne un
  résultat de la bonne taille est plus dangereuse que celle qui donne un résultat absurde.
- **L'indice pris pour la valeur** (jour 14) : l'énoncé du rayon des conserves a été construit avec un stock
  minimal de 3 précisément pour que la confusion `minRef ← stock[i]` désigne la référence n° 3, qui existe et
  porte 45 boîtes. Sur des données où le minimum vaudrait 47, l'exercice n'apprendrait rien.
- **La série qui ne se rompt jamais** (jour 15) : sans la remise à zéro, le compteur de série devient un
  doublon exact du compteur de mauvaises journées. C'est le seul indice qui trahit la faute à la relecture —
  deux quantités censées mesurer des choses différentes qui donnent toujours le même nombre.

**Sept défauts attrapés par le vérificateur sur ce lot, tous les miens.** Cinq fuites d'indice : l'en-tête
`POUR t DE 5 A 1 PAS -1 FAIRE` et sa jumelle au jour 10, deux en-têtes de boucle au jour 11, la comparaison
`SI houle > recordHoule ALORS` au jour 12, deux déclarations de tableau et `SI stock[i] < minStock ALORS` au
jour 14, `SI absolu > recordEcart ALORS` et `SI serie > recordSerie ALORS` au jour 15.

**Et surtout deux vraies paraphrases** — jour 14 exercice 2 à **77 %** de recouvrement, jour 15 exercice 2 à
**73 %**, pour un seuil de refus à 72 %. C'est exactement le défaut que le contrôle a été écrit pour attraper,
et je l'ai produit deux fois de la même façon : mon indice ③ « pseudocode » et mon indice ⑤ « quasi-squelette »
disaient la même chose sous deux notations, l'un en français structuré, l'autre en fragments de code. Aucun des
deux ne franchissait de marche que l'autre n'avait pas franchie. Réécrits pour que ③ décrive la démarche et ⑤
la seule forme du fichier, ils redescendent sous 55 %. À noter : **aucune de ces deux paraphrases ne m'a paru
suspecte à la relecture** — elles se lisaient bien, elles étaient différentes à l'œil. C'est la mesure
mécanique qui les a vues.

**Une coquille rattrapée au passage** : `Ecrire("  Jour ", j : mauvaise mer")` au jour 12, une virgule
transformée en deux-points. Le vérificateur ne l'a pas signalée — il ne parse pas le pseudocode — c'est la
relecture du corrigé qui l'a trouvée. Rappel que le filet a des trous, et lesquels.

**Vérifications.** `_verify_entrainement.js` : 36 leçons équipées, 108 exercices, dix mini-séries closes,
aucune fuite, aucune paraphrase — vert. `_verify.js` sur les huit jours : conforme. Aucun artefact
d'exécution. Sommaire de `cours-algorithmes` mis à jour : la mention passe de « leçons 1 à 7 » à
« jours 1 à 15 ».

**Commit intermédiaire assumé.** La règle du chantier est qu'un cours ne se commite que complet. Elle est ici
levée explicitement par l'élève : garder seize jours de travail hors de git en attendant les seize leçons
restantes fait courir plus de risque que d'en accepter un état partiel mais vert. Le cours reste **incomplet**
et le sommaire le dit.

**☐ Reste à faire.** `cours-algorithmes` jours 16 à 31 — 48 exercices : recherche séquentielle, min/max/moyenne,
tableaux à deux dimensions, chaînes, fonctions et procédures, paramètres, décomposition, dichotomie, tri à
bulles, tris par sélection et insertion, récursivité en deux jours, complexité, piles et files, résolution de
A à Z, examen. Les jours 26 et 27 tombent exactement sur le chapitre 5 du PDF de l'école — factorielle, carré
par la méthode des impairs, puissance, tours de Hanoï, PGCD avec sa relation de récurrence fournie — et devront
imposer la démarche en trois étapes du contrat C7. Puis les sept autres cours.

**Incident du lot, et comment il a été vu.** Le premier commit de ces huit jours a **supprimé la section
« `cours-python` leçons 17 à 21 » du CHANGELOG** — 81 lignes effacées sans que rien ne le signale. Cause : la
copie du fichier rapatriée pour édition était périmée d'une version, alors même que sa taille et sa date
annoncées correspondaient à la bonne. J'ai donc ajouté la nouvelle section à un état antérieur du document,
et réécrit par-dessus la précédente.

Ce qui l'a attrapé n'est aucun vérificateur — aucun ne lit le CHANGELOG — mais la **lecture du récapitulatif du
commit** : `154 lignes modifiées, 82 suppressions` sur un fichier auquel je n'avais fait qu'ajouter. Une
addition pure ne supprime rien ; le chiffre était incompatible avec ce que je croyais avoir fait. Réparé par un
second commit, à partir des trois morceaux reconstitués séparément.

La règle qui en sort : **après tout commit, lire le décompte des lignes ajoutées et supprimées, et le confronter
à l'intention.** C'est trois secondes, cela ne demande aucun outil, et c'est le seul contrôle qui aurait pu voir
celui-ci. Corollaire : ne jamais faire confiance à la taille et à la date d'un fichier pour juger de sa
fraîcheur — les deux étaient exactes, et le contenu ne l'était pas.

### `cours-algorithmes` jours 16 à 19 — la mini-série « Le fichier des adhérents »
**120 exercices** au total (63 python + 57 algorithmes), 600 indices. `cours-algorithmes` : **19 jours sur 31**.

La série suit le fichier d'un club sportif sur quatre jours, et chaque jour lui fait franchir un seuil :
recherche d'un adhérent par numéro (16), statistiques d'âge pour un dossier de subvention (17), grille de
présences à deux dimensions (18), noms saisis par des bénévoles différents et donc sales (19). La réflexion du
dernier jour demande à quel moment le fichier a cessé d'être une liste pour devenir une base de données — la
réponse est le jour 18, quand la grille a cessé de porter des valeurs pour porter une **relation** entre deux
ensembles, adhérents et séances. Le jour 19 n'a rien ajouté à cela : il a seulement rendu les données réelles,
c'est-à-dire sales, et montré que la première chose que fait un système d'information est de nettoyer ce qu'on
lui donne.

**Trois questions de réflexion attaquent le même angle mort : l'indicateur qui répond très bien à une question
qui n'est pas la bonne.**
- **Le dossier de subvention (17.3).** « Le nombre de membres qui s'écartent de plus de dix ans de la moyenne »
  récompense la *polarisation* autant que la diversité : un club de quinze enfants et quinze retraités obtient
  le score maximal, alors qu'un club régulièrement réparti de 10 à 70 ans — le plus mixte des deux — obtient
  moins. Le corrigé propose la mesure qui répond vraiment : compter les tranches d'âge occupées.
- **Le tableau de bord du restaurant (18.2).** Le plat le plus vendu n'est pas le meilleur plat : il manque la
  marge, et surtout le nombre de portions *préparées* — un plat épuisé chaque jour est un succès qu'on étouffe,
  un plat surproduit est un gâchis qui paraît rentable.
- **La séance la mieux suivie (18.3).** Un numéro de colonne n'est pas une cause. Sans le jour, l'heure et le
  contexte de chaque séance, le taux de remplissage mesure une corrélation avec un indice de tableau.

**Deux règles générales dégagées, qui resserviront.**
- **Le raccourci n'est pas une propriété de l'algorithme, c'est une propriété de la question** (16.3). Un
  parcours peut s'arrêter tôt si la réponse est *décidée* par le premier élément qui la satisfait. Le test
  pratique : peut-on imaginer une donnée plus loin qui changerait la réponse ? Si oui, il faut tout voir.
- **Normaliser pour comparer, jamais pour stocker** (19.2 et 19.3). La normalisation jette de l'information —
  casse et espaces — et cette perte est le but recherché tant qu'il s'agit de retrouver quelqu'un. Elle devient
  grave dès que la distinction jetée portait du sens : *de Vries* et *De Vries* sont deux familles différentes
  aux Pays-Bas, *MacDonald* n'est pas *Macdonald* pour l'état civil écossais.

**Le piège construit exprès (17.2).** Les dix relevés de dérive d'une pendule sont **tous négatifs** — de −1 à
−11 secondes. C'est le seul jeu de données qui rende l'initialisation d'un maximum à zéro visiblement fausse :
le maximum resterait 0, une valeur jamais observée, et l'amplitude vaudrait 11 au lieu de 10. Le corrigé fait
remarquer que le minimum, lui, serait correct — il s'autocorrige à la première case — et que sur des relevés
tous positifs la situation s'inverserait exactement. D'où la formulation robuste de la règle : **l'extremum
s'initialise sur la première case**, pas sur une constante « assez petite » ou « assez grande », qui ne fait que
déplacer l'hypothèse.

**Le même exercice piège aussi le vocabulaire.** « Le plus grand retard » n'est pas le maximum : un retard de
11 secondes est plus grand qu'un retard de 1 seconde, mais −11 est plus petit que −1. La langue parle de
l'intensité d'un défaut, la comparaison porte sur la valeur signée, et les deux vont en sens inverse dès que
les nombres sont négatifs. Le réflexe consigné : avant d'écrire une comparaison, se donner deux valeurs
concrètes de l'énoncé et vérifier laquelle doit gagner.

**Trois fuites d'indice attrapées** — `SI tarif[d][c] > max ALORS` au jour 18, `TANT QUE i < j ET
estPalindrome FAIRE` au jour 19, et une au jour 16 corrigée avant contrôle. Aucune paraphrase sur ce lot : les
indices ③ et ⑤ ont été écrits d'emblée sur deux registres différents — la démarche d'un côté, la seule forme du
fichier de l'autre — après les deux refus du lot précédent.

**Vérifications.** `_verify_entrainement.js` : 40 leçons équipées, 120 exercices, onze mini-séries closes,
aucune fuite, aucune paraphrase — vert. Aucun artefact d'exécution. Sommaire mis à jour : jours 1 à 19.

**☐ Reste à faire.** `cours-algorithmes` jours 20 à 31 — 36 exercices : fonctions et procédures, paramètres et
retour, décomposition, dichotomie, tri à bulles, tris par sélection et insertion, récursivité en deux jours,
complexité, piles et files, résolution de A à Z, examen. Les jours 26 et 27 reprendront les exercices du
chapitre 5 du PDF de l'école avec la démarche en trois étapes du contrat C7.

### `cours-algorithmes` jours 20 à 23 — la mini-série « La billetterie du théâtre »
**132 exercices** au total (63 python + 69 algorithmes), 660 indices. `cours-algorithmes` : **23 jours sur 31**.

Quatre jours qui construisent la même application dans un ordre que le dernier corrigé critique lui-même :
affichage par procédures (20), calcul par fonctions (21), décomposition depuis l'énoncé (22), optimisation par
dichotomie (23). La réflexion du jour 23 demande lequel de ces quatre jours aurait dû venir en premier, et la
réponse est **le troisième** : j'ai écrit des sous-programmes parce que l'énoncé les demandait, alors que sur un
vrai projet personne ne fournit cette liste — on part de la phrase du commanditaire, et coder avant de l'avoir
découpée produit des sous-programmes qui correspondent aux idées qu'on a eues plutôt qu'aux besoins qu'il y a.
Le jour 4, en revanche, est bien à sa place : on n'optimise que ce qui existe et qu'on a mesuré.

**Le fil de ces quatre jours est la frontière entre calculer et dialoguer.**
- **Le sous-programme qui affiche est inutilisable ailleurs** (20.1) : un calculateur d'unités d'alcool qui
  écrirait son résultat ne rendrait rien à additionner. La question qui tranche : *ai-je besoin du résultat
  pour continuer un calcul ?*
- **La fonction constate, l'appelant décide** (20.2). Un vérificateur de plafond qui afficherait l'alerte
  lui-même interdirait de *compter* les dépassements et de *changer* la réaction — bloquer, prévenir le
  médecin, journaliser. La même répartition des rôles que celle des exceptions, formulée ici sans exceptions.
- **Une procédure ne peut rien rendre** (22.2). Le traitement d'un ticket de caisse doit donc être une
  fonction ; l'alternative — une variable globale modifiée dans le dos de l'appelant — obligerait à ouvrir le
  sous-programme pour comprendre d'où vient le chiffre d'affaires, et rendrait le ticket intestable seul.
- **Une fonction dont le résultat ne dépend que de ses arguments est testable** (21.3). Le prix d'un billet se
  vérifie à la main sans guichet, sans spectacle et sans boucle ; c'est la raison de fond de la séparation.

**Deux bornes mal placées, deux règles générales.**
- **Le limiteur qui ne limite rien** (21.2). Régler puis limiter, ou limiter puis régler : partant de −6 dB
  avec un gain de 12 et un plafond de 0, la première donne 0, la seconde 6 — six décibels au-dessus du plafond
  de sécurité. Le limiteur doit être le dernier maillon, comme les vrais limiteurs de studio.
- **Le plancher tarifaire déplacé** (21.3). Sur un tarif à 7 € avec 30 % puis 10 % de réduction, appliquer le
  plancher de 5 € entre les deux remises donne un prix final de **4,50 €** — sous le plancher qu'on prétendait
  garantir. Une *borne* et une *transformation* ne commutent pas.

**Le décalage de tableau à l'envers, déroulé sur trois cases** (23.3). Décaler 10 · 20 · 30 vers la droite en
partant du début donne 10 · 10 · 10 · 10 : chaque case écrase sa voisine avant de l'avoir déplacée, la première
valeur se propage, les autres disparaissent — et rien n'est signalé. C'est l'échange à deux affectations du
jour 14, propagé le long d'un tableau.

**Le calcul qui fait toute la leçon du jour 23.** Doubler le catalogue *double* le travail de la recherche
séquentielle et ajoute *une seule* comparaison à la dichotomique. Sur 1 024 étoiles : 1 024 comparaisons contre
11. Sur un million : un million contre 20. Le seuil de rentabilité du tri est calculé et non estimé — sur mille
objets, avec un tri à dix mille comparaisons et un gain de 490 par recherche, il faut **21 recherches** pour
amortir. Et le corrigé nomme les trois cas où la séquentielle reste le seul choix même en payant le tri : ordre
sans rapport avec le critère cherché, données non comparables, accès non direct.

**Sept fuites d'indice attrapées** sur ce lot, toutes dans les indices ③ ou ⑤ : deux en-têtes de fonction, la
condition de boucle dichotomique, la boucle de décalage à pas négatif. Aucune paraphrase — le procédé adopté
après les deux refus du lot 8-15 tient : l'indice ③ décrit la démarche en français, l'indice ⑤ ne montre que la
forme du fichier, et les deux ne peuvent plus se recouvrir.

**Le CHANGELOG est désormais édité directement sur le poste** et non par aller-retour de fichier : le cache du
conteneur servait une version périmée du document à taille et date correctes, ce qui avait déjà coûté 81 lignes
au lot précédent. La leçon générale reste valable au-delà de cet outil : *taille et date ne prouvent pas la
fraîcheur d'un contenu.*

**Vérifications.** `_verify_entrainement.js` : 44 leçons équipées, 132 exercices, douze mini-séries closes,
aucune fuite, aucune paraphrase — vert. Aucun artefact d'exécution. Sommaire : jours 1 à 23.

**☐ Reste à faire.** `cours-algorithmes` jours 24 à 31 — 24 exercices : tri à bulles, tris par sélection et
insertion, récursivité en deux jours, complexité, piles et files, résolution de A à Z, examen. Les jours 26 et
27 reprendront les exercices du chapitre 5 du PDF de l'école — factorielle, carré par la méthode des impairs,
puissance, tours de Hanoï, PGCD avec sa relation de récurrence — avec la démarche en trois étapes du contrat C7.

### `cours-algorithmes` jours 24 à 27 — tris, récursivité, et le chapitre 5 du PDF
**144 exercices** au total (63 python + 81 algorithmes), 720 indices. `cours-algorithmes` : **27 jours sur 31**.

Quatre jours qui reprennent, pour la première fois du chantier, des **énoncés du PDF de l'école presque mot pour
mot** — c'est le bloc pour lequel le contrat de style avait été extrait, et il valait la peine d'attendre :

- **§ 5.2.6, le tri bulle** devient l'exercice 24.2, avec ses deux contraintes d'origine : saisie s'arrêtant sur
  zéro *ou* sur le tableau plein, et une procédure de tri qui doit elle-même appeler une **seconde procédure**
  chargée uniquement de permuter deux cases. C'est exactement la forme « saisie + tableau + procédure +
  permutation » que le prompt donnait comme modèle de l'exercice n° 2.
- **§ 5.1, la méthode des impairs et la puissance** deviennent l'exercice 26.2, avec la **démarche en trois
  étapes imposée** — expression commune, point d'arrêt, rapprochement — rédigée avant tout code et reprise en
  commentaire dans le corrigé. C'est le contrat C7 appliqué à la lettre.
- **§ 5.2.4, l'addition d'une série** devient l'exercice 26.1 : lecture récursive, zéro comme condition d'arrêt,
  aucune boucle nulle part.
- **§ 5.2.1, la traduction en binaire** devient l'exercice 27.1, énoncé repris tel quel.
- **§ 5.2.3, le PGCD** devient l'exercice 27.2, avec sa relation de récurrence **fournie dans le champ
  `principe`** — c'est précisément l'usage prévu par le contrat C2 : le principe mathématique est donné, la
  traduction en code reste entièrement à faire.
- **§ 5.2.2, les tours de Hanoï** deviennent l'exercice 27.3, avec les quatre arguments imposés par l'énoncé
  d'origine.

**Le fil de ces quatre jours est le coût, et la distinction entre correct et utilisable.**
- **La stabilité d'un tri** (24.3) tient à un seul caractère — comparaison stricte ou large. Deux joueurs à
  égalité s'échangeraient à chaque passage où ils se croisent, et le podium dépendrait alors du désordre du
  reste du tableau : deux tournois avec les mêmes ex æquo donneraient deux vainqueurs différents.
- **Le banc d'essai des tris** (25.2) mesure trois jeux de données et non un seul. L'insertion passe de 6 à 21
  comparaisons selon le désordre, la sélection reste à 21 quoi qu'il arrive — et le corrigé sépare deux
  questions qu'on confond : *laquelle est la meilleure* et *laquelle est la plus prévisible*.
- **Compter « des opérations » sans distinguer lesquelles** est un raccourci trompeur : l'insertion fait 29
  opérations contre 26 pour la sélection, et gagne pourtant — parce qu'une comparaison et un déplacement ne
  coûtent pas la même chose, et que leur rapport dépend de ce qu'on trie.
- **Fibonacci naïf** (27.2) : **177 appels** pour un résultat de 55, et plusieurs centaines de millions au rang
  40. Premier algorithme du cours qui soit correct et inutilisable — la distinction que le jour 28 formalisera.
  Le corrigé nomme la parade sans renoncer à la récursion : mémoriser les termes déjà calculés.
- **Hanoï à dix secondes par déplacement** (27.3) : cinq minutes pour 5 disques, trois heures pour 10, et
  **121 jours** pour 20. Chaque disque double la durée.

**Deux règles que ces jours dégagent et qui n'avaient pas encore été dites.**
- **Un tableau passé en paramètre n'est pas recopié** (24.2). La garantie du jour 21 — « un sous-programme ne
  peut rien casser chez son appelant » — *ne s'applique plus*. C'est ce qui rend la procédure de permutation
  possible et c'est ce qui la rend dangereuse : un sous-programme qui reçoit un tableau doit annoncer dans son
  nom s'il le modifie, et le banc d'essai du jour 25 doit recopier avant chaque tri, sous peine de mesurer le
  second tri sur un tableau déjà trié par le premier.
- **Une récursion à un appel se réécrit toujours en boucle ; une récursion à deux appels, non** (26.3). Avec
  deux appels, il faut mémoriser les travaux en attente — c'est-à-dire gérer soi-même une pile, donc réécrire à
  la main ce que la récursion fait gratuitement.

**La certitude sans le déroulé** (27.3). La réflexion demande d'essayer de dérouler Hanoï à trois disques, de
constater qu'on perd le fil au deuxième niveau, puis de dire ce qu'on peut affirmer *sans* avoir déroulé. C'est
le seul endroit du cours où l'on demande explicitement d'accepter une preuve à la place d'une observation — et
c'est ce que la démarche en trois étapes du chapitre 5 permet.

**Une paraphrase attrapée** (25.2, indices ③ et ⑤ à **86 %**) et huit fuites d'indice. La paraphrase est la
troisième du chantier, et toujours la même faute : un indice ③ écrit en pseudocode et un indice ⑤ en fragments
de code disent la même chose. Réécrit en français sans notation — « on retire la carte du tableau en la
mémorisant, ce qui libère sa case » — il retombe sous le seuil. **Le procédé qui marche est désormais établi :
l'indice ③ ne doit contenir aucune notation.**

**Un faux positif du vérificateur, assumé sans le contourner.** Le contrôle anti-fuite ne reconnaît que les
commentaires `#` et prend donc les commentaires `/* */` du pseudocode pour des lignes de code. Trois de mes
en-têtes de démarche en trois étapes ont ainsi été signalés contre le `principe` qui les résume. Plutôt que
d'ajouter une exception au vérificateur, les commentaires ont été reformulés : une exception ouverte pour un cas
anodin finit toujours par servir à un cas qui ne l'est pas.

**Vérifications.** `_verify_entrainement.js` : 48 leçons équipées, 144 exercices, treize mini-séries closes,
aucune fuite, aucune paraphrase — vert. Aucun artefact d'exécution. Sommaire : jours 1 à 27.

**☐ Reste à faire.** `cours-algorithmes` jours 28 à 31 — 12 exercices : complexité, piles et files, résolution
de A à Z, examen final. Puis les sept cours de langages restants : java, csharp, php (31 leçons chacun), c,
cpp-bas, cpp-moderne, asm (21 chacun) — soit 543 exercices.

### `cours-algorithmes` jours 28 à 31 — le cours est complet
**156 exercices** au total (63 python + 93 algorithmes), 780 indices. `cours-algorithmes` : **31 jours sur 31**.
Deuxième cours du chantier entièrement équipé, après `cours-python`.

La dernière mini-série, **La file du guichet**, suit les quatre dernières leçons : on mesure trois façons
d'organiser la file (28), on la réalise avec deux files à priorité (29), on répond à une demande neuve de la
direction par la méthode en six étapes (30), et l'on assemble tout à la fermeture (31).

**Le fil des quatre jours est celui d'un indicateur qui ment sans se tromper.**
- **Servir les dossiers courts d'abord** (28.3) réduit l'attente moyenne — mathématiquement certain. Le corrigé
  demande *qui paie* : l'usager au dossier le plus lourd, c'est-à-dire le plus souvent la situation la plus
  embrouillée, la personne qui parle mal la langue, le cas hors des cases. Et sous flux continu, ce dossier
  n'est jamais appelé. La réponse pratique — une garantie d'ancienneté — n'est pas un raffinement technique
  mais une contrainte d'équité qui coûte de la performance.
- **La famine des non-prioritaires** (29.3) est le défaut symétrique, découvert par la question de réflexion et
  corrigé au jour 31 : au plus trois prioritaires consécutifs, après quoi un usager ordinaire passe. Avec une
  échappatoire — si la file ordinaire est vide, le prioritaire passe quand même, sinon la garantie protégerait
  des usagers absents contre des usagers présents.
- **Un taux d'occupation de 60 % avec une file qui n'a jamais désempli** (31.3) est parfaitement possible : le
  taux mesure ce que les guichets ont *fait*, pas ce que les usagers ont *attendu*. C'est le même défaut que la
  séance la mieux suivie du jour 18 et le meilleur plat du jour 22, et la règle qui en sort est explicite :
  **ne jamais publier un indicateur sans celui qui pourrait le contredire.**

**Ce que le jour 30 fait de la méthode en six étapes.** Les trois exercices demandent de *rédiger* chaque étape
avant tout code, et l'étape 2 — résoudre un exemple à la main — y produit systématiquement une découverte que
l'énoncé ne contenait pas : deux bornes de col à la même altitude (30.1), trois questions non tranchées dans le
cahier des charges de l'épicier (30.2), et pour le dimensionnement du guichet (30.3) le constat que la boîte à
outils du mois reste presque fermée — une division, une comparaison, un arrondi vers le haut. « Quand la boîte
à outils reste presque fermée, c'est que l'effort était ailleurs. »

**Le jour 30 pose aussi la distinction entre ce qu'on décide et ce qu'on demande.** Sur les trois questions
non tranchées de l'épicier, une seule pouvait être décidée seul — « ne plus vendre » = vente strictement nulle,
parce que toute autre lecture exige d'inventer un seuil, c'est-à-dire de prendre une décision commerciale sans
mandat. Les deux autres sont posées en constantes nommées et signalées comme des décisions du commerçant : *un
nombre arbitraire enfoui dans le code est une décision prise en cachette.*

**Le dernier corrigé du cours** (31.3) demande quel réflexe, s'il ne devait en rester qu'un, sauverait le plus
d'erreurs. Réponse : **dérouler à la main sur un cas limite** — pas sur un cas normal, celui-là marche toujours.
C'est ce qui a fait apparaître, tout au long du mois, la moyenne du pêcheur bredouille, la borne de 19 h qui
refuse une entrée par jour, le maximum resté à zéro sur des relevés tous négatifs, le décalage de tableau qui
recopie la même valeur partout, et le plancher tarifaire qui passe sous son propre plancher. Aucune de ces
fautes ne provoque d'erreur ; toutes se voient en deux minutes de papier.

**Six fuites d'indice attrapées, aucune paraphrase.** Trois d'entre elles proviennent du même faux positif que
le lot précédent — les commentaires `/* */` du pseudocode comptés comme des lignes de code — et ont de nouveau
été corrigées par reformulation plutôt que par une exception au vérificateur. Une coquille rattrapée à la
relecture du corrigé 31.2, que le vérificateur ne pouvait pas voir.

**Vérifications finales du cours.** `_verify_entrainement.js` : 52 leçons équipées, 156 exercices, quinze
mini-séries closes, aucune fuite, aucune paraphrase — vert. `_coherence`, `_check_qcm`, `_verify_placement`,
`_verify_mermaid`, `_verify_vocab` : verts. Aucun artefact d'exécution. Sommaire de `cours-algorithmes` : la
mention passe à « déployé sur les 31 jours du cours ».

**Bilan des sept mini-séries d'algorithmes.** Le protocole du refuge (1→3), la borne de péage (4→7), la borne
d'arrosage (8→11), le carnet du gardien de phare (12→15), le fichier des adhérents (16→19), la billetterie du
théâtre (20→23), le classement du tournoi (24→27), la file du guichet (28→31). Chacune fait grandir une
application sur trois ou quatre jours et bute volontairement sur ce qui manque encore, pour que la leçon du
lendemain y réponde.

**☐ Reste à faire.** Les sept cours de langages : java, csharp, php (31 leçons chacun), c, cpp-bas,
cpp-moderne, asm (21 chacun) — soit **543 exercices**. Java, C et C++ disposent de compilateurs dans la chaîne
de vérification et devront donc porter des sorties attendues certifiées par exécution réelle ; C# et PHP
relèveront de la mention d'honnêteté standard ; l'assembleur demandera NASM.

---

## Entraînement du jour — cours-java, leçons 1 à 4 (12 exercices)

**Ce lot inaugure le premier cours de langage compilé, et il a fallu commencer par outiller la vérification.**
Jusqu'ici, le contrôle n° 6 du vérificateur — « tests honnêtes » — reposait sur une liste d'un seul élément :
`EXECUTABLES = ["python"]`. Tout autre langage devait se passer du champ `tests`, au motif qu'un test qui ne
tourne jamais est un mensonge affiché. Le motif reste juste ; c'est la liste qui était trop courte. Java se
compile et s'exécute en une commande (`java Fichier.java`, compilation en mémoire, aucun `.class` écrit), et
rien ne justifiait de publier 93 corrigés Java sans jamais les avoir lancés.

**Ce qui a changé dans `_verify_entrainement.js`** (le fichier fait désormais 460 lignes) :

- `EXECUTABLES` devient un registre `{ langage → outil, sonde }`. Le contrôle n° 6 garde exactement sa règle :
  `tests` présent **si et seulement si** le langage y figure.
- Un lanceur Java rejoue chaque corrigé dans un dossier temporaire, huit en parallèle, l'entrée standard
  alimentée par le champ `stdin`, la sortie capturée et exposée aux assertions sous le nom `__output__` — le
  même contrat que pour Python, avec des assertions écrites en Python pour que les deux langages se vérifient
  de la même façon.
- L'encodage est **fixé** (`-Dfile.encoding`, `-Dstdout.encoding`, `-Dstderr.encoding` à UTF-8). Sans cela la
  sortie dépend de la locale de la machine et les accents deviennent des « ? » : un test qui passe chez l'un et
  échoue chez l'autre ne prouve rien.
- **Si l'outil manque sur la machine, on ne fait pas semblant.** La sonde échoue, les corrigés du langage ne
  sont pas rejoués, et le rapport imprime en toutes lettres, sous le vert : « Le vert ci-dessus NE COUVRE PAS
  les corrigés suivants, faute d'outil ici ». Un vert partiel qui se tait vaudrait moins qu'un rouge.

**Une correction de définition, pas une exception de confort.** L'extraction des lignes de code (`lignesCode`)
coupait au premier `#` — donc mutilait toute ligne affichant un dièse — et ignorait `//`. En Java, chaque
phrase de commentaire comptait donc comme du code, et un indice qui explique la même idée avec les mêmes mots
aurait été dénoncé comme une fuite. Le repérage des commentaires est désormais **conscient des guillemets**
(`sansCommentaire`), les commentaires de bloc sur leur propre ligne sont écartés, et l'exclusion des
déclarations — qui ne couvrait que `def` et `class` — couvre les modificateurs de Java, C, C++ et C#. Sans
cela, l'en-tête obligatoire de tout programme Java aurait été une « fuite » dans chacune des 31 leçons.
Le corpus déjà vert (python, algorithmes) reste vert après ce changement.

**Une chaîne d'écriture nouvelle.** Les corrigés ne sont plus tapés dans une chaîne JavaScript échappée à la
main — c'est là que les coquilles se glissaient. Chaque corrigé est un vrai fichier `.java`, **compilé et
exécuté avant d'être intégré** ; un assembleur (`mkblock.py`) produit le bloc `ENTRAINEMENT` avec
`json.dumps`, donc sans plus aucun échappement manuel. Toutes les valeurs annoncées dans les énoncés et les
corrigés de ce lot ont été obtenues par exécution réelle, y compris les messages d'erreur du compilateur.

**Contrainte de progression respectée à la lettre.** Aucun exercice n'utilise une notion non encore enseignée.
Concrètement : pas de variable en leçon 1, pas d'opérateur arithmétique en leçon 2, **pas de `if` en leçon 3**
(l'arrondi supérieur du conditionnement se fait par `(n + p - 1) / p`, sans test), et pas de `printf` avant la
leçon 19 — vérifié dans le cours : `printf` n'y apparaît qu'à partir de cette leçon-là. Les promesses faites en
note de bas d'exercice pointent donc vers la bonne leçon, pas vers la leçon suivante par facilité.

**Les pièges retenus, tous certifiés par exécution.**

- **1.2 — le chemin Windows.** `"C:\tournoi\notes.txt"` écrit sans précaution **compile sans le moindre
  avertissement** : `\t` et `\n` sont des séquences valides. Le programme affiche un chemin coupé en deux, avec
  une tabulation et un retour à la ligne au milieu, et le `t` de tournoi comme le `n` de notes ont disparu.
  Aucun message : seulement un résultat faux. C'est la faute la plus dangereuse du lot.
- **2.1 — `integer number too large`.** Le compilateur examine la *valeur écrite* avant de regarder la variable
  de destination : agrandir le type ne suffit pas, il faut le suffixe `L`.
- **2.2 — les deux refus du compilateur**, relevés mot pour mot : `cannot assign a value to final variable` et
  `incompatible types: possible lossy conversion from double to int`. Le mot important est *possible* — le
  compilateur ne dit pas que tu vas perdre quelque chose, il dit qu'il ne peut pas garantir le contraire.
- **3.1 — `0.7000000000000001`.** 8,40 divisé par 12 ne tombe pas juste en binaire. La règle qui en sort :
  arrondir pour **afficher**, jamais pour stocker ; et ne jamais comparer deux `double` par un signe égal.
- **3.2 — `minutes / 60` vaut 0.** Le programme compile, tourne, et annonce 7,75 nœuds au lieu de 6,89. Une
  erreur qui **reste dans le domaine du vraisemblable** est plus dangereuse qu'une erreur absurde : rien ne
  déclenche le soupçon.
- **4.2 — le `nextLine` qui saute.** Certifié dans les deux sens : la version fautive enchaîne sans attendre,
  la version corrigée lit bien le nom de l'apiculteur.
- **4.2 — le séparateur décimal.** `nextDouble()` suit la **langue de la machine** : sur le poste belge de
  l'élève il faut taper `17,5`, sur le serveur de vérification `17.5`, sinon `InputMismatchException`. Le même
  fichier, deux comportements. C'est pour cela que les exercices de la leçon 4 ne lisent que des entiers et des
  lignes : mettre un `nextDouble` dans un corrigé vérifié en CI aurait produit un test vrai ici et faux chez
  elle.

**La mini-série « Le refuge de montagne » (1→4)** fait le trajet complet du mois en quatre jours : texte figé
(1/4), données extraites en variables (2/4), calculs de nuitées et taux d'occupation (3/4), saisie au clavier
(4/4). Deux moments valent d'être notés. Au jour 2, la sortie **cesse d'être identique** à celle du jour 1 sans
qu'on l'ait demandé — l'altitude perd son espace fine (un entier ne contient que des chiffres) et les tarifs
perdent leurs zéros de fin (un `double` mémorise une valeur, pas une écriture) : la réflexion du jour consiste
à trouver ces deux différences en comparant ligne à ligne. Au jour 3, la réflexion sur le taux d'occupation
tombe sur une **coïncidence arithmétique** : comparer 4 personnes à 34 couchages donne le même 11,8 % que 12
nuitées sur 102, parce que les deux termes ont été multipliés par le même nombre de nuits — et la coïncidence
s'évanouit dès qu'un membre du groupe ne reste pas toutes les nuits. *Un résultat juste ne prouve pas un
raisonnement juste.* Au jour 4, la saisie de 6 membres pour 4 personnes produit −126,00 € de nuitées visiteurs
et un total de 112,20 € : le programme ne proteste pas, parce qu'il n'a pas encore de quoi le faire.

**Cinq fuites d'indice attrapées par le vérificateur**, toutes dans l'indice ⑤ de la leçon 4 : les lignes de
création du `Scanner` et des trois premières lectures y figuraient à l'identique. Corrigées par masquage du
nom de variable. Aucune paraphrase — la règle établie sur `cours-algorithmes` (l'indice ③ ne contient aucune
notation, seulement la démarche en français) tient aussi pour un langage réel.

**Vérifications.** `_verify_entrainement.js` sur le dépôt complet : 56 leçons équipées, 168 exercices, seize
mini-séries, **12 corrigés Java compilés et exécutés, 60 tests rejoués**, et 63 corrigés Python, 353 tests —
vert, sans mention de langage non rejoué (les deux outils sont présents sur la machine). Aucun artefact
d'exécution : les corrigés Java tournent dans un dossier temporaire hors du dépôt. Sommaire de `cours-java` :
mention « 🏋️ Nouveau » posée, avec l'état honnête du déploiement (leçons 1 à 4) et la mention que les corrigés
Java sont compilés et exécutés avant publication.

**☐ Reste à faire.** `cours-java` leçons 5 à 31, puis csharp, php (31 leçons chacun), c, cpp-bas, cpp-moderne,
asm (21 chacun) — soit **531 exercices**. Pour C et C++, la même extension du vérificateur qu'aujourd'hui
(`gcc`, `g++` sont présents). C# et PHP relèveront de la mention d'honnêteté standard, `dotnet` étant absent ;
l'assembleur demandera NASM.

---

## Entraînement du jour — cours-java, leçons 5 à 8 (12 exercices)

**Un lot sans nouvelle mécanique : toute l'attention est passée dans le contenu.** L'outillage posé au lot
précédent — corrigés écrits en vrais fichiers `.java`, compilés et exécutés avant intégration, bloc assemblé
par `mkblock.py` sans échappement manuel — a tourné sans incident sur les douze exercices.

**La contrainte de progression a coûté trois exercices réécrits.** Le cours n'enseigne `charAt` nulle part
avant la leçon 9, et son `switch` ne porte que sur des entiers : le bulletin météo, qui lisait d'abord la
saison sous forme de lettre, a dû passer à un chiffre de 1 à 4. Vérifié dans le cours plutôt que supposé —
`grep` sur `charAt` donne zéro occurrence aux leçons 4 et 5, et les `case` de la leçon 5 sont tous numériques.
Même méthode pour `printf` (leçon 19) au lot précédent. La règle est désormais explicite : **avant d'utiliser
une construction, on vérifie dans le fichier de la leçon qu'elle y est enseignée.**

**Les pièges du lot, tous certifiés par exécution.**

- **5.2 — `==` sur les String « qui marche chez lui ».** Certifié dans les trois cas : deux littéraux
  identiques comparés par `==` donnent `true` (réserve commune des littéraux), une chaîne saisie au clavier
  comparée au même littéral donne `false`, et un `new String("SENIOR")` donne `false` lui aussi. D'où la
  formulation de la réflexion : le programme du camarade *marche vraiment*, tant qu'il ne teste qu'avec des
  valeurs écrites dans le code.
- **5.2 — l'ordre des bornes d'une cascade.** Un enfant de dix ans paie 16,80 € au lieu de 12,00 € si la borne
  des 26 ans est écrite avant celle des 12 ans. Aucune erreur, aucun avertissement : juste le mauvais tarif,
  tous les jours.
- **5.2 — remises composées contre remises additionnées.** 24 × 0,70 × 0,75 = 12,60 €, contre 10,80 € si l'on
  additionne 30 % et 25 %. Près de deux euros par billet.
- **6.2 — zéro divisé par zéro.** Les deux comportements relevés : `ArithmeticException: / by zero` entre
  entiers, `NaN` silencieux entre nombres à virgule. Le corrigé défend l'exception (bruyante, datée, localisée)
  contre le NaN, qui traverse un rapport entier sans que personne le remarque.
- **7.2 — `ArrayIndexOutOfBoundsException: Index 7 out of bounds for length 7`**, relevé mot pour mot. Le
  corrigé note que c'est une *bonne* nouvelle comparée au C, où la même faute lirait la mémoire voisine sans
  rien signaler.
- **8.2 — le passage par valeur.** Démonstration complète : 199,50 € avant l'appel, 179,55 € affichés *à
  l'intérieur* de la méthode, 199,50 € après. Le calcul a bien lieu — sur une copie.
- **8.2 — une marche dans le barème.** 80 exemplaires coûtent 48,00 € et 100 exemplaires 44,00 € : commander
  plus coûte moins cher. Le corrigé le signale comme un défaut de *barème*, pas de programme — un exercice
  scolaire n'est pas obligé de faire semblant que les règles commerciales sont cohérentes.

**La mini-série « La ressourcerie du quartier » (5→8)** fait déboucher chaque jour sur ce qui manque. Jour 1 :
un seul objet, barème à deux entrées, et un zéro qui doit s'écrire en toutes lettres — *quand un zéro est une
décision et non un calcul qui a échoué, un chiffre nu ne dit pas lequel des deux il est.* Jour 2 : une matinée
entière en boucle, et la découverte que le maximum a besoin de deux variables tenues dans le même test —
séparées, le montant serait juste et le libellé faux, les deux restant plausibles. Jour 3 : les tableaux, et
le premier renseignement **strictement impossible** sans mémoire (combien de bons dépassent le bon moyen) —
la réflexion démonte l'alternative, ressaisir toute la matinée deux fois, sur trois arguments. Jour 4 :
refactorisation en méthodes, **sortie prouvée identique** au jour 3 par comparaison de fichiers, pas à l'œil.

**La réflexion du jour 8 laisse une question ouverte, et c'est voulu.** Deux `switch` sur la même catégorie —
l'un pour le tarif, l'autre pour le nom — sont-ils la répétition qu'on cherche à éviter ? Le corrigé défend
les deux positions et conclut que ce qui manque n'est pas de la discipline mais un *outil* : un moyen de dire
qu'une catégorie est une chose portant à la fois un tarif et un nom. Rendez-vous est pris avec la classe
(leçon 12) et surtout l'énumération (leçon 24).

**Vingt-trois fuites d'indice attrapées par le vérificateur sur ce lot** (5 en leçon 5, 7 en leçon 6, 11 en
leçon 7), toutes dans l'indice ⑤ et toutes du même type : le squelette y reprenait à l'identique une ligne de
déclaration ou d'en-tête de boucle du corrigé. Corrigées par masquage du nom de variable ou de la borne. La
leçon 8, écrite après ce constat, est passée verte du premier coup — le masquage y a été systématique dès
l'écriture. Aucune paraphrase sur les soixante indices du lot.

**Un incident de cache, sans dégât.** Le fichier `cours-java/index.html` rapatrié dans le conteneur est revenu
dans une version périmée (7 351 caractères au lieu de 8 201, mention « 🏋️ Nouveau » absente) alors que la date
et la taille annoncées étaient bonnes — exactement le mode de panne qui avait détruit une section du CHANGELOG
au lot `cours-algorithmes`. Détecté par l'assertion posée avant modification, qui a échoué au lieu d'écraser.
Le sommaire a donc été modifié **directement sur la machine**, comme le CHANGELOG l'est depuis cet incident.
*La règle reste : ne jamais juger de la fraîcheur d'un fichier sur sa taille et sa date.*

**Vérifications.** `_verify_entrainement.js` sur le dépôt complet : 60 leçons équipées, 180 exercices, dix-sept
mini-séries, 24 corrigés Java compilés et exécutés, 63 corrigés Python — vert. `_coherence`, `_check_qcm`,
`_verify_placement`, `_verify_mermaid`, `_verify_vocab` : verts. Sommaire de `cours-java` : mention mise à
jour à « leçons 1 à 8 », liste des domaines complétée.

**☐ Reste à faire.** `cours-java` leçons 9 à 31, puis csharp, php, c, cpp-bas, cpp-moderne, asm — soit
**519 exercices**.

---

## Entraînement du jour — cours-java, leçon 9 (3 exercices)

**Commit intermédiaire volontaire, d'une seule leçon.** La règle « un cours ne se commite que complet » a été
assouplie sur autorisation ; ce commit-ci va plus loin et n'attend même pas le lot de quatre, parce que la
leçon était vérifiée et qu'une leçon vérifiée non commitée est une leçon qui peut disparaître.

**La classe String, et son piège central : l'immuabilité.** Certifié par exécution — `t.toUpperCase();` seul
laisse `t` inchangé, `t = t.toUpperCase();` le change. Le corrigé explique aussi pourquoi le compilateur ne
prévient pas : il faudrait pour cela interdire d'appeler une méthode pour son seul effet, ce qui condamnerait
tous les affichages. Et il retourne l'argument — l'immuabilité offre en échange trois garanties, dont la mise
en commun des chaînes identiques, qui explique rétroactivement le comportement de `==` vu à la leçon 5.

- **9.1 — le philatéliste** découpe par positions fixes, et l'énoncé fait afficher la saisie brute encadrée de
  crochets : un espace en fin de ligne est invisible, fait échouer les comparaisons, et coûte une soirée.
- **9.2 — la radio associative** découpe par séparateurs. Le motif `" +"` plutôt que `" "` : avec un seul
  espace comme séparateur, deux espaces consécutifs produisent un mot vide, le compte est faux d'une unité, et
  l'acronyme lève une exception en cherchant la première lettre d'un mot qui n'en a pas. La note de fin porte
  sur `-1` comme valeur d'échec de `indexOf` — traiter un échec comme une réussite en position zéro est le bug
  classique de la méthode.
- **9.3 — La grainothèque 1/4** valide un code `ESP-VARIETE-ANNEE`. Quatre verdicts affichés **séparément**,
  parce qu'un bénévole qui lit « année sur 4 chiffres : false » sait quoi corriger, et que celui qui lit
  « code invalide » ne sait rien. *Un message d'erreur qui ne dit pas quoi réparer n'est pas un message
  d'erreur, c'est un refus.* Les verdicts partent de « faux » et l'on n'accorde que ce qu'on a pu vérifier.

**La réflexion du jour oppose les deux exercices l'un à l'autre.** Positions fixes contre séparateurs : sur un
code trop court, la première méthode lève une `StringIndexOutOfBoundsException` et le programme s'arrête sur
une saisie que l'utilisateur avait le droit de faire ; la seconde rend simplement moins de morceaux que prévu,
une information testable. La conclusion est posée comme un critère de choix et non comme une préférence de
style : *le confort d'écriture des positions fixes n'est réel que sur les données bien formées, c'est-à-dire
exactement là où le choix n'a pas d'importance.*

**Cinq fuites d'indice attrapées**, toutes du même type que les lots précédents — enchaînements de méthodes et
en-têtes de boucle recopiés à l'identique dans l'indice ⑤. Corrigées par masquage.

**Vérifications.** `_verify_entrainement.js` : 61 leçons équipées, 183 exercices, 27 corrigés Java compilés et
exécutés — vert. Sommaire de `cours-java` : mention à « leçons 1 à 9 ».

---

## Entraînement du jour — cours-java, leçon 10 (3 exercices)

**ArrayList, et le seul piège qui vaut une leçon entière : le retrait en cours de parcours.** L'exercice 10.2
est construit autour de lui et impose d'écrire d'abord la version fautive, de la lancer, et de noter ce qui
reste. Résultat certifié par exécution : sur six éléments dont quatre à retirer, la boucle du début vers la
fin en laisse quatre — `[close, ouverte, close, ouverte]`. Deux interventions closes survivent à la purge, et
rien ne le signale.

**Ce qui rend cette faute redoutable est écrit noir sur blanc dans la remarque** : son résultat dépend des
données. Sur une liste où deux éléments à retirer ne se suivent jamais, le programme fautif donne le bon
résultat — et l'on croit qu'il est correct jusqu'au jour où deux se suivent. La question c fait dérouler trois
tours de boucle à la main ; la règle qui en sort tient en une phrase : *chaque retrait fait sauter exactement
un élément.*

**La réflexion pousse la correction dans ses retranchements.** Parcourir à rebours immunise parce qu'un retrait
en position *i* ne déplace que ce qui est après *i*, déjà examiné. Mais la question demande ce qui se passerait
en parcourant à rebours tout en retirant chaque fois le **premier** élément — et la réponse renverse
l'explication naïve : ce n'est pas le sens du parcours qui protège, c'est le fait de retirer précisément là où
l'on se trouve.

- **10.1 — les cuves de la brasserie** oppose la boucle indexée à la boucle abrégée sur un critère concret :
  la seconde ne peut pas se tromper d'indice, puisqu'elle n'en manipule aucun. Le corrigé signale au passage
  le piège `remove(int)` contre `remove(Object)` sur une liste d'entiers — l'un des rares endroits où la
  bibliothèque standard de Java est franchement traître.
- **10.3 — La grainothèque 2/4** distingue deux refus, code mal formé et doublon, parce qu'ils appellent des
  gestes opposés : corriger sa saisie dans un cas, aller poser une question dans l'autre. La réflexion va plus
  loin et met en cause le refus des doublons lui-même : le code identifie une *variété*, pas un *sachet*, et
  deux dons de la même variété sont légitimes. Ce qui manque n'est pas une ligne de code mais un modèle de
  données — rendez-vous leçons 12 et 18.

**Une note de bas d'exercice anticipe une confusion classique** (10.2) : une liste passée en paramètre est bien
copiée, mais ce qui est copié est la *référence*. Ce n'est pas une exception au passage par valeur de la leçon
8, c'en est la conséquence exacte sur les objets.

**Six fuites d'indice attrapées**, dont trois d'un type nouveau : les en-têtes de boucle abrégée
(`for (String nom : cuves)`) reprises telles quelles. Corrigées par masquage du nom de la collection.

**Vérifications.** `_verify_entrainement.js` : 62 leçons équipées, 186 exercices, 30 corrigés Java compilés et
exécutés — vert. Sommaire de `cours-java` : mention à « leçons 1 à 10 ».

---

## Entraînement du jour — cours-java, leçons 11 et 12 (6 exercices)

**La mini-série « La grainothèque » se clôt (9→12)** sur exactement la trajectoire annoncée : valider un code
(String), tenir un catalogue de taille inconnue (ArrayList), le trier et le fouiller (algorithmes), puis
remplacer les listes parallèles par une classe. Le dernier jour supprime un défaut qui traînait depuis la
leçon 7.

**Ce que la leçon 11 mesure au lieu de l'affirmer.** Les trois exercices comptent leurs comparaisons dans le
programme lui-même — « c'est ainsi qu'on mesure un algorithme sans se fier à sa vitesse d'exécution, laquelle
dépend de la machine, de sa charge et de mille choses qui n'ont rien à voir avec l'algorithme ». Sur le
catalogue de douze sachets, chiffres certifiés par exécution : séquentielle avant tri, 8 comparaisons ;
séquentielle après tri, 12 ; dichotomie, **4**.

**Le piège central du jour 11, certifié dans les trois cas.** Dichotomie appliquée à un tableau NON trié :
chercher 38 rend −1, chercher 45 rend −1 — deux valeurs pourtant présentes — et chercher 52 rend 0, la bonne
position, **par pure coïncidence**. C'est ce troisième cas que la réflexion désigne comme le dangereux : les
deux échecs se remarquent, la réussite accidentelle non. *Un algorithme employé hors de ses conditions ne
signale pas son abus, il rend une réponse arbitraire.*

**La réflexion du 11.3 refuse la conclusion facile.** La dichotomie coûte trois fois moins que la séquentielle
— mais le tri préalable coûte 66 comparaisons, soit plus que les deux recherches réunies. Sur une seule
recherche, c'est une mauvaise affaire, et le corrigé le calcule au lieu de l'esquiver : il faut six ou sept
recherches pour rentabiliser ce tri. La vraie réponse n'est pas « trier plus vite » mais « garder le catalogue
toujours trié », ce qui déplace le problème vers les structures ordonnées (leçon 18).

**La leçon 12 fait tenir ensemble deux affirmations qui se contredisent en apparence.** La leçon 8 avait
certifié qu'une méthode ne peut pas modifier le montant qu'on lui passe ; le 12.2 certifie qu'une méthode
modifie bel et bien la pièce qu'on lui passe. La réflexion lève la contradiction : Java copie toujours la
valeur de l'argument, mais la valeur d'une variable d'objet est la *référence*, et une copie d'adresse mène au
même endroit. La formule retenue : **une méthode peut changer l'objet, jamais la variable.** Certifié aussi :
deux variables désignant le même objet (`==` rend `true`, la cuisson par l'un se voit par l'autre), et le
message moderne de la `NullPointerException`, qui nomme le champ demandé.

**La réflexion du 12.3 s'oblige à donner raison à l'adversaire.** Trois erreurs que les listes parallèles
rendaient possibles et que la liste d'objets rend impossibles à écrire (trier l'une sans l'autre, retirer d'un
seul côté, décaler d'un cran) — puis, honnêtement, ce que les listes parallèles font mieux : pas d'en-tête
d'objet, et un net avantage de vitesse sur de très gros volumes traités colonne par colonne. « C'est un vrai
argument, employé dans le calcul scientifique ; il ne concerne simplement pas une grainothèque de quartier. »

**Deux constructions retirées après vérification dans le cours.** `Math.PI` n'apparaît **nulle part** dans
`cours-java` : le volume du potier se calcule avec une constante nommée déclarée dans la classe.
`Integer.parseInt` n'arrive qu'à la leçon 16 : l'année du sachet est donc fournie à part plutôt qu'extraite du
code, et le corrigé le dit en commentaire avec le renvoi à la bonne leçon. Le contrôle `grep` avant écriture
est maintenant systématique — il a déjà rattrapé `printf`, `charAt`, le `switch` sur String, `Math.PI` et
`parseInt`.

**Un détail technique du lanceur mono-fichier**, découvert en exécutant : `java Fichier.java` cherche le point
d'entrée dans la **première** classe déclarée du fichier. Les corrigés à deux classes placent donc la classe
porteuse du programme principal en tête, et l'indice ④ du 12.1 prévient l'élève de ce piège plutôt que de le
laisser buter dessus.

**Trois fuites d'indice attrapées** sur les six exercices — le meilleur ratio des lots Java, l'écriture
masquant désormais les identifiants dès le premier jet.

**Vérifications.** `_verify_entrainement.js` : 64 leçons équipées, 192 exercices, dix-neuf mini-séries, 36
corrigés Java compilés et exécutés — vert. Sommaire de `cours-java` : mention à « leçons 1 à 12 ».

**☐ Reste à faire.** `cours-java` leçons 13 à 31, puis csharp, php, c, cpp-bas, cpp-moderne, asm — soit
**513 exercices**.

---

## Entraînement du jour — cours-java, leçons 13 à 15 (9 exercices)

**Nouvelle mini-série, « Le parc à vélos partagés » (13→16)**, construite pour que chaque jour bute sur ce que
l'outil du jour ne sait pas faire. Jour 1 : une classe dont l'état ne peut changer que par deux méthodes
gardées. Jour 2 : les vélos électriques, qui *sont* des vélos. Jour 3 : les trottinettes, qui n'en sont pas.
Jour 4 : ce qui échoue vraiment.

**Le fil conducteur des trois leçons est une même question posée trois fois : que garantit ce code ?**

- **13.3** demande de formuler la garantie en une phrase commençant par « il est impossible que… ». Réponse :
  *il est impossible que le compteur de courses d'un vélo diffère du nombre de fois où la méthode de location
  a réussi sur ce vélo.* Ce n'est pas une promesse de bonne conduite mais une propriété vérifiable en lisant
  les quelques lignes de la classe.
- **14.3** revient dessus et la fragilise : la garantie n'est vraie *que tant qu'il n'existe qu'un seul endroit
  où une location réussit*. Chaque copie de la logique l'affaiblit sans jamais l'annoncer — d'où l'appel à la
  méthode de la mère plutôt que sa recopie.
- **15.3** demande de nommer trois affirmations **fausses** que produirait une trottinette héritant des vélos,
  et surtout à quel moment concret cela coûterait quelque chose : le jour où l'on ajoute aux vélos un
  comportement dépourvu de sens pour les trottinettes, il faudra soit l'écrire pour tout le monde, soit tester
  dans la mère la nature réelle de l'objet — *l'aveu que la hiérarchie était fausse depuis le début*.

**Les points de conception traités frontalement, sans les esquiver.**

- **13.1** ne fournit aucune méthode d'écriture pour le poids ni le lait, et le corrigé le justifie : « la
  question à se poser n'est pas comment donne-t-on accès, c'est qui a besoin de quoi ». Le prix n'est pas
  stocké mais recalculé — stocker une valeur dérivée oblige à penser à la mettre à jour.
- **13.2** définit l'invariant et exige que **tous** les chemins qui modifient l'état le vérifient. La
  réflexion refuse la réponse molle (« on pourrait oublier ») : avec des champs publics, la garantie n'existe
  pas du tout, et la prouver exigerait de relire tout le code, y compris celui que d'autres écriront demain.
  *On ne rend pas les fautes moins probables, on rend la vérification possible.* Et : un setter qui accepte
  tout est un champ public avec des parenthèses en plus.
- **14.2** fait descendre le solde à −280 € sur un compte à découvert et le refuse sur un compte ordinaire, à
  travers le **même appel**. La réflexion porte sur le refus du compilateur quand on demande le découvert
  depuis un tableau du type de la mère — refus présenté comme une bonne nouvelle : il oblige à écrire du code
  qui vaut pour tout ce que le tableau peut contenir, y compris ce qui n'existe pas encore.
- **15.2** oppose deux contrats qui se recoupent partiellement (quatre instruments relevables, trois
  entretenables) et explique pourquoi l'héritage multiple est interdit : deux mères fournissant un corps pour
  la même méthode poseraient une question sans réponse. La réflexion sur l'obligation de rendre publiques les
  méthodes d'interface conclut : *une interface ne peut pas contenir de méthode discrète.*

**Trois constructions retirées après vérification.** `getClass().getSimpleName()` (14.1) remplacé par une
méthode redéfinie — plus explicite et dans le vocabulaire du cours ; `instanceof` (15.2) écarté, il n'arrive
qu'avec le filtrage par motif de la leçon 24. S'y ajoutent `Math.PI` et `Integer.parseInt` du lot précédent.

**Une nuance pédagogique sur `@Override`** (14.1) : l'annotation est facultative et indispensable. Sans elle,
une faute de frappe dans le nom produit une méthode neuve qui ne sera jamais appelée, et le programme affiche
tranquillement le comportement de la mère. La checklist fait faire l'expérience dans les deux sens.

**Cinq fuites d'indice attrapées** sur les neuf exercices, toutes des signatures de méthode reprises telles
quelles dans l'indice ⑤.

**Un incident d'infrastructure, sans perte.** Le pont vers la machine s'est coupé entre le dépôt des fichiers
des leçons 13 et 14 et leur commit. Les deux fichiers étaient déjà écrits sur le disque ; la leçon 15 a été
rédigée et vérifiée en local pendant l'attente, et les trois leçons ont été commitées ensemble au retour du
pont. Aucun travail perdu — mais la leçon reste la même qu'au lot 2 : ce qui n'est pas commité peut disparaître.

**Vérifications.** `_verify_entrainement.js` : 67 leçons équipées, 201 exercices, vingt mini-séries, 45
corrigés Java compilés et exécutés — vert. Sommaire de `cours-java` : mention à « leçons 1 à 15 ».

---

## Entraînement du jour — cours-java, leçon 16 (3 exercices)

**La mini-série « Le parc à vélos partagés » se clôt (13→16)** en posant, au dernier jour, la question que les
trois précédents préparaient : depuis la leçon 13, la location d'un engin rend un booléen ; aujourd'hui, la
méthode de station lève des exceptions. Les deux façons de faire coexistent dans le programme final, **et ce
n'est pas une incohérence**. Ce qui les distingue, énoncé par la réflexion du 16.3 : la distance entre
l'endroit où le problème est constaté et celui où il peut être traité. La méthode de location est appelée par
la station, juste à côté, qui sait quoi faire d'un refus et dont la ligne suivante en dépend — un booléen ne
peut pas y être oublié. La méthode de station, elle, est appelée par du code qui pourrait être n'importe où et
qui ne saura peut-être pas quoi faire. *Un booléen quand l'échec est une issue normale que l'appelant immédiat
sait traiter ; une exception quand l'échec est anormal ou doit remonter.*

**Le point le plus important du jour, formulé dans la remarque du 16.3 :** toute valeur de retour qui exige
une vérification préalable est une exception déguisée, avec en moins la garantie qu'on ne l'oubliera pas.

**Les trois exercices, tous certifiés par exécution.**

- **16.1 — la pharmacie de garde** sépare deux incidents à deux moments distincts : `NumberFormatException`
  sur la conversion, `ArithmeticException` sur la division. Deux zones surveillées, pas une. Le bloc
  `finally` est justifié précisément : écrit après la zone surveillée plutôt que dedans, il serait sauté par
  une exception non attrapée — *et c'est précisément dans ce cas-là qu'on a le plus besoin de refermer ce
  qu'on a ouvert*. La remarque défend le choix de conception de `parseInt` : un zéro silencieux se serait
  glissé dans les calculs sans que personne le remarque.
- **16.2 — le comptoir d'enregistrement** oppose l'exception à la valeur conventionnelle. La question d
  demande deux raisons, dont une propre au domaine : il y a **trois** issues à distinguer (accepté sans
  supplément, accepté avec supplément, refusé) et deux motifs de refus — un seul nombre ne peut pas porter
  tout cela sans devenir « un langage secret entre la méthode et son appelant ».
- **La réflexion du 16.2** démonte le `catch (Exception)` global posé « pour ne rien laisser passer ». Deux
  pertes : la première visible — le programme s'arrête au troisième bagage sur cinq, et les totaux portent sur
  deux bagages au lieu de cinq ; la seconde invisible — un indice hors bornes ou une référence nulle
  s'afficherait comme un refus de bagage, *un bug deviendrait un cas métier traité et personne ne le
  corrigerait jamais*. Règle retenue : on attrape ce qu'on sait traiter, et rien d'autre.

**Huit fuites d'indice attrapées**, toutes des lignes `catch` reprises à l'identique. Corrigées en masquant le
nom de la variable d'exception plutôt que son type — le type reste visible, il est l'information pédagogique ;
c'est le squelette exact qui ne devait pas l'être.

**Une coupure du pont d'une trentaine de minutes**, entre la vérification de la leçon 16 et son déploiement.
Cette fois les outils de fichiers ont disparu de la session, pas seulement échoué. Quatre tentatives espacées,
puis un choix explicite : **ne pas écrire la leçon 17 à l'aveugle**. Depuis le lot 2, aucune construction
n'est employée sans avoir été cherchée dans le fichier de la leçon qui l'enseigne, et ce contrôle exige le
dépôt. Écrire sans lui aurait produit du contenu vraisemblable et invérifiable — exactement ce que ce
CHANGELOG documente comme le risque principal du chantier. Le bloc vérifié a été livré à l'élève en pièce
jointe comme assurance, et le déploiement a repris au retour du pont.

**Vérifications.** `_verify_entrainement.js` : 68 leçons équipées, 204 exercices, vingt-et-une mini-séries, 48
corrigés Java compilés et exécutés — vert. Sommaire de `cours-java` : mention à « leçons 1 à 16 ».

**☐ Reste à faire.** `cours-java` leçons 17 à 31, puis csharp, php, c, cpp-bas, cpp-moderne, asm — soit
**498 exercices**.

---

## Entraînement du jour — cours-java, leçon 17 (3 exercices)

**Le vérificateur a dû apprendre à regarder les fichiers, pas seulement la sortie.** Un exercice sur les
fichiers dont on ne vérifierait que l'affichage ne vérifierait rien de ce qui compte : un corrigé pourrait
imprimer le bon bilan sans avoir jamais rien écrit sur le disque. Or les assertions Python tournaient jusqu'ici
dans le dossier du vérificateur, pas dans celui du programme — `open('brocante.csv')` échouait.

**La correction, dans `RUNNER_JAVA`, sépare l'exécution du contrôle en deux phases.** Les programmes tournent
toujours en parallèle, chacun dans son dossier temporaire — c'est le temps long. Les assertions, elles, se
jouent ensuite **une par une**, chacune depuis le dossier de son exercice. La sérialisation est nécessaire :
le dossier courant est global au processus, on ne peut pas en changer depuis huit fils simultanés. Le coût est
nul (les assertions sont instantanées) et le gain est décisif — un test a désormais le droit d'ouvrir le
fichier que le corrigé vient d'écrire. Le namespace expose aussi `__dossier__` pour les cas où un chemin
absolu serait préférable. Vérifié sur la machine : **aucun artefact d'exécution** dans le dépôt, ni `.csv` ni
`.class` — tout reste dans le temporaire.

**Les trois exercices.**

- **17.1 — le carnet de la brocante** impose de recalculer les quatre totaux **en relisant le fichier**, pas
  en réutilisant le tableau de départ. Ce n'est pas une contrainte gratuite : c'est ce qui prouve que
  l'écriture a fonctionné. La remarque le dit : au troisième lancement, le tableau et le fichier n'auront plus
  le même contenu, et seul le fichier dira la vérité. Le corrigé fait apparaître 285 € de valeur affichée
  contre 205 € de recette réelle — deux chiffres justes qui racontent deux choses différentes, et la règle du
  mois d'algorithmique revient : *ne jamais afficher un indicateur sans celui qui pourrait le contredire.*
- **17.2 — le journal de la station de ski** emboîte trois niveaux de contrôle : le fichier s'ouvre-t-il, la
  ligne a-t-elle la bonne forme, le champ a-t-il le bon contenu. Deux zones surveillées de portées
  différentes — l'une autour du fichier, l'autre autour de la seule conversion, **à l'intérieur** de la
  boucle. Les placer au même niveau ferait qu'une ligne fautive condamnerait tout le fichier, la faute
  exactement analysée à la leçon 16.
- **La réflexion du 17.2 porte sur le mode d'ouverture**, et c'est la plus insidieuse du lot. Le mode qui
  écrase au lieu d'ajouter ne produit **rien d'anormal au premier lancement** (le fichier n'existe pas encore)
  ni au deuxième (le programme y remet les mêmes données). L'exploitant ne verra rien. Il s'en apercevra le
  jour où les données différeront d'une exécution à l'autre — et la donnée détruite ne se reconstitue pas.
  *Invisible tant qu'on teste avec les mêmes données.*
- **La note de fin du 17.2** signale un trou que même le compteur de lignes illisibles ne voit pas : un
  passage sur une remontée absente du tableau de noms n'est compté nulle part **et** n'est pas signalé comme
  illisible. Il disparaît. On ne le trouve qu'en vérifiant que la somme des compteurs égale le total.

**La mini-série « Le club de course à pied » (17→20)** s'ouvre sur un journal en mode ajout et un bilan.
L'allure — minutes par kilomètre — est une échelle inversée de plus : la meilleure allure se cherche comme un
**minimum**, alors que l'intuition pousse au maximum. La réflexion refuse ensuite de valider son propre
indicateur : comparer les 4,76 min/km de Rachid sur 8,2 km aux 5,47 de Salomé sur 15 km revient à demander qui
court le plus vite en autorisant l'un à courir deux fois moins longtemps. Ce que la mesure dit réellement,
c'est « la sortie la plus rapide du journal » — légitime, à condition de l'annoncer ainsi. Comparer deux
coureurs demanderait de regrouper les sorties par coureur, ce que le programme ne sait pas faire : c'est le
sujet de la leçon 18.

**Six fuites d'indice attrapées.** Aucune paraphrase.

**Vérifications.** `_verify_entrainement.js` : 69 leçons équipées, 207 exercices, vingt-deux mini-séries, 51
corrigés Java compilés et exécutés — vert. Sommaire de `cours-java` : mention à « leçons 1 à 17 ».

---

## Entraînement du jour — cours-java, leçon 18 (3 exercices)

**La leçon 18 répond à la question que la 17 avait laissée ouverte** : comparer deux coureurs, et non deux
sorties. Le regroupement par clé le permet, et l'exercice 18.3 le fait — puis, aussitôt, met en doute sa
propre méthode de calcul.

**La réflexion du 18.3 porte sur la moyenne des rapports**, et c'est la plus mathématique du cours Java. Une
allure moyenne se calcule-t-elle en divisant les cumuls, ou en faisant la moyenne des allures de chaque
sortie ? Les deux valeurs sont calculées pour Rachid : **5,15 min/km** par les cumuls (184 min pour 35,7 km),
**5,12** par la moyenne de ses trois allures (5,68 · 4,76 · 4,93). L'écart est petit ici et peut être énorme
ailleurs. La bonne méthode est celle des cumuls, et la raison tient en une phrase : *la moyenne de plusieurs
rapports n'est pas le rapport des sommes, sauf si tous les dénominateurs sont égaux.* Faire la moyenne des
allures revient à donner le même poids à une sortie de 3 km qu'à une de 30 km. Analogie retenue dans le
corrigé : la consommation moyenne d'une voiture ne se calcule pas en moyennant les consommations de chaque
plein.

**Un ex æquo exploité plutôt que masqué.** En 18.2, alto et soprano comptent cinq places chacun. Le programme
annonce alto — parce que le parcours alphabétique le rencontre en premier et que la comparaison est stricte.
Le corrigé refuse de dire que c'est faux : c'est **incomplet**, la question n'a pas de réponse unique et un
programme honnête devrait signaler l'égalité. La seconde moitié de la réflexion enchaîne sur la
reproductibilité : le tri préalable des clés fixe l'ordre de rencontre, donc le vainqueur de l'ex æquo. Sans
lui, l'ordre serait celui de la `HashMap`, qui n'en promet aucun — *le même programme pourrait annoncer alto
aujourd'hui et soprano après une mise à jour de Java, sans qu'une ligne ait changé.* Un résultat qui dépend
d'un ordre non spécifié est un résultat qu'on ne peut pas défendre.

**Les trois structures distinguées explicitement en 18.2 :** une association de nombres pour « combien de
fois », un ensemble pour « combien de valeurs distinctes » (huit choristes sur quinze présences, sans rien
compter), et une association d'ensembles pour « lesquels » — la forme la plus courante des vrais programmes.
Le piège de mécanique est signalé : un ensemble obtenu par la valeur de repli n'est associé à personne et doit
être redéposé après modification.

**18.1 distingue deux questions qu'on croit identiques** : « combien de commandes pour le couscous » et « le
couscous est-il à la carte ». Zéro et absent ne sont pas la même chose — un plat peut être à la carte avec
zéro commande. La note de fin rappelle le prix de la rapidité d'une `HashMap` : l'absence totale d'ordre, et
l'existence de variantes triées.

**Le tri à bulles écrit pour la troisième fois**, et l'indice ④ le dit franchement à l'élève : « remarque que
tu l'écris pour la troisième fois : la leçon 25 t'apprendra à ne plus jamais l'écrire ». Assumer la répétition
en annonçant sa fin vaut mieux que de la laisser passer pour normale.

**Trois fuites d'indice attrapées**, toutes des en-têtes de boucle abrégée.

**Vérifications.** `_verify_entrainement.js` : 70 leçons équipées, 210 exercices, vingt-trois mini-séries, 54
corrigés Java compilés et exécutés — vert. Sommaire de `cours-java` : mention à « leçons 1 à 18 ».

---

## Entraînement du jour — cours-java, leçon 19 (3 exercices)

**Une leçon sur le hasard pose un problème de vérification avant de poser un problème de programmation.** Un
corrigé dont la sortie change à chaque exécution ne peut pas être rejoué par la CI — et, plus grave, ne peut
pas être vérifié par l'élève. La contrainte est donc écrite dans l'énoncé lui-même : *« deux exécutions
successives doivent donner exactement le même tournoi, sans quoi tu ne pourras jamais vérifier que ton
programme est juste »*. La graine fixée n'est pas un artifice pédagogique glissé dans le corrigé, c'est une
exigence de l'exercice.

**Et la réflexion du 19.2 retourne aussitôt cette qualité en défaut.** La même propriété qui rend le tournoi
vérifiable rendrait un mot de passe provisoire devinable. Le corrigé détaille le scénario : la graine est
souvent dérivée de l'heure de démarrage, ce qui laisse quelques milliers de valeurs à essayer ; un attaquant
qui obtient un seul mot de passe peut retrouver la graine, puis calculer tous ceux déjà distribués et tous
ceux à venir. Règle retenue : *le générateur ordinaire pour les jeux, les simulations et les tests ; jamais
pour ce qui protège quelque chose.*

**Deux pièges de bornes, tous deux certifiés.** Le tirage d'un score prend une borne **exclue** : `nextInt(181)`
pour un score de 0 à 180 — *« un tournoi où personne ne peut faire 180 passerait totalement inaperçu »*. Et
le mélange de Fisher-Yates doit pouvoir laisser un élément à sa place : exclure la case courante donnerait un
mélange qui n'est pas équitable. La remarque signale que le mélange « naïf » — échanger avec une case tirée
n'importe où — produit des permutations de probabilités inégales, *indétectable sur un tirage, flagrant sur un
million*.

**Le même souci de reproductibilité gouverne les dates.** Aucun exercice n'emploie la date du jour : *« un
programme qui partirait de la date du jour donnerait un résultat différent chaque matin, et personne — toi
comprise — ne pourrait vérifier qu'il est juste »*. Le seul semis qui franchit une fin de mois (courgette, 31
mars → 5 avril) est placé exprès dans le jeu de données : c'est là qu'un calcul à la main se serait trompé.

**Une non-déterminisme assumé et documenté plutôt que masqué.** `printf("%.2f")` suit la **langue de la
machine** : le corrigé affiche `2.40` sur le serveur de vérification et `2,40` sur le poste belge de l'élève.
Plutôt que de contourner le problème, le champ `pourquoi` du 19.1 en fait le sujet et le raccroche
explicitement au piège de `nextDouble` de la leçon 4 — le même phénomène, vu cette fois du côté de l'écriture.
Les tests de ce lot portent donc sur des valeurs indépendantes du séparateur.

**La mini-série (19.3) referme le défaut signalé à la leçon 18** — un bilan qui portait sur tout le journal
depuis toujours — en ajoutant une date et un filtre de période, bornes incluses **annoncées à l'affichage**
parce que « du 1er au 31 mai » se lit de deux façons qui diffèrent de deux jours de données. Puis la réflexion
montre que **la date n'a pas suffi** : relancé trois fois, le programme compte six sorties pour Salomé au lieu
de deux. Une date ne dit pas qu'une ligne est *la même* qu'une autre — et trois lignes identiques peuvent être
un doublon comme trois sorties réelles. Ce qui manque est un identifiant attribué à l'enregistrement,
c'est-à-dire une clé primaire : *l'idée qu'une donnée doive porter de quoi être reconnue, indépendamment de
son contenu.*

**Huit fuites d'indice attrapées**, dont deux d'un type nouveau — des lignes `import` reprises telles quelles.

**Vérifications.** `_verify_entrainement.js` : 71 leçons équipées, 213 exercices, vingt-quatre mini-séries, 57
corrigés Java compilés et exécutés — vert. Sommaire de `cours-java` : mention à « leçons 1 à 19 ».

---

## Entraînement du jour — cours-java, leçon 20 (3 exercices)

**La mini-série « Le club de course à pied » se clôt (17→20)**, et elle a été construite pour que chaque jour
laisse un défaut nommé que le lendemain répare : un journal qui cumule depuis toujours (17) → une date et un
filtre (19) ; des sorties qu'on ne peut pas regrouper (17) → le regroupement par clé (18) ; trois associations
parallèles (18) → un objet unique par coureur (20). Le seul défaut resté ouvert l'est **volontairement** : il
manque un identifiant par ligne, signalé à la leçon 19 et rappelé à la note finale — *c'est là que commence,
vraiment, la persistance des données.*

**La réflexion du 20.3 s'oblige à répondre à l'objection contre elle-même.** Le palmarès générique remplace
deux boucles de cinq lignes par une classe de trente : en quoi est-ce un progrès ? Le corrigé refuse de compter
en lignes et nomme les trois apports — un nom pour ce qu'on fait, un endroit unique où le premier tour est
traité correctement, et l'impossibilité de se tromper de sens de comparaison dans l'une des deux copies. Puis
il concède le cas contraire : *ce ne serait pas un progrès si le palmarès n'était utilisé qu'une seule fois —
une abstraction employée une fois coûte sa lecture et ne rembourse rien.* La règle des trois usages est citée,
et l'exception justifiée : ici le second suffisait parce que les deux usages diffèrent par le sens de
comparaison, c'est-à-dire par l'endroit exact où l'on se trompe.

**Deux palmarès du même type sur des types sans rapport** — `Palmares<Bilan>` pour la meilleure allure (plus
petit score), `Palmares<String>` pour le parcours le plus couru (plus grand score) — c'est ce qui justifie le
générique plutôt que de l'illustrer. Une classe générique employée sur un seul type n'aurait rien démontré.

**Le piège du 20.3 est un objet créé et non déposé.** Récupérer le bilan d'un coureur peut rendre une
référence vide au premier passage ; créer un objet local sans le déposer dans l'association le fait disparaître
au tour suivant, et *chaque coureur finirait avec une seule sortie à son actif — le programme afficherait des
chiffres plausibles et faux.* La checklist en fait son premier point.

**La borne, expliquée par ce qu'elle autorise et non par ce qu'elle interdit** (20.2) : `T extends Number` ne
sert pas d'abord à refuser les textes, mais à permettre d'appeler `doubleValue()` à l'intérieur de la classe.
*La généralité totale ne permet aucun calcul.* La question d fait constater ce que la borne n'accorde pas : le
signe `+` reste refusé, parce que les opérateurs arithmétiques ne s'appliquent qu'aux primitifs — la borne
garantit qu'on peut **obtenir** un nombre de chaque élément, pas que l'élément **est** un nombre.

**Une réflexion qui ne se contente pas de défendre le corrigé** (20.2) : la classe calcule tout en nombres à
virgule, et affiche donc « de 89,00 à 203,00 » pour des comptes de colonies qui sont des entiers. Le corrigé
admet la perte — précision suggérée qui n'existe pas, exactitude perdue sur les très grands entiers, ce qui
« poserait un vrai problème sur des montants en centimes » — et tranche sur l'affichage plutôt que sur les
calculs, au nom de la règle de la leçon 3 : *on arrondit pour montrer, jamais pour calculer.*

**Le cas de la série vide traité comme une décision, pas comme un détail** : rendre zéro pour une moyenne de
rien est « un mensonge poli », le rapport dit donc « aucune mesure » plutôt que d'afficher une ligne de zéros.
*La valeur de repli est là pour éviter le plantage, pas pour être montrée.*

**Trois fuites d'indice attrapées.** Aucune paraphrase.

**Vérifications.** `_verify_entrainement.js` : 72 leçons équipées, 216 exercices, vingt-cinq mini-séries, 60
corrigés Java compilés et exécutés — vert. Sommaire de `cours-java` : mention à « leçons 1 à 20 ».

**☐ Reste à faire.** `cours-java` leçons 21 à 31, puis csharp, php, c, cpp-bas, cpp-moderne, asm — soit
**465 exercices**.

---

## Entraînement du jour — cours-java, leçon 21 (3 exercices) + cache d'exécution du vérificateur

**Le vérificateur était devenu trop lent pour être lancé.** Avec 63 corrigés Java, chaque vérification
relançait 63 machines virtuelles : **46 secondes** dans l'environnement de rédaction, davantage sur une machine
à deux cœurs. À 93 corrigés Java, puis avec le C et le C++, on allait vers plusieurs minutes — et un outil
qu'on n'a pas envie de lancer est un outil qui ne vérifie plus rien.

**La correction est un cache d'exécution, keyé sur ce qui peut changer le résultat.** Pour chaque corrigé, on
retient une empreinte SHA-256 de `[langage, version exacte de l'outil, solution, tests, entrée standard]`. Si
cette empreinte a déjà été validée, le corrigé n'est pas rejoué. Résultat mesuré : **46 s → 0,8 s** sur un
dépôt inchangé, et **1,9 s** quand un seul corrigé a bougé.

**Trois précautions, parce qu'un cache mal fait produit un vert mensonger.**

1. **La version de l'outil entre dans la clé.** Une mise à jour du JDK ou de Python fait tout rejouer, au lieu
   de laisser croire qu'on a vérifié sur la version actuelle.
2. **Seuls les corrigés sans échec entrent au cache.** Un corrigé fautif est rejoué tant qu'il n'est pas
   corrigé — jamais déclaré « déjà vu ».
3. **Le cache vit dans le dossier temporaire du système, jamais dans le dépôt.** Un fichier d'état commité par
   mégarde serait exactement l'artefact que ce projet s'interdit. Le prix est qu'il repart froid après un
   redémarrage : tout est rejoué, ce qui est le **sens sûr** de l'erreur.

Le rapport distingue désormais ce qui a été exécuté de ce qui a été sauté : « 0 solution(s) exécutées, 63
inchangée(s) depuis une vérification réussie ». *Un vert obtenu par cache ne doit pas se lire comme un vert
obtenu par exécution.*

**Vérifié par un test négatif, pas seulement par un test vert :** un test volontairement faussé dans la leçon
21 a bien été rejoué (1 exécuté, 62 sautés) et l'erreur attrapée. Un cache qui ne détecte pas les
modifications serait pire que pas de cache.

**La vérification avance par paquets de six, en enregistrant après chacun.** Sur une machine lente, une
vérification interrompue garde ce qu'elle a validé et la relance reprend où elle en était. Le surcoût sur une
machine rapide est de l'ordre de la seconde.

**Une limite constatée et non masquée.** La machine de l'élève met plus de six secondes par corrigé Java (JDK
11 dans la VM, deux cœurs partagés) : je ne peux pas y faire tourner la vérification complète depuis cette
session, chaque commande y étant plafonnée à 45 secondes. La vérification de ce lot a donc tourné dans
l'environnement de rédaction (JDK 21) sur **61 leçons et 183 exercices** — l'intégralité de `cours-java` et de
`cours-python`, et `cours-algorithmes` à partir du jour 8. Les cinq autres scripts de CI ont tourné sur la
machine. La première vérification complète côté élève prendra une minute ou deux ; les suivantes seront
instantanées.

**La leçon 21 elle-même** ouvre la mini-série « La médiathèque » (21→24) et fait tenir tout l'enseignement sur
une idée : *ce qui varie n'est pas le traitement mais le critère.*

- **21.1 — la cordonnerie** justifie l'interface fonctionnelle par un tarif qui ne rentre pas dans le moule :
  deux tarifs proportionnels, un troisième forfaitaire puis dégressif. Une méthode de devis qui aurait reçu un
  prix unitaire aurait couvert deux cas sur trois. Les quatre comptages se font avec deux critères seulement,
  composés — et « ni l'un ni l'autre » est la négation de « l'un ou l'autre », pas autre chose.
- **21.2 — la station d'épuration** interdit d'écrire trois critères de seuil et impose de les *fabriquer* :
  une transformation qui prend un seuil et rend un critère. La réflexion porte sur la capture — le seuil est
  **emporté**, pas consulté, et c'est pourquoi Java interdit qu'une variable capturée change : *si l'original
  pouvait changer après la capture, le programme se comporterait d'une façon impossible à déduire de sa
  lecture.*
- **21.3 — La médiathèque 1/4** cache un piège dans le critère « format court » : la durée d'un livre vaut
  zéro, et zéro est bien inférieur à soixante. Sans précaution, les deux livres apparaissent parmi les formats
  courts — *un résultat parfaitement plausible pour qui ne connaît pas le fonds.* La réflexion va plus loin
  que le correctif : le zéro joue deux rôles, valeur et marqueur d'absence, et la convention n'est écrite
  nulle part dans le type. Les deux vraies réponses sont annoncées — un type qui sait représenter l'absence
  (leçon 23), ou des supports distingués par leur type (leçon 24).

**Deux fuites d'indice attrapées.**

**Vérifications.** `_verify_entrainement.js` : vert, 63 corrigés Java et 48 corrigés Python couverts (voir la
limite ci-dessus). `_coherence`, `_check_qcm`, `_verify_placement`, `_verify_mermaid`, `_verify_vocab` sur la
machine : verts. Sommaire de `cours-java` : mention à « leçons 1 à 21 ».

---

## cours-java — leçon 22 : l'API Stream (lot du 6 août 2026)

**Contenu ajouté.** 3 exercices, 15 indices, 3 corrigés exécutés et certifiés.

- **22.1 « Les origines du torréfacteur »** (niveau 1, domaine *torréfaction*) — filtrage, transformation, comptage, somme entière, moyenne calculée à la main, `anyMatch` / `allMatch`. Le total des sacs est calculé **deux fois**, par une boucle et par une chaîne, et les deux résultats sont affichés côte à côte : c'est la manière la moins coûteuse d'apprendre à faire confiance à un outil neuf. Valeurs certifiées par exécution : 625 kg au total, 104,2 kg de lot moyen, 3 noms courts, `[Guatemala, Éthiopie]` pour les noms longs.
- **22.2 « L'atelier de reliure »** (niveau 2, domaine *atelier de reliure*, sous-questions a/b/c/d) — combine les objets (leçon 12), les collections (leçon 20) et les lambdas (leçon 21). Piège pédagogique central : un flux est **consommé** par son opération terminale ; compter puis additionner exige **deux chaînes distinctes**, chacune repartant de la source. Second piège certifié : `mapToInt` au lieu de `mapToDouble` tronque silencieusement tous les centimes. Valeurs certifiées : boucle et flux donnent l'un comme l'autre `3 pour 1170.0 €`, devis cumulé 1425,0, 2106 pages, 2 ouvrages en toile.
- **22.3 « La médiathèque — 2/4 »** (niveau 3, application filée) — repart de la solution de la leçon 21 et **réutilise mot pour mot les quatre critères nommés** qui y avaient été construits, ce qui rend tangible l'intérêt d'avoir donné un nom à un comportement la veille. Valeurs certifiées : 5 disponibles, films disponibles `[Le Guépard, La Jetée]`, sortis `[Les Misérables]`, 3 formats courts, 3 supports distincts, 311 minutes en rayon.

**Constructions volontairement évitées** (non enseignées à ce stade du cours, vérifié par relecture du HTML de chaque leçon avant écriture) : `Optional` et `.average().orElse(...)` — la moyenne est donc obtenue par division manuelle, avec un renvoi explicite à la leçon 23 ; `.distinct()` sur un flux d'objets là où `new HashSet<>(...)` suffit et reste dans le vocabulaire de la leçon 20.

**Anti-fuite.** 8 violations détectées par `_verify_entrainement.js` dans l'indice ⑤ des exercices 22.1 et 22.2, toutes corrigées par masquage des identifiants et des appels (`int … = lots.stream().mapToInt(kg -> …).sum();`, `long compteFlux = ….stream()`, `.collect(Collectors.…);`, …). L'indice ⑤ reste un squelette qui oriente ; il ne rend plus aucune ligne de solution recopiable.

**Vérification.** `node _verify_entrainement.js` : ✅ 62 leçons équipées, 186 exercices, 0 problème. 66 corrigés Java et 48 corrigés Python couverts par 579 tests, tous rejoués ou servis par le cache d'exécution (empreinte SHA-256 sur `[langage, version de l'outil, corrigé, tests, stdin]`).

**État du cours.** cours-java : 22 leçons sur 31 équipées, 66 exercices. Mini-série « La médiathèque » : 2/4 jours écrits.

**Reste à faire.** Leçons 23 à 31 : `Optional` (23), records / enums / filtrage par motif (24), `Comparator` et tri (25), expressions régulières (26), immuabilité et `StringBuilder` (27), tests unitaires (28), fils d'exécution (29), projet guidé (30), examen (31). La leçon 28 demandera un harnais de test écrit à la main en Java pur : JUnit n'est pas installé dans l'environnement de vérification, et publier des corrigés dont les tests ne tournent jamais violerait le contrôle n° 6 (« un test qui ne tourne jamais est un mensonge affiché »).

---

## cours-java — leçon 23 : Optional et la sécurité anti-null (lot du 6 août 2026)

**Contenu ajouté.** 3 exercices, 15 indices, 3 corrigés exécutés et certifiés.

- **23.1 « Le bureau des objets trouvés »** (niveau 1, domaine *bureau des objets trouvés*) — une recherche qui rend `Optional<String>`, puis **les mêmes traitements appliqués côte à côte** à la boîte pleine et à la boîte vide : `orElse`, `map`, `ifPresent`, `isPresent`/`get`, `ofNullable` sur une valeur légitimement absente, et `orElseThrow` sous filet `try`/`catch`. Le fait marquant, énoncé tel quel à l'élève : le code qui exploite le résultat ne contient **aucun test d'existence** et se comporte pourtant correctement dans les deux cas. Message certifié par exécution : `No value present` (message de la bibliothèque standard, en anglais — noté explicitement dans la remarque de fin).
- **23.2 « L'auberge de jeunesse »** (niveau 2, domaine *auberge de jeunesse*, sous-questions a/b/c/d) — objets (leçon 12), collections (20), lambdas (21), flux (22) et boîtes (23) dans un seul programme. Point de doctrine : le champ `hote` reste un `String` pouvant valoir `null` **à l'intérieur** de la classe, mais la frontière publique n'expose qu'`Optional`. Deux pièges certifiés par exécution : (1) `orElse(repli())` **fabrique le repli même quand la boîte est pleine** — la méthode de repli s'annonce à l'écran, l'annonce apparaît une fois avec `orElse` et zéro fois avec `orElseGet` ; (2) `Optional.of(null)` lève une `NullPointerException` **dont le message vaut `null`**, ce qui devient un enseignement en soi (une exception peut n'avoir aucun message). Valeurs certifiées : 3 chambres libres, chambre 13 pour quatre personnes, rien pour dix, `get()` sur boîte vide → `No value present`, programme survivant.
- **23.3 « La médiathèque — 3/4 »** (niveau 3, application filée) — repart du jour 2 et **réutilise pour la troisième fois les quatre critères nommés**, mot pour mot. Nouveauté du jour : la borne de consultation, deux recherches rendant chacune une boîte, dont une **paramétrée par un `Predicate`** qui sert à elle seule les quatre suggestions — y compris celle qui ne trouvera jamais rien (aucune bande dessinée au fonds), et qui n'a demandé aucun code particulier. Valeurs certifiées : 5 disponibles, `Dune → titre absent du fonds`, un seul ticket de réservation (Blade Runner, sorti), suggestions `Le Guépard` / `Kind of Blue (disque, 1959, 45 min)` / `support non représenté`, 311 minutes en rayon.

**Constructions volontairement évitées** (non enseignées, vérifié par relecture du HTML de la leçon avant écriture) : `Optional.filter` — absent de la théorie de la leçon 23. Le ticket de réservation, qui portait deux conditions (le média existe **et** il est sorti), a donc été réécrit en plaçant les deux conditions dans le `Predicate` passé à la recherche (`bladeRunner.and(disponible.negate())`), ce qui s'est révélé meilleur pédagogiquement : c'est devenu le point dur de l'indice ④.

**Anti-fuite.** 1 violation détectée dans l'indice ⑤ de 23.3 (`orElse("titre absent du fonds");`), corrigée par masquage.

**Vérification.** `node _verify_entrainement.js` : ✅ 63 leçons équipées, 189 exercices, 0 problème. `node _verify.js cours-java/lecon23.html` : `java-optional END_VERIFY pass:1/1`.

**État du cours.** cours-java : 23 leçons sur 31 équipées, 69 exercices. Mini-série « La médiathèque » : 3/4 jours écrits — le jour 4 tombera sur la leçon 24 (records et enums), qui allégera la classe `Media`.

**Note d'exploitation.** `_coherence.js` dépasse le plafond de 45 s imposé aux commandes lancées sur la machine depuis cette session : il n'a donc **pas** été rejoué pour ces deux lots. Ses quatre contrôles (liens internes, compteurs, structure des cours, orphelins) ne peuvent pas être affectés par ces leçons — aucun fichier ni lien de navigation n'a été ajouté, et la seule modification d'`index.html` est le texte de la mention « leçons 1 à N ». Vérifié à la main sur le diff : aucun `href="....html"` ajouté en markup. À rejouer localement pour être complet.

---

## cours-java — leçon 24 : records, enums et filtrage par motif (lot du 6 août 2026)

**Contenu ajouté.** 3 exercices, 15 indices, 3 corrigés exécutés et certifiés. Aucune violation anti-fuite : première leçon verte du premier coup, le masquage préventif de l'indice ⑤ étant devenu un réflexe d'écriture.

- **24.1 « L'étal de la fromagerie »** (niveau 1, domaine *fromagerie*) — `record` à quatre champs, `enum Lait` à trois constantes, `switch` à flèches **sans cas par défaut** (choix expliqué : c'est le cas par défaut qui désactiverait la vérification d'exhaustivité). Le cœur de l'exercice est la séparation de deux questions que le langage écrit presque pareil : `equals` (même contenu → `true`) et `==` (même objet → `false`), avec la conséquence immédiate — le `HashSet` reconnaît le doublon, `Fiches : 5, distinctes : 4`. Valeurs certifiées : `Fromage[nom=Comté, lait=VACHE, affinageJours=240, prixKg=28.5]`, promotion 28.5 → 24.9 sans que l'original bouge, `BREBIS` en position 2, 3 laits à l'étal.
- **24.2 « Le centre de tri postal »** (niveau 2, domaine *centre de tri postal*, sous-questions a/b/c/d) — trois `record` sans ancêtre commun (`Lettre`, `Colis`, `Palette`) dans une même `ArrayList<Object>`, et un `switch` à motifs qui décide **selon la forme** de l'objet. Le contraste pédagogique central est explicite : l'aiguillage sur l'`enum` n'a pas de cas par défaut, celui sur `Object` en a un obligatoirement — et l'élève doit savoir dire pourquoi. La question de réflexion pointe vers l'héritage (leçons 14–15) comme alternative, et demande pourquoi il n'a pas été retenu ici. Valeurs certifiées : 1.4 / 11.25 / 50.5 / 9.7 / 18.8 €, total 91.65 € ; `Envois : 7, distincts : 5` ; l'intrus → `envoi non reconnu → 0.0 €` ; réétiquetage 11.25 → 15.75 € sans toucher à l'original. La remarque de fin juge ce `default -> 0.00` au lieu de le taire : un envoi non reconnu qui ne coûte rien passe inaperçu dans le total, et c'est un choix, pas une propriété du langage.
- **24.3 « La médiathèque — 4/4 »** (niveau 3, application filée, **fin de série**) — la classe `Media` de soixante lignes du jour 1 devient un `record` d'une ligne, le support passe du texte libre à un `enum`, et le picto du catalogue sort d'un `switch` à flèches. Le retour de prêt de « Blade Runner » reconstruit à deux niveaux (la fiche, puis le fonds) et laisse **les deux états coexister** : `Disponibles après retour : 6 (avant : 5)`. Les 311 minutes en rayon sont identiques aux jours 2 et 3 — c'est le contrôle de non-régression de la série entière.

**Honnêteté sur la série.** La remarque de 24.3 dit nettement ce que trois jours de démonstration auraient pu laisser croire à tort : les quatre critères nommés, réutilisés **mot pour mot** aux jours 2 et 3, ont dû être **retouchés** au jour 4 (les accesseurs perdent leur `get`, la comparaison de support passe du texte à la constante avec `==`). Ils restent reconnaissables ligne pour ligne, ils ne sont plus identiques. Prétendre le contraire aurait ruiné la seule chose que la série cherchait à établir.

**Constructions volontairement évitées** (vérifié par relecture du HTML de la leçon avant écriture) : `Lait.values()` — la théorie enseigne `name()` et `ordinal()`, pas `values()`. Le comptage des laits représentés passe donc par un flux et un `HashSet`, outils des leçons 18 et 22.

**Vérification.** `node _verify_entrainement.js` : ✅ 64 leçons équipées, 192 exercices, 0 problème. `node _verify.js cours-java/lecon24.html` : `java-records END_VERIFY no-tests` — le `no-tests` vient de la leçon d'origine, qui ne contient aucun bloc de code exécutable ; la leçon 25, non touchée, rend le même verdict. Aucune régression.

**État du cours.** cours-java : 24 leçons sur 31 équipées, 72 exercices. La série « La médiathèque » est **terminée** (4/4) — quatre mécaniques successives (méthodes, flux, boîtes, fiches figées) pour le même résultat numérique.

**Reste à faire.** Leçons 25 à 31 : `Comparator` et tri (25), expressions régulières (26), immuabilité et `StringBuilder` (27), tests unitaires (28), fils d'exécution (29), projet guidé (30), examen (31). Une nouvelle mini-série démarrera à la leçon 25.
