# _veille.md — Inventaire des affirmations périssables

But : cartographier ce qui **était vrai à la rédaction mais peut cesser de l'être** (versions, outils, chiffres datés). Ce n'est pas une liste de bugs : c'est la carte de ce qu'une **future révision** doit revérifier en priorité. Dernière construction : **août 2026**.

## Éléments transverses (à revérifier globalement)

- **Pyodide `v0.26.4`** (CDN jsdelivr) chargé par `exo-ecriture.js` dans tous les cours à exécution Python : vérifier que la version existe encore sur le CDN et reste compatible.
- **sql.js** (WASM) pour les cours SQL exécutables : idem, dépendance CDN versionnée.
- **`bleach` → `nh3`** (cours-securite) : `bleach` dépréciée depuis 2023, remplacée par `nh3` maintenue. Revérifier que `nh3` reste la recommandation vivante.
- **UML 2.5.1 (OMG)** — version enseignée par `cours-uml`. C'est la version en vigueur depuis 2017 ; si l'OMG publie
  une révision (UML 2.6 / 3.x), revérifier : le **nombre de diagrammes (14)**, la notation des contraintes de
  généralisation, et la liste des opérateurs de fragment combiné. Le cours affirme aussi que le support du PAC
  annonce **13 diagrammes** (il omet le diagramme de profils) : cette comparaison est datée du support 2025-2026.
- **Outils de diagrammes cités par `cours-uml`** : PlantUML (plantuml.com), draw.io / diagrams.net. Vérifier
  qu'ils restent gratuits et accessibles en ligne ; la syntaxe PlantUML des solutions dépend de leur maintien.
- **Banques du test de placement ↔ syllabus des langues** : `test-niveau-<langue>.js` calibre ses questions sur
  les TITLES réels des 16 cours de langue. **Si un syllabus de langue change** (leçon ajoutée, point de grammaire
  déplacé d'un palier à l'autre), la banque correspondante doit suivre, sinon le test place à côté. Le champ
  `point` de chaque question nomme le point de syllabus visé : c'est par là qu'il faut entrer pour la mise à jour.
- **Banques de vocabulaire ↔ lexiques des cours** : `vocab-data-<langue>.js` est **généré** depuis les quatre
  `lexique.html` de chaque langue par `_outils/vocabulaire/vocabgen2.py`. **Si un lexique change** (mot ajouté,
  traduction corrigée), il faut relancer le générateur, sinon `_verify_vocab.js` fait échouer le build — c'est
  voulu : le cours et le QCM ne doivent jamais diverger. Ne jamais corriger le `.js` à la main.
- **~940 mots d'extension** (`source: "revu"` : 157 nl, 257 en, 270 es, 255 de). Écrits à la main, puis relus un
  par un : 44 mots retirés et 12 traductions corrigées (compte rendu dans `vocab-revue.md`, règles appliquées dans
  `_outils/vocabulaire/revue_extension.py`). **Mais la relecture a été faite par le même auteur que les listes** —
  aucun dictionnaire n'est atteignable depuis l'environnement de génération (PyPI 403, `apt` sans droits, web
  expiré). C'est un durcissement du critère d'admission, pas une vérification indépendante : **le point le plus
  fragile du site reste ici.** Une relecture par un professeur ou un locuteur est la seule chose qui la lèverait.
- **`vocab-synonymes.js` — table volontairement incomplète.** Elle empêche deux traductions synonymes d'apparaître
  dans le même QCM (« salaire » / « paie »). Elle ne couvre que les collisions constatées : **chaque signalement
  d'une question à deux réponses défendables doit s'y traduire par une famille ajoutée.** Le vérificateur partage
  cette table avec le moteur, il ne peut donc pas révéler ce qui lui manque.
- **`cours-algorithmes` : corrigés NON vérifiés, décision assumée du 5 août 2026.** Le cours est en
  pseudocode, donc rien n'y est exécutable : ses exercices d'entraînement portent des checklists renforcées mais
  **aucun champ `tests`**. Or le taux de faute mesuré sur `cours-python` est d'environ **une erreur pour trois
  exercices** — calculs posés de tête, longueurs comptées à l'œil — et ces fautes ne sont détectables que par
  exécution. Il faut donc s'attendre à ce que ces corrigés en contiennent, et **ils sont en ligne sans filet**.
  Remède prévu et reporté : transcrire chaque corrigé pseudocode en Python, faire exécuter la transcription par
  `_verify_entrainement.js`, n'afficher que le pseudocode. **À faire une fois tous les langages écrits.**
- **Dates « Dernière révision : Août 2026 »** sur les 81 sommaires : à faire glisser à chaque vraie révision.
- **Watchlist d'outils dépréciés** (scan automatique passé) : aucun autre que `bleach` détecté (les occurrences de « nose » dans les cours d'anglais sont le mot anglais, pas l'outil de test Python).

## Par cours — technologie couverte, versions citées, chiffres datés

