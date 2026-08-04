# -*- coding: utf-8 -*-
"""Génère vocab-data-<langue>.js pour les 4 langues.

DEUX SOURCES, TOUJOURS DISTINGUÉES :
  · source="lexique"     -> repris TEL QUEL des lexique.html du site. Aucune
                            traduction créée ici : la banque ne peut donc pas
                            diverger du cours (contrôle automatique).
  · source="non-verifie" -> extension de volume, écrite à la main, limitée au
                            vocabulaire concret et fréquent dont la traduction
                            est stable. Marquée ⚠ dans l'interface.

Les thèmes de lexique n'ont pas le même intitulé d'une langue à l'autre : la
classification est donc faite par MOTS-CLÉS du titre de thème, pas par table
d'équivalence figée.
"""
import re, html, json, os, unicodedata, importlib, sys

# Racine du site : deux niveaux au-dessus de ce script (_outils/vocabulaire/).
BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# --- catégorie : première règle qui matche, l'ordre compte -------------------
REGLES_CAT = [
 ("meteo",                                   "temps-meteo"),
 ("famille",                                 "famille"),
 ("nombre",                                  "nombres-dates"),
 ("jour",                                    "nombres-dates"),
 ("couleur",                                 "adjectifs"),
 ("nourriture|boisson|restaurant",           "nourriture"),
 ("voyage|transport",                        "transports-voyage"),
 ("vetement",                                "vetements"),
 ("sante|corps",                             "corps-sante"),
 ("ville",                                   "ville"),
 ("loisir|sport",                            "loisirs-sport"),
 ("environnement|nature",                    "nature-environnement"),
 ("emotion|sentiment",                       "sentiments"),
 ("travail|carriere|emploi|entreprise|cv|entretien|etude|apprentissage",
                                             "travail-etudes"),
 ("societe|actualite|economie|politique|institution",
                                             "societe-actualite"),
 ("idiome|modismo|redewendung|collocation|registre",
                                             "expressions"),
 ("connecteur|petits mots",                  "mots-outils"),
 # \b devant « verbe » : sans lui, « adverbes » contient « verbes » et un thème
 # d'adverbes allemands finissait classé parmi les verbes.
 ("adjectif|adverbe|nuance|abstraction|decrire", "adjectifs"),
 (r"\bverbe|phrasal",                        "verbes"),
 ("opinion|debat|argumentation|rhetorique|media|technologie|numerique|salutation|politesse",
                                             "communication"),
 ("objet|quotidien|maison|logement",         "maison"),
 ("futur",                                   "societe-actualite"),
]

# --- classe grammaticale : même principe ------------------------------------
REGLES_CLASSE = [
 ("idiome|modismo|redewendung|collocation|registre", "expression"),
 ("connecteur|petits mots",                  "mot-outil"),
 ("adjectif|adverbe|couleur|nuance|abstraction|decrire", "adjectif"),
 (r"\bverbe|phrasal",                        "verbe"),
]


