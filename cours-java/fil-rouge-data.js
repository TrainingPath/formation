/* ===== Fil rouge « La Ludothèque » — cours Java (21 étapes) =====
   Même application que dans tous les cours, pour comparer les langages.
   Ludothèque de jeux de société : catalogue, 3 rôles (client, vendeur,
   administrateur), achat ET location. Procédural puis orienté objet dès la leçon 12.
   (Sauf indication, le code va à l'intérieur d'une classe / de main.) */
var FIL = {
  prefix: "java21",
  app: "La Ludothèque",
  placeholder: "Écris ton code Java ici…",
  etapes: {
    1: {
      titre: "l'écran d'accueil",
      etat: "Le projet démarre : rien n'existe encore. La ludothèque doit se présenter au lancement.",
      objectif: "Affiche une bannière d'accueil : le nom « La Ludothèque » et sa promesse (achat &amp; location), encadrée par des lignes de séparation.",
      hints: [
        "System.out.println(...) affiche une ligne.",
        "\"=\".repeat(40) crée une ligne de 40 signes égal (Java 11+)."
      ],
      solution: `public class Ludotheque {
    public static void main(String[] args) {
        System.out.println("=".repeat(40));
        System.out.println("       BIENVENUE A LA LUDOTHEQUE");
        System.out.println("   Achat & location de jeux de societe");
        System.out.println("=".repeat(40));
    }
}`,
      note: "Java impose une classe et une méthode main : plus verbeux que le print() de Python ou les top-level statements de C#. Mais la structure est explicite."
    },
    2: {
      titre: "représenter un jeu",
      etat: "L'accueil s'affiche. Décrivons un jeu avec des variables typées.",
      objectif: "Déclare les variables d'un jeu : nom (String), prixAchat et prixLocation (double), stock (int) et un boolean disponible calculé depuis le stock. Affiche-les.",
      hints: [
        "En Java, le type précède la variable : String nom = \"...\";",
        "boolean disponible = stock > 0;"
      ],
      solution: `String nom = "Catan";
double prixAchat = 44.90;     // prix de vente
double prixLocation = 5.0;    // par jour
int stock = 3;
boolean disponible = stock > 0;

System.out.println(nom + " " + prixAchat + " " + stock + " " + disponible);`,
      note: "Comme C#, Java est à typage statique : le type est obligatoire. Les types primitifs (int, double, boolean) sont écrits en minuscules."
    },
    3: {
      titre: "calculer un tarif de location",
      etat: "Calculons le coût d'une location de plusieurs jours.",
      objectif: "Calcule prix par jour × nombre de jours, avec 10 % de remise dès 3 jours. Affiche le total à 2 décimales.",
      hints: [
        "total *= 0.9 applique -10%.",
        "System.out.printf(\"%.2f%n\", total) formate à 2 décimales."
      ],
      solution: `double prixLocation = 5.0;
int jours = 4;
double total = prixLocation * jours;
if (jours >= 3) {
    total *= 0.9;             // -10% des 3 jours
}
System.out.printf("Location %d jours : %.2f EUR%n", jours, total);`,
      note: "printf avec %.2f formate les décimales (comme :.2f en Python, :F2 en C#). %n produit un saut de ligne portable."
    },
    4: {
      titre: "un premier menu interactif",
      etat: "Rendons le programme interactif avec le clavier.",
      objectif: "Avec un Scanner, affiche un menu (1 = acheter, 2 = louer), lis le choix puis le nom du jeu, et récapitule.",
      hints: [
        "Scanner sc = new Scanner(System.in);",
        "sc.nextLine() lit une ligne entière."
      ],
      solution: `import java.util.Scanner;

Scanner sc = new Scanner(System.in);
System.out.println("1) Acheter   2) Louer");
System.out.print("Ton choix : ");
String choix = sc.nextLine();
System.out.print("Nom du jeu : ");
String nom = sc.nextLine();
System.out.println("Option " + choix + " demandee pour : " + nom);`,
      note: "Scanner est l'outil de lecture clavier en Java (équivalent de input() en Python, Console.ReadLine en C#). nextInt() lirait un entier."
    },
    5: {
      titre: "un tarif selon le rôle",
      etat: "Introduisons les 3 rôles : client, vendeur, administrateur.",
      objectif: "Selon le rôle, calcule le prix : plein tarif (client), -20 % (vendeur), gratuit (admin). Utilise un switch.",
      hints: [
        "switch (role) { case \"vendeur\": ...; break; }",
        "default gère le client (plein tarif)."
      ],
      solution: `String role = "vendeur";
double prix = 44.90;
switch (role) {
    case "admin":   prix = 0.0;       break;   // gratuit en test
    case "vendeur": prix = prix * 0.8; break;  // -20%
    default:        /* client */      break;
}
System.out.printf("Prix pour un %s : %.2f EUR%n", role, prix);`,
      note: "Java accepte les switch sur String depuis Java 7. Ces 3 rôles deviendront des classes filles d'Utilisateur à la leçon 14."
    },
    6: {
      titre: "afficher le catalogue",
      etat: "Il faut plusieurs jeux et savoir les parcourir.",
      objectif: "À partir de deux tableaux parallèles (noms et prix), affiche le catalogue numéroté avec une boucle for.",
      hints: [
        "String[] noms = { \"Catan\", ... };",
        "for (int i = 0; i < noms.length; i++) ..."
      ],
      solution: `String[] noms = { "Catan", "Carcassonne", "Dixit" };
double[] prix = { 44.90, 34.90, 29.90 };
for (int i = 0; i < noms.length; i++) {
    System.out.printf("%d. %s — %.2f EUR%n", i + 1, noms[i], prix[i]);
}`,
      note: "En Java, .length (sans parenthèses) donne la taille d'un tableau. Dès la leçon 10, ArrayList permettra d'ajouter/retirer des éléments."
    },
    7: {
      titre: "le catalogue en tableau",
      etat: "Regroupons les jeux dans un tableau.",
      objectif: "Range les noms de jeux dans un tableau, affiche leur nombre, puis liste-les tous avec un for-each.",
      hints: [
        "String[] catalogue = { ... };",
        "for (String jeu : catalogue) ... ; catalogue.length compte."
      ],
      solution: `String[] catalogue = { "Catan", "Carcassonne", "Dixit", "7 Wonders" };
System.out.println("Jeux au catalogue : " + catalogue.length);
for (String jeu : catalogue) {
    System.out.println(" - " + jeu);
}`,
      note: "Le tableau Java a une taille FIXE. Pour un catalogue qui grandit, on passera à ArrayList (leçon 10), l'équivalent de la liste Python et de List<T> en C#."
    },
    8: {
      titre: "extraire des méthodes",
      etat: "Le code se répète : factorisons-le en méthodes.",
      objectif: "Écris static double prixLocation(double prixJour, int jours) (remise dès 3 jours) et static void afficher(String nom, double prix). Utilise-les.",
      hints: [
        "Une méthode static se déclare dans la classe, hors de main.",
        "void ne renvoie rien ; double renvoie un nombre."
      ],
      solution: `static double prixLocation(double prixJour, int jours) {
    double total = prixJour * jours;
    if (jours >= 3) total *= 0.9;
    return total;
}
static void afficher(String nom, double prix) {
    System.out.printf("%s : %.2f EUR%n", nom, prix);
}

// dans main :
afficher("Catan (4 jours)", prixLocation(5.0, 4));`,
      note: "Java type les paramètres et le retour (double, void). En procédural, on met ces méthodes en static. La leçon 12 en fera de vraies méthodes d'objet."
    },
    9: {
      titre: "fiches et recherche",
      etat: "Soignons l'affichage et ajoutons une recherche par nom.",
      objectif: "Écris static String fiche(String nom, double prix) renvoyant une fiche encadrée (nom en MAJUSCULES). Puis affiche les jeux dont le nom contient un terme, sans casse.",
      hints: [
        "nom.toUpperCase() met en majuscules.",
        "n.toLowerCase().contains(terme.toLowerCase()) teste sans casse."
      ],
      solution: `static String fiche(String nom, double prix) {
    String bord = "-".repeat(30);
    return String.format("%s%n  %s%n  Prix : %.2f EUR%n%s",
                         bord, nom.toUpperCase(), prix, bord);
}

// dans main :
System.out.println(fiche("catan", 44.9));
String terme = "car";
String[] noms = { "Catan", "Carcassonne", "Dixit" };
for (String n : noms) {
    if (n.toLowerCase().contains(terme.toLowerCase())) {
        System.out.println("Trouve : " + n);
    }
}`,
      note: "String.format assemble du texte (comme sprintf). toUpperCase/contains rappellent upper/in (Python) et ToUpper/Contains (C#)."
    },
    10: {
      titre: "filtrer avec une ArrayList",
      etat: "Passons à une collection dynamique.",
      objectif: "Utilise une ArrayList<String>, ajoute/retire des jeux (add/remove), affiche-en le nombre et liste-les.",
      hints: [
        "import java.util.ArrayList; import java.util.List;",
        "List<String> catalogue = new ArrayList<>(); catalogue.add(\"...\");"
      ],
      solution: `import java.util.ArrayList;
import java.util.List;

List<String> catalogue = new ArrayList<>();
catalogue.add("Catan");
catalogue.add("Dixit");
catalogue.add("Azul");
catalogue.remove("Dixit");        // retire
System.out.println("Jeux disponibles : " + catalogue.size());
for (String jeu : catalogue) {
    System.out.println(" - " + jeu);
}`,
      note: "ArrayList est le tableau qui grandit : add, remove, size(). C'est l'équivalent de la liste Python et de List<T> en C#."
    },
    11: {
      titre: "algorithmes sur le catalogue",
      etat: "Appliquons de vrais algorithmes : extremum et tri.",
      objectif: "Sur des tableaux parallèles (noms, prix), trouve le jeu le plus cher avec une boucle, puis trie les prix.",
      hints: [
        "Garde l'indice du max en comparant prix[i].",
        "Arrays.sort(prix) trie un tableau en place."
      ],
      solution: `import java.util.Arrays;

String[] noms = { "Catan", "Dixit", "Azul" };
double[] prix = { 44.9, 29.9, 39.9 };
int idxMax = 0;
for (int i = 1; i < prix.length; i++) {
    if (prix[i] > prix[idxMax]) idxMax = i;
}
System.out.println("Le plus cher : " + noms[idxMax]);

Arrays.sort(prix);                // tri croissant
System.out.println("Prix trie : " + Arrays.toString(prix));`,
      note: "L'algorithme de recherche du maximum est identique dans tous les langages : c'est la logique qui compte, pas la syntaxe. Tout l'intérêt du fil rouge partagé."
    },
    12: {
      titre: "🔁 refactor : la classe Jeu",
      etat: "Tournant du projet : on quitte le procédural pour l'orienté objet. Un jeu devient un objet.",
      objectif: "Crée une classe Jeu avec des champs et une méthode afficher(). Instancie un jeu, renseigne ses champs, appelle sa méthode.",
      hints: [
        "class Jeu { String nom; double prixAchat; int stock; void afficher() {...} }",
        "Jeu catan = new Jeu(); catan.nom = \"Catan\";"
      ],
      solution: `class Jeu {
    String nom;
    double prixAchat;
    int stock;
    void afficher() {
        System.out.printf("%s — %.2f EUR (stock %d)%n", nom, prixAchat, stock);
    }
}

// dans main :
Jeu catan = new Jeu();
catan.nom = "Catan";
catan.prixAchat = 44.9;
catan.stock = 3;
catan.afficher();`,
      note: "Données et comportements réunis dans un objet : même bascule qu'en Python et C# (leçon 12). La leçon 13 ajoutera un constructeur et l'encapsulation."
    },
    13: {
      titre: "constructeur et encapsulation",
      etat: "Donnons à Jeu un constructeur et protégeons le stock.",
      objectif: "Ajoute un constructeur Jeu(nom, prixAchat, stock). Passe les champs en private, expose des getters, et ajoute louer() qui décrémente le stock sans jamais passer sous zéro.",
      hints: [
        "private String nom; ... public Jeu(...) { this.nom = nom; ... }",
        "public int getStock() { return stock; }",
        "Dans louer(), teste stock > 0 avant de décrémenter."
      ],
      solution: `class Jeu {
    private String nom;
    private double prixAchat;
    private int stock;

    public Jeu(String nom, double prixAchat, int stock) {
        this.nom = nom;
        this.prixAchat = prixAchat;
        this.stock = stock;
    }
    public String getNom() { return nom; }
    public int getStock() { return stock; }

    public boolean louer() {
        if (stock <= 0) {
            System.out.println("Rupture : " + nom);
            return false;
        }
        stock--;
        return true;
    }
}
// Jeu catan = new Jeu("Catan", 44.9, 2); catan.louer();`,
      note: "private + getters = encapsulation : impossible de rendre le stock négatif de l'extérieur. Python utilisait @property, C# les propriétés { get; set; }."
    },
    14: {
      titre: "héritage : les 3 rôles",
      etat: "Modélisons les utilisateurs et leurs 3 rôles par héritage et polymorphisme.",
      objectif: "Classe Utilisateur avec remise() renvoyant 0. Dérive Client (0), Vendeur (0.20), Administrateur (1.0) avec @Override. Parcours une liste mixte et affiche la remise de chacun.",
      hints: [
        "class Vendeur extends Utilisateur { @Override double remise() { return 0.20; } }",
        "super(nom) appelle le constructeur parent."
      ],
      solution: `class Utilisateur {
    String nom;
    Utilisateur(String nom) { this.nom = nom; }
    double remise() { return 0.0; }
}
class Client extends Utilisateur {
    Client(String n) { super(n); }
}
class Vendeur extends Utilisateur {
    Vendeur(String n) { super(n); }
    @Override double remise() { return 0.20; }
}
class Administrateur extends Utilisateur {
    Administrateur(String n) { super(n); }
    @Override double remise() { return 1.0; }
}

List<Utilisateur> gens = List.of(new Client("Ana"), new Vendeur("Bob"), new Administrateur("Zoe"));
for (Utilisateur u : gens) {
    System.out.println(u.nom + " -> " + (u.remise() * 100) + " %");
}`,
      note: "extends + @Override réalisent le polymorphisme : on appelle remise() sans connaître le rôle exact. C# utilisait virtual/override, Python rien de spécial."
    },
    15: {
      titre: "une abstraction pour les transactions",
      etat: "Achat et location sont deux transactions différentes mais partagent un montant. Abstraisons.",
      objectif: "Crée une classe abstraite Transaction avec une méthode abstraite montant(). Dérive Achat (prix d'achat) et Location (prix/jour × jours). Affiche le montant de chacune de façon uniforme.",
      hints: [
        "abstract class Transaction { abstract double montant(); }",
        "Chaque sous-classe implémente montant()."
      ],
      solution: `abstract class Transaction {
    String jeu;
    Transaction(String jeu) { this.jeu = jeu; }
    abstract double montant();
}
class Achat extends Transaction {
    double prix;
    Achat(String jeu, double prix) { super(jeu); this.prix = prix; }
    double montant() { return prix; }
}
class Location extends Transaction {
    double prixJour; int jours;
    Location(String jeu, double pj, int j) { super(jeu); prixJour = pj; jours = j; }
    double montant() { return prixJour * jours; }
}

List<Transaction> ops = List.of(new Achat("Catan", 44.9), new Location("Azul", 5, 4));
for (Transaction t : ops) {
    System.out.printf("%s : %.2f EUR%n", t.jeu, t.montant());
}`,
      note: "Une classe abstraite impose un contrat (montant()) sans dire comment. On pourrait aussi utiliser une interface Tarifiable : même idée de contrat."
    },
    16: {
      titre: "gérer les erreurs",
      etat: "Louer un jeu en rupture doit être géré proprement.",
      objectif: "Crée une exception StockInsuffisantException (extends Exception). louer() la lance si le stock est nul. Appelle-la dans un try/catch et affiche un message clair.",
      hints: [
        "class StockInsuffisantException extends Exception { StockInsuffisantException(String m){ super(m); } }",
        "throw new ...; try { } catch (StockInsuffisantException e) { }"
      ],
      solution: `class StockInsuffisantException extends Exception {
    StockInsuffisantException(String m) { super(m); }
}

static void louer(String nom, int stock) throws StockInsuffisantException {
    if (stock <= 0) {
        throw new StockInsuffisantException(nom + " indisponible");
    }
}

// dans main :
try {
    louer("Dixit", 0);
} catch (StockInsuffisantException e) {
    System.out.println("Location refusee : " + e.getMessage());
}`,
      note: "Java distingue les exceptions vérifiées (throws obligatoire) des non vérifiées. try/catch = try/except (Python) = try/catch (C#)."
    },
    17: {
      titre: "sauvegarder le catalogue",
      etat: "Rendons les données persistantes en les écrivant sur le disque.",
      objectif: "Écris le catalogue (lignes « nom;prix;stock ») dans un fichier avec Files.write, puis relis-le avec Files.readAllLines et affiche le nombre de jeux.",
      hints: [
        "import java.nio.file.*;",
        "Files.write(Path.of(\"catalogue.csv\"), lignes);",
        "Files.readAllLines(Path.of(\"catalogue.csv\"))"
      ],
      solution: `import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

List<String> lignes = List.of("Catan;44.9;3", "Azul;39.9;5");
Files.write(Path.of("catalogue.csv"), lignes);        // ecriture

List<String> lues = Files.readAllLines(Path.of("catalogue.csv"));
System.out.println("Jeux recharges : " + lues.size());
for (String ligne : lues) {
    String[] parts = ligne.split(";");
    System.out.println(parts[0] + " -> stock " + parts[2]);
}`,
      note: "Files.write/readAllLines (java.nio) simplifient l'accès fichier ; on peut aussi utiliser BufferedReader/BufferedWriter (leçon 17). Le CSV joue le rôle du JSON en Python/C#."
    },
    18: {
      titre: "indexer et compter",
      etat: "Retrouver un jeu par id et compter les locations : HashMap est parfait.",
      objectif: "Indexe les jeux par id dans un HashMap<Integer, String>. Compte le nombre de locations par jeu avec un HashMap<String, Integer> (merge).",
      hints: [
        "Map<Integer, String> parId = new HashMap<>(); parId.put(1, \"Catan\");",
        "compte.merge(nom, 1, Integer::sum) incrémente le compteur."
      ],
      solution: `import java.util.HashMap;
import java.util.Map;

Map<Integer, String> parId = new HashMap<>();
parId.put(1, "Catan");
parId.put(2, "Azul");
System.out.println("Jeu 1 : " + parId.get(1));

String[] locations = { "Catan", "Azul", "Catan" };
Map<String, Integer> compte = new HashMap<>();
for (String nom : locations) {
    compte.merge(nom, 1, Integer::sum);
}
System.out.println("Locations : " + compte);   // {Catan=2, Azul=1}`,
      note: "HashMap (clé → valeur) donne un accès direct par id. C'est l'équivalent du dict Python et du Dictionary C#. merge simplifie le comptage."
    },
    19: {
      titre: "dates de location et retards",
      etat: "Une location a une durée : calculons dates de retour et pénalités.",
      objectif: "Avec LocalDate, fixe une date de début, un retour prévu (+4 j) et un retour réel (+6 j). Calcule le retard (ChronoUnit.DAYS) et une pénalité de 2 € par jour (jamais négative). Ajoute un enum Role.",
      hints: [
        "LocalDate.now().plusDays(4)",
        "ChronoUnit.DAYS.between(prevu, reel)",
        "enum Role { CLIENT, VENDEUR, ADMIN }"
      ],
      solution: `import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

enum Role { CLIENT, VENDEUR, ADMIN }

LocalDate debut = LocalDate.now();
LocalDate retourPrevu = debut.plusDays(4);
LocalDate retourReel = debut.plusDays(6);

long retard = ChronoUnit.DAYS.between(retourPrevu, retourReel);
long penalite = Math.max(retard, 0) * 2;   // 2 EUR / jour
System.out.println("Role " + Role.CLIENT + " — Retard " + retard + " j — Penalite " + penalite + " EUR");`,
      note: "LocalDate (java.time) gère proprement les dates. L'enum nomme les rôles au lieu de chaînes fragiles — comme en C# et avec Enum en Python."
    },
    20: {
      titre: "🏁 assembler la Ludothèque",
      etat: "Toutes les briques existent : réunissons-les.",
      objectif: "Assemble une classe Ludotheque contenant une List<Jeu>, capable d'ajouter un jeu, de le louer (gestion du stock) et d'afficher le catalogue. Fais tourner un scénario.",
      hints: [
        "private List<Jeu> catalogue = new ArrayList<>();",
        "Méthodes : ajouter(Jeu), louer(String nom), afficher().",
        "Réutilise Jeu et sa méthode louer() de la leçon 13."
      ],
      solution: `class Ludotheque {
    private List<Jeu> catalogue = new ArrayList<>();

    void ajouter(Jeu j) { catalogue.add(j); }

    void louer(String nom) {
        for (Jeu j : catalogue) {
            if (j.getNom().equals(nom)) {
                if (j.louer()) System.out.println("Loue : " + nom + " - stock " + j.getStock());
                return;
            }
        }
        System.out.println("Introuvable : " + nom);
    }
    void afficher() {
        for (Jeu j : catalogue) {
            System.out.println(" - " + j.getNom() + " (" + j.getStock() + " en stock)");
        }
    }
}

// dans main :
Ludotheque ludo = new Ludotheque();
ludo.ajouter(new Jeu("Catan", 44.9, 2));
ludo.ajouter(new Jeu("Azul", 39.9, 5));
ludo.louer("Catan");
ludo.afficher();`,
      note: "Une application orientée objet complète en console. Les cours frameworks (Spring, ASP.NET, Laravel, Django) reprendront ce domaine, mais en web avec une base de données."
    },
    21: {
      titre: "🎓 étendre l'application",
      etat: "Épreuve finale : ajoute une fonctionnalité de bout en bout.",
      objectif: "Ajoute un journal des transactions et un rapport administrateur : chaque opération est enregistrée (jeu, type, montant), et l'admin peut afficher le chiffre d'affaires total (via un stream) et le nombre de transactions.",
      hints: [
        "record Op(String jeu, String type, double montant) {}",
        "Stocke-les dans une List<Op>.",
        "journal.stream().mapToDouble(Op::montant).sum() ; réserve au rôle admin."
      ],
      solution: `import java.util.ArrayList;
import java.util.List;

record Op(String jeu, String type, double montant) {}

List<Op> journal = new ArrayList<>();
journal.add(new Op("Catan", "location", 18.0));
journal.add(new Op("Azul", "achat", 39.9));

Role role = Role.ADMIN;
if (role == Role.ADMIN) {
    double ca = journal.stream().mapToDouble(Op::montant).sum();
    System.out.printf("%d transactions — CA : %.2f EUR%n", journal.size(), ca);
} else {
    System.out.println("Acces refuse");
}`,
      note: "Tu réunis classes, collections, records, streams et enum : la synthèse du cours. Compare cette solution à celle de Python et C# — même fonctionnalité, trois styles."
    }
  }
};