> La colonne « Versions citées » provient d'un **scan automatique** des leçons et peut contenir du bruit (numéros
> attrapés dans de la prose) ; elle sert de point de départ à une revérification, pas de liste faisant foi. La
> colonne « Techno couverte » (issue du bandeau officiel de chaque sommaire) est, elle, fiable.

### 1. Programmation & données

| Cours | Techno couverte | Versions citées dans les leçons | Chiffres datés |
|---|---|---|---|
| `cours-algorithmes` | Pseudocode / algorithmique | — | — |
| `cours-api` | API REST · Django REST Framework | — | — |
| `cours-asm` | Assembleur x86-64 (NASM) · Linux | — | — |
| `cours-c` | C (C17) · GCC | — | — |
| `cours-cicd` | Git avancé · GitHub Actions | Django 5.1, Docker 17, MySQL 8.4, Python 3.14, mysql 8.4.2 | — |
| `cours-cpp-bas` | C++ (C++17/20) · GCC | C++ 17, c++ 17 | — |
| `cours-cpp-moderne` | C++ (C++17/20) · GCC | C++ 11, C++ 14, C++ 17, c++ 17 | — |
| `cours-csharp` | C# 12 · .NET 8 | C# 7, C# 7.1, C# 8+, C# 9+, Java 0 | — |
| `cours-django` | Django 5 | — | — |
| `cours-django-orm` | Django 5 | Django 1, Django 2, Django 4, MySQL 2 | — |
| `cours-docker` | Docker · Compose | Python 3.14, mysql 8.4, python 3.14 | — |
| `cours-dotnet` | ASP.NET Core (.NET 8) | — | — |
| `cours-efcore` | Entity Framework Core 8 | C# 5, SQL Server 2022 | — |
| `cours-eloquent` | Laravel Eloquent 11 | — | — |
| `cours-git` | Git | — | — |
| `cours-github-avance` | GitHub · Actions | Git 2, Node 18, Node 20, Python 3.10, Python 3.13 | — |
| `cours-github-debutant` | GitHub · Actions | git 2 | — |
| `cours-hibernate` | Hibernate ORM 6 · Jakarta JPA | — | — |
| `cours-initiation-bdd` | SQL (norme ISO) · SQLite 3 | MariaDB 10.3+, MySQL 8.0.31+ | — |
| `cours-java` | Java 21 (LTS) | Java 0, Java 14+, Java 16+, Java 5, Java 7 | — |
| `cours-laravel` | Laravel 11 | PHP 8 | — |
| `cours-merise` | Merise (méthode) | — | — |
| `cours-mysql` | MySQL 8.4 LTS | MySQL 5.5, MySQL 5.7, MySQL 5.7+, MySQL 8, MySQL 8.0, MySQL 8.0.16, MySQL 8.0.16+, MySQL 8.0.31, MySQL 8.0.31+ | — |
| `cours-php` | PHP 8.3 | PHP 7.4, PHP 8, PHP 8+ | — |
| `cours-projet-asm` | Assembleur x86-64 (NASM) · Linux | — | — |
| `cours-projet-c` | C (C17) · GCC | — | — |
| `cours-projet-c-pro` | C (C17) · GCC | MySQL 8.4 | — |
| `cours-projet-cpp` | C (C17) · GCC | C++ 17, c++ 17 | — |
| `cours-projet-cpp-pro` | C (C17) · GCC | C++ 17, MySQL 8.4, c++ 17 | — |
| `cours-projet-csharp` | C# 12 · .NET 8 | — | — |
| `cours-projet-csharp-pro` | C# 12 · .NET 8 | MySQL 8.4 | — |
| `cours-projet-java` | Java 21 (LTS) | — | — |
| `cours-projet-java-pro` | Java 21 (LTS) | Java 21, MySQL 8.4 | — |
| `cours-projet-php` | PHP 8.3 | PHP 5.6, PHP 7.4, PHP 8.1, PHP 8.3 | — |
| `cours-projet-php-pro` | PHP 8.3 | Laravel 11, MySQL 8.4, PHP 8.5, php 8.5 | — |
| `cours-projet-python` | Python 3.14 | — | — |
| `cours-projet-python-pro` | Python 3.14 | MySQL 8.4, Python 3.14 | — |
| `cours-projet-sgbd` | Java · JDBC · SQL | Java 9+ | — |
| `cours-projet-sgbd-csharp` | C# · ADO.NET · SQL | — | — |
| `cours-python` | Python 3.14 | Python 2026, Python 3.10, Python 3.10+, python 2026 | — |
| `cours-sgbd-avance` | SQL (norme ISO) · SQLite 3 | MariaDB 10.2+, MySQL 5.5, MySQL 5.7, MySQL 8, MySQL 8+, MySQL 8.0, MySQL 8.0.16, MySQL 8.0.18+, MySQL 8.0.20, MySQL 8.0.31, MySQL 8.0.31+, PostgreSQL 11+, PostgreSQL 14+, PostgreSQL 15+, SQL Server 2008, SQL Server 2012, SQL Server 2012+, SQL Server 2017+, SQL Server 2022+ | « depuis 2005 », « depuis 2012 », « depuis 2017 » |
| `cours-spring` | Spring Boot 3 | Java 10, Java 13, Java 16 | — |
| `cours-sql` | SQL (norme ISO) · SQLite 3 | — | — |
| `cours-sqlserver` | Microsoft SQL Server · T-SQL | SQL Server 2012, SQL Server 2016+ | « depuis 2012 » |
| `cours-tests` | Tests logiciels (pytest, JUnit…) | — | — |
| `cours-web` | HTML5 · CSS3 · JavaScript (ES2023) | — | — |

