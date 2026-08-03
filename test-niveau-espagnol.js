/* Banque de questions — test de placement ESPAGNOL
   Chaque question vise un point précis du syllabus des cours du site.
   Questions neuves : aucune n'est reprise des leçons, ateliers ou examens. */
var BANQUE_ESPAGNOL = {
  langue: "espagnol",
  libelle: "Espagnol",
  questions: [

    /* ---------------------------------------------------------------- A1 */
    { palier: "A1", point: "ser ou estar", type: "qcm",
      q: "Complète : « El museo ___ cerrado los lunes. »",
      opts: ["es", "está", "hay", "tiene"], a: 1 },

    { palier: "A1", point: "nombres et âge avec tener", type: "qcm",
      q: "Complète : « Mi sobrino ___ ocho años. »",
      opts: ["es", "está", "tiene", "hay"], a: 2 },

    { palier: "A1", point: "hay et estar", type: "qcm",
      q: "Complète : « En mi barrio ___ dos farmacias. »",
      opts: ["hay", "están", "son", "es"], a: 0 },

    { palier: "A1", point: "articles, genre et nombre des noms", type: "qcm",
      q: "Choisis l'article correct : « ___ problema es muy grave. »",
      opts: ["La", "El", "Las", "Una"], a: 1 },

    { palier: "A1", point: "verbes à diphtongue (querer, poder)", type: "qcm",
      q: "Complète : « Mis primos no ___ venir el sábado. » (poder, présent)",
      opts: ["poden", "podan", "puedan", "pueden"], a: 3 },

    { palier: "A1", point: "présent continu (estar + gerundio)", type: "qcm",
      q: "« ¿Qué haces? — ___ la cena. » Quelle réponse est correcte ?",
      opts: ["Soy preparando", "Estoy preparar", "Estoy preparado", "Estoy preparando"], a: 3 },

    { palier: "A1", point: "verbes pronominaux et routine", type: "qcm",
      q: "Complète : « Mi hermano ___ a las siete y media. » (se lever)",
      opts: ["se levanta", "levanta se", "se levanto", "lo levanta"], a: 0 },

    { palier: "A1", point: "nourriture et me gusta", type: "qcm",
      q: "Complète : « ___ las películas antiguas. » (moi, j'aime)",
      opts: ["Me gusta", "Yo gusto", "Me gustan", "Me gustas"], a: 2 },

    { palier: "A1", point: "présent des réguliers", type: "saisie",
      q: "Écris la forme « nosotros » du présent de l'indicatif de « vivir ».",
      a: ["vivimos"], ph: "un mot" },

    { palier: "A1", point: "jours de la semaine", type: "saisie",
      q: "Traduis en espagnol : « le mercredi » (le jour de la semaine).",
      a: ["el miércoles", "miércoles"], ph: "un ou deux mots" },

    { palier: "A1", point: "ir a + infinitif (futur proche)", type: "saisie",
      q: "Complète au futur proche, en écrivant les deux mots manquants : « Mañana (yo) ___ ___ visitar a mi tía. »",
      a: ["voy a"], ph: "deux mots" },

    { palier: "A1", point: "expressions avec tener", type: "saisie",
      q: "Traduis en espagnol l'expression « j'ai faim ».",
      a: ["tengo hambre"], ph: "deux mots" },

    /* ---------------------------------------------------------------- A2 */
    { palier: "A2", point: "pretérito perfecto", type: "qcm",
      q: "Complète : « Esta semana (yo) ___ tres novelas. »",
      opts: ["leí", "he leído", "leía", "había leído"], a: 1 },

    { palier: "A2", point: "indefinido irréguliers", type: "qcm",
      q: "Complète : « El año pasado mis tíos ___ a Sevilla. » (venir)",
      opts: ["venieron", "venían", "vinieron", "han venido"], a: 2 },

    { palier: "A2", point: "indefinido ou imperfecto", type: "qcm",
      q: "Complète : « Cuando ___ pequeña, pasaba todos los veranos en el pueblo. »",
      opts: ["fui", "estaba", "he sido", "era"], a: 3 },

    { palier: "A2", point: "por et para", type: "qcm",
      q: "Complète : « Te escribo ___ pedirte un favor. »",
      opts: ["para", "por", "a", "de"], a: 0 },

    { palier: "A2", point: "pronoms compléments COD/COI", type: "qcm",
      q: "« ¿Le has dado las llaves a Marta? — Sí, ___ he dado esta mañana. »",
      opts: ["le las", "se las", "las le", "la se"], a: 1 },

    { palier: "A2", point: "impératif affirmatif", type: "qcm",
      q: "Complète l'ordre adressé à « tú » : « ___ aquí un momento, por favor. » (venir)",
      opts: ["Vene", "Viene", "Ven", "Venes"], a: 2 },

    { palier: "A2", point: "muy et mucho", type: "qcm",
      q: "Complète : « Estoy ___ cansada porque he trabajado ___. »",
      opts: ["mucho / muy", "muy / muy", "mucha / mucho", "muy / mucho"], a: 3 },

    { palier: "A2", point: "comparatif et superlatif", type: "qcm",
      q: "Complète : « Este hotel es ___ que el del centro. » (meilleur)",
      opts: ["más bueno", "más mejor", "mejor", "tan bueno"], a: 2 },

    { palier: "A2", point: "indefinido de tener", type: "saisie",
      q: "Écris la 3e personne du singulier de l'indefinido de « tener ».",
      a: ["tuvo"], ph: "un mot" },

    { palier: "A2", point: "vêtements (faux ami)", type: "saisie",
      q: "Traduis en espagnol le nom français « les vêtements » (le mot collectif au singulier).",
      a: ["ropa", "la ropa"], ph: "un ou deux mots" },

    { palier: "A2", point: "futur simple", type: "saisie",
      q: "Écris la 1re personne du pluriel du futur simple de « salir ».",
      a: ["saldremos"], ph: "un mot" },

    { palier: "A2", point: "météo", type: "saisie",
      q: "Traduis en espagnol : « il fait froid ».",
      a: ["hace frío"], ph: "deux mots" },

    /* ---------------------------------------------------------------- B1 */
    { palier: "B1", point: "subjonctif de doute et d'opinion", type: "qcm",
      q: "Complète : « No creo que ___ tiempo suficiente para acabarlo hoy. »",
      opts: ["hay", "habrá", "haya", "había"], a: 2 },

    { palier: "B1", point: "impératif négatif", type: "qcm",
      q: "Complète l'ordre négatif adressé à « tú » : « No ___ nada a nadie. » (decir)",
      opts: ["dices", "digas", "di", "dice"], a: 1 },

    { palier: "B1", point: "propositions temporelles (cuando + subjonctif)", type: "qcm",
      q: "Complète : « Cuando ___ el informe, avísame por teléfono. »",
      opts: ["terminas", "terminarás", "has terminado", "termines"], a: 3 },

    { palier: "B1", point: "pronoms relatifs (que, quien, cuyo)", type: "qcm",
      q: "Complète : « El vecino ___ perro ladra toda la noche se ha mudado. »",
      opts: ["que", "quien", "cuyo", "del cual"], a: 2 },

    { palier: "B1", point: "voix passive et passive réfléchie", type: "qcm",
      q: "Quelle formulation convient dans une petite annonce : « ___ camareros con experiencia. » ?",
      opts: ["Se buscan", "Se busca", "Son buscados", "Está buscando"], a: 0 },

    { palier: "B1", point: "ser ou estar : cas difficiles", type: "qcm",
      q: "Complète : « La reunión ___ en la sala del segundo piso. » (elle a lieu)",
      opts: ["está", "es", "hay", "hace"], a: 1 },

    { palier: "B1", point: "style indirect", type: "qcm",
      q: "Rapporte au style indirect : « Llegaré tarde », me dijo. → « Me dijo que ___ tarde. »",
      opts: ["llegaría", "llegará", "llegaba", "llegue"], a: 0 },

    { palier: "B1", point: "por et para approfondis", type: "qcm",
      q: "Complète : « El presupuesto tiene que estar listo ___ el viernes como muy tarde. »",
      opts: ["por", "hasta", "para", "a"], a: 2 },

    { palier: "B1", point: "subjonctif présent : formation", type: "saisie",
      q: "Écris la 1re personne du pluriel du subjonctif présent de « salir ».",
      a: ["salgamos"], ph: "un mot" },

    { palier: "B1", point: "émotions et verbes pronominaux", type: "saisie",
      q: "Traduis en espagnol le verbe « se plaindre » (à l'infinitif).",
      a: ["quejarse"], ph: "un mot" },

    { palier: "B1", point: "plus-que-parfait", type: "saisie",
      q: "Écris la 3e personne du singulier du plus-que-parfait (pluscuamperfecto) de « escribir ».",
      a: ["había escrito"], ph: "deux mots" },

    { palier: "B1", point: "travail et entretien", type: "saisie",
      q: "Traduis en espagnol : « un entretien d'embauche ».",
      a: ["una entrevista de trabajo", "entrevista de trabajo", "una entrevista de empleo"], ph: "trois ou quatre mots" },

    /* ---------------------------------------------------------------- B2 */
    { palier: "B2", point: "conditionnelles (si + subjonctif)", type: "qcm",
      q: "Complète : « Si ___ más tiempo libre, me apuntaría a un curso de ruso. »",
      opts: ["tendría", "tuviera", "tengo", "tenga"], a: 1 },

    { palier: "B2", point: "concordance des temps", type: "qcm",
      q: "Complète : « El director me pidió que le ___ el informe antes del lunes. »",
      opts: ["envíe", "enviaré", "envío", "enviara"], a: 3 },

    { palier: "B2", point: "subjonctif après connecteurs (aunque, para que)", type: "qcm",
      q: "Complète (hypothèse, pluie non confirmée) : « Aunque ___ mañana, la excursión no se cancelará. »",
      opts: ["llueve", "llueva", "lloverá", "llovía"], a: 1 },

    { palier: "B2", point: "périphrases verbales", type: "qcm",
      q: "Complète : « ___ tres horas esperando noticias del vuelo. » (cela fait trois heures que…)",
      opts: ["Llevo", "Tengo", "Hago", "Voy"], a: 0 },

    { palier: "B2", point: "modaux au passé (debería haber)", type: "qcm",
      q: "Comment dire « tu aurais dû me prévenir avant de changer la date » ?",
      opts: ["Deberías avisarme antes", "Debías de avisar antes", "Deberías haberme avisado antes", "Habrías debido de avisarme antes"], a: 2 },

    { palier: "B2", point: "hypothèses et probabilités", type: "qcm",
      q: "« ¿Dónde está Luis? — No sé, ___ en un atasco. » (supposition sur le présent)",
      opts: ["está", "esté", "estará", "estuviera"], a: 2 },

    { palier: "B2", point: "mise en relief et ordre des mots", type: "qcm",
      q: "Complète la structure de mise en relief : « Fue en Salamanca ___ nos conocimos. »",
      opts: ["que", "donde", "cuando", "la que"], a: 1 },

    { palier: "B2", point: "expressions idiomatiques", type: "qcm",
      q: "Que signifie l'expression « estar como una cabra » ?",
      opts: ["être très têtu", "être complètement fou", "être très maigre", "être de mauvaise humeur"], a: 1 },

    { palier: "B2", point: "subjonctif imparfait", type: "saisie",
      q: "Écris la 3e personne du pluriel du subjonctif imparfait de « poder » (forme en -ra).",
      a: ["pudieran"], ph: "un mot" },

    { palier: "B2", point: "registre et collocations", type: "saisie",
      q: "Traduis en espagnol la locution « à contrecœur ».",
      a: ["a regañadientes", "de mala gana"], ph: "deux ou trois mots" },

    { palier: "B2", point: "conditionnel composé", type: "saisie",
      q: "Écris la 1re personne du singulier du conditionnel composé de « decir ».",
      a: ["habría dicho"], ph: "deux mots" },

    { palier: "B2", point: "nuancer et concéder", type: "saisie",
      q: "Traduis en espagnol le connecteur français « bien que » (celui qui introduit une concession suivie du subjonctif).",
      a: ["aunque", "a pesar de que", "si bien"], ph: "un mot" }
  ]
};
if (typeof module !== "undefined" && module.exports) module.exports = BANQUE_ESPAGNOL;
if (typeof window !== "undefined") window.BANQUE_ESPAGNOL = BANQUE_ESPAGNOL;
