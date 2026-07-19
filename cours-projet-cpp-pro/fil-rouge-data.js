/* ===== Fil rouge « La Ludothèque pro » — capstone outillé (C++ · Docker · CI/CD) =====
   Reconstruire la Ludothèque en C++ comme en entreprise : Git, conteneur et
   pipeline dès le premier commit. Construire, industrialiser et sécuriser
   d'un même geste — mêmes règles métier objet, mais versionnées, testées en CI,
   conteneurisées et durcies. */
var FIL = {
  prefix: "projcpppro21",
  app: "La Ludothèque pro",
  placeholder: "Écris ton code C++ / Dockerfile / YAML ici…",
  etapes: {
    1: {
      titre: "le dépôt et l'environnement conteneurisé",
      etat: "Feuille blanche, mais on connaît le domaine et l'outillage. On pose le dépôt et l'environnement conteneurisé avant tout code métier.",
      objectif: "Initialise le dépôt Git et écris un .gitignore adapté à un projet C++ (build/, binaires, secrets). Liste les fichiers d'amorçage : Dockerfile, docker-compose.yml, CMakeLists.txt, .env.example.",
      hints: [
        "git init ; premier commit avec la structure vide.",
        "Ignore build/, les binaires, .env (jamais les secrets).",
        "Prévois .env.example (sans valeurs réelles) pour documenter."
      ],
      solution: `# .gitignore
build/
ludotheque
.env            # secrets : JAMAIS versionnes
*.log

# fichiers d'amorcage versionnes :
#   Dockerfile, docker-compose.yml, CMakeLists.txt, .env.example,
#   .github/workflows/ci.yml, src/*.cpp include/*.hpp`,
      note: "On outille avant de coder : dépôt, ignore-list, squelette de conteneur et de CI. Le dossier build/ (jetable) et les secrets (.env) ne sont jamais versionnés ; .env.example documente les variables attendues."
    },
    2: {
      titre: "le squelette C++ dans Docker Compose",
      etat: "Le dépôt existe. Il faut un environnement reproductible : l'appli C++ et MySQL dans des conteneurs.",
      objectif: "Écris un docker-compose.yml avec deux services : `db` (image mysql) et `app` (build depuis le Dockerfile). L'app dépend de db ; les secrets viennent de l'environnement, pas du YAML.",
      hints: [
        "services: db et app ; app: build: . ; depends_on: [db].",
        "Les variables (MYSQL_*) via env_file: .env, pas en dur.",
        "Un volume pour persister les données MySQL."
      ],
      solution: `services:
  db:
    image: mysql:8
    env_file: .env               # secrets hors du YAML
    volumes: ["dbdata:/var/lib/mysql"]
  app:
    build: .                     # Dockerfile multi-stage (leçon 17)
    depends_on: [db]
    env_file: .env
volumes:
  dbdata:`,
      note: "« Ça marche chez moi » disparaît : compilateur, bibliothèques et MySQL sont figés dans des conteneurs. Les secrets passent par env_file, jamais écrits dans le docker-compose.yml versionné."
    },
    3: {
      titre: "Git, branches et première CI",
      etat: "L'environnement tourne. On installe le pipeline dès maintenant, pas à la fin.",
      objectif: "Écris un workflow GitHub Actions minimal (.github/workflows/ci.yml) qui, à chaque push, configure CMake et compile le projet. Adopte un flux par branches + pull request.",
      hints: [
        "on: [push, pull_request].",
        "Étapes : checkout, cmake -B build, cmake --build build.",
        "Travaille sur une branche, ouvre une PR, la CI valide."
      ],
      solution: `name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cmake -S . -B build
      - run: cmake --build build      # rouge tant que ca ne compile pas
# Flux : branche -> commit -> push -> PR (la CI doit etre verte pour merger)`,
      note: "Le pipeline existe dès la 3ᵉ étape : chaque push compile le projet. Un flux par branches + PR rend la CI utile — on ne fusionne que du vert."
    },
    4: {
      titre: "du MCD au schéma SQL, dans le conteneur",
      etat: "La chaîne build+CI est verte sur un squelette. On donne au projet sa base de données.",
      objectif: "Écris schema.sql (tables jeu, categorie, utilisateur, location, achat) et fais-le charger automatiquement par le conteneur MySQL au démarrage (script d'init monté).",
      hints: [
        "Reprends le MCD Merise : entités, clés, relations.",
        "Monte schema.sql dans /docker-entrypoint-initdb.d/ du service db.",
        "prix_unitaire figé dans achat ; deux stocks dans jeu."
      ],
      solution: `-- schema.sql (monte dans /docker-entrypoint-initdb.d/)
CREATE TABLE categorie ( id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(50) NOT NULL );
CREATE TABLE jeu ( id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL, categorie_id INT,
  prix_location DECIMAL(6,2), prix_achat DECIMAL(6,2),
  stock_location INT NOT NULL DEFAULT 0, stock_vente INT NOT NULL DEFAULT 0,
  FOREIGN KEY (categorie_id) REFERENCES categorie(id) );
-- utilisateur, location, achat : idem projet a la main`,
      note: "Le schéma est versionné et rejoué automatiquement dans le conteneur : la base est reproductible à l'identique pour tous. Le MCD Merise reste la source de conception."
    },
    5: {
      titre: "le modèle en classes et le DAO, testés dès l'écriture",
      etat: "La base est prête dans le conteneur. On code le modèle objet — mais avec un test qui l'accompagne.",
      objectif: "Écris la classe Jeu et un JeuRepository::mapper(res) qui construit un Jeu depuis un ResultSet. Ajoute aussitôt un test unitaire (GoogleTest) sur une petite fonction pure (ex. un getter/calcul), câblé dans la CI.",
      hints: [
        "Classe Jeu : champs privés, constructeur, getters const.",
        "mapper() lit les colonnes et renvoie un Jeu.",
        "Un TEST(...) minimal, ajouté au job CI dès maintenant."
      ],
      solution: `class Jeu {
    int id_; std::string nom_;
    double prixLocation_, prixAchat_;
    int stockLocation_, stockVente_;
public:
    Jeu(int id, std::string nom, double pl, double pa, int sl, int sv)
      : id_(id), nom_(std::move(nom)), prixLocation_(pl), prixAchat_(pa),
        stockLocation_(sl), stockVente_(sv) {}
    bool disponibleLocation() const { return stockLocation_ > 0; }
};
TEST(Jeu, Disponibilite) {
    Jeu j(1,"A",2,20,1,0);
    EXPECT_TRUE(j.disponibleLocation());
}`,
      note: "Le test naît avec le code, pas après : dès qu'une classe a une règle, un test la verrouille et tourne en CI. Écrire testable (méthodes pures) est un choix de conception."
    },
    6: {
      titre: "la couche service, sous CI",
      etat: "Modèle et DAO existent, testés. On ajoute les règles métier dans des services purs.",
      objectif: "Écris CatalogueService::tarif(const Jeu&, int jours) (remise -10 % dès 3 jours) et un test qui couvre avant/au/après le seuil. La CI exécute désormais les tests à chaque push.",
      hints: [
        "Méthode statique, pure (pas de SQL ni d'écran).",
        "Teste jours=2, 3 et 5.",
        "Ajoute `ctest` (ou l'exécutable de tests) au workflow CI."
      ],
      solution: `static double tarif(const Jeu& j, int jours) {
    double t = j.prixLocation() * jours;
    if (jours >= 3) t *= 0.9;
    return t;
}
TEST(CatalogueService, Remise) {
    Jeu j(1,"A",5,30,3,0);
    EXPECT_DOUBLE_EQ(tarif(j,2), 10.0);
    EXPECT_DOUBLE_EQ(tarif(j,3), 13.5);   // seuil
}
# CI : - run: ctest --test-dir build`,
      note: "Les règles vivent dans des services purs, donc testables sans base. La CI exécute les tests : une règle cassée fait rougir le pipeline immédiatement."
    },
    7: {
      titre: "requêtes préparées et tests au vert",
      etat: "Les services décident ; il faut lire/écrire en base sans faille.",
      objectif: "Écris JeuRepository::findById avec une requête préparée (setInt), enveloppée dans des unique_ptr. Garde le job de tests au vert dans la CI.",
      hints: [
        "prepareStatement(\"... WHERE id=?\") ; setInt(1, id).",
        "unique_ptr pour PreparedStatement et ResultSet (RAII).",
        "Jamais de concaténation de l'id dans le SQL."
      ],
      solution: `Jeu JeuRepository::findById(sql::Connection& con, int id) {
    std::unique_ptr<sql::PreparedStatement> p(con.prepareStatement(
        "SELECT id,nom,categorie_id,prix_location,prix_achat,"
        "stock_location,stock_vente FROM jeu WHERE id=?"));
    p->setInt(1, id);                        // valeur liee : anti-injection
    std::unique_ptr<sql::ResultSet> r(p->executeQuery());
    if (!r->next()) throw std::runtime_error("Jeu introuvable");
    return mapper(r.get());
}`,
      note: "Toute donnée externe est liée (setInt/setString) : l'injection SQL est structurellement impossible. Les unique_ptr garantissent la fermeture des ressources, même en cas d'exception."
    },
    8: {
      titre: "validation, exceptions et entrées sûres",
      etat: "Lectures/écritures sûres. On durcit les entrées et on structure les erreurs.",
      objectif: "Définis des exceptions métier (SaisieInvalide, StockInsuffisant, AccesRefuse dérivant de std::runtime_error) et une validerDuree(int) qui lance SaisieInvalide hors de [1,30]. Ajoute un test EXPECT_THROW.",
      hints: [
        "using std::runtime_error::runtime_error; pour hériter du constructeur.",
        "throw SaisieInvalide(\"...\") si hors bornes.",
        "EXPECT_THROW(validerDuree(0), SaisieInvalide)."
      ],
      solution: `class SaisieInvalide : public std::runtime_error {
    using std::runtime_error::runtime_error; };
class StockInsuffisant : public std::runtime_error {
    using std::runtime_error::runtime_error; };
void validerDuree(int j) {
    if (j < 1 || j > 30) throw SaisieInvalide("Duree 1..30");
}
TEST(Validation, Duree) {
    EXPECT_THROW(validerDuree(0), SaisieInvalide);
    EXPECT_NO_THROW(validerDuree(5));
}`,
      note: "Des exceptions typées rendent les erreurs claires et testables. On valide au plus tôt : une saisie absurde est rejetée avant tout accès à la base."
    },
    9: {
      titre: "utilisateurs, rôles et authentification durcie",
      etat: "Les erreurs sont structurées. On ajoute les comptes et une authentification sérieuse.",
      objectif: "Modélise enum class Role et une classe Utilisateur. Écris AuthService::login renvoyant std::optional<Utilisateur> : hash comparé (jamais de mot de passe en clair), message neutre en cas d'échec.",
      hints: [
        "enum class Role { Client, Vendeur, Admin };",
        "Requête préparée sur le login ; compare des hash.",
        "std::nullopt pour login inconnu ET mot de passe faux."
      ],
      solution: `std::optional<Utilisateur> AuthService::login(
        sql::Connection& con, const std::string& login, const std::string& mdp) {
    std::unique_ptr<sql::PreparedStatement> p(con.prepareStatement(
        "SELECT id,mot_de_passe_hash,role FROM utilisateur WHERE login=?"));
    p->setString(1, login);
    std::unique_ptr<sql::ResultSet> r(p->executeQuery());
    if (!r->next()) return std::nullopt;                       // login inconnu
    if (!verifierMotDePasse(mdp, r->getString("mot_de_passe_hash")))
        return std::nullopt;                                   // meme resultat
    return Utilisateur(r->getInt("id"), login,
                       static_cast<Role>(r->getInt("role")));
}`,
      note: "Mot de passe haché (argon2/bcrypt via libsodium), comparaison d'empreintes, résultat neutre : on ne révèle jamais quels comptes existent. std::optional exprime « utilisateur ou rien » sans exception."
    },
    10: {
      titre: "autorisation par rôle et par ressource (anti-IDOR)",
      etat: "L'authentification fonctionne. Il faut contrôler les droits — y compris l'accès aux ressources d'autrui.",
      objectif: "Écris LocationService::mesLocations(const Utilisateur&, con) qui ne renvoie que les locations de l'utilisateur courant (WHERE utilisateur_id = ?), empêchant un client de lire celles d'un autre (IDOR).",
      hints: [
        "Ne prends jamais l'id cible depuis la saisie : utilise u.id().",
        "WHERE utilisateur_id = ? lié à u.id().",
        "Un admin peut voir tout ; un client, seulement les siennes."
      ],
      solution: `std::vector<Location> LocationService::mesLocations(
        const Utilisateur& u, sql::Connection& con) {
    std::unique_ptr<sql::PreparedStatement> p(con.prepareStatement(
        "SELECT * FROM location WHERE utilisateur_id = ?"));
    p->setInt(1, u.id());          // l'id vient de la SESSION, pas de la saisie
    std::unique_ptr<sql::ResultSet> r(p->executeQuery());
    return mapperLocations(r.get());
}`,
      note: "IDOR : laisser un utilisateur passer un id arbitraire pour lire les données d'autrui. La parade : filtrer sur l'identité de session (u.id()), jamais sur un id fourni par le client."
    },
    11: {
      titre: "louer : transaction et test d'intégration",
      etat: "Les droits sont maîtrisés. On code la location atomique et on la teste contre une vraie base.",
      objectif: "Écris LocationService::louer avec un TransactionGuard (RAII) : insérer la location + décrémenter le stock, tout ou rien. Ajoute un test d'intégration (contre le MySQL du conteneur) vérifiant que le stock baisse de 1.",
      hints: [
        "TransactionGuard ouvre setAutoCommit(false), commit(), rollback au destructeur.",
        "Valide la durée et le stock AVANT d'ouvrir la transaction.",
        "Le test tourne dans la CI avec un service MySQL éphémère."
      ],
      solution: `void LocationService::louer(sql::Connection& con, int uid, int jeuId, int jours) {
    validerDuree(jours);
    Jeu j = JeuRepository::findById(con, jeuId);
    if (!CatalogueService::peutLouer(j)) throw StockInsuffisant("Plus de stock");
    TransactionGuard tx(con);                         // RAII
    LocationRepository::inserer(con, uid, jeuId, jours);
    JeuRepository::decrementerStockLocation(con, jeuId);
    tx.commit();
}
# CI : job avec services: mysql: pour les tests d'integration`,
      note: "Le TransactionGuard garantit l'atomicité et le rollback automatique en cas d'exception. Le test d'intégration s'exécute en CI contre un MySQL jetable : on vérifie le comportement réel, pas seulement la logique pure."
    },
    12: {
      titre: "acheter : prix figé et couverture",
      etat: "La location est atomique et testée. On ajoute l'achat, avec la même rigueur.",
      objectif: "Écris AchatService::acheter : fige le prix courant, insère l'achat (prix copié) et décrémente stock_vente sous transaction. Mesure la couverture de tests et vise les branches clés (stock insuffisant, quantité invalide).",
      hints: [
        "double prix = j.prixAchat(); AVANT d'écrire.",
        "Teste : quantité 0 → SaisieInvalide ; stock < q → StockInsuffisant.",
        "Active gcov/lcov ou --coverage pour voir les branches couvertes."
      ],
      solution: `void AchatService::acheter(sql::Connection& con, int uid, int jeuId, int q) {
    if (q <= 0) throw SaisieInvalide("Quantite invalide");
    Jeu j = JeuRepository::findById(con, jeuId);
    if (j.stockVente() < q) throw StockInsuffisant("Stock insuffisant");
    double prix = j.prixAchat();                      // prix FIGE
    TransactionGuard tx(con);
    AchatRepository::inserer(con, uid, jeuId, q, prix);
    JeuRepository::decrementerStockVente(con, jeuId, q);
    tx.commit();
}`,
      note: "Le prix est figé pour un historique durable. La couverture guide les tests : on cible les branches de refus (quantité, stock), pas seulement le chemin heureux."
    },
    13: {
      titre: "l'interface et les entrées sûres",
      etat: "Le métier est complet et testé. On expose une UI qui ne fait jamais confiance aux saisies.",
      objectif: "Écris une lecture d'entier robuste (nettoyage de std::cin) et une boucle de menu entourée d'un try/catch. Note comment le C++ (std::string, types) évite les débordements de tampon du C.",
      hints: [
        "En cas d'échec : std::cin.clear(); ignore(...); redemande.",
        "try/catch(const std::exception&) autour des appels de service.",
        "std::string gère sa taille : pas de buffer overflow comme en C."
      ],
      solution: `int lireEntier(const std::string& invite) {
    while (true) {
        std::cout << invite; int x;
        if (std::cin >> x) return x;
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\\n');
        std::cout << "Entrez un nombre.\\n";
    }
}
// menu : try { ... } catch (const std::exception& e) { afficher(e.what()); }`,
      note: "std::string et les flux typés éliminent les débordements de tampon qui hantent le C. On valide néanmoins chaque saisie : l'UI est la frontière, on n'y fait jamais confiance."
    },
    14: {
      titre: "secrets et configuration par environnement",
      etat: "L'UI est sûre. On sort tout secret et toute config du code.",
      objectif: "Écris chargerConfig() (hôte, port, base, utilisateur depuis l'environnement) et lireSecret(nomVar) qui lance si le secret manque. Rien de sensible dans le code ni dans les logs.",
      hints: [
        "std::getenv pour chaque variable.",
        "Lance std::runtime_error si un secret est absent (pas de défaut).",
        "Le message d'erreur nomme la variable, jamais sa valeur."
      ],
      solution: `std::string lireSecret(const std::string& nomVar) {
    const char* v = std::getenv(nomVar.c_str());
    if (!v) throw std::runtime_error("Variable manquante : " + nomVar);
    return std::string(v);         // jamais journalisee
}
// connexion : connect(cfg.hote, cfg.utilisateur, lireSecret("LUDO_DB_PASSWORD"));`,
      note: "Les secrets viennent de l'environnement (fourni par Docker Compose / le déploiement), jamais du dépôt. On échoue clairement si un secret manque, et on ne le journalise jamais."
    },
    15: {
      titre: "recherche, pagination et qualité",
      etat: "Config et secrets sont propres. On ajoute la recherche paginée et on branche les outils qualité.",
      objectif: "Écris rechercher(motCle, page, taille) (LIKE + LIMIT/OFFSET, valeurs liées) et ajoute au pipeline un linter (clang-tidy/cppcheck) et les sanitizers (-fsanitize=address,undefined) sur le job de tests.",
      hints: [
        "setString(1, \"%\"+motCle+\"%\") ; LIMIT ? OFFSET ?.",
        "ORDER BY stable avant de paginer.",
        "CI : un job lint + un job tests compilé avec -fsanitize=address,undefined."
      ],
      solution: `"SELECT * FROM jeu WHERE nom LIKE ? ORDER BY nom LIMIT ? OFFSET ?"
p->setString(1, "%" + motCle + "%");
p->setInt(2, taille);
p->setInt(3, (page - 1) * taille);
# CI :
#   - run: clang-tidy src/*.cpp
#   - run: cmake -B build -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined"
#   - run: ctest --test-dir build`,
      note: "Le motif de recherche est une valeur liée (anti-injection) ; la pagination limite la charge. Linter et sanitizers tournent en CI : les bugs mémoire et comportements indéfinis sont attrapés automatiquement."
    },
    16: {
      titre: "les espaces client, vendeur et administrateur",
      etat: "Le cœur est complet, testé et outillé. On route les trois profils.",
      objectif: "Écris lancerEspace(con, u) qui aiguille vers espaceClient/Vendeur/Admin selon u.role(). Rappelle que le menu est de l'ergonomie : chaque service revérifie les droits.",
      hints: [
        "switch (u.role()) { case Role::Client: ... }",
        "Les espaces appellent les mêmes services (pas de règle dupliquée).",
        "Le service lance AccesRefuse si le rôle est insuffisant."
      ],
      solution: `void lancerEspace(sql::Connection& con, const Utilisateur& u) {
    switch (u.role()) {
        case Role::Client:  espaceClient(con, u);  break;
        case Role::Vendeur: espaceVendeur(con, u); break;
        case Role::Admin:   espaceAdmin(con, u);   break;
    }
}
// chaque service sensible : if (!peutGererStock(u)) throw AccesRefuse(...);`,
      note: "Menu par rôle = confort ; contrôle dans le service = sécurité (défense en profondeur). Les trois espaces partagent les mêmes services : aucune règle n'est réécrite."
    },
    17: {
      titre: "l'image de production : multi-stage, non-root, scan",
      etat: "L'application est complète. On fabrique une image de production minimale et durcie.",
      objectif: "Écris un Dockerfile multi-stage : une étape build (compile en release avec CMake) et une étape runtime minimale qui ne contient que le binaire et tourne en utilisateur non-root. Scanne l'image (Trivy) en CI.",
      hints: [
        "Étape 1 : image avec g++/cmake, compile ludotheque.",
        "Étape 2 : image slim, COPY --from=build du seul binaire.",
        "USER non-root ; job CI : trivy image ..."
      ],
      solution: `# --- build ---
FROM debian:stable AS build
RUN apt-get update && apt-get install -y g++ cmake libmysqlcppconn-dev
COPY . /src
RUN cmake -S /src -B /build -DCMAKE_BUILD_TYPE=Release && cmake --build /build
# --- runtime (minimal, non-root) ---
FROM debian:stable-slim
RUN useradd -m app
COPY --from=build /build/ludotheque /usr/local/bin/ludotheque
USER app                         # jamais root
ENTRYPOINT ["ludotheque"]
# CI : - run: trivy image ludotheque:latest`,
      note: "Le multi-stage jette la chaîne de compilation : l'image finale ne contient que le binaire, réduisant taille et surface d'attaque. Tourner non-root et scanner l'image (Trivy) durcit la production."
    },
    18: {
      titre: "le pipeline complet : build, test, scan, protection",
      etat: "L'image durcie existe. On assemble le pipeline complet et on protège la branche principale.",
      objectif: "Étends le workflow : jobs build → tests (+ intégration) → lint/sanitizers → scan d'image, chaînés. Protège `main` : merge interdit si un job échoue.",
      hints: [
        "needs: pour chaîner les jobs.",
        "Un échec de n'importe quel job bloque le merge.",
        "Règle de protection de branche : CI verte obligatoire + review."
      ],
      solution: `jobs:
  build:  { runs-on: ubuntu-latest, steps: [ ...cmake build... ] }
  test:   { needs: build, steps: [ ...ctest (unit + integration)... ] }
  quality:{ needs: build, steps: [ ...clang-tidy, sanitizers... ] }
  scan:   { needs: test,  steps: [ ...trivy image... ] }
# Protection de 'main' : status checks requis (build,test,quality,scan) + 1 review`,
      note: "Le pipeline enchaîne compilation, tests, qualité et scan : rien n'atteint main sans tout passer. La protection de branche transforme la CI en garde-fou, pas en simple indicateur."
    },
    19: {
      titre: "déploiement automatisé : staging, production, santé",
      etat: "Le pipeline garde la qualité. On automatise la mise en service.",
      objectif: "Ajoute un job de déploiement (sur tag/release) : pousse l'image, déploie en staging, vérifie un endpoint/log de santé, puis promeut en production. Prévois un rollback si la santé échoue.",
      hints: [
        "on: release (ou push d'un tag vX.Y.Z).",
        "Déploie d'abord en staging, teste la santé, puis production.",
        "Si la vérification échoue, redéploie la version précédente."
      ],
      solution: `deploy:
  needs: [test, quality, scan]
  if: startsWith(github.ref, 'refs/tags/v')
  steps:
    - run: docker push registry/ludotheque:\${{ github.ref_name }}
    - run: deploy staging && healthcheck staging   # verifie la sante
    - run: deploy production && healthcheck production
    - run: |                                        # rollback si echec
        if ! healthcheck production; then deploy previous; fi`,
      note: "Le déploiement suit staging → vérification de santé → production, déclenché par un tag de version. Un contrôle de santé raté déclenche le rollback : livrer souvent et sûrement, sans intervention manuelle risquée."
    },
    20: {
      titre: "observabilité, sauvegardes, RGPD et rollback",
      etat: "Le déploiement est automatisé. On rend le système observable, sauvegardé et conforme.",
      objectif: "Mets en place : logs structurés (niveaux, sans données sensibles), métriques/santé, une sauvegarde régulière de la base, une politique de rétention/minimisation RGPD, et une procédure de rollback documentée.",
      hints: [
        "Logs JSON par niveau ; jamais de secret ni de donnée perso inutile.",
        "Sauvegarde planifiée (mysqldump) + test de restauration.",
        "RGPD : minimiser, chiffrer, prévoir suppression sur demande."
      ],
      solution: `# Observabilite : logs structures + endpoint /health + metriques
# Sauvegardes : cron mysqldump -> stockage chiffre + test de RESTAURATION
# RGPD :
#   - minimisation : ne stocker que le necessaire
#   - droit a l'effacement : DELETE / anonymisation sur demande
#   - chiffrement au repos et en transit ; retention limitee
# Rollback : image precedente redeployable en une commande, procedure ecrite`,
      note: "Une sauvegarde non testée n'existe pas : on vérifie la restauration. Observabilité, conformité RGPD (minimisation, effacement, chiffrement) et rollback documenté font la différence entre « ça tourne » et « c'est exploitable en production »."
    },
    21: {
      titre: "récapitulatif : le projet professionnel de bout en bout",
      etat: "Tout est en place : code objet, tests, conteneurs, pipeline, déploiement, observabilité.",
      objectif: "Rédige la synthèse : relie chaque garantie (versionnement, CI, requêtes préparées, hash, autorisation anti-IDOR, transactions, RAII, image durcie non-root, déploiement + rollback, sauvegardes, RGPD) à ce qu'elle protège.",
      hints: [
        "Suis le trajet d'un commit jusqu'à la production.",
        "Une ligne = une garantie et son rôle.",
        "Distingue construire / industrialiser / sécuriser."
      ],
      solution: `// LA LUDOTHEQUE PRO C++ — de bout en bout
// Construire  : couches objet, requetes preparees, transactions, RAII/smart pointers.
// Tester      : unitaires (services purs) + integration (MySQL en CI), couverture.
// Industrialiser : Git + PR, CI (build/test/lint/sanitizers/scan), image multi-stage
//                  non-root, deploiement automatise staging->prod avec healthcheck.
// Securiser   : hash (jamais de clair), autorisation par role + anti-IDOR,
//               secrets par environnement, logs sans donnee sensible.
// Exploiter   : observabilite, sauvegardes testees, RGPD, rollback documente.
// Resultat : la meme Ludotheque, mais livrable, sure et maintenable.`,
      note: "Le « pro » n'ajoute pas de fonctionnalités : il ajoute les garanties qui rendent le logiciel livrable et durable. Du commit à la production surveillée, chaque étape est outillée, testée et sécurisée. Félicitations — tu sais industrialiser une application C++ ! 🎉"
    }
  }
};
