#!/usr/bin/env node
/*
 * _coherence.js — Scanner de cohérence STRUCTURELLE du site (statique, 100% local).
 * Même famille que _verify.js. Vérifie ce que l'audit manuel a vérifié, pour que la
 * cohérence devienne un garde-fou permanent (branché dans la CI à côté de _verify).
 *
 * Contrôles :
 *   A. Liens internes  : tout href="...html" en MARKUP (hors <script>/<pre>/<code>)
 *      pointe vers un fichier qui existe. Les liens générés en JS (fil-rouge :
 *      'lecon'+pad(n)+'.html') et les liens d'exemple dans le code enseigné (<pre>/<code>)
 *      sont exclus STRUCTURELLEMENT (on retire ces blocs avant l'analyse), pas par liste blanche.
 *   B. Compteurs       : scommes des <span class="count"> de l'accueil == nb de dossiers cours-* ;
 *      chaque compteur de catégorie == nb de cours atteignables depuis son hub ;
 *      pied « N cours » de chaque parcours-*.html == nb de cartes de cours ;
 *      pied « N cours » de chaque hub == nb de cours atteignables.
 *   C. Structure cours : pour chaque cours-*, len(TITLES) == nb de fichiers leçon ==
 *      borne de navigation (engine.js) == max(WEEKS.to), et WEEKS couvre 1..N sans trou.
 *   D. Orphelins       : chaque dossier cours-* est atteignable (lié) depuis l'accueil.
 *
 * Sortie : liste des écarts + code retour non-zéro s'il y en a.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const problems = [];
const notes = [];
function fail(cat, msg) { problems.push("[" + cat + "] " + msg); }

// ---------- utilitaires ----------
function read(f) { try { return fs.readFileSync(f, "utf8"); } catch (e) { return null; } }
function listHtml(dir) {
  return fs.readdirSync(dir).filter(f => f.endsWith(".html")).map(f => path.join(dir, f));
}
function courseDirs() {
  return fs.readdirSync(ROOT)
    .filter(n => n.startsWith("cours-") && fs.existsSync(path.join(ROOT, n, "index.html")) &&
                 fs.statSync(path.join(ROOT, n)).isDirectory());
}
// retire <script>, <pre>, <code> (blocs de code / JS) pour ne garder que le markup "vrai"
function stripCode(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
    .replace(/<code[\s\S]*?<\/code>/gi, " ");
}
function pad(n) { return (n < 10 ? "0" : "") + n; }

// ---------- A. Liens internes ----------
function checkLinks() {
  // tous les .html du dépôt (racine + cours-*/ + éventuels autres dossiers de contenu)
  const files = [];
  (function walk(dir) {
    for (const n of fs.readdirSync(dir)) {
      if (n === ".git" || n === "node_modules" || n === "_verify_tmp") continue;
      const p = path.join(dir, n);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (n.endsWith(".html")) files.push(p);
    }
  })(ROOT);

  const hrefRe = /(?:href|src)\s*=\s*"([^"]+)"/gi;
  let checked = 0;
  for (const f of files) {
    const markup = stripCode(read(f) || "");
    let m;
    while ((m = hrefRe.exec(markup)) !== null) {
      let target = m[1].trim();
      if (/^(https?:|mailto:|tel:|javascript:|#|data:)/i.test(target)) continue;
      target = target.split("#")[0].split("?")[0];
      if (!target) continue;
      if (!/\.html$/i.test(target)) continue; // on ne valide que les liens de page
      const resolved = path.resolve(path.dirname(f), target);
      checked++;
      if (!fs.existsSync(resolved)) {
        fail("LIEN", path.relative(ROOT, f) + "  →  " + m[1] + "  (cible absente)");
      }
    }
  }
  notes.push("Liens .html vérifiés : " + checked);
}

// ---------- graphe : cours atteignables depuis une page ----------
function courseLinksIn(file) {
  // dossiers cours-* liés en markup depuis `file`
  const html = stripCode(read(file) || "");
  const set = new Set();
  const re = /href\s*=\s*"(?:\.\/)?(cours-[^"\/]+)\/index\.html"/gi;
  let m; while ((m = re.exec(html)) !== null) set.add(m[1]);
  return set;
}
function pageLinksIn(file) {
  // pages .html locales (même dossier racine) liées depuis `file`
  const html = stripCode(read(file) || "");
  const set = new Set();
  const re = /href\s*=\s*"([a-z0-9_-]+\.html)"/gi;
  let m; while ((m = re.exec(html)) !== null) set.add(m[1]);
  return set;
}
// atteignables transitivement (hub → parcours/sous-hub → cours), SANS traverser les
// pages « frontière » (autres hubs de catégorie + accueil) : la barre de navigation
// relie tous les hubs entre eux, il faut donc s'arrêter à ces frontières pour isoler
// le sous-arbre d'une catégorie. La page de départ est traitée même si elle est frontière.
function reachableCoursesFrom(startPages, boundary) {
  boundary = boundary || new Set();
  const seen = new Set();
  const courses = new Set();
  const queue = [...startPages];
  while (queue.length) {
    const pg = queue.shift();
    if (seen.has(pg)) continue;
    seen.add(pg);
    const full = path.join(ROOT, pg);
    if (!fs.existsSync(full)) continue;
    for (const c of courseLinksIn(full)) courses.add(c);
    for (const p of pageLinksIn(full)) {
      if (seen.has(p) || /^cours-/.test(p)) continue;
      if (boundary.has(p) && !startPages.includes(p)) continue; // ne pas franchir un hub voisin
      queue.push(p);
    }
  }
  return courses;
}

