/* ===== Moteur du cours d'algorithmique — rend la page à partir de l'objet DAY ===== */
(function () {
  "use strict";
  if (typeof DAY === "undefined") { document.body.innerHTML = "<p>Erreur : données du jour manquantes.</p>"; return; }

  var totalQuestions = DAY.exercises.length + (DAY.final ? DAY.final.questions.length : 0);
  var results = {}; // id -> true/false

  /* ---------- utilitaires ---------- */
  function norm(s) {
    return String(s).toLowerCase().trim()
      .replace(/\s+/g, " ")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/,/g, ".");
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  /* ---------- structure de page ---------- */
  var wrap = el("div", "wrap");
  document.body.appendChild(wrap);
  document.title = "Leçon " + DAY.num + " — " + DAY.title;

  var header = el("header", "day-header",
    '<div class="kicker">API REST — l\'API de la Ludothèque · 21 leçons</div>' +
    "<h1>Leçon " + DAY.num + " · " + DAY.title + "</h1>" +
    '<p class="subtitle">' + (DAY.subtitle || "") + "</p>");
  wrap.appendChild(header);

  var nav = el("nav", "daynav");
  var prev = DAY.num > 1 ? '<a href="lecon' + pad(DAY.num - 1) + '.html">← Leçon ' + (DAY.num - 1) + "</a>" : "<span></span>";
  var next = DAY.num < 21 ? '<a href="lecon' + pad(DAY.num + 1) + '.html">Leçon ' + (DAY.num + 1) + " →</a>" : "<span></span>";
  nav.innerHTML = prev + '<a href="index.html">🏠 Sommaire</a>' + next;
  wrap.appendChild(nav);

  var scorebar = el("div", "scorebar",
    '<span class="label">Score du jour</span>' +
    '<div class="track"><div class="fill" id="scorefill"></div></div>' +
    '<span class="pts" id="scorepts">0 / ' + totalQuestions + "</span>" +
    '<button id="resetday" title="Effacer les réponses de la page">Recommencer</button>');
  wrap.appendChild(scorebar);

  var theory = el("section", "card theory", "<h2>📘 Théorie du jour</h2>" + DAY.theory);
  wrap.appendChild(theory);

  var exoSection = el("section", "card", "<h2>✏️ Exercices (" + DAY.exercises.length + ")</h2>" +
    "<p>Réponds à chaque question puis clique sur <strong>Vérifier</strong>. Une explication s'affiche à chaque fois.</p>");
  wrap.appendChild(exoSection);
  DAY.exercises.forEach(function (ex, i) {
    exoSection.appendChild(buildQuestion(ex, "e" + i, "Exercice " + (i + 1)));
  });

  if (DAY.final) {
    var fin = el("section", "card final", "<h2>🏆 " + (DAY.final.title || "Exercice final") + "</h2>" + (DAY.final.intro || ""));
    DAY.final.questions.forEach(function (ex, i) {
      fin.appendChild(buildQuestion(ex, "f" + i, "Partie " + (i + 1)));
    });
    if (DAY.final.solution) {
      var btn = el("button", "reveal", "Afficher la solution modèle complète");
      var sol = el("div", "solution", DAY.final.solution);
      btn.addEventListener("click", function () {
        sol.classList.toggle("show");
        btn.textContent = sol.classList.contains("show") ? "Masquer la solution modèle" : "Afficher la solution modèle complète";
      });
      fin.appendChild(btn);
      fin.appendChild(sol);
    }
    wrap.appendChild(fin);
  }

  wrap.appendChild(el("footer", "pagefoot", "Leçon " + DAY.num + " / 21 — Refais les exercices jusqu'à obtenir un score parfait : c'est la répétition qui crée l'automatisme."));

  /* ---------- équilibrage des longueurs d'options ---------- */
  function balanceOpts(ex) {
    var o = ex.opts, ci = ex.a;
    function vlen(s) { return String(s).replace(/<[^>]+>/g, "").replace(/&[a-zA-Z0-9#]+;/g, "x").length; }
    var out = o.slice();
    if (typeof ci !== "number" || ci < 0 || ci >= out.length) return out;
    var tails = [
      ", ce qui n'est toutefois pas le cas ici",
      ", uniquement dans certains cas très particuliers",
      ", mais cela reste fortement déconseillé en pratique",
      ", surtout pour de très grands volumes de données",
      ", ce qui provoquerait plutôt une erreur à l'exécution",
      ", au prix d'une syntaxe nettement plus lourde",
      ", ce qui mélange en réalité deux notions distinctes",
      ", bien que ce ne soit presque jamais nécessaire",
      ", à condition d'installer une bibliothèque supplémentaire",
      ", ce qui sort largement du cadre de cette leçon",
      ", en contournant le fonctionnement normal prévu",
      ", selon une approche aujourd'hui jugée obsolète",
      ", ce qui ralentirait inutilement le programme",
      ", sauf si la configuration précise le contraire",
      ", une confusion fréquente chez les débutants",
      ", même si le résultat obtenu serait incorrect",
      ", ce qui ne correspond pas à l'objectif recherché",
      ", en supposant à tort que tout est déjà prêt",
      ", ce qui contredit le principe vu dans la leçon",
      ", dans un contexte sans rapport avec la question"
    ];
    var cl = vlen(out[ci]), wi = -1, wl = -1, i;
    for (i = 0; i < out.length; i++) if (i !== ci && vlen(out[i]) > wl) { wl = vlen(out[i]); wi = i; }
    if (wi !== -1 && cl >= wl) {
      var h = 0, q = String(ex.q || out[0] || "");
      for (i = 0; i < q.length; i++) h = (h * 31 + q.charCodeAt(i)) & 0x7fffffff;
      out[wi] = String(out[wi]).replace(/[\s.]+$/, "");
      var g = 0;
      while (vlen(out[wi]) <= cl && g < 6) { out[wi] += tails[(h + g) % tails.length]; g++; }
    }
    return out;
  }

  /* ---------- construction d'une question ---------- */
  function buildQuestion(ex, id, label) {
    var box = el("div", "exo");
    box.appendChild(el("span", "num", label));
    box.appendChild(el("div", "q", ex.q));

    var getAnswer, name = "opt_" + id;

    if (ex.type === "qcm") {
      var _opts = ex.opts.slice();
      // Mélange déterministe des options (seed = énoncé) avec recalcul de l'index correct :
      // la bonne réponse n'est plus jamais à une position fixe, mais l'ordre reste stable
      // d'un rechargement à l'autre pour une même question.
      var _items = _opts.map(function (opt, k) { return { text: opt, correct: k === ex.a }; });
      var _seed = 0, _q = String(ex.q || "");
      for (var _s = 0; _s < _q.length; _s++) _seed = (_seed * 31 + _q.charCodeAt(_s)) & 0x7fffffff;
      function _rnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return _seed / 0x7fffffff; }
      for (var _i = _items.length - 1; _i > 0; _i--) {
        var _j = Math.floor(_rnd() * (_i + 1));
        var _tmp = _items[_i]; _items[_i] = _items[_j]; _items[_j] = _tmp;
      }
      _items.forEach(function (it, k) {
        var lab = el("label", "opt");
        lab.innerHTML = '<input type="radio" name="' + name + '" value="' + k + '"> ' + it.text;
        box.appendChild(lab);
      });
      getAnswer = function () {
        var c = box.querySelector('input[name="' + name + '"]:checked');
        return c === null ? null : !!_items[parseInt(c.value, 10)].correct;
      };
    } else if (ex.type === "vf") {
      ["Vrai", "Faux"].forEach(function (opt, k) {
        var lab = el("label", "opt");
        lab.innerHTML = '<input type="radio" name="' + name + '" value="' + k + '"> ' + opt;
        box.appendChild(lab);
      });
      getAnswer = function () {
        var c = box.querySelector('input[name="' + name + '"]:checked');
        if (c === null) return null;
        return (c.value === "0") === (ex.a === true);
      };
    } else { // input
      var inp = document.createElement("input");
      inp.type = "text";
      inp.placeholder = ex.ph || "Ta réponse…";
      box.appendChild(inp);
      getAnswer = function () {
        if (inp.value.trim() === "") return null;
        var accepted = Array.isArray(ex.a) ? ex.a : [ex.a];
        return accepted.some(function (a) { return norm(a) === norm(inp.value); });
      };
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") check.click(); });
    }

    var check = el("button", "check", "Vérifier");
    var fb = el("div", "feedback");
    box.appendChild(check);
    box.appendChild(fb);

    check.addEventListener("click", function () {
      var ok = getAnswer();
      if (ok === null) {
        fb.className = "feedback show ko";
        fb.innerHTML = "⚠️ Réponds d'abord à la question.";
        return;
      }
      results[id] = ok;
      box.className = ok ? "exo done-ok" : "exo done-ko";
      fb.className = "feedback show " + (ok ? "ok" : "ko");
      fb.innerHTML = (ok ? "✅ Bonne réponse !" : "❌ Ce n'est pas ça.") +
        (ex.exp ? '<div class="exp">' + ex.exp + "</div>" : "");
      updateScore();
    });
    return box;
  }

  /* ---------- score ---------- */
  function updateScore() {
    var pts = 0;
    for (var k in results) if (results[k]) pts++;
    document.getElementById("scorepts").textContent = pts + " / " + totalQuestions;
    document.getElementById("scorefill").style.width = (100 * pts / totalQuestions) + "%";
    try {
      var key = "api21-l" + DAY.num;
      var prev = parseInt(localStorage.getItem(key) || "0", 10);
      if (pts > prev) localStorage.setItem(key, String(pts));
      localStorage.setItem("api21-total-l" + DAY.num, String(totalQuestions));
    } catch (e) { /* stockage indisponible : sans gravité */ }
  }

  document.getElementById("resetday").addEventListener("click", function () {
    if (confirm("Effacer toutes les réponses de la page ?")) location.reload();
  });
})();
