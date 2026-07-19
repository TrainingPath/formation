/* ===== Fil rouge « La Ludothèque » — cours Merise (21 étapes) =====
   Même application que dans tous les cours, ici sous l'angle CONCEPTION.
   On modélise pas à pas la base de données de la ludothèque : d'abord le MCD
   (entités, associations, cardinalités), puis le MLD (tables, clés).
   Notation : l'identifiant d'une entité est préfixé par # ; en MLD, une clé
   étrangère est aussi notée #.
   Modèle retenu : le stock est géré par DEUX compteurs (stockVente,
   stockLocation) et chaque jeu provient d'un FOURNISSEUR. */
var FIL = {
  prefix: "merise21",
  app: "La Ludothèque",
  placeholder: "Écris ton modèle (MCD / MLD) ici…",
  etapes: {
    1: {
      titre: "cadrer le besoin à modéliser",
      etat: "Page blanche : avant de dessiner quoi que ce soit, il faut comprendre ce qu'on modélise.",
      objectif: "Rédige en quelques phrases le besoin de la ludothèque, puis liste (en français, sans notation) les grandes « choses » à mémoriser : les jeux, les clients, les fournisseurs, les locations, les achats, les catégories, les employés.",
      hints: [
        "Une base de données mémorise des informations sur des « objets de gestion ».",
        "Cherche les noms importants du domaine : ce seront de futures entités."
      ],
      solution: `Besoin : la ludothèque gère un CATALOGUE de jeux de société que les
CLIENTS peuvent ACHETER ou LOUER. Les jeux proviennent de FOURNISSEURS.
Des employés (VENDEURS, ADMINISTRATEURS) gèrent le stock et les opérations.

Candidats « entités » (les choses à mémoriser) :
  - Jeu (titre, prix d'achat, prix de location, stock vente, stock location)
  - Client (nom, email)
  - Catégorie (nom : famille, stratégie…)
  - Fournisseur (qui fournit les jeux)
  - Location / Achat (quand, combien)
  - Employé (vendeur, administrateur)`,
      note: "Cette étape d'analyse précède TOUTE notation. On repère le vocabulaire métier : les noms deviendront des entités, les verbes (louer, acheter, fournir) des associations. Le stock se distingue en deux : vente et location."
    },
    2: {
      titre: "les premières entités",
      etat: "Le besoin est cadré. On pose les deux entités centrales : le jeu et le client.",
      objectif: "Écris les entités JEU et CLIENT avec leurs propriétés (sans encore l'identifiant, vu à l'étape suivante). Le prix d'achat, le prix de location et DEUX stocks (stockVente, stockLocation) décrivent le jeu.",
      hints: [
        "Une entité = un rectangle avec un nom au singulier et une liste de propriétés.",
        "Deux stocks distincts : un pour les jeux à vendre, un pour les jeux à louer."
      ],
      solution: `JEU
  titre
  prixAchat
  prixLocation
  stockVente
  stockLocation

CLIENT
  nom
  prenom
  email`,
      note: "Chaque propriété est atomique et ne figure qu'à un seul endroit. Le stock est modélisé par deux compteurs : stockVente (jeux à vendre) et stockLocation (jeux à louer)."
    },
    3: {
      titre: "les identifiants",
      etat: "Les entités ont des propriétés, mais rien ne permet encore de distinguer deux jeux de même titre.",
      objectif: "Ajoute un identifiant à JEU et à CLIENT. Note l'identifiant en tête, souligné (ici préfixé par #). Ajoute aussi CATEGORIE et FOURNISSEUR avec leur identifiant.",
      hints: [
        "L'identifiant est une propriété (ou un groupe) UNIQUE pour chaque occurrence.",
        "On crée souvent un identifiant technique : idJeu, idClient, idFournisseur…"
      ],
      solution: `JEU
  #idJeu        (identifiant)
  titre
  prixAchat
  prixLocation
  stockVente
  stockLocation

CLIENT
  #idClient
  nom
  prenom
  email

CATEGORIE
  #idCategorie
  libelle

FOURNISSEUR
  #idFournisseur
  nom
  telephone`,
      note: "Toute entité DOIT avoir un identifiant : une propriété dont la valeur est unique et jamais nulle. L'identifiant technique (idJeu, idFournisseur) est simple et stable."
    },
    4: {
      titre: "les premières associations",
      etat: "On a des entités isolées. Relions-les : un client LOUE des jeux, un fournisseur les FOURNIT.",
      objectif: "Crée l'association LOUER entre CLIENT et JEU, APPARTENIR entre JEU et CATEGORIE, et FOURNIR entre FOURNISSEUR et JEU (un fournisseur fournit des jeux).",
      hints: [
        "Une association = un verbe reliant deux entités (un ovale).",
        "Ne mets pas encore les cardinalités : juste les liens."
      ],
      solution: `CLIENT ----( LOUER )---- JEU

JEU ----( APPARTENIR )---- CATEGORIE

FOURNISSEUR ----( FOURNIR )---- JEU`,
      note: "L'association traduit un lien métier entre entités. Son nom est souvent un verbe (LOUER, APPARTENIR, FOURNIR). Les cardinalités viendront préciser « combien »."
    },
    5: {
      titre: "les cardinalités",
      etat: "Les liens existent, mais on ne sait pas « combien de fois ». Ajoutons les cardinalités.",
      objectif: "Place les cardinalités : un jeu appartient à exactement une catégorie et provient d'un seul fournisseur ; une catégorie regroupe plusieurs jeux, un fournisseur fournit plusieurs jeux ; un client loue plusieurs jeux et un jeu est loué par plusieurs clients.",
      hints: [
        "Cardinalité = (mini, maxi) côté entité : combien d'occurrences de l'association pour UNE occurrence de l'entité.",
        "0,n / 1,n / 1,1 / 0,1 sont les valeurs courantes."
      ],
      solution: `CATEGORIE 0,n ----( APPARTENIR )---- 1,1 JEU
  (une catégorie : 0..n jeux ; un jeu : exactement 1 catégorie)

FOURNISSEUR 0,n ----( FOURNIR )---- 1,1 JEU
  (un fournisseur : 0..n jeux ; un jeu : exactement 1 fournisseur)

CLIENT 0,n ----( LOUER )---- 0,n JEU
  (un client loue 0..n jeux ; un jeu est loué par 0..n clients)`,
      note: "La cardinalité se lit du côté de l'entité. Le maxi n annonce une relation « plusieurs » ; deux maxi à n annoncent un N:M. APPARTENIR et FOURNIR sont en 1:N, LOUER en N:M."
    },
    6: {
      titre: "reconnaître le type d'association",
      etat: "Les cardinalités révèlent la nature des liens. Classons-les.",
      objectif: "Classe les associations : APPARTENIR et FOURNIR sont de type 1:N ; LOUER est de type N:M. Explique pourquoi LOUER devra devenir une table à part au MLD.",
      hints: [
        "Maxi 1 d'un côté et n de l'autre = 1:N.",
        "Maxi n des deux côtés = N:M (relation « plusieurs-à-plusieurs »)."
      ],
      solution: `APPARTENIR : 1:N   (côté JEU maxi 1, côté CATEGORIE maxi n)
FOURNIR    : 1:N   (côté JEU maxi 1, côté FOURNISSEUR maxi n)

LOUER : N:M   (maxi n des deux côtés)
  -> au MLD, un N:M devient une TABLE d'association
     avec les deux clés étrangères ;
  -> un 1:N devient une simple clé étrangère.`,
      note: "Distinguer 1:N et N:M est capital : le 1:N se traduit par une clé étrangère, le N:M par une nouvelle table. C'est la règle de passage la plus importante."
    },
    7: {
      titre: "assembler un premier MCD",
      etat: "On réunit les entités et associations vues jusqu'ici en un schéma cohérent.",
      objectif: "Écris le MCD complet regroupant CLIENT, JEU, CATEGORIE, FOURNISSEUR, avec les associations LOUER (N:M), APPARTENIR (1:N) et FOURNIR (1:N), et toutes les cardinalités.",
      hints: [
        "Rassemble entités (avec identifiants) et associations (avec cardinalités).",
        "Relis : chaque entité a un identifiant, chaque association a 2 cardinalités."
      ],
      solution: `Entités :
  JEU(#idJeu, titre, prixAchat, prixLocation, stockVente, stockLocation)
  CLIENT(#idClient, nom, prenom, email)
  CATEGORIE(#idCategorie, libelle)
  FOURNISSEUR(#idFournisseur, nom, telephone)

Associations :
  CATEGORIE   0,n --( APPARTENIR )-- 1,1 JEU
  FOURNISSEUR 0,n --( FOURNIR )--    1,1 JEU
  CLIENT      0,n --( LOUER )--      0,n JEU`,
      note: "Voilà un MCD déjà solide. On va l'enrichir : la location a besoin de dates, il faut gérer les achats, les employés, les réservations…"
    },
    8: {
      titre: "une association porteuse de données",
      etat: "Où stocker la date de location et la durée ? Ni dans CLIENT, ni dans JEU : dans l'association elle-même.",
      objectif: "Transforme LOUER en association porteuse : ajoute-lui dateDebut, nbJours et montant. Prévois aussi une association ACHETER (client achète un jeu), porteuse de dateAchat et prix.",
      hints: [
        "Une association N:M peut porter ses propres propriétés.",
        "Ces propriétés dépendent des DEUX entités à la fois."
      ],
      solution: `CLIENT 0,n --( LOUER )-- 0,n JEU
        LOUER porte : dateDebut, nbJours, montant

CLIENT 0,n --( ACHETER )-- 0,n JEU
        ACHETER porte : dateAchat, prix

(la date et le montant appartiennent au couple client+jeu)`,
      note: "Une propriété qui dépend de deux entités se place sur l'association qui les relie. LOUER et ACHETER sont deux N:M porteuses : au MLD, chacune deviendra une table."
    },
    9: {
      titre: "une association ternaire",
      etat: "Concept du jour : parfois trois entités sont liées en même temps. Illustrons-le sur une vente encadrée par un vendeur.",
      objectif: "Pour comprendre les associations n-aires, modélise une ternaire VENDRE reliant CLIENT, JEU et VENDEUR (elle porterait dateVente et prixVente). Indique les cardinalités.",
      hints: [
        "Une association n-aire relie 3 entités ou plus (un seul ovale, 3 pattes).",
        "Chaque patte porte sa cardinalité."
      ],
      solution: `VENDEUR(#idVendeur, nom)

Association ternaire (exemple pédagogique) :
  ( VENDRE )  relie  CLIENT, JEU, VENDEUR
  CLIENT 0,n / JEU 0,n / VENDEUR 0,n
  VENDRE porte : dateVente, prixVente`,
      note: "La ternaire se justifie quand trois entités sont liées SIMULTANÉMENT. Dans le modèle FINAL de la ludothèque, on simplifie : l'achat est une N:M ACHETER (client–jeu) ; le vendeur est géré à part. La ternaire reste ici l'exemple du concept (leçon 9)."
    },
    10: {
      titre: "une association réflexive",
      etat: "Concept du jour : une entité peut se relier à elle-même. Illustrons avec les extensions de jeux.",
      objectif: "Pour comprendre la réflexivité, modélise ETENDRE sur JEU : une extension complète un jeu de base. Précise les cardinalités et le rôle de chaque côté.",
      hints: [
        "Une association réflexive relie une entité à elle-même.",
        "Nomme les rôles pour lever l'ambiguïté (jeu de base / extension)."
      ],
      solution: `JEU --( ETENDRE )-- JEU   (exemple pédagogique)
  côté « jeu de base » : 0,n
  côté « extension »   : 0,1
Rôles : ETENDRE(jeuDeBase, extension)`,
      note: "La réflexive relie une entité à elle-même ; nommer les rôles est indispensable. Au MLD, une réflexive 1:N ajoute une clé étrangère vers la même table. Le modèle final de la ludothèque ne retient pas les extensions, pour rester simple."
    },
    11: {
      titre: "une contrainte (CIF)",
      etat: "Règle métier : une location doit être validée par un vendeur. Exprimons une contrainte.",
      objectif: "Ajoute une Contrainte d'Intégrité Fonctionnelle (CIF) : le vendeur qui valide une location est déterminé par la location. Décris aussi une contrainte simple en français.",
      hints: [
        "Une CIF exprime qu'une entité est déterminée par d'autres via des associations.",
        "On l'annote souvent par un cercle « CIF » relié aux pattes concernées."
      ],
      solution: `CIF : (LOCATION) --> VENDEUR
  « connaissant une location, on connaît le vendeur qui l'a validée »

Contrainte métier (en clair) :
  on ne peut pas louer un jeu dont stockLocation = 0.
  (à faire respecter par le MPD / l'application)`,
      note: "Les contraintes (CIF, exclusion, totalité, partition) précisent des règles que les cardinalités ne capturent pas. Certaines seront vérifiées par la base, d'autres par le code."
    },
    12: {
      titre: "gérer le stock : compteurs ou exemplaires ?",
      etat: "Décision de modélisation : suit-on chaque copie physique d'un jeu, ou juste des quantités ?",
      objectif: "Comprends l'entité faible EXEMPLAIRE (un numéro relatif au jeu). Puis tranche : la ludothèque gérera le stock par DEUX compteurs (stockVente, stockLocation) sur JEU, plutôt que par exemplaires individuels. Justifie le choix.",
      hints: [
        "Un identifiant relatif complète l'identifiant de l'entité forte : ex. (idJeu, numExemplaire).",
        "Suivre chaque exemplaire est utile si on trace l'état de CHAQUE copie ; sinon, deux compteurs suffisent."
      ],
      solution: `Option A — exemplaires individuels (entité FAIBLE) :
  EXEMPLAIRE(#numExemplaire relatif à JEU, etat)
  JEU 1,n --( POSSEDER )-- 1,1 EXEMPLAIRE
  clé complète = (idJeu, numExemplaire)
  -> utile pour suivre l'état de CHAQUE copie.

Option B — deux compteurs (RETENUE par la ludothèque) :
  JEU( ..., stockVente, stockLocation )
  -> plus simple : on compte les jeux à vendre et à louer.

=> pas d'entité EXEMPLAIRE dans le modèle final.`,
      note: "Modéliser, c'est choisir. L'entité faible (identifiant relatif) est LA solution pour tracer chaque unité ; mais deux compteurs de stock suffisent quand on ne gère que des quantités. On retient les compteurs."
    },
    13: {
      titre: "héritage : généraliser les utilisateurs",
      etat: "Clients, vendeurs et administrateurs partagent des données communes (nom, email). Factorisons par l'héritage.",
      objectif: "Crée une entité générique UTILISATEUR (nom, prenom, email) et spécialise-la en CLIENT, VENDEUR, ADMINISTRATEUR (chacune avec ses propriétés propres). Indique le type d'héritage.",
      hints: [
        "La sur-entité porte les propriétés communes ; les sous-entités les spécifiques.",
        "Précise si un utilisateur est d'un seul type (exclusif) et si tous les cas sont couverts (totalité)."
      ],
      solution: `UTILISATEUR(#idUtilisateur, nom, prenom, email)
   ▲  (généralisation, partition X,T : exclusif + total)
   ├── CLIENT(adresse, pointsFidelite)
   ├── VENDEUR(matricule)
   └── ADMINISTRATEUR(niveauAcces)`,
      note: "La généralisation/spécialisation factorise le commun. La partition (X = exclusif, T = total) dit qu'un utilisateur est d'exactement un type. Au MLD, plusieurs stratégies de traduction existent."
    },
    14: {
      titre: "vérifier et normaliser le MCD",
      etat: "Avant de traduire, on chasse les redondances et les erreurs de conception.",
      objectif: "Relis le MCD : repère et corrige un défaut. Par exemple, si « libelleCategorie » était copié dans JEU, retire-le (il appartient à CATEGORIE). Vérifie que chaque propriété ne dépend que de l'identifiant de son entité.",
      hints: [
        "Une même information ne doit être stockée qu'à UN endroit (pas de redondance).",
        "Chaque propriété dépend de l'identifiant complet, de tout l'identifiant, rien que de lui."
      ],
      solution: `Défaut typique : mettre « libelleCategorie » ou « nomFournisseur » dans JEU
  -> redondance ! Ces libellés sont déjà dans CATEGORIE et FOURNISSEUR.
  Correction : JEU garde seulement les liens (idCategorie, idFournisseur),
  les libellés restent dans leur entité.

Contrôle : chaque propriété dépend UNIQUEMENT de l'identifiant de son entité.`,
      note: "Un MCD bien normalisé évite les incohérences. Ces règles préfigurent les formes normales du modèle relationnel."
    },
    15: {
      titre: "du MCD au MLD : entités → tables",
      etat: "Le MCD est validé. On entame sa traduction en modèle logique relationnel (MLD).",
      objectif: "Applique la 1re règle : chaque entité devient une table, son identifiant devient la clé primaire. Écris les tables JEU, CLIENT, CATEGORIE, FOURNISSEUR, VENDEUR.",
      hints: [
        "Entité -> table ; identifiant -> clé primaire (souligné / #).",
        "Les propriétés deviennent les colonnes."
      ],
      solution: `JEU(#idJeu, titre, prixAchat, prixLocation, stockVente, stockLocation)
CLIENT(#idClient, nom, prenom, email)
CATEGORIE(#idCategorie, libelle)
FOURNISSEUR(#idFournisseur, nom, telephone)
VENDEUR(#idVendeur, nom)

(# = clé primaire)`,
      note: "Règle 1 du passage MCD→MLD : une entité devient une table, son identifiant devient la clé primaire. Les associations, elles, suivent des règles selon leur type."
    },
    16: {
      titre: "traduire les associations",
      etat: "Les tables « entités » existent ; il reste à traduire les liens selon leur type.",
      objectif: "Applique les règles : les 1:N APPARTENIR et FOURNIR ajoutent idCategorie et idFournisseur dans JEU ; les N:M porteuses LOUER et ACHETER deviennent des tables avec les deux clés étrangères + leurs propriétés.",
      hints: [
        "1:N : la clé de l'entité côté « 1 » descend comme clé étrangère côté « n ».",
        "N:M : nouvelle table dont la clé primaire = les deux clés étrangères."
      ],
      solution: `-- 1:N : clés étrangères (catégorie et fournisseur)
JEU(#idJeu, titre, prixAchat, prixLocation, stockVente, stockLocation,
    #idCategorie, #idFournisseur)
  idCategorie -> CATEGORIE , idFournisseur -> FOURNISSEUR

-- N:M porteuses : nouvelles tables
LOUER(#idClient, #idJeu, dateDebut, nbJours, montant)
  clé = (idClient, idJeu, dateDebut) ; idClient -> CLIENT , idJeu -> JEU
ACHETER(#idClient, #idJeu, dateAchat, prix)
  clé = (idClient, idJeu, dateAchat)`,
      note: "Les deux règles reines : 1:N = une clé étrangère ; N:M = une table d'association. JEU porte désormais deux clés étrangères (catégorie et fournisseur)."
    },
    17: {
      titre: "traduire les cas particuliers",
      etat: "Restent l'héritage et la ternaire (l'exemple pédagogique).",
      objectif: "Traduis l'héritage UTILISATEUR (stratégie « table mère + tables filles ») et, à titre d'exercice, la ternaire VENDRE (table à 3 clés étrangères). Rappelle aussi la recette d'une entité faible.",
      hints: [
        "Héritage : la clé de chaque table fille = clé étrangère vers la table mère.",
        "Ternaire : une table avec les 3 clés étrangères."
      ],
      solution: `-- héritage (stratégie « table mère + tables filles »)
UTILISATEUR(#idUtilisateur, nom, prenom, email, type)
CLIENT(#idUtilisateur, adresse, pointsFidelite)   -- idUtilisateur -> UTILISATEUR
VENDEUR(#idUtilisateur, matricule)
ADMINISTRATEUR(#idUtilisateur, niveauAcces)

-- ternaire (exercice) : VENDRE
VENDRE(#idClient, #idJeu, #idVendeur, dateVente, prixVente)

-- Rappel (non utilisé ici) : une entité faible se traduirait par une
--   clé composite, ex. LIGNE(#idFacture, #numLigne, ...).`,
      note: "Chaque cas a sa recette. Le modèle final retient l'héritage (mère + filles) ; la ternaire reste un exercice de traduction, l'achat étant modélisé par la table ACHETER."
    },
    18: {
      titre: "le MLD relationnel complet",
      etat: "On rassemble toutes les tables avec leurs clés primaires et étrangères : c'est le MLD final.",
      objectif: "Écris le MLD complet de la Ludothèque (toutes les tables, PK et FK indiquées). Vérifie que chaque clé étrangère référence bien une clé primaire existante.",
      hints: [
        "Reprends les tables des étapes 15 à 17, sans EXEMPLAIRE (deux compteurs de stock).",
        "JEU porte deux clés étrangères : idCategorie et idFournisseur."
      ],
      solution: `CATEGORIE(#idCategorie, libelle)
FOURNISSEUR(#idFournisseur, nom, telephone)
UTILISATEUR(#idUtilisateur, nom, prenom, email, type)
CLIENT(#idUtilisateur→UTILISATEUR, adresse, pointsFidelite)
VENDEUR(#idUtilisateur→UTILISATEUR, matricule)
ADMINISTRATEUR(#idUtilisateur→UTILISATEUR, niveauAcces)
JEU(#idJeu, titre, prixAchat, prixLocation, stockVente, stockLocation,
    #idCategorie→CATEGORIE, #idFournisseur→FOURNISSEUR)
LOUER(#idClient→CLIENT, #idJeu→JEU, dateDebut, nbJours, montant)
ACHETER(#idClient→CLIENT, #idJeu→JEU, dateAchat, prix)`,
      note: "Le MLD est le plan directement traduisible en SQL (CREATE TABLE). Chaque FK doit pointer vers une PK existante : c'est l'intégrité référentielle. La table RESERVER s'ajoutera à l'étape 21."
    },
    19: {
      titre: "du MLD au MPD (physique)",
      etat: "Le MLD est logique et indépendant du SGBD. On le rend physique : types, contraintes, index.",
      objectif: "Pour la table JEU, précise le MPD : types de chaque colonne, NOT NULL, clé primaire auto-incrémentée, les deux clés étrangères, et un index utile (ex. sur le titre).",
      hints: [
        "Choisis un type par colonne (INT, VARCHAR(n), DECIMAL(6,2), DATE…).",
        "Ajoute NOT NULL, PRIMARY KEY, FOREIGN KEY, éventuellement un INDEX."
      ],
      solution: `MPD de JEU (proche du SQL) :
  idJeu          INT           PRIMARY KEY, AUTO_INCREMENT
  titre          VARCHAR(120)  NOT NULL
  prixAchat      DECIMAL(6,2)  NOT NULL
  prixLocation   DECIMAL(6,2)  NOT NULL
  stockVente     INT           NOT NULL DEFAULT 0
  stockLocation  INT           NOT NULL DEFAULT 0
  idCategorie    INT           FOREIGN KEY -> CATEGORIE(idCategorie)
  idFournisseur  INT           FOREIGN KEY -> FOURNISSEUR(idFournisseur)
  INDEX idx_titre (titre)`,
      note: "Le MPD dépend du SGBD (types, auto-incrément, index). C'est le pont direct vers le SQL CREATE TABLE que tu écriras dans les cours SQL, SQL Server et MySQL."
    },
    20: {
      titre: "🏁 le modèle complet de la Ludothèque",
      etat: "Toutes les briques existent : on présente le MCD et le MLD complets, prêts pour le SQL.",
      objectif: "Rédige la synthèse : le MCD (entités + associations + cardinalités) et le MLD (tables + clés) de la Ludothèque, cohérents entre eux. C'est le livrable de conception.",
      hints: [
        "Reprends les étapes 7 à 18 en un ensemble cohérent.",
        "Vérifie une dernière fois identifiants, cardinalités, clés étrangères."
      ],
      solution: `MCD (résumé) :
  UTILISATEUR <|-- CLIENT, VENDEUR, ADMINISTRATEUR (héritage X,T)
  CATEGORIE   0,n --( APPARTENIR )-- 1,1 JEU
  FOURNISSEUR 0,n --( FOURNIR )--    1,1 JEU
  CLIENT 0,n --( LOUER: dateDebut,nbJours,montant )-- 0,n JEU
  CLIENT 0,n --( ACHETER: dateAchat,prix )--          0,n JEU
  JEU : ..., stockVente, stockLocation

MLD (résumé) : CATEGORIE, FOURNISSEUR, UTILISATEUR, CLIENT, VENDEUR,
  ADMINISTRATEUR, JEU, LOUER, ACHETER   (voir étape 18 pour les clés)

Choix retenus : stock = 2 compteurs (pas d'exemplaires) ;
achat = N:M ACHETER ; jeu relié à sa catégorie ET à son fournisseur.`,
      note: "Tu as conçu une base complète, de l'analyse au MLD. Les cours SQL/SQL Server/MySQL partiront exactement de ce MLD pour créer et interroger les tables."
    },
    21: {
      titre: "🎓 faire évoluer le modèle",
      etat: "Épreuve finale : le métier évolue, le modèle doit suivre.",
      objectif: "Nouvelle règle : on veut mémoriser les RÉSERVATIONS (un client réserve un jeu pour une date, tant qu'il n'y a plus de stock disponible). Ajoute l'entité/association nécessaire au MCD, puis sa traduction au MLD.",
      hints: [
        "Une réservation lie un CLIENT et un JEU, avec une date : proche de LOUER.",
        "MCD : association N:M porteuse ; MLD : nouvelle table."
      ],
      solution: `MCD :
  CLIENT 0,n --( RESERVER )-- 0,n JEU
    RESERVER porte : dateReservation, statut

MLD :
  RESERVER(#idClient→CLIENT, #idJeu→JEU, dateReservation, statut)
    clé primaire = (idClient, idJeu, dateReservation)

Le modèle final compte alors 10 tables (avec RESERVER).`,
      note: "Tu réunis entités, associations, cardinalités et passage au MLD : la synthèse du cours. Un bon modèle sait accueillir de nouvelles règles sans tout casser."
    }
  }
};
