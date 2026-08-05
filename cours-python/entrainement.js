/* ===========================================================================
 * entrainement.js — section « 🏋️ Entraînement du jour ».
 *
 * Trois exercices d'application par leçon, dans le style des chapitres de
 * l'école (voir le contrat C1-C7 dans CHANGELOG-IA.md) : énoncé en prose
 * décrivant un programme complet, principe donné quand il est mathématique,
 * sous-questions a/b/c/d, questions de réflexion, application filée.
 *
 * Le moteur est unique et lit l'objet ENTRAINEMENT déclaré par la leçon.
 * Aucun code n'est dupliqué dans les leçons : elles ne portent que du contenu.
 *
 * CE QUE CE MODULE GARANTIT À L'ÉLÈVE
 *   · Les 5 indices se révèlent UN PAR UN. On ne peut pas tomber par accident
 *     sur le cinquième en cherchant le premier.
 *   · La solution n'est jamais dans le DOM avant d'être demandée : elle est
 *     construite au clic. Une inspection de la page ne la révèle pas.
 *   · La checklist s'affiche AVANT le bouton de solution — c'est elle qui doit
 *     servir en premier.
 *
 * Clés localStorage ajoutées : « entr-<cours>-<jour>-<n> » (réponse en cours)
 * et « entrvu-<cours>-<jour>-<n> » (solution consultée). AUCUNE clé existante
 * n'est lue ni écrite.
 * =========================================================================== */
