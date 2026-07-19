/* ===== Fil rouge « La Ludothèque » — cours Spring Boot (21 étapes) =====
   Même application que dans tous les cours, en version API/WEB (Java / Spring).
   Ludothèque de jeux de société : catalogue, 3 rôles (client, vendeur,
   administrateur), achat ET location. Architecture en couches, API REST. */
var FIL = {
  prefix: "spring21",
  app: "La Ludothèque",
  placeholder: "Écris ton code Spring ici…",
  etapes: {
    1: {
      titre: "le projet et le premier endpoint",
      etat: "Rien n'existe. On crée le projet Spring Boot et un premier point d'entrée qui présente la ludothèque.",
      objectif: "Crée le projet (Spring Initializr : Web) et un contrôleur avec un GET « / » qui renvoie « Bienvenue à la Ludothèque ».",
      hints: [
        "@RestController sur la classe, @GetMapping(\"/\") sur la méthode.",
        "La classe principale porte @SpringBootApplication."
      ],
      solution: `@SpringBootApplication
public class LudothequeApplication {
    public static void main(String[] args) {
        SpringApplication.run(LudothequeApplication.class, args);
    }
}

@RestController
class AccueilController {
    @GetMapping("/")
    public String accueil() {
        return "Bienvenue à la Ludothèque — achat & location de jeux";
    }
}`,
      note: "Spring Boot démarre un serveur web intégré. @RestController + @GetMapping exposent une URL. Comparé à Django/Laravel, Spring est d'abord orienté API JSON."
    },
    2: {
      titre: "l'injection de dépendances",
      etat: "Posons dès maintenant la bonne pratique de Spring : ne pas créer ses objets soi-même, les faire injecter.",
      objectif: "Crée un CatalogueService (bean) et fais-le injecter dans le contrôleur par le constructeur, plutôt que de l'instancier avec new.",
      hints: [
        "@Service sur CatalogueService.",
        "Le contrôleur reçoit le service dans son constructeur : Spring l'injecte."
      ],
      solution: `@Service
class CatalogueService {
    public String message() { return "Catalogue pret"; }
}

@RestController
class CatalogueController {
    private final CatalogueService service;
    // Spring injecte automatiquement le bean :
    CatalogueController(CatalogueService service) {
        this.service = service;
    }
    @GetMapping("/etat")
    public String etat() { return service.message(); }
}`,
      note: "L'inversion de contrôle : c'est Spring qui crée et fournit les objets (beans). L'injection par constructeur rend le code testable et découplé. Pas d'équivalent direct côté Django/Laravel (plus implicite)."
    },
    3: {
      titre: "un service qui fournit le catalogue",
      etat: "Faisons du service la source des jeux (en dur pour l'instant).",
      objectif: "Dans CatalogueService, renvoie une liste de jeux (record Jeu avec nom, prix, stock). Le contrôleur l'expose.",
      hints: [
        "record Jeu(String nom, double prix, int stock) {}",
        "List.of(new Jeu(\"Catan\", 44.9, 3), ...)"
      ],
      solution: `record Jeu(String nom, double prix, int stock) {}

@Service
class CatalogueService {
    List<Jeu> tous() {
        return List.of(
            new Jeu("Catan", 44.9, 3),
            new Jeu("Azul", 39.9, 5)
        );
    }
}`,
      note: "Le service porte la logique métier ; le contrôleur ne fait que l'exposer. Le record Java (immuable) est parfait pour un DTO. Bientôt, ces jeux viendront de la base."
    },
    4: {
      titre: "l'API REST du catalogue",
      etat: "Exposons le catalogue en JSON.",
      objectif: "Crée un @RestController avec GET /jeux qui renvoie la liste des jeux : Spring la sérialise automatiquement en JSON.",
      hints: [
        "@GetMapping(\"/jeux\") public List<Jeu> liste() { return service.tous(); }",
        "Un objet Java renvoyé devient du JSON via Jackson."
      ],
      solution: `@RestController
@RequestMapping("/jeux")
class JeuController {
    private final CatalogueService service;
    JeuController(CatalogueService service) { this.service = service; }

    @GetMapping
    public List<Jeu> liste() {
        return service.tous();   // -> [{"nom":"Catan","prix":44.9,"stock":3}, ...]
    }
}`,
      note: "Retourner une liste d'objets produit automatiquement du JSON. @RequestMapping(\"/jeux\") préfixe toutes les routes du contrôleur. Django fait ça avec DRF, Laravel en renvoyant un modèle."
    },
    5: {
      titre: "détail et recherche",
      etat: "Ajoutons l'accès à un jeu précis et la recherche.",
      objectif: "Ajoute GET /jeux/{id} avec @PathVariable, et une recherche GET /jeux?q=... avec @RequestParam (optionnel).",
      hints: [
        "@GetMapping(\"/{id}\") public Jeu detail(@PathVariable int id) {...}",
        "@RequestParam(required = false) String q"
      ],
      solution: `@GetMapping("/{id}")
public Jeu detail(@PathVariable int id) {
    return service.tous().get(id - 1);
}

@GetMapping(params = "q")
public List<Jeu> rechercher(@RequestParam String q) {
    return service.tous().stream()
        .filter(j -> j.nom().toLowerCase().contains(q.toLowerCase()))
        .toList();
}`,
      note: "@PathVariable lit un segment d'URL (/jeux/2), @RequestParam lit la query string (?q=cat). Django utilise <int:id> et request.GET, Laravel {id} et $request->query."
    },
    6: {
      titre: "créer un jeu (POST + JSON)",
      etat: "Rendons l'API capable de recevoir des données.",
      objectif: "Ajoute POST /jeux qui reçoit un jeu en JSON via @RequestBody et le renvoie (création simulée pour l'instant).",
      hints: [
        "@PostMapping public Jeu creer(@RequestBody Jeu jeu) { ... }",
        "Le corps JSON est désérialisé en objet Jeu automatiquement."
      ],
      solution: `@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public Jeu creer(@RequestBody Jeu jeu) {
    // ici on se contente de le renvoyer ; la persistance vient a la lecon 9
    return jeu;
}
// POST /jeux  { "nom": "7 Wonders", "prix": 49.9, "stock": 4 }`,
      note: "@RequestBody transforme le JSON reçu en objet Java (Jackson). @ResponseStatus(CREATED) renvoie 201. C'est le pendant du model binding (.NET) et de $request (Laravel)."
    },
    7: {
      titre: "l'architecture en couches",
      etat: "Structurons proprement : contrôleur, service, et bientôt repository.",
      objectif: "Sépare les responsabilités : le contrôleur (HTTP) délègue au service (métier), qui déléguera au repository (données). Prépare une entité Jeu.",
      hints: [
        "Controller -> Service -> Repository : chaque couche a un rôle.",
        "L'entité Jeu deviendra @Entity à la leçon 8."
      ],
      solution: `// Couche web : JeuController (@RestController) -> appelle le service
// Couche métier : CatalogueService (@Service) -> logique, appelle le repo
// Couche données : JeuRepository (a venir) -> accès base

// Le contrôleur ne connaît QUE le service ; le service ne connaît QUE le repo.
// Cette séparation rend chaque couche testable et remplaçable.`,
      note: "L'architecture en couches (web / métier / données) isole les responsabilités. C'est le MVC/MVT poussé plus loin, très typique de Spring et de .NET."
    },
    8: {
      titre: "l'entité Jeu (JPA)",
      etat: "Passons aux vraies données : transformons Jeu en entité persistée.",
      objectif: "Fais de Jeu une entité JPA (@Entity, @Id auto-généré, champs nom, prixAchat, prixLocation, stock).",
      hints: [
        "@Entity class Jeu { @Id @GeneratedValue Long id; ... }",
        "Configure une base (H2 en dev) dans application.properties."
      ],
      solution: `@Entity
public class Jeu {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private double prixAchat;
    private double prixLocation;
    private int stock;
    // getters / setters (ou Lombok)
}`,
      note: "@Entity mappe la classe sur une table, @Id + @GeneratedValue gèrent la clé primaire. JPA/Hibernate crée la table. C'est l'ORM de Spring, comme les modèles Django/Eloquent."
    },
    9: {
      titre: "le CRUD sans SQL (JpaRepository)",
      etat: "Manipulons les jeux en base sans écrire de SQL.",
      objectif: "Crée un JeuRepository qui étend JpaRepository, et utilise-le dans le service pour lister, créer et supprimer des jeux.",
      hints: [
        "interface JeuRepository extends JpaRepository<Jeu, Long> {}",
        "repo.findAll(), repo.save(jeu), repo.deleteById(id)"
      ],
      solution: `public interface JeuRepository extends JpaRepository<Jeu, Long> {}

@Service
class CatalogueService {
    private final JeuRepository repo;
    CatalogueService(JeuRepository repo) { this.repo = repo; }

    public List<Jeu> tous()      { return repo.findAll(); }
    public Jeu ajouter(Jeu jeu)  { return repo.save(jeu); }
    public void supprimer(Long id){ repo.deleteById(id); }
}`,
      note: "JpaRepository fournit findAll/save/deleteById sans une ligne de SQL. Juste une interface ! Django : Model.objects ; Laravel : Eloquent ; .NET : DbContext."
    },
    10: {
      titre: "requêtes dérivées et @Query",
      etat: "Ajoutons recherche, filtre « en stock » et tri.",
      objectif: "Dans le repository, déclare des requêtes dérivées : jeux en stock, recherche par nom, tri par prix. Ajoute une @Query si besoin.",
      hints: [
        "List<Jeu> findByStockGreaterThan(int min);",
        "findByNomContainingIgnoreCaseOrderByPrixLocationAsc(String nom);"
      ],
      solution: `public interface JeuRepository extends JpaRepository<Jeu, Long> {
    List<Jeu> findByStockGreaterThan(int min);
    List<Jeu> findByNomContainingIgnoreCase(String nom);

    @Query("SELECT j FROM Jeu j WHERE j.stock > 0 ORDER BY j.prixLocation")
    List<Jeu> disponiblesTriesParPrix();
}`,
      note: "Spring Data DÉDUIT la requête du nom de la méthode (findByStockGreaterThan). Pour les cas complexes, @Query en JPQL. Django utilise filter(stock__gt=0), Laravel where('stock','>',0)."
    },
    11: {
      titre: "relations entre entités",
      etat: "Le cœur métier : relions jeux, clients et transactions.",
      objectif: "Ajoute une entité Categorie (@ManyToOne depuis Jeu), une entité Utilisateur (avec rôle) et une entité Transaction (@ManyToOne vers Jeu et Utilisateur, type achat/location).",
      hints: [
        "@ManyToOne private Categorie categorie;",
        "@OneToMany(mappedBy = \"jeu\") private List<Transaction> transactions;"
      ],
      solution: `@Entity
public class Transaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne private Jeu jeu;
    @ManyToOne private Utilisateur client;
    @Enumerated(EnumType.STRING) private TypeOperation type;  // ACHAT / LOCATION
    private double montant;
    private LocalDateTime date;
}
enum TypeOperation { ACHAT, LOCATION }`,
      note: "@ManyToOne / @OneToMany déclarent les relations : une transaction pointe vers un jeu et un client. Hibernate gère les jointures. Django : ForeignKey ; Laravel : belongsTo/hasMany."
    },
    12: {
      titre: "valider les données",
      etat: "Encadrons la création d'un jeu par une validation.",
      objectif: "Ajoute des contraintes Bean Validation sur les champs (nom non vide, prix positifs, stock >= 0) et valide le corps reçu avec @Valid.",
      hints: [
        "@NotBlank private String nom; @Positive private double prixLocation;",
        "public Jeu creer(@Valid @RequestBody Jeu jeu) { ... }"
      ],
      solution: `public class JeuDto {
    @NotBlank private String nom;
    @PositiveOrZero private double prixAchat;
    @Positive private double prixLocation;
    @PositiveOrZero private int stock;
    // getters/setters
}

@PostMapping
public Jeu creer(@Valid @RequestBody JeuDto dto) {
    return service.ajouter(dto);   // si invalide -> 400 automatiquement
}`,
      note: "Bean Validation (@NotBlank, @Positive) + @Valid rejettent les données invalides avec un 400. C'est l'équivalent de $request->validate (Laravel) et des ModelForm (Django)."
    },
    13: {
      titre: "gérer les erreurs proprement",
      etat: "Louer un jeu en rupture ou demander un id inexistant doit renvoyer une erreur claire.",
      objectif: "Crée une exception métier (ex. StockInsuffisantException) et un @ControllerAdvice qui la transforme en réponse HTTP propre (409/404).",
      hints: [
        "@ResponseStatus(HttpStatus.CONFLICT) class StockInsuffisantException extends RuntimeException {}",
        "@ExceptionHandler dans une classe @ControllerAdvice."
      ],
      solution: `class JeuIntrouvableException extends RuntimeException {
    JeuIntrouvableException(Long id) { super("Jeu " + id + " introuvable"); }
}

@RestControllerAdvice
class GestionErreurs {
    @ExceptionHandler(JeuIntrouvableException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> introuvable(JeuIntrouvableException e) {
        return Map.of("erreur", e.getMessage());
    }
}`,
      note: "@RestControllerAdvice centralise la gestion des erreurs : chaque exception métier devient une réponse HTTP cohérente. Django a les middlewares/handlers, .NET les middlewares d'exception."
    },
    14: {
      titre: "configuration et profils",
      etat: "Séparons la configuration du code, avec un réglage par environnement.",
      objectif: "Externalise la config dans application.properties, injecte une valeur avec @Value, et prévois des profils dev/prod (application-dev.properties).",
      hints: [
        "application.properties : app.nom=Ludotheque",
        "@Value injecte une propriété ; SPRING_PROFILES_ACTIVE choisit le profil."
      ],
      solution: `# application.properties
app.nom=La Ludotheque
spring.datasource.url=\${DB_URL:jdbc:h2:mem:ludo}

// injection d'une propriete
@Value("\${app.nom}")
private String nomAppli;

// profils : application-dev.properties / application-prod.properties
// activation : SPRING_PROFILES_ACTIVE=prod`,
      note: "Les propriétés externes séparent config et code ; @Value(\"\\${...}\") injecte une valeur ; les profils adaptent dev/prod. Secrets via variables d'environnement. Django : os.environ ; .NET : appsettings."
    },
    15: {
      titre: "tester l'API (MockMvc)",
      etat: "Sécurisons les évolutions avec des tests automatiques.",
      objectif: "Écris un test MockMvc : GET /jeux répond 200 et le JSON contient un jeu attendu.",
      hints: [
        "@SpringBootTest @AutoConfigureMockMvc ; @Autowired MockMvc mvc;",
        "mvc.perform(get(\"/jeux\")).andExpect(status().isOk());"
      ],
      solution: `@SpringBootTest
@AutoConfigureMockMvc
class JeuControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void listeRepond200() throws Exception {
        mvc.perform(get("/jeux"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$[0].nom").exists());
    }
}`,
      note: "MockMvc simule des requêtes HTTP sans lancer un vrai serveur, et vérifie statut et JSON. C'est l'équivalent de self.client (Django) et des tests Laravel."
    },
    16: {
      titre: "protéger l'API (Spring Security)",
      etat: "La ludothèque devient sécurisée : protégeons les endpoints.",
      objectif: "Ajoute Spring Security : le catalogue en lecture est public, mais la création/modification exige d'être authentifié.",
      hints: [
        "SecurityFilterChain avec authorizeHttpRequests.",
        "permitAll() sur GET /jeux ; authenticated() sur le reste."
      ],
      solution: `@Configuration
class SecurityConfig {
    @Bean
    SecurityFilterChain filtre(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(a -> a
                .requestMatchers(HttpMethod.GET, "/jeux/**").permitAll()
                .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }
}`,
      note: "Spring Security filtre chaque requête selon des règles. Le hachage des mots de passe (BCrypt) est fourni. Django : contrib.auth ; Laravel : Breeze/Sanctum ; .NET : Identity/JWT."
    },
    17: {
      titre: "les 3 rôles et leurs droits",
      etat: "Client, vendeur, administrateur n'ont pas les mêmes droits.",
      objectif: "Attribue des rôles (CLIENT, VENDEUR, ADMIN) et restreins des endpoints : gérer le stock au VENDEUR/ADMIN, les statistiques à l'ADMIN, avec @PreAuthorize.",
      hints: [
        "@EnableMethodSecurity pour activer @PreAuthorize.",
        "@PreAuthorize(\"hasRole('VENDEUR')\") sur la méthode."
      ],
      solution: `@PostMapping("/{id}/stock")
@PreAuthorize("hasAnyRole('VENDEUR','ADMIN')")
public Jeu majStock(@PathVariable Long id, @RequestParam int stock) {
    return service.majStock(id, stock);
}

@GetMapping("/admin/stats")
@PreAuthorize("hasRole('ADMIN')")
public Map<String, Object> stats() { return service.stats(); }`,
      note: "@PreAuthorize vérifie le rôle AVANT d'exécuter la méthode. Authentification (qui ?) puis autorisation (quel droit ?). Django : vérifier le rôle + 403 ; Laravel : middleware/Gate."
    },
    18: {
      titre: "une page HTML (Thymeleaf)",
      etat: "En plus de l'API JSON, offrons une vraie page web du catalogue.",
      objectif: "Avec Thymeleaf, crée un contrôleur MVC qui rend une page listant les jeux (th:each), à partir des données du service.",
      hints: [
        "@Controller (pas @RestController) + model.addAttribute(\"jeux\", ...).",
        "Dans le template : th:each=\"jeu : ${jeux}\"."
      ],
      solution: `@Controller
class CataloguePageController {
    private final CatalogueService service;
    CataloguePageController(CatalogueService s) { this.service = s; }

    @GetMapping("/catalogue")
    public String page(Model model) {
        model.addAttribute("jeux", service.tous());
        return "catalogue";   // templates/catalogue.html
    }
}
<!-- <li th:each="jeu : \${jeux}" th:text="\${jeu.nom}"></li> -->`,
      note: "@Controller + Thymeleaf rendent du HTML côté serveur (th:each pour boucler). C'est le pendant des templates DTL (Django), Blade (Laravel) et Razor (.NET)."
    },
    19: {
      titre: "supervision et logs (Actuator)",
      etat: "Rendons l'application observable et traçable.",
      objectif: "Active Spring Boot Actuator (endpoints /actuator/health) et journalise chaque location avec un Logger.",
      hints: [
        "Dépendance spring-boot-starter-actuator ; exposer health/info.",
        "private static final Logger log = LoggerFactory.getLogger(...);"
      ],
      solution: `// application.properties
// management.endpoints.web.exposure.include=health,info,metrics

@Service
class LocationService {
    private static final Logger log = LoggerFactory.getLogger(LocationService.class);

    public void louer(Long jeuId) {
        log.info("Location du jeu {}", jeuId);
        // ... logique ...
    }
}`,
      note: "Actuator expose l'état de l'app (santé, métriques) pour la supervision. Le Logger trace les événements clés. Django : logging ; Laravel : Log ; .NET : ILogger + health checks."
    },
    20: {
      titre: "🏁 assembler la Ludothèque",
      etat: "Toutes les briques existent : réunissons-les en une API cohérente.",
      objectif: "Assemble l'endpoint de location : vérifie le stock, crée la Transaction et décrémente le stock, le tout dans une méthode @Transactional, réservée aux utilisateurs connectés.",
      hints: [
        "@Transactional sur la méthode du service.",
        "Réutilise les entités (leçon 11) et la sécurité (leçon 16)."
      ],
      solution: `@Service
class LocationService {
    private final JeuRepository jeux;
    private final TransactionRepository transactions;
    LocationService(JeuRepository j, TransactionRepository t) { jeux = j; transactions = t; }

    @Transactional
    public Transaction louer(Long jeuId, Utilisateur client) {
        Jeu jeu = jeux.findById(jeuId)
            .orElseThrow(() -> new JeuIntrouvableException(jeuId));
        if (jeu.getStock() <= 0) throw new StockInsuffisantException();
        jeu.setStock(jeu.getStock() - 1);

        Transaction t = new Transaction(jeu, client, TypeOperation.LOCATION, jeu.getPrixLocation());
        return transactions.save(t);
    }
}`,
      note: "Une API complète : contrôleurs, services, repositories, entités, validation, sécurité et rôles. @Transactional garantit que stock et Transaction changent ensemble ou pas du tout."
    },
    21: {
      titre: "🎓 étendre l'application",
      etat: "Épreuve finale : ajoute une fonctionnalité de bout en bout.",
      objectif: "Ajoute un endpoint de statistiques administrateur : nombre de transactions et chiffre d'affaires total (agrégation JPQL), réservé au rôle ADMIN.",
      hints: [
        "@Query(\"SELECT COUNT(t), COALESCE(SUM(t.montant),0) FROM Transaction t\")",
        "@PreAuthorize(\"hasRole('ADMIN')\") sur l'endpoint."
      ],
      solution: `public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query("SELECT COUNT(t), COALESCE(SUM(t.montant), 0) FROM Transaction t")
    Object[] statistiques();
}

@GetMapping("/admin/stats")
@PreAuthorize("hasRole('ADMIN')")
public Map<String, Object> stats() {
    Object[] r = (Object[]) repo.statistiques()[0];
    return Map.of("transactions", r[0], "chiffreAffaires", r[1]);
}`,
      note: "Tu réunis JPA (agrégation), sécurité et rôles : la synthèse du cours. Compare cet endpoint à sa version Django, Laravel et .NET — même app, quatre frameworks."
    }
  }
};
