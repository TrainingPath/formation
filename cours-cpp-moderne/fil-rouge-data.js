/* ===== Fil rouge « La Ludothèque » — cours C++ moderne (21 étapes) =====
   Même application que dans tous les cours, pour comparer les langages.
   Ludothèque de jeux de société : catalogue, 3 rôles, achat ET location.
   Style C++ moderne : STL (string, vector, map), classes, RAII, smart
   pointers — code court, sûr et expressif. */
var FIL = {
  prefix: "cppm21",
  app: "La Ludothèque",
  placeholder: "Écris ton code C++ ici…",
  etapes: {
    1: {
      titre: "l'écran d'accueil",
      etat: "Le projet démarre : rien n'existe encore. La ludothèque doit se présenter au lancement.",
      objectif: "Écris un programme C++ complet qui affiche une bannière d'accueil (nom + promesse achat &amp; location), encadrée par des lignes de séparation, avec std::cout.",
      hints: [
        "#include <iostream> ; int main() { ... }",
        "std::cout << \"...\" << \"\\n\"; ou std::cout << ... << std::endl;",
        "std::string(40, '=') crée une ligne de 40 signes égal."
      ],
      solution: `#include <iostream>
#include <string>

int main() {
    std::cout << std::string(40, '=') << "\\n";
    std::cout << "       BIENVENUE A LA LUDOTHEQUE\\n";
    std::cout << "   Achat & location de jeux de societe\\n";
    std::cout << std::string(40, '=') << "\\n";
    return 0;
}`,
      note: "En C++, std::cout et l'opérateur << remplacent le printf du C. std::string(n, c) construit facilement une ligne de séparation. On compile avec g++ -std=c++17."
    },
    2: {
      titre: "représenter un jeu",
      etat: "L'accueil s'affiche. Décrivons un jeu avec des variables typées.",
      objectif: "Déclare les données d'un jeu : nom (std::string), prixAchat et prixLocation (double), stock (int), disponible (bool calculé). Affiche-les. Utilise auto là où c'est plus lisible.",
      hints: [
        "std::string nom = \"Catan\"; double prixAchat = 44.90;",
        "bool disponible = stock > 0;",
        "std::cout enchaîne les valeurs avec <<."
      ],
      solution: `#include <iostream>
#include <string>

int main() {
    std::string nom = "Catan";
    double prixAchat = 44.90, prixLocation = 5.0;
    int stock = 3;
    bool disponible = stock > 0;

    std::cout << nom << " : achat " << prixAchat
              << ", loc " << prixLocation << "/j, stock " << stock
              << ", dispo " << std::boolalpha << disponible << "\\n";
    return 0;
}`,
      note: "std::string est un vrai type chaîne (contrairement au char[] du C). std::boolalpha affiche true/false au lieu de 1/0. auto sert à déduire un type quand il est évident."
    },
    3: {
      titre: "calculer un tarif de location",
      etat: "Un jeu est décrit. Calculons le coût d'une location de plusieurs jours.",
      objectif: "Calcule prix par jour × jours, avec 10 % de remise dès 3 jours. Affiche le total à 2 décimales (std::fixed, std::setprecision).",
      hints: [
        "#include <iomanip> pour setprecision.",
        "std::cout << std::fixed << std::setprecision(2) << total;",
        "total *= 0.9; applique -10 %."
      ],
      solution: `#include <iostream>
#include <iomanip>

int main() {
    double prixLocation = 5.0;
    int jours = 4;
    double total = prixLocation * jours;
    if (jours >= 3) total *= 0.9;

    std::cout << "Location " << jours << " jours : "
              << std::fixed << std::setprecision(2) << total << " euros\\n";
    return 0;
}`,
      note: "std::fixed << std::setprecision(2) formate les réels à 2 décimales, indispensable pour de l'argent. C'est l'équivalent du %.2f de printf."
    },
    4: {
      titre: "un premier menu interactif",
      etat: "Rendons le programme interactif : l'utilisateur choisit une action.",
      objectif: "Affiche un menu (1 = acheter, 2 = louer), lis le choix avec std::cin, puis récapitule. Pas de & : cin >> choix suffit.",
      hints: [
        "int choix; std::cin >> choix;  (pas de & en C++)",
        "Teste !(std::cin >> choix) pour une saisie invalide.",
        "std::cout sert de prompt avant la lecture."
      ],
      solution: `#include <iostream>

int main() {
    std::cout << "1) Acheter  2) Louer\\nTon choix ? ";
    int choix;
    if (!(std::cin >> choix)) return 1;

    if (choix == 1)      std::cout << "Tu veux acheter.\\n";
    else if (choix == 2) std::cout << "Tu veux louer.\\n";
    else                 std::cout << "Choix inconnu.\\n";
    return 0;
}`,
      note: "std::cin >> choix lit directement dans la variable, sans le & du scanf. On teste le flux (if (!(cin >> x))) pour détecter une saisie non numérique."
    },
    5: {
      titre: "classer un stock",
      etat: "Le menu répond. Aidons le vendeur à voir l'état d'un stock.",
      objectif: "Selon le stock, affiche « Rupture » (0), « Stock faible » (< 5) ou « Stock ok ». Utilise if / else if / else.",
      hints: [
        "== pour comparer (pas =).",
        "Ordonne : == 0, puis < 5, puis le reste.",
        "std::cout pour chaque cas."
      ],
      solution: `#include <iostream>

int main() {
    int stock = 3;
    if (stock == 0)      std::cout << "Rupture\\n";
    else if (stock < 5)  std::cout << "Stock faible\\n";
    else                 std::cout << "Stock ok\\n";
    return 0;
}`,
      note: "La logique des conditions est identique au C. Comme partout, == compare et = affecte : compile avec -Wall pour être averti d'un = suspect."
    },
    6: {
      titre: "le nom du jeu (std::string)",
      etat: "Manipulons du texte proprement avec std::string.",
      objectif: "Construis le titre d'un jeu, teste sa longueur (.size()), compare-le avec == (oui, ça marche en C++ !) et concatène-lui une étiquette avec +.",
      hints: [
        "std::string titre = \"Catan\"; titre += \" (dispo)\";",
        "titre.size() donne la longueur.",
        "En C++, on compare deux std::string avec == (contrairement au C)."
      ],
      solution: `#include <iostream>
#include <string>

int main() {
    std::string nom = "Catan";
    if (nom == "Catan")                     // comparaison directe !
        std::cout << "C'est bien Catan\\n";
    std::string titre = nom + " (dispo)";   // concatenation avec +
    std::cout << titre << " (" << titre.size() << " caracteres)\\n";
    return 0;
}`,
      note: "std::string simplifie tout : == compare le contenu, + concatène, .size() mesure. Fini le char[], le '\\0', strcmp et strcpy du C."
    },
    7: {
      titre: "le catalogue (std::vector)",
      etat: "Un seul jeu ne suffit pas. Stockons plusieurs prix dans un vector.",
      objectif: "Déclare un std::vector<double> de prix, ajoute-en avec push_back, parcours-le avec un for-range, et affiche total et moyenne.",
      hints: [
        "std::vector<double> prix = {44.90, 12.50, 39.0};",
        "for (double p : prix) somme += p;",
        "prix.size() donne le nombre d'éléments."
      ],
      solution: `#include <iostream>
#include <vector>
#include <iomanip>

int main() {
    std::vector<double> prix = {44.90, 12.50, 39.0, 19.90};
    double somme = 0.0;
    for (double p : prix) somme += p;
    std::cout << std::fixed << std::setprecision(2)
              << "Total : " << somme
              << " | Moyenne : " << somme / prix.size() << "\\n";
    return 0;
}`,
      note: "std::vector est un tableau qui gère sa taille tout seul (push_back, size). Le for-range (for (double p : prix)) parcourt sans indices ni risque de débordement."
    },
    8: {
      titre: "une fonction tarif",
      etat: "Le calcul du tarif se répète. Isolons-le dans une fonction.",
      objectif: "Écris double tarif(double prixJour, int jours) qui applique -10 % dès 3 jours. Ajoute une surcharge tarif(prixJour) qui suppose 1 jour.",
      hints: [
        "Le type de retour est double.",
        "Surcharge : deux fonctions de même nom, signatures différentes.",
        "tarif(double p) { return tarif(p, 1); }"
      ],
      solution: `#include <iostream>
#include <iomanip>

double tarif(double prixJour, int jours) {
    double t = prixJour * jours;
    if (jours >= 3) t *= 0.9;
    return t;
}
double tarif(double prixJour) { return tarif(prixJour, 1); }  // surcharge

int main() {
    std::cout << std::fixed << std::setprecision(2)
              << tarif(5.0, 4) << " / " << tarif(5.0) << "\\n";  // 18.00 / 5.00
    return 0;
}`,
      note: "La surcharge (deux fonctions de même nom) est propre au C++ : le compilateur choisit selon les arguments. On peut aussi donner des valeurs par défaut aux paramètres."
    },
    9: {
      titre: "la classe Jeu",
      etat: "Regroupons les données d'un jeu dans une classe, avec encapsulation.",
      objectif: "Définis une classe Jeu avec des membres privés (nom, prix, stock) et des méthodes publiques (getters, estDisponible()). Instancie un Jeu et affiche ses infos.",
      hints: [
        "class Jeu { private: ... public: ... };  (n'oublie pas le ; final)",
        "bool estDisponible() const { return stock_ > 0; }",
        "Les membres privés protègent l'état ; les méthodes publiques l'exposent."
      ],
      solution: `#include <iostream>
#include <string>

class Jeu {
    std::string nom_;
    double prix_;
    int stock_;
public:
    Jeu(std::string nom, double prix, int stock)
        : nom_(nom), prix_(prix), stock_(stock) {}
    const std::string& nom() const { return nom_; }
    double prix() const { return prix_; }
    bool estDisponible() const { return stock_ > 0; }
};

int main() {
    Jeu catan("Catan", 44.90, 3);
    std::cout << catan.nom() << " : " << catan.prix()
              << " dispo=" << std::boolalpha << catan.estDisponible() << "\\n";
    return 0;
}`,
      note: "L'encapsulation cache l'état (membres privés avec _) et n'expose que des méthodes contrôlées. const après une méthode promet qu'elle ne modifie pas l'objet."
    },
    10: {
      titre: "constructeur, RAII et réappro",
      etat: "Donnons à Jeu un vrai cycle de vie et une méthode qui modifie son état.",
      objectif: "Ajoute à la classe Jeu une méthode reapprovisionner(int n) qui augmente le stock, et une méthode afficher() const. Montre qu'un Jeu se construit avec ses valeurs (liste d'initialisation).",
      hints: [
        "void reapprovisionner(int n) { stock_ += n; }",
        "Le constructeur initialise via : nom_(nom), prix_(prix)...",
        "afficher() est const si elle ne modifie rien."
      ],
      solution: `#include <iostream>
#include <string>

class Jeu {
    std::string nom_;
    int stock_;
public:
    Jeu(std::string nom, int stock) : nom_(nom), stock_(stock) {}
    void reapprovisionner(int n) { stock_ += n; }
    void afficher() const {
        std::cout << nom_ << " : stock " << stock_ << "\\n";
    }
};

int main() {
    Jeu catan("Catan", 3);
    catan.reapprovisionner(5);
    catan.afficher();               // Catan : stock 8
    return 0;
}`,
      note: "Le constructeur garantit qu'un Jeu naît toujours dans un état valide (RAII). Les méthodes non-const peuvent modifier l'objet ; les const s'engagent à ne pas le faire."
    },
    11: {
      titre: "passer par référence const",
      etat: "Nos objets grandissent : évitons de les copier inutilement en les passant à des fonctions.",
      objectif: "Écris une fonction libre afficherFiche(const Jeu& j) qui affiche un jeu sans le copier ni le modifier. Explique pourquoi const&.",
      hints: [
        "const Jeu& j : référence (pas de copie) + const (lecture seule).",
        "La fonction accède aux méthodes const de j.",
        "Passer par valeur copierait tout l'objet."
      ],
      solution: `#include <iostream>
#include <string>

class Jeu {
    std::string nom_; double prix_;
public:
    Jeu(std::string n, double p) : nom_(n), prix_(p) {}
    const std::string& nom() const { return nom_; }
    double prix() const { return prix_; }
};

void afficherFiche(const Jeu& j) {          // reference const : ni copie, ni modif
    std::cout << j.nom() << " : " << j.prix() << " euros\\n";
}

int main() {
    Jeu catan("Catan", 44.90);
    afficherFiche(catan);
    return 0;
}`,
      note: "const Jeu& est le passage idiomatique en C++ : la référence évite une copie coûteuse, le const garantit qu'on ne modifie pas l'objet de l'appelant. À utiliser par défaut pour les gros objets."
    },
    12: {
      titre: "héritage et polymorphisme",
      etat: "Modélisons les rôles d'utilisateur avec une hiérarchie de classes.",
      objectif: "Crée une classe de base Utilisateur avec une méthode virtuelle remise() (0 %), et des classes dérivées Vendeur (10 %) et Admin (20 %). Appelle remise() via un pointeur/référence de base.",
      hints: [
        "virtual double remise() const { return 0.0; }",
        "class Vendeur : public Utilisateur { ... override };",
        "Le polymorphisme fonctionne via référence ou pointeur de base."
      ],
      solution: `#include <iostream>

class Utilisateur {
public:
    virtual double remise() const { return 0.0; }
    virtual ~Utilisateur() = default;
};
class Vendeur : public Utilisateur {
public:
    double remise() const override { return 0.10; }
};
class Admin : public Utilisateur {
public:
    double remise() const override { return 0.20; }
};

void afficherRemise(const Utilisateur& u) {
    std::cout << "Remise : " << u.remise() * 100 << " %\\n";
}
int main() {
    Vendeur v; Admin a;
    afficherRemise(v);   // 10 %
    afficherRemise(a);   // 20 %
    return 0;
}`,
      note: "virtual permet le polymorphisme : afficherRemise appelle la bonne version selon le type réel. override documente l'intention. Le destructeur virtuel est indispensable dans une classe de base."
    },
    13: {
      titre: "une interface (classe abstraite)",
      etat: "Définissons un contrat que plusieurs classes devront respecter.",
      objectif: "Crée une classe abstraite Payable avec une méthode virtuelle pure montant() const = 0. Fais-en dériver Location et Vente qui l'implémentent.",
      hints: [
        "virtual double montant() const = 0;  // = 0 : méthode virtuelle pure",
        "Une classe avec une méthode virtuelle pure est abstraite (non instanciable).",
        "Chaque classe dérivée doit fournir montant()."
      ],
      solution: `#include <iostream>

class Payable {
public:
    virtual double montant() const = 0;      // interface : virtuelle pure
    virtual ~Payable() = default;
};
class Location : public Payable {
    double prixJour_; int jours_;
public:
    Location(double p, int j) : prixJour_(p), jours_(j) {}
    double montant() const override { return prixJour_ * jours_; }
};
class Vente : public Payable {
    double prix_;
public:
    Vente(double p) : prix_(p) {}
    double montant() const override { return prix_; }
};

int main() {
    Location l(5.0, 4); Vente v(44.90);
    std::cout << l.montant() << " / " << v.montant() << "\\n";
    return 0;
}`,
      note: "Une méthode virtuelle pure (= 0) définit un contrat sans implémentation : c'est l'équivalent C++ d'une interface. Location et Vente sont « Payable » chacune à sa façon."
    },
    14: {
      titre: "un affichage générique (template)",
      etat: "Écrivons du code qui marche pour n'importe quel type, sans le dupliquer.",
      objectif: "Écris une fonction template afficher<T>(const T& valeur) qui affiche n'importe quelle valeur, et teste-la avec un int, un double et un std::string.",
      hints: [
        "template <typename T> void afficher(const T& v) { std::cout << v << \"\\n\"; }",
        "Le compilateur génère une version par type utilisé.",
        "Appelle afficher(42), afficher(3.14), afficher(std::string(\"hi\"))."
      ],
      solution: `#include <iostream>
#include <string>

template <typename T>
void afficher(const T& valeur) {
    std::cout << valeur << "\\n";
}

int main() {
    afficher(42);
    afficher(3.14);
    afficher(std::string("Catan"));
    return 0;
}`,
      note: "Un template génère du code pour chaque type utilisé : une seule écriture, mille usages. C'est le fondement de la STL (vector<T>, map<K,V>...)."
    },
    15: {
      titre: "le catalogue par identifiant (std::map)",
      etat: "Retrouvons un jeu instantanément par son numéro grâce à une map.",
      objectif: "Range des jeux dans une std::map<int, std::string> (id → nom), ajoute-en, teste la présence d'un id (.count / .find) et parcours la map.",
      hints: [
        "std::map<int, std::string> cat; cat[1] = \"Catan\";",
        "if (cat.count(1)) ... ; ou auto it = cat.find(1);",
        "for (const auto& [id, nom] : cat) ...  (structured bindings, C++17)"
      ],
      solution: `#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<int, std::string> catalogue;
    catalogue[1] = "Catan";
    catalogue[2] = "Uno";

    if (catalogue.count(2))
        std::cout << "Jeu 2 : " << catalogue[2] << "\\n";

    for (const auto& [id, nom] : catalogue)     // C++17
        std::cout << id << " -> " << nom << "\\n";
    return 0;
}`,
      note: "std::map associe des clés à des valeurs, triées par clé, avec recherche efficace. Les structured bindings (auto& [id, nom]) déballent chaque paire proprement (C++17)."
    },
    16: {
      titre: "trier et chercher (algorithmes + lambdas)",
      etat: "Utilisons les algorithmes de la STL plutôt que d'écrire nos boucles.",
      objectif: "Trie un std::vector<double> de prix en ordre décroissant avec std::sort et une lambda, puis trouve le premier prix > 30 avec std::find_if.",
      hints: [
        "#include <algorithm> ; std::sort(v.begin(), v.end(), [](double a, double b){ return a > b; });",
        "Une lambda [](params){ corps } est une fonction anonyme.",
        "std::find_if(v.begin(), v.end(), [](double p){ return p > 30; })."
      ],
      solution: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<double> prix = {44.90, 12.50, 39.0, 5.0};
    std::sort(prix.begin(), prix.end(),
              [](double a, double b) { return a > b; });   // decroissant

    auto it = std::find_if(prix.begin(), prix.end(),
                           [](double p) { return p > 30; });
    if (it != prix.end())
        std::cout << "Premier > 30 : " << *it << "\\n";
    for (double p : prix) std::cout << p << " ";
    std::cout << "\\n";
    return 0;
}`,
      note: "std::sort et std::find_if font le travail à ta place ; la lambda définit le critère à la volée. On préfère les algorithmes STL aux boucles manuelles : plus clairs et moins d'erreurs."
    },
    17: {
      titre: "posséder sans fuite (unique_ptr)",
      etat: "Gérons des objets alloués dynamiquement sans jamais fuir ni oublier delete.",
      objectif: "Crée un std::vector<std::unique_ptr<Jeu>> (le catalogue possède les jeux), ajoute des jeux avec std::make_unique, et parcours-les. Aucun delete manuel.",
      hints: [
        "#include <memory> ; auto j = std::make_unique<Jeu>(\"Catan\", 44.90);",
        "vector<unique_ptr<Jeu>> : le vector possède les jeux.",
        "push_back(std::move(j)) car unique_ptr ne se copie pas."
      ],
      solution: `#include <iostream>
#include <memory>
#include <vector>
#include <string>

struct Jeu {
    std::string nom; double prix;
    Jeu(std::string n, double p) : nom(n), prix(p) {}
};

int main() {
    std::vector<std::unique_ptr<Jeu>> cat;
    cat.push_back(std::make_unique<Jeu>("Catan", 44.90));
    cat.push_back(std::make_unique<Jeu>("Uno", 12.50));

    for (const auto& j : cat)
        std::cout << j->nom << " : " << j->prix << "\\n";
    return 0;                     // tout est libere automatiquement (RAII)
}`,
      note: "unique_ptr possède l'objet et le libère automatiquement à la fin : pas de delete, pas de fuite. std::move transfère la possession (unique_ptr ne se copie pas). C'est la gestion mémoire moderne."
    },
    18: {
      titre: "signaler les erreurs (exceptions)",
      etat: "Refusons proprement une opération invalide au lieu de renvoyer des codes.",
      objectif: "Écris une fonction valider_jours(int) qui lance std::invalid_argument si la durée n'est pas entre 1 et 30, et attrape l'exception dans main avec try/catch.",
      hints: [
        "#include <stdexcept> ; throw std::invalid_argument(\"...\").",
        "try { valider_jours(0); } catch (const std::exception& e) { ... }",
        "e.what() donne le message."
      ],
      solution: `#include <iostream>
#include <stdexcept>

void valider_jours(int jours) {
    if (jours < 1 || jours > 30)
        throw std::invalid_argument("Duree invalide (1 a 30)");
}

int main() {
    try {
        valider_jours(0);
    } catch (const std::exception& e) {
        std::cout << "Erreur : " << e.what() << "\\n";
    }
    return 0;
}`,
      note: "Les exceptions séparent le chemin normal du chemin d'erreur. On lance (throw) une exception typée et on l'attrape (catch) là où on sait réagir. e.what() décrit le problème."
    },
    19: {
      titre: "sauvegarder le catalogue (fstream)",
      etat: "Rendons les données persistantes en écrivant dans un fichier.",
      objectif: "Écris les jeux d'un catalogue (id, nom, prix) dans un fichier « catalogue.txt » avec std::ofstream, une ligne par jeu (champs séparés par ;). Vérifie l'ouverture.",
      hints: [
        "#include <fstream> ; std::ofstream f(\"catalogue.txt\");",
        "if (!f) { ... erreur ... }",
        "f << id << ';' << nom << ';' << prix << '\\n';"
      ],
      solution: `#include <fstream>
#include <iostream>
#include <vector>
#include <string>

struct Jeu { int id; std::string nom; double prix; };

int main() {
    std::vector<Jeu> cat = { {1,"Catan",44.90}, {2,"Uno",12.50} };
    std::ofstream f("catalogue.txt");
    if (!f) { std::cerr << "Ouverture impossible\\n"; return 1; }
    for (const auto& j : cat)
        f << j.id << ';' << j.nom << ';' << j.prix << '\\n';
    // f se ferme tout seul (RAII) a la fin du bloc
    std::cout << "Catalogue enregistre.\\n";
    return 0;
}`,
      note: "std::ofstream écrit dans un fichier avec le même << que cout. Grâce au RAII, le fichier se ferme automatiquement en fin de portée : pas de fclose à oublier."
    },
    20: {
      titre: "le gestionnaire complet",
      etat: "Assemblons les briques : une classe Catalogue avec un menu.",
      objectif: "Écris une classe Catalogue qui contient un std::vector<Jeu>, avec ajouter(Jeu) et lister() const, puis une petite boucle de menu (ajouter / lister / quitter) dans main.",
      hints: [
        "class Catalogue { std::vector<Jeu> jeux_; public: void ajouter(const Jeu&); void lister() const; };",
        "Le menu : do { ... } while (choix != 0);",
        "Lire un nom avec espaces : std::getline (après std::cin >> choix, penser à ignorer le \\n)."
      ],
      solution: `#include <iostream>
#include <vector>
#include <string>

struct Jeu { std::string nom; double prix; };

class Catalogue {
    std::vector<Jeu> jeux_;
public:
    void ajouter(const Jeu& j) { jeux_.push_back(j); }
    void lister() const {
        for (std::size_t i = 0; i < jeux_.size(); ++i)
            std::cout << i + 1 << ". " << jeux_[i].nom
                      << " (" << jeux_[i].prix << ")\\n";
    }
};

int main() {
    Catalogue cat;
    cat.ajouter({"Catan", 44.90});
    cat.ajouter({"Uno", 12.50});
    cat.lister();
    return 0;
}`,
      note: "La classe Catalogue encapsule le vector et expose des opérations claires (ajouter, lister). C'est le cœur objet de l'application : des données protégées et des méthodes qui les manipulent."
    },
    21: {
      titre: "bilan et suite du parcours",
      etat: "La Ludothèque tient debout en C++ moderne : classes, STL, RAII, exceptions, fichiers.",
      objectif: "Écris une fonction libre prixMoyen(const std::vector<Jeu>&) qui renvoie le prix moyen du catalogue avec std::accumulate, et le nom du jeu le plus cher avec std::max_element.",
      hints: [
        "#include <numeric> ; std::accumulate(v.begin(), v.end(), 0.0, [](double s, const Jeu& j){ return s + j.prix; }).",
        "std::max_element(v.begin(), v.end(), [](const Jeu& a, const Jeu& b){ return a.prix < b.prix; }).",
        "max_element renvoie un itérateur : déréférence-le."
      ],
      solution: `#include <iostream>
#include <vector>
#include <string>
#include <numeric>
#include <algorithm>

struct Jeu { std::string nom; double prix; };

double prixMoyen(const std::vector<Jeu>& v) {
    double s = std::accumulate(v.begin(), v.end(), 0.0,
                 [](double acc, const Jeu& j) { return acc + j.prix; });
    return v.empty() ? 0.0 : s / v.size();
}

int main() {
    std::vector<Jeu> cat = { {"Catan",44.90}, {"Uno",12.50}, {"Risk",39.0} };
    std::cout << "Moyenne : " << prixMoyen(cat) << "\\n";
    auto cher = std::max_element(cat.begin(), cat.end(),
                 [](const Jeu& a, const Jeu& b) { return a.prix < b.prix; });
    std::cout << "Le plus cher : " << cher->nom << "\\n";
    return 0;
}`,
      note: "Bravo : tu as bâti la Ludothèque en C++ moderne, en t'appuyant sur la STL (accumulate, max_element) et les lambdas. La suite du parcours (bases de données, projets) réutilise ces classes. Compare aussi avec la version bas niveau pour voir ce que la STL t'épargne !"
    }
  }
};
