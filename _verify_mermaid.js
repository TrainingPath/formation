#!/usr/bin/env node
/*
 * _verify_mermaid.js — Vérificateur des blocs de diagrammes du cours UML.
 * Famille _verify. Deux usages :
 *
 *   node _verify_mermaid.js            -> VÉRIFIE (code retour non-zéro si écart)
 *   node _verify_mermaid.js --fix-urls -> RECALCULE les URL et réécrit les leçons
 *
 * Ce qu'il contrôle :
 *   1. chaque leçon de cours-uml/ parse toujours (DAY + DIAGRAMMES) ;
 *   2. chaque bloc a un outil connu et un code non vide ;
 *   3. la validité STRUCTURELLE du code Mermaid (voir la limite ci-dessous) ;
 *   4. chaque lien mermaid.live / PlantUML se DÉCODE EXACTEMENT vers le code
 *      affiché à côté — aucun lien désynchronisé de son bloc ;
 *   5. l'ancre `apres` désigne un <pre class="pseudo"> qui existe dans la théorie.
 *
 * LIMITE ASSUMÉE — à lire avant de croire ce script :
 *   `npm install mermaid` est refusé (403) dans l'environnement de génération, et
 *   aucun service de rendu distant n'a pu servir d'oracle. Le contrôle Mermaid
 *   est donc STRUCTUREL (en-tête de diagramme reconnu, équilibrage des
 *   délimiteurs, flèches valides, pas de ligne orpheline) et NON un passage par
 *   le parseur officiel. Un diagramme peut donc être structurellement correct
 *   ici et mal rendre chez Mermaid. La case « vérification visuelle humaine »
 *   du CHANGELOG reste ouverte pour cette raison.
 *   L'encodage PlantUML, lui, a été validé de bout en bout contre le serveur
 *   officiel (endpoint /txt/ renvoyant le diagramme attendu).
 */
"use strict";
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const vm = require("vm");

const DIR = path.join(__dirname, "cours-uml");
const FIX = process.argv.includes("--fix-urls");

const problemes = [];
const notes = [];
let nbBlocs = 0, nbMermaid = 0, nbApprox = 0, nbPlant = 0;
function ko(f, msg) { problemes.push(f + " : " + msg); }

/* ---------------- encodage / décodage des liens ---------------- */

