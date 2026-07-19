/* ===== Fil rouge « La Ludothèque » — cours Django (21 étapes) =====
   Même application que dans tous les cours, en version WEB.
   Ludothèque de jeux de société : catalogue, 3 rôles (client, vendeur,
   administrateur), achat ET location. On construit une vraie app web, de la
   page d'accueil à l'API, en appliquant chaque leçon au projet. */
var FIL = {
  prefix: "django21",
  app: "La Ludothèque",
  placeholder: "Écris ton code Django ici…",
  etapes: {
    1: {
      titre: "le projet et la page d'accueil",
      etat: "Rien n'existe. On crée le projet Django et une première page qui présente la ludothèque.",
      objectif: "Crée le projet et une app « ludo », branche une URL d'accueil et une vue qui renvoie « Bienvenue à la Ludothèque ».",
      hints: [
        "django-admin startproject config . ; python manage.py startapp ludo",
        "Ajoute « ludo » dans INSTALLED_APPS.",
        "Vue : def accueil(request): return HttpResponse('Bienvenue à la Ludothèque')"
      ],
      solution: `# ludo/views.py
from django.http import HttpResponse

def accueil(request):
    return HttpResponse("Bienvenue à la Ludothèque — achat & location de jeux")

# config/urls.py
from django.urls import path
from ludo import views

urlpatterns = [
    path("", views.accueil, name="accueil"),
]`,
      note: "Même point de départ que la version console, mais servi par le web : une requête HTTP entre, une réponse sort. Compare avec Laravel (route + closure) et Spring (@GetMapping)."
    },
    2: {
      titre: "les URLs du catalogue",
      etat: "L'accueil répond. Définissons les adresses du catalogue.",
      objectif: "Ajoute deux routes : /jeux/ (la liste) et /jeux/<int:id>/ (le détail d'un jeu). Crée les vues correspondantes (réponses en dur pour l'instant).",
      hints: [
        "path(\"jeux/\", views.liste, name=\"liste\")",
        "path(\"jeux/<int:id>/\", views.detail, name=\"detail\")"
      ],
      solution: `# ludo/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("jeux/", views.liste, name="liste"),
    path("jeux/<int:id>/", views.detail, name="detail"),
]
# config/urls.py : path("", include("ludo.urls"))

# ludo/views.py
def liste(request):
    return HttpResponse("Catalogue des jeux")
def detail(request, id):
    return HttpResponse(f"Détail du jeu {id}")`,
      note: "Le routage relie une URL à une vue. <int:id> capture un identifiant. C'est l'équivalent des routes Laravel (Route::get) et des @GetMapping de Spring."
    },
    3: {
      titre: "la vue du catalogue",
      etat: "Les routes existent. Faisons renvoyer à la vue une vraie liste de jeux (encore en dur).",
      objectif: "Dans la vue liste, prépare une liste de jeux (dictionnaires nom/prix/stock) et renvoie-la, pour l'instant en texte. La logique vit dans la vue.",
      hints: [
        "catalogue = [{'nom': 'Catan', 'prix': 44.9, 'stock': 3}, ...]",
        "Construis la réponse en bouclant sur le catalogue."
      ],
      solution: `# ludo/views.py
def liste(request):
    catalogue = [
        {"nom": "Catan", "prix": 44.9, "stock": 3},
        {"nom": "Azul", "prix": 39.9, "stock": 5},
    ]
    lignes = [f"{j['nom']} — {j['prix']} € (stock {j['stock']})" for j in catalogue]
    return HttpResponse("<br>".join(lignes))`,
      note: "La vue est le « contrôleur » de Django : elle reçoit la requête et prépare les données. Bientôt, ces données viendront de la base ; ici, elles sont encore en dur."
    },
    4: {
      titre: "le template du catalogue",
      etat: "Le HTML n'a pas sa place dans la vue. Déplaçons l'affichage dans un template.",
      objectif: "Crée un template liste.html qui affiche le catalogue avec {% for %}, et fais-le rendre par la vue avec render().",
      hints: [
        "return render(request, 'ludo/liste.html', {'catalogue': catalogue})",
        "Dans le template : {% for jeu in catalogue %} ... {% endfor %}"
      ],
      solution: `# ludo/views.py
from django.shortcuts import render

def liste(request):
    catalogue = [
        {"nom": "Catan", "prix": 44.9, "stock": 3},
        {"nom": "Azul", "prix": 39.9, "stock": 5},
    ]
    return render(request, "ludo/liste.html", {"catalogue": catalogue})

# ludo/templates/ludo/liste.html
# <h1>Catalogue</h1>
# <ul>
# {% for jeu in catalogue %}
#   <li>{{ jeu.nom }} — {{ jeu.prix }} € (stock {{ jeu.stock }})</li>
# {% endfor %}
# </ul>`,
      note: "Le template (DTL) sépare la présentation de la logique — c'est le T de MVT. Blade (Laravel) et Thymeleaf (Spring) jouent le même rôle."
    },
    5: {
      titre: "le détail d'un jeu",
      etat: "La liste s'affiche. Relions chaque jeu à sa page de détail.",
      objectif: "Fais afficher, dans la liste, un lien vers le détail de chaque jeu ({% url %}), et rends un template detail.html avec les infos du jeu choisi.",
      hints: [
        "Dans le template : <a href=\"{% url 'detail' jeu.id %}\">{{ jeu.nom }}</a>",
        "La vue detail(request, id) récupère le bon jeu et le passe au template."
      ],
      solution: `# ludo/views.py
def detail(request, id):
    catalogue = {
        1: {"nom": "Catan", "prix": 44.9, "stock": 3},
        2: {"nom": "Azul", "prix": 39.9, "stock": 5},
    }
    jeu = catalogue.get(id)
    return render(request, "ludo/detail.html", {"jeu": jeu, "id": id})

# detail.html : <h1>{{ jeu.nom }}</h1><p>{{ jeu.prix }} € — stock {{ jeu.stock }}</p>`,
      note: "Le balise {% url 'detail' jeu.id %} construit l'adresse à partir du nom de route : jamais d'URL écrite en dur. Pratique quand les chemins changent."
    },
    6: {
      titre: "un formulaire de location",
      etat: "L'utilisateur doit pouvoir agir : ajoutons un formulaire pour louer un jeu.",
      objectif: "Crée un formulaire (POST) avec {% csrf_token %} pour choisir un nombre de jours, et une vue qui lit request.POST et calcule le prix de la location.",
      hints: [
        "Le template : <form method=\"post\">{% csrf_token %} ... </form>",
        "La vue : if request.method == 'POST': jours = int(request.POST['jours'])"
      ],
      solution: `# detail.html
# <form method="post">
#   {% csrf_token %}
#   <input name="jours" type="number" value="1">
#   <button>Louer</button>
# </form>

# ludo/views.py
def detail(request, id):
    prix_jour = 5.0
    total = None
    if request.method == "POST":
        jours = int(request.POST.get("jours", 0))
        total = prix_jour * jours * (0.9 if jours >= 3 else 1)
    return render(request, "ludo/detail.html", {"total": total})`,
      note: "{% csrf_token %} protège le formulaire contre les attaques CSRF : Django refuse un POST sans ce jeton. C'est obligatoire et automatique."
    },
    7: {
      titre: "structurer en MVT",
      etat: "Le projet grossit : posons proprement l'architecture Modèle-Vue-Template autour du jeu.",
      objectif: "Prépare la structure : décris le futur modèle Jeu (les champs), garde la logique dans les vues et l'affichage dans les templates. Écris le squelette du modèle (sans migration encore).",
      hints: [
        "Le modèle décrit les données ; la vue la logique ; le template l'affichage.",
        "class Jeu(models.Model): nom = ...; prix_achat = ...; stock = ..."
      ],
      solution: `# ludo/models.py (squelette, on migrera à la leçon 8)
from django.db import models

class Jeu(models.Model):
    nom = models.CharField(max_length=120)
    prix_achat = models.DecimalField(max_digits=6, decimal_places=2)
    prix_location = models.DecimalField(max_digits=6, decimal_places=2)
    stock = models.IntegerField(default=0)

    def __str__(self):
        return self.nom`,
      note: "MVT = Modèle (données), Vue (logique), Template (HTML). Séparer ces rôles rend l'app maintenable. C'est le MVC de Laravel/Spring sous un autre nom."
    },
    8: {
      titre: "créer la table jeux",
      etat: "Le modèle Jeu est décrit : matérialisons-le en base avec une migration.",
      objectif: "Génère et applique la migration du modèle Jeu, puis crée quelques jeux dans le shell Django.",
      hints: [
        "python manage.py makemigrations ludo",
        "python manage.py migrate",
        "Jeu.objects.create(nom='Catan', prix_achat=44.9, prix_location=5, stock=3)"
      ],
      solution: `# terminal
python manage.py makemigrations ludo
python manage.py migrate

# python manage.py shell
from ludo.models import Jeu
Jeu.objects.create(nom="Catan", prix_achat=44.9, prix_location=5, stock=3)
Jeu.objects.create(nom="Azul",  prix_achat=39.9, prix_location=4, stock=5)
print(Jeu.objects.count())   # 2`,
      note: "makemigrations écrit le plan, migrate crée la table. La base remplace enfin les données en dur. Équivalent des migrations Laravel et de ddl-auto (Spring/JPA)."
    },
    9: {
      titre: "le catalogue depuis la base (CRUD)",
      etat: "Les jeux sont en base : affichons-les via l'ORM au lieu de la liste en dur.",
      objectif: "Modifie la vue liste pour lire Jeu.objects.all(), et ajoute une vue de suppression d'un jeu (réservée plus tard au vendeur).",
      hints: [
        "jeux = Jeu.objects.all()",
        "get_object_or_404(Jeu, id=id).delete()"
      ],
      solution: `from django.shortcuts import render, redirect, get_object_or_404
from .models import Jeu

def liste(request):
    jeux = Jeu.objects.all()
    return render(request, "ludo/liste.html", {"catalogue": jeux})

def supprimer(request, id):
    get_object_or_404(Jeu, id=id).delete()
    return redirect("liste")`,
      note: "L'ORM traduit les objets Python en SQL : .all(), .create(), .delete(). Fini le SQL à la main. Eloquent (Laravel) et JPA (Spring) offrent la même magie."
    },
    10: {
      titre: "filtrer et trier le catalogue",
      etat: "Le catalogue grandit : ajoutons recherche, filtre « en stock » et tri par prix.",
      objectif: "Avec les QuerySets, affiche seulement les jeux en stock, permets une recherche par nom (paramètre GET) et trie par prix_location.",
      hints: [
        "Jeu.objects.filter(stock__gt=0).order_by('prix_location')",
        "recherche = request.GET.get('q'); .filter(nom__icontains=recherche)"
      ],
      solution: `def liste(request):
    jeux = Jeu.objects.filter(stock__gt=0).order_by("prix_location")
    q = request.GET.get("q")
    if q:
        jeux = jeux.filter(nom__icontains=q)   # recherche insensible à la casse
    return render(request, "ludo/liste.html", {"catalogue": jeux})`,
      note: "Les QuerySets s'enchaînent (filter, order_by) et ne touchent la base qu'au moment de l'affichage (évaluation paresseuse). stock__gt=0 = « stock > 0 »."
    },
    11: {
      titre: "utilisateurs, rôles et transactions",
      etat: "Le cœur métier : relions jeux, clients et opérations d'achat/location.",
      objectif: "Ajoute un modèle Categorie (FK depuis Jeu), un Profil (OneToOne avec User + rôle) et un modèle Transaction reliant un jeu, un client et un type (achat/location).",
      hints: [
        "categorie = models.ForeignKey(Categorie, on_delete=models.SET_NULL, null=True)",
        "Transaction : jeu (FK), client (FK User), type (choices), montant, date"
      ],
      solution: `from django.contrib.auth.models import User

class Categorie(models.Model):
    nom = models.CharField(max_length=60)

class Profil(models.Model):
    ROLES = [("client","Client"),("vendeur","Vendeur"),("admin","Admin")]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLES, default="client")

class Transaction(models.Model):
    TYPES = [("achat","Achat"),("location","Location")]
    jeu = models.ForeignKey(Jeu, on_delete=models.CASCADE, related_name="transactions")
    client = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=TYPES)
    montant = models.DecimalField(max_digits=7, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)`,
      note: "Les relations (ForeignKey, OneToOne) modélisent le métier : un jeu a une catégorie, un utilisateur a un rôle, une transaction lie un client et un jeu. N'oublie pas makemigrations/migrate."
    },
    12: {
      titre: "valider avec un ModelForm",
      etat: "Ajouter/éditer un jeu à la main est risqué : encadrons-le par un formulaire validé.",
      objectif: "Crée un JeuForm (ModelForm) pour créer un jeu, avec validation (prix > 0, stock >= 0), et une vue qui l'enregistre après validation (motif POST-Redirect-GET).",
      hints: [
        "class JeuForm(forms.ModelForm): class Meta: model = Jeu; fields = [...]",
        "def clean_prix_location(self): valeur ... if valeur <= 0: raise ValidationError(...)"
      ],
      solution: `# ludo/forms.py
from django import forms
from .models import Jeu

class JeuForm(forms.ModelForm):
    class Meta:
        model = Jeu
        fields = ["nom", "prix_achat", "prix_location", "stock"]

    def clean_stock(self):
        stock = self.cleaned_data["stock"]
        if stock < 0:
            raise forms.ValidationError("Le stock ne peut pas être négatif.")
        return stock

# views.py
def creer_jeu(request):
    form = JeuForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("liste")
    return render(request, "ludo/form.html", {"form": form})`,
      note: "Le ModelForm génère le formulaire depuis le modèle et valide les données. C'est l'équivalent de la validation Laravel ($request->validate) et de Bean Validation (Spring)."
    },
    13: {
      titre: "un panier en session",
      etat: "Un client réserve plusieurs jeux avant de valider : gardons son panier entre les pages.",
      objectif: "Utilise la session pour un panier de location, et affiche un message flash (messages framework) quand un jeu est ajouté.",
      hints: [
        "request.session.setdefault('panier', []).append(id)",
        "from django.contrib import messages ; messages.success(request, 'Ajouté au panier')"
      ],
      solution: `from django.contrib import messages

def ajouter_panier(request, id):
    panier = request.session.get("panier", [])
    panier.append(id)
    request.session["panier"] = panier          # sauvegarde en session
    messages.success(request, "Jeu ajouté au panier de location")
    return redirect("liste")`,
      note: "La session mémorise des données propres à chaque visiteur (ici, le panier). Les messages flash affichent une confirmation ponctuelle. Laravel a la même chose (session + flash)."
    },
    14: {
      titre: "configuration et environnements",
      etat: "Avant de penser mise en ligne : séparons la configuration du code.",
      objectif: "Sors les réglages sensibles (SECRET_KEY, DEBUG, base de données) dans des variables d'environnement, et prévois un réglage différent en développement et en production.",
      hints: [
        "import os ; SECRET_KEY = os.environ.get('SECRET_KEY')",
        "DEBUG = os.environ.get('DEBUG', 'False') == 'True'"
      ],
      solution: `# settings.py
import os

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-only-key")
DEBUG = os.environ.get("DJANGO_DEBUG", "False") == "True"
ALLOWED_HOSTS = os.environ.get("DJANGO_HOSTS", "").split(",")

# .env (jamais versionné) :
# DJANGO_SECRET_KEY=...  DJANGO_DEBUG=True`,
      note: "Ne jamais mettre un secret dans le code versionné. Les variables d'environnement (.env) séparent config et code — même principe qu'appsettings (.NET) et application.properties (Spring)."
    },
    15: {
      titre: "tester le catalogue et la location",
      etat: "Sécurisons les évolutions : écrivons des tests automatiques.",
      objectif: "Écris deux tests : la page /jeux/ répond 200 et affiche un jeu créé ; une location décrémente bien le stock.",
      hints: [
        "from django.test import TestCase ; self.client.get('/jeux/')",
        "self.assertContains(reponse, 'Catan') ; self.assertEqual(jeu.stock, ...)"
      ],
      solution: `from django.test import TestCase
from .models import Jeu

class CatalogueTest(TestCase):
    def setUp(self):
        Jeu.objects.create(nom="Catan", prix_achat=44.9, prix_location=5, stock=2)

    def test_liste_affiche_les_jeux(self):
        r = self.client.get("/jeux/")
        self.assertEqual(r.status_code, 200)
        self.assertContains(r, "Catan")

    def test_location_decremente_stock(self):
        jeu = Jeu.objects.get(nom="Catan")
        jeu.stock -= 1
        jeu.save()
        self.assertEqual(Jeu.objects.get(nom="Catan").stock, 1)`,
      note: "Les tests tournent sur une base isolée et jetable. Un test qui passe = rien n'a régressé. MockMvc (Spring) et les tests Laravel jouent le même rôle."
    },
    16: {
      titre: "connexion et inscription",
      etat: "La ludothèque devient personnelle : les clients doivent pouvoir se connecter.",
      objectif: "Mets en place la connexion/déconnexion (django.contrib.auth) et protège la page « mes locations » avec @login_required.",
      hints: [
        "from django.contrib.auth.decorators import login_required",
        "LoginView / LogoutView câblées dans les URLs ; request.user"
      ],
      solution: `from django.contrib.auth.decorators import login_required

@login_required
def mes_locations(request):
    locations = Transaction.objects.filter(client=request.user, type="location")
    return render(request, "ludo/mes_locations.html", {"locations": locations})

# urls.py
# path("connexion/", LoginView.as_view(), name="connexion")
# path("deconnexion/", LogoutView.as_view(), name="deconnexion")`,
      note: "Django fournit tout l'authentification (hachage des mots de passe inclus). @login_required = le portier automatique. Laravel Breeze et Spring Security offrent l'équivalent."
    },
    17: {
      titre: "les 3 rôles et leurs droits",
      etat: "Client, vendeur, administrateur n'ont pas les mêmes droits : mettons en place l'autorisation.",
      objectif: "À partir du rôle du Profil, autorise : le vendeur à gérer le stock, l'admin à tout faire, le client seulement à louer/acheter. Bloque les autres (403).",
      hints: [
        "def role_requis(request, *roles): return request.user.profil.role in roles",
        "if not request.user.profil.role in ('vendeur','admin'): return HttpResponseForbidden()"
      ],
      solution: `from django.http import HttpResponseForbidden

def gerer_stock(request, id):
    if request.user.profil.role not in ("vendeur", "admin"):
        return HttpResponseForbidden("Réservé au personnel")
    jeu = get_object_or_404(Jeu, id=id)
    jeu.stock = int(request.POST["stock"])
    jeu.save()
    return redirect("liste")`,
      note: "Authentification (qui es-tu ?) puis autorisation (qu'as-tu le droit de faire ?). Le rôle du Profil décide. Les middlewares de rôle (Laravel) et @PreAuthorize (Spring) font pareil."
    },
    18: {
      titre: "une API JSON du catalogue",
      etat: "D'autres applications (mobile, front JS) veulent nos données : exposons une API.",
      objectif: "Avec Django REST Framework, crée un serializer et un ViewSet pour exposer le catalogue en JSON (lecture, et écriture réservée au personnel).",
      hints: [
        "class JeuSerializer(serializers.ModelSerializer): class Meta: model = Jeu; fields = '__all__'",
        "class JeuViewSet(viewsets.ModelViewSet): queryset = Jeu.objects.all()"
      ],
      solution: `# ludo/serializers.py
from rest_framework import serializers
from .models import Jeu

class JeuSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jeu
        fields = ["id", "nom", "prix_achat", "prix_location", "stock"]

# ludo/views.py
from rest_framework import viewsets
class JeuViewSet(viewsets.ModelViewSet):
    queryset = Jeu.objects.all()
    serializer_class = JeuSerializer
# routers.DefaultRouter().register("api/jeux", JeuViewSet)`,
      note: "Le serializer traduit modèle ⇄ JSON, le ViewSet fournit le CRUD complet. Le catalogue peut désormais alimenter une app mobile. Laravel API Resources et @RestController (Spring) font pareil."
    },
    19: {
      titre: "admin et pagination",
      etat: "Gérons le catalogue sans effort et gardons les listes rapides.",
      objectif: "Enregistre Jeu dans l'admin (colonnes, filtre, recherche) et pagine le catalogue public (10 jeux par page).",
      hints: [
        "@admin.register(Jeu) class JeuAdmin(admin.ModelAdmin): list_display = (...)",
        "Paginator(jeux, 10).get_page(request.GET.get('page'))"
      ],
      solution: `# ludo/admin.py
from django.contrib import admin
from .models import Jeu

@admin.register(Jeu)
class JeuAdmin(admin.ModelAdmin):
    list_display = ("nom", "prix_location", "stock")
    list_filter = ("categorie",)
    search_fields = ("nom",)

# views.py
from django.core.paginator import Paginator
def liste(request):
    jeux = Jeu.objects.filter(stock__gt=0).order_by("nom")
    page = Paginator(jeux, 10).get_page(request.GET.get("page"))
    return render(request, "ludo/liste.html", {"page": page})`,
      note: "L'admin Django est un back-office gratuit pour le vendeur/admin. La pagination garde le catalogue rapide même avec des milliers de jeux."
    },
    20: {
      titre: "🏁 assembler la Ludothèque web",
      etat: "Toutes les briques existent : réunissons-les en une application cohérente.",
      objectif: "Assemble le parcours complet : catalogue paginé, détail, location (connecté) qui crée une Transaction et décrémente le stock, le tout selon les rôles.",
      hints: [
        "louer() : @login_required, vérifier le stock, créer la Transaction, décrémenter.",
        "Réutilise Jeu, Transaction (leçon 11) et l'auth (leçon 16)."
      ],
      solution: `from django.db import transaction as db_tx

@login_required
def louer(request, id):
    jeu = get_object_or_404(Jeu, id=id)
    if jeu.stock <= 0:
        messages.error(request, "Indisponible")
        return redirect("detail", id=id)
    with db_tx.atomic():
        jeu.stock -= 1
        jeu.save()
        Transaction.objects.create(
            jeu=jeu, client=request.user,
            type="location", montant=jeu.prix_location)
    messages.success(request, f"{jeu.nom} loué !")
    return redirect("mes_locations")`,
      note: "Une application web complète : modèles, vues, templates, formulaires, auth, rôles et API. transaction.atomic garantit que stock et Transaction changent ensemble ou pas du tout."
    },
    21: {
      titre: "🎓 étendre l'application",
      etat: "Épreuve finale : ajoute une fonctionnalité de bout en bout.",
      objectif: "Ajoute un tableau de bord administrateur : nombre de transactions et chiffre d'affaires total (agrégation ORM), réservé au rôle admin.",
      hints: [
        "from django.db.models import Sum, Count",
        "Transaction.objects.aggregate(n=Count('id'), ca=Sum('montant'))",
        "Vérifie request.user.profil.role == 'admin'."
      ],
      solution: `from django.db.models import Sum, Count

@login_required
def tableau_bord(request):
    if request.user.profil.role != "admin":
        return HttpResponseForbidden("Réservé à l'administrateur")
    stats = Transaction.objects.aggregate(n=Count("id"), ca=Sum("montant"))
    return render(request, "ludo/dashboard.html", {"stats": stats})`,
      note: "Tu réunis modèles, relations, agrégations ORM, auth et rôles : la synthèse du cours. Compare ce tableau de bord à sa version Laravel, Spring et .NET — même app, quatre frameworks."
    }
  }
};
