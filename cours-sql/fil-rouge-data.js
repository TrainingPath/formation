/* ===== Fil rouge « La Ludothèque » — cours SQL (21 étapes) =====
   On repart du MLD conçu en Merise et on le CRÉE, le REMPLIT puis l'INTERROGE
   en SQL. Tables : CATEGORIE, FOURNISSEUR, UTILISATEUR (+ CLIENT/VENDEUR/ADMIN),
   JEU, LOUER, ACHETER, RESERVER. */
var FIL = {
  prefix: "sql21",
  app: "La Ludothèque",
  placeholder: "Écris ta requête SQL ici…",
  etapes: {
    1: {
      titre: "première requête sur le catalogue",
      etat: "On suppose la base déjà créée (elle vient du MLD Merise). Regardons ce qu'elle contient.",
      objectif: "Écris une requête qui affiche TOUT le contenu de la table JEU. Puis une variante qui n'affiche que les colonnes titre et prixLocation.",
      hints: [
        "SELECT * FROM table ; affiche toutes les colonnes.",
        "Pour choisir des colonnes : SELECT col1, col2 FROM table ;"
      ],
      solution: `-- tout le catalogue
SELECT * FROM JEU;

-- seulement deux colonnes
SELECT titre, prixLocation FROM JEU;`,
      note: "SELECT est la commande reine du SQL : elle interroge les données. L'étoile * prend toutes les colonnes ; on préfère souvent nommer celles dont on a besoin."
    },
    2: {
      titre: "créer les tables CATEGORIE et JEU",
      etat: "Avant d'interroger, il faut créer les tables. On traduit le MLD en CREATE TABLE.",
      objectif: "Écris le CREATE TABLE de CATEGORIE (idCategorie, libelle) et de JEU (idJeu, titre, prixAchat, prixLocation, stockVente, stockLocation, idCategorie). Mets les bons types et la clé primaire.",
      hints: [
        "idJeu INT PRIMARY KEY (souvent AUTO_INCREMENT / IDENTITY selon le SGBD).",
        "Prix en DECIMAL(6,2), titre en VARCHAR(120), stocks en INT."
      ],
      solution: `CREATE TABLE CATEGORIE (
  idCategorie INT PRIMARY KEY,
  libelle     VARCHAR(60) NOT NULL
);

CREATE TABLE JEU (
  idJeu         INT PRIMARY KEY,
  titre         VARCHAR(120)  NOT NULL,
  prixAchat     DECIMAL(6,2)  NOT NULL,
  prixLocation  DECIMAL(6,2)  NOT NULL,
  stockVente    INT NOT NULL DEFAULT 0,
  stockLocation INT NOT NULL DEFAULT 0,
  idCategorie   INT NOT NULL,
  FOREIGN KEY (idCategorie) REFERENCES CATEGORIE(idCategorie)
);`,
      note: "CREATE TABLE crée la structure. Le type de chaque colonne, la clé primaire et la clé étrangère viennent directement du MLD Merise."
    },
    3: {
      titre: "remplir le catalogue (INSERT)",
      etat: "Les tables sont vides. Insérons des catégories et des jeux.",
      objectif: "Écris des INSERT pour ajouter 2 catégories (Stratégie, Famille) et 3 jeux reliés à ces catégories.",
      hints: [
        "INSERT INTO table (col1, col2) VALUES (v1, v2);",
        "On peut insérer plusieurs lignes en une fois avec plusieurs VALUES."
      ],
      solution: `INSERT INTO CATEGORIE (idCategorie, libelle) VALUES
  (1, 'Stratégie'),
  (2, 'Famille');

INSERT INTO JEU (idJeu, titre, prixAchat, prixLocation, stockVente, stockLocation, idCategorie) VALUES
  (1, 'Catan',       44.90, 5.00, 3, 2, 1),
  (2, 'Azul',        39.90, 4.00, 5, 3, 1),
  (3, 'Dixit',       29.90, 3.50, 4, 1, 2);`,
      note: "INSERT ajoute des lignes. Les chaînes sont entre apostrophes ; les nombres sans. L'ordre des valeurs suit l'ordre des colonnes citées."
    },
    4: {
      titre: "lister le catalogue (SELECT ... FROM)",
      etat: "Le catalogue est rempli. Affichons-le proprement.",
      objectif: "Affiche le titre et le prix de location de tous les jeux, puis renomme la colonne prixLocation en « tarif » (alias).",
      hints: [
        "SELECT titre, prixLocation FROM JEU;",
        "Alias : SELECT prixLocation AS tarif FROM JEU;"
      ],
      solution: `SELECT titre, prixLocation FROM JEU;

-- avec un alias de colonne
SELECT titre, prixLocation AS tarif FROM JEU;`,
      note: "SELECT ... FROM projette des colonnes. AS crée un alias : un nom d'affichage plus lisible, sans changer la table."
    },
    5: {
      titre: "filtrer les jeux (WHERE)",
      etat: "On veut cibler certains jeux, pas tous.",
      objectif: "Affiche les jeux dont le prix de location est inférieur à 5, puis ceux de la catégorie 1 (Stratégie).",
      hints: [
        "WHERE ajoute une condition : SELECT ... FROM JEU WHERE prixLocation < 5;",
        "On combine avec AND / OR."
      ],
      solution: `SELECT titre, prixLocation
FROM JEU
WHERE prixLocation < 5;

SELECT titre
FROM JEU
WHERE idCategorie = 1;`,
      note: "WHERE filtre les lignes selon une condition. On enchaîne les conditions avec AND et OR, et on regroupe avec des parenthèses."
    },
    6: {
      titre: "trier et limiter (ORDER BY, LIMIT)",
      etat: "On veut un classement : les jeux les plus chers d'abord.",
      objectif: "Affiche les jeux triés du plus cher au moins cher (prix de location), puis les 2 premiers seulement.",
      hints: [
        "ORDER BY prixLocation DESC trie décroissant.",
        "LIMIT 2 (MySQL/PostgreSQL) ou TOP 2 (SQL Server) limite le nombre de lignes."
      ],
      solution: `SELECT titre, prixLocation
FROM JEU
ORDER BY prixLocation DESC;

-- les 2 plus chers
SELECT titre, prixLocation
FROM JEU
ORDER BY prixLocation DESC
LIMIT 2;`,
      note: "ORDER BY trie (ASC par défaut, DESC pour l'inverse). LIMIT (ou TOP en SQL Server) borne le nombre de lignes renvoyées."
    },
    7: {
      titre: "recherches fines (LIKE, IN, BETWEEN)",
      etat: "On veut chercher par motif, par liste, par intervalle.",
      objectif: "Trouve les jeux dont le titre commence par « C » (LIKE), ceux des catégories 1 ou 2 (IN), et ceux dont le prix de location est entre 3 et 5 (BETWEEN).",
      hints: [
        "LIKE 'C%' : commence par C ; % remplace n'importe quelle suite.",
        "IN (1, 2) : la valeur est dans la liste ; BETWEEN 3 AND 5 : dans l'intervalle."
      ],
      solution: `SELECT titre FROM JEU WHERE titre LIKE 'C%';

SELECT titre FROM JEU WHERE idCategorie IN (1, 2);

SELECT titre, prixLocation
FROM JEU
WHERE prixLocation BETWEEN 3 AND 5;`,
      note: "LIKE cherche par motif (% = plusieurs caractères, _ = un seul), IN teste l'appartenance à une liste, BETWEEN un intervalle bornes comprises."
    },
    8: {
      titre: "compter et calculer (agrégats)",
      etat: "On veut des chiffres globaux sur le catalogue.",
      objectif: "Compte le nombre de jeux (COUNT), calcule le prix de location moyen (AVG), le plus élevé (MAX) et le stock de location total (SUM).",
      hints: [
        "COUNT(*) compte les lignes ; AVG(col), MAX(col), SUM(col) calculent.",
        "Une fonction d'agrégation résume plusieurs lignes en une valeur."
      ],
      solution: `SELECT COUNT(*)            AS nb_jeux,
       AVG(prixLocation)   AS prix_moyen,
       MAX(prixLocation)   AS prix_max,
       SUM(stockLocation)  AS stock_total
FROM JEU;`,
      note: "Les fonctions d'agrégation (COUNT, SUM, AVG, MIN, MAX) résument un ensemble de lignes en une seule valeur. Sans GROUP BY, elles portent sur toute la table."
    },
    9: {
      titre: "regrouper par catégorie (GROUP BY)",
      etat: "On veut ces chiffres CATÉGORIE PAR CATÉGORIE.",
      objectif: "Compte le nombre de jeux par catégorie (GROUP BY), puis ne garde que les catégories ayant au moins 2 jeux (HAVING).",
      hints: [
        "GROUP BY idCategorie regroupe les lignes par catégorie.",
        "HAVING filtre les GROUPES (après agrégation), là où WHERE filtre les lignes."
      ],
      solution: `SELECT idCategorie, COUNT(*) AS nb_jeux
FROM JEU
GROUP BY idCategorie;

-- seulement les catégories avec 2 jeux ou plus
SELECT idCategorie, COUNT(*) AS nb_jeux
FROM JEU
GROUP BY idCategorie
HAVING COUNT(*) >= 2;`,
      note: "GROUP BY forme des groupes ; les agrégats se calculent par groupe. HAVING filtre les groupes (après), WHERE filtre les lignes (avant)."
    },
    10: {
      titre: "joindre jeu et catégorie (INNER JOIN)",
      etat: "Les jeux référencent la catégorie par un id : affichons le LIBELLÉ.",
      objectif: "Affiche chaque jeu avec le libellé de sa catégorie, en joignant JEU et CATEGORIE sur idCategorie.",
      hints: [
        "JOIN relie deux tables sur une condition (souvent FK = PK).",
        "SELECT ... FROM JEU JOIN CATEGORIE ON JEU.idCategorie = CATEGORIE.idCategorie"
      ],
      solution: `SELECT JEU.titre, CATEGORIE.libelle
FROM JEU
INNER JOIN CATEGORIE
        ON JEU.idCategorie = CATEGORIE.idCategorie;`,
      note: "L'INNER JOIN combine les lignes de deux tables qui correspondent (FK = PK). C'est ainsi qu'on « remonte » le libellé au lieu du simple id."
    },
    11: {
      titre: "toutes les catégories (LEFT JOIN)",
      etat: "Une catégorie sans aucun jeu doit quand même apparaître.",
      objectif: "Affiche toutes les catégories avec le nombre de jeux, y compris celles qui n'en ont aucun (LEFT JOIN + GROUP BY).",
      hints: [
        "LEFT JOIN garde TOUTES les lignes de la table de gauche, même sans correspondance.",
        "COUNT(JEU.idJeu) compte 0 pour une catégorie sans jeu."
      ],
      solution: `SELECT CATEGORIE.libelle, COUNT(JEU.idJeu) AS nb_jeux
FROM CATEGORIE
LEFT JOIN JEU
       ON JEU.idCategorie = CATEGORIE.idCategorie
GROUP BY CATEGORIE.libelle;`,
      note: "Le LEFT JOIN conserve les lignes de gauche sans correspondance à droite (valeurs NULL). Idéal pour repérer les catégories vides."
    },
    12: {
      titre: "les jeux plus chers que la moyenne (sous-requête)",
      etat: "On veut comparer chaque jeu à une valeur… calculée par une autre requête.",
      objectif: "Affiche les jeux dont le prix de location dépasse le prix moyen, à l'aide d'une sous-requête.",
      hints: [
        "Une sous-requête est une requête entre parenthèses, utilisée dans une autre.",
        "WHERE prixLocation > (SELECT AVG(prixLocation) FROM JEU)"
      ],
      solution: `SELECT titre, prixLocation
FROM JEU
WHERE prixLocation > (SELECT AVG(prixLocation) FROM JEU);`,
      note: "La sous-requête entre parenthèses est évaluée d'abord ; son résultat sert à la requête externe. Utile pour comparer à une valeur agrégée."
    },
    13: {
      titre: "clients actifs (UNION)",
      etat: "On veut la liste des clients ayant loué OU acheté, sans doublon.",
      objectif: "Combine, avec UNION, les identifiants de clients présents dans LOUER et ceux présents dans ACHETER.",
      hints: [
        "UNION empile deux résultats et supprime les doublons.",
        "Les deux SELECT doivent avoir le même nombre de colonnes, de types compatibles."
      ],
      solution: `SELECT idClient FROM LOUER
UNION
SELECT idClient FROM ACHETER;`,
      note: "UNION réunit deux ensembles de lignes et retire les doublons (UNION ALL les garde). Les colonnes doivent correspondre en nombre et en type."
    },
    14: {
      titre: "corriger les données (UPDATE, DELETE)",
      etat: "Le tarif d'un jeu change, un jeu quitte le catalogue.",
      objectif: "Augmente de 10 % le prix de location du jeu 1 (UPDATE), puis supprime le jeu 3 (DELETE). N'oublie pas le WHERE !",
      hints: [
        "UPDATE table SET col = ... WHERE ... ;",
        "DELETE FROM table WHERE ... ; — sans WHERE, tout est modifié/supprimé !"
      ],
      solution: `UPDATE JEU
SET prixLocation = prixLocation * 1.10
WHERE idJeu = 1;

DELETE FROM JEU
WHERE idJeu = 3;`,
      note: "UPDATE modifie, DELETE supprime. Le WHERE est vital : sans lui, la commande s'applique à TOUTES les lignes de la table."
    },
    15: {
      titre: "intégrité : ajouter FOURNISSEUR et sa clé étrangère",
      etat: "Chaque jeu provient d'un fournisseur. Créons la table et le lien.",
      objectif: "Crée la table FOURNISSEUR (idFournisseur, nom, telephone) avec sa clé primaire, prête à être référencée par JEU.",
      hints: [
        "PRIMARY KEY sur idFournisseur.",
        "JEU aura ensuite une clé étrangère idFournisseur -> FOURNISSEUR (étape 16)."
      ],
      solution: `CREATE TABLE FOURNISSEUR (
  idFournisseur INT PRIMARY KEY,
  nom           VARCHAR(80) NOT NULL,
  telephone     VARCHAR(20)
);`,
      note: "La clé primaire garantit l'unicité ; elle pourra être la cible d'une clé étrangère depuis JEU. C'est le socle de l'intégrité référentielle."
    },
    16: {
      titre: "faire évoluer le schéma (ALTER TABLE)",
      etat: "La table JEU existe déjà : on lui ajoute le lien vers le fournisseur.",
      objectif: "Ajoute à JEU la colonne idFournisseur (ALTER TABLE ADD), puis la contrainte de clé étrangère vers FOURNISSEUR.",
      hints: [
        "ALTER TABLE JEU ADD idFournisseur INT;",
        "ALTER TABLE JEU ADD FOREIGN KEY (idFournisseur) REFERENCES FOURNISSEUR(idFournisseur);"
      ],
      solution: `ALTER TABLE JEU ADD idFournisseur INT;

ALTER TABLE JEU
  ADD CONSTRAINT fk_jeu_fournisseur
  FOREIGN KEY (idFournisseur) REFERENCES FOURNISSEUR(idFournisseur);`,
      note: "ALTER TABLE modifie une table existante : ajouter/supprimer une colonne, ajouter une contrainte. Indispensable quand le besoin évolue après création."
    },
    17: {
      titre: "une vue du catalogue disponible (CREATE VIEW)",
      etat: "On refait souvent la même requête « jeux disponibles avec leur catégorie ». Enregistrons-la.",
      objectif: "Crée une vue catalogue_dispo qui affiche titre, prixLocation et libellé de catégorie, pour les jeux dont stockLocation est supérieur à 0.",
      hints: [
        "CREATE VIEW nom AS SELECT ... ;",
        "Ensuite on interroge la vue comme une table : SELECT * FROM catalogue_dispo;"
      ],
      solution: `CREATE VIEW catalogue_dispo AS
SELECT JEU.titre, JEU.prixLocation, CATEGORIE.libelle
FROM JEU
JOIN CATEGORIE ON JEU.idCategorie = CATEGORIE.idCategorie
WHERE JEU.stockLocation > 0;

-- utilisation
SELECT * FROM catalogue_dispo;`,
      note: "Une vue est une requête enregistrée sous un nom : on l'interroge comme une table. Elle simplifie et réutilise les requêtes complexes, sans dupliquer les données."
    },
    18: {
      titre: "accélérer les recherches (index)",
      etat: "On recherche souvent un jeu par titre : rendons-le rapide.",
      objectif: "Crée un index sur la colonne titre de JEU, et explique en une phrase ce qu'il accélère.",
      hints: [
        "CREATE INDEX idx_titre ON JEU(titre);",
        "Un index accélère les recherches et les tris sur la colonne indexée."
      ],
      solution: `CREATE INDEX idx_titre ON JEU(titre);

-- désormais rapide :
SELECT * FROM JEU WHERE titre = 'Catan';`,
      note: "Un index est une structure qui accélère la recherche sur une colonne (comme l'index d'un livre). Il ralentit un peu les écritures : on indexe utile, pas partout."
    },
    19: {
      titre: "louer un jeu en sécurité (transaction)",
      etat: "Louer = enregistrer la location ET décrémenter le stock. Les deux, ou aucun.",
      objectif: "Dans une transaction, insère une location dans LOUER et décrémente stockLocation du jeu ; valide avec COMMIT (ou annule avec ROLLBACK).",
      hints: [
        "BEGIN / START TRANSACTION ; ... ; COMMIT;",
        "Si une étape échoue, ROLLBACK annule tout : c'est l'atomicité (A de ACID)."
      ],
      solution: `START TRANSACTION;

INSERT INTO LOUER (idClient, idJeu, dateDebut, nbJours, montant)
VALUES (1, 1, '2026-07-06', 3, 15.00);

UPDATE JEU
SET stockLocation = stockLocation - 1
WHERE idJeu = 1;

COMMIT;   -- ou ROLLBACK; pour tout annuler`,
      note: "Une transaction regroupe plusieurs commandes en un tout indivisible : COMMIT valide, ROLLBACK annule. C'est la garantie ACID (atomicité, cohérence, isolation, durabilité)."
    },
    20: {
      titre: "🏁 des requêtes métier sur la Ludothèque",
      etat: "La base vit : posons de vraies questions de gestion.",
      objectif: "Écris deux requêtes utiles : le chiffre d'affaires total des locations (SUM sur LOUER) et le top 3 des jeux les plus loués (COUNT + GROUP BY + ORDER BY + LIMIT, avec jointure pour le titre).",
      hints: [
        "CA : SELECT SUM(montant) FROM LOUER;",
        "Top loués : GROUP BY idJeu, ORDER BY COUNT(*) DESC, LIMIT 3, JOIN JEU pour le titre."
      ],
      solution: `-- chiffre d'affaires des locations
SELECT SUM(montant) AS ca_locations FROM LOUER;

-- top 3 des jeux les plus loués
SELECT JEU.titre, COUNT(*) AS nb_locations
FROM LOUER
JOIN JEU ON JEU.idJeu = LOUER.idJeu
GROUP BY JEU.titre
ORDER BY nb_locations DESC
LIMIT 3;`,
      note: "Tu combines agrégats, GROUP BY, jointure, tri et limite : la panoplie complète pour répondre à des questions métier réelles à partir de la base."
    },
    21: {
      titre: "🎓 requête de synthèse",
      etat: "Épreuve finale : une requête qui mobilise tout.",
      objectif: "Écris une requête donnant, par catégorie, le nombre de jeux disponibles à la location (stockLocation supérieur à 0) et leur prix de location moyen, triée par prix moyen décroissant.",
      hints: [
        "Filtre WHERE stockLocation > 0, regroupe GROUP BY sur la catégorie, joins pour le libellé.",
        "AVG(prixLocation) et COUNT(*) par groupe, ORDER BY le prix moyen DESC."
      ],
      solution: `SELECT CATEGORIE.libelle,
       COUNT(*)          AS nb_dispo,
       AVG(JEU.prixLocation) AS prix_moyen
FROM JEU
JOIN CATEGORIE ON JEU.idCategorie = CATEGORIE.idCategorie
WHERE JEU.stockLocation > 0
GROUP BY CATEGORIE.libelle
ORDER BY prix_moyen DESC;`,
      note: "Filtrer (WHERE), joindre (JOIN), regrouper (GROUP BY), agréger (COUNT, AVG) et trier (ORDER BY) : cette requête réunit tout le cours. Tu sais interroger une vraie base."
    }
  }
};
