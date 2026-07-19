/* ===== Fil rouge « La Ludothèque » — cours C (21 étapes) =====
   Même application que dans tous les cours, pour comparer les langages.
   Ludothèque de jeux de société : catalogue, 3 rôles (client, vendeur,
   administrateur), achat ET location. Procédural du début à la fin : on
   passe des variables aux tableaux, puis aux struct, pointeurs et
   allocation dynamique — au plus près de la mémoire. */
var FIL = {
  prefix: "c21",
  app: "La Ludothèque",
  placeholder: "Écris ton code C ici…",
  etapes: {
    1: {
      titre: "l'écran d'accueil",
      etat: "Le projet démarre : rien n'existe encore. La ludothèque doit se présenter quand on lance le programme.",
      objectif: "Écris un programme complet qui affiche une bannière d'accueil : le nom « La Ludotheque » et sa promesse (achat &amp; location), encadrée par des lignes de séparation.",
      hints: [
        "N'oublie pas #include <stdio.h>, int main(void) et return 0;.",
        "printf(\"...\\n\") affiche une ligne ; c'est à toi d'ajouter le \\n.",
        "Pour une ligne de séparation, un printf d'une suite de = suffit."
      ],
      solution: `#include <stdio.h>

int main(void) {
    printf("========================================\\n");
    printf("       BIENVENUE A LA LUDOTHEQUE\\n");
    printf("   Achat & location de jeux de societe\\n");
    printf("========================================\\n");
    return 0;
}`,
      note: "Compare avec Python (print) ou Java (System.out.println) : même idée, mais en C il faut #include, main, et ajouter soi-même les \\n. On compile avec gcc, on lance avec ./prog."
    },
    2: {
      titre: "représenter un jeu",
      etat: "L'accueil s'affiche. Un catalogue a besoin de données : décrivons un jeu avec les bons types.",
      objectif: "Déclare les variables d'un jeu : nom (on l'affichera en dur pour l'instant), prixAchat et prixLocation (double), stock (int), et un booléen disponible calculé depuis le stock. Affiche-les avec les bons spécificateurs.",
      hints: [
        "En C, le type est explicite : double prixAchat = 44.90;",
        "int disponible = stock > 0;  (0 ou 1) ; ou bool avec #include <stdbool.h>.",
        "Affiche les réels avec %.2f et l'entier avec %d."
      ],
      solution: `#include <stdio.h>

int main(void) {
    double prixAchat = 44.90;     // prix de vente
    double prixLocation = 5.0;    // par jour
    int stock = 3;
    int disponible = stock > 0;   // 1 si en stock, 0 sinon

    printf("Catan : achat %.2f, loc %.2f/j, stock %d, dispo %d\\n",
           prixAchat, prixLocation, stock, disponible);
    return 0;
}`,
      note: "Contrairement à Python (typage dynamique), C exige de déclarer chaque type. Plus verbeux, mais le compilateur détecte les erreurs de type avant l'exécution."
    },
    3: {
      titre: "calculer un tarif de location",
      etat: "Un jeu est décrit. Calculons le coût d'une location de plusieurs jours.",
      objectif: "Calcule prix par jour × nombre de jours, avec 10 % de remise dès 3 jours. Affiche le total à 2 décimales.",
      hints: [
        "total *= 0.9; applique -10 %.",
        "Garde total en double pour éviter la division/troncature entière.",
        "Affiche avec %.2f — indispensable pour de l'argent."
      ],
      solution: `#include <stdio.h>

int main(void) {
    double prixLocation = 5.0;
    int jours = 4;
    double total = prixLocation * jours;
    if (jours >= 3)
        total *= 0.9;             // -10 % des 3 jours
    printf("Location %d jours : %.2f euros\\n", jours, total);
    return 0;
}`,
      note: "prixLocation est un double, donc la multiplication reste réelle : pas de piège de division entière. %.2f force 2 décimales."
    },
    4: {
      titre: "un premier menu interactif",
      etat: "Rendons le programme interactif : l'utilisateur choisit une action.",
      objectif: "Affiche un menu (1 = acheter, 2 = louer), lis le choix avec scanf, puis récapitule le choix. N'oublie pas le &amp; devant la variable.",
      hints: [
        "int choix; scanf(\"%d\", &choix);  — le & est obligatoire.",
        "Teste le retour de scanf pour valider la saisie.",
        "Un printf sert de « prompt » avant chaque scanf."
      ],
      solution: `#include <stdio.h>

int main(void) {
    int choix;
    printf("1) Acheter  2) Louer\\n");
    printf("Ton choix ? ");
    if (scanf("%d", &choix) != 1) return 1;

    if (choix == 1)
        printf("Tu veux acheter.\\n");
    else if (choix == 2)
        printf("Tu veux louer.\\n");
    else
        printf("Choix inconnu.\\n");
    return 0;
}`,
      note: "Le & de scanf donne l'adresse où ranger la saisie : c'est un avant-goût des pointeurs (leçon 10). On vérifie toujours le retour de scanf."
    },
    5: {
      titre: "classer un stock",
      etat: "Le menu répond. Aidons le vendeur à voir d'un coup d'œil l'état d'un stock.",
      objectif: "Selon le stock d'un jeu, affiche « Rupture » (0), « Stock faible » (moins de 5) ou « Stock ok ». Utilise if / else if / else.",
      hints: [
        "Attention : == pour comparer, pas = (qui affecte).",
        "Ordonne les tests : d'abord == 0, puis < 5, puis le reste.",
        "Des accolades autour de chaque branche évitent bien des bugs."
      ],
      solution: `#include <stdio.h>

int main(void) {
    int stock = 3;
    if (stock == 0) {
        printf("Rupture\\n");
    } else if (stock < 5) {
        printf("Stock faible\\n");
    } else {
        printf("Stock ok\\n");
    }
    return 0;
}`,
      note: "Le piège classique du C : if (stock = 0) affecterait 0 au lieu de comparer. Compile avec -Wall pour être averti."
    },
    6: {
      titre: "afficher un tarif dégressif",
      etat: "Les clients veulent connaître le prix selon la durée. Dressons un petit tableau des tarifs.",
      objectif: "Avec une boucle for, affiche le tarif de location cumulé pour 1 à 7 jours (5 €/jour), avec 10 % de remise dès 3 jours.",
      hints: [
        "for (int jours = 1; jours <= 7; jours++) { ... }",
        "Recalcule total = 5.0 * jours à chaque tour.",
        "Applique la remise seulement si jours >= 3."
      ],
      solution: `#include <stdio.h>

int main(void) {
    for (int jours = 1; jours <= 7; jours++) {
        double total = 5.0 * jours;
        if (jours >= 3)
            total *= 0.9;          // -10 %
        printf("%d jour(s) : %.2f euros\\n", jours, total);
    }
    return 0;
}`,
      note: "Une seule boucle produit tout le tableau. Le for rend impossible d'oublier de faire progresser le compteur."
    },
    7: {
      titre: "le catalogue en tableau",
      etat: "Un seul jeu ne fait pas une ludothèque. Stockons plusieurs prix d'un coup.",
      objectif: "Déclare un tableau des prix de 4 jeux (double), puis affiche le prix total et le prix moyen du catalogue.",
      hints: [
        "double prix[4] = {44.90, 12.50, 39.0, 19.90};",
        "int n = sizeof(prix) / sizeof(prix[0]);",
        "Parcours de 0 à n-1 ; somme en double pour la moyenne."
      ],
      solution: `#include <stdio.h>

int main(void) {
    double prix[4] = {44.90, 12.50, 39.0, 19.90};
    int n = sizeof(prix) / sizeof(prix[0]);
    double somme = 0.0;
    for (int i = 0; i < n; i++)
        somme += prix[i];
    printf("Total : %.2f | Moyenne : %.2f\\n", somme, somme / n);
    return 0;
}`,
      note: "Les indices vont de 0 à n-1 : ne jamais lire prix[n] (débordement). sizeof évite de coder la taille en dur."
    },
    8: {
      titre: "une fonction tarif",
      etat: "Le calcul du tarif se répète. Isolons-le dans une fonction réutilisable.",
      objectif: "Écris une fonction double tarif(double prixJour, int jours) qui applique 10 % de remise dès 3 jours et renvoie le total. Appelle-la depuis main.",
      hints: [
        "Le type de retour est double, pas int (sinon 18.0 serait tronqué).",
        "N'oublie pas return total;",
        "Si tu définis la fonction après main, mets un prototype en haut."
      ],
      solution: `#include <stdio.h>

double tarif(double prixJour, int jours) {
    double total = prixJour * jours;
    if (jours >= 3) total *= 0.9;
    return total;
}

int main(void) {
    printf("%.2f\\n", tarif(5.0, 4));   // 18.00
    return 0;
}`,
      note: "Une fonction bien nommée, au bon type de retour, testable séparément : la base d'un code propre. Les paramètres sont copiés (passage par valeur)."
    },
    9: {
      titre: "le nom du jeu",
      etat: "Nos jeux n'ont pas encore de nom en mémoire. Manipulons du texte.",
      objectif: "Stocke le nom d'un jeu dans un tableau de char, affiche-le avec %s et sa longueur avec strlen. Compare-le à \"Catan\" avec strcmp.",
      hints: [
        "#include <string.h> pour strlen et strcmp.",
        "char nom[] = \"Catan\"; laisse la place au '\\0'.",
        "On compare avec strcmp(nom, \"Catan\") == 0, jamais avec ==."
      ],
      solution: `#include <stdio.h>
#include <string.h>

int main(void) {
    char nom[] = "Catan";
    printf("%s (%zu lettres)\\n", nom, strlen(nom));
    if (strcmp(nom, "Catan") == 0)
        printf("C'est bien Catan\\n");
    return 0;
}`,
      note: "Une chaîne C est un tableau de char terminé par '\\0'. On la compare avec strcmp (== compare des adresses, pas le contenu)."
    },
    10: {
      titre: "appliquer une remise via pointeur",
      etat: "On veut qu'une fonction MODIFIE réellement le prix d'un jeu, pas une copie.",
      objectif: "Écris void appliquer_remise(double *prix, double taux) qui réduit le prix pointé. Applique -20 % à un prix de 50.0 dans main et affiche le résultat modifié.",
      hints: [
        "La fonction reçoit l'adresse : double *prix.",
        "Corps : *prix = *prix * (1 - taux);",
        "Appel : appliquer_remise(&prix, 0.20);"
      ],
      solution: `#include <stdio.h>

void appliquer_remise(double *prix, double taux) {
    *prix = *prix * (1.0 - taux);   // modifie la valeur pointee
}

int main(void) {
    double prix = 50.0;
    appliquer_remise(&prix, 0.20);  // -20 %
    printf("Prix apres remise : %.2f euros\\n", prix);  // 40.00
    return 0;
}`,
      note: "Sans pointeur, prix resterait à 50.0 (passage par valeur). En passant son adresse, la fonction agit sur la vraie variable — le mécanisme même du & de scanf."
    },
    11: {
      titre: "augmenter tout le catalogue",
      etat: "L'inflation frappe : il faut réévaluer tous les prix d'un coup.",
      objectif: "Écris void augmenter(double prix[], int n, double taux) qui augmente chaque prix du catalogue. Applique +5 % à un tableau de 3 prix et affiche le résultat.",
      hints: [
        "Un tableau passé à une fonction est une adresse : elle modifie l'original.",
        "Passe toujours la taille n en paramètre (sizeof ne marche pas dans la fonction).",
        "Boucle : prix[i] *= (1 + taux);"
      ],
      solution: `#include <stdio.h>

void augmenter(double prix[], int n, double taux) {
    for (int i = 0; i < n; i++)
        prix[i] *= (1.0 + taux);
}

int main(void) {
    double prix[3] = {10.0, 20.0, 44.90};
    int n = sizeof(prix) / sizeof(prix[0]);
    augmenter(prix, n, 0.05);   // +5 %
    for (int i = 0; i < n; i++)
        printf("%.2f\\n", prix[i]);
    return 0;
}`,
      note: "Le nom d'un tableau vaut l'adresse de son premier élément : la fonction modifie donc le vrai catalogue. La taille se transmet séparément, par convention."
    },
    12: {
      titre: "un catalogue de taille choisie",
      etat: "Le nombre de jeux n'est pas connu à l'avance : réservons la mémoire à l'exécution.",
      objectif: "Demande n, alloue dynamiquement un tableau de n double pour les prix, remplis-le (prix[i] = 10 + i), affiche la somme, puis libère proprement la mémoire.",
      hints: [
        "double *prix = malloc(n * sizeof(double)); vérifie != NULL.",
        "Reste dans les bornes : i < n.",
        "free(prix); prix = NULL; à la fin."
      ],
      solution: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n;
    printf("Combien de jeux ? ");
    if (scanf("%d", &n) != 1 || n <= 0) return 1;

    double *prix = malloc(n * sizeof(double));
    if (prix == NULL) return 1;

    double somme = 0.0;
    for (int i = 0; i < n; i++) {
        prix[i] = 10.0 + i;
        somme += prix[i];
    }
    printf("Somme : %.2f euros\\n", somme);

    free(prix);
    prix = NULL;
    return 0;
}`,
      note: "Impossible avec un tableau fixe : malloc réserve la taille voulue à l'exécution. Cycle complet réserver → vérifier → utiliser → libérer, sans fuite."
    },
    13: {
      titre: "la structure Jeu",
      etat: "Nom, prix, stock : ces données vont ensemble. Regroupons-les en un seul type.",
      objectif: "Définis un type Jeu (typedef struct) avec nom, prix (double), stock (int). Crée un jeu, affiche ses champs, et écris une fonction reappro(Jeu *j, int ajout) qui augmente son stock.",
      hints: [
        "typedef struct { char nom[50]; double prix; int stock; } Jeu;",
        "Dans reappro, j est un pointeur : utilise j->stock += ajout;",
        "Dans main, catan est une variable : accès avec le point (catan.stock)."
      ],
      solution: `#include <stdio.h>
#include <string.h>

typedef struct {
    char nom[50];
    double prix;
    int stock;
} Jeu;

void reappro(Jeu *j, int ajout) {
    j->stock += ajout;      // fleche : j est un pointeur
}

int main(void) {
    Jeu catan = {"Catan", 44.90, 3};
    reappro(&catan, 5);
    printf("%s : %.2f, stock %d\\n", catan.nom, catan.prix, catan.stock);
    return 0;
}`,
      note: "La struct est le « type objet » du C. Variable → point (.), pointeur → flèche (->). On passe un Jeu* pour éviter une copie et pouvoir modifier l'original."
    },
    14: {
      titre: "rechercher un jeu",
      etat: "Le catalogue s'allonge : il faut retrouver un jeu par son nom.",
      objectif: "Dans un tableau de Jeu, écris une recherche linéaire qui renvoie l'indice du jeu portant un nom donné, ou -1 si absent. Affiche le prix du jeu trouvé.",
      hints: [
        "Sentinelle : trouve = -1.",
        "Compare les noms avec strcmp(t[i].nom, cible) == 0.",
        "break dès qu'on a trouvé."
      ],
      solution: `#include <stdio.h>
#include <string.h>

typedef struct { char nom[50]; double prix; int stock; } Jeu;

int chercher(const Jeu t[], int n, const char *cible) {
    for (int i = 0; i < n; i++)
        if (strcmp(t[i].nom, cible) == 0)
            return i;
    return -1;   // pas trouve
}

int main(void) {
    Jeu cat[3] = {{"Catan",44.90,3},{"Uno",12.50,10},{"Risk",39.0,0}};
    int i = chercher(cat, 3, "Uno");
    if (i != -1) printf("Uno : %.2f euros\\n", cat[i].prix);
    else printf("Introuvable\\n");
    return 0;
}`,
      note: "Recherche linéaire classique : sentinelle -1, comparaison par strcmp, arrêt anticipé. const documente que la fonction ne modifie pas le catalogue."
    },
    15: {
      titre: "organiser le projet en modules",
      etat: "Le code grossit. Séparons les tarifs dans leur propre module pour y voir clair.",
      objectif: "Écris un en-tête tarif.h (avec include guard) déclarant double tarif(double, int), et le tarif.c qui la définit. Indique la commande de compilation.",
      hints: [
        "Le .h : #ifndef TARIF_H / #define TARIF_H / prototype ; / #endif.",
        "Le .h ne contient QUE la déclaration (prototype), pas le corps.",
        "Le .c fait #include \"tarif.h\" (guillemets pour tes fichiers)."
      ],
      solution: `/* tarif.h */
#ifndef TARIF_H
#define TARIF_H
double tarif(double prixJour, int jours);
#endif

/* tarif.c */
#include "tarif.h"
double tarif(double prixJour, int jours) {
    double t = prixJour * jours;
    if (jours >= 3) t *= 0.9;
    return t;
}

/* Compiler avec main.c : gcc -Wall main.c tarif.c -o ludo */`,
      note: "Déclaration en .h (avec garde d'inclusion), définition en .c : c'est ainsi qu'on structure un vrai projet C. Guillemets pour tes en-têtes, chevrons pour la bibliothèque."
    },
    16: {
      titre: "sauvegarder le catalogue",
      etat: "À la fermeture, tout est perdu. Écrivons le catalogue dans un fichier.",
      objectif: "Écris une fonction qui enregistre un tableau de Jeu dans un fichier « catalogue.txt », une ligne « nom;prix;stock » par jeu. Vérifie l'ouverture et ferme le fichier.",
      hints: [
        "FILE *f = fopen(\"catalogue.txt\", \"w\"); if (f == NULL) return;",
        "fprintf(f, \"%s;%.2f;%d\\n\", t[i].nom, t[i].prix, t[i].stock);",
        "N'oublie pas fclose(f);"
      ],
      solution: `#include <stdio.h>

typedef struct { char nom[50]; double prix; int stock; } Jeu;

void sauver(const Jeu t[], int n, const char *fichier) {
    FILE *f = fopen(fichier, "w");
    if (f == NULL) return;
    for (int i = 0; i < n; i++)
        fprintf(f, "%s;%.2f;%d\\n", t[i].nom, t[i].prix, t[i].stock);
    fclose(f);
}

int main(void) {
    Jeu cat[2] = {{"Catan",44.90,3},{"Uno",12.50,10}};
    sauver(cat, 2, "catalogue.txt");
    printf("Catalogue enregistre.\\n");
    return 0;
}`,
      note: "Un fichier texte à champs séparés par ; est un mini-format CSV. C'est la persistance « à la main » avant d'utiliser une vraie base de données (étape 4 du parcours)."
    },
    17: {
      titre: "le statut d'un exemplaire",
      etat: "Un jeu peut être disponible, loué ou vendu. Nommons ces états.",
      objectif: "Définis un type Statut (typedef enum : DISPO, LOUE, VENDU) et une fonction qui affiche le libellé d'un statut avec un switch. Teste-la sur LOUE.",
      hints: [
        "typedef enum { DISPO, LOUE, VENDU } Statut;",
        "switch (s) { case DISPO: ... break; ... }",
        "Ajoute un default par prudence."
      ],
      solution: `#include <stdio.h>

typedef enum { DISPO, LOUE, VENDU } Statut;

void afficher_statut(Statut s) {
    switch (s) {
        case DISPO: printf("Disponible\\n"); break;
        case LOUE:  printf("En location\\n"); break;
        case VENDU: printf("Vendu\\n");       break;
        default:    printf("Inconnu\\n");     break;
    }
}

int main(void) {
    afficher_statut(LOUE);
    return 0;
}`,
      note: "L'enum rend le code lisible (LOUE plutôt que 1) et se marie avec switch. On pourra ajouter un champ Statut à la struct Jeu pour suivre chaque exemplaire."
    },
    18: {
      titre: "trier le catalogue par prix",
      etat: "Les clients veulent voir les jeux du moins cher au plus cher.",
      objectif: "Trie un tableau de Jeu par prix croissant avec qsort. Écris la fonction de comparaison sur le champ prix (double), puis affiche le catalogue trié.",
      hints: [
        "Signature : int cmp(const void *a, const void *b).",
        "Reconvertis : const Jeu *x = a; puis compare x->prix et y->prix.",
        "Pour des double, compare explicitement (pas de soustraction renvoyée en int)."
      ],
      solution: `#include <stdio.h>
#include <stdlib.h>

typedef struct { char nom[50]; double prix; int stock; } Jeu;

int cmp_prix(const void *a, const void *b) {
    const Jeu *x = a, *y = b;
    if (x->prix < y->prix) return -1;
    if (x->prix > y->prix) return 1;
    return 0;
}

int main(void) {
    Jeu cat[3] = {{"Catan",44.90,3},{"Uno",12.50,10},{"Risk",39.0,0}};
    qsort(cat, 3, sizeof(Jeu), cmp_prix);
    for (int i = 0; i < 3; i++)
        printf("%-8s %.2f\\n", cat[i].nom, cat[i].prix);
    return 0;
}`,
      note: "qsort trie n'importe quel type grâce à la fonction de comparaison. Pour des double, on compare explicitement (x<y, x>y) plutôt que de renvoyer une soustraction."
    },
    19: {
      titre: "fiabiliser la mémoire",
      etat: "Avant de livrer, chassons les bugs mémoire du catalogue dynamique.",
      objectif: "Reprends un catalogue alloué par malloc : vérifie l'allocation, reste dans les bornes, libère et remets le pointeur à NULL. Indique la commande de test (sanitizer ou valgrind).",
      hints: [
        "Vérifie malloc != NULL et scanf.",
        "Boucle i < n, jamais i <= n.",
        "free(cat); cat = NULL; puis teste avec -fsanitize=address ou valgrind."
      ],
      solution: `#include <stdio.h>
#include <stdlib.h>

typedef struct { char nom[50]; double prix; int stock; } Jeu;

int main(void) {
    int n = 3;
    Jeu *cat = malloc(n * sizeof(Jeu));
    if (cat == NULL) return 1;

    for (int i = 0; i < n; i++) {      // i < n : dans les bornes
        cat[i].prix = 10.0 + i;
        cat[i].stock = i;
    }
    double somme = 0.0;
    for (int i = 0; i < n; i++) somme += cat[i].prix;
    printf("Valeur du stock : %.2f\\n", somme);

    free(cat);
    cat = NULL;
    return 0;
}
/* Tester : gcc -g -fsanitize=address ludo.c -o ludo ; ./ludo
   ou : valgrind ./ludo */`,
      note: "Rester dans les bornes, vérifier malloc, libérer puis neutraliser : les réflexes mémoire du C. Les outils (-fsanitize=address, valgrind) confirment l'absence de fuite."
    },
    20: {
      titre: "le gestionnaire complet",
      etat: "Toutes les briques sont là. Assemblons un mini-programme complet avec menu.",
      objectif: "Écris une boucle de menu (do-while) offrant : 1) ajouter un jeu (nom + prix) dans un tableau, 2) lister le catalogue, 0) quitter. Utilise un tableau de Jeu et un compteur.",
      hints: [
        "do { afficher le menu ; scanf le choix ; ... } while (choix != 0);",
        "Pour ajouter : lis le nom (scanf \" %49[^\\n]\") et le prix, puis nb++.",
        "Pour lister : boucle de 0 à nb-1."
      ],
      solution: `#include <stdio.h>
#define MAX 100

typedef struct { char nom[50]; double prix; } Jeu;

int main(void) {
    Jeu cat[MAX];
    int nb = 0, choix;
    do {
        printf("\\n1) Ajouter  2) Lister  0) Quitter : ");
        if (scanf("%d", &choix) != 1) break;
        if (choix == 1 && nb < MAX) {
            printf("Nom ? ");   scanf(" %49[^\\n]", cat[nb].nom);
            printf("Prix ? ");  scanf("%lf", &cat[nb].prix);
            nb++;
        } else if (choix == 2) {
            for (int i = 0; i < nb; i++)
                printf("%d. %-12s %.2f\\n", i + 1, cat[i].nom, cat[i].prix);
        }
    } while (choix != 0);
    printf("Au revoir !\\n");
    return 0;
}`,
      note: "Données en struct, tableau + compteur, boucle de menu do-while, saisies bornées : le squelette de toute petite application C. On y ajouterait la sauvegarde fichier de l'étape 16."
    },
    21: {
      titre: "bilan et suite du parcours",
      etat: "La Ludothèque tient debout en C : catalogue, tarifs, recherche, tri, persistance.",
      objectif: "Écris une fonction de synthèse qui, sur un tableau de Jeu, affiche le prix moyen et le nom du jeu le plus cher — la « fiche récap » du catalogue.",
      hints: [
        "Moyenne : somme des prix / n (somme en double).",
        "Le plus cher : garde l'indice du max en parcourant.",
        "Passe le tableau en const et sa taille n."
      ],
      solution: `#include <stdio.h>

typedef struct { char nom[50]; double prix; int stock; } Jeu;

void recap(const Jeu t[], int n) {
    double somme = 0.0;
    int imax = 0;
    for (int i = 0; i < n; i++) {
        somme += t[i].prix;
        if (t[i].prix > t[imax].prix) imax = i;
    }
    printf("Prix moyen : %.2f euros\\n", somme / n);
    printf("Le plus cher : %s (%.2f)\\n", t[imax].nom, t[imax].prix);
}

int main(void) {
    Jeu cat[3] = {{"Catan",44.90,3},{"Uno",12.50,10},{"Risk",39.0,0}};
    recap(cat, 3);
    return 0;
}`,
      note: "Bravo : tu as construit la Ludothèque en C, du print d'accueil au catalogue trié et persistant. La suite du parcours (front-end, bases de données, outillage, projets) réutilisera exactement cette logique — le C reste ton socle bas niveau."
    }
  }
};
