/* ===== Fil rouge « La Ludothèque » — cours Python (21 étapes) =====
   Application unique, identique dans tous les cours, pour comparer les langages.
   Une ludothèque de jeux de société : catalogue, 3 rôles (client, vendeur,
   administrateur), achat ET location. On part du procédural puis on bascule
   en orienté objet à partir de la leçon 12. */
var FIL = {
  prefix: "py21",
  app: "La Ludothèque",
  placeholder: "Écris ton code Python ici…",
  etapes: {
    1: {
      titre: "l'écran d'accueil",
      etat: "Le projet démarre : rien n'existe encore. On pose la première pierre — la ludothèque doit se présenter quand on lance le programme.",
      objectif: "Affiche une bannière d'accueil : le nom « La Ludothèque » et sa promesse (achat &amp; location de jeux de société), encadrée par des lignes de séparation.",
      hints: [
        "print() affiche une ligne ; \"=\" * 40 répète le caractère 40 fois.",
        "Trois print() suffisent : ligne, titre, ligne."
      ],
      solution: `print("=" * 40)
print("       BIENVENUE A LA LUDOTHEQUE")
print("   Achat & location de jeux de societe")
print("=" * 40)`,
      note: "C'est le point de départ commun à tous les langages : un simple affichage. Compare la syntaxe de print() ici avec Console.WriteLine (C#), System.out.println (Java) ou echo (PHP)."
    },
    2: {
      titre: "représenter un jeu",
      etat: "L'accueil s'affiche. Mais un catalogue a besoin de données : il faut décrire un jeu de société.",
      objectif: "Crée les variables décrivant un jeu : nom (texte), prix d'achat et prix de location par jour (décimaux), stock (entier) et un booléen « disponible » calculé à partir du stock. Affiche-les.",
      hints: [
        "Un décimal s'écrit avec un point : 44.90.",
        "disponible = stock > 0 renvoie un booléen."
      ],
      solution: `nom = "Catan"
prix_achat = 44.90       # float : prix de vente
prix_location = 5.0      # float : par jour
stock = 3               # int
disponible = stock > 0   # bool

print(nom, prix_achat, prix_location, stock, disponible)`,
      note: "Python déduit le type tout seul (typage dynamique). Observe la différence avec C# ou Java, où il faut écrire string, double, int explicitement."
    },
    3: {
      titre: "calculer un tarif de location",
      etat: "Un jeu est décrit par des variables. Passons aux calculs : combien coûte une location de plusieurs jours ?",
      objectif: "Calcule le coût d'une location : prix par jour × nombre de jours, avec une remise de 10 % à partir de 3 jours. Affiche le total avec 2 décimales.",
      hints: [
        "total = prix_location * jours.",
        "Applique la remise dans un if jours >= 3 : total *= 0.9.",
        "Formate avec f\"{total:.2f} €\"."
      ],
      solution: `prix_location = 5.0
jours = 4
total = prix_location * jours
if jours >= 3:
    total *= 0.9          # -10% dès 3 jours
print(f"Location {jours} jours : {total:.2f} €")`,
      note: "Le formatage à 2 décimales (:.2f) est essentiel pour de l'argent. Chaque langage a sa syntaxe : compare avec {0:F2} en C# ou number_format en PHP."
    },
    4: {
      titre: "un premier menu interactif",
      etat: "On sait calculer un tarif. Rendons le programme interactif : l'utilisateur doit pouvoir choisir.",
      objectif: "Affiche un petit menu (1 = acheter, 2 = louer), lis le choix de l'utilisateur puis le nom du jeu au clavier, et récapitule sa sélection.",
      hints: [
        "input(\"...\") lit une ligne de texte au clavier.",
        "La valeur renvoyée par input() est toujours une chaîne."
      ],
      solution: `print("Que veux-tu faire ?")
print("  1) Acheter un jeu")
print("  2) Louer un jeu")
choix = input("Ton choix : ")
nom = input("Nom du jeu : ")
print(f"Option {choix} demandee pour : {nom}")`,
      note: "input() renvoie toujours du texte. Pour comparer : Java utilise Scanner, C# Console.ReadLine, PHP lit plutôt les données d'un formulaire web."
    },
    5: {
      titre: "un tarif selon le rôle",
      etat: "Le programme dialogue avec l'utilisateur. Introduisons les 3 rôles : client, vendeur, administrateur.",
      objectif: "Selon le rôle saisi, calcule le prix : plein tarif pour un client, -20 % pour un vendeur, gratuit pour un administrateur (mode test). Utilise if / elif / else.",
      hints: [
        "Compare le rôle avec ==.",
        "elif enchaîne les conditions ; else gère le cas restant (client)."
      ],
      solution: `role = input("Role (client/vendeur/admin) : ")
prix = 44.90
if role == "admin":
    prix = 0.0            # gratuit en test
elif role == "vendeur":
    prix = prix * 0.8    # -20% pour le personnel
else:
    prix = prix          # plein tarif client
print(f"Prix pour un {role} : {prix:.2f} €")`,
      note: "Ces 3 rôles reviendront tout au long du projet — jusqu'à devenir des classes filles d'Utilisateur (leçon 14), puis des comptes avec permissions dans les frameworks."
    },
    6: {
      titre: "afficher le catalogue",
      etat: "Un seul jeu ne fait pas une ludothèque. Il en faut plusieurs, et savoir tous les parcourir.",
      objectif: "À partir de deux listes parallèles (noms et prix), affiche le catalogue numéroté avec une boucle : « 1. Catan — 44.90 € », etc.",
      hints: [
        "range(len(noms)) donne les indices 0,1,2…",
        "Accède aux éléments par noms[i] et prix[i]."
      ],
      solution: `noms = ["Catan", "Carcassonne", "Dixit"]
prix = [44.90, 34.90, 29.90]
for i in range(len(noms)):
    print(f"{i+1}. {noms[i]} — {prix[i]:.2f} €")`,
      note: "On boucle ici sur des listes parallèles ; dès la leçon 7 on regroupera tout dans une seule structure, plus propre."
    },
    7: {
      titre: "le catalogue en liste",
      etat: "Le catalogue s'affiche mais les données sont éparpillées dans deux listes. Regroupons.",
      objectif: "Range les jeux dans une seule liste, ajoute-en un avec append(), affiche le nombre total de jeux, puis liste-les tous.",
      hints: [
        "catalogue = [\"Catan\", \"Dixit\", ...].",
        "catalogue.append(\"Azul\") ajoute un élément ; len(catalogue) compte."
      ],
      solution: `catalogue = ["Catan", "Carcassonne", "Dixit", "7 Wonders"]
catalogue.append("Azul")      # nouvel arrivage
print("Jeux au catalogue :", len(catalogue))
for jeu in catalogue:
    print(" -", jeu)`,
      note: "La liste Python est dynamique (taille variable). Compare avec les tableaux fixes de C#/Java (leçon 7 de ces cours) et List<T>/ArrayList (leçon 10)."
    },
    8: {
      titre: "extraire des fonctions",
      etat: "Le code se répète (calcul de location, affichage). Il est temps de le factoriser en fonctions réutilisables.",
      objectif: "Écris deux fonctions : prix_location(prix_jour, jours) qui renvoie le total (avec la remise dès 3 jours), et afficher(nom, prix) qui affiche une ligne. Utilise-les.",
      hints: [
        "def nom(parametres): puis return pour renvoyer une valeur.",
        "afficher() ne renvoie rien, elle print()."
      ],
      solution: `def prix_location(prix_jour, jours):
    total = prix_jour * jours
    if jours >= 3:
        total *= 0.9
    return total

def afficher(nom, prix):
    print(f"{nom} : {prix:.2f} €")

afficher("Catan (4 jours)", prix_location(5.0, 4))`,
      note: "Une fonction = un service nommé et réutilisable. La logique de tarif est désormais à un seul endroit : on la corrige une fois pour toutes."
    },
    9: {
      titre: "fiches et recherche",
      etat: "Les fonctions structurent le code. Soignons l'affichage et ajoutons une recherche par nom.",
      objectif: "Écris une fonction fiche(nom, prix) renvoyant une fiche encadrée (nom en MAJUSCULES). Puis, parmi une liste de noms, affiche ceux qui contiennent un terme recherché (sans tenir compte de la casse).",
      hints: [
        "nom.upper() met en majuscules ; \"\\n\" saute une ligne dans la chaîne renvoyée.",
        "terme.lower() in n.lower() teste l'appartenance sans casse."
      ],
      solution: `def fiche(nom, prix):
    bord = "-" * 30
    return f"{bord}\\n  {nom.upper()}\\n  Prix : {prix:.2f} €\\n{bord}"

print(fiche("catan", 44.9))

terme = "car"
noms = ["Catan", "Carcassonne", "Dixit"]
for n in noms:
    if terme.lower() in n.lower():
        print("Trouve :", n)`,
      note: "Les méthodes de chaînes (upper, lower, in) existent partout mais s'écrivent différemment : .ToUpper() en C#, .toUpperCase() en Java, strtoupper() en PHP."
    },
    10: {
      titre: "filtrer les jeux disponibles",
      etat: "Chaque jeu porte maintenant plusieurs infos. Représentons-les ensemble et filtrons le catalogue.",
      objectif: "Représente chaque jeu par un tuple (nom, prix, stock). Avec une compréhension de liste, construis la liste des jeux en stock, puis celle de leurs noms.",
      hints: [
        "Un tuple : (\"Catan\", 44.9, 3).",
        "Compréhension : [jeu for jeu in catalogue if jeu[2] > 0]."
      ],
      solution: `catalogue = [("Catan", 44.9, 3), ("Dixit", 29.9, 0), ("Azul", 39.9, 5)]
dispo = [jeu for jeu in catalogue if jeu[2] > 0]
noms_dispo = [jeu[0] for jeu in dispo]
print("Disponibles :", noms_dispo)`,
      note: "La compréhension de liste est une signature de Python : concise et lisible. Les autres langages utiliseront LINQ (C#), les Streams (Java) ou array_filter (PHP)."
    },
    11: {
      titre: "algorithmes sur le catalogue",
      etat: "On sait filtrer. Appliquons de vrais algorithmes : trouver un extremum et trier.",
      objectif: "Sur une liste de jeux (nom, prix), trouve le jeu le plus cher avec une boucle, puis trie le catalogue du moins cher au plus cher.",
      hints: [
        "Initialise plus_cher au premier jeu, puis compare dans la boucle.",
        "sorted(catalogue, key=lambda j: j[1]) trie par prix."
      ],
      solution: `catalogue = [("Catan", 44.9), ("Dixit", 29.9), ("Azul", 39.9)]
plus_cher = catalogue[0]
for jeu in catalogue:
    if jeu[1] > plus_cher[1]:
        plus_cher = jeu
print("Le plus cher :", plus_cher[0])

tri = sorted(catalogue, key=lambda j: j[1])
print("Tri par prix :", [j[0] for j in tri])`,
      note: "Le même algorithme de recherche du maximum s'écrit dans tous les langages : c'est la logique qui compte, pas la syntaxe. C'est tout l'intérêt de ce fil rouge partagé."
    },
    12: {
      titre: "🔁 refactor : la classe Jeu",
      etat: "Tournant du projet : jusqu'ici tout était procédural (variables + fonctions). On passe à l'orienté objet. Un jeu ne sera plus un tuple mais un vrai objet.",
      objectif: "Crée une classe Jeu avec une méthode afficher(). Instancie un jeu, renseigne ses attributs (nom, prix_achat, stock) et appelle sa méthode.",
      hints: [
        "class Jeu: puis def afficher(self):.",
        "self désigne l'objet courant ; on crée un objet avec Jeu()."
      ],
      solution: `class Jeu:
    def afficher(self):
        print(f"{self.nom} — {self.prix_achat:.2f} € (stock {self.stock})")

catan = Jeu()
catan.nom = "Catan"
catan.prix_achat = 44.9
catan.stock = 3
catan.afficher()`,
      note: "Grand changement de paradigme : les données et les comportements sont réunis dans un objet. La leçon 13 remplacera cette création « à la main » par un constructeur propre."
    },
    13: {
      titre: "constructeur et encapsulation",
      etat: "La classe Jeu existe mais on remplit ses attributs à la main. Donnons-lui un constructeur et protégeons le stock.",
      objectif: "Ajoute __init__(self, nom, prix_achat, stock) pour construire un jeu en une ligne. Rends le stock « privé » (_stock) exposé par une propriété, et ajoute louer() qui décrémente le stock sans jamais passer sous zéro.",
      hints: [
        "def __init__(self, ...): self.nom = nom ...",
        "@property au-dessus de def stock(self): return self._stock.",
        "Dans louer(), vérifie self._stock > 0 avant de décrémenter."
      ],
      solution: `class Jeu:
    def __init__(self, nom, prix_achat, stock):
        self.nom = nom
        self.prix_achat = prix_achat
        self._stock = stock          # « privé » par convention

    @property
    def stock(self):
        return self._stock

    def louer(self):
        if self._stock <= 0:
            print("Rupture de stock pour", self.nom)
            return False
        self._stock -= 1
        return True

catan = Jeu("Catan", 44.9, 2)
catan.louer()
print("Stock restant :", catan.stock)   # 1`,
      note: "L'encapsulation protège l'état de l'objet : impossible de rendre le stock négatif. C# et Java feront pareil avec private + propriétés/getters."
    },
    14: {
      titre: "héritage : les 3 rôles",
      etat: "Les jeux sont des objets. Modélisons maintenant les utilisateurs et leurs 3 rôles par l'héritage et le polymorphisme.",
      objectif: "Crée une classe Utilisateur avec une méthode remise() renvoyant 0. Dérive Client (0 %), Vendeur (20 %) et Administrateur (100 %). Parcours une liste mixte et affiche la remise de chacun — sans if sur le type.",
      hints: [
        "class Client(Utilisateur): hérite d'Utilisateur.",
        "Chaque sous-classe redéfinit remise() : c'est le polymorphisme."
      ],
      solution: `class Utilisateur:
    def __init__(self, nom):
        self.nom = nom
    def remise(self):
        return 0.0

class Client(Utilisateur):
    pass

class Vendeur(Utilisateur):
    def remise(self):
        return 0.20

class Administrateur(Utilisateur):
    def remise(self):
        return 1.0

for u in [Client("Ana"), Vendeur("Bob"), Administrateur("Zoe")]:
    print(u.nom, "->", int(u.remise() * 100), "%")`,
      note: "Le polymorphisme : on appelle remise() sans savoir le rôle exact, chaque objet répond à sa façon. C'est le cœur de la POO, identique en C#, Java et PHP."
    },
    15: {
      titre: "organiser le code en modules",
      etat: "Le projet grossit : classes Jeu, Utilisateur, logique de tarif… Tout dans un seul fichier devient illisible. Découpons.",
      objectif: "Répartis le code en modules : models.py (les classes) et un programme principal qui les importe. Utilise aussi un module de la bibliothèque standard (ex. statistics) pour calculer le prix moyen du catalogue.",
      hints: [
        "Dans main : from models import Jeu, Utilisateur.",
        "import statistics puis statistics.mean(liste)."
      ],
      solution: `# ----- models.py -----
# class Jeu: ...
# class Utilisateur: ...

# ----- main.py -----
from models import Jeu
import statistics

catalogue = [Jeu("Catan", 44.9, 3), Jeu("Azul", 39.9, 5)]
prix = [j.prix_achat for j in catalogue]
print("Prix moyen :", round(statistics.mean(prix), 2), "€")`,
      note: "Découper en modules = un fichier par responsabilité. C'est l'équivalent des namespaces (C#), des packages (Java) ou de l'autoloading (PHP)."
    },
    16: {
      titre: "gérer les erreurs",
      etat: "Louer un jeu en rupture, chercher un jeu inexistant : autant de situations à gérer proprement, pas par des print() dispersés.",
      objectif: "Crée une exception StockInsuffisant. La fonction louer() la lève si le stock est nul. Appelle-la dans un try/except et affiche un message clair.",
      hints: [
        "class StockInsuffisant(Exception): pass.",
        "raise StockInsuffisant(...) ; try: ... except StockInsuffisant as e: ..."
      ],
      solution: `class StockInsuffisant(Exception):
    pass

def louer(jeu):
    if jeu["stock"] <= 0:
        raise StockInsuffisant(jeu["nom"] + " indisponible")
    jeu["stock"] -= 1

jeu = {"nom": "Dixit", "stock": 0}
try:
    louer(jeu)
except StockInsuffisant as e:
    print("Location refusee :", e)`,
      note: "Une exception sépare le cas normal du cas d'erreur. Le mécanisme try/except (Python) devient try/catch en C#, Java et PHP — même idée."
    },
    17: {
      titre: "sauvegarder le catalogue",
      etat: "Tout disparaît à la fermeture du programme. Rendons les données persistantes en les écrivant sur le disque.",
      objectif: "Enregistre le catalogue (liste de dictionnaires) dans un fichier JSON, puis relis-le pour vérifier. Le programme doit pouvoir « se souvenir » d'une exécution à l'autre.",
      hints: [
        "import json ; json.dump(data, fichier) pour écrire.",
        "with open(\"catalogue.json\", \"w\", encoding=\"utf-8\") as f: ... ; json.load(f) pour relire."
      ],
      solution: `import json

catalogue = [
    {"nom": "Catan", "prix": 44.9, "stock": 3},
    {"nom": "Azul", "prix": 39.9, "stock": 5},
]
with open("catalogue.json", "w", encoding="utf-8") as f:
    json.dump(catalogue, f, ensure_ascii=False, indent=2)

with open("catalogue.json", encoding="utf-8") as f:
    charge = json.load(f)
print("Jeux recharges :", len(charge))`,
      note: "JSON est un format universel : le même fichier sera relu par C#, Java ou PHP. Dans les frameworks, ce rôle de mémoire sera tenu par une base de données."
    },
    18: {
      titre: "indexer et compter",
      etat: "Retrouver un jeu par son identifiant et compter les locations : les dictionnaires et ensembles sont parfaits pour ça.",
      objectif: "Indexe le catalogue par identifiant dans un dictionnaire (accès direct par id). Compte le nombre de locations par jeu avec un dictionnaire, et déduis l'ensemble des genres (sans doublon).",
      hints: [
        "catalogue = {1: {...}, 2: {...}} ; accès : catalogue[1].",
        "compte[nom] = compte.get(nom, 0) + 1 pour compter.",
        "Un ensemble {..} supprime les doublons."
      ],
      solution: `catalogue = {
    1: {"nom": "Catan", "stock": 3},
    2: {"nom": "Azul", "stock": 5},
}
print("Jeu 1 :", catalogue[1]["nom"])   # accès direct par id

locations = ["Catan", "Azul", "Catan"]
compte = {}
for nom in locations:
    compte[nom] = compte.get(nom, 0) + 1
print("Locations :", compte)            # {'Catan': 2, 'Azul': 1}

genres = {"famille", "strategie", "famille"}
print("Genres :", genres)               # doublons supprimes`,
      note: "Le dictionnaire (clé → valeur) donne un accès instantané par id. Équivalents : Dictionary en C#, HashMap en Java, les tableaux associatifs en PHP."
    },
    19: {
      titre: "dates de location et retards",
      etat: "Une location a une durée. Calculons les dates de retour et les pénalités de retard.",
      objectif: "Avec le module datetime, fixe une date de début, un retour prévu (+4 jours) et un retour réel (+6 jours). Calcule le retard et une pénalité de 2 € par jour (jamais négative).",
      hints: [
        "from datetime import date, timedelta.",
        "retour = date.today() + timedelta(days=4).",
        "retard = (retour_reel - retour_prevu).days ; penalite = max(retard, 0) * 2."
      ],
      solution: `from datetime import date, timedelta

debut = date.today()
retour_prevu = debut + timedelta(days=4)
retour_reel = debut + timedelta(days=6)

retard = (retour_reel - retour_prevu).days
penalite = max(retard, 0) * 2      # 2 € / jour, jamais negatif
print(f"Retard : {retard} j — Penalite : {penalite} €")`,
      note: "Les dates sont un classique piégeux (fuseaux, jours). Chaque langage a son type : DateTime en C#, LocalDate en Java, DateTime/strtotime en PHP."
    },
    20: {
      titre: "🏁 assembler la Ludothèque",
      etat: "Toutes les briques existent : jeux, rôles, achat/location, exceptions, persistance. On les réunit en une application cohérente.",
      objectif: "Assemble une petite Ludothèque orientée objet : une classe Ludotheque contenant un catalogue de Jeu, capable d'ajouter un jeu, de le louer (avec gestion du stock) et d'afficher le catalogue. Fais tourner un petit scénario.",
      hints: [
        "Ludotheque possède une liste self.catalogue = [].",
        "Méthodes : ajouter(jeu), louer(nom), afficher().",
        "Réutilise la classe Jeu et sa méthode louer() de la leçon 13."
      ],
      solution: `class Jeu:
    def __init__(self, nom, prix, stock):
        self.nom, self.prix, self.stock = nom, prix, stock
    def louer(self):
        if self.stock <= 0:
            raise ValueError(self.nom + " indisponible")
        self.stock -= 1

class Ludotheque:
    def __init__(self):
        self.catalogue = []
    def ajouter(self, jeu):
        self.catalogue.append(jeu)
    def louer(self, nom):
        for jeu in self.catalogue:
            if jeu.nom == nom:
                jeu.louer()
                print("Loue :", nom, "- stock", jeu.stock)
                return
        print("Jeu introuvable :", nom)
    def afficher(self):
        for jeu in self.catalogue:
            print(f" - {jeu.nom} ({jeu.stock} en stock)")

ludo = Ludotheque()
ludo.ajouter(Jeu("Catan", 44.9, 2))
ludo.ajouter(Jeu("Azul", 39.9, 5))
ludo.louer("Catan")
ludo.afficher()`,
      note: "C'est l'aboutissement de la version console : une application orientée objet complète. Les cours frameworks reprendront exactement ce domaine, mais en web avec une base de données."
    },
    21: {
      titre: "🎓 étendre l'application",
      etat: "La Ludothèque fonctionne. Épreuve finale : ajoute une fonctionnalité de bout en bout, comme le ferait un vrai développeur.",
      objectif: "Ajoute un journal des transactions et un rapport administrateur : chaque location/achat est enregistré (jeu, type, montant), et l'admin peut afficher le chiffre d'affaires total et le nombre de transactions.",
      hints: [
        "Stocke les transactions dans une liste de dictionnaires {jeu, type, montant}.",
        "Le rapport : somme des montants et nombre d'éléments.",
        "Réserve l'affichage du rapport au rôle « admin »."
      ],
      solution: `transactions = []

def enregistrer(jeu, type_op, montant):
    transactions.append({"jeu": jeu, "type": type_op, "montant": montant})

def rapport(role):
    if role != "admin":
        print("Acces refuse : reserve a l'administrateur")
        return
    total = sum(t["montant"] for t in transactions)
    print(f"{len(transactions)} transactions — CA : {total:.2f} €")

enregistrer("Catan", "location", 18.0)
enregistrer("Azul", "achat", 39.9)
rapport("admin")`,
      note: "Tu réunis ici variables, fonctions, collections, conditions et rôles : la synthèse de tout le cours. La même fonctionnalité existera dans chaque langage — compare tes solutions !"
    }
  }
};
