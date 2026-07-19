/* ===== Fil rouge « La Ludothèque » — cours MySQL (21 étapes) =====
   On repart du MLD conçu en Merise et on le CRÉE, le REMPLIT puis l'INTERROGE
   en MySQL (dialecte : AUTO_INCREMENT, LAST_INSERT_ID, IFNULL, LIMIT/OFFSET,
   ENGINE=InnoDB, DELIMITER…). Tables : CATEGORIE, FOURNISSEUR, UTILISATEUR
   (+ CLIENT/VENDEUR/ADMIN), JEU, LOUER, ACHETER, RESERVER. */
var FIL = {
  prefix: "mysql21",
  app: "La Ludothèque",
  placeholder: "Écris ta requête MySQL ici…",
  etapes: {
    1: {
      titre: "explorer la base et le serveur",
      etat: "MySQL est installé. Avant d'interroger le catalogue, découvrons le serveur et la base.",
      objectif: "Écris les commandes MySQL pour : lister les bases (SHOW DATABASES), sélectionner la base ludotheque (USE), lister ses tables (SHOW TABLES) et voir la structure de JEU (DESCRIBE).",
      hints: [
        "SHOW DATABASES; puis USE ludotheque;",
        "SHOW TABLES; liste les tables ; DESCRIBE JEU; (ou DESC JEU;) montre les colonnes."
      ],
      solution: `SHOW DATABASES;
USE ludotheque;
SHOW TABLES;
DESCRIBE JEU;`,
      note: "SHOW et DESCRIBE sont propres à MySQL : ils explorent le serveur, les bases et la structure des tables. USE choisit la base de travail courante. Ce sont les tout premiers réflexes en console MySQL."
    },
    2: {
      titre: "créer CATEGORIE et JEU (AUTO_INCREMENT, InnoDB)",
      etat: "On traduit le MLD Merise en tables MySQL, avec le moteur InnoDB.",
      objectif: "Écris le CREATE TABLE de CATEGORIE et de JEU (idJeu, titre, prixAchat, prixLocation, stockVente, stockLocation, idCategorie). Utilise AUTO_INCREMENT pour les clés et ENGINE=InnoDB.",
      hints: [
        "idCategorie INT AUTO_INCREMENT PRIMARY KEY.",
        "Termine par ) ENGINE=InnoDB; pour bénéficier des clés étrangères et des transactions."
      ],
      solution: `CREATE TABLE CATEGORIE (
  idCategorie INT AUTO_INCREMENT PRIMARY KEY,
  libelle     VARCHAR(60) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE JEU (
  idJeu         INT AUTO_INCREMENT PRIMARY KEY,
  titre         VARCHAR(120)  NOT NULL,
  prixAchat     DECIMAL(6,2)  NOT NULL,
  prixLocation  DECIMAL(6,2)  NOT NULL,
  stockVente    INT NOT NULL DEFAULT 0,
  stockLocation INT NOT NULL DEFAULT 0,
  idCategorie   INT NOT NULL,
  FOREIGN KEY (idCategorie) REFERENCES CATEGORIE(idCategorie)
) ENGINE=InnoDB;`,
      note: "En MySQL, AUTO_INCREMENT génère les identifiants. Le moteur InnoDB (par défaut depuis MySQL 5.5) est indispensable : lui seul gère les clés étrangères et les transactions, contrairement à MyISAM."
    },
    3: {
      titre: "remplir le catalogue (INSERT, LAST_INSERT_ID)",
      etat: "Les tables sont vides. Insérons des catégories et des jeux, sans fournir les id auto-générés.",
      objectif: "Insère 2 catégories (Stratégie, Famille) sans donner idCategorie, puis 3 jeux. Montre comment récupérer l'id auto-généré avec LAST_INSERT_ID().",
      hints: [
        "On omet la colonne AUTO_INCREMENT : INSERT INTO CATEGORIE (libelle) VALUES ('Stratégie');",
        "SELECT LAST_INSERT_ID(); renvoie le dernier id généré dans la session."
      ],
      solution: `INSERT INTO CATEGORIE (libelle) VALUES ('Stratégie'), ('Famille');

INSERT INTO JEU (titre, prixAchat, prixLocation, stockVente, stockLocation, idCategorie) VALUES
  ('Catan', 44.90, 5.00, 3, 2, 1),
  ('Azul',  39.90, 4.00, 5, 3, 1),
  ('Dixit', 29.90, 3.50, 4, 1, 2);

SELECT LAST_INSERT_ID();   -- l'id du dernier INSERT`,
      note: "On n'insère pas la colonne AUTO_INCREMENT : MySQL la remplit. LAST_INSERT_ID() renvoie le dernier identifiant généré dans la session courante — l'équivalent MySQL de SCOPE_IDENTITY() en SQL Server."
    },
    4: {
      titre: "lister le catalogue (SELECT, alias, CONCAT)",
      etat: "Le catalogue est rempli. Affichons-le proprement.",
      objectif: "Affiche le titre et le prix de location (alias « tarif »), puis une fiche « Titre — prix € » construite avec la fonction CONCAT de MySQL.",
      hints: [
        "Alias : prixLocation AS tarif.",
        "CONCAT(titre, ' — ', prixLocation, ' €') assemble une chaîne."
      ],
      solution: `SELECT titre, prixLocation AS tarif FROM JEU;

-- une fiche lisible
SELECT CONCAT(titre, ' — ', prixLocation, ' €') AS fiche
FROM JEU;`,
      note: "MySQL concatène uniquement avec la fonction CONCAT (l'opérateur + additionne, il ne concatène pas). AS crée un alias d'affichage."
    },
    5: {
      titre: "filtrer les jeux (WHERE)",
      etat: "On veut cibler certains jeux, pas tous.",
      objectif: "Affiche les jeux dont le prix de location est inférieur à 5, puis ceux de la catégorie 1 disponibles à la location (stockLocation > 0).",
      hints: [
        "WHERE prixLocation < 5.",
        "Combine deux conditions avec AND : idCategorie = 1 AND stockLocation > 0."
      ],
      solution: `SELECT titre, prixLocation
FROM JEU
WHERE prixLocation < 5;

SELECT titre
FROM JEU
WHERE idCategorie = 1 AND stockLocation > 0;`,
      note: "WHERE filtre les lignes. En MySQL, les comparaisons de chaînes sont par défaut insensibles à la casse (collation utf8mb4_general_ci). On combine les conditions avec AND / OR."
    },
    6: {
      titre: "trier et paginer (ORDER BY, LIMIT / OFFSET)",
      etat: "On veut un classement et une pagination par pages.",
      objectif: "Affiche les jeux triés du plus cher au moins cher, puis la 2e page de 2 jeux avec la syntaxe MySQL LIMIT ... OFFSET.",
      hints: [
        "ORDER BY prixLocation DESC.",
        "Page 2 de 2 : LIMIT 2 OFFSET 2 (ou la forme courte LIMIT 2, 2)."
      ],
      solution: `SELECT titre, prixLocation
FROM JEU
ORDER BY prixLocation DESC;

-- 2e page de 2 jeux
SELECT titre, prixLocation
FROM JEU
ORDER BY titre
LIMIT 2 OFFSET 2;`,
      note: "MySQL pagine avec LIMIT n OFFSET p (ou la forme abrégée LIMIT p, n). C'est plus simple que le OFFSET/FETCH de SQL Server, mais l'idée est la même : sauter p lignes, en prendre n."
    },
    7: {
      titre: "fonctions et valeurs manquantes (IFNULL)",
      etat: "On enrichit l'affichage et on gère les données absentes.",
      objectif: "Affiche pour chaque jeu son titre en majuscules, la longueur du titre, et remplace un éventuel idFournisseur NULL par le texte 'aucun' avec IFNULL.",
      hints: [
        "UPPER(titre) et CHAR_LENGTH(titre).",
        "IFNULL(idFournisseur, 'aucun') — fonction propre à MySQL (COALESCE marche aussi)."
      ],
      solution: `SELECT UPPER(titre)            AS titre_maj,
       CHAR_LENGTH(titre)      AS longueur,
       IFNULL(idFournisseur, 'aucun') AS fournisseur
FROM JEU;`,
      note: "MySQL fournit IFNULL(x, y) pour remplacer un NULL (équivalent d'ISNULL en T-SQL). CHAR_LENGTH compte les caractères. Ces fonctions transforment les valeurs à la volée, sans modifier la table."
    },
    8: {
      titre: "compter et calculer (agrégats)",
      etat: "On veut des chiffres globaux sur le catalogue.",
      objectif: "Compte le nombre de jeux (COUNT), calcule le prix de location moyen (AVG), le plus élevé (MAX) et le stock de location total (SUM).",
      hints: [
        "COUNT(*) compte les lignes ; AVG, MAX, SUM calculent.",
        "Sans GROUP BY, l'agrégat porte sur toute la table."
      ],
      solution: `SELECT COUNT(*)           AS nb_jeux,
       AVG(prixLocation)  AS prix_moyen,
       MAX(prixLocation)  AS prix_max,
       SUM(stockLocation) AS stock_total
FROM JEU;`,
      note: "Les fonctions d'agrégation résument un ensemble de lignes en une valeur. MySQL les calcule vite sur InnoDB. Sans GROUP BY, elles couvrent toute la table."
    },
    9: {
      titre: "regrouper par catégorie (GROUP BY, HAVING)",
      etat: "On veut ces chiffres catégorie par catégorie.",
      objectif: "Compte le nombre de jeux par catégorie (GROUP BY), puis ne garde que les catégories ayant au moins 2 jeux (HAVING).",
      hints: [
        "GROUP BY idCategorie forme un groupe par catégorie.",
        "HAVING COUNT(*) >= 2 filtre les groupes."
      ],
      solution: `SELECT idCategorie, COUNT(*) AS nb_jeux
FROM JEU
GROUP BY idCategorie
HAVING COUNT(*) >= 2;`,
      note: "GROUP BY forme les groupes, les agrégats se calculent par groupe, HAVING filtre les groupes (après), WHERE les lignes (avant). Depuis MySQL 5.7, le mode ONLY_FULL_GROUP_BY impose de bien lister les colonnes non agrégées."
    },
    10: {
      titre: "joindre jeu et catégorie (JOIN)",
      etat: "Les jeux référencent la catégorie par un id : affichons le libellé, même pour les catégories vides.",
      objectif: "Affiche chaque jeu avec le libellé de sa catégorie (INNER JOIN), puis toutes les catégories avec leur nombre de jeux, y compris celles sans jeu (LEFT JOIN).",
      hints: [
        "INNER JOIN CATEGORIE ON JEU.idCategorie = CATEGORIE.idCategorie.",
        "LEFT JOIN + COUNT(JEU.idJeu) compte 0 pour une catégorie sans jeu."
      ],
      solution: `SELECT JEU.titre, CATEGORIE.libelle
FROM JEU
INNER JOIN CATEGORIE ON JEU.idCategorie = CATEGORIE.idCategorie;

SELECT CATEGORIE.libelle, COUNT(JEU.idJeu) AS nb_jeux
FROM CATEGORIE
LEFT JOIN JEU ON JEU.idCategorie = CATEGORIE.idCategorie
GROUP BY CATEGORIE.libelle;`,
      note: "L'INNER JOIN ne garde que les correspondances ; le LEFT JOIN conserve toutes les lignes de gauche (catégories vides comprises). MySQL ne possède pas de FULL OUTER JOIN : on le simule au besoin par UNION."
    },
    11: {
      titre: "les jeux jamais loués (sous-requête, CTE)",
      etat: "On veut comparer chaque jeu à un ensemble calculé par une autre requête.",
      objectif: "Affiche les jeux plus chers que la moyenne (sous-requête), puis, avec une CTE (WITH, MySQL 8), la liste des jeux jamais loués.",
      hints: [
        "WHERE prixLocation > (SELECT AVG(prixLocation) FROM JEU).",
        "WITH loues AS (SELECT DISTINCT idJeu FROM LOUER) puis NOT IN / NOT EXISTS."
      ],
      solution: `SELECT titre FROM JEU
WHERE prixLocation > (SELECT AVG(prixLocation) FROM JEU);

WITH loues AS (SELECT DISTINCT idJeu FROM LOUER)
SELECT titre FROM JEU
WHERE idJeu NOT IN (SELECT idJeu FROM loues);`,
      note: "Les CTE (WITH ... AS) sont disponibles depuis MySQL 8.0. Elles nomment une sous-requête et rendent le code lisible. Avant MySQL 8, il fallait imbriquer les sous-requêtes."
    },
    12: {
      titre: "classer dans chaque catégorie (fenêtrage, MySQL 8)",
      etat: "On veut classer les jeux SANS écraser les lignes.",
      objectif: "Avec ROW_NUMBER() OVER (disponible depuis MySQL 8), numérote les jeux du plus cher au moins cher DANS chaque catégorie, et garde le n°1 de chaque catégorie.",
      hints: [
        "OVER (PARTITION BY idCategorie ORDER BY prixLocation DESC).",
        "Enveloppe dans une CTE, puis filtre WHERE rang = 1."
      ],
      solution: `WITH classe AS (
  SELECT titre, idCategorie,
         ROW_NUMBER() OVER (PARTITION BY idCategorie
                            ORDER BY prixLocation DESC) AS rang
  FROM JEU
)
SELECT titre, idCategorie FROM classe WHERE rang = 1;`,
      note: "Les fonctions de fenêtrage (ROW_NUMBER, RANK, OVER, PARTITION BY) sont arrivées avec MySQL 8.0. Elles calculent sur un groupe tout en gardant chaque ligne — impossible avec un simple GROUP BY."
    },
    13: {
      titre: "clients actifs (UNION)",
      etat: "On veut la liste des clients ayant loué OU acheté, sans doublon.",
      objectif: "Combine, avec UNION, les identifiants de clients présents dans LOUER et dans ACHETER.",
      hints: [
        "UNION empile deux résultats et supprime les doublons (UNION ALL les garde).",
        "Les deux SELECT doivent avoir le même nombre de colonnes."
      ],
      solution: `SELECT idClient FROM LOUER
UNION
SELECT idClient FROM ACHETER;`,
      note: "UNION réunit deux ensembles et retire les doublons. MySQL n'a pas INTERSECT ni EXCEPT avant la version 8.0.31 : on les simulait par des jointures ou des sous-requêtes IN / NOT IN."
    },
    14: {
      titre: "corriger les données (UPDATE, DELETE)",
      etat: "Le tarif d'un jeu change, un jeu quitte le catalogue.",
      objectif: "Augmente de 10 % le prix de location du jeu 1 (UPDATE), puis supprime le jeu 3 (DELETE). N'oublie jamais le WHERE !",
      hints: [
        "UPDATE JEU SET prixLocation = prixLocation * 1.10 WHERE idJeu = 1;",
        "DELETE FROM JEU WHERE idJeu = 3;"
      ],
      solution: `UPDATE JEU
SET prixLocation = prixLocation * 1.10
WHERE idJeu = 1;

DELETE FROM JEU
WHERE idJeu = 3;`,
      note: "UPDATE modifie, DELETE supprime. Le WHERE est vital. Astuce MySQL : le mode « safe updates » de MySQL Workbench refuse un UPDATE/DELETE sans clause sur une clé — une sécurité utile."
    },
    15: {
      titre: "intégrité : FOURNISSEUR, clés et InnoDB",
      etat: "Chaque jeu provient d'un fournisseur. Créons la table et préparons le lien.",
      objectif: "Crée la table FOURNISSEUR (idFournisseur AUTO_INCREMENT, nom, telephone) en InnoDB, avec les bonnes contraintes, prête à être référencée par JEU.",
      hints: [
        "idFournisseur INT AUTO_INCREMENT PRIMARY KEY.",
        "ENGINE=InnoDB pour pouvoir recevoir une clé étrangère depuis JEU."
      ],
      solution: `CREATE TABLE FOURNISSEUR (
  idFournisseur INT AUTO_INCREMENT PRIMARY KEY,
  nom           VARCHAR(80) NOT NULL,
  telephone     VARCHAR(20)
) ENGINE=InnoDB;`,
      note: "Seul le moteur InnoDB applique réellement les clés étrangères en MySQL. Une table MyISAM accepte la syntaxe FOREIGN KEY mais l'ignore : d'où l'importance de préciser ENGINE=InnoDB."
    },
    16: {
      titre: "faire évoluer le schéma et créer une vue",
      etat: "JEU existe déjà : on ajoute le lien fournisseur, puis une vue pratique.",
      objectif: "Ajoute à JEU la colonne idFournisseur et sa clé étrangère (ALTER TABLE), puis crée une vue catalogue_dispo des jeux disponibles à la location avec leur catégorie.",
      hints: [
        "ALTER TABLE JEU ADD COLUMN idFournisseur INT;",
        "ALTER TABLE JEU ADD FOREIGN KEY (idFournisseur) REFERENCES FOURNISSEUR(idFournisseur);",
        "CREATE VIEW catalogue_dispo AS SELECT ... WHERE stockLocation > 0;"
      ],
      solution: `ALTER TABLE JEU ADD COLUMN idFournisseur INT;

ALTER TABLE JEU
  ADD CONSTRAINT fk_jeu_fournisseur
  FOREIGN KEY (idFournisseur) REFERENCES FOURNISSEUR(idFournisseur);

CREATE VIEW catalogue_dispo AS
SELECT JEU.titre, JEU.prixLocation, CATEGORIE.libelle
FROM JEU
JOIN CATEGORIE ON JEU.idCategorie = CATEGORIE.idCategorie
WHERE JEU.stockLocation > 0;`,
      note: "ALTER TABLE fait évoluer une table existante (MySQL écrit ADD COLUMN). Une vue enregistre une requête sous un nom : on l'interroge comme une table, sans dupliquer les données."
    },
    17: {
      titre: "accélérer les recherches (index)",
      etat: "On recherche souvent un jeu par titre : rendons-le rapide.",
      objectif: "Crée un index sur la colonne titre de JEU, puis vérifie avec EXPLAIN qu'une recherche par titre l'utilise.",
      hints: [
        "CREATE INDEX idx_titre ON JEU(titre);",
        "EXPLAIN SELECT * FROM JEU WHERE titre = 'Catan'; montre le plan d'exécution."
      ],
      solution: `CREATE INDEX idx_titre ON JEU(titre);

-- vérifier que l'index est utilisé
EXPLAIN SELECT * FROM JEU WHERE titre = 'Catan';`,
      note: "Un index accélère la recherche sur une colonne (comme l'index d'un livre). En MySQL, EXPLAIN affiche le plan d'exécution : la colonne « key » indique quel index est réellement utilisé."
    },
    18: {
      titre: "louer un jeu en sécurité (transaction InnoDB)",
      etat: "Louer = enregistrer la location ET décrémenter le stock. Les deux, ou aucun.",
      objectif: "Dans une transaction (START TRANSACTION), insère une location dans LOUER et décrémente stockLocation du jeu ; valide par COMMIT (ou ROLLBACK pour annuler).",
      hints: [
        "START TRANSACTION; ... COMMIT;",
        "InnoDB est requis : MyISAM ne gère pas les transactions."
      ],
      solution: `START TRANSACTION;

INSERT INTO LOUER (idClient, idJeu, dateDebut, nbJours, montant)
VALUES (1, 1, '2026-07-06', 3, 15.00);

UPDATE JEU
SET stockLocation = stockLocation - 1
WHERE idJeu = 1;

COMMIT;   -- ou ROLLBACK; pour tout annuler`,
      note: "Une transaction regroupe des commandes en un tout indivisible (ACID). En MySQL, seul InnoDB les gère ; MyISAM valide chaque instruction immédiatement, sans possibilité de ROLLBACK."
    },
    19: {
      titre: "automatiser : procédure et trigger",
      etat: "On veut encapsuler la location et tracer automatiquement chaque insertion.",
      objectif: "Écris une procédure stockée louer_jeu(cli, jeu) qui insère la location et décrémente le stock ; puis un trigger AFTER INSERT sur LOUER qui journalise l'action. Pense au DELIMITER.",
      hints: [
        "DELIMITER $$ ... CREATE PROCEDURE ... BEGIN ... END$$ DELIMITER ;",
        "NEW.idJeu désigne la ligne insérée dans un trigger MySQL."
      ],
      solution: `DELIMITER $$
CREATE PROCEDURE louer_jeu(IN cli INT, IN jeu INT)
BEGIN
  INSERT INTO LOUER (idClient, idJeu, dateDebut, nbJours)
  VALUES (cli, jeu, CURDATE(), 7);
  UPDATE JEU SET stockLocation = stockLocation - 1 WHERE idJeu = jeu;
END$$

CREATE TRIGGER trg_louer_log
AFTER INSERT ON LOUER
FOR EACH ROW
BEGIN
  INSERT INTO JOURNAL (action, idJeu, quand)
  VALUES ('location', NEW.idJeu, NOW());
END$$
DELIMITER ;`,
      note: "En MySQL, on change le DELIMITER (ex. $$) pour définir procédures et triggers, car leur corps contient des points-virgules. Dans un trigger, NEW référence la nouvelle ligne (et OLD l'ancienne pour UPDATE/DELETE)."
    },
    20: {
      titre: "🏁 des requêtes métier sur la Ludothèque",
      etat: "La base vit : posons de vraies questions de gestion.",
      objectif: "Écris le chiffre d'affaires total des locations (SUM sur LOUER) et le top 3 des jeux les plus loués (COUNT + GROUP BY + ORDER BY + LIMIT, avec jointure pour le titre).",
      hints: [
        "CA : SELECT SUM(montant) FROM LOUER;",
        "Top loués : GROUP BY, ORDER BY COUNT(*) DESC, LIMIT 3, JOIN JEU pour le titre."
      ],
      solution: `SELECT SUM(montant) AS ca_locations FROM LOUER;

SELECT JEU.titre, COUNT(*) AS nb_locations
FROM LOUER
JOIN JEU ON JEU.idJeu = LOUER.idJeu
GROUP BY JEU.titre
ORDER BY nb_locations DESC
LIMIT 3;`,
      note: "Agrégats, GROUP BY, jointure, tri et LIMIT : la panoplie complète pour répondre à des questions métier. LIMIT est la façon MySQL de ne garder que le haut du classement."
    },
    21: {
      titre: "🎓 requête de synthèse",
      etat: "Épreuve finale : une requête qui mobilise tout.",
      objectif: "Écris une requête donnant, par catégorie, le nombre de jeux disponibles à la location (stockLocation > 0) et leur prix de location moyen, triée par prix moyen décroissant.",
      hints: [
        "WHERE stockLocation > 0, GROUP BY sur la catégorie, JOIN pour le libellé.",
        "AVG(prixLocation) et COUNT(*) par groupe, ORDER BY prix_moyen DESC."
      ],
      solution: `SELECT CATEGORIE.libelle,
       COUNT(*)              AS nb_dispo,
       AVG(JEU.prixLocation) AS prix_moyen
FROM JEU
JOIN CATEGORIE ON JEU.idCategorie = CATEGORIE.idCategorie
WHERE JEU.stockLocation > 0
GROUP BY CATEGORIE.libelle
ORDER BY prix_moyen DESC;`,
      note: "Filtrer, joindre, regrouper, agréger et trier : cette requête réunit tout le cours. La même Ludothèque, interrogée en MySQL — tu sais désormais piloter une vraie base open source."
    }
  }
};
