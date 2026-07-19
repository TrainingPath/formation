/* ===== Fil rouge « La Ludothèque » — capstone full-stack (PHP · Laravel · MySQL) =====
   Le grand assemblage : on construit l'application COMPLÈTE de la Ludothèque en
   réunissant le langage (PHP), le framework (Laravel) et la base (MySQL).
   Catalogue, 3 rôles (client, vendeur, administrateur), achat ET location,
   architecture MVC + services, API REST, sécurité, tests et déploiement. */
var FIL = {
  prefix: "projphp21",
  app: "La Ludothèque",
  placeholder: "Écris ton code PHP/Laravel ici…",
  etapes: {
    1: {
      titre: "l'architecture du projet",
      etat: "On part d'une feuille blanche, mais on connaît déjà le domaine (la Ludothèque). Avant de coder, on pose l'organisation MVC + services.",
      objectif: "Décris l'organisation d'une application Laravel de la Ludothèque : routes → contrôleur → service (métier) → modèle Eloquent → MySQL, plus les vues Blade et les Form Requests. Explique le rôle de chaque brique en une ligne.",
      hints: [
        "Laravel est MVC : routes/web.php et routes/api.php aiguillent vers des contrôleurs.",
        "On ajoute une couche Service pour la logique métier (louer, acheter, stocks).",
        "app/Models (Eloquent), app/Http/Controllers, app/Services, app/Http/Requests, resources/views (Blade)."
      ],
      solution: `routes/            web.php, api.php  -> aiguillent les URLs
app/Http/Controllers  reçoivent la requête, renvoient une réponse/vue
app/Services          logique métier (louer, acheter, stocks)
app/Models            modèles Eloquent (Jeu, Categorie, Utilisateur...)
app/Http/Requests     validation (Form Requests)
resources/views       vues Blade (HTML)
database/migrations   le schéma versionné

// Flux : Route -> Controller -> Service -> Model (Eloquent) -> MySQL`,
      note: "Laravel fournit le MVC ; on y ajoute une couche Service pour ne pas surcharger les contrôleurs. Cette séparation, comme en Spring, garde chaque brique responsable d'une seule chose et rend le métier testable indépendamment du web."
    },
    2: {
      titre: "le projet Laravel connecté à MySQL",
      etat: "L'architecture est posée. On crée le projet et on le branche sur la base MySQL de la Ludothèque.",
      objectif: "Configure le fichier .env pour connecter Laravel à une base MySQL 'ludotheque', et ajoute une route /ping qui renvoie « pong » pour prouver que l'application répond.",
      hints: [
        "Dans .env : DB_CONNECTION=mysql, DB_DATABASE=ludotheque, DB_USERNAME, DB_PASSWORD.",
        "composer create-project laravel/laravel ludotheque puis php artisan serve.",
        "Route::get('/ping', fn() => 'pong'); dans routes/web.php."
      ],
      solution: `# .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ludotheque
DB_USERNAME=\${DB_USER}
DB_PASSWORD=\${DB_PASSWORD}

// routes/web.php
Route::get('/ping', fn () => 'pong');`,
      note: "Le fichier .env porte la configuration propre à chaque machine (jamais commité). Laravel lit ces variables pour se connecter à MySQL. La route /ping confirme que le serveur (php artisan serve) répond avant d'aller plus loin."
    },
    3: {
      titre: "du MCD Merise aux migrations",
      etat: "L'application démarre à vide. On crée le schéma de la Ludothèque via des migrations Laravel versionnées.",
      objectif: "Écris la migration créant la table 'jeux' (titre, prix_achat, prix_location, stock_vente, stock_location, categorie_id, fournisseur_id) avec ses clés étrangères, dans la méthode up().",
      hints: [
        "php artisan make:migration create_jeux_table.",
        "$table->id(); $table->string('titre'); $table->decimal('prix_location', 6, 2);",
        "$table->foreignId('categorie_id')->constrained();"
      ],
      solution: `// database/migrations/xxxx_create_jeux_table.php
public function up(): void {
    Schema::create('jeux', function (Blueprint $table) {
        $table->id();
        $table->string('titre');
        $table->decimal('prix_achat', 6, 2);
        $table->decimal('prix_location', 6, 2);
        $table->unsignedInteger('stock_vente')->default(0);
        $table->unsignedInteger('stock_location')->default(0);
        $table->foreignId('categorie_id')->constrained();
        $table->foreignId('fournisseur_id')->nullable()->constrained();
        $table->timestamps();
    });
}`,
      note: "Les migrations Laravel décrivent le schéma en PHP, versionné dans Git et rejouable par php artisan migrate. foreignId()->constrained() crée la clé étrangère. C'est la traduction du MCD Merise (deux stocks, fournisseur relié au jeu) dans le monde Laravel."
    },
    4: {
      titre: "les modèles Eloquent du catalogue",
      etat: "Le schéma existe. On le reflète côté PHP avec des modèles Eloquent et leurs relations.",
      objectif: "Écris le modèle Jeu (table 'jeux') avec ses champs remplissables et ses relations belongsTo vers Categorie et Fournisseur.",
      hints: [
        "class Jeu extends Model ; protected $fillable = [...].",
        "public function categorie() { return $this->belongsTo(Categorie::class); }",
        "Idem fournisseur()."
      ],
      solution: `class Jeu extends Model {
    protected $fillable = [
        'titre', 'prix_achat', 'prix_location',
        'stock_vente', 'stock_location', 'categorie_id', 'fournisseur_id',
    ];

    public function categorie() {
        return $this->belongsTo(Categorie::class);
    }
    public function fournisseur() {
        return $this->belongsTo(Fournisseur::class);
    }
}`,
      note: "Eloquent est l'ORM de Laravel : un modèle = une table, une instance = une ligne. belongsTo matérialise les clés étrangères du MCD. $fillable protège contre l'assignation de masse. On peut désormais lire/écrire les jeux en objets PHP."
    },
    5: {
      titre: "interroger le catalogue (Eloquent, scopes)",
      etat: "Les modèles existent. On veut retrouver facilement les jeux selon des critères métier.",
      objectif: "Ajoute au modèle Jeu un scope 'louables' (stock_location > 0) et écris une requête retrouvant les jeux d'une catégorie triés par prix de location.",
      hints: [
        "public function scopeLouables($q) { return $q->where('stock_location', '>', 0); }",
        "Utilisation : Jeu::louables()->get().",
        "Jeu::where('categorie_id', $id)->orderBy('prix_location')->get()."
      ],
      solution: `// dans le modèle Jeu
public function scopeLouables($query) {
    return $query->where('stock_location', '>', 0);
}

// utilisations
$louables = Jeu::louables()->get();
$parCategorie = Jeu::where('categorie_id', $id)
    ->orderBy('prix_location')
    ->get();`,
      note: "Un scope nomme une condition réutilisable (les jeux louables) et rend le code lisible : Jeu::louables() au lieu de répéter le where partout. Eloquent traduit ces appels en SQL — on retrouve les WHERE, ORDER BY du cours MySQL, sans écrire de SQL."
    },
    6: {
      titre: "la couche service et les règles métier",
      etat: "On sait lire/écrire les jeux. On encapsule les règles métier dans une couche service.",
      objectif: "Crée un CatalogueService avec une méthode jeuxLouables() et une méthode ajouterStockLocation($idJeu, $quantite) qui incrémente le stock dans une transaction.",
      hints: [
        "class CatalogueService (dans app/Services).",
        "Jeu::findOrFail($idJeu) pour charger (404 sinon).",
        "DB::transaction(fn() => ...) ; $jeu->increment('stock_location', $quantite)."
      ],
      solution: `class CatalogueService {
    public function jeuxLouables() {
        return Jeu::louables()->get();
    }

    public function ajouterStockLocation(int $idJeu, int $quantite): void {
        DB::transaction(function () use ($idJeu, $quantite) {
            $jeu = Jeu::findOrFail($idJeu);
            $jeu->increment('stock_location', $quantite);
        });
    }
}`,
      note: "Le service isole la logique métier des contrôleurs. DB::transaction rend l'opération atomique (comme @Transactional en Spring). increment() met à jour le stock en une requête sûre. C'est ici que vivront bientôt les règles d'achat et de location."
    },
    7: {
      titre: "l'API REST du catalogue",
      etat: "Le service expose la logique. On l'ouvre via une API REST, avec des API Resources.",
      objectif: "Crée un JeuController d'API avec index() (liste) et show($jeu), renvoyant des JeuResource (titre, prix, disponibilité) plutôt que les modèles bruts. Déclare la route de ressource.",
      hints: [
        "php artisan make:resource JeuResource ; toArray() choisit les champs exposés.",
        "return JeuResource::collection(...) pour une liste.",
        "routes/api.php : Route::apiResource('jeux', JeuController::class)."
      ],
      solution: `// JeuResource
public function toArray($request): array {
    return [
        'id' => $this->id,
        'titre' => $this->titre,
        'prix_location' => $this->prix_location,
        'disponible' => $this->stock_location > 0,
    ];
}

// JeuController
public function index() {
    return JeuResource::collection(Jeu::all());
}
public function show(Jeu $jeu) {   // route model binding
    return new JeuResource($jeu);
}

// routes/api.php
Route::apiResource('jeux', JeuController::class);`,
      note: "L'API Resource joue le rôle du DTO : elle choisit ce qu'on expose (disponibilité calculée, pas les stocks internes). Le route model binding (Jeu $jeu) charge automatiquement le jeu ou renvoie 404. apiResource génère les routes REST standard d'un coup."
    },
    8: {
      titre: "validation et gestion des erreurs",
      etat: "L'API accepte des données ; il faut les valider et répondre proprement.",
      objectif: "Crée une Form Request StoreJeuRequest validant le titre (obligatoire), les prix (positifs) et la catégorie (existe). Explique comment Laravel renvoie automatiquement un 422 en cas d'échec.",
      hints: [
        "php artisan make:request StoreJeuRequest ; méthode rules().",
        "'titre' => 'required|string|max:120', 'prix_location' => 'required|numeric|min:0.01'.",
        "'categorie_id' => 'required|exists:categories,id'."
      ],
      solution: `class StoreJeuRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'titre' => 'required|string|max:120',
            'prix_location' => 'required|numeric|min:0.01',
            'stock_location' => 'integer|min:0',
            'categorie_id' => 'required|exists:categories,id',
        ];
    }
}
// dans le contrôleur : public function store(StoreJeuRequest $request) { ... }`,
      note: "La Form Request centralise la validation : injectée dans le contrôleur, elle bloque la requête AVANT le code métier et renvoie automatiquement un 422 avec les messages d'erreur (ou redirige avec les erreurs en web). La règle 'exists' vérifie l'intégrité référentielle côté requête."
    },
    9: {
      titre: "les utilisateurs et les trois rôles",
      etat: "Le catalogue tourne. On introduit les utilisateurs de la Ludothèque et leurs trois profils.",
      objectif: "Ajoute une migration ajoutant une colonne 'role' à la table users (défaut 'client'), et un cast enum sur le modèle User. Prévois les rôles client, vendeur, administrateur.",
      hints: [
        "Migration : $table->string('role')->default('client');.",
        "Un enum PHP : enum Role: string { case CLIENT = 'client'; ... }.",
        "Sur le modèle : protected $casts = ['role' => Role::class];"
      ],
      solution: `enum Role: string {
    case CLIENT = 'client';
    case VENDEUR = 'vendeur';
    case ADMINISTRATEUR = 'administrateur';
}

// migration
$table->string('role')->default('client');

// modèle User
protected $casts = ['role' => Role::class];`,
      note: "Laravel fournit déjà la table users et l'entité User (email unique, mot de passe haché). On l'enrichit d'un rôle typé par un enum PHP 8.1 : impossible d'enregistrer un rôle invalide, et le cast convertit automatiquement la colonne en objet Role."
    },
    10: {
      titre: "l'authentification",
      etat: "Les utilisateurs existent. On protège l'application et on permet la connexion.",
      objectif: "Explique comment Laravel hache les mots de passe et protège les routes : le hachage via Hash::make, et le middleware 'auth' sur les routes privées. Le catalogue en lecture reste public.",
      hints: [
        "À l'inscription : 'password' => Hash::make($request->password).",
        "Vérification gérée par Auth::attempt(...).",
        "Routes privées : Route::middleware('auth')->group(fn() => ...)."
      ],
      solution: `// inscription : mot de passe haché (bcrypt)
User::create([
    'email' => $request->email,
    'password' => Hash::make($request->password),
    'role' => Role::CLIENT,
]);

// routes : catalogue public, reste protégé
Route::get('/catalogue', [CatalogueController::class, 'index']);   // public
Route::middleware('auth')->group(function () {
    Route::post('/louer/{jeu}', [LocationController::class, 'louer']);
});`,
      note: "Laravel hache les mots de passe avec bcrypt via Hash::make (jamais en clair). Le middleware 'auth' bloque l'accès aux routes privées pour un visiteur non connecté. Le catalogue reste consultable par tous : on ouvre en lecture, on protège l'action. Des kits comme Breeze ou Sanctum fournissent tout le flux de connexion."
    },
    11: {
      titre: "l'autorisation par rôle",
      etat: "On sait QUI est connecté. On décide QUI a le droit de faire QUOI.",
      objectif: "Écris une Gate autorisant la gestion du catalogue aux rôles vendeur et administrateur, et protège une route par le middleware 'can'. Un client ne doit voir que ses propres locations.",
      hints: [
        "Gate::define('gerer-catalogue', fn(User $u) => in_array($u->role, [Role::VENDEUR, Role::ADMINISTRATEUR])).",
        "Route ... ->middleware('can:gerer-catalogue').",
        "Pour la propriété : $user->locations() ne retourne que les siennes."
      ],
      solution: `// AuthServiceProvider
Gate::define('gerer-catalogue', fn (User $u) =>
    in_array($u->role, [Role::VENDEUR, Role::ADMINISTRATEUR]));

Gate::define('gerer-comptes', fn (User $u) =>
    $u->role === Role::ADMINISTRATEUR);

// route protégée
Route::post('/jeux', [JeuController::class, 'store'])
    ->middleware('can:gerer-catalogue');

// propriété : un client ne voit que ses locations
$mesLocations = auth()->user()->locations()->get();`,
      note: "Les Gates et Policies portent les règles d'autorisation. Le middleware 'can:...' les applique à une route. On distingue les trois rôles (le client loue/achète, le vendeur gère le stock, l'admin gère tout) et on vérifie la propriété quand le rôle ne suffit pas — comme en Spring."
    },
    12: {
      titre: "louer un jeu (transaction)",
      etat: "Le cœur métier arrive : un client loue un jeu. Deux écritures indissociables.",
      objectif: "Écris LocationService::louer($idClient, $idJeu) : vérifier le stock de location, créer la location et décrémenter le stock, dans une transaction. Lève une exception si le stock est nul.",
      hints: [
        "DB::transaction(function () use (...) { ... }).",
        "if ($jeu->stock_location <= 0) throw new StockInsuffisantException(...).",
        "Location::create([...]) puis $jeu->decrement('stock_location')."
      ],
      solution: `class LocationService {
    public function louer(int $idClient, int $idJeu): void {
        DB::transaction(function () use ($idClient, $idJeu) {
            $jeu = Jeu::findOrFail($idJeu);
            if ($jeu->stock_location <= 0) {
                throw new StockInsuffisantException('Plus de stock de location');
            }
            Location::create([
                'client_id' => $idClient,
                'jeu_id' => $idJeu,
                'date_debut' => now(),
                'nb_jours' => 7,
            ]);
            $jeu->decrement('stock_location');
        });
    }
}`,
      note: "Louer = créer la location ET décrémenter le stock : DB::transaction rend les deux indivisibles (atomicité). Toute exception déclenche un ROLLBACK automatique, la base reste cohérente. C'est la transaction MySQL vue en cours, pilotée par Laravel."
    },
    13: {
      titre: "acheter un jeu",
      etat: "La location fonctionne. On ajoute l'achat, sur l'autre stock.",
      objectif: "Écris AchatService::acheter($idClient, $idJeu) sur le même modèle, mais sur stock_vente. Enregistre le montant (prix_achat) et lève une exception si le stock de vente est nul.",
      hints: [
        "Même structure transactionnelle, mais sur stock_vente.",
        "Le montant = $jeu->prix_achat (paiement simulé).",
        "Achat::create([...]) puis $jeu->decrement('stock_vente')."
      ],
      solution: `class AchatService {
    public function acheter(int $idClient, int $idJeu): Achat {
        return DB::transaction(function () use ($idClient, $idJeu) {
            $jeu = Jeu::findOrFail($idJeu);
            if ($jeu->stock_vente <= 0) {
                throw new StockInsuffisantException('Plus de stock de vente');
            }
            $achat = Achat::create([
                'client_id' => $idClient,
                'jeu_id' => $idJeu,
                'date_achat' => now(),
                'montant' => $jeu->prix_achat,   // paiement simulé
            ]);
            $jeu->decrement('stock_vente');
            return $achat;
        });
    }
}`,
      note: "Acheter reprend la structure de louer sur le stock de vente : les deux stocks distincts du modèle Merise prennent tout leur sens. Le paiement est simulé (on enregistre le montant) ; un vrai paiement passerait par un service externe, branché à cet endroit précis."
    },
    14: {
      titre: "le frontend : le catalogue (Blade)",
      etat: "L'API métier est complète. On donne un visage à l'application avec des vues Blade.",
      objectif: "Écris un contrôleur web renvoyant la vue 'catalogue' avec les jeux louables, et le fragment Blade qui liste chaque jeu (titre, prix) avec un bouton « Louer ».",
      hints: [
        "return view('catalogue', ['jeux' => $service->jeuxLouables()]).",
        "Dans Blade : @foreach ($jeux as $jeu) ... @endforeach.",
        "{{ $jeu->titre }} affiche en échappant le HTML ; @csrf dans le formulaire."
      ],
      solution: `// CatalogueController
public function index(CatalogueService $service) {
    return view('catalogue', ['jeux' => $service->jeuxLouables()]);
}

{{-- resources/views/catalogue.blade.php --}}
@foreach ($jeux as $jeu)
    <tr>
        <td>{{ $jeu->titre }}</td>
        <td>{{ $jeu->prix_location }} €</td>
        <td>
            <form method="POST" action="/louer/{{ $jeu->id }}">
                @csrf
                <button>Louer</button>
            </form>
        </td>
    </tr>
@endforeach`,
      note: "Blade rend le HTML côté serveur : {{ }} échappe automatiquement le contenu (protection XSS). @csrf insère le jeton anti-CSRF obligatoire sur les formulaires POST. Le même service alimente l'API et la page web — une seule logique métier, deux présentations."
    },
    15: {
      titre: "recherche, filtres et pagination",
      etat: "Le catalogue s'affiche, mais peut devenir long. On le rend navigable.",
      objectif: "Ajoute une recherche par titre et une pagination : le contrôleur lit un mot-clé et renvoie les jeux paginés (10 par page). Montre l'affichage des liens de pagination en Blade.",
      hints: [
        "$q = $request->query('recherche', '') ; Jeu::where('titre', 'like', \"%$q%\")->paginate(10).",
        "Passer $jeux à la vue.",
        "Dans Blade : {{ $jeux->links() }} pour la navigation."
      ],
      solution: `// contrôleur
public function index(Request $request) {
    $q = $request->query('recherche', '');
    $jeux = Jeu::where('titre', 'like', "%{$q}%")
        ->orderBy('titre')
        ->paginate(10)
        ->withQueryString();
    return view('catalogue', ['jeux' => $jeux, 'q' => $q]);
}

{{-- Blade --}}
@foreach ($jeux as $jeu) ... @endforeach
{{ $jeux->links() }}`,
      note: "paginate(10) génère automatiquement le LIMIT/OFFSET (vu en MySQL) et un objet paginé ; ->links() affiche les liens page par page ; withQueryString() conserve le filtre de recherche dans les liens. On ne charge que 10 jeux à la fois : l'UI reste rapide."
    },
    16: {
      titre: "les espaces client, vendeur et administrateur",
      etat: "Tout le monde voit le même catalogue. On construit les trois espaces selon le rôle.",
      objectif: "Crée trois groupes de routes protégés : /client (ses locations/achats), /vendeur (gérer les stocks), /admin (gérer les comptes), chacun réservé au bon rôle via un middleware d'autorisation.",
      hints: [
        "Route::middleware(['auth','can:gerer-comptes'])->prefix('admin')->group(...).",
        "L'espace client lit auth()->user()->locations.",
        "L'espace vendeur réutilise le CatalogueService (ajouter du stock)."
      ],
      solution: `Route::middleware('auth')->group(function () {
    Route::get('/client', [ClientController::class, 'index']);  // ses données
});
Route::middleware(['auth', 'can:gerer-catalogue'])->prefix('vendeur')->group(function () {
    Route::post('/stock', [VendeurController::class, 'ajouterStock']);
});
Route::middleware(['auth', 'can:gerer-comptes'])->prefix('admin')->group(function () {
    Route::get('/utilisateurs', [AdminController::class, 'utilisateurs']);
});

// espace client : seulement ses locations
public function index() {
    return view('client', ['locations' => auth()->user()->locations()->get()]);
}`,
      note: "Les trois profils de la Ludothèque deviennent trois groupes de routes cloisonnés par middleware ('auth' + 'can:...'). Le client ne voit que ses données (propriété), le vendeur gère le stock, l'admin gère les comptes. Les espaces réutilisent les mêmes services : seule la présentation et les droits changent."
    },
    17: {
      titre: "tests unitaires du métier",
      etat: "L'application fonctionne ; on prouve qu'elle est correcte. On teste la logique en isolation.",
      objectif: "Écris un test (PHPUnit/Pest) vérifiant que louer() décrémente le stock, et un test vérifiant qu'une location sur stock nul lève StockInsuffisantException. Utilise RefreshDatabase et une factory.",
      hints: [
        "use RefreshDatabase; pour une base propre à chaque test.",
        "Jeu::factory()->create(['stock_location' => 2]) ; appeler le service ; vérifier fresh().",
        "$this->expectException(StockInsuffisantException::class) pour le cas d'erreur."
      ],
      solution: `class LocationServiceTest extends TestCase {
    use RefreshDatabase;

    public function test_louer_decremente_le_stock(): void {
        $jeu = Jeu::factory()->create(['stock_location' => 2]);
        app(LocationService::class)->louer(1, $jeu->id);
        $this->assertEquals(1, $jeu->fresh()->stock_location);
    }

    public function test_louer_sans_stock_leve_exception(): void {
        $jeu = Jeu::factory()->create(['stock_location' => 0]);
        $this->expectException(StockInsuffisantException::class);
        app(LocationService::class)->louer(1, $jeu->id);
    }
}`,
      note: "RefreshDatabase repart d'une base vierge à chaque test ; les factories créent des données de test lisibles. On vérifie le cas nominal (le stock baisse) et le cas d'erreur (exception). fresh() recharge le modèle depuis la base pour voir la valeur réellement persistée."
    },
    18: {
      titre: "tests de fonctionnalité (HTTP)",
      etat: "Le métier est testé ; on vérifie la chaîne complète via de vraies requêtes HTTP.",
      objectif: "Écris un test de fonctionnalité vérifiant que GET /api/jeux renvoie 200 avec au moins un jeu, et qu'un client (sans droit) reçoit 403 en tentant de créer un jeu.",
      hints: [
        "$this->getJson('/api/jeux')->assertOk()->assertJsonCount(1, 'data').",
        "actingAs($client) pour simuler un utilisateur connecté.",
        "$this->postJson('/api/jeux', [...])->assertForbidden() pour un client."
      ],
      solution: `class JeuApiTest extends TestCase {
    use RefreshDatabase;

    public function test_liste_les_jeux(): void {
        Jeu::factory()->create();
        $this->getJson('/api/jeux')
             ->assertOk()
             ->assertJsonCount(1, 'data');
    }

    public function test_un_client_ne_cree_pas_de_jeu(): void {
        $client = User::factory()->create(['role' => Role::CLIENT]);
        $this->actingAs($client)
             ->postJson('/api/jeux', ['titre' => 'X'])
             ->assertForbidden();  // 403
    }
}`,
      note: "Les tests de fonctionnalité traversent toutes les couches (route → contrôleur → service → base de test) via de vraies requêtes HTTP. actingAs simule un utilisateur connecté pour tester l'autorisation. On valide à la fois le contenu (assertJsonCount) et les codes (200, 403) — l'assemblage réel."
    },
    19: {
      titre: "qualité : logs, N+1, .env",
      etat: "L'application marche et est testée ; on la rend prête pour de vrais utilisateurs.",
      objectif: "Applique trois réflexes : journaliser une location (Log::info), éviter le N+1 sur le catalogue (eager loading with('categorie')), et garder les secrets dans .env (jamais dans le code ni Git).",
      hints: [
        "Log::info('Location', ['jeu' => $idJeu, 'client' => $idClient]).",
        "Jeu::with('categorie')->get() charge la relation en une requête.",
        "Config via config('...') qui lit .env ; ne jamais coder un secret en dur."
      ],
      solution: `use Illuminate\\Support\\Facades\\Log;

Log::info('Location enregistrée', ['jeu' => $idJeu, 'client' => $idClient]);

// éviter le N+1 : eager loading
$jeux = Jeu::with('categorie')->paginate(10);

// secrets : toujours via .env, jamais en dur
// .env :  MAIL_PASSWORD=...   ->   config('mail.password')`,
      note: "Log::info trace les opérations (audit, débogage), sans jamais logguer de secret. with('categorie') supprime le N+1 (une requête au lieu de N, comme en cours MySQL). Les secrets vivent dans .env, hors du dépôt Git. Ces réflexes distinguent un exercice d'une application déployable."
    },
    20: {
      titre: "le déploiement",
      etat: "L'application est prête. On la construit et on la met en ligne.",
      objectif: "Liste les étapes de mise en production Laravel : installer les dépendances optimisées, compiler les assets, migrer la base, mettre en cache la config, et passer APP_ENV en production (APP_DEBUG=false).",
      hints: [
        "composer install --no-dev --optimize-autoloader ; npm run build.",
        "php artisan migrate --force ; php artisan config:cache ; route:cache.",
        ".env de prod : APP_ENV=production, APP_DEBUG=false, secrets par l'environnement."
      ],
      solution: `# dépendances de production + assets
composer install --no-dev --optimize-autoloader
npm run build

# base et caches
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# .env de production
APP_ENV=production
APP_DEBUG=false
APP_KEY=... (généré, secret)
DB_PASSWORD=\${DB_PASSWORD}`,
      note: "En production : dépendances optimisées, assets compilés (npm run build), migrations appliquées (--force), et caches de config/routes/vues pour la performance. APP_DEBUG=false masque les erreurs détaillées au public. Les secrets restent dans l'environnement — l'application de la Ludothèque est en ligne."
    },
    21: {
      titre: "🎓 l'application assemblée",
      etat: "Épreuve finale : relier mentalement toutes les couches en un flux unique.",
      objectif: "Décris le trajet complet d'une location, du clic de l'utilisateur à la base : quelles briques Laravel sont traversées, dans quel ordre, et quelle garantie assure la cohérence. Cite le langage, le framework et la base.",
      hints: [
        "Navigateur -> Route -> Middleware (auth/can) -> Controller -> Service (DB::transaction) -> Eloquent -> MySQL.",
        "La validation (Form Request) et l'autorisation (Gate) agissent avant le métier.",
        "Nomme la règle métier (stock) et la garantie ACID (transaction)."
      ],
      solution: `1. L'utilisateur (rôle client, authentifié) soumet le formulaire « Louer » (@csrf).
2. La route passe par les middlewares 'auth' (identité) puis 'can' (droit).
3. Le Controller appelle LocationService::louer($client, $jeu).
4. Le Service, dans DB::transaction, vérifie le stock (règle métier),
   crée la Location et décrémente stock_location.
5. Eloquent traduit en SQL et écrit dans MySQL (InnoDB).
6. COMMIT : location + stock à jour, ou ROLLBACK si erreur (ACID).
7. Redirection (PRG) : l'utilisateur voit sa location confirmée.

PHP (le langage) · Laravel (le framework, chaque couche) · MySQL (la base) :
les trois briques de la formation, enfin assemblées en une seule application.`,
      note: "Ce trajet résume tout le projet : sécurité (middlewares), MVC + service, transaction, persistance Eloquent. Langage, framework et base ne sont plus des cours séparés mais une application unique et cohérente. Tu sais construire un logiciel complet de bout en bout en Laravel."
    }
  }
};
