/* ===== Moteur de l'Atelier d'exercices — rend l'objet ATELIER (dialogues + onglets) ===== */
(function () {
  "use strict";
  if (typeof ATELIER === "undefined") { document.body.innerHTML = "<p>Erreur : donnees de l'atelier manquantes.</p>"; return; }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function norm(s) {
    return String(s).toLowerCase().trim()
      .replace(/\s+/g, " ")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/,/g, ".");
  }
  var PREFIX = ATELIER.prefix || "atelier";

  // Mélange déterministe des options de QCM (graine = énoncé) : la bonne réponse
  // n'est plus jamais à une position fixe, mais l'ordre reste stable au rechargement.
  function _hash(s){ var h=2166136261; s=String(s); for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
  function shuffledQcm(ex){
    var opts=(ex.opts||[]).slice(), order=opts.map(function(_,i){return i;}), seed=_hash(ex.q)||1;
    function rnd(){ seed=(Math.imul(seed,1103515245)+12345)&0x7fffffff; return seed/0x7fffffff; }
    for(var i=order.length-1;i>0;i--){ var j=Math.floor(rnd()*(i+1)); var t=order[i]; order[i]=order[j]; order[j]=t; }
    return { opts: order.map(function(k){return opts[k];}), a: order.indexOf(ex.a) };
  }

  /* ---------- styles propres a l'atelier ---------- */
  var css = document.createElement("style");
  css.textContent =
    ".tabbar{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 16px}" +
    ".tabbtn{border:2px solid var(--accent-soft);background:#fff;color:var(--ink);border-radius:999px;padding:6px 12px;font-size:.86rem;font-weight:600;cursor:pointer;line-height:1.2}" +
    ".tabbtn:hover{border-color:var(--accent)}" +
    ".tabbtn.active{background:var(--accent);border-color:var(--accent);color:#fff}" +
    ".tabbtn .tnum{opacity:.7;margin-right:4px}" +
    ".tabbtn .tsc{margin-left:6px;font-size:.78rem;opacity:.85}" +
    ".tabbtn.done{border-color:#1a7f43;color:#1a7f43}" +
    ".tabbtn.done.active{background:#1a7f43;border-color:#1a7f43;color:#fff}" +
    ".panel{display:none}.panel.show{display:block}" +
    ".consigne{background:var(--accent-soft);border-left:4px solid var(--accent);padding:10px 14px;border-radius:0 8px 8px 0;margin:0 0 14px;font-weight:600}" +
    ".dlg{border:2px solid var(--accent-soft);border-radius:12px;padding:2px 16px 12px;margin:0 0 14px}" +
    ".dlg h3{color:var(--accent);margin-bottom:2px}" +
    ".dlg .perso{color:var(--muted);font-size:.9em;margin:0 0 8px}" +
    ".dlg table{width:100%;border-collapse:collapse}" +
    ".dlg td{padding:3px 6px;vertical-align:top;border-bottom:1px solid #eee}" +
    ".dlg td.qui{white-space:nowrap;font-weight:700;color:var(--accent);width:1%}" +
    ".dlg td.n{white-space:nowrap;color:var(--muted);width:1%}" +
    ".dlg td.fr{color:var(--muted);font-style:italic}" +
    ".dlgtools{margin:6px 0 0}" +
    ".dlgtools button{font-size:.85rem}" +
    ".atelierfoot{color:var(--muted);text-align:center;margin-top:22px}";
  document.head.appendChild(css);

  var wrap = el("div", "wrap");
  document.body.appendChild(wrap);
  document.title = ATELIER.titre;

  /* ---------- en-tete ---------- */
  wrap.appendChild(el("nav", "daynav", '<a href="' + (ATELIER.retour || "index.html") + '">← Retour au sommaire</a>'));
  var hero = el("div", "hero",
    "<h1>" + ATELIER.titre + "</h1>" +
    "<p>" + (ATELIER.soustitre || "") + "</p>" +
    '<p id="atglob" style="margin-top:12px;font-weight:700"></p>');
  wrap.appendChild(hero);

  /* ---------- dialogues ---------- */
  if (ATELIER.dialogues && ATELIER.dialogues.length) {
    var dsec = el("section", "card");
    dsec.appendChild(el("h2", null, "💬 Les dialogues"));
    dsec.appendChild(el("p", null, "Lis-les (a voix haute si tu peux) avant de faire les exercices : la plupart des questions portent dessus."));
    ATELIER.dialogues.forEach(function (d) {
      var box = el("div", "dlg");
      box.appendChild(el("h3", null, d.num + " — " + d.titre));
      if (d.perso) box.appendChild(el("p", "perso", d.perso));
      var tbl = document.createElement("table");
      d.lignes.forEach(function (l, i) {
        var tr = document.createElement("tr");
        tr.innerHTML = '<td class="qui">' + (l.qui || "") + "</td>" +
                       '<td class="n">' + (i + 1) + ".</td>" +
                       "<td>" + l.txt + (l.fr ? '<div class="fr trad" style="display:none">' + l.fr + "</div>" : "") + "</td>";
        tbl.appendChild(tr);
      });
      box.appendChild(tbl);
      var tools = el("div", "dlgtools");
      var btn = el("button", "reveal", "🇫🇷 Afficher la traduction");
      var shown = false;
      btn.addEventListener("click", function () {
        shown = !shown;
        box.querySelectorAll(".trad").forEach(function (t) { t.style.display = shown ? "block" : "none"; });
        btn.textContent = shown ? "🙈 Masquer la traduction" : "🇫🇷 Afficher la traduction";
      });
      tools.appendChild(btn);
      box.appendChild(tools);
      dsec.appendChild(box);
    });
    wrap.appendChild(dsec);
  }

  /* ---------- onglets ---------- */
  var tabbar = el("div", "tabbar");
  wrap.appendChild(tabbar);
  var panels = [];
  var scores = {};

  function saveScore(tid, pts, total) {
    try {
      localStorage.setItem(PREFIX + "-" + tid, String(pts));
      localStorage.setItem(PREFIX + "-tot-" + tid, String(total));
    } catch (e) {}
  }
  function loadScore(tid) {
    try { return parseInt(localStorage.getItem(PREFIX + "-" + tid) || "0", 10); } catch (e) { return 0; }
  }

  function buildQuestion(ex, id, label, onAnswer) {
    var box = el("div", "exo");
    box.appendChild(el("span", "num", label));
    box.appendChild(el("div", "q", ex.q));
    var getAnswer, name = "opt_" + id;

    if (ex.type === "qcm") {
      var _sh = shuffledQcm(ex);
      _sh.opts.forEach(function (opt, k) {
        var lab = el("label", "opt");
        lab.innerHTML = '<input type="radio" name="' + name + '" value="' + k + '"> ' + opt;
        box.appendChild(lab);
      });
      getAnswer = function () {
        var c = box.querySelector('input[name="' + name + '"]:checked');
        return c === null ? null : (parseInt(c.value, 10) === _sh.a);
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
    } else {
      var inp = document.createElement("input");
      inp.type = "text";
      inp.placeholder = ex.ph || "Ta reponse…";
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
      box.className = ok ? "exo done-ok" : "exo done-ko";
      fb.className = "feedback show " + (ok ? "ok" : "ko");
      fb.innerHTML = (ok ? "✅ Bonne réponse !" : "❌ Ce n'est pas ça.") +
        (ex.exp ? '<div class="exp">' + ex.exp + "</div>" : "");
      onAnswer(id, ok);
    });
    return box;
  }

  ATELIER.types.forEach(function (t, ti) {
    var btn = el("button", "tabbtn",
      '<span class="tnum">' + (ti + 1) + ".</span>" + t.nom + '<span class="tsc"></span>');
    tabbar.appendChild(btn);

    var panel = el("div", "panel");
    var sec = el("section", "card");
    sec.appendChild(el("h2", null, (ti + 1) + ". " + t.nom));
    if (t.consigne) sec.appendChild(el("div", "consigne", t.consigne));
    if (t.intro) sec.appendChild(el("div", null, t.intro));

    var results = {};
    var total = t.exercices.length;
    function onAnswer(qid, ok) {
      results[qid] = ok;
      var pts = 0; for (var k in results) if (results[k]) pts++;
      scores[t.id] = pts;
      saveScore(t.id, pts, total);
      refreshTab();
      refreshGlobal();
    }
    t.exercices.forEach(function (ex, i) {
      sec.appendChild(buildQuestion(ex, t.id + "_" + i, (i + 1) + ".", onAnswer));
    });
    panel.appendChild(sec);
    wrap.appendChild(panel);
    panels.push(panel);

    function refreshTab() {
      var pts = scores[t.id] || 0;
      btn.querySelector(".tsc").textContent = pts > 0 ? "(" + pts + "/" + total + ")" : "";
      if (pts >= total) btn.classList.add("done"); else btn.classList.remove("done");
    }
    scores[t.id] = loadScore(t.id);
    refreshTab();

    btn.addEventListener("click", function () {
      panels.forEach(function (p) { p.classList.remove("show"); });
      Array.prototype.forEach.call(tabbar.children, function (b) { b.classList.remove("active"); });
      panel.classList.add("show");
      btn.classList.add("active");
      window.scrollTo({ top: tabbar.offsetTop - 10, behavior: "smooth" });
    });
    if (ti === 0) { panel.classList.add("show"); btn.classList.add("active"); }
  });

  function refreshGlobal() {
    var pts = 0, tot = 0, done = 0;
    ATELIER.types.forEach(function (t) {
      var p = scores[t.id] || 0, n = t.exercices.length;
      pts += p; tot += n; if (p >= n) done++;
    });
    document.getElementById("atglob").textContent =
      pts + " / " + tot + " exercices réussis · " + done + " type(s) d'exercice maîtrisé(s) sur " + ATELIER.types.length;
  }
  refreshGlobal();

  wrap.appendChild(el("footer", "atelierfoot",
    ATELIER.types.length + " types d'exercices · " +
    ATELIER.types.reduce(function (a, t) { return a + t.exercices.length; }, 0) +
    " exercices — refais-les jusqu'au score parfait : c'est la répétition qui installe une langue."));
})();
