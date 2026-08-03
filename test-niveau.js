/* ===========================================================================
 * test-niveau.js — Moteur commun du test de placement (4 langues)
 * ---------------------------------------------------------------------------
 * Ce test mesure l'adéquation avec LES COURS DE CE SITE (leurs syllabus réels),
 * pas un niveau CECRL abstrait. Les paliers A1/A2/B1/B2 nomment les cours,
 * ils ne qualifient pas l'élève.
 *
 * ---------------------------------------------------------------------------
 * L'ESCALIER — un bloc teste si un palier est DÉJÀ acquis
 * ---------------------------------------------------------------------------
 * Bloc = 6 questions : 4 QCM (1 pt) + 2 saisies libres (2 pts) = 8 points.
 * Les 4 QCM ne pèsent que 4 pts : un bloc NE PEUT PAS être réussi par les
 * seuls QCM, et une saisie libre juste est ÉLIMINATOIRE pour monter.
 *
 *   >= 7/8 et >= 1 saisie juste  -> PASS_NET     : on monte d'un palier
 *   == 6/8 et >= 1 saisie juste  -> PASS_JUSTE   : on S'ARRÊTE ici (règle du doute)
 *   sinon                        -> ECHEC        : ce palier est recommandé
 *
 * Départ au bloc A2 (on teste d'abord si l'élève dépasse le débutant).
 * SORTIE RAPIDE : 3 erreurs consécutives dans le PREMIER bloc ET aucune bonne
 * réponse jusque-là -> arrêt immédiat, résultat A1, message chaleureux. Une
 * vraie débutante ne subit pas 18 questions d'échec. La condition « aucune
 * bonne réponse » évite de renvoyer en A1 quelqu'un qui maîtrise A1 mais
 * bute sur A2 : lui ira jusqu'au bloc A1, qui tranchera entre A1 et A2.
 *
 * MAPPING (validé) : le palier recommandé est celui du PREMIER bloc non
 * franchement réussi.
 *
 *   Bloc A2
 *   ├─ 3 erreurs consécutives  -> A1  (sortie rapide, <= 6 questions)
 *   ├─ ECHEC        -> Bloc A1 ─┬─ PASS_NET   -> A2
 *   │                           ├─ PASS_JUSTE -> A1
 *   │                           └─ ECHEC      -> A1
 *   ├─ PASS_JUSTE   -> A2  (stop : consolider)
 *   └─ PASS_NET     -> Bloc B1
 *                     ├─ ECHEC      -> B1
 *                     ├─ PASS_JUSTE -> B1  (stop)
 *                     └─ PASS_NET   -> Bloc B2
 *                                     ├─ ECHEC      -> B2
 *                                     ├─ PASS_JUSTE -> B2
 *                                     └─ PASS_NET   -> B2 + "ce site s'arrête à B2"
 *
 * Longueur : 12 à 18 questions selon le parcours ; <= 6 en sortie rapide.
 * Jamais plus de 18, donc toujours sous le plafond de 25.
 *
 * RÈGLE DU DOUTE : tout cas limite penche vers le BAS. Une réussite « de
 * justesse » stoppe l'ascension au lieu de la poursuivre. Dix jours d'aisance
 * coûtent moins cher qu'un abandon en terre inconnue.
 * =========================================================================== */
