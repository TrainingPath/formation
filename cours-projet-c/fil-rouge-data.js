/* ===== Fil rouge « La Ludothèque » — capstone full-stack (C · SQL · MySQL) =====
   Le grand assemblage : construire l'application COMPLÈTE de la Ludothèque en
   réunissant le langage (C), la conception (Merise), le SQL et la base (MySQL,
   via son connecteur C). Application console modulaire : architecture en couches
   (UI → services → DAO → MySQL), données en struct, requêtes préparées,
   transactions, gestion mémoire rigoureuse. */
var FIL = {
  prefix: "projc21",
  app: "La Ludothèque",
  placeholder: "Écris ton code C / SQL ici…",
  etapes: {
    1: {
      titre: "l'architecture en couches",
      etat: "Feuille blanche, mais le domaine est connu (la Ludothèque). Avant de coder, on pose l'organisation en couches.",
      objectif: "Décris l'architecture en couches du projet C : interface console (UI) → services (métier) → DAO (accès MySQL) → base. Donne le rôle de chaque couche en une ligne et l'arborescence des fichiers .h/.c.",
      hints: [
        "L'UI lit/affiche ; les services décident (règles métier) ; le DAO parle à MySQL.",
        "Un module = un .h (déclarations) + un .c (définitions).",
        "Sépare : main.c, ui.c, services.c, dao.c, modele.h."
      ],
      solution: `main.c        boucle de menu, aiguille vers l'UI
ui.c / ui.h   affichage et saisies (aucune regle metier)
services.c    logique metier : louer, acheter, controle des stocks
dao.c / dao.h acces MySQL : SELECT/INSERT/UPDATE, mapping vers struct
modele.h      les struct : Jeu, Utilisateur, Location...
db.c / db.h   connexion MySQL partagee
Makefile      compile et lie tous les .c`,
      note: "Comme dans les autres piles : la règle métier vit dans les services, jamais dans l'UI ni le DAO. Le C impose juste de tout déclarer en .h et de compiler chaque .c."
    },
    2: {
      titre: "se connecter à MySQL",
      etat: "L'architecture est posée. Établissons la connexion à la base avec le connecteur C de MySQL.",
      objectif: "Écris une fonction db_connect() qui ouvre une connexion MySQL avec mysql_init/mysql_real_connect, vérifie l'erreur, et renvoie le pointeur MYSQL*. Indique la ligne de compilation.",
      hints: [
        "#include <mysql/mysql.h> ; compile avec $(mysql_config --cflags --libs).",
        "MYSQL *c = mysql_init(NULL); puis mysql_real_connect(c, host, user, pass, db, 0, NULL, 0).",
        "Si la connexion échoue, affiche mysql_error(c) et renvoie NULL."
      ],
      solution: `#include <mysql/mysql.h>
#include <stdio.h>

MYSQL *db_connect(void) {
    MYSQL *c = mysql_init(NULL);
    if (c == NULL) return NULL;
    if (!mysql_real_connect(c, "localhost", "ludo", "secret",
                            "ludotheque", 0, NULL, 0)) {
        fprintf(stderr, "Connexion : %s\\n", mysql_error(c));
        mysql_close(c);
        return NULL;
    }
    return c;
}
/* gcc app.c $(mysql_config --cflags --libs) -o app */`,
      note: "mysql_config fournit les bons chemins d'en-têtes et bibliothèques. On vérifie chaque étape : en C, aucune erreur ne se rattrape toute seule."
    },
    3: {
      titre: "du MCD au schéma SQL",
      etat: "La connexion fonctionne. Traduisons le MCD Merise de la Ludothèque en tables SQL.",
      objectif: "Écris le SQL de création des tables jeu (id, nom, prix_achat, prix_location, stock_vente, stock_location) et categorie (id, nom), avec la clé étrangère jeu.categorie_id → categorie.id.",
      hints: [
        "Types : INT AUTO_INCREMENT PRIMARY KEY, VARCHAR, DECIMAL(6,2).",
        "Deux stocks distincts : stock_vente et stock_location.",
        "FOREIGN KEY (categorie_id) REFERENCES categorie(id)."
      ],
      solution: `CREATE TABLE categorie (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  nom  VARCHAR(50) NOT NULL
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
      note: "DECIMAL(6,2) pour l'argent (jamais FLOAT en base). Les deux stocks viennent directement du MCD : vente et location sont indépendants."
    },
    4: {
      titre: "le modèle en struct",
      etat: "Le schéma existe côté base. Miroitons-le côté C avec des struct.",
      objectif: "Définis les struct Jeu et Categorie qui reflètent les tables. Prévois les champs et un typedef. Une ligne de la base = une struct remplie.",
      hints: [
        "typedef struct { int id; char nom[100]; double prix_achat; ... } Jeu;",
        "Aligne les champs sur les colonnes SQL.",
        "Les DECIMAL se mappent en double côté C."
      ],
      solution: `typedef struct {
    int  id;
    char nom[50];
} Categorie;

typedef struct {
    int    id;
    char   nom[100];
    double prix_achat;
    double prix_location;
    int    stock_vente;
    int    stock_location;
    int    categorie_id;
} Jeu;`,
      note: "La struct est le pont entre la ligne SQL et le code C. On y range ce qu'une requête renvoie (leçon 5) et ce qu'on écrira (leçon 6)."
    },
    5: {
      titre: "lire le catalogue (DAO SELECT)",
      etat: "Modèle prêt. Lisons les jeux depuis MySQL et remplissons un tableau de struct Jeu.",
      objectif: "Écris jeu_lister(MYSQL *c, Jeu tab[], int max) qui exécute un SELECT, parcourt le résultat avec mysql_fetch_row et remplit tab. Renvoie le nombre de jeux lus.",
      hints: [
        "mysql_query(c, \"SELECT id,nom,prix_location,stock_location FROM jeu\").",
        "MYSQL_RES *r = mysql_store_result(c); puis boucle mysql_fetch_row(r).",
        "row[i] est une chaîne : convertis avec atoi/atof. Libère avec mysql_free_result."
      ],
      solution: `int jeu_lister(MYSQL *c, Jeu tab[], int max) {
    if (mysql_query(c, "SELECT id,nom,prix_location,stock_location FROM jeu"))
        return -1;
    MYSQL_RES *res = mysql_store_result(c);
    if (!res) return -1;
    int n = 0;
    MYSQL_ROW row;
    while ((row = mysql_fetch_row(res)) && n < max) {
        tab[n].id             = atoi(row[0]);
        snprintf(tab[n].nom, sizeof(tab[n].nom), "%s", row[1] ? row[1] : "");
        tab[n].prix_location  = atof(row[2]);
        tab[n].stock_location = atoi(row[3]);
        n++;
    }
    mysql_free_result(res);
    return n;
}`,
      note: "mysql_fetch_row renvoie des chaînes : on convertit vers les bons types. snprintf borne la copie du nom (jamais strcpy sans limite). On libère toujours le résultat."
    },
    6: {
      titre: "écrire sans se faire injecter",
      etat: "On lit le catalogue. Pour ajouter un jeu à partir d'une saisie, il faut se protéger de l'injection SQL.",
      objectif: "Écris un INSERT d'un jeu avec une REQUÊTE PRÉPARÉE (mysql_stmt) : liaison des paramètres nom (chaîne) et prix (double). Explique pourquoi c'est plus sûr que concaténer.",
      hints: [
        "MYSQL_STMT *st = mysql_stmt_init(c); mysql_stmt_prepare(st, \"INSERT ... VALUES (?, ?)\", ...).",
        "MYSQL_BIND bind[2] = {0}; type MYSQL_TYPE_STRING / MYSQL_TYPE_DOUBLE.",
        "Concaténer une saisie dans le SQL = injection ; le ? sépare code et données."
      ],
      solution: `int jeu_ajouter(MYSQL *c, const char *nom, double prix) {
    MYSQL_STMT *st = mysql_stmt_init(c);
    const char *sql = "INSERT INTO jeu(nom,prix_location,prix_achat) VALUES(?,?,0)";
    if (mysql_stmt_prepare(st, sql, strlen(sql))) return -1;

    MYSQL_BIND b[2];
    memset(b, 0, sizeof(b));
    unsigned long len = strlen(nom);
    b[0].buffer_type = MYSQL_TYPE_STRING;
    b[0].buffer = (char *)nom; b[0].buffer_length = len; b[0].length = &len;
    b[1].buffer_type = MYSQL_TYPE_DOUBLE; b[1].buffer = &prix;

    mysql_stmt_bind_param(st, b);
    int ok = mysql_stmt_execute(st) == 0 ? 0 : -1;
    mysql_stmt_close(st);
    return ok;
}`,
      note: "La requête préparée sépare le code SQL (avec ?) des données : une valeur ne peut jamais être interprétée comme du SQL. C'est LA parade à l'injection, dans tous les langages."
    },
    7: {
      titre: "la couche service : louer, une règle",
      etat: "Le DAO sait lire et écrire. Plaçons la première règle métier dans les services, pas dans l'UI.",
      objectif: "Écris service_peut_louer(const Jeu *j) qui renvoie 1 si le stock de location est > 0, 0 sinon. La règle « stock nul → refus » doit exister une seule fois, dans les services.",
      hints: [
        "Une fonction pure, sans printf ni SQL : juste la décision.",
        "return j->stock_location > 0;",
        "L'UI appellera cette fonction ; elle ne recalcule jamais la règle elle-même."
      ],
      solution: `#include "modele.h"

int service_peut_louer(const Jeu *j) {
    return j->stock_location > 0;   // regle metier, definie UNE fois
}

double service_tarif(const Jeu *j, int jours) {
    double total = j->prix_location * jours;
    if (jours >= 3) total *= 0.9;   // -10 % des 3 jours
    return total;
}`,
      note: "Les services ne connaissent ni l'écran ni la base : ils décident. Résultat : la règle est testable sans MySQL et réutilisable partout (UI, API, tests)."
    },
    8: {
      titre: "valider et signaler les erreurs",
      etat: "Le métier grandit. Uniformisons la façon de valider les entrées et de remonter les erreurs.",
      objectif: "Définis un enum de codes de retour (OK, ERR_STOCK, ERR_SAISIE, ERR_DB) et une fonction qui valide une durée de location (1 à 30 jours) en renvoyant le bon code.",
      hints: [
        "typedef enum { OK, ERR_STOCK, ERR_SAISIE, ERR_DB } Code;",
        "Renvoyer un code plutôt qu'afficher : l'appelant décide quoi en faire.",
        "Valide : jours >= 1 && jours <= 30."
      ],
      solution: `typedef enum { OK, ERR_STOCK, ERR_SAISIE, ERR_DB } Code;

Code valider_duree(int jours) {
    if (jours < 1 || jours > 30)
        return ERR_SAISIE;
    return OK;
}

const char *code_message(Code c) {
    switch (c) {
        case OK:         return "OK";
        case ERR_STOCK:  return "Stock insuffisant";
        case ERR_SAISIE: return "Saisie invalide";
        case ERR_DB:     return "Erreur base de donnees";
    }
    return "?";
}`,
      note: "Un enum de codes de retour donne une gestion d'erreurs cohérente dans tout le projet. Les services renvoient un Code ; l'UI le traduit en message."
    },
    9: {
      titre: "utilisateurs et rôles",
      etat: "Le catalogue tourne. Introduisons les comptes et les trois rôles.",
      objectif: "Ajoute la table utilisateur (id, login, mot_de_passe_hash, role) et l'enum Role (CLIENT, VENDEUR, ADMIN) côté C, avec la struct Utilisateur correspondante.",
      hints: [
        "role : un ENUM SQL ou un petit INT (0/1/2).",
        "Ne stocke JAMAIS le mot de passe en clair : un hash.",
        "typedef enum { CLIENT, VENDEUR, ADMIN } Role;"
      ],
      solution: `CREATE TABLE utilisateur (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  login             VARCHAR(50) UNIQUE NOT NULL,
  mot_de_passe_hash VARCHAR(255) NOT NULL,
  role              TINYINT NOT NULL DEFAULT 0   -- 0 client,1 vendeur,2 admin
);

/* modele.h */
typedef enum { CLIENT, VENDEUR, ADMIN } Role;
typedef struct {
    int  id;
    char login[50];
    Role role;
} Utilisateur;`,
      note: "Le rôle conditionnera les autorisations (leçon 11). Le mot de passe n'apparaît jamais en clair : on stocke et compare son hash."
    },
    10: {
      titre: "authentifier un utilisateur",
      etat: "Les comptes existent. Écrivons la connexion : vérifier login + mot de passe.",
      objectif: "Écris auth_login(MYSQL *c, const char *login, const char *mdp, Utilisateur *out) : récupère le hash par requête préparée, compare le hash du mot de passe saisi, remplit out et renvoie un Code.",
      hints: [
        "Récupère la ligne par login avec une requête préparée (pas de concaténation).",
        "Compare hash_du_mdp_saisi et le hash stocké (ici on schématise avec une fonction hacher()).",
        "Renvoie OK si concordance, ERR_SAISIE sinon."
      ],
      solution: `Code auth_login(MYSQL *c, const char *login,
                const char *mdp, Utilisateur *out) {
    char hash_stocke[256];
    if (dao_hash_par_login(c, login, hash_stocke, sizeof(hash_stocke)) != OK)
        return ERR_SAISIE;                 // login inconnu

    char hash_saisi[256];
    hacher(mdp, hash_saisi, sizeof(hash_saisi));   // meme algo qu'a l'inscription

    if (strcmp(hash_stocke, hash_saisi) != 0)
        return ERR_SAISIE;                 // mauvais mot de passe

    dao_utilisateur_par_login(c, login, out);
    return OK;
}`,
      note: "On compare des hash, jamais des mots de passe en clair. Le même message d'erreur pour « login inconnu » et « mauvais mot de passe » évite de renseigner un attaquant."
    },
    11: {
      titre: "autoriser selon le rôle",
      etat: "On sait qui est connecté. Contrôlons ce que chaque rôle a le droit de faire.",
      objectif: "Écris peut_gerer_stock(const Utilisateur *u) qui n'autorise que VENDEUR et ADMIN, et un garde générique qui renvoie ERR_SAISIE (accès refusé) sinon.",
      hints: [
        "Le client ne gère pas le stock ; vendeur et admin oui.",
        "return u->role == VENDEUR || u->role == ADMIN;",
        "Centralise ces contrôles pour ne pas les disperser."
      ],
      solution: `int peut_gerer_stock(const Utilisateur *u) {
    return u->role == VENDEUR || u->role == ADMIN;
}
int peut_administrer(const Utilisateur *u) {
    return u->role == ADMIN;
}

/* usage dans un service */
Code service_reapprovisionner(const Utilisateur *u, MYSQL *c, int jeu_id, int n) {
    if (!peut_gerer_stock(u)) return ERR_SAISIE;   // refuse
    return dao_ajouter_stock(c, jeu_id, n);
}`,
      note: "L'autorisation se vérifie dans les services, à chaque opération sensible. Centraliser les règles d'accès évite d'en oublier une."
    },
    12: {
      titre: "louer un jeu (transaction)",
      etat: "Cœur du métier : louer doit décrémenter le stock ET créer la location, tout ou rien.",
      objectif: "Écris service_louer qui, dans une TRANSACTION MySQL (START TRANSACTION / COMMIT / ROLLBACK), vérifie le stock, insère la location et décrémente stock_location. En cas d'échec, rollback.",
      hints: [
        "mysql_query(c, \"START TRANSACTION\"); ... COMMIT ou ROLLBACK.",
        "Vérifie le stock AVANT ; décrémente APRÈS l'insertion.",
        "Toute erreur en cours → ROLLBACK et retour d'un Code d'erreur."
      ],
      solution: `Code service_louer(MYSQL *c, int user_id, int jeu_id, int jours) {
    if (valider_duree(jours) != OK) return ERR_SAISIE;
    mysql_query(c, "START TRANSACTION");

    Jeu j;
    if (dao_jeu_par_id(c, jeu_id, &j) != OK) { mysql_query(c,"ROLLBACK"); return ERR_DB; }
    if (!service_peut_louer(&j))            { mysql_query(c,"ROLLBACK"); return ERR_STOCK; }

    if (dao_inserer_location(c, user_id, jeu_id, jours) != OK ||
        dao_decrementer_stock_loc(c, jeu_id) != OK) {
        mysql_query(c, "ROLLBACK");
        return ERR_DB;
    }
    mysql_query(c, "COMMIT");
    return OK;
}`,
      note: "La transaction garantit l'atomicité : impossible de retirer du stock sans enregistrer la location, ou l'inverse. C'est la règle d'or des opérations qui touchent plusieurs tables."
    },
    13: {
      titre: "acheter un jeu (prix figé)",
      etat: "La location marche. L'achat suit la même logique, sur le stock de vente.",
      objectif: "Écris service_acheter : transaction, contrôle de stock_vente, insertion d'une vente au prix figé du moment, décrément du stock. Le prix payé est enregistré, pas recalculé plus tard.",
      hints: [
        "On enregistre le prix_achat au moment de la vente (il pourrait changer après).",
        "Même schéma transactionnel que louer.",
        "stock_vente au lieu de stock_location."
      ],
      solution: `Code service_acheter(MYSQL *c, int user_id, int jeu_id) {
    mysql_query(c, "START TRANSACTION");
    Jeu j;
    if (dao_jeu_par_id(c, jeu_id, &j) != OK) { mysql_query(c,"ROLLBACK"); return ERR_DB; }
    if (j.stock_vente <= 0)                  { mysql_query(c,"ROLLBACK"); return ERR_STOCK; }

    if (dao_inserer_vente(c, user_id, jeu_id, j.prix_achat) != OK ||  // prix FIGE
        dao_decrementer_stock_vente(c, jeu_id) != OK) {
        mysql_query(c, "ROLLBACK");
        return ERR_DB;
    }
    mysql_query(c, "COMMIT");
    return OK;
}`,
      note: "On fige le prix payé dans la ligne de vente : si le tarif change demain, l'historique reste exact. Deux stocks séparés = deux opérations distinctes, même schéma transactionnel."
    },
    14: {
      titre: "l'interface console",
      etat: "Le métier est solide. Donnons-lui une interface : un menu qui appelle les services.",
      objectif: "Écris une boucle de menu (do-while) qui propose : 1) voir le catalogue, 2) louer, 3) acheter, 0) quitter, et délègue chaque action au service correspondant. L'UI n'applique aucune règle.",
      hints: [
        "L'UI lit le choix, lit les paramètres, appelle le service, affiche le Code résultat.",
        "Aucune règle métier dans l'UI : juste lire, appeler, afficher.",
        "Traduire le Code retourné en message via code_message()."
      ],
      solution: `void menu(MYSQL *c, Utilisateur *u) {
    int choix;
    do {
        printf("\\n1) Catalogue  2) Louer  3) Acheter  0) Quitter : ");
        if (scanf("%d", &choix) != 1) break;
        if (choix == 1) {
            ui_afficher_catalogue(c);
        } else if (choix == 2) {
            int id, j;
            printf("Jeu ? "); scanf("%d", &id);
            printf("Jours ? "); scanf("%d", &j);
            Code r = service_louer(c, u->id, id, j);
            printf("%s\\n", code_message(r));
        } else if (choix == 3) {
            int id; printf("Jeu ? "); scanf("%d", &id);
            printf("%s\\n", code_message(service_acheter(c, u->id, id)));
        }
    } while (choix != 0);
}`,
      note: "L'UI ne fait que traduire : elle lit, appelle un service, affiche le résultat. Toute la décision reste dans les services — c'est ce découplage qui rend le projet maintenable."
    },
    15: {
      titre: "recherche, filtres et pagination",
      etat: "Le catalogue s'allonge. Ajoutons la recherche par nom et la pagination.",
      objectif: "Écris un SELECT paramétré avec recherche LIKE sur le nom et pagination LIMIT/OFFSET, via une requête préparée. Calcule l'offset à partir du numéro de page.",
      hints: [
        "WHERE nom LIKE CONCAT('%', ?, '%') ORDER BY nom LIMIT ? OFFSET ?.",
        "offset = (page - 1) * taille_page.",
        "Toujours en requête préparée pour le terme de recherche."
      ],
      solution: `-- SQL exécuté (paramètres liés : terme, taille, offset)
SELECT id, nom, prix_location, stock_location
FROM jeu
WHERE nom LIKE CONCAT('%', ?, '%')
ORDER BY nom
LIMIT ? OFFSET ?;

/* Cote C : calcul de l'offset */
int taille = 10;
int offset = (page - 1) * taille;   /* page commence a 1 */
/* lier ? = terme, ? = taille, ? = offset dans un MYSQL_STMT */`,
      note: "LIMIT/OFFSET pagine côté base (on ne rapatrie pas tout en mémoire). Le terme de recherche passe par un paramètre lié : pas d'injection possible, même avec un % ou une apostrophe."
    },
    16: {
      titre: "les trois espaces",
      etat: "Recherche en place. Adaptons le menu au rôle de l'utilisateur connecté.",
      objectif: "Écris afficher_menu(const Utilisateur *u) qui montre des options différentes selon le rôle : le client loue/achète, le vendeur gère le stock, l'admin gère comptes et jeux.",
      hints: [
        "Un switch (u->role) qui compose le menu.",
        "Réutilise les gardes peut_gerer_stock / peut_administrer.",
        "Chaque espace n'expose que ce qui est autorisé."
      ],
      solution: `void afficher_menu(const Utilisateur *u) {
    printf("\\n=== Espace %s ===\\n",
           u->role == ADMIN ? "administrateur" :
           u->role == VENDEUR ? "vendeur" : "client");
    printf("1) Catalogue  2) Louer  3) Acheter\\n");
    if (peut_gerer_stock(u))
        printf("4) Reapprovisionner  5) Ventes du jour\\n");
    if (peut_administrer(u))
        printf("6) Gerer les comptes  7) Statistiques\\n");
    printf("0) Quitter\\n");
}`,
      note: "L'affichage s'adapte au rôle, mais la vraie sécurité reste dans les services (leçon 11) : cacher un bouton ne suffit pas, on revérifie l'autorisation à l'exécution."
    },
    17: {
      titre: "maîtriser la mémoire",
      etat: "L'appli est complète, mais un catalogue de taille variable alloue de la mémoire. Chassons les fuites.",
      objectif: "Écris jeu_charger_tous(MYSQL *c, int *n) qui alloue dynamiquement un tableau de Jeu à la bonne taille (mysql_num_rows), le remplit et le renvoie. Rappelle qui doit faire le free.",
      hints: [
        "int total = mysql_num_rows(res); puis malloc(total * sizeof(Jeu)).",
        "Vérifie malloc != NULL ; libère le MYSQL_RES.",
        "L'appelant devient responsable du free du tableau renvoyé."
      ],
      solution: `Jeu *jeu_charger_tous(MYSQL *c, int *n) {
    if (mysql_query(c, "SELECT id,nom,prix_location,stock_location FROM jeu"))
        return NULL;
    MYSQL_RES *res = mysql_store_result(c);
    if (!res) return NULL;

    int total = (int)mysql_num_rows(res);
    Jeu *tab = malloc(total * sizeof(Jeu));
    if (!tab) { mysql_free_result(res); return NULL; }

    MYSQL_ROW row; int i = 0;
    while ((row = mysql_fetch_row(res))) {
        tab[i].id = atoi(row[0]);
        snprintf(tab[i].nom, sizeof(tab[i].nom), "%s", row[1] ? row[1] : "");
        tab[i].prix_location  = atof(row[2]);
        tab[i].stock_location = atoi(row[3]);
        i++;
    }
    mysql_free_result(res);
    *n = total;
    return tab;   /* l'appelant devra free(tab) */
}`,
      note: "Contrat clair : la fonction alloue, l'appelant libère. On documente qui possède la mémoire. Teste avec valgrind : zéro fuite est l'objectif."
    },
    18: {
      titre: "un mini-harnais de tests",
      etat: "Le projet marche. Protégeons-le contre les régressions avec des tests automatisés.",
      objectif: "Écris un petit harnais de tests avec une macro CHECK(cond) qui compte succès et échecs, et teste service_tarif (ex. 4 jours = -10 %) sans toucher à la base.",
      hints: [
        "#define CHECK(c) do { if (c) ok++; else { printf(\"FAIL %s\\n\", #c); ko++; } } while(0)",
        "Teste les fonctions pures (services) sans MySQL.",
        "Un main de test renvoie 0 si tout passe, 1 sinon (utile en CI)."
      ],
      solution: `#include <stdio.h>
#include "services.h"

static int ok = 0, ko = 0;
#define CHECK(c) do { if (c) ok++; else { printf("FAIL: %s\\n", #c); ko++; } } while(0)

int main(void) {
    Jeu j = { .prix_location = 5.0 };
    CHECK(service_tarif(&j, 1) == 5.0);     // 1 jour, pas de remise
    CHECK(service_tarif(&j, 4) == 18.0);    // 4 jours, -10 %
    CHECK(valider_duree(0)  == ERR_SAISIE);
    CHECK(valider_duree(10) == OK);

    printf("%d reussis, %d echoues\\n", ok, ko);
    return ko == 0 ? 0 : 1;
}`,
      note: "Tester d'abord les fonctions pures (services), sans base : rapides et fiables. Le code de retour (0/1) permettra à la CI d'échouer si un test casse."
    },
    19: {
      titre: "logs, config et secrets",
      etat: "Avant la mise en service, sortons les secrets du code et ajoutons des traces.",
      objectif: "Lis les identifiants MySQL depuis des variables d'environnement (getenv) au lieu de les coder en dur, et ajoute une fonction de log horodatée.",
      hints: [
        "getenv(\"DB_PASSWORD\") ; ne jamais committer un mot de passe.",
        "Prévois une valeur par défaut ou un échec clair si la variable manque.",
        "Un log simple : fprintf(stderr, \"[INFO] ...\\n\")."
      ],
      solution: `#include <stdlib.h>
#include <stdio.h>

MYSQL *db_connect_env(void) {
    const char *host = getenv("DB_HOST");
    const char *user = getenv("DB_USER");
    const char *pass = getenv("DB_PASSWORD");
    const char *name = getenv("DB_NAME");
    if (!host || !user || !pass || !name) {
        fprintf(stderr, "[ERREUR] Variables DB_* manquantes\\n");
        return NULL;
    }
    MYSQL *c = mysql_init(NULL);
    if (!mysql_real_connect(c, host, user, pass, name, 0, NULL, 0)) {
        fprintf(stderr, "[ERREUR] Connexion : %s\\n", mysql_error(c));
        return NULL;
    }
    fprintf(stderr, "[INFO] Connecte a %s\\n", name);
    return c;
}`,
      note: "Les secrets sortent du code et vivent dans l'environnement : on peut publier le code sans fuite. Les logs horodatés aident à diagnostiquer en production."
    },
    20: {
      titre: "compiler pour la mise en service",
      etat: "Tout est prêt. Écrivons le Makefile qui construit l'application et lance les tests.",
      objectif: "Écris un Makefile avec des cibles : app (compile et lie les .c avec le connecteur MySQL), test (compile et exécute le harnais), clean. Active -Wall -Wextra.",
      hints: [
        "CFLAGS = -Wall -Wextra $(shell mysql_config --cflags).",
        "LDLIBS = $(shell mysql_config --libs).",
        "La cible test dépend du binaire de test et l'exécute (./tests)."
      ],
      solution: `CC      = gcc
CFLAGS  = -Wall -Wextra -std=c11 $(shell mysql_config --cflags)
LDLIBS  = $(shell mysql_config --libs)
SRC     = main.c ui.c services.c dao.c db.c
OBJ     = $(SRC:.c=.o)

app: $(OBJ)
	$(CC) $(OBJ) -o app $(LDLIBS)

test: tests.c services.o
	$(CC) $(CFLAGS) tests.c services.o -o tests $(LDLIBS)
	./tests

clean:
	rm -f $(OBJ) app tests

.PHONY: test clean`,
      note: "make ne recompile que le nécessaire. La cible test lance le harnais : un make test rouge stoppe la mise en service. Voilà l'ancêtre du pipeline de CI/CD."
    },
    21: {
      titre: "bilan de l'assemblage",
      etat: "La Ludothèque C est complète : base MySQL, DAO sûr, services, rôles, transactions, UI, tests.",
      objectif: "Récapitule le flux complet d'une location « à travers les couches », de la saisie console jusqu'au COMMIT MySQL, en nommant le fichier responsable de chaque étape.",
      hints: [
        "UI (ui.c) → service (services.c) → DAO (dao.c) → MySQL.",
        "La règle de stock est dans le service ; la transaction encadre le DAO.",
        "Une seule règle métier, réutilisable partout."
      ],
      solution: `Saisie "louer jeu 12, 4 jours"  (ui.c / menu)
  -> service_louer(c, user, 12, 4)   (services.c)
       valider_duree(4)              -> OK
       START TRANSACTION             (dao.c)
       dao_jeu_par_id(12)            -> Jeu j
       service_peut_louer(&j)        -> stock_location > 0 ?
       dao_inserer_location(...)     INSERT
       dao_decrementer_stock_loc(12) UPDATE
       COMMIT                        (ou ROLLBACK si erreur)
  -> code_message(OK)                affiche "OK" (ui.c)`,
      note: "Bravo : tu as construit une application C complète, en couches, sûre et testée, en réunissant tout le cursus. La version outillée (Niveau 8) reprendra ce projet avec Git, Docker et CI/CD dès le premier commit."
    }
  }
};
