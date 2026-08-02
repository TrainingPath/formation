/* Lanceur de vérification — découvre AUTOMATIQUEMENT toutes les leçons dont un exercice d'écriture
   est « gaté » (champ tests, ou lang java/c/cpp avec sortie attendue) et lance _verify.js sur chacune.
   Sort en erreur (code 1) au moindre FAIL. Utilisé en local et par la CI GitHub Actions.
   N'écrit rien dans le dépôt : _verify.js compile/exécute dans un dossier temporaire du système. */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = __dirname;
const courseDirs = fs.readdirSync(root).filter(d => /^cours-/.test(d) && fs.existsSync(path.join(root, d)) && fs.statSync(path.join(root, d)).isDirectory());

// Indice rapide (recherche de chaîne) qu'une leçon contient un item exécutable/gaté.
const GATED_HINT = /(\btests\s*:\s*\[)|(\blang\s*:\s*"(python|js|sql|java|c|cpp|bash)")/;

let files = [];
for (const d of courseDirs) {
  for (const f of fs.readdirSync(path.join(root, d))) {
    if (/^(lecon|jour)\d+\.html$/.test(f)) {
      const p = path.join(d, f);
      const head = fs.readFileSync(path.join(root, p), "utf8");
      if (GATED_HINT.test(head)) files.push(p);
    }
  }
}

let pass = 0, fail = 0, disabled = 0, notests = 0;
const failures = [];
for (const p of files) {
  const r = spawnSync("node", [path.join(root, "_verify.js"), p], { cwd: root, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  for (const line of out.split("\n")) {
    const m = line.match(/END_VERIFY pass:(\d+)\/(\d+)/);
    if (m) { (m[1] === m[2]) ? pass++ : (fail++, failures.push(line.trim())); }
    else if (/END_VERIFY FAIL/.test(line)) { fail++; failures.push(p + "  " + line.trim()); }
    else if (/END_VERIFY disabled/.test(line)) disabled++;
    else if (/END_VERIFY (no-tests|no-atoi|no-ECRITURE)/.test(line)) notests++;
  }
  if (/END_VERIFY FAIL/.test(out)) {
    const detail = out.split("\n").filter(l => /FAIL|SOLUTION_ERROR|compile error|got:/.test(l)).slice(0, 6).join("\n");
    if (detail) failures.push("   " + detail.replace(/\n/g, "\n   "));
  }
}

console.log("=".repeat(60));
console.log("Leçons scannées comme gatées : " + files.length);
console.log("Items exécutés VERTS (pass:N/N) : " + pass);
console.log("Items ignorés (disabled/no-tests) : " + (disabled + notests));
console.log("ÉCHECS : " + fail);
if (failures.length) { console.log("\n--- Détails des échecs ---"); failures.forEach(l => console.log(l)); }
console.log("=".repeat(60));
process.exit(fail ? 1 : 0);
