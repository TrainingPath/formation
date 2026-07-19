/* ===== Fil rouge « La Ludothèque pro » — capstone outillé (C · Docker · CI/CD) =====
   Reconstruire la Ludothèque en C comme en entreprise : Git, conteneur et
   pipeline dès le premier commit. Construire, industrialiser et sécuriser
   d'un même geste — mêmes règles métier, mais versionnées, testées en CI,
   conteneurisées et durcies. */
var FIL = {
  prefix: "projcpro21",
  app: "La Ludothèque pro",
  placeholder: "Écris ton code / Dockerfile / YAML ici…",
  etapes: {
    1: {
      titre: "le dépôt et l'environnement",
      etat: "Feuille blanche, mais on connaît le domaine et l'outillage. On pose le dépôt et l'environnement conteneurisé avant tout code métier.",
      objectif: "Initialise le dépôt Git et écris un .gitignore adapté à un projet C (binaires, objets, secrets). Liste les fichiers d'amorçage : Dockerfile, docker-compose.yml, Makefile, .env.example.",
      hints: [
        "git init ; premier commit avec la structure vide.",
        "Ignore *.o, les binaires, .env (jamais les secrets).",
        "Prévois .env.example (sans valeurs réelles) pour documenter."
      ],
      solution: `# .gitignore
*.o
app
tests
.env            # secrets : JAMAIS versionnes
*.log

# fichiers d'amorcage versionnes :
#   Dockerfile, docker-compose.yml, Makefile, .env.example,
#   .github/workflows/ci.yml, src/*.c src/*.h`,
      note: "On outille avant de coder : dépôt, ignore-list, squelette de conteneur et de CI. Les secrets (.env) ne sont jamais versionnés ; .env.example documente les variables attendues."
    },
    2: {
      titre: "le squelette dans Docker Compose",
      etat: "Le dépôt existe. Faisons tourner le code C et MySQL dans des conteneurs reproductibles.",
      objectif: "Écris un docker-compose.yml minimal avec deux services : db (MySQL, variables d'env, volume) et app (build local, dépend de db). Le but : « ça marche chez moi » n'existe plus.",
      hints: [
        "service db : image mysql:8, environment (MYSQL_*), volume pour la persistance.",
        "service app : build ., depends_on: [db].",
        "Les mots de passe viennent de variables, pas du fichier."
      ],
      solution: `services:
  db:
    image: mysql:8
    environment:
      MYSQL_DATABASE: ludotheque
      MYSQL_USER: ludo
      MYSQL_PASSWORD: \${DB_PASSWORD}
      MYSQL_ROOT_PASSWORD: \${DB_ROOT_PASSWORD}
    volumes:
      - dbdata:/var/lib/mysql
  app:
    build: .
    depends_on:
      - db
    environment:
      DB_HOST: db
      DB_USER: ludo
      DB_PASSWORD: \${DB_PASSWORD}
      DB_NAME: ludotheque
volumes:
  dbdata:`,
      note: "L'environnement complet (code + base) tourne à l'identique partout. DB_HOST vaut « db » : le nom du service devient le nom d'hôte réseau. Les secrets viennent de l'environnement, pas du YAML."
    },
    3: {
      titre: "Git, branches et première CI",
      etat: "L'environnement tourne. Mettons en place le flux de travail : branches, PR et une CI qui compile dès maintenant.",
      objectif: "Écris un workflow GitHub Actions minimal (.github/workflows/ci.yml) qui, à chaque push, installe le connecteur MySQL, compile le projet avec -Wall -Wextra et échoue si la compilation échoue.",
      hints: [
        "on: [push, pull_request].",
        "steps : checkout, apt-get install libmysqlclient-dev, make.",
        "La CI rouge doit bloquer la fusion (protection de branche)."
      ],
      solution: `name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deps
        run: sudo apt-get update && sudo apt-get install -y libmysqlclient-dev
      - name: Build
        run: make            # -Wall -Wextra : un warning-erreur casse le build`,
      note: "Le pipeline existe AVANT le métier : chaque push est compilé automatiquement. Combiné à la protection de branche, un build rouge empêche de fusionner du code cassé."
    },
    4: {
      titre: "le schéma, dans le conteneur",
      etat: "La CI compile. Appliquons le schéma SQL de façon reproductible, au démarrage du conteneur db.",
      objectif: "Place le script schema.sql pour qu'il soit exécuté automatiquement à l'initialisation du conteneur MySQL (dossier /docker-entrypoint-initdb.d). Rappelle les tables clés.",
      hints: [
        "Monte schema.sql dans /docker-entrypoint-initdb.d/ : MySQL l'exécute au 1er démarrage.",
        "Tables : jeu, categorie, utilisateur, location, vente.",
        "Le schéma est ainsi versionné ET rejoué à l'identique partout."
      ],
      solution: `# docker-compose.yml (service db) :
    volumes:
      - dbdata:/var/lib/mysql
      - ./schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro

# schema.sql (extrait)
CREATE TABLE categorie (id INT AUTO_INCREMENT PRIMARY KEY, nom VARCHAR(50) NOT NULL);
CREATE TABLE jeu (
  id INT AUTO_INCREMENT PRIMARY KEY, nom VARCHAR(100) NOT NULL,
  prix_achat DECIMAL(6,2), prix_location DECIMAL(6,2),
  stock_vente INT DEFAULT 0, stock_location INT DEFAULT 0,
  categorie_id INT, FOREIGN KEY (categorie_id) REFERENCES categorie(id)
);`,
      note: "Le schéma vit dans le dépôt et s'applique tout seul au premier démarrage du conteneur : plus de « base créée à la main » qui diverge d'un poste à l'autre. Reproductibilité totale."
    },
    5: {
      titre: "le modèle et le DAO, testés dès l'écriture",
      etat: "Base reproductible. Écrivons les struct et le DAO en écrivant leurs tests en même temps.",
      objectif: "Définis la struct Jeu et un test unitaire du mapping (une fonction pure qui construit un Jeu depuis des chaînes façon row[]). Le test doit tourner en CI.",
      hints: [
        "Isole le mapping dans une fonction pure : Jeu jeu_from_fields(const char *id, const char *nom, ...).",
        "Ainsi testable sans MySQL.",
        "Ajoute un job « test » au workflow."
      ],
      solution: `/* mapping pur, testable sans base */
Jeu jeu_from_fields(const char *id, const char *nom, const char *prix) {
    Jeu j = {0};
    j.id = atoi(id);
    snprintf(j.nom, sizeof(j.nom), "%s", nom ? nom : "");
    j.prix_location = atof(prix);
    return j;
}
/* test */
CHECK(jeu_from_fields("7", "Catan", "5.0").id == 7);
CHECK(jeu_from_fields("7", "Catan", "5.0").prix_location == 5.0);`,
      note: "En isolant le mapping dans une fonction pure, on le teste sans base — rapide et fiable, exécutable en CI. Écrire le test en même temps que le code, c'est le réflexe « testé dès l'écriture »."
    },
    6: {
      titre: "les services sous CI",
      etat: "Modèle testé. Ajoutons les règles métier avec leurs tests, tout au vert dans le pipeline.",
      objectif: "Écris service_tarif et son test, puis complète le workflow avec un job « test » qui compile et exécute le harnais (make test). Un test rouge doit faire échouer la CI.",
      hints: [
        "service_tarif : -10 % dès 3 jours (fonction pure).",
        "make test compile tests.c + services.c et lance ./tests.",
        "job test dans ci.yml, après le build."
      ],
      solution: `double service_tarif(const Jeu *j, int jours) {
    double t = j->prix_location * jours;
    if (jours >= 3) t *= 0.9;
    return t;
}
# ci.yml : job test
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: sudo apt-get update && sudo apt-get install -y libmysqlclient-dev
      - run: make test        # ./tests renvoie 1 si un test echoue -> CI rouge`,
      note: "Chaque règle métier arrive avec son test, exécuté par la CI. Le métier ne progresse que si le pipeline reste vert : la qualité est un prérequis, pas une étape finale."
    },
    7: {
      titre: "requêtes préparées, job au vert",
      etat: "Métier testé. Écrivons les accès en écriture avec des requêtes préparées, sans casser la CI.",
      objectif: "Écris dao_ajouter_jeu avec une requête préparée (paramètres liés) et explique pourquoi la CI ne peut pas tester l'injection mais peut vérifier la compilation et la logique environnante.",
      hints: [
        "mysql_stmt_prepare + MYSQL_BIND (STRING, DOUBLE).",
        "La sécurité vient de la conception (paramètres liés), pas d'un test.",
        "La CI compile et exécute les tests unitaires purs."
      ],
      solution: `int dao_ajouter_jeu(MYSQL *c, const char *nom, double prix) {
    MYSQL_STMT *st = mysql_stmt_init(c);
    const char *sql = "INSERT INTO jeu(nom,prix_location,prix_achat) VALUES(?,?,0)";
    if (mysql_stmt_prepare(st, sql, strlen(sql))) { mysql_stmt_close(st); return -1; }
    MYSQL_BIND b[2]; memset(b, 0, sizeof(b));
    unsigned long len = strlen(nom);
    b[0].buffer_type=MYSQL_TYPE_STRING; b[0].buffer=(char*)nom;
    b[0].buffer_length=len; b[0].length=&len;
    b[1].buffer_type=MYSQL_TYPE_DOUBLE; b[1].buffer=&prix;
    mysql_stmt_bind_param(st, b);
    int ok = mysql_stmt_execute(st)==0 ? 0 : -1;
    mysql_stmt_close(st); return ok;
}`,
      note: "La protection contre l'injection est structurelle (le ?), pas un test à écrire. La CI garantit que ce code compile et que la logique autour (validation, services) reste correcte."
    },
    8: {
      titre: "validation et entrées sûres",
      etat: "Écritures sûres côté SQL. Sécurisons aussi les entrées côté C (tampons, longueurs).",
      objectif: "Écris une lecture de chaîne bornée (jamais gets, jamais scanf %s non borné) et une validation de longueur avant insertion. Ajoute un test de valider_nom (rejette vide ou trop long).",
      hints: [
        "Lecture : fgets ou scanf(\" %49[^\\n]\", buf).",
        "valider_nom : longueur entre 1 et 100.",
        "Teste les bords (vide, 101 caractères)."
      ],
      solution: `Code valider_nom(const char *nom) {
    size_t n = strlen(nom);
    if (n == 0 || n > 100) return ERR_SAISIE;
    return OK;
}
/* tests */
CHECK(valider_nom("") == ERR_SAISIE);
CHECK(valider_nom("Catan") == OK);

/* lecture bornee (jamais gets) */
char buf[50];
scanf(" %49[^\\n]", buf);   /* 49 = taille - 1, place pour '\\0' */`,
      note: "Deux fronts : les entrées bornées (contre les débordements de tampon, faille C classique) et la validation métier (longueur). Les deux sont testés, la CI veille."
    },
    9: {
      titre: "authentification durcie",
      etat: "Entrées sûres. Ajoutons les comptes avec un hachage de mot de passe robuste.",
      objectif: "Décris le stockage et la vérification d'un mot de passe avec un hachage lent et salé (ex. libsodium crypto_pwhash_str / _str_verify), et un message d'erreur neutre à la connexion.",
      hints: [
        "À l'inscription : crypto_pwhash_str(hash, mdp, ...) puis stocker hash.",
        "À la connexion : crypto_pwhash_str_verify(hash, mdp, ...).",
        "Même message pour login inconnu et mauvais mot de passe."
      ],
      solution: `/* inscription (libsodium) */
char hash[crypto_pwhash_STRBYTES];
crypto_pwhash_str(hash, mdp, strlen(mdp),
    crypto_pwhash_OPSLIMIT_INTERACTIVE, crypto_pwhash_MEMLIMIT_INTERACTIVE);
/* stocker 'hash' via requete preparee */

/* connexion */
if (crypto_pwhash_str_verify(hash_stocke, mdp, strlen(mdp)) != 0)
    return ERR_SAISIE;   // message NEUTRE (login inconnu OU mdp faux)`,
      note: "Un hachage lent et salé (argon2 via libsodium) résiste au force-brute. Le sel est intégré au hash. Le message neutre empêche un attaquant de savoir quels comptes existent."
    },
    10: {
      titre: "autorisation anti-IDOR",
      etat: "Auth durcie. Vérifions non seulement le rôle, mais aussi la propriété des ressources.",
      objectif: "Écris un contrôle qui empêche un client d'annuler la location d'un AUTRE client (IDOR). Le service vérifie que la location appartient bien à l'utilisateur courant.",
      hints: [
        "IDOR = accéder à l'objet d'un autre en changeant l'identifiant.",
        "Vérifie location.utilisateur_id == u->id (sauf admin).",
        "Sinon ERR_DROIT."
      ],
      solution: `Code service_annuler_location(const Utilisateur *u, MYSQL *c, int loc_id) {
    Location l;
    if (dao_location_par_id(c, loc_id, &l) != 0) return ERR_DB;
    // anti-IDOR : la location doit appartenir a l'utilisateur (ou admin)
    if (u->role != ADMIN && l.utilisateur_id != u->id)
        return ERR_DROIT;
    return dao_annuler_location(c, loc_id) == 0 ? OK : ERR_DB;
}`,
      note: "L'IDOR (Insecure Direct Object Reference) consiste à manipuler un id pour toucher la ressource d'autrui. On vérifie systématiquement la PROPRIÉTÉ, pas seulement le rôle : c'est le contrôle d'accès par ressource."
    },
    11: {
      titre: "louer, avec test d'intégration",
      etat: "Autorisation robuste. Reprenons la location transactionnelle, cette fois avec un test d'intégration.",
      objectif: "Rappelle le service_louer transactionnel et décris un test d'intégration (contre une base de test conteneurisée) qui vérifie qu'après une location, le stock a bien diminué de 1.",
      hints: [
        "Le test tourne contre la db du docker-compose (base de test).",
        "Scénario : lire le stock, louer, relire le stock, comparer.",
        "Ces tests sont plus lents : job séparé en CI."
      ],
      solution: `/* test d'integration (pseudocode) */
int avant = dao_stock_loc(c, JEU_TEST);
Code r = service_louer(c, USER_TEST, JEU_TEST, 2);
int apres = dao_stock_loc(c, JEU_TEST);
CHECK(r == OK);
CHECK(apres == avant - 1);   // le stock a bien diminue

# ci.yml : job d'integration avec un service MySQL
  integration:
    services:
      db: { image: mysql:8, env: { MYSQL_ROOT_PASSWORD: test } }`,
      note: "Le test unitaire vérifie la logique pure ; le test d'intégration vérifie l'effet réel sur la base (stock décrémenté, transaction). La CI lance une base jetable pour ces tests."
    },
    12: {
      titre: "acheter, avec couverture",
      etat: "Location testée de bout en bout. Faisons de même pour l'achat, en mesurant la couverture.",
      objectif: "Rappelle service_acheter (prix figé, transaction) et explique comment mesurer la couverture de test avec gcov (--coverage) pour repérer le code non testé.",
      hints: [
        "Compile les tests avec --coverage (gcc).",
        "gcov / lcov produit un rapport de lignes couvertes.",
        "Vise les chemins critiques (succès, stock nul, erreur DB)."
      ],
      solution: `# compilation instrumentee
gcc --coverage -Wall tests.c services.c -o tests $(mysql_config --libs)
./tests
gcov services.c        # % de lignes de services.c couvertes

# viser la couverture des chemins critiques de service_acheter :
#   - stock_vente <= 0  -> ERR_STOCK
#   - insertion echoue  -> ROLLBACK / ERR_DB
#   - cas nominal       -> OK, stock decremente`,
      note: "La couverture révèle le code jamais exécuté par les tests — souvent les branches d'erreur. On ne vise pas 100 % à tout prix, mais on s'assure que les chemins critiques (succès ET échecs) sont testés."
    },
    13: {
      titre: "l'interface et les débordements",
      etat: "Métier testé et couvert. Sécurisons l'interface contre les débordements de tampon.",
      objectif: "Montre une saisie sûre (bornée) et explique pourquoi -fsanitize=address en CI attrape les débordements que le code « marche quand même » cacherait.",
      hints: [
        "Toujours borner : scanf(\" %49[^\\n]\", buf) pour char buf[50].",
        "Jamais gets ; jamais %s sans largeur.",
        "Un job CI compilé avec -fsanitize=address exécute les tests et détecte les accès hors zone."
      ],
      solution: `/* saisie sure */
char nom[50];
if (scanf(" %49[^\\n]", nom) != 1) return;   /* 49 : place pour '\\0' */

# ci.yml : job sanitizer
  asan:
    steps:
      - run: gcc -g -fsanitize=address -Wall tests.c services.c -o t $(mysql_config --libs)
      - run: ./t     # s'arrete net sur tout debordement / use-after-free`,
      note: "Un débordement de tampon peut « passer » en apparence tout en corrompant la mémoire. L'AddressSanitizer en CI transforme ces bugs silencieux en échecs francs, à chaque exécution."
    },
    14: {
      titre: "secrets et configuration",
      etat: "Interface durcie. Externalisons tous les secrets et la configuration.",
      objectif: "Assure-toi qu'aucun secret n'est dans le code ni dans le dépôt : lecture par getenv, .env ignoré par Git, secrets injectés par l'orchestrateur/CI (GitHub Secrets).",
      hints: [
        "Le code lit getenv(\"DB_PASSWORD\").",
        ".env dans .gitignore ; .env.example versionné.",
        "En CI, les secrets viennent de ${{ secrets.DB_PASSWORD }}."
      ],
      solution: `# code : aucun secret en dur
const char *pass = getenv("DB_PASSWORD");
if (!pass) { fprintf(stderr, "[ERREUR] DB_PASSWORD manquant\\n"); return NULL; }

# .gitignore : .env
# .env.example : DB_HOST=  DB_USER=  DB_PASSWORD=  DB_NAME=   (sans valeurs)

# ci.yml : injection depuis GitHub Secrets
    env:
      DB_PASSWORD: \${{ secrets.DB_PASSWORD }}`,
      note: "Trois niveaux cohérents : le code lit l'environnement, le dépôt ignore le vrai .env, la CI et la prod injectent les secrets de façon protégée. Aucun mot de passe ne touche jamais Git."
    },
    15: {
      titre: "recherche, pagination, qualité",
      etat: "Config propre. Ajoutons recherche et pagination, avec lint et sanitizers en garde-fou.",
      objectif: "Rappelle la recherche paginée (requête préparée, LIMIT/OFFSET) et ajoute un job de lint statique (cppcheck ou clang-tidy) au pipeline pour repérer les défauts sans exécuter le code.",
      hints: [
        "LIKE CONCAT('%',?,'%') ... LIMIT ? OFFSET ? (paramètres liés).",
        "cppcheck --error-exitcode=1 src/ échoue la CI sur un défaut.",
        "Le lint complète les tests : il voit d'autres classes de bugs."
      ],
      solution: `-- recherche paginee (parametres lies)
SELECT id,nom FROM jeu WHERE nom LIKE CONCAT('%',?,'%')
ORDER BY nom LIMIT ? OFFSET ?;

# ci.yml : job lint
  lint:
    steps:
      - run: sudo apt-get install -y cppcheck
      - run: cppcheck --enable=warning,performance --error-exitcode=1 src/`,
      note: "L'analyse statique (cppcheck) lit le code sans l'exécuter et détecte fuites potentielles, comparaisons douteuses, tampons risqués. Avec les tests et les sanitizers, c'est la troisième maille du filet qualité."
    },
    16: {
      titre: "les trois espaces",
      etat: "Qualité outillée. Composons les menus par rôle, sécurité toujours côté service.",
      objectif: "Rappelle l'affichage du menu selon le rôle et souligne que, même industrialisé, le contrôle réel reste dans le service (défense en profondeur), pas dans l'affichage.",
      hints: [
        "afficher_menu compose selon peut_gerer_stock / peut_administrer.",
        "Chaque action re-vérifie le droit dans le service.",
        "Le menu est du confort ; le service est la barrière."
      ],
      solution: `void afficher_menu(const Utilisateur *u) {
    printf("=== Espace %s ===\\n", role_libelle(u->role));
    printf("1) Catalogue 2) Louer 3) Acheter\\n");
    if (peut_gerer_stock(u))  printf("4) Reappro 5) Ventes\\n");
    if (peut_administrer(u))  printf("6) Comptes 7) Stats\\n");
}
/* chaque service revErifie : if (!peut_...(u)) return ERR_DROIT; */`,
      note: "L'industrialisation ne change pas le principe : l'affichage adapte, le service décide. La défense en profondeur (menu + routage + service + anti-IDOR) protège même si une couche est contournée."
    },
    17: {
      titre: "l'image de production",
      etat: "Application complète. Construisons une image Docker de prod : petite, non-root, scannée.",
      objectif: "Écris un Dockerfile multi-stage : une étape build (compile le binaire) et une étape finale minimale (exécute en utilisateur non-root). Rappelle le scan d'image (Trivy).",
      hints: [
        "Stage 1 : image avec gcc + libmysqlclient-dev, make.",
        "Stage 2 : image légère, copie le binaire, USER non-root.",
        "Scan : trivy image mon-image (échoue sur CVE critiques)."
      ],
      solution: `# Dockerfile multi-stage
FROM debian:12 AS build
RUN apt-get update && apt-get install -y gcc make libmysqlclient-dev
WORKDIR /src
COPY . .
RUN make

FROM debian:12-slim
RUN apt-get update && apt-get install -y libmysqlclient21 && \\
    useradd -r ludo
COPY --from=build /src/app /usr/local/bin/app
USER ludo                       # non-root
ENTRYPOINT ["app"]

# scan : trivy image ludotheque:latest --exit-code 1 --severity CRITICAL`,
      note: "Le multi-stage laisse le compilateur hors de l'image finale (plus petite, moins de surface d'attaque). L'exécution non-root et le scan de vulnérabilités (Trivy) durcissent l'image livrée."
    },
    18: {
      titre: "le pipeline complet",
      etat: "Image de prod prête. Enchaînons tout dans un pipeline : build, tests, lint, scan, protection.",
      objectif: "Décris l'enchaînement complet du pipeline sur une pull request : build → tests unitaires → tests d'intégration → lint → build image → scan. La fusion est bloquée si une étape échoue.",
      hints: [
        "Des jobs qui dépendent les uns des autres (needs:).",
        "La protection de branche exige que tous les checks passent.",
        "Un seul job rouge = pas de fusion."
      ],
      solution: `jobs:
  build:        { ... }          # compile (-Wall -Wextra)
  test:         { needs: build } # make test (unitaires)
  integration:  { needs: build } # contre une db jetable
  lint:         { needs: build } # cppcheck --error-exitcode=1
  image:        { needs: [test, lint] }   # docker build
  scan:         { needs: image } # trivy --exit-code 1 --severity CRITICAL
# Branch protection : tous ces checks doivent etre verts pour fusionner`,
      note: "Le pipeline enchaîne construire, tester, analyser, conteneuriser, scanner — automatiquement à chaque PR. La protection de branche transforme ces contrôles en conditions obligatoires de fusion : impossible d'intégrer du code non validé."
    },
    19: {
      titre: "déploiement automatisé",
      etat: "Pipeline vert. Automatisons le déploiement en staging puis en production, avec vérification de santé.",
      objectif: "Décris le déploiement : sur fusion en main → déployer en staging, healthcheck, puis promotion en production sur tag de version. Rappelle le healthcheck du conteneur.",
      hints: [
        "main → staging automatique ; tag vX.Y.Z → production.",
        "Healthcheck : le conteneur expose son état (ex. une commande de vérif).",
        "On ne promeut en prod que si le staging est sain."
      ],
      solution: `# docker-compose (healthcheck de l'app / db)
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      retries: 5

# ci.yml (deploiement)
  deploy-staging:  { if: github.ref == 'refs/heads/main' }   # auto
  deploy-prod:     { if: startsWith(github.ref,'refs/tags/v') } # sur tag
#   1) deployer  2) attendre healthy  3) promouvoir (sinon rollback)`,
      note: "Le staging reçoit chaque fusion en main ; la production n'est déployée que sur un tag de version validé. Le healthcheck conditionne la promotion : un service non sain déclenche un retour arrière au lieu d'exposer une panne."
    },
    20: {
      titre: "observabilité, sauvegardes, RGPD, rollback",
      etat: "Déploiement automatisé. Rendons le service observable, sauvegardé, conforme et réversible.",
      objectif: "Liste les garde-fous d'exploitation : logs structurés vers stdout/stderr, sauvegarde régulière de la base (mysqldump), minimisation RGPD des données personnelles, et procédure de rollback vers la version précédente.",
      hints: [
        "Logs vers la sortie standard (collectés par l'orchestrateur), sans secrets ni données perso.",
        "Sauvegarde : mysqldump planifié + test de restauration.",
        "Rollback : redéployer l'image précédente (tag antérieur)."
      ],
      solution: `# Observabilite : logs [INFO]/[ERREUR] vers stderr, jamais de secret/donnee perso
# Sauvegarde : mysqldump ludotheque > backup-$(date +%F).sql   (planifie, teste)
# RGPD : ne stocker que le necessaire ; permettre l'effacement d'un compte
#        (droit a l'oubli) ; ne jamais logguer d'email/mot de passe
# Rollback : docker compose pull ludotheque:vPRECEDENTE && up -d
#            (l'image de chaque version reste au registre)`,
      note: "Exploiter, c'est prévoir l'imprévu : voir ce qui se passe (logs), pouvoir restaurer (sauvegardes testées), respecter les personnes (RGPD, minimisation, droit à l'oubli) et revenir en arrière vite (rollback vers un tag antérieur)."
    },
    21: {
      titre: "le projet professionnel, de bout en bout",
      etat: "La Ludothèque pro est livrée : versionnée, testée, conteneurisée, scannée, déployée, sauvegardée.",
      objectif: "Récapitule le voyage d'une modification, du commit à la production : PR → CI (build, tests, lint, scan) → fusion → staging → tag → production → surveillance. Nomme le garde-fou de chaque étape.",
      hints: [
        "Chaque étape a un contrôle qui peut bloquer.",
        "Construire, industrialiser, sécuriser : d'un même geste.",
        "Rien n'atteint la prod sans être passé par tous les filtres."
      ],
      solution: `Cycle d'une modification :
  1. branche + commit            (Git)
  2. Pull Request                -> CI : build (-Wall), tests, integration,
                                        lint (cppcheck), sanitizer (ASan)
  3. build image + scan (Trivy)  -> pas de CVE critique
  4. protection de branche       -> tous les checks verts pour fusionner
  5. fusion en main              -> deploiement staging + healthcheck
  6. tag vX.Y.Z                  -> deploiement production
  7. observabilite + sauvegardes -> et rollback si besoin`,
      note: "Bravo : tu as livré une application C professionnelle, du dépôt vide à la production surveillée. Construire, industrialiser et sécuriser n'ont pas été trois phases mais un seul geste continu — c'est exactement ce qu'on attend en entreprise."
    }
  }
};
