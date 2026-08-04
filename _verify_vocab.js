#!/usr/bin/env node
/*
 * _verify_vocab.js — Vérificateur des banques de vocabulaire (famille _verify).
 *
 * Le risque n°1 de ce module est une banque « générée de mémoire » : des
 * traductions inventées, apprises par cœur par une élève confiante. La parade
 * retenue est structurelle : la banque est ENTIÈREMENT dérivée des lexiques
 * déjà enseignés par le site (vocabgen.py), donc aucune traduction n'est créée
 * ici. Ce script vérifie que cette propriété tient, et que les questions
 * générées ne peuvent pas être cassées.
 *
 * Contrôles :
 *   1. Schéma et intégrité : champs requis, niveau et catégorie connus,
 *      aucun mot en double ; décompte par niveau et par catégorie journalisé.
 *   2. Anti-question-cassée : pour chaque mot, AUCUN distracteur possible
 *      (même catégorie + même classe) ne partage une traduction avec lui ni
 *      n'appartient à ses `pieges` — contrôlé dans les DEUX sens. Chaque mot
 *      marqué `polysemique` a bien un `contexte`.
 *   3. Cohérence lexiques <-> banque : chaque mot des lexique.html des 4
 *      niveaux se retrouve dans la banque avec une traduction concordante.
 *   4. Logique Leitner testée par personas (mot raté -> boîte 1 ; trois
 *      réussites -> acquis ; la révision sert les boîtes basses).
 */
"use strict";
const fs = require("fs");
const path = require("path");

const LANGUES = ["neerlandais", "anglais", "espagnol", "allemand"];
const NIVEAUX = ["A1", "A2", "B1", "B2"];
const CATEGORIES = [
  "famille", "nourriture", "maison", "corps-sante", "travail-etudes",
  "transports-voyage", "ville", "temps-meteo", "nombres-dates", "vetements",
  "loisirs-sport", "nature-environnement", "sentiments", "communication",
  "verbes", "adjectifs", "mots-outils", "societe-actualite", "expressions", "divers"
];
const CLASSES = ["nom", "verbe", "adjectif", "mot-outil", "expression"];

const problemes = [];
const notes = [];
function ko(m) { problemes.push(m); }

// Familles de synonymes français : sans elles, le moteur laisserait cohabiter
// « salaire » et « paie » dans le même QCM. Son absence est un échec, pas un
// avertissement — sinon la protection pourrait disparaître sans que rien ne
// s'allume.
let SYN = null;
try { SYN = require("./vocab-synonymes.js"); }
catch (e) { ko("vocab-synonymes.js introuvable — l'exclusion des distracteurs " +
                "synonymes ne s'applique plus (" + e.message + ")"); }

// Le moteur lui-même : on ne se contente pas de raisonner sur la banque, on
// lui fait produire toutes les questions et on les inspecte (épreuve du feu).
let MOTEUR = null;
try { MOTEUR = require("./vocab.js"); } catch (e) { MOTEUR = null; }

// Identique à norm() de vocab.js — y compris le retrait des parenthèses, sans
// lequel « bonjour (le matin) » et « bonjour » passeraient pour deux réponses
// distinctes et cohabiteraient dans un même QCM.
function norm(s) {
  return String(s).toLowerCase().trim()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ").trim()
    .replace(/^(le |la |les |l'|un |une |des |se |s')/, "");
}

