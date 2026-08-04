/* ===========================================================================
 * signalement.js — LE point de configuration du canal de signalement d'erreur.
 *
 * ---------------------------------------------------------------------------
 * 👉 CE QUE TU AS À FAIRE : remplir URL_SIGNALEMENT ci-dessous. C'est tout.
 * ---------------------------------------------------------------------------
 *
 * POURQUOI CE FICHIER EXISTE.
 * Les 82 sommaires de cours et les 4 pages de vocabulaire proposaient
 * « ⚠️ Signaler une erreur » vers une issue GitHub du dépôt. Le site est
 * PUBLIC : un visiteur aurait dû se créer un compte GitHub pour signaler une
 * faute, et le dépôt était exposé à tout le monde. Mauvaise idée.
 *
 * Le site est 100 % statique : aucun serveur ne peut recevoir un signalement.
 * Il reste donc un formulaire hébergé (Google Forms, Framaforms, Framadate…),
 * que le visiteur remplit sans compte ni installation. Colle son URL ci-dessous.
 *
 * TANT QUE LA CONSTANTE EST VIDE, AUCUN LIEN N'EST AFFICHÉ nulle part.
 * Rien vaut mieux qu'un lien mort : une page qui promet un canal de
 * signalement inexistant est pire qu'une page qui n'en promet aucun.
 *
 * OPTION — pré-remplir le cours concerné.
 * Si ton formulaire accepte un paramètre dans l'URL, mets {cours} dedans :
 *     var URL_SIGNALEMENT = "https://.../viewform?usp=pp_url&entry.123456={cours}";
 * {cours} sera remplacé par l'identifiant du cours (ex. cours-python).
 * Sans {cours}, le lien reste identique partout et le nom du cours est
 * simplement affiché à côté, pour que le visiteur sache quoi recopier.
 *
 * Pour obtenir un lien pré-rempli sur Google Forms : ouvre ton formulaire →
 * menu ⋮ → « Obtenir un lien pré-rempli » → tape n'importe quoi dans le champ
 * « cours » → copie le lien, et remplace ta saisie par {cours}.
 * =========================================================================== */
(function (global) {
  "use strict";

  var URL_SIGNALEMENT = "";

  /* ------------------------------------------------------------------ */

  function configure() { return !!URL_SIGNALEMENT; }

  /* URL du formulaire pour un cours donné (cours facultatif). */
  function url(cours) {
    if (!URL_SIGNALEMENT) return null;
    return URL_SIGNALEMENT.indexOf("{cours}") !== -1
      ? URL_SIGNALEMENT.replace(/\{cours\}/g, encodeURIComponent(cours || ""))
      : URL_SIGNALEMENT;
  }

  /* HTML du lien, ou chaîne vide si rien n'est configuré. */
  function lien(cours, libelle) {
    var u = url(cours);
    if (!u) return "";
    var texte = libelle || "⚠️ Signaler une erreur dans ce cours";
    // Le nom du cours n'est affiché que si le formulaire ne le reçoit pas
    // tout seul : sinon on demande au visiteur de recopier ce que le
    // formulaire connaît déjà.
    // Styles en ligne : les 82 sommaires ont chacun leur style.css, on ne va
    // pas y ajouter deux règles 82 fois. Les classes restent posées pour qui
    // voudrait surcharger.
    var gris = " style=\"color:#7a8699\"";
    var rappel = (cours && URL_SIGNALEMENT.indexOf("{cours}") === -1)
      ? " <span class=\"signal-cours\"" + gris + ">(cours : " + cours + ")</span>" : "";
    return "<a href=\"" + u + "\" target=\"_blank\" rel=\"noopener\" " +
           "style=\"color:#b3541e;text-decoration:none\">" + texte + "</a>" + rappel +
           " <span class=\"signal-note\"" + gris + ">— formulaire, aucun compte requis</span>";
  }

  /* Remplit tous les emplacements <… data-signalement="cours-xxx"> de la page.
     Appelé automatiquement au chargement ; sans configuration, ne fait rien,
     et les emplacements restent vides donc invisibles. */
  function monter(racine) {
    if (!URL_SIGNALEMENT || typeof document === "undefined") return 0;
    var cibles = (racine || document).querySelectorAll("[data-signalement]");
    for (var i = 0; i < cibles.length; i++) {
      cibles[i].innerHTML = lien(cibles[i].getAttribute("data-signalement"));
    }
    return cibles.length;
  }

  var API = { configure: configure, url: url, lien: lien, monter: monter };

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () { monter(); });
    } else { monter(); }
  }

  if (typeof module !== "undefined" && module.exports) module.exports = API;
  if (global) global.Signalement = API;
})(typeof window !== "undefined" ? window : globalThis);
