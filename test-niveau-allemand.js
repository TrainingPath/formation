/* Banque de questions — test de placement ALLEMAND
   Chaque question vise un point précis du syllabus des cours du site.
   Questions neuves : aucune n'est reprise des leçons, ateliers ou examens. */
var BANQUE_ALLEMAND = {
  langue: "allemand",
  libelle: "Allemand",
  questions: [

    /* ================= A1 ================= */
    { palier: "A1", point: "verbe sein au présent", type: "qcm",
      q: "Complète : « Ihr ___ heute sehr freundlich. »",
      opts: ["seid", "seit", "sind", "bist"], a: 0 },

    { palier: "A1", point: "genre des noms et articles définis", type: "qcm",
      q: "Quel article accompagne le nom « Fenster » (fenêtre) ?",
      opts: ["der", "die", "das", "dem"], a: 2 },

    { palier: "A1", point: "verbes forts (changement de voyelle)", type: "qcm",
      q: "Complète : « Du ___ viel zu schnell. » (fahren)",
      opts: ["fahrst", "fahrt", "fahrest", "fährst"], a: 3 },

    { palier: "A1", point: "ordre des mots : verbe en 2e position", type: "qcm",
      q: "Quelle phrase respecte la place du verbe ?",
      opts: ["Am Sonntag ich besuche meine Oma.", "Am Sonntag besuche ich meine Oma.", "Ich am Sonntag besuche meine Oma.", "Am Sonntag meine Oma ich besuche."], a: 1 },

    { palier: "A1", point: "négation nicht ou kein", type: "qcm",
      q: "Complète : « Wir haben heute leider ___ Zeit. »",
      opts: ["nicht", "kein", "nichts", "keine"], a: 3 },

    { palier: "A1", point: "verbes de modalité (können)", type: "qcm",
      q: "Complète : « Meine Schwester ___ sehr gut Klavier spielen. »",
      opts: ["könnt", "kannst", "kann", "können"], a: 2 },

    { palier: "A1", point: "verbes à particule séparable", type: "qcm",
      q: "Quelle phrase est correcte avec le verbe « aufstehen » ?",
      opts: ["Ich stehe um sechs Uhr auf.", "Ich aufstehe um sechs Uhr.", "Ich stehe auf um sechs Uhr.", "Ich auf stehe um sechs Uhr."], a: 0 },

    { palier: "A1", point: "cas datif", type: "qcm",
      q: "Complète : « Ich helfe ___ Lehrerin bei den Kopien. »",
      opts: ["die", "der", "den", "dem"], a: 1 },

    { palier: "A1", point: "verbe haben au présent", type: "saisie",
      q: "Écris la forme correcte du verbe « haben » avec le pronom « du ».",
      a: ["hast", "du hast"], ph: "un verbe" },

    { palier: "A1", point: "vocabulaire de la ville (traduction)", type: "saisie",
      q: "Traduis en allemand, avec son article défini : « la rue ».",
      a: ["die straße", "die strasse", "straße", "strasse"], ph: "article + nom" },

    { palier: "A1", point: "cas accusatif", type: "saisie",
      q: "Complète : « Sie sucht ___ Schlüssel. » (der Schlüssel, à l'accusatif)",
      a: ["den"], ph: "un article" },

    { palier: "A1", point: "jours de la semaine (traduction)", type: "saisie",
      q: "Traduis en allemand : « jeudi ».",
      a: ["donnerstag", "der donnerstag", "am donnerstag"], ph: "un jour" },

    /* ================= A2 ================= */
    { palier: "A2", point: "Perfekt : participes irréguliers", type: "qcm",
      q: "Complète : « Er hat den Brief schon gestern ___ . » (schreiben)",
      opts: ["geschreibt", "geschriebt", "geschrieben", "schriebte"], a: 2 },

    { palier: "A2", point: "auxiliaire haben ou sein", type: "qcm",
      q: "Complète : « Letzten Winter ___ meine Eltern in die Berge gefahren. »",
      opts: ["haben", "hatten", "waren", "sind"], a: 3 },

    { palier: "A2", point: "Präteritum des verbes fréquents", type: "qcm",
      q: "Complète : « Damals ___ er jeden Morgen zu Fuß zur Schule. » (gehen, au prétérit)",
      opts: ["ging", "gehte", "gang", "gegangen"], a: 0 },

    { palier: "A2", point: "déclinaison de l'adjectif après l'article défini", type: "qcm",
      q: "Complète : « Ich habe gestern den ___ Mantel gekauft. » (blau)",
      opts: ["blaue", "blauen", "blauer", "blaues"], a: 1 },

    { palier: "A2", point: "Wechselpräpositionen", type: "qcm",
      q: "Complète : « Stell die Flasche bitte auf ___ Tisch. »",
      opts: ["den", "dem", "der", "des"], a: 0 },

    { palier: "A2", point: "subordonnée avec weil", type: "qcm",
      q: "Après « weil », où se place le verbe ? Choisis la phrase correcte.",
      opts: ["Ich bleibe heute zu Hause, weil ich bin erkältet.", "Ich bleibe heute zu Hause, weil ich erkältet bin.", "Ich bleibe heute zu Hause, weil bin ich erkältet.", "Ich bleibe heute zu Hause, weil erkältet ich bin."], a: 1 },

    { palier: "A2", point: "conditionnel würde + infinitif", type: "qcm",
      q: "Complète : « An deiner Stelle ___ ich sofort mit der Chefin sprechen. »",
      opts: ["würde", "werde", "wurde", "wäre"], a: 0 },

    { palier: "A2", point: "subordonnées wenn ou als", type: "qcm",
      q: "Complète : « ___ ich zehn Jahre alt war, wohnten wir in Bremen. »",
      opts: ["Wenn", "Wann", "Als", "Ob"], a: 2 },

    { palier: "A2", point: "participe passé à produire", type: "saisie",
      q: "Écris le participe passé du verbe « nehmen ».",
      a: ["genommen"], ph: "un mot" },

    { palier: "A2", point: "comparatif (traduction)", type: "saisie",
      q: "Traduis en allemand : « plus grand que ».",
      a: ["größer als", "grösser als", "grosser als"], ph: "deux mots" },

    { palier: "A2", point: "Präteritum des modaux", type: "saisie",
      q: "Écris le prétérit du verbe « können » à la 1re personne du singulier (sans le pronom).",
      a: ["konnte"], ph: "un verbe" },

    { palier: "A2", point: "météo (traduction)", type: "saisie",
      q: "Traduis en allemand : « il pleut ».",
      a: ["es regnet", "regnet"], ph: "deux mots" },

    /* ================= B1 ================= */
    { palier: "B1", point: "cas génitif", type: "qcm",
      q: "Complète : « Das ist der Wagen ___ Nachbarn. » (der Nachbar)",
      opts: ["des", "dem", "der", "den"], a: 0 },

    { palier: "B1", point: "Relativsätze", type: "qcm",
      q: "Complète : « Der Kollege, ___ ich gestern geholfen habe, ist Ingenieur. »",
      opts: ["den", "dem", "der", "dessen"], a: 1 },

    { palier: "B1", point: "passif avec werden", type: "qcm",
      q: "Complète : « Die Rechnung ___ jeden Monat automatisch bezahlt. »",
      opts: ["ist", "hat", "wird", "war"], a: 2 },

    { palier: "B1", point: "Konjunktiv II de politesse", type: "qcm",
      q: "Complète cette demande polie : « ___ Sie mir bitte kurz helfen ? »",
      opts: ["Können", "Könnten", "Konnten", "Könntet"], a: 1 },

    { palier: "B1", point: "proposition infinitive um … zu", type: "qcm",
      q: "Quelle phrase exprime correctement le but ?",
      opts: ["Ich lerne Deutsch, um in Wien zu arbeiten.", "Ich lerne Deutsch, um in Wien arbeiten zu.", "Ich lerne Deutsch, um ich in Wien arbeite.", "Ich lerne Deutsch, für in Wien zu arbeiten."], a: 0 },

    { palier: "B1", point: "subordonnée avec obwohl", type: "qcm",
      q: "Complète : « ___ es in Strömen regnete, gingen wir spazieren. »",
      opts: ["Trotzdem", "Aber", "Obwohl", "Denn"], a: 2 },

    { palier: "B1", point: "déclinaison de l'adjectif sans article", type: "qcm",
      q: "Complète : « Zum Frühstück trinke ich gern ___ Tee. » (schwarz, sans article)",
      opts: ["schwarze", "schwarzer", "schwarzem", "schwarzen"], a: 3 },

    { palier: "B1", point: "discours indirect (Konjunktiv I)", type: "qcm",
      q: "Complète : « Der Direktor sagt, er ___ am Montag nicht im Büro. »",
      opts: ["ist", "sei", "war", "wird"], a: 1 },

    { palier: "B1", point: "Konjunktiv II (forme à produire)", type: "saisie",
      q: "Écris la forme du Konjunktiv II du verbe « haben » à la 3e personne du singulier.",
      a: ["hätte", "haette", "sie hätte", "er hätte"], ph: "un verbe" },

    { palier: "B1", point: "environnement (traduction)", type: "saisie",
      q: "Traduis en allemand, avec son article défini : « l'environnement ».",
      a: ["die umwelt", "umwelt"], ph: "article + nom" },

    { palier: "B1", point: "prépositions avec génitif", type: "saisie",
      q: "Complète par la préposition qui signifie « à cause de » : « ___ des schlechten Wetters blieben wir zu Hause. »",
      a: ["wegen", "aufgrund"], ph: "une préposition" },

    { palier: "B1", point: "travail et Lebenslauf (traduction)", type: "saisie",
      q: "Traduis en allemand, avec son article défini : « le curriculum vitae ».",
      a: ["der lebenslauf", "lebenslauf"], ph: "article + nom" },

    /* ================= B2 ================= */
    { palier: "B2", point: "Konjunktiv II du passé", type: "qcm",
      q: "Complète : « Wenn ich das früher gewusst hätte, ___ ich ganz anders reagiert. »",
      opts: ["würde", "hätte", "wäre", "hatte"], a: 1 },

    { palier: "B2", point: "modaux au passé (hätte müssen)", type: "qcm",
      q: "Quelle phrase est correcte (« nous aurions dû partir plus tôt ») ?",
      opts: ["Wir hätten früher abreisen müssen.", "Wir hätten früher abreisen gemusst.", "Wir haben früher abreisen gemusst.", "Wir wären früher abreisen müssen."], a: 0 },

    { palier: "B2", point: "Zustandspassiv", type: "qcm",
      q: "Qu'exprime la phrase « Das Museum ist seit Jahren geschlossen. » ?",
      opts: ["une action en train de se faire (Vorgangspassiv)", "un ordre atténué", "une hypothèse irréelle", "un état résultant (Zustandspassiv)"], a: 3 },

    { palier: "B2", point: "constructions participiales", type: "qcm",
      q: "Complète : « Die ___ Unterlagen liegen auf dem Schreibtisch. » (les documents déjà signés)",
      opts: ["unterschreibenden", "unterschreibende", "unterschriebenen", "unterschreibten"], a: 2 },

    { palier: "B2", point: "Konjunktiv I et discours rapporté", type: "qcm",
      q: "Complète : « Die Sprecherin erklärte, das Unternehmen ___ hundert neue Stellen schaffen. »",
      opts: ["wird", "werde", "wurde", "worden"], a: 1 },

    { palier: "B2", point: "Redewendungen", type: "qcm",
      q: "Que signifie l'expression « jemandem auf den Keks gehen » ?",
      opts: ["taper sur les nerfs de quelqu'un", "offrir un gâteau à quelqu'un", "marcher longtemps avec quelqu'un", "tenir parole envers quelqu'un"], a: 0 },

    { palier: "B2", point: "Nominalisierung", type: "qcm",
      q: "Quelle reformulation nominale correspond à « Nachdem er angekommen war, rief er sofort an. » ?",
      opts: ["Vor seiner Ankunft rief er sofort an.", "Nach seiner Ankunft rief er sofort an.", "Während seiner Ankunft rief er sofort an.", "Trotz seiner Ankunft rief er sofort an."], a: 1 },

    { palier: "B2", point: "hypothèses et probabilités (modaux)", type: "qcm",
      q: "Qu'exprime « Sie dürfte den Zug verpasst haben. » ?",
      opts: ["une interdiction", "une permission accordée", "une supposition probable", "une obligation stricte"], a: 2 },

    { palier: "B2", point: "Konjunktiv II du passé (forme à produire)", type: "saisie",
      q: "Écris la forme allemande de « j'aurais été » (Konjunktiv II passé de sein, 1re personne du singulier, sans le pronom).",
      a: ["wäre gewesen", "waere gewesen"], ph: "deux mots" },

    { palier: "B2", point: "nominalisation et émotions (traduction)", type: "saisie",
      q: "Traduis en allemand par un seul nom, avec son article défini : « la méfiance ».",
      a: ["das misstrauen", "misstrauen", "das mißtrauen", "mißtrauen"], ph: "article + nom" },

    { palier: "B2", point: "modaux au passé (auxiliaire à produire)", type: "saisie",
      q: "Complète : « Das ___ du mir wirklich früher sagen müssen. » (tu aurais dû)",
      a: ["hättest", "haettest"], ph: "un auxiliaire" },

    { palier: "B2", point: "collocations", type: "saisie",
      q: "Traduis en allemand cette collocation : « prendre une décision ».",
      a: ["eine entscheidung treffen", "entscheidung treffen", "einen entschluss fassen"], ph: "trois mots" }
  ]
};
if (typeof module !== "undefined" && module.exports) module.exports = BANQUE_ALLEMAND;
if (typeof window !== "undefined") window.BANQUE_ALLEMAND = BANQUE_ALLEMAND;
