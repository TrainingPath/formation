# -*- coding: utf-8 -*-
"""Revue mot à mot des extensions de vocabulaire — août 2026.

CE QUE CETTE REVUE EST, ET CE QU'ELLE N'EST PAS
-----------------------------------------------
Les mots des extensions (vocab_ext_*.py) n'ont été confrontés à AUCUNE source
externe : l'environnement de génération n'a accès ni à PyPI (403), ni à apt,
ni au web. La revue ci-dessous est donc une relecture par le même auteur que
les listes, pas une vérification indépendante.

Elle n'a pas pour but de « confirmer » les mots gardés. Elle a pour but
d'ÉLIMINER tout ce qui n'est pas d'une évidence absolue, pour que ce qui reste
soit du vocabulaire élémentaire et concret où se tromper reviendrait à ignorer
que « dog » veut dire chien. Le doute n'est pas signalé : il est supprimé.

TROIS MOTIFS DE SUPPRESSION
  1. POLYSÉMIE SOURCE — le mot a deux sens courants dans sa langue, et le QCM
     ne sait pas afficher « ça dépend ».
  2. GLOSE AMBIGUË — la traduction française peut se comprendre de deux façons.
  3. VARIANTE RÉGIONALE / DE REGISTRE — le mot ne veut pas dire la même chose
     partout. Ce motif pèse lourd ici : l'élève est en Belgique.

Chaque suppression porte son motif. Chaque correction aussi. C'est ce fichier
qu'il faut relire pour contester la revue, pas les banques générées.
"""

# ---------------------------------------------------------------------------
# Mots retirés : { langue: { mot: "motif" } }
# ---------------------------------------------------------------------------
SUPPRIMES = {
"nl": {
  "de dochter":  "GLOSE — « la fille » se comprend aussi comme « jeune fille » ; le sens visé est l'enfant de quelqu'un.",
  "de neef":     "POLYSÉMIE — neef = cousin ET neveu.",
  "de nicht":    "POLYSÉMIE — nicht = cousine ET nièce.",
  "de man":      "POLYSÉMIE — man = homme ET mari.",
  "de vrouw":    "POLYSÉMIE — vrouw = femme ET épouse.",
  "het fruit":   "POLYSÉMIE — fruit est collectif en néerlandais (les fruits) ; un fruit se dit « de vrucht ».",
  "het bad":     "POLYSÉMIE — bad = le bain ET la baignoire.",
  "het onderzoek": "POLYSÉMIE — onderzoek = recherche, enquête, examen médical.",
  "het hemd":    "REGISTRE — hemd désigne plutôt le maillot de corps ; la chemise est « het overhemd ».",
  "de lucht":    "POLYSÉMIE — lucht = air, ciel ET odeur.",
  "lopen":       "RÉGIONAL — lopen = marcher aux Pays-Bas, mais couramment COURIR en Belgique.",
  "schoon":      "RÉGIONAL — schoon = propre aux Pays-Bas, mais BEAU en Flandre.",
},
"en": {
  "shower":   "POLYSÉMIE — shower = la douche avant d'être une averse ; le sens premier n'est pas celui donné.",
  "boot":     "POLYSÉMIE — boot = la botte ET le coffre d'une voiture (anglais britannique).",
  "light":    "POLYSÉMIE — light = léger ET clair/lumineux.",
  "pavement": "RÉGIONAL — pavement = le trottoir au Royaume-Uni, mais la CHAUSSÉE aux États-Unis.",
  "wage":     "DOUBLON — le lexique enseigne déjà salary et wages ; un troisième mot pour « salaire » n'apprend rien.",
  "to carry": "GLOSE — « porter » recouvre aussi to wear ; l'élève ne peut pas trancher.",
  "fare":     "GLOSE — « tarif » est plus large que fare, qui désigne le seul prix du transport.",
},
"es": {
  "la comida":          "POLYSÉMIE — comida = la nourriture, le repas, et le DÉJEUNER en Espagne.",
  "el plato":           "POLYSÉMIE — plato = l'assiette ET le plat.",
  "la estación":        "POLYSÉMIE — estación = la gare ET la saison.",
  "la estación del año":"CONSÉQUENCE — retiré avec « la estación » : la périphrase n'a plus lieu d'être seule.",
  "el techo":           "CONTESTÉ — techo désigne le plafond ; le toit se dit « el tejado ».",
  "el piso":            "POLYSÉMIE — piso = l'appartement, l'étage, et le sol en Amérique latine.",
  "el título":          "POLYSÉMIE — título = le titre ET le diplôme.",
  "el anuncio":         "GLOSE — anuncio = l'annonce ; « publicité » est déjà enseigné par le lexique (la publicidad).",
  "tirar":              "POLYSÉMIE — tirar = jeter ET tirer.",
  "esperar":            "POLYSÉMIE — esperar = attendre ET espérer.",
  "llevar":             "POLYSÉMIE — llevar = porter, emmener, amener.",
  "listo":              "POLYSÉMIE — listo = prêt (estar) ET malin (ser).",
  "ya":                 "POLYSÉMIE — ya = déjà, maintenant, désormais, ne… plus, selon la phrase.",
},
"de": {
  "der Erwachsene": "GRAMMAIRE — nom adjectival : la forme change avec le déterminant (ein Erwachsener).",
  "der Boden":      "POLYSÉMIE — Boden = le sol, le fond ET le grenier.",
  "das Schloss":    "POLYSÉMIE — Schloss = le château ET la serrure.",
  "das Viertel":    "POLYSÉMIE — Viertel = le quartier ET le quart.",
  "der Abschluss":  "POLYSÉMIE — Abschluss = la fin, la conclusion, le diplôme.",
  "die Trauer":     "GLOSE — Trauer = le deuil, le chagrin ; la tristesse se dit Traurigkeit.",
  "die Nachricht":  "POLYSÉMIE — Nachricht = le message ET la nouvelle (die Nachrichten = les informations).",
  "leihen":         "POLYSÉMIE — leihen = prêter ET emprunter selon la construction.",
  "tragen":         "POLYSÉMIE — tragen = porter un objet ET porter un vêtement.",
  "schwer":         "POLYSÉMIE — schwer = lourd ET difficile.",
  "leicht":         "POLYSÉMIE — leicht = léger ET facile.",
  "wie":            "POLYSÉMIE — wie = comment ET comme.",
},
}

