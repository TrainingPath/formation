/* ===== Fil rouge « La Ludothèque pro » — Niveau 8, projet full-stack outillé (C# · ASP.NET Core) =====
   On reconstruit la Ludothèque comme en entreprise : conteneurisée dès le
   premier jour, testée et livrée par un pipeline CI/CD, sécurisée par conception.
   Chaque étape mène de front la construction (métier), l'industrialisation
   (Docker/CI/CD) et la sécurité — jamais l'une sans les autres.
   Prérequis : capstone C#·ASP.NET (N4) + Docker, CI/CD, Sécurité (N5). */
var FIL = {
  prefix: "proj6cs21",
  app: "La Ludothèque pro",
  placeholder: "Écris ton code / ta config / ta commande ici…",
  etapes: {
    1: {
      titre: "le cadrage professionnel",
      etat: "Feuille blanche — mais cette fois on part avec les réflexes d'une équipe : un dépôt propre, un environnement conteneurisé, une définition de « prêt ».",
      objectif: "Pose les fondations pro : l'arborescence (solution ASP.NET Core + projet de tests, Dockerfile, compose, .github/workflows, secrets hors Git), la definition of done (code + tests + dotnet format + image qui build), et le flux Git (branches courtes, PR, main protégée).",
      hints: [
        "La solution .sln, mais aussi : Dockerfile, compose.yaml, .github/workflows/ci.yml, .gitignore, .dockerignore.",
        "Definition of Done : une fonctionnalité n'est « faite » que testée, formatée (dotnet format), et l'image build.",
        "GitHub Flow : main déployable, une branche par changement, PR obligatoire (cours CI/CD)."
      ],
      solution: `Ludotheque.sln
src/Ludotheque/                projet web (Controllers, Views, Services, Data)
  Domain/  Data/  Services/     entités, DbContext, services métier
  Controllers/  Views/          MVC + Razor
tests/Ludotheque.Tests/         xUnit : unitaires + intégration
Dockerfile                      image (multi-stage : build SDK puis runtime aspnet)
compose.yaml                    app + MySQL, réseau, volume (dev)
.github/workflows/ci.yml        tests + format + build à chaque commit
appsettings.json                config non sensible ; secrets HORS Git (env)
.gitignore .dockerignore        bin/, obj/, *.user, appsettings.*.local.json

# Definition of Done (contrat d'équipe)
#  fonctionnalité = code + tests verts + dotnet format OK + image qui build + PR relue
# Flux : branche courte -> commits normés -> PR -> CI verte -> merge sur main`,
      note: "La différence avec le Niveau 6 tient en une phrase : on n'ajoute pas les outils à la fin, on les pose AVANT d'écrire la première ligne métier. Le dépôt, le Compose, le pipeline et la règle « rien n'entre dans main sans CI verte » existent dès le jour 1 — tout le reste s'y coule."
    },
    2: {
      titre: "le squelette dans Docker Compose",
      etat: "L'architecture est posée. On crée le projet ASP.NET Core et sa base MySQL directement en conteneurs — aucune installation sur la machine.",
      objectif: "Crée le projet ASP.NET Core (MVC + EF Core + Pomelo MySQL + Health Checks) et lance-le via Docker Compose (service app + service MySQL, healthcheck, volume). L'app lit sa config depuis l'environnement. Vérifie /health dans le conteneur.",
      hints: [
        "compose.yaml : app (build .), bdd (mysql:8.4, healthcheck), volume donnees-mysql.",
        "app dépend de bdd (condition: service_healthy) ; ConnectionStrings via variable d'env Server=bdd.",
        "docker compose up -d && curl localhost:8080/health"
      ],
      solution: `# compose.yaml (dev)
services:
  app:
    build: .
    ports: ["8080:8080"]
    environment:
      ASPNETCORE_URLS: http://+:8080
      ConnectionStrings__Default: "Server=bdd;Database=ludotheque;User=ludo_app;Password=\${DB_PASSWORD}"
    depends_on:
      bdd: { condition: service_healthy }
  bdd:
    image: mysql:8.4
    environment:
      MYSQL_DATABASE: ludotheque
      MYSQL_USER: ludo_app
      MYSQL_PASSWORD: \${DB_PASSWORD}
      MYSQL_ROOT_PASSWORD: \${DB_ROOT_PASSWORD}
    volumes: ["donnees-mysql:/var/lib/mysql"]
    healthcheck:
      test: ["CMD","mysqladmin","ping","-h","localhost"]
      interval: 5s
      retries: 10
volumes: { donnees-mysql: {} }

# Program.cs : builder.Services.AddHealthChecks(); app.MapHealthChecks("/health");
# $ docker compose up -d && curl localhost:8080/health -> Healthy`,
      note: "Personne n'installe le SDK .NET ni MySQL sur son poste : `docker compose up` suffit, et tout le monde a le même environnement (cours Docker). Server=bdd fonctionne grâce au DNS interne du réseau Compose ; le healthcheck fait attendre l'app que MySQL soit prêt, pas juste démarré. Health Checks fournit /health sans code à écrire."
    },
    3: {
      titre: "le pipeline dès le premier commit",
      etat: "Le projet tourne en local. Avant d'écrire du métier, on met en place le garde-fou : Git propre et une CI qui vérifie chaque commit.",
      objectif: "Initialise le dépôt (commits normés, .gitignore .NET), pousse sur GitHub, et écris .github/workflows/ci.yml : sur push/PR, un job qui installe le SDK .NET, lance dotnet format --verify-no-changes et dotnet test. Configure la protection de main (PR + CI verte).",
      hints: [
        "Messages normés : feat:, fix:, chore: (cours CI/CD leçon 1).",
        "ci.yml : actions/setup-dotnet, dotnet restore, dotnet format --verify-no-changes, dotnet test.",
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
      - uses: actions/setup-dotnet@v4
        with: { dotnet-version: "8.0.x" }
      - run: dotnet restore
      - run: dotnet format --verify-no-changes     # format
      - run: dotnet test --no-restore              # xUnit

# Git : git init ; commits "feat: squelette ASP.NET Core + Compose"
# GitHub : protection de main (PR obligatoire + CI verte, cours CI/CD l.14)`,
      note: "Le pipeline existe AVANT le métier : ainsi, dès la première fonctionnalité, elle naît sous surveillance. C'est l'inverse du Niveau 6 où l'on testait « quand on y pensait ». Ici, un commit qui casse `dotnet test` ou le format est rouge immédiatement, et ne peut pas entrer dans main."
    },
    4: {
      titre: "le schéma, versionné et migré en conteneur",
      etat: "L'usine tourne à vide. On y coule la première brique : le schéma de la Ludothèque, issu du MCD Merise.",
      objectif: "Écris les entités Categorie et Jeu et le DbContext, génère la migration EF Core (dotnet ef migrations add) et applique-la DANS le conteneur (dotnet ef database update). L'argent en decimal, deux stocks, clés étrangères. La CI rejoue les migrations sur une base neuve.",
      hints: [
        "OnModelCreating : HasPrecision(6,2) pour l'argent, HasIndex(j => j.Titre), DeleteBehavior.Restrict.",
        "dotnet ef migrations add Initial ; dotnet ef database update (dans le conteneur).",
        "Le job de tests de la CI (leçon 6) partira d'une base vierge : les migrations doivent rejouer de zéro."
      ],
      solution: `public class Jeu {
    public long Id { get; set; }
    public string Titre { get; set; } = "";
    public decimal PrixAchat { get; set; }
    public decimal PrixLocation { get; set; }
    public int StockVente { get; set; }
    public int StockLocation { get; set; }
    public long CategorieId { get; set; }
    public Categorie Categorie { get; set; } = null!;
}
// LudothequeContext.OnModelCreating
b.Entity<Jeu>(e => {
    e.Property(j => j.PrixAchat).HasPrecision(6, 2);
    e.Property(j => j.PrixLocation).HasPrecision(6, 2);
    e.HasIndex(j => j.Titre);                       // recherche anticipée
    e.HasOne(j => j.Categorie).WithMany().OnDelete(DeleteBehavior.Restrict);
});
// $ dotnet ef migrations add Initial ; dotnet ef database update`,
      note: "Le schéma vient de Merise, comme au Niveau 6 — mais ici les migrations EF Core le versionnent, l'index de recherche est posé DÈS le départ (on sait qu'on paginera), et la migration sera rejouée à chaque commit par la CI sur une base neuve : plus de « ça migre par chance ». Chaque migration est un fichier généré, immuable une fois poussé : on corrige avec une nouvelle migration, jamais en réécrivant une ancienne. decimal en C# est exact — jamais de double pour l'argent."
    },
    5: {
      titre: "les entités, testées dès l'écriture",
      etat: "Le catalogue prend forme. On y ajoute le vocabulaire métier — et son filet de tests, écrit en même temps.",
      objectif: "Ajoute les propriétés calculées EstLouable/EstAchetable, une méthode de requête (jeux louables), et ÉCRIS les tests de ces règles dans la foulée (xUnit). La CI exécute ces tests avec un service MySQL.",
      hints: [
        "EstLouable => StockLocation > 0 (propriété calculée, non mappée [NotMapped]).",
        "Test : new Jeu { StockLocation = 0 }.EstLouable.Should().BeFalse() (FluentAssertions).",
        "Le job de tests CI a un service mysql:8.4 (cours CI/CD leçon 10)."
      ],
      solution: `public class Jeu {
    // ... colonnes ...
    [NotMapped] public bool EstLouable  => StockLocation > 0;
    [NotMapped] public bool EstAchetable => StockVente > 0;
}
// requête métier (repository / DbSet extension)
public static IQueryable<Jeu> Louables(this IQueryable<Jeu> q) =>
    q.Where(j => j.StockLocation > 0);

// tests/…/JeuTests.cs — écrit EN MÊME TEMPS que le code
[Fact] public void Non_louable_si_stock_nul() {
    var jeu = new Jeu { StockLocation = 0 };
    jeu.EstLouable.Should().BeFalse();
}
// CI (job tests) : service mysql:8.4 + dotnet test`,
      note: "Au Niveau 6, les tests arrivaient à la semaine 3 ; ici ils naissent avec le code. Écrire la règle (une propriété calculée) et son test dans le même commit change tout : la CI les exécute aussitôt, et une régression future devient rouge à la seconde. C'est le TDD léger d'une équipe qui a intégré que « non testé = non fait ». [NotMapped] indique à EF que la propriété n'est pas une colonne."
    },
    6: {
      titre: "la couche service sous surveillance",
      etat: "Les données savent se lire. On y ajoute les décisions métier — dans une couche service, testée et formatée par la CI.",
      objectif: "Écris JeuService (injecté par DI) : VerifierStockLocation (exception métier), PrixLocation (decimal, 7j + 0,50 €/jour). Couvre chaque règle par un test unitaire rapide (Moq pour le repository, sans base).",
      hints: [
        "class StockInsuffisantException : Exception : vocabulaire métier explicite.",
        "PrixLocation(jeu, 10) avec base 5 € = 6,50 € (Should().Be(6.50m), decimal exact).",
        "Le service se teste avec un Mock du repository -> en millisecondes, sans MySQL."
      ],
      solution: `public class StockInsuffisantException : Exception {
    public StockInsuffisantException(string m) : base(m) {}
}
public class JeuService {
    private readonly IJeuRepository _repo;
    public JeuService(IJeuRepository repo) => _repo = repo;   // injection

    public void VerifierStockLocation(Jeu jeu) {
        if (jeu.StockLocation <= 0)
            throw new StockInsuffisantException($"Plus de stock pour {jeu.Titre}");
    }
    public decimal PrixLocation(Jeu jeu, int nbJours = 7) =>
        nbJours <= 7 ? jeu.PrixLocation
                     : jeu.PrixLocation + (nbJours - 7) * 0.50m;
}
// test rapide (Moq, sans base)
[Fact] public void Tarif_prolongation() {
    var jeu = new Jeu { PrixLocation = 5.00m };
    new JeuService(Mock.Of<IJeuRepository>()).PrixLocation(jeu, 10).Should().Be(6.50m);
}`,
      note: "La couche service isole les décisions métier : ses tests (avec Moq) tournent en millisecondes, aucune base, donc la CI reste rapide (< 10 min, condition de son adoption, cours CI/CD). Le type decimal de C# est exact (pas de double) : jamais d'erreur d'arrondi sur un prix. L'injection par constructeur rend le service testable en isolant le repository."
    },
    7: {
      titre: "l'API et le job de tests au vert",
      etat: "Le métier existe et il est testé. On l'ouvre en API — et on ajoute le job de tests complet à la CI, avec MySQL.",
      objectif: "Expose GET /api/jeux (contrôleur API, DTO record, Include/projection anti-N+1) et écris un test d'intégration (WebApplicationFactory). Complète ci.yml : job tests avec service mysql, dotnet test, et fais passer le tout au vert.",
      hints: [
        "record JeuDto(long Id, string Titre, decimal PrixLocation, bool Louable) : choisit ce qui sort.",
        "Test : var r = await client.GetAsync(\"/api/jeux\"); r.EnsureSuccessStatusCode().",
        "Job CI tests : services.mysql, ConnectionStrings__Default vers 127.0.0.1, run dotnet test."
      ],
      solution: `public record JeuDto(long Id, string Titre, decimal PrixLocation, bool Louable);

[ApiController, Route("api/jeux")]
public class JeuxApiController : ControllerBase {
    [HttpGet] public async Task<IEnumerable<JeuDto>> Lister() =>
        await _db.Jeux.Include(j => j.Categorie).OrderBy(j => j.Titre)   // anti-N+1
            .Select(j => new JeuDto(j.Id, j.Titre, j.PrixLocation, j.StockLocation > 0))
            .ToListAsync();
}
# ci.yml — job tests
  tests:
    services:
      mysql: { image: mysql:8.4, env: {...}, ports: ["3306:3306"], options: --health-cmd=... }
    steps: [ checkout, setup-dotnet, "dotnet restore", "dotnet test" ]`,
      note: "Fin de semaine 1 : l'usine est complète AVANT que l'application ne soit finie. Entités, service et API existent, chacun sous tests, et le pipeline (format + tests avec MySQL) tourne au vert à chaque commit. Le DTO record découple l'API du schéma ; la projection Select charge exactement ce qu'il faut (et évite le N+1). On peut désormais empiler le métier en confiance — chaque ajout naîtra testé et surveillé."
    },
    8: {
      titre: "valider les entrées, refuser proprement",
      etat: "L'API lit. Avant qu'elle n'écrive, on blinde les entrées et on traduit les erreurs — sécurité et robustesse d'un seul geste.",
      objectif: "Écris la validation (DataAnnotations sur un DTO de requête + [ApiController] valide automatiquement), traduis les exceptions en HTTP (400/404/409 sans fuite technique) via un middleware/ProblemDetails, et ajoute un test par cas d'erreur. Rappelle la règle « toute entrée est hostile ».",
      hints: [
        "[Required], [Range(0.01, …)] pour les prix, [Range(0, int.MaxValue)] pour les stocks ; liste d'autorisation.",
        "KeyNotFound -> 404 ; StockInsuffisant -> 409 ; ModelState invalide -> 400 (auto). Messages génériques.",
        "Un test par branche d'erreur : la CI les verrouille."
      ],
      solution: `public record CreerJeuDto(
    [Required, StringLength(200)] string Titre,
    [Range(0.01, 9999)] decimal PrixLocation,
    [Range(0, int.MaxValue)] int StockVente,
    [Required] long CategorieId);
// [ApiController] renvoie 400 automatiquement si ModelState invalide

// middleware d'erreurs -> ProblemDetails, sans fuite
app.UseExceptionHandler(a => a.Run(async ctx => {
    var ex = ctx.Features.Get<IExceptionHandlerFeature>()?.Error;
    var (code, msg) = ex switch {
        StockInsuffisantException e => (409, e.Message),
        KeyNotFoundException => (404, "Introuvable"),
        _ => (500, "Erreur interne")
    };
    ctx.Response.StatusCode = code;
    await ctx.Response.WriteAsJsonAsync(new { erreur = msg });
}));`,
      note: "La validation n'est pas qu'une commodité : c'est la première ligne de défense (cours Sécurité). Les DataAnnotations valident en liste d'autorisation, et [ApiController] renvoie un 400 automatique AVANT le contrôleur — une requête invalide n'atteint jamais le métier. Le middleware d'exceptions centralise la traduction avec des messages génériques (jamais de stack trace en prod) : injection et fuite d'information fermées d'emblée. Chaque cas a son test."
    },
    9: {
      titre: "des comptes et une authentification durcie",
      etat: "Le catalogue est public et sûr. On introduit les utilisateurs — avec les bons réflexes de sécurité dès le premier compte.",
      objectif: "Mets en place ASP.NET Core Identity (les trois rôles), l'inscription (mot de passe haché par Identity), et durcis : politique de mot de passe (longueur), cookies d'authentification (HttpOnly, Secure, SameSite). Teste inscription et connexion.",
      hints: [
        "AddIdentity / AddDefaultIdentity ; rôles Client/Vendeur/Admin (RoleManager).",
        "Identity.Password.RequiredLength = 12 ; PasswordHasher (PBKDF2 par défaut, jamais de clair).",
        "ConfigureApplicationCookie : HttpOnly, SecurePolicy=Always, SameSite=Lax (cours Sécurité l.6)."
      ],
      solution: `// Program.cs
builder.Services.AddIdentity<Utilisateur, IdentityRole>(o => {
    o.Password.RequiredLength = 12;            // NIST : la longueur prime
    o.Password.RequireNonAlphanumeric = false;
    o.User.RequireUniqueEmail = true;
}).AddEntityFrameworkStores<LudothequeContext>();

builder.Services.ConfigureApplicationCookie(o => {
    o.Cookie.HttpOnly = true;                  // inaccessible au JS (anti-XSS)
    o.Cookie.SecurePolicy = CookieSecurePolicy.Always;   // HTTPS uniquement
    o.Cookie.SameSite = SameSiteMode.Lax;      // anti-CSRF de base
});
// inscription : await _userManager.CreateAsync(user, motDePasse);  // haché par Identity`,
      note: "Au Niveau 6, la sécurité des sessions arrivait en fin de parcours. Ici, dès le premier utilisateur : Identity hache le mot de passe (PBKDF2 salé, jamais de clair), politique NIST (RequiredLength = 12), cookies durcis. Sécuriser au moment où l'on crée la fonctionnalité coûte quelques lignes de config ; le faire après coup coûte un audit. Identity fournit gratuitement l'essentiel — notre travail est de le durcir."
    },
    10: {
      titre: "l'autorisation, par rôle ET par ressource",
      etat: "On sait QUI est connecté. On décide QUI accède à QUOI — sans jamais laisser passer un IDOR.",
      objectif: "Applique l'autorisation : par rôle ([Authorize(Roles=\"Vendeur,Admin\")] ou une policy) ET par ressource (« mes locations » filtrées par User id, ou authorization basée ressource). Écris le test d'accès croisé : le client A ne voit pas les objets de B.",
      hints: [
        "[Authorize(Policy = \"GererCatalogue\")] pour le rôle ; policy définie dans Program.cs.",
        "Par ressource : filtrer par _userManager.GetUserId(User) ; ou IAuthorizationService sur l'objet.",
        "Test clé (cours Sécurité l.7) : A tente l'objet de B -> 403/404."
      ],
      solution: `// Program.cs
builder.Services.AddAuthorization(o =>
    o.AddPolicy("GererCatalogue", p => p.RequireRole("Vendeur", "Admin")));

// par RÔLE
[Authorize(Policy = "GererCatalogue")]
[HttpPost] public IActionResult CreerJeu(CreerJeuDto dto) { ... }

// par RESSOURCE : filtré par l'utilisateur courant
[Authorize] public async Task<IActionResult> MesLocations() {
    var uid = _userManager.GetUserId(User);
    var locations = await _db.Locations.Where(l => l.ClientId == uid).ToListAsync();
    return View(locations);        // jamais un id d'URL de confiance
}
// test croisé : loginAs(A); GET /locations/{idDeB} -> Forbidden/NotFound`,
      note: "Le contrôle d'accès cassé est la faille n°1 (OWASP A01). En écrivant l'autorisation AVEC son test d'accès croisé dès la création de la fonctionnalité, l'IDOR ne peut pas s'installer : la CI relance ce test à chaque commit. Rôle (peut-il agir ? via une policy) ET ressource (sur SON objet ? via le filtre par User id ou une autorisation basée ressource) — les deux, dès le départ. On renvoie 403/404 côté serveur, jamais on ne se contente de masquer un bouton."
    },
    11: {
      titre: "louer : transaction et test d'intégration",
      etat: "Le cœur métier arrive. On l'écrit atomique et verrouillé, et on le prouve par un test qui traverse toute la chaîne.",
      objectif: "Écris JeuService.LouerAsync (transaction EF + verrou pessimiste sur le jeu, contrôle de stock), l'action POST protégée (auth + antiforgery), et le test d'intégration : POST connecté décrémente le stock ; stock nul -> refus propre, aucune location fantôme.",
      hints: [
        "await using var tx = await _db.Database.BeginTransactionAsync(); FromSqlRaw(... FOR UPDATE) pour le verrou.",
        "POST + [ValidateAntiForgeryToken] ; Post-Redirect-Get.",
        "Test : après POST, stock -1 et 1 Location ; cas stock 0 -> pas de location."
      ],
      solution: `public async Task<Location> LouerAsync(string clientId, long jeuId, int nbJours = 7) {
    await using var tx = await _db.Database.BeginTransactionAsync();
    var jeu = await _db.Jeux.FromSqlInterpolated(
        $"SELECT * FROM Jeux WHERE Id = {jeuId} FOR UPDATE").SingleAsync();  // verrou
    if (jeu.StockLocation <= 0)
        throw new StockInsuffisantException("Plus de stock de location");
    jeu.StockLocation--;
    var loc = new Location { ClientId = clientId, JeuId = jeu.Id, NbJours = nbJours };
    _db.Locations.Add(loc);
    await _db.SaveChangesAsync();
    await tx.CommitAsync();
    return loc;
}
// test d'intégration (cours CI/CD l.10) : POST -> StockLocation == 2`,
      note: "Même logique qu'au Niveau 6 (transaction + verrou pessimiste FOR UPDATE contre la course au stock), mais écrite d'emblée avec son test d'intégration qui tourne en CI sur un vrai MySQL. Si l'exception est levée avant le commit, rien n'est persisté : aucune location fantôme, stock intact. La règle métier la plus précieuse du projet est ainsi verrouillée dès sa naissance : impossible de la casser sans un job rouge."
    },
    12: {
      titre: "acheter : prix figé et couverture",
      etat: "La location tourne. On ajoute l'achat sur l'autre stock, et on surveille désormais la couverture de tests.",
      objectif: "Écris JeuService.AcheterAsync (stock_vente, montant = prix_achat figé), son test (le montant ne bouge pas si le prix change ensuite), et ajoute la mesure de couverture à la CI (coverlet, seuil-cliquet). Vérifie que le seuil tient.",
      hints: [
        "achat.Montant = jeu.PrixAchat (copié) ; test : changer PrixAchat après -> montant inchangé.",
        "CI : dotnet test --collect:\"XPlat Code Coverage\" + seuil (coverlet /p:Threshold=80).",
        "Le seuil se règle au niveau actuel puis se remonte (anti-recul, cours CI/CD l.11)."
      ],
      solution: `public async Task<Achat> AcheterAsync(string clientId, long jeuId) {
    await using var tx = await _db.Database.BeginTransactionAsync();
    var jeu = await _db.Jeux.FromSqlInterpolated(
        $"SELECT * FROM Jeux WHERE Id = {jeuId} FOR UPDATE").SingleAsync();
    if (jeu.StockVente <= 0) throw new StockInsuffisantException("Plus de stock de vente");
    jeu.StockVente--;
    var achat = new Achat { ClientId = clientId, JeuId = jeu.Id, Montant = jeu.PrixAchat }; // FIGÉ
    _db.Achats.Add(achat);
    await _db.SaveChangesAsync(); await tx.CommitAsync();
    return achat;
}
[Fact] public async Task Prix_fige() {
    var achat = await _service.AcheterAsync(client.Id, jeu.Id);
    jeu.PrixAchat = 99m; await _db.SaveChangesAsync();
    (await _db.Achats.FindAsync(achat.Id)).Montant.Should().Be(prixInitial);
}
# ci.yml : dotnet test avec seuil de couverture 80 % (coverlet)`,
      note: "Le prix figé (une facture ne change pas) est verrouillé par un test, et la couverture entre dans la CI comme cliquet : le seuil ne peut plus reculer. Attention : 80 % de couverture ne veut pas dire 80 % correct — un test peut exécuter une ligne sans rien vérifier. La couverture repère le code jamais testé (une alarme utile) ; la vraie qualité vient des assertions. On l'utilise comme garde-fou, pas comme objectif en soi."
    },
    13: {
      titre: "le frontend, échappé et sous en-têtes",
      etat: "Le métier complet est en place. On lui donne un visage — avec l'échappement et les en-têtes de sécurité par défaut.",
      objectif: "Rends le catalogue (vues Razor, échappement automatique de @variable, antiforgery sur les POST), et pose les en-têtes de sécurité (CSP, X-Frame-Options, nosniff) via un middleware. Vérifie qu'aucun Html.Raw ne traîne sur du contenu utilisateur.",
      hints: [
        "@jeu.Titre échappe ; jamais @Html.Raw(...) sur une saisie (cours Sécurité l.3).",
        "Middleware : Content-Security-Policy, X-Frame-Options: DENY, X-Content-Type-Options: nosniff.",
        "Le tag helper <form asp-*> injecte l'antiforgery ; [ValidateAntiForgeryToken] côté action."
      ],
      solution: `@* Views/Catalogue/Index.cshtml *@
@foreach (var jeu in Model) {
  <tr>
    <td>@jeu.Titre</td>                    @* @ ÉCHAPPE le HTML : anti-XSS *@
    <td>@jeu.PrixLocation €</td>
    <td>
      <form asp-action="Louer" asp-route-id="@jeu.Id" method="post">
        @* le tag helper injecte le jeton antiforgery automatiquement *@
        <button>Louer</button>
      </form>
    </td>
  </tr>
}
// middleware d'en-têtes
ctx.Response.Headers["Content-Security-Policy"] = "default-src 'self'";
ctx.Response.Headers["X-Frame-Options"] = "DENY";            // anti-clickjacking
ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";`,
      note: "Le frontend hérite gratuitement de l'échappement Razor (@variable) et des en-têtes de sécurité posés d'office : XSS et clickjacking fermés avant même d'exister. Les tag helpers de formulaire injectent le jeton antiforgery, que [ValidateAntiForgeryToken] vérifie côté serveur. La grande majorité des XSS viennent d'un @Html.Raw sur une donnée non fiable : un grep avant merge suffit à éliminer cette classe de failles."
    },
    14: {
      titre: "les secrets et la configuration",
      etat: "L'app est complète et sûre côté code. On verrouille sa configuration : rien de sensible dans le dépôt ni l'image.",
      objectif: "Range la config par environnement (appsettings.json pour le non sensible, variables d'environnement pour les secrets ; user-secrets en dev), garde tout secret hors Git et hors image, ajoute un scan de secrets (gitleaks) au pipeline, et écris la procédure de rotation d'un secret exposé.",
      hints: [
        "appsettings.json (non sensible, versionné) ; ConnectionStrings via variable d'env en prod ; dotnet user-secrets en dev.",
        "ci.yml : job gitleaks detect (cours Sécurité l.8, CI/CD l.13).",
        "Rotation : révoquer -> régénérer -> reposer -> vérifier -> auditer."
      ],
      solution: `// appsettings.json : niveaux de log, options NON sensibles (versionné)
// en prod : ConnectionStrings__Default fourni par variable d'environnement
// en dev : dotnet user-secrets set "ConnectionStrings:Default" "..."  (hors dépôt)

# .gitignore + .dockerignore : appsettings.*.local.json, *.user
# JAMAIS de mot de passe dans appsettings.json commité

# ci.yml — détection de secrets
  securite:
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - run: gitleaks detect --source . --redact --exit-code 1`,
      note: "Fin de semaine 2 : l'application est complète, testée ET sécurisée — secrets hors du code (variables d'environnement en prod, user-secrets en dev), scan de secrets dans la CI (un mot de passe commité rend le job rouge). La configuration par couches d'ASP.NET (appsettings -> env -> user-secrets) permet de garder le sensible dehors sans effort. Un secret dans l'historique Git n'est pas effacé par un commit de suppression : la seule réponse sûre est la rotation."
    },
    15: {
      titre: "recherche, pagination et qualité",
      etat: "Le métier et la sécurité sont solides. On soigne l'expérience et on resserre la qualité automatique.",
      objectif: "Ajoute recherche (Where Contains) et pagination (Skip/Take, état dans l'URL) sans N+1 (Include ou projection), verrouille les performances par un test qui compte les requêtes (interception EF), et durcis le format (dotnet format) en CI.",
      hints: [
        "Where(j => j.Titre.Contains(q)).OrderBy(...).Skip((page-1)*10).Take(10) ; page et q dans l'URL.",
        "Test anti-N+1 : intercepteur EF (DbCommandInterceptor) ou log, compter les requêtes.",
        "ci.yml : dotnet format --verify-no-changes."
      ],
      solution: `public async Task<IActionResult> Index(string? q, int page = 1) {
    var query = _db.Jeux.Include(j => j.Categorie).AsQueryable();   // eager : pas de N+1
    if (!string.IsNullOrEmpty(q)) query = query.Where(j => j.Titre.Contains(q));
    var jeux = await query.OrderBy(j => j.Titre)
        .Skip((page - 1) * 10).Take(10).ToListAsync();
    return View(new CatalogueVm(jeux, q, page));
}
// test : un intercepteur compte les commandes SQL -> <= 1 requête pour la page
[Fact] public async Task Catalogue_sans_n_plus_un() {
    _compteur.Reset();
    await _client.GetAsync("/catalogue");
    _compteur.Requetes.Should().BeLessThanOrEqualTo(2);
}`,
      note: "La performance devient testable : compter les requêtes SQL (via un DbCommandInterceptor) transforme « pas de N+1 » en garantie vérifiée par la CI (l'équivalent .NET de assertNumQueries). Include charge la catégorie en une requête. dotnet format tranche le style une fois pour toutes. À ce stade, le pipeline garde le code correct, sûr, rapide ET propre — sans effort humain répété."
    },
    16: {
      titre: "les trois espaces, cloisonnés",
      etat: "Le catalogue est navigable. On ouvre les espaces des trois profils, chacun protégé.",
      objectif: "Crée /client (ses locations/achats), /vendeur (stocks, retards), /gestion (comptes, promotions) — chaque zone/contrôleur protégé par la bonne policy ([Authorize]). Aucune logique métier nouvelle : on orchestre les services existants.",
      hints: [
        "[Authorize(Policy = \"GererCatalogue\")] sur le contrôleur vendeur ; policy Admin sur gestion.",
        "Espace client filtré par l'utilisateur courant ; promotion réservée à l'admin.",
        "Réutilise JeuService.LouerAsync/AcheterAsync et les requêtes (leçons 5-12)."
      ],
      solution: `[Authorize]                                    // espace client (par ressource)
public class ClientController : Controller {
    public async Task<IActionResult> Index() {
        var uid = _userManager.GetUserId(User);
        return View(new EspaceClientVm(
            await _db.Locations.Where(l => l.ClientId == uid).Include(l => l.Jeu).ToListAsync(),
            await _db.Achats.Where(a => a.ClientId == uid).Include(a => a.Jeu).ToListAsync()));
    }
}
[Authorize(Roles = "Admin")]                   // gestion (par rôle)
public class GestionController : Controller {
    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Promouvoir(string id) { ... }
}
// test : loginAs(client); GET /gestion -> Forbidden`,
      note: "Les espaces n'ajoutent aucune règle métier : ils orchestrent les services et requêtes déjà écrits et testés (leçons 5-15). C'est le dividende d'une architecture en couches montée proprement — la dernière ligne droite assemble, elle ne réinvente pas. Chaque espace a son test de refus croisé, verrouillé par la CI : la matrice « qui accède à quoi » est prouvée, pas supposée."
    },
    17: {
      titre: "l'image de production, durcie",
      etat: "L'application est finie. On fabrique l'artefact qui partira en prod : léger, non-root, scanné.",
      objectif: "Écris le Dockerfile multi-stage de production (SDK pour build/publish, runtime aspnet slim), utilisateur non-root, et ajoute le scan d'image (trivy) au pipeline. Compare la taille et vérifie qu'aucune faille critique ne passe.",
      hints: [
        "Étage build : mcr.microsoft.com/dotnet/sdk:8.0, dotnet publish -c Release ; final : dotnet/aspnet:8.0.",
        "USER app (non-root, fourni par l'image aspnet) ; COPY du seul output publié.",
        "ci.yml : trivy image --exit-code 1 --severity CRITICAL (cours Sécurité l.16, Docker l.15-16)."
      ],
      solution: `# Dockerfile (production)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY *.sln .
COPY src/Ludotheque/*.csproj src/Ludotheque/
RUN dotnet restore
COPY . .
RUN dotnet publish src/Ludotheque -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
USER app                          # non-root (fourni par l'image aspnet)
EXPOSE 8080
ENTRYPOINT ["dotnet","Ludotheque.dll"]`,
      note: "L'image de prod applique d'un coup le cours Docker (multi-stage, non-root) et le cours Sécurité (moindre privilège, scan CVE). L'étage build contient le SDK complet ; l'étage final ne garde que le runtime aspnet + l'output publié (self-contained trimmé), bien plus léger. L'image aspnet fournit un utilisateur `app` non-root prêt à l'emploi. Vérifiée par trivy à chaque build : une faille critique bloque la livraison. L'artefact qui part en prod est un objet de confiance."
    },
    18: {
      titre: "le pipeline complet",
      etat: "L'image est prête. On assemble le pipeline de bout en bout et on verrouille main.",
      objectif: "Complète la CI (tests + qualité format + sécurité gitleaks + build image + smoke test) et le workflow de release (tag v* -> build, scan, push au registre). Verrouille la protection de branche : rien ne merge sans tout au vert + revue.",
      hints: [
        "ci.yml : jobs tests, qualite (dotnet format), securite (gitleaks) en parallèle -> image (needs).",
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
      note: "Le pipeline réunit les trois cours d'outillage : CI/CD (structure, protection), Docker (image), Sécurité (scans). Un commit tagué déclenche build + scan + push d'un artefact versionné et immuable. La barrière de branche garantit que main est toujours déployable — la promesse devient une propriété mécanique du dépôt. Et la durée compte : caches NuGet et parallélisme gardent le pipeline sous 10 min, condition de son adoption."
    },
    19: {
      titre: "le déploiement automatisé",
      etat: "L'image est publiée. Le dernier maillon : le serveur se met à jour tout seul, et on le vérifie.",
      objectif: "Écris le job de déploiement (SSH vers le serveur, compose pull + up -d + migrations), appuie-toi sur /health (Health Checks), et pose deux environnements (staging au merge, production sur tag avec approbation). Termine par un curl /health qui valide.",
      hints: [
        "deployer needs publier ; ssh -i (clé) 'cd /srv/ludo && docker compose pull && up -d' (migrations au démarrage).",
        "/health fourni par Health Checks (avec une sonde base) -> 200 Healthy ou 503 ; curl -fs avec retries.",
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
      - run: sleep 12 && curl -fs https://ludotheque.example.com/health

# les migrations EF sont appliquées au démarrage (context.Database.Migrate())
# ou par un job dédié 'dotnet ef database update' avant le up.`,
      note: "Le déploiement rejoue au robot ce qu'on ferait à la main : pull, up, puis vérifie /health. Les migrations EF sont appliquées au démarrage de l'app (Database.Migrate) ou par une étape dédiée. Staging se met à jour au merge, la production exige un tag ET une approbation. On ne se connecte plus jamais au serveur pour livrer : un git push origin v1.0.0, et l'application se déploie et se vérifie seule. Health Checks rend la vérification triviale à câbler."
    },
    20: {
      titre: "observer, sauvegarder, protéger, revenir",
      etat: "Le projet est en ligne. On installe les filets de la vie en production.",
      objectif: "Mets en place l'observabilité (logs structurés ILogger sans secret, /health), les sauvegardes chiffrées de la base (planifiées et testées), la conformité RGPD (export, anonymisation, durées) et la procédure de rollback (tag précédent, migrations N-1).",
      hints: [
        "_logger.LogInformation() : événements de sécurité, jamais de mot de passe/jeton (cours Sécurité l.13).",
        "Sauvegarde : mysqldump chiffré (gpg), clé séparée, restauration testée (Docker l.8).",
        "RGPD : ExporterMesDonnees, anonymiser ; rollback = redéployer le tag précédent (N-1)."
      ],
      solution: `// Observabilité : logs structurés (après commit, sans secret)
_logger.LogInformation("Location jeu={JeuId} client={ClientId}", jeuId, client.Id);
// en conteneur : logs sur stdout, collectés par Docker ; /health surveillé

# Sauvegarde chiffrée, planifiée et TESTÉE
docker compose exec bdd mysqldump ... | gpg --encrypt -r sauvegarde@ludo > backup.sql.gpg

// RGPD (cours Sécurité l.18)
public async Task SupprimerMonCompteAsync(Utilisateur u) {
    await AnonymiserLocationsAsync(u);   // garder les stats, retirer l'identité
    await _userManager.DeleteAsync(u);
}
# Rollback : image tag précédent + up -d (migrations compatibles N-1, CI/CD l.19)`,
      note: "La production n'est pas la fin, c'est un état à tenir : observer (logs structurés, /health), sauvegarder (chiffré, testé), respecter les données (RGPD) et pouvoir revenir (rollback N-1). Le rollback du CODE est trivial (image immuable) ; le vrai sujet est le SCHÉMA : une rupture (renommer une colonne) se fait en plusieurs migrations additives (ajouter, basculer, supprimer), jamais d'un coup, pour que reculer d'une version ne casse rien. Ces filets, appris séparément, sont ici tous en place."
    },
    21: {
      titre: "🎓 le projet professionnel de bout en bout",
      etat: "La Ludothèque pro est construite, conteneurisée, testée, sécurisée, livrée et surveillée — comme en entreprise.",
      objectif: "Exercice de synthèse : raconte le trajet complet d'une fonctionnalité, de la branche Git au /health vert en production, en montrant qu'à CHAQUE étape le métier, l'industrialisation et la sécurité avancent ensemble.",
      hints: [
        "Branche -> code + test écrits ensemble -> CI (tests+format+gitleaks+image) -> revue -> merge.",
        "Staging auto -> recette -> tag -> build+scan+push -> approbation -> prod -> /health.",
        "À chaque case : ce qui est construit, ce qui l'industrialise, ce qui le sécurise."
      ],
      solution: `LE TRAJET D'UNE FONCTIONNALITÉ (Ludothèque pro, C# · ASP.NET Core)

git switch -c feature/reservation
  service métier + test écrits ENSEMBLE               [construire + tester]
  DataAnnotations (validation), policy (autorisation)  [sécuriser]
  push -> CI : tests+MySQL, dotnet format, gitleaks, build+scan [industrialiser+sécuriser]
  revue -> merge (protection de branche)             [industrialiser]
  -> STAGING auto -> recette
git tag v1.3.0
  -> build, scan CVE, push registre                  [industrialiser+sécuriser]
  -> approbation -> déploiement prod (pull/up/migrate)
  -> curl /health 200 ; logs et sauvegardes en place  [exploiter]

À aucun moment le métier n'avance sans son test ni sa protection :
construire, industrialiser, sécuriser — les trois disciplines, en même temps.`,
      note: "🎓 C'est l'aboutissement de toute la formation : non plus « construire, puis outiller », mais construire EN outillant — le métier, les tests, la sécurité et la livraison qui avancent d'un même pas. C'est exactement le quotidien d'une équipe professionnelle. Si tu sais mener ce trajet, en C# · ASP.NET comme en n'importe quelle pile, tu sais livrer du logiciel pour de vrai."
    }
  }
};