// ---------- B. Compteurs ----------
function checkCounters() {
  const dirs = new Set(courseDirs());
  const accueil = read(path.join(ROOT, "index.html")) || "";

  // paires (hub href, count) dans l'ordre du markup
  const cards = [];
  const cardRe = /<a class="cat" href="([^"]+)"[\s\S]*?<span class="count">([^<]*)<\/span>/gi;
  let m;
  while ((m = cardRe.exec(accueil)) !== null) {
    const hub = m[1];
    const num = parseInt((m[2].match(/(\d+)\s*cours/) || [])[1], 10);
    cards.push({ hub, num });
  }
  if (cards.length === 0) fail("COMPTEUR", "aucune carte de catégorie détectée sur l'accueil");

  // frontières = les hubs de catégorie eux-mêmes + l'accueil (la barre de nav les relie tous)
  const boundary = new Set(cards.map(c => c.hub));
  boundary.add("index.html");

  // Un cours « appartient » au hub qui le liste DIRECTEMENT (ou via un sous-hub comme cisco).
  // Certains cours sont partagés : ex. cours-linux appartient à systeme mais est cité comme
  // prérequis dans parcours-asm (catégorie programmation). L'appartenance = lien direct.
  // On sépare donc les hubs « à parcours » (ne listent que des parcours-*) des hubs « directs ».
  const isParcoursHub = h => {
    const pages = pageLinksIn(path.join(ROOT, h));
    let hasParcours = false, hasCourse = courseLinksIn(path.join(ROOT, h)).size > 0;
    pages.forEach(p => { if (/^parcours-/.test(p)) hasParcours = true; });
    return hasParcours && !hasCourse;
  };
  const directHubs = cards.filter(c => !isParcoursHub(c.hub));
  const parcoursHubs = cards.filter(c => isParcoursHub(c.hub));

  const ownedBy = {};       // hub -> Set(cours)
  const directUnion = new Set();
  for (const c of directHubs) {
    const owned = reachableCoursesFrom([c.hub], boundary);
    ownedBy[c.hub] = owned;
    for (const x of owned) {
      if (directUnion.has(x)) fail("COMPTEUR", x + " : listé directement par deux catégories");
      directUnion.add(x);
    }
  }
  // les hubs à parcours possèdent le reste (leurs cours atteignables moins ceux déjà possédés)
  for (const c of parcoursHubs) {
    const reach = reachableCoursesFrom([c.hub], boundary);
    const owned = new Set([...reach].filter(x => !directUnion.has(x)));
    ownedBy[c.hub] = owned;
  }

  const covered = new Set();
  let sum = 0;
  for (const c of cards) {
    if (isNaN(c.num)) { fail("COMPTEUR", "carte accueil « " + c.hub + " » sans nombre de cours lisible"); continue; }
    sum += c.num;
    const owned = ownedBy[c.hub] || new Set();
    owned.forEach(x => covered.add(x));
    if (owned.size !== c.num) {
      fail("COMPTEUR", "accueil « " + c.hub + " » annonce " + c.num +
        " cours mais " + owned.size + " lui appartiennent (" + [...owned].sort().join(", ") + ")");
    }
  }
  if (sum !== dirs.size) {
    fail("COMPTEUR", "somme des compteurs accueil = " + sum + " ≠ " + dirs.size + " dossiers cours-*");
  }
  for (const d of dirs) if (!covered.has(d)) fail("COMPTEUR", d + " : dans aucune catégorie de l'accueil");
  notes.push("Compteurs accueil : somme = " + sum + " (dossiers cours-* = " + dirs.size + ")");

  // pied « N cours » : parcours-*.html (nombre pris DANS le <footer>) == nb de cartes de cours
  for (const f of listHtml(ROOT)) {
    const base = path.basename(f);
    if (!/^parcours-/.test(base)) continue;
    const html = read(f) || "";
    const footMatch = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
    if (!footMatch) { fail("COMPTEUR", base + " : pas de <footer>"); continue; }
    const declared = parseInt((footMatch[1].match(/(\d+)\s*cours/) || [])[1], 10);
    if (isNaN(declared)) continue;
    const cards2 = courseLinksIn(f).size;
    if (cards2 !== declared) {
      fail("COMPTEUR", base + " : pied « " + declared + " cours » ≠ " + cards2 + " cartes de cours");
    }
  }
}

