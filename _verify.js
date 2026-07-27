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
  if (x.runnable === false) { console.log(file, x.id, "END_VERIFY disabled"); return; }
  const lang = x.lang || "python";
  let res;
  if (lang === "python") res = verifyPython(x);
  else if (lang === "js") res = verifyJs(x);
  else if (lang === "sql") res = verifySql(x);
  else if (lang === "java") res = verifyJava(x);
  else if (lang === "c") res = verifyCompiled(x, "c");
  else if (lang === "cpp") res = verifyCompiled(x, "cpp");
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

/* ---------- JavaScript / DOM (mini-shim maison, jsdom étant bloqué) ----------
   Suffisant pour le vocabulaire des tests que l'on écrit : createElement, get/querySelector(All)
   par balise/#id/.classe (avec descendant "a b"), appendChild, textContent, innerHTML (simple),
   value, addEventListener('click')/click(), classList, children/childElementCount. */
function verifyJs(x) {
  if (!x.tests || !x.tests.length) return { skip: "no-tests" };
  const vm = require("vm");
  const tests = x.tests.map(t => (typeof t === "string") ? { label: "test", code: t } : { label: t.label || "test", code: t.code });
  let passed = 0, msg = "";
  try {
    const { document, window } = makeDom(x.solution || "");
    const sandbox = { document, window, console };
    vm.createContext(sandbox);
    // exécute les <script> du code élève (le DOM a déjà été construit par makeDom)
    (x.solution.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || []).forEach(function (block) {
      const js = block.replace(/<script[^>]*>/i, "").replace(/<\/script>/i, "");
      vm.runInContext(js, sandbox);
    });
    // si le code n'a aucune balise, c'est du JS pur : on l'exécute tel quel
    if (!/</.test(x.solution)) vm.runInContext(x.solution, sandbox);
    for (const t of tests) {
      try { vm.runInContext(t.code, sandbox); passed++; }
      catch (e) { msg += "  FAIL: " + t.label + " -> " + e.message + "\n"; }
    }
  } catch (e) { return { ok: false, msg: "SOLUTION_ERROR: " + e.message + "\n" + msg }; }
  return { ok: passed === tests.length, passed: passed, total: tests.length, msg: msg };
}

