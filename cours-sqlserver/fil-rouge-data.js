/* ===== Fil rouge « La Ludothèque » — cours SQL Server / T-SQL (21 étapes) =====
   Mêmes tables que le cours SQL, mais en T-SQL (SGBD Microsoft) : IDENTITY,
   TOP, OFFSET/FETCH, CTE, fonctions de fenêtrage, procédures, TRY...CATCH,
   transactions, TRIGGER, MERGE. */
var FIL = {
  prefix: "sqlsrv21",
  app: "La Ludothèque",
  placeholder: "Écris ton script T-SQL ici…",
  etapes: {
    1: {
      titre: "premier SELECT dans SSMS",
      etat: "La base ludotheque existe dans SQL Server. On l'interroge depuis SSMS.",
      objectif: "Écris une requête qui affiche les 5 premiers jeux (par titre) avec le mot-clé TOP, propre à SQL Server.",
      hints: [
        "SQL Server utilise TOP (pas LIMIT) : SELECT TOP 5 ... .",
        "TOP se place juste après SELECT, avant les colonnes."
      ],
      solution: `SELECT TOP 5 titre, prixLocation
FROM JEU
ORDER BY titre;`,
      note: "En T-SQL, on limite avec TOP n (et non LIMIT). TOP se place juste après SELECT. On l'associe à ORDER BY pour un « top » qui a du sens."
    },
    2: {
      titre: "créer JEU avec IDENTITY",
      etat: "Traduisons le MLD en T-SQL, avec une clé auto-incrémentée.",
      objectif: "Écris le CREATE TABLE de JEU avec idJeu en INT IDENTITY(1,1) PRIMARY KEY, les prix en DECIMAL, deux stocks, et une clé étrangère idCategorie.",
      hints: [
        "IDENTITY(1,1) : démarre à 1, s'incrémente de 1 (équivalent d'AUTO_INCREMENT).",
        "DECIMAL(6,2) pour l'argent ; NVARCHAR(120) pour le titre (texte Unicode)."
      ],
      solution: `CREATE TABLE JEU (
  idJeu         INT IDENTITY(1,1) PRIMARY KEY,
  titre         NVARCHAR(120) NOT NULL,
  prixAchat     DECIMAL(6,2)  NOT NULL,
  prixLocation  DECIMAL(6,2)  NOT NULL,
  stockVente    INT NOT NULL DEFAULT 0,
  stockLocation INT NOT NULL DEFAULT 0,
  idCategorie   INT NOT NULL,
  CONSTRAINT fk_jeu_cat FOREIGN KEY (idCategorie) REFERENCES CATEGORIE(idCategorie)
);`,
      note: "IDENTITY(1,1) est la clé auto-incrémentée de SQL Server. NVARCHAR stocke du texte Unicode (accents, autres alphabets). Nommer la contrainte (fk_jeu_cat) est une bonne pratique."
    },
    3: {
      titre: "insérer et récupérer l'IDENTITY",
      etat: "On insère un jeu et on récupère l'identifiant généré automatiquement.",
      objectif: "Insère un jeu SANS fournir idJeu (IDENTITY le génère), puis récupère la valeur créée avec SCOPE_IDENTITY().",
      hints: [
        "On n'insère pas la colonne IDENTITY : elle est auto-générée.",
        "SELECT SCOPE_IDENTITY(); renvoie le dernier identifiant inséré dans le scope courant."
      ],
      solution: `INSERT INTO JEU (titre, prixAchat, prixLocation, idCategorie)
VALUES (N'Catan', 44.90, 5.00, 1);

SELECT SCOPE_IDENTITY() AS idJeuCree;`,
      note: "On n'insère jamais une colonne IDENTITY. SCOPE_IDENTITY() récupère l'id généré (préféré à @@IDENTITY, qui peut être faussé par un trigger). Le préfixe N'...' indique une chaîne Unicode."
    },
    4: {
      titre: "projeter avec TOP et alias",
      etat: "Affichons un extrait lisible du catalogue.",
      objectif: "Affiche les 3 jeux les plus chers à la location (titre renommé « Jeu », prix renommé « Tarif ») avec TOP et des alias.",
      hints: [
        "SELECT TOP 3 titre AS Jeu, prixLocation AS Tarif ...",
        "ORDER BY prixLocation DESC pour « les plus chers »."
      ],
      solution: `SELECT TOP 3 titre AS Jeu, prixLocation AS Tarif
FROM JEU
ORDER BY prixLocation DESC;`,
      note: "TOP 3 + ORDER BY DESC donne le podium des plus chers. Les alias (AS) rendent l'affichage plus clair, comme en SQL standard."
    },
    5: {
      titre: "filtrer (WHERE)",
      etat: "On cible des jeux précis.",
      objectif: "Affiche les jeux de la catégorie 1 dont le prix de location est inférieur à 5 et le stock de location positif.",
      hints: [
        "WHERE idCategorie = 1 AND prixLocation < 5 AND stockLocation > 0.",
        "Le T-SQL utilise les mêmes opérateurs que le SQL standard."
      ],
      solution: `SELECT titre, prixLocation
FROM JEU
WHERE idCategorie = 1
  AND prixLocation < 5
  AND stockLocation > 0;`,
      note: "Le WHERE de T-SQL est identique au SQL standard. On combine les conditions avec AND / OR, et on teste l'absence avec IS NULL."
    },
    6: {
      titre: "pagination avec OFFSET/FETCH",
      etat: "On veut une pagination du catalogue (page 2, 5 par page).",
      objectif: "Écris la requête qui affiche la 2e page de 5 jeux, triés par titre, avec OFFSET ... ROWS FETCH NEXT ... ROWS ONLY.",
      hints: [
        "OFFSET exige un ORDER BY.",
        "OFFSET 5 ROWS FETCH NEXT 5 ROWS ONLY : saute 5, prend 5."
      ],
      solution: `SELECT titre, prixLocation
FROM JEU
ORDER BY titre
OFFSET 5 ROWS FETCH NEXT 5 ROWS ONLY;`,
      note: "OFFSET/FETCH est la pagination standardisée (SQL Server 2012+). Elle nécessite un ORDER BY. C'est l'équivalent du LIMIT ... OFFSET de MySQL/PostgreSQL."
    },
    7: {
      titre: "fonctions T-SQL",
      etat: "On enrichit l'affichage avec des fonctions intégrées.",
      objectif: "Affiche, pour chaque jeu : le titre en majuscules (UPPER), sa longueur (LEN), le prix TTC (prixLocation * 1.2 converti en DECIMAL), et remplace un fournisseur NULL par 'inconnu' (ISNULL).",
      hints: [
        "UPPER(titre), LEN(titre).",
        "CAST(prixLocation * 1.2 AS DECIMAL(6,2)) ; ISNULL(colonne, 'inconnu')."
      ],
      solution: `SELECT UPPER(titre)                         AS titre_maj,
       LEN(titre)                           AS longueur,
       CAST(prixLocation * 1.2 AS DECIMAL(6,2)) AS ttc,
       ISNULL(CAST(idFournisseur AS NVARCHAR), 'inconnu') AS fournisseur
FROM JEU;`,
      note: "T-SQL fournit UPPER/LEN (chaînes), GETDATE() (date), ISNULL (remplace NULL), CAST/CONVERT (conversion de type). ISNULL est le pendant de COALESCE (mais à 2 arguments)."
    },
    8: {
      titre: "agréger et regrouper",
      etat: "On calcule des indicateurs par catégorie.",
      objectif: "Compte le nombre de jeux et le prix moyen par catégorie, en ne gardant que les catégories ayant au moins 2 jeux.",
      hints: [
        "GROUP BY idCategorie, avec COUNT(*) et AVG(prixLocation).",
        "HAVING COUNT(*) >= 2 filtre les groupes."
      ],
      solution: `SELECT idCategorie,
       COUNT(*)          AS nb_jeux,
       AVG(prixLocation) AS prix_moyen
FROM JEU
GROUP BY idCategorie
HAVING COUNT(*) >= 2
ORDER BY prix_moyen DESC;`,
      note: "Les agrégats, GROUP BY et HAVING de T-SQL sont identiques au SQL standard. Attention : AVG sur des entiers renvoie un entier ; sur DECIMAL, un décimal."
    },
    9: {
      titre: "joindre les tables",
      etat: "On remonte les libellés au lieu des identifiants.",
      objectif: "Affiche chaque jeu avec le libellé de sa catégorie (INNER JOIN) et le nom de son fournisseur, même si le fournisseur est NULL (LEFT JOIN).",
      hints: [
        "JOIN CATEGORIE ON j.idCategorie = c.idCategorie.",
        "LEFT JOIN FOURNISSEUR pour garder les jeux sans fournisseur."
      ],
      solution: `SELECT j.titre, c.libelle, f.nom
FROM JEU j
INNER JOIN CATEGORIE c   ON c.idCategorie = j.idCategorie
LEFT  JOIN FOURNISSEUR f ON f.idFournisseur = j.idFournisseur
ORDER BY c.libelle, j.titre;`,
      note: "Les jointures T-SQL sont standard. Le LEFT JOIN conserve les jeux dont idFournisseur est NULL (nom affiché à NULL)."
    },
    10: {
      titre: "une CTE (WITH)",
      etat: "On structure une requête complexe avec une expression de table commune.",
      objectif: "Avec une CTE nommée stats, calcule le nombre de jeux par catégorie, puis sélectionne dans la CTE les catégories ayant plus de 2 jeux.",
      hints: [
        "WITH stats AS (SELECT idCategorie, COUNT(*) AS n FROM JEU GROUP BY idCategorie)",
        "Ensuite : SELECT * FROM stats WHERE n > 2;"
      ],
      solution: `WITH stats AS (
  SELECT idCategorie, COUNT(*) AS n
  FROM JEU
  GROUP BY idCategorie
)
SELECT idCategorie, n
FROM stats
WHERE n > 2
ORDER BY n DESC;`,
      note: "Une CTE (Common Table Expression, mot-clé WITH) nomme un résultat intermédiaire, réutilisable dans la requête qui suit. Elle rend les requêtes complexes plus lisibles que des sous-requêtes imbriquées."
    },
    11: {
      titre: "classer avec une fonction de fenêtrage",
      etat: "On veut classer les jeux par prix, sans perdre les autres colonnes.",
      objectif: "Ajoute à chaque jeu son rang de prix de location (le plus cher = 1) avec ROW_NUMBER() OVER (ORDER BY prixLocation DESC).",
      hints: [
        "ROW_NUMBER() OVER (ORDER BY prixLocation DESC) AS rang.",
        "Contrairement à GROUP BY, la fonction de fenêtrage garde toutes les lignes."
      ],
      solution: `SELECT titre, prixLocation,
       ROW_NUMBER() OVER (ORDER BY prixLocation DESC) AS rang
FROM JEU;`,
      note: "Les fonctions de fenêtrage (OVER) calculent un résultat par ligne SANS regrouper : ROW_NUMBER (numéro unique), RANK (rang avec égalités), SUM(...) OVER (cumul). Très puissant pour les classements."
    },
    12: {
      titre: "un batch avec variables et IF",
      etat: "On écrit un petit script procédural T-SQL.",
      objectif: "Déclare une variable @nb comptant les jeux disponibles à la location, puis affiche un message différent selon que @nb dépasse 3 ou non (IF ... ELSE).",
      hints: [
        "DECLARE @nb INT; SELECT @nb = COUNT(*) FROM JEU WHERE stockLocation > 0;",
        "IF @nb > 3 PRINT '...'; ELSE PRINT '...';"
      ],
      solution: `DECLARE @nb INT;

SELECT @nb = COUNT(*)
FROM JEU
WHERE stockLocation > 0;

IF @nb > 3
    PRINT 'Catalogue bien fourni';
ELSE
    PRINT 'Stock de location limité';`,
      note: "T-SQL est aussi un langage procédural : DECLARE (variables préfixées @), SET/SELECT pour affecter, IF...ELSE, WHILE. PRINT affiche un message dans SSMS."
    },
    13: {
      titre: "une procédure stockée pour louer",
      etat: "On encapsule la logique « louer un jeu » dans une procédure réutilisable.",
      objectif: "Crée une procédure stockée sp_louer(@idClient, @idJeu, @nbJours) qui insère une location et décrémente le stock de location.",
      hints: [
        "CREATE PROCEDURE sp_louer @idClient INT, @idJeu INT, @nbJours INT AS BEGIN ... END",
        "À l'intérieur : INSERT INTO LOUER ... puis UPDATE JEU SET stockLocation = stockLocation - 1."
      ],
      solution: `CREATE PROCEDURE sp_louer
  @idClient INT,
  @idJeu    INT,
  @nbJours  INT
AS
BEGIN
  INSERT INTO LOUER (idClient, idJeu, dateDebut, nbJours, montant)
  SELECT @idClient, @idJeu, GETDATE(), @nbJours, prixLocation * @nbJours
  FROM JEU WHERE idJeu = @idJeu;

  UPDATE JEU SET stockLocation = stockLocation - 1 WHERE idJeu = @idJeu;
END;

-- appel : EXEC sp_louer @idClient = 1, @idJeu = 1, @nbJours = 3;`,
      note: "Une procédure stockée regroupe des instructions sous un nom, avec des paramètres. On l'exécute avec EXEC. Elle centralise la logique métier côté base et évite de répéter le code."
    },
    14: {
      titre: "gérer les erreurs (TRY...CATCH)",
      etat: "Une location peut échouer (stock nul) : gérons l'erreur proprement.",
      objectif: "Enveloppe l'insertion + le décrément dans un BEGIN TRY ... END TRY / BEGIN CATCH ... END CATCH, avec une transaction : COMMIT si tout va bien, ROLLBACK en cas d'erreur.",
      hints: [
        "BEGIN TRY BEGIN TRAN ... COMMIT END TRY BEGIN CATCH ROLLBACK; THROW; END CATCH",
        "ERROR_MESSAGE() donne le message de l'erreur capturée."
      ],
      solution: `BEGIN TRY
  BEGIN TRANSACTION;

  INSERT INTO LOUER (idClient, idJeu, dateDebut, nbJours, montant)
  VALUES (1, 1, GETDATE(), 3, 15.00);

  UPDATE JEU SET stockLocation = stockLocation - 1
  WHERE idJeu = 1 AND stockLocation > 0;

  COMMIT;
END TRY
BEGIN CATCH
  ROLLBACK;
  PRINT 'Erreur : ' + ERROR_MESSAGE();
END CATCH;`,
      note: "TRY...CATCH capture les erreurs d'exécution. Couplé à une transaction, il garantit qu'on annule (ROLLBACK) proprement en cas de problème. ERROR_MESSAGE() décrit l'erreur."
    },
    15: {
      titre: "contraintes et clés",
      etat: "On sécurise la table d'association LOUER.",
      objectif: "Crée LOUER avec une clé primaire composite (idClient, idJeu, dateDebut), deux clés étrangères et un CHECK sur nbJours (positif).",
      hints: [
        "CONSTRAINT pk_louer PRIMARY KEY (idClient, idJeu, dateDebut).",
        "CONSTRAINT chk_jours CHECK (nbJours > 0)."
      ],
      solution: `CREATE TABLE LOUER (
  idClient  INT,
  idJeu     INT,
  dateDebut DATE,
  nbJours   INT NOT NULL,
  montant   DECIMAL(7,2) NOT NULL,
  CONSTRAINT pk_louer PRIMARY KEY (idClient, idJeu, dateDebut),
  CONSTRAINT fk_louer_client FOREIGN KEY (idClient) REFERENCES CLIENT(idClient),
  CONSTRAINT fk_louer_jeu    FOREIGN KEY (idJeu)    REFERENCES JEU(idJeu),
  CONSTRAINT chk_jours CHECK (nbJours > 0)
);`,
      note: "Les contraintes T-SQL se nomment avec CONSTRAINT. La clé primaire composite, les clés étrangères et le CHECK viennent directement du MLD Merise."
    },
    16: {
      titre: "évoluer : ALTER, vue, index",
      etat: "On ajoute un lien, une vue et un index.",
      objectif: "Ajoute la colonne idFournisseur à JEU (ALTER), crée une vue v_dispo des jeux à louer disponibles, et un index sur titre.",
      hints: [
        "ALTER TABLE JEU ADD idFournisseur INT;",
        "CREATE VIEW v_dispo AS SELECT ... WHERE stockLocation > 0;",
        "CREATE INDEX idx_titre ON JEU(titre);"
      ],
      solution: `ALTER TABLE JEU ADD idFournisseur INT;

CREATE VIEW v_dispo AS
SELECT titre, prixLocation
FROM JEU
WHERE stockLocation > 0;

CREATE INDEX idx_titre ON JEU(titre);`,
      note: "ALTER TABLE fait évoluer le schéma ; CREATE VIEW enregistre une requête ; CREATE INDEX accélère les recherches. La syntaxe T-SQL est quasi identique au SQL standard."
    },
    17: {
      titre: "transaction explicite",
      etat: "On regroupe achat + baisse de stock atomiquement.",
      objectif: "Écris une transaction (BEGIN TRAN / COMMIT) qui insère un achat et décrémente stockVente. Active SET XACT_ABORT ON pour annuler automatiquement en cas d'erreur.",
      hints: [
        "SET XACT_ABORT ON; force le ROLLBACK automatique sur erreur.",
        "BEGIN TRAN ... COMMIT;"
      ],
      solution: `SET XACT_ABORT ON;
BEGIN TRANSACTION;

INSERT INTO ACHETER (idClient, idJeu, dateAchat, prix)
VALUES (2, 1, GETDATE(), 44.90);

UPDATE JEU SET stockVente = stockVente - 1
WHERE idJeu = 1 AND stockVente > 0;

COMMIT;`,
      note: "BEGIN TRAN / COMMIT délimitent une transaction. SET XACT_ABORT ON garantit qu'une erreur annule toute la transaction. C'est la garantie ACID appliquée à une opération métier."
    },
    18: {
      titre: "un déclencheur (TRIGGER)",
      etat: "On veut journaliser automatiquement chaque location.",
      objectif: "Crée un TRIGGER AFTER INSERT sur LOUER qui insère une ligne dans une table JOURNAL (idJeu, dateAction). Utilise la table spéciale inserted.",
      hints: [
        "CREATE TRIGGER trg_log ON LOUER AFTER INSERT AS ...",
        "La table 'inserted' contient les lignes venant d'être insérées."
      ],
      solution: `CREATE TRIGGER trg_log_location
ON LOUER
AFTER INSERT
AS
BEGIN
  INSERT INTO JOURNAL (idJeu, dateAction, action)
  SELECT idJeu, GETDATE(), 'location'
  FROM inserted;
END;`,
      note: "Un trigger s'exécute automatiquement lors d'un INSERT/UPDATE/DELETE. Les pseudo-tables inserted et deleted contiennent les lignes concernées. Idéal pour l'audit et la journalisation."
    },
    19: {
      titre: "synchroniser avec MERGE",
      etat: "On veut insérer un jeu s'il n'existe pas, sinon mettre à jour son stock.",
      objectif: "Écris un MERGE sur JEU (cible) à partir d'une source (idJeu, stock) : quand l'id correspond, UPDATE le stock ; sinon, on ne fait rien (ou INSERT selon le besoin).",
      hints: [
        "MERGE JEU AS cible USING (VALUES (1, 10)) AS src(idJeu, stock) ON cible.idJeu = src.idJeu",
        "WHEN MATCHED THEN UPDATE SET stockLocation = src.stock."
      ],
      solution: `MERGE JEU AS cible
USING (VALUES (1, 10)) AS src(idJeu, stock)
   ON cible.idJeu = src.idJeu
WHEN MATCHED THEN
   UPDATE SET stockLocation = src.stock
WHEN NOT MATCHED THEN
   INSERT (titre, prixAchat, prixLocation, stockLocation, idCategorie)
   VALUES (N'Nouveau jeu', 0, 0, src.stock, 1);`,
      note: "MERGE combine INSERT, UPDATE (et DELETE) en une seule commande : « insérer si absent, mettre à jour si présent » (upsert). Utile pour synchroniser des données."
    },
    20: {
      titre: "🏁 requêtes métier en T-SQL",
      etat: "On répond à des questions de gestion.",
      objectif: "Écris deux requêtes : le chiffre d'affaires des locations (SUM), et le top 3 des jeux les plus loués (avec TOP, JOIN et GROUP BY).",
      hints: [
        "CA : SELECT SUM(montant) FROM LOUER;",
        "Top : SELECT TOP 3 j.titre, COUNT(*) ... GROUP BY j.titre ORDER BY COUNT(*) DESC."
      ],
      solution: `-- chiffre d'affaires des locations
SELECT SUM(montant) AS ca_locations FROM LOUER;

-- top 3 des jeux les plus loués
SELECT TOP 3 j.titre, COUNT(*) AS nb_locations
FROM LOUER l
JOIN JEU j ON j.idJeu = l.idJeu
GROUP BY j.titre
ORDER BY nb_locations DESC;`,
      note: "On combine agrégats, TOP, jointure et GROUP BY : la panoplie T-SQL pour l'analyse. TOP remplace le LIMIT du SQL standard."
    },
    21: {
      titre: "🎓 synthèse T-SQL",
      etat: "Épreuve finale : une requête complète, façon SQL Server.",
      objectif: "Avec une CTE et une fonction de fenêtrage, classe les jeux par catégorie : pour chaque jeu, son rang de prix de location AU SEIN de sa catégorie (le plus cher = 1).",
      hints: [
        "ROW_NUMBER() OVER (PARTITION BY idCategorie ORDER BY prixLocation DESC).",
        "PARTITION BY redémarre la numérotation à chaque catégorie."
      ],
      solution: `WITH classement AS (
  SELECT titre, idCategorie, prixLocation,
         ROW_NUMBER() OVER (
           PARTITION BY idCategorie
           ORDER BY prixLocation DESC
         ) AS rang
  FROM JEU
)
SELECT idCategorie, titre, prixLocation, rang
FROM classement
ORDER BY idCategorie, rang;`,
      note: "PARTITION BY divise les lignes en groupes (par catégorie) et la fonction de fenêtrage numérote au sein de chaque groupe. Combinée à une CTE, c'est une requête d'analyse élégante, typique de T-SQL."
    }
  }
};
