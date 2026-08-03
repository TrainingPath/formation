#!/usr/bin/env node
/*
 * _verify_placement.js — Vérificateur du test de placement (famille _verify).
 *
 * La logique de placement est du CODE : elle se teste. Ce script exécute
 * test-niveau.js sous Node avec des personas simulés, et contrôle les quatre
 * banques de questions.
 *
 * MAPPING TESTÉ (celui documenté en tête de test-niveau.js) :
 *   le palier recommandé est celui du PREMIER bloc non franchement réussi.
 *     - réussir A2 puis échouer B1        -> B1
 *     - échouer A2 puis réussir A1        -> A2
 *     - tout réussir                      -> B2 + mention "le site s'arrête à B2"
 *     - 0 bonne réponse                   -> A1 par sortie rapide, en <= 8 questions
 *     - cas limite (réussite de justesse) -> on NE monte PAS : palier inférieur
 *
 * Sortie : rapport lisible, code retour non-zéro au moindre échec.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const T = require("./test-niveau.js");
const LANGUES = ["anglais", "neerlandais", "espagnol", "allemand"];
const PALIERS = ["A1", "A2", "B1", "B2"];

const problemes = [];
const notes = [];
function ko(cat, msg) { problemes.push("[" + cat + "] " + msg); }

/* ------------------------------------------------------------------ */
/* Outils : un « répondeur » simulé                                    */
/* ------------------------------------------------------------------ */

