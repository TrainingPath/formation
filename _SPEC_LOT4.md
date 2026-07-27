# SPÉC — Lot 4 : cours C#/.NET (non exécutables dans le navigateur, sans compilateur dispo)

Base bash : /sessions/beautiful-friendly-fermat/mnt/fable 5/
Ces cours ne s'exécutent ni dans le navigateur ni dans le sandbox (pas de `dotnet`). On n'invente aucun
interpréteur et on N'UTILISE PAS `lang:"..."` (rien n'est machine-vérifiable ici). On fournit, sur les
exercices d'écriture, un encadré « À toi de jouer » + checklist, et on applique Phases 2 (distracteurs, examen).

## TÂCHE A — Encadré « À toi de jouer » (`atoi`) + `checklist`
Sur chaque exercice d'écriture « codant », ajoute :
  `atoi: { cmd: "commande locale exacte", expected: "sortie/comportement attendu, au caractère près" }`
- `cmd` : la vraie commande locale. Pour du C# console : `dotnet run` (ou `dotnet run --project X`). Pour
  ASP.NET Core : `dotnet run` puis `curl -i http://localhost:5000/...`. Pour EF Core : `dotnet ef migrations add X`,
  `dotnet ef database update`, etc.
- `expected` : ce que l'élève doit voir (sortie console, JSON de l'API, SQL généré par EF, statut HTTP…),
  décrit précisément. **Prends grand soin** de l'exactitude : ici je ne peux PAS vérifier par machine (pas de
  compilateur C#), donc la justesse de `expected` repose entièrement sur ton raisonnement. En cas de doute,
  reste sur un `expected` que tu es certain d'obtenir (ex. une ligne `Console.WriteLine` littérale).
- Ajoute une `checklist` de 3-4 points concrets.
- Pour un exercice purement conceptuel (« Décris l'architecture… », « charte de projet ») : PAS d'atoi,
  seulement une `checklist` adaptée.
NE mets JAMAIS `lang:"csharp"` ni `lang:"java"` (aucune exécution possible → _verify doit rester no-tests).

## TÂCHE B — Distracteurs QCM
Réécris uniquement le TEXTE des options FAUSSES faibles (absurdes, hors-sujet, trop courtes), sans changer
l'ordre, l'index `a`, l'option correcte, ni `exp`. Distracteurs plausibles, longueur comparable. Signale toute
correction factuelle (bonne réponse / `exp` fausse) — c'est le SEUL cas où tu touches `a`/`exp`.

## TÂCHE C — Désactiver balanceOpts
Dans `<cours>/engine.js` : `var _opts = balanceOpts(ex);` → `var _opts = ex.opts.slice();`. `node --check`.

## VALIDATION par fichier
1. Parse + QCM (tolère DAY et ECRITURE dans le même bloc <script>) :
```
node -e 'const fs=require("fs");const h=fs.readFileSync(process.argv[1],"utf8");const dm=h.match(/var DAY = ([\s\S]*?);\s*\n\s*(?:var ECRITURE|<\/script>|<script)/);const D=eval("("+dm[1]+")");const em=h.match(/var ECRITURE = ([\s\S]*?);\s*\n\s*<\/script>/);if(em)eval("("+em[1]+")");let b=0;D.exercises.concat(D.final?D.final.questions:[]).forEach(e=>{if(e.type==="qcm"&&(typeof e.a!=="number"||e.a<0||e.a>=e.opts.length))b++;});console.log(process.argv[1],b?"QCM BAD":"QCM OK");' <fichier>
```
2. `node _verify.js <fichier>` : jamais FAIL (no-tests / no-ECRITURE attendu, aucun `lang`).

Aucun artefact commité. Réponds : nb atoi ajoutés, nb checklist-seule, nb QCM retouchés, corrections factuelles.