function encMermaid(code) {
  const state = { code, mermaid: JSON.stringify({ theme: "default" }) };
  const def = zlib.deflateSync(Buffer.from(JSON.stringify(state), "utf8"), { level: 9 });
  return "https://mermaid.live/edit#pako:" +
    def.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decMermaid(url) {
  const m = /#pako:(.+)$/.exec(url || "");
  if (!m) return null;
  const b64 = m[1].replace(/-/g, "+").replace(/_/g, "/");
  try {
    return JSON.parse(zlib.inflateSync(Buffer.from(b64, "base64")).toString("utf8")).code;
  } catch (e) { return null; }
}

// Alphabet PlantUML (base64 « maison »), validé contre le serveur officiel.
const AL = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
function enc3(b1, b2, b3) {
  const c1 = b1 >> 2, c2 = ((b1 & 3) << 4) | (b2 >> 4),
        c3 = ((b2 & 15) << 2) | (b3 >> 6), c4 = b3 & 63;
  return AL[c1 & 63] + AL[c2 & 63] + AL[c3 & 63] + AL[c4 & 63];
}
function encPlant(code) {
  const buf = zlib.deflateRawSync(Buffer.from(code, "utf8"), { level: 9 });
  let r = "";
  for (let i = 0; i < buf.length; i += 3) {
    if (i + 2 === buf.length) r += enc3(buf[i], buf[i + 1], 0);
    else if (i + 1 === buf.length) r += enc3(buf[i], 0, 0);
    else r += enc3(buf[i], buf[i + 1], buf[i + 2]);
  }
  return "https://www.plantuml.com/plantuml/uml/" + r;
}
function decPlant(url) {
  const m = /plantuml\/uml\/(.+)$/.exec(url || "");
  if (!m) return null;
  const s = m[1], out = [];
  const idx = c => AL.indexOf(c);
  for (let i = 0; i < s.length; i += 4) {
    const c1 = idx(s[i]), c2 = idx(s[i + 1]), c3 = idx(s[i + 2]), c4 = idx(s[i + 3]);
    out.push(((c1 << 2) | (c2 >> 4)) & 0xFF);
    if (s[i + 2] !== undefined) out.push((((c2 & 15) << 4) | (c3 >> 2)) & 0xFF);
    if (s[i + 3] !== undefined) out.push((((c3 & 3) << 6) | c4) & 0xFF);
  }
  try { return zlib.inflateRawSync(Buffer.from(out)).toString("utf8"); }
  catch (e) { return null; }
}

/* ---------------- contrôle structurel Mermaid ---------------- */

const ENTETES = [
  "flowchart", "graph", "sequenceDiagram", "classDiagram", "stateDiagram-v2",
  "stateDiagram", "erDiagram", "journey", "mindmap", "timeline", "gitGraph"
];

function validerMermaid(code) {
  const err = [];
  const lignes = code.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("%%"));
  if (!lignes.length) { err.push("code vide"); return err; }

  const tete = lignes[0];
  const type = ENTETES.find(h => tete === h || tete.startsWith(h + " ") || tete.startsWith(h + "\t"));
  if (!type) err.push("en-tête de diagramme non reconnu : « " + tete.slice(0, 40) + " »");

  // Équilibrage des délimiteurs. On retire d'abord les notations où une
  // accolade/parenthèse n'ouvre rien : la patte-d'oie d'un erDiagram
  // (||--o{, }o--||, |{ …) et les losanges de flowchart ({{ }}).
  const nu = code
    .replace(/[|}o]\s*(--|\.\.)\s*[o|{]*/g, " ")
    .replace(/\}?o?\{/g, m => (/^\}/.test(m) ? " " : m));
  const paires = [["(", ")"], ["[", "]"], ["{", "}"]];
  for (const [o, c] of paires) {
    const no = (nu.match(new RegExp("\\" + o, "g")) || []).length;
    const nc = (nu.match(new RegExp("\\" + c, "g")) || []).length;
    if (no !== nc) err.push("délimiteurs déséquilibrés : " + no + " « " + o + " » pour " + nc + " « " + c + " »");
  }
  const guill = (code.match(/"/g) || []).length;
  if (guill % 2 !== 0) err.push("guillemets non appariés (" + guill + ")");

  // contrôles par type
  if (type === "sequenceDiagram") {
    const corps = lignes.slice(1);
    const okSeq = /^(participant|actor|activate|deactivate|note|loop|alt|else|opt|par|and|critical|break|rect|end|autonumber|title|box|create|destroy|link)\b/i;
    for (const l of corps) {
      if (okSeq.test(l)) continue;
      if (/(->>|-->>|->|-->|-x|--x|-\)|--\))/.test(l)) continue;
      err.push("ligne de séquence non reconnue : « " + l.slice(0, 46) + " »");
    }
  }
  if (type === "classDiagram") {
    const corps = lignes.slice(1);
    const okCls = /^(class|<<|note|direction|namespace|\}|link|style|click)\b|^\}/i;
    for (const l of corps) {
      if (okCls.test(l)) continue;
      if (/(<\|--|\*--|o--|-->|--|\.\.>|<\|\.\.|\.\.)/.test(l)) continue;
      if (/^[+\-#~]/.test(l)) continue;           // membre de classe
      if (/^[A-Za-z_][\w]*\s*:\s*/.test(l)) continue; // Classe : membre
      err.push("ligne de classe non reconnue : « " + l.slice(0, 46) + " »");
    }
  }
  if (type === "stateDiagram-v2" || type === "stateDiagram") {
    const corps = lignes.slice(1);
    for (const l of corps) {
      if (/^(state|note|direction|\}|--)/.test(l)) continue;
      if (/-->/.test(l)) continue;
      if (/^\[\*\]/.test(l)) continue;
      err.push("ligne d'état non reconnue : « " + l.slice(0, 46) + " »");
    }
  }
  if (type === "flowchart" || type === "graph") {
    if (!/(-->|---|-\.->|==>|~~~)/.test(code)) err.push("aucune liaison de flowchart détectée");
  }
  return err;
}

function validerPlantUml(code) {
  const err = [];
  if (!/^@start[a-z]+/m.test(code)) err.push("il manque une directive @startuml");
  if (!/^@end[a-z]+/m.test(code)) err.push("il manque une directive @enduml");
  return err;
}

/* ---------------- extraction depuis les leçons ---------------- */

