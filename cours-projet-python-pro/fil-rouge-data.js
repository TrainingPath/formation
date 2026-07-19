/* ===== Fil rouge « La Ludothèque pro » — Niveau 8, projet full-stack outillé (Python · Django) =====
   On reconstruit la Ludothèque comme en entreprise : conteneurisée dès le
   premier jour, testée et livrée par un pipeline CI/CD, sécurisée par conception.
   Chaque étape mène de front la construction (métier), l'industrialisation
   (Docker/CI/CD) et la sécurité — jamais l'une sans les autres.
   Prérequis : capstone Python·Django (N4) + Docker, CI/CD, Sécurité (N5). */
var FIL = {
  prefix: "proj6py21",
  app: "La Ludothèque pro",
  placeholder: "Écris ton code / ta config / ta commande ici…",
  etapes: {
    1: {
      titre: "le cadrage professionnel",
      etat: "Feuille blanche — mais cette fois on part avec les réflexes d'une équipe : un dépôt propre, un environnement conteneurisé, une définition de « prêt ».",
      objectif: "Pose les fondations pro : l'arborescence (app Django + services.py, Dockerfile, compose, .github/workflows, .env hors Git), la définition of done (code + tests + lint + image qui build), et le flux Git (branches courtes, PR, main protégée).",
      hints: [
        "L'app Django, mais aussi : Dockerfile, compose.yaml, .github/workflows/ci.yml, .gitignore, .dockerignore.",
        "Definition of Done : une fonctionnalité n'est « faite » que testée, lintée, et l'image build.",
        "GitHub Flow : main déployable, une branche par changement, PR obligatoire (cours CI/CD)."
      ],
      solution: `ludotheque/            projet Django (settings, urls, wsgi)
catalogue/             app : models, views, services, forms, tests
Dockerfile             image de l'app (dev puis prod, multi-stage)
compose.yaml           app + MySQL, réseau, volume (dev)
.github/workflows/ci.yml   tests + lint + build à chaque commit
.env / .env.docker     config et secrets — HORS Git (.gitignore)
.gitignore .dockerignore   .env*, .venv/, __pycache__/

# Definition of Done (contrat d'équipe)
#  fonctionnalité = code + tests verts + lint OK + image qui build + PR relue
# Flux : branche courte -> commits normés -> PR -> CI verte -> merge sur main`,
      note: "La différence avec le Niveau 6 tient en une phrase : on n'ajoute pas les outils à la fin, on les pose AVANT d'écrire la première ligne métier. Le dépôt, le Compose, le pipeline et la règle « rien n'entre dans main sans CI verte » existent dès le jour 1 — tout le reste s'y coule."
    },
    2: {
      titre: "le squelette dans Docker Compose",
      etat: "L'architecture est posée. On crée le projet Django et sa base MySQL directement en conteneurs — aucune installation sur la machine.",
      objectif: "Crée le projet Django et lance-le via Docker Compose (service app + service MySQL, healthcheck, volume). L'app lit sa config depuis l'environnement. Vérifie manage.py check dans le conteneur.",
      hints: [
        "compose.yaml : app (build .), bdd (mysql:8.4, healthcheck), volume donnees-mysql.",
        "app dépend de bdd (condition: service_healthy) ; DB_HOST=bdd (DNS interne).",
        "docker compose up -d && docker compose exec app python manage.py check"
      ],
      solution: `# compose.yaml (dev)
services:
  app:
    build: .
    ports: ["8000:8000"]
    env_file: .env.docker
    volumes: [".:/app"]                 # bind mount : code à chaud (dev)
    command: python manage.py runserver 0.0.0.0:8000
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
# $ docker compose exec app python manage.py check   -> OK`,
      note: "Personne n'installe Python ni MySQL sur son poste : `docker compose up` suffit, et tout le monde a le même environnement (cours Docker). DB_HOST=bdd fonctionne grâce au DNS interne du réseau Compose ; le healthcheck fait attendre l'app que MySQL soit prêt, pas juste démarré."
    },
    3: {
      titre: "le pipeline dès le premier commit",
      etat: "Le projet tourne en local. Avant d'écrire du métier, on met en place le garde-fou : Git propre et une CI qui vérifie chaque commit.",
      objectif: "Initialise le dépôt (commits normés, .gitignore), pousse sur GitHub, et écris .github/workflows/ci.yml : sur push/PR, un job qui installe Python, lance manage.py check et ruff. Configure la protection de main (PR + CI verte).",
      hints: [
        "Messages normés : feat:, fix:, chore: (cours CI/CD leçon 1).",
        "ci.yml : actions/checkout, setup-python, pip install, manage.py check, ruff check.",
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
      - uses: actions/setup-python@v5
        with: { python-version: "3.12", cache: "pip" }
      - run: pip install -r requirements.txt ruff
      - run: python manage.py check
        env: { DJANGO_SECRET_KEY: cle-de-ci }
      - run: ruff check .

# Git : git init ; commits "feat: squelette Django + Compose"
# GitHub : protection de main (PR obligatoire + CI verte, cours CI/CD l.14)`,
      note: "Le pipeline existe AVANT le métier : ainsi, dès la première fonctionnalité, elle naît sous surveillance. C'est l'inverse du Niveau 6 où l'on testait « quand on y pensait ». Ici, un commit qui casse `manage.py check` ou le lint est rouge immédiatement, et ne peut pas entrer dans main."
    },
    4: {
      titre: "le schéma, versionné et migré en conteneur",
      etat: "L'usine tourne à vide. On y coule la première brique : le schéma de la Ludothèque, issu du MCD Merise.",
      objectif: "Écris les modèles Categorie et Jeu (deux stocks, prix en Decimal, FK avec on_delete raisonné), génère la migration et applique-la DANS le conteneur. La CI rejoue les migrations sur une base neuve.",
      hints: [
        "Rappel N4 : DecimalField pour l'argent, PositiveIntegerField pour les stocks, ForeignKey(PROTECT).",
        "docker compose exec app python manage.py makemigrations && migrate.",
        "Le job de tests de la CI (leçon 6) partira d'une base vierge : les migrations doivent rejouer de zéro."
      ],
      solution: `class Categorie(models.Model):
    nom = models.CharField(max_length=100, unique=True)

class Jeu(models.Model):
    titre = models.CharField(max_length=200)
    prix_achat = models.DecimalField(max_digits=6, decimal_places=2)
    prix_location = models.DecimalField(max_digits=6, decimal_places=2)
    stock_vente = models.PositiveIntegerField(default=0)
    stock_location = models.PositiveIntegerField(default=0)
    categorie = models.ForeignKey(Categorie, on_delete=models.PROTECT)
    class Meta:
        indexes = [models.Index(fields=["titre"])]   # recherche fréquente

# $ docker compose exec app python manage.py makemigrations catalogue
# $ docker compose exec app python manage.py migrate`,
      note: "Le schéma vient de Merise, comme au Niveau 6 — mais ici l'index de recherche est posé DÈS le départ (on sait qu'on paginera), et la migration sera rejouée à chaque commit par la CI sur une base neuve : plus de « ça migre par chance ». Le savoir de la sécurité (l'index évite le N+1 et les scans lents) est intégré, pas ajouté après."
    },
    5: {
      titre: "les modèles, testés dès l'écriture",
      etat: "Le catalogue prend forme. On y ajoute le vocabulaire métier — et son filet de tests, écrit en même temps.",
      objectif: "Ajoute Fournisseur, les propriétés est_louable/est_achetable, un QuerySet métier (louables), et ÉCRIS les tests de ces règles dans la foulée. La CI exécute ces tests avec un service MySQL.",
      hints: [
        "@property est_louable = stock_location > 0 (une règle, un endroit).",
        "Test : Jeu(stock_location=0).est_louable is False ; QuerySet louables().",
        "Le job de tests CI a un service mysql:8.4 (cours CI/CD leçon 10)."
      ],
      solution: `class Jeu(models.Model):
    ...
    objects = JeuQuerySet.as_manager()
    @property
    def est_louable(self): return self.stock_location > 0
    @property
    def est_achetable(self): return self.stock_vente > 0

# tests.py — écrit EN MÊME TEMPS que le code
class ModelesTests(TestCase):
    def test_non_louable_si_stock_nul(self):
        cat = Categorie.objects.create(nom="Stratégie")
        jeu = Jeu.objects.create(titre="Catan", prix_achat=30, prix_location=5,
                                 stock_location=0, categorie=cat)
        self.assertFalse(jeu.est_louable)

# CI (job tests) : service mysql:8.4 + manage.py test`,
      note: "Au Niveau 6, les tests arrivaient à la semaine 3 ; ici ils naissent avec le code. Écrire la règle et son test dans le même commit change tout : la CI les exécute aussitôt, et une régression future devient rouge à la seconde. C'est le TDD léger d'une équipe qui a intégré que « non testé = non fait »."
    },
    6: {
      titre: "la couche service sous surveillance",
      etat: "Les données savent se lire. On y ajoute les décisions métier — dans une couche service, testée et lintée par la CI.",
      objectif: "Écris services.py : jeux_louables(), verifier_stock_location (exception métier), prix_location (Decimal, 7j + 0,50 €/jour). Couvre chaque règle par un test unitaire rapide (mock du repository, sans base).",
      hints: [
        "StockInsuffisant(Exception) : vocabulaire métier explicite.",
        "prix_location(jeu, 10) avec base 5 € = 6,50 € (test assertEqual Decimal).",
        "Le service est du Python pur -> testable en millisecondes, sans MySQL."
      ],
      solution: `# catalogue/services.py
from decimal import Decimal
class StockInsuffisant(Exception): pass

def verifier_stock_location(jeu):
    if jeu.stock_location <= 0:
        raise StockInsuffisant(f"Plus de stock pour {jeu.titre}")

def prix_location(jeu, nb_jours=7):
    base = jeu.prix_location
    return base if nb_jours <= 7 else base + (nb_jours - 7) * Decimal("0.50")

# tests unitaires (rapides, sans base)
def test_tarif_prolongation(self):
    jeu = Jeu(prix_location=Decimal("5.00"))
    self.assertEqual(services.prix_location(jeu, 10), Decimal("6.50"))`,
      note: "La couche service en Python pur (N4) prend ici tout son sens : ses tests tournent en millisecondes, donc la CI reste rapide (< 10 min, condition de son adoption, cours CI/CD). Décisions métier isolées + tests instantanés = un pipeline qui reste vert et véloce à mesure que le projet grossit."
    },
    7: {
      titre: "l'API et le job de tests au vert",
      etat: "Le métier existe et il est testé. On l'ouvre en API — et on ajoute le job de tests complet à la CI, avec MySQL.",
      objectif: "Expose GET /api/jeux/ (DRF, serializer = DTO, select_related anti-N+1) et écris un test d'intégration (self.client). Complète ci.yml : job tests avec service mysql, manage.py test, et fais passer le tout au vert.",
      hints: [
        "ReadOnlyModelViewSet + JeuSerializer (choisit ce qui sort, pas de champ interne).",
        "Test : self.client.get('/api/jeux/') -> 200 + JSON.",
        "Job CI tests : services.mysql, env DB_HOST=127.0.0.1, run manage.py test."
      ],
      solution: `class JeuSerializer(serializers.ModelSerializer):
    est_louable = serializers.BooleanField(read_only=True)
    class Meta:
        model = Jeu
        fields = ["id","titre","prix_location","est_louable"]

class JeuViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Jeu.objects.select_related("categorie").order_by("titre")
    serializer_class = JeuSerializer

# ci.yml — job tests
  tests:
    services:
      mysql: { image: mysql:8.4, env: {...}, ports: ["3306:3306"], options: --health-cmd=... }
    steps: [ checkout, setup-python, pip install, "python manage.py test" ]`,
      note: "Fin de semaine 1 : l'usine est complète AVANT que l'application ne soit finie. Modèles, services et API existent, chacun sous tests, et le pipeline (check + lint + tests avec MySQL) tourne au vert à chaque commit. On peut désormais empiler le métier en confiance — chaque ajout naîtra testé et surveillé."
    },
    8: {
      titre: "valider les entrées, refuser proprement",
      etat: "L'API lit. Avant qu'elle n'écrive, on blinde les entrées et on traduit les erreurs — sécurité et robustesse d'un seul geste.",
      objectif: "Écris la validation (Form/serializer : prix positifs, stocks >= 0, bornes), traduis les exceptions en HTTP (400/404/409 sans fuite technique), et ajoute un test par cas d'erreur. Rappelle la règle « toute entrée est hostile ».",
      hints: [
        "clean_<champ> / validators ; liste d'autorisation plutôt qu'interdiction (cours Sécurité l.11).",
        "DoesNotExist -> 404 ; StockInsuffisant -> 409 ; ValidationError -> 400. Messages génériques.",
        "Un test par branche d'erreur : la CI les verrouille."
      ],
      solution: `class JeuForm(forms.ModelForm):
    class Meta: model = Jeu; fields = [...]
    def clean_prix_location(self):
        v = self.cleaned_data["prix_location"]
        if v <= 0: raise forms.ValidationError("Le prix doit être positif")
        return v

# traduction des erreurs (vue API), sans fuite (cours Sécurité l.14)
try:
    ...
except Jeu.DoesNotExist:   return JsonResponse({"erreur": "Introuvable"}, status=404)
except StockInsuffisant as e: return JsonResponse({"erreur": str(e)}, status=409)
except ValidationError:    return JsonResponse({"erreur": "Requête invalide"}, status=400)`,
      note: "La validation n'est pas qu'une commodité : c'est la première ligne de défense (cours Sécurité). En l'écrivant maintenant, avec des messages génériques et une liste d'autorisation, on ferme d'emblée injection et fuite d'information. Chaque cas d'erreur a son test — la robustesse devient vérifiable, pas espérée."
    },
    9: {
      titre: "des comptes et une authentification durcie",
      etat: "Le catalogue est public et sûr. On introduit les utilisateurs — avec les bons réflexes de sécurité dès le premier compte.",
      objectif: "Mets en place les trois rôles (groupes), l'inscription (mot de passe haché argon2), et durcis : politique de mot de passe (longueur, refus des fuités), cookies de session HttpOnly/Secure/SameSite. Teste inscription et connexion.",
      hints: [
        "Groupes Client/Vendeur/Administrateur semés par migration de données.",
        "PASSWORD_HASHERS argon2 ; AUTH_PASSWORD_VALIDATORS (min 12, CommonPassword).",
        "SESSION_COOKIE_HTTPONLY/SECURE/SAMESITE (cours Sécurité l.6)."
      ],
      solution: `# settings.py — sécurité par conception
PASSWORD_HASHERS = ["django.contrib.auth.hashers.Argon2PasswordHasher", ...]
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "...MinimumLengthValidator", "OPTIONS": {"min_length": 12}},
    {"NAME": "...CommonPasswordValidator"},
]
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = "Lax"

def inscrire(email, mdp):
    if User.objects.filter(username=email).exists():
        raise ValueError("Compte déjà existant")
    u = User.objects.create_user(username=email, email=email, password=mdp)  # haché
    u.groups.add(Group.objects.get(name="Client"))
    return u`,
      note: "Au Niveau 6, la sécurité des sessions arrivait en fin de parcours et le hachage était par défaut. Ici, dès le premier utilisateur : argon2, politique NIST, cookies durcis. Sécuriser au moment où l'on crée la fonctionnalité coûte une ligne ; le faire après coup coûte un audit. C'est tout l'intérêt du « par conception »."
    },
    10: {
      titre: "l'autorisation, par rôle ET par ressource",
      etat: "On sait QUI est connecté. On décide QUI accède à QUOI — sans jamais laisser passer un IDOR.",
      objectif: "Applique l'autorisation : par rôle (gérer le catalogue = vendeur/admin, via décorateur/permission) ET par ressource (« mes locations » filtrées par request.user). Écris le test d'accès croisé : le client A ne voit pas les objets de B.",
      hints: [
        "est_vendeur(user) ; @user_passes_test ; DRF permission_classes.",
        "Location.objects.filter(client=request.user) — jamais un id d'URL de confiance.",
        "Test clé (cours Sécurité l.7) : A tente l'objet de B -> 404/403."
      ],
      solution: `@login_required
def mes_locations(request):
    locations = Location.objects.filter(client=request.user)   # par ressource
    return render(request, "mes_locations.html", {"locations": locations})

@user_passes_test(est_vendeur)                                 # par rôle
def creer_jeu(request): ...

# test d'accès croisé (verrouillé par la CI)
def test_client_ne_voit_pas_les_locations_dautrui(self):
    self.client.login(username="a@ludo.fr", password="Mdp8carac!")
    r = self.client.get(f"/locations/{loc_de_B.pk}/")
    self.assertEqual(r.status_code, 404)`,
      note: "Le contrôle d'accès cassé est la faille n°1 (OWASP A01). En l'écrivant AVEC son test d'accès croisé dès la création de la fonctionnalité, l'IDOR ne peut pas s'installer : la CI relance ce test à chaque commit. Rôle (peut-il agir ?) ET ressource (sur SON objet ?) — les deux, dès le départ."
    },
    11: {
      titre: "louer : transaction et test d'intégration",
      etat: "Le cœur métier arrive. On l'écrit atomique et verrouillé, et on le prouve par un test qui traverse toute la chaîne.",
      objectif: "Écris services.louer (transaction.atomic + select_for_update, contrôle de stock), la vue POST protégée (login + csrf), et le test d'intégration : POST connecté décrémente le stock ; stock nul -> refus propre, aucune location fantôme.",
      hints: [
        "with transaction.atomic(): select_for_update().get(pk) ; contrôle ; create ; save.",
        "Vue en POST + {% csrf_token %} ; Post-Redirect-Get.",
        "Test : refresh_from_db, stock -1, Location count ; cas stock 0 -> message + count 0."
      ],
      solution: `def louer(client, jeu_id, nb_jours=7):
    with transaction.atomic():
        jeu = Jeu.objects.select_for_update().get(pk=jeu_id)
        if jeu.stock_location <= 0:
            raise StockInsuffisant("Plus de stock de location")
        loc = Location.objects.create(client=client, jeu=jeu,
                                      date_debut=timezone.now(), nb_jours=nb_jours)
        jeu.stock_location -= 1
        jeu.save(update_fields=["stock_location"])
        return loc

# test d'intégration (cours CI/CD l.10)
def test_louer_decremente(self):
    self.client.login(...); self.client.post(f"/louer/{self.jeu.id}/")
    self.jeu.refresh_from_db(); self.assertEqual(self.jeu.stock_location, 2)`,
      note: "Même transaction qu'au Niveau 6 (atomic + verrou contre la course au stock), mais écrite d'emblée avec son test d'intégration qui tourne en CI sur un vrai MySQL. La règle métier la plus précieuse du projet est ainsi verrouillée dès sa naissance : impossible de la casser sans un job rouge."
    },
    12: {
      titre: "acheter : prix figé et couverture",
      etat: "La location tourne. On ajoute l'achat sur l'autre stock, et on surveille désormais la couverture de tests.",
      objectif: "Écris services.acheter (stock_vente, montant = prix_achat figé), son test (le montant ne bouge pas si le prix change ensuite), et ajoute la mesure de couverture à la CI (coverage, seuil-cliquet). Vérifie que le seuil tient.",
      hints: [
        "Achat.montant = jeu.prix_achat (copié) ; test : changer prix_achat après -> montant inchangé.",
        "CI : coverage run manage.py test && coverage report --fail-under=80.",
        "Le seuil se règle au niveau actuel puis se remonte (anti-recul, cours CI/CD l.11)."
      ],
      solution: `def acheter(client, jeu_id):
    with transaction.atomic():
        jeu = Jeu.objects.select_for_update().get(pk=jeu_id)
        if jeu.stock_vente <= 0: raise StockInsuffisant("Plus de stock de vente")
        achat = Achat.objects.create(client=client, jeu=jeu,
                    date_achat=timezone.now(), montant=jeu.prix_achat)  # FIGÉ
        jeu.stock_vente -= 1; jeu.save(update_fields=["stock_vente"])
        return achat

def test_prix_fige(self):
    achat = services.acheter(self.client_u, self.jeu.id)
    self.jeu.prix_achat = Decimal("99"); self.jeu.save()
    achat.refresh_from_db(); self.assertEqual(achat.montant, self.prix_initial)

# ci.yml : coverage report --fail-under=80`,
      note: "Le prix figé (une facture ne change pas) est verrouillé par un test, et la couverture entre dans la CI comme cliquet : elle ne peut plus reculer. On mesure ce qui a un filet, on remonte le seuil au fil des progrès — la qualité devient une propriété du pipeline, pas une bonne intention."
    },
    13: {
      titre: "le frontend, échappé et sous en-têtes",
      etat: "Le métier complet est en place. On lui donne un visage — avec l'échappement et les en-têtes de sécurité par défaut.",
      objectif: "Rends le catalogue (templates DTL, échappement automatique, {% csrf_token %} sur les POST), et pose les en-têtes de sécurité (CSP en report-only, X-Frame-Options, nosniff). Vérifie qu'aucun |safe ne traîne sur du contenu utilisateur.",
      hints: [
        "{{ }} échappe ; jamais |safe sur une saisie (cours Sécurité l.3).",
        "En-têtes : SecurityMiddleware, django-csp en report-only d'abord, X_FRAME_OPTIONS=DENY.",
        "grep |safe templates/ -> justifier ou retirer."
      ],
      solution: `{# catalogue.html #}
{% for jeu in page %}
  <tr><td>{{ jeu.titre }}</td><td>{{ jeu.prix_location }} €</td>
  <td><form method="post" action="{% url 'louer' jeu.id %}">
      {% csrf_token %}<button>Louer</button></form></td></tr>
{% endfor %}

# settings.py — en-têtes de sécurité (cours Sécurité l.15)
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
# Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self'`,
      note: "Le frontend hérite gratuitement de l'échappement DTL et des en-têtes de sécurité posés d'office : XSS et clickjacking sont fermés avant même d'exister. La CSP démarre en report-only (elle observe sans casser), exactement la méthode qui la fait adopter (cours Sécurité). Rien n'est ajouté après : tout est là dès le premier rendu."
    },
    14: {
      titre: "les secrets et la configuration",
      etat: "L'app est complète et sûre côté code. On verrouille sa configuration : rien de sensible dans le dépôt ni l'image.",
      objectif: "Range la config par environnement (SECRET_KEY, DB, DEBUG via os.environ), garde .env* hors Git et hors image, ajoute un scan de secrets (gitleaks) au pipeline, et écris la procédure de rotation d'un secret exposé.",
      hints: [
        "settings lit os.environ ; .env* dans .gitignore ET .dockerignore.",
        "ci.yml : job gitleaks detect (cours Sécurité l.8, CI/CD l.13).",
        "Rotation : révoquer -> régénérer -> reposer -> vérifier -> auditer."
      ],
      solution: `# settings.py
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]
DEBUG = os.environ.get("DJANGO_DEBUG", "0") == "1"
DATABASES["default"]["PASSWORD"] = os.environ["DB_PASSWORD"]

# .gitignore + .dockerignore : .env, .env.*

# ci.yml — détection de secrets
  securite:
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - run: gitleaks detect --source . --redact --exit-code 1`,
      note: "Fin de semaine 2 : l'application est complète, testée ET sécurisée — secrets hors du code, scan de secrets dans la CI (un mot de passe commité rend le job rouge). La rotation est écrite avant d'en avoir besoin. On n'a jamais eu à « rattraper » la sécurité : elle a poussé avec le code."
    },
    15: {
      titre: "recherche, pagination et qualité",
      etat: "Le métier et la sécurité sont solides. On soigne l'expérience et on resserre la qualité automatique.",
      objectif: "Ajoute recherche (icontains) et pagination (Paginator, état dans l'URL) sans N+1 (select_related), verrouille les performances par assertNumQueries, et durcis le lint/format (ruff + format --check) en CI.",
      hints: [
        "if q: qs = qs.filter(titre__icontains=q) ; Paginator(qs.order_by('titre'), 10).",
        "with self.assertNumQueries(2): self.client.get('/catalogue/') (anti-N+1).",
        "ci.yml : ruff check . && ruff format --check ."
      ],
      solution: `def catalogue(request):
    qs = Jeu.objects.louables().select_related("categorie")
    q = request.GET.get("q", "")
    if q: qs = qs.filter(titre__icontains=q)
    page = Paginator(qs.order_by("titre"), 10).get_page(request.GET.get("page"))
    return render(request, "catalogue.html", {"page": page, "q": q})

def test_catalogue_2_requetes(self):
    with self.assertNumQueries(2):        # count + page, pas de N+1
        self.client.get("/catalogue/")`,
      note: "La performance devient testable : assertNumQueries transforme « pas de N+1 » en garantie vérifiée par la CI. Le lint et le format tranchent le style une fois pour toutes. À ce stade, le pipeline garde le code correct, sûr, rapide ET propre — sans effort humain répété."
    },
    16: {
      titre: "les trois espaces, cloisonnés",
      etat: "Le catalogue est navigable. On ouvre les espaces des trois profils, chacun protégé.",
      objectif: "Crée /client (ses locations/achats), /vendeur (stocks, retards), /gestion (comptes, promotions) — chaque dossier protégé par le bon rôle (policies/décorateurs). Aucune logique métier nouvelle : on orchestre les services existants.",
      hints: [
        "AuthorizeFolder-like : décorateurs par vue + tests de refus croisé.",
        "Espace client filtré par request.user ; promotion réservée à l'admin.",
        "Réutilise services.louer/acheter/rendre et les QuerySets (leçons 5-12)."
      ],
      solution: `@login_required
def espace_client(request):
    return render(request, "client/espace.html", {
        "locations": Location.objects.filter(client=request.user).select_related("jeu"),
        "achats": Achat.objects.filter(client=request.user).select_related("jeu"),
    })

@user_passes_test(est_admin)
def promouvoir(request, user_id):        # POST
    u = get_object_or_404(User, pk=user_id)
    u.groups.add(Group.objects.get(name="Vendeur"))
    return redirect("espace_admin")`,
      note: "Les espaces n'ajoutent aucune règle métier : ils orchestrent les services et QuerySets déjà écrits et testés. C'est le dividende d'une architecture en couches montée proprement — la dernière ligne droite assemble, elle ne réinvente pas. Chaque espace a son test de refus croisé, verrouillé par la CI."
    },
    17: {
      titre: "l'image de production, durcie",
      etat: "L'application est finie. On fabrique l'artefact qui partira en prod : léger, non-root, scanné.",
      objectif: "Écris le Dockerfile multi-stage de production (builder + runtime slim), utilisateur non-root, et ajoute le scan d'image (trivy) au pipeline. Compare la taille et vérifie qu'aucune faille critique ne passe.",
      hints: [
        "Étage builder (pip wheel) -> étage final slim ; USER non-root ; COPY --chown.",
        "ci.yml : trivy image --exit-code 1 --severity CRITICAL (cours Sécurité l.16, Docker l.15-16).",
        "Le compose de dev garde le bind mount ; la prod utilise l'image."
      ],
      solution: `# Dockerfile (production)
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip wheel --no-cache-dir -r requirements.txt -w /wheels

FROM python:3.12-slim
RUN useradd --create-home --shell /bin/false ludo
WORKDIR /app
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels
COPY --chown=ludo:ludo . .
USER ludo
EXPOSE 8000
CMD ["gunicorn","ludotheque.wsgi:application","--bind","0.0.0.0:8000"]`,
      note: "L'image de prod applique d'un coup le cours Docker (multi-stage, non-root) et le cours Sécurité (moindre privilège, scan CVE). Elle est plus légère, plus sûre, et vérifiée par trivy à chaque build : une faille critique bloque la livraison. L'artefact qui part en prod est un objet de confiance."
    },
    18: {
      titre: "le pipeline complet",
      etat: "L'image est prête. On assemble le pipeline de bout en bout et on verrouille main.",
      objectif: "Complète la CI (tests + qualité + sécurité + build image + smoke test) et le workflow de release (tag v* -> build, scan, push au registre). Verrouille la protection de branche : rien ne merge sans tout au vert + revue.",
      hints: [
        "ci.yml : jobs tests, qualite, securite en parallèle -> image (needs).",
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
          docker push ghcr.io/toi/ludotheque:\$VERSION

# Protection de main : tests + qualite + securite + image verts, 1 revue`,
      note: "Le pipeline réunit les trois cours d'outillage : CI/CD (structure, protection), Docker (image), Sécurité (scans). Un commit tagué déclenche build + scan + push d'un artefact versionné. La barrière de branche garantit que main est toujours déployable — la promesse devient une propriété mécanique du dépôt."
    },
    19: {
      titre: "le déploiement automatisé",
      etat: "L'image est publiée. Le dernier maillon : le serveur se met à jour tout seul, et on le vérifie.",
      objectif: "Écris le job de déploiement (SSH vers le serveur, compose pull + up -d + migrate), la vue /sante/ et le healthcheck, et deux environnements (staging au merge, production sur tag avec approbation). Termine par un curl /sante/ qui valide.",
      hints: [
        "deployer needs publier ; ssh -i (clé secrète) 'cd /srv/ludo && docker compose pull && up -d && migrate'.",
        "/sante/ : SELECT 1 -> 200 ou 503 ; curl -fs avec retries.",
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
            docker compose pull && docker compose up -d &&
            docker compose exec -T app python manage.py migrate'
      - run: sleep 10 && curl -fs https://ludotheque.example.com/sante/`,
      note: "Le déploiement rejoue au robot ce qu'on ferait à la main : pull, up, migrate, puis vérifie /sante/. Staging se met à jour au merge, la production exige un tag ET une approbation. On ne se connecte plus jamais au serveur pour livrer : un git push origin v1.0.0, et l'application se déploie et se vérifie seule."
    },
    20: {
      titre: "observer, sauvegarder, protéger, revenir",
      etat: "Le projet est en ligne. On installe les filets de la vie en production.",
      objectif: "Mets en place l'observabilité (logs structurés sans secret, /sante/, stats), les sauvegardes chiffrées de la base (planifiées et testées), la conformité RGPD (export, anonymisation, durées) et la procédure de rollback (tag précédent, migrations N-1).",
      hints: [
        "Logs : événements de sécurité, jamais de mot de passe/jeton (cours Sécurité l.13).",
        "Sauvegarde : mysqldump chiffré (gpg), clé séparée, restauration testée (Docker l.8).",
        "RGPD : exporter_mes_donnees, anonymiser ; rollback = redéployer le tag précédent (N-1)."
      ],
      solution: `# Observabilité : logs structurés (après commit, sans secret)
logger.info("location jeu=%s client=%s", jeu_id, client.pk)

# Sauvegarde chiffrée, planifiée et TESTÉE
docker compose exec bdd mysqldump ... | gpg --encrypt -r sauvegarde@ludo > backup.sql.gpg

# RGPD (cours Sécurité l.18)
def supprimer_mon_compte(request):
    anonymiser_locations(request.user); request.user.delete()

# Rollback : image tag précédent + up -d (migrations compatibles N-1, CI/CD l.19)`,
      note: "La production n'est pas la fin, c'est un état à tenir : observer (logs, santé), sauvegarder (chiffré, testé), respecter les données (RGPD) et pouvoir revenir (rollback N-1). Ces filets, appris séparément aux cours Docker/CI-CD/Sécurité, sont ici tous en place sur un même projet — c'est ça, un logiciel exploité professionnellement."
    },
    21: {
      titre: "🎓 le projet professionnel de bout en bout",
      etat: "La Ludothèque pro est construite, conteneurisée, testée, sécurisée, livrée et surveillée — comme en entreprise.",
      objectif: "Exercice de synthèse : raconte le trajet complet d'une fonctionnalité, de la branche Git au /sante/ vert en production, en montrant qu'à CHAQUE étape le métier, l'industrialisation et la sécurité avancent ensemble.",
      hints: [
        "Branche -> code + test écrits ensemble -> CI (tests+qualité+sécurité+image) -> revue -> merge.",
        "Staging auto -> recette -> tag -> build+scan+push -> approbation -> prod -> /sante/.",
        "À chaque case : ce qui est construit, ce qui l'industrialise, ce qui le sécurise."
      ],
      solution: `LE TRAJET D'UNE FONCTIONNALITÉ (Ludothèque pro)

git switch -c feature/reservation
  code métier (service) + test écrits ENSEMBLE       [construire + tester]
  validation des entrées, autorisation par ressource [sécuriser]
  push -> CI : tests+MySQL, lint, gitleaks, build+scan [industrialiser+sécuriser]
  revue -> merge (protection de branche)             [industrialiser]
  -> STAGING auto -> recette
git tag v1.3.0
  -> build, scan CVE, push registre                  [industrialiser+sécuriser]
  -> approbation -> déploiement prod (pull/up/migrate)
  -> curl /sante/ 200 ; logs et sauvegardes en place  [exploiter]

À aucun moment le métier n'avance sans son test ni sa protection :
construire, industrialiser, sécuriser — les trois disciplines, en même temps.`,
      note: "🎓 C'est l'aboutissement de toute la formation : non plus « construire, puis outiller », mais construire EN outillant — le métier, les tests, la sécurité et la livraison qui avancent d'un même pas. C'est exactement le quotidien d'une équipe professionnelle. Si tu sais mener ce trajet, tu sais livrer du logiciel pour de vrai."
    }
  }
};