# ---------------------------------------------------------------------------
# Traductions corrigées : { langue: { mot: (nouvelles_traductions, "motif") } }
# ---------------------------------------------------------------------------
CORRECTIONS = {
"nl": {
  "de keuken":   (["la cuisine (pièce)"],       "keuken = la pièce, pas l'art culinaire."),
  "de hobby":    (["le passe-temps"],           "« le loisir » chevauchait « de vrije tijd » (le temps libre)."),
  "de les":      (["la leçon"],                 "« le cours » désigne aussi un cursus entier."),
  "het kantoor": (["le bureau (lieu de travail)"], "en néerlandais « het bureau » est le meuble ; le français confond les deux."),
  "veilig":      (["sûr (sans danger)"],        "« sûr » se comprend aussi comme « certain »."),
},
"en": {
  "safe": (["sans danger"], "« sûr » se comprend aussi comme « certain »."),
},
"es": {
  "el plazo": (["le délai"],          "plazo = le délai imparti ; « échéance » est la date, pas la durée."),
  "seguro":   (["sûr (sans danger)"], "« sûr » se comprend aussi comme « certain »."),
},
"de": {
  "die Frist": (["le délai"],          "Frist = le délai imparti, pas la date d'échéance."),
  "sicher":    (["sûr (sans danger)"], "« sûr » se comprend aussi comme « certain »."),
  "vorher":    (["auparavant"],        "vorher est un adverbe ; la préposition « avant » se dit vor."),
  "nachher":   (["ensuite"],           "nachher est un adverbe ; la préposition « après » se dit nach."),
},
}


def appliquer(code, ext):
    """Filtre et corrige une liste EXT. Renvoie (liste, nb_supprimés, nb_corrigés)."""
    sup = SUPPRIMES.get(code, {})
    cor = CORRECTIONS.get(code, {})
    sortie, nsup, ncor = [], 0, 0
    for mot, trads, niveau, cat, cls in ext:
        if mot in sup:
            nsup += 1
            continue
        if mot in cor:
            trads = list(cor[mot][0])
            ncor += 1
        sortie.append((mot, trads, niveau, cat, cls))
    # Un mot listé mais absent de EXT signale une faute de frappe dans la revue :
    # on préfère le savoir plutôt que de croire à une suppression qui n'a pas eu lieu.
    connus = {m for m, _, _, _, _ in ext}
    fantomes = [m for m in list(sup) + list(cor) if m not in connus]
    if fantomes:
        raise SystemExit("revue_extension.py [%s] : mot(s) introuvable(s) dans EXT : %s"
                         % (code, ", ".join(fantomes)))
    return sortie, nsup, ncor
