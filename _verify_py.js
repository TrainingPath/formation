/* Vérificateur des exercices d'écriture Python.
   Usage : node _verify_py.js cours-python/leconNN.html
   Extrait l'objet ECRITURE, exécute la solution de référence + les tests sous python3,
   en simulant le runner du site (input() moqué via x.stdin, sortie exposée dans __output__).
   Affiche END_VERIFY pass:N/N pour chaque item. Sert à garantir que les tests écrits
   sont corrects (la solution de référence DOIT passer tous ses propres tests). */
const fs = require("fs");
const { spawnSync } = require("child_process");

const file = process.argv[2];
if (!file) { console.error("usage: node _verify_py.js <lecon.html>"); process.exit(2); }
const html = fs.readFileSync(file, "utf8");
const m = html.match(/var ECRITURE = ([\s\S]*?);\s*<\/script>/);
if (!m) { console.log(file, "END_VERIFY no-ECRITURE"); process.exit(0); }
let ECR;
try { ECR = eval("(" + m[1] + ")"); } catch (e) { console.log(file, "END_VERIFY parse-error:", e.message); process.exit(1); }

let allOk = true;
(ECR.items || []).forEach(function (x) {
  if (!x.tests || !x.tests.length) { console.log(file, x.id, "END_VERIFY no-tests"); allOk = false; return; }
  const stdin = JSON.stringify(x.stdin || []);
  const tests = x.tests.map(t => (typeof t === "string") ? { label: "test", code: t } : { label: t.label || "test", code: t.code });
  // Construit un harnais python identique au runner : ns partagé, input moqué, __output__ exposé.
  const harness = `
import io, sys, builtins, json
_stdin = json.loads(${JSON.stringify(stdin)})
_it = iter(_stdin)
def _fi(p=''):
    try: print(p, end='')
    except Exception: pass
    try: return str(next(_it))
    except StopIteration: return ''
builtins.input = _fi
ns = {}
_buf = io.StringIO(); _old = sys.stdout; sys.stdout = _buf
_SOLUTION = ${pyStr(x.solution)}
try:
    exec(_SOLUTION, ns)
except Exception as e:
    sys.stdout = _old
    print("SOLUTION_ERROR:", repr(e)); sys.exit(3)
ns['__output__'] = _buf.getvalue()
sys.stdout = _old
_tests = json.loads(${JSON.stringify(JSON.stringify(tests))})
_passed = 0
for _t in _tests:
    try:
        exec(_t['code'], ns); _passed += 1
    except Exception as e:
        print("  FAIL:", _t['label'], "->", repr(e))
print("PASS", _passed, len(_tests))
`;
  const r = spawnSync("python3", ["-c", harness], { encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const mm = out.match(/PASS (\d+) (\d+)/);
  if (mm && mm[1] === mm[2]) {
    console.log(file, x.id, "END_VERIFY pass:" + mm[1] + "/" + mm[2]);
  } else {
    allOk = false;
    console.log(file, x.id, "END_VERIFY FAIL\n" + out.trim());
  }
});
process.exit(allOk ? 0 : 1);

function pyStr(s) {
  // encode une string JS en littéral python triple-quotes sûr
  return '"""' + String(s).replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"') + '"""';
}