/* ------------------------------------------------------------------ */
/* 1-2. Schéma, intégrité, anti-question-cassée                        */
/* ------------------------------------------------------------------ */
function verifierBanque(langue, banque) {
  const L = "[" + langue + "]";
  const parNiveau = {}, parCategorie = {}, vus = new Map();

  for (const e of banque) {
    const id = L + " « " + e.mot + " »";
    if (!e.mot || !String(e.mot).trim()) { ko(L + " entrée sans mot"); continue; }
    if (!Array.isArray(e.traductions) || !e.traductions.length) ko(id + " : aucune traduction");
    if (NIVEAUX.indexOf(e.niveau) === -1) ko(id + " : niveau inconnu (" + e.niveau + ")");
    if (CATEGORIES.indexOf(e.categorie) === -1) ko(id + " : catégorie inconnue (" + e.categorie + ")");
    if (CLASSES.indexOf(e.classe) === -1) ko(id + " : classe inconnue (" + e.classe + ")");
    if (e.polysemique && !e.contexte) ko(id + " : polysémique SANS contexte — question cassée par construction");

    const k = norm(e.mot);
    if (vus.has(k)) ko(id + " : mot en double dans la banque");
    else vus.set(k, e);

    parNiveau[e.niveau] = (parNiveau[e.niveau] || 0) + 1;
    parCategorie[e.categorie] = (parCategorie[e.categorie] || 0) + 1;
  }

  // Anti-question-cassée : on simule le vivier de distracteurs du moteur.
  // Deux ambiguïtés sont traquées : la traduction IDENTIQUE et la traduction
  // SYNONYME (« salary » = salaire / « wage » = paie : deux chaînes, une seule
  // bonne réponse pour l'élève). Les synonymes en même vivier sont comptés à
  // part et signalés : ils doivent tous être neutralisés par vocab-synonymes.js.
  let motsSansVivier = 0, ambigus = 0;
  for (const e of banque) {
    const miennes = new Set(e.traductions.map(norm));
    const pieges = new Set((e.pieges || []).map(norm));
    const toutes = e.traductions.concat(e.pieges || []);
    const vivier = banque.filter(o =>
      o !== e && o.categorie === e.categorie && o.classe === e.classe);

    let utilisables = 0;
    for (const o of vivier) {
      const siennes = o.traductions.map(norm);
      // sens langue -> FR : le distracteur est une traduction française
      const collision = siennes.some(t => miennes.has(t) || pieges.has(t));
      // sens FR -> langue : le distracteur est un mot de la langue cible
      const collisionInverse = miennes.has(norm(o.mot));
      if (collision || collisionInverse) continue;   // exclu mécaniquement
      if (SYN && SYN.entreesInterchangeables(toutes, o.traductions)) {
        // Ambiguïté réelle, mais neutralisée par vocab-synonymes.js : le moteur
        // applique exactement le même test. On la compte, on ne la déclare pas
        // en échec — c'est une paire couverte, pas une paire oubliée.
        ambigus++;
        continue;
      }
      utilisables++;
    }
    if (utilisables < 3) {
      motsSansVivier++;
      if (motsSansVivier <= 5) {
        notes.push(L + " ⚠ « " + e.mot + " » (" + e.categorie + "/" + e.classe +
          ") : seulement " + utilisables + " distracteur(s) utilisable(s)");
      }
    }
  }
  if (motsSansVivier) {
    notes.push(L + " " + motsSansVivier + " mot(s) avec moins de 3 distracteurs dans leur " +
      "catégorie+classe — le moteur élargit alors à la catégorie seule (voir vocab.js)");
  }
  notes.push(L + " " + ambigus + " paire(s) de traductions synonymes écartées du même QCM " +
    (SYN ? "(familles de vocab-synonymes.js)" : "⚠ vocab-synonymes.js ABSENT"));

  notes.push(L + " " + banque.length + " mots · par niveau " + JSON.stringify(parNiveau));
  notes.push(L + " catégories (" + Object.keys(parCategorie).length + ") " + JSON.stringify(parCategorie));
  return { parNiveau, parCategorie };
}