function lireLecon(file) {
  const html = fs.readFileSync(file, "utf8");
  const md = /var DAY = ([\s\S]*?);\s*\n<\/script>/.exec(html);
  const mg = /var DIAGRAMMES = (\[[\s\S]*?\]);\s*\n<\/script>/.exec(html);
  const ctx = {};
  vm.createContext(ctx);
  let DAY = null, DIAG = null;
  if (md) { try { vm.runInContext("D=" + md[1], ctx); DAY = ctx.D; } catch (e) { return { erreur: "DAY ne parse plus : " + e.message }; } }
  if (mg) { try { vm.runInContext("G=" + mg[1], ctx); DIAG = ctx.G; } catch (e) { return { erreur: "DIAGRAMMES ne parse pas : " + e.message }; } }
  return { html, DAY, DIAG };
}

const fichiers = fs.readdirSync(DIR).filter(f => /^jour\d+\.html$/.test(f)).sort();
let modifies = 0;

for (const nom of fichiers) {
  const file = path.join(DIR, nom);
  const r = lireLecon(file);
  if (r.erreur) { ko(nom, r.erreur); continue; }
  if (!r.DAY) { ko(nom, "DAY introuvable"); continue; }
  if (!r.DIAG) continue;                    // leçon sans diagramme : légitime
  if (!Array.isArray(r.DIAG)) { ko(nom, "DIAGRAMMES n'est pas un tableau"); continue; }

  // nombre d'ancres disponibles dans la théorie
  const nbPre = (String(r.DAY.theory).match(/<pre class="pseudo">/g) || []).length;
  let html = r.html, change = false;

  r.DIAG.forEach((d, i) => {
    const id = nom + " bloc#" + (i + 1);
    nbBlocs++;
    const outil = d.outil || "mermaid";
    if (["mermaid", "mermaid-approx", "plantuml"].indexOf(outil) === -1) ko(id, "outil inconnu : " + outil);
    if (!d.code || !String(d.code).trim()) { ko(id, "code vide"); return; }
    if (!d.titre) ko(id, "titre manquant");

    if (typeof d.apres === "number" && (d.apres < 0 || d.apres >= nbPre)) {
      ko(id, "ancre apres=" + d.apres + " hors bornes (la théorie a " + nbPre + " blocs <pre class=\"pseudo\">)");
    }

    const estPlant = outil === "plantuml";
    if (estPlant) nbPlant++; else if (outil === "mermaid-approx") nbApprox++; else nbMermaid++;

    // validité du code
    const err = estPlant ? validerPlantUml(d.code) : validerMermaid(d.code);
    for (const e of err) ko(id, e);

    // cohérence lien <-> code
    const attendue = estPlant ? encPlant(d.code) : encMermaid(d.code);
    if (FIX) {
      if (d.url !== attendue) {
        html = html.replace(JSON.stringify(d.url || ""), JSON.stringify(attendue));
        change = true;
      }
    } else {
      if (!d.url) { ko(id, "lien absent"); return; }
      const decode = estPlant ? decPlant(d.url) : decMermaid(d.url);
      if (decode === null) ko(id, "lien illisible (décodage impossible)");
      else if (decode !== d.code) ko(id, "le lien ne correspond PAS au code affiché (lien désynchronisé)");
    }
  });

  if (FIX && change) { fs.writeFileSync(file, html, "utf8"); modifies++; }
}

if (FIX) {
  console.log("URL recalculées dans " + modifies + " leçon(s).");
  process.exit(0);
}

console.log("=== _verify_mermaid.js — rapport ===");
console.log("Leçons examinées : " + fichiers.length + " · blocs de diagrammes : " + nbBlocs);
console.log("  Mermaid natif : " + nbMermaid + " · Mermaid approximation : " + nbApprox + " · PlantUML : " + nbPlant);
for (const n of notes) console.log("· " + n);
console.log("");
console.log("Note : contrôle Mermaid STRUCTUREL (npm bloqué, parseur officiel indisponible).");
console.log("       Encodage PlantUML validé de bout en bout contre le serveur officiel.");
console.log("");
if (!problemes.length) {
  console.log("✅ Blocs de diagrammes conformes : codes valides, liens synchronisés avec leur bloc.");
  process.exit(0);
}
console.log("❌ " + problemes.length + " problème(s) :");
for (const p of problemes) console.log("   - " + p);
process.exit(1);
