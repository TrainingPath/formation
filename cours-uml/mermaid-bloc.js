/* ===========================================================================
 * mermaid-bloc.js — Bloc « Visualiser ce diagramme » (cours UML)
 * ---------------------------------------------------------------------------
 * Injecté par le moteur, jamais recopié dans les leçons. Chaque leçon déclare
 * simplement un tableau DIAGRAMMES ; ce script fabrique les blocs.
 *
 * POURQUOI UN TABLEAU SÉPARÉ, ET PAS DU CODE DANS DAY.theory ?
 * DAY.theory est une template literal (délimitée par des backticks). Y insérer
 * du code de diagramme obligerait à échapper backticks et ${...}, avec un
 * risque réel de casser le parsing de la leçon. Les diagrammes vivent donc
 * dans DIAGRAMMES, où `code` est une chaîne JS ordinaire (avec des \n).
 *
 * FORMAT ATTENDU (dans la leçon, après le bloc DAY) :
 *   var DIAGRAMMES = [
 *     { apres: 2,                       // index 0-based du <pre class="pseudo"> visé
 *       titre: "Cas d'utilisation de la Ludothèque",
 *       outil: "mermaid",               // "mermaid" | "mermaid-approx" | "plantuml"
 *       code: "flowchart LR\n  A --> B",
 *       url:  "https://mermaid.live/edit#pako:..."   // pré-calculée hors ligne
 *     }
 *   ];
 *
 * Les URL sont PRÉ-CALCULÉES par _verify_mermaid.js (deflate + base64url pour
 * Mermaid, deflate brut + alphabet PlantUML pour PlantUML). Aucune bibliothèque
 * de compression n'est donc nécessaire dans le navigateur, et la CI peut
 * vérifier que chaque lien se décode exactement vers le code affiché à côté.
 * =========================================================================== */