/* ------------------------------------------------------------------ */
/* 3. Cohérence lexiques <-> banque                                    */
/* ------------------------------------------------------------------ */
function verifierLexiques(langue, banque) {
  const L = "[" + langue + "]";
  const index = new Map();
  for (const e of banque) index.set(norm(e.mot), e);

  let total = 0, manquants = 0, divergents = 0;
  for (const niv of ["a1", "a2", "b1", "b2"]) {
    const f = path.join(__dirname, "cours-" + langue + "-" + niv, "lexique.html");
    if (!fs.existsSync(f)) continue;
    const s = fs.readFileSync(f, "utf8");
    const re = /<tr><td><strong>(.*?)<\/strong><\/td><td>(.*?)<\/td>/g;
    let m;
    while ((m = re.exec(s)) !== null) {
      total++;
      const mot = m[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
      const tr = m[2].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&")
                     .replace(/&#39;|&apos;/g, "'").trim();
      const e = index.get(norm(mot));
      if (!e) { manquants++; if (manquants <= 5) ko(L + " lexique : « " + mot + " » absent de la banque"); continue; }
      const attendues = tr.split(/[,/]/).map(x => norm(x)).filter(Boolean);
      const presentes = e.traductions.map(norm);
      const concorde = attendues.some(a => presentes.includes(a));
      if (!concorde) {
        divergents++;
        if (divergents <= 5) ko(L + " lexique ≠ banque pour « " + mot + " » : lexique dit « " + tr +
          " », banque dit « " + e.traductions.join(", ") + " »");
      }
    }
  }
  notes.push(L + " lexiques : " + total + " entrées confrontées · " + manquants +
    " absente(s) · " + divergents + " divergente(s)");
}

/* ------------------------------------------------------------------ */
/* 4. Logique Leitner — personas                                       */
/* ------------------------------------------------------------------ */
function verifierLeitner() {
  let V;
  try { V = require("./vocab.js"); }
  catch (e) { notes.push("(vocab.js pas encore présent : personas Leitner non joués)"); return; }
  if (!V || !V.Leitner) { notes.push("(vocab.js sans API Leitner : personas non joués)"); return; }

  const L = V.Leitner;

  // a) un mot raté redescend en boîte 1
  let etat = L.init();
  etat = L.repondre(etat, "huis", true);          // -> boîte 2
  etat = L.repondre(etat, "huis", true);          // -> boîte 3
  if (L.boite(etat, "huis") !== 3) ko("[leitner] deux réussites devraient mener en boîte 3");
  etat = L.repondre(etat, "huis", false);         // raté -> boîte 1
  if (L.boite(etat, "huis") !== 1) ko("[leitner] un mot raté doit redescendre en boîte 1");

  // b) trois réussites -> acquis (boîte 3)
  let e2 = L.init();
  for (let i = 0; i < 3; i++) e2 = L.repondre(e2, "boek", true);
  if (L.boite(e2, "boek") !== 3) ko("[leitner] trois réussites doivent donner l'état acquis");
  if (L.acquis(e2) !== 1) ko("[leitner] le compteur d'acquis devrait valoir 1");

  // c) la révision sert d'abord les boîtes basses
  let e3 = L.init();
  e3 = L.repondre(e3, "aacquis", true); e3 = L.repondre(e3, "aacquis", true); e3 = L.repondre(e3, "aacquis", true);
  e3 = L.repondre(e3, "bfragile", false);
  const ordre = L.prioriser(e3, ["aacquis", "bfragile", "cneuf"]);
  if (ordre[0] !== "bfragile") ko("[leitner] la révision doit servir la boîte 1 en premier (obtenu : " + ordre[0] + ")");
  if (ordre[ordre.length - 1] !== "aacquis") ko("[leitner] un mot acquis doit passer en dernier");

  notes.push("[leitner] personas joués : raté->boîte 1, 3 réussites->acquis, révision->boîtes basses");
}

/* ------------------------------------------------------------------ */
/* 5. Épreuve du feu : on GÉNÈRE toutes les questions possibles         */
/* ------------------------------------------------------------------ */
/* Les contrôles précédents raisonnent sur la banque. Celui-ci fait tourner le
 * vrai moteur, mot par mot et dans les deux sens, et inspecte chaque QCM
 * réellement produit. C'est le seul contrôle qui prouve que l'élève ne verra
 * jamais une question à deux bonnes réponses — le reste ne fait que le rendre
 * probable. Une question que le moteur refuse de produire (vivier trop maigre)
 * n'est pas un échec : c'est le comportement voulu, pas de question plutôt
 * qu'une mauvaise. */
function epreuveDuFeu(langue, banque, V) {
  const L = "[" + langue + "]";
  let produites = 0, refusees = 0, defauts = 0;
  for (const sens of ["reconnaissance", "rappel"]) {
    for (const e of banque) {
      const q = V.construireQuestion(e, banque, sens);
      if (!q) { refusees++; continue; }
      produites++;
      const textes = q.options.map(o => o.texte);

      if (q.options.filter(o => o.correct).length !== 1) {
        defauts++;
        if (defauts <= 5) ko(L + " « " + e.mot + " » (" + sens + ") : la question n'a pas " +
          "exactement une bonne réponse");
      }
      if (new Set(textes.map(norm)).size !== textes.length) {
        defauts++;
        if (defauts <= 5) ko(L + " « " + e.mot + " » (" + sens + ") : deux options identiques — " +
          textes.join(" | "));
      }
      if (textes.length !== 4) {
        defauts++;
        if (defauts <= 5) ko(L + " « " + e.mot + " » (" + sens + ") : " + textes.length + " options");
      }
      // Ambiguïté par synonymie : uniquement en reconnaissance, où les options
      // sont des traductions françaises comparables entre elles.
      if (SYN && sens === "reconnaissance") {
        for (let i = 0; i < textes.length; i++) {
          for (let j = i + 1; j < textes.length; j++) {
            if (SYN.memeFamille(textes[i], textes[j])) {
              defauts++;
              if (defauts <= 5) ko(L + " « " + e.mot + " » : options synonymes dans le même QCM — « " +
                textes[i] + " » et « " + textes[j] + " »");
            }
          }
        }
      }
    }
  }
  // Contrôle du VIVIER, et pas seulement des trois distracteurs tirés au sort.
  // Un distracteur dangereux peut rester admissible sans jamais sortir dans
  // l'échantillon : le contrôle ci-dessus passerait alors par chance. Ici on
  // interroge le moteur sur l'ensemble des distracteurs qu'il s'autorise.
  let eligiblesAmbigus = 0;
  if (SYN && V.vivierPour) {
    for (const e of banque) {
      const pool = V.vivierPour(e, banque) || [];
      const toutes = e.traductions.concat(e.pieges || []);
      for (const o of pool) {
        if (SYN.entreesInterchangeables(toutes, o.traductions)) {
          eligiblesAmbigus++;
          if (eligiblesAmbigus <= 5) ko(L + " « " + e.mot + " » : « " + o.mot + " » (" +
            o.traductions[0] + ") reste un distracteur admissible alors que sa traduction est " +
            "synonyme de « " + e.traductions[0] + " » — l'exclusion par familles ne s'applique pas");
        }
      }
    }
  }

  notes.push(L + " épreuve du feu : " + produites + " questions générées (2 sens), " +
    refusees + " refusée(s) faute de distracteurs sûrs, " + defauts + " défaut(s) · " +
    "vivier : " + eligiblesAmbigus + " distracteur(s) synonyme(s) resté(s) admissible(s)");
}

/* ------------------------------------------------------------------ */
let banques = 0;
for (const langue of LANGUES) {
  const f = path.join(__dirname, "vocab-data-" + langue + ".js");
  if (!fs.existsSync(f)) { notes.push("[" + langue + "] banque absente (pas encore produite)"); continue; }
  let banque;
  try { banque = require(f); } catch (e) { ko("[" + langue + "] banque illisible : " + e.message); continue; }
  if (!Array.isArray(banque)) { ko("[" + langue + "] la banque n'est pas un tableau"); continue; }
  banques++;
  verifierBanque(langue, banque);
  verifierLexiques(langue, banque);
  if (MOTEUR && MOTEUR.construireQuestion) epreuveDuFeu(langue, banque, MOTEUR);
}
if (!MOTEUR) ko("vocab.js introuvable — l'épreuve du feu (génération réelle des QCM) n'a pas pu être jouée");
verifierLeitner();

console.log("=== _verify_vocab.js — rapport ===");
console.log("Banques trouvées : " + banques + " / " + LANGUES.length);
for (const n of notes) console.log("· " + n);
console.log("");
if (!problemes.length) {
  console.log("✅ Banques conformes : schéma, aucun doublon, aucune question cassée, lexiques concordants.");
  process.exit(0);
}
console.log("❌ " + problemes.length + " problème(s) :");
for (const p of problemes) console.log("   - " + p);
process.exit(1);
