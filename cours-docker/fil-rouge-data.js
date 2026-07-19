/* ===== Fil rouge « La Ludothèque en conteneurs » — cours Docker (21 étapes) =====
   On reprend l'application complète du Niveau 6 (app + MySQL) et on la
   conteneurise morceau par morceau : image, volumes, réseau, Compose,
   multi-stage, sécurité, registre, production.
   Les exemples utilisent la pile Python · Django · MySQL ; chaque étape
   s'adapte aux autres piles du Niveau 6. */
var FIL = {
  prefix: "docker21",
  app: "La Ludothèque",
  placeholder: "Écris tes commandes Docker / ton Dockerfile ici…",
  etapes: {
    1: {
      titre: "l'état des lieux",
      etat: "La Ludothèque du Niveau 6 tourne… sur TA machine, avec TA version de Python et TON MySQL. Sur une autre machine : rien ne marche.",
      objectif: "Liste tout ce dont la Ludothèque a besoin pour tourner (langage, dépendances, base, configuration, fichiers statiques) et explique en une phrase par élément pourquoi « ça marche chez moi » casse sur une autre machine.",
      hints: [
        "Pense versions : Python 3.12 ici, 3.8 là-bas ; mysqlclient compilé contre quelle lib ?",
        "La config : DB_PASSWORD, SECRET_KEY, DEBUG — posés où ?",
        "Un conteneur emballera exactement tout ça, versions comprises."
      ],
      solution: `Ce que la Ludothèque exige pour tourner :
- Python 3.12 exactement (3.8 -> syntaxe/refus de dépendances)
- les paquets de requirements.txt aux bonnes versions
- le connecteur mysqlclient (compilé, dépend des libs système !)
- un MySQL 8 joignable, avec la base ludotheque migrée
- les variables d'environnement (DB_PASSWORD, DJANGO_SECRET_KEY...)
- les fichiers statiques collectés

Pourquoi ça casse ailleurs : chaque élément dépend de la machine
(versions, libs système, services installés, variables posées).
Le conteneur fige TOUT ça dans une image : même environnement partout.`,
      note: "Cette liste est le cahier des charges du cours : chaque leçon en conteneurise une ligne. L'image emballera Python + dépendances + code ; le conteneur MySQL remplacera « un MySQL joignable » ; les variables d'environnement passeront par Compose ; les volumes garderont les données."
    },
    2: {
      titre: "le premier conteneur",
      etat: "Docker est installé. On vérifie que tout fonctionne avant de conteneuriser quoi que ce soit.",
      objectif: "Vérifie l'installation (docker --version, docker run hello-world), puis lance un conteneur Python interactif et éphémère (--rm -it python:3.12-slim) et vérifie la version de Python à l'intérieur.",
      hints: [
        "docker run hello-world télécharge l'image et exécute le conteneur de test.",
        "docker run --rm -it python:3.12-slim python --version",
        "--rm supprime le conteneur à la sortie, -it donne un terminal interactif."
      ],
      solution: `$ docker --version
Docker version 27.x

$ docker run hello-world
Hello from Docker!            # installation OK

$ docker run --rm -it python:3.12-slim python --version
Python 3.12.x                 # un Python propre, sans rien installer !

$ docker run --rm -it python:3.12-slim bash
root@a1b2c3:/# python -c "print('Ludothèque')"
Ludothèque`,
      note: "Sans rien installer sur la machine, on dispose d'un Python 3.12 exact et jetable : c'est déjà la promesse des conteneurs. --rm évite d'accumuler des conteneurs morts ; -it (interactif + terminal) permet d'explorer. L'image python:3.12-slim vient de Docker Hub."
    },
    3: {
      titre: "apprivoiser le cycle de vie",
      etat: "On sait lancer. Il faut maintenant savoir observer, arrêter, relancer et nettoyer.",
      objectif: "Lance un conteneur nommé (nginx en arrière-plan), observe-le (ps, logs), entre dedans (exec), arrête-le, redémarre-le, puis supprime-le. Note la différence entre stop et rm.",
      hints: [
        "docker run -d --name essai nginx:alpine ; docker ps ; docker logs essai",
        "docker exec -it essai sh — un shell DANS le conteneur qui tourne.",
        "docker stop essai (arrête) ≠ docker rm essai (supprime) ; ps -a montre les arrêtés."
      ],
      solution: `$ docker run -d --name essai nginx:alpine
$ docker ps                    # il tourne
$ docker logs essai            # ses journaux
$ docker exec -it essai sh     # entrer dedans
/ # exit

$ docker stop essai            # arrêté, mais existe encore
$ docker ps -a                 # ... le voici (Exited)
$ docker start essai           # repart, même conteneur
$ docker stop essai && docker rm essai   # arrêter PUIS supprimer
$ docker ps -a                 # plus rien`,
      note: "stop envoie un signal d'arrêt propre (le conteneur existe toujours, redémarrable avec ses données locales) ; rm le supprime définitivement. -d détache (arrière-plan), --name évite de manipuler des identifiants hexadécimaux. Ces gestes serviront à chaque leçon."
    },
    4: {
      titre: "choisir les images de la Ludothèque",
      etat: "Les conteneurs naissent d'images. On choisit celles dont la Ludothèque aura besoin — et on comprend leurs tags.",
      objectif: "Récupère (pull) les deux images de base du projet : python:3.12-slim et mysql:8.4. Compare les tailles (docker images), explique ce que signifie chaque partie du tag, et pourquoi on ÉPINGLE une version plutôt que latest.",
      hints: [
        "docker pull python:3.12-slim && docker pull mysql:8.4",
        "nom:tag — le tag est une étiquette de version ; latest = celle du moment (mouvante !).",
        "docker history python:3.12-slim montre les couches."
      ],
      solution: `$ docker pull python:3.12-slim
$ docker pull mysql:8.4
$ docker images
REPOSITORY   TAG        SIZE
python       3.12-slim  ~120MB     # slim : sans compilateurs ni docs
mysql        8.4        ~600MB

# python:3.12-slim
#  nom   : python (image officielle Docker Hub)
#  3.12  : version de Python épinglée
#  slim  : variante allégée (Debian minimal)

# latest est MOUVANT : la même commande demain peut tirer
# une autre version -> on épingle 3.12-slim, 8.4.`,
      note: "Épingler les tags, c'est le requirements.txt de l'infrastructure : reproductible dans six mois. Les images sont faites de COUCHES empilées et partagées (docker history les montre) — deux images basées sur la même Debian ne la stockent qu'une fois."
    },
    5: {
      titre: "le Dockerfile de la Ludothèque",
      etat: "Les images publiques ne connaissent pas notre code. On écrit la recette de NOTRE image.",
      objectif: "Écris le premier Dockerfile de la Ludothèque : FROM python:3.12-slim, dossier de travail /app, installation de requirements.txt, copie du code, port 8000 documenté, démarrage gunicorn.",
      hints: [
        "FROM python:3.12-slim puis WORKDIR /app.",
        "COPY requirements.txt . && RUN pip install -r requirements.txt AVANT COPY . . (cache !)",
        "CMD [\"gunicorn\", \"ludotheque.wsgi:application\", \"--bind\", \"0.0.0.0:8000\"]"
      ],
      solution: `# Dockerfile
FROM python:3.12-slim

WORKDIR /app

# dépendances d'abord (couche mise en cache tant que requirements.txt ne change pas)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# puis le code (change souvent -> couche invalidée souvent, mais pas la précédente)
COPY . .

EXPOSE 8000
CMD ["gunicorn", "ludotheque.wsgi:application", "--bind", "0.0.0.0:8000"]`,
      note: "L'ordre des instructions n'est pas cosmétique : chaque instruction crée une couche mise en cache. requirements.txt change rarement, le code change tout le temps — en copiant les dépendances d'abord, un rebuild après une modification de code réutilise la couche pip install (secondes au lieu de minutes)."
    },
    6: {
      titre: "construire et itérer",
      etat: "La recette est écrite. On construit l'image, on mesure le cache, on exclut ce qui n'a rien à y faire.",
      objectif: "Construis l'image (docker build -t ludotheque:0.1 .), écris le .dockerignore (env virtuel, .git, __pycache__, .env), reconstruis après une modification de code et observe les couches en cache.",
      hints: [
        "docker build -t ludotheque:0.1 . — le point est le contexte de build.",
        ".dockerignore : .venv/, .git/, __pycache__/, *.pyc, .env",
        "Rebuild : les étapes AVANT COPY . . affichent CACHED."
      ],
      solution: `# .dockerignore
.venv/
.git/
__pycache__/
*.pyc
.env          # les secrets ne rentrent JAMAIS dans une image

$ docker build -t ludotheque:0.1 .
[+] Building ... => [3/5] RUN pip install ...   (long la 1re fois)

# on modifie catalogue/views.py puis :
$ docker build -t ludotheque:0.1 .
=> CACHED [2/5] COPY requirements.txt .
=> CACHED [3/5] RUN pip install ...             # ← le cache paie
=> [4/5] COPY . .                               # seule cette couche se refait

$ docker run --rm ludotheque:0.1 python manage.py check`,
      note: ".dockerignore joue le rôle du .gitignore : il allège le contexte de build ET empêche les secrets (.env) et les artefacts locaux (.venv) d'entrer dans l'image — une image se partage, un secret embarqué est un secret publié. Le tag 0.1 versionne notre première recette."
    },
    7: {
      titre: "la Ludothèque tourne en conteneur",
      etat: "L'image existe. On lance l'application conteneurisée — et on découvre ce qui manque encore.",
      objectif: "Lance le conteneur en publiant le port (-p 8000:8000) et en passant la configuration par variables d'environnement (-e). Constate les deux limites : MySQL n'est pas joignable, et tout disparaît avec le conteneur.",
      hints: [
        "docker run -d --name ludo -p 8000:8000 -e DJANGO_SECRET_KEY=dev -e DB_HOST=?? ludotheque:0.1",
        "DB_HOST=localhost ne marche PAS : localhost, c'est le conteneur lui-même.",
        "docker logs ludo montre l'erreur de connexion MySQL — c'est attendu."
      ],
      solution: `$ docker run -d --name ludo -p 8000:8000 \\
    -e DJANGO_SECRET_KEY=cle-de-dev \\
    -e DB_PASSWORD=motdepasse \\
    ludotheque:0.1

$ curl http://localhost:8000/catalogue/
# ... erreur : MySQL injoignable !

$ docker logs ludo
django.db.utils.OperationalError: Can't connect to MySQL server on 'localhost'

# Normal : DANS le conteneur, localhost = le conteneur lui-même.
# Il nous faut : un conteneur MySQL + un réseau commun (semaine 2),
# et des volumes pour que les données survivent (leçon 8).`,
      note: "Fin de semaine 1 : l'application est emballée et démarre — la config passe par -e (exactement les variables du capstone, leçon 2 du Niveau 6). Les deux échecs constatés (réseau, persistance) sont le programme de la semaine 2 : c'est en heurtant ces murs qu'on comprend pourquoi volumes et réseaux existent."
    },
    8: {
      titre: "des données qui survivent",
      etat: "Un conteneur supprimé emporte ses données. Inacceptable pour les locations et achats de la Ludothèque.",
      objectif: "Crée un volume nommé donnees-mysql et démontre la persistance : lance MySQL avec le volume, crée une table, supprime le conteneur, relance avec le même volume — la table est toujours là.",
      hints: [
        "docker volume create donnees-mysql",
        "docker run -d --name bdd -e MYSQL_ROOT_PASSWORD=... -v donnees-mysql:/var/lib/mysql mysql:8.4",
        "/var/lib/mysql est le dossier où MySQL stocke ses bases."
      ],
      solution: `$ docker volume create donnees-mysql

$ docker run -d --name bdd \\
    -e MYSQL_ROOT_PASSWORD=secret \\
    -v donnees-mysql:/var/lib/mysql \\
    mysql:8.4

$ docker exec -it bdd mysql -psecret \\
    -e "CREATE DATABASE ludotheque; USE ludotheque; CREATE TABLE preuve(id INT);"

$ docker rm -f bdd                    # on DÉTRUIT le conteneur

$ docker run -d --name bdd2 \\
    -e MYSQL_ROOT_PASSWORD=secret \\
    -v donnees-mysql:/var/lib/mysql \\
    mysql:8.4
$ docker exec -it bdd2 mysql -psecret -e "SHOW TABLES IN ludotheque;"
+---------------------+
| preuve              |          # ← les données ont survécu !`,
      note: "Le conteneur est jetable, le volume ne l'est pas : c'est la séparation compute/données. Le volume vit dans Docker (docker volume ls/inspect), indépendant de tout conteneur. La leçon 11 appliquera exactement ce montage au MySQL officiel de la Ludothèque."
    },
    9: {
      titre: "relier l'app et sa base",
      etat: "Deux conteneurs qui s'ignorent. On crée le réseau qui les fait se parler — par leur nom.",
      objectif: "Crée le réseau reseau-ludo, relances-y MySQL (nommé bdd) et l'application avec DB_HOST=bdd. Vérifie que l'app joint la base, et que MySQL n'est PAS exposé sur l'hôte.",
      hints: [
        "docker network create reseau-ludo ; --network reseau-ludo sur les deux run.",
        "Sur un réseau utilisateur, le NOM du conteneur est son adresse DNS : DB_HOST=bdd.",
        "Pas de -p sur MySQL : seul l'app a besoin d'être jointe de l'extérieur."
      ],
      solution: `$ docker network create reseau-ludo

$ docker run -d --name bdd --network reseau-ludo \\
    -e MYSQL_ROOT_PASSWORD=secret -e MYSQL_DATABASE=ludotheque \\
    -v donnees-mysql:/var/lib/mysql \\
    mysql:8.4                          # PAS de -p : invisible de l'extérieur

$ docker run -d --name ludo --network reseau-ludo \\
    -p 8000:8000 \\
    -e DB_HOST=bdd -e DB_PASSWORD=secret -e DJANGO_SECRET_KEY=dev \\
    ludotheque:0.1

$ docker exec ludo python manage.py check --database default
System check identified no issues     # l'app joint « bdd » par son nom !`,
      note: "Sur un réseau créé par l'utilisateur, Docker fournit un DNS interne : le conteneur « bdd » est joignable à l'adresse bdd — la valeur DB_HOST du capstone devient simplement le nom du conteneur. MySQL sans -p n'est accessible QUE depuis le réseau interne : surface d'attaque minimale."
    },
    10: {
      titre: "la configuration sans secrets embarqués",
      etat: "Les -e s'accumulent et le mot de passe traîne dans l'historique du shell. On range la configuration.",
      objectif: "Regroupe la configuration dans un fichier d'environnement (.env.docker, exclu de Git ET de l'image), lance le conteneur avec --env-file, et vérifie qu'aucun secret n'est visible dans docker history ni dans l'image.",
      hints: [
        "--env-file .env.docker remplace la série de -e.",
        ".env* figure dans .dockerignore ET .gitignore.",
        "docker history ludotheque:0.1 ne doit montrer AUCUN secret (rien via ENV/ARG en dur)."
      ],
      solution: `# .env.docker  (jamais commité, jamais copié dans l'image)
DJANGO_SECRET_KEY=cle-longue-aleatoire
DJANGO_DEBUG=0
DB_HOST=bdd
DB_PASSWORD=secret

$ docker run -d --name ludo --network reseau-ludo \\
    -p 8000:8000 --env-file .env.docker ludotheque:0.1

# Vérifications :
$ docker history ludotheque:0.1      # aucune couche ne contient de secret
$ grep -E "^\\.env" .dockerignore .gitignore
.dockerignore:.env
.gitignore:.env                       # doublement exclu`,
      note: "Règle d'or : l'image contient le CODE, l'environnement contient la CONFIG. La même image ludotheque:0.1 tourne en dev, test et prod avec des --env-file différents — exactement la philosophie de settings.py par os.environ du capstone, transposée à l'infrastructure."
    },
    11: {
      titre: "le MySQL officiel de la Ludothèque",
      etat: "On assemble ce qu'on sait : le conteneur MySQL définitif, initialisé, persistant, sur le bon réseau.",
      objectif: "Lance le MySQL du projet avec : variables d'initialisation (base ludotheque, utilisateur ludo_app), volume de données, réseau, et script d'initialisation éventuel monté dans /docker-entrypoint-initdb.d. Applique ensuite les migrations depuis le conteneur app.",
      hints: [
        "MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD créent base + utilisateur au premier démarrage.",
        "-v ./init:/docker-entrypoint-initdb.d monte des .sql exécutés à l'initialisation.",
        "docker exec ludo python manage.py migrate — les migrations du capstone, en conteneur."
      ],
      solution: `$ docker run -d --name bdd --network reseau-ludo \\
    -e MYSQL_ROOT_PASSWORD=root-secret \\
    -e MYSQL_DATABASE=ludotheque \\
    -e MYSQL_USER=ludo_app \\
    -e MYSQL_PASSWORD=secret \\
    -v donnees-mysql:/var/lib/mysql \\
    -v ./init:/docker-entrypoint-initdb.d \\
    mysql:8.4

$ docker exec ludo python manage.py migrate
Applying catalogue.0001_initial... OK       # le schéma né de Merise
Applying catalogue.0002_creer_roles... OK   # les 3 rôles

$ docker exec -it bdd mysql -uludo_app -psecret ludotheque -e "SHOW TABLES;"`,
      note: "L'image officielle mysql crée base et utilisateur applicatif au PREMIER démarrage (volume vide) — l'app ne se connecte pas en root, comme au cours MySQL. Les migrations du Niveau 6 tournent telles quelles : le conteneur ne change pas l'application, il change son emballage."
    },
    12: {
      titre: "compose.yaml : tout en une commande",
      etat: "Deux docker run de dix lignes, un réseau, un volume… La procédure manuelle ne passe pas à l'échelle. On la déclare.",
      objectif: "Écris le compose.yaml de la Ludothèque : services app (build + ports + env_file + depends_on) et bdd (image mysql, volume, variables), le volume nommé. Lance tout avec docker compose up -d.",
      hints: [
        "services: app: build: . / ports: [\"8000:8000\"] / env_file: .env.docker",
        "bdd: image: mysql:8.4 / volumes: [donnees-mysql:/var/lib/mysql]",
        "Compose crée le réseau tout seul : les services se joignent par leur NOM (DB_HOST=bdd)."
      ],
      solution: `# compose.yaml
services:
  app:
    build: .
    ports:
      - "8000:8000"
    env_file: .env.docker
    depends_on:
      - bdd

  bdd:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: root-secret
      MYSQL_DATABASE: ludotheque
      MYSQL_USER: ludo_app
      MYSQL_PASSWORD: secret
    volumes:
      - donnees-mysql:/var/lib/mysql

volumes:
  donnees-mysql:

# $ docker compose up -d      → réseau + volume + 2 conteneurs
# $ docker compose ps / logs app / down`,
      note: "Le YAML remplace la procédure : l'infrastructure devient un FICHIER, versionné dans Git à côté du code. docker compose up -d recrée tout à l'identique sur n'importe quelle machine — le « ça marche chez moi » est mort. Compose nomme le réseau et y inscrit chaque service sous son nom."
    },
    13: {
      titre: "démarrer dans le bon ordre",
      etat: "app démarre parfois avant que MySQL ne soit PRÊT (le processus tourne, le serveur SQL pas encore). Résultat : crash au boot.",
      objectif: "Ajoute un healthcheck au service bdd (mysqladmin ping) et conditionne app avec depends_on: condition: service_healthy. Ajoute restart: unless-stopped aux deux services.",
      hints: [
        "healthcheck: test: [\"CMD\", \"mysqladmin\", \"ping\", \"-h\", \"localhost\"] + interval/retries.",
        "depends_on: bdd: condition: service_healthy",
        "restart: unless-stopped relance en cas de crash (sauf arrêt volontaire)."
      ],
      solution: `services:
  app:
    build: .
    ports: ["8000:8000"]
    env_file: .env.docker
    restart: unless-stopped
    depends_on:
      bdd:
        condition: service_healthy   # attend que MySQL RÉPONDE

  bdd:
    image: mysql:8.4
    environment: { ... }
    volumes:
      - donnees-mysql:/var/lib/mysql
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 3s
      retries: 10`,
      note: "depends_on seul garantit l'ordre de DÉMARRAGE, pas la DISPONIBILITÉ : MySQL met plusieurs secondes à accepter des connexions. Le healthcheck sonde le service réel, et service_healthy fait patienter l'app. restart: unless-stopped est le filet de sécurité de la production."
    },
    14: {
      titre: "développer sans reconstruire",
      etat: "Chaque modification de code exige un rebuild. En dev, on veut voir le changement immédiatement.",
      objectif: "Crée un compose.override.yaml de développement : bind mount du code (.:/app), serveur de dev (runserver) à la place de gunicorn, DEBUG=1, port exposé. La prod garde le compose.yaml pur.",
      hints: [
        "volumes: - .:/app — le dossier local REMPLACE le code de l'image, à chaud.",
        "command: python manage.py runserver 0.0.0.0:8000 (rechargement auto).",
        "docker compose lit compose.yaml + compose.override.yaml automatiquement en dev."
      ],
      solution: `# compose.override.yaml  (dev uniquement — pas déployé)
services:
  app:
    volumes:
      - .:/app                  # le code local, monté à chaud
    command: python manage.py runserver 0.0.0.0:8000
    environment:
      DJANGO_DEBUG: "1"

# dev :  docker compose up          (yaml + override fusionnés)
# prod : docker compose -f compose.yaml up -d    (override ignoré)

# On modifie views.py -> runserver recharge -> F5, c'est là.`,
      note: "Le bind mount court-circuite l'image le temps du développement : le conteneur exécute le code du dossier local, et runserver recharge à chaque sauvegarde. L'override est la convention Compose pour séparer dev et prod sans dupliquer le fichier principal — la prod n'utilise que compose.yaml, avec gunicorn et DEBUG=0."
    },
    15: {
      titre: "une image deux fois plus légère",
      etat: "L'image embarque pip, les caches et des outils de build inutiles à l'exécution. On sépare la construction de l'exécution.",
      objectif: "Transforme le Dockerfile en multi-stage : un étage builder qui installe les dépendances (wheels), un étage final slim qui ne copie que le nécessaire. Compare les tailles avant/après.",
      hints: [
        "FROM python:3.12-slim AS builder → pip wheel -r requirements.txt -w /wheels",
        "Étage final : COPY --from=builder /wheels /wheels && pip install /wheels/*",
        "docker images | grep ludotheque pour comparer."
      ],
      solution: `# Dockerfile multi-stage
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip wheel --no-cache-dir -r requirements.txt -w /wheels

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels
COPY . .
EXPOSE 8000
CMD ["gunicorn", "ludotheque.wsgi:application", "--bind", "0.0.0.0:8000"]

$ docker images | grep ludotheque
ludotheque  0.2   ~180MB       # vs ~350MB avant : compilateurs et caches
                               # sont restés dans l'étage builder`,
      note: "L'étage builder peut contenir gcc, les headers, les caches — rien de tout ça ne passe dans l'image finale : COPY --from ne prend que les wheels compilés. Une image plus légère se télécharge plus vite, expose moins de failles et coûte moins cher à stocker. Même principe pour Java (jar) ou C# (publish)."
    },
    16: {
      titre: "un conteneur qui n'est pas root",
      etat: "Par défaut, le processus tourne en root DANS le conteneur. Une évasion de conteneur deviendrait un accès root. On durcit.",
      objectif: "Ajoute au Dockerfile un utilisateur applicatif non-root (ludo), donne-lui la propriété de /app, et bascule dessus avec USER avant le CMD. Vérifie avec docker exec whoami.",
      hints: [
        "RUN useradd --create-home --shell /bin/false ludo",
        "COPY --chown=ludo:ludo . . puis USER ludo",
        "docker exec ludo-conteneur whoami → ludo (pas root)."
      ],
      solution: `FROM python:3.12-slim
WORKDIR /app

RUN useradd --create-home --shell /bin/false ludo

COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels

COPY --chown=ludo:ludo . .

USER ludo                       # tout ce qui suit tourne SANS privilèges
EXPOSE 8000
CMD ["gunicorn", "ludotheque.wsgi:application", "--bind", "0.0.0.0:8000"]

$ docker compose exec app whoami
ludo                            # ✔ pas root`,
      note: "Moindre privilège, version conteneur : gunicorn n'a aucune raison d'être root — il ne fait qu'écouter sur 8000 (>1024, autorisé sans privilèges) et lire /app. On épingle aussi les images de base (leçon 4) et on ne tire que des images officielles ou vérifiées : la chaîne d'approvisionnement fait partie de la sécurité."
    },
    17: {
      titre: "publier l'image de la Ludothèque",
      etat: "L'image n'existe que sur ta machine. Pour déployer (ou partager), il faut un registre.",
      objectif: "Tague l'image pour un registre (utilisateur/ludotheque:1.0.0 + latest), pousse-la (docker push), puis démontre le déploiement : docker pull + run depuis une autre machine (ou après suppression locale).",
      hints: [
        "docker tag ludotheque:0.2 tonuser/ludotheque:1.0.0 (et :latest).",
        "docker login puis docker push tonuser/ludotheque:1.0.0",
        "La version taguée correspond au tag Git du code (v1.0.0 → 1.0.0)."
      ],
      solution: `$ docker login
$ docker tag ludotheque:0.2 tonuser/ludotheque:1.0.0
$ docker tag ludotheque:0.2 tonuser/ludotheque:latest
$ docker push tonuser/ludotheque:1.0.0
$ docker push tonuser/ludotheque:latest

# Sur le serveur (ou après docker rmi local) :
$ docker pull tonuser/ludotheque:1.0.0
$ docker run -d -p 8000:8000 --env-file .env.prod tonuser/ludotheque:1.0.0

# compose.yaml de prod :
#   app:
#     image: tonuser/ludotheque:1.0.0    # plus de build: sur le serveur`,
      note: "Le registre est le Git des images : on y pousse des versions immuables. En prod, compose référence image: (pas build:) — le serveur ne compile rien, il tire un artefact déjà construit et testé. Le tag 1.0.0 répond au tag Git v1.0.0 du capstone : code et image racontent la même histoire de versions."
    },
    18: {
      titre: "voir ce qui se passe",
      etat: "En production conteneurisée, pas de debugger : il faut savoir observer logs, état et ressources de l'extérieur.",
      objectif: "Passe en revue l'observation de la Ludothèque : logs (suivis, horodatés), docker compose ps, inspect (config effective, IP, santé), stats (CPU/RAM), et un exec de diagnostic (manage.py check).",
      hints: [
        "docker compose logs -f --tail 50 app — suivre les derniers logs.",
        "docker inspect --format '{{.State.Health.Status}}' <conteneur>",
        "docker stats --no-stream — l'instantané CPU/mémoire."
      ],
      solution: `$ docker compose ps                    # état + santé des services
$ docker compose logs -f --tail 50 app # les logs structurés de la leçon 19 (capstone)
$ docker compose logs bdd | grep -i error

$ docker inspect --format '{{.State.Health.Status}}' ludo-bdd-1
healthy

$ docker stats --no-stream
NAME         CPU %   MEM USAGE
ludo-app-1   0.5%    120MiB
ludo-bdd-1   1.2%    450MiB

$ docker compose exec app python manage.py check --database default
System check identified no issues`,
      note: "Les logs du conteneur sont la sortie standard du processus : les logger.info du capstone y arrivent directement — c'est pour ça qu'on ne journalise pas dans des fichiers en conteneur. inspect donne la vérité effective (variables, montages, réseau) quand « ça devrait marcher » ; stats trahit la fuite mémoire avant l'OOM."
    },
    19: {
      titre: "contenir les ressources",
      etat: "Un conteneur sans limites peut affamer les autres. On borne mémoire et CPU, et on définit la politique de redémarrage.",
      objectif: "Ajoute au compose des limites (mem_limit, cpus) pour app et bdd, vérifie leur effet avec docker stats, et justifie restart: unless-stopped plutôt que always ou no.",
      hints: [
        "app : mem_limit: 512m / cpus: \"1.0\" ; bdd : mem_limit: 1g.",
        "Un conteneur qui dépasse sa limite mémoire est tué (OOMKilled) — restart le relance.",
        "unless-stopped : relance après crash/reboot, MAIS respecte un arrêt volontaire."
      ],
      solution: `services:
  app:
    image: tonuser/ludotheque:1.0.0
    mem_limit: 512m
    cpus: "1.0"
    restart: unless-stopped
    ...

  bdd:
    image: mysql:8.4
    mem_limit: 1g
    cpus: "2.0"
    restart: unless-stopped
    ...

$ docker stats --no-stream
NAME         MEM USAGE / LIMIT
ludo-app-1   118MiB / 512MiB      # borné
ludo-bdd-1   455MiB / 1GiB

# restart:
#  no             -> rien ne relance (dev ponctuel)
#  always         -> relance MÊME après docker stop (surprenant)
#  unless-stopped -> relance crash + reboot, respecte l'arrêt volontaire ✔`,
      note: "Les limites transforment une machine partagée en voisinage civilisé : une fuite mémoire dans l'app tue l'app (OOMKilled, relancée par restart), pas le MySQL d'à côté. docker inspect montre OOMKilled: true — premier réflexe quand un conteneur « disparaît mystérieusement »."
    },
    20: {
      titre: "la mise en production",
      etat: "Tout est prêt : image publiée, compose durci. On déploie la Ludothèque conteneurisée sur le serveur.",
      objectif: "Déroule le déploiement : sur le serveur, récupérer compose.yaml + .env de prod (hors Git), docker compose pull, up -d, migrations, vérifications — puis la procédure de mise à jour vers 1.0.1 et le retour arrière.",
      hints: [
        "Le serveur n'a besoin QUE de compose.yaml et du .env de prod — pas du code source.",
        "docker compose pull && docker compose up -d (recrée seulement ce qui a changé).",
        "Retour arrière = repointer image: sur 1.0.0 et re-up : l'image précédente existe toujours."
      ],
      solution: `# Sur le serveur
$ ls
compose.yaml  .env.prod          # c'est TOUT (l'image vient du registre)

$ docker compose --env-file .env.prod pull
$ docker compose --env-file .env.prod up -d
$ docker compose exec app python manage.py migrate
$ docker compose ps               # healthy partout
$ curl -I https://ludotheque.example.com/catalogue/   # 200 ✔

# Mise à jour vers 1.0.1 :
#   compose.yaml : image: tonuser/ludotheque:1.0.1
$ docker compose pull && docker compose up -d   # recrée juste app

# Retour arrière (1.0.1 se passe mal) :
#   image: tonuser/ludotheque:1.0.0
$ docker compose up -d            # l'ancienne image est toujours là`,
      note: "Comparer avec la leçon 20 du capstone : plus d'installation de Python, de gunicorn ni de dépendances sur le serveur — juste Docker, un YAML et un .env. La mise à jour est un changement de tag ; le retour arrière aussi. Les données, elles, vivent dans le volume : elles traversent les versions."
    },
    21: {
      titre: "🎓 la Ludothèque en conteneurs",
      etat: "L'application du Niveau 6 tourne en conteneurs, du poste de dev à la production, en une commande.",
      objectif: "Exercice de synthèse : raconte le trajet complet « du code au conteneur en production » — Dockerfile multi-stage non-root, build, push versionné, compose (réseau, volume, healthcheck, limites), déploiement et mise à jour — en citant la leçon de chaque brique.",
      hints: [
        "Pars du code du capstone : Dockerfile (leçons 5, 15, 16) → build/tag (6, 17).",
        "Compose : services, réseau DNS, volume MySQL, healthcheck, restart, limites (12, 13, 8, 19).",
        "Prod : pull + up -d + migrate, observation (18), mise à jour par tag (20)."
      ],
      solution: `Code (capstone Niveau 6)
  → Dockerfile multi-stage (l.15), USER ludo non-root (l.16),
    .dockerignore sans secrets (l.6)
  → docker build -t ludotheque:1.0.0 (l.6)
  → docker push tonuser/ludotheque:1.0.0 (l.17)

compose.yaml (l.12-13)
  app  : image du registre, env_file, ports, depends_on healthy,
         mem_limit 512m, restart unless-stopped (l.19)
  bdd  : mysql:8.4, volume donnees-mysql (l.8), healthcheck (l.13),
         jamais exposé (l.9) ; DB_HOST=bdd via DNS interne (l.9)

Serveur de production (l.20)
  docker compose pull && up -d
  docker compose exec app python manage.py migrate
  observation : compose ps / logs -f / stats / inspect (l.18)

Mise à jour : tag 1.0.1 -> pull -> up -d ; retour arrière par l'ancien tag.
Les données survivent dans le volume ; la config vit dans .env.prod.`,
      note: "La boucle est bouclée : l'application conçue en Merise, codée au Niveau 6, testée et déployée « à la main » en leçon 20 du capstone, se déploie maintenant en deux commandes reproductibles. Le cours suivant (CI/CD) automatisera ce que tu viens de faire manuellement : build, tests, push et déploiement à chaque commit."
    }
  }
};