(function () {
  "use strict";
  if (typeof DIAGRAMMES === "undefined" || !DIAGRAMMES.length) return;

  var MERMAID_CDN = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  var mermaidPret = null; // promesse de chargement, une seule fois par page

  /* --- styles, injectés une fois --- */
  var css = document.createElement("style");
  css.textContent =
    ".mb{margin:14px 0 18px;border:1px solid #cdd8ea;border-radius:12px;overflow:hidden;background:#fbfcfe}" +
    ".mb-h{background:#eef3fb;color:#1e2533;font-weight:700;padding:9px 14px;font-size:.92em;" +
      "display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;text-align:center}" +
    ".mb-tag{font-size:.78em;font-weight:700;padding:2px 9px;border-radius:999px;letter-spacing:.02em}" +
    ".mb-tag.m{background:#dbeafe;color:#1e3a8a}" +
    ".mb-tag.a{background:#fef3c7;color:#78350f}" +
    ".mb-tag.p{background:#ede9fe;color:#4c1d95}" +
    ".mb-b{padding:12px 14px}" +
    ".mb pre{margin:0 0 10px;padding:11px 13px;border-radius:8px;background:#0f1420;color:#c7f0d8;" +
      "white-space:pre-wrap;word-break:break-word;font:.86em/1.5 ui-monospace,Menlo,Consolas,monospace;text-align:left}" +
    ".mb-act{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:10px}" +
    ".mb-btn{background:#3557d4;color:#fff;border:0;border-radius:999px;padding:8px 16px;" +
      "font-weight:700;font-size:.88em;cursor:pointer;text-decoration:none;display:inline-block}" +
    ".mb-btn.sec{background:#eef1f6;color:#334155}" +
    ".mb-render{margin:10px 0 0;text-align:center;overflow-x:auto}" +
    ".mb-render svg{max-width:100%;height:auto}" +
    ".mb-note{background:#fdf7e7;border-top:1px solid #e4c98a;color:#5c4a1e;padding:9px 14px;" +
      "font-size:.86em;text-align:center;font-style:italic}" +
    ".mb-approx{background:#fff7ed;border-left:4px solid #ea9a3e;color:#7c2d12;padding:8px 12px;" +
      "border-radius:0;margin:0 0 10px;font-size:.87em;text-align:center}" +
    ".mb-err{color:#7a2020;font-size:.86em;text-align:center;margin:6px 0 0}";
  document.head.appendChild(css);

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined) e.textContent = txt;
    return e;
  }

  /* --- chargement paresseux de Mermaid (comme Pyodide : au clic, pas avant) --- */
  function chargerMermaid() {
    if (mermaidPret) return mermaidPret;
    mermaidPret = import(MERMAID_CDN).then(function (m) {
      var api = m.default || m;
      api.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" });
      return api;
    });
    return mermaidPret;
  }

  var compteur = 0;

  function construire(d) {
    var outil = d.outil || "mermaid";
    var estPlant = outil === "plantuml";
    var estApprox = outil === "mermaid-approx";

    var box = el("div", "mb");

    var head = el("div", "mb-h");
    head.appendChild(el("span", null, "🧪 Visualiser ce diagramme" + (d.titre ? " — " + d.titre : "")));
    var tag = el("span", "mb-tag " + (estPlant ? "p" : estApprox ? "a" : "m"),
      estPlant ? "PlantUML" : estApprox ? "Mermaid — approximation" : "Mermaid");
    head.appendChild(tag);
    box.appendChild(head);

    var body = el("div", "mb-b");

    if (estApprox) {
      body.appendChild(el("div", "mb-approx",
        "Approximation visuelle : Mermaid ne connaît pas ce type de diagramme UML. " +
        "La notation officielle est celle de la théorie ci-dessus."));
    }

    var pre = el("pre", null, d.code);
    body.appendChild(pre);

    var act = el("div", "mb-act");

    var bCopier = el("button", "mb-btn sec", "📋 Copier le code");
    bCopier.addEventListener("click", function () {
      var fini = function () {
        bCopier.textContent = "✅ Copié";
        setTimeout(function () { bCopier.textContent = "📋 Copier le code"; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(d.code).then(fini, function () { secours(); });
      } else { secours(); }
      function secours() {
        var t = document.createElement("textarea");
        t.value = d.code; document.body.appendChild(t); t.select();
        try { document.execCommand("copy"); fini(); } catch (e) {}
        document.body.removeChild(t);
      }
    });
    act.appendChild(bCopier);

    var lien = el("a", "mb-btn", estPlant ? "▶ Ouvrir dans PlantUML" : "▶ Ouvrir dans Mermaid Live");
    lien.href = d.url;
    lien.target = "_blank";
    lien.rel = "noopener";
    act.appendChild(lien);

    // Rendu inline : amélioration progressive, uniquement pour Mermaid.
    var zone = el("div", "mb-render");
    if (!estPlant) {
      var bRendre = el("button", "mb-btn sec", "👁 Afficher le rendu ici");
      bRendre.addEventListener("click", function () {
        bRendre.disabled = true;
        bRendre.textContent = "⏳ Chargement…";
        chargerMermaid().then(function (api) {
          return api.render("mb-svg-" + (++compteur), d.code);
        }).then(function (res) {
          zone.innerHTML = res.svg;
          bRendre.style.display = "none";
        }).catch(function (err) {
          bRendre.disabled = false;
          bRendre.textContent = "👁 Afficher le rendu ici";
          zone.innerHTML = "";
          zone.appendChild(el("p", "mb-err",
            "Le rendu n'a pas pu être chargé (pas de connexion ?). " +
            "Le code ci-dessus et le lien restent utilisables."));
        });
      });
      act.appendChild(bRendre);
    }

    body.appendChild(act);
    body.appendChild(zone);
    box.appendChild(body);

    box.appendChild(el("div", "mb-note",
      "Mermaid t'aide à VOIR le diagramme ; à l'examen, tu dessines la notation UML officielle " +
      "montrée dans la théorie — les deux peuvent différer sur des détails."));

    return box;
  }

  /* --- insertion : après le <pre class="pseudo"> d'index `apres` --- */
  function poser() {
    var pres = document.querySelectorAll(".theory pre.pseudo, #theory pre.pseudo, pre.pseudo");
    DIAGRAMMES.forEach(function (d) {
      var bloc = construire(d);
      var cible = (typeof d.apres === "number") ? pres[d.apres] : null;
      if (cible && cible.parentNode) {
        cible.parentNode.insertBefore(bloc, cible.nextSibling);
      } else {
        // pas d'ancre trouvée : on place en fin de théorie plutôt que de perdre le bloc
        var host = document.querySelector(".theory") || document.querySelector("#theory");
        if (host) host.appendChild(bloc);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", poser);
  } else {
    poser();
  }
})();
