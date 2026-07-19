/* ===== Fil rouge — rend l'étape du jour du projet Ludothèque dans chaque leçon ===== */
(function () {
  "use strict";
  if (typeof DAY === "undefined") return;
  if (typeof FIL === "undefined" || !FIL.etapes) return;
  var step = FIL.etapes[DAY.num];
  if (!step) return;
  var wrap = document.querySelector(".wrap");
  if (!wrap) return;

  var css = document.createElement("style");
  css.textContent =
    "section.filrouge{border:3px solid var(--accent);background:linear-gradient(180deg,var(--accent-soft),transparent 120px)}" +
    "section.filrouge h2{color:var(--accent);border-bottom-color:var(--accent-soft)}" +
    ".fr-etat{background:var(--card-2,#f7f7fb);border-left:4px solid var(--muted,#999);padding:10px 14px;border-radius:0 8px 8px 0;margin:12px 0}" +
    ".fr-obj{background:var(--accent-soft);border-left:4px solid var(--accent);padding:10px 14px;border-radius:0 8px 8px 0;margin:12px 0}" +
    ".fr-tag{display:inline-block;font-size:.78em;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--accent);margin-bottom:4px}" +
    ".filrouge .btnrow{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}" +
    ".filrouge .hint{background:var(--card-2,#f7f7fb);border-left:4px solid var(--accent);padding:8px 12px;border-radius:0 8px 8px 0;margin-top:10px}" +
    ".filrouge textarea{min-height:170px;margin-top:10px;width:100%;box-sizing:border-box}" +
    ".filrouge .solnote{color:var(--muted);font-size:.9em;margin:6px 0 0}" +
    ".filrouge button:disabled{opacity:.55;cursor:default}";
  document.head.appendChild(css);

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  var sec = el("section", "card filrouge");
  sec.appendChild(el("h2", null, "🧵 Fil rouge — " + (FIL.app || "Le projet") +
    ' <span style="font-weight:400;font-size:.7em;color:var(--muted)">étape ' + DAY.num + "/21</span>"));
  sec.appendChild(el("p", null, "Un seul projet, construit du premier au dernier jour. Aujourd'hui, on applique la leçon à <strong>" + (step.titre || "l'application") + "</strong>."));

  sec.appendChild(el("div", "fr-etat", '<span class="fr-tag">Où en est le projet</span>' + (step.etat || "")));
  sec.appendChild(el("div", "fr-obj", '<span class="fr-tag">Ta mission du jour</span>' + (step.objectif || "")));

  var exo = el("div", "exo");
  exo.appendChild(el("p", "solnote", "Écris ta solution ci-dessous (sauvegardée automatiquement). Regarde les indices si tu bloques, la solution seulement après avoir essayé."));
  var ta = document.createElement("textarea");
  ta.placeholder = FIL.placeholder || "Écris ton code ici…";
  ta.spellcheck = false;
  var key = "fr-" + (FIL.prefix || "x") + "-l" + DAY.num;
  try { ta.value = localStorage.getItem(key) || ""; } catch (e) {}
  ta.addEventListener("input", function () { try { localStorage.setItem(key, ta.value); } catch (e) {} });
  exo.appendChild(ta);

  var btns = el("div", "btnrow");
  var hints = step.hints || [];
  var hintBtn = el("button", "check", "💡 Indice (0/" + hints.length + ")");
  var solBtn = el("button", "reveal", "👁 Voir la solution");
  if (hints.length) btns.appendChild(hintBtn);
  btns.appendChild(solBtn);
  exo.appendChild(btns);

  var hintBox = el("div", "hints");
  exo.appendChild(hintBox);
  var shown = 0;
  hintBtn.addEventListener("click", function () {
    if (shown >= hints.length) return;
    hintBox.appendChild(el("div", "hint", "<strong>Indice " + (shown + 1) + " :</strong> " + hints[shown]));
    shown++;
    if (shown >= hints.length) { hintBtn.textContent = "💡 Tous les indices affichés"; hintBtn.disabled = true; }
    else { hintBtn.textContent = "💡 Indice (" + shown + "/" + hints.length + ")"; }
  });

  var sol = el("div", "solution");
  var pre = el("pre", "pseudo");
  var code = document.createElement("code");
  code.textContent = step.solution || "";
  pre.appendChild(code);
  sol.appendChild(pre);
  if (step.note) sol.appendChild(el("p", "solnote", "💬 " + step.note));
  exo.appendChild(sol);
  solBtn.addEventListener("click", function () {
    var open = sol.classList.toggle("show");
    solBtn.textContent = open ? "🙈 Masquer la solution" : "👁 Voir la solution";
  });

  sec.appendChild(exo);
  wrap.appendChild(sec);
})();
