/* ===== Fil rouge « La Ludothèque » — capstone full-stack (C# · ASP.NET Core · SQL Server) =====
   Le grand assemblage : on construit l'application COMPLÈTE de la Ludothèque en
   réunissant le langage (C#), le framework (ASP.NET Core) et la base (SQL Server).
   Catalogue, 3 rôles (client, vendeur, administrateur), achat ET location,
   architecture en couches, API REST, sécurité (JWT), tests et déploiement. */
var FIL = {
  prefix: "projcsharp21",
  app: "La Ludothèque",
  placeholder: "Écris ton code C#/ASP.NET Core ici…",
  etapes: {
    1: {
      titre: "l'architecture du projet",
      etat: "On part d'une feuille blanche, mais on connaît déjà le domaine (la Ludothèque). Avant de coder, on pose l'architecture en couches.",
      objectif: "Décris l'architecture en couches de l'application : Controller → Service → DbContext (EF Core) → SQL Server, plus les dossiers Models (entités) et DTOs. Explique le rôle de chaque couche en une ligne.",
      hints: [
        "Couches : Controllers (API), Services (métier), Data (DbContext + EF Core).",
        "Le controller ne parle jamais à la base : il passe par le service, qui utilise le DbContext.",
        "Organise en dossiers : Controllers, Services, Data, Models, DTOs."
      ],
      solution: `Ludotheque.Api
├── Controllers   // [ApiController] : reçoit les requêtes HTTP
├── Services      // logique métier (louer, acheter, stocks)
├── Data          // AppDbContext (EF Core) : accès SQL Server
├── Models        // entités : Jeu, Categorie, Fournisseur, Utilisateur
└── DTOs          // objets d'échange avec le client (pas les entités)

// Flux : HTTP -> Controller -> Service -> DbContext (EF Core) -> SQL Server`,
      note: "L'architecture en couches sépare les responsabilités : le controller gère HTTP, le service la logique métier, le DbContext la persistance. Cette séparation, vue en cours ASP.NET Core, est la colonne vertébrale de tout le projet."
    },
    2: {
      titre: "le projet connecté à SQL Server",
      etat: "L'architecture est posée. On crée le projet et on le branche sur SQL Server.",
      objectif: "Configure la chaîne de connexion SQL Server dans appsettings.json et enregistre le DbContext dans Program.cs. Ajoute un endpoint /ping qui renvoie « pong ».",
      hints: [
        "appsettings.json : \"ConnectionStrings\": { \"Default\": \"Server=...;Database=Ludotheque;...\" }.",
        "Program.cs : builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlServer(...)).",
        "app.MapGet(\"/ping\", () => \"pong\")."
      ],
      solution: `// appsettings.json
"ConnectionStrings": {
  "Default": "Server=localhost;Database=Ludotheque;Trusted_Connection=True;TrustServerCertificate=True"
}

// Program.cs
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

app.MapGet("/ping", () => "pong");`,
      note: "La chaîne de connexion pointe SQL Server ; AddDbContext enregistre EF Core dans le conteneur d'injection de dépendances. Les secrets de production ne resteront pas ici mais viendront de variables d'environnement (leçon 19). L'endpoint /ping confirme que l'application démarre."
    },
    3: {
      titre: "du MCD Merise aux entités EF Core",
      etat: "L'application démarre à vide. On crée le schéma de la Ludothèque via les entités EF Core et une migration.",
      objectif: "Écris l'entité Jeu (avec les deux stocks et les clés étrangères) et déclare son DbSet dans AppDbContext, puis indique les commandes qui créent et appliquent la migration.",
      hints: [
        "Une classe C# par table ; clés étrangères par propriétés de navigation.",
        "public DbSet<Jeu> Jeux => Set<Jeu>(); dans AppDbContext.",
        "dotnet ef migrations add Init ; dotnet ef database update."
      ],
      solution: `public class Jeu {
    public int Id { get; set; }
    public string Titre { get; set; } = "";
    public decimal PrixAchat { get; set; }
    public decimal PrixLocation { get; set; }
    public int StockVente { get; set; }
    public int StockLocation { get; set; }
    public int CategorieId { get; set; }
    public Categorie? Categorie { get; set; }
    public int? FournisseurId { get; set; }
}

// AppDbContext
public DbSet<Jeu> Jeux => Set<Jeu>();

// commandes
// dotnet ef migrations add Init
// dotnet ef database update`,
      note: "EF Core utilise le « code first » : on écrit les entités C#, puis les migrations génèrent le schéma SQL Server. Les propriétés de navigation (Categorie) matérialisent les clés étrangères du MCD. dotnet ef migrations add + database update créent et appliquent le schéma, versionné dans Git."
    },
    4: {
      titre: "les entités du catalogue",
      etat: "Le schéma existe. On complète les entités et leurs relations.",
      objectif: "Écris les entités Categorie (avec une collection de Jeux) et Fournisseur, et ajoute leurs DbSet au AppDbContext.",
      hints: [
        "public class Categorie { public int Id; public string Libelle; public List<Jeu> Jeux; }",
        "Propriété de navigation inverse : List<Jeu> côté Categorie.",
        "DbSet<Categorie> Categories, DbSet<Fournisseur> Fournisseurs."
      ],
      solution: `public class Categorie {
    public int Id { get; set; }
    public string Libelle { get; set; } = "";
    public List<Jeu> Jeux { get; set; } = new();
}
public class Fournisseur {
    public int Id { get; set; }
    public string Nom { get; set; } = "";
}

// AppDbContext
public DbSet<Categorie> Categories => Set<Categorie>();
public DbSet<Fournisseur> Fournisseurs => Set<Fournisseur>();`,
      note: "Les entités reflètent le MCD : Categorie possède plusieurs Jeux (relation 1:N), matérialisée par la collection List<Jeu>. EF Core déduit les clés étrangères des propriétés de navigation. Chaque DbSet expose une table interrogeable en LINQ."
    },
    5: {
      titre: "interroger avec LINQ",
      etat: "Les entités sont prêtes. On interroge la base en LINQ, sans SQL manuel.",
      objectif: "Écris deux requêtes LINQ (async) : les jeux disponibles à la location (StockLocation > 0) et les jeux d'une catégorie triés par prix de location.",
      hints: [
        "await _db.Jeux.Where(j => j.StockLocation > 0).ToListAsync().",
        "OrderBy(j => j.PrixLocation).",
        "Include(j => j.Categorie) pour charger la relation."
      ],
      solution: `var louables = await _db.Jeux
    .Where(j => j.StockLocation > 0)
    .Include(j => j.Categorie)
    .ToListAsync();

var parCategorie = await _db.Jeux
    .Where(j => j.CategorieId == id)
    .OrderBy(j => j.PrixLocation)
    .ToListAsync();`,
      note: "LINQ traduit des expressions C# en SQL exécuté sur SQL Server : Where devient WHERE, OrderBy devient ORDER BY. Les méthodes async (ToListAsync) libèrent le thread pendant l'attente de la base. Include précharge une relation (évite le N+1, leçon 19)."
    },
    6: {
      titre: "la couche service et les règles métier",
      etat: "On sait interroger. On encapsule les règles métier dans une couche service.",
      objectif: "Crée un CatalogueService (injecté avec AppDbContext) avec une méthode JeuxLouablesAsync() et une méthode AjouterStockLocationAsync(id, quantite) qui modifie le stock et sauvegarde.",
      hints: [
        "Injecter AppDbContext par le constructeur.",
        "Charger le jeu avec FindAsync, modifier StockLocation, SaveChangesAsync.",
        "Lever une exception si le jeu est introuvable."
      ],
      solution: `public class CatalogueService {
    private readonly AppDbContext _db;
    public CatalogueService(AppDbContext db) => _db = db;

    public Task<List<Jeu>> JeuxLouablesAsync() =>
        _db.Jeux.Where(j => j.StockLocation > 0).ToListAsync();

    public async Task AjouterStockLocationAsync(int id, int quantite) {
        var jeu = await _db.Jeux.FindAsync(id)
            ?? throw new KeyNotFoundException("Jeu introuvable");
        jeu.StockLocation += quantite;
        await _db.SaveChangesAsync();
    }
}`,
      note: "Le service porte la logique métier et l'isole du web et de la base. SaveChangesAsync valide les modifications en une transaction implicite. On l'enregistre dans le conteneur (AddScoped<CatalogueService>) pour l'injecter dans les contrôleurs."
    },
    7: {
      titre: "l'API REST du catalogue",
      etat: "Le service expose la logique. On l'ouvre via une API REST, avec des DTO.",
      objectif: "Crée un JeuxController ([ApiController]) avec GET /api/jeux (liste) et GET /api/jeux/{id}. Renvoie des JeuDto (titre, prix, disponibilité), pas les entités.",
      hints: [
        "[ApiController] [Route(\"api/[controller]\")].",
        "Un record JeuDto expose ce que le client doit voir.",
        "return NotFound() si le jeu n'existe pas."
      ],
      solution: `public record JeuDto(int Id, string Titre, decimal PrixLocation, bool Disponible);

[ApiController]
[Route("api/[controller]")]
public class JeuxController : ControllerBase {
    private readonly CatalogueService _service;
    public JeuxController(CatalogueService s) => _service = s;

    [HttpGet]
    public async Task<IEnumerable<JeuDto>> Lister() =>
        (await _service.TousLesJeuxAsync())
        .Select(j => new JeuDto(j.Id, j.Titre, j.PrixLocation, j.StockLocation > 0));

    [HttpGet("{id}")]
    public async Task<ActionResult<JeuDto>> Un(int id) {
        var j = await _service.ParIdAsync(id);
        return j is null ? NotFound()
            : new JeuDto(j.Id, j.Titre, j.PrixLocation, j.StockLocation > 0);
    }
}`,
      note: "Le DTO découple l'API des entités : on choisit ce qu'on expose (disponibilité calculée), sans divulguer les stocks internes. [ApiController] active la validation automatique et le binding. NotFound() renvoie un 404 propre. L'API reste stable même si le modèle change."
    },
    8: {
      titre: "validation et gestion des erreurs",
      etat: "L'API accepte des données ; il faut les valider et répondre proprement.",
      objectif: "Ajoute des DataAnnotations sur un CreationJeuDto (titre requis, prix positifs) et un middleware/filtre qui transforme les KeyNotFoundException en 404. Explique la validation automatique de [ApiController].",
      hints: [
        "[Required] sur Titre, [Range(0.01, ...)] sur PrixLocation.",
        "[ApiController] renvoie automatiquement 400 si le modèle est invalide.",
        "Un middleware d'exceptions mappe KeyNotFoundException -> 404."
      ],
      solution: `public class CreationJeuDto {
    [Required] public string Titre { get; set; } = "";
    [Range(0.01, 9999)] public decimal PrixLocation { get; set; }
    [Required] public int CategorieId { get; set; }
}

// middleware d'exceptions (Program.cs)
app.UseExceptionHandler(a => a.Run(async ctx => {
    var ex = ctx.Features.Get<IExceptionHandlerFeature>()?.Error;
    ctx.Response.StatusCode = ex is KeyNotFoundException ? 404 : 500;
    await ctx.Response.WriteAsJsonAsync(new { erreur = "requête invalide" });
}));`,
      note: "Les DataAnnotations décrivent les contraintes ; grâce à [ApiController], une requête invalide renvoie automatiquement un 400 avec le détail des erreurs, sans code. Un middleware d'exceptions centralise la traduction des erreurs métier en codes HTTP. L'API devient robuste et prévisible."
    },
    9: {
      titre: "les utilisateurs et les trois rôles (Identity)",
      etat: "Le catalogue tourne. On introduit les utilisateurs et leurs trois profils avec ASP.NET Core Identity.",
      objectif: "Configure Identity avec des rôles, et prévois l'enum/les constantes des trois rôles : Client, Vendeur, Administrateur. Le mot de passe est haché par Identity.",
      hints: [
        "builder.Services.AddIdentityCore<Utilisateur>().AddRoles<IdentityRole>()...",
        "Des constantes de rôles : public static class Roles { public const string Admin = \"Administrateur\"; ... }.",
        "Identity gère le hachage des mots de passe et l'unicité de l'email."
      ],
      solution: `public static class Roles {
    public const string Client = "Client";
    public const string Vendeur = "Vendeur";
    public const string Administrateur = "Administrateur";
}

// Program.cs
builder.Services
    .AddIdentityCore<IdentityUser>(o => o.Password.RequiredLength = 8)
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();`,
      note: "ASP.NET Core Identity fournit la table des utilisateurs, le hachage des mots de passe (jamais en clair) et la gestion des rôles. On définit les trois rôles de la Ludothèque en constantes pour éviter les fautes de frappe. Identity garantit aussi l'unicité de l'email."
    },
    10: {
      titre: "l'authentification (JWT)",
      etat: "Les utilisateurs existent. On protège l'API et on émet des jetons à la connexion.",
      objectif: "Configure l'authentification par jeton JWT : à la connexion, vérifier le mot de passe et émettre un token signé contenant l'identité et le rôle. Le catalogue en lecture reste public.",
      hints: [
        "AddAuthentication(JwtBearerDefaults...).AddJwtBearer(...).",
        "À la connexion : vérifier le mot de passe (Identity), créer un JwtSecurityToken avec les claims (rôle).",
        "[AllowAnonymous] sur GET /api/jeux ; [Authorize] ailleurs."
      ],
      solution: `builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o => o.TokenValidationParameters = new() {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(cle),
    });

// à la connexion : émettre le token
var claims = new[] {
    new Claim(ClaimTypes.Name, user.Email),
    new Claim(ClaimTypes.Role, user.Role),
};
var token = new JwtSecurityToken(claims: claims,
    signingCredentials: new(new SymmetricSecurityKey(cle), SecurityAlgorithms.HmacSha256));`,
      note: "Le JWT (JSON Web Token) est un jeton signé que le client renvoie à chaque requête : il porte l'identité et le rôle, vérifiés par la signature. Le mot de passe est vérifié une seule fois, à la connexion. Le catalogue reste public en lecture ([AllowAnonymous]), le reste exige un token valide."
    },
    11: {
      titre: "l'autorisation par rôle",
      etat: "On sait QUI est connecté. On décide QUI a le droit de faire QUOI.",
      objectif: "Restreins les actions : créer/modifier un jeu réservé aux rôles Vendeur/Administrateur, la gestion des comptes à l'Administrateur. Utilise l'attribut [Authorize(Roles=...)].",
      hints: [
        "[Authorize(Roles = \"Vendeur,Administrateur\")] sur la création de jeu.",
        "[Authorize(Roles = \"Administrateur\")] sur la gestion des comptes.",
        "Le rôle provient du claim porté par le JWT."
      ],
      solution: `[Authorize(Roles = "Vendeur,Administrateur")]
[HttpPost("/api/jeux")]
public async Task<ActionResult<JeuDto>> Creer(CreationJeuDto dto) { ... }

[Authorize(Roles = "Administrateur")]
[HttpDelete("/api/utilisateurs/{id}")]
public async Task<IActionResult> Supprimer(string id) { ... }`,
      note: "L'attribut [Authorize(Roles=...)] applique la règle au plus près de l'action : le rôle vient du claim du JWT, vérifié à chaque requête. Le client consulte et loue/achète, le vendeur gère le stock, l'administrateur gère tout. Authentification (qui) et autorisation (quel droit) restent distinctes."
    },
    12: {
      titre: "louer un jeu (transaction)",
      etat: "Le cœur métier arrive : un client loue un jeu. Deux écritures indissociables.",
      objectif: "Écris LocationService.LouerAsync(idClient, idJeu) : vérifier le stock, créer la location et décrémenter le stock, dans une transaction EF Core. Lève une exception si le stock est nul.",
      hints: [
        "using var tx = await _db.Database.BeginTransactionAsync();",
        "if (jeu.StockLocation <= 0) throw new StockInsuffisantException(...).",
        "Ajouter la Location, décrémenter, SaveChangesAsync, tx.CommitAsync()."
      ],
      solution: `public async Task LouerAsync(string idClient, int idJeu) {
    using var tx = await _db.Database.BeginTransactionAsync();
    var jeu = await _db.Jeux.FindAsync(idJeu)
        ?? throw new KeyNotFoundException();
    if (jeu.StockLocation <= 0)
        throw new StockInsuffisantException("Plus de stock de location");
    _db.Locations.Add(new Location {
        ClientId = idClient, JeuId = idJeu,
        DateDebut = DateTime.UtcNow, NbJours = 7
    });
    jeu.StockLocation--;
    await _db.SaveChangesAsync();
    await tx.CommitAsync();
}`,
      note: "Louer = enregistrer la location ET décrémenter le stock : la transaction EF Core (BeginTransaction/Commit) rend les deux indivisibles. Toute exception avant le Commit annule tout (le using dispose la transaction sans commit = rollback). C'est la transaction SQL Server vue en cours, pilotée par EF Core."
    },
    13: {
      titre: "acheter un jeu",
      etat: "La location fonctionne. On ajoute l'achat, sur l'autre stock.",
      objectif: "Écris AchatService.AcheterAsync(idClient, idJeu) sur le même modèle, mais sur StockVente. Enregistre le montant (PrixAchat) et lève une exception si le stock de vente est nul.",
      hints: [
        "Même structure transactionnelle, mais sur StockVente.",
        "Le montant = jeu.PrixAchat (paiement simulé).",
        "Ajouter l'Achat, décrémenter StockVente, SaveChanges, Commit."
      ],
      solution: `public async Task<Achat> AcheterAsync(string idClient, int idJeu) {
    using var tx = await _db.Database.BeginTransactionAsync();
    var jeu = await _db.Jeux.FindAsync(idJeu) ?? throw new KeyNotFoundException();
    if (jeu.StockVente <= 0)
        throw new StockInsuffisantException("Plus de stock de vente");
    var achat = new Achat {
        ClientId = idClient, JeuId = idJeu,
        DateAchat = DateTime.UtcNow, Montant = jeu.PrixAchat  // paiement simulé
    };
    _db.Achats.Add(achat);
    jeu.StockVente--;
    await _db.SaveChangesAsync();
    await tx.CommitAsync();
    return achat;
}`,
      note: "Acheter reprend la structure de louer sur le stock de vente : les deux stocks distincts du modèle Merise prennent tout leur sens. Le paiement est simulé (on enregistre le montant) ; un vrai paiement passerait par un service externe, branché à cet endroit précis."
    },
    14: {
      titre: "le frontend : le catalogue (Razor Pages)",
      etat: "L'API métier est complète. On donne un visage à l'application avec Razor Pages.",
      objectif: "Crée une Razor Page Catalogue (PageModel qui charge les jeux louables via le service) et le fragment .cshtml qui liste chaque jeu avec un bouton « Louer ».",
      hints: [
        "Le PageModel injecte le CatalogueService et remplit une propriété Jeux dans OnGetAsync.",
        "Dans le .cshtml : @foreach (var jeu in Model.Jeux) { ... }.",
        "@jeu.Titre affiche en échappant le HTML."
      ],
      solution: `public class CatalogueModel : PageModel {
    private readonly CatalogueService _service;
    public CatalogueModel(CatalogueService s) => _service = s;
    public List<Jeu> Jeux { get; private set; } = new();

    public async Task OnGetAsync() =>
        Jeux = await _service.JeuxLouablesAsync();
}

@* Catalogue.cshtml *@
@foreach (var jeu in Model.Jeux) {
    <tr>
        <td>@jeu.Titre</td>
        <td>@jeu.PrixLocation €</td>
        <td><form method="post" asp-page-handler="Louer" asp-route-id="@jeu.Id">
            <button>Louer</button></form></td>
    </tr>
}`,
      note: "Razor Pages rend le HTML côté serveur : @ échappe automatiquement le contenu (protection XSS), et les tag helpers (asp-page-handler) génèrent les formulaires et le jeton anti-forgery. Le même service alimente l'API JSON et les pages web — une seule logique métier, deux présentations."
    },
    15: {
      titre: "recherche, filtres et pagination",
      etat: "Le catalogue s'affiche, mais peut devenir long. On le rend navigable.",
      objectif: "Ajoute une recherche par titre et une pagination : la requête LINQ filtre par titre (Contains) et prend une page (Skip/Take). Le PageModel lit un mot-clé et un numéro de page.",
      hints: [
        "Where(j => j.Titre.Contains(q)).",
        "Skip((page - 1) * taille).Take(taille) pour paginer.",
        "CountAsync() pour le nombre total de pages."
      ],
      solution: `public async Task OnGetAsync(string q = "", int page = 1) {
    const int taille = 10;
    var requete = _db.Jeux.Where(j => j.Titre.Contains(q));
    Total = await requete.CountAsync();
    Jeux = await requete
        .OrderBy(j => j.Titre)
        .Skip((page - 1) * taille)
        .Take(taille)
        .ToListAsync();
}`,
      note: "Skip/Take se traduisent en OFFSET/FETCH sur SQL Server (la pagination vue en cours) : on ne charge que 10 jeux à la fois. Contains devient un LIKE. CountAsync donne le total pour calculer le nombre de pages. L'UI reste rapide même avec un immense catalogue."
    },
    16: {
      titre: "les espaces client, vendeur et administrateur",
      etat: "Tout le monde voit le même catalogue. On construit les trois espaces selon le rôle.",
      objectif: "Crée trois pages/zones protégées par rôle : /client (ses locations/achats), /vendeur (gérer les stocks), /admin (gérer les comptes). Protège chacune par [Authorize(Roles=...)].",
      hints: [
        "[Authorize(Roles = \"Administrateur\")] sur la page admin.",
        "L'espace client lit l'utilisateur courant : User.Identity / le claim d'id.",
        "L'espace vendeur réutilise le CatalogueService."
      ],
      solution: `[Authorize(Roles = "Administrateur")]
public class AdminModel : PageModel { /* gérer les comptes */ }

[Authorize(Roles = "Vendeur,Administrateur")]
public class VendeurModel : PageModel { /* gérer les stocks */ }

[Authorize]
public class ClientModel : PageModel {
    public async Task OnGetAsync() {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Locations = await _db.Locations.Where(l => l.ClientId == id).ToListAsync();
    }
}`,
      note: "Les trois profils de la Ludothèque deviennent trois espaces cloisonnés par [Authorize(Roles=...)]. Le client ne voit que ses données (filtre sur son id issu du claim), le vendeur gère le stock, l'administrateur gère les comptes. Les espaces réutilisent les mêmes services : seule la présentation et les droits changent."
    },
    17: {
      titre: "tests unitaires du métier",
      etat: "L'application fonctionne ; on prouve qu'elle est correcte. On teste la couche service.",
      objectif: "Écris un test xUnit vérifiant que LouerAsync décrémente le stock, et un test vérifiant qu'une location sur stock nul lève StockInsuffisantException. Utilise un DbContext en mémoire (InMemory) ou un mock.",
      hints: [
        "Un AppDbContext InMemory : UseInMemoryDatabase(...).",
        "[Fact] public async Task Louer_Decremente_Le_Stock().",
        "await Assert.ThrowsAsync<StockInsuffisantException>(() => service.LouerAsync(...))."
      ],
      solution: `public class LocationServiceTests {
    private AppDbContext Db() {
        var opt = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        return new AppDbContext(opt);
    }

    [Fact]
    public async Task Louer_Decremente_Le_Stock() {
        using var db = Db();
        db.Jeux.Add(new Jeu { Id = 1, StockLocation = 2 });
        await db.SaveChangesAsync();
        await new LocationService(db).LouerAsync("c1", 1);
        Assert.Equal(1, (await db.Jeux.FindAsync(1))!.StockLocation);
    }

    [Fact]
    public async Task Sans_Stock_Leve_Exception() {
        using var db = Db();
        db.Jeux.Add(new Jeu { Id = 1, StockLocation = 0 });
        await db.SaveChangesAsync();
        await Assert.ThrowsAsync<StockInsuffisantException>(
            () => new LocationService(db).LouerAsync("c1", 1));
    }
}`,
      note: "xUnit ([Fact]) structure les tests ; un DbContext InMemory isole la couche service sans SQL Server réel, pour des tests rapides et déterministes. On vérifie le cas nominal (le stock baisse) et le cas d'erreur (exception). Assert.ThrowsAsync teste qu'une exception attendue est bien levée."
    },
    18: {
      titre: "tests d'intégration de l'API",
      etat: "Le métier est testé unitairement. On vérifie la chaîne complète via de vraies requêtes HTTP.",
      objectif: "Écris un test d'intégration avec WebApplicationFactory qui appelle GET /api/jeux et vérifie le statut 200 et la présence d'un jeu.",
      hints: [
        "class ApiTests : IClassFixture<WebApplicationFactory<Program>>.",
        "var client = factory.CreateClient();",
        "var resp = await client.GetAsync(\"/api/jeux\"); resp.EnsureSuccessStatusCode();"
      ],
      solution: `public class JeuxApiTests : IClassFixture<WebApplicationFactory<Program>> {
    private readonly WebApplicationFactory<Program> _factory;
    public JeuxApiTests(WebApplicationFactory<Program> f) => _factory = f;

    [Fact]
    public async Task Liste_Les_Jeux() {
        var client = _factory.CreateClient();
        var resp = await client.GetAsync("/api/jeux");
        resp.EnsureSuccessStatusCode();          // 200
        var json = await resp.Content.ReadAsStringAsync();
        Assert.Contains("titre", json);
    }
}`,
      note: "WebApplicationFactory démarre l'application entière en mémoire et fournit un HttpClient : le test traverse toutes les couches (contrôleur → service → DbContext → base de test). C'est le complément des tests unitaires : il valide l'assemblage réel, là où l'unitaire isolait une brique."
    },
    19: {
      titre: "qualité : logs, performance, secrets",
      etat: "L'application marche et est testée ; on la rend prête pour de vrais utilisateurs.",
      objectif: "Applique trois réflexes : journaliser les opérations (ILogger), éviter le N+1 (Include), et sortir les secrets du code (User Secrets en dev, variables d'environnement en prod).",
      hints: [
        "Injecter ILogger<LocationService> ; _logger.LogInformation(\"Location jeu={Id}\", idJeu).",
        "Include(j => j.Categorie) pour charger la relation en une requête.",
        "En dev : dotnet user-secrets ; en prod : variables d'environnement, jamais dans appsettings versionné."
      ],
      solution: `private readonly ILogger<LocationService> _logger;
_logger.LogInformation("Location enregistrée jeu={Jeu} client={Client}", idJeu, idClient);

// éviter le N+1
var jeux = await _db.Jeux.Include(j => j.Categorie).ToListAsync();

// secrets : jamais dans le code
// dev : dotnet user-secrets set "Jwt:Key" "..."
// prod : variable d'environnement Jwt__Key`,
      note: "ILogger trace les opérations avec des paramètres structurés (audit, débogage), sans jamais logguer de secret. Include supprime le N+1 (une requête au lieu de N, comme en cours SQL Server). Les secrets vivent dans User Secrets (dev) ou les variables d'environnement (prod), hors du dépôt Git."
    },
    20: {
      titre: "le déploiement",
      etat: "L'application est prête. On la publie et on la met en ligne.",
      objectif: "Prépare le déploiement : publier en Release, appliquer les migrations en production, et fournir la configuration (chaîne de connexion, clé JWT) par variables d'environnement (Production).",
      hints: [
        "dotnet publish -c Release -o ./publish.",
        "dotnet ef database update (ou migration au démarrage) sur la base de prod.",
        "ASPNETCORE_ENVIRONMENT=Production ; secrets via variables d'environnement."
      ],
      solution: `# publier
dotnet publish -c Release -o ./publish

# variables d'environnement (production)
export ASPNETCORE_ENVIRONMENT=Production
export ConnectionStrings__Default="Server=db-prod;Database=Ludotheque;..."
export Jwt__Key="cleLongueEtSecrete"

# appliquer les migrations puis lancer
dotnet ef database update
dotnet ./publish/Ludotheque.Api.dll`,
      note: "dotnet publish -c Release produit une application optimisée, autonome. L'environnement Production désactive les pages d'erreur détaillées. La chaîne de connexion et la clé JWT viennent des variables d'environnement (la double underscore __ mappe la hiérarchie de config). L'application de la Ludothèque est en ligne."
    },
    21: {
      titre: "🎓 l'application assemblée",
      etat: "Épreuve finale : relier mentalement toutes les couches en un flux unique.",
      objectif: "Décris le trajet complet d'une location, du clic de l'utilisateur à la base : quelles couches ASP.NET Core sont traversées, dans quel ordre, et quelle garantie assure la cohérence. Cite le langage, le framework et la base.",
      hints: [
        "Navigateur -> Middleware (auth JWT) -> Controller/PageModel -> Service (transaction) -> DbContext (EF Core) -> SQL Server.",
        "La validation ([ApiController]/DataAnnotations) et l'autorisation ([Authorize]) agissent avant le métier.",
        "Nomme la règle métier (stock) et la garantie ACID (transaction)."
      ],
      solution: `1. L'utilisateur (rôle Client, authentifié par JWT) clique « Louer ».
2. Le middleware d'authentification valide le token et le rôle.
3. Le Controller (ou PageModel) appelle LocationService.LouerAsync(client, jeu).
4. Le Service, dans une transaction EF Core, vérifie le stock (règle métier),
   ajoute la Location et décrémente StockLocation.
5. Le DbContext (EF Core) traduit en SQL et écrit dans SQL Server.
6. CommitAsync : location + stock à jour, ou rollback si erreur (ACID).
7. Réponse renvoyée : l'utilisateur voit sa location confirmée.

C# (le langage) · ASP.NET Core (le framework, chaque couche) · SQL Server (la base) :
les trois briques de la formation, enfin assemblées en une seule application.`,
      note: "Ce trajet résume tout le projet : sécurité (JWT), couches, transaction, persistance EF Core. Langage, framework et base ne sont plus des cours séparés mais une application unique et cohérente. Tu sais construire un logiciel complet de bout en bout en ASP.NET Core."
    }
  }
};
