/* ===== Mode examen — révision espacée simple =====
   Tire 10 questions au hasard PARMI les leçons déjà validées (score QCM > 0),
   les pose sans afficher d'explication, puis donne le score et les corrections à la fin.
   100 % statique : les questions sont lues directement dans les fichiers leconNN.html
   via fetch() (même origine → fonctionne sur GitHub Pages). */
(function () {
  "use strict";
  var TOTAL = 30, PREFIX = "enb1-j", NB = 10;
  var root = document.getElementById("exam");

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function norm(s) {
    return String(s).toLowerCase().trim().replace(/\s+/g, " ")
      .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/,/g, ".");
  }
  // mélange déterministe des options d'un QCM (même logique que engine.js)
  function shuffleOpts(ex) {
    var items = ex.opts.map(function (opt, k) { return { text: opt, correct: k === ex.a }; });
    var seed = 0, q = String(ex.q || "");
    for (var s = 0; s < q.length; s++) seed = (seed * 31 + q.charCodeAt(s)) & 0x7fffffff;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    for (var i = items.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = items[i]; items[i] = items[j]; items[j] = t; }
    return items;
  }

  function validatedLessons() {
    var v = [];
    for (var n = 1; n <= TOTAL; n++) {
      try { if (parseInt(localStorage.getItem(PREFIX + n) || "0", 10) > 0) v.push(n); } catch (e) {}
    }
    return v;
  }

  function extractDAY(html) {
    var m = html.match(/var DAY = ([\s\S]*?);\s*<\/script>/);
    if (!m) return null;
    try { return eval("(" + m[1] + ")"); } catch (e) { return null; }
  }

  function start() {
    var lessons = validatedLessons();
    root.innerHTML = "";
    if (!lessons.length) {
      root.appendChild(el("div", "card", "<h2>Aucune leçon validée pour l'instant</h2>" +
        "<p>Le mode examen tire ses questions parmi les leçons où tu as déjà obtenu au moins 1 point. " +
        "Fais d'abord quelques leçons, puis reviens ici !</p><p><a href=\"index.html\">← Retour au sommaire</a></p>"));
      return;
    }
    root.appendChild(el("p", "loading", "⏳ Préparation de ton examen à partir de " + lessons.length + " leçon(s) validée(s)…"));
    var fetchFailed = false;
    Promise.all(lessons.map(function (n) {
      return fetch("jour" + pad(n) + ".html").then(function (r) { return r.text(); })
        .then(function (t) { return { n: n, day: extractDAY(t) }; })
        .catch(function () { fetchFailed = true; return { n: n, day: null }; });
    })).then(function (all) {
      var pool = [];
      all.forEach(function (o) {
        if (!o.day) return;
        var qs = (o.day.exercises || []).concat(o.day.final ? o.day.final.questions : []);
        qs.forEach(function (ex) { if (ex && ex.type) pool.push({ ex: ex, lesson: o.n }); });
      });
      // Garde-fou : si aucune question n'a pu être chargée, c'est presque toujours parce que
      // la page est ouverte en local (file://), où le navigateur bloque fetch(). On l'explique.
      if (!pool.length) {
        root.innerHTML = "";
        root.appendChild(el("div", "card",
          "<h2>Le mode examen n'a pas pu charger les questions</h2>" +
          (fetchFailed
            ? "<p>Tu as probablement ouvert le site directement depuis un fichier (adresse commençant par <code>file://</code>). " +
              "Pour des raisons de sécurité, le navigateur y interdit la lecture des autres leçons.</p>" +
              "<p><strong>Deux solutions :</strong></p>" +
              "<ul><li>utilise la <strong>version en ligne</strong> (GitHub Pages) ;</li>" +
              "<li>ou lance un petit serveur local dans le dossier du site : <code>python -m http.server</code>, " +
              "puis ouvre <code>http://localhost:8000</code>.</li></ul>"
            : "<p>Aucune question exploitable n'a été trouvée dans tes leçons validées.</p>") +
          "<p><a href=\"index.html\">← Retour au sommaire</a></p>"));
        return;
      }
      // mélange du pool et sélection de NB questions
      for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
      var chosen = pool.slice(0, Math.min(NB, pool.length));
      render(chosen);
    });
  }

  function render(questions) {
    root.innerHTML = "";
    root.appendChild(el("div", "hero", "<h1>📝 Mode examen</h1>" +
      "<p>" + questions.length + " questions tirées au hasard parmi tes leçons validées. " +
      "Réponds à tout, puis clique sur <strong>Terminer</strong> : les corrections n'apparaissent qu'à la fin.</p>"));

    var form = el("section", "card");
    var state = [];
    questions.forEach(function (item, idx) {
      var ex = item.ex;
      var box = el("div", "exo");
      box.appendChild(el("span", "num", "Question " + (idx + 1) + " · leçon " + item.lesson));
      box.appendChild(el("div", "q", ex.q));
      var name = "q" + idx, getAnswer;

      if (ex.type === "qcm") {
        var opts = shuffleOpts(ex);
        opts.forEach(function (it, k) {
          var lab = el("label", "opt");
          lab.innerHTML = '<input type="radio" name="' + name + '" value="' + k + '"> ' + it.text;
          box.appendChild(lab);
        });
        getAnswer = function () {
          var c = box.querySelector('input[name="' + name + '"]:checked');
          return c === null ? null : { ok: !!opts[parseInt(c.value, 10)].correct, good: opts.filter(function (o) { return o.correct; })[0].text };
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
          return { ok: (c.value === "0") === (ex.a === true), good: ex.a ? "Vrai" : "Faux" };
        };
      } else {
        var inp = document.createElement("input");
        inp.type = "text"; inp.placeholder = ex.ph || "Ta réponse…";
        box.appendChild(inp);
        getAnswer = function () {
          if (inp.value.trim() === "") return null;
          var acc = Array.isArray(ex.a) ? ex.a : [ex.a];
          return { ok: acc.some(function (a) { return norm(a) === norm(inp.value); }), good: acc[0] };
        };
      }
      var fb = el("div", "feedback");
      box.appendChild(fb);
      form.appendChild(box);
      state.push({ ex: ex, getAnswer: getAnswer, box: box, fb: fb });
    });
    root.appendChild(form);

    var finBtn = el("button", "reveal", "Terminer et voir mon score");
    root.appendChild(finBtn);
    var result = el("div", "card"); result.style.display = "none";
    root.appendChild(result);

    finBtn.addEventListener("click", function () {
      var score = 0, answered = 0;
      state.forEach(function (st) {
        var a = st.getAnswer();
        if (a === null) {
          st.fb.className = "feedback show ko";
          st.fb.innerHTML = "⚠️ Pas de réponse — " + '<span>bonne réponse : <strong>' + escapeHtml(st.ex.type === "qcm" ? bestQcm(st.ex) : (st.ex.type === "vf" ? (st.ex.a ? "Vrai" : "Faux") : (Array.isArray(st.ex.a) ? st.ex.a[0] : st.ex.a))) + "</strong></span>";
        } else {
          answered++;
          if (a.ok) score++;
          st.box.className = "exo " + (a.ok ? "done-ok" : "done-ko");
          st.fb.className = "feedback show " + (a.ok ? "ok" : "ko");
          st.fb.innerHTML = (a.ok ? "✅ Bonne réponse !" : "❌ Ce n'est pas ça. Bonne réponse : <strong>" + escapeHtml(String(a.good)) + "</strong>") +
            (st.ex.exp ? '<div class="exp">' + st.ex.exp + "</div>" : "");
        }
      });
      var pct = Math.round(100 * score / state.length);
      result.style.display = "";
      result.innerHTML = "<h2>Résultat : " + score + " / " + state.length + " (" + pct + " %)</h2>" +
        "<p>" + (pct >= 80 ? "Excellent — tu maîtrises." : pct >= 50 ? "Pas mal ! Repasse les leçons signalées en rouge." : "À retravailler : reprends les leçons concernées, sans te décourager.") + "</p>" +
        '<div class="btnrow"><button class="check" onclick="location.reload()">🔄 Nouvel examen</button> ' +
        '<a class="reveal" href="index.html" style="text-decoration:none;display:inline-block">← Retour au sommaire</a></div>';
      result.scrollIntoView({ behavior: "smooth" });
      finBtn.disabled = true;
    });
  }

  function bestQcm(ex) { return ex.opts[ex.a]; }
  function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  start();
})();
