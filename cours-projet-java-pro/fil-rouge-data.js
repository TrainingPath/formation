/* ===== Fil rouge « La Ludothèque pro » — Niveau 8, projet full-stack outillé (Java · Spring Boot) =====
   On reconstruit la Ludothèque comme en entreprise : conteneurisée dès le
   premier jour, testée et livrée par un pipeline CI/CD, sécurisée par conception.
   Chaque étape mène de front la construction (métier), l'industrialisation
   (Docker/CI/CD) et la sécurité — jamais l'une sans les autres.
   Prérequis : capstone Java·Spring (N4) + Docker, CI/CD, Sécurité (N5). */
var FIL = {
  prefix: "proj6java21",
  app: "La Ludothèque pro",
  placeholder: "Écris ton code / ta config / ta commande ici…",
  etapes: {
    1: {
      titre: "le cadrage professionnel",
      etat: "Feuille blanche — mais cette fois on part avec les réflexes d'une équipe : un dépôt propre, un environnement conteneurisé, une définition de « prêt ».",
      objectif: "Pose les fondations pro : l'arborescence (projet Maven multi-couches, Dockerfile, compose, .github/workflows, application.yml hors secrets), la definition of done (code + tests + Spotless + image qui build), et le flux Git (branches courtes, PR, main protégée).",
      hints: [
        "Le projet Spring Boot, mais aussi : Dockerfile, compose.yaml, .github/workflows/ci.yml, .gitignore, .dockerignore.",
        "Definition of Done : une fonctionnalité n'est « faite » que testée, formatée (Spotless), et l'image build.",
        "GitHub Flow : main déployable, une branche par changement, PR obligatoire (cours CI/CD)."
      ],
      solution: `src/main/java/fr/ludo/       code : entity, repository, service, web, config
src/main/resources/          application.yml, db/migration (Flyway), templates
src/test/java/fr/ludo/       tests unitaires + intégration
pom.xml                      dépendances + plugins (spotless, jacoco, spring-boot)
Dockerfile                   image de l'app (multi-stage : build JAR puis runtime)
compose.yaml                 app + MySQL, réseau, volume (dev)
.github/workflows/ci.yml     tests + Spotless + build à chaque commit
.gitignore .dockerignore     target/, *.env, application-local.yml

# Definition of Done (contrat d'équipe)
#  fonctionnalité = code + tests verts + Spotless OK + image qui build + PR relue
# Flux : branche courte -> commits normés -> PR -> CI verte -> merge sur main`,
      note: "La différence avec le Niveau 6 tient en une phrase : on n'ajoute pas les outils à la fin, on les pose AVANT d'écrire la première ligne métier. Le dépôt, le Compose, le pipeline Maven et la règle « rien n'entre dans main sans CI verte » existent dès le jour 1 — tout le reste s'y coule."
    },
    2: {
      titre: "le squelette dans Docker Compose",
      etat: "L'architecture est posée. On crée le projet Spring Boot et sa base MySQL directement en conteneurs — aucune installation sur la machine.",
      objectif: "Crée le projet Spring Boot (Spring Initializr : Web, JPA, MySQL, Validation, Actuator) et lance-le via Docker Compose (service app + service MySQL, healthcheck, volume). L'app lit sa config depuis l'environnement. Vérifie /actuator/health dans le conteneur.",
      hints: [
        "compose.yaml : app (build .), bdd (mysql:8.4, healthcheck), volume donnees-mysql.",
        "app dépend de bdd (condition: service_healthy) ; SPRING_DATASOURCE_URL=jdbc:mysql://bdd:3306/ludotheque.",
        "docker compose up -d && curl localhost:8080/actuator/health -> {\"status\":\"UP\"}"
      ],
      solution: `# compose.yaml (dev)
services:
  app:
    build: .
    ports: ["8080:8080"]
    env_file: .env.docker
    depends_on:
      bdd: { condition: service_healthy }
  bdd:
    image: mysql:8.4
    environment:
      MYSQL_DATABASE: ludotheque
      MYSQL_USER: ludo_app
      MYSQL_PASSWORD: \${MYSQL_PASSWORD}
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}
    volumes: ["donnees-mysql:/var/lib/mysql"]
    healthcheck:
      test: ["CMD","mysqladmin","ping","-h","localhost"]
      interval: 5s
      retries: 10
volumes: { donnees-mysql: {} }

# $ docker compose up -d
# $ curl localhost:8080/actuator/health   -> {"status":"UP"}`,
      note: "Personne n'installe le JDK ni MySQL sur son poste : `docker compose up` suffit, et tout le monde a le même environnement (cours Docker). L'hôte `bdd` fonctionne grâce au DNS interne du réseau Compose ; le healthcheck fait attendre l'app que MySQL soit prêt, pas juste démarré."
    },
    3: {
      titre: "le pipeline dès le premier commit",
      etat: "Le projet tourne en local. Avant d'écrire du métier, on met en place le garde-fou : Git propre et une CI qui vérifie chaque commit.",
      objectif: "Initialise le dépôt (commits normés, .gitignore), pousse sur GitHub, et écris .github/workflows/ci.yml : sur push/PR, un job qui installe le JDK, lance `mvn -B verify` et Spotless. Configure la protection de main (PR + CI verte).",
      hints: [
        "Messages normés : feat:, fix:, chore: (cours CI/CD leçon 1).",
        "ci.yml : actions/checkout, setup-java (temurin 21, cache maven), mvn -B verify.",
        "Settings → Branches : require PR + status checks avant merge."
      ],
      solution: `# .github/workflows/ci.yml
name: CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
jobs:
  verifier:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: "temurin", java-version: "21", cache: "maven" }
      - run: mvn -B spotless:check
      - run: mvn -B -DskipITs verify

# Git : git init ; commits "feat: squelette Spring Boot + Compose"
# GitHub : protection de main (PR obligatoire + CI verte, cours CI/CD l.14)`,
      note: "Le pipeline existe AVANT le métier : ainsi, dès la première fonctionnalité, elle naît sous surveillance. C'est l'inverse du Niveau 6 où l'on testait « quand on y pensait ». Ici, un commit qui casse `mvn verify` ou Spotless est rouge immédiatement, et ne peut pas entrer dans main."
    },
    4: {
      titre: "le schéma, versionné et migré en conteneur",
      etat: "L'usine tourne à vide. On y coule la première brique : le schéma de la Ludothèque, issu du MCD Merise.",
      objectif: "Écris la première migration Flyway (V1__init.sql : categorie, jeu avec deux stocks, prix en DECIMAL, clés étrangères), désactive ddl-auto (validate only), et applique-la DANS le conteneur au démarrage. La CI rejoue les migrations sur une base neuve.",
      hints: [
        "Flyway : src/main/resources/db/migration/V1__init.sql ; spring.jpa.hibernate.ddl-auto=validate.",
        "DECIMAL(6,2) pour l'argent, INT UNSIGNED pour les stocks, FK ON DELETE RESTRICT.",
        "Le job de tests de la CI (leçon 6) partira d'une base vierge : les migrations doivent rejouer de zéro."
      ],
      solution: `-- src/main/resources/db/migration/V1__init.sql
CREATE TABLE categorie (
  id   BIGINT PRIMARY KEY AUTO_INCREMENT,
  nom  VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE jeu (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  titre          VARCHAR(200) NOT NULL,
  prix_achat     DECIMAL(6,2) NOT NULL,
  prix_location  DECIMAL(6,2) NOT NULL,
  stock_vente    INT NOT NULL DEFAULT 0,
  stock_location INT NOT NULL DEFAULT 0,
  categorie_id   BIGINT NOT NULL,
  CONSTRAINT fk_jeu_cat FOREIGN KEY (categorie_id) REFERENCES categorie(id),
  INDEX idx_jeu_titre (titre)        -- recherche fréquente, anticipée
);
# application.yml : spring.jpa.hibernate.ddl-auto: validate  (Flyway fait foi)`,
      note: "Le schéma vient de Merise, comme au Niveau 6 — mais ici Flyway le versionne, l'index de recherche est posé DÈS le départ (on sait qu'on paginera), et la migration sera rejouée à chaque commit par la CI sur une base neuve : plus de « ça migre par chance ». `ddl-auto: validate` interdit à Hibernate de modifier le schéma en douce : Flyway est la seule source de vérité."
    },
    5: {
      titre: "les entités, testées dès l'écriture",
      etat: "Le catalogue prend forme. On y ajoute le vocabulaire métier — et son filet de tests, écrit en même temps.",
      objectif: "Écris les entités JPA Categorie et Jeu (BigDecimal, @ManyToOne LAZY), les méthodes métier estLouable()/estAchetable(), une requête dérivée (findByStockLocationGreaterThan), et ÉCRIS les tests de ces règles dans la foulée. La CI exécute ces tests avec un service MySQL.",
      hints: [
        "estLouable() { return stockLocation > 0; } — une règle, un endroit.",
        "Test JUnit : new Jeu(...stockLocation=0).estLouable() == false ; test @DataJpaTest du repository.",
        "Le job de tests CI a un service mysql:8.4 (cours CI/CD leçon 10)."
      ],
      solution: `@Entity
public class Jeu {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String titre;
    @Column(nullable = false) private BigDecimal prixLocation;
    private int stockLocation;
    @ManyToOne(fetch = FetchType.LAZY) private Categorie categorie;

    public boolean estLouable()   { return stockLocation > 0; }
    public boolean estAchetable() { return stockVente > 0; }
}

// JeuTest.java — écrit EN MÊME TEMPS que le code
@Test void nonLouableSiStockNul() {
    Jeu j = new Jeu(); j.setStockLocation(0);
    assertThat(j.estLouable()).isFalse();
}
// CI (job tests) : service mysql:8.4 + mvn verify`,
      note: "Au Niveau 6, les tests arrivaient à la semaine 3 ; ici ils naissent avec le code. Écrire la règle et son test dans le même commit change tout : la CI les exécute aussitôt, et une régression future devient rouge à la seconde. C'est le TDD léger d'une équipe qui a intégré que « non testé = non fait ». Le fetch LAZY évite dès maintenant les N+1."
    },
    6: {
      titre: "la couche service sous surveillance",
      etat: "Les données savent se lire. On y ajoute les décisions métier — dans une couche service, testée et lintée par la CI.",
      objectif: "Écris JeuService : jeuxLouables(), verifierStockLocation (exception métier), prixLocation (BigDecimal, 7j + 0,50 €/jour). Couvre chaque règle par un test unitaire rapide (Mockito : repository mocké, sans base).",
      hints: [
        "class StockInsuffisantException extends RuntimeException : vocabulaire métier explicite.",
        "prixLocation(jeu, 10) avec base 5 € = 6,50 € (assertThat BigDecimal, comparez avec compareTo).",
        "Le service se teste avec un @Mock du repository -> en millisecondes, sans MySQL."
      ],
      solution: `@Service
public class JeuService {
    private final JeuRepository repo;
    public JeuService(JeuRepository repo) { this.repo = repo; }

    public void verifierStockLocation(Jeu jeu) {
        if (jeu.getStockLocation() <= 0)
            throw new StockInsuffisantException("Plus de stock pour " + jeu.getTitre());
    }
    public BigDecimal prixLocation(Jeu jeu, int nbJours) {
        BigDecimal base = jeu.getPrixLocation();
        return nbJours <= 7 ? base
             : base.add(BigDecimal.valueOf(nbJours - 7).multiply(new BigDecimal("0.50")));
    }
}
// test rapide (Mockito, sans base)
@Test void tarifProlongation() {
    Jeu j = new Jeu(); j.setPrixLocation(new BigDecimal("5.00"));
    assertThat(service.prixLocation(j, 10)).isEqualByComparingTo("6.50");
}`,
      note: "La couche service en Java pur (N4) prend ici tout son sens : ses tests Mockito tournent en millisecondes, donc la CI reste rapide (< 10 min, condition de son adoption, cours CI/CD). Décisions métier isolées + tests instantanés = un pipeline qui reste vert et véloce à mesure que le projet grossit."
    },
    7: {
      titre: "l'API et le job de tests au vert",
      etat: "Le métier existe et il est testé. On l'ouvre en API — et on ajoute le job de tests complet à la CI, avec MySQL.",
      objectif: "Expose GET /api/jeux (@RestController, un DTO plutôt que l'entité, JOIN FETCH anti-N+1) et écris un test d'intégration (@WebMvcTest ou MockMvc). Complète ci.yml : job tests avec service mysql, `mvn verify`, et fais passer le tout au vert.",
      hints: [
        "JeuDto (record) choisit ce qui sort — pas de champ interne exposé.",
        "Test : mockMvc.perform(get(\"/api/jeux\")).andExpect(status().isOk()).",
        "Job CI tests : services.mysql, env SPRING_DATASOURCE_URL, run mvn -B verify."
      ],
      solution: `public record JeuDto(Long id, String titre, BigDecimal prixLocation, boolean louable) {}

@RestController
@RequestMapping("/api/jeux")
public class JeuController {
    private final JeuRepository repo;
    @GetMapping
    public List<JeuDto> lister() {
        return repo.findAllWithCategorie().stream()      // JOIN FETCH : 1 requête
            .map(j -> new JeuDto(j.getId(), j.getTitre(), j.getPrixLocation(), j.estLouable()))
            .toList();
    }
}
// ci.yml — job tests
  tests:
    services:
      mysql: { image: mysql:8.4, env: {...}, ports: ["3306:3306"], options: --health-cmd=... }
    steps: [ checkout, setup-java, "mvn -B verify" ]`,
      note: "Fin de semaine 1 : l'usine est complète AVANT que l'application ne soit finie. Entités, services et API existent, chacun sous tests, et le pipeline (compile + Spotless + tests avec MySQL) tourne au vert à chaque commit. Le DTO découple l'API du schéma. On peut désormais empiler le métier en confiance — chaque ajout naîtra testé et surveillé."
    },
    8: {
      titre: "valider les entrées, refuser proprement",
      etat: "L'API lit. Avant qu'elle n'écrive, on blinde les entrées et on traduit les erreurs — sécurité et robustesse d'un seul geste.",
      objectif: "Écris la validation (Bean Validation : @NotNull, @Positive, @PositiveOrZero, @Size sur un DTO de requête + @Valid), traduis les exceptions en HTTP via @RestControllerAdvice (400/404/409 sans fuite technique), et ajoute un test par cas d'erreur. Rappelle la règle « toute entrée est hostile ».",
      hints: [
        "@Positive BigDecimal prixLocation, @PositiveOrZero int stock ; liste d'autorisation (cours Sécurité l.11).",
        "@RestControllerAdvice : EntityNotFound -> 404, StockInsuffisant -> 409, MethodArgumentNotValid -> 400. Messages génériques.",
        "Un test par branche d'erreur : la CI les verrouille."
      ],
      solution: `public record JeuForm(
    @NotBlank String titre,
    @NotNull @Positive BigDecimal prixLocation,
    @PositiveOrZero int stockLocation) {}

@PostMapping public JeuDto creer(@Valid @RequestBody JeuForm form) { ... }

@RestControllerAdvice
class GestionErreurs {
  @ExceptionHandler(EntityNotFoundException.class) @ResponseStatus(NOT_FOUND)
  Map<String,String> introuvable() { return Map.of("erreur", "Introuvable"); }

  @ExceptionHandler(StockInsuffisantException.class) @ResponseStatus(CONFLICT)
  Map<String,String> stock(StockInsuffisantException e) { return Map.of("erreur", e.getMessage()); }

  @ExceptionHandler(MethodArgumentNotValidException.class) @ResponseStatus(BAD_REQUEST)
  Map<String,String> invalide() { return Map.of("erreur", "Requête invalide"); }
}`,
      note: "La validation n'est pas qu'une commodité : c'est la première ligne de défense (cours Sécurité). En l'écrivant maintenant, avec @Valid, des messages génériques et une liste d'autorisation, on ferme d'emblée injection et fuite d'information. Le @RestControllerAdvice centralise la traduction ; chaque cas d'erreur a son test — la robustesse devient vérifiable, pas espérée."
    },
    9: {
      titre: "des comptes et une authentification durcie",
      etat: "Le catalogue est public et sûr. On introduit les utilisateurs — avec les bons réflexes de sécurité dès le premier compte.",
      objectif: "Mets en place Spring Security : les trois rôles (ROLE_CLIENT/VENDEUR/ADMIN), l'inscription (mot de passe haché BCrypt/argon2), et durcis : politique de mot de passe (longueur, refus des fuités), cookies de session HttpOnly/Secure/SameSite. Teste inscription et connexion.",
      hints: [
        "SecurityFilterChain + UserDetailsService ; rôles en base (table utilisateur + role).",
        "PasswordEncoder : BCryptPasswordEncoder (ou Argon2PasswordEncoder) — jamais de mot de passe en clair.",
        "server.servlet.session.cookie : http-only, secure, same-site=lax (cours Sécurité l.6)."
      ],
      solution: `@Configuration
public class SecuriteConfig {
    @Bean PasswordEncoder encoder() { return new BCryptPasswordEncoder(12); }

    @Bean SecurityFilterChain chaine(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(a -> a
                .requestMatchers("/api/jeux", "/", "/catalogue").permitAll()
                .anyRequest().authenticated())
            .formLogin(Customizer.withDefaults());
        return http.build();
    }
}
# application.yml
server.servlet.session.cookie: { http-only: true, secure: true, same-site: lax }

// inscription : encoder.encode(mdp) ; refus si longueur < 12 ou mot de passe courant`,
      note: "Au Niveau 6, la sécurité des sessions arrivait en fin de parcours et le hachage était fait « à la main ». Ici, dès le premier utilisateur : BCrypt (facteur 12), politique NIST, cookies durcis via Spring Security. Sécuriser au moment où l'on crée la fonctionnalité coûte quelques lignes ; le faire après coup coûte un audit. C'est tout l'intérêt du « par conception »."
    },
    10: {
      titre: "l'autorisation, par rôle ET par ressource",
      etat: "On sait QUI est connecté. On décide QUI accède à QUOI — sans jamais laisser passer un IDOR.",
      objectif: "Applique l'autorisation : par rôle (gérer le catalogue = @PreAuthorize(\"hasRole('VENDEUR')\")) ET par ressource (« mes locations » filtrées par l'utilisateur courant). Écris le test d'accès croisé : le client A ne voit pas les objets de B.",
      hints: [
        "@EnableMethodSecurity ; @PreAuthorize(\"hasRole('VENDEUR')\") sur les écritures catalogue.",
        "locationRepository.findByClient(principal) — jamais un id d'URL de confiance.",
        "Test clé (cours Sécurité l.7) : A tente l'objet de B -> 403/404 (@WithMockUser)."
      ],
      solution: `@PreAuthorize("hasRole('VENDEUR')")            // par rôle
@PostMapping("/gestion/jeux")
public ... creerJeu(@Valid @RequestBody JeuForm form) { ... }

@GetMapping("/mes-locations")                  // par ressource
public List<Location> mesLocations(@AuthenticationPrincipal Utilisateur u) {
    return locationRepo.findByClient(u);       // filtré, jamais un id d'URL
}

// test d'accès croisé (verrouillé par la CI)
@Test @WithMockUser(username="a@ludo.fr")
void clientNeVoitPasLesLocationsDautrui() throws Exception {
    mockMvc.perform(get("/locations/" + locDeB.getId()))
           .andExpect(status().isNotFound());
}`,
      note: "Le contrôle d'accès cassé est la faille n°1 (OWASP A01). En l'écrivant AVEC son test d'accès croisé dès la création de la fonctionnalité, l'IDOR ne peut pas s'installer : la CI relance ce test à chaque commit. Rôle (peut-il agir ? via @PreAuthorize) ET ressource (sur SON objet ? via findByClient) — les deux, dès le départ."
    },
    11: {
      titre: "louer : transaction et test d'intégration",
      etat: "Le cœur métier arrive. On l'écrit atomique et verrouillé, et on le prouve par un test qui traverse toute la chaîne.",
      objectif: "Écris JeuService.louer (@Transactional + verrou pessimiste sur le jeu, contrôle de stock), le contrôleur POST protégé (authentifié + CSRF), et le test d'intégration MockMvc : POST connecté décrémente le stock ; stock nul -> refus propre, aucune location fantôme.",
      hints: [
        "@Transactional ; repo.findByIdForUpdate(id) avec @Lock(PESSIMISTIC_WRITE).",
        "POST + jeton CSRF (activé par défaut par Spring Security) ; Post-Redirect-Get.",
        "Test : après POST, stock -1 et 1 Location ; cas stock 0 -> 409 et 0 Location."
      ],
      solution: `public interface JeuRepository extends JpaRepository<Jeu, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select j from Jeu j where j.id = :id")
    Optional<Jeu> findByIdForUpdate(Long id);
}

@Transactional
public Location louer(Utilisateur client, Long jeuId, int nbJours) {
    Jeu jeu = repo.findByIdForUpdate(jeuId).orElseThrow(EntityNotFoundException::new);
    if (jeu.getStockLocation() <= 0)
        throw new StockInsuffisantException("Plus de stock de location");
    jeu.setStockLocation(jeu.getStockLocation() - 1);
    return locationRepo.save(new Location(client, jeu, LocalDate.now(), nbJours));
}

// test d'intégration (cours CI/CD l.10)
@Test void louerDecremente() throws Exception {
    mockMvc.perform(post("/louer/" + jeu.getId()).with(csrf()));
    assertThat(repo.findById(jeu.getId()).get().getStockLocation()).isEqualTo(2);
}`,
      note: "Même transaction qu'au Niveau 6 (@Transactional + verrou pessimiste contre la course au stock), mais écrite d'emblée avec son test d'intégration qui tourne en CI sur un vrai MySQL. La règle métier la plus précieuse du projet est ainsi verrouillée dès sa naissance : impossible de la casser sans un job rouge."
    },
    12: {
      titre: "acheter : prix figé et couverture",
      etat: "La location tourne. On ajoute l'achat sur l'autre stock, et on surveille désormais la couverture de tests.",
      objectif: "Écris JeuService.acheter (stockVente, montant = prixAchat figé), son test (le montant ne bouge pas si le prix change ensuite), et ajoute la mesure de couverture à la CI (JaCoCo, seuil-cliquet). Vérifie que le seuil tient.",
      hints: [
        "achat.setMontant(jeu.getPrixAchat()) copié ; test : changer prixAchat après -> montant inchangé.",
        "pom.xml : jacoco-maven-plugin avec check (rule LINE >= 0.80).",
        "Le seuil se règle au niveau actuel puis se remonte (anti-recul, cours CI/CD l.11)."
      ],
      solution: `@Transactional
public Achat acheter(Utilisateur client, Long jeuId) {
    Jeu jeu = repo.findByIdForUpdate(jeuId).orElseThrow(EntityNotFoundException::new);
    if (jeu.getStockVente() <= 0) throw new StockInsuffisantException("Plus de stock de vente");
    jeu.setStockVente(jeu.getStockVente() - 1);
    return achatRepo.save(new Achat(client, jeu, LocalDate.now(), jeu.getPrixAchat())); // FIGÉ
}

@Test void prixFige() {
    Achat a = service.acheter(client, jeu.getId());
    jeu.setPrixAchat(new BigDecimal("99")); repo.save(jeu);
    assertThat(achatRepo.findById(a.getId()).get().getMontant())
        .isEqualByComparingTo(prixInitial);
}
<!-- pom.xml : jacoco check, LINE coverage >= 0.80 (fail sinon) -->`,
      note: "Le prix figé (une facture ne change pas) est verrouillé par un test, et la couverture JaCoCo entre dans la CI comme cliquet : le build échoue si elle recule. On mesure ce qui a un filet, on remonte le seuil au fil des progrès — la qualité devient une propriété du pipeline, pas une bonne intention."
    },
    13: {
      titre: "le frontend, échappé et sous en-têtes",
      etat: "Le métier complet est en place. On lui donne un visage — avec l'échappement et les en-têtes de sécurité par défaut.",
      objectif: "Rends le catalogue (templates Thymeleaf, échappement automatique de th:text, jeton CSRF sur les POST), et pose les en-têtes de sécurité (CSP, X-Frame-Options DENY, nosniff via Spring Security). Vérifie qu'aucun th:utext ne traîne sur du contenu utilisateur.",
      hints: [
        "th:text échappe ; jamais th:utext sur une saisie (cours Sécurité l.3).",
        "En-têtes : http.headers(...contentSecurityPolicy...frameOptions().deny()...); CSP en report-only d'abord.",
        "grep th:utext templates/ -> justifier ou retirer."
      ],
      solution: `<!-- catalogue.html (Thymeleaf) -->
<tr th:each="jeu : \${page.content}">
  <td th:text="\${jeu.titre}">—</td>
  <td th:text="\${jeu.prixLocation} + ' €'">—</td>
  <td><form th:action="@{/louer/{id}(id=\${jeu.id})}" method="post">
      <!-- jeton CSRF injecté automatiquement par Spring Security + Thymeleaf -->
      <button>Louer</button></form></td>
</tr>

// SecuriteConfig — en-têtes (cours Sécurité l.15)
http.headers(h -> h
    .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
    .frameOptions(f -> f.deny())
    .contentTypeOptions(Customizer.withDefaults()));   // nosniff`,
      note: "Le frontend hérite gratuitement de l'échappement Thymeleaf (th:text) et des en-têtes de sécurité posés d'office : XSS et clickjacking sont fermés avant même d'exister. Le jeton CSRF est injecté automatiquement dans les formulaires. La CSP peut démarrer en report-only (elle observe sans casser), exactement la méthode qui la fait adopter (cours Sécurité)."
    },
    14: {
      titre: "les secrets et la configuration",
      etat: "L'app est complète et sûre côté code. On verrouille sa configuration : rien de sensible dans le dépôt ni l'image.",
      objectif: "Range la config par profils Spring (application.yml + variables d'environnement pour SPRING_DATASOURCE_PASSWORD, clé de session, etc.), garde tout secret hors Git et hors image, ajoute un scan de secrets (gitleaks) au pipeline, et écris la procédure de rotation d'un secret exposé.",
      hints: [
        "application.yml lit \${DB_PASSWORD} depuis l'environnement ; profils dev/prod séparés.",
        "ci.yml : job gitleaks detect (cours Sécurité l.8, CI/CD l.13).",
        "Rotation : révoquer -> régénérer -> reposer -> vérifier -> auditer."
      ],
      solution: `# application.yml (aucun secret en dur)
spring:
  datasource:
    url: \${SPRING_DATASOURCE_URL}
    username: \${SPRING_DATASOURCE_USERNAME}
    password: \${SPRING_DATASOURCE_PASSWORD}
  jpa: { hibernate: { ddl-auto: validate } }
# profil prod : application-prod.yml (jamais commité s'il contient du sensible)

# .gitignore + .dockerignore : *.env, application-local.yml

# ci.yml — détection de secrets
  securite:
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - run: gitleaks detect --source . --redact --exit-code 1`,
      note: "Fin de semaine 2 : l'application est complète, testée ET sécurisée — secrets hors du code (injectés par l'environnement), scan de secrets dans la CI (un mot de passe commité rend le job rouge). La rotation est écrite avant d'en avoir besoin. On n'a jamais eu à « rattraper » la sécurité : elle a poussé avec le code."
    },
    15: {
      titre: "recherche, pagination et qualité",
      etat: "Le métier et la sécurité sont solides. On soigne l'expérience et on resserre la qualité automatique.",
      objectif: "Ajoute recherche (findByTitreContainingIgnoreCase) et pagination (Pageable, état dans l'URL) sans N+1 (@EntityGraph / JOIN FETCH), verrouille les performances par un test qui compte les requêtes (Hibernate statistics), et durcis Spotless (format --check) en CI.",
      hints: [
        "Page<Jeu> findByTitreContainingIgnoreCase(String q, Pageable p) ; PageRequest.of(page, 10).",
        "Test anti-N+1 : SessionFactory statistics -> getPrepareStatementCount() == attendu.",
        "ci.yml : mvn spotless:check (le format tranche le style une fois pour toutes)."
      ],
      solution: `public interface JeuRepository extends JpaRepository<Jeu, Long> {
    @EntityGraph(attributePaths = "categorie")          // pas de N+1
    Page<Jeu> findByTitreContainingIgnoreCase(String q, Pageable p);
}

@GetMapping("/catalogue")
public String catalogue(@RequestParam(defaultValue="") String q,
                        @RequestParam(defaultValue="0") int page, Model m) {
    m.addAttribute("page", repo.findByTitreContainingIgnoreCase(q, PageRequest.of(page, 10)));
    return "catalogue";
}

@Test void catalogueSansNPlusUn() {
    stats.clear();
    repo.findByTitreContainingIgnoreCase("", PageRequest.of(0, 10)).getContent()
        .forEach(Jeu::getCategorie);            // force l'accès
    assertThat(stats.getPrepareStatementCount()).isEqualTo(1);
}`,
      note: "La performance devient testable : compter les requêtes SQL transforme « pas de N+1 » en garantie vérifiée par la CI (l'équivalent Java de assertNumQueries). @EntityGraph charge la catégorie en une seule requête. Spotless tranche le style une fois pour toutes. Le pipeline garde le code correct, sûr, rapide ET propre — sans effort humain répété."
    },
    16: {
      titre: "les trois espaces, cloisonnés",
      etat: "Le catalogue est navigable. On ouvre les espaces des trois profils, chacun protégé.",
      objectif: "Crée /client (ses locations/achats), /vendeur (stocks, retards), /gestion (comptes, promotions) — chaque route protégée par le bon rôle (@PreAuthorize). Aucune logique métier nouvelle : on orchestre les services existants.",
      hints: [
        "@PreAuthorize par méthode de contrôleur + tests de refus croisé (@WithMockUser roles).",
        "Espace client filtré par l'utilisateur courant ; promotion réservée à l'admin.",
        "Réutilise JeuService.louer/acheter/rendre et les requêtes de repository (leçons 5-12)."
      ],
      solution: `@GetMapping("/client")
public String espaceClient(@AuthenticationPrincipal Utilisateur u, Model m) {
    m.addAttribute("locations", locationRepo.findByClient(u));
    m.addAttribute("achats", achatRepo.findByClient(u));
    return "client/espace";
}

@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/gestion/promouvoir/{id}")
public String promouvoir(@PathVariable Long id) {
    utilisateurService.ajouterRole(id, "VENDEUR");
    return "redirect:/gestion";
}

// test : @WithMockUser(roles="CLIENT") sur /gestion -> 403`,
      note: "Les espaces n'ajoutent aucune règle métier : ils orchestrent les services et requêtes déjà écrits et testés. C'est le dividende d'une architecture en couches montée proprement — la dernière ligne droite assemble, elle ne réinvente pas. Chaque espace a son test de refus croisé (@WithMockUser), verrouillé par la CI."
    },
    17: {
      titre: "l'image de production, durcie",
      etat: "L'application est finie. On fabrique l'artefact qui partira en prod : léger, non-root, scanné.",
      objectif: "Écris le Dockerfile multi-stage de production (builder Maven qui produit le JAR + runtime JRE slim), utilisateur non-root, et ajoute le scan d'image (trivy) au pipeline. Compare la taille et vérifie qu'aucune faille critique ne passe.",
      hints: [
        "Étage builder (maven:3.9-eclipse-temurin-21, mvn package) -> étage final eclipse-temurin:21-jre.",
        "USER non-root ; COPY --from=builder du seul JAR (pas les sources ni le cache Maven).",
        "ci.yml : trivy image --exit-code 1 --severity CRITICAL (cours Sécurité l.16, Docker l.15-16)."
      ],
      solution: `# Dockerfile (production)
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline           # cache des dépendances
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
RUN useradd --create-home --shell /bin/false ludo
WORKDIR /app
COPY --from=builder /app/target/ludotheque-*.jar app.jar
USER ludo
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]`,
      note: "L'image de prod applique d'un coup le cours Docker (multi-stage : on ne garde que le JAR, ni Maven ni les sources) et le cours Sécurité (moindre privilège via USER non-root, scan CVE). Elle est bien plus légère qu'une image contenant le JDK complet, et vérifiée par trivy à chaque build : une faille critique bloque la livraison. L'artefact qui part en prod est un objet de confiance."
    },
    18: {
      titre: "le pipeline complet",
      etat: "L'image est prête. On assemble le pipeline de bout en bout et on verrouille main.",
      objectif: "Complète la CI (tests + qualité Spotless + sécurité gitleaks + build image + smoke test) et le workflow de release (tag v* -> build, scan, push au registre). Verrouille la protection de branche : rien ne merge sans tout au vert + revue.",
      hints: [
        "ci.yml : jobs tests, qualite (spotless), securite (gitleaks) en parallèle -> image (needs).",
        "release.yml : on push tags v* -> build, push ghcr.io/...:VERSION.",
        "Protection de main : status checks requis + 1 revue (cours CI/CD l.14)."
      ],
      solution: `# release.yml — le tag déclenche la livraison
on: { push: { tags: ["v*"] } }
jobs:
  publier:
    steps:
      - uses: actions/checkout@v4
      - run: echo "VERSION=\${GITHUB_REF_NAME#v}" >> "\$GITHUB_ENV"
      - run: echo "\${{ secrets.REGISTRY_TOKEN }}" | docker login ghcr.io -u toi --password-stdin
      - run: |
          docker build -t ghcr.io/toi/ludotheque:\$VERSION .
          trivy image --exit-code 1 --severity CRITICAL ghcr.io/toi/ludotheque:\$VERSION
          docker push ghcr.io/toi/ludotheque:\$VERSION

# Protection de main : tests + qualite + securite + image verts, 1 revue`,
      note: "Le pipeline réunit les trois cours d'outillage : CI/CD (structure, protection), Docker (image), Sécurité (scans). Un commit tagué déclenche build + scan + push d'un artefact versionné. La barrière de branche garantit que main est toujours déployable — la promesse devient une propriété mécanique du dépôt."
    },
    19: {
      titre: "le déploiement automatisé",
      etat: "L'image est publiée. Le dernier maillon : le serveur se met à jour tout seul, et on le vérifie.",
      objectif: "Écris le job de déploiement (SSH vers le serveur, compose pull + up -d), appuie-toi sur /actuator/health, et pose deux environnements (staging au merge, production sur tag avec approbation). Termine par un curl /actuator/health qui valide. Flyway migre au démarrage de l'app.",
      hints: [
        "deployer needs publier ; ssh -i (clé secrète) 'cd /srv/ludo && docker compose pull && up -d'.",
        "/actuator/health : Spring Boot le fournit (db incluse) -> 200 UP ou 503 ; curl -fs avec retries.",
        "environments staging/production, required reviewers sur prod (cours CI/CD l.17-18)."
      ],
      solution: `  deployer-production:
    needs: publier
    environment: production            # approbation humaine requise
    steps:
      - run: echo "\${{ secrets.SSH_PRIVATE_KEY }}" > cle && chmod 600 cle
      - run: |
          ssh -i cle -o StrictHostKeyChecking=accept-new deploy@ludotheque.example.com '
            cd /srv/ludotheque &&
            echo "VERSION=\${GITHUB_REF_NAME#v}" > .env.version &&
            docker compose pull && docker compose up -d'
      - run: sleep 15 && curl -fs https://ludotheque.example.com/actuator/health`,
      note: "Le déploiement rejoue au robot ce qu'on ferait à la main : pull, up (Flyway applique les migrations au démarrage), puis vérifie /actuator/health. Staging se met à jour au merge, la production exige un tag ET une approbation. On ne se connecte plus jamais au serveur pour livrer : un git push origin v1.0.0, et l'application se déploie et se vérifie seule."
    },
    20: {
      titre: "observer, sauvegarder, protéger, revenir",
      etat: "Le projet est en ligne. On installe les filets de la vie en production.",
      objectif: "Mets en place l'observabilité (logs structurés sans secret, Actuator, métriques), les sauvegardes chiffrées de la base (planifiées et testées), la conformité RGPD (export, anonymisation, durées) et la procédure de rollback (tag précédent, migrations N-1).",
      hints: [
        "Logs SLF4J : événements de sécurité, jamais de mot de passe/jeton (cours Sécurité l.13).",
        "Sauvegarde : mysqldump chiffré (gpg), clé séparée, restauration testée (Docker l.8).",
        "RGPD : exporterMesDonnees, anonymiser ; rollback = redéployer le tag précédent (N-1)."
      ],
      solution: `// Observabilité : logs structurés (après commit, sans secret)
log.info("location jeu={} client={}", jeuId, client.getId());
// Actuator : /actuator/health, /actuator/metrics (exposition restreinte en prod)

# Sauvegarde chiffrée, planifiée et TESTÉE
docker compose exec bdd mysqldump ... | gpg --encrypt -r sauvegarde@ludo > backup.sql.gpg

// RGPD (cours Sécurité l.18)
@Transactional
public void supprimerMonCompte(Utilisateur u) {
    locationService.anonymiser(u);   // garder les stats, retirer l'identité
    utilisateurRepo.delete(u);
}

# Rollback : image tag précédent + up -d (migrations Flyway compatibles N-1, CI/CD l.19)`,
      note: "La production n'est pas la fin, c'est un état à tenir : observer (logs, Actuator), sauvegarder (chiffré, testé), respecter les données (RGPD) et pouvoir revenir (rollback N-1). Avec Flyway, la règle N-1 est explicite : une migration additive (V+1 ajoute) suivie d'une bascule (V+2) permet de reculer sans casser. Ces filets, appris séparément aux cours Docker/CI-CD/Sécurité, sont ici tous en place."
    },
    21: {
      titre: "🎓 le projet professionnel de bout en bout",
      etat: "La Ludothèque pro est construite, conteneurisée, testée, sécurisée, livrée et surveillée — comme en entreprise.",
      objectif: "Exercice de synthèse : raconte le trajet complet d'une fonctionnalité, de la branche Git au /actuator/health vert en production, en montrant qu'à CHAQUE étape le métier, l'industrialisation et la sécurité avancent ensemble.",
      hints: [
        "Branche -> code + test écrits ensemble -> CI (tests+Spotless+gitleaks+image) -> revue -> merge.",
        "Staging auto -> recette -> tag -> build+scan+push -> approbation -> prod -> /actuator/health.",
        "À chaque case : ce qui est construit, ce qui l'industrialise, ce qui le sécurise."
      ],
      solution: `LE TRAJET D'UNE FONCTIONNALITÉ (Ludothèque pro)

git switch -c feature/reservation
  code métier (service) + test écrits ENSEMBLE       [construire + tester]
  validation (@Valid), autorisation par ressource    [sécuriser]
  push -> CI : tests+MySQL, Spotless, gitleaks, build+scan [industrialiser+sécuriser]
  revue -> merge (protection de branche)             [industrialiser]
  -> STAGING auto -> recette
git tag v1.3.0
  -> build, scan CVE, push registre                  [industrialiser+sécuriser]
  -> approbation -> déploiement prod (pull/up, Flyway migre)
  -> curl /actuator/health UP ; logs et sauvegardes en place  [exploiter]

À aucun moment le métier n'avance sans son test ni sa protection :
construire, industrialiser, sécuriser — les trois disciplines, en même temps.`,
      note: "🎓 C'est l'aboutissement de toute la formation : non plus « construire, puis outiller », mais construire EN outillant — le métier, les tests, la sécurité et la livraison qui avancent d'un même pas. C'est exactement le quotidien d'une équipe professionnelle. Si tu sais mener ce trajet, tu sais livrer du logiciel pour de vrai."
    }
  }
};
