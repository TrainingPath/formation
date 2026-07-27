/* Vérificateur universel des exercices d'écriture (Python / JS / SQL).
   Usage : node _verify.js cours-XXX/leconNN.html
   Extrait l'objet ECRITURE et, pour chaque item, exécute la solution de référence + ses tests,
   afin de garantir que les tests écrits sont corrects (la solution DOIT passer 100 % de ses tests).
   Le langage est donné par item.lang ("python" par défaut, ou "js", "sql").
   Affiche, par item : "<fichier> <id> END_VERIFY pass:N/N" (ou FAIL avec le détail).

   Formats attendus par langage :
   - python : { solution:"…", stdin:[…]?, tests:[{code, label}] }  (assertions Python ; __output__ = sortie)
   - js     : { solution:"…", tests:[{code, label}] }                (assertions JS ; document DOM via jsdom si dispo)
   - sql    : { schema:"…CREATE/INSERT…", solution:"…SELECT…", tests:[{ query?, expect }] }
              expect = tableau de lignes attendues ; si query absent, on teste le résultat de `solution`. */
const fs = require("fs");
const { spawnSync } = require("child_process");

const file = process.argv[2];
if (!file) { console.error("usage: node _verify.js <lecon.html>"); process.exit(2); }
const html = fs.readFileSync(file, "utf8");
const m = html.match(/var ECRITURE = ([\s\S]*?);\s*<\/script>/);
if (!m) { console.log(file, "END_VERIFY no-ECRITURE"); process.exit(0); }
let ECR;
try { ECR = eval("(" + m[1] + ")"); } catch (e) { console.log(file, "END_VERIFY parse-error:", e.message); process.exit(1); }

let allOk = true;
(ECR.items || []).forEach(function (x) {
  const lang = x.lang || "python";
  let res;
  if (lang === "python") res = verifyPython(x);
  else if (lang === "js") res = verifyJs(x);
  else if (lang === "sql") res = verifySql(x);
  else res = { ok: false, msg: "lang inconnu: " + lang };
  if (res.skip) { console.log(file, x.id, "END_VERIFY " + res.skip); return; }
  if (res.ok) console.log(file, x.id, "END_VERIFY pass:" + res.passed + "/" + res.total);
  else { allOk = false; console.log(file, x.id, "END_VERIFY FAIL\n" + (res.msg || "").trim()); }
});
process.exit(allOk ? 0 : 1);

/* ---------- Python ---------- */
function verifyPython(x) {
  if (!x.tests || !x.tests.length) return { skip: "no-tests" };
  const tests = x.tests.map(t => (typeof t === "string") ? { label: "test", code: t } : { label: t.label || "test", code: t.code });
  const harness = `
import io, sys, builtins, json
_stdin = json.loads(${JSON.stringify(JSON.stringify(x.stdin || []))})
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
  return parsePass((r.stdout || "") + (r.stderr || ""));
}

/* ---------- JavaScript (jsdom si dispo, sinon exécution simple) ---------- */
function verifyJs(x) {
  if (!x.tests || !x.tests.length) return { skip: "no-tests" };
  let jsdom = null;
  try { jsdom = require("jsdom"); } catch (e) { jsdom = null; }
  const tests = x.tests.map(t => (typeof t === "string") ? { label: "test", code: t } : { label: t.label || "test", code: t.code });
  let passed = 0, msg = "";
  try {
    let sandbox;
    if (jsdom) {
      const dom = new jsdom.JSDOM(x.html || "<!DOCTYPE html><body></body>", { runScripts: "outside-only" });
      sandbox = { window: dom.window, document: dom.window.document, console: console };
      const vm = require("vm"); vm.createContext(sandbox);
      vm.runInContext(x.solution, sandbox);
      for (const t of tests) {
        try { vm.runInContext(t.code, sandbox); passed++; }
        catch (e) { msg += "  FAIL: " + t.label + " -> " + e.message + "\n"; }
      }
    } else {
      const vm = require("vm"); sandbox = {}; vm.createContext(sandbox);
      vm.runInContext(x.solution, sandbox);
      for (const t of tests) {
        try { vm.runInContext(t.code, sandbox); passed++; }
        catch (e) { msg += "  FAIL: " + t.label + " -> " + e.message + "\n"; }
      }
    }
  } catch (e) { return { ok: false, msg: "SOLUTION_ERROR: " + e.message }; }
  return { ok: passed === tests.length, passed: passed, total: tests.length, msg: msg };
}

/* ---------- SQL (SQLite via le module python3) ---------- */
function verifySql(x) {
  if (!x.tests || !x.tests.length) return { skip: "no-tests" };
  const harness = `
import sqlite3, json
con = sqlite3.connect(":memory:")
cur = con.cursor()
cur.executescript(${pyStr(x.schema || "")})
# La "solution" de l'élève peut être une requête SELECT ou du DDL/DML ; on l'exécute.
sol = ${pyStr(x.solution || "")}
sol_rows = None
try:
    cur.executescript(sol)
except Exception:
    pass
tests = json.loads(${JSON.stringify(JSON.stringify(x.tests))})
passed = 0
for t in tests:
    q = t.get('query')
    if q is None:
        q = sol
    try:
        rows = [list(r) for r in cur.execute(q).fetchall()]
        exp = t.get('expect')
        if exp is not None:
            exp = [list(r) for r in exp]
            assert rows == exp, "got %r expected %r" % (rows, exp)
        passed += 1
    except Exception as e:
        print("  FAIL:", t.get('label','test'), "->", repr(e))
print("PASS", passed, len(tests))
`;
  const r = spawnSync("python3", ["-c", harness], { encoding: "utf8" });
  return parsePass((r.stdout || "") + (r.stderr || ""));
}

/* ---------- utilitaires ---------- */
function parsePass(out) {
  const mm = out.match(/PASS (\d+) (\d+)/);
  if (mm && mm[1] === mm[2]) return { ok: true, passed: +mm[1], total: +mm[2] };
  return { ok: false, msg: out };
}
function pyStr(s) {
  return '"""' + String(s).replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"') + '"""';
}
