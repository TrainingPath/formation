/* ===== Fil rouge « La Ludothèque » — cours PHP (21 étapes) =====
   Même application que dans tous les cours, pour comparer les langages.
   Ludothèque de jeux de société : catalogue, 3 rôles (client, vendeur,
   administrateur), achat ET location. PHP étant orienté web, on passe très tôt
   aux formulaires ; la bascule vers l'orienté objet a lieu aux leçons 16-17. */
var FIL = {
  prefix: "php21",
  app: "La Ludothèque",
  placeholder: "Écris ton code PHP ici…",
  etapes: {
    1: {
      titre: "l'écran d'accueil",
      etat: "Le projet démarre : rien n'existe encore. La page d'accueil de la ludothèque doit s'afficher.",
      objectif: "Écris un script PHP qui affiche une bannière : le nom « La Ludothèque » et sa promesse (achat &amp; location), encadrée par des lignes de séparation.",
      hints: [
        "echo affiche du texte ; str_repeat('=', 40) répète le signe.",
        "Chaque instruction se termine par un point-virgule."
      ],
      solution: `<?php
echo str_repeat('=', 40) . "\\n";
echo "       BIENVENUE A LA LUDOTHEQUE\\n";
echo "   Achat & location de jeux de societe\\n";
echo str_repeat('=', 40) . "\\n";`,
      note: "PHP s'ouvre avec <?php et se mêle au HTML. echo est l'équivalent de print (Python) ou System.out.println (Java). Dès la leçon 12, on produira de vraies pages web."
    },
    2: {
      titre: "représenter un jeu",
      etat: "Décrivons un jeu avec des variables.",
      objectif: "Déclare les variables d'un jeu : $nom, $prixAchat, $prixLocation, $stock, et $disponible (calculé depuis le stock). Affiche-les.",
      hints: [
        "En PHP, toute variable commence par $ : $nom = 'Catan';",
        "$disponible = $stock > 0; renvoie un booléen."
      ],
      solution: `<?php
$nom = "Catan";
$prixAchat = 44.90;      // float
$prixLocation = 5.0;     // par jour
$stock = 3;              // int
$disponible = $stock > 0; // bool

echo "$nom - $prixAchat EUR - stock $stock - dispo " . ($disponible ? 'oui' : 'non');`,
      note: "PHP a un typage dynamique comme Python : pas besoin de déclarer le type. Le $ devant chaque variable est la signature du langage."
    },
    3: {
      titre: "comparer avec == et ===",
      etat: "Avant d'aller plus loin, méfions-nous des comparaisons : PHP distingue == et ===.",
      objectif: "Montre la différence : compare le stock reçu (souvent une chaîne, ex. \"0\") avec 0 en == puis en ===. Décide si un jeu est en rupture de façon FIABLE.",
      hints: [
        "== compare la valeur après conversion ; === compare valeur ET type.",
        "\"0\" == 0 est true, mais \"0\" === 0 est false : préfère === pour être sûr."
      ],
      solution: `<?php
$stock = "0";                 // vient d'un formulaire : c'est une CHAINE
var_dump($stock == 0);        // true  (conversion : piege !)
var_dump($stock === 0);       // false (types differents)

// Comparaison fiable apres conversion explicite :
$stockNum = (int) $stock;
if ($stockNum === 0) {
    echo "Rupture de stock";
}`,
      note: "L'égalité stricte === évite les pièges de conversion de PHP. C'est une source de bugs classique : convertis explicitement les données reçues avant de comparer."
    },
    4: {
      titre: "la fiche d'un jeu",
      etat: "Soignons l'affichage d'un jeu avec l'interpolation de chaînes.",
      objectif: "Écris une fiche formatée d'un jeu en utilisant l'interpolation entre guillemets et {$...} pour les expressions. Affiche nom, prix et stock.",
      hints: [
        "Entre guillemets doubles, \"$nom\" est remplacé par sa valeur.",
        "Pour une expression, utilise les accolades : \"{$prix} EUR\"."
      ],
      solution: `<?php
$nom = "Catan";
$prix = 44.90;
$stock = 3;

$fiche = "----------------------------\\n";
$fiche .= "  " . strtoupper($nom) . "\\n";
$fiche .= "  Prix : {$prix} EUR\\n";
$fiche .= "  Stock : {$stock}\\n";
$fiche .= "----------------------------";
echo $fiche;`,
      note: "L'interpolation \"$var\" et \"{$expr}\" rend le texte lisible. Attention : elle ne marche qu'entre guillemets DOUBLES, pas entre apostrophes."
    },
    5: {
      titre: "un tarif selon le rôle",
      etat: "Introduisons les 3 rôles : client, vendeur, administrateur.",
      objectif: "Selon le rôle, calcule le prix : plein tarif (client), -20 % (vendeur), gratuit (admin). Utilise l'expression match.",
      hints: [
        "match ($role) { 'admin' => 0.0, 'vendeur' => $prix * 0.8, default => $prix };",
        "match compare en === (strict) et renvoie une valeur."
      ],
      solution: `<?php
$role = "vendeur";
$prix = 44.90;

$prixFinal = match ($role) {
    'admin'   => 0.0,          // gratuit en test
    'vendeur' => $prix * 0.8,  // -20%
    default   => $prix,        // client : plein tarif
};
echo "Prix pour un $role : " . number_format($prixFinal, 2) . " EUR";`,
      note: "match (PHP 8) est un switch moderne : il renvoie une valeur et compare en strict (===). number_format formate joliment un montant."
    },
    6: {
      titre: "afficher le catalogue",
      etat: "Il faut plusieurs jeux et savoir les parcourir.",
      objectif: "À partir d'un tableau de noms, affiche le catalogue numéroté avec une boucle foreach (en récupérant aussi l'indice).",
      hints: [
        "foreach ($noms as $i => $nom) { ... }",
        "$i commence à 0 ; affiche $i + 1 pour numéroter."
      ],
      solution: `<?php
$noms = ["Catan", "Carcassonne", "Dixit"];
foreach ($noms as $i => $nom) {
    echo ($i + 1) . ". $nom\\n";
}`,
      note: "foreach est la boucle reine de PHP pour parcourir un tableau. La forme $cle => $valeur donne aussi l'indice (ou la clé d'un tableau associatif)."
    },
    7: {
      titre: "le catalogue en tableau indexé",
      etat: "Regroupons les jeux dans un tableau indexé.",
      objectif: "Crée un tableau indexé de jeux, ajoute-en un avec [], affiche le nombre total (count) et liste-les.",
      hints: [
        "$catalogue = ['Catan', 'Dixit'];",
        "$catalogue[] = 'Azul'; ajoute à la fin ; count($catalogue) compte."
      ],
      solution: `<?php
$catalogue = ["Catan", "Carcassonne", "Dixit"];
$catalogue[] = "Azul";           // ajout a la fin
echo "Jeux : " . count($catalogue) . "\\n";
foreach ($catalogue as $jeu) {
    echo " - $jeu\\n";
}`,
      note: "Le tableau PHP est dynamique (il grandit tout seul). [] ajoute un élément, count() le compte. C'est l'équivalent de la liste Python."
    },
    8: {
      titre: "un jeu en tableau associatif",
      etat: "Un jeu a plusieurs infos : regroupons-les par clés.",
      objectif: "Représente un jeu par un tableau associatif (nom, prix, stock). Range plusieurs jeux dans un tableau, puis affiche la fiche de chacun via ses clés.",
      hints: [
        "$jeu = ['nom' => 'Catan', 'prix' => 44.9, 'stock' => 3];",
        "Accès : $jeu['nom'] ; parcours avec foreach."
      ],
      solution: `<?php
$catalogue = [
    ['nom' => 'Catan', 'prix' => 44.9, 'stock' => 3],
    ['nom' => 'Azul',  'prix' => 39.9, 'stock' => 5],
];
foreach ($catalogue as $jeu) {
    echo "{$jeu['nom']} : {$jeu['prix']} EUR (stock {$jeu['stock']})\\n";
}`,
      note: "Le tableau associatif (clé => valeur) structure les données sans classe. C'est l'ancêtre de l'objet Jeu qu'on créera à la leçon 16 — et le cousin du dict Python."
    },
    9: {
      titre: "extraire des fonctions",
      etat: "Le code se répète : factorisons-le en fonctions.",
      objectif: "Écris prixLocation($prixJour, $jours) (remise dès 3 jours) et afficherFiche($jeu) qui affiche un jeu (tableau associatif). Utilise-les.",
      hints: [
        "function prixLocation($prixJour, $jours) { ... return $total; }",
        "Passe le tableau associatif du jeu en paramètre."
      ],
      solution: `<?php
function prixLocation($prixJour, $jours) {
    $total = $prixJour * $jours;
    if ($jours >= 3) {
        $total *= 0.9;           // -10%
    }
    return $total;
}
function afficherFiche($jeu) {
    echo strtoupper($jeu['nom']) . " : {$jeu['prix']} EUR\\n";
}

$catan = ['nom' => 'Catan', 'prix' => 44.9];
afficherFiche($catan);
echo "Location 4 jours : " . prixLocation(5.0, 4) . " EUR";`,
      note: "Une fonction nomme et réutilise un traitement. PHP type les paramètres de façon optionnelle : on pourrait écrire prixLocation(float \\$prixJour, int \\$jours): float."
    },
    10: {
      titre: "les fonctions natives de tableaux",
      etat: "PHP offre des centaines de fonctions natives : servons-nous-en pour filtrer et trier.",
      objectif: "Avec array_filter, garde les jeux en stock ; avec usort, trie le catalogue par prix ; avec array_sum, calcule le total d'un panier de prix.",
      hints: [
        "array_filter($catalogue, fn($j) => $j['stock'] > 0)",
        "usort($catalogue, fn($a, $b) => $a['prix'] <=> $b['prix'])",
        "array_sum([44.9, 39.9])"
      ],
      solution: `<?php
$catalogue = [
    ['nom' => 'Catan', 'prix' => 44.9, 'stock' => 3],
    ['nom' => 'Dixit', 'prix' => 29.9, 'stock' => 0],
    ['nom' => 'Azul',  'prix' => 39.9, 'stock' => 5],
];
$dispo = array_filter($catalogue, fn($j) => $j['stock'] > 0);
usort($dispo, fn($a, $b) => $a['prix'] <=> $b['prix']);   // tri par prix
foreach ($dispo as $j) echo "{$j['nom']} ({$j['prix']})\\n";

$panier = array_sum(array_column($catalogue, 'prix'));
echo "Total catalogue : $panier EUR";`,
      note: "array_filter, usort, array_column, array_sum : la boîte à outils de PHP. L'opérateur <=> (spaceship) compare et renvoie -1, 0 ou 1 — parfait pour trier."
    },
    11: {
      titre: "algorithmes sur le catalogue",
      etat: "Appliquons de vrais algorithmes : extremum et total.",
      objectif: "Sur le catalogue, trouve le jeu le plus cher avec une boucle (sans fonction native), et calcule la valeur totale du stock (somme de prix × stock).",
      hints: [
        "Initialise $plusCher au premier jeu, compare dans la boucle.",
        "Accumule $valeur += $j['prix'] * $j['stock']."
      ],
      solution: `<?php
$catalogue = [
    ['nom' => 'Catan', 'prix' => 44.9, 'stock' => 3],
    ['nom' => 'Azul',  'prix' => 39.9, 'stock' => 5],
];
$plusCher = $catalogue[0];
$valeur = 0;
foreach ($catalogue as $j) {
    if ($j['prix'] > $plusCher['prix']) $plusCher = $j;
    $valeur += $j['prix'] * $j['stock'];
}
echo "Le plus cher : {$plusCher['nom']}\\n";
echo "Valeur du stock : $valeur EUR";`,
      note: "Le même algorithme du maximum existe dans tous les langages : la logique prime sur la syntaxe. C'est l'intérêt de ce fil rouge partagé."
    },
    12: {
      titre: "🌐 un formulaire de location",
      etat: "Tournant PHP : on entre dans le web. L'utilisateur doit pouvoir demander une location via un formulaire.",
      objectif: "Crée un formulaire HTML (méthode POST) pour choisir un jeu et un nombre de jours, et un script PHP qui lit $_POST et calcule le prix de la location.",
      hints: [
        "Le formulaire : <form method=\"post\"> ... <input name=\"jours\"> </form>.",
        "Côté PHP : $_POST['jeu'] et (int) $_POST['jours']."
      ],
      solution: `<form method="post">
  <input name="jeu" placeholder="Nom du jeu">
  <input name="jours" type="number" value="1">
  <button>Louer</button>
</form>

<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $jeu   = $_POST['jeu'] ?? '';
    $jours = (int) ($_POST['jours'] ?? 0);
    $total = 5.0 * $jours * ($jours >= 3 ? 0.9 : 1);
    echo "Location de $jeu pour $jours jours : " . number_format($total, 2) . " EUR";
}`,
      note: "$_POST contient les données envoyées par le formulaire. C'est le vrai début de la ludothèque WEB. L'opérateur ?? fournit une valeur par défaut si la clé manque."
    },
    13: {
      titre: "valider et sécuriser les entrées",
      etat: "Ne jamais faire confiance aux données reçues : validons et sécurisons le formulaire.",
      objectif: "Valide les données de location : le nom non vide, les jours entre 1 et 30, et échappe le nom avant de l'afficher (anti-XSS).",
      hints: [
        "trim() enlève les espaces ; vérifie le vide.",
        "filter_var($jours, FILTER_VALIDATE_INT, ...) ou un simple test de bornes.",
        "htmlspecialchars($nom) neutralise le HTML injecté."
      ],
      solution: `<?php
$nom   = trim($_POST['jeu'] ?? '');
$jours = (int) ($_POST['jours'] ?? 0);
$erreurs = [];

if ($nom === '')                    $erreurs[] = "Nom obligatoire";
if ($jours < 1 || $jours > 30)      $erreurs[] = "Jours entre 1 et 30";

if ($erreurs) {
    foreach ($erreurs as $e) echo "- $e\\n";
} else {
    // Affichage SECURISE : on echappe le HTML
    echo "Location de " . htmlspecialchars($nom) . " pour $jours jours";
}`,
      note: "htmlspecialchars empêche les attaques XSS (injection de <script>). Valider les bornes et échapper à l'affichage sont deux réflexes de sécurité indispensables."
    },
    14: {
      titre: "un panier en session",
      etat: "Un client ajoute plusieurs jeux avant de valider : gardons son panier entre les pages avec la session.",
      objectif: "Démarre une session et gère un panier de location : ajoute un jeu reçu en POST au tableau $_SESSION['panier'], puis affiche le panier.",
      hints: [
        "session_start(); en tout début de script.",
        "$_SESSION['panier'][] = $jeu; conserve les données d'une page à l'autre."
      ],
      solution: `<?php
session_start();
$_SESSION['panier'] ??= [];        // initialise si absent

if (!empty($_POST['jeu'])) {
    $_SESSION['panier'][] = htmlspecialchars(trim($_POST['jeu']));
}

echo "Panier (" . count($_SESSION['panier']) . ") :\\n";
foreach ($_SESSION['panier'] as $jeu) {
    echo " - $jeu\\n";
}`,
      note: "La session mémorise des données propres à chaque visiteur, côté serveur, d'une page à l'autre. C'est ce qui rend possible un panier — ici de location."
    },
    15: {
      titre: "persister le catalogue en JSON",
      etat: "Rendons le catalogue durable en l'écrivant dans un fichier JSON.",
      objectif: "Sérialise le catalogue en JSON avec json_encode et écris-le dans un fichier ; relis-le avec file_get_contents + json_decode et affiche le nombre de jeux.",
      hints: [
        "json_encode($catalogue, JSON_PRETTY_PRINT)",
        "file_put_contents('catalogue.json', $json) ; file_get_contents(...)",
        "json_decode($json, true) renvoie un tableau associatif."
      ],
      solution: `<?php
$catalogue = [
    ['nom' => 'Catan', 'prix' => 44.9, 'stock' => 3],
    ['nom' => 'Azul',  'prix' => 39.9, 'stock' => 5],
];
file_put_contents('catalogue.json', json_encode($catalogue, JSON_PRETTY_PRINT));

$lu = json_decode(file_get_contents('catalogue.json'), true);
echo "Jeux recharges : " . count($lu);`,
      note: "json_encode/json_decode font le pont tableau ⇄ texte, comme le module json de Python. À la leçon 18, ce rôle de mémoire sera tenu par une base de données."
    },
    16: {
      titre: "🔁 refactor : la classe Jeu",
      etat: "Tournant objet : le jeu, jusqu'ici tableau associatif, devient une vraie classe.",
      objectif: "Crée une classe Jeu avec des propriétés (nom, prix, stock) et une méthode fiche(). Instancie un jeu et appelle sa méthode.",
      hints: [
        "class Jeu { public $nom; public $prix; ... public function fiche() {...} }",
        "$this->nom désigne la propriété de l'objet ; new Jeu() crée un objet."
      ],
      solution: `<?php
class Jeu {
    public $nom;
    public $prix;
    public $stock;
    public function fiche() {
        return strtoupper($this->nom) . " : {$this->prix} EUR (stock {$this->stock})";
    }
}

$catan = new Jeu();
$catan->nom = "Catan";
$catan->prix = 44.9;
$catan->stock = 3;
echo $catan->fiche();`,
      note: "Données et comportements réunis dans un objet, avec $this et ->. Même bascule qu'en Python/C#/Java (leçon 12). La leçon 17 ajoutera constructeur, visibilité et héritage."
    },
    17: {
      titre: "constructeur, visibilité, héritage",
      etat: "Structurons la POO : un constructeur pour Jeu, et une hiérarchie d'utilisateurs pour les 3 rôles.",
      objectif: "Donne à Jeu un constructeur avec propriétés privées. Crée une classe Utilisateur avec remise() = 0, et dérive Client (0), Vendeur (0.20), Administrateur (1.0).",
      hints: [
        "public function __construct(private float $prix, ...) {} (promotion PHP 8).",
        "class Vendeur extends Utilisateur { public function remise(): float { return 0.20; } }"
      ],
      solution: `<?php
class Utilisateur {
    public function __construct(public string $nom) {}
    public function remise(): float { return 0.0; }
}
class Client extends Utilisateur {}
class Vendeur extends Utilisateur {
    public function remise(): float { return 0.20; }
}
class Administrateur extends Utilisateur {
    public function remise(): float { return 1.0; }
}

$gens = [new Client("Ana"), new Vendeur("Bob"), new Administrateur("Zoe")];
foreach ($gens as $u) {
    echo "{$u->nom} -> " . ($u->remise() * 100) . " %\\n";
}`,
      note: "extends + redéfinition = héritage et polymorphisme : on appelle remise() sans connaître le rôle. La promotion de propriétés du constructeur (PHP 8) réduit le code."
    },
    18: {
      titre: "lire le catalogue en base (PDO)",
      etat: "Le fichier JSON montre ses limites : passons à une vraie base de données avec PDO.",
      objectif: "Connecte-toi à une base avec PDO, exécute un SELECT sur la table jeux et affiche chaque jeu. Gère l'erreur de connexion.",
      hints: [
        "new PDO('mysql:host=localhost;dbname=ludo', $user, $pass)",
        "$pdo->query('SELECT * FROM jeux') puis foreach sur le résultat."
      ],
      solution: `<?php
try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=ludotheque;charset=utf8mb4",
        "root", ""
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $jeux = $pdo->query("SELECT nom, prix, stock FROM jeux");
    foreach ($jeux as $jeu) {
        echo "{$jeu['nom']} : {$jeu['prix']} EUR (stock {$jeu['stock']})\\n";
    }
} catch (PDOException $e) {
    echo "Erreur de connexion : " . $e->getMessage();
}`,
      note: "PDO est l'interface standard de PHP vers les bases de données. La base remplace le fichier JSON : elle sait chercher, trier et filtrer efficacement de gros catalogues."
    },
    19: {
      titre: "enregistrer une transaction (PDO préparé)",
      etat: "Un client loue ou achète : enregistrons l'opération en base, SANS faille d'injection SQL.",
      objectif: "Insère une transaction (jeu_id, type, montant) avec une requête PRÉPARÉE : des marqueurs ? et execute([...]). Explique pourquoi c'est sûr.",
      hints: [
        "$sql = 'INSERT INTO transactions (jeu_id, type, montant) VALUES (?, ?, ?)';",
        "$pdo->prepare($sql)->execute([$jeuId, $type, $montant]);"
      ],
      solution: `<?php
$jeuId   = 1;
$type    = "location";
$montant = 18.0;

$sql = "INSERT INTO transactions (jeu_id, type, montant) VALUES (?, ?, ?)";
$stmt = $pdo->prepare($sql);
$stmt->execute([$jeuId, $type, $montant]);   // valeurs liees, pas concatenees

echo "Transaction enregistree (#" . $pdo->lastInsertId() . ")";`,
      note: "La requête préparée sépare le SQL des valeurs : impossible d'injecter du code via les données. C'est LA protection contre l'injection SQL — ne concatène jamais une entrée dans une requête."
    },
    20: {
      titre: "🏁 assembler la Ludothèque",
      etat: "Toutes les briques existent : réunissons-les en une petite application web.",
      objectif: "Assemble une classe Ludotheque qui reçoit un PDO, propose catalogue() (SELECT) et louer($jeuId) (INSERT préparé + décrément du stock). Montre l'usage.",
      hints: [
        "Le constructeur reçoit le PDO : __construct(private PDO $pdo) {}.",
        "catalogue() fait un SELECT ; louer() fait un INSERT préparé.",
        "Réutilise PDO (leçons 18-19) et l'organisation objet (leçon 17)."
      ],
      solution: `<?php
class Ludotheque {
    public function __construct(private PDO $pdo) {}

    public function catalogue(): array {
        return $this->pdo->query("SELECT * FROM jeux")->fetchAll();
    }
    public function louer(int $jeuId): void {
        $this->pdo->prepare(
            "INSERT INTO transactions (jeu_id, type, montant) VALUES (?, 'location', 5)"
        )->execute([$jeuId]);
        $this->pdo->prepare("UPDATE jeux SET stock = stock - 1 WHERE id = ? AND stock > 0")
                  ->execute([$jeuId]);
    }
}

$ludo = new Ludotheque($pdo);
$ludo->louer(1);
foreach ($ludo->catalogue() as $j) echo "{$j['nom']} (stock {$j['stock']})\\n";`,
      note: "Objets + PDO + requêtes préparées : une application web complète et sûre. Les frameworks (Laravel, Django…) automatiseront ce que tu fais ici à la main."
    },
    21: {
      titre: "🎓 étendre l'application",
      etat: "Épreuve finale : ajoute une fonctionnalité de bout en bout.",
      objectif: "Ajoute un rapport administrateur : compte les transactions et calcule le chiffre d'affaires total (SUM en SQL), réservé au rôle admin.",
      hints: [
        "SELECT COUNT(*) AS n, SUM(montant) AS ca FROM transactions",
        "fetch() renvoie une ligne ; réserve l'affichage au rôle 'admin'."
      ],
      solution: `<?php
function rapport(PDO $pdo, string $role): void {
    if ($role !== 'admin') {
        echo "Acces refuse : reserve a l'administrateur";
        return;
    }
    $row = $pdo->query("SELECT COUNT(*) AS n, COALESCE(SUM(montant),0) AS ca FROM transactions")
               ->fetch();
    echo "{$row['n']} transactions — CA : " . number_format($row['ca'], 2) . " EUR";
}

rapport($pdo, 'admin');`,
      note: "Tu réunis SQL (COUNT, SUM), PDO, fonctions et rôles : la synthèse du cours. Compare avec la version Python/Java/C# (calcul en mémoire) : ici, c'est la base qui calcule."
    }
  }
};