// ---------- C. Structure des cours ----------
function parseTitles(html) {
  const m = html.match(/var\s+TITLES\s*=\s*\[([\s\S]*?)\]\s*;/);
  if (!m) return null;
  // compte les éléments de type "..." au premier niveau
  const items = m[1].match(/"(?:[^"\\]|\\.)*"/g);
  return items ? items.length : 0;
}
function parseWeeks(html) {
  const m = html.match(/var\s+WEEKS\s*=\s*\[([\s\S]*?)\]\s*;/);
  if (!m) return null;
  const weeks = [];
  const re = /from:\s*(\d+)\s*,\s*to:\s*(\d+)/g;
  let w; while ((w = re.exec(m[1])) !== null) weeks.push([parseInt(w[1], 10), parseInt(w[2], 10)]);
  return weeks;
}
function detectPrefixAndBound(dir) {
  const eng = read(path.join(dir, "engine.js")) || "";
  const pm = eng.match(/href="(lecon|jour)'\s*\+\s*pad/);
  const bm = eng.match(/DAY\.num\s*<\s*(\d+)/);
  return { prefix: pm ? pm[1] : null, bound: bm ? parseInt(bm[1], 10) : null };
}
function countLessonFiles(dir, prefix) {
  const files = fs.readdirSync(dir);
  const re = new RegExp("^" + (prefix || "(lecon|jour)") + "\\d+\\.html$");
  return files.filter(f => re.test(f)).length;
}
function checkStructure() {
  for (const name of courseDirs()) {
    const dir = path.join(ROOT, name);
    const idx = read(path.join(dir, "index.html")) || "";
    const { prefix, bound } = detectPrefixAndBound(dir);
    const lessons = countLessonFiles(dir, prefix);
    const titles = parseTitles(idx);
    const weeks = parseWeeks(idx);

    if (prefix === null) { fail("STRUCT", name + " : préfixe de navigation introuvable dans engine.js"); }
    if (bound === null) { fail("STRUCT", name + " : borne de navigation (DAY.num < N) introuvable"); }
    if (titles === null) { fail("STRUCT", name + " : TITLES introuvable dans index.html"); continue; }

    // référence = nombre de fichiers de leçon
    const ref = lessons;
    if (titles !== ref) fail("STRUCT", name + " : TITLES=" + titles + " ≠ " + ref + " fichiers leçon");
    if (bound !== null && bound !== ref) fail("STRUCT", name + " : borne nav=" + bound + " ≠ " + ref + " fichiers leçon");

    if (weeks && weeks.length) {
      const maxTo = Math.max(...weeks.map(w => w[1]));
      if (maxTo !== ref) fail("STRUCT", name + " : max(WEEKS.to)=" + maxTo + " ≠ " + ref + " fichiers leçon");
      // contiguïté 1..N
      let expect = 1, ok = true;
      for (const [from, to] of weeks) { if (from !== expect || to < from) { ok = false; break; } expect = to + 1; }
      if (!ok || expect - 1 !== ref) fail("STRUCT", name + " : WEEKS ne couvre pas 1.." + ref + " sans trou");
    } else {
      fail("STRUCT", name + " : WEEKS introuvable ou vide dans index.html");
    }
  }
}

// ---------- D. Orphelins ----------
function checkOrphans() {
  const reachable = reachableCoursesFrom(["index.html"]);
  for (const name of courseDirs()) {
    if (!reachable.has(name)) fail("ORPHELIN", name + " : non atteignable depuis l'accueil");
  }
  notes.push("Cours atteignables depuis l'accueil : " + reachable.size + " / " + courseDirs().length);
}

// ---------- exécution ----------
checkLinks();
checkCounters();
checkStructure();
checkOrphans();

console.log("=== _coherence.js — rapport ===");
for (const n of notes) console.log("· " + n);
console.log("");
if (problems.length === 0) {
  console.log("✅ Aucune incohérence détectée (" + courseDirs().length + " cours).");
  process.exit(0);
} else {
  console.log("❌ " + problems.length + " écart(s) :");
  for (const p of problems) console.log("   - " + p);
  process.exit(1);
}
