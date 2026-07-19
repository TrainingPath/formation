/* ===== Fil rouge « La Ludothèque » — cours C# (21 étapes) =====
   Même application que dans tous les cours, pour comparer les langages.
   Ludothèque de jeux de société : catalogue, 3 rôles (client, vendeur,
   administrateur), achat ET location. Procédural puis orienté objet dès la leçon 12. */
var FIL = {
  prefix: "cs21",
  app: "La Ludothèque",
  placeholder: "Écris ton code C# ici…",
  etapes: {
    1: {
      titre: "l'écran d'accueil",
      etat: "Le projet démarre : rien n'existe encore. La ludothèque doit se présenter quand on lance le programme.",
      objectif: "Affiche une bannière d'accueil : le nom « La Ludothèque » et sa promesse (achat &amp; location), encadrée par des lignes de séparation.",
      hints: [
        "Console.WriteLine(...) affiche une ligne.",
        "new string('=', 40) crée une ligne de 40 signes égal."
      ],
      solution: `Console.WriteLine(new string('=', 40));
Console.WriteLine("       BIENVENUE A LA LUDOTHEQUE");
Console.WriteLine("   Achat & location de jeux de societe");
Console.WriteLine(new string('=', 40));`,
      note: "Compare avec Python (print) ou Java (System.out.println) : même idée, syntaxe différente. En C# moderne, ce code tient en « top-level statements », sans classe visible."
    },
    2: {
      titre: "représenter un jeu",
      etat: "L'accueil s'affiche. Un catalogue a besoin de données : décrivons un jeu.",
      objectif: "Déclare les variables d'un jeu avec leurs types : nom (string), prixAchat et prixLocation (double), stock (int) et un bool disponible calculé depuis le stock. Affiche-les.",
      hints: [
        "En C#, le type est explicite : string nom = \"...\";",
        "bool disponible = stock > 0;"
      ],
      solution: `string nom = "Catan";
double prixAchat = 44.90;     // prix de vente
double prixLocation = 5.0;    // par jour
int stock = 3;
bool disponible = stock > 0;

Console.WriteLine($"{nom} {prixAchat} {prixLocation} {stock} {disponible}");`,
      note: "Contrairement à Python (typage dynamique), C# exige de déclarer le type. C'est plus verbeux mais le compilateur détecte les erreurs de type avant l'exécution."
    },
    3: {
      titre: "calculer un tarif de location",
      etat: "Un jeu est décrit. Calculons le coût d'une location de plusieurs jours.",
      objectif: "Calcule prix par jour × nombre de jours, avec 10 % de remise dès 3 jours. Affiche le total à 2 décimales.",
      hints: [
        "total *= 0.9 applique -10%.",
        "Format monétaire : $\"{total:F2} €\"."
      ],
      solution: `double prixLocation = 5.0;
int jours = 4;
double total = prixLocation * jours;
if (jours >= 3)
    total *= 0.9;             // -10% des 3 jours
Console.WriteLine($"Location {jours} jours : {total:F2} €");`,
      note: "Le spécificateur :F2 force 2 décimales — indispensable pour de l'argent. En Python c'était :.2f, en Java String.format(\"%.2f\")."
    },
    4: {
      titre: "un premier menu interactif",
      etat: "Rendons le programme interactif : l'utilisateur choisit une action.",
      objectif: "Affiche un menu (1 = acheter, 2 = louer), lis le choix puis le nom du jeu avec Console.ReadLine(), et récapitule.",
      hints: [
        "Console.ReadLine() lit une ligne au clavier (toujours une string).",
        "Affiche le récap avec une chaîne interpolée."
      ],
      solution: `Console.WriteLine("Que veux-tu faire ?");
Console.WriteLine("  1) Acheter   2) Louer");
Console.Write("Ton choix : ");
string choix = Console.ReadLine();
Console.Write("Nom du jeu : ");
string nom = Console.ReadLine();
Console.WriteLine($"Option {choix} demandee pour : {nom}");`,
      note: "Console.ReadLine() renvoie du texte. Pour lire un nombre, il faudra le convertir (int.Parse), là où Python convertissait avec int(input())."
    },
    5: {
      titre: "un tarif selon le rôle",
      etat: "Introduisons les 3 rôles : client, vendeur, administrateur.",
      objectif: "Selon le rôle, calcule le prix : plein tarif (client), -20 % (vendeur), gratuit (admin). Utilise un switch.",
      hints: [
        "switch (role) { case \"vendeur\": ... break; }",
        "Le default gère le client (plein tarif)."
      ],
      solution: `string role = "vendeur";
double prix = 44.90;
switch (role)
{
    case "admin":   prix = 0.0;        break;   // gratuit en test
    case "vendeur": prix = prix * 0.8; break;   // -20%
    default:        /* client */       break;
}
Console.WriteLine($"Prix pour un {role} : {prix:F2} €");`,
      note: "Le switch de C# est proche de celui de Java. Ces 3 rôles deviendront des classes filles d'Utilisateur à la leçon 14."
    },
    6: {
      titre: "afficher le catalogue",
      etat: "Il faut plusieurs jeux et savoir les parcourir.",
      objectif: "À partir de deux tableaux parallèles (noms et prix), affiche le catalogue numéroté avec une boucle for.",
      hints: [
        "Un tableau : string[] noms = { \"Catan\", ... };",
        "for (int i = 0; i < noms.Length; i++) ..."
      ],
      solution: `string[] noms = { "Catan", "Carcassonne", "Dixit" };
double[] prix = { 44.90, 34.90, 29.90 };
for (int i = 0; i < noms.Length; i++)
    Console.WriteLine($"{i + 1}. {noms[i]} — {prix[i]:F2} €");`,
      note: "En C#, .Length donne la taille du tableau. Dès la leçon 10 on passera à List<T>, qui peut grandir."
    },
    7: {
      titre: "le catalogue en tableau",
      etat: "Regroupons proprement les jeux dans un tableau.",
      objectif: "Range les noms de jeux dans un tableau, affiche leur nombre, puis liste-les tous avec foreach.",
      hints: [
        "string[] catalogue = { ... };",
        "foreach (string jeu in catalogue) ... ; catalogue.Length compte."
      ],
      solution: `string[] catalogue = { "Catan", "Carcassonne", "Dixit", "7 Wonders" };
Console.WriteLine($"Jeux au catalogue : {catalogue.Length}");
foreach (string jeu in catalogue)
    Console.WriteLine($" - {jeu}");`,
      note: "Le tableau C# a une taille FIXE : on ne peut pas y « ajouter » un élément. C'est la limite que List<T> lèvera à la leçon 10 (comme la liste Python dès le début)."
    },
    8: {
      titre: "extraire des méthodes",
      etat: "Le code se répète : factorisons-le en méthodes réutilisables.",
      objectif: "Écris une méthode PrixLocation(double prixJour, int jours) qui renvoie le total (remise dès 3 jours) et Afficher(string nom, double prix). Utilise-les.",
      hints: [
        "static double PrixLocation(double prixJour, int jours) { ... return total; }",
        "Une méthode void n'a pas de return."
      ],
      solution: `static double PrixLocation(double prixJour, int jours)
{
    double total = prixJour * jours;
    if (jours >= 3) total *= 0.9;
    return total;
}
static void Afficher(string nom, double prix)
    => Console.WriteLine($"{nom} : {prix:F2} €");

Afficher("Catan (4 jours)", PrixLocation(5.0, 4));`,
      note: "C# type les paramètres et la valeur de retour (double, void). Cette rigueur documente la méthode et évite bien des erreurs."
    },
    9: {
      titre: "fiches et recherche",
      etat: "Soignons l'affichage et ajoutons une recherche par nom.",
      objectif: "Écris Fiche(string nom, double prix) renvoyant une fiche encadrée (nom en MAJUSCULES). Puis affiche les jeux dont le nom contient un terme, sans tenir compte de la casse.",
      hints: [
        "nom.ToUpper() met en majuscules.",
        "n.ToLower().Contains(terme.ToLower()) teste l'appartenance sans casse."
      ],
      solution: `static string Fiche(string nom, double prix)
{
    string bord = new string('-', 30);
    return $"{bord}\\n  {nom.ToUpper()}\\n  Prix : {prix:F2} €\\n{bord}";
}
Console.WriteLine(Fiche("catan", 44.9));

string terme = "car";
string[] noms = { "Catan", "Carcassonne", "Dixit" };
foreach (string n in noms)
    if (n.ToLower().Contains(terme.ToLower()))
        Console.WriteLine($"Trouve : {n}");`,
      note: "Les méthodes de string (ToUpper, Contains) rappellent Python (upper, in) et Java (toUpperCase, contains) : mêmes services, noms différents."
    },
    10: {
      titre: "filtrer les jeux disponibles",
      etat: "Passons à une collection dynamique et filtrons le catalogue.",
      objectif: "Utilise une List<string>, ajoute/retire des jeux avec Add/Remove, affiche-en le nombre. (On introduira le filtrage fin avec LINQ à la leçon 18.)",
      hints: [
        "List<string> catalogue = new() { \"Catan\", ... };",
        "catalogue.Add(\"Azul\"); catalogue.Remove(\"Dixit\"); catalogue.Count"
      ],
      solution: `List<string> catalogue = new() { "Catan", "Carcassonne", "Dixit" };
catalogue.Add("Azul");        // nouvel arrivage
catalogue.Remove("Dixit");    // retire
Console.WriteLine($"Jeux disponibles : {catalogue.Count}");
foreach (string jeu in catalogue)
    Console.WriteLine($" - {jeu}");`,
      note: "List<T> est le tableau qui grandit : Add, Remove, Count. C'est l'équivalent de la liste Python et de l'ArrayList de Java."
    },
    11: {
      titre: "algorithmes sur le catalogue",
      etat: "Appliquons de vrais algorithmes : extremum et tri.",
      objectif: "Sur des tableaux parallèles (noms, prix), trouve le jeu le plus cher avec une boucle, puis trie les prix.",
      hints: [
        "Garde l'indice du max en comparant prix[i] au meilleur trouvé.",
        "Array.Sort(prix) trie un tableau en place."
      ],
      solution: `string[] noms = { "Catan", "Dixit", "Azul" };
double[] prix = { 44.9, 29.9, 39.9 };
int idxMax = 0;
for (int i = 1; i < prix.Length; i++)
    if (prix[i] > prix[idxMax]) idxMax = i;
Console.WriteLine($"Le plus cher : {noms[idxMax]}");

Array.Sort(prix);             // tri croissant
Console.WriteLine($"Prix trie : {string.Join(", ", prix)}");`,
      note: "L'algorithme de recherche du maximum est identique dans tous les langages : c'est la logique qui compte. C'est tout l'intérêt de ce fil rouge partagé."
    },
    12: {
      titre: "🔁 refactor : la classe Jeu",
      etat: "Tournant du projet : on quitte le procédural pour l'orienté objet. Un jeu devient un objet.",
      objectif: "Crée une classe Jeu avec des champs et une méthode Afficher(). Instancie un jeu, renseigne ses champs et appelle sa méthode.",
      hints: [
        "class Jeu { public string Nom; public double PrixAchat; ... }",
        "var catan = new Jeu(); catan.Nom = \"Catan\";"
      ],
      solution: `class Jeu
{
    public string Nom;
    public double PrixAchat;
    public int Stock;
    public void Afficher()
        => Console.WriteLine($"{Nom} — {PrixAchat:F2} € (stock {Stock})");
}

var catan = new Jeu();
catan.Nom = "Catan";
catan.PrixAchat = 44.9;
catan.Stock = 3;
catan.Afficher();`,
      note: "Données et comportements réunis dans un objet : même bascule qu'en Python (leçon 12). La leçon 13 remplacera ce remplissage manuel par un constructeur et des propriétés."
    },
    13: {
      titre: "constructeur et propriétés",
      etat: "Donnons à Jeu un constructeur et encapsulons le stock.",
      objectif: "Ajoute un constructeur Jeu(nom, prixAchat, stock). Expose Nom et PrixAchat en propriétés auto ; garde le stock en privé, lisible via une propriété, modifiable seulement par Louer() (jamais négatif).",
      hints: [
        "public string Nom { get; set; }",
        "private int _stock; public int Stock => _stock;",
        "Dans Louer(), teste _stock > 0 avant de décrémenter."
      ],
      solution: `class Jeu
{
    public string Nom { get; set; }
    public double PrixAchat { get; set; }
    private int _stock;
    public int Stock => _stock;

    public Jeu(string nom, double prixAchat, int stock)
    {
        Nom = nom; PrixAchat = prixAchat; _stock = stock;
    }
    public bool Louer()
    {
        if (_stock <= 0) { Console.WriteLine($"Rupture : {Nom}"); return false; }
        _stock--;
        return true;
    }
}
var catan = new Jeu("Catan", 44.9, 2);
catan.Louer();
Console.WriteLine($"Stock restant : {catan.Stock}");`,
      note: "Les propriétés { get; set; } et private encapsulent l'état : impossible de rendre le stock négatif. Python le faisait avec @property, Java avec des getters."
    },
    14: {
      titre: "héritage : les 3 rôles",
      etat: "Modélisons les utilisateurs et leurs 3 rôles par héritage et polymorphisme.",
      objectif: "Classe Utilisateur avec une méthode virtuelle Remise() renvoyant 0. Dérive Client (0), Vendeur (0.20), Administrateur (1.0). Parcours une liste mixte et affiche la remise de chacun.",
      hints: [
        "public virtual double Remise() => 0.0;",
        "class Vendeur : Utilisateur { public override double Remise() => 0.20; }"
      ],
      solution: `class Utilisateur
{
    public string Nom;
    public Utilisateur(string nom) => Nom = nom;
    public virtual double Remise() => 0.0;
}
class Client : Utilisateur { public Client(string n) : base(n) {} }
class Vendeur : Utilisateur
{
    public Vendeur(string n) : base(n) {}
    public override double Remise() => 0.20;
}
class Administrateur : Utilisateur
{
    public Administrateur(string n) : base(n) {}
    public override double Remise() => 1.0;
}

var gens = new List<Utilisateur> { new Client("Ana"), new Vendeur("Bob"), new Administrateur("Zoe") };
foreach (var u in gens)
    Console.WriteLine($"{u.Nom} -> {u.Remise() * 100} %");`,
      note: "virtual/override réalisent le polymorphisme : on appelle Remise() sans connaître le rôle exact. Python le faisait sans mot-clé ; Java utilise @Override."
    },
    15: {
      titre: "une abstraction pour les transactions",
      etat: "Achat et location sont deux transactions différentes mais partagent un montant. Abstraisons.",
      objectif: "Crée une classe abstraite Transaction avec une méthode abstraite Montant(). Dérive Achat (prix d'achat) et Location (prix/jour × jours). Calcule et affiche le montant de chacune de façon uniforme.",
      hints: [
        "abstract class Transaction { public abstract double Montant(); }",
        "Chaque sous-classe implémente Montant() à sa façon."
      ],
      solution: `abstract class Transaction
{
    public string Jeu;
    protected Transaction(string jeu) => Jeu = jeu;
    public abstract double Montant();
}
class Achat : Transaction
{
    double _prix;
    public Achat(string jeu, double prix) : base(jeu) => _prix = prix;
    public override double Montant() => _prix;
}
class Location : Transaction
{
    double _prixJour; int _jours;
    public Location(string jeu, double pj, int j) : base(jeu) { _prixJour = pj; _jours = j; }
    public override double Montant() => _prixJour * _jours;
}

var ops = new List<Transaction> { new Achat("Catan", 44.9), new Location("Azul", 5, 4) };
foreach (var t in ops)
    Console.WriteLine($"{t.Jeu} : {t.Montant():F2} €");`,
      note: "Une classe abstraite impose un contrat (Montant()) sans dire comment. C'est l'équivalent des interfaces/abstractions de Java ; Python utilisait plutôt le polymorphisme simple ou le module abc."
    },
    16: {
      titre: "gérer les erreurs",
      etat: "Louer un jeu en rupture doit être géré proprement, pas par un simple message dispersé.",
      objectif: "Crée une exception StockInsuffisantException. Louer() la lève si le stock est nul. Appelle-la dans un try/catch et affiche un message clair.",
      hints: [
        "class StockInsuffisantException : Exception { public StockInsuffisantException(string m) : base(m) {} }",
        "throw new ...; try { } catch (StockInsuffisantException e) { }"
      ],
      solution: `class StockInsuffisantException : Exception
{
    public StockInsuffisantException(string m) : base(m) {}
}

static void Louer(string nom, int stock)
{
    if (stock <= 0)
        throw new StockInsuffisantException($"{nom} indisponible");
}

try
{
    Louer("Dixit", 0);
}
catch (StockInsuffisantException e)
{
    Console.WriteLine($"Location refusee : {e.Message}");
}`,
      note: "try/catch (C#) = try/except (Python) = try/catch (Java). Une exception sépare nettement le cas normal du cas d'erreur."
    },
    17: {
      titre: "sauvegarder le catalogue",
      etat: "Rendons les données persistantes en les écrivant sur le disque.",
      objectif: "Sérialise le catalogue (liste d'objets) en JSON avec System.Text.Json, écris-le dans un fichier, puis relis-le pour vérifier.",
      hints: [
        "using System.Text.Json;",
        "File.WriteAllText(\"catalogue.json\", JsonSerializer.Serialize(liste));",
        "JsonSerializer.Deserialize<List<Jeu>>(File.ReadAllText(...))"
      ],
      solution: `using System.Text.Json;

var catalogue = new List<Jeu>
{
    new Jeu("Catan", 44.9, 3),
    new Jeu("Azul", 39.9, 5),
};
string json = JsonSerializer.Serialize(catalogue);
File.WriteAllText("catalogue.json", json);

string lu = File.ReadAllText("catalogue.json");
var recharge = JsonSerializer.Deserialize<List<Jeu>>(lu);
Console.WriteLine($"Jeux recharges : {recharge.Count}");`,
      note: "System.Text.Json fait le pont objet ⇄ texte, comme le module json de Python. File.WriteAllText/ReadAllText simplifient l'accès fichier (voir aussi StreamWriter/StreamReader, leçon 17)."
    },
    18: {
      titre: "indexer et requêter (LINQ)",
      etat: "Retrouver un jeu par id et interroger le catalogue : Dictionary et LINQ sont faits pour ça.",
      objectif: "Indexe les jeux par id dans un Dictionary<int, Jeu>. Avec LINQ, sélectionne les jeux en stock et calcule le prix moyen.",
      hints: [
        "var parId = new Dictionary<int, Jeu>(); parId[1] = ...;",
        "catalogue.Where(j => j.Stock > 0) ; catalogue.Average(j => j.PrixAchat)"
      ],
      solution: `using System.Linq;

var catalogue = new List<Jeu>
{
    new Jeu("Catan", 44.9, 3),
    new Jeu("Dixit", 29.9, 0),
    new Jeu("Azul", 39.9, 5),
};
var parId = new Dictionary<int, Jeu>();
for (int i = 0; i < catalogue.Count; i++) parId[i + 1] = catalogue[i];
Console.WriteLine($"Jeu 1 : {parId[1].Nom}");

var dispo = catalogue.Where(j => j.Stock > 0).Select(j => j.Nom);
Console.WriteLine($"Disponibles : {string.Join(", ", dispo)}");
Console.WriteLine($"Prix moyen : {catalogue.Average(j => j.PrixAchat):F2} €");`,
      note: "LINQ (Where, Select, Average) rend les requêtes très lisibles — c'est l'équivalent des compréhensions de Python et des Streams de Java. Dictionary = dict Python = HashMap Java."
    },
    19: {
      titre: "dates de location et retards",
      etat: "Une location a une durée : calculons dates de retour et pénalités.",
      objectif: "Avec DateTime, fixe une date de début, un retour prévu (+4 j) et un retour réel (+6 j). Calcule le retard et une pénalité de 2 € par jour (jamais négative). Ajoute un enum Role.",
      hints: [
        "DateTime.Today.AddDays(4) ; (a - b).Days donne l'écart en jours.",
        "Math.Max(retard, 0) évite le négatif.",
        "enum Role { Client, Vendeur, Admin }"
      ],
      solution: `enum Role { Client, Vendeur, Admin }

DateTime debut = DateTime.Today;
DateTime retourPrevu = debut.AddDays(4);
DateTime retourReel = debut.AddDays(6);

int retard = (retourReel - retourPrevu).Days;
int penalite = Math.Max(retard, 0) * 2;    // 2 € / jour
Console.WriteLine($"Role : {Role.Client} — Retard : {retard} j — Penalite : {penalite} €");`,
      note: "DateTime et TimeSpan gèrent les dates proprement (jours, comparaisons). L'enum nomme les rôles au lieu de chaînes fragiles — Python utilisait Enum, Java aussi."
    },
    20: {
      titre: "🏁 assembler la Ludothèque",
      etat: "Toutes les briques existent : réunissons-les en une application cohérente.",
      objectif: "Assemble une classe Ludotheque contenant une List<Jeu>, capable d'ajouter un jeu, de le louer (gestion du stock via exception) et d'afficher le catalogue. Fais tourner un scénario.",
      hints: [
        "La Ludotheque possède private List<Jeu> _catalogue = new();",
        "Méthodes : Ajouter(Jeu), Louer(string nom), Afficher().",
        "Réutilise Jeu et sa méthode Louer() de la leçon 13."
      ],
      solution: `class Ludotheque
{
    private List<Jeu> _catalogue = new();
    public void Ajouter(Jeu j) => _catalogue.Add(j);
    public void Louer(string nom)
    {
        var jeu = _catalogue.FirstOrDefault(j => j.Nom == nom);
        if (jeu == null) { Console.WriteLine($"Introuvable : {nom}"); return; }
        if (jeu.Louer()) Console.WriteLine($"Loue : {nom} - stock {jeu.Stock}");
    }
    public void Afficher()
    {
        foreach (var j in _catalogue)
            Console.WriteLine($" - {j.Nom} ({j.Stock} en stock)");
    }
}

var ludo = new Ludotheque();
ludo.Ajouter(new Jeu("Catan", 44.9, 2));
ludo.Ajouter(new Jeu("Azul", 39.9, 5));
ludo.Louer("Catan");
ludo.Afficher();`,
      note: "Une application orientée objet complète en console. Les cours frameworks (ASP.NET, Spring, Laravel, Django) reprendront ce domaine, mais en web avec une base de données."
    },
    21: {
      titre: "🎓 étendre l'application",
      etat: "Épreuve finale : ajoute une fonctionnalité de bout en bout.",
      objectif: "Ajoute un journal des transactions et un rapport administrateur : chaque opération est enregistrée (jeu, type, montant), et l'admin peut afficher le chiffre d'affaires total (via LINQ) et le nombre de transactions.",
      hints: [
        "record Transaction(string Jeu, string Type, double Montant);",
        "Stocke-les dans une List<Transaction>.",
        "transactions.Sum(t => t.Montant) ; réserve le rapport au rôle admin."
      ],
      solution: `record Op(string Jeu, string Type, double Montant);

var journal = new List<Op>();
void Enregistrer(string jeu, string type, double montant)
    => journal.Add(new Op(jeu, type, montant));

void Rapport(Role role)
{
    if (role != Role.Admin) { Console.WriteLine("Acces refuse"); return; }
    double ca = journal.Sum(t => t.Montant);
    Console.WriteLine($"{journal.Count} transactions — CA : {ca:F2} €");
}

Enregistrer("Catan", "location", 18.0);
Enregistrer("Azul", "achat", 39.9);
Rapport(Role.Admin);`,
      note: "Tu réunis classes, collections, LINQ, enum et rôles : la synthèse du cours. Compare cette solution à celle de Python et Java — même fonctionnalité, trois styles."
    }
  }
};
