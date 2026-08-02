/* ===== Exercices d'écriture intégrés à la leçon — rend l'objet ECRITURE en fin de page =====
   Runner UNIFIÉ, choisi par item.lang :
   - "python" (défaut si tests présents) : exécution via Pyodide (chargé à la demande), input() simulé (item.stdin),
     sortie exposée aux tests dans __output__ ;
   - "sql" : exécution via sql.js / SQLite WASM (chargé à la demande) ; item.schema crée les tables, la requête de
     l'élève est exécutée et affichée ; tests = [{query?, expect, label}] comparés au résultat ;
   - "js" : exécution dans une <iframe> sandboxée avec prévisualisation live ; tests DOM = [{code, label}] où
     `document` et `window` désignent l'iframe.
   Le bouton ▶ n'apparaît QUE pour un item réellement exécutable (lang python/sql/js avec des tests / du code).
   Tests tous verts → clé localStorage additive « ecrpass-<id> » + badge. Aucune clé existante n'est modifiée.
   La grille d'auto-relecture (item.checklist, défaut générique sinon) s'affiche AVANT « Voir la solution ». */
(function () {
  "use strict";
  if (typeof ECRITURE === "undefined" || !ECRITURE.items || !ECRITURE.items.length) return;
  var wrap = document.querySelector(".wrap");
  if (!wrap) return;

  var PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  var SQLJS_BASE = "https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/";

  var css = document.createElement("style");
  css.textContent =
    "section.ecriture{border:3px dashed var(--warn)}" +
    "section.ecriture h2{color:var(--warn);border-bottom-color:#f3e2b3}" +
    ".lvl{float:right;color:var(--warn);letter-spacing:3px;font-size:.85em}" +
    ".btnrow{display:flex;gap:10px;flex-wrap:wrap}" +
    ".hint{background:var(--accent-soft);border-left:4px solid var(--accent);padding:8px 12px;border-radius:0 8px 8px 0;margin-top:10px}" +
    "button:disabled{opacity:.55;cursor:default}" +
    ".solnote{color:var(--muted);font-size:.9em;margin:6px 0 0}" +
    ".ecriture textarea{min-height:180px;margin-top:10px;font-family:ui-monospace,Menlo,Consolas,monospace;tab-size:4}" +
    ".ecriture .q pre.pseudo{font-weight:normal}" +
    ".run{background:#1a9a5c}" +
    ".runout{display:none;margin-top:10px;border-radius:10px;overflow:hidden;border:1px solid #d8deea}" +
    ".runout.show{display:block}" +
    ".runout .ro-head{background:#1e2533;color:#d8e0f5;font:600 .85em/1 ui-monospace,monospace;padding:8px 12px}" +
    ".runout pre{margin:0;padding:12px;background:#0f1420;color:#d8e0f5;white-space:pre-wrap;word-break:break-word;font:.9em/1.45 ui-monospace,Menlo,Consolas,monospace}" +
    ".runout pre.err{color:#ff9a9a}" +
    ".runout .sqlgrid{overflow:auto;background:#0f1420}" +
    ".runout table.sqltab{border-collapse:collapse;font:.85em ui-monospace,monospace;color:#d8e0f5;width:100%}" +
    ".runout table.sqltab th,.runout table.sqltab td{border:1px solid #2a3550;padding:4px 8px;text-align:left}" +
    ".runout table.sqltab th{background:#1b2540;color:#9fd0ff}" +
    ".runout iframe{width:100%;height:220px;border:0;background:#fff}" +
    ".testline{padding:6px 12px;font:.9em/1.4 ui-monospace,monospace;border-top:1px solid #232c3d;background:#141b28;color:#cdd6ea}" +
    ".testsum{padding:8px 12px;font-weight:700}" +
    ".testsum.ok{background:var(--ok-soft);color:var(--ok)}" +
    ".testsum.ko{background:var(--ko-soft);color:var(--ko)}" +
    ".ecrbadge{display:inline-block;margin-left:10px;padding:2px 10px;border-radius:999px;background:var(--ok-soft);color:var(--ok);font-size:.8em;font-weight:700;vertical-align:middle}" +
    ".sqlnote{background:#fdf6e3;border-left:4px solid #b8860b;padding:8px 12px;border-radius:0 8px 8px 0;margin-top:10px;font-size:.9em}" +
    ".atoi{margin-top:12px;border:1px solid #cdd8ea;border-radius:10px;overflow:hidden}" +
    ".atoi .atoi-h{background:#eef3fb;color:#1e2533;font-weight:700;padding:8px 12px;font-size:.92em}" +
    ".atoi .atoi-b{padding:10px 12px}" +
    ".atoi .atoi-b p{margin:0 0 4px;font-size:.88em;color:var(--muted)}" +
    ".atoi pre{margin:0 0 10px;padding:10px;border-radius:8px;background:#1e2533;color:#d8e0f5;white-space:pre-wrap;word-break:break-word;font:.88em/1.45 ui-monospace,Menlo,Consolas,monospace}" +
    ".atoi pre.cmd{background:#0f1420;color:#9fd0ff}" +
    ".lab{margin-top:12px;border:1px solid #bfe3cf;border-radius:10px;overflow:hidden}" +
    ".lab .lab-h{background:#e3f6ec;color:#0f6e56;font-weight:700;padding:8px 12px;font-size:.92em}" +
    ".lab .lab-b{padding:10px 12px}" +
    ".lab .lab-b p{margin:0 0 8px;font-size:.92em}" +
    ".lab pre{margin:0 0 10px;padding:10px;border-radius:8px;background:#0f1a14;color:#c7f0d8;white-space:pre-wrap;word-break:break-word;font:.88em/1.5 ui-monospace,Menlo,Consolas,monospace}" +
    ".lab .lab-check{background:var(--ok-soft,#e3f6ec);border-left:4px solid var(--ok,#1a9a5c);padding:8px 12px;border-radius:0 8px 8px 0;color:#0f6e56;font-weight:600}" +
    ".checklist{background:#fff;border:1px solid #e2e7f0;border-radius:10px;padding:10px 14px;margin-top:12px}" +
    ".checklist h4{margin:0 0 6px;font-size:.95em;color:var(--ink)}" +
    ".checklist label{display:flex;gap:8px;align-items:flex-start;font-size:.92em;margin:4px 0;cursor:pointer}" +
    ".checklist input{margin-top:3px}";
  document.head.appendChild(css);

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function stars(n) { var s = ""; for (var i = 1; i <= 3; i++) s += (i <= n ? "★" : "☆"); return s; }

  /* ---- chargeurs paresseux ---- */
  var pyodidePromise = null, sqlPromise = null;
  function getPyodide() {
    if (pyodidePromise) return pyodidePromise;
    pyodidePromise = new Promise(function (resolve, reject) {
      var s = document.createElement("script"); s.src = PYODIDE_BASE + "pyodide.js";
      s.onload = function () { if (typeof window.loadPyodide !== "function") { reject(new Error("Pyodide n'a pas pu s'initialiser.")); return; } window.loadPyodide({ indexURL: PYODIDE_BASE }).then(resolve).catch(reject); };
      s.onerror = function () { reject(new Error("Impossible de charger Python (Pyodide). Vérifie ta connexion Internet.")); };
      document.head.appendChild(s);
    });
    return pyodidePromise;
  }
  function getSql() {
    if (sqlPromise) return sqlPromise;
    sqlPromise = new Promise(function (resolve, reject) {
      var s = document.createElement("script"); s.src = SQLJS_BASE + "sql-wasm.js";
      s.onload = function () { if (typeof window.initSqlJs !== "function") { reject(new Error("sql.js indisponible.")); return; } window.initSqlJs({ locateFile: function (f) { return SQLJS_BASE + f; } }).then(resolve).catch(reject); };
      s.onerror = function () { reject(new Error("Impossible de charger SQLite (sql.js). Vérifie ta connexion Internet.")); };
      document.head.appendChild(s);
    });
    return sqlPromise;
  }

  var DEFAULT_CHECKLIST = [
    "Tes noms (variables, colonnes, éléments) sont-ils clairs et parlants ?",
    "As-tu pensé aux cas limites (valeur vide, zéro, aucun résultat) ?",
    "Ton code est-il lisible et correctement présenté ?"
  ];

  function cleanTraceback(msg) {
    var lines = String(msg).split("\n"), keep = [];
    for (var i = 0; i < lines.length; i++) { var l = lines[i]; if (l.indexOf('File "<exec>"') !== -1 || l.indexOf("/lib/python") !== -1) continue; if (l.toLowerCase().indexOf("pyodide") !== -1) continue; keep.push(l); }
    return (keep.join("\n").trim()) || String(msg).trim();
  }
  function rowsEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

  ECRITURE.items.forEach(function (x) {
    var lang = x.lang || "python";
    var isRunnable = (x.runnable !== false) && (
      (lang === "python" && x.tests && x.tests.length) ||
      (lang === "sql" && x.tests && x.tests.length) ||
      (lang === "js" && (x.tests && x.tests.length)));

    var sec = el("section", "card ecriture");
    var badge = "";
    try { if (localStorage.getItem("ecrpass-" + x.id) === "1") badge = '<span class="ecrbadge">✍️ écriture validée ✅</span>'; } catch (e) {}
    sec.appendChild(el("h2", null, "✍️ Exercice d'écriture — " + x.title + badge + '<span class="lvl" title="Difficulté">' + stars(x.level) + "</span>"));

    var exo = el("div", "exo");
    exo.appendChild(el("div", "q", x.statement));
    exo.appendChild(el("p", "solnote", "Écris ta réponse ci-dessous (sauvegardée automatiquement)." +
      (isRunnable ? " Clique sur ▶ pour l'exécuter et lancer les tests." : "") +
      " Utilise les indices si tu bloques, et ne regarde la solution qu'après avoir vraiment essayé."));

    var ta = document.createElement("textarea");
    ta.placeholder = ECRITURE.placeholder || "Écris ta réponse ici…";
    ta.spellcheck = false;
    var key = "ecr-" + x.id;
    try { ta.value = localStorage.getItem(key) || ""; } catch (e) {}
    ta.addEventListener("input", function () { try { localStorage.setItem(key, ta.value); } catch (e) {} });
    ta.addEventListener("keydown", function (e) {
      if (e.key === "Tab") { e.preventDefault(); var st = ta.selectionStart, en = ta.selectionEnd; ta.value = ta.value.slice(0, st) + "    " + ta.value.slice(en); ta.selectionStart = ta.selectionEnd = st + 4; try { localStorage.setItem(key, ta.value); } catch (e2) {} }
    });
    exo.appendChild(ta);

    var btns = el("div", "btnrow");
    var runLabel = lang === "sql" ? "▶ Exécuter ma requête" : (lang === "js" ? "▶ Lancer l'aperçu" : "▶ Exécuter mon code");
    var runBtn = isRunnable ? el("button", "check run", runLabel) : null;
    var hintBtn = el("button", "check", "💡 Indice (0/" + x.hints.length + ")");
    if (runBtn) btns.appendChild(runBtn);
    btns.appendChild(hintBtn);
    exo.appendChild(btns);

    var out = el("div", "runout");
    if (isRunnable) exo.appendChild(out);
    function showOut(head, bodyText, isErr) { out.className = "runout show"; out.innerHTML = ""; out.appendChild(el("div", "ro-head", head)); var pre = el("pre", isErr ? "err" : null); pre.textContent = bodyText; out.appendChild(pre); }
    function markPass(passed, total) {
      var line = el("div", "testsum " + (passed === total ? "ok" : "ko"), (passed === total ? "✅ " : "❌ ") + passed + "/" + total + " tests passés" + (passed === total ? " — exercice validé !" : " — continue, tu y es presque."));
      out.appendChild(line);
      if (passed === total) {
        try { localStorage.setItem("ecrpass-" + x.id, "1"); var h2 = sec.querySelector("h2"); if (h2 && !h2.querySelector(".ecrbadge")) { var b = el("span", "ecrbadge", "✍️ écriture validée ✅"); var lvl = h2.querySelector(".lvl"); if (lvl) h2.insertBefore(b, lvl); else h2.appendChild(b); } } catch (e) {}
      }
    }
    function addTestLine(ok, label) { out.appendChild(el("div", "testline" + (ok ? "" : ""), (ok ? "✅ " : "❌ ") + label)); }

    if (runBtn) runBtn.addEventListener("click", function () {
      var code = ta.value;
      if (!code.trim()) { showOut("Sortie", "(rien à exécuter : écris d'abord ta réponse)", true); return; }
      runBtn.disabled = true; var prev = runBtn.textContent; runBtn.textContent = "⏳ Chargement…";
      var done = function () { runBtn.disabled = false; runBtn.textContent = prev; };
      if (lang === "python") runPython(code, done);
      else if (lang === "sql") runSql(code, done);
      else if (lang === "js") runJs(code, done);
    });

    function runPython(code, done) {
      showOut("Sortie", "⏳ Démarrage de l'interpréteur Python (la première fois : quelques secondes)…", false);
      getPyodide().then(function (py) {
        var printed = "", errText = null, ns = null;
        try {
          py.runPython("import sys, io\n_stdout=sys.stdout\n_stderr=sys.stderr\nsys.stdout=io.StringIO()\nsys.stderr=sys.stdout");
          py.globals.set("__stdin_arr", py.toPy((x.stdin || []).slice()));
          py.runPython("import builtins\n__it=iter(list(__stdin_arr))\ndef __fi(p=''):\n try:\n  print(p,end='')\n except Exception:\n  pass\n try:\n  return str(next(__it))\n except StopIteration:\n  return ''\nbuiltins.input=__fi\n");
          ns = py.globals.get("dict")();
          try { py.runPython(code, { globals: ns }); } catch (e) { errText = String(e.message || e); }
          printed = py.runPython("sys.stdout.getvalue()");
          try { py.runPython("import sys as _s\n__output__=_s.stdout.getvalue()", { globals: ns }); } catch (e) {}
          py.runPython("sys.stdout=_stdout\nsys.stderr=_stderr");
          if (errText) { showOut("Erreur Python", (printed ? printed + "\n" : "") + cleanTraceback(errText), true); }
          else { showOut("Sortie", printed !== "" ? printed : "(aucune sortie — pense à print(...) pour afficher un résultat)", false); }
          var tests = x.tests || [];
          if (tests.length && !errText) {
            var passed = 0;
            tests.forEach(function (t) { var tc = (typeof t === "string") ? t : t.code, tl = (typeof t === "string") ? "test" : (t.label || "test"); try { py.runPython(tc, { globals: ns }); passed++; addTestLine(true, tl); } catch (e) { addTestLine(false, tl); } });
            markPass(passed, tests.length);
          } else if (tests.length && errText) { out.appendChild(el("div", "testsum ko", "❌ Tests non lancés : corrige d'abord l'erreur ci-dessus.")); }
        } catch (fatal) { showOut("Erreur", String(fatal.message || fatal), true); }
        finally { if (ns && ns.destroy) { try { ns.destroy(); } catch (e) {} } done(); }
      }).catch(function (err) { showOut("Erreur", String(err.message || err), true); done(); });
    }

    function runSql(code, done) {
      showOut("Résultat", "⏳ Démarrage de SQLite (la première fois : quelques secondes)…", false);
      getSql().then(function (SQL) {
        var db = new SQL.Database();
        try { if (x.schema) db.run(x.schema); } catch (e) { showOut("Erreur de schéma", String(e.message || e), true); db.close(); done(); return; }
        var studentErr = null;
        try { db.run(code); } catch (e) { studentErr = String(e.message || e); }
        // Affiche le résultat de la requête de l'élève (dernier SELECT)
        out.className = "runout show"; out.innerHTML = ""; out.appendChild(el("div", "ro-head", "Résultat de ta requête"));
        if (studentErr) { var pe = el("pre", "err"); pe.textContent = studentErr; out.appendChild(pe); }
        else {
          try {
            var res = db.exec(code);
            if (res && res.length) { out.appendChild(renderSqlTable(res[res.length - 1])); }
            else { var pn = el("pre"); pn.textContent = "(requête exécutée — aucune ligne renvoyée)"; out.appendChild(pn); }
          } catch (e) { var pe2 = el("pre", "err"); pe2.textContent = String(e.message || e); out.appendChild(pe2); }
        }
        if (x.sqlnote) out.appendChild(el("div", "sqlnote", "ℹ️ " + x.sqlnote));
        var tests = x.tests || [];
        if (tests.length && !studentErr) {
          var passed = 0;
          tests.forEach(function (t) {
            var q = t.query || code, label = t.label || "test", ok = false, tmp = null;
            try {
              var target = db;
              if (t.seed) { tmp = new SQL.Database(); if (x.schema) tmp.run(x.schema); target = tmp; }
              var r = target.exec(q); var rows = (r && r.length) ? r[0].values.map(function (row) { return row.slice(); }) : [];
              ok = (t.expect === undefined) ? true : rowsEqual(rows, t.expect);
            } catch (e) { ok = false; }
            if (tmp) tmp.close();
            addTestLine(ok, label); if (ok) passed++;
          });
          markPass(passed, tests.length);
        } else if (tests.length && studentErr) { out.appendChild(el("div", "testsum ko", "❌ Tests non lancés : corrige d'abord l'erreur SQL.")); }
        db.close(); done();
      }).catch(function (err) { showOut("Erreur", String(err.message || err), true); done(); });
    }
    function renderSqlTable(r) {
      var wrapd = el("div", "sqlgrid"); var t = el("table", "sqltab"); var thead = el("thead"), trh = el("tr");
      r.columns.forEach(function (c) { trh.appendChild(el("th", null, String(c))); }); thead.appendChild(trh); t.appendChild(thead);
      var tb = el("tbody"); r.values.slice(0, 50).forEach(function (row) { var tr = el("tr"); row.forEach(function (v) { tr.appendChild(el("td", null, v === null ? "<i style='opacity:.5'>NULL</i>" : String(v))); }); tb.appendChild(tr); }); t.appendChild(tb); wrapd.appendChild(t); return wrapd;
    }

    function runJs(code, done) {
      out.className = "runout show"; out.innerHTML = ""; out.appendChild(el("div", "ro-head", "Aperçu live"));
      var iframe = document.createElement("iframe"); iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
      var doc = /<\w+/.test(code) ? code : "<script>" + code + "<\/script>";
      iframe.srcdoc = "<!DOCTYPE html><html><head><meta charset='utf-8'></head><body>" + doc + "</body></html>";
      out.appendChild(iframe);
      iframe.addEventListener("load", function () {
        var tests = x.tests || [];
        if (!tests.length) { done(); return; }
        var passed = 0;
        try {
          var w = iframe.contentWindow, d = iframe.contentDocument;
          tests.forEach(function (t) {
            var tc = (typeof t === "string") ? t : t.code, tl = (typeof t === "string") ? "test" : (t.label || "test");
            try { (new w.Function("document", "window", tc))(d, w); passed++; addTestLine(true, tl); } catch (e) { addTestLine(false, tl); }
          });
          markPass(passed, tests.length);
        } catch (e) { out.appendChild(el("div", "testsum ko", "❌ Impossible d'exécuter les tests : " + (e.message || e))); }
        done();
      });
    }

    /* ---- « À toi de jouer » : commande locale + sortie attendue (langages non exécutables ici) ---- */
    if (x.atoi && (x.atoi.cmd || x.atoi.expected)) {
      var adi = el("div", "atoi");
      adi.appendChild(el("div", "atoi-h", "🖥️ À toi de jouer — exécute-le sur ta machine"));
      var abody = el("div", "atoi-b");
      if (x.atoi.cmd) {
        abody.appendChild(el("p", null, "Compile et lance :"));
        var pc = el("pre", "cmd"); pc.textContent = x.atoi.cmd; abody.appendChild(pc);
      }
      if (x.atoi.expected !== undefined) {
        abody.appendChild(el("p", null, "Sortie attendue (compare-la avec la tienne, caractère pour caractère) :"));
        var pe2 = el("pre"); pe2.textContent = x.atoi.expected; abody.appendChild(pe2);
      }
      adi.appendChild(abody);
      exo.appendChild(adi);
    }

    /* ---- « 🔬 Lab » : mise en pratique guidée (Packet Tracer / VM / logiciel), avec résultat vérifiable ---- */
    if (x.lab && (x.lab.intro || x.lab.steps || x.lab.check)) {
      var lab = el("div", "lab");
      lab.appendChild(el("div", "lab-h", "🔬 Lab — " + (x.lab.title || "à faire en pratique")));
      var lb = el("div", "lab-b");
      if (x.lab.intro) lb.appendChild(el("p", null, x.lab.intro));
      if (x.lab.steps) { var ps = el("pre"); ps.textContent = x.lab.steps; lb.appendChild(ps); }
      if (x.lab.check) { lb.appendChild(el("p", "lab-check", "✅ Résultat vérifiable : " + x.lab.check)); }
      lab.appendChild(lb);
      exo.appendChild(lab);
    }

    /* ---- indices ---- */
    var hintBox = el("div", "hints"); exo.appendChild(hintBox); var shown = 0;
    hintBtn.addEventListener("click", function () {
      if (shown >= x.hints.length) return;
      hintBox.appendChild(el("div", "hint", "<strong>Indice " + (shown + 1) + " :</strong> " + x.hints[shown])); shown++;
      if (shown >= x.hints.length) { hintBtn.textContent = "💡 Tous les indices affichés"; hintBtn.disabled = true; } else { hintBtn.textContent = "💡 Indice (" + shown + "/" + x.hints.length + ")"; }
    });

    /* ---- grille d'auto-relecture ---- */
    var checks = (x.checklist && x.checklist.length) ? x.checklist : DEFAULT_CHECKLIST;
    var cl = el("div", "checklist"); cl.appendChild(el("h4", null, "🔍 Avant de regarder la solution — relis ton travail :"));
    checks.forEach(function (crit) { var lab = document.createElement("label"); lab.innerHTML = '<input type="checkbox"> <span>' + crit + "</span>"; cl.appendChild(lab); });
    exo.appendChild(cl);

    /* ---- solution ---- */
    var solBtn = el("button", "reveal", "👁 Voir la solution"); exo.appendChild(solBtn);
    var sol = el("div", "solution"); var pre = el("pre", "pseudo"); var codeEl = document.createElement("code"); codeEl.textContent = x.solution; pre.appendChild(codeEl); sol.appendChild(pre);
    if (x.note) sol.appendChild(el("p", "solnote", "💬 " + x.note));
    exo.appendChild(sol);
    solBtn.addEventListener("click", function () { var open = sol.classList.toggle("show"); solBtn.textContent = open ? "🙈 Masquer la solution" : "👁 Voir la solution"; });

    sec.appendChild(exo); wrap.appendChild(sec);
  });
})();
