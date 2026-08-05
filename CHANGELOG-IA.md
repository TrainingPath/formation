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
