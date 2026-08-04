/* ===========================================================================
 * vocab-synonymes.js — familles de synonymes FRANÇAIS.
 *
 * POURQUOI CE FICHIER EXISTE.
 * Le moteur exclut déjà tout distracteur qui partage une traduction EXACTE
 * avec le mot visé. Cela ne suffit pas. Exemple réel trouvé dans les lexiques
 * du site : « quick » se traduit « rapide » et « fast » aussi ; « spreken » et
 * « praten » donnent tous deux « parler » ; « laufen » et « rennen » donnent
 * « courir ». Mais on trouve aussi « salary » = salaire et « wage » = paie :
 * les deux chaînes DIFFÈRENT, donc l'exclusion exacte ne les voit pas, et le
 * QCM proposait « salaire » et « paie » comme deux options concurrentes.
 * L'élève qui coche « paie » a raison, et le site lui compte une erreur.
 *
 * On liste donc ici les familles de mots français interchangeables dans ce
 * contexte. Deux entrées dont les traductions tombent dans la même famille ne
 * peuvent jamais se retrouver dans le même QCM.
 *
 * CE FICHIER EST DÉLIBÉRÉMENT INCOMPLET : le français a plus de synonymes que
 * cette liste. Il couvre les collisions effectivement constatées dans les
 * quatre banques (contrôle automatique dans _verify_vocab.js) et se complète
 * au fil des signalements. Ajouter une famille ne casse rien : au pire le
 * vivier de distracteurs se réduit, et le moteur élargit tout seul.
 * =========================================================================== */
(function (global) {
  "use strict";

  var FAMILLES = [
    /* --- dire, penser, percevoir --- */
    ["parler", "discuter", "causer", "s'exprimer"],
    ["dire", "raconter", "relater"],
    ["penser", "croire", "estimer", "juger"],
    ["comprendre", "saisir"],
    ["expliquer", "exposer"],
    ["montrer", "indiquer", "signaler"],
    ["regarder", "observer"],
    ["répondre", "répliquer"],
    /* --- vouloir, agir --- */
    ["vouloir", "souhaiter", "désirer"],
    ["aimer", "adorer", "apprécier"],
    ["détester", "haïr"],
    ["essayer", "tenter"],
    ["choisir", "sélectionner"],
    ["commencer", "débuter", "entamer"],
    ["finir", "terminer", "achever"],
    ["arrêter", "cesser", "stopper"],
    ["donner", "offrir"],
    ["prendre", "saisir"],
    ["garder", "conserver"],
    ["chercher", "rechercher"],
    ["trouver", "découvrir"],
    ["envoyer", "expédier"],
    ["recevoir", "obtenir"],
    ["aider", "assister", "soutenir"],
    ["augmenter", "accroître", "croître"],
    ["diminuer", "réduire", "baisser"],
    ["marcher", "aller à pied", "cheminer"],
    ["courir", "filer"],
    /* --- qualités --- */
    ["beau", "joli", "magnifique", "superbe"],
    ["heureux", "content", "joyeux", "ravi"],
    ["triste", "malheureux"],
    ["rapide", "vite"],
    ["difficile", "dur", "compliqué", "ardu"],
    ["facile", "simple", "aisé"],
    ["grand", "gros", "vaste"],
    ["petit", "minuscule"],
    ["important", "essentiel", "capital", "crucial"],
    ["bizarre", "étrange", "curieux"],
    ["sûr", "certain", "sécurisé"],
    ["calme", "tranquille", "paisible"],
    ["fatigué", "épuisé"],
    ["cher", "coûteux", "onéreux"],
    ["bon marché", "pas cher", "abordable"],
    ["riche", "aisé", "fortuné"],
    ["pauvre", "démuni"],
    ["intelligent", "malin", "astucieux"],
    ["stupide", "bête", "idiot"],
    ["propre", "net"],
    ["sale", "crasseux"],
    ["large", "vaste"],
    ["plein", "rempli"],
    ["fort", "puissant", "robuste"],
    ["faible", "fragile"],
    ["utile", "pratique"],
    ["inutile", "vain"],
    ["nouveau", "neuf", "récent"],
    ["vieux", "ancien", "âgé"],
    /* --- choses et gens --- */
    ["travail", "emploi", "boulot", "poste"],
    ["maison", "logement", "domicile", "habitation"],
    ["voiture", "automobile"],
    ["magasin", "boutique", "commerce"],
    ["route", "chemin", "voie"],
    ["rue", "avenue"],
    ["ville", "cité"],
    ["erreur", "faute"],
    ["histoire", "récit"],
    ["ami", "copain"],
    ["enfant", "gamin", "gosse"],
    ["médecin", "docteur"],
    ["salaire", "paie", "paye", "rémunération"],
    ["entreprise", "société", "firme"],
    ["société", "collectivité"],
    ["publicité", "réclame", "annonce publicitaire"],
    ["journal", "quotidien"],
    ["but", "objectif", "cible"],
    /* --- sentiments et société --- */
    ["ennui", "lassitude"],
    ["peur", "crainte", "frayeur"],
    ["colère", "rage", "fureur", "énervement"],
    ["joie", "bonheur", "allégresse"],
    ["espoir", "espérance"],
    ["pays", "nation", "état"],
    ["loi", "règle", "règlement"],
    ["liberté", "indépendance"],
    ["guerre", "conflit"],
    ["paix", "concorde"],
    ["pauvreté", "misère", "indigence"]
  ];

  /* Même normalisation que vocab.js — parenthèses retirées, article initial
     retiré, accents neutralisés. Dupliquée ici pour que le fichier reste
     autonome (il est chargé avant vocab.js dans les pages). */
  function norm(s) {
    return String(s).toLowerCase().trim()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/\([^)]*\)/g, " ")
      .replace(/\s+/g, " ").trim()
      .replace(/^(le |la |les |l'|un |une |des |se |s')/, "");
  }

  // index : forme normalisée -> liste des numéros de famille (un mot peut
  // appartenir à deux familles, « société » par exemple).
  var INDEX = {};
  for (var i = 0; i < FAMILLES.length; i++) {
    for (var j = 0; j < FAMILLES[i].length; j++) {
      var k = norm(FAMILLES[i][j]);
      (INDEX[k] || (INDEX[k] = [])).push(i);
    }
  }

  function familles(mot) { return INDEX[norm(mot)] || []; }

  /* Deux traductions sont-elles interchangeables ? */
  function memeFamille(a, b) {
    var fa = familles(a), fb = familles(b);
    for (var x = 0; x < fa.length; x++) {
      for (var y = 0; y < fb.length; y++) if (fa[x] === fb[y]) return true;
    }
    return false;
  }

  /* Une des traductions de A est-elle interchangeable avec une de B ? */
  function entreesInterchangeables(tradsA, tradsB) {
    for (var a = 0; a < tradsA.length; a++) {
      for (var b = 0; b < tradsB.length; b++) {
        if (memeFamille(tradsA[a], tradsB[b])) return true;
      }
    }
    return false;
  }

  var API = {
    FAMILLES: FAMILLES,
    familles: familles,
    memeFamille: memeFamille,
    entreesInterchangeables: entreesInterchangeables
  };

  if (typeof module !== "undefined" && module.exports) module.exports = API;
  if (global) global.VocabSynonymes = API;
})(typeof window !== "undefined" ? window : globalThis);