(function () {
  "use strict";
  if (typeof ENTRAINEMENT === "undefined" || !ENTRAINEMENT.items) return;

  var E = ENTRAINEMENT;
  var LANG = E.lang || "python";
  var NIVEAUX = {
    1: { texte: "Application directe", fond: "#e1f5ee", encre: "#0f6e56" },
    2: { texte: "Combinaison", fond: "#faeeda", encre: "#854f0b" },
    3: { texte: "Application filée", fond: "#f3efff", encre: "#5b3aa8" }
  };

  /* ---------------------------------------------------------------- styles */
  var css = document.createElement("style");
  css.textContent =
    ".entr{border:2px solid var(--accent-soft,#e6ecff);border-radius:14px;padding:2px 20px 18px;margin:26px 0}" +
    ".entr>h2{color:var(--accent,#4c6ef5);border-bottom:2px solid var(--accent-soft,#e6ecff);padding-bottom:8px}" +
    ".entr-intro{color:var(--muted,#5b6478);font-size:.95em;line-height:1.6}" +
    ".ex{border:1px solid #dde3ec;border-radius:12px;padding:14px 18px;margin:16px 0;background:#fff}" +
    ".ex-tete{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin-bottom:6px}" +
    ".ex-num{font-weight:700;color:var(--accent,#4c6ef5)}" +
    ".ex-titre{font-weight:700;font-size:1.08em;color:var(--ink,#1e2533)}" +
    ".ex-niv{font-size:.78em;font-weight:700;padding:3px 10px;border-radius:999px}" +
    ".ex-enonce{line-height:1.7;margin:8px 0}" +
    ".ex-bloc{border-left:4px solid #cdd8ea;background:#f7f9fc;color:#26215c;" +
    "         padding:10px 14px;border-radius:0 10px 10px 0;margin:10px 0;line-height:1.6}" +
    ".ex-bloc.principe{border-left-color:#1d9e75;background:#e9f7f2;color:#0f5f4a}" +
    ".ex-bloc.remarque{border-left-color:#c98a17;background:#fdf4e3;color:#6b4708}" +
    ".ex-bloc.reflexion{border-left-color:#7c3aed;background:#f3efff;color:#3b2a5c}" +
    ".ex-bloc b{display:block;margin-bottom:3px}" +
    ".ex-sq{margin:10px 0 0;padding-left:0;list-style:none}" +
    ".ex-sq li{margin:7px 0;line-height:1.6;display:flex;gap:9px}" +
    ".ex-sq .ref{font-weight:700;color:var(--accent,#4c6ef5);min-width:1.3em}" +
    ".ex-hier{font-size:.9em;margin:8px 0 0}" +
    ".ex-hier a{color:#b3541e;text-decoration:none;font-weight:600}" +
    ".ex-zone{width:100%;min-height:150px;font-family:ui-monospace,Menlo,Consolas,monospace;" +
    "         font-size:.94em;line-height:1.5;padding:11px 13px;border:1px solid #dde3ec;" +
    "         border-radius:10px;margin-top:12px;resize:vertical;box-sizing:border-box}" +
    ".ex-barre{display:flex;gap:9px;flex-wrap:wrap;align-items:center;margin-top:10px}" +
    ".ex-btn{border:0;border-radius:999px;padding:9px 17px;font-weight:700;font-size:.94em;cursor:pointer}" +
    ".ex-btn.run{background:#1a9a5c;color:#fff}" +
    ".ex-btn.ind{background:#eef1f6;color:#334155}" +
    ".ex-btn.sol{background:#334155;color:#fff}" +
    ".ex-btn:disabled{opacity:.5;cursor:default}" +
    ".ex-indices{margin-top:10px}" +
    ".ex-indice{border-left:4px solid #f0c040;background:#fdf8e8;color:#6b4708;" +
    "           padding:9px 13px;border-radius:0 10px 10px 0;margin:7px 0;line-height:1.6}" +
    ".ex-indice b{color:#8a5a06}" +
    ".ex-check{background:#eef3fb;border:1px solid #cdd8ea;border-radius:10px;" +
    "          padding:11px 15px;margin-top:12px;color:#1e2533}" +
    ".ex-check b{display:block;margin-bottom:5px}" +
    ".ex-check ul{margin:0;padding-left:20px;line-height:1.65}" +
    ".ex-sol{margin-top:12px}" +
    ".ex-sol pre{background:#0f172a;color:#e2e8f0;padding:13px 15px;border-radius:10px;" +
    "            overflow-x:auto;font-size:.9em;line-height:1.55;margin:8px 0}" +
    ".ex-sol .rep{border-left:4px solid #1d9e75;background:#e9f7f2;color:#0f5f4a;" +
    "             padding:10px 14px;border-radius:0 10px 10px 0;margin:8px 0;line-height:1.6}" +
    ".ex-out{margin-top:10px;border:1px solid #dde3ec;border-radius:10px;overflow:hidden;display:none}" +
    ".ex-out.show{display:block}" +
    ".ex-out .tete{background:#eef1f6;padding:7px 13px;font-weight:700;font-size:.9em;color:#334155}" +
    ".ex-out pre{margin:0;padding:11px 13px;white-space:pre-wrap;font-size:.9em;line-height:1.5}" +
    ".ex-out pre.err{color:#b91c1c}" +
    ".ex-t{padding:6px 13px;font-size:.9em;border-top:1px solid #eef1f6}" +
    ".ex-t.ok{color:#0f6e56}.ex-t.ko{color:#b91c1c}" +
    ".ex-bilan{padding:8px 13px;font-weight:700}" +
    ".ex-bilan.ok{background:#e1f5ee;color:#0f6e56}" +
    ".ex-bilan.ko{background:#fcebeb;color:#b91c1c}" +
    ".ex-note{font-size:.88em;color:#5b6478;margin-top:9px;line-height:1.6}";
  document.head.appendChild(css);

  /* --------------------------------------------------------------- helpers */
  function el(t, c, h) {
    var e = document.createElement(t);
    if (c) e.className = c;
    if (h !== undefined) e.innerHTML = h;
    return e;
  }
  function cle(prefixe, n) { return prefixe + "-" + E.cours + "-" + E.jour + "-" + n; }
  function lire(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function ecrire(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ------------------------------------------------------------ conteneur */
  var wrap = document.querySelector(".wrap") || document.body;
  var sec = el("section", "entr");
  sec.appendChild(el("h2", null, "🏋️ Entraînement du jour"));
  sec.appendChild(el("p", "entr-intro",
    "Trois exercices pour <strong>appliquer</strong> la théorie d'aujourd'hui, du plus direct au plus " +
    "ouvert. Écris ton programme <strong>à partir de la page blanche</strong> : aucun squelette ne t'est " +
    "donné, c'est le but. Les <strong>5 indices</strong> se dévoilent un par un — prends-les dans l'ordre, " +
    "chacun t'avance d'un cran. Ne regarde la solution qu'après avoir passé la grille de relecture."));

  E.items.forEach(function (x, i) {
    var n = i + 1;
    var box = el("div", "ex");

    /* --- en-tête ------------------------------------------------------- */
    var tete = el("div", "ex-tete");
    tete.appendChild(el("span", "ex-num", x.num));
    tete.appendChild(el("span", "ex-titre", x.titre));
    var niv = NIVEAUX[x.niveau] || NIVEAUX[1];
    var b = el("span", "ex-niv", niv.texte);
    b.style.background = niv.fond; b.style.color = niv.encre;
    tete.appendChild(b);
    box.appendChild(tete);

    /* --- énoncé et encadrés -------------------------------------------- */
    box.appendChild(el("div", "ex-enonce", "<strong>Énoncé.</strong> " + x.enonce));
    if (x.principe) box.appendChild(el("div", "ex-bloc principe", "<b>Principe</b>" + x.principe));
    if (x.remarque) box.appendChild(el("div", "ex-bloc remarque", "<b>Remarque</b>" + x.remarque));

    if (x.sousQuestions && x.sousQuestions.length) {
      var ul = el("ul", "ex-sq");
      x.sousQuestions.forEach(function (sq) {
        var li = document.createElement("li");
        li.appendChild(el("span", "ref", sq.ref + "."));
        li.appendChild(el("span", null, sq.texte));
        ul.appendChild(li);
      });
      box.appendChild(ul);
    }
    if (x.reflexion) box.appendChild(el("div", "ex-bloc reflexion", "<b>À expliquer</b>" + x.reflexion));

    // Application filée : porte de secours pour qui a sauté la veille.
    if (x.hier) {
      box.appendChild(el("p", "ex-hier",
        "↩︎ <a href=\"" + x.hier + "\">Tu n'as pas fait l'exercice filé d'hier ? Pars de sa solution</a>"));
    }

    /* --- zone de réponse ------------------------------------------------ */
    var kRep = cle("entr", n);
    var ta = document.createElement("textarea");
    ta.className = "ex-zone";
    ta.placeholder = E.placeholder || "Écris ton programme ici…";
    ta.value = lire(kRep);
    ta.addEventListener("input", function () { ecrire(kRep, ta.value); });
    ta.addEventListener("keydown", function (ev) {          // Tab = 4 espaces
      if (ev.key !== "Tab") return;
      ev.preventDefault();
      var d = ta.selectionStart, f = ta.selectionEnd;
      ta.value = ta.value.slice(0, d) + "    " + ta.value.slice(f);
      ta.selectionStart = ta.selectionEnd = d + 4;
      ecrire(kRep, ta.value);
    });
    box.appendChild(ta);

    /* --- barre de boutons ----------------------------------------------- */
    var barre = el("div", "ex-barre");
    var out = el("div", "ex-out");

    // ▶ n'existe QUE si l'exercice est réellement exécutable ici. Pour les
    // langages sans interpréteur dans le navigateur, un bouton qui ne fait rien
    // vaudrait moins que pas de bouton du tout.
    var executable = (LANG === "python") && x.tests && x.tests.length &&
                     window.ExoRuntime && window.ExoRuntime.pyodide;
    if (executable) {
      var run = el("button", "ex-btn run", "▶ Exécuter et tester");
      run.addEventListener("click", function () {
        run.disabled = true;
        executer(x, ta.value, out, function () { run.disabled = false; });
      });
      barre.appendChild(run);
    }

    /* --- indices : un par un -------------------------------------------- */
    var zoneInd = el("div", "ex-indices");
    var vus = 0;
    var btnInd = el("button", "ex-btn ind", "💡 Indice 1 / " + x.indices.length);
    btnInd.addEventListener("click", function () {
      if (vus >= x.indices.length) return;
      zoneInd.appendChild(el("div", "ex-indice",
        "<b>Indice " + (vus + 1) + ".</b> " + x.indices[vus]));
      vus++;
      if (vus >= x.indices.length) {
        btnInd.disabled = true;
        btnInd.textContent = "💡 Tous les indices sont donnés";
      } else {
        btnInd.textContent = "💡 Indice " + (vus + 1) + " / " + x.indices.length;
      }
    });
    barre.appendChild(btnInd);
    box.appendChild(barre);
    box.appendChild(out);
    box.appendChild(zoneInd);

    /* --- checklist AVANT la solution ------------------------------------ */
    if (x.checklist && x.checklist.length) {
      var lis = x.checklist.map(function (c) { return "<li>" + c + "</li>"; }).join("");
      box.appendChild(el("div", "ex-check",
        "<b>🔍 Relis-toi avant de regarder la solution</b><ul>" + lis + "</ul>"));
    }

    /* --- solution : construite au clic, jamais avant -------------------- */
    var zoneSol = el("div", "ex-sol");
    var kVu = cle("entrvu", n);
    var btnSol = el("button", "ex-btn sol", "👁 Voir la solution");
    var ouverte = false;
    btnSol.addEventListener("click", function () {
      ouverte = !ouverte;
      if (!ouverte) { zoneSol.innerHTML = ""; btnSol.textContent = "👁 Voir la solution"; return; }
      ecrire(kVu, "1");
      btnSol.textContent = "🙈 Masquer la solution";
      zoneSol.innerHTML = "";
      if (x.solution) {
        var pre = document.createElement("pre");
        pre.textContent = x.solution;          // textContent : jamais d'injection
        zoneSol.appendChild(pre);
      }
      (x.reponses || []).forEach(function (r) {
        zoneSol.appendChild(el("div", "rep", "<strong>" + r.ref + ".</strong> " + r.texte));
      });
      if (x.pourquoi) zoneSol.appendChild(el("div", "rep", "<strong>Pourquoi ainsi.</strong> " + x.pourquoi));
    });
    var barre2 = el("div", "ex-barre");
    barre2.appendChild(btnSol);
    box.appendChild(barre2);
    box.appendChild(zoneSol);

    if (x.note) box.appendChild(el("div", "ex-note", "💡 " + x.note));

    sec.appendChild(box);
  });

  wrap.appendChild(sec);

  /* ------------------------------------------------------- exécution Python */
  function executer(x, code, out, fini) {
    out.className = "ex-out show";
    out.innerHTML = "";
    out.appendChild(el("div", "tete", "Sortie"));
    var pre = document.createElement("pre");
    pre.textContent = "⏳ Démarrage de l'interpréteur Python (la première fois : quelques secondes)…";
    out.appendChild(pre);

    window.ExoRuntime.pyodide().then(function (py) {
      var affiche = "", erreur = null, ns = null;
      try {
        py.runPython("import sys, io\n_o=sys.stdout\n_e=sys.stderr\nsys.stdout=io.StringIO()\nsys.stderr=sys.stdout");
        py.globals.set("__stdin_arr", py.toPy((x.stdin || []).slice()));
        py.runPython(
          "import builtins\n__it=iter(list(__stdin_arr))\ndef __fi(p=''):\n try:\n  print(p,end='')\n" +
          " except Exception:\n  pass\n try:\n  return str(next(__it))\n except StopIteration:\n  return ''\n" +
          "builtins.input=__fi\n");
        ns = py.globals.get("dict")();
        try { py.runPython(code, { globals: ns }); }
        catch (err) { erreur = String(err.message || err); }
        affiche = py.runPython("sys.stdout.getvalue()");
        try { py.runPython("import sys as _s\n__output__=_s.stdout.getvalue()", { globals: ns }); } catch (e) {}
        py.runPython("sys.stdout=_o\nsys.stderr=_e");

        out.innerHTML = "";
        out.appendChild(el("div", "tete", erreur ? "Erreur Python" : "Sortie"));
        var p2 = document.createElement("pre");
        if (erreur) {
          p2.className = "err";
          p2.textContent = (affiche ? affiche + "\n" : "") + window.ExoRuntime.cleanTraceback(erreur);
        } else {
          p2.textContent = affiche !== "" ? affiche
            : "(aucune sortie — pense à print(...) pour afficher un résultat)";
        }
        out.appendChild(p2);

        var tests = x.tests || [];
        if (!tests.length) { fini(); return; }
        if (erreur) {
          out.appendChild(el("div", "ex-bilan ko", "❌ Tests non lancés : corrige d'abord l'erreur ci-dessus."));
          fini(); return;
        }
        var reussis = 0;
        tests.forEach(function (t) {
          var ok = true;
          try { py.runPython(t.code, { globals: ns }); } catch (e) { ok = false; }
          if (ok) reussis++;
          out.appendChild(el("div", "ex-t " + (ok ? "ok" : "ko"), (ok ? "✅ " : "❌ ") + t.label));
        });
        out.appendChild(el("div", "ex-bilan " + (reussis === tests.length ? "ok" : "ko"),
          reussis === tests.length
            ? "✅ " + reussis + " / " + tests.length + " — c'est juste."
            : reussis + " / " + tests.length + " test(s) passé(s). Relis la grille au-dessus."));
      } catch (fatal) {
        out.innerHTML = "";
        out.appendChild(el("div", "tete", "Erreur"));
        var p3 = document.createElement("pre");
        p3.className = "err";
        p3.textContent = String(fatal.message || fatal);
        out.appendChild(p3);
      } finally {
        if (ns && ns.destroy) { try { ns.destroy(); } catch (e) {} }
        fini();
      }
    }).catch(function (err) {
      out.innerHTML = "";
      out.appendChild(el("div", "tete", "Erreur"));
      var p4 = document.createElement("pre");
      p4.className = "err";
      p4.textContent = String(err.message || err);
      out.appendChild(p4);
      fini();
    });
  }
})();
