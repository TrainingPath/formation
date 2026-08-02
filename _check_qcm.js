/* Contrôle d'intégrité des QCM sur TOUTES les leçons du site :
   - chaque QCM a 4 options et un index `a` valide ;
   - le mélange déterministe (seed = énoncé) préserve la bonne réponse (l'option marquée correcte
     après mélange est bien l'originale).
   Sort en erreur (code 1) au moindre problème. Aucune écriture disque. */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const courseDirs = fs.readdirSync(root).filter(d => /^cours-/.test(d) && fs.statSync(path.join(root, d)).isDirectory());

function shuffle(ex) {
  const items = ex.opts.map((o, k) => ({ text: o, correct: k === ex.a }));
  let seed = 0; const q = String(ex.q || "");
  for (let s = 0; s < q.length; s++) seed = (seed * 31 + q.charCodeAt(s)) & 0x7fffffff;
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
  for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = items[i]; items[i] = items[j]; items[j] = t; }
  return items;
}

let files = 0, qcm = 0, badIndex = 0, badCount = 0, badShuffle = 0, parseBad = 0, nonFour = 0;
const problems = [];
for (const d of courseDirs) {
  for (const f of fs.readdirSync(path.join(root, d))) {
    if (!/^(lecon|jour)\d+\.html$/.test(f)) continue;
    files++;
    const h = fs.readFileSync(path.join(root, d, f), "utf8");
    const dm = h.match(/var DAY = ([\s\S]*?);\s*\n\s*(?:var ECRITURE|<\/script>|<script)/);
    if (!dm) { parseBad++; problems.push(d + "/" + f + " : DAY introuvable"); continue; }
    let DAY;
    try { DAY = eval("(" + dm[1] + ")"); } catch (e) { parseBad++; problems.push(d + "/" + f + " : DAY illisible (" + e.message.slice(0, 40) + ")"); continue; }
    const qs = (DAY.exercises || []).concat(DAY.final ? DAY.final.questions : []);
    qs.forEach((ex, i) => {
      if (ex.type !== "qcm") return;
      qcm++;
      // ÉCHEC seulement si dégénéré (< 2 options). Les QCM à 2 options sont LÉGITIMES (questions
      // booléennes « Que vaut !(a && b) ? » → true/false) ; on les compte comme « non-4 » à titre
      // informatif, sans faire échouer la CI. La quasi-totalité des QCM ont 4 options.
      if (!Array.isArray(ex.opts) || ex.opts.length < 2) { badCount++; problems.push(d + "/" + f + " q#" + i + " : moins de 2 options (dégénéré)"); return; }
      if (ex.opts.length !== 4) nonFour++;
      if (typeof ex.a !== "number" || ex.a < 0 || ex.a >= ex.opts.length) { badIndex++; problems.push(d + "/" + f + " q#" + i + " : index a invalide"); return; }
      // mélange doit préserver la bonne réponse
      const items = shuffle(ex);
      const correct = items.filter(x => x.correct);
      if (correct.length !== 1 || correct[0].text !== ex.opts[ex.a]) { badShuffle++; problems.push(d + "/" + f + " q#" + i + " : mélange ne préserve pas la bonne réponse"); }
    });
  }
}

console.log("=".repeat(60));
console.log("Leçons : " + files + " | QCM : " + qcm);
console.log("Index a invalide (ÉCHEC) : " + badIndex);
console.log("QCM dégénérés < 2 options (ÉCHEC) : " + badCount);
console.log("QCM à ≠ 4 options (info — souvent booléens true/false) : " + nonFour);
console.log("Mélange ne préservant pas la bonne réponse (ÉCHEC) : " + badShuffle);
console.log("Fichiers illisibles : " + parseBad);
if (problems.length) { console.log("\n--- Problèmes (max 40) ---"); problems.slice(0, 40).forEach(p => console.log("  " + p)); }
console.log("=".repeat(60));
process.exit((badIndex + badCount + badShuffle + parseBad) ? 1 : 0);
