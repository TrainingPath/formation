/* ===== Fil rouge « La Ludothèque » — cours C++ bas niveau (21 étapes) =====
   Même application que dans tous les cours. Ici, style proche du C : pointeurs
   bruts, new/delete, gestion mémoire manuelle, règle de trois — pour comprendre
   ce que la STL et le RAII automatisent dans la version moderne. */
var FIL = {
  prefix: "cppb21",
  app: "La Ludothèque",
  placeholder: "Écris ton code C++ ici…",
  etapes: {
    1: {
      titre: "l'écran d'accueil",
      etat: "Le projet démarre : rien n'existe. La ludothèque doit se présenter au lancement.",
      objectif: "Écris un programme C++ qui affiche une bannière d'accueil (nom + promesse) encadrée par des lignes de séparation, avec std::cout.",
      hints: [
        "#include <iostream> ; int main() { ... }",
        "std::cout << \"...\" << \"\\n\";",
        "Une boucle ou std::string(40,'=') pour la ligne."
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
      note: "On démarre comme en C++ moderne (cout), mais dans ce cours on ira vite regarder sous le capot : pointeurs, mémoire, gestion manuelle."
    },
    2: {
      titre: "représenter un jeu",
      etat: "Décrivons un jeu avec des variables typées, comme en C.",
      objectif: "Déclare nom (const char* ou std::string), prixAchat, prixLocation (double), stock (int) et affiche-les.",
      hints: [
        "double prixAchat = 44.90; int stock = 3;",
        "const char* nom = \"Catan\"; (style C) ou std::string.",
        "std::cout enchaîne avec <<."
      ],
      solution: `#include <iostream>

int main() {
    const char* nom = "Catan";     // chaine « a la C »
    double prixAchat = 44.90, prixLocation = 5.0;
    int stock = 3;

    std::cout << nom << " : achat " << prixAchat
              << ", loc " << prixLocation << "/j, stock " << stock << "\\n";
    return 0;
}`,
      note: "const char* est la chaine « a la C » : un pointeur vers des caracteres. On verra ses limites (leçon 6) et pourquoi std::string est plus sur."
    },
    3: {
      titre: "l'adresse d'un prix (pointeur)",
      etat: "Regardons la mémoire : un pointeur contient l'adresse d'une variable.",
      objectif: "Déclare un double prix, un pointeur double* p vers lui, affiche la valeur via *p, puis modifie le prix à travers le pointeur.",
      hints: [
        "double* p = &prix; (&prix = adresse de prix)",
        "*p accède à la valeur pointée.",
        "*p = 39.90; modifie prix."
      ],
      solution: `#include <iostream>

int main() {
    double prix = 44.90;
    double* p = &prix;        // p pointe vers prix
    std::cout << *p << "\\n";  // 44.9 (valeur pointee)
    *p = 39.90;               // modifie prix a travers le pointeur
    std::cout << prix << "\\n"; // 39.9
    return 0;
}`,
      note: "Le pointeur du C existe aussi en C++ : &prix donne l'adresse, *p la valeur pointee. C'est le mecanisme brut que les references (leçon 4) et les smart pointers rendent plus surs."
    },
    4: {
      titre: "référence ou pointeur pour modifier",
      etat: "Comparons deux façons de modifier une variable dans une fonction.",
      objectif: "Écris deux fonctions qui appliquent une remise : l'une par pointeur (double*), l'autre par référence (double&). Montre qu'elles modifient l'original.",
      hints: [
        "void remisePtr(double* p, double t) { *p *= (1 - t); }",
        "void remiseRef(double& r, double t) { r *= (1 - t); }",
        "Appels : remisePtr(&prix, 0.1); remiseRef(prix, 0.1);"
      ],
      solution: `#include <iostream>

void remisePtr(double* p, double taux) { *p *= (1.0 - taux); }
void remiseRef(double& r, double taux) { r *= (1.0 - taux); }

int main() {
    double a = 50.0, b = 50.0;
    remisePtr(&a, 0.20);   // via pointeur (&a, *p)
    remiseRef(b, 0.20);    // via reference (plus simple)
    std::cout << a << " " << b << "\\n";  // 40 40
    return 0;
}`,
      note: "Pointeur et reference modifient l'original. La reference est plus sure (jamais nulle, pas de *) : en C++, on la prefere quand on n'a pas besoin de la souplesse du pointeur."
    },
    5: {
      titre: "le catalogue en tableau",
      etat: "Stockons plusieurs prix dans un tableau C et parcourons-le.",
      objectif: "Déclare un tableau double prix[4], calcule sa taille avec sizeof, et affiche total et moyenne. Reste dans les bornes (0..n-1).",
      hints: [
        "double prix[4] = {44.90, 12.50, 39.0, 19.90};",
        "int n = sizeof(prix) / sizeof(prix[0]);",
        "for (int i = 0; i < n; i++) somme += prix[i];"
      ],
      solution: `#include <iostream>

int main() {
    double prix[4] = {44.90, 12.50, 39.0, 19.90};
    int n = sizeof(prix) / sizeof(prix[0]);
    double somme = 0.0;
    for (int i = 0; i < n; i++)
        somme += prix[i];       // prix[i] == *(prix + i)
    std::cout << "Total " << somme << " | Moyenne " << somme / n << "\\n";
    return 0;
}`,
      note: "Le tableau C est un bloc contigu ; prix[i] equivaut a *(prix + i) (arithmetique de pointeurs). Aucune verification de bornes : c'est a toi d'y veiller, contrairement a std::vector."
    },
    6: {
      titre: "le nom du jeu (chaînes)",
      etat: "Manipulons du texte, en comparant le style C et std::string.",
      objectif: "Montre une chaîne char[] avec strlen/strcmp (style C), puis la même chose avec std::string (== et .size()). Souligne la sûreté de std::string.",
      hints: [
        "#include <cstring> pour strlen/strcmp.",
        "char nom[] = \"Catan\"; strlen(nom); strcmp(nom, \"Catan\").",
        "std::string s = \"Catan\"; s == \"Catan\"; s.size();"
      ],
      solution: `#include <iostream>
#include <cstring>
#include <string>

int main() {
    // style C
    char nomC[] = "Catan";
    std::cout << strlen(nomC) << " " << (strcmp(nomC, "Catan") == 0) << "\\n";
    // C++ : plus sur
    std::string nom = "Catan";
    std::cout << nom.size() << " " << (nom == "Catan") << "\\n";
    return 0;
}`,
      note: "En C, une chaine est un char[] termine par '\\0' : strlen/strcmp, aucune borne. std::string gere tout (==, .size(), pas de debordement). On comprend ainsi POURQUOI std::string existe."
    },
    7: {
      titre: "réapprovisionner (par référence)",
      etat: "Écrivons une fonction qui modifie le stock d'un jeu.",
      objectif: "Écris void reappro(int& stock, int n) qui augmente le stock. Montre l'appel sans & (grâce à la référence).",
      hints: [
        "void reappro(int& stock, int n) { stock += n; }",
        "Appel : reappro(stock, 5); (pas de &)",
        "La reference agit sur la variable de l'appelant."
      ],
      solution: `#include <iostream>

void reappro(int& stock, int n) { stock += n; }

int main() {
    int stock = 3;
    reappro(stock, 5);        // pas de & : la reference s'en charge
    std::cout << "Stock : " << stock << "\\n";  // 8
    return 0;
}`,
      note: "La reference (int&) remplace le pointeur (int*) du C pour modifier un argument : plus simple a l'appel, pas de risque de pointeur nul. On la prefere quand la modification est le seul but."
    },
    8: {
      titre: "la structure Jeu",
      etat: "Regroupons les données d'un jeu, d'abord en struct puis en class.",
      objectif: "Définis un struct Jeu (nom, prix, stock, membres publics), remplis-en un et affiche-le. Explique la différence struct/class.",
      hints: [
        "struct Jeu { std::string nom; double prix; int stock; };",
        "struct = membres publics par defaut ; class = prives.",
        "Jeu j{\"Catan\", 44.90, 3}; puis j.nom, j.prix..."
      ],
      solution: `#include <iostream>
#include <string>

struct Jeu {
    std::string nom;    // public par defaut (struct)
    double prix;
    int stock;
};

int main() {
    Jeu j{"Catan", 44.90, 3};
    std::cout << j.nom << " : " << j.prix << " (stock " << j.stock << ")\\n";
    return 0;
}`,
      note: "En C++, struct et class sont presque identiques : struct rend les membres publics par defaut, class prives. On utilise struct pour un simple agregat, class quand on veut encapsuler."
    },
    9: {
      titre: "allouer un jeu (new / delete)",
      etat: "Créons un jeu dont la durée de vie dépasse une fonction : allocation dynamique.",
      objectif: "Alloue un Jeu avec new, utilise-le via ->, puis libère-le avec delete. Rappelle qu'un new = un delete.",
      hints: [
        "Jeu* j = new Jeu{\"Catan\", 44.90, 3};",
        "Acces via j->nom (fleche, car pointeur).",
        "delete j; a la fin (sinon fuite). Remets j = nullptr."
      ],
      solution: `#include <iostream>
#include <string>

struct Jeu { std::string nom; double prix; int stock; };

int main() {
    Jeu* j = new Jeu{"Catan", 44.90, 3};   // sur le tas
    std::cout << j->nom << " : " << j->prix << "\\n";  // fleche
    delete j;             // un new => un delete
    j = nullptr;          // bonne habitude
    return 0;
}`,
      note: "new alloue sur le tas et renvoie un pointeur ; delete libere. A chaque new doit correspondre un delete, sinon fuite. En C++ moderne, unique_ptr fait ce delete a ta place — ici on le fait a la main pour comprendre."
    },
    10: {
      titre: "un catalogue dynamique (new[])",
      etat: "Le nombre de jeux n'est connu qu'à l'exécution : allouons un tableau dynamique.",
      objectif: "Demande n, alloue un tableau de n double avec new[], remplis-le, affiche la somme, puis libère avec delete[].",
      hints: [
        "double* prix = new double[n];",
        "Remplir avec une boucle ; ne pas depasser n.",
        "delete[] prix; (delete[] pour un tableau, pas delete)."
      ],
      solution: `#include <iostream>

int main() {
    int n;
    std::cout << "Combien de jeux ? ";
    if (!(std::cin >> n) || n <= 0) return 1;

    double* prix = new double[n];       // tableau dynamique
    double somme = 0.0;
    for (int i = 0; i < n; i++) {
        prix[i] = 10.0 + i;
        somme += prix[i];
    }
    std::cout << "Somme : " << somme << "\\n";

    delete[] prix;      // delete[] pour un tableau alloue par new[]
    return 0;
}`,
      note: "new[] alloue un tableau, delete[] le libere : ne jamais mélanger delete et delete[]. En C++ moderne, on utiliserait std::vector qui gere tout ça — ici on voit le mecanisme brut."
    },
    11: {
      titre: "une classe qui possède une ressource",
      etat: "Écrivons une classe qui alloue et libère elle-même sa mémoire (RAII manuel).",
      objectif: "Crée une classe Catalogue qui alloue un tableau de n double dans son constructeur et le libère dans son destructeur. Affiche un message à la construction et à la destruction.",
      hints: [
        "Membre : double* prix_; int n_;",
        "Constructeur : prix_ = new double[n]; ...",
        "Destructeur : ~Catalogue() { delete[] prix_; }"
      ],
      solution: `#include <iostream>

class Catalogue {
    double* prix_;
    int n_;
public:
    Catalogue(int n) : prix_(new double[n]), n_(n) {
        for (int i = 0; i < n_; i++) prix_[i] = 0.0;
        std::cout << "Catalogue cree (" << n_ << ")\\n";
    }
    ~Catalogue() { delete[] prix_; std::cout << "Catalogue detruit\\n"; }
    void set(int i, double v) { if (i >= 0 && i < n_) prix_[i] = v; }
    double get(int i) const { return prix_[i]; }
};

int main() {
    Catalogue c(3);
    c.set(0, 44.90);
    std::cout << c.get(0) << "\\n";
    return 0;               // ~Catalogue() libere automatiquement
}`,
      note: "Le constructeur acquiert la ressource (new[]), le destructeur la libere (delete[]) : c'est le RAII, mais ecrit a la main. Attention : une telle classe DOIT gerer sa copie (leçon 12) — sinon deux objets liberent le meme tableau."
    },
    12: {
      titre: "la règle de trois (copie profonde)",
      etat: "Notre Catalogue possède un pointeur : sa copie par défaut est dangereuse.",
      objectif: "Ajoute à Catalogue un constructeur de copie qui fait une COPIE PROFONDE (nouveau tableau), pour éviter que deux objets partagent le même pointeur.",
      hints: [
        "Copie par defaut = copie du pointeur (les deux liberent le meme => double free).",
        "Constructeur de copie : Catalogue(const Catalogue& o) { prix_ = new double[o.n_]; copier... }",
        "La regle de trois : destructeur + constructeur de copie + operateur= vont ensemble."
      ],
      solution: `#include <iostream>
#include <algorithm>

class Catalogue {
    double* prix_;
    int n_;
public:
    Catalogue(int n) : prix_(new double[n]), n_(n) {
        std::fill(prix_, prix_ + n_, 0.0);
    }
    // constructeur de COPIE : copie profonde
    Catalogue(const Catalogue& o) : prix_(new double[o.n_]), n_(o.n_) {
        std::copy(o.prix_, o.prix_ + n_, prix_);
    }
    ~Catalogue() { delete[] prix_; }
    void set(int i, double v) { prix_[i] = v; }
    double get(int i) const { return prix_[i]; }
};

int main() {
    Catalogue a(2);
    a.set(0, 44.90);
    Catalogue b = a;     // copie PROFONDE (grace au constructeur de copie)
    b.set(0, 99.0);
    std::cout << a.get(0) << " " << b.get(0) << "\\n";  // 44.9 99 (independants)
    return 0;
}`,
      note: "Sans constructeur de copie, b = a copierait juste le pointeur : a et b liberaient le meme tableau (double free) et se marcheraient dessus. La regle de trois (destructeur, copie, affectation) va toujours ensemble pour une classe a pointeur brut."
    },
    13: {
      titre: "l'opérateur d'affectation",
      etat: "Complétons la règle de trois avec l'affectation entre objets existants.",
      objectif: "Ajoute à Catalogue l'opérateur= qui libère l'ancien tableau, en alloue un nouveau et copie, en gérant l'auto-affectation (a = a).",
      hints: [
        "Catalogue& operator=(const Catalogue& o) { if (this == &o) return *this; ... }",
        "Libere prix_ actuel, alloue new double[o.n_], copie, renvoie *this.",
        "Le test this == &o evite de se detruire soi-meme."
      ],
      solution: `#include <iostream>
#include <algorithm>

class Catalogue {
    double* prix_;
    int n_;
public:
    Catalogue(int n) : prix_(new double[n]), n_(n) { std::fill(prix_, prix_+n_, 0.0); }
    Catalogue(const Catalogue& o) : prix_(new double[o.n_]), n_(o.n_) {
        std::copy(o.prix_, o.prix_ + n_, prix_);
    }
    Catalogue& operator=(const Catalogue& o) {
        if (this == &o) return *this;         // auto-affectation
        delete[] prix_;                       // libere l'ancien
        n_ = o.n_;
        prix_ = new double[n_];
        std::copy(o.prix_, o.prix_ + n_, prix_);
        return *this;
    }
    ~Catalogue() { delete[] prix_; }
    void set(int i, double v) { prix_[i] = v; }
    double get(int i) const { return prix_[i]; }
};

int main() {
    Catalogue a(2), b(2);
    a.set(0, 44.90);
    b = a;                    // operator=
    std::cout << b.get(0) << "\\n";  // 44.9
    return 0;
}`,
      note: "L'operateur= complete la regle de trois : il libere l'ancienne ressource avant d'en copier une nouvelle, et gere l'auto-affectation (a = a). En C++ moderne, un membre std::vector rendrait tout cela automatique — d'ou l'interet de la STL."
    },
    14: {
      titre: "héritage et fonctions virtuelles",
      etat: "Modélisons les rôles avec une hiérarchie et le polymorphisme.",
      objectif: "Crée une base Utilisateur avec virtual double remise() const, des dérivées Vendeur (10 %) et Admin (20 %), et appelle remise() via un pointeur de base.",
      hints: [
        "virtual double remise() const { return 0; } et virtual ~Utilisateur() = default;",
        "Vendeur : public Utilisateur { double remise() const override {...} };",
        "Utilisateur* u = new Vendeur(); u->remise();  (delete u ensuite)"
      ],
      solution: `#include <iostream>

class Utilisateur {
public:
    virtual double remise() const { return 0.0; }
    virtual ~Utilisateur() = default;      // destructeur virtuel : ESSENTIEL
};
class Vendeur : public Utilisateur {
public:
    double remise() const override { return 0.10; }
};

int main() {
    Utilisateur* u = new Vendeur();        // pointeur de base
    std::cout << u->remise() * 100 << " %\\n";  // 10 % (type reel)
    delete u;                              // grace au destructeur virtuel, ~Vendeur puis ~Utilisateur
    return 0;
}`,
      note: "virtual active la table des fonctions virtuelles (vtable) : u->remise() appelle la version du type reel. Le destructeur virtuel est OBLIGATOIRE : sans lui, delete u ne detruirait que la partie Utilisateur (fuite/comportement indefini)."
    },
    15: {
      titre: "organiser en .h / .cpp",
      etat: "Le code grossit : séparons déclarations et définitions.",
      objectif: "Écris jeu.h (déclaration de la struct/classe Jeu et d'une fonction) avec un include guard, et jeu.cpp (définition). Donne la commande de compilation.",
      hints: [
        "jeu.h : #ifndef JEU_H / #define JEU_H / declarations / #endif (ou #pragma once).",
        "jeu.cpp : #include \"jeu.h\" puis les definitions.",
        "g++ -std=c++17 main.cpp jeu.cpp -o app"
      ],
      solution: `// jeu.h
#ifndef JEU_H
#define JEU_H
#include <string>
struct Jeu {
    std::string nom;
    double prix;
};
double tarif(const Jeu& j, int jours);   // declaration
#endif

// jeu.cpp
#include "jeu.h"
double tarif(const Jeu& j, int jours) {
    double t = j.prix * jours;
    if (jours >= 3) t *= 0.9;
    return t;
}

// Compiler avec main.cpp : g++ -std=c++17 -Wall main.cpp jeu.cpp -o app`,
      note: "Comme en C : declarations dans le .h (avec include guard ou #pragma once), definitions dans le .cpp, guillemets pour tes en-tetes. On compile tous les .cpp ensemble."
    },
    16: {
      titre: "sauvegarder le catalogue (fstream)",
      etat: "Rendons les données persistantes dans un fichier.",
      objectif: "Écris les jeux (nom;prix) d'un tableau dans « catalogue.txt » avec std::ofstream, en vérifiant l'ouverture.",
      hints: [
        "#include <fstream> ; std::ofstream f(\"catalogue.txt\");",
        "if (!f) return 1;",
        "f << jeu.nom << ';' << jeu.prix << '\\n';"
      ],
      solution: `#include <fstream>
#include <iostream>
#include <string>

struct Jeu { std::string nom; double prix; };

int main() {
    Jeu cat[2] = { {"Catan", 44.90}, {"Uno", 12.50} };
    std::ofstream f("catalogue.txt");
    if (!f) { std::cerr << "Ouverture impossible\\n"; return 1; }
    for (int i = 0; i < 2; i++)
        f << cat[i].nom << ';' << cat[i].prix << '\\n';
    // f ferme automatiquement (RAII) : un des rares confort deja present
    return 0;
}`,
      note: "std::ofstream ecrit avec << et se ferme tout seul (RAII) : meme en style bas niveau, les flux C++ evitent le fopen/fclose du C. On teste toujours l'ouverture."
    },
    17: {
      titre: "traquer les fuites",
      etat: "Avec new/delete manuels, il faut vérifier qu'on ne fuit pas.",
      objectif: "Reprends une allocation new[] et montre le cycle correct (allouer, vérifier, utiliser, delete[]). Indique la commande valgrind / sanitizer.",
      hints: [
        "delete[] pour ce qui vient de new[].",
        "Remets le pointeur a nullptr apres delete.",
        "Test : valgrind ./app  ou  g++ -g -fsanitize=address ..."
      ],
      solution: `#include <iostream>

int main() {
    int n = 4;
    double* t = new double[n];      // allouer
    for (int i = 0; i < n; i++) t[i] = i * i;   // utiliser (dans les bornes)
    for (int i = 0; i < n; i++) std::cout << t[i] << " ";
    std::cout << "\\n";
    delete[] t;                     // liberer
    t = nullptr;                    // neutraliser
    return 0;
}
// Tester : valgrind --leak-check=full ./app
//     ou : g++ -g -fsanitize=address prog.cpp -o prog ; ./prog`,
      note: "En style bas niveau, chaque new[] a son delete[], et on reste dans les bornes. valgrind et l'AddressSanitizer confirment l'absence de fuite et d'acces invalide — indispensables quand on gere la memoire a la main."
    },
    18: {
      titre: "trier avec un pointeur de fonction",
      etat: "Rendons un tri configurable via une fonction passée en paramètre.",
      objectif: "Utilise std::qsort (ou une fonction de comparaison passée en pointeur) pour trier un tableau de double, ou écris ta propre fonction de tri prenant un pointeur de fonction de comparaison.",
      hints: [
        "Un pointeur de fonction : int (*cmp)(const void*, const void*).",
        "std::qsort(t, n, sizeof(double), cmp);  (#include <cstdlib>)",
        "cmp reconvertit les void* en double* et compare."
      ],
      solution: `#include <iostream>
#include <cstdlib>

int cmp_asc(const void* a, const void* b) {
    double x = *(const double*)a, y = *(const double*)b;
    return (x < y) ? -1 : (x > y) ? 1 : 0;
}

int main() {
    double t[4] = {44.90, 12.50, 39.0, 5.0};
    std::qsort(t, 4, sizeof(double), cmp_asc);   // tri via pointeur de fonction
    for (double x : t) std::cout << x << " ";
    std::cout << "\\n";
    return 0;
}`,
      note: "Un pointeur de fonction passe un comportement en parametre : std::qsort (herite du C) l'utilise pour comparer. En C++ moderne, on prefererait std::sort avec une lambda — plus sur et plus lisible. Ici, on voit le mecanisme brut."
    },
    19: {
      titre: "constantes : #define, const, constexpr",
      etat: "Fixons des constantes proprement, en comparant l'ancien et le moderne.",
      objectif: "Montre une constante en #define (préprocesseur, style C) et son équivalent const/constexpr (typé, préféré en C++), par exemple la TVA et une capacité MAX.",
      hints: [
        "#define TVA 0.20  (substitution de texte, sans type)",
        "const double tva = 0.20;  constexpr int MAX = 100;",
        "En C++, on prefere const/constexpr (types, portee)."
      ],
      solution: `#include <iostream>

#define TVA_MACRO 0.20             // style C : substitution de texte, sans type

int main() {
    const double tva = 0.20;       // typee, respecte la portee
    constexpr int MAX = 100;       // connue a la compilation
    double ht = 44.90;

    std::cout << ht * (1 + tva) << " (max " << MAX << ")\\n";
    std::cout << ht * (1 + TVA_MACRO) << "\\n";
    return 0;
}`,
      note: "#define fait une substitution de texte sans type ni portee : source de bugs. En C++, const et constexpr sont types et respectent la portee — on les prefere. constexpr garantit meme un calcul a la compilation."
    },
    20: {
      titre: "le gestionnaire complet",
      etat: "Assemblons : une classe Catalogue à mémoire manuelle avec un menu.",
      objectif: "Écris une classe Catalogue qui gère un tableau dynamique de Jeu (new[]/delete[]), avec ajouter (redimensionnement) et lister. Montre le squelette d'un menu.",
      hints: [
        "Membres : Jeu* jeux_; int taille_; int capacite_;",
        "ajouter : si taille_ == capacite_, réallouer plus grand (new[], copier, delete[]).",
        "Destructeur : delete[] jeux_;"
      ],
      solution: `#include <iostream>
#include <string>

struct Jeu { std::string nom; double prix; };

class Catalogue {
    Jeu* jeux_;
    int taille_, capacite_;
public:
    Catalogue() : jeux_(new Jeu[2]), taille_(0), capacite_(2) {}
    ~Catalogue() { delete[] jeux_; }
    void ajouter(const Jeu& j) {
        if (taille_ == capacite_) {              // agrandir
            capacite_ *= 2;
            Jeu* neuf = new Jeu[capacite_];
            for (int i = 0; i < taille_; i++) neuf[i] = jeux_[i];
            delete[] jeux_;
            jeux_ = neuf;
        }
        jeux_[taille_++] = j;
    }
    void lister() const {
        for (int i = 0; i < taille_; i++)
            std::cout << i + 1 << ". " << jeux_[i].nom << " (" << jeux_[i].prix << ")\\n";
    }
};

int main() {
    Catalogue c;
    c.ajouter({"Catan", 44.90});
    c.ajouter({"Uno", 12.50});
    c.ajouter({"Risk", 39.0});   // declenche un agrandissement
    c.lister();
    return 0;
}`,
      note: "Ce Catalogue reimplemente a la main ce que std::vector fait tout seul : capacite, agrandissement (new[]/copie/delete[]), liberation. Le comparer a la version moderne (un simple std::vector<Jeu>) montre tout ce que la STL t'epargne."
    },
    21: {
      titre: "bilan et comparaison",
      etat: "La Ludothèque tient debout en C++ bas niveau : pointeurs, new/delete, règle de trois.",
      objectif: "Écris une fonction qui calcule le prix moyen d'un tableau C de Jeu (Jeu* + taille), puis compare mentalement avec la version moderne (std::vector + std::accumulate).",
      hints: [
        "double moyenne(const Jeu* t, int n) { ... somme / n ... }",
        "Parcours par indice (i < n), lecture via t[i].prix.",
        "En moderne : std::accumulate ferait la somme en une ligne."
      ],
      solution: `#include <iostream>
#include <string>

struct Jeu { std::string nom; double prix; };

double moyenne(const Jeu* t, int n) {
    if (n == 0) return 0.0;
    double s = 0.0;
    for (int i = 0; i < n; i++) s += t[i].prix;
    return s / n;
}

int main() {
    Jeu cat[3] = { {"Catan",44.90}, {"Uno",12.50}, {"Risk",39.0} };
    std::cout << "Moyenne : " << moyenne(cat, 3) << "\\n";
    return 0;
}
// Version moderne (rappel) :
//   std::accumulate(v.begin(), v.end(), 0.0,
//       [](double s, const Jeu& j){ return s + j.prix; }) / v.size();`,
      note: "Bravo : tu as construit la Ludotheque au plus pres de la machine (pointeurs, tableaux, new/delete, regle de trois). Tu sais maintenant ce que la STL et le RAII automatisent — et pourquoi le C++ moderne les prefere. La suite du parcours reutilise ces bases."
    }
  }
};
