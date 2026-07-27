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

### ⚠️ Réserve honnête — réécriture des distracteurs (Phase 2.2) incomplète sur ce lot
Les agents chargés du Lot 2 ont été **interrompus par une limite de session pendant la Tâche B**
(réécriture des distracteurs). Les Tâches A (exécution + tests) et C (balanceOpts) sont terminées et
vérifiées ; la réécriture des distracteurs est **partielle** sur ces 4 cours. Les QCM restent néanmoins
**imprévisibles** (le mélange déterministe de la Prep-B s'applique à tout le site), mais un **audit ciblé
des distracteurs de ces 4 cours reste à faire** avant de considérer leur Phase 2.2 comme close. Cette
réserve est signalée plutôt que masquée.
