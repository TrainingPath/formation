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
