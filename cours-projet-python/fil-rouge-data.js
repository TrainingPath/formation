/* ===== Fil rouge « La Ludothèque » — capstone full-stack (Python · Django · MySQL) =====
   Le grand assemblage : on construit l'application COMPLÈTE de la Ludothèque en
   réunissant le langage (Python), le framework (Django) et la base (MySQL).
   Catalogue, 3 rôles (client, vendeur, administrateur), achat ET location,
   architecture MVT + services, API REST (DRF), sécurité, tests et déploiement. */
var FIL = {
  prefix: "projpython21",
  app: "La Ludothèque",
  placeholder: "Écris ton code Python/Django ici…",
  etapes: {
    1: {
      titre: "l'architecture du projet",
      etat: "On part d'une feuille blanche, mais on connaît déjà le domaine (la Ludothèque). Avant de coder, on pose l'organisation MVT + services.",
      objectif: "Décris l'organisation d'un projet Django de la Ludothèque : urls.py → vues → services (métier) → modèles (ORM) → MySQL, plus les templates et les formulaires. Explique le rôle de chaque brique en une ligne.",
      hints: [
        "Django est MVT : urls.py aiguille vers des vues, qui rendent des templates.",
        "On ajoute un module services.py pour la logique métier (louer, acheter, stocks).",
        "models.py (ORM), views.py, services.py, forms.py, templates/ (DTL)."
      ],
      solution: `ludotheque/urls.py     aiguille les URLs vers les vues
catalogue/views.py     reçoivent la requête, renvoient une réponse/template
catalogue/services.py  logique métier (louer, acheter, stocks)
catalogue/models.py    modèles ORM (Jeu, Categorie, Utilisateur...)
catalogue/forms.py     formulaires et validation
templates/             les vues HTML (DTL)
catalogue/migrations/  le schéma versionné

# Flux : URL -> Vue -> Service -> Modèle (ORM) -> MySQL`,
      note: "Django fournit le MVT ; on y ajoute un module services.py pour ne pas surcharger les vues. Cette séparation, comme en Spring ou ASP.NET, garde chaque brique responsable d'une seule chose et rend le métier testable indépendamment du web."
    },
    2: {
      titre: "le projet connecté à MySQL",
      etat: "L'architecture est posée. On crée le projet réel et on le branche sur la base de la Ludothèque.",
      objectif: "Crée le projet et l'app catalogue, puis configure DATABASES dans settings.py pour MySQL (base ludotheque), le mot de passe venant de l'environnement. Vérifie avec python manage.py check.",
      hints: [
        "django-admin startproject ludotheque && python manage.py startapp catalogue",
        "ENGINE : django.db.backends.mysql, NAME : ludotheque.",
        "PASSWORD : os.environ['DB_PASSWORD'] — jamais en clair dans le code."
      ],
      solution: `# settings.py
import os

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "ludotheque",
        "USER": "ludo_app",
        "PASSWORD": os.environ["DB_PASSWORD"],
        "HOST": os.environ.get("DB_HOST", "localhost"),
        "PORT": "3306",
    }
}

INSTALLED_APPS = [..., "catalogue"]

# $ python manage.py check   -> System check identified no issues`,
      note: "Le connecteur mysqlclient relie l'ORM à MySQL. Le mot de passe vient de l'environnement dès le premier jour : un secret n'entre jamais dans Git. L'app catalogue enregistrée dans INSTALLED_APPS sera vue par les migrations."
    },
    3: {
      titre: "du MCD Merise aux migrations Django",
      etat: "Le projet parle à MySQL. On traduit le modèle conçu en Merise en schéma réel, versionné.",
      objectif: "Écris les modèles Categorie et Jeu (titre, prix_achat, prix_location, stock_vente, stock_location, FK vers Categorie) puis génère et applique la migration. Chaque entité Merise devient un modèle, chaque CIF une ForeignKey.",
      hints: [
        "class Jeu(models.Model): titre = models.CharField(max_length=200)…",
        "categorie = models.ForeignKey(Categorie, on_delete=models.PROTECT)",
        "python manage.py makemigrations && python manage.py migrate"
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

# $ python manage.py makemigrations catalogue
# $ python manage.py migrate    -> CREATE TABLE dans MySQL`,
      note: "Le MCD conçu en Merise se lit directement : l'entité JEU devient le modèle Jeu, la CIF « appartient à » devient une ForeignKey. on_delete=PROTECT refuse de supprimer une catégorie encore utilisée — l'intégrité référentielle du cours MySQL, déclarée côté Python. La migration est versionnée dans Git."
    },
    4: {
      titre: "les entités du catalogue",
      etat: "Jeu et Categorie existent. On complète le catalogue : fournisseurs et propriétés calculées.",
      objectif: "Ajoute le modèle Fournisseur (nom, email unique) relié à Jeu (ForeignKey nullable), une propriété est_louable sur Jeu (stock_location > 0), et un __str__ lisible pour chaque modèle.",
      hints: [
        "fournisseur = models.ForeignKey(Fournisseur, null=True, blank=True, on_delete=models.SET_NULL)",
        "@property def est_louable(self): return self.stock_location > 0",
        "def __str__(self): return self.titre"
      ],
      solution: `class Fournisseur(models.Model):
    nom = models.CharField(max_length=150)
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.nom

class Jeu(models.Model):
    ...
    fournisseur = models.ForeignKey(
        Fournisseur, null=True, blank=True, on_delete=models.SET_NULL)

    @property
    def est_louable(self):
        return self.stock_location > 0

    def __str__(self):
        return self.titre`,
      note: "SET_NULL : si un fournisseur disparaît, ses jeux restent (la FK devient NULL) — un choix de conception hérité du MCD. La propriété est_louable exprime une règle en un seul endroit : templates, services et tests diront tous jeu.est_louable."
    },
    5: {
      titre: "interroger avec l'ORM",
      etat: "Le schéma est complet. On apprend au projet à interroger son propre catalogue.",
      objectif: "Écris les requêtes du quotidien : jeux louables triés par titre, jeux d'une catégorie, recherche par titre (icontains), et un manager JeuQuerySet.louables() réutilisable.",
      hints: [
        "Jeu.objects.filter(stock_location__gt=0).order_by('titre')",
        "Jeu.objects.filter(titre__icontains='catan')",
        "class JeuQuerySet(models.QuerySet): def louables(self): return self.filter(stock_location__gt=0)"
      ],
      solution: `class JeuQuerySet(models.QuerySet):
    def louables(self):
        return self.filter(stock_location__gt=0)

    def de_categorie(self, cat_id):
        return self.filter(categorie_id=cat_id)

class Jeu(models.Model):
    ...
    objects = JeuQuerySet.as_manager()

# Usage :
Jeu.objects.louables().order_by("titre")
Jeu.objects.filter(titre__icontains="catan")
Jeu.objects.de_categorie(2).louables()      # chaînables`,
      note: "Le QuerySet personnalisé joue le rôle des scopes Eloquent ou des repositories Spring : le vocabulaire métier (louables) remplace les filtres répétés. L'ORM traduit tout en SELECT MySQL — icontains devient LIKE '%…%'."
    },
    6: {
      titre: "la couche service et les règles métier",
      etat: "On sait lire et écrire. Reste à décider : où vivent les règles (stocks, refus, tarifs) ?",
      objectif: "Crée services.py avec la règle des deux stocks : jeux_louables(), verifier_stock_location(jeu) qui lève StockInsuffisant si stock nul, et le tarif de location (7 jours, 0,50 €/jour au-delà). Les vues ne décideront jamais.",
      hints: [
        "class StockInsuffisant(Exception): pass",
        "def verifier_stock_location(jeu): if jeu.stock_location <= 0: raise StockInsuffisant(...)",
        "def prix_location(nb_jours): return base si <= 7 sinon base + (nb_jours - 7) * Decimal('0.50')"
      ],
      solution: `# catalogue/services.py
from decimal import Decimal

class StockInsuffisant(Exception):
    pass

def jeux_louables():
    return Jeu.objects.louables().order_by("titre")

def verifier_stock_location(jeu):
    if jeu.stock_location <= 0:
        raise StockInsuffisant(f"Plus de stock de location pour {jeu.titre}")

def prix_location(jeu, nb_jours=7):
    base = jeu.prix_location
    if nb_jours <= 7:
        return base
    return base + (nb_jours - 7) * Decimal("0.50")`,
      note: "Le service est du Python pur : ni requête HTTP, ni template. C'est ce qui le rend testable en millisecondes et réutilisable par l'API, les pages web et les commandes manage.py. L'exception métier nommée (StockInsuffisant) sera traduite en HTTP par la couche au-dessus."
    },
    7: {
      titre: "l'API REST du catalogue",
      etat: "Le métier existe. On ouvre le catalogue au monde : une API JSON propre, sans exposer les modèles bruts.",
      objectif: "Avec Django REST Framework : un JeuSerializer (id, titre, prix_location, est_louable, nom de la catégorie) et les routes GET /api/jeux/ et GET /api/jeux/<id>/ en lecture seule.",
      hints: [
        "class JeuSerializer(serializers.ModelSerializer): categorie = serializers.CharField(source='categorie.nom')",
        "class JeuViewSet(ReadOnlyModelViewSet): queryset = Jeu.objects.select_related('categorie')",
        "router.register('jeux', JeuViewSet)"
      ],
      solution: `# serializers.py
class JeuSerializer(serializers.ModelSerializer):
    categorie = serializers.CharField(source="categorie.nom")
    est_louable = serializers.BooleanField(read_only=True)

    class Meta:
        model = Jeu
        fields = ["id", "titre", "prix_location", "est_louable", "categorie"]

# views.py
class JeuViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Jeu.objects.select_related("categorie").order_by("titre")
    serializer_class = JeuSerializer

# urls.py
router = DefaultRouter()
router.register("jeux", JeuViewSet)
urlpatterns = [path("api/", include(router.urls))]`,
      note: "Le serializer joue le rôle du DTO : il choisit ce qui sort (pas le fournisseur, pas les stocks internes). ReadOnlyModelViewSet donne liste + détail en lecture seule. select_related prépare déjà la parade au N+1 : la catégorie arrive par JOIN."
    },
    8: {
      titre: "validation et gestion des erreurs",
      etat: "L'API répond. On la rend robuste : données refusées poliment, erreurs traduites en bons codes HTTP.",
      objectif: "Écris JeuForm (ou le serializer en écriture) avec ses règles : titre requis, prix strictement positifs, stocks >= 0. Puis un handler qui traduit StockInsuffisant en 409 et Jeu.DoesNotExist en 404, sans fuite technique.",
      hints: [
        "def clean_prix_location(self): if v <= 0: raise ValidationError('Le prix doit être positif')",
        "try: ... except Jeu.DoesNotExist: return JsonResponse({'erreur': ...}, status=404)",
        "except StockInsuffisant as e: return JsonResponse({'erreur': str(e)}, status=409)"
      ],
      solution: `class JeuForm(forms.ModelForm):
    class Meta:
        model = Jeu
        fields = ["titre", "prix_achat", "prix_location",
                  "stock_vente", "stock_location", "categorie"]

    def clean_prix_location(self):
        v = self.cleaned_data["prix_location"]
        if v <= 0:
            raise forms.ValidationError("Le prix doit être positif")
        return v

# traduction des erreurs (vue API)
try:
    jeu = Jeu.objects.get(pk=pk)
    services.verifier_stock_location(jeu)
except Jeu.DoesNotExist:
    return JsonResponse({"erreur": "Jeu introuvable"}, status=404)
except StockInsuffisant as e:
    return JsonResponse({"erreur": str(e)}, status=409)`,
      note: "Deux familles d'erreurs, deux traitements : les données invalides (ValidationError → 400 avec le détail par champ) et les refus métier (StockInsuffisant → 409 Conflict). L'utilisateur reçoit un message clair, jamais une stack trace — la traduction vit à un seul endroit."
    },
    9: {
      titre: "les utilisateurs et les trois rôles (groupes)",
      etat: "Le catalogue tourne. On introduit les utilisateurs et leurs trois profils avec les groupes Django.",
      objectif: "Utilise le User de django.contrib.auth et crée les trois groupes Client, Vendeur, Administrateur (constantes + migration de données ou commande). L'inscription place le nouveau venu dans Client, mot de passe haché par Django.",
      hints: [
        "ROLE_CLIENT, ROLE_VENDEUR, ROLE_ADMIN = 'Client', 'Vendeur', 'Administrateur'",
        "Group.objects.get_or_create(name=...) pour chaque rôle (idempotent).",
        "user = User.objects.create_user(email, email, mot_de_passe) puis user.groups.add(groupe_client)."
      ],
      solution: `# catalogue/roles.py
ROLE_CLIENT = "Client"
ROLE_VENDEUR = "Vendeur"
ROLE_ADMIN = "Administrateur"

def creer_roles():
    for nom in (ROLE_CLIENT, ROLE_VENDEUR, ROLE_ADMIN):
        Group.objects.get_or_create(name=nom)   # idempotent

# inscription
def inscrire(email, mot_de_passe):
    user = User.objects.create_user(
        username=email, email=email, password=mot_de_passe)  # haché
    user.groups.add(Group.objects.get(name=ROLE_CLIENT))
    return user`,
      note: "django.contrib.auth fournit la table des utilisateurs et le hachage des mots de passe (jamais en clair). Les groupes portent les trois rôles de la Ludothèque ; get_or_create rend le seed rejouable. Le nouvel inscrit reçoit le rôle le moins privilégié."
    },
    10: {
      titre: "l'authentification (connexion, session)",
      etat: "Les utilisateurs existent. On les laisse entrer — et on protège ce qui doit l'être.",
      objectif: "Écris la vue de connexion : authenticate() puis login() (session), échec vague si identifiants invalides. Le catalogue reste public, louer exige d'être connecté (@login_required).",
      hints: [
        "user = authenticate(request, username=email, password=mdp)",
        "if user is None: message vague « identifiants invalides » (pas de détail).",
        "login(request, user) crée la session ; @login_required protège les vues."
      ],
      solution: `def connexion(request):
    if request.method == "POST":
        user = authenticate(request,
                            username=request.POST["email"],
                            password=request.POST["mot_de_passe"])
        if user is None:
            messages.error(request, "Identifiants invalides")  # volontairement vague
            return redirect("connexion")
        login(request, user)          # session ouverte
        return redirect("catalogue")
    return render(request, "connexion.html")

@login_required
def louer(request, jeu_id):
    ...   # seul un connecté arrive ici`,
      note: "authenticate vérifie le mot de passe contre le hachage ; login pose l'identité en session (cookie signé). Le message d'échec ne précise jamais si c'est l'email ou le mot de passe : on n'aide pas un attaquant à énumérer les comptes. Le catalogue reste public en lecture."
    },
    11: {
      titre: "l'autorisation par rôle",
      etat: "On sait QUI est connecté. On décide QUI a le droit de faire QUOI.",
      objectif: "Restreins les actions : gérer le catalogue réservé à Vendeur/Administrateur, gérer les comptes à l'Administrateur. Écris le test est_vendeur(user) et applique @user_passes_test (ou un mixin) — et « mes locations » filtre par request.user.",
      hints: [
        "def est_vendeur(u): return u.groups.filter(name__in=[ROLE_VENDEUR, ROLE_ADMIN]).exists()",
        "@user_passes_test(est_vendeur) sur la création de jeu.",
        "Location.objects.filter(client=request.user) — jamais un id venu de l'URL."
      ],
      solution: `def est_vendeur(user):
    return user.groups.filter(
        name__in=[ROLE_VENDEUR, ROLE_ADMIN]).exists()

def est_admin(user):
    return user.groups.filter(name=ROLE_ADMIN).exists()

@user_passes_test(est_vendeur)
def creer_jeu(request):
    ...

@user_passes_test(est_admin)
def gerer_comptes(request):
    ...

@login_required
def mes_locations(request):
    locations = Location.objects.filter(client=request.user)
    return render(request, "mes_locations.html", {"locations": locations})`,
      note: "Deux niveaux : par rôle (le groupe décide) et par ressource (mes locations = celles de request.user, identité posée par la session — jamais un paramètre d'URL). Un client qui force /vendeur/creer reçoit un refus : la barrière est côté serveur, pas dans le menu."
    },
    12: {
      titre: "louer un jeu (transaction)",
      etat: "Le cœur métier arrive : un client loue un jeu. Deux écritures indissociables.",
      objectif: "Écris services.louer(client, jeu_id) : dans transaction.atomic(), verrouiller le jeu (select_for_update), vérifier le stock, créer la Location et décrémenter le stock. Lève StockInsuffisant si le stock est nul.",
      hints: [
        "with transaction.atomic():",
        "jeu = Jeu.objects.select_for_update().get(pk=jeu_id)",
        "Location.objects.create(...) puis jeu.stock_location -= 1 ; jeu.save()"
      ],
      solution: `from django.db import transaction

def louer(client, jeu_id, nb_jours=7):
    with transaction.atomic():
        jeu = Jeu.objects.select_for_update().get(pk=jeu_id)
        if jeu.stock_location <= 0:
            raise StockInsuffisant(f"Plus de stock de location pour {jeu.titre}")
        location = Location.objects.create(
            client=client, jeu=jeu,
            date_debut=timezone.now(), nb_jours=nb_jours)
        jeu.stock_location -= 1
        jeu.save(update_fields=["stock_location"])
        return location`,
      note: "transaction.atomic rend les deux écritures indivisibles : toute exception annule tout (rollback). select_for_update verrouille la ligne le temps de la transaction : deux clients qui visent le dernier exemplaire ne peuvent pas réussir tous les deux. C'est la transaction MySQL du cours SQL, pilotée par Django."
    },
    13: {
      titre: "acheter un jeu",
      etat: "La location fonctionne. On ajoute l'achat, sur l'autre stock.",
      objectif: "Écris services.acheter(client, jeu_id) sur le même modèle, mais sur stock_vente. Enregistre le montant (prix_achat figé dans l'Achat) et lève StockInsuffisant si le stock de vente est nul.",
      hints: [
        "Même structure : transaction.atomic + select_for_update.",
        "Le montant = jeu.prix_achat, copié dans Achat.montant (paiement simulé).",
        "Achat.objects.create(...) puis jeu.stock_vente -= 1 ; jeu.save()"
      ],
      solution: `def acheter(client, jeu_id):
    with transaction.atomic():
        jeu = Jeu.objects.select_for_update().get(pk=jeu_id)
        if jeu.stock_vente <= 0:
            raise StockInsuffisant(f"Plus de stock de vente pour {jeu.titre}")
        achat = Achat.objects.create(
            client=client, jeu=jeu,
            date_achat=timezone.now(),
            montant=jeu.prix_achat)      # prix FIGÉ au moment de l'achat
        jeu.stock_vente -= 1
        jeu.save(update_fields=["stock_vente"])
        return achat`,
      note: "Acheter reprend la structure de louer sur le stock de vente : les deux stocks distincts du modèle Merise prennent tout leur sens. Le montant est copié — si le vendeur change le prix demain, les achats d'hier gardent leur montant historique. Un vrai paiement se brancherait ici, avant la fin du bloc atomic."
    },
    14: {
      titre: "le frontend : le catalogue (templates)",
      etat: "L'API métier est complète. On donne un visage à l'application avec les templates Django.",
      objectif: "Crée la vue catalogue (jeux louables via le service) et le template DTL qui liste chaque jeu avec un bouton « Louer » (formulaire POST + csrf_token).",
      hints: [
        "return render(request, 'catalogue.html', {'jeux': services.jeux_louables()})",
        "{% for jeu in jeux %} … {{ jeu.titre }} … {% endfor %}",
        "<form method=\"post\" action=\"{% url 'louer' jeu.id %}\">{% csrf_token %}"
      ],
      solution: `def catalogue(request):
    return render(request, "catalogue.html",
                  {"jeux": services.jeux_louables()})

{# templates/catalogue.html #}
{% extends "base.html" %}
{% block contenu %}
{% for jeu in jeux %}
  <tr>
    <td>{{ jeu.titre }}</td>
    <td>{{ jeu.prix_location }} €</td>
    <td>
      <form method="post" action="{% url 'louer' jeu.id %}">
        {% csrf_token %}
        <button>Louer</button>
      </form>
    </td>
  </tr>
{% endfor %}
{% endblock %}`,
      note: "{{ }} échappe automatiquement le HTML (protection XSS) et {% csrf_token %} est obligatoire sur les POST. {% url %} génère les adresses depuis les noms de routes : on peut changer les URLs sans toucher aux templates. Le même service alimente l'API et les pages."
    },
    15: {
      titre: "recherche, filtres et pagination",
      etat: "Le catalogue s'affiche. On le rend navigable : recherche, filtre par catégorie, pages.",
      objectif: "Ajoute à la vue catalogue la recherche par titre (?q=), le filtre par catégorie (?cat=) et la pagination Django (Paginator, 10 par page), en composant le QuerySet conditionnellement.",
      hints: [
        "if q: jeux = jeux.filter(titre__icontains=q)",
        "paginator = Paginator(jeux.order_by('titre'), 10)",
        "page = paginator.get_page(request.GET.get('page'))"
      ],
      solution: `def catalogue(request):
    jeux = Jeu.objects.louables().select_related("categorie")
    q = request.GET.get("q", "")
    cat = request.GET.get("cat")
    if q:
        jeux = jeux.filter(titre__icontains=q)
    if cat:
        jeux = jeux.filter(categorie_id=cat)

    paginator = Paginator(jeux.order_by("titre"), 10)
    page = paginator.get_page(request.GET.get("page"))
    return render(request, "catalogue.html",
                  {"page": page, "q": q})

{# navigation #}
{% if page.has_next %}
  <a href="?q={{ q }}&page={{ page.next_page_number }}">Suivant</a>
{% endif %}`,
      note: "Le QuerySet se compose morceau par morceau et ne part vers MySQL qu'à l'itération : un seul SQL final avec LIMIT/OFFSET. Le tri avant pagination est obligatoire (pages stables). Tout l'état vit dans l'URL : la recherche se partage d'un lien."
    },
    16: {
      titre: "les espaces client, vendeur et administrateur",
      etat: "Trois profils, trois usages : chacun reçoit son espace, cloisonné par rôle.",
      objectif: "Crée les trois espaces : /client/ (mes locations et achats), /vendeur/ (stocks), /admin-ludo/ (comptes, promotion en vendeur). Protège chaque groupe d'URLs par le bon test de rôle.",
      hints: [
        "Espace client : filtres sur request.user (leçon 11).",
        "Espace vendeur : @user_passes_test(est_vendeur), formulaire d'ajustement des stocks.",
        "Promotion : user.groups.add(Group.objects.get(name=ROLE_VENDEUR)) — admin seulement."
      ],
      solution: `@login_required
def espace_client(request):
    return render(request, "client/espace.html", {
        "locations": Location.objects.filter(client=request.user)
                                     .select_related("jeu"),
        "achats": Achat.objects.filter(client=request.user)
                               .select_related("jeu"),
    })

@user_passes_test(est_vendeur)
def espace_vendeur(request):
    if request.method == "POST":
        services.modifier_stock(request.POST["jeu_id"],
                                request.POST["stock_location"],
                                request.POST["stock_vente"])
        return redirect("espace_vendeur")
    return render(request, "vendeur/stocks.html",
                  {"jeux": Jeu.objects.order_by("titre")})

@user_passes_test(est_admin)
def promouvoir(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    user.groups.add(Group.objects.get(name=ROLE_VENDEUR))
    return redirect("espace_admin")`,
      note: "Aucune logique métier nouvelle : les espaces orchestrent les services des leçons 6, 12 et 13. Le menu s'adapte au rôle dans le template, mais la vraie barrière est le décorateur côté serveur — masquer un lien n'a jamais protégé personne."
    },
    17: {
      titre: "tests unitaires du métier",
      etat: "L'application est complète. On verrouille les règles : les tests empêchent les régressions.",
      objectif: "Écris les tests des règles métier : le tarif de prolongation, le refus de location à stock nul (assertRaises), et le prix figé à l'achat. Base de test créée/détruite par Django.",
      hints: [
        "class ServicesTests(TestCase): — chaque test est isolé dans une transaction.",
        "with self.assertRaises(StockInsuffisant): services.louer(client, jeu.id)",
        "jeu.prix_achat = 40 après l'achat : achat.montant ne doit pas bouger."
      ],
      solution: `class ServicesTests(TestCase):
    def setUp(self):
        self.cat = Categorie.objects.create(nom="Stratégie")
        self.client_u = User.objects.create_user("c@ludo.fr", "c@ludo.fr", "Mdp8carac!")

    def test_location_stock_nul_refusee(self):
        jeu = Jeu.objects.create(titre="Catan", prix_achat=30, prix_location=5,
                                 stock_location=0, categorie=self.cat)
        with self.assertRaises(StockInsuffisant):
            services.louer(self.client_u, jeu.id)

    def test_achat_fige_le_prix(self):
        jeu = Jeu.objects.create(titre="Dixit", prix_achat=Decimal("29.99"),
                                 prix_location=4, stock_vente=3, categorie=self.cat)
        achat = services.acheter(self.client_u, jeu.id)
        jeu.prix_achat = Decimal("39.99")   # le vendeur change le prix
        jeu.save()
        self.assertEqual(achat.montant, Decimal("29.99"))  # figé`,
      note: "TestCase enveloppe chaque test dans une transaction annulée à la fin : la base de test (créée automatiquement, jamais la vraie) reste propre. Le test du prix figé documente ET protège la décision de la leçon 13 — s'il devient rouge, quelqu'un a cassé la règle."
    },
    18: {
      titre: "tests d'intégration de l'API",
      etat: "Le métier est verrouillé. On teste l'assemblage réel : HTTP → vue → service → base.",
      objectif: "Avec self.client (le client de test Django) : GET /api/jeux/ renvoie 200 et du JSON ; louer sans connexion redirige (302) ; louer connecté décrémente le stock en base.",
      hints: [
        "reponse = self.client.get('/api/jeux/') ; self.assertEqual(reponse.status_code, 200)",
        "self.client.login(username='c@ludo.fr', password='Mdp8carac!')",
        "jeu.refresh_from_db() ; self.assertEqual(jeu.stock_location, 2)"
      ],
      solution: `class ApiTests(TestCase):
    def test_catalogue_public(self):
        reponse = self.client.get("/api/jeux/")
        self.assertEqual(reponse.status_code, 200)
        self.assertEqual(reponse["Content-Type"], "application/json")

    def test_louer_exige_connexion(self):
        reponse = self.client.post(f"/louer/{self.jeu.id}/")
        self.assertEqual(reponse.status_code, 302)   # redirigé vers la connexion

    def test_louer_decremente_le_stock(self):
        self.client.login(username="c@ludo.fr", password="Mdp8carac!")
        self.client.post(f"/louer/{self.jeu.id}/")
        self.jeu.refresh_from_db()
        self.assertEqual(self.jeu.stock_location, 2)  # 3 - 1`,
      note: "self.client simule de vraies requêtes HTTP sans serveur : routage, décorateurs, CSRF (désactivé par le client de test), vue, service et base traversés pour de vrai. refresh_from_db relit la ligne : on vérifie l'effet réel, pas une variable en mémoire. Pyramide : beaucoup d'unitaires, moins d'intégration."
    },
    19: {
      titre: "qualité : logs, performance, secrets",
      etat: "Tout fonctionne et tout est testé. Dernier passage avant la production : observer, accélérer, protéger.",
      objectif: "Ajoute les logs structurés du métier (location réussie, stock épuisé), règle le N+1 du catalogue (select_related), déclare les index utiles (Meta.indexes) et sors tous les secrets vers l'environnement.",
      hints: [
        "logger = logging.getLogger(__name__) ; logger.info('Location jeu=%s client=%s', ...)",
        "Jeu.objects.select_related('categorie') — la catégorie arrive par JOIN.",
        "class Meta: indexes = [models.Index(fields=['titre'])] ; SECRET_KEY = os.environ[...]"
      ],
      solution: `import logging
logger = logging.getLogger(__name__)

def louer(client, jeu_id, nb_jours=7):
    with transaction.atomic():
        ...
        if jeu.stock_location <= 0:
            logger.warning("Stock épuisé jeu=%s", jeu_id)
            raise StockInsuffisant(...)
        ...
    logger.info("Location jeu=%s client=%s", jeu_id, client.pk)
    return location

# N+1 réglé : 1 requête au lieu de 1 + N
jeux = Jeu.objects.select_related("categorie")

class Jeu(models.Model):
    ...
    class Meta:
        indexes = [models.Index(fields=["titre"])]

# settings.py — secrets hors du code
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]
DEBUG = os.environ.get("DJANGO_DEBUG", "0") == "1"`,
      note: "Trois réflexes de production : les logs racontent le métier (après commit pour le succès), select_related supprime le N+1 (invisible sur 10 jeux, mortel sur 1 000), les index arrivent par migration. SECRET_KEY et mot de passe MySQL ne vivent que dans l'environnement — l'historique Git n'oublie jamais rien."
    },
    20: {
      titre: "le déploiement",
      etat: "L'application est prête. On la met en ligne, proprement et de façon rejouable.",
      objectif: "Déroule la mise en production : tests verts, DEBUG=0 + ALLOWED_HOSTS, migrate sur la base de prod, collectstatic, gunicorn derrière un proxy, et le tag Git de la version.",
      hints: [
        "python manage.py test — on ne déploie pas du rouge.",
        "python manage.py migrate && python manage.py collectstatic --noinput",
        "gunicorn ludotheque.wsgi ; git tag v1.0.0 && git push --tags"
      ],
      solution: `# 1. Vérifier
python manage.py test                    # tout vert, sinon stop

# 2. Configuration de production (environnement, jamais Git)
export DJANGO_SECRET_KEY="cle-longue-aleatoire"
export DJANGO_DEBUG=0
export DB_PASSWORD="..."
# settings : ALLOWED_HOSTS = ["ludotheque.example.com"]

# 3. Base et statiques
python manage.py migrate                 # le schéma versionné rejoué en prod
python manage.py collectstatic --noinput

# 4. Servir (derrière nginx / le proxy de l'hébergeur)
gunicorn ludotheque.wsgi:application --bind 0.0.0.0:$PORT

# 5. Tracer
git tag v1.0.0 && git push --tags`,
      note: "DEBUG=0 en production : les pages d'erreur détaillées divulgueraient le code et la config. Les migrations écrites depuis la leçon 3 rejouent exactement le même schéma sur MySQL de prod. Le tag Git dit quel code tourne — et permet de revenir en arrière si la v1.0.1 se passe mal."
    },
    21: {
      titre: "🎓 l'application assemblée",
      etat: "La Ludothèque est en ligne : conçue en Merise, stockée dans MySQL, écrite en Python, servie par Django, testée et déployée.",
      objectif: "Exercice de synthèse : raconte le trajet complet d'une location, du clic au COMMIT MySQL, en nommant chaque brique traversée et la leçon qui l'a construite.",
      hints: [
        "POST /louer/12/ + session (leçon 10) → décorateurs (leçon 11).",
        "La vue appelle services.louer : atomic + select_for_update (leçon 12).",
        "COMMIT MySQL, log structuré (leçon 19), redirection Post-Redirect-Get (leçon 14)."
      ],
      solution: `POST /louer/12/  (session connectée, {% csrf_token %})
  → middleware session : request.user identifié   (leçon 10)
  → @login_required : accès autorisé              (leçon 11)
  → vue louer : aucune décision, elle délègue     (leçon 1)
  → services.louer :                              (leçon 12)
        transaction.atomic()
        select_for_update -> ligne verrouillée
        stock 1 -> Location créée, stock_location = 0
        COMMIT MySQL                              (cours SQL/Merise)
  → logger.info("Location jeu=12 client=7")       (leçon 19)
  → redirect("mes_locations")  Post-Redirect-Get  (leçon 14)

Vérifié par : test unitaire du refus (leçon 17)
            + test d'intégration du décrément (leçon 18)
Déployé par : migrate + gunicorn + tag v1.0.0     (leçon 20)`,
      note: "Un seul clic traverse toute la formation : HTTP, Python, l'architecture en couches, l'ORM, la transaction MySQL née du modèle Merise, les logs, les tests et le déploiement. Si tu sais raconter ce trajet sans aide, le capstone est acquis — c'est exactement la question qu'on pose en entretien technique."
    }
  }
};
