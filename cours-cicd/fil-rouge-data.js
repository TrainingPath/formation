/* ===== Fil rouge « La livraison automatisée » — cours CI/CD & Git avancé (21 étapes) =====
   On part du dépôt Git du capstone (avec son Dockerfile et son compose)
   et on automatise sa livraison : branches et pull requests, puis un
   pipeline GitHub Actions qui teste, construit, publie et déploie.
   Les exemples utilisent la pile Python · Django · MySQL ; tout s'adapte. */
var FIL = {
  prefix: "cicd21",
  app: "La Ludothèque",
  placeholder: "Écris tes commandes Git / ton YAML de pipeline ici…",
  etapes: {
    1: {
      titre: "l'hygiène du dépôt",
      etat: "Le dépôt du capstone existe, mais avant d'automatiser quoi que ce soit, on vérifie ses fondations : ce qui est suivi, ce qui ne l'est pas, comment on écrit l'histoire.",
      objectif: "Audite le dépôt de la Ludothèque : un .gitignore complet (.env, .venv, __pycache__), des commits atomiques aux messages normés (type: résumé), et les tags de version existants. Corrige ce qui manque.",
      hints: [
        "git status doit être PROPRE : rien d'inattendu ni de secret suivi.",
        "Convention de message : feat:, fix:, docs:, refactor:, test:, chore:.",
        "git log --oneline -10 et git tag pour l'état des lieux."
      ],
      solution: `# .gitignore (extrait vital)
.env
.env.*
.venv/
__pycache__/
*.pyc
sauvegarde-*.sql

$ git status                 # propre : rien de généré, rien de secret
$ git log --oneline -5
a1b2c3d feat: pagination du catalogue
e4f5a6b fix: double-rendu refusé (transaction)
...                          # un changement = un commit, message normé
$ git tag
v1.0.0                       # la version déployée au cours Docker`,
      note: "Un pipeline automatise ce qu'on lui donne : un dépôt sale produit des livraisons sales. Les messages normés (feat/fix/...) ne sont pas de la cosmétique — la leçon 15 en générera le changelog automatiquement. Tout ce cours repose sur cette fondation."
    },
    2: {
      titre: "la première branche",
      etat: "Tout le monde committe sur main : deux développeurs, deux fonctionnalités, un chaos. On isole chaque chantier.",
      objectif: "Crée la branche feature/reservations, committe dessus (sans toucher main), navigue entre les deux branches et constate que les fichiers changent. Liste les branches et leur dernier commit.",
      hints: [
        "git switch -c feature/reservations (créer + basculer).",
        "git switch main : le fichier ajouté disparaît — chaque branche a son état.",
        "git branch -v montre branches et derniers commits."
      ],
      solution: `$ git switch -c feature/reservations
$ echo "..." > catalogue/reservations.py
$ git add . && git commit -m "feat: ébauche du service de réservation"

$ git switch main
$ ls catalogue/reservations.py       # n'existe pas ici : main est intact !

$ git switch feature/reservations    # le fichier revient
$ git branch -v
* feature/reservations  b2c3d4e feat: ébauche du service de réservation
  main                  a1b2c3d feat: pagination du catalogue`,
      note: "Une branche n'est qu'une étiquette mobile sur un commit — la créer est instantané et gratuit. main reste toujours livrable : le travail en cours vit ailleurs, et l'expérience ratée se jette d'un git branch -D sans laisser de trace."
    },
    3: {
      titre: "fusionner — et survivre au conflit",
      etat: "La fonctionnalité est prête sur sa branche. On la ramène dans main — et on apprend à gérer le cas où deux branches ont touché la même ligne.",
      objectif: "Fusionne feature/reservations dans main (merge). Puis provoque un conflit (deux branches modifient la même ligne de settings.py), résous-le à la main et termine la fusion.",
      hints: [
        "git switch main && git merge feature/reservations.",
        "Le conflit s'affiche entre <<<<<<< HEAD et >>>>>>> : choisir/combiner, puis git add.",
        "git merge --abort si on veut annuler et respirer."
      ],
      solution: `$ git switch main
$ git merge feature/reservations       # fusion simple (fast-forward ou merge)

# --- le conflit ---
$ git merge feature/tarifs
CONFLICT (content): Merge conflict in catalogue/services.py
$ cat catalogue/services.py
<<<<<<< HEAD
    return base + (nb_jours - 7) * Decimal("0.50")
=======
    return base + (nb_jours - 7) * Decimal("0.60")
>>>>>>> feature/tarifs

# On tranche (le nouveau tarif est le bon), on retire les marqueurs :
    return base + (nb_jours - 7) * Decimal("0.60")

$ git add catalogue/services.py
$ git commit                           # le commit de fusion conclut`,
      note: "Un conflit n'est pas une erreur : c'est Git qui refuse de choisir à ta place quand deux vérités se contredisent. La résolution est un acte ÉDITORIAL (quelle ligne est la bonne ?), pas technique. git merge --abort est toujours là — personne n'est jamais coincé."
    },
    4: {
      titre: "le dépôt distant",
      etat: "Le dépôt ne vit que sur ta machine. Pour collaborer (et pour la CI, bientôt), il lui faut un double en ligne.",
      objectif: "Crée le dépôt GitHub de la Ludothèque, relie-le (remote origin), pousse main et les tags, puis pousse la branche de fonctionnalité. Vérifie le cycle fetch/pull.",
      hints: [
        "git remote add origin git@github.com:toi/ludotheque.git",
        "git push -u origin main (le -u lie la branche locale à la distante).",
        "git push --tags ; git fetch vs git pull : regarder vs intégrer."
      ],
      solution: `$ git remote add origin git@github.com:toi/ludotheque.git
$ git push -u origin main            # -u : tracking, les prochains push sont nus
$ git push --tags                    # v1.0.0 rejoint le distant

$ git switch feature/reservations
$ git push -u origin feature/reservations

# Le cycle quotidien :
$ git fetch                          # RAMÈNE les nouveautés (sans toucher au code)
$ git log main..origin/main          # qu'ont fait les autres ?
$ git pull                           # fetch + merge : on intègre`,
      note: "fetch regarde, pull intègre : les séparer évite les surprises. Le dépôt GitHub n'est pas qu'une sauvegarde — c'est la scène où vivront les pull requests (leçon 6) et le moteur qui exécutera les pipelines (leçon 9). Tout le reste du cours se joue là."
    },
    5: {
      titre: "le workflow d'équipe",
      etat: "Branches, fusion, distant : les gestes existent. On les organise en règles d'équipe — qui branche quoi, quand, comment.",
      objectif: "Rédige le workflow de l'équipe Ludothèque (GitHub Flow) : main toujours déployable, une branche courte par changement (feature/, fix/), pull request obligatoire, suppression de la branche après merge. Applique-le sur un fix complet.",
      hints: [
        "Le cycle : switch -c fix/... → commits → push → PR → merge → branche supprimée.",
        "Branches COURTES (heures/jours, pas semaines) : moins de conflits.",
        "main n'est jamais committée en direct."
      ],
      solution: `WORKFLOW LUDOTHÈQUE (GitHub Flow)
1. main est TOUJOURS déployable — personne n'y committe en direct.
2. Tout changement part d'une branche courte et nommée :
   feature/reservations, fix/stock-negatif, chore/maj-django
3. Push tôt, PR tôt (même en brouillon) : le travail est visible.
4. Merge UNIQUEMENT via pull request (revue + CI verte, leçons 6 et 14).
5. La branche est supprimée après le merge.

# Le cycle complet sur un fix :
$ git switch main && git pull
$ git switch -c fix/message-stock
$ ... correction + test ...
$ git commit -m "fix: message d'erreur du stock épuisé"
$ git push -u origin fix/message-stock
# → PR, revue, merge sur GitHub → git switch main && git pull
$ git branch -d fix/message-stock`,
      note: "GitHub Flow tient en cinq règles parce que la simplicité se respecte mieux que la complexité : une seule branche éternelle (main), des branches jetables autour. Les leçons 6 et 14 durciront la règle 4 : revue humaine + pipeline vert, sinon pas de merge."
    },
    6: {
      titre: "la pull request",
      etat: "Le code part en revue avant de rejoindre main. La PR est le lieu où l'équipe lit, commente et valide.",
      objectif: "Ouvre une pull request complète pour fix/message-stock : titre normé, description (quoi/pourquoi/comment tester), et joue les deux rôles — relecteur qui demande un changement, auteur qui le pousse (la PR se met à jour seule).",
      hints: [
        "La description répond à trois questions : quoi ? pourquoi ? comment vérifier ?",
        "Un commentaire de revue porte sur le code, jamais sur la personne.",
        "Pousser un commit sur la branche met à jour la PR automatiquement."
      ],
      solution: `PULL REQUEST — fix: message d'erreur du stock épuisé

## Quoi
Le message affiché quand le stock de location est nul devient
« Plus de stock de location pour {titre} » (au lieu d'une erreur générique).

## Pourquoi
Ticket #42 : les clients croyaient à un bug alors que le jeu
était simplement épuisé.

## Comment tester
1. docker compose up -d ; jeu avec stock_location=0
2. cliquer « Louer » → le message précis s'affiche, stock inchangé.

--- Revue ---
Relecteur : « Le message est construit dans la vue — notre règle le met
côté service (exception). Peux-tu déplacer ? »
Auteur : commit "refactor: message porté par StockInsuffisant" → poussé,
la PR se met à jour, le relecteur approuve ✔ → merge, branche supprimée.`,
      note: "Une bonne PR se lit en cinq minutes : petite, décrite, testable. La revue a attrapé une entorse à l'architecture (règle métier dans la vue) AVANT qu'elle n'entre dans main — c'est exactement son travail : pas de la police, du prêt-à-porter à quatre yeux."
    },
    7: {
      titre: "l'historique propre",
      etat: "Dernier outil de la semaine Git : soigner l'histoire AVANT de la partager — et savoir mettre de côté sans committer.",
      objectif: "Sur une branche locale non poussée : corrige le dernier commit (amend), rejoue la branche sur main à jour (rebase), gère l'interruption avec stash. Énonce la règle d'or du rebase.",
      hints: [
        "git commit --amend : compléter/renommer le DERNIER commit.",
        "git rebase main : rejouer ses commits sur la pointe de main (historique linéaire).",
        "git stash / stash pop : le tiroir à travail en cours."
      ],
      solution: `# oublié un fichier dans le dernier commit ?
$ git add catalogue/tests.py
$ git commit --amend --no-edit        # le commit est COMPLÉTÉ, pas doublé

# main a avancé pendant qu'on travaillait :
$ git switch feature/reservations
$ git rebase main                     # nos commits rejoués sur main à jour
# (conflits éventuels : résoudre, git add, git rebase --continue)

# interruption urgente en plein chantier :
$ git stash                           # le travail part au tiroir, dépôt propre
$ git switch main && ... le fix urgent ...
$ git switch feature/reservations && git stash pop   # on reprend

RÈGLE D'OR : amend et rebase réécrivent l'histoire.
On ne réécrit JAMAIS des commits déjà poussés/partagés.`,
      note: "Le rebase produit un historique linéaire et lisible (« comme si on avait commencé aujourd'hui »), le merge préserve la chronologie vraie : deux philosophies, une règle commune — l'histoire PARTAGÉE est immuable, comme les migrations du capstone et les tags d'images du cours Docker. Fin de la semaine Git : l'équipe collabore proprement."
    },
    8: {
      titre: "pourquoi la CI",
      etat: "L'équipe collabore, mais rien ne VÉRIFIE automatiquement : un commit qui casse les tests peut entrer dans main sans que personne ne le voie.",
      objectif: "Écris le contrat de CI de la Ludothèque : la liste ordonnée des vérifications à exécuter À CHAQUE push/PR (tests, lint, build d'image), leur équivalent manuel actuel, et ce que « rouge » doit bloquer.",
      hints: [
        "Tout ce que tu fais à la main avant de dire « c'est bon » : c'est la liste.",
        "python manage.py test, un linter (ruff/flake8), docker build.",
        "Rouge = pas de merge (leçon 14), pas de livraison (semaine 3)."
      ],
      solution: `CONTRAT DE CI — Ludothèque
À chaque push et sur chaque pull request, la machine exécute :

1. TESTS      python manage.py test          (unitaires + intégration, l.17-18 capstone)
   → aujourd'hui : lancé à la main... quand on y pense
2. LINT       ruff check .                    (style et erreurs évidentes)
   → aujourd'hui : les goûts de chacun
3. BUILD      docker build -t ludotheque:ci . (l'image se construit-elle ?)
   → aujourd'hui : découvert au moment de livrer

Un échec (rouge) :
- bloque le merge de la PR (leçon 14)
- interdit toute livraison de ce commit (semaine 3)

Promesse : main est TOUJOURS verte — testée, lintée, constructible.`,
      note: "La CI n'invente rien : elle exécute, à chaque commit et sans fatigue, ce que tu faisais à la main « quand tu y pensais ». C'est le passage de la discipline personnelle à la garantie d'équipe — le pipeline des leçons suivantes implémente ce contrat, point par point."
    },
    9: {
      titre: "le premier workflow",
      etat: "Le contrat est écrit. On le confie à GitHub Actions : un fichier YAML dans le dépôt, exécuté à chaque push.",
      objectif: "Crée .github/workflows/ci.yml : déclencheurs push/pull_request sur main, un job sur ubuntu-latest qui checkout le code, installe Python 3.12, les dépendances, et lance un premier échantillon (manage.py check).",
      hints: [
        "on: { push: { branches: [main] }, pull_request: { branches: [main] } }",
        "steps : actions/checkout@v4, actions/setup-python@v5 (python-version: '3.12').",
        "pip install -r requirements.txt puis python manage.py check."
      ],
      solution: `# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  verifier:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4          # récupérer le code du commit

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Installer les dépendances
        run: pip install -r requirements.txt

      - name: Vérification de base
        run: python manage.py check
        env:
          DJANGO_SECRET_KEY: cle-de-ci`,
      note: "Le workflow vit DANS le dépôt (.github/workflows/) : versionné, revu en PR comme le reste — l'infrastructure d'automatisation suit les mêmes règles que le code. Chaque push déclenche désormais une machine fraîche (ubuntu-latest) qui rejoue ces étapes : le « ça marche chez moi » n'a plus voix au chapitre."
    },
    10: {
      titre: "les tests dans la CI",
      etat: "Le squelette tourne. On y branche la vraie batterie : les tests du capstone — qui exigent un MySQL.",
      objectif: "Ajoute au job un service MySQL 8.4 (avec healthcheck) et l'étape python manage.py test, configurée par variables d'environnement pour viser ce service. Les 50+ tests du capstone doivent passer.",
      hints: [
        "services: mysql: image: mysql:8.4, env MYSQL_*, options: --health-cmd=...",
        "Le service est joignable sur 127.0.0.1:3306 depuis les steps.",
        "env: DB_HOST: 127.0.0.1, DB_PASSWORD: ... au niveau de l'étape de test."
      ],
      solution: `jobs:
  tests:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.4
        env:
          MYSQL_ROOT_PASSWORD: ci-root
          MYSQL_DATABASE: ludotheque
          MYSQL_USER: ludo_app
          MYSQL_PASSWORD: ci-secret
        ports: ["3306:3306"]
        options: >-
          --health-cmd="mysqladmin ping -h localhost"
          --health-interval=5s --health-timeout=3s --health-retries=10

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -r requirements.txt
      - name: Tests
        run: python manage.py test
        env:
          DJANGO_SECRET_KEY: cle-de-ci
          DB_HOST: 127.0.0.1
          DB_PASSWORD: ci-secret`,
      note: "Le « service » de CI est un conteneur MySQL éphémère — exactement le cours Docker réutilisé : image épinglée, healthcheck, variables. Chaque exécution part d'une base neuve : les tests du capstone (refus de stock, prix figé, double-rendu) tournent désormais à chaque commit, sur une machine que personne n'a configurée à la main."
    },
    11: {
      titre: "lint, format, couverture",
      etat: "Les tests passent. On ajoute les vérifications de forme : style uniforme et mesure de ce que les tests couvrent.",
      objectif: "Ajoute un job qualite (parallèle aux tests) : ruff check (lint) et ruff format --check (format), puis la couverture (coverage run manage.py test + un seuil minimal de 80 %).",
      hints: [
        "Deux jobs sans needs: entre eux tournent EN PARALLÈLE.",
        "ruff format --check échoue si un fichier n'est pas formaté (sans le modifier).",
        "coverage report --fail-under=80 fait échouer sous le seuil."
      ],
      solution: `  qualite:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install ruff
      - name: Lint
        run: ruff check .
      - name: Format
        run: ruff format --check .

  couverture:
    runs-on: ubuntu-latest
    services:
      mysql: { ... comme le job tests ... }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -r requirements.txt coverage
      - name: Tests avec couverture
        run: |
          coverage run manage.py test
          coverage report --fail-under=80
        env: { DJANGO_SECRET_KEY: cle-de-ci, DB_HOST: 127.0.0.1, DB_PASSWORD: ci-secret }`,
      note: "Le lint attrape les erreurs évidentes (import inutile, variable morte), le format tue les débats de style (la machine tranche), la couverture mesure — sans garantir : 80 % couverts ne veut pas dire bien testés, mais 40 % veut dire des pans entiers sans filet. Les jobs parallèles gardent le pipeline rapide."
    },
    12: {
      titre: "l'image construite en CI",
      etat: "Le code est vérifié. Reste à prouver, à chaque commit, que l'ARTEFACT — l'image Docker — se construit.",
      objectif: "Ajoute le job image : après les tests (needs), construire l'image avec le Dockerfile multi-stage du cours Docker, puis un smoke test (lancer le conteneur et vérifier que manage.py check répond).",
      hints: [
        "needs: [tests, qualite] : l'image ne se construit que si le code est bon.",
        "docker build -t ludotheque:${{ github.sha }} .",
        "Smoke test : docker run --rm -e DJANGO_SECRET_KEY=x ludotheque:... python manage.py check"
      ],
      solution: `  image:
    runs-on: ubuntu-latest
    needs: [tests, qualite]            # inutile de construire du code cassé
    steps:
      - uses: actions/checkout@v4

      - name: Build de l'image
        run: docker build -t ludotheque:${'$'}{{ github.sha }} .

      - name: Smoke test
        run: |
          docker run --rm \\
            -e DJANGO_SECRET_KEY=smoke -e DB_HOST=absent \\
            ludotheque:${'$'}{{ github.sha }} \\
            python manage.py check
# le build échoue ? requirements cassé, .dockerignore troué, COPY manquant :
# on le sait AU COMMIT, pas au moment de livrer.`,
      note: "github.sha tague l'image avec le commit exact : la traçabilité commit ↔ image est native. needs: dessine le graphe du pipeline — tests et qualité en parallèle, l'image ensuite. Le smoke test ne teste pas le métier (déjà fait) : il prouve que l'image DÉMARRE — le bug d'emballage classique."
    },
    13: {
      titre: "les secrets de la CI",
      etat: "Bientôt le pipeline devra parler au registre et au serveur. Il lui faut des secrets — qui n'apparaîtront jamais dans le YAML.",
      objectif: "Configure les secrets GitHub (Settings → Secrets) : REGISTRY_TOKEN, SSH_PRIVATE_KEY, et montre leur usage dans un step (${{ secrets.X }}). Énonce les trois règles : jamais dans le YAML, jamais dans les logs, portée minimale.",
      hints: [
        "Un secret se lit ${{ secrets.NOM }} — GitHub le MASQUE dans les logs (***).",
        "Ne jamais faire echo ${{ secrets.X }} : le masquage a des limites (transformations).",
        "Un secret par usage, au périmètre le plus étroit (environnement, leçon 18)."
      ],
      solution: `# Settings → Secrets and variables → Actions :
#   REGISTRY_TOKEN   : jeton du registre d'images (écriture)
#   SSH_PRIVATE_KEY  : clé de déploiement du serveur (leçon 17)

# Usage dans un step :
      - name: Connexion au registre
        run: echo "${'$'}{{ secrets.REGISTRY_TOKEN }}" | \\
             docker login ghcr.io -u toi --password-stdin

# Les trois règles :
# 1. JAMAIS en clair dans le YAML (il est commité, donc public pour l'équipe)
# 2. JAMAIS affiché : GitHub masque (***) mais pas les transformations
#    (base64, découpage...) — on ne journalise pas un secret, point.
# 3. Portée minimale : un jeton qui ne peut QUE pousser des images,
#    une clé qui ne peut QUE déployer — pas les clés du royaume.`,
      note: "Même philosophie que les leçons 10 du cours Docker et 19 du capstone, appliquée au pipeline : le YAML est du code (public), les secrets sont de la configuration (protégée). --password-stdin évite le mot de passe dans la ligne de commande — l'historique du runner n'a rien à voir."
    },
    14: {
      titre: "le merge bloqué si rouge",
      etat: "Le pipeline vérifie tout — mais rien n'OBLIGE à l'écouter. On verrouille : pas de vert, pas de merge.",
      objectif: "Configure la protection de la branche main : statuts requis (tests, qualite, image), revue obligatoire (1 approbation), branche à jour avant merge, et interdiction du push direct — même pour les admins.",
      hints: [
        "Settings → Branches → Branch protection rules → main.",
        "Require status checks : cocher les jobs du pipeline.",
        "Require pull request + 1 approval ; include administrators."
      ],
      solution: `PROTECTION DE main (Settings → Branches) :
✔ Require a pull request before merging
    ✔ Require approvals : 1
✔ Require status checks to pass before merging
    ✔ tests   ✔ qualite   ✔ image
    ✔ Require branches to be up to date before merging
✔ Do not allow bypassing the above settings (admins compris)
✘ Push direct sur main : impossible pour tout le monde

# Résultat concret sur une PR :
#   CI rouge   → bouton merge GRIS, avec la raison
#   pas de revue → merge bloqué
#   tout vert + approuvé → merge en un clic`,
      note: "C'est la rencontre des deux semaines : le workflow humain (PR + revue, leçon 6) et le contrat machine (CI, leçon 8) deviennent une règle que PERSONNE ne contourne — pas même les admins, pas même un vendredi soir. La promesse « main toujours verte » n'est plus une intention : c'est une propriété du système."
    },
    15: {
      titre: "versions et changelog",
      etat: "main est toujours verte. On peut donc VERSIONNER : marquer les commits livrables et raconter ce qui change.",
      objectif: "Prépare la release v1.1.0 : choisis le numéro selon semver (les réservations = mineure), génère le changelog depuis les messages normés (git log v1.0.0..HEAD), pose le tag annoté et pousse-le.",
      hints: [
        "git log v1.0.0..HEAD --oneline | grep -E '^\\w+ (feat|fix)' pour trier.",
        "git tag -a v1.1.0 -m \"Réservations + corrections\" (tag ANNOTÉ).",
        "git push origin v1.1.0 — le push du tag déclenchera le CD (leçon 16)."
      ],
      solution: `# Que s'est-il passé depuis la 1.0.0 ?
$ git log v1.0.0..HEAD --oneline
f7a8b9c feat: réservation d'un jeu indisponible
c3d4e5f feat: notification de disponibilité
a9b8c7d fix: message du stock épuisé
...

# CHANGELOG.md — v1.1.0
## Nouveautés
- Réservation d'un jeu indisponible
- Notification quand le jeu redevient disponible
## Corrections
- Message clair quand le stock de location est épuisé

# semver : fonctionnalités compatibles → MINEURE : 1.0.0 → 1.1.0
$ git tag -a v1.1.0 -m "Réservations + corrections"
$ git push origin v1.1.0        # ← ce push déclenchera la livraison`,
      note: "Les messages normés de la leçon 1 paient ici : le changelog s'écrit tout seul en triant feat/fix. Le tag annoté est un objet complet (auteur, date, message) — c'est LUI, poussé vers GitHub, qui déclenchera le pipeline de livraison de la leçon suivante. La version du code et celle de l'image (cours Docker) racontent la même histoire."
    },
    16: {
      titre: "l'image publiée par la CI",
      etat: "Jusqu'ici, docker push partait de ta machine. Désormais, c'est le tag Git qui déclenche build + push — plus aucune main humaine.",
      objectif: "Crée .github/workflows/release.yml : déclenché par les tags v* (on: push: tags), il construit l'image, la tague MAJEURE.MINEURE.PATCH depuis le tag Git, se connecte au registre (secret) et pousse.",
      hints: [
        "on: push: tags: ['v*'] — seul un tag de version déclenche.",
        "VERSION=${GITHUB_REF_NAME#v} retire le v (v1.1.0 → 1.1.0).",
        "docker login avec ${{ secrets.REGISTRY_TOKEN }} puis push des deux tags (version + latest)."
      ],
      solution: `# .github/workflows/release.yml
name: Release

on:
  push:
    tags: ["v*"]

jobs:
  publier:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Version depuis le tag Git
        run: echo "VERSION=${'$'}{GITHUB_REF_NAME#v}" >> "${'$'}GITHUB_ENV"
        # v1.1.0 → 1.1.0 : tag Git et tag d'image alignés

      - name: Connexion au registre
        run: echo "${'$'}{{ secrets.REGISTRY_TOKEN }}" | \\
             docker login ghcr.io -u toi --password-stdin

      - name: Build et push
        run: |
          docker build -t ghcr.io/toi/ludotheque:${'$'}VERSION .
          docker push ghcr.io/toi/ludotheque:${'$'}VERSION`,
      note: "La politique de versions du cours Docker (leçon 17) est désormais APPLIQUÉE par une machine : impossible d'oublier le tag, de pousser une image non testée (la CI a déjà validé le commit) ou de désaligner code et image. Un git push origin v1.1.0, et le registre reçoit ghcr.io/toi/ludotheque:1.1.0."
    },
    17: {
      titre: "le déploiement automatisé",
      etat: "L'image attend au registre. Dernier maillon : le pipeline se connecte au serveur et déclenche la mise à jour.",
      objectif: "Ajoute au workflow de release le job deployer (needs: publier) : connexion SSH au serveur (clé en secret), mise à jour du tag dans le compose (ou .env), docker compose pull + up -d, puis migrate et vérification de santé.",
      hints: [
        "ssh -i (clé du secret) deploy@serveur '... les commandes du cours Docker ...'",
        "Le serveur fait exactement la leçon 20 du cours Docker : pull, up -d, migrate.",
        "Termine par un curl -f sur /sante/ : le déploiement se VÉRIFIE."
      ],
      solution: `  deployer:
    runs-on: ubuntu-latest
    needs: publier                       # jamais avant le push de l'image
    steps:
      - name: Préparer la clé SSH
        run: |
          echo "${'$'}{{ secrets.SSH_PRIVATE_KEY }}" > cle && chmod 600 cle

      - name: Déployer sur le serveur
        run: |
          ssh -i cle -o StrictHostKeyChecking=accept-new deploy@ludotheque.example.com '
            cd /srv/ludotheque &&
            echo "VERSION=${'$'}{GITHUB_REF_NAME#v}" > .env.version &&
            docker compose pull &&
            docker compose up -d &&
            docker compose exec -T app python manage.py migrate
          '

      - name: Vérifier la santé
        run: sleep 10 && curl -fs https://ludotheque.example.com/sante/
# compose.yaml serveur : image: ghcr.io/toi/ludotheque:${'$'}{VERSION}`,
      note: "Le job rejoue EXACTEMENT la leçon 20 du cours Docker — pull, up -d, migrate — mais c'est un robot qui tape, avec une clé qui ne sait QUE déployer. La vérification finale (curl /sante/, la vue de la leçon 13 Docker) transforme « c'est parti » en « c'est en ligne et ça répond »."
    },
    18: {
      titre: "staging avant production",
      etat: "Déployer main directement en production est brutal. On intercale une scène de répétition : staging.",
      objectif: "Organise deux environnements GitHub (staging, production) : le merge sur main déploie automatiquement en staging ; le tag v* déploie en production APRÈS approbation manuelle (required reviewers). Chaque environnement a ses secrets.",
      hints: [
        "environment: staging / environment: production dans les jobs.",
        "Production : Settings → Environments → required reviewers (approbation humaine).",
        "Secrets par environnement : SSH_PRIVATE_KEY de staging ≠ production."
      ],
      solution: `# ci.yml — le merge sur main déploie la préproduction
  deployer-staging:
    if: github.ref == 'refs/heads/main'
    environment: staging               # secrets et URL de staging
    needs: [tests, qualite, image]
    steps: [ ... ssh staging.ludotheque... pull/up/migrate ... ]

# release.yml — le tag déploie la production, après accord humain
  deployer-production:
    environment: production            # required reviewers : 1 approbation
    needs: publier
    steps: [ ... ssh ludotheque.example.com ... ]

# Le flux complet :
# PR verte → merge → STAGING se met à jour tout seul → on recette
# → git tag v1.1.0 → push → build+push image → ⏸ approbation → PRODUCTION`,
      note: "Staging reçoit tout, tout de suite : les surprises s'y produisent AVANT les clients. La production exige un tag ET un clic d'approbation — l'automatisation exécute, l'humain décide du moment. Les secrets par environnement cloisonnent : compromettre staging ne donne pas la production."
    },
    19: {
      titre: "rollback et migrations",
      etat: "Tout est automatisé — y compris, potentiellement, la propagation d'une erreur. On prépare les procédures de retour.",
      objectif: "Rédige le plan de retour arrière : rollback applicatif (redéployer le tag précédent), le cas épineux des migrations (compatibilité N-1 : déployer des migrations rétrocompatibles), et la règle de la fenêtre de déploiement.",
      hints: [
        "Rollback app = re-déclencher le déploiement du tag précédent (l'image existe toujours).",
        "Migration rétrocompatible : ajouter une colonne nullable OK ; la renommer en deux temps.",
        "On ne déploie pas à 18 h 55 : quelqu'un doit pouvoir regarder."
      ],
      solution: `PLAN DE RETOUR ARRIÈRE — Ludothèque

1. Rollback applicatif (< 5 min)
   Re-déployer le tag précédent : relancer le job de déploiement sur v1.0.0
   (ou sur le serveur : VERSION=1.0.0, compose pull, up -d).
   L'image 1.0.0 existe toujours au registre — immuabilité (Docker l.17).

2. Les migrations : la règle N-1
   Le schéma déployé par la version N doit rester compatible avec le code N-1 :
   ✔ ajouter une colonne NULLABLE, une table, un index
   ✘ renommer/supprimer une colonne utilisée par N-1
   → les ruptures se font en DEUX versions :
     v1.1 : nouvelle colonne + le code écrit dans les deux
     v1.2 : bascule complète + suppression de l'ancienne
   Ainsi le rollback du code n'exige jamais de rollback du schéma.

3. Fenêtre de déploiement
   On livre quand quelqu'un peut surveiller (matin/début d'après-midi),
   jamais vendredi 18 h. Le déploiement est suivi 30 min : /sante/,
   logs, taux d'erreurs.`,
      note: "Le rollback applicatif est trivial grâce à l'immuabilité des images ; le VRAI sujet est le schéma — d'où la règle N-1 qui découple code et base. C'est la version industrielle d'une leçon du capstone : les migrations sont des engagements, on les conçoit pour pouvoir reculer."
    },
    20: {
      titre: "le pipeline complet",
      etat: "Toutes les pièces existent. On assemble le pipeline de bout en bout et on le documente pour l'équipe.",
      objectif: "Dessine (en ASCII) le pipeline complet de la Ludothèque, du push à la production : les deux workflows, leurs jobs, les déclencheurs, les barrières (protection, approbation) — et la durée cible de chaque phase.",
      hints: [
        "ci.yml : push/PR → tests + qualite (parallèles) → image → staging (si main).",
        "release.yml : tag v* → publier → ⏸ approbation → production.",
        "Marque les barrières : merge bloqué, reviewers requis."
      ],
      solution: `LE PIPELINE DE LA LUDOTHÈQUE

── ci.yml ──────────────────────────────── (~5-8 min)
push / PR
   ├─→ tests      (MySQL service, 50+ tests)   ┐ parallèles
   └─→ qualite    (ruff check + format + cov)  ┘
              └─→ image (build + smoke test)   needs: les deux
                     └─→ [si main] deployer-staging → recette

   BARRIÈRE (l.14) : PR mergeable SEULEMENT si tests+qualite+image verts
                     + 1 revue humaine

── release.yml ─────────────────────────── (~4-6 min + approbation)
git push origin v1.1.0
   └─→ publier   (build, tag 1.1.0, push registre)
          └─→ ⏸ APPROBATION (environnement production)
                 └─→ deployer-production (ssh, pull, up -d, migrate)
                        └─→ curl /sante/ ✔

Rollback : rejouer le déploiement du tag précédent (< 5 min, l.19)`,
      note: "Deux fichiers YAML, deux responsabilités : ci.yml protège main (à chaque commit), release.yml livre (à chaque tag). Chaque flèche de ce schéma correspond à une leçon du cours — et chaque étape automatise un geste appris à la main au cours Docker. Le schéma EST la documentation d'onboarding de l'équipe."
    },
    21: {
      titre: "🎓 la livraison automatisée",
      etat: "Un commit tagué se déploie seul : testé, construit, publié, livré, vérifié. La formation entière converge ici.",
      objectif: "Exercice de synthèse : raconte le trajet complet d'une fonctionnalité, de git switch -c au /sante/ vert en production, en citant chaque leçon traversée (Git, PR, CI, protection, tag, registre, staging, approbation, déploiement).",
      hints: [
        "Pars de feature/notification → PR → CI verte → revue → merge → staging.",
        "Puis tag v1.2.0 → publier → approbation → production → vérification.",
        "Termine par : que reste-t-il de manuel ? (le code, la revue, l'approbation — les décisions.)"
      ],
      solution: `LE TRAJET D'UNE FONCTIONNALITÉ

git switch -c feature/notification        (l.2)
  commits normés, rebase sur main à jour  (l.1, l.7)
  push → pull request décrite             (l.4, l.6)
     ├─ CI : tests+MySQL, lint, image     (l.9-12) → tout vert
     ├─ revue humaine : 1 approbation     (l.6)
     └─ protection : merge possible       (l.14)
  merge → main → STAGING auto             (l.18) → recette OK

git tag -a v1.2.0 + changelog             (l.15)
git push origin v1.2.0
  → build + push ghcr.io/...:1.2.0        (l.16, secrets l.13)
  → ⏸ approbation production             (l.18)
  → ssh : pull, up -d, migrate            (l.17 — la leçon 20 de Docker, robotisée)
  → curl /sante/ → 200 ✔

Resté manuel — et c'est voulu :
  écrire le code et les tests, relire la PR, décider du tag,
  approuver la production. Les DÉCISIONS. Tout le reste : la machine.`,
      note: "Regarde le chemin depuis le premier cours : l'algorithme, le langage, le framework, la base conçue en Merise, l'application assemblée, conteneurisée, et maintenant livrée par un pipeline. La Ludothèque a servi de fil rouge à TOUTE la formation — et ce dernier trajet la traverse de bout en bout. Félicitations : c'est exactement le quotidien d'une équipe professionnelle."
    }
  }
};
