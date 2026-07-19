/* ===== Exercices d'écriture intégrés à la leçon — rend l'objet ECRITURE en fin de page ===== */
(function () {
  "use strict";
  if (typeof ECRITURE === "undefined" || !ECRITURE.items || !ECRITURE.items.length) return;
  var wrap = document.querySelector(".wrap");
  if (!wrap) return;

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
    ".ecriture textarea{min-height:180px;margin-top:10px}" +
    ".ecriture .q pre.pseudo{font-weight:normal}";
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

  ECRITURE.items.forEach(function (x) {
    var sec = el("section", "card ecriture");
    sec.appendChild(el("h2", null,
      "✍️ Exercice d'écriture — " + x.title + '<span class="lvl" title="Difficulté">' + stars(x.level) + "</span>"));

    var exo = el("div", "exo");
    exo.appendChild(el("div", "q", x.statement));
    exo.appendChild(el("p", "solnote",
      "Écris ta réponse ci-dessous (sauvegardée automatiquement). Utilise les indices si tu bloques, et ne regarde la solution qu'après avoir vraiment essayé."));

    var ta = document.createElement("textarea");
    ta.placeholder = ECRITURE.placeholder || "Écris ta réponse ici…";
    ta.spellcheck = false;
    var key = "ecr-" + x.id;
    try { ta.value = localStorage.getItem(key) || ""; } catch (e) {}
    ta.addEventListener("input", function () {
      try { localStorage.setItem(key, ta.value); } catch (e) {}
    });
    exo.appendChild(ta);

    var btns = el("div", "btnrow");
    var hintBtn = el("button", "check", "💡 Indice (0/" + x.hints.length + ")");
    var solBtn = el("button", "reveal", "👁 Voir la solution");
    btns.appendChild(hintBtn);
    btns.appendChild(solBtn);
    exo.appendChild(btns);

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
