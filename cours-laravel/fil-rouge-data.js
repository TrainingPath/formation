/* ===== Fil rouge « La Ludothèque » — cours Laravel (21 étapes) =====
   Même application que dans tous les cours, en version WEB (PHP / Laravel).
   Ludothèque de jeux de société : catalogue, 3 rôles (client, vendeur,
   administrateur), achat ET location. On construit une vraie app web MVC. */
var FIL = {
  prefix: "laravel21",
  app: "La Ludothèque",
  placeholder: "Écris ton code Laravel ici…",
  etapes: {
    1: {
      titre: "le projet et la page d'accueil",
      etat: "Rien n'existe. On crée le projet Laravel et une première page qui présente la ludothèque.",
      objectif: "Crée le projet, puis une route « / » qui renvoie une vue d'accueil affichant « Bienvenue à la Ludothèque ».",
      hints: [
        "composer create-project laravel/laravel ludotheque",
        "Route::get('/', fn() => view('accueil'));"
      ],
      solution: `// routes/web.php
use Illuminate\\Support\\Facades\\Route;

Route::get('/', function () {
    return view('accueil');   // resources/views/accueil.blade.php
});

{{-- resources/views/accueil.blade.php --}}
{{-- <h1>Bienvenue à la Ludothèque</h1><p>Achat & location de jeux</p> --}}`,
      note: "Une requête entre par une route, une réponse (vue) sort. Même point de départ que Django (path + vue) mais avec la syntaxe fluide de Laravel."
    },
    2: {
      titre: "les routes du catalogue",
      etat: "L'accueil répond. Définissons les adresses du catalogue.",
      objectif: "Ajoute deux routes : /jeux (la liste) et /jeux/{id} (le détail), pointant vers des fonctions (closures pour l'instant).",
      hints: [
        "Route::get('/jeux', ...)->name('jeux.index');",
        "Route::get('/jeux/{id}', ...)->name('jeux.show');"
      ],
      solution: `// routes/web.php
Route::get('/jeux', function () {
    return 'Catalogue des jeux';
})->name('jeux.index');

Route::get('/jeux/{id}', function ($id) {
    return "Détail du jeu $id";
})->name('jeux.show');`,
      note: "Le routage relie une URL à du code. {id} capture un paramètre. ->name() nomme la route pour la référencer sans écrire l'URL en dur. Comparable au routage Django."
    },
    3: {
      titre: "le contrôleur du catalogue",
      etat: "Les closures ne suffisent plus : déplaçons la logique dans un contrôleur.",
      objectif: "Génère un JeuController (artisan), crée une méthode index() qui prépare une liste de jeux (tableaux en dur) et branche la route dessus.",
      hints: [
        "php artisan make:controller JeuController",
        "Route::get('/jeux', [JeuController::class, 'index']);"
      ],
      solution: `// php artisan make:controller JeuController
class JeuController extends Controller
{
    public function index()
    {
        $catalogue = [
            ['nom' => 'Catan', 'prix' => 44.9, 'stock' => 3],
            ['nom' => 'Azul',  'prix' => 39.9, 'stock' => 5],
        ];
        return view('jeux.index', ['catalogue' => $catalogue]);
    }
}
// routes/web.php : Route::get('/jeux', [JeuController::class, 'index'])->name('jeux.index');`,
      note: "Le contrôleur est le C de MVC : il orchestre la requête et prépare les données. artisan génère le squelette. Django appelle ça une « vue »."
    },
    4: {
      titre: "la vue Blade du catalogue",
      etat: "Affichons le catalogue proprement avec un template Blade.",
      objectif: "Crée jeux/index.blade.php qui affiche le catalogue avec @foreach, dans un layout commun (@extends).",
      hints: [
        "@foreach ($catalogue as $jeu) ... @endforeach",
        "{{ $jeu['nom'] }} affiche une valeur (échappée automatiquement)."
      ],
      solution: `{{-- resources/views/jeux/index.blade.php --}}
@extends('layout')
@section('contenu')
  <h1>Catalogue</h1>
  <ul>
  @foreach ($catalogue as $jeu)
    <li>{{ $jeu['nom'] }} — {{ $jeu['prix'] }} € (stock {{ $jeu['stock'] }})</li>
  @endforeach
  </ul>
@endsection`,
      note: "Blade est le moteur de templates de Laravel : @foreach, {{ }} (échappé anti-XSS), @extends pour les layouts. C'est l'équivalent des templates DTL de Django."
    },
    5: {
      titre: "le détail d'un jeu",
      etat: "Relions chaque jeu à sa page de détail.",
      objectif: "Dans la liste, ajoute un lien route('jeux.show', $id) vers le détail, et crée la méthode show($id) + la vue detail.",
      hints: [
        "<a href=\"{{ route('jeux.show', $i) }}\">{{ $jeu['nom'] }}</a>",
        "public function show($id) { ... return view('jeux.show', ...); }"
      ],
      solution: `// JeuController
public function show($id)
{
    $catalogue = [
        1 => ['nom' => 'Catan', 'prix' => 44.9, 'stock' => 3],
        2 => ['nom' => 'Azul',  'prix' => 39.9, 'stock' => 5],
    ];
    return view('jeux.show', ['jeu' => $catalogue[$id] ?? null]);
}
{{-- jeux/show.blade.php : <h1>{{ $jeu['nom'] }}</h1><p>{{ $jeu['prix'] }} €</p> --}}`,
      note: "route('jeux.show', $id) construit l'URL depuis le nom de la route : jamais d'adresse en dur. Même principe que {% url %} en Django."
    },
    6: {
      titre: "un formulaire de location",
      etat: "L'utilisateur doit pouvoir agir : ajoutons un formulaire de location.",
      objectif: "Crée un formulaire (POST) avec @csrf pour saisir le nombre de jours, une route POST /jeux/{id}/louer et une méthode qui lit $request et calcule le prix.",
      hints: [
        "<form method=\"post\"> @csrf ... </form>",
        "Route::post('/jeux/{id}/louer', [JeuController::class, 'louer']);"
      ],
      solution: `{{-- show.blade.php --}}
{{-- <form method="post" action="{{ route('jeux.louer', $id) }}">
       @csrf
       <input name="jours" type="number" value="1">
       <button>Louer</button>
     </form> --}}

// JeuController
public function louer(Request $request, $id)
{
    $jours = (int) $request->input('jours');
    $total = 5.0 * $jours * ($jours >= 3 ? 0.9 : 1);
    return back()->with('message', "Location : $total €");
}`,
      note: "@csrf insère le jeton anti-CSRF, obligatoire pour tout POST. $request->input() lit une donnée du formulaire. Django utilise {% csrf_token %} et request.POST."
    },
    7: {
      titre: "structurer en MVC",
      etat: "Le projet grossit : posons proprement l'architecture Modèle-Vue-Contrôleur.",
      objectif: "Prépare le futur modèle Jeu (Eloquent) : décris ses attributs. Garde la logique dans le contrôleur et l'affichage dans Blade.",
      hints: [
        "php artisan make:model Jeu -m (modèle + migration)",
        "Le modèle représente la table ; le contrôleur la logique ; Blade l'affichage."
      ],
      solution: `// php artisan make:model Jeu -m
// app/Models/Jeu.php
class Jeu extends Model
{
    protected $fillable = ['nom', 'prix_achat', 'prix_location', 'stock'];
}
// (la migration sera remplie à la leçon 8)`,
      note: "MVC = Modèle (données), Vue (Blade), Contrôleur (logique). $fillable liste les champs remplissables en masse (sécurité). C'est le MVT de Django sous un autre nom."
    },
    8: {
      titre: "créer la table jeux",
      etat: "Matérialisons le modèle Jeu en base avec une migration.",
      objectif: "Remplis la migration (colonnes nom, prix_achat, prix_location, stock), lance-la, puis crée quelques jeux via tinker.",
      hints: [
        "$table->string('nom'); $table->decimal('prix_location', 6, 2); $table->integer('stock');",
        "php artisan migrate ; puis tinker : Jeu::create([...])"
      ],
      solution: `// database/migrations/...create_jeus_table.php
public function up(): void {
    Schema::create('jeus', function (Blueprint $table) {
        $table->id();
        $table->string('nom');
        $table->decimal('prix_achat', 6, 2);
        $table->decimal('prix_location', 6, 2);
        $table->integer('stock')->default(0);
        $table->timestamps();
    });
}
// php artisan migrate
// tinker: Jeu::create(['nom'=>'Catan','prix_achat'=>44.9,'prix_location'=>5,'stock'=>3]);`,
      note: "La migration décrit la table en PHP, migrate l'applique. La base remplace les données en dur. Équivalent des migrations Django (makemigrations/migrate)."
    },
    9: {
      titre: "le catalogue depuis la base (CRUD)",
      etat: "Les jeux sont en base : lisons-les via Eloquent au lieu du tableau en dur.",
      objectif: "Modifie index() pour Jeu::all(), et ajoute une méthode destroy($id) pour supprimer un jeu (réservée plus tard au vendeur).",
      hints: [
        "$jeux = Jeu::all();",
        "Jeu::findOrFail($id)->delete();"
      ],
      solution: `public function index()
{
    $jeux = Jeu::all();
    return view('jeux.index', ['catalogue' => $jeux]);
}

public function destroy($id)
{
    Jeu::findOrFail($id)->delete();
    return redirect()->route('jeux.index');
}`,
      note: "Eloquent est l'ORM de Laravel : Jeu::all(), ::create(), ->delete(). Chaque modèle mappe une table. C'est le pendant de l'ORM Django et de JPA (Spring)."
    },
    10: {
      titre: "filtrer et trier le catalogue",
      etat: "Ajoutons recherche, filtre « en stock » et tri par prix.",
      objectif: "Avec le Query Builder d'Eloquent, affiche les jeux en stock, une recherche par nom (paramètre GET) et un tri par prix_location.",
      hints: [
        "Jeu::where('stock', '>', 0)->orderBy('prix_location')",
        "when($request->q, fn($q, $v) => $q->where('nom', 'like', \"%$v%\"))"
      ],
      solution: `public function index(Request $request)
{
    $jeux = Jeu::where('stock', '>', 0)
        ->when($request->q, fn($query, $v) =>
            $query->where('nom', 'like', "%$v%"))
        ->orderBy('prix_location')
        ->get();
    return view('jeux.index', ['catalogue' => $jeux]);
}`,
      note: "Le Query Builder enchaîne where/orderBy et ne frappe la base qu'au ->get(). when() ajoute une condition seulement si le filtre existe. Comparable aux QuerySets Django."
    },
    11: {
      titre: "utilisateurs, rôles et transactions",
      etat: "Le cœur métier : relions jeux, clients et opérations d'achat/location.",
      objectif: "Ajoute un modèle Categorie (un jeu appartient à une catégorie), un champ role sur User, et un modèle Transaction (jeu + client + type achat/location). Déclare les relations Eloquent.",
      hints: [
        "Dans Jeu : public function categorie() { return $this->belongsTo(Categorie::class); }",
        "Dans Jeu : public function transactions() { return $this->hasMany(Transaction::class); }"
      ],
      solution: `class Jeu extends Model
{
    public function categorie() { return $this->belongsTo(Categorie::class); }
    public function transactions() { return $this->hasMany(Transaction::class); }
}
class Transaction extends Model
{
    protected $fillable = ['jeu_id', 'user_id', 'type', 'montant'];
    public function jeu()    { return $this->belongsTo(Jeu::class); }
    public function client() { return $this->belongsTo(User::class, 'user_id'); }
}
// migration users : $table->enum('role', ['client','vendeur','admin'])->default('client');`,
      note: "belongsTo / hasMany déclarent les relations : un jeu a une catégorie et plusieurs transactions. Eloquent charge alors $jeu->transactions sans SQL. Django utilise ForeignKey."
    },
    12: {
      titre: "valider les données",
      etat: "Encadrons la création/édition d'un jeu par une validation.",
      objectif: "Dans store(), valide les données ($request->validate) : nom requis, prix positifs, stock entier >= 0. Enregistre après validation.",
      hints: [
        "$request->validate(['nom' => 'required', 'prix_location' => 'required|numeric|min:0']);",
        "Jeu::create($valide);"
      ],
      solution: `public function store(Request $request)
{
    $valide = $request->validate([
        'nom'           => 'required|string|max:120',
        'prix_achat'    => 'required|numeric|min:0',
        'prix_location' => 'required|numeric|min:0',
        'stock'         => 'required|integer|min:0',
    ]);
    Jeu::create($valide);
    return redirect()->route('jeux.index')->with('message', 'Jeu ajouté');
}`,
      note: "$request->validate applique des règles et renvoie automatiquement les erreurs au formulaire. C'est l'équivalent des ModelForm (Django) et de Bean Validation (Spring)."
    },
    13: {
      titre: "panier en session et messages flash",
      etat: "Un client réserve plusieurs jeux avant de valider : gardons son panier entre les pages.",
      objectif: "Ajoute un jeu au panier stocké en session, et affiche un message flash de confirmation.",
      hints: [
        "session()->push('panier', $id);",
        "return back()->with('message', 'Ajouté au panier');"
      ],
      solution: `public function ajouterPanier($id)
{
    session()->push('panier', $id);        // empile dans le panier en session
    return back()->with('message', 'Jeu ajouté au panier de location');
}
{{-- layout.blade.php : @if(session('message')) <p>{{ session('message') }}</p> @endif --}}`,
      note: "La session mémorise le panier propre à chaque visiteur ; ->with() dépose un message flash affiché une seule fois. Django a le même duo (session + messages)."
    },
    14: {
      titre: "configuration et environnements",
      etat: "Séparons la configuration du code avant la mise en ligne.",
      objectif: "Range les réglages sensibles (base de données, clé d'app) dans le fichier .env, et lis-les via config(). Prévois des valeurs différentes en dev et en prod.",
      hints: [
        "Le .env : DB_DATABASE=ludo, APP_DEBUG=true (jamais versionné).",
        "config('app.debug'), env('DB_DATABASE') via les fichiers config/."
      ],
      solution: `# .env (jamais commité)
APP_NAME=Ludotheque
APP_DEBUG=true
DB_DATABASE=ludotheque
DB_USERNAME=root

// utilisation
$debug = config('app.debug');          // via config/app.php -> env('APP_DEBUG')`,
      note: "Le .env garde les secrets hors du code versionné. Laravel lit ces variables via les fichiers config/. Même principe que os.environ (Django) et appsettings (.NET)."
    },
    15: {
      titre: "tester le catalogue et la location",
      etat: "Sécurisons les évolutions avec des tests automatiques.",
      objectif: "Écris deux tests : GET /jeux répond 200 et affiche un jeu ; une location décrémente le stock.",
      hints: [
        "php artisan make:test JeuTest",
        "$this->get('/jeux')->assertStatus(200)->assertSee('Catan');"
      ],
      solution: `use Illuminate\\Foundation\\Testing\\RefreshDatabase;

class JeuTest extends TestCase
{
    use RefreshDatabase;

    public function test_liste_affiche_les_jeux(): void
    {
        Jeu::create(['nom'=>'Catan','prix_achat'=>44.9,'prix_location'=>5,'stock'=>2]);
        $this->get('/jeux')->assertStatus(200)->assertSee('Catan');
    }
}`,
      note: "RefreshDatabase donne une base propre à chaque test. assertStatus/assertSee vérifient la réponse. Équivalent de TestCase + self.client (Django) et MockMvc (Spring)."
    },
    16: {
      titre: "connexion et inscription",
      etat: "La ludothèque devient personnelle : les clients doivent pouvoir se connecter.",
      objectif: "Mets en place l'authentification (Laravel Breeze / starter) et protège la page « mes locations » avec le middleware auth.",
      hints: [
        "composer require laravel/breeze puis php artisan breeze:install",
        "Route::get('/mes-locations', ...)->middleware('auth');"
      ],
      solution: `// routes/web.php
Route::get('/mes-locations', [JeuController::class, 'mesLocations'])
     ->middleware('auth');

// JeuController
public function mesLocations()
{
    $locations = auth()->user()->transactions()->where('type','location')->get();
    return view('jeux.mes_locations', ['locations' => $locations]);
}`,
      note: "Breeze fournit connexion/inscription (mots de passe hachés inclus). Le middleware auth = le portier. auth()->user() donne l'utilisateur connecté. Django : @login_required + request.user."
    },
    17: {
      titre: "les 3 rôles et leurs droits",
      etat: "Client, vendeur, administrateur n'ont pas les mêmes droits : mettons en place l'autorisation.",
      objectif: "Crée un middleware (ou une Gate) qui autorise le vendeur à gérer le stock et l'admin à tout. Bloque les autres (403).",
      hints: [
        "abort_unless(auth()->user()->role === 'vendeur' || ... , 403);",
        "Ou une Gate : Gate::define('gerer-stock', fn($u) => in_array($u->role, ['vendeur','admin']));"
      ],
      solution: `public function gererStock(Request $request, $id)
{
    abort_unless(
        in_array(auth()->user()->role, ['vendeur', 'admin']),
        403, 'Réservé au personnel'
    );
    $jeu = Jeu::findOrFail($id);
    $jeu->update(['stock' => (int) $request->input('stock')]);
    return back();
}`,
      note: "Authentification (qui es-tu ?) puis autorisation (qu'as-tu le droit ?). abort_unless coupe court avec un 403. Laravel a aussi les Gates et Policies. Django : vérifier request.user + 403."
    },
    18: {
      titre: "une API JSON du catalogue",
      etat: "D'autres applications veulent nos données : exposons une API.",
      objectif: "Crée des routes d'API qui renvoient le catalogue en JSON (Laravel sérialise automatiquement les modèles), avec écriture réservée au personnel.",
      hints: [
        "Route::get('/api/jeux', fn() => Jeu::all()); // renvoie du JSON",
        "Ou un API Resource : return JeuResource::collection(Jeu::all());"
      ],
      solution: `// routes/api.php
use App\\Models\\Jeu;

Route::get('/jeux', fn() => Jeu::where('stock', '>', 0)->get());  // JSON auto
Route::post('/jeux', function (Request $r) {
    return Jeu::create($r->only('nom','prix_achat','prix_location','stock'));
})->middleware('auth:sanctum');`,
      note: "Renvoyer un modèle Eloquent le convertit automatiquement en JSON. Les API Resources permettent de contrôler finement les champs. Django utilise DRF (serializer + ViewSet)."
    },
    19: {
      titre: "pagination et logs",
      etat: "Gardons les listes rapides et traçons ce qui se passe.",
      objectif: "Pagine le catalogue (paginate) et journalise chaque location avec le logger.",
      hints: [
        "Jeu::where('stock','>',0)->paginate(10);",
        "Log::info('Location', ['jeu' => $id, 'user' => auth()->id()]);"
      ],
      solution: `use Illuminate\\Support\\Facades\\Log;

public function index()
{
    $catalogue = Jeu::where('stock', '>', 0)->orderBy('nom')->paginate(10);
    return view('jeux.index', ['catalogue' => $catalogue]);
}
// dans louer() : Log::info('Location', ['jeu' => $id, 'user' => auth()->id()]);
{{-- vue : {{ $catalogue->links() }} pour les liens de pages --}}`,
      note: "paginate() découpe la liste et {{ \\$catalogue->links() }} affiche la navigation. Log::info trace les événements. Django : Paginator + le module logging."
    },
    20: {
      titre: "🏁 assembler la Ludothèque web",
      etat: "Toutes les briques existent : réunissons-les en une application cohérente.",
      objectif: "Assemble le parcours complet : catalogue paginé, détail, location (authentifiée) qui crée une Transaction et décrémente le stock, dans une transaction de base de données.",
      hints: [
        "Vérifie le stock, crée la Transaction, décrémente — le tout dans DB::transaction().",
        "Réutilise les modèles (leçon 11) et l'auth (leçon 16)."
      ],
      solution: `use Illuminate\\Support\\Facades\\DB;

public function louer(Request $request, $id)
{
    $jeu = Jeu::findOrFail($id);
    abort_if($jeu->stock <= 0, 422, 'Indisponible');

    DB::transaction(function () use ($jeu) {
        $jeu->decrement('stock');
        Transaction::create([
            'jeu_id'  => $jeu->id,
            'user_id' => auth()->id(),
            'type'    => 'location',
            'montant' => $jeu->prix_location,
        ]);
    });
    return redirect()->route('jeux.mesLocations')->with('message', "$jeu->nom loué !");
}`,
      note: "Une application web complète : routes, contrôleurs, Blade, Eloquent, validation, auth, rôles et API. DB::transaction garantit que stock et Transaction changent ensemble."
    },
    21: {
      titre: "🎓 étendre l'application",
      etat: "Épreuve finale : ajoute une fonctionnalité de bout en bout.",
      objectif: "Ajoute un tableau de bord administrateur : nombre de transactions et chiffre d'affaires total (agrégation Eloquent), réservé au rôle admin.",
      hints: [
        "abort_unless(auth()->user()->role === 'admin', 403);",
        "Transaction::count() et Transaction::sum('montant')."
      ],
      solution: `public function tableauBord()
{
    abort_unless(auth()->user()->role === 'admin', 403);

    $stats = [
        'nb' => Transaction::count(),
        'ca' => Transaction::sum('montant'),
    ];
    return view('admin.dashboard', $stats);
}`,
      note: "Tu réunis Eloquent (count, sum), auth et rôles : la synthèse du cours. Compare ce tableau de bord à sa version Django, Spring et .NET — même app, quatre frameworks."
    }
  }
};
