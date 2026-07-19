/* ===== Fil rouge « La Ludothèque pro » — Niveau 8, projet full-stack outillé (PHP · Laravel) =====
   On reconstruit la Ludothèque comme en entreprise : conteneurisée dès le
   premier jour, testée et livrée par un pipeline CI/CD, sécurisée par conception.
   Chaque étape mène de front la construction (métier), l'industrialisation
   (Docker/CI/CD) et la sécurité — jamais l'une sans les autres.
   Prérequis : capstone PHP·Laravel (N4) + Docker, CI/CD, Sécurité (N5). */
var FIL = {
  prefix: "proj6php21",
  app: "La Ludothèque pro",
  placeholder: "Écris ton code / ta config / ta commande ici…",
  etapes: {
    1: {
      titre: "le cadrage professionnel",
      etat: "Feuille blanche — mais cette fois on part avec les réflexes d'une équipe : un dépôt propre, un environnement conteneurisé, une définition de « prêt ».",
      objectif: "Pose les fondations pro : l'arborescence (projet Laravel + couche Services, Dockerfile, compose, .github/workflows, .env hors Git), la definition of done (code + tests + Pint + image qui build), et le flux Git (branches courtes, PR, main protégée).",
      hints: [
        "Le projet Laravel, mais aussi : Dockerfile, compose.yaml, .github/workflows/ci.yml, .gitignore, .dockerignore.",
        "Definition of Done : une fonctionnalité n'est « faite » que testée, formatée (Pint), et l'image build.",
        "GitHub Flow : main déployable, une branche par changement, PR obligatoire (cours CI/CD)."
      ],
      solution: `app/Models app/Services app/Http    Eloquent, services métier, contrôleurs/requests
database/migrations database/factories  schéma versionné + données de test
routes/ (web.php, api.php)            les routes
resources/views                        templates Blade
tests/ (Unit, Feature)                 PHPUnit : unitaires + fonctionnels
composer.json                          dépendances + scripts (pint, phpunit)
Dockerfile                             image (multi-stage : build puis PHP-FPM)
compose.yaml                           app + MySQL, réseau, volume (dev)
.github/workflows/ci.yml               tests + Pint + build à chaque commit
.env / .env.example                    config et secrets — HORS Git (.gitignore)

# Definition of Done (contrat d'équipe)
#  fonctionnalité = code + tests verts + Pint OK + image qui build + PR relue
# Flux : branche courte -> commits normés -> PR -> CI verte -> merge sur main`,
      note: "La différence avec le Niveau 6 tient en une phrase : on n'ajoute pas les outils à la fin, on les pose AVANT d'écrire la première ligne métier. Le dépôt, le Compose, le pipeline et la règle « rien n'entre dans main sans CI verte » existent dès le jour 1 — tout le reste s'y coule."
    },
    2: {
      titre: "le squelette dans Docker Compose",
      etat: "L'architecture est posée. On crée le projet Laravel et sa base MySQL directement en conteneurs — aucune installation sur la machine.",
      objectif: "Crée le projet Laravel et lance-le via Docker Compose (service app PHP-FPM + Nginx + service MySQL, healthcheck, volume). L'app lit sa config depuis l'environnement. Vérifie la route /health dans le conteneur.",
      hints: [
        "compose.yaml : app (build .), web (nginx), bdd (mysql:8.4, healthcheck), volume donnees-mysql.",
        "app dépend de bdd (condition: service_healthy) ; DB_HOST=bdd (DNS interne).",
        "docker compose up -d && curl localhost:8080/health"
      ],
      solution: `# compose.yaml (dev)
services:
  app:
    build: .
    env_file: .env
    depends_on:
      bdd: { condition: service_healthy }
  web:
    image: nginx:alpine
    ports: ["8080:80"]
    depends_on: [app]
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

# $ docker compose up -d
# $ curl localhost:8080/health   -> {"statut":"ok"}`,
      note: "Personne n'installe PHP ni MySQL sur son poste : `docker compose up` suffit, et tout le monde a le même environnement (cours Docker). DB_HOST=bdd fonctionne grâce au DNS interne du réseau Compose ; le healthcheck fait attendre l'app que MySQL soit prêt, pas juste démarré. Nginx sert le PHP-FPM, comme en production."
    },
    3: {
      titre: "le pipeline dès le premier commit",
      etat: "Le projet tourne en local. Avant d'écrire du métier, on met en place le garde-fou : Git propre et une CI qui vérifie chaque commit.",
      objectif: "Initialise le dépôt (commits normés, .gitignore), pousse sur GitHub, et écris .github/workflows/ci.yml : sur push/PR, un job qui installe PHP + Composer, lance Pint et PHPUnit. Configure la protection de main (PR + CI verte).",
      hints: [
        "Messages normés : feat:, fix:, chore: (cours CI/CD leçon 1).",
        "ci.yml : shivammathur/setup-php, composer install, ./vendor/bin/pint --test, php artisan test.",
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
      - uses: shivammathur/setup-php@v2
        with: { php-version: "8.3", tools: composer }
      - run: composer install --no-interaction --prefer-dist
      - run: ./vendor/bin/pint --test        # format
      - run: php artisan test                # PHPUnit

# Git : git init ; commits "feat: squelette Laravel + Compose"
# GitHub : protection de main (PR obligatoire + CI verte, cours CI/CD l.14)`,
      note: "Le pipeline existe AVANT le métier : ainsi, dès la première fonctionnalité, elle naît sous surveillance. C'est l'inverse du Niveau 6 où l'on testait « quand on y pensait ». Ici, un commit qui casse `php artisan test` ou le format (Pint) est rouge immédiatement, et ne peut pas entrer dans main."
    },
    4: {
      titre: "le schéma, versionné et migré en conteneur",
      etat: "L'usine tourne à vide. On y coule la première brique : le schéma de la Ludothèque, issu du MCD Merise.",
      objectif: "Écris les migrations Laravel (categories, jeux : deux stocks, prix en decimal, clés étrangères), applique-les DANS le conteneur (php artisan migrate). La CI rejoue les migrations sur une base neuve.",
      hints: [
        "Migration : Schema::create('jeux', fn(Blueprint $t) => ...) ; $t->decimal('prix_achat', 6, 2).",
        "docker compose exec app php artisan migrate.",
        "Le job de tests de la CI (leçon 6) partira d'une base vierge : les migrations doivent rejouer de zéro."
      ],
      solution: `// database/migrations/..._create_categories_table.php
Schema::create('categories', function (Blueprint $t) {
    $t->id();
    $t->string('nom', 100)->unique();
    $t->timestamps();
});
// ..._create_jeux_table.php
Schema::create('jeux', function (Blueprint $t) {
    $t->id();
    $t->string('titre', 200);
    $t->decimal('prix_achat', 6, 2);
    $t->decimal('prix_location', 6, 2);
    $t->unsignedInteger('stock_vente')->default(0);
    $t->unsignedInteger('stock_location')->default(0);
    $t->foreignId('categorie_id')->constrained('categories')->restrictOnDelete();
    $t->index('titre');                    // recherche anticipée
    $t->timestamps();
});
// $ docker compose exec app php artisan migrate`,
      note: "Le schéma vient de Merise, comme au Niveau 6 — mais ici les migrations Laravel le versionnent, l'index de recherche est posé DÈS le départ (on sait qu'on paginera), et la migration sera rejouée à chaque commit par la CI sur une base neuve : plus de « ça migre par chance ». Chaque migration est un fichier horodaté, immuable une fois poussé : on corrige avec une nouvelle migration, jamais en réécrivant une ancienne."
    },
    5: {
      titre: "les modèles, testés dès l'écriture",
      etat: "Le catalogue prend forme. On y ajoute le vocabulaire métier — et son filet de tests, écrit en même temps.",
      objectif: "Écris les modèles Eloquent Categorie et Jeu (casts decimal, relation belongsTo), les accesseurs estLouable/estAchetable, un scope local louables(), et ÉCRIS les tests de ces règles dans la foulée. La CI exécute ces tests avec un service MySQL.",
      hints: [
        "Accesseur : getEstLouableAttribute() => $this->stock_location > 0 (une règle, un endroit).",
        "Test : Jeu::factory()->make(['stock_location'=>0])->est_louable === false ; scope louables().",
        "Le job de tests CI a un service mysql:8.4 (cours CI/CD leçon 10)."
      ],
      solution: `class Jeu extends Model
{
    protected $casts = ['prix_achat' => 'decimal:2', 'prix_location' => 'decimal:2'];

    public function categorie() { return $this->belongsTo(Categorie::class); }

    public function getEstLouableAttribute(): bool  { return $this->stock_location > 0; }
    public function getEstAchetableAttribute(): bool { return $this->stock_vente > 0; }

    public function scopeLouables($q) { return $q->where('stock_location', '>', 0); }
}

// tests/Unit/JeuTest.php — écrit EN MÊME TEMPS que le code
public function test_non_louable_si_stock_nul(): void {
    $jeu = Jeu::factory()->make(['stock_location' => 0]);
    $this->assertFalse($jeu->est_louable);
}
// CI (job tests) : service mysql:8.4 + php artisan test`,
      note: "Au Niveau 6, les tests arrivaient à la semaine 3 ; ici ils naissent avec le code. Écrire la règle (un accesseur) et son test dans le même commit change tout : la CI les exécute aussitôt, et une régression future devient rouge à la seconde. C'est le TDD léger d'une équipe qui a intégré que « non testé = non fait ». Les casts decimal évitent les erreurs d'arrondi sur l'argent."
    },
    6: {
      titre: "la couche service sous surveillance",
      etat: "Les données savent se lire. On y ajoute les décisions métier — dans une couche service, testée et formatée par la CI.",
      objectif: "Écris app/Services/JeuService : verifierStockLocation (exception métier), prixLocation (7j + 0,50 €/jour). Couvre chaque règle par un test unitaire rapide (sans base : on instancie un Jeu en mémoire).",
      hints: [
        "class StockInsuffisantException extends \\RuntimeException : vocabulaire métier explicite.",
        "prixLocation($jeu, 10) avec base 5 € = 6,50 € (assertSame avec bcmath pour les décimaux).",
        "Le service se teste avec un Jeu en mémoire -> en millisecondes, sans MySQL."
      ],
      solution: `// app/Exceptions/StockInsuffisantException.php
class StockInsuffisantException extends \\RuntimeException {}

// app/Services/JeuService.php
class JeuService
{
    public function verifierStockLocation(Jeu $jeu): void {
        if ($jeu->stock_location <= 0)
            throw new StockInsuffisantException("Plus de stock pour {$jeu->titre}");
    }
    public function prixLocation(Jeu $jeu, int $nbJours = 7): string {
        $base = $jeu->prix_location;
        return $nbJours <= 7 ? $base
             : bcadd($base, bcmul((string)($nbJours - 7), '0.50', 2), 2);
    }
}
// test rapide (sans base)
public function test_tarif_prolongation(): void {
    $jeu = new Jeu(['prix_location' => '5.00']);
    $this->assertSame('6.50', app(JeuService::class)->prixLocation($jeu, 10));
}`,
      note: "La couche service isole les décisions métier : ses tests tournent en millisecondes (aucune base), donc la CI reste rapide (< 10 min, condition de son adoption, cours CI/CD). On calcule l'argent avec bcmath (chaînes) plutôt que des floats : jamais d'erreur d'arrondi sur un prix. Décisions isolées + tests instantanés = un pipeline qui reste vert et véloce à mesure que le projet grossit."
    },
    7: {
      titre: "l'API et le job de tests au vert",
      etat: "Le métier existe et il est testé. On l'ouvre en API — et on ajoute le job de tests complet à la CI, avec MySQL.",
      objectif: "Expose GET /api/jeux (API Resource comme DTO, with('categorie') anti-N+1) et écris un test fonctionnel (getJson). Complète ci.yml : job tests avec service mysql, php artisan test, et fais passer le tout au vert.",
      hints: [
        "JeuResource : choisit ce qui sort (pas de champ interne exposé).",
        "Test : $this->getJson('/api/jeux')->assertOk()->assertJsonStructure([...]).",
        "Job CI tests : services.mysql, env DB_HOST=127.0.0.1, run php artisan test."
      ],
      solution: `// app/Http/Resources/JeuResource.php
class JeuResource extends JsonResource {
    public function toArray($request): array {
        return ['id' => $this->id, 'titre' => $this->titre,
                'prix_location' => $this->prix_location, 'louable' => $this->est_louable];
    }
}
// routes/api.php
Route::get('/jeux', fn() =>
    JeuResource::collection(Jeu::with('categorie')->orderBy('titre')->get()));  // anti-N+1

# ci.yml — job tests
  tests:
    services:
      mysql: { image: mysql:8.4, env: {...}, ports: ["3306:3306"], options: --health-cmd=... }
    steps: [ checkout, setup-php, "composer install", "php artisan test" ]`,
      note: "Fin de semaine 1 : l'usine est complète AVANT que l'application ne soit finie. Modèles, services et API existent, chacun sous tests, et le pipeline (Pint + tests avec MySQL) tourne au vert à chaque commit. La Resource découple l'API du schéma ; le with('categorie') charge tout en une requête. On peut désormais empiler le métier en confiance — chaque ajout naîtra testé et surveillé."
    },
    8: {
      titre: "valider les entrées, refuser proprement",
      etat: "L'API lit. Avant qu'elle n'écrive, on blinde les entrées et on traduit les erreurs — sécurité et robustesse d'un seul geste.",
      objectif: "Écris une Form Request (rules : prix positifs, stocks >= 0, existence de la catégorie), traduis les exceptions en HTTP (422/404/409 sans fuite technique) via le Handler, et ajoute un test par cas d'erreur. Rappelle la règle « toute entrée est hostile ».",
      hints: [
        "StoreJeuRequest::rules() : 'prix_location' => 'required|numeric|gt:0', 'stock_vente' => 'integer|min:0'.",
        "ModelNotFound -> 404 (auto) ; StockInsuffisant -> 409 (Handler) ; validation -> 422 (auto). Messages génériques.",
        "Un test par branche d'erreur : la CI les verrouille."
      ],
      solution: `// app/Http/Requests/StoreJeuRequest.php
class StoreJeuRequest extends FormRequest {
    public function authorize(): bool { return $this->user()->can('gerer-catalogue'); }
    public function rules(): array {
        return [
            'titre' => 'required|string|max:200',
            'prix_achat' => 'required|numeric|gt:0',
            'prix_location' => 'required|numeric|gt:0',
            'stock_vente' => 'integer|min:0',
            'categorie_id' => 'required|exists:categories,id',   // liste d'autorisation
        ];
    }
}
// app/Exceptions/Handler.php — traduction sans fuite
$this->renderable(fn(StockInsuffisantException $e) =>
    response()->json(['erreur' => $e->getMessage()], 409));`,
      note: "La validation n'est pas qu'une commodité : c'est la première ligne de défense (cours Sécurité). La Form Request valide en liste d'autorisation (exists, numeric, min) AVANT que le contrôleur ne s'exécute — une requête invalide n'atteint jamais le métier (422 automatique). Le Handler centralise la traduction des exceptions métier, avec des messages génériques : injection et fuite d'information fermées d'emblée. Chaque cas a son test."
    },
    9: {
      titre: "des comptes et une authentification durcie",
      etat: "Le catalogue est public et sûr. On introduit les utilisateurs — avec les bons réflexes de sécurité dès le premier compte.",
      objectif: "Mets en place les trois rôles, l'inscription (mot de passe haché bcrypt/argon2id), et durcis : politique de mot de passe (longueur, refus des fuités via Password::defaults), cookies de session sécurisés (secure, http_only, same_site). Teste inscription et connexion.",
      hints: [
        "Rôles : colonne role sur users, ou spatie/laravel-permission. Hash via config hashing.",
        "Password::min(12)->uncompromised() ; config/session.php : 'secure'=>true, 'http_only'=>true, 'same_site'=>'lax'.",
        "Middleware auth + vérification à la connexion (cours Sécurité l.6)."
      ],
      solution: `// config/hashing.php : 'driver' => 'argon2id'  (ou 'bcrypt' avec rounds élevés)
// inscription
$user = User::create([
    'email' => $data['email'],
    'password' => Hash::make($data['password']),   // HACHÉ, jamais en clair
    'role' => 'client',
]);
// règle de mot de passe (AppServiceProvider::boot)
Password::defaults(fn() => Password::min(12)->uncompromised());

# config/session.php
'secure' => true,        // cookie transmis uniquement en HTTPS
'http_only' => true,     // inaccessible au JavaScript (anti-XSS)
'same_site' => 'lax',    // anti-CSRF de base`,
      note: "Au Niveau 6, la sécurité des sessions arrivait en fin de parcours. Ici, dès le premier utilisateur : hachage argon2id/bcrypt (Laravel ne stocke jamais de clair), politique NIST (min 12, uncompromised vérifie les fuites connues via Have I Been Pwned), cookies durcis. Sécuriser au moment où l'on crée la fonctionnalité coûte quelques lignes de config ; le faire après coup coûte un audit. C'est tout l'intérêt du « par conception »."
    },
    10: {
      titre: "l'autorisation, par rôle ET par ressource",
      etat: "On sait QUI est connecté. On décide QUI accède à QUOI — sans jamais laisser passer un IDOR.",
      objectif: "Applique l'autorisation : par rôle (gérer le catalogue = vendeur/admin, via Gate/Policy) ET par ressource (« mes locations » filtrées par auth()->id()). Écris le test d'accès croisé : le client A ne voit pas les objets de B.",
      hints: [
        "Gate::define('gerer-catalogue', fn($u) => in_array($u->role, ['vendeur','admin'])).",
        "LocationPolicy::view(User $u, Location $l) => $u->id === $l->client_id.",
        "Test clé (cours Sécurité l.7) : A tente l'objet de B -> 403/404 (actingAs)."
      ],
      solution: `// app/Policies/LocationPolicy.php — par RESSOURCE
public function view(User $u, Location $location): bool {
    return $u->id === $location->client_id;      // sur SON objet, jamais un id d'URL de confiance
}

// contrôleur
public function show(Location $location) {
    $this->authorize('view', $location);          // 403 si pas à lui
    return view('locations.show', compact('location'));
}
// par RÔLE : Gate::define('gerer-catalogue', fn($u) => in_array($u->role,['vendeur','admin']));

// test d'accès croisé (verrouillé par la CI)
public function test_client_ne_voit_pas_les_locations_dautrui(): void {
    $this->actingAs($clientA)->get("/locations/{$locationDeB->id}")->assertForbidden();
}`,
      note: "Le contrôle d'accès cassé est la faille n°1 (OWASP A01). En écrivant la Policy AVEC son test d'accès croisé dès la création de la fonctionnalité, l'IDOR ne peut pas s'installer : la CI relance ce test à chaque commit. Rôle (peut-il agir ? via Gate) ET ressource (sur SON objet ? via Policy) — les deux, dès le départ. On renvoie 403/404 côté serveur, jamais on ne se contente de masquer un bouton."
    },
    11: {
      titre: "louer : transaction et test de fonctionnalité",
      etat: "Le cœur métier arrive. On l'écrit atomique et verrouillé, et on le prouve par un test qui traverse toute la chaîne.",
      objectif: "Écris JeuService::louer (DB::transaction + lockForUpdate, contrôle de stock), la route POST protégée (auth + CSRF), et le test fonctionnel : POST connecté décrémente le stock ; stock nul -> refus propre, aucune location fantôme.",
      hints: [
        "DB::transaction(fn() => ...) ; Jeu::where('id',$id)->lockForUpdate()->firstOrFail().",
        "Route en POST + @csrf ; redirection après (Post-Redirect-Get).",
        "Test : assertDatabaseCount('locations', 1) et stock -1 ; cas stock 0 -> pas de location."
      ],
      solution: `public function louer(User $client, int $jeuId, int $nbJours = 7): Location {
    return DB::transaction(function () use ($client, $jeuId, $nbJours) {
        $jeu = Jeu::where('id', $jeuId)->lockForUpdate()->firstOrFail();
        if ($jeu->stock_location <= 0)
            throw new StockInsuffisantException("Plus de stock de location");
        $jeu->decrement('stock_location');
        return Location::create([
            'client_id' => $client->id, 'jeu_id' => $jeu->id,
            'date_debut' => now(), 'nb_jours' => $nbJours,
        ]);
    });
}
// test fonctionnel (cours CI/CD l.10)
public function test_louer_decremente(): void {
    $this->actingAs($this->client)->post("/louer/{$this->jeu->id}");
    $this->assertEquals(2, $this->jeu->fresh()->stock_location);
}`,
      note: "Même transaction qu'au Niveau 6 (DB::transaction + lockForUpdate contre la course au stock), mais écrite d'emblée avec son test fonctionnel qui tourne en CI sur un vrai MySQL. Si l'exception est levée, la transaction est annulée : aucune location fantôme, stock intact. La règle métier la plus précieuse du projet est ainsi verrouillée dès sa naissance : impossible de la casser sans un job rouge."
    },
    12: {
      titre: "acheter : prix figé et couverture",
      etat: "La location tourne. On ajoute l'achat sur l'autre stock, et on surveille désormais la couverture de tests.",
      objectif: "Écris JeuService::acheter (stock_vente, montant = prix_achat figé), son test (le montant ne bouge pas si le prix change ensuite), et ajoute la mesure de couverture à la CI (php artisan test --coverage, seuil-cliquet). Vérifie que le seuil tient.",
      hints: [
        "Achat::create(['montant' => $jeu->prix_achat]) COPIÉ ; test : changer prix_achat après -> montant inchangé.",
        "CI : php artisan test --coverage --min=80 (PCOV ou Xdebug).",
        "Le seuil se règle au niveau actuel puis se remonte (anti-recul, cours CI/CD l.11)."
      ],
      solution: `public function acheter(User $client, int $jeuId): Achat {
    return DB::transaction(function () use ($client, $jeuId) {
        $jeu = Jeu::where('id', $jeuId)->lockForUpdate()->firstOrFail();
        if ($jeu->stock_vente <= 0) throw new StockInsuffisantException("Plus de stock de vente");
        $jeu->decrement('stock_vente');
        return Achat::create([
            'client_id' => $client->id, 'jeu_id' => $jeu->id,
            'date_achat' => now(), 'montant' => $jeu->prix_achat,   // FIGÉ (copié)
        ]);
    });
}
public function test_prix_fige(): void {
    $achat = app(JeuService::class)->acheter($this->client, $this->jeu->id);
    $this->jeu->update(['prix_achat' => '99.00']);
    $this->assertEquals($this->prixInitial, $achat->fresh()->montant);
}
# ci.yml : php artisan test --coverage --min=80`,
      note: "Le prix figé (une facture ne change pas) est verrouillé par un test, et la couverture entre dans la CI comme cliquet : le seuil ne peut plus reculer. Attention : 80 % de couverture ne veut pas dire 80 % correct — un test peut exécuter une ligne sans rien vérifier. La couverture repère le code jamais testé (une alarme utile) ; la vraie qualité vient des assertions. On l'utilise comme garde-fou, pas comme objectif en soi."
    },
    13: {
      titre: "le frontend, échappé et sous en-têtes",
      etat: "Le métier complet est en place. On lui donne un visage — avec l'échappement et les en-têtes de sécurité par défaut.",
      objectif: "Rends le catalogue (templates Blade, échappement automatique de {{ }}, @csrf sur les POST), et pose les en-têtes de sécurité (CSP, X-Frame-Options, nosniff) via un middleware. Vérifie qu'aucun {!! !!} ne traîne sur du contenu utilisateur.",
      hints: [
        "{{ $jeu->titre }} échappe ; jamais {!! !!} sur une saisie (cours Sécurité l.3).",
        "Middleware SecurityHeaders : Content-Security-Policy, X-Frame-Options: DENY, X-Content-Type-Options: nosniff.",
        "grep '{!!' resources/views -> justifier ou retirer."
      ],
      solution: `{{-- resources/views/catalogue.blade.php --}}
@foreach ($jeux as $jeu)
  <tr><td>{{ $jeu->titre }}</td><td>{{ $jeu->prix_location }} €</td>
  <td><form method="POST" action="{{ route('louer', $jeu) }}">
      @csrf<button>Louer</button></form></td></tr>
@endforeach

// app/Http/Middleware/SecurityHeaders.php
$response->headers->set('Content-Security-Policy', "default-src 'self'");
$response->headers->set('X-Frame-Options', 'DENY');            // anti-clickjacking
$response->headers->set('X-Content-Type-Options', 'nosniff');`,
      note: "Le frontend hérite gratuitement de l'échappement Blade ({{ }}) et des en-têtes de sécurité posés d'office : XSS et clickjacking sont fermés avant même d'exister. Le @csrf injecte le jeton dans chaque formulaire (Laravel le vérifie automatiquement). La grande majorité des XSS viennent d'un {!! !!} sur une donnée non fiable : un grep avant merge suffit à éliminer cette classe de failles. Rien n'est ajouté après."
    },
    14: {
      titre: "les secrets et la configuration",
      etat: "L'app est complète et sûre côté code. On verrouille sa configuration : rien de sensible dans le dépôt ni l'image.",
      objectif: "Range la config par environnement (.env pour les secrets, config/*.php qui lit env()), garde .env hors Git et hors image, ajoute un scan de secrets (gitleaks) au pipeline, et écris la procédure de rotation d'un secret exposé.",
      hints: [
        "config/*.php lit env('DB_PASSWORD') ; .env dans .gitignore ET .dockerignore ; .env.example versionné (sans valeurs).",
        "ci.yml : job gitleaks detect (cours Sécurité l.8, CI/CD l.13).",
        "Rotation : révoquer -> régénérer -> reposer -> vérifier -> auditer. APP_KEY hors du dépôt."
      ],
      solution: `# .env (HORS Git) — les secrets
APP_KEY=base64:...           # généré par php artisan key:generate
DB_PASSWORD=...
# config/database.php lit env('DB_PASSWORD') ; le code n'appelle env() QUE dans config/*

# .gitignore + .dockerignore : .env
# .env.example versionné : les CLÉS sans les VALEURS

# ci.yml — détection de secrets
  securite:
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - run: gitleaks detect --source . --redact --exit-code 1`,
      note: "Fin de semaine 2 : l'application est complète, testée ET sécurisée — secrets dans .env (hors code et hors image), scan de secrets dans la CI (une clé commitée rend le job rouge). En Laravel, n'appelle env() QUE dans les fichiers config/* (le cache de config casse env() ailleurs) et garde APP_KEY hors du dépôt. Un secret dans l'historique Git n'est pas effacé par un commit de suppression : la seule réponse sûre est la rotation."
    },
    15: {
      titre: "recherche, pagination et qualité",
      etat: "Le métier et la sécurité sont solides. On soigne l'expérience et on resserre la qualité automatique.",
      objectif: "Ajoute recherche (where like) et pagination (paginate, état dans l'URL) sans N+1 (with('categorie')), verrouille les performances par un test qui compte les requêtes, et durcis le format (Pint) en CI.",
      hints: [
        "Jeu::with('categorie')->where('titre','like',\"%{$q}%\")->paginate(10)->withQueryString().",
        "Test anti-N+1 : DB::enableQueryLog(); ...; count(DB::getQueryLog()) attendu.",
        "ci.yml : ./vendor/bin/pint --test."
      ],
      solution: `// app/Http/Controllers/CatalogueController.php
public function index(Request $r) {
    $jeux = Jeu::louables()->with('categorie')            // eager load : pas de N+1
        ->when($r->q, fn($query, $q) => $query->where('titre', 'like', "%{$q}%"))
        ->orderBy('titre')->paginate(10)->withQueryString();
    return view('catalogue', compact('jeux'));
}

public function test_catalogue_sans_n_plus_un(): void {
    Jeu::factory()->count(5)->create();
    DB::enableQueryLog();
    $this->get('/catalogue');
    $this->assertLessThanOrEqual(3, count(DB::getQueryLog()));   // pas 1 par jeu
}`,
      note: "La performance devient testable : compter les requêtes SQL transforme « pas de N+1 » en garantie vérifiée par la CI (l'équivalent Laravel de assertNumQueries). Le with('categorie') charge les catégories en une requête. Pint tranche le format une fois pour toutes. À ce stade, le pipeline garde le code correct, sûr, rapide ET propre — sans effort humain répété."
    },
    16: {
      titre: "les trois espaces, cloisonnés",
      etat: "Le catalogue est navigable. On ouvre les espaces des trois profils, chacun protégé.",
      objectif: "Crée /client (ses locations/achats), /vendeur (stocks, retards), /gestion (comptes, promotions) — chaque route protégée par le bon rôle (middleware/Gate). Aucune logique métier nouvelle : on orchestre les services existants.",
      hints: [
        "Route::middleware('can:gerer-catalogue')->group(...) ; tests de refus croisé.",
        "Espace client filtré par auth()->id() ; promotion réservée à l'admin.",
        "Réutilise JeuService::louer/acheter/rendre et les scopes (leçons 5-12)."
      ],
      solution: `// routes/web.php
Route::middleware('auth')->group(function () {
    Route::get('/client', [EspaceClientController::class, 'index']);        // ses données
    Route::middleware('can:gerer-catalogue')->group(function () {
        Route::get('/vendeur', [EspaceVendeurController::class, 'index']);
    });
    Route::middleware('can:administrer')->group(function () {
        Route::post('/gestion/promouvoir/{user}', [GestionController::class, 'promouvoir']);
    });
});
// EspaceClientController : Location::where('client_id', auth()->id())->with('jeu')->get();

// test : $this->actingAs($client)->get('/gestion')->assertForbidden();`,
      note: "Les espaces n'ajoutent aucune règle métier : ils orchestrent les services et requêtes déjà écrits et testés (leçons 5-15). C'est le dividende d'une architecture en couches montée proprement — la dernière ligne droite assemble, elle ne réinvente pas. Chaque espace a son test de refus croisé, verrouillé par la CI : la matrice « qui accède à quoi » est prouvée, pas supposée."
    },
    17: {
      titre: "l'image de production, durcie",
      etat: "L'application est finie. On fabrique l'artefact qui partira en prod : léger, non-root, scanné.",
      objectif: "Écris le Dockerfile multi-stage de production (étage composer pour les dépendances, étage PHP-FPM slim sans dev), utilisateur non-root, et ajoute le scan d'image (trivy) au pipeline. Compare la taille et vérifie qu'aucune faille critique ne passe.",
      hints: [
        "Étage builder : composer install --no-dev --optimize-autoloader ; étage final : php:8.3-fpm-alpine.",
        "USER www-data (non-root) ; COPY du seul code + vendor, pas les outils de dev.",
        "ci.yml : trivy image --exit-code 1 --severity CRITICAL (cours Sécurité l.16, Docker l.15-16)."
      ],
      solution: `# Dockerfile (production)
FROM composer:2 AS build
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --optimize-autoloader --no-interaction
COPY . .
RUN composer dump-autoload --optimize

FROM php:8.3-fpm-alpine
RUN docker-php-ext-install pdo_mysql opcache
WORKDIR /var/www
COPY --from=build --chown=www-data:www-data /app .
USER www-data                     # non-root
EXPOSE 9000
CMD ["php-fpm"]`,
      note: "L'image de prod applique d'un coup le cours Docker (multi-stage, non-root) et le cours Sécurité (moindre privilège, scan CVE). L'étage builder contient Composer et les outils ; l'étage final ne garde que le code + vendor de production (--no-dev) sur une base alpine légère. Elle est plus légère, plus sûre, et vérifiée par trivy à chaque build : une faille critique bloque la livraison. L'artefact qui part en prod est un objet de confiance."
    },
    18: {
      titre: "le pipeline complet",
      etat: "L'image est prête. On assemble le pipeline de bout en bout et on verrouille main.",
      objectif: "Complète la CI (tests + qualité Pint + sécurité gitleaks + build image + smoke test) et le workflow de release (tag v* -> build, scan, push au registre). Verrouille la protection de branche : rien ne merge sans tout au vert + revue.",
      hints: [
        "ci.yml : jobs tests, qualite (pint), securite (gitleaks) en parallèle -> image (needs).",
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
      note: "Le pipeline réunit les trois cours d'outillage : CI/CD (structure, protection), Docker (image), Sécurité (scans). Un commit tagué déclenche build + scan + push d'un artefact versionné et immuable. La barrière de branche garantit que main est toujours déployable — la promesse devient une propriété mécanique du dépôt. Et la durée compte : caches Composer et parallélisme gardent le pipeline sous 10 min, condition de son adoption."
    },
    19: {
      titre: "le déploiement automatisé",
      etat: "L'image est publiée. Le dernier maillon : le serveur se met à jour tout seul, et on le vérifie.",
      objectif: "Écris le job de déploiement (SSH vers le serveur, compose pull + up -d + artisan migrate --force), la route /health, et deux environnements (staging au merge, production sur tag avec approbation). Termine par un curl /health qui valide.",
      hints: [
        "deployer needs publier ; ssh -i (clé) 'cd /srv/ludo && docker compose pull && up -d && exec app php artisan migrate --force'.",
        "/health : SELECT 1 -> 200 ou 503 ; curl -fs avec retries.",
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
            docker compose pull && docker compose up -d &&
            docker compose exec -T app php artisan migrate --force'
      - run: sleep 10 && curl -fs https://ludotheque.example.com/health`,
      note: "Le déploiement rejoue au robot ce qu'on ferait à la main : pull, up, migrate --force (le --force autorise la migration en prod sans confirmation interactive), puis vérifie /health. Staging se met à jour au merge, la production exige un tag ET une approbation. On ne se connecte plus jamais au serveur pour livrer : un git push origin v1.0.0, et l'application se déploie et se vérifie seule."
    },
    20: {
      titre: "observer, sauvegarder, protéger, revenir",
      etat: "Le projet est en ligne. On installe les filets de la vie en production.",
      objectif: "Mets en place l'observabilité (logs Monolog sans secret, /health), les sauvegardes chiffrées de la base (planifiées et testées), la conformité RGPD (export, anonymisation, durées) et la procédure de rollback (tag précédent, migrations N-1).",
      hints: [
        "Log::info() : événements de sécurité, jamais de mot de passe/jeton (cours Sécurité l.13).",
        "Sauvegarde : mysqldump chiffré (gpg), clé séparée, restauration testée (Docker l.8).",
        "RGPD : exporterMesDonnees, anonymiser ; rollback = redéployer le tag précédent (N-1)."
      ],
      solution: `// Observabilité : logs structurés (après commit, sans secret)
Log::info('location', ['jeu' => $jeuId, 'client' => $client->id]);
// (Laravel logue sur stderr en conteneur -> collecté par Docker)

# Sauvegarde chiffrée, planifiée et TESTÉE
docker compose exec bdd mysqldump ... | gpg --encrypt -r sauvegarde@ludo > backup.sql.gpg

// RGPD (cours Sécurité l.18)
public function supprimerMonCompte(User $u): void {
    DB::transaction(fn() => [$this->anonymiserLocations($u), $u->delete()]);
}

# Rollback : image tag précédent + up -d (migrations compatibles N-1, CI/CD l.19)`,
      note: "La production n'est pas la fin, c'est un état à tenir : observer (logs, /health), sauvegarder (chiffré, testé), respecter les données (RGPD) et pouvoir revenir (rollback N-1). Le rollback du CODE est trivial (image immuable) ; le vrai sujet est le SCHÉMA : une rupture (renommer une colonne) se fait en plusieurs migrations additives (ajouter, basculer, supprimer), jamais d'un coup, pour que reculer d'une version ne casse rien. Ces filets, appris séparément, sont ici tous en place."
    },
    21: {
      titre: "🎓 le projet professionnel de bout en bout",
      etat: "La Ludothèque pro est construite, conteneurisée, testée, sécurisée, livrée et surveillée — comme en entreprise.",
      objectif: "Exercice de synthèse : raconte le trajet complet d'une fonctionnalité, de la branche Git au /health vert en production, en montrant qu'à CHAQUE étape le métier, l'industrialisation et la sécurité avancent ensemble.",
      hints: [
        "Branche -> code + test écrits ensemble -> CI (tests+Pint+gitleaks+image) -> revue -> merge.",
        "Staging auto -> recette -> tag -> build+scan+push -> approbation -> prod -> /health.",
        "À chaque case : ce qui est construit, ce qui l'industrialise, ce qui le sécurise."
      ],
      solution: `LE TRAJET D'UNE FONCTIONNALITÉ (Ludothèque pro, PHP · Laravel)

git switch -c feature/reservation
  service métier + test écrits ENSEMBLE               [construire + tester]
  Form Request (validation), Policy (autorisation)    [sécuriser]
  push -> CI : tests+MySQL, Pint, gitleaks, build+scan [industrialiser+sécuriser]
  revue -> merge (protection de branche)             [industrialiser]
  -> STAGING auto -> recette
git tag v1.3.0
  -> build, scan CVE, push registre                  [industrialiser+sécuriser]
  -> approbation -> déploiement prod (pull/up/migrate)
  -> curl /health 200 ; logs et sauvegardes en place  [exploiter]

À aucun moment le métier n'avance sans son test ni sa protection :
construire, industrialiser, sécuriser — les trois disciplines, en même temps.`,
      note: "🎓 C'est l'aboutissement de toute la formation : non plus « construire, puis outiller », mais construire EN outillant — le métier, les tests, la sécurité et la livraison qui avancent d'un même pas. C'est exactement le quotidien d'une équipe professionnelle. Si tu sais mener ce trajet, en PHP · Laravel comme en n'importe quelle pile, tu sais livrer du logiciel pour de vrai."
    }
  }
};