function makeDom(html) {
  function El(tag) {
    this.tagName = (tag || "div").toUpperCase(); this.children = []; this.parentNode = null;
    this.attributes = {}; this._text = ""; this._listeners = {}; this.style = {};
    this.classList = {
      _s: this, add: function (c) { var l = (this._s.attributes["class"] || "").split(/\s+/).filter(Boolean); if (l.indexOf(c) < 0) l.push(c); this._s.attributes["class"] = l.join(" "); },
      remove: function (c) { this._s.attributes["class"] = (this._s.attributes["class"] || "").split(/\s+/).filter(function (y) { return y && y !== c; }).join(" "); },
      contains: function (c) { return (this._s.attributes["class"] || "").split(/\s+/).indexOf(c) >= 0; },
      toggle: function (c) { this.contains(c) ? this.remove(c) : this.add(c); }
    };
  }
  Object.defineProperty(El.prototype, "id", { get: function () { return this.attributes.id || ""; }, set: function (v) { this.attributes.id = v; } });
  Object.defineProperty(El.prototype, "className", { get: function () { return this.attributes["class"] || ""; }, set: function (v) { this.attributes["class"] = v; } });
  Object.defineProperty(El.prototype, "value", { get: function () { return this.attributes.value || ""; }, set: function (v) { this.attributes.value = v; } });
  Object.defineProperty(El.prototype, "childElementCount", { get: function () { return this.children.length; } });
  Object.defineProperty(El.prototype, "textContent", {
    get: function () { return this._text + this.children.map(function (c) { return c.textContent; }).join(""); },
    set: function (v) { this.children = []; this._text = String(v); }
  });
  Object.defineProperty(El.prototype, "innerHTML", {
    get: function () { return this._text; },
    set: function (v) { this.children = []; this._text = ""; var kids = parseNodes(String(v)); var self = this; kids.forEach(function (k) { self.appendChild(k); }); }
  });
  El.prototype.appendChild = function (c) { c.parentNode = this; this.children.push(c); return c; };
  El.prototype.setAttribute = function (k, v) { this.attributes[k] = v; };
  El.prototype.getAttribute = function (k) { return this.attributes[k]; };
  El.prototype.addEventListener = function (ev, fn) { (this._listeners[ev] = this._listeners[ev] || []).push(fn); };
  El.prototype.click = function () { (this._listeners["click"] || []).forEach(function (f) { f.call(this, { type: "click", target: this }); }, this); };
  El.prototype.querySelectorAll = function (sel) { return selectAll(this, sel); };
  El.prototype.querySelector = function (sel) { return selectAll(this, sel)[0] || null; };
  El.prototype.getElementsByTagName = function (t) { return selectAll(this, t); };
  Object.defineProperty(El.prototype, "firstChild", { get: function () { return this.children[0] || null; } });

  function walk(node, fn) { node.children.forEach(function (c) { fn(c); walk(c, fn); }); }
  function matches(el, part) {
    part = part.trim();
    if (part.charAt(0) === "#") return el.attributes.id === part.slice(1);
    if (part.charAt(0) === ".") return (el.attributes["class"] || "").split(/\s+/).indexOf(part.slice(1)) >= 0;
    return el.tagName === part.toUpperCase();
  }
  function selectAll(root, sel) {
    var res = [];
    sel.split(",").forEach(function (one) {
      var parts = one.trim().split(/\s+/);
      var current = [root];
      parts.forEach(function (p) {
        var next = [];
        current.forEach(function (ctx) { walk(ctx, function (el) { if (matches(el, p)) next.push(el); }); });
        current = next;
      });
      current.forEach(function (e) { if (res.indexOf(e) < 0) res.push(e); });
    });
    return res;
  }
  function parseNodes(str) {
    var out = [], stack = [], re = /<\/?([a-zA-Z0-9]+)([^>]*)>|([^<]+)/g, m;
    var selfClose = { br: 1, img: 1, input: 1, hr: 1, meta: 1, link: 1 };
    function top() { return stack[stack.length - 1]; }
    while ((m = re.exec(str))) {
      if (m[3]) { var txt = m[3]; if (top()) top()._text += txt; else if (txt.trim()) { var tn = new El("text"); tn._text = txt; out.push(tn); } continue; }
      var tag = m[1].toLowerCase(), attrs = m[2] || "", closing = m[0].charAt(1) === "/";
      if (closing) { var done = stack.pop(); if (!stack.length && done) out.push(done); continue; }
      var e = new El(tag);
      var am; var ar = /([a-zA-Z_-]+)\s*=\s*"([^"]*)"|([a-zA-Z_-]+)\s*=\s*'([^']*)'/g;
      while ((am = ar.exec(attrs))) { var k = am[1] || am[3]; var v = am[2] !== undefined ? am[2] : am[4]; e.attributes[k] = v; }
      if (top()) top().appendChild(e);
      if (!selfClose[tag] && !/\/>$/.test(m[0])) stack.push(e); else if (!top()) out.push(e);
    }
    while (stack.length) { var r = stack.shift(); if (!r.parentNode) out.push(r); }
    return out;
  }

  var doc = new El("html");
  var body = new El("body"); doc.appendChild(body);
  var htmlOnly = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  parseNodes(htmlOnly).forEach(function (n) { body.appendChild(n); });
  doc.body = body;
  doc.createElement = function (t) { return new El(t); };
  doc.createTextNode = function (t) { var n = new El("text"); n._text = String(t); return n; };
  doc.getElementById = function (id) { var f = null; walk(body, function (el) { if (!f && el.attributes.id === id) f = el; }); return f; };
  doc.querySelector = function (s) { return selectAll(body, s)[0] || null; };
  doc.querySelectorAll = function (s) { return selectAll(body, s); };
  doc.getElementsByTagName = function (t) { return selectAll(body, t); };
  var win = { document: doc, alert: function () {}, console: console };
  win.Function = Function;
  return { document: doc, window: win };
}