(function (global) {
  "use strict";

  var PALIERS = ["A1", "A2", "B1", "B2"];

  /* --- Seuils, en un seul endroit (documentés ci-dessus) --- */
  var TAILLE_BLOC      = 6;   // 4 QCM + 2 saisies libres
  var POINTS_MAX       = 8;   // 4x1 + 2x2
  var SEUIL_PASS_NET   = 7;   // >= 7/8 : on monte
  var SEUIL_PASS_JUSTE = 6;   // == 6/8 : on s'arrête (doute)
  var SAISIES_MIN      = 1;   // au moins 1 saisie libre juste, sinon échec
  var ERREURS_SORTIE   = 3;   // 3 erreurs consécutives dans le 1er bloc

  var RESULTAT = { PASS_NET: "PASS_NET", PASS_JUSTE: "PASS_JUSTE", ECHEC: "ECHEC" };

  /* --- Normalisation des saisies libres : identique au norm() des engines --- */
  function norm(s) {
    return String(s).toLowerCase().trim()
      .replace(/\s+/g, " ")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[.!?;:]+$/g, "");
  }

  /* --- Mélange déterministe des options : même mécanisme que les engines
         du site (seed = énoncé, LCG, index correct recalculé). --- */
  function melangerOptions(ex) {
    var items = ex.opts.map(function (opt, k) { return { text: opt, correct: k === ex.a }; });
    var seed = 0, q = String(ex.q || "");
    for (var s = 0; s < q.length; s++) seed = (seed * 31 + q.charCodeAt(s)) & 0x7fffffff;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = items[i]; items[i] = items[j]; items[j] = t;
    }
    return items;
  }

  /* --- Tirage d'un bloc : 4 QCM + 2 saisies libres pour un palier donné --- */
  function tirerBloc(banque, palier, rand) {
    var pool = (banque.questions || []).filter(function (q) { return q.palier === palier; });
    var qcm = pool.filter(function (q) { return q.type === "qcm"; });
    var lib = pool.filter(function (q) { return q.type === "saisie"; });
    function pioche(src, n) {
      var c = src.slice(), out = [];
      for (var i = 0; i < n && c.length; i++) out.push(c.splice(Math.floor(rand() * c.length), 1)[0]);
      return out;
    }
    // Les saisies libres d'abord : ce sont elles qui portent le poids du bloc.
    return pioche(lib, 2).concat(pioche(qcm, 4));
  }

  /* --- Correction d'une réponse --- */
  function estJuste(q, reponse) {
    if (q.type === "qcm") return reponse === true;
    if (reponse === null || reponse === undefined) return false;
    var r = norm(reponse);
    if (!r) return false;
    return (q.a || []).some(function (bonne) { return norm(bonne) === r; });
  }

  /* --- Évaluation d'un bloc terminé --- */
  function evaluerBloc(questions, reponses) {
    var pts = 0, saisiesJustes = 0;
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i], ok = estJuste(q, reponses[i]);
      if (!ok) continue;
      if (q.type === "saisie") { pts += 2; saisiesJustes++; } else { pts += 1; }
    }
    var res;
    if (saisiesJustes < SAISIES_MIN)        res = RESULTAT.ECHEC;
    else if (pts >= SEUIL_PASS_NET)         res = RESULTAT.PASS_NET;
    else if (pts >= SEUIL_PASS_JUSTE)       res = RESULTAT.PASS_JUSTE;
    else                                    res = RESULTAT.ECHEC;
    return { points: pts, max: POINTS_MAX, saisiesJustes: saisiesJustes, resultat: res };
  }

  /* =========================================================================
   * La machine d'état du test. Utilisable SANS DOM (donc testable en CI).
   * ========================================================================= */
  function creerSession(banque, options) {
    options = options || {};
    var rand = options.rand || Math.random;

    var etat = {
      palierCourant: "A2",     // on démarre au-dessus du débutant
      questions: [],           // questions du bloc en cours
      reponses: [],            // réponses du bloc en cours
      index: 0,                // position dans le bloc
      premierBloc: true,
      erreursConsecutives: 0,
      aUneBonneReponse: false, // sert de garde-fou à la sortie rapide
      totalPosees: 0,
      termine: false,
      resultat: null,          // { palier, sortieRapide, plafond, blocs: [...] }
      historique: []
    };

    etat.questions = tirerBloc(banque, "A2", rand);

    function questionCourante() {
      return etat.termine ? null : etat.questions[etat.index];
    }

    function finir(palier, opts) {
      opts = opts || {};
      etat.termine = true;
      etat.resultat = {
        palier: palier,
        sortieRapide: !!opts.sortieRapide,
        plafond: !!opts.plafond,           // a tout réussi : le site s'arrête à B2
        questionsPosees: etat.totalPosees,
        blocs: etat.historique.slice()
      };
      return etat.resultat;
    }

    /* Enchaînement des blocs — c'est ici que vit le mapping documenté en tête. */
    function blocTermine() {
      var ev = evaluerBloc(etat.questions, etat.reponses);
      etat.historique.push({ palier: etat.palierCourant, points: ev.points, resultat: ev.resultat });
      var p = etat.palierCourant, r = ev.resultat;

      if (p === "A2") {
        if (r === RESULTAT.ECHEC) return ouvrirBloc("A1");     // on redescend vérifier A1
        if (r === RESULTAT.PASS_JUSTE) return finir("A2");     // doute -> on s'arrête
        return ouvrirBloc("B1");                               // A2 acquis -> on teste B1
      }
      if (p === "A1") {
        if (r === RESULTAT.PASS_NET) return finir("A2");       // A1 acquis, A2 non -> entrée A2
        return finir("A1");                                    // doute ou échec -> A1
      }
      if (p === "B1") {
        if (r === RESULTAT.PASS_NET) return ouvrirBloc("B2");  // B1 acquis -> on teste B2
        return finir("B1");                                    // échec ou justesse -> B1
      }
      // p === "B2"
      if (r === RESULTAT.PASS_NET) return finir("B2", { plafond: true });
      return finir("B2");
    }

    function ouvrirBloc(palier) {
      etat.palierCourant = palier;
      etat.questions = tirerBloc(banque, palier, rand);
      etat.reponses = [];
      etat.index = 0;
      etat.premierBloc = false;
      return null;
    }

    /* Enregistre une réponse et avance. Retourne le résultat final ou null. */
    function repondre(reponse) {
      if (etat.termine) return etat.resultat;
      var q = etat.questions[etat.index];
      var ok = estJuste(q, reponse);
      etat.reponses.push(reponse);
      etat.index++;
      etat.totalPosees++;

      if (ok) etat.aUneBonneReponse = true;

      // Sortie rapide anti-découragement : uniquement dans le premier bloc, ET
      // uniquement si l'élève n'a RIEN réussi jusque-là. C'est la signature de la
      // vraie débutante. Quelqu'un qui a déjà trouvé une réponse n'est pas dans ce
      // cas : on le laisse aller jusqu'au bloc A1, qui décidera entre A1 et A2.
      if (etat.premierBloc && !etat.aUneBonneReponse) {
        etat.erreursConsecutives = ok ? 0 : etat.erreursConsecutives + 1;
        if (etat.erreursConsecutives >= ERREURS_SORTIE) {
          etat.historique.push({ palier: etat.palierCourant, points: null, resultat: "SORTIE_RAPIDE" });
          return finir("A1", { sortieRapide: true });
        }
      }

      if (etat.index >= etat.questions.length) return blocTermine();
      return null;
    }

    return {
      etat: etat,
      questionCourante: questionCourante,
      repondre: repondre,
      estTermine: function () { return etat.termine; },
      resultat: function () { return etat.resultat; }
    };
  }

  /* --- Mémorisation : clé additive placement-<langue>, rien d'existant touché --- */
  function cleMemoire(langue) { return "placement-" + langue; }

  function memoriser(langue, palier) {
    try {
      var d = new Date();
      localStorage.setItem(cleMemoire(langue), JSON.stringify({
        palier: palier,
        date: d.toISOString().slice(0, 10)
      }));
    } catch (e) {}
  }

  function lireMemoire(langue) {
    try {
      var v = localStorage.getItem(cleMemoire(langue));
      if (!v) return null;
      var o = JSON.parse(v);
      return (o && o.palier) ? o : null;
    } catch (e) { return null; }
  }

  function dateFr(iso) {
    if (!iso || iso.length < 10) return "";
    return iso.slice(8, 10) + "/" + iso.slice(5, 7);
  }

  var API = {
    PALIERS: PALIERS,
    RESULTAT: RESULTAT,
    SEUILS: {
      tailleBloc: TAILLE_BLOC, pointsMax: POINTS_MAX,
      passNet: SEUIL_PASS_NET, passJuste: SEUIL_PASS_JUSTE,
      saisiesMin: SAISIES_MIN, erreursSortie: ERREURS_SORTIE
    },
    norm: norm,
    melangerOptions: melangerOptions,
    estJuste: estJuste,
    evaluerBloc: evaluerBloc,
    creerSession: creerSession,
    memoriser: memoriser,
    lireMemoire: lireMemoire,
    dateFr: dateFr
  };

  /* --- Rendu navigateur (ignoré en CI : pas de document sous Node) --- */
  if (typeof document !== "undefined") {
    API.monter = function (conteneurId, banque, langue, libelleLangue) {
      var root = document.getElementById(conteneurId);
      if (!root) return;
      var session = null;

      function el(tag, cls, html) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html !== undefined) e.innerHTML = html;
        return e;
      }

      function ecranAccueil() {
        root.innerHTML = "";
        var memo = lireMemoire(langue);
        if (memo) {
          var rappel = el("div", "tn-memo");
          rappel.innerHTML = "<strong>Ton point de départ conseillé : " + memo.palier +
            "</strong> <span class=\"tn-date\">(test du " + dateFr(memo.date) + ")</span>";
          root.appendChild(rappel);
        }
        var btn = el("button", "tn-btn", memo ? "↻ Refaire le test" : "Commencer le test");
        btn.addEventListener("click", demarrer);
        root.appendChild(btn);
      }

      function demarrer() {
        session = creerSession(banque);
        afficherQuestion();
      }

      function afficherQuestion() {
        root.innerHTML = "";
        var q = session.questionCourante();
        if (!q) return afficherResultat();

        var prog = el("div", "tn-prog", "Question " + (session.etat.totalPosees + 1));
        root.appendChild(prog);
        root.appendChild(el("div", "tn-q", q.q));

        var valider;
        if (q.type === "qcm") {
          var items = melangerOptions(q);
          var boite = el("div", "tn-opts");
          items.forEach(function (it, k) {
            var lab = el("label", "tn-opt");
            lab.innerHTML = '<input type="radio" name="tnopt" value="' + k + '"> ' + it.text;
            boite.appendChild(lab);
          });
          root.appendChild(boite);
          valider = function () {
            var c = boite.querySelector('input[name="tnopt"]:checked');
            if (c === null) return undefined;
            return !!items[parseInt(c.value, 10)].correct;
          };
        } else {
          var inp = document.createElement("input");
          inp.type = "text";
          inp.className = "tn-input";
          inp.placeholder = q.ph || "ta réponse…";
          inp.autocomplete = "off";
          root.appendChild(inp);
          inp.focus();
          inp.addEventListener("keydown", function (ev) { if (ev.key === "Enter") suivant(); });
          valider = function () { return inp.value; };
        }

        var btn = el("button", "tn-btn", "Valider");
        btn.addEventListener("click", suivant);
        root.appendChild(btn);

        function suivant() {
          var v = valider();
          if (v === undefined) return;            // QCM sans choix : on attend
          var fini = session.repondre(v);
          if (fini) afficherResultat(); else afficherQuestion();
        }
      }

      function afficherResultat() {
        var r = session.resultat();
        memoriser(langue, r.palier);
        root.innerHTML = "";

        var titre = el("div", "tn-res-titre");
        if (r.sortieRapide) {
          titre.innerHTML = "Ton point de départ : <strong>" + r.palier + "</strong>";
          root.appendChild(titre);
          root.appendChild(el("p", "tn-chaleur",
            "C'est parfait — <strong>tout le monde commence quelque part</strong>. Le palier A1 est fait " +
            "exactement pour ça : il part de l'alphabet et des premiers mots, sans rien supposer connu. " +
            "Tu n'as rien raté, tu es simplement au bon endroit pour démarrer."));
        } else {
          titre.innerHTML = "Ton point de départ conseillé : <strong>" + r.palier + "</strong>";
          root.appendChild(titre);
          if (r.plafond) {
            root.appendChild(el("p", "tn-chaleur",
              "Tu as réussi tous les blocs, y compris le plus avancé. <strong>Ce site s'arrête à B2</strong> : " +
              "commence donc par B2, qui reste le palier le plus exigeant proposé ici."));
          }
        }

        root.appendChild(el("p", "tn-souplesse",
          "Si les 10 premiers jours te semblent faciles, c'est normal — <strong>tiens jusqu'au jour 12</strong> " +
          "avant de conclure que le palier est trop simple : c'est là que la grammaire nouvelle arrive."));

        var lien = el("a", "tn-cta", "Ouvrir le cours " + libelleLangue + " " + r.palier + " →");
        lien.href = "cours-" + langue + "-" + r.palier.toLowerCase() + "/index.html";
        root.appendChild(lien);

        root.appendChild(el("div", "tn-avert",
          "<strong>Ce test est une boussole, pas un diplôme :</strong> il évalue la lecture et la grammaire " +
          "sur le contenu de ces cours ; il ne mesure ni l'oral ni l'expression. En cas d'hésitation, " +
          "commence au palier en dessous."));

        var refaire = el("button", "tn-btn tn-btn-sec", "↻ Refaire le test");
        refaire.addEventListener("click", demarrer);
        root.appendChild(refaire);
      }

      ecranAccueil();
    };
  }

  if (typeof module !== "undefined" && module.exports) module.exports = API;
  global.TestNiveau = API;
})(typeof window !== "undefined" ? window : globalThis);