### 2a. Système & sécurité

| Cours | Techno couverte | Versions citées dans les leçons | Chiffres datés |
|---|---|---|---|
| `cours-ad-interface` | Active Directory (Windows Server) | Windows Server 2008, Windows Server 2022 | — |
| `cours-ad-scripts` | Active Directory (Windows Server) | — | — |
| `cours-linux` | Linux · Bash | python 3 | — |
| `cours-securite` | Sécurité applicative (OWASP) ⚠️bleach (DÉPRÉCIÉE depuis 2023 → nh3 (déjà corrigé)) | — | « depuis 2023 » |
| `cours-terminal` | Bash · PowerShell · CMD | — | — |

### 2b. Bureautique

| Cours | Techno couverte | Versions citées dans les leçons | Chiffres datés |
|---|---|---|---|
| `cours-excel` | Microsoft Excel 365 | Excel 2007, Excel 2013, Excel 2016, Excel 2019, Excel 2021, Excel 365 | « depuis 2007 », « depuis 2013 » |
| `cours-excel-pro` | Microsoft Excel 365 | Excel 2003, Excel 2007, Excel 2010, Excel 2016, Excel 2019, Excel 2021, Excel 365 | « depuis 2019 » |
| `cours-powerpoint` | Microsoft PowerPoint 365 | Excel 6 | « depuis 2013 » |
| `cours-word` | Microsoft Word 365 | Excel 3 | — |

### 3. Réseau & Cisco

| Cours | Techno couverte | Versions citées dans les leçons | Chiffres datés |
|---|---|---|---|
| `cours-cisco-ccie` | Cisco IOS · certifications | — | — |
| `cours-cisco-ccna` | Cisco IOS · certifications | — | « depuis 2020 » |
| `cours-cisco-ccnp` | Cisco IOS · certifications | — | — |
| `cours-cisco-ccst` | Cisco IOS · certifications | — | — |
| `cours-reseau-avance` | Réseaux TCP/IP (RFC) | docker 0 | « depuis 2011 », « depuis 2018 » |
| `cours-reseau-fondamentaux` | Réseaux TCP/IP (RFC) | — | — |
| `cours-reseau-ip-routage` | Réseaux TCP/IP (RFC) | — | — |
| `cours-reseau-securite` | Réseaux TCP/IP (RFC) | — | — |
| `cours-reseau-services-admin` | Réseaux TCP/IP (RFC) | Debian 12 | — |
| `cours-reseau-transport-app` | Réseaux TCP/IP (RFC) | MySQL 3306 | — |

### 4. Langues

| Cours | Techno couverte | Versions citées dans les leçons | Chiffres datés |
|---|---|---|---|
| `cours-allemand-a1` | Allemand (CECRL A1→B2) | — | « depuis 2010 » |
| `cours-allemand-a2` | Allemand (CECRL A1→B2) | — | — |
| `cours-allemand-b1` | Allemand (CECRL A1→B2) | — | « depuis 2020 », « depuis 2021 », « depuis 2022 » |
| `cours-allemand-b2` | Allemand (CECRL A1→B2) | — | « depuis 2021 », « depuis 2022 » |
| `cours-anglais-a1` | Anglais (CECRL A1→B2) | — | — |
| `cours-anglais-a2` | Anglais (CECRL A1→B2) | — | — |
| `cours-anglais-b1` | Anglais (CECRL A1→B2) | — | — |
| `cours-anglais-b2` | Anglais (CECRL A1→B2) | — | « depuis 2019 » |
| `cours-espagnol-a1` | Espagnol (CECRL A1→B2) | — | — |
| `cours-espagnol-a2` | Espagnol (CECRL A1→B2) | — | — |
| `cours-espagnol-b1` | Espagnol (CECRL A1→B2) | — | — |
| `cours-espagnol-b2` | Espagnol (CECRL A1→B2) | — | « depuis 2010 » |
| `cours-neerlandais-a1` | Néerlandais (CECRL A1→B2) | — | — |
| `cours-neerlandais-a2` | Néerlandais (CECRL A1→B2) | — | — |
| `cours-neerlandais-b1` | Néerlandais (CECRL A1→B2) | — | — |
| `cours-neerlandais-b2` | Néerlandais (CECRL A1→B2) | — | « depuis 2021 » |

