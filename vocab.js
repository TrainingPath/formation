/* ===========================================================================
 * vocab.js — Moteur unique de l'onglet Vocabulaire (4 langues).
 * Jamais quatre copies : chaque page charge ce fichier + sa banque.
 *
 * PRINCIPE : les QCM sont GÉNÉRÉS depuis la banque, jamais écrits à la main.
 * Les distracteurs sont tirés de la même catégorie et de la même classe, en
 * excluant MÉCANIQUEMENT toute traduction valide du mot visé, ses `pieges`,
 * et tout doublon — dans les deux sens d'interrogation.
 * =========================================================================== */
(function (global) {
  "use strict";

  /* =========================================================================
   * OÙ SIGNALER UNE TRADUCTION DOUTEUSE
   * L'URL du formulaire ne se configure PAS ici : elle vit dans signalement.js,
   * qui sert aussi les 82 sommaires de cours. Un seul endroit à remplir pour
   * tout le site — sinon on finit avec un canal actif d'un côté et mort de
   * l'autre. Tant qu'il n'est pas configuré, aucun lien n'est affiché.
   * ========================================================================= */
  function signalement() {
    if (global && global.Signalement) return global.Signalement;
    if (typeof require === "function") {
      try { return require("./signalement.js"); } catch (e) { return null; }
    }
    return null;
  }

  /* Familles de synonymes français (vocab-synonymes.js). Facultatif : si le
     fichier n'est pas chargé, le moteur retombe sur l'exclusion exacte seule.
     On ne fait jamais planter une page de révision pour un fichier manquant.
     Résolu à l'usage, pas au chargement : l'ordre des <script> dans la page
     n'a ainsi aucune importance. */
  function synonymes() {
    if (global && global.VocabSynonymes) return global.VocabSynonymes;
    if (typeof require === "function") {
      try { return require("./vocab-synonymes.js"); } catch (e) { return null; }
    }
    return null;
  }

  /* ---------- normalisation (même esprit que les engines du site) ----------
   * Les parenthèses sont RETIRÉES avant comparaison : les lexiques écrivent
   * « bonjour (le matin) » et « bonjour, salut ». Sans ce retrait, le moteur
   * croirait à deux réponses différentes et proposerait les deux dans la même
   * question — un QCM sans bonne réponse unique. */
  function norm(s) {
    return String(s).toLowerCase().trim()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/\([^)]*\)/g, " ")
      .replace(/\s+/g, " ").trim()
      .replace(/^(le |la |les |l'|un |une |des |se |s')/, "");
  }

  /* ---------- mélange déterministe, mécanisme standard du site ---------- */
  function melanger(options, graine) {
    var items = options.slice();
    var seed = 0, q = String(graine || "");
    for (var s = 0; s < q.length; s++) seed = (seed * 31 + q.charCodeAt(s)) & 0x7fffffff;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = items[i]; items[i] = items[j]; items[j] = t;
    }
    return items;
  }

  /* =========================================================================
   * LEITNER — trois boîtes, pas un clone d'Anki.
   *   boîte 1 = à revoir vite · boîte 2 = en cours · boîte 3 = acquis
   *   un mot raté redescend en boîte 1 ; un mot réussi monte d'une boîte.
   *   Les sessions « révision » servent d'abord les boîtes basses.
   * ========================================================================= */
  var Leitner = {
    init: function () { return {}; },
    boite: function (etat, mot) { return etat[mot] || 1; },
    repondre: function (etat, mot, juste) {
      var e = {};
      for (var k in etat) e[k] = etat[k];
      var b = e[mot] || 1;
      e[mot] = juste ? Math.min(3, b + 1) : 1;   // raté -> retour en boîte 1
      return e;
    },
    acquis: function (etat) {
      var n = 0;
      for (var k in etat) if (etat[k] >= 3) n++;
      return n;
    },
    // Répartition des mots dans les trois boîtes, pour un compteur parlant.
    // Les mots jamais vus comptent dans « à revoir » : c'est leur boîte de départ.
    repartition: function (etat, total) {
      var b2 = 0, b3 = 0;
      for (var k in etat) { if (etat[k] === 2) b2++; else if (etat[k] >= 3) b3++; }
      return { aRevoir: Math.max(0, total - b2 - b3), enCours: b2, acquis: b3 };
    },
    // ordonne des mots : boîtes basses d'abord (la révision sert le fragile)
    prioriser: function (etat, mots) {
      var self = this;
      return mots.slice().sort(function (a, b) {
        var da = self.boite(etat, a), db = self.boite(etat, b);
        if (da !== db) return da - db;
        return String(a).localeCompare(String(b));
      });
    },
    charger: function (langue) {
      try { return JSON.parse(localStorage.getItem("vocab-" + langue + "-boxes") || "{}") || {}; }
      catch (e) { return {}; }
    },
    sauver: function (langue, etat) {
      try { localStorage.setItem("vocab-" + langue + "-boxes", JSON.stringify(etat)); } catch (e) {}
    }
  };

  /* =========================================================================
   * Génération d'une question
   * sens : "reconnaissance" (langue -> FR) ou "rappel" (FR -> langue)
   * ========================================================================= */
  /* `retournerVivier` : le vérificateur a besoin de voir TOUS les distracteurs
     que le moteur juge admissibles, pas seulement les trois tirés au sort.
     Sans cela, un contrôle de non-ambiguïté passerait par chance — un distracteur
     dangereux resterait éligible sans jamais tomber dans l'échantillon.
     Ce paramètre n'est jamais utilisé par les pages. */
  function construireQuestion(cible, banque, sens, retournerVivier) {
    var miennes = {}, i;
    for (i = 0; i < cible.traductions.length; i++) miennes[norm(cible.traductions[i])] = 1;
    for (i = 0; i < (cible.pieges || []).length; i++) miennes[norm(cible.pieges[i])] = 1;

    // vivier : même catégorie ET même classe ; élargi à la catégorie seule si trop maigre
    var Syn = synonymes();
    var toutesMiennes = cible.traductions.concat(cible.pieges || []);
    function vivier(strict) {
      return banque.filter(function (o) {
        if (o.mot === cible.mot) return false;
        if (o.categorie !== cible.categorie) return false;
        if (strict && o.classe !== cible.classe) return false;
        // EXCLUSION MÉCANIQUE 1 : un distracteur ne doit jamais être une réponse valide
        for (var k = 0; k < o.traductions.length; k++) {
          if (miennes[norm(o.traductions[k])]) return false;
        }
        if (miennes[norm(o.mot)]) return false;
        // EXCLUSION MÉCANIQUE 2 : ni une réponse SYNONYME. « salaire » et
        // « paie » sont deux chaînes différentes mais une seule bonne réponse.
        if (Syn && Syn.entreesInterchangeables(toutesMiennes, o.traductions)) return false;
        return true;
      });
    }
    if (retournerVivier) {                 // utilisé par _verify_vocab.js
      var large = vivier(true);
      return large.length >= 3 ? large : vivier(false);
    }
    var pool = vivier(true);
    if (pool.length < 3) pool = vivier(false);
    if (pool.length < 3) return null;      // pas de question plutôt qu'une mauvaise

    var choisis = melanger(pool, cible.mot).slice(0, 3);
    var bonne, opts = [];
    if (sens === "rappel") {               // FR -> langue
      bonne = cible.mot;
      opts = choisis.map(function (o) { return o.mot; });
    } else {                               // langue -> FR
      bonne = cible.traductions[0];
      opts = choisis.map(function (o) { return o.traductions[0]; });
    }
    // dédoublonnage final de sécurité
    var vus = {}; vus[norm(bonne)] = 1;
    var finales = [bonne];
    for (i = 0; i < opts.length; i++) {
      var n = norm(opts[i]);
      if (!vus[n]) { vus[n] = 1; finales.push(opts[i]); }
    }
    if (finales.length < 4) return null;

    var items = melanger(finales.map(function (t, k) { return { texte: t, correct: k === 0 }; }),
                         cible.mot + sens);
    return {
      mot: cible.mot,
      sens: sens,
      enonce: sens === "rappel"
        ? "Comment dit-on « " + cible.traductions[0] + " » ?"
        : "Que signifie « " + cible.mot + " » ?",
      contexte: cible.contexte || null,
      options: items,
      entree: cible
    };
  }

  /* --------- construction d'une session de 20 --------- */
  function construireSession(banque, opts) {
    opts = opts || {};
    var etat = opts.etat || {};
    var filtres = banque.filter(function (e) {
      if (opts.niveau && opts.niveau !== "tous" && e.niveau !== opts.niveau) return false;
      if (opts.categorie && opts.categorie !== "toutes" && e.categorie !== opts.categorie) return false;
      return true;
    });
    if (opts.seulementErreurs && opts.erreurs && opts.erreurs.length) {
      var set = {}; opts.erreurs.forEach(function (m) { set[m] = 1; });
      filtres = filtres.filter(function (e) { return set[e.mot]; });
    }
    // priorité aux boîtes basses (révision), puis mélange
    var mots = Leitner.prioriser(etat, filtres.map(function (e) { return e.mot; }));
    var index = {}; filtres.forEach(function (e) { index[e.mot] = e; });

    var questions = [], i = 0;
    while (questions.length < 20 && i < mots.length) {
      var e = index[mots[i++]];
      var sens = opts.sens === "melange"
        ? (questions.length % 2 === 0 ? "reconnaissance" : "rappel")
        : (opts.sens || "reconnaissance");
      var q = construireQuestion(e, banque, sens);
      if (q) questions.push(q);
    }
    return questions;
  }

  var API = {
    norm: norm, melanger: melanger, Leitner: Leitner,
    construireQuestion: construireQuestion, construireSession: construireSession,
    // Vivier complet des distracteurs admissibles pour un mot — exposé pour
    // que _verify_vocab.js contrôle l'exclusion elle-même, pas son résultat
    // au hasard du tirage.
    vivierPour: function (cible, banque) { return construireQuestion(cible, banque, "reconnaissance", true); }
  };

  /* ---------------------------- rendu navigateur ---------------------------- */
  if (typeof document !== "undefined") {
    API.monter = function (conteneurId, banque, langue, libelle) {
      var root = document.getElementById(conteneurId);
      if (!root) return;
      var etat = Leitner.charger(langue);
      var session = null, pos = 0, score = 0, erreurs = [];

      function compteur() {
        var r = Leitner.repartition(etat, banque.length);
        return "<div class=\"vc-boites\">" +
          "<span class=\"vc-b1\">" + r.aRevoir + "<small>à revoir</small></span>" +
          "<span class=\"vc-b2\">" + r.enCours + "<small>en cours</small></span>" +
          "<span class=\"vc-b3\">" + r.acquis + "<small>acquis</small></span>" +
          "</div><div class=\"vc-expl\">Un mot devient <strong>acquis</strong> après " +
          "<strong>deux bonnes réponses d'affilée</strong> ; une erreur le renvoie à revoir. " +
          "Il n'est posé qu'une fois par session : reviens demain pour le faire monter.</div>";
      }

      function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h !== undefined) e.innerHTML = h; return e; }
      function uniq(f) { var s = {}; banque.forEach(function (e) { s[f(e)] = 1; }); return Object.keys(s).sort(); }

      function accueil() {
        root.innerHTML = "";
        var nLex = banque.filter(function (e) { return e.source === "lexique"; }).length;
        var nAdd = banque.length - nLex;

        var head = el("div", "vc-head");
        head.innerHTML = "<strong>" + banque.length + " mots</strong> — le socle A1-B2, du plus " +
          "courant au plus nuancé.";
        root.appendChild(head);

        root.appendChild(el("div", "vc-acq", compteur()));

        var f = el("div", "vc-filtres");
        f.appendChild(champ("niveau", "Niveau", ["tous"].concat(uniq(function (e) { return e.niveau; }))));
        f.appendChild(champ("categorie", "Catégorie", ["toutes"].concat(uniq(function (e) { return e.categorie; }))));
        var s = el("label", "vc-champ", "<span>Sens</span>");
        var sel = document.createElement("select"); sel.id = "vc-sens";
        [["reconnaissance", "Reconnaissance : " + libelle + " → français"],
         ["rappel", "Rappel : français → " + libelle + " (niveau supérieur)"],
         ["melange", "Mélange des deux"]].forEach(function (o) {
          var op = document.createElement("option"); op.value = o[0]; op.textContent = o[1]; sel.appendChild(op);
        });
        s.appendChild(sel); f.appendChild(s);
        root.appendChild(f);

        root.appendChild(el("p", "vc-note",
          "La <strong>reconnaissance</strong> vient d'abord : comprendre un mot qu'on lit est plus facile que " +
          "le retrouver de mémoire. Le <strong>rappel</strong> est le mode du niveau supérieur — passe-y quand " +
          "la reconnaissance devient facile."));

        var b = el("button", "vc-btn", "Commencer une session de 20");
        b.addEventListener("click", function () { demarrer(false); });
        root.appendChild(b);

        if (erreurs.length) {
          var r = el("button", "vc-btn vc-sec", "↻ Rejouer mes " + erreurs.length + " erreur(s)");
          r.addEventListener("click", function () { demarrer(true); });
          root.appendChild(r);
        }
        var Sig = signalement();
        if (Sig && Sig.configure()) {
          root.appendChild(el("p", "vc-signal",
            Sig.lien("vocabulaire-" + langue, "⚠️ Signaler une traduction douteuse")));
        }
      }

      function champ(id, lbl, vals) {
        var l = el("label", "vc-champ", "<span>" + lbl + "</span>");
        var s = document.createElement("select"); s.id = "vc-" + id;
        vals.forEach(function (v) { var o = document.createElement("option"); o.value = v; o.textContent = v; s.appendChild(o); });
        l.appendChild(s); return l;
      }

      function val(id, def) { var e = document.getElementById("vc-" + id); return e ? e.value : def; }

      function demarrer(seulementErreurs) {
        session = construireSession(banque, {
          etat: etat,
          niveau: val("niveau", "tous"),
          categorie: val("categorie", "toutes"),
          sens: val("sens", "reconnaissance"),
          seulementErreurs: seulementErreurs,
          erreurs: erreurs
        });
        pos = 0; score = 0; if (!seulementErreurs) erreurs = [];
        if (!session.length) { alert("Aucun mot ne correspond à ces filtres."); return; }
        question();
      }

      function question() {
        if (pos >= session.length) return bilan();
        var q = session[pos];
        root.innerHTML = "";
        root.appendChild(el("div", "vc-prog", "Question " + (pos + 1) + " / " + session.length +
          " · score " + score));
        // Plus de repère ⚠ : les mots d'extension sont passés un par un par
        // revue_extension.py, qui supprime tout ce qui n'est pas d'une évidence
        // absolue au lieu de le signaler. Un marqueur sur chaque question
        // n'apprenait rien à l'élève et rendait la lecture pénible.
        root.appendChild(el("div", "vc-q", q.enonce));
        if (q.contexte) root.appendChild(el("div", "vc-ctx", q.contexte));

        var box = el("div", "vc-opts");
        q.options.forEach(function (o) {
          var b = el("button", "vc-opt", o.texte);
          b.addEventListener("click", function () { repondre(q, o, b); });
          box.appendChild(b);
        });
        root.appendChild(box);
      }

      function repondre(q, choix, bouton) {
        var juste = !!choix.correct;
        if (juste) { score++; bouton.classList.add("ok"); }
        else { bouton.classList.add("ko"); erreurs.push(q.mot); }
        etat = Leitner.repondre(etat, q.mot, juste);
        Leitner.sauver(langue, etat);
        Array.prototype.forEach.call(root.querySelectorAll(".vc-opt"), function (b) { b.disabled = true; });
        if (!juste) {
          var bonne = q.options.filter(function (o) { return o.correct; })[0];
          root.appendChild(el("div", "vc-corr", "Réponse : <strong>" + bonne.texte + "</strong>"));
        }
        setTimeout(function () { pos++; question(); }, juste ? 450 : 1300);
      }

      function bilan() {
        root.innerHTML = "";
        root.appendChild(el("div", "vc-res", "Session terminée : <strong>" + score + " / " + session.length + "</strong>"));
        root.appendChild(el("div", "vc-acq", compteur()));
        if (erreurs.length) root.appendChild(el("p", "vc-note", "Tes erreurs sont retenues : elles reviendront en priorité."));
        var b = el("button", "vc-btn", "Nouvelle session");
        b.addEventListener("click", accueil); root.appendChild(b);
        if (erreurs.length) {
          var r = el("button", "vc-btn vc-sec", "↻ Rejouer mes erreurs");
          r.addEventListener("click", function () { demarrer(true); }); root.appendChild(r);
        }
      }

      accueil();
    };
  }

  if (typeof module !== "undefined" && module.exports) module.exports = API;
  global.Vocab = API;
})(typeof window !== "undefined" ? window : globalThis);