/* ---------- SQL (SQLite via le module python3) ---------- */
function verifySql(x) {
  if (!x.tests || !x.tests.length) return { skip: "no-tests" };
  const harness = `
import sqlite3, json
schema = ${pyStr(x.schema || "")}
sol = ${pyStr(x.solution || "")}
tests = json.loads(${JSON.stringify(JSON.stringify(x.tests))})
passed = 0
for t in tests:
    # Chaque test repart d'une base FRAÎCHE (schéma + données de départ) pour être indépendant :
    # une requête de test explicite s'évalue sur les données de départ, sauf si afterSolution=true.
    con = sqlite3.connect(":memory:"); cur = con.cursor()
    try:
        cur.executescript(schema)
    except Exception as e:
        print("  SCHEMA_ERROR:", repr(e)); continue
    q = t.get('query')
    try:
        if q is None:
            # pas de requête explicite : la solution EST la réponse à exécuter (un SELECT)
            rows = [list(r) for r in cur.execute(sol).fetchall()]
        else:
            # Par défaut on applique la solution puis on vérifie son effet (cas CREATE/INSERT/UPDATE…).
            # seed=true : la requête de test est auto-portante et s'évalue sur les données de départ.
            if not t.get('seed'):
                cur.executescript(sol)
            rows = [list(r) for r in cur.execute(q).fetchall()]
        exp = t.get('expect')
        if exp is not None:
            exp = [list(r) for r in exp]
            assert rows == exp, "got %r expected %r" % (rows, exp)
        passed += 1
    except Exception as e:
        print("  FAIL:", t.get('label','test'), "->", repr(e))
    finally:
        con.close()
print("PASS", passed, len(tests))
`;
  const r = spawnSync("python3", ["-c", harness], { encoding: "utf8" });
  return parsePass((r.stdout || "") + (r.stderr || ""));
}

/* ---------- Java (exécution locale via `java Fichier.java`, JDK 11+ en mode fichier unique) ----------
   Non exécutable dans le navigateur ; ici on VÉRIFIE seulement que la sortie attendue (x.atoi.expected)
   annoncée à l'élève correspond bien à ce que produit la solution de référence. */
function verifyJava(x) {
  if (!x.atoi || x.atoi.expected === undefined) return { skip: "no-atoi" };
  const os = require("os"), path = require("path"), fs2 = require("fs");
  const dir = fs2.mkdtempSync(path.join(os.tmpdir(), "jv"));
  const m = String(x.solution || "").match(/public\s+class\s+(\w+)/);
  const cls = m ? m[1] : "Main";
  const file = path.join(dir, cls + ".java");
  fs2.writeFileSync(file, x.solution || "");
  const r = spawnSync("java", [file], { encoding: "utf8", timeout: 25000 });
  try { fs2.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  const out = (r.stdout || "").replace(/\s+$/g, "");
  const exp = String(x.atoi.expected).replace(/\s+$/g, "");
  if (r.error) return { ok: false, msg: "java error: " + r.error.message };
  if (out === exp) return { ok: true, passed: 1, total: 1 };
  return { ok: false, msg: "got:\n" + out + "\n--- expected:\n" + exp + (r.stderr ? "\n--- stderr:\n" + r.stderr.trim() : "") };
}

/* ---------- C / C++ (compilation gcc/g++ puis exécution ; contrôle de la sortie attendue) ----------
   Non exécutables dans le navigateur ; on vérifie seulement que x.atoi.expected correspond à la sortie
   réelle de la solution de référence. input() simulé via x.stdin (lignes fournies au programme). */
function verifyCompiled(x, lang) {
  if (!x.atoi || x.atoi.expected === undefined) return { skip: "no-atoi" };
  const os = require("os"), path = require("path"), fs2 = require("fs");
  const dir = fs2.mkdtempSync(path.join(os.tmpdir(), lang));
  const ext = lang === "c" ? "c" : "cpp";
  const src = path.join(dir, "prog." + ext);
  const bin = path.join(dir, "prog.out");
  fs2.writeFileSync(src, x.solution || "");
  const compiler = lang === "c" ? "gcc" : "g++";
  const args = lang === "c" ? [src, "-o", bin, "-lm"] : ["-std=c++17", src, "-o", bin];
  const c = spawnSync(compiler, args, { encoding: "utf8", timeout: 40000 });
  if (c.status !== 0) { try { fs2.rmSync(dir, { recursive: true, force: true }); } catch (e) {} return { ok: false, msg: "compile error:\n" + (c.stderr || "").trim() }; }
  const stdin = (x.stdin && x.stdin.length) ? (x.stdin.join("\n") + "\n") : "";
  const r = spawnSync(bin, [], { encoding: "utf8", timeout: 15000, input: stdin });
  try { fs2.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  if (r.error) return { ok: false, msg: "run error: " + r.error.message };
  const got = (r.stdout || "").replace(/\s+$/g, "");
  const exp = String(x.atoi.expected).replace(/\s+$/g, "");
  if (got === exp) return { ok: true, passed: 1, total: 1 };
  return { ok: false, msg: "got:\n" + got + "\n--- expected:\n" + exp + (r.stderr ? "\n--- stderr:\n" + r.stderr.trim() : "") };
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
