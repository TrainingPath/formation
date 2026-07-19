/* ===== Fil rouge « La Ludothèque » — capstone full-stack (Java · Spring · MySQL) =====
   Le grand assemblage : on construit l'application COMPLÈTE de la Ludothèque en
   réunissant le langage (Java), le framework (Spring Boot) et la base (MySQL).
   Catalogue, 3 rôles (client, vendeur, administrateur), achat ET location,
   architecture en couches, API REST, sécurité, tests et déploiement. */
var FIL = {
  prefix: "projjava21",
  app: "La Ludothèque",
  placeholder: "Écris ton code Java/Spring ici…",
  etapes: {
    1: {
      titre: "l'architecture du projet",
      etat: "On part d'une feuille blanche, mais on connaît déjà le domaine (la Ludothèque). Avant de coder, on pose l'architecture en couches.",
      objectif: "Décris (en commentaires ou en petit schéma de packages) l'architecture en couches de l'application : controller → service → repository → base MySQL, plus les packages model (entités) et dto. Explique le rôle de chaque couche en une ligne.",
      hints: [
        "Couches classiques : web (controllers), service (règles métier), persistence (repositories + entités).",
        "Le controller ne parle jamais directement à la base : il passe par le service, qui passe par le repository.",
        "Organise en packages : com.ludotheque.{web, service, repository, model, dto, config}."
      ],
      solution: `com.ludotheque
├── web         // @RestController / @Controller : reçoit les requêtes HTTP
├── service     // @Service : règles métier (louer, acheter, stocks)
├── repository  // Spring Data JPA : accès aux tables MySQL
├── model       // @Entity : Jeu, Categorie, Fournisseur, Utilisateur...
├── dto         // objets d'échange avec le client (pas les entités brutes)
└── config      // sécurité, beans, configuration

// Flux d'une requête :
// HTTP -> Controller -> Service (métier) -> Repository -> MySQL`,
      note: "L'architecture en couches sépare les responsabilités : le web gère HTTP, le service la logique métier, le repository la persistance. Cette séparation, vue en cours de Spring, est la colonne vertébrale de tout le projet."
    },
    2: {
      titre: "le projet Spring Boot connecté à MySQL",
      etat: "L'architecture est posée. On crée le projet et on le branche sur la base MySQL de la Ludothèque.",
      objectif: "Configure application.properties pour connecter Spring Boot à une base MySQL 'ludotheque'. Ajoute les dépendances clés (web, JPA, driver MySQL) et un endpoint /ping qui prouve que l'application démarre.",
      hints: [
        "spring.datasource.url=jdbc:mysql://localhost:3306/ludotheque",
        "spring.jpa.hibernate.ddl-auto=validate (on gérera le schéma par migrations, pas par Hibernate).",
        "Un @RestController minimal avec @GetMapping(\"/ping\") retournant \"pong\"."
      ],
      solution: `# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/ludotheque
spring.datasource.username=\${DB_USER}
spring.datasource.password=\${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true

// PingController.java
@RestController
class PingController {
  @GetMapping("/ping")
  String ping() { return "pong"; }
}`,
      note: "On connecte le framework à la base réelle. ddl-auto=validate impose que le schéma vienne des migrations (leçon 3) et non d'Hibernate : la base reste maîtrisée, comme on l'a conçue en Merise. Les identifiants passent par des variables d'environnement, jamais en dur."
    },
    3: {
      titre: "du MCD Merise aux migrations",
      etat: "L'application démarre à vide. On crée le schéma de la Ludothèque, issu du MCD Merise, via des migrations versionnées (Flyway).",
      objectif: "Écris la première migration Flyway (V1__schema.sql) créant les tables CATEGORIE, FOURNISSEUR et JEU (avec les deux stocks stockVente/stockLocation et les clés étrangères), en InnoDB.",
      hints: [
        "Fichier src/main/resources/db/migration/V1__schema.sql.",
        "Reprends le CREATE TABLE MySQL vu en cours (AUTO_INCREMENT, ENGINE=InnoDB).",
        "JEU référence CATEGORIE et FOURNISSEUR par clés étrangères."
      ],
      solution: `-- V1__schema.sql
CREATE TABLE CATEGORIE (
  idCategorie INT AUTO_INCREMENT PRIMARY KEY,
  libelle     VARCHAR(60) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE FOURNISSEUR (
  idFournisseur INT AUTO_INCREMENT PRIMARY KEY,
  nom           VARCHAR(80) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE JEU (
  idJeu INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(120) NOT NULL,
  prixAchat DECIMAL(6,2) NOT NULL,
  prixLocation DECIMAL(6,2) NOT NULL,
  stockVente INT NOT NULL DEFAULT 0,
  stockLocation INT NOT NULL DEFAULT 0,
  idCategorie INT NOT NULL,
  idFournisseur INT NULL,
  CONSTRAINT fk_jeu_cat FOREIGN KEY (idCategorie) REFERENCES CATEGORIE(idCategorie),
  CONSTRAINT fk_jeu_four FOREIGN KEY (idFournisseur) REFERENCES FOURNISSEUR(idFournisseur)
) ENGINE=InnoDB;`,
      note: "Flyway applique des migrations SQL versionnées : le schéma est reproductible sur chaque machine et environnement. Il traduit fidèlement le MCD Merise (deux stocks, fournisseur relié au jeu) en tables MySQL — le pont entre conception et code."
    },
    4: {
      titre: "les entités JPA du catalogue",
      etat: "Le schéma existe en base. On le reflète côté Java avec des entités JPA.",
      objectif: "Écris l'entité Jeu (@Entity) mappée sur la table JEU, avec ses champs, son @Id auto-généré, et ses relations @ManyToOne vers Categorie et Fournisseur.",
      hints: [
        "@Entity @Table(name=\"JEU\") ; @Id @GeneratedValue(strategy=GenerationType.IDENTITY).",
        "@ManyToOne @JoinColumn(name=\"idCategorie\").",
        "Deux champs stockVente et stockLocation (int)."
      ],
      solution: `@Entity @Table(name = "JEU")
public class Jeu {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idJeu;
  private String titre;
  private BigDecimal prixAchat;
  private BigDecimal prixLocation;
  private int stockVente;
  private int stockLocation;

  @ManyToOne @JoinColumn(name = "idCategorie")
  private Categorie categorie;

  @ManyToOne @JoinColumn(name = "idFournisseur")
  private Fournisseur fournisseur;
  // getters / setters
}`,
      note: "L'entité JPA fait correspondre une classe Java à une table MySQL. GenerationType.IDENTITY s'appuie sur l'AUTO_INCREMENT de MySQL. Les @ManyToOne matérialisent les clés étrangères du MCD : Java et la base parlent enfin le même langage."
    },
    5: {
      titre: "les repositories Spring Data",
      etat: "Les entités sont prêtes. On veut lire et écrire en base sans SQL manuel.",
      objectif: "Crée JeuRepository (extends JpaRepository<Jeu, Long>) avec une requête dérivée trouvant les jeux disponibles à la location (stockLocation > 0) et une recherche par titre contenant un mot.",
      hints: [
        "interface JeuRepository extends JpaRepository<Jeu, Long>.",
        "Requête dérivée : findByStockLocationGreaterThan(int n).",
        "Recherche : findByTitreContainingIgnoreCase(String mot)."
      ],
      solution: `public interface JeuRepository extends JpaRepository<Jeu, Long> {
  List<Jeu> findByStockLocationGreaterThan(int n);
  List<Jeu> findByTitreContainingIgnoreCase(String mot);
  List<Jeu> findByCategorie_IdCategorie(Long idCategorie);
}`,
      note: "JpaRepository fournit le CRUD gratuitement (save, findById, findAll, delete). Les requêtes dérivées traduisent le nom de la méthode en SQL : findByStockLocationGreaterThan devient WHERE stockLocation > ?. Aucun SQL à écrire pour les cas courants."
    },
    6: {
      titre: "la couche service et les règles métier",
      etat: "On peut lire/écrire les jeux. Il faut maintenant encapsuler les règles métier de la Ludothèque.",
      objectif: "Crée CatalogueService (@Service) avec une méthode qui renvoie les jeux louables et une méthode ajouterStockLocation(idJeu, quantite) qui incrémente le stock de location en respectant l'intégrité.",
      hints: [
        "@Service, injecte JeuRepository par le constructeur.",
        "jeuxLouables() délègue à findByStockLocationGreaterThan(0).",
        "ajouterStock : charger le jeu, modifier le champ, save()."
      ],
      solution: `@Service
public class CatalogueService {
  private final JeuRepository jeux;
  public CatalogueService(JeuRepository jeux) { this.jeux = jeux; }

  public List<Jeu> jeuxLouables() {
    return jeux.findByStockLocationGreaterThan(0);
  }

  @Transactional
  public void ajouterStockLocation(Long idJeu, int quantite) {
    Jeu j = jeux.findById(idJeu)
        .orElseThrow(() -> new IllegalArgumentException("Jeu introuvable"));
    j.setStockLocation(j.getStockLocation() + quantite);
    jeux.save(j);
  }
}`,
      note: "Le service porte la logique métier et l'isole du web et de la base. @Transactional garantit qu'une opération qui touche plusieurs écritures est atomique. C'est ici que vivront bientôt les règles d'achat et de location, avec leurs deux stocks distincts."
    },
    7: {
      titre: "l'API REST du catalogue",
      etat: "Le service expose la logique. On l'ouvre au monde via une API REST propre, avec des DTO.",
      objectif: "Crée JeuController (@RestController) avec GET /api/jeux (liste) et GET /api/jeux/{id}. Renvoie des JeuDTO (titre, prix, disponibilité), pas les entités brutes.",
      hints: [
        "@RestController @RequestMapping(\"/api/jeux\").",
        "Un JeuDTO expose ce que le client doit voir, sans les détails internes.",
        "404 si le jeu n'existe pas."
      ],
      solution: `@RestController
@RequestMapping("/api/jeux")
public class JeuController {
  private final CatalogueService service;
  public JeuController(CatalogueService s) { this.service = s; }

  @GetMapping
  public List<JeuDTO> lister() {
    return service.tousLesJeux().stream().map(JeuDTO::from).toList();
  }

  @GetMapping("/{id}")
  public JeuDTO un(@PathVariable Long id) {
    return JeuDTO.from(service.parId(id));  // 404 géré par un advice
  }
}`,
      note: "Le DTO découple l'API des entités : on choisit ce qu'on expose (et on protège les données internes). C'est une bonne pratique fondamentale : l'API reste stable même si le modèle interne change."
    },
    8: {
      titre: "validation et gestion des erreurs",
      etat: "L'API accepte des données ; il faut les valider et répondre proprement en cas d'erreur.",
      objectif: "Ajoute Bean Validation sur un CreationJeuDTO (titre non vide, prix positifs) et un @RestControllerAdvice qui transforme les erreurs de validation et les 'introuvable' en réponses HTTP claires (400 / 404).",
      hints: [
        "@NotBlank sur titre, @Positive sur les prix ; @Valid dans le controller.",
        "@RestControllerAdvice + @ExceptionHandler(MethodArgumentNotValidException.class) -> 400.",
        "@ExceptionHandler(NoSuchElementException.class) -> 404."
      ],
      solution: `public record CreationJeuDTO(
    @NotBlank String titre,
    @Positive BigDecimal prixLocation) {}

@RestControllerAdvice
class GestionErreurs {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  Map<String,String> invalides(MethodArgumentNotValidException e) {
    return Map.of("erreur", "données invalides");
  }
  @ExceptionHandler(NoSuchElementException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  Map<String,String> introuvable() { return Map.of("erreur", "ressource introuvable"); }
}`,
      note: "La validation refuse les données incohérentes AVANT d'atteindre la base ; le @RestControllerAdvice centralise la traduction des exceptions en codes HTTP. L'API devient robuste et prévisible pour le client."
    },
    9: {
      titre: "les utilisateurs et les trois rôles",
      etat: "Le catalogue tourne. On introduit les utilisateurs de la Ludothèque et leurs trois profils.",
      objectif: "Ajoute la migration et l'entité Utilisateur (email, motDePasse haché, role) avec un enum Role { CLIENT, VENDEUR, ADMINISTRATEUR }. L'email est unique.",
      hints: [
        "Migration V2 : table UTILISATEUR(email UNIQUE, motDePasse, role).",
        "enum Role { CLIENT, VENDEUR, ADMINISTRATEUR }.",
        "@Enumerated(EnumType.STRING) pour stocker le rôle en clair."
      ],
      solution: `-- V2__utilisateurs.sql
CREATE TABLE UTILISATEUR (
  idUtilisateur INT AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(120) NOT NULL UNIQUE,
  motDePasse  VARCHAR(100) NOT NULL,   -- haché (BCrypt)
  role        VARCHAR(20)  NOT NULL
) ENGINE=InnoDB;

@Entity @Table(name="UTILISATEUR")
public class Utilisateur {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) Long id;
  @Column(unique=true) String email;
  String motDePasse;                    // ne JAMAIS stocker en clair
  @Enumerated(EnumType.STRING) Role role;
}
public enum Role { CLIENT, VENDEUR, ADMINISTRATEUR }`,
      note: "Les trois rôles du modèle Ludothèque deviennent un enum et une colonne. Le mot de passe sera haché (jamais en clair) : on prépare l'authentification. L'unicité de l'email est garantie au niveau base."
    },
    10: {
      titre: "l'authentification (Spring Security)",
      etat: "Les utilisateurs existent. On protège l'application et on permet la connexion.",
      objectif: "Configure Spring Security : un PasswordEncoder BCrypt, un UserDetailsService qui charge l'utilisateur par email, et l'ouverture publique du catalogue en lecture (GET /api/jeux) mais l'authentification pour le reste.",
      hints: [
        "@Bean PasswordEncoder -> new BCryptPasswordEncoder().",
        "UserDetailsService : charger l'Utilisateur par email, mapper le rôle en autorité.",
        "SecurityFilterChain : permitAll sur GET /api/jeux/**, authenticated ailleurs."
      ],
      solution: `@Bean PasswordEncoder encoder() { return new BCryptPasswordEncoder(); }

@Bean
SecurityFilterChain chaine(HttpSecurity http) throws Exception {
  http.authorizeHttpRequests(a -> a
      .requestMatchers(HttpMethod.GET, "/api/jeux/**").permitAll()
      .anyRequest().authenticated())
    .httpBasic(Customizer.withDefaults());
  return http.build();
}`,
      note: "Spring Security gère l'authentification. BCrypt hache les mots de passe (lent et salé, résistant aux attaques). On ouvre le catalogue en lecture à tous, mais tout le reste exige une identité : c'est le socle de la sécurité de l'application."
    },
    11: {
      titre: "l'autorisation par rôle",
      etat: "On sait QUI est connecté. Il faut décider QUI a le droit de faire QUOI.",
      objectif: "Restreins les actions : seul un VENDEUR ou ADMINISTRATEUR peut créer/modifier un jeu ; seul un ADMINISTRATEUR gère les utilisateurs. Utilise @PreAuthorize.",
      hints: [
        "Active @EnableMethodSecurity.",
        "@PreAuthorize(\"hasRole('ADMINISTRATEUR')\") sur la gestion des utilisateurs.",
        "@PreAuthorize(\"hasAnyRole('VENDEUR','ADMINISTRATEUR')\") sur la modification du catalogue."
      ],
      solution: `@PreAuthorize("hasAnyRole('VENDEUR','ADMINISTRATEUR')")
@PostMapping("/api/jeux")
public JeuDTO creer(@Valid @RequestBody CreationJeuDTO dto) { ... }

@PreAuthorize("hasRole('ADMINISTRATEUR')")
@DeleteMapping("/api/utilisateurs/{id}")
public void supprimer(@PathVariable Long id) { ... }`,
      note: "L'autorisation distingue les trois rôles : le client consulte et loue/achète, le vendeur gère le stock, l'administrateur gère tout. @PreAuthorize applique la règle au plus près de la méthode. Authentification (qui) et autorisation (quel droit) sont bien distinctes."
    },
    12: {
      titre: "louer un jeu (transaction)",
      etat: "Le cœur métier arrive : un client loue un jeu. Deux écritures indissociables.",
      objectif: "Écris LocationService.louer(idClient, idJeu) : vérifier le stock de location, créer la ligne LOUER (date du jour, 7 jours) et décrémenter stockLocation, le tout dans une transaction. Lève une exception si le stock est nul.",
      hints: [
        "@Transactional sur la méthode.",
        "Si stockLocation <= 0 -> throw new StockInsuffisantException.",
        "Sauver la Location puis décrémenter le stock du jeu."
      ],
      solution: `@Service
public class LocationService {
  private final JeuRepository jeux;
  private final LocationRepository locations;
  // constructeur...

  @Transactional
  public void louer(Long idClient, Long idJeu) {
    Jeu j = jeux.findById(idJeu).orElseThrow();
    if (j.getStockLocation() <= 0)
      throw new StockInsuffisantException("Plus de stock de location");
    locations.save(new Location(idClient, idJeu, LocalDate.now(), 7));
    j.setStockLocation(j.getStockLocation() - 1);
    jeux.save(j);
  }
}`,
      note: "Louer = enregistrer la location ET décrémenter le stock : @Transactional rend les deux indivisibles (atomicité, comme la transaction MySQL vue en cours). Si le stock manque, l'exception annule tout. C'est la règle métier centrale de la Ludothèque."
    },
    13: {
      titre: "acheter un jeu",
      etat: "La location fonctionne. On ajoute l'achat, sur l'autre stock.",
      objectif: "Écris AchatService.acheter(idClient, idJeu) sur le même modèle, mais agissant sur stockVente. Simule un paiement (montant = prixAchat) et enregistre la ligne ACHETER.",
      hints: [
        "Même structure transactionnelle que louer(), mais sur stockVente.",
        "Le montant de l'achat = jeu.getPrixAchat().",
        "Lève StockInsuffisantException si stockVente <= 0."
      ],
      solution: `@Transactional
public void acheter(Long idClient, Long idJeu) {
  Jeu j = jeux.findById(idJeu).orElseThrow();
  if (j.getStockVente() <= 0)
    throw new StockInsuffisantException("Plus de stock de vente");
  BigDecimal montant = j.getPrixAchat();      // paiement simulé
  achats.save(new Achat(idClient, idJeu, LocalDate.now(), montant));
  j.setStockVente(j.getStockVente() - 1);
  jeux.save(j);
}`,
      note: "Acheter reprend la structure de louer, mais sur le stock de vente : les deux stocks distincts du modèle Merise prennent tout leur sens. Un vrai paiement passerait par un service externe ; ici on le simule pour rester concentré sur l'architecture."
    },
    14: {
      titre: "le frontend : le catalogue (Thymeleaf)",
      etat: "L'API métier est complète. On donne un visage à l'application avec des pages HTML server-side.",
      objectif: "Crée un @Controller (pas @RestController) et une vue Thymeleaf catalogue.html qui liste les jeux disponibles avec titre, prix de location et un bouton 'Louer'.",
      hints: [
        "@Controller + model.addAttribute(\"jeux\", service.jeuxLouables()); return \"catalogue\".",
        "Dans le template : th:each=\"jeu : \\${jeux}\".",
        "Afficher th:text=\"\\${jeu.titre}\"."
      ],
      solution: `@Controller
public class CatalogueWebController {
  private final CatalogueService service;
  @GetMapping("/catalogue")
  public String catalogue(Model model) {
    model.addAttribute("jeux", service.jeuxLouables());
    return "catalogue";
  }
}

<!-- catalogue.html -->
<table>
  <tr th:each="jeu : \${jeux}">
    <td th:text="\${jeu.titre}">Titre</td>
    <td th:text="\${jeu.prixLocation} + ' €'">0 €</td>
    <td><a th:href="@{/louer/{id}(id=\${jeu.idJeu})}">Louer</a></td>
  </tr>
</table>`,
      note: "Thymeleaf rend le HTML côté serveur à partir des données du modèle : le même service alimente l'API JSON et les pages web. L'utilisateur voit enfin la Ludothèque, pas seulement du JSON."
    },
    15: {
      titre: "recherche, filtres et pagination",
      etat: "Le catalogue s'affiche, mais il peut devenir long. On le rend navigable.",
      objectif: "Ajoute une recherche par titre et une pagination : le controller accepte un mot-clé et un numéro de page, et le repository renvoie une Page<Jeu> via Pageable.",
      hints: [
        "Signature repository : Page<Jeu> findByTitreContainingIgnoreCase(String q, Pageable p).",
        "Controller : @RequestParam(defaultValue=\"\") String q, @RequestParam(defaultValue=\"0\") int page.",
        "PageRequest.of(page, 10)."
      ],
      solution: `// repository
Page<Jeu> findByTitreContainingIgnoreCase(String q, Pageable p);

// controller
@GetMapping("/catalogue")
public String catalogue(@RequestParam(defaultValue = "") String q,
                        @RequestParam(defaultValue = "0") int page,
                        Model model) {
  Page<Jeu> resultat = jeux.findByTitreContainingIgnoreCase(q, PageRequest.of(page, 10));
  model.addAttribute("page", resultat);
  return "catalogue";
}`,
      note: "Spring Data gère la pagination nativement avec Pageable et Page : on ne charge que 10 jeux à la fois (rappelle le LIMIT/OFFSET de MySQL). La recherche par titre réutilise une requête dérivée. L'UI reste rapide même avec un gros catalogue."
    },
    16: {
      titre: "les espaces client, vendeur et administrateur",
      etat: "Tout le monde voit le même catalogue. On construit les trois espaces selon le rôle.",
      objectif: "Crée trois pages protégées : /client (mes locations/achats), /vendeur (gérer les stocks), /admin (gérer les utilisateurs). Chaque route est réservée au bon rôle.",
      hints: [
        "Sécurise par URL : requestMatchers(\"/admin/**\").hasRole(\"ADMINISTRATEUR\"), etc.",
        "L'espace client lit les locations/achats de l'utilisateur connecté (Authentication).",
        "L'espace vendeur réutilise ajouterStockLocation / ajouterStockVente."
      ],
      solution: `http.authorizeHttpRequests(a -> a
    .requestMatchers("/admin/**").hasRole("ADMINISTRATEUR")
    .requestMatchers("/vendeur/**").hasAnyRole("VENDEUR","ADMINISTRATEUR")
    .requestMatchers("/client/**").authenticated()
    .requestMatchers(HttpMethod.GET, "/catalogue", "/api/jeux/**").permitAll()
    .anyRequest().authenticated());

@GetMapping("/client")
public String espaceClient(Authentication auth, Model model) {
  model.addAttribute("locations", locationService.mesLocations(auth.getName()));
  return "client";
}`,
      note: "Les trois profils de la Ludothèque deviennent trois espaces cloisonnés : le client suit ses opérations, le vendeur gère le stock, l'administrateur gère les comptes. La sécurité par URL complète les @PreAuthorize sur les méthodes : défense en profondeur."
    },
    17: {
      titre: "tests unitaires du métier",
      etat: "L'application fonctionne ; il faut prouver qu'elle est correcte. On teste la couche service en isolation.",
      objectif: "Écris un test JUnit qui vérifie que louer() décrémente le stock, et un test qui vérifie qu'une location sur stock nul lève StockInsuffisantException. Mocke le repository avec Mockito.",
      hints: [
        "@ExtendWith(MockitoExtension.class) ; @Mock JeuRepository ; @InjectMocks LocationService.",
        "when(jeux.findById(1L)).thenReturn(Optional.of(jeuAvecStock)).",
        "assertThrows(StockInsuffisantException.class, () -> service.louer(...))."
      ],
      solution: `@ExtendWith(MockitoExtension.class)
class LocationServiceTest {
  @Mock JeuRepository jeux;
  @Mock LocationRepository locations;
  @InjectMocks LocationService service;

  @Test void louer_decremente_le_stock() {
    Jeu j = new Jeu(); j.setStockLocation(2);
    when(jeux.findById(1L)).thenReturn(Optional.of(j));
    service.louer(10L, 1L);
    assertEquals(1, j.getStockLocation());
  }
  @Test void louer_sans_stock_leve_exception() {
    Jeu j = new Jeu(); j.setStockLocation(0);
    when(jeux.findById(1L)).thenReturn(Optional.of(j));
    assertThrows(StockInsuffisantException.class, () -> service.louer(10L, 1L));
  }
}`,
      note: "Les tests unitaires vérifient la logique métier en isolant le service : Mockito simule le repository, sans base réelle. Rapides et ciblés, ils documentent les règles (le stock baisse, l'erreur est levée) et protègent contre les régressions."
    },
    18: {
      titre: "tests d'intégration de l'API",
      etat: "Le métier est testé unitairement. On vérifie maintenant la chaîne complète, base comprise.",
      objectif: "Écris un test d'intégration (@SpringBootTest + MockMvc) qui appelle GET /api/jeux et vérifie le statut 200 et la présence d'un jeu, en s'appuyant sur une base de test (H2 ou MySQL de test).",
      hints: [
        "@SpringBootTest @AutoConfigureMockMvc.",
        "mockMvc.perform(get(\"/api/jeux\")).andExpect(status().isOk()).",
        "Précharge des données de test (script SQL ou @Sql)."
      ],
      solution: `@SpringBootTest
@AutoConfigureMockMvc
class JeuApiIT {
  @Autowired MockMvc mvc;

  @Test
  @Sql("/data-test.sql")
  void liste_les_jeux() throws Exception {
    mvc.perform(get("/api/jeux"))
       .andExpect(status().isOk())
       .andExpect(jsonPath("$[0].titre").exists());
  }
}`,
      note: "Le test d'intégration traverse toutes les couches (controller → service → repository → base de test) : il valide l'assemblage réel, là où le test unitaire isolait une brique. Les deux niveaux se complètent — pyramide des tests."
    },
    19: {
      titre: "qualité : logs, performance, secrets",
      etat: "L'application marche et est testée. On la rend prête pour de vrais utilisateurs.",
      objectif: "Applique trois réflexes de production : journaliser les opérations métier (louer/acheter), éviter le problème N+1 sur le catalogue (jointure de chargement), et sortir tous les secrets du code (variables d'environnement).",
      hints: [
        "Un Logger SLF4J : log.info(\"Location jeu={} client={}\", ...).",
        "N+1 : @EntityGraph ou une requête fetch join pour charger categorie avec le jeu.",
        "Secrets : \${DB_PASSWORD} dans application.properties, jamais de mot de passe en dur."
      ],
      solution: `private static final Logger log = LoggerFactory.getLogger(LocationService.class);
log.info("Location enregistrée jeu={} client={}", idJeu, idClient);

// éviter le N+1 : charger la catégorie avec le jeu
@EntityGraph(attributePaths = "categorie")
List<Jeu> findByStockLocationGreaterThan(int n);

# application.properties (aucun secret en dur)
spring.datasource.password=\${DB_PASSWORD}`,
      note: "Trois réflexes de production : les logs tracent ce qui se passe (audit, débogage), le fetch join supprime le N+1 (une requête au lieu de N, comme vu en MySQL), et les secrets vivent hors du code. C'est ce qui distingue un exercice d'une application déployable."
    },
    20: {
      titre: "le déploiement",
      etat: "L'application est prête. On la construit et on la met en ligne.",
      objectif: "Prépare le déploiement : construire un jar exécutable (mvn package), le lancer avec un profil de production et des variables d'environnement (base, secrets), en désactivant les traces SQL et le ddl-auto.",
      hints: [
        "mvn clean package -> target/ludotheque.jar.",
        "java -jar ludotheque.jar avec SPRING_PROFILES_ACTIVE=prod.",
        "application-prod.properties : show-sql=false, ddl-auto=validate, secrets par variables d'env."
      ],
      solution: `# build
mvn clean package
# -> target/ludotheque-0.0.1.jar

# lancement en production
export DB_USER=ludo DB_PASSWORD=secret
export SPRING_PROFILES_ACTIVE=prod
java -jar target/ludotheque-0.0.1.jar

# application-prod.properties
spring.jpa.show-sql=false
spring.jpa.hibernate.ddl-auto=validate
spring.datasource.url=jdbc:mysql://db-prod:3306/ludotheque`,
      note: "Spring Boot produit un jar autonome (serveur inclus) : un seul artefact à déployer. Le profil prod bascule les réglages sûrs (pas de SQL en clair, schéma validé) et les secrets viennent de l'environnement. L'application est en ligne — la Ludothèque existe pour de vrai."
    },
    21: {
      titre: "🎓 l'application assemblée",
      etat: "Épreuve finale : relier mentalement toutes les couches en un flux unique.",
      objectif: "Décris le trajet complet d'une location, du clic de l'utilisateur à la base : quelles couches sont traversées, dans quel ordre, et quel mécanisme garantit la cohérence. Cite le langage, le framework et la base à chaque étape.",
      hints: [
        "Navigateur -> Controller (Spring MVC) -> Service (@Transactional) -> Repository (JPA) -> MySQL (InnoDB).",
        "La sécurité s'applique avant le controller (filtre) ; la transaction entoure le service.",
        "Nomme le rôle requis, la règle métier (stock), et la garantie ACID."
      ],
      solution: `1. L'utilisateur (rôle CLIENT, authentifié par Spring Security) clique « Louer ».
2. Le filtre de sécurité vérifie l'identité et le rôle, puis passe au Controller.
3. Le Controller (Spring MVC) appelle LocationService.louer(client, jeu).
4. Le Service, @Transactional, vérifie le stock (règle métier),
   enregistre la Location et décrémente stockLocation.
5. Le Repository (Spring Data JPA) traduit en SQL et écrit dans MySQL (InnoDB).
6. La transaction COMMIT : location + stock à jour, ou ROLLBACK si erreur (ACID).
7. Le Controller renvoie la vue/JSON ; l'utilisateur voit sa location confirmée.

Java (le langage) · Spring (le framework, chaque couche) · MySQL (la base) :
les trois briques de la formation, enfin assemblées en une seule application.`,
      note: "Ce trajet résume tout le projet : sécurité, couches, transaction, persistance. Langage, framework et base ne sont plus des cours séparés mais une application unique et cohérente. Tu sais désormais construire un logiciel complet de bout en bout."
    }
  }
};
