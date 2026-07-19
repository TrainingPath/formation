/* ===== Fil rouge « La Ludothèque » — cours ASP.NET Core (21 étapes) =====
   Même application que dans tous les cours, en version API/WEB (C# / ASP.NET Core).
   Ludothèque de jeux de société : catalogue, 3 rôles (client, vendeur,
   administrateur), achat ET location. Architecture en couches, API REST + EF Core. */
var FIL = {
  prefix: "dotnet21",
  app: "La Ludothèque",
  placeholder: "Écris ton code C# / ASP.NET ici…",
  etapes: {
    1: {
      titre: "le projet et le premier endpoint",
      etat: "Rien n'existe. On crée le projet ASP.NET Core et un premier endpoint qui présente la ludothèque.",
      objectif: "Crée le projet (dotnet new webapi) et un endpoint minimal GET « / » renvoyant « Bienvenue à la Ludothèque ».",
      hints: [
        "dotnet new webapi -n Ludotheque",
        "app.MapGet(\"/\", () => \"...\"); dans Program.cs"
      ],
      solution: `// Program.cs
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Bienvenue à la Ludothèque — achat & location de jeux");

app.Run();`,
      note: "ASP.NET Core démarre un serveur web (Kestrel). MapGet expose une URL en « minimal API ». Comme Spring, .NET est d'abord orienté API JSON. Django/Laravel penchent côté pages."
    },
    2: {
      titre: "l'injection de dépendances",
      etat: "Posons dès maintenant la pratique clé de .NET : enregistrer et injecter les services.",
      objectif: "Crée un CatalogueService, enregistre-le dans le conteneur DI (builder.Services), et fais-le injecter dans un endpoint.",
      hints: [
        "builder.Services.AddScoped<CatalogueService>();",
        "app.MapGet(\"/etat\", (CatalogueService s) => s.Message());"
      ],
      solution: `class CatalogueService
{
    public string Message() => "Catalogue prêt";
}

// Program.cs
builder.Services.AddScoped<CatalogueService>();   // enregistrement
app.MapGet("/etat", (CatalogueService s) => s.Message());  // injection`,
      note: "Le conteneur DE .NET crée et fournit les services. On les enregistre (AddScoped) puis .NET les injecte là où on les demande. Même philosophie que Spring ; plus explicite que Django/Laravel."
    },
    3: {
      titre: "les services et leurs durées de vie",
      etat: "Faisons du service la source des jeux (en dur pour l'instant).",
      objectif: "Dans CatalogueService, renvoie une liste de jeux (record Jeu). Choisis une durée de vie adaptée (Scoped) et expose la liste.",
      hints: [
        "record Jeu(string Nom, double Prix, int Stock);",
        "AddSingleton (une instance), AddScoped (par requête), AddTransient (à chaque fois)."
      ],
      solution: `record Jeu(string Nom, double Prix, int Stock);

class CatalogueService
{
    public List<Jeu> Tous() => new()
    {
        new Jeu("Catan", 44.9, 3),
        new Jeu("Azul", 39.9, 5),
    };
}`,
      note: "Les durées de vie (Singleton/Scoped/Transient) contrôlent quand un service est recréé. Le record C# (immuable) est idéal pour un DTO. Bientôt ces jeux viendront de la base."
    },
    4: {
      titre: "l'API REST du catalogue",
      etat: "Exposons le catalogue en JSON via un contrôleur.",
      objectif: "Crée un [ApiController] avec GET /jeux qui renvoie la liste des jeux : ASP.NET la sérialise en JSON.",
      hints: [
        "[ApiController] [Route(\"jeux\")] sur la classe.",
        "[HttpGet] public IEnumerable<Jeu> Liste() => _service.Tous();"
      ],
      solution: `[ApiController]
[Route("jeux")]
public class JeuController : ControllerBase
{
    private readonly CatalogueService _service;
    public JeuController(CatalogueService service) => _service = service;

    [HttpGet]
    public IEnumerable<Jeu> Liste() => _service.Tous();  // -> JSON
}`,
      note: "[ApiController] active les conventions d'API ; retourner des objets produit du JSON automatiquement. Django utilise DRF, Laravel renvoie un modèle, Spring un @RestController."
    },
    5: {
      titre: "détail et recherche",
      etat: "Ajoutons l'accès à un jeu précis et la recherche.",
      objectif: "Ajoute GET /jeux/{id} (route param) et GET /jeux?q=... (query string) pour filtrer par nom.",
      hints: [
        "[HttpGet(\"{id}\")] public Jeu Detail(int id) {...}",
        "[HttpGet] public ... Rechercher([FromQuery] string? q)"
      ],
      solution: `[HttpGet("{id}")]
public ActionResult<Jeu> Detail(int id)
{
    var jeux = _service.Tous();
    if (id < 1 || id > jeux.Count) return NotFound();
    return jeux[id - 1];
}

[HttpGet]
public IEnumerable<Jeu> Rechercher([FromQuery] string? q) =>
    _service.Tous().Where(j => q == null || j.Nom.Contains(q, StringComparison.OrdinalIgnoreCase));`,
      note: "La route {id} lie un segment d'URL ; [FromQuery] lit la query string (?q=cat). NotFound() renvoie 404. Django : <int:id> + request.GET ; Spring : @PathVariable/@RequestParam."
    },
    6: {
      titre: "créer un jeu (POST + JSON)",
      etat: "Rendons l'API capable de recevoir des données.",
      objectif: "Ajoute POST /jeux qui reçoit un jeu en JSON ([FromBody], model binding) et le renvoie (création simulée).",
      hints: [
        "[HttpPost] public IActionResult Creer([FromBody] Jeu jeu)",
        "return CreatedAtAction(...) pour un 201."
      ],
      solution: `[HttpPost]
public ActionResult<Jeu> Creer([FromBody] Jeu jeu)
{
    // persistance a la lecon 9 ; ici on renvoie l'objet cree
    return CreatedAtAction(nameof(Detail), new { id = 1 }, jeu);
}
// POST /jeux  { "nom": "7 Wonders", "prix": 49.9, "stock": 4 }`,
      note: "Le model binding transforme le JSON reçu en objet C# ([FromBody]). CreatedAtAction renvoie 201 + l'URL de la ressource. Spring : @RequestBody ; Laravel : $request."
    },
    7: {
      titre: "l'architecture en couches",
      etat: "Structurons proprement : contrôleur, service, et bientôt repository.",
      objectif: "Sépare les responsabilités : le contrôleur (HTTP) délègue au service (métier), qui déléguera au repository/DbContext (données). Prépare une entité Jeu.",
      hints: [
        "Controller -> Service -> Repository/DbContext.",
        "L'entité Jeu deviendra une classe mappée par EF Core à la leçon 8."
      ],
      solution: `// Couche API : JeuController -> délègue au service
// Couche métier : CatalogueService -> logique, appelle le repo
// Couche données : LudoDbContext (EF Core) -> accès base

// Le contrôleur ne dépend QUE d'abstractions injectées :
// public JeuController(ICatalogueService service) => ...
// -> testable, remplaçable, découplé.`,
      note: "L'architecture en couches (API / métier / données) isole les rôles. Programmer contre des interfaces (ICatalogueService) facilite les tests. Très proche de Spring."
    },
    8: {
      titre: "le DbContext et l'entité Jeu (EF Core)",
      etat: "Passons aux vraies données avec Entity Framework Core.",
      objectif: "Crée une entité Jeu (Id, Nom, PrixAchat, PrixLocation, Stock) et un LudoDbContext avec un DbSet<Jeu>. Enregistre le contexte dans la DI.",
      hints: [
        "class Jeu { public int Id { get; set; } public string Nom { get; set; } ... }",
        "builder.Services.AddDbContext<LudoDbContext>(...);"
      ],
      solution: `public class Jeu
{
    public int Id { get; set; }
    public string Nom { get; set; } = "";
    public double PrixAchat { get; set; }
    public double PrixLocation { get; set; }
    public int Stock { get; set; }
}

public class LudoDbContext : DbContext
{
    public LudoDbContext(DbContextOptions<LudoDbContext> o) : base(o) {}
    public DbSet<Jeu> Jeux => Set<Jeu>();
}`,
      note: "EF Core est l'ORM de .NET : le DbContext représente la base, chaque DbSet une table. C'est l'équivalent des modèles Django, d'Eloquent (Laravel) et de JPA (Spring)."
    },
    9: {
      titre: "migrations et CRUD",
      etat: "Créons la table et manipulons les jeux sans SQL.",
      objectif: "Génère la migration et applique-la, puis fais lister/créer/supprimer des jeux via le DbContext.",
      hints: [
        "dotnet ef migrations add Init ; dotnet ef database update",
        "_db.Jeux.ToList(), _db.Jeux.Add(jeu), _db.SaveChanges()"
      ],
      solution: `// terminal
// dotnet ef migrations add Init
// dotnet ef database update

[HttpGet]
public IEnumerable<Jeu> Liste() => _db.Jeux.ToList();

[HttpPost]
public ActionResult<Jeu> Creer(Jeu jeu)
{
    _db.Jeux.Add(jeu);
    _db.SaveChanges();               // écrit en base
    return CreatedAtAction(nameof(Detail), new { id = jeu.Id }, jeu);
}`,
      note: "Les migrations EF Core créent/mettent à jour le schéma ; SaveChanges valide les écritures. Django : makemigrations/migrate ; Laravel : migrate ; Spring : ddl-auto."
    },
    10: {
      titre: "requêtes LINQ sur la base",
      etat: "Ajoutons recherche, filtre « en stock » et tri.",
      objectif: "Avec LINQ sur le DbSet, renvoie les jeux en stock, une recherche par nom et un tri par prix. EF Core traduit en SQL.",
      hints: [
        "_db.Jeux.Where(j => j.Stock > 0).OrderBy(j => j.PrixLocation)",
        "Ajoute .Where(j => j.Nom.Contains(q)) si q est fourni."
      ],
      solution: `[HttpGet]
public IEnumerable<Jeu> Liste([FromQuery] string? q)
{
    var query = _db.Jeux.Where(j => j.Stock > 0);
    if (!string.IsNullOrEmpty(q))
        query = query.Where(j => j.Nom.Contains(q));
    return query.OrderBy(j => j.PrixLocation).ToList();
}`,
      note: "LINQ (Where, OrderBy) s'écrit en C# et EF Core le traduit en SQL, exécuté au ToList(). C'est le pendant des QuerySets Django, du Query Builder Laravel et de Spring Data."
    },
    11: {
      titre: "relations entre entités",
      etat: "Le cœur métier : relions jeux, clients et transactions.",
      objectif: "Ajoute une entité Categorie (Jeu y référence une FK + propriété de navigation), un Utilisateur (avec rôle) et une Transaction (Jeu + Client + type achat/location).",
      hints: [
        "public int CategorieId { get; set; } public Categorie? Categorie { get; set; }",
        "public List<Transaction> Transactions { get; set; } = new();"
      ],
      solution: `public class Transaction
{
    public int Id { get; set; }
    public int JeuId { get; set; }
    public Jeu? Jeu { get; set; }                 // navigation
    public int ClientId { get; set; }
    public Utilisateur? Client { get; set; }
    public string Type { get; set; } = "location"; // achat / location
    public double Montant { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
}
// dans Jeu : public List<Transaction> Transactions { get; set; } = new();`,
      note: "Les propriétés de navigation + clés étrangères (JeuId/Jeu) déclarent les relations ; EF Core gère les jointures. Django : ForeignKey ; Laravel : belongsTo ; Spring : @ManyToOne."
    },
    12: {
      titre: "valider avec les DataAnnotations",
      etat: "Encadrons la création d'un jeu par une validation.",
      objectif: "Ajoute des DataAnnotations sur le modèle (nom requis, prix positifs, stock >= 0). Avec [ApiController], un corps invalide renvoie 400 automatiquement.",
      hints: [
        "[Required] public string Nom { get; set; }",
        "[Range(0, double.MaxValue)] public double PrixLocation { get; set; }"
      ],
      solution: `public class JeuDto
{
    [Required, StringLength(120)]
    public string Nom { get; set; } = "";
    [Range(0, double.MaxValue)] public double PrixAchat { get; set; }
    [Range(0.01, double.MaxValue)] public double PrixLocation { get; set; }
    [Range(0, int.MaxValue)] public int Stock { get; set; }
}
// [ApiController] déclenche la réponse 400 si le DTO est invalide
[HttpPost] public IActionResult Creer(JeuDto dto) { /* ... */ return Ok(); }`,
      note: "Les DataAnnotations ([Required], [Range]) décrivent les règles ; [ApiController] rejette automatiquement un corps invalide (400). Django : ModelForm ; Laravel : validate ; Spring : Bean Validation."
    },
    13: {
      titre: "gérer les erreurs proprement",
      etat: "Louer un jeu en rupture ou demander un id inexistant doit renvoyer une erreur claire.",
      objectif: "Renvoie des réponses d'erreur normalisées (ProblemDetails) : 404 pour un jeu introuvable, 409 pour un stock insuffisant.",
      hints: [
        "return NotFound() ; return Problem(statusCode: 409, detail: \"...\");",
        "Ou un middleware/filtre d'exception global."
      ],
      solution: `[HttpPost("{id}/louer")]
public IActionResult Louer(int id)
{
    var jeu = _db.Jeux.Find(id);
    if (jeu is null)
        return NotFound(new { erreur = $"Jeu {id} introuvable" });
    if (jeu.Stock <= 0)
        return Problem(statusCode: 409, detail: "Stock insuffisant");
    // ... location ...
    return NoContent();
}`,
      note: "NotFound/Problem produisent des réponses HTTP normalisées (ProblemDetails). On peut aussi centraliser via un middleware d'exception. Spring : @ControllerAdvice ; Django : handlers."
    },
    14: {
      titre: "configuration et environnements",
      etat: "Séparons la configuration du code, avec un réglage par environnement.",
      objectif: "Range les réglages dans appsettings.json, lis-les via IConfiguration, et utilise appsettings.Development.json + variables d'environnement pour les secrets.",
      hints: [
        "appsettings.json : { \"Ludo\": { \"Nom\": \"La Ludotheque\" } }",
        "builder.Configuration[\"Ludo:Nom\"] ; secrets via variables d'env."
      ],
      solution: `// appsettings.json
// { "Ludo": { "Nom": "La Ludotheque" },
//   "ConnectionStrings": { "Db": "..." } }

var nom = builder.Configuration["Ludo:Nom"];
var cs  = builder.Configuration.GetConnectionString("Db");

// appsettings.Development.json surcharge en dev
// secrets : dotnet user-secrets ou variables d'environnement`,
      note: "appsettings.json + IConfiguration séparent config et code ; les fichiers par environnement et les user-secrets gèrent le reste. Django : os.environ ; Spring : application.properties."
    },
    15: {
      titre: "tester l'API",
      etat: "Sécurisons les évolutions avec des tests automatiques.",
      objectif: "Écris un test d'intégration (WebApplicationFactory + xUnit) : GET /jeux répond 200.",
      hints: [
        "WebApplicationFactory<Program> crée un serveur de test.",
        "var res = await client.GetAsync(\"/jeux\"); res.EnsureSuccessStatusCode();"
      ],
      solution: `public class JeuTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    public JeuTests(WebApplicationFactory<Program> f) => _client = f.CreateClient();

    [Fact]
    public async Task Liste_Repond_200()
    {
        var res = await _client.GetAsync("/jeux");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }
}`,
      note: "WebApplicationFactory lance l'API en mémoire pour la tester de bout en bout. Assert vérifie le résultat. Équivalent de MockMvc (Spring) et de self.client (Django)."
    },
    16: {
      titre: "authentification par JWT",
      etat: "La ludothèque devient sécurisée : protégeons les endpoints avec des jetons.",
      objectif: "Active l'authentification JWT : le catalogue en lecture reste public, mais créer/modifier exige un jeton valide ([Authorize]).",
      hints: [
        "builder.Services.AddAuthentication(...).AddJwtBearer(...);",
        "[Authorize] sur les actions protégées ; [AllowAnonymous] sur GET."
      ],
      solution: `// Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { /* clé, issuer, audience */ });
app.UseAuthentication();
app.UseAuthorization();

// contrôleur
[HttpGet, AllowAnonymous] public IEnumerable<Jeu> Liste() => ...;
[HttpPost, Authorize]     public IActionResult Creer(JeuDto dto) => ...;`,
      note: "JWT : le client envoie un jeton signé à chaque requête ; [Authorize] exige un jeton valide. Le hachage des mots de passe passe par Identity. Django/Laravel/Spring ont leurs propres modules."
    },
    17: {
      titre: "les 3 rôles et leurs droits",
      etat: "Client, vendeur, administrateur n'ont pas les mêmes droits.",
      objectif: "Ajoute les rôles au jeton et restreins les endpoints : gérer le stock au Vendeur/Admin, les statistiques à l'Admin, via [Authorize(Roles=...)].",
      hints: [
        "[Authorize(Roles = \"Vendeur,Admin\")] sur la gestion du stock.",
        "[Authorize(Roles = \"Admin\")] sur les stats."
      ],
      solution: `[HttpPost("{id}/stock")]
[Authorize(Roles = "Vendeur,Admin")]
public IActionResult MajStock(int id, [FromQuery] int stock)
{
    var jeu = _db.Jeux.Find(id);
    if (jeu is null) return NotFound();
    jeu.Stock = stock;
    _db.SaveChanges();
    return NoContent();
}

[HttpGet("admin/stats"), Authorize(Roles = "Admin")]
public IActionResult Stats() => Ok(_service.Stats());`,
      note: "[Authorize(Roles=...)] vérifie le rôle porté par le jeton AVANT d'exécuter l'action. Authentification puis autorisation. Spring : @PreAuthorize ; Laravel : middleware ; Django : rôle + 403."
    },
    18: {
      titre: "une page HTML (Razor Pages)",
      etat: "En plus de l'API JSON, offrons une vraie page web du catalogue.",
      objectif: "Avec Razor Pages, crée une page Catalogue qui liste les jeux (foreach), alimentée par le service.",
      hints: [
        "PageModel avec une propriété List<Jeu> Jeux ; OnGet() la remplit.",
        "Dans le .cshtml : @foreach (var jeu in Model.Jeux) { ... }"
      ],
      solution: `// Catalogue.cshtml.cs
public class CatalogueModel : PageModel
{
    private readonly CatalogueService _service;
    public CatalogueModel(CatalogueService s) => _service = s;
    public List<Jeu> Jeux { get; private set; } = new();
    public void OnGet() => Jeux = _service.Tous();
}
// Catalogue.cshtml
// @foreach (var jeu in Model.Jeux) { <li>@jeu.Nom — @jeu.Prix €</li> }`,
      note: "Razor Pages rend du HTML côté serveur (@foreach). C'est le pendant des templates DTL (Django), Blade (Laravel) et Thymeleaf (Spring)."
    },
    19: {
      titre: "documentation et logs (Swagger)",
      etat: "Rendons l'API documentée et traçable.",
      objectif: "Active Swagger (documentation interactive de l'API) et journalise chaque location avec ILogger.",
      hints: [
        "builder.Services.AddEndpointsApiExplorer(); AddSwaggerGen(); app.UseSwagger()/UseSwaggerUI().",
        "ILogger<JeuController> injecté ; _logger.LogInformation(...)."
      ],
      solution: `// Program.cs
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
app.UseSwagger();
app.UseSwaggerUI();      // interface interactive sur /swagger

// contrôleur
private readonly ILogger<JeuController> _logger;
_logger.LogInformation("Location du jeu {Id}", id);`,
      note: "Swagger génère une documentation interactive de l'API (tester les endpoints depuis le navigateur). ILogger trace les événements. Spring : Actuator + Logger ; Django : logging."
    },
    20: {
      titre: "🏁 assembler la Ludothèque",
      etat: "Toutes les briques existent : réunissons-les en une API cohérente.",
      objectif: "Assemble l'endpoint de location : vérifie le stock, crée la Transaction et décrémente le stock via EF Core (SaveChanges), pour un utilisateur authentifié.",
      hints: [
        "Trouver le jeu, tester le stock, créer la Transaction, décrémenter, SaveChanges.",
        "Réutilise les entités (leçon 11) et [Authorize] (leçon 16)."
      ],
      solution: `[HttpPost("{id}/louer")]
[Authorize]
public IActionResult Louer(int id)
{
    var jeu = _db.Jeux.Find(id);
    if (jeu is null) return NotFound();
    if (jeu.Stock <= 0) return Problem(statusCode: 409, detail: "Indisponible");

    jeu.Stock--;
    _db.Transactions.Add(new Transaction
    {
        JeuId = jeu.Id,
        ClientId = int.Parse(User.FindFirst("id")!.Value),
        Type = "location",
        Montant = jeu.PrixLocation
    });
    _db.SaveChanges();          // stock + transaction validés ensemble
    return NoContent();
}`,
      note: "Une API complète : contrôleurs, services, EF Core, validation, JWT et rôles. Un seul SaveChanges valide le décrément du stock ET la Transaction dans la même unité de travail."
    },
    21: {
      titre: "🎓 étendre l'application",
      etat: "Épreuve finale : ajoute une fonctionnalité de bout en bout.",
      objectif: "Ajoute un endpoint de statistiques administrateur : nombre de transactions et chiffre d'affaires total (LINQ Count/Sum), réservé au rôle Admin.",
      hints: [
        "_db.Transactions.Count() et _db.Transactions.Sum(t => t.Montant)",
        "[Authorize(Roles = \"Admin\")] sur l'endpoint."
      ],
      solution: `[HttpGet("admin/stats")]
[Authorize(Roles = "Admin")]
public IActionResult Stats()
{
    var stats = new
    {
        Transactions = _db.Transactions.Count(),
        ChiffreAffaires = _db.Transactions.Sum(t => t.Montant)
    };
    return Ok(stats);
}`,
      note: "Tu réunis EF Core (Count, Sum), JWT et rôles : la synthèse du cours. Compare cet endpoint à sa version Django, Laravel et Spring — même app, quatre frameworks, un seul domaine métier."
    }
  }
};
