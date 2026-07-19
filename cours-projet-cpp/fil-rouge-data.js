/* ===== Fil rouge « La Ludothèque » — capstone full-stack (C++ · SQL · MySQL) =====
   Le grand assemblage : construire l'application COMPLETE en reunissant le
   langage (C++), la conception (Merise/SQL) et la base (MySQL via Connector/C++).
   Architecture objet en couches (UI -> services -> depot -> MySQL), classes du
   domaine, RAII et smart pointers, requetes preparees, transactions. */
var FIL = {
  prefix: "projcpp21",
  app: "La Ludothèque",
  placeholder: "Écris ton code C++ / SQL ici…",
  etapes: {
    1: {
      titre: "l'architecture en couches",
      etat: "Feuille blanche, mais le domaine est connu (la Ludothèque). Avant de coder, on pose l'organisation objet en couches.",
      objectif: "Décris l'architecture en couches du projet C++ : interface (UI) → services (métier) → dépôt/DAO (accès MySQL) → base. Donne le rôle de chaque couche et les classes/fichiers correspondants.",
      hints: [
        "L'UI lit/affiche ; les services décident ; le dépôt parle à MySQL.",
        "Chaque classe : un .h (déclaration) + un .cpp (définition).",
        "Sépare : main.cpp, Ui, CatalogueService, JeuRepository, modèle (Jeu…)."
      ],
      solution: `main.cpp                point d'entree, boucle de menu
Ui / Ui.cpp             affichage et saisies (aucune regle metier)
CatalogueService.*      logique metier : louer, acheter, controle des stocks
JeuRepository.*         acces MySQL (Connector/C++) : SELECT/INSERT/UPDATE
modele/ (Jeu, Utilisateur, Location)  les classes du domaine
Db.*                    connexion MySQL partagee (RAII)
CMakeLists.txt          compile et lie le connecteur`,
      note: "Comme dans les autres piles : la regle metier vit dans les services, jamais dans l'UI ni le depot. En C++, chaque module est une classe (.h/.cpp), et le RAII gere la duree de vie des ressources."
    },
    2: {
      titre: "se connecter a MySQL",
      etat: "L'architecture est posee. Etablissons la connexion via MySQL Connector/C++.",
      objectif: "Écris une fonction db_connect() qui ouvre une connexion MySQL avec le driver Connector/C++ et renvoie un std::unique_ptr<sql::Connection>. Sélectionne la base « ludotheque ».",
      hints: [
        "#include <mysql_driver.h>, <mysql_connection.h>, <cppconn/statement.h>.",
        "auto* driver = sql::mysql::get_mysql_driver_instance();",
        "std::unique_ptr<sql::Connection> con(driver->connect(host, user, pass)); con->setSchema(\"ludotheque\");"
      ],
      solution: `#include <mysql_driver.h>
#include <mysql_connection.h>
#include <memory>

std::unique_ptr<sql::Connection> db_connect() {
    sql::mysql::MySQL_Driver* driver = sql::mysql::get_mysql_driver_instance();
    std::unique_ptr<sql::Connection> con(
        driver->connect("tcp://127.0.0.1:3306", "ludo", "secret"));
    con->setSchema("ludotheque");
    return con;   // le unique_ptr transfere la propriete (RAII : ferme tout seul)
}`,
      note: "Le Connector/C++ expose des objets (Connection, PreparedStatement, ResultSet). En les tenant dans des std::unique_ptr, on obtient la fermeture automatique (RAII) : pas de close() a oublier, contrairement au C."
    },
    3: {
      titre: "du MCD au schema SQL",
      etat: "La connexion fonctionne. Traduisons le MCD Merise en tables SQL.",
      objectif: "Écris le SQL de création des tables jeu (id, nom, prix_achat, prix_location, stock_vente, stock_location, categorie_id) et categorie (id, nom), avec la clé étrangère.",
      hints: [
        "INT AUTO_INCREMENT PRIMARY KEY, VARCHAR, DECIMAL(6,2).",
        "Deux stocks : stock_vente et stock_location.",
        "FOREIGN KEY (categorie_id) REFERENCES categorie(id)."
      ],
      solution: `CREATE TABLE categorie (
  id  INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(50) NOT NULL
);

CREATE TABLE jeu (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nom            VARCHAR(100) NOT NULL,
  prix_achat     DECIMAL(6,2) NOT NULL,
  prix_location  DECIMAL(6,2) NOT NULL,
  stock_vente    INT NOT NULL DEFAULT 0,
  stock_location INT NOT NULL DEFAULT 0,
  categorie_id   INT,
  FOREIGN KEY (categorie_id) REFERENCES categorie(id)
);`,
      note: "DECIMAL(6,2) pour l'argent (jamais FLOAT en base). Les deux stocks viennent du MCD : vente et location sont independants. Ce schema est identique a la version C — la difference sera dans le code C++ qui l'exploite."
    },
    4: {
      titre: "le modele en classes",
      etat: "Le schema existe. Miroitons-le cote C++ avec des classes du domaine.",
      objectif: "Définis une classe Jeu (encapsulée) reflétant la table : membres privés (id, nom, prix, stocks), constructeur et getters const. Une ligne de la base = un objet Jeu.",
      hints: [
        "class Jeu { std::string nom_; double prixLocation_; int stockLocation_; ... };",
        "Constructeur avec liste d'initialisation ; getters const.",
        "estDisponibleLocation() const { return stockLocation_ > 0; }"
      ],
      solution: `#include <string>

class Jeu {
    int id_;
    std::string nom_;
    double prixAchat_, prixLocation_;
    int stockVente_, stockLocation_;
public:
    Jeu(int id, std::string nom, double pa, double pl, int sv, int sl)
        : id_(id), nom_(nom), prixAchat_(pa), prixLocation_(pl),
          stockVente_(sv), stockLocation_(sl) {}
    int id() const { return id_; }
    const std::string& nom() const { return nom_; }
    double prixLocation() const { return prixLocation_; }
    int stockLocation() const { return stockLocation_; }
    bool estDisponibleLocation() const { return stockLocation_ > 0; }
};`,
      note: "La classe encapsule l'etat (membres prives) et n'expose que des methodes const. Un objet Jeu naît toujours valide (constructeur). C'est le pont entre la ligne SQL et le code — comme la struct en C, mais avec encapsulation."
    },
    5: {
      titre: "lire le catalogue (depot)",
      etat: "Modele pret. Lisons les jeux depuis MySQL et construisons des objets Jeu.",
      objectif: "Écris JeuRepository::findAll(con) qui exécute un SELECT et renvoie un std::vector<Jeu> construit depuis le ResultSet (res->next(), res->getInt/getString/getDouble).",
      hints: [
        "std::unique_ptr<sql::Statement> stmt(con->createStatement());",
        "std::unique_ptr<sql::ResultSet> res(stmt->executeQuery(\"SELECT ...\"));",
        "while (res->next()) jeux.emplace_back(res->getInt(\"id\"), res->getString(\"nom\"), ...);"
      ],
      solution: `#include <cppconn/statement.h>
#include <cppconn/resultset.h>
#include <vector>

std::vector<Jeu> JeuRepository::findAll(sql::Connection& con) {
    std::vector<Jeu> jeux;
    std::unique_ptr<sql::Statement> stmt(con.createStatement());
    std::unique_ptr<sql::ResultSet> res(
        stmt->executeQuery("SELECT id,nom,prix_achat,prix_location,"
                           "stock_vente,stock_location FROM jeu"));
    while (res->next()) {
        jeux.emplace_back(
            res->getInt("id"), res->getString("nom"),
            res->getDouble("prix_achat"), res->getDouble("prix_location"),
            res->getInt("stock_vente"), res->getInt("stock_location"));
    }
    return jeux;   // RVO : pas de copie inutile
}`,
      note: "Le depot mappe chaque ligne (ResultSet) en objet Jeu, poussé dans un std::vector. unique_ptr ferme le Statement et le ResultSet automatiquement. emplace_back construit le Jeu directement dans le vector. Le service ne voit jamais de SQL."
    },
    6: {
      titre: "ecrire sans se faire injecter",
      etat: "On lit le catalogue. Pour ajouter un jeu depuis une saisie, protégeons-nous de l'injection.",
      objectif: "Écris un INSERT avec un PreparedStatement (Connector/C++) : liaison des paramètres nom (setString) et prix (setDouble). Explique pourquoi c'est plus sûr que concaténer.",
      hints: [
        "con->prepareStatement(\"INSERT INTO jeu(nom,prix_location,prix_achat) VALUES(?,?,0)\").",
        "pstmt->setString(1, nom); pstmt->setDouble(2, prix); pstmt->executeUpdate();",
        "Le ? sépare le code SQL des données : impossible d'injecter."
      ],
      solution: `#include <cppconn/prepared_statement.h>

void JeuRepository::ajouter(sql::Connection& con,
                            const std::string& nom, double prix) {
    std::unique_ptr<sql::PreparedStatement> pstmt(
        con.prepareStatement(
            "INSERT INTO jeu(nom,prix_location,prix_achat) VALUES(?,?,0)"));
    pstmt->setString(1, nom);     // parametre lie (indices a partir de 1)
    pstmt->setDouble(2, prix);
    pstmt->executeUpdate();       // INSERT/UPDATE : executeUpdate
}`,
      note: "Le PreparedStatement lie les valeurs par des ? : une saisie ne peut jamais etre interpretee comme du SQL. C'est LA parade a l'injection, comme les requetes preparees en C — mais ici en objets, avec fermeture automatique."
    },
    7: {
      titre: "la couche service : une regle",
      etat: "Le depot sait lire et ecrire. Placons la premiere regle metier dans les services.",
      objectif: "Écris CatalogueService::peutLouer(const Jeu&) (renvoie true si stock de location > 0) et tarif(const Jeu&, int jours) (-10 % dès 3 jours). Fonctions pures, sans SQL ni écran.",
      hints: [
        "bool peutLouer(const Jeu& j) { return j.estDisponibleLocation(); }",
        "double tarif(const Jeu& j, int jours) { double t = j.prixLocation()*jours; if (jours>=3) t*=0.9; return t; }",
        "La regle « stock nul → refus » vit UNE seule fois, ici."
      ],
      solution: `class CatalogueService {
public:
    static bool peutLouer(const Jeu& j) {
        return j.estDisponibleLocation();      // regle metier, definie UNE fois
    }
    static double tarif(const Jeu& j, int jours) {
        double t = j.prixLocation() * jours;
        if (jours >= 3) t *= 0.9;              // -10 % des 3 jours
        return t;
    }
};`,
      note: "Les services ne connaissent ni l'ecran ni la base : ils decident. Ces methodes pures (const Jeu&) se testent sans MySQL et sont reutilisables (UI, API, tests). La regle est centralisee, pas dupliquee."
    },
    8: {
      titre: "valider et signaler les erreurs",
      etat: "Le metier grandit. Uniformisons la validation et la remontee d'erreurs — en C++, avec des exceptions.",
      objectif: "Définis des exceptions métier (ex. StockInsuffisant, SaisieInvalide dérivant de std::runtime_error) et une fonction qui valide une durée (1 à 30 jours) en lançant l'exception adaptée.",
      hints: [
        "class SaisieInvalide : public std::runtime_error { using std::runtime_error::runtime_error; };",
        "void validerDuree(int j) { if (j<1||j>30) throw SaisieInvalide(\"duree 1..30\"); }",
        "L'appelant attrape avec try/catch (const std::exception& e)."
      ],
      solution: `#include <stdexcept>

class SaisieInvalide  : public std::runtime_error {
    using std::runtime_error::runtime_error;
};
class StockInsuffisant : public std::runtime_error {
    using std::runtime_error::runtime_error;
};

void validerDuree(int jours) {
    if (jours < 1 || jours > 30)
        throw SaisieInvalide("La duree doit etre entre 1 et 30 jours");
}`,
      note: "En C++, on signale les erreurs metier par des EXCEPTIONS typees (derivant de std::exception). Elles separent le chemin normal du chemin d'erreur, et le RAII garantit qu'aucune ressource ne fuit quand une exception remonte."
    },
    9: {
      titre: "utilisateurs et roles",
      etat: "Le catalogue tourne. Introduisons les comptes et les trois roles.",
      objectif: "Ajoute la table utilisateur (id, login, mot_de_passe_hash, role) et une enum class Role { Client, Vendeur, Admin } côté C++, avec la classe Utilisateur.",
      hints: [
        "role : un TINYINT en base (0/1/2).",
        "enum class Role { Client = 0, Vendeur = 1, Admin = 2 };  (typée, plus sûre qu'un enum simple).",
        "class Utilisateur { int id_; std::string login_; Role role_; ... };"
      ],
      solution: `-- SQL
CREATE TABLE utilisateur (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  login             VARCHAR(50) UNIQUE NOT NULL,
  mot_de_passe_hash VARCHAR(255) NOT NULL,
  role              TINYINT NOT NULL DEFAULT 0
);

// C++
enum class Role { Client = 0, Vendeur = 1, Admin = 2 };

class Utilisateur {
    int id_;
    std::string login_;
    Role role_;
public:
    Utilisateur(int id, std::string login, Role r)
        : id_(id), login_(login), role_(r) {}
    int id() const { return id_; }
    Role role() const { return role_; }
};`,
      note: "enum class (enumeration fortement typee) est preferable a l'enum du C : Role::Admin ne se convertit pas silencieusement en int et n'entre pas en collision de noms. Le mot de passe n'est jamais stocke en clair, seulement son hash."
    },
    10: {
      titre: "authentifier un utilisateur",
      etat: "Les comptes existent. Ecrivons la connexion : verifier login + mot de passe.",
      objectif: "Écris AuthService::login(con, login, mdp) qui récupère le hash par requête préparée, compare le hash du mot de passe saisi, et renvoie un std::optional<Utilisateur> (vide si échec).",
      hints: [
        "Requête préparée : SELECT ... WHERE login = ? (setString).",
        "std::optional<Utilisateur> : vide en cas d'échec (message neutre).",
        "On compare des hash, jamais des mots de passe en clair."
      ],
      solution: `#include <optional>

std::optional<Utilisateur> AuthService::login(
        sql::Connection& con, const std::string& login, const std::string& mdp) {
    std::unique_ptr<sql::PreparedStatement> pstmt(
        con.prepareStatement(
            "SELECT id, mot_de_passe_hash, role FROM utilisateur WHERE login=?"));
    pstmt->setString(1, login);
    std::unique_ptr<sql::ResultSet> res(pstmt->executeQuery());
    if (!res->next())
        return std::nullopt;                 // login inconnu (message neutre)
    if (!verifierMotDePasse(mdp, res->getString("mot_de_passe_hash")))
        return std::nullopt;                 // mauvais mot de passe (meme message)
    return Utilisateur(res->getInt("id"), login,
                       static_cast<Role>(res->getInt("role")));
}`,
      note: "std::optional exprime elegamment « un utilisateur ou rien » : vide en cas d'echec, sans code d'erreur ni pointeur nul. On compare des hash (jamais le mdp en clair), avec un message neutre pour ne pas renseigner un attaquant."
    },
    11: {
      titre: "autoriser selon le role",
      etat: "On sait qui est connecte. Controlons ce que chaque role peut faire.",
      objectif: "Écris des fonctions d'autorisation (peutGererStock, peutAdministrer) basées sur Role, et montre un service qui refuse (lance une exception ou renvoie une erreur) si le rôle est insuffisant.",
      hints: [
        "bool peutGererStock(const Utilisateur& u) { return u.role() == Role::Vendeur || u.role() == Role::Admin; }",
        "Le client ne gère pas le stock ; vendeur et admin oui.",
        "Le service vérifie AVANT toute action et lance AccesRefuse sinon."
      ],
      solution: `class AccesRefuse : public std::runtime_error {
    using std::runtime_error::runtime_error;
};

bool peutGererStock(const Utilisateur& u) {
    return u.role() == Role::Vendeur || u.role() == Role::Admin;
}
bool peutAdministrer(const Utilisateur& u) {
    return u.role() == Role::Admin;
}

void StockService::reapprovisionner(const Utilisateur& u, sql::Connection& con,
                                    int jeuId, int n) {
    if (!peutGererStock(u))
        throw AccesRefuse("Reservation reservee au vendeur/admin");   // refuse d'abord
    // ... deleguer au depot ...
}`,
      note: "L'autorisation se verifie dans les services, a chaque operation sensible, AVANT d'agir. On centralise les regles d'acces (peutGererStock…) pour ne pas les disperser. Le refus passe par une exception typee (AccesRefuse)."
    },
    12: {
      titre: "louer un jeu (transaction)",
      etat: "Coeur du metier : louer doit decrementer le stock ET creer la location, tout ou rien.",
      objectif: "Écris LocationService::louer qui, dans une TRANSACTION (con.setAutoCommit(false), commit/rollback), vérifie le stock, insère la location et décrémente stock_location. Le RAII/catch garantit le rollback en cas d'erreur.",
      hints: [
        "con.setAutoCommit(false); ... con.commit(); (ou con.rollback() en cas d'exception).",
        "Vérifie le stock avant ; décrémente après l'insertion.",
        "Un try/catch autour : en cas d'exception, rollback puis relancer."
      ],
      solution: `void LocationService::louer(sql::Connection& con, int userId,
                            int jeuId, int jours) {
    validerDuree(jours);
    con.setAutoCommit(false);
    try {
        Jeu j = JeuRepository::findById(con, jeuId);
        if (!CatalogueService::peutLouer(j))
            throw StockInsuffisant("Plus de stock de location");
        LocationRepository::inserer(con, userId, jeuId, jours);
        JeuRepository::decrementerStockLocation(con, jeuId);
        con.commit();                      // tout a reussi
    } catch (...) {
        con.rollback();                    // une erreur : tout annuler
        con.setAutoCommit(true);
        throw;                             // relancer pour l'appelant
    }
    con.setAutoCommit(true);
}`,
      note: "La transaction garantit l'atomicite : impossible de retirer du stock sans enregistrer la location. Le try/catch fait le rollback sur toute exception puis relance : c'est le pendant C++ du START TRANSACTION/ROLLBACK, integre aux exceptions."
    },
    13: {
      titre: "acheter un jeu (prix fige)",
      etat: "La location marche. L'achat suit la meme logique, sur le stock de vente.",
      objectif: "Écris AchatService::acheter : transaction, contrôle de stock_vente, insertion d'une vente au prix figé (le prix_achat du moment), décrément du stock.",
      hints: [
        "On enregistre le prix_achat au moment de la vente (il pourrait changer après).",
        "Même schéma transactionnel que louer.",
        "stock_vente au lieu de stock_location."
      ],
      solution: `void AchatService::acheter(sql::Connection& con, int userId, int jeuId) {
    con.setAutoCommit(false);
    try {
        Jeu j = JeuRepository::findById(con, jeuId);
        if (j.stockVente() <= 0)
            throw StockInsuffisant("Rupture de stock (vente)");
        VenteRepository::inserer(con, userId, jeuId, j.prixAchat());  // prix FIGE
        JeuRepository::decrementerStockVente(con, jeuId);
        con.commit();
    } catch (...) {
        con.rollback();
        con.setAutoCommit(true);
        throw;
    }
    con.setAutoCommit(true);
}`,
      note: "On fige le prix paye dans la ligne de vente (j.prixAchat() au moment de l'achat) : si le tarif change demain, l'historique reste exact. Deux stocks separes = deux operations, meme schema transactionnel."
    },
    14: {
      titre: "l'interface console",
      etat: "Le metier est solide. Donnons-lui une interface : un menu qui appelle les services.",
      objectif: "Écris une boucle de menu (do-while) qui propose catalogue / louer / acheter / quitter, délègue chaque action au service, et affiche les erreurs via try/catch (e.what()). L'UI n'applique aucune règle.",
      hints: [
        "std::cin >> choix ; puis appeler le service dans un try.",
        "catch (const std::exception& e) { std::cout << e.what(); }",
        "L'UI lit, délègue, affiche — aucune décision métier."
      ],
      solution: `void Ui::menu(sql::Connection& con, const Utilisateur& u) {
    int choix;
    do {
        std::cout << "\\n1) Catalogue 2) Louer 3) Acheter 0) Quitter : ";
        if (!(std::cin >> choix)) break;
        try {
            if (choix == 1) afficherCatalogue(con);
            else if (choix == 2) {
                int id, j; std::cin >> id >> j;
                LocationService::louer(con, u.id(), id, j);
                std::cout << "Location enregistree\\n";
            } else if (choix == 3) {
                int id; std::cin >> id;
                AchatService::acheter(con, u.id(), id);
                std::cout << "Achat enregistre\\n";
            }
        } catch (const std::exception& e) {
            std::cout << "Erreur : " << e.what() << "\\n";   // traduit l'exception
        }
    } while (choix != 0);
}`,
      note: "L'UI ne fait que lire, deleguer au service et afficher. Les erreurs metier (exceptions) sont attrapees ici et traduites en message via e.what(). Tout le raisonnement reste dans les services : ce decouplage rend le projet maintenable."
    },
    15: {
      titre: "recherche, filtres, pagination",
      etat: "Le catalogue s'allonge. Ajoutons la recherche par nom et la pagination.",
      objectif: "Écris un SELECT paramétré avec recherche LIKE sur le nom et pagination LIMIT/OFFSET, via un PreparedStatement. Calcule l'offset depuis le numéro de page.",
      hints: [
        "WHERE nom LIKE CONCAT('%', ?, '%') ORDER BY nom LIMIT ? OFFSET ?.",
        "offset = (page - 1) * taille ; setString/setInt sur les paramètres.",
        "Le terme de recherche est toujours un paramètre lié."
      ],
      solution: `std::vector<Jeu> JeuRepository::rechercher(
        sql::Connection& con, const std::string& terme, int page, int taille) {
    std::unique_ptr<sql::PreparedStatement> pstmt(con.prepareStatement(
        "SELECT id,nom,prix_achat,prix_location,stock_vente,stock_location "
        "FROM jeu WHERE nom LIKE CONCAT('%',?,'%') "
        "ORDER BY nom LIMIT ? OFFSET ?"));
    pstmt->setString(1, terme);
    pstmt->setInt(2, taille);
    pstmt->setInt(3, (page - 1) * taille);     // offset
    std::unique_ptr<sql::ResultSet> res(pstmt->executeQuery());
    std::vector<Jeu> jeux;
    while (res->next()) jeux.emplace_back(/* ... mapping ... */);
    return jeux;
}`,
      note: "LIKE CONCAT('%',?,'%') avec un parametre lie : pas d'injection possible, meme avec un % ou une apostrophe. LIMIT/OFFSET pagine cote base (on ne rapatrie que la page). L'offset se calcule a partir du numero de page (base 1)."
    },
    16: {
      titre: "les trois espaces",
      etat: "Recherche en place. Adaptons le menu au role de l'utilisateur connecte.",
      objectif: "Écris afficherMenu(const Utilisateur&) qui montre des options différentes selon le rôle (client : louer/acheter ; vendeur : stock ; admin : comptes/stats), en réutilisant les fonctions d'autorisation.",
      hints: [
        "Un switch (u.role()) ou des if avec peutGererStock / peutAdministrer.",
        "Chaque espace n'expose que ce qui est autorisé.",
        "La vraie sécurité reste dans les services (leçon 11)."
      ],
      solution: `void Ui::afficherMenu(const Utilisateur& u) {
    std::cout << "\\n=== Espace " << libelleRole(u.role()) << " ===\\n";
    std::cout << "1) Catalogue 2) Louer 3) Acheter 4) Mes locations\\n";
    if (peutGererStock(u))
        std::cout << "5) Reapprovisionner 6) Ventes du jour\\n";
    if (peutAdministrer(u))
        std::cout << "7) Gerer les comptes 8) Statistiques\\n";
    std::cout << "0) Quitter\\n";
}`,
      note: "L'affichage s'adapte au role pour le confort, mais la vraie barriere reste le controle dans les services (leçon 11) : cacher un bouton ne suffit pas. On reutilise peutGererStock/peutAdministrer pour rester coherent."
    },
    17: {
      titre: "maitriser la memoire (RAII)",
      etat: "L'appli est complete. En C++, la memoire se gere par le RAII — verifions qu'il n'y a aucune fuite.",
      objectif: "Montre pourquoi ce projet n'a quasiment aucun new/delete : std::vector, std::string, std::unique_ptr gèrent tout. Écris une fonction qui charge le catalogue et le renvoie par valeur (RVO), sans allocation manuelle.",
      hints: [
        "std::vector<Jeu> gère sa mémoire ; unique_ptr ferme les objets Connector/C++.",
        "Renvoyer un vector par valeur est efficace (RVO / move).",
        "Tester avec -fsanitize=address : zéro fuite attendue."
      ],
      solution: `// Aucun new/delete : tout est RAII
std::vector<Jeu> chargerCatalogue(sql::Connection& con) {
    return JeuRepository::findAll(con);   // vector renvoye par valeur (RVO)
}

int main() {
    auto con = db_connect();              // unique_ptr : ferme la connexion tout seul
    std::vector<Jeu> cat = chargerCatalogue(*con);
    for (const auto& j : cat)             // const& : pas de copie
        std::cout << j.nom() << "\\n";
    return 0;                             // tout est libere automatiquement
}
// Tester : g++ -g -fsanitize=address ... ; ./app  -> aucune fuite`,
      note: "Contrairement au C (malloc/free) et au C++ bas niveau (new/delete), ici la memoire se gere TOUTE SEULE : std::vector, std::string, std::unique_ptr liberent en fin de portee (RAII). Le sanitizer ne signale aucune fuite, sans effort particulier."
    },
    18: {
      titre: "des tests unitaires",
      etat: "Le projet marche. Protegeons-le des regressions avec des tests (GoogleTest / Catch2).",
      objectif: "Écris quelques tests des fonctions pures des services (tarif, peutLouer) avec un framework (ex. GoogleTest : TEST/EXPECT_EQ), sans toucher à la base.",
      hints: [
        "#include <gtest/gtest.h> ; TEST(TarifTest, RemiseDes3Jours) { ... }",
        "EXPECT_DOUBLE_EQ(CatalogueService::tarif(j, 4), 18.0);",
        "On teste les fonctions pures (sans MySQL) : rapides et fiables."
      ],
      solution: `#include <gtest/gtest.h>
#include "CatalogueService.h"

TEST(TarifTest, PasDeRemiseAvant3Jours) {
    Jeu j(1, "Catan", 44.90, 5.0, 3, 3);
    EXPECT_DOUBLE_EQ(CatalogueService::tarif(j, 1), 5.0);
}
TEST(TarifTest, RemiseDes3Jours) {
    Jeu j(1, "Catan", 44.90, 5.0, 3, 3);
    EXPECT_DOUBLE_EQ(CatalogueService::tarif(j, 4), 18.0);   // 20 * 0.9
}
TEST(DisponibiliteTest, StockNul) {
    Jeu vide(2, "Uno", 12.5, 2.0, 0, 0);
    EXPECT_FALSE(CatalogueService::peutLouer(vide));
}`,
      note: "On teste d'abord les fonctions PURES (services sans base ni ecran) : rapides, deterministes. GoogleTest/Catch2 offrent des assertions (EXPECT_EQ, EXPECT_DOUBLE_EQ) et un rapport clair. Ecrire le test en meme temps que la regle est le bon reflexe."
    },
    19: {
      titre: "logs, config et secrets",
      etat: "Avant la mise en service, sortons les secrets du code et ajoutons des traces.",
      objectif: "Lis les identifiants MySQL depuis des variables d'environnement (std::getenv) au lieu de les coder en dur, et ajoute une fonction de log simple (vers std::cerr).",
      hints: [
        "const char* p = std::getenv(\"DB_PASSWORD\"); if (!p) throw ...;",
        "Ne jamais committer un mot de passe.",
        "Log : std::cerr << \"[INFO] ...\\n\" (sans secret ni donnee perso)."
      ],
      solution: `#include <cstdlib>
#include <stdexcept>

std::unique_ptr<sql::Connection> db_connect_env() {
    const char* host = std::getenv("DB_HOST");
    const char* user = std::getenv("DB_USER");
    const char* pass = std::getenv("DB_PASSWORD");
    const char* name = std::getenv("DB_NAME");
    if (!host || !user || !pass || !name)
        throw std::runtime_error("Variables DB_* manquantes");
    auto* driver = sql::mysql::get_mysql_driver_instance();
    std::unique_ptr<sql::Connection> con(
        driver->connect(std::string("tcp://") + host, user, pass));
    con->setSchema(name);
    std::cerr << "[INFO] Connecte a " << name << "\\n";   // sans secret
    return con;
}`,
      note: "Les secrets sortent du code (std::getenv) : on peut publier le code sans fuite. Un secret manquant fait echouer le demarrage (exception) plutot que de prendre une valeur devinable. Les logs vont sur std::cerr, jamais de mot de passe ni de donnee personnelle."
    },
    20: {
      titre: "construire pour la mise en service",
      etat: "Tout est pret. Ecrivons le CMakeLists qui compile l'appli et lie le connecteur.",
      objectif: "Écris un CMakeLists.txt minimal : projet C++17, exécutable depuis les sources, liaison de MySQL Connector/C++, et avertissements activés.",
      hints: [
        "cmake_minimum_required, project, set(CMAKE_CXX_STANDARD 17).",
        "add_executable(ludo main.cpp ...) ; target_link_libraries(ludo mysqlcppconn).",
        "target_compile_options(ludo PRIVATE -Wall -Wextra)."
      ],
      solution: `cmake_minimum_required(VERSION 3.16)
project(Ludotheque CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(ludo
    main.cpp Ui.cpp CatalogueService.cpp LocationService.cpp
    AchatService.cpp JeuRepository.cpp Db.cpp)

target_compile_options(ludo PRIVATE -Wall -Wextra)
target_link_libraries(ludo mysqlcppconn)   # MySQL Connector/C++

# Construire : cmake -S . -B build && cmake --build build ; ./build/ludo`,
      note: "CMake organise un vrai projet C++ multi-fichiers : il gere la compilation, les options (-Wall -Wextra) et la liaison du connecteur (mysqlcppconn). Un simple 'cmake --build' reconstruit ce qui a change — la base de l'industrialisation (version outillee)."
    },
    21: {
      titre: "bilan de l'assemblage",
      etat: "La Ludothèque C++ est complete : classes, depot MySQL, services, roles, transactions, RAII, tests.",
      objectif: "Récapitule le flux complet d'une location « à travers les couches », de la saisie console jusqu'au commit MySQL, en nommant la classe responsable de chaque étape.",
      hints: [
        "Ui → LocationService → JeuRepository/LocationRepository → MySQL.",
        "La règle de stock est dans le service ; la transaction encadre le dépôt.",
        "Les exceptions remontent proprement (RAII garantit la libération)."
      ],
      solution: `Saisie "louer jeu 12, 4 jours"        (Ui::menu)
  -> LocationService::louer(con, user, 12, 4)
       validerDuree(4)
       con.setAutoCommit(false)          (transaction)
       Jeu j = JeuRepository::findById(12)
       CatalogueService::peutLouer(j)    (REGLE METIER)
       LocationRepository::inserer(...)  (PreparedStatement)
       JeuRepository::decrementerStockLocation(12)
       con.commit()  (ou rollback + throw si exception)
  -> l'Ui affiche le succes, ou attrape l'exception (e.what())`,
      note: "Bravo : tu as construit une application C++ complete, en couches objet, sure (requetes preparees, transactions, exceptions) et sans fuite (RAII). La version outillee (Niveau 8) reprendra ce projet avec Git, Docker et CI/CD des le premier commit."
    }
  }
};