def sansacc(s):
    s = unicodedata.normalize("NFD", s.lower().strip())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def norm(s):
    """Comparaison — identique à norm() de vocab.js (parenthèses retirées)."""
    s = sansacc(s)
    s = re.sub(r"\([^)]*\)", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return re.sub(r"^(le |la |les |l'|un |une |des |se |s')", "", s)


def _applique(regles, theme, defaut):
    t = sansacc(theme or "")
    for motif, valeur in regles:
        if re.search(motif, t):
            return valeur
    return defaut


def categorie(theme):  return _applique(REGLES_CAT, theme, "divers")
def classe(theme):     return _applique(REGLES_CLASSE, theme, "nom")


def extraire(langue, niveau):
    f = os.path.join(BASE, "cours-%s-%s/lexique.html" % (langue, niveau))
    s = open(f, encoding="utf-8").read()
    out, theme = [], None
    pat = (r'<h2>[^—]*—\s*([^<]+)</h2>'
           r'|<tr><td><strong>(.*?)</strong></td><td>(.*?)</td><td>(.*?)</td></tr>')
    for m in re.finditer(pat, s):
        if m.group(1):
            theme = html.unescape(m.group(1)).strip()
            continue
        mot = html.unescape(re.sub(r"<[^>]+>", "", m.group(2))).strip()
        tr  = html.unescape(re.sub(r"<[^>]+>", "", m.group(3))).strip()
        ex  = html.unescape(re.sub(r"<[^>]+>", "", m.group(4))).strip()
        out.append((mot, tr, ex, theme))
    return out


def depuis_lexiques(langue):
    entrees, vus = [], {}
    for niveau in ["a1", "a2", "b1", "b2"]:
        for mot, tr, ex, theme in extraire(langue, niveau):
            poly = "/" in tr
            trads = [t.strip() for t in re.split(r"[,/]", tr) if t.strip()]
            ctx = ex.split("—")[0].strip() if "—" in ex else ex.strip()
            k = norm(mot)
            if k in vus:
                # Fusion : un mot peut être rendu autrement selon le thème.
                # Écraser ou ignorer ferait diverger la banque du lexique.
                e0 = vus[k]
                for t in trads:
                    if t not in e0["traductions"]:
                        e0["traductions"].append(t)
                if poly or len(e0["traductions"]) > 2:
                    e0["polysemique"] = True
                continue
            e = {
                "mot": mot,
                "traductions": trads,
                "niveau": niveau.upper(),
                "categorie": categorie(theme),
                "classe": classe(theme),
                "theme_source": theme,
                "source": "lexique",
            }
            if poly:
                e["polysemique"] = True
            if ctx:
                e["contexte"] = ctx
            entrees.append(e)
            vus[k] = e
    return entrees, vus


def ajouter_extension(langue, entrees, vus):
    """Charge vocab_ext_<langue>.py si présent. Les mots déjà couverts par un
    lexique sont IGNORÉS : le lexique fait toujours foi."""
    try:
        mod = importlib.import_module("vocab_ext_" + CODE[langue])
    except ImportError:
        return 0
    ajoutes = 0
    for mot, trads, niveau, cat, cls in mod.EXT:
        k = norm(mot)
        if k in vus:
            continue
        e = {"mot": mot, "traductions": list(trads), "niveau": niveau,
             "categorie": cat, "classe": cls, "source": "non-verifie"}
        entrees.append(e)
        vus[k] = e
        ajoutes += 1
    return ajoutes


CODE = {"neerlandais": "nl", "anglais": "en", "espagnol": "es", "allemand": "de"}
VAR  = {"neerlandais": "VOCAB_NEERLANDAIS", "anglais": "VOCAB_ANGLAIS",
        "espagnol": "VOCAB_ESPAGNOL", "allemand": "VOCAB_ALLEMAND"}


def ecrire(langue, entrees):
    var = VAR[langue]
    p = os.path.join(BASE, "vocab-data-%s.js" % langue)
    nlex = sum(1 for e in entrees if e["source"] == "lexique")
    tete = (
        "/* Banque de vocabulaire — %s\n"
        "   %d mots : %d repris TELS QUELS des lexique.html du site\n"
        "   (cours-%s-a1..b2) et %d ajoutés pour le volume, marqués\n"
        "   source=\"non-verifie\" et signalés par un ⚠ dans les questions.\n"
        "   Les mots issus des lexiques ne peuvent pas diverger du cours :\n"
        "   _verify_vocab.js confronte les deux à chaque mise à jour.\n"
        "   Généré par _outils/vocabulaire/vocabgen2.py — ne pas éditer à la main. */\n"
        % (var, len(entrees), nlex, langue, len(entrees) - nlex))
    js = tete + "var %s = " % var + json.dumps(entrees, ensure_ascii=False, indent=1) + ";\n"
    js += "if (typeof module !== \"undefined\" && module.exports) module.exports = %s;\n" % var
    js += "if (typeof window !== \"undefined\") window.%s = %s;\n" % (var, var)
    open(p, "w", encoding="utf-8").write(js)
    return p, len(entrees), nlex


if __name__ == "__main__":
    cibles = sys.argv[1:] or list(CODE)
    for langue in cibles:
        entrees, vus = depuis_lexiques(langue)
        n_ext = ajouter_extension(langue, entrees, vus)
        p, total, nlex = ecrire(langue, entrees)
        print("%-12s %4d mots (%d lexique + %d extension) -> %s"
              % (langue, total, nlex, n_ext, os.path.basename(p)))
