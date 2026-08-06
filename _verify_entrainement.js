#!/usr/bin/env node
/*
 * _verify_entrainement.js — Vérificateur de la section « Entraînement du jour ».
 *
 * Le risque de cette section n'est pas qu'elle plante : c'est qu'elle soit
 * PLAUSIBLE ET CREUSE. Trois exercices interchangeables, cinq indices qui
 * paraphrasent la même phrase, une solution qui traîne déjà dans l'énoncé, un
 * champ `tests` inventé pour un langage que rien n'exécute. Tout cela s'affiche
 * très bien et n'apprend rien. Ce fichier existe pour rendre ces quatre fautes
 * impossibles à committer.
 *
 * CONTRÔLES
 *   1. Structure       — 3 exercices, niveaux 1/2/3, champs requis non vides.
 *   2. Indices         — exactement 5, non vides, tous distincts.
 *   3. Anti-paraphrase — deux indices trop proches (recouvrement de vocabulaire)
 *                        sont refusés : ce ne sont pas cinq marches, c'est une.
 *   4. Anti-fuite      — aucune ligne de code de la solution ne se retrouve dans
 *                        l'énoncé, le principe, un indice ou la checklist.
 *                        C'EST LE CONTRÔLE LE PLUS IMPORTANT DU FICHIER : le
 *                        site a déjà eu des encadrés qui donnaient la réponse.
 *   5. Contrat de style— au moins un exercice avec sous-questions, au moins un
 *                        avec question de réflexion, énoncés d'une longueur
 *                        décente (C1, C4, C5 du contrat consigné au CHANGELOG).
 *   6. Tests honnêtes  — champ `tests` présent SI ET SEULEMENT SI le langage
 *                        figure dans EXECUTABLES ; et pour ceux-là, la solution
 *                        de référence est EXÉCUTÉE et doit passer ses tests.
 *                        Si l'outil du langage manque sur cette machine, les
 *                        corrigés concernés ne sont pas rejoués — et le rapport
 *                        le dit, plutôt que de laisser croire à un vert complet.
 *   7. Unicité         — numéros et clés localStorage uniques dans tout le site.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");

const ROOT = __dirname;
// Langages réellement exécutables par ce vérificateur. Tout le reste doit se
// passer de `tests` : un test qui ne tourne jamais est un mensonge affiché.
// Chaque entrée dit avec quelle commande on constate que l'outil est là. Si
// l'outil manque sur cette machine, on ne fait PAS semblant : les exercices du
// langage ne sont pas rejoués et le rapport final le dit en toutes lettres.
const EXECUTABLES = {
  python: { outil: "python3", sonde: ["python3", ["-c", "pass"]] },
  java:   { outil: "javac",   sonde: ["java", ["-version"]] },
};
function outilPresent(lang) {
  const s = EXECUTABLES[lang].sonde;
  try { execFileSync(s[0], s[1], { stdio: "ignore", timeout: 30000 }); return true; }
  catch (e) { return false; }
}
const SEUIL_PARAPHRASE = 0.72;   // recouvrement de vocabulaire toléré entre 2 indices
const MIN_ENONCE = 120;          // en dessous, c'est un télégramme
const MIN_LIGNE_FUITE = 26;      // longueur à partir de laquelle une ligne compte

const problemes = [];
const notes = [];
function ko(m) { problemes.push(m); }

/* ------------------------------------------------------------------ outils */
function sansBalises(s) {
  return String(s).replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
function norm(s) {
  return sansBalises(s).toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ").trim();
}
function mots(s) {
  return norm(s).split(/[^a-z0-9_]+/).filter(w => w.length > 3);
}
/* Recouvrement de vocabulaire : |A ∩ B| / min(|A|,|B|). On divise par le plus
   court, sinon un indice long et un indice court quasi identiques passeraient. */
function recouvrement(a, b) {
  const A = new Set(mots(a)), B = new Set(mots(b));
  if (!A.size || !B.size) return 0;
  let communs = 0;
  for (const w of A) if (B.has(w)) communs++;
  return communs / Math.min(A.size, B.size);
}
/* Retire le commentaire de fin de ligne SANS toucher à ce qui est entre
   guillemets. La version précédente coupait bêtement au premier « # », ce qui
   mutilait toute ligne affichant un dièse. Et elle ignorait « // », de sorte
   qu'en Java chaque phrase de commentaire comptait comme du code : un indice
   qui explique la même idée avec les mêmes mots était alors dénoncé comme une
   fuite, alors qu'un commentaire n'est justement PAS la réponse. */
function sansCommentaire(l) {
  let out = "", q = null;
  for (let i = 0; i < l.length; i++) {
    const c = l[i];
    if (q) {
      out += c;
      if (c === "\\") { if (i + 1 < l.length) { out += l[i + 1]; i++; } continue; }
      if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'") { q = c; out += c; continue; }
    if (c === "#") break;
    if (c === "/" && l[i + 1] === "/") break;
    out += c;
  }
  return out;
}
/* Lignes de CODE d'une solution : commentaires et lignes vides écartés, car un
   commentaire repris dans un indice ne révèle pas la réponse. */
function lignesCode(solution) {
  const vues = new Set();
  return String(solution).split("\n")
    .map(l => sansCommentaire(l).trim())
    // Commentaires de bloc occupant leur propre ligne (/* … */, * … de Javadoc,
    // et les /* … */ du pseudocode) : même raisonnement que ci-dessus.
    .filter(l => !/^(\/\*|\*\/|\*\s)/.test(l))
    // Les lignes de DÉCLARATION sont exclues : une signature n'est pas la
    // réponse, c'est l'interface — et l'énoncé la donne déjà lui-même quand il
    // écrit « écris allure(distance, duree) ». Les signaler comme fuite pousse
    // à écrire des indices volontairement flous, ce qui dessert l'élève sans
    // rien protéger. Ce qui doit rester caché, c'est la LOGIQUE du corps.
    // Java, C, C++, C# déclarent avec des modificateurs plutôt qu'avec `def` :
    // la même exclusion doit les couvrir, sans quoi l'en-tête obligatoire de
    // tout programme Java serait une « fuite » dans chaque leçon.
    .filter(l => !/^(def |class )/.test(l))
    .filter(l => !/^(public|private|protected|static|final|abstract|synchronized|class|interface|enum|record|@\w+)\b/.test(l))
    .filter(l => {
      // Dédoublonnage : une ligne répétée dans la solution ne doit pas produire
      // deux fois le même reproche.
      if (l.length < MIN_LIGNE_FUITE || vues.has(l)) return false;
      vues.add(l);
      return true;
    });
}

/* --------------------------------------------------- lecture d'une leçon */
function lireEntrainement(fichier) {
  const src = fs.readFileSync(fichier, "utf8");
  if (src.indexOf("var ENTRAINEMENT") === -1) return null;
  const m = src.match(/var ENTRAINEMENT = \{[\s\S]*?\n\};/);
  if (!m) { ko(fichier + " : bloc ENTRAINEMENT présent mais illisible"); return null; }
  const ctx = {};
  vm.createContext(ctx);
  try { vm.runInContext(m[0], ctx); }
  catch (e) { ko(fichier + " : ENTRAINEMENT ne parse pas — " + e.message); return null; }
  if (!src.includes('src="entrainement.js"')) {
    ko(fichier + " : ENTRAINEMENT déclaré mais entrainement.js n'est pas chargé — " +
       "la section resterait invisible");
  }
  return ctx.ENTRAINEMENT;
}

/* ------------------------------------------------- exécution des solutions */
/* On n'affirme pas qu'une solution est juste : on la fait tourner. Le script
   Python ci-dessous rejoue exactement ce que fait le navigateur — stdout
   capturé, exposé aux tests sous le nom __output__, input() alimenté par stdin. */
const RUNNER = `
import json, sys, io, contextlib, os, tempfile
lot = json.load(open(sys.argv[1], encoding="utf-8"))
echecs = []
# Les exercices sur les fichiers (leçon 17) font écrire sur le disque. On exécute
# donc TOUT dans un dossier temporaire hors du dépôt : sans cela, un corrigé
# laisserait un artefact commité — l'erreur locations.txt / taches.json, déjà
# commise deux fois sur ce site.
_bac = tempfile.mkdtemp(prefix="entr-")
os.chdir(_bac)
for x in lot:
    ns = {}
    it = iter(x.get("stdin") or [])
    ns["input"] = lambda p="", _it=it: next(_it, "")
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(x["solution"], ns)
    except Exception as e:
        echecs.append([x["ref"], "la solution de référence plante : %s: %s" % (type(e).__name__, e)])
        continue
    ns["__output__"] = buf.getvalue()
    for t in x["tests"]:
        try:
            exec(t["code"], ns)
        except Exception as e:
            echecs.append([x["ref"], "test refusé par la solution de référence : %s (%s)"
                                     % (t["label"], type(e).__name__)])
print(json.dumps(echecs))
`;

/* Java : rien ne s'exécute dans le navigateur, mais la CI, elle, compile et
   lance réellement chaque corrigé (`java Fichier.java`, compilation en mémoire,
   aucun .class écrit). Le contrat est le même que pour Python : la sortie
   standard du programme est exposée aux tests sous le nom __output__, les
   assertions restent écrites en Python pour que les deux langages se vérifient
   de la même façon. Tout se passe dans un dossier temporaire : un corrigé qui
   écrirait un fichier ne salit pas le dépôt. */
const RUNNER_JAVA = `
import json, sys, os, subprocess, tempfile, concurrent.futures
lot = json.load(open(sys.argv[1], encoding="utf-8"))

def joue(x):
    """Compile et execute UN corrige. Rendu : (ref, dossier, sortie, echec)."""
    d = tempfile.mkdtemp(prefix="entr-java-")
    src = os.path.join(d, "Prog.java")
    open(src, "w", encoding="utf-8").write(x["solution"])
    entree = "".join(l + "\\n" for l in (x.get("stdin") or []))
    try:
        # -D...encoding=UTF-8 : sans cela, la sortie depend de la locale de la
        # machine et les accents deviennent des « ? ». Un test qui passe chez
        # l'un et echoue chez l'autre ne prouve rien : on fixe l'encodage.
        r = subprocess.run(["java", "-Dfile.encoding=UTF-8",
                            "-Dstdout.encoding=UTF-8", "-Dstderr.encoding=UTF-8", src],
                           input=entree, capture_output=True,
                           text=True, encoding="utf-8", timeout=90, cwd=d)
    except subprocess.TimeoutExpired:
        return (x, d, None, "la solution de reference ne termine pas (90 s)")
    if r.returncode != 0:
        lignes = [l for l in (r.stderr or "").strip().splitlines() if l.strip()]
        detail = lignes[0] if lignes else ("code de retour %d" % r.returncode)
        return (x, d, None, "la solution de reference ne compile pas ou plante : " + detail)
    return (x, d, r.stdout, None)

# Deux phases. Les PROGRAMMES tournent en parallele - c'est le temps long.
# Les ASSERTIONS, elles, se jouent ensuite une par une, chacune depuis le
# dossier temporaire de son exercice : un test a donc le droit d'ouvrir un
# fichier que le corrige vient d'ecrire (lecon 17 et suivantes). Le faire en
# parallele serait impossible, le dossier courant etant global au processus.
resultats = []
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
    for res in ex.map(joue, lot):
        resultats.append(res)

echecs = []
depart = os.getcwd()
for x, d, sortie, echec in resultats:
    if echec is not None:
        echecs.append([x["ref"], echec])
        continue
    ns = {"__output__": sortie, "__dossier__": d}
    os.chdir(d)
    try:
        for t in x["tests"]:
            try:
                exec(t["code"], ns)
            except Exception as e:
                echecs.append([x["ref"], "test refuse par la solution de reference : %s (%s)"
                                          % (t["label"], type(e).__name__)])
    finally:
        os.chdir(depart)
print(json.dumps(echecs))
`;

const RUNNERS = { python: RUNNER, java: RUNNER_JAVA };

function executerLot(lang, lot) {
  if (!lot.length) return [];
  const f = path.join(require("os").tmpdir(), "entr-" + lang + "-" + process.pid + ".json");
  const r = path.join(require("os").tmpdir(), "entr-runner-" + lang + "-" + process.pid + ".py");
  fs.writeFileSync(f, JSON.stringify(lot), "utf8");
  fs.writeFileSync(r, RUNNERS[lang], "utf8");
  try {
    const out = execFileSync("python3", [r, f], { encoding: "utf8", timeout: 120000 });
    return JSON.parse(out);
  } catch (e) {
    ko("Exécution des solutions (" + lang + ") impossible : " + (e.message || e));
    return [];
  } finally {
    try { fs.unlinkSync(f); fs.unlinkSync(r); } catch (e) {}
  }
}

/* ------------------------------------------------------------ vérification */
const numsVus = new Map();
const domainesRecents = [];   // { domaine, jour, cours } — pour la règle des 4 leçons
const series = new Map();     // cours/nom -> occurrences, pour vérifier la continuité
const clesVues = new Set();
const aExecuter = new Map();   // langage -> exercices à rejouer
let leconsVues = 0, exercicesVus = 0;

function verifierLecon(fichier, E) {
  const L = path.relative(ROOT, fichier);
  leconsVues++;

  if (!E.cours || E.jour === undefined) ko(L + " : `cours` ou `jour` manquant");
  const lang = E.lang || "python";
  const executable = Object.prototype.hasOwnProperty.call(EXECUTABLES, lang);

  if (!Array.isArray(E.items) || E.items.length !== 3) {
    ko(L + " : " + ((E.items || []).length) + " exercice(s) au lieu de 3");
    return;
  }

  let avecSousQuestions = 0, avecReflexion = 0;
  const domainesLecon = [];

  E.items.forEach((x, i) => {
    const id = L + " [" + (x.num || "?") + "]";
    exercicesVus++;

    /* 1. structure */
    ["num", "titre", "enonce", "solution"].forEach(c => {
      if (!x[c] || !String(x[c]).trim()) ko(id + " : champ `" + c + "` vide ou absent");
    });
    if (x.niveau !== i + 1) {
      ko(id + " : niveau " + x.niveau + " en position " + (i + 1) +
         " — les trois exercices doivent aller croissant (1 direct, 2 combinaison, 3 filé)");
    }
    if (!Array.isArray(x.checklist) || x.checklist.length < 3) {
      ko(id + " : checklist absente ou de moins de 3 critères");
    }
    if (sansBalises(x.enonce || "").trim().length < MIN_ENONCE) {
      ko(id + " : énoncé de " + sansBalises(x.enonce || "").trim().length +
         " caractères — en dessous de " + MIN_ENONCE + ", ce n'est pas un énoncé (contrat C1)");
    }

    /* 7. unicité */
    const cleNum = E.cours + "/" + x.num;
    if (numsVus.has(cleNum)) ko(id + " : numéro déjà utilisé par " + numsVus.get(cleNum));
    else numsVus.set(cleNum, L);
    const cleLS = "entr-" + E.cours + "-" + E.jour + "-" + (i + 1);
    if (clesVues.has(cleLS)) ko(id + " : clé localStorage " + cleLS + " en double");
    clesVues.add(cleLS);

    /* 2-3. indices */
    if (!Array.isArray(x.indices) || x.indices.length !== 5) {
      ko(id + " : " + ((x.indices || []).length) + " indice(s) au lieu de 5");
    } else {
      x.indices.forEach((h, k) => {
        if (!h || sansBalises(h).trim().length < 30) {
          ko(id + " : indice " + (k + 1) + " vide ou trop court pour aider");
        }
      });
      for (let a = 0; a < 5; a++) {
        for (let b = a + 1; b < 5; b++) {
          if (norm(x.indices[a]) === norm(x.indices[b])) {
            ko(id + " : indices " + (a + 1) + " et " + (b + 1) + " identiques");
            continue;
          }
          const r = recouvrement(x.indices[a], x.indices[b]);
          if (r >= SEUIL_PARAPHRASE) {
            ko(id + " : indices " + (a + 1) + " et " + (b + 1) + " se recouvrent à " +
               Math.round(r * 100) + " % — ce sont des paraphrases, pas une gradation");
          }
        }
      }
    }

    /* 4. anti-fuite : LE contrôle central.
       EXCEPTION DÉCLARÉE — certains exercices consistent à ANALYSER du code
       fourni (« voici trois versions, laquelle est correcte ? »). Le code est
       alors dans l'énoncé par construction, et l'y interdire supprimerait tout
       un type d'exercice. L'exception doit être demandée explicitement par le
       champ `analyseDeCode`, qui porte sa justification — et elle ne lève le
       contrôle QUE sur l'énoncé : indices, principe et checklist restent
       couverts, car c'est là que la fuite serait un cadeau et non un sujet. */
    if (x.analyseDeCode !== undefined && !String(x.analyseDeCode).trim()) {
      ko(id + " : `analyseDeCode` présent mais sans justification écrite");
    }
    const zones = x.analyseDeCode
      ? [["principe", x.principe], ["remarque", x.remarque]]
      : [["énoncé", x.enonce], ["principe", x.principe], ["remarque", x.remarque]];
    (x.indices || []).forEach((h, k) => zones.push(["indice " + (k + 1), h]));
    (x.checklist || []).forEach((c, k) => zones.push(["checklist " + (k + 1), c]));
    lignesCode(x.solution).forEach(ligne => {
      const cible = norm(ligne);
      if (!cible) return;
      zones.forEach(([nom, texte]) => {
        if (!texte) return;
        if (norm(texte).indexOf(cible) !== -1) {
          ko(id + " : FUITE — la ligne de solution « " + ligne.slice(0, 60) +
             " » apparaît dans « " + nom + " ». L'élève lit la réponse au lieu de chercher.");
        }
      });
    });

    /* 5 bis. variété des domaines : le défaut attendu d'une génération en série
       est la monotonie thématique. On la traque mécaniquement. */
    if (!x.domaine || !String(x.domaine).trim()) {
      ko(id + " : champ `domaine` absent — la rotation des sujets n'est plus contrôlable");
    } else {
      const dom = norm(x.domaine);
      domainesLecon.push(dom);
      // Une mini-série a le droit de garder son domaine plusieurs jours ; les
      // exercices 1 et 2, non.
      if (!x.serie) {
        // `r.cours === E.cours` est indispensable : sans lui, le jour 1
        // d'algorithmes se compare au jour 2 de python et déclenche à tort.
        // La monotonie se juge à l'intérieur d'un parcours, pas entre deux.
        const recent = domainesRecents.find(r =>
          r.domaine === dom && r.cours === E.cours && Math.abs(r.jour - E.jour) <= 4);
        if (recent) {
          ko(id + " : domaine « " + x.domaine + " » déjà servi au jour " + recent.jour +
             " — quatre leçons d'écart au minimum (voir _outils/entrainement/plan-domaines.md)");
        }
        domainesRecents.push({ domaine: dom, jour: E.jour, cours: E.cours });
      }
    }

    /* 5 ter. mini-série : bornée à 4 jours, sinon c'est un fil rouge déguisé */
    if (i === 2 && !x.serie) {
      ko(id + " : le 3e exercice doit déclarer sa mini-série (champ `serie`)");
    }
    if (x.serie) {
      const S = x.serie;
      if (!S.nom || !S.jour || !S.sur) ko(id + " : `serie` incomplète (nom, jour, sur)");
      else {
        if (S.sur > 4) ko(id + " : mini-série de " + S.sur + " jours — au-delà de 4, " +
                          "ce n'est plus une mini-série mais un fil rouge déguisé");
        if (S.jour < 1 || S.jour > S.sur) ko(id + " : jour " + S.jour + " hors de la série de " + S.sur);
        const k = E.cours + "/" + S.nom;
        if (!series.has(k)) series.set(k, []);
        series.get(k).push({ jour: S.jour, sur: S.sur, lecon: E.jour });
      }
    }

    /* 5. contrat de style */
    if (Array.isArray(x.sousQuestions) && x.sousQuestions.length) avecSousQuestions++;
    if (x.reflexion && String(x.reflexion).trim()) avecReflexion++;

    /* 6. tests honnêtes */
    const aDesTests = Array.isArray(x.tests) && x.tests.length > 0;
    if (executable && !aDesTests) {
      ko(id + " : langage " + lang + " exécutable ici, mais aucun test — " +
         "l'élève ne saurait pas si sa réponse est juste");
    }
    if (!executable && aDesTests) {
      ko(id + " : langage " + lang + " NON exécuté par la CI, mais un champ `tests` " +
         "est présent — un test qui ne tourne jamais est un mensonge affiché");
    }
    if (executable && aDesTests) {
      if (!aExecuter.has(lang)) aExecuter.set(lang, []);
      aExecuter.get(lang).push({ ref: id, solution: x.solution, tests: x.tests, stdin: x.stdin || [] });
    }
  });

  const uniques = new Set(domainesLecon);
  if (domainesLecon.length === 3 && uniques.size < 3) {
    ko(L + " : les 3 exercices ne portent pas sur 3 domaines distincts (" +
       domainesLecon.join(", ") + ")");
  }
  if (!avecSousQuestions) {
    ko(L + " : aucun exercice avec sous-questions a/b/c — contrat C4 non respecté");
  }
  if (!avecReflexion) {
    ko(L + " : aucune question de réflexion « pourquoi ? » — contrat C5 non respecté");
  }
}

/* ---------------------------------------------------------------- balayage */
for (const dossier of fs.readdirSync(ROOT)) {
  const d = path.join(ROOT, dossier);
  if (!dossier.startsWith("cours-") || !fs.statSync(d).isDirectory()) continue;
  // Un cours sans entrainement.js n'a aucune leçon équipée : inutile d'ouvrir
  // ses 31 fichiers pour le constater. Sur ce dépôt (plus de 2 000 leçons), la
  // différence est celle entre deux secondes et deux minutes.
  if (!fs.existsSync(path.join(d, "entrainement.js"))) continue;
  for (const f of fs.readdirSync(d)) {
    if (!/^(lecon|jour)\d+\.html$/.test(f)) continue;
    const E = lireEntrainement(path.join(d, f));
    if (E) verifierLecon(path.join(d, f), E);
  }
}

/* Exécution réelle des solutions, un appel par langage. */
const nonRejoues = [];
for (const [lang, lot] of aExecuter) {
  const nTests = lot.reduce((n, x) => n + x.tests.length, 0);
  if (!outilPresent(lang)) {
    nonRejoues.push(lang + " (" + EXECUTABLES[lang].outil + " absent de cette machine) : " +
      lot.length + " corrigé(s), " + nTests + " test(s)");
    continue;
  }
  const echecs = executerLot(lang, lot);
  echecs.forEach(([ref, msg]) => ko(ref + " : " + msg));
  notes.push(lang + " : " + lot.length + " solution(s) de référence exécutées, " +
    nTests + " test(s) rejoués");
}

// Continuité des mini-séries : les jours doivent se suivre sans trou ni doublon.
for (const [k, occ] of series) {
  const jours = occ.map(o => o.jour).sort((a, b) => a - b);
  const attendu = occ[0].sur;
  const vus = new Set(jours);
  if (vus.size !== jours.length) ko("Mini-série « " + k + " » : un même jour déclaré deux fois");
  jours.forEach((j, idx) => {
    if (j !== idx + 1) ko("Mini-série « " + k + " » : trou dans la numérotation (jour " + j +
                          " en position " + (idx + 1) + ")");
  });
  if (jours.length === attendu) {
    const leconsSerie = occ.map(o => o.lecon).sort((a, b) => a - b);
    for (let z = 1; z < leconsSerie.length; z++) {
      if (leconsSerie[z] !== leconsSerie[z - 1] + 1) {
        ko("Mini-série « " + k + "  » : leçons non consécutives (" + leconsSerie.join(", ") + ")");
      }
    }
  }
  notes.push("Mini-série « " + k + " » : " + jours.length + "/" + attendu + " jour(s) écrit(s)");
}

notes.push(leconsVues + " leçon(s) équipée(s) · " + exercicesVus + " exercice(s)");
notes.push("Seuils : paraphrase >= " + Math.round(SEUIL_PARAPHRASE * 100) +
  " % refusée · énoncé < " + MIN_ENONCE + " car. refusé · fuite détectée sur les lignes de code de "
  + MIN_LIGNE_FUITE + " car. et plus");

console.log("=== _verify_entrainement.js — rapport ===");
for (const n of notes) console.log("· " + n);
console.log("");
if (!problemes.length) {
  console.log("✅ Entraînements conformes : structure, indices gradués, aucune fuite de solution, " +
              "tests honnêtes et rejoués.");
  if (nonRejoues.length) {
    console.log("");
    console.log("⚠  Le vert ci-dessus NE COUVRE PAS les corrigés suivants, faute d'outil ici :");
    for (const n of nonRejoues) console.log("   - " + n);
    console.log("   Installe l'outil manquant puis relance pour obtenir un vert complet.");
  }
  process.exit(0);
}
console.log("❌ " + problemes.length + " problème(s) :");
for (const p of problemes) console.log("   - " + p);
process.exit(1);