// rand déterministe pour que les tirages soient reproductibles en CI
function randDeterministe(graine) {
  let s = graine >>> 0;
  return function () { s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}

/*
 * Joue une session complète. `strategie(question, palier)` retourne la réponse
 * à donner. Retourne le résultat final + le nombre de questions posées.
 */
function jouer(banque, strategie, graine) {
  const s = T.creerSession(banque, { rand: randDeterministe(graine || 12345) });
  let garde = 0;
  while (!s.estTermine() && garde++ < 100) {
    const q = s.questionCourante();
    s.repondre(strategie(q, s.etat.palierCourant));
  }
  return { resultat: s.resultat(), posees: s.etat.totalPosees };
}

// Réponses « toujours justes » / « toujours fausses » pour un type donné
function bonneReponse(q) { return q.type === "qcm" ? true : (q.a && q.a[0]); }
function mauvaiseReponse(q) { return q.type === "qcm" ? false : "zzzz"; }

/*
 * Stratégie : réussit franchement les paliers listés, échoue les autres.
 * « Franchement » = tout juste (8/8).
 */
function strategieMaitrise(paliersAcquis) {
  return function (q, palier) {
    return paliersAcquis.indexOf(palier) !== -1 ? bonneReponse(q) : mauvaiseReponse(q);
  };
}

/*
 * Stratégie « de justesse » sur un palier : exactement 6/8.
 * Le bloc est servi saisies d'abord (2), puis 4 QCM.
 * 1 saisie juste (2 pts) + 4 QCM justes (4 pts) = 6 pts -> PASS_JUSTE.
 */
function strategieJustesse(palierCible, paliersAcquisAvant) {
  const vus = {};
  return function (q, palier) {
    if (paliersAcquisAvant.indexOf(palier) !== -1) return bonneReponse(q);
    if (palier !== palierCible) return mauvaiseReponse(q);
    vus[palier] = (vus[palier] || 0) + 1;
    const n = vus[palier];
    if (q.type === "saisie") return n === 1 ? bonneReponse(q) : mauvaiseReponse(q); // 1re juste, 2e fausse
    return true; // les 4 QCM justes
  };
}

/* ------------------------------------------------------------------ */
/* 1. Les personas                                                     */
/* ------------------------------------------------------------------ */
function testerPersonas(langue, banque) {
  const P = "PERSONA/" + langue;

  // a) La débutante complète : aucune bonne réponse.
  {
    const r = jouer(banque, () => mauvaiseReponse({ type: "qcm" }), 7);
    if (r.resultat.palier !== "A1") ko(P, "débutante -> " + r.resultat.palier + " (attendu A1)");
    if (!r.resultat.sortieRapide) ko(P, "débutante : la sortie rapide ne s'est pas déclenchée");
    if (r.posees > 8) ko(P, "débutante : " + r.posees + " questions posées (max 8)");
    notes.push(langue + " · débutante -> " + r.resultat.palier +
      " en " + r.posees + " questions (sortie rapide : " + (r.resultat.sortieRapide ? "oui" : "non") + ")");
  }

  // b) A2 acquis, B1 non : réussir A2 = A2 acquis -> entrée B1 ; échouer B1 confirme B1.
  {
    const r = jouer(banque, strategieMaitrise(["A2"]), 11);
    if (r.resultat.palier !== "B1") ko(P, "A2 solide -> " + r.resultat.palier + " (attendu B1)");
    notes.push(langue + " · A2 solide, B1 échoué -> " + r.resultat.palier + " (" + r.posees + " q)");
  }

  // c) A1 acquis mais A2 non -> entrée A2.
  //    L'élève trouve la 1re question d'A2 (donc pas de sortie rapide : il n'est
  //    pas débutant complet), rate le reste du bloc A2, puis réussit le bloc A1.
  {
    let vuA2 = 0;
    const strat = (q, palier) => {
      if (palier === "A1") return bonneReponse(q);
      vuA2++;
      return vuA2 === 1 ? bonneReponse(q) : mauvaiseReponse(q);
    };
    const r = jouer(banque, strat, 13);
    if (r.resultat.palier !== "A2") ko(P, "A1 solide -> " + r.resultat.palier + " (attendu A2)");
    notes.push(langue + " · A1 solide, A2 échoué -> " + r.resultat.palier + " (" + r.posees + " q)");
  }

  // c bis) Le garde-fou de la sortie rapide : une seule bonne réponse au départ
  //        doit suffire à empêcher l'arrêt prématuré.
  {
    let n = 0;
    const strat = (q) => { n++; return n === 1 ? bonneReponse(q) : mauvaiseReponse(q); };
    const r = jouer(banque, strat, 37);
    if (r.resultat.sortieRapide) ko(P, "sortie rapide déclenchée alors qu'une réponse était juste");
    notes.push(langue + " · 1 bonne réponse puis échec -> " + r.resultat.palier +
      ", pas de sortie rapide (" + r.posees + " q)");
  }

  // d) A2 et B1 acquis, B2 non -> entrée B2.
  {
    const r = jouer(banque, strategieMaitrise(["A2", "B1"]), 17);
    if (r.resultat.palier !== "B2") ko(P, "B1 solide -> " + r.resultat.palier + " (attendu B2)");
    notes.push(langue + " · A2+B1 acquis, B2 échoué -> " + r.resultat.palier + " (" + r.posees + " q)");
  }

  // e) Réussit tout -> B2 + mention plafond.
  {
    const r = jouer(banque, strategieMaitrise(["A1", "A2", "B1", "B2"]), 19);
    if (r.resultat.palier !== "B2") ko(P, "expert -> " + r.resultat.palier + " (attendu B2)");
    if (!r.resultat.plafond) ko(P, "expert : mention « le site s'arrête à B2 » absente");
    if (r.posees > 25) ko(P, "expert : " + r.posees + " questions (plafond 25)");
    notes.push(langue + " · réussit tout -> " + r.resultat.palier +
      " + mention plafond (" + r.posees + " q)");
  }

  // f) CAS LIMITE : A2 réussi de justesse (6/8) -> on NE monte PAS, on reste A2.
  {
    const r = jouer(banque, strategieJustesse("A2", []), 23);
    if (r.resultat.palier !== "A2") ko(P, "A2 de justesse -> " + r.resultat.palier + " (attendu A2, règle du doute)");
    notes.push(langue + " · A2 réussi de justesse -> " + r.resultat.palier + " (règle du doute : pas de montée)");
  }

  // g) CAS LIMITE : A2 franchement réussi, B1 de justesse -> B1 (pas B2).
  {
    const r = jouer(banque, strategieJustesse("B1", ["A2"]), 29);
    if (r.resultat.palier !== "B1") ko(P, "B1 de justesse -> " + r.resultat.palier + " (attendu B1, règle du doute)");
    notes.push(langue + " · B1 réussi de justesse -> " + r.resultat.palier + " (règle du doute)");
  }

  // h) Un bloc ne doit JAMAIS pouvoir être réussi par les seuls QCM.
  {
    const seulsQcm = (q) => (q.type === "qcm" ? true : "zzzz");
    const r = jouer(banque, seulsQcm, 31);
    if (r.resultat.palier !== "A1") {
      ko(P, "QCM seuls (4/8, 0 saisie) -> " + r.resultat.palier + " : un bloc a été réussi sans saisie libre");
    }
    notes.push(langue + " · QCM seuls, aucune saisie -> " + r.resultat.palier + " (anti-hasard OK)");
  }
}

/* ------------------------------------------------------------------ */
/* 2. Les banques                                                      */
/* ------------------------------------------------------------------ */
function testerBanque(langue, banque) {
  const B = "BANQUE/" + langue;
  if (!banque || !Array.isArray(banque.questions)) { ko(B, "banque illisible"); return; }
  if (banque.langue !== langue) ko(B, "champ langue = " + banque.langue + " (attendu " + langue + ")");

  const vus = new Set();
  for (const p of PALIERS) {
    const pool = banque.questions.filter(q => q.palier === p);
    const qcm = pool.filter(q => q.type === "qcm");
    const sai = pool.filter(q => q.type === "saisie");
    // Il faut de quoi tirer un bloc (4 QCM + 2 saisies) avec de la variété.
    if (pool.length < 10) ko(B, p + " : " + pool.length + " questions (minimum 10 pour varier le tirage)");
    if (qcm.length < 6) ko(B, p + " : " + qcm.length + " QCM (minimum 6, il en faut 4 par bloc)");
    if (sai.length < 3) ko(B, p + " : " + sai.length + " saisies (minimum 3, il en faut 2 par bloc)");
  }

  for (const q of banque.questions) {
    const id = langue + "/" + q.palier + "/" + String(q.q).slice(0, 45);
    if (PALIERS.indexOf(q.palier) === -1) ko(B, id + " : palier invalide");
    if (!q.point) ko(B, id + " : champ « point » (point de syllabus visé) manquant");
    if (!q.q) ko(B, id + " : énoncé vide");
    if (q.type === "qcm") {
      if (!Array.isArray(q.opts) || q.opts.length !== 4) ko(B, id + " : " + (q.opts || []).length + " options (attendu 4)");
      if (typeof q.a !== "number" || q.a < 0 || q.a >= (q.opts || []).length) ko(B, id + " : index de réponse invalide");
      if (new Set(q.opts).size !== (q.opts || []).length) ko(B, id + " : options en double");
    } else if (q.type === "saisie") {
      if (!Array.isArray(q.a) || q.a.length === 0) ko(B, id + " : réponses acceptées absentes");
      if (!q.ph) ko(B, id + " : indice de format (ph) manquant");
    } else ko(B, id + " : type inconnu (" + q.type + ")");

    const cle = T.norm(q.q);
    if (vus.has(cle)) ko(B, id + " : énoncé en double dans la banque");
    vus.add(cle);
  }

  // Le mélange déterministe doit préserver la bonne réponse.
  for (const q of banque.questions.filter(x => x.type === "qcm")) {
    const items = T.melangerOptions(q);
    const justes = items.filter(i => i.correct);
    if (justes.length !== 1) ko(B, "mélange : " + q.q.slice(0, 40) + " -> " + justes.length + " bonne(s) réponse(s)");
    else if (justes[0].text !== q.opts[q.a]) ko(B, "mélange : bonne réponse altérée sur « " + q.q.slice(0, 40) + " »");
  }
}

/* ------------------------------------------------------------------ */
/* 3. Aucune question recopiée des leçons                              */
/* ------------------------------------------------------------------ */
function testerNonContamination(langue, banque) {
  const C = "CONTAMINATION/" + langue;
  const enonces = new Set();
  for (const niv of ["a1", "a2", "b1", "b2"]) {
    const dir = path.join(__dirname, "cours-" + langue + "-" + niv);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!/\.(html|js)$/.test(f)) continue;
      const txt = fs.readFileSync(path.join(dir, f), "utf8");
      // récupère tous les énoncés q: "..." des leçons, ateliers et examens
      const re = /\bq\s*:\s*"((?:[^"\\]|\\.)*)"/g;
      let m;
      while ((m = re.exec(txt)) !== null) {
        const v = T.norm(m[1].replace(/\\"/g, '"'));
        if (v.length > 12) enonces.add(v);
      }
    }
  }
  let collisions = 0;
  for (const q of banque.questions) {
    if (enonces.has(T.norm(q.q))) {
      collisions++;
      ko(C, "énoncé identique à une question des cours : « " + String(q.q).slice(0, 60) + " »");
    }
  }
  notes.push(langue + " · " + banque.questions.length + " questions confrontées à " +
    enonces.size + " énoncés des cours -> " + collisions + " recouvrement(s)");
}

/* ------------------------------------------------------------------ */
/* Exécution                                                           */
/* ------------------------------------------------------------------ */
for (const langue of LANGUES) {
  const f = path.join(__dirname, "test-niveau-" + langue + ".js");
  if (!fs.existsSync(f)) { ko("BANQUE", "fichier manquant : " + path.basename(f)); continue; }
  let banque;
  try { banque = require(f); } catch (e) { ko("BANQUE", langue + " : " + e.message); continue; }
  testerBanque(langue, banque);
  testerPersonas(langue, banque);
  testerNonContamination(langue, banque);
}

console.log("=== _verify_placement.js — rapport ===");
console.log("Seuils : " + JSON.stringify(T.SEUILS));
for (const n of notes) console.log("· " + n);
console.log("");
if (problemes.length === 0) {
  console.log("✅ Placement conforme : personas, banques et non-contamination.");
  process.exit(0);
}
console.log("❌ " + problemes.length + " problème(s) :");
for (const p of problemes) console.log("   - " + p);
process.exit(1);
