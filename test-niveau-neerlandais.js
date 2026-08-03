/* Banque de questions — test de placement NÉERLANDAIS
   Chaque question vise un point précis du syllabus des cours du site.
   Questions neuves : aucune n'est reprise des leçons, ateliers ou examens. */
var BANQUE_NEERLANDAIS = {
  langue: "neerlandais",
  libelle: "Néerlandais",
  questions: [

    /* ================= A1 ================= */
    { palier: "A1", point: "négation niet / geen", type: "qcm",
      q: "Complète : « Ik heb ___ auto, ik neem altijd de bus. »",
      opts: ["geen", "niet", "niet een", "nooit"], a: 0 },

    { palier: "A1", point: "articles de / het", type: "qcm",
      q: "Complète : « ___ meisje speelt in de tuin. »",
      opts: ["De", "Het", "Een", "Der"], a: 1 },

    { palier: "A1", point: "pluriel des noms", type: "qcm",
      q: "Quel est le pluriel du nom « stad » ?",
      opts: ["stads", "staden", "steden", "stadden"], a: 2 },

    { palier: "A1", point: "ordre des mots : verbe en 2e position", type: "qcm",
      q: "Quelle phrase respecte la règle du verbe en 2e position ?",
      opts: ["Volgende week wij gaan naar Brugge", "Wij volgende week gaan naar Brugge", "Gaan volgende week wij naar Brugge", "Volgende week gaan wij naar Brugge"], a: 3 },

    { palier: "A1", point: "verbe zijn au présent", type: "qcm",
      q: "Complète : « Jullie ___ vandaag vrij. »",
      opts: ["bent", "zijn", "is", "ben"], a: 1 },

    { palier: "A1", point: "accord de l'adjectif (de/het)", type: "qcm",
      q: "Complète avec l'adjectif « klein » : « Dat is een ___ huis. »",
      opts: ["kleine", "kleinen", "klein", "kleins"], a: 2 },

    { palier: "A1", point: "verbes à particule séparable", type: "qcm",
      q: "Quelle phrase est correcte avec le verbe « opstaan » ?",
      opts: ["Ik sta om zeven uur op", "Ik opsta om zeven uur", "Ik sta op om zeven uur", "Ik om zeven uur opsta"], a: 0 },

    { palier: "A1", point: "er is / er zijn", type: "qcm",
      q: "Complète : « ___ zijn vier stoelen in de keuken. »",
      opts: ["Het", "Daar", "Dat", "Er"], a: 3 },

    { palier: "A1", point: "verbe hebben au présent", type: "saisie",
      q: "Conjugue le verbe « hebben » au présent avec « hij ».",
      a: ["heeft", "hij heeft"], ph: "un verbe" },

    { palier: "A1", point: "jours de la semaine", type: "saisie",
      q: "Traduis en néerlandais : « jeudi ».",
      a: ["donderdag", "de donderdag"], ph: "un mot" },

    { palier: "A1", point: "pluriel irrégulier", type: "saisie",
      q: "Écris le pluriel du nom « kind ».",
      a: ["kinderen", "de kinderen"], ph: "un mot" },

    { palier: "A1", point: "indiquer le chemin", type: "saisie",
      q: "Traduis en néerlandais : « à gauche ».",
      a: ["links", "naar links"], ph: "un mot" },

    /* ================= A2 ================= */
    { palier: "A2", point: "auxiliaire hebben ou zijn", type: "qcm",
      q: "Complète : « Hij ___ het hele weekend thuis gebleven. »",
      opts: ["heeft", "is", "had", "was"], a: 1 },

    { palier: "A2", point: "participe passé irrégulier", type: "qcm",
      q: "Quel est le participe passé du verbe « schrijven » ?",
      opts: ["schreef", "geschrijfd", "geschreven", "geschrijven"], a: 2 },

    { palier: "A2", point: "prétérit (imperfectum)", type: "qcm",
      q: "Complète au prétérit : « Wij ___ vorig jaar nog in Leuven. » (wonen)",
      opts: ["woonden", "wonden", "gewoond", "woonde"], a: 0 },

    { palier: "A2", point: "subordonnée omdat (rejet du verbe)", type: "qcm",
      q: "Quelle phrase place correctement le verbe dans la subordonnée avec « omdat » ?",
      opts: ["Ik blijf thuis omdat ik ben ziek", "Ik blijf thuis omdat ik ziek ben", "Ik blijf thuis omdat ben ik ziek", "Omdat ik ziek ben, ik blijf thuis"], a: 1 },

    { palier: "A2", point: "ordre des mots temps-manière-lieu", type: "qcm",
      q: "Quelle phrase respecte l'ordre temps – manière – lieu ?",
      opts: ["Wij gaan naar Gent morgen met de trein", "Wij gaan met de trein morgen naar Gent", "Wij gaan morgen met de trein naar Gent", "Morgen wij gaan met de trein naar Gent"], a: 2 },

    { palier: "A2", point: "comparatif", type: "qcm",
      q: "Quel est le comparatif de l'adjectif « duur » ?",
      opts: ["meer duur", "duurer", "duurst", "duurder"], a: 3 },

    { palier: "A2", point: "er + préposition", type: "qcm",
      q: "Quelle forme remplace « met dat » (avec cela) dans une phrase ?",
      opts: ["ermee", "erover", "eraan", "ervan"], a: 0 },

    { palier: "A2", point: "modaux au passé", type: "qcm",
      q: "Complète : « Toen ik klein was, ___ ik elke woensdag naar de zwemles. » (moeten)",
      opts: ["moet", "heb gemoeten", "moest", "zou moeten"], a: 2 },

    { palier: "A2", point: "participe passé irrégulier", type: "saisie",
      q: "Écris le participe passé du verbe « kopen ».",
      a: ["gekocht"], ph: "un mot" },

    { palier: "A2", point: "vocabulaire : vêtements", type: "saisie",
      q: "Traduis en néerlandais : « le manteau ».",
      a: ["de jas", "jas", "de mantel", "mantel"], ph: "un mot" },

    { palier: "A2", point: "prétérit irrégulier", type: "saisie",
      q: "Mets le verbe « brengen » au prétérit avec « ik ».",
      a: ["bracht", "ik bracht"], ph: "un verbe" },

    { palier: "A2", point: "adverbes de fréquence", type: "saisie",
      q: "Traduis en néerlandais l'adverbe de fréquence « toujours ».",
      a: ["altijd", "steeds"], ph: "un mot" },

    /* ================= B1 ================= */
    { palier: "B1", point: "subordonnées relatives die / dat", type: "qcm",
      q: "Complète : « Het boek ___ ik gisteren kocht, is echt spannend. »",
      opts: ["die", "dat", "wat", "welk"], a: 1 },

    { palier: "B1", point: "passif avec worden", type: "qcm",
      q: "Complète : « De brief wordt door de secretaresse ___. » (schrijven)",
      opts: ["schrijven", "te schrijven", "geschreven", "schreef"], a: 2 },

    { palier: "B1", point: "om … te + infinitif", type: "qcm",
      q: "Quelle phrase traduit correctement « Je vais en ville pour acheter des vêtements » ?",
      opts: ["Ik ga naar de stad om kleren kopen", "Ik ga naar de stad voor kleren te kopen", "Ik ga naar de stad om te kopen kleren", "Ik ga naar de stad om kleren te kopen"], a: 3 },

    { palier: "B1", point: "pronom relatif avec préposition", type: "qcm",
      q: "Complète : « Dat is de app ___ ik mijn treinkaartjes koop. »",
      opts: ["met die", "die", "waarover", "waarmee"], a: 3 },

    { palier: "B1", point: "diminutifs (-je)", type: "qcm",
      q: "Quel est le diminutif du nom « boom » ?",
      opts: ["boomje", "boompje", "boomtje", "boomkje"], a: 1 },

    { palier: "B1", point: "particules modales", type: "qcm",
      q: "Dans « Dat is toch niet waar? », la particule « toch »…",
      opts: ["exprime une négation supplémentaire", "marque le futur", "exprime la surprise ou la contestation", "indique une action passée"], a: 2 },

    { palier: "B1", point: "connecteurs avancés (hoewel)", type: "qcm",
      q: "Complète : « ___ hij ziek was, ging hij toch naar het werk. »",
      opts: ["Hoewel", "Ondanks", "Omdat", "Want"], a: 0 },

    { palier: "B1", point: "questions indirectes", type: "qcm",
      q: "Mets au style indirect : « Hij vraagt: “Waar woon je?” » → « Hij vraagt ___ . »",
      opts: ["waar woon je", "waar woont je", "waar je woont", "of waar je woont"], a: 2 },

    { palier: "B1", point: "participe passé irrégulier", type: "saisie",
      q: "Écris le participe passé du verbe « begrijpen ».",
      a: ["begrepen"], ph: "un mot" },

    { palier: "B1", point: "vocabulaire : travail et CV", type: "saisie",
      q: "Traduis en néerlandais : « un entretien d'embauche ».",
      a: ["een sollicitatiegesprek", "sollicitatiegesprek", "het sollicitatiegesprek"], ph: "un mot" },

    { palier: "B1", point: "diminutifs (-je)", type: "saisie",
      q: "Écris le diminutif du nom « stoel ».",
      a: ["stoeltje", "het stoeltje"], ph: "un mot" },

    { palier: "B1", point: "connecteurs de concession", type: "saisie",
      q: "Traduis en néerlandais le connecteur « bien que ».",
      a: ["hoewel", "alhoewel", "ofschoon"], ph: "un mot" },

    /* ================= B2 ================= */
    { palier: "B2", point: "als / wanneer / toen", type: "qcm",
      q: "Complète : « ___ ik zestien was, verhuisden we naar Utrecht. »",
      opts: ["Als", "Wanneer", "Toen", "Zodra"], a: 2 },

    { palier: "B2", point: "participe employé comme adjectif", type: "qcm",
      q: "Quelle expression signifie « la porte fermée » ?",
      opts: ["de sluitende deur", "de gesloten deur", "de te sluiten deur", "de sluitend deur"], a: 1 },

    { palier: "B2", point: "modaux au passé (had moeten)", type: "qcm",
      q: "Quelle phrase signifie « tu aurais dû me le dire » ?",
      opts: ["Je moest het me zeggen", "Je had het me moeten zeggen", "Je hebt het me moeten zeggen", "Je zou het me zeggen"], a: 1 },

    { palier: "B2", point: "passif approfondi (worden, door)", type: "qcm",
      q: "Complète : « Het rapport ___ vorige week door de directie goedgekeurd. »",
      opts: ["wordt", "is geworden", "werd", "heeft"], a: 2 },

    { palier: "B2", point: "constructions avec het", type: "qcm",
      q: "Complète : « ___ is jammer dat je niet kunt komen. »",
      opts: ["Dat", "Er", "Het", "Dit"], a: 2 },

    { palier: "B2", point: "inversion et mise en relief", type: "qcm",
      q: "Quelle phrase met correctement « pas la semaine prochaine » en tête ?",
      opts: ["Pas volgende week de resultaten komen", "Volgende week pas de resultaten komen", "De resultaten pas volgende week komen", "Pas volgende week komen de resultaten"], a: 3 },

    { palier: "B2", point: "expressions idiomatiques", type: "qcm",
      q: "Que signifie l'expression « de kat uit de boom kijken » ?",
      opts: ["chercher un chat perdu", "grimper aux arbres", "attendre prudemment avant d'agir", "se disputer violemment"], a: 2 },

    { palier: "B2", point: "implicite et nuance", type: "qcm",
      q: "Que veut dire « Dat zal wel meevallen. » ?",
      opts: ["ce sera sûrement pire que prévu", "ce sera probablement moins grave que prévu", "cela tombera au bon moment", "il faudra bien tomber d'accord"], a: 1 },

    { palier: "B2", point: "participe passé irrégulier", type: "saisie",
      q: "Écris le participe passé du verbe « verdwijnen ».",
      a: ["verdwenen"], ph: "un mot" },

    { palier: "B2", point: "collocations avec nemen", type: "saisie",
      q: "Traduis en néerlandais l'expression « prendre une décision ».",
      a: ["een beslissing nemen", "beslissing nemen", "een besluit nemen", "besluit nemen"], ph: "quelques mots" },

    { palier: "B2", point: "passif : forme à produire", type: "saisie",
      q: "Mets au passif : « Men restaureert het museum. » → « Het museum ___ gerestaureerd. »",
      a: ["wordt"], ph: "un verbe" },

    { palier: "B2", point: "connecteurs et prépositions", type: "saisie",
      q: "Traduis en néerlandais l'expression « au lieu de ».",
      a: ["in plaats van", "in plaats van te"], ph: "trois mots" }
  ]
};
if (typeof module !== "undefined" && module.exports) module.exports = BANQUE_NEERLANDAIS;
if (typeof window !== "undefined") window.BANQUE_NEERLANDAIS = BANQUE_NEERLANDAIS;
