/* ===== Fil rouge « Sécuriser la Ludothèque » — cours Sécurité applicative (21 étapes) =====
   On reprend l'application du Niveau 6 (conteneurisée, livrée par un pipeline)
   et on l'audite faille par faille : injection, XSS, CSRF, authentification,
   secrets, données personnelles, infrastructure, incident.
   Approche DÉFENSIVE : on apprend à protéger, jamais à attaquer autrui.
   Les exemples sont en Python · Django ; les équivalents Java/C#/PHP sont
   signalés quand ils diffèrent. */
var FIL = {
  prefix: "secu21",
  app: "La Ludothèque",
  placeholder: "Écris ton analyse de sécurité / ton code durci ici…",
  etapes: {
    1: {
      titre: "le modèle de menace",
      etat: "La Ludothèque fonctionne et se déploie — mais personne ne s'est demandé QUI pourrait vouloir l'attaquer, ni COMMENT.",
      objectif: "Dresse le modèle de menace de la Ludothèque : les biens à protéger (comptes, paiements, données clients), les points d'entrée (formulaires, API, upload), et 3 profils d'attaquant avec ce qu'ils viseraient. Classe les risques par (impact × probabilité).",
      hints: [
        "Biens : mots de passe, données personnelles, montants, intégrité du stock.",
        "Points d'entrée = surface d'attaque : chaque champ, chaque route, chaque dépendance.",
        "Profils : client malveillant, curieux authentifié, attaquant externe anonyme."
      ],
      solution: `MODÈLE DE MENACE — La Ludothèque

Biens à protéger (par sensibilité) :
  - mots de passe des comptes (jamais récupérables)
  - données personnelles clients (email, historique) -> RGPD
  - intégrité des stocks et des montants (pas de fraude)
  - disponibilité du service

Surface d'attaque (points d'entrée) :
  - formulaires : connexion, inscription, recherche, louer/acheter
  - API REST : /api/jeux, /api/mes-locations...
  - upload éventuel (avatar, import) ; en-têtes HTTP ; dépendances

Profils d'attaquant et cibles :
  1. Client authentifié curieux -> voir les locations des AUTRES (IDOR)
  2. Anonyme externe -> injection, XSS, vol de session, force brute
  3. Interne/dépendance compromise -> secrets, exfiltration de données

Priorisation (impact x probabilité) :
  CRITIQUE : vol de session admin, injection SQL, fuite de la base clients
  ÉLEVÉ    : IDOR sur les locations, XSS stocké, force brute des mots de passe
  MOYEN    : déni de service, énumération de comptes`,
      note: "On ne sécurise pas « tout » — on sécurise ce qui compte, d'abord. Le modèle de menace transforme une angoisse floue (« et si on nous piratait ? ») en liste priorisée et actionnable. Chaque leçon de ce cours ferme une ligne de ce tableau ; à la leçon 20, on le repassera en revue pour vérifier qu'aucune n'est restée ouverte."
    },
    2: {
      titre: "fermer l'injection SQL",
      etat: "Le catalogue utilise l'ORM (bien !), mais une route de statistiques a été bricolée avec du SQL construit par concaténation. C'est la porte ouverte.",
      objectif: "Repère le SQL vulnérable (chaîne construite avec une entrée utilisateur), explique l'attaque en une phrase, et corrige avec une requête PARAMÉTRÉE (ou l'ORM). Vérifie qu'aucun autre raw() ne traîne.",
      hints: [
        "Danger : f\"... WHERE titre = '{q}'\" — l'entrée devient du code SQL.",
        "Parade : les paramètres liés — cursor.execute(sql, [q]) ou l'ORM filter().",
        "Cherche tous les .raw(, .extra(, cursor.execute( du projet."
      ],
      solution: `# VULNÉRABLE (ne JAMAIS faire)
q = request.GET["q"]
cursor.execute(f"SELECT * FROM catalogue_jeu WHERE titre = '{q}'")
# q = "' OR '1'='1" renvoie tout ; q = "'; DROP TABLE ..." détruit.

# CORRIGÉ 1 — requête paramétrée (le driver sépare code et données)
cursor.execute(
    "SELECT * FROM catalogue_jeu WHERE titre = %s", [q])

# CORRIGÉ 2 — l'ORM, qui paramètre toujours (le mieux)
Jeu.objects.filter(titre__icontains=q)

# Java   : PreparedStatement + setString(1, q)  (jamais Statement + concat)
# C#     : SqlParameter / EF Core paramètre d'office
# PHP    : PDO::prepare + bindParam  (jamais l'interpolation)`,
      note: "L'injection SQL naît TOUJOURS du même geste : mélanger du code (la requête) et des données (l'entrée utilisateur) dans une seule chaîne. Les requêtes paramétrées les séparent — le driver traite l'entrée comme une valeur, jamais comme du SQL. L'ORM du capstone le faisait déjà pour toi ; le danger, c'est la route « vite faite » qui contourne l'ORM."
    },
    3: {
      titre: "neutraliser le XSS",
      etat: "Les templates échappent par défaut (Django, Thymeleaf, Blade, Razor) — mais quelqu'un a utilisé |safe sur un champ de description saisi par les vendeurs. Un script peut s'y cacher.",
      objectif: "Explique le XSS stocké (un script dans la description s'exécute chez les autres visiteurs), retire le |safe injustifié, et ajoute une Content Security Policy qui bloque les scripts en ligne comme deuxième rempart.",
      hints: [
        "{{ description }} échappe ; {{ description|safe }} ne l'affiche PAS échappé -> danger.",
        "Si du HTML riche est vraiment nécessaire : nettoyer avec une bibliothèque de sanitisation (bleach), pas |safe.",
        "CSP : en-tête Content-Security-Policy: default-src 'self'; script-src 'self'"
      ],
      solution: `# VULNÉRABLE
{{ jeu.description|safe }}   {# un vendeur saisit <script>vole_cookie()</script> #}
{# ...exécuté dans le navigateur de CHAQUE visiteur du jeu #}

# CORRIGÉ 1 — laisser l'échappement par défaut faire son travail
{{ jeu.description }}        {# le <script> s'affiche en texte, inoffensif #}

# CORRIGÉ 2 — si le HTML riche est requis : sanitiser, pas |safe
import bleach
description_sure = bleach.clean(saisie,
    tags=["b", "i", "p", "a"], attributes={"a": ["href"]})

# CORRIGÉ 3 — deuxième rempart : Content-Security-Policy
# Content-Security-Policy: default-src 'self'; script-src 'self'
# -> même si un script passe, le navigateur refuse de l'exécuter

# Java/Thymeleaf : th:text échappe, th:utext NON. C# Razor : @ échappe,
# Html.Raw non. PHP/Blade : {{ }} échappe, {!! !!} non. Même piège partout.`,
      note: "Le XSS, c'est faire exécuter le script de l'attaquant dans le navigateur de la victime — vol de session, actions à sa place. L'échappement automatique des templates te protège gratuitement ; le danger vient toujours d'un contournement (|safe, th:utext, Html.Raw, {!! !!}). La CSP est la ceinture en plus de la bretelle : défense en profondeur."
    },
    4: {
      titre: "verrouiller le CSRF",
      etat: "Les formulaires portent le jeton anti-CSRF du capstone — mais l'API accepte des requêtes sans vérification d'origine, et les cookies n'ont pas SameSite.",
      objectif: "Explique l'attaque CSRF (un site tiers déclenche « louer » à l'insu du client connecté), confirme la protection des formulaires (jeton), et durcis les cookies de session avec SameSite. Distingue le cas des API à jeton.",
      hints: [
        "CSRF : la victime connectée visite un site piège qui poste vers /louer/ ; le cookie part tout seul.",
        "Formulaires : le jeton CSRF (déjà là) — un site tiers ne peut pas le connaître.",
        "Cookies : SESSION_COOKIE_SAMESITE = 'Lax' bloque l'envoi cross-site."
      ],
      solution: `# 1. Formulaires : le jeton anti-CSRF (rappel capstone) — indispensable
<form method="post" action="/louer/12/">{% csrf_token %}...</form>
# un site tiers ne peut pas deviner ce jeton -> POST forgé refusé

# 2. Cookies de session : SameSite bloque l'envoi depuis un autre site
# settings.py
SESSION_COOKIE_SAMESITE = "Lax"     # (ou "Strict" si aucun POST cross-site légitime)
CSRF_COOKIE_SAMESITE = "Lax"

# 3. API : deux modèles
#   - session + cookie  -> soumise au CSRF, DONC jeton requis aussi
#   - jeton Bearer (JWT, en-tête Authorization) -> PAS de cookie automatique,
#     donc pas de CSRF classique (mais protéger le stockage du jeton)

# Java Spring Security, C# antiforgery, PHP Laravel @csrf : même principe,
# jeton imprévisible + SameSite sur les cookies.`,
      note: "Le CSRF exploite un cookie qui part AUTOMATIQUEMENT avec chaque requête vers ton site, même déclenchée par un site piège. Le jeton (imprévisible, lié à la session) prouve que la requête vient bien de ta page ; SameSite empêche carrément le cookie de voyager cross-site. Les API à jeton Bearer échappent au CSRF classique car rien ne part tout seul."
    },
    5: {
      titre: "durcir l'authentification",
      etat: "Les mots de passe sont hachés (bien !), mais rien n'empêche un attaquant d'essayer 10 000 combinaisons par minute sur la page de connexion.",
      objectif: "Confirme le hachage fort (le capstone utilise PBKDF2/bcrypt), ajoute une politique de mot de passe raisonnable, une limitation de débit (rate limiting) sur la connexion, et prévois la seconde factor (MFA) pour les comptes à privilèges.",
      hints: [
        "Ne jamais chiffrer un mot de passe : le HACHER (PBKDF2, bcrypt, argon2) — irréversible et lent.",
        "Rate limiting : bloquer/ralentir après N échecs par IP et par compte.",
        "MFA : un second facteur (appli TOTP) pour vendeur et administrateur au minimum."
      ],
      solution: `# 1. Hachage fort (rappel capstone) — jamais de chiffrement réversible
#    create_user hache en PBKDF2 par défaut ; argon2/bcrypt possibles.
PASSWORD_HASHERS = ["django.contrib.auth.hashers.Argon2PasswordHasher", ...]

# 2. Politique raisonnable (NIST) : longueur > complexité imposée
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "...MinimumLengthValidator", "OPTIONS": {"min_length": 12}},
    {"NAME": "...CommonPasswordValidator"},   # refuse les mots de passe fuités
]

# 3. Limitation de débit sur la connexion (par IP ET par compte)
#    django-axes, django-ratelimit, ou au niveau du reverse proxy.
@ratelimit(key="ip", rate="5/m", block=True)
@ratelimit(key="post:email", rate="5/m", block=True)
def connexion(request): ...

# 4. MFA pour les comptes à privilèges (vendeur, admin)
#    TOTP (appli d'authentification) : un mot de passe volé ne suffit plus.

# Java : Spring Security (BCryptPasswordEncoder + rate limit). C# : Identity
# (lockout intégré). PHP : password_hash + throttling. Mêmes principes.`,
      note: "Trois couches indépendantes : le hachage protège les mots de passe SI la base fuit ; le rate limiting empêche de deviner par force brute ; le MFA fait qu'un mot de passe volé ne suffit pas. Nuance moderne (NIST) : privilégier la LONGUEUR (phrases de passe) et le refus des mots de passe déjà fuités, plutôt que les règles « majuscule + chiffre + symbole » qui poussent aux Password1!."
    },
    6: {
      titre: "sécuriser la session",
      etat: "La session identifie l'utilisateur (capstone) — mais le cookie de session est lisible en JavaScript, voyage en clair, et ne meurt jamais.",
      objectif: "Durcis le cookie de session : HttpOnly (illisible en JS, anti-XSS), Secure (HTTPS seulement), SameSite, expiration raisonnable, et régénération de l'identifiant à la connexion (anti-fixation de session).",
      hints: [
        "HttpOnly : le JS ne peut pas lire le cookie -> un XSS ne vole plus la session.",
        "Secure : le cookie ne part que sur HTTPS -> pas d'interception en clair.",
        "Régénérer l'ID de session au login empêche la fixation de session."
      ],
      solution: `# settings.py — durcissement du cookie de session
SESSION_COOKIE_HTTPONLY = True     # illisible en JavaScript (anti-XSS)
SESSION_COOKIE_SECURE = True       # HTTPS uniquement (anti-interception)
SESSION_COOKIE_SAMESITE = "Lax"    # anti-CSRF (leçon 4)
SESSION_COOKIE_AGE = 60 * 60 * 8   # expiration : 8 h, pas l'éternité
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

# Anti-fixation : régénérer l'identifiant de session à la connexion
def connexion(request):
    ...
    login(request, user)           # Django cycle la clé de session au login
    request.session.cycle_key()    # explicite si besoin

# Java : server.servlet.session.cookie.http-only/secure + changeSessionId.
# C#   : CookieHttpOnly, SecurePolicy.Always. PHP : session.cookie_httponly,
#        session.cookie_secure, session_regenerate_id(true).`,
      note: "Le cookie de session EST l'identité : le voler, c'est devenir la victime sans mot de passe. HttpOnly le met hors de portée d'un XSS ; Secure le protège en transit ; l'expiration limite la fenêtre de vol ; la régénération à la connexion empêche qu'un attaquant fixe à l'avance un identifiant connu. Ces quatre lignes ferment autant de portes."
    },
    7: {
      titre: "le contrôle d'accès par ressource",
      etat: "Les rôles sont vérifiés (capstone), mais /api/locations/42 renvoie la location 42 à QUI la demande — un client peut lire celles des autres en changeant le numéro. C'est un IDOR.",
      objectif: "Explique l'IDOR (Insecure Direct Object Reference), corrige en filtrant TOUJOURS par le propriétaire (request.user), et pose le principe : l'autorisation se vérifie côté serveur, sur chaque accès, jamais via l'URL ou le menu.",
      hints: [
        "IDOR : l'objet est désigné par un id devinable, sans vérifier QUI a le droit.",
        "Parade : get_object_or_404(Location, pk=id, client=request.user).",
        "Le contrôle par rôle (leçon capstone) ET par ressource (ici) sont complémentaires."
      ],
      solution: `# VULNÉRABLE — IDOR : l'id suffit, le propriétaire n'est pas vérifié
def detail_location(request, pk):
    loc = get_object_or_404(Location, pk=pk)   # QUI que soit request.user !
    return render(request, "location.html", {"loc": loc})
# /api/locations/42, puis 43, 44... : on lit les locations de tout le monde.

# CORRIGÉ — filtrer par le propriétaire, toujours
def detail_location(request, pk):
    loc = get_object_or_404(Location, pk=pk, client=request.user)
    return render(request, "location.html", {"loc": loc})
# un id qui n'appartient pas au client -> 404, comme s'il n'existait pas.

# DRF : def get_queryset(self): return Location.objects.filter(client=self.request.user)

# Principe (OWASP A01 - Broken Access Control) :
# - vérifier l'autorisation SUR CHAQUE ACCÈS, côté serveur
# - par rôle (peut-il faire cette action ?) ET par ressource (sur CET objet ?)
# - jamais se fier à l'URL, à un champ caché ou au menu masqué`,
      note: "Le contrôle d'accès cassé est la faille n° 1 du classement OWASP — et l'IDOR en est la forme la plus courante : un id dans l'URL, aucune vérification du propriétaire. La parade tient en un mot : filtrer par request.user à CHAQUE accès. Le rôle dit « ce type d'utilisateur peut louer » ; la ressource dit « mais uniquement SES locations ». Il faut les deux."
    },
    8: {
      titre: "les secrets hors du code",
      etat: "Les cours Docker et CI/CD ont sorti les secrets du code — mais un audit trouve encore une clé d'API en dur dans un ancien commit, et aucune procédure de rotation.",
      objectif: "Confirme la règle (secrets par variables d'environnement/gestionnaire, jamais dans Git ni les images), scanne l'historique Git à la recherche de secrets, et écris la procédure de rotation d'un secret exposé.",
      hints: [
        "Un secret dans l'historique Git y reste, même supprimé au commit suivant.",
        "Scan : git-secrets, trufflehog, gitleaks parcourent tout l'historique.",
        "Exposé = grillé : révoquer + régénérer + mettre à jour, dans cet ordre."
      ],
      solution: `# 1. La règle (rappel Docker l.10, CI/CD l.13)
#    secrets -> variables d'environnement / gestionnaire (Vault, secrets GitHub)
#    JAMAIS dans le code, Git, les images, les logs.

# 2. Scanner tout l'historique (pas juste l'état actuel)
$ gitleaks detect --source .        # ou trufflehog, git-secrets
# trouve : clé Stripe en dur dans commit a1b2c3d (il y a 8 mois)

# 3. Procédure de rotation d'un secret exposé (dans l'ORDRE)
#    a. RÉVOQUER la clé exposée chez le fournisseur (immédiat)
#    b. GÉNÉRER une nouvelle clé
#    c. La poser dans le gestionnaire de secrets / l'environnement
#    d. Vérifier que le service repart
#    e. (l'historique Git garde la trace : réécrire l'historique est lourd
#       et ne suffit pas si le dépôt a été cloné -> la rotation EST la réponse)

# Prévention : hook pre-commit (gitleaks) qui refuse un commit contenant
# un motif de secret, + scan en CI (cours CI/CD).`,
      note: "« Je l'ai supprimé au commit suivant » est le faux réflexe universel : l'historique Git n'oublie rien, et un dépôt a pu être cloné. La seule réponse complète à un secret exposé est la ROTATION — révoquer d'abord, enquêter ensuite. Le hook pre-commit qui bloque les secrets avant qu'ils entrent est l'investissement le plus rentable de tout ce cours."
    },
    9: {
      titre: "chiffrer le transit (HTTPS)",
      etat: "En production, l'application est derrière un proxy, mais rien ne force HTTPS : un utilisateur sur un WiFi public peut voir passer identifiants et cookies en clair.",
      objectif: "Impose HTTPS partout : redirection HTTP->HTTPS, en-tête HSTS (le navigateur refuse le HTTP ensuite), cookies Secure, et certificats automatisés. Explique ce que HTTPS protège (et ce qu'il ne protège pas).",
      hints: [
        "SECURE_SSL_REDIRECT = True force la redirection vers HTTPS.",
        "HSTS : Strict-Transport-Security dit au navigateur « ce site, HTTPS uniquement ».",
        "HTTPS chiffre le TRANSIT ; il ne protège pas des failles applicatives (XSS, injection...)."
      ],
      solution: `# settings.py — production
SECURE_SSL_REDIRECT = True              # tout HTTP -> HTTPS
SECURE_HSTS_SECONDS = 31536000          # 1 an : le navigateur mémorise « HTTPS only »
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True            # cookies sur HTTPS seulement (leçon 6)
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")  # derrière proxy

# Certificats : Let's Encrypt automatisé (certbot / Caddy / Traefik)
# renouvellement auto -> jamais de certificat expiré.

# CE QUE HTTPS PROTÈGE : l'écoute et la modification en transit
#   (WiFi public, FAI, proxy intermédiaire).
# CE QU'IL NE PROTÈGE PAS : XSS, injection, IDOR, mots de passe faibles.
# HTTPS est nécessaire, jamais suffisant.`,
      note: "HTTPS chiffre le tuyau : sur un WiFi public, sans lui, identifiants et cookies s'affichent en clair pour qui écoute. HSTS ferme la fenêtre restante (la toute première requête HTTP) en gravant « ce site, HTTPS only » dans le navigateur. Mais attention au faux sentiment de sécurité : le cadenas ne dit rien de la solidité de l'application derrière — un site en HTTPS peut être criblé de failles applicatives."
    },
    10: {
      titre: "protéger les données au repos",
      etat: "La base clients contient emails et historiques en clair ; les sauvegardes traînent sans chiffrement. Si un disque ou un dump fuit, tout est lisible.",
      objectif: "Distingue hachage (mots de passe, irréversible) et chiffrement (données à relire). Chiffre les sauvegardes et les données particulièrement sensibles, applique la minimisation (ne pas stocker ce dont on n'a pas besoin), et protège les dumps.",
      hints: [
        "Hachage = irréversible (mots de passe). Chiffrement = réversible avec une clé (données à relire).",
        "Minimisation : la meilleure protection d'une donnée est de ne pas la stocker.",
        "Sauvegardes chiffrées + clé stockée séparément de la sauvegarde."
      ],
      solution: `# 1. Hachage vs chiffrement — ne pas confondre
#    mot de passe -> HACHÉ (argon2/bcrypt) : on ne le relit jamais
#    email, historique -> à relire -> CHIFFRÉ si très sensible, avec clé gérée
#    numéro de carte -> on NE STOCKE PAS (on délègue au prestataire de paiement)

# 2. Minimisation (RGPD, leçon 18) : la donnée la plus sûre est l'absente
#    - pas de numéro de carte (paiement délégué)
#    - pas de données sensibles « au cas où »
#    - purge des données inutiles (locations très anciennes anonymisées)

# 3. Sauvegardes chiffrées
$ mysqldump ... | gpg --encrypt --recipient sauvegarde@ludo > backup.sql.gpg
#    clé de déchiffrement stockée SÉPARÉMENT de la sauvegarde
#    (une sauvegarde chiffrée avec sa clé à côté = sauvegarde en clair)

# 4. Chiffrement au niveau base/disque (TDE, volumes chiffrés) pour la
#    défense en profondeur : un disque volé reste illisible.

# Toutes piles : le principe est universel ; les outils (gpg, KMS, TDE) varient.`,
      note: "Deux erreurs classiques : chiffrer un mot de passe (il faut le HACHER — un mot de passe ne se relit jamais) et stocker des données « au cas où ». La minimisation est la plus élégante des protections : une donnée qu'on ne stocke pas ne peut ni fuiter, ni être volée, ni tomber sous le RGPD. Pour le reste, chiffrer les sauvegardes — avec la clé rangée ailleurs, sinon c'est du théâtre."
    },
    11: {
      titre: "valider toutes les entrées",
      etat: "Un formulaire d'import et un futur upload d'avatar acceptent n'importe quoi : fichiers énormes, types dangereux, et une URL fournie par l'utilisateur que le serveur va chercher lui-même (SSRF).",
      objectif: "Pose la règle « ne jamais faire confiance à une entrée », valide type/taille/contenu des uploads, stocke les fichiers hors de la racine web, et neutralise la SSRF (le serveur ne suit pas une URL arbitraire vers son réseau interne).",
      hints: [
        "Valider : type MIME réel (pas l'extension), taille max, nom nettoyé.",
        "Ne pas servir un upload depuis un dossier exécutable ; renommer, pas le nom d'origine.",
        "SSRF : filtrer les URL fournies (pas d'IP interne, pas de localhost, liste d'autorisation)."
      ],
      solution: `# 1. Règle d'or : toute entrée est hostile jusqu'à validation
#    (formulaires, en-têtes, paramètres d'URL, fichiers, webhooks...)

# 2. Upload de fichier — valider type RÉEL, taille, et isoler
def valider_avatar(f):
    if f.size > 2 * 1024 * 1024:            # 2 Mo max
        raise ValidationError("Fichier trop volumineux")
    type_reel = magic.from_buffer(f.read(2048), mime=True)  # contenu, pas extension
    if type_reel not in {"image/png", "image/jpeg"}:
        raise ValidationError("Type non autorisé")
#    - stocker hors racine web, nom généré (uuid), pas le nom d'origine
#    - servir via une vue contrôlée, jamais exécuté

# 3. SSRF — le serveur ne va PAS chercher une URL arbitraire
def importer_depuis_url(url):
    hote = urlparse(url).hostname
    if hote in {"localhost", "127.0.0.1"} or ip_est_privee(hote):
        raise ValidationError("URL non autorisée")   # pas de réseau interne
    # mieux : liste d'AUTORISATION de domaines, pas liste d'interdiction

# Java (Bean Validation), C# (DataAnnotations + antivirus), PHP (finfo) :
# valider le contenu, pas la confiance.`,
      note: "« Ne jamais faire confiance à l'entrée utilisateur » résume la moitié de la sécurité applicative. Pour les fichiers : le type réel (le contenu) ment moins que l'extension, et un upload servi depuis un dossier exécutable est une porte dérobée. La SSRF est plus subtile : on fait faire au serveur une requête qu'un attaquant ne pourrait pas faire lui-même — vers le réseau interne, les métadonnées cloud... D'où la liste d'autorisation."
    },
    12: {
      titre: "surveiller la chaîne d'approvisionnement",
      etat: "Le projet dépend de dizaines de bibliothèques ; personne ne sait lesquelles ont des failles connues (CVE), ni si une mise à jour a introduit un paquet malveillant.",
      objectif: "Mets en place le scan des dépendances (CVE connues) et des images (rappel Docker), l'épinglage des versions, et l'intégration du scan au pipeline CI/CD pour bloquer une dépendance vulnérable avant la production.",
      hints: [
        "Scanner les dépendances : pip-audit, npm audit, l'équivalent de ta pile.",
        "Scanner les images : docker scout / trivy (rappel Docker l.16).",
        "Automatiser dans la CI (cours CI/CD) : une CVE critique bloque le merge."
      ],
      solution: `# 1. Scanner les dépendances applicatives (CVE connues)
$ pip-audit                     # Python ; npm audit (JS), OWASP Dependency-Check (Java),
                                # dotnet list package --vulnerable (C#), composer audit (PHP)
# -> signale : "urllib3 1.26.4 : CVE-2023-xxxx, corrigé en 1.26.18"

# 2. Scanner l'image (rappel Docker l.16)
$ trivy image ghcr.io/toi/ludotheque:1.2.0
$ docker scout cves ghcr.io/toi/ludotheque:1.2.0

# 3. Épingler + mettre à jour avec méthode
#    requirements.txt versionné (reproductible), mises à jour régulières
#    et TESTÉES par la CI, pas au petit bonheur.

# 4. Automatiser dans le pipeline (cours CI/CD)
#    job "securite" : pip-audit + trivy ; une CVE CRITIQUE -> job rouge -> merge bloqué
#    Dependabot / Renovate : ouvrent automatiquement les PR de mise à jour.

# Attaque de chaîne d'approvisionnement : un paquet légitime compromis, ou
# un typosquat (reqeusts au lieu de requests) -> vérifier les noms, épingler
# les versions, préférer les sources officielles.`,
      note: "Ton code peut être parfait et ton application vulnérable : la faille est dans une dépendance de dépendance que personne n'a lue. Le scan automatisé transforme « on espère que nos libs sont à jour » en garantie vérifiée à chaque commit. Deux menaces distinctes : les CVE (failles connues des libs) et les attaques de chaîne (un paquet malveillant se fait passer pour légitime) — épingler et scanner répond aux deux."
    },
    13: {
      titre: "journaliser sans trahir",
      etat: "Les logs du capstone tracent le métier — mais un audit révèle qu'ils enregistrent aussi des mots de passe en clair et des jetons de session, et que personne ne surveille les tentatives d'intrusion.",
      objectif: "Définis quoi journaliser (événements de sécurité : connexions, échecs, changements de rôle) et quoi ne JAMAIS journaliser (mots de passe, jetons, données sensibles), et pose une détection des comportements suspects (rafales d'échecs de connexion).",
      hints: [
        "Journaliser : qui, quoi, quand — les événements de sécurité.",
        "Ne JAMAIS journaliser : mots de passe, jetons, numéros de carte, données personnelles brutes.",
        "Détecter : N échecs de connexion en M minutes -> alerte."
      ],
      solution: `# 1. Journaliser les ÉVÉNEMENTS DE SÉCURITÉ (traçabilité, forensic)
logger.info("connexion réussie user=%s ip=%s", user.id, ip)
logger.warning("échec de connexion email=%s ip=%s", email, ip)
logger.warning("changement de rôle cible=%s par=%s", cible.id, admin.id)

# 2. Ne JAMAIS journaliser (fuite par les logs)
#    ✘ mots de passe, même hachés au moment de la saisie
#    ✘ jetons de session / API, cookies
#    ✘ numéros de carte, données personnelles brutes
#    -> les logs se copient, s'archivent, se partagent : traités comme sensibles

# 3. Détecter les comportements suspects
#    - rafale d'échecs de connexion (force brute) -> alerte + rate limit (leçon 5)
#    - accès massif à /api/locations/N séquentiels (IDOR tenté) -> alerte
#    - un compte qui change soudain de pays -> signalement

# 4. Intégrité des logs : centralisés, horodatés, en append-only
#    (un attaquant qui entre efface ses traces si les logs sont locaux et éditables)

# Toutes piles : logger structuré + politique de rétention + surveillance.`,
      note: "Les logs sont à double tranchant : indispensables pour comprendre un incident (qui, quoi, quand), mais dangereux s'ils enregistrent ce qu'ils protègent. La règle : journaliser les ÉVÉNEMENTS (une connexion a échoué) jamais les SECRETS (le mot de passe essayé). Et des logs sans surveillance ne servent qu'au post-mortem ; détecter les rafales d'échecs EN DIRECT, c'est passer de l'autopsie à la prévention."
    },
    14: {
      titre: "ne rien divulguer par erreur",
      etat: "En production, une exception affiche encore la trace complète (chemins, versions, extrait de requête SQL), et les messages distinguent « email inconnu » de « mot de passe incorrect ».",
      objectif: "Coupe toute fuite d'information : DEBUG désactivé, pages d'erreur sobres, messages d'authentification indifférenciés, en-têtes de version masqués. Explique en quoi chaque détail aide un attaquant.",
      hints: [
        "DEBUG=0 en prod (rappel Docker/capstone) : plus de trace publique.",
        "Message de connexion unique : « identifiants invalides », jamais lequel des deux.",
        "Masquer Server:, X-Powered-By: — ne pas annoncer ses versions."
      ],
      solution: `# 1. DEBUG désactivé en production (rappel capstone l.20, Docker l.20)
DEBUG = False                       # plus de stack trace, chemins, config exposés
ALLOWED_HOSTS = ["ludotheque.example.com"]
# pages d'erreur 404/500 sobres et personnalisées (aucun détail technique)

# 2. Messages d'authentification INDIFFÉRENCIÉS (anti-énumération)
#    ✘ "Email inconnu" / "Mot de passe incorrect"  (révèle quels comptes existent)
#    ✔ "Identifiants invalides"                     (les deux cas, même message)
#    idem inscription/reset : ne pas confirmer l'existence d'un compte.

# 3. Masquer les bannières de version
#    retirer/neutraliser Server:, X-Powered-By:, X-AspNet-Version...
#    -> ne pas offrir à l'attaquant la liste des CVE applicables

# 4. Erreurs génériques côté API : {"erreur": "requête invalide"} + code HTTP,
#    jamais le détail interne (nom de colonne, contrainte SQL, chemin de fichier).

# Principe : chaque détail divulgué (version, existence d'un compte, structure
# interne) est une pièce du puzzle que l'attaquant assemble. Le silence protège.`,
      note: "Une trace d'exception en production est une carte au trésor : versions (donc CVE applicables), chemins, structure de la base, parfois des secrets. Et distinguer « email inconnu » de « mauvais mot de passe » offre gratuitement la liste des comptes valides. La discrétion n'est pas de la paranoïa — c'est refuser de faire le travail de reconnaissance de l'attaquant à sa place."
    },
    15: {
      titre: "poser les en-têtes de sécurité",
      etat: "Les réponses HTTP ne portent aucun en-tête de sécurité : le navigateur ne sait pas qu'il doit refuser les scripts en ligne, l'affichage en iframe, ni le reniflage de type.",
      objectif: "Ajoute les en-têtes de sécurité HTTP : Content-Security-Policy (renfort anti-XSS), X-Frame-Options (anti-clickjacking), X-Content-Type-Options, Referrer-Policy. Explique le rôle de chacun et teste le résultat.",
      hints: [
        "CSP : la défense de fond contre le XSS (leçon 3) — restreint d'où viennent scripts, styles, images.",
        "X-Frame-Options: DENY empêche d'encadrer ton site dans une iframe piège (clickjacking).",
        "Un scanner d'en-têtes (observatory, securityheaders) note ta configuration."
      ],
      solution: `# En-têtes de sécurité (via middleware, proxy, ou django-csp)
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'
                         # d'où peuvent venir scripts/styles/images -> anti-XSS
X-Frame-Options: DENY              # personne n'encadre le site en iframe -> anti-clickjacking
X-Content-Type-Options: nosniff    # le navigateur ne "devine" pas les types MIME
Referrer-Policy: strict-origin-when-cross-origin   # ne pas fuiter l'URL complète
Permissions-Policy: geolocation=(), camera=()      # désactive les API inutiles

# Django : SecurityMiddleware + django-csp
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
# Java : Spring Security headers ; C# : app.UseHsts + headers ; PHP : header()
# ou middleware. Le reverse proxy (nginx) peut aussi les injecter.

# Tester : securityheaders.com, Mozilla Observatory -> une note, des manques.
# La CSP se règle progressivement (report-only d'abord) pour ne rien casser.`,
      note: "Les en-têtes de sécurité sont des instructions au navigateur : « refuse les scripts d'ailleurs », « ne te laisse pas encadrer », « ne devine pas les types ». Presque gratuits (quelques lignes) et étonnamment efficaces — la CSP est le meilleur filet de rattrapage contre le XSS quand un échappement a été oublié. On la déploie en mode report-only d'abord : elle signale ce qu'elle bloquerait, sans rien casser, le temps d'ajuster."
    },
    16: {
      titre: "durcir les conteneurs et l'infra",
      etat: "Le cours Docker a durci l'image (non-root, multi-stage) — mais l'audit sécurité vérifie la surface complète : ports exposés, capacités, système de fichiers, réseau interne.",
      objectif: "Repasse l'infrastructure au crible sécurité : conteneur non-root et read-only, capacités retirées, MySQL jamais exposé, un seul point d'entrée public (proxy), et le principe de moindre surface partout.",
      hints: [
        "Rappels Docker : USER non-root, read_only, cap_drop ALL, no-new-privileges (l.16).",
        "Réseau : seul le proxy est publié ; app et base sur le réseau interne (l.9).",
        "Moindre surface : chaque port ouvert, chaque capacité, chaque service en plus est un risque."
      ],
      solution: `# Audit d'infrastructure (rappels Docker, sous l'angle sécurité)

# 1. Le conteneur applicatif (Docker l.16)
    user: ...                         # non-root : useradd + USER
    read_only: true                   # système de fichiers non modifiable
    tmpfs: [/tmp]
    cap_drop: [ALL]                   # aucune capacité noyau superflue
    security_opt: [no-new-privileges:true]

# 2. La surface réseau (Docker l.9)
#    - MySQL : AUCUN ports: -> invisible de l'extérieur
#    - app   : pas de port public direct -> derrière le proxy
#    - proxy : SEUL point d'entrée, 443 uniquement, HTTPS (leçon 9)

# 3. Moindre surface
#    - pas de service en plus « au cas où » (phpMyAdmin exposé = porte ouverte)
#    - images officielles épinglées + scannées (leçon 12)
#    - pas de --privileged, pas de socket Docker monté (Docker l.16)

# 4. Segmentation : la base sur un réseau séparé du frontal ; le proxy
#    ne parle qu'à l'app, l'app seule parle à la base.

# Principe : chaque port, capacité, service, privilège en trop est une
# porte. La sécurité de l'infra, c'est refermer celles qu'on n'utilise pas.`,
      note: "Le cours Docker a durci l'image ; ici on regarde la MÊME infra avec les yeux d'un attaquant : que puis-je atteindre depuis l'extérieur ? Un seul point d'entrée (le proxy en 443), une base invisible, aucune capacité superflue, aucun service « bonus » exposé. La sécurité de l'infrastructure se résume à la moindre surface : on ne peut pas attaquer une porte qui n'existe pas."
    },
    17: {
      titre: "la sécurité dans le pipeline",
      etat: "Le pipeline CI/CD teste et déploie — mais ne cherche pas les failles : pas de scan de code, pas de détection de secrets, pas de scan de dépendances automatisé.",
      objectif: "Intègre la sécurité au pipeline (DevSecOps) : détection de secrets (pre-commit + CI), analyse statique du code (SAST), scan des dépendances et de l'image, chacun bloquant la livraison sur faille critique.",
      hints: [
        "Secret scanning : gitleaks en pre-commit ET en CI (leçon 8).",
        "SAST : bandit (Python), CodeQL, SonarQube — analysent le code sans l'exécuter.",
        "Le job sécurité rejoint tests/qualité/image du cours CI/CD ; critique = merge bloqué."
      ],
      solution: `# .github/workflows/ci.yml — un job "securite" (cours CI/CD, leçon 8-14)
  securite:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 1. Détection de secrets sur tout l'historique (leçon 8)
      - name: Secrets
        run: gitleaks detect --source . --redact

      # 2. Analyse statique du code — SAST (failles dans NOTRE code)
      - name: SAST
        run: |
          pip install bandit
          bandit -r catalogue -ll        # signale eval(), SQL concaténé, etc.

      # 3. Dépendances vulnérables (leçon 12)
      - name: Dépendances
        run: pip install pip-audit && pip-audit

      # 4. Image (leçon 12, 16)
      - name: Image
        run: trivy image --exit-code 1 --severity CRITICAL ludotheque:${{ github.sha }}

# Ce job rejoint tests/qualite/image dans la protection de branche (CI/CD l.14) :
# une CRITIQUE -> job rouge -> merge et livraison bloqués.

# DevSecOps : la sécurité n'est pas une étape finale, c'est un contrôle
# CONTINU, à chaque commit — comme les tests.`,
      note: "DevSecOps, c'est déplacer la sécurité vers la GAUCHE : au lieu d'un audit annuel qui trouve les failles après coup, un contrôle à chaque commit qui les bloque avant la production. Trois angles complémentaires : les secrets (ne pas les commiter), le SAST (failles dans ton code), le scan de dépendances/image (failles héritées). Le pipeline du cours CI/CD devient le gardien automatique de tout ce cours."
    },
    18: {
      titre: "le RGPD et les données personnelles",
      etat: "La Ludothèque stocke emails, historiques de location et d'achat — des données personnelles. Aucune base légale n'est documentée, aucun droit à l'effacement n'est implémenté.",
      objectif: "Applique les principes du RGPD à la Ludothèque : minimisation (leçon 10), base légale et consentement, droits des personnes (accès, effacement, portabilité), durées de conservation, et notification en cas de violation.",
      hints: [
        "Minimisation : ne collecter que le nécessaire (rappel leçon 10).",
        "Droits : accès (exporter ses données), effacement (« droit à l'oubli »), rectification.",
        "Violation de données : obligation de notifier (autorité + personnes) sous 72 h."
      ],
      solution: `# RGPD appliqué à la Ludothèque (données personnelles = email, historiques)

# 1. Minimisation & base légale
#    - collecter le strict nécessaire (leçon 10) ; pas de champ « au cas où »
#    - base légale claire : exécution du contrat (location), consentement (marketing)
#    - politique de confidentialité lisible : quoi, pourquoi, combien de temps

# 2. Droits des personnes -> les IMPLÉMENTER, pas juste les afficher
def exporter_mes_donnees(request):        # droit d'accès / portabilité
    return JsonResponse(donnees_personnelles(request.user))   # format réutilisable

def supprimer_mon_compte(request):        # droit à l'effacement
    anonymiser_locations(request.user)    # garder les stats agrégées, retirer l'identité
    request.user.delete()

# 3. Durées de conservation
#    - locations closes : anonymiser après X années (pas garder l'email à vie)
#    - purge automatique planifiée (tâche cron)

# 4. Violation de données : procédure prête (leçon 19)
#    notifier l'autorité (CNIL) sous 72 h + les personnes si risque élevé.

# 5. Sous-traitants (hébergeur, paiement) : contrats conformes (DPA).

# Le RGPD n'est pas qu'une case juridique : minimisation, chiffrement (l.10),
# droits, durées -> ce sont des pratiques de SÉCURITÉ des données.`,
      note: "Le RGPD n'est pas qu'une contrainte juridique plaquée sur le code : ses principes SONT de la sécurité des données. Minimiser (ne pas stocker), limiter la durée (purger), permettre l'effacement — chaque règle réduit la surface de ce qui peut fuiter. Le « droit à l'oubli » demande souvent de l'anonymisation plutôt que de la suppression brute : on garde les statistiques agrégées, on retire l'identité. Concevoir cela dès le départ (privacy by design) coûte dix fois moins que le rétrofit."
    },
    19: {
      titre: "répondre à un incident",
      etat: "Si la Ludothèque était compromise demain, personne ne saurait quoi faire, dans quel ordre, ni qui prévenir. L'improvisation en pleine crise est la garantie du désastre.",
      objectif: "Écris le plan de réponse à incident : les phases (détecter, confiner, éradiquer, rétablir, tirer les leçons), les actions concrètes pour la Ludothèque (rotation des secrets, invalidation des sessions), et le post-mortem sans blâme.",
      hints: [
        "Les phases classiques : détection, confinement, éradication, rétablissement, leçons.",
        "Confiner ≠ éradiquer : d'abord limiter la casse (couper l'accès), puis nettoyer.",
        "Post-mortem sans blâme : chercher la cause système, pas le coupable."
      ],
      solution: `PLAN DE RÉPONSE À INCIDENT — La Ludothèque

1. DÉTECTER (leçon 13 : surveillance des logs)
   - signal : rafale d'échecs, accès anormaux, alerte d'un tiers
   - qualifier : incident réel ? périmètre ? données touchées ?

2. CONFINER (limiter la casse, vite)
   - couper l'accès compromis (désactiver le compte, isoler le service)
   - INVALIDER toutes les sessions (forcer la reconnexion)
   - préserver les preuves (logs, snapshot) avant de nettoyer

3. ÉRADIQUER
   - ROTATION de tous les secrets potentiellement exposés (leçon 8)
   - corriger la faille (patch, dépendance, config)
   - vérifier l'absence de porte dérobée laissée par l'attaquant

4. RÉTABLIR
   - redéployer une version saine (rollback si besoin, CI/CD l.19)
   - restaurer depuis une sauvegarde propre si données altérées (leçon 10)
   - surveillance renforcée pendant la reprise

5. TIRER LES LEÇONS (post-mortem SANS BLÂME)
   - chronologie factuelle, cause RACINE (système, pas personne)
   - actions correctives datées ; notifier si données personnelles (RGPD, l.18)

Le plan existe AVANT l'incident : en pleine crise, on exécute, on n'invente pas.`,
      note: "En pleine crise, personne ne réfléchit bien : le plan écrit à froid est ce qui sépare une gêne contenue d'une catastrophe. L'ordre compte — confiner (arrêter l'hémorragie) AVANT d'éradiquer (nettoyer). Et le post-mortem sans blâme est vital : chercher un coupable pousse chacun à cacher les erreurs ; chercher la cause système pousse à les exposer et à corriger. C'est le rapport d'incident du cours CI/CD, élevé au rang de discipline."
    },
    20: {
      titre: "l'audit complet",
      etat: "Chaque faille a été traitée séparément. Il est temps de reprendre le modèle de menace de la leçon 1 et de vérifier, ligne par ligne, que chaque risque est désormais couvert.",
      objectif: "Conduis l'audit de sécurité complet de la Ludothèque : reprends le modèle de menace (leçon 1), coche chaque risque avec la parade en place et la leçon correspondante, et liste ce qui resterait à surveiller en continu.",
      hints: [
        "Reprends le tableau de la leçon 1 : chaque risque a-t-il sa parade ?",
        "Une checklist vérifiable : chaque point avec sa preuve (config, test, scan).",
        "La sécurité n'est jamais « finie » : distinguer ce qui est fait de ce qui se surveille."
      ],
      solution: `AUDIT DE SÉCURITÉ — La Ludothèque (reprise du modèle de menace, l.1)

Risque (l.1)                → Parade en place                    → Leçon
Injection SQL               → ORM + requêtes paramétrées         → 2
XSS stocké                  → échappement + CSP + sanitisation   → 3, 15
CSRF                        → jeton + SameSite                   → 4
Force brute mots de passe   → hachage fort + rate limit + MFA    → 5
Vol de session              → HttpOnly/Secure/SameSite + HTTPS   → 6, 9
IDOR / accès cassé          → filtrage par request.user          → 7
Secrets exposés             → hors code + scan + rotation        → 8, 17
Interception réseau         → HTTPS + HSTS                       → 9
Fuite de la base            → chiffrement + minimisation         → 10
Upload/SSRF                 → validation + liste d'autorisation  → 11
Dépendance vulnérable       → scan CVE en CI                     → 12, 17
Fuite par logs/erreurs      → logs sûrs + DEBUG=0 + msg génériques → 13, 14
Clickjacking / MIME         → en-têtes de sécurité               → 15
Infra exposée               → non-root, moindre surface          → 16
Données personnelles        → RGPD : droits, durées, minimisation → 18
Incident                    → plan de réponse prêt               → 19

À SURVEILLER EN CONTINU : nouvelles CVE (scan permanent), logs de sécurité,
revue trimestrielle, mises à jour, exercices de réponse à incident.`,
      note: "L'audit boucle la boucle : le modèle de menace de la leçon 1 posait les questions, les leçons 2 à 19 y répondent, et ce tableau vérifie qu'aucune ligne n'est restée ouverte. Le dernier bloc est le plus important : la sécurité n'est jamais « terminée ». De nouvelles failles apparaissent, les dépendances vieillissent, l'application évolue — la sécurité est un processus continu, pas un projet qu'on livre."
    },
    21: {
      titre: "🎓 la Ludothèque durcie",
      etat: "L'application conçue, développée, conteneurisée et livrée est désormais AUDITÉE de bout en bout — elle résiste aux attaques les plus courantes, et son équipe sait réagir.",
      objectif: "Exercice de synthèse : reprends une entrée utilisateur (le formulaire « louer ») et suis-la à travers TOUTES les défenses qu'elle traverse désormais — de la requête HTTPS au COMMIT — en nommant chaque protection et sa leçon.",
      hints: [
        "Pars de la requête : HTTPS (l.9), en-têtes (l.15), cookie durci (l.6).",
        "Puis : CSRF (l.4), authentification (l.5), autorisation par ressource (l.7).",
        "Puis : validation (l.11), ORM anti-injection (l.2), logs sûrs (l.13)."
      ],
      solution: `LE TRAJET SÉCURISÉ D'UN « LOUER »

Transport      HTTPS + HSTS chiffrent la requête          (l.9)
En-têtes       CSP, X-Frame-Options protègent la page     (l.15)
Cookie         session HttpOnly + Secure + SameSite       (l.6)
CSRF           jeton vérifié : la requête vient de NOTRE page (l.4)
AuthN          utilisateur authentifié (hachage, rate limit, MFA) (l.5)
AuthZ (rôle)   a-t-il le droit de louer ?                 (capstone)
AuthZ (ressource) sur SES données uniquement (pas d'IDOR) (l.7)
Validation     entrées vérifiées, rien de confiance aveugle (l.11)
Injection      ORM / requête paramétrée : pas de SQL forgé (l.2)
XSS            sortie échappée : pas de script injecté     (l.3)
Métier         transaction atomique (capstone) -> COMMIT
Journalisation événement tracé, SANS secret               (l.13)
Erreur         message générique si échec, DEBUG=0        (l.14)

Et autour : secrets hors du code (l.8), dépendances scannées (l.12),
image durcie (l.16), pipeline sécurisé (l.17), RGPD (l.18),
plan d'incident prêt (l.19). Défense EN PROFONDEUR : chaque couche
suppose que les autres pourraient céder.`,
      note: "Un seul clic « Louer » traverse maintenant une dizaine de défenses indépendantes — c'est cela, la défense en profondeur : aucune couche ne se croit suffisante, chacune suppose que les autres pourraient céder. Regarde le chemin parcouru par toute la formation : l'algorithme, le langage, le framework, la base née de Merise, l'application assemblée, conteneurisée, livrée par un pipeline, et maintenant durcie contre les attaques. La Ludothèque t'a mené du premier `if` au réflexe de sécurité — c'est exactement le parcours d'un développeur complet."
    }
  }
};
