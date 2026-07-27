/* ===== Exercices d'écriture intégrés à la leçon — rend l'objet ECRITURE en fin de page =====
   Version « pilote » du cours Python :
   - bouton « ▶ Exécuter mon code » qui lance le code de l'élève dans le navigateur (Pyodide, chargé à la demande) ;
   - exécution des tests fournis dans ECRITURE.items[].tests (assertions Python) ;
   - badge « ✍️ écriture validée » + point localStorage (clé « ecrpass-<id> ») uniquement si TOUS les tests passent ;
   - grille d'auto-relecture (ECRITURE.items[].checklist) affichée AVANT le bouton « Voir la solution ».
   Aucune clé localStorage existante n'est modifiée (le texte reste sous « ecr-<id> », les scores QCM sous « py21-… »). */
(function () {
  "use strict";
  if (typeof ECRITURE === "undefined" || !ECRITURE.items || !ECRITURE.items.length) return;
  var wrap = document.querySelector(".wrap");
  if (!wrap) return;

  /* ---- version de Pyodide (CDN) ---- */
  var PYODIDE_VERSION = "v0.26.4";
  var PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/" + PYODIDE_VERSION + "/full/";

  /* ---- styles propres à ces exercices ---- */
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
    ".testline{padding:6px 12px;font:.9em/1.4 ui-monospace,monospace;border-top:1px solid #232c3d;background:#141b28;color:#cdd6ea}" +
    ".testsum{padding:8px 12px;font-weight:700}" +
    ".testsum.ok{background:var(--ok-soft);color:var(--ok)}" +
    ".testsum.ko{background:var(--ko-soft);color:var(--ko)}" +
    ".ecrbadge{display:inline-block;margin-left:10px;padding:2px 10px;border-radius:999px;background:var(--ok-soft);color:var(--ok);font-size:.8em;font-weight:700;vertical-align:middle}" +
    ".checklist{background:#fff;border:1px solid #e2e7f0;border-radius:10px;padding:10px 14px;margin-top:12px}" +
    ".checklist h4{margin:0 0 6px;font-size:.95em;color:var(--ink)}" +
    ".checklist label{display:flex;gap:8px;align-items:flex-start;font-size:.92em;margin:4px 0;cursor:pointer}" +
    ".checklist input{margin-top:3px}";
  document.head.appendChild(css);

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function stars(n) {
    var s = "";
    for (var i = 1; i <= 3; i++) s += (i <= n ? "★" : "☆");
    return s;
  }

  /* ---- chargement PARESSEUX de Pyodide : rien n'est téléchargé tant que l'élève ne clique pas ---- */
  var pyodidePromise = null;
  function getPyodide() {
    if (pyodidePromise) return pyodidePromise;
    pyodidePromise = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = PYODIDE_BASE + "pyodide.js";
      s.onload = function () {
        if (typeof window.loadPyodide !== "function") { reject(new Error("Pyodide n'a pas pu s'initialiser.")); return; }
        window.loadPyodide({ indexURL: PYODIDE_BASE }).then(resolve).catch(reject);
      };
      s.onerror = function () { reject(new Error("Impossible de charger Python (Pyodide). Vérifie ta connexion Internet.")); };
      document.head.appendChild(s);
    });
    return pyodidePromise;
  }

  /* ---- défaut de la grille d'auto-relecture si la leçon n'en fournit pas ---- */
  var DEFAULT_CHECKLIST = [
    "Tes noms de variables et de fonctions sont-ils clairs et parlants ?",
    "As-tu pensé aux cas limites (zéro, valeur vide, nombre négatif) ?",
    "Ton code est-il lisible et correctement indenté (4 espaces) ?"
  ];

  /* Nettoie un traceback Pyodide pour n'afficher que ce qui est utile à l'élève. */
  function cleanTraceback(msg) {
    var lines = String(msg).split("\n");
    var keep = [];
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      if (l.indexOf('File "<exec>"') !== -1 || l.indexOf("/lib/python") !== -1) continue;
      if (l.toLowerCase().indexOf("pyodide") !== -1) continue;
      keep.push(l);
    }
    var t = keep.join("\n").trim();
    return t || String(msg).trim();
  }

  ECRITURE.items.forEach(function (x) {
    var sec = el("section", "card ecriture");
    var badge = "";
    try { if (localStorage.getItem("ecrpass-" + x.id) === "1") badge = '<span class="ecrbadge">✍️ écriture validée ✅</span>'; } catch (e) {}
    sec.appendChild(el("h2", null,
      "✍️ Exercice d'écriture — " + x.title + badge + '<span class="lvl" title="Difficulté">' + stars(x.level) + "</span>"));

    var exo = el("div", "exo");
    exo.appendChild(el("div", "q", x.statement));
    exo.appendChild(el("p", "solnote",
      "Écris ton code ci-dessous (sauvegardé automatiquement). Clique sur ▶ pour l'exécuter et lancer les tests, utilise les indices si tu bloques, et ne regarde la solution qu'après avoir vraiment essayé."));

    var ta = document.createElement("textarea");
    ta.placeholder = ECRITURE.placeholder || "Écris ton code ici…";
    ta.spellcheck = false;
    var key = "ecr-" + x.id;
    try { ta.value = localStorage.getItem(key) || ""; } catch (e) {}
    ta.addEventListener("input", function () {
      try { localStorage.setItem(key, ta.value); } catch (e) {}
    });
    // Tabulation = 4 espaces dans la zone de code (confort)
    ta.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        e.preventDefault();
        var st = ta.selectionStart, en = ta.selectionEnd;
        ta.value = ta.value.slice(0, st) + "    " + ta.value.slice(en);
        ta.selectionStart = ta.selectionEnd = st + 4;
        try { localStorage.setItem(key, ta.value); } catch (e2) {}
      }
    });
    exo.appendChild(ta);

    /* ---- rangée de boutons ---- */
    var btns = el("div", "btnrow");
    var runBtn = el("button", "check run", "▶ Exécuter mon code");
    var hintBtn = el("button", "check", "💡 Indice (0/" + x.hints.length + ")");
    btns.appendChild(runBtn);
    btns.appendChild(hintBtn);
    exo.appendChild(btns);

    /* ---- zone de sortie d'exécution ---- */
    var out = el("div", "runout");
    exo.appendChild(out);

    function showOut(headHtml, bodyText, isErr) {
      out.className = "runout show";
      out.innerHTML = "";
      out.appendChild(el("div", "ro-head", headHtml));
      var pre = el("pre", isErr ? "err" : null);
      pre.textContent = bodyText;
      out.appendChild(pre);
      return out;
    }

    runBtn.addEventListener("click", function () {
      var code = ta.value;
      if (!code.trim()) { showOut("Sortie", "(rien à exécuter : écris d'abord du code)", true); return; }
      runBtn.disabled = true;
      var prevLabel = "▶ Exécuter mon code";
      runBtn.textContent = "⏳ Chargement de Python…";
      showOut("Sortie", "⏳ Démarrage de l'interpréteur Python (la première fois : quelques secondes)…", false);
      getPyodide().then(function (py) {
        runBtn.textContent = prevLabel;
        var printed = "", errText = null, ns = null;
        try {
          py.runPython("import sys, io\n_stdout = sys.stdout\n_stderr = sys.stderr\nsys.stdout = io.StringIO()\nsys.stderr = sys.stdout");
          // input() est simulé : il lit dans la liste x.stdin (si fournie) au lieu de bloquer le navigateur.
          py.globals.set("__stdin_arr", py.toPy((x.stdin || []).slice()));
          py.runPython(
            "import builtins\n" +
            "__stdin_iter = iter(list(__stdin_arr))\n" +
            "def __fake_input(prompt=''):\n" +
            "    try:\n        print(prompt, end='')\n    except Exception:\n        pass\n" +
            "    try:\n        return str(next(__stdin_iter))\n    except StopIteration:\n        return ''\n" +
            "builtins.input = __fake_input\n");
          ns = py.globals.get("dict")();
          try {
            py.runPython(code, { globals: ns });
          } catch (e) {
            errText = String(e.message || e);
          }
          printed = py.runPython("sys.stdout.getvalue()");
          // On expose la sortie affichée aux tests, sous le nom __output__ (utile pour les exercices avec print()).
          try { py.runPython("import sys as _sys\n__output__ = _sys.stdout.getvalue()", { globals: ns }); } catch (e) {}
          py.runPython("sys.stdout = _stdout\nsys.stderr = _stderr");

          // Affichage de la sortie / erreur
          if (errText) {
            showOut("Erreur Python", (printed ? printed + "\n" : "") + cleanTraceback(errText), true);
          } else {
            showOut("Sortie", printed !== "" ? printed : "(aucune sortie — pense à print(...) pour afficher un résultat)", false);
          }

          // Tests
          var tests = x.tests || [];
          if (tests.length && !errText) {
            var passed = 0;
            tests.forEach(function (t) {
              var tcode = (typeof t === "string") ? t : t.code;
              var tlabel = (typeof t === "string") ? "test" : (t.label || "test");
              var line = el("div", "testline");
              try {
                py.runPython(tcode, { globals: ns });
                passed++;
                line.textContent = "✅ " + tlabel;
              } catch (e) {
                line.textContent = "❌ " + tlabel;
              }
              out.appendChild(line);
            });
            var allOk = (passed === tests.length);
            var sum = el("div", "testsum " + (allOk ? "ok" : "ko"),
              (allOk ? "✅ " : "❌ ") + passed + "/" + tests.length + " tests passés" +
              (allOk ? " — exercice validé !" : " — continue, tu y es presque."));
            out.appendChild(sum);
            if (allOk) {
              try {
                localStorage.setItem("ecrpass-" + x.id, "1");
                var h2 = sec.querySelector("h2");
                if (h2 && !h2.querySelector(".ecrbadge")) {
                  var b = el("span", "ecrbadge", "✍️ écriture validée ✅");
                  var lvl = h2.querySelector(".lvl");
                  if (lvl) h2.insertBefore(b, lvl); else h2.appendChild(b);
                }
              } catch (e) {}
            }
          } else if (tests.length && errText) {
            out.appendChild(el("div", "testsum ko", "❌ Tests non lancés : corrige d'abord l'erreur ci-dessus."));
          }
        } catch (fatal) {
          showOut("Erreur", String(fatal.message || fatal), true);
        } finally {
          if (ns && ns.destroy) { try { ns.destroy(); } catch (e) {} }
          runBtn.disabled = false;
        }
      }).catch(function (err) {
        runBtn.disabled = false;
        runBtn.textContent = prevLabel;
        showOut("Erreur", String(err.message || err), true);
      });
    });

    /* ---- indices ---- */
    var hintBox = el("div", "hints");
    exo.appendChild(hintBox);
    var shown = 0;
    hintBtn.addEventListener("click", function () {
      if (shown >= x.hints.length) return;
      hintBox.appendChild(el("div", "hint", "<strong>Indice " + (shown + 1) + " :</strong> " + x.hints[shown]));
      shown++;
      if (shown >= x.hints.length) {
        hintBtn.textContent = "💡 Tous les indices affichés";
        hintBtn.disabled = true;
      } else {
        hintBtn.textContent = "💡 Indice (" + shown + "/" + x.hints.length + ")";
      }
    });

    /* ---- grille d'auto-relecture (AVANT la solution) ---- */
    var checks = (x.checklist && x.checklist.length) ? x.checklist : DEFAULT_CHECKLIST;
    var cl = el("div", "checklist");
    cl.appendChild(el("h4", null, "🔍 Avant de regarder la solution — relis ton code :"));
    checks.forEach(function (crit) {
      var lab = document.createElement("label");
      lab.innerHTML = '<input type="checkbox"> <span>' + crit + "</span>";
      cl.appendChild(lab);
    });
    exo.appendChild(cl);

    /* ---- solution ---- */
    var solBtn = el("button", "reveal", "👁 Voir la solution");
    exo.appendChild(solBtn);
    var sol = el("div", "solution");
    var pre = el("pre", "pseudo");
    var code = document.createElement("code");
    code.textContent = x.solution;
    pre.appendChild(code);
    sol.appendChild(pre);
    if (x.note) sol.appendChild(el("p", "solnote", "💬 " + x.note));
    exo.appendChild(sol);
    solBtn.addEventListener("click", function () {
      var open = sol.classList.toggle("show");
      solBtn.textContent = open ? "🙈 Masquer la solution" : "👁 Voir la solution";
    });

    sec.appendChild(exo);
    wrap.appendChild(sec);
  });
})();
