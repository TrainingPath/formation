# Revue mot à mot des extensions de vocabulaire

Ce document est le **compte rendu** d'une relecture, pas une fiche à remplir.
Il est **généré** depuis `_outils/vocabulaire/revue_extension.py` : il ne peut pas
raconter autre chose que ce que le générateur applique réellement.

## Ce qui a été fait, et ce que ça vaut

Les banques ont deux origines. Les **~400 mots par langue repris des `lexique.html`**
des cours ne posent pas de question : la banque affiche exactement ce que le cours
enseigne, et `_verify_vocab.js` fait échouer le build à la moindre divergence.

Les mots d'**extension**, eux, ont été écrits à la main pour atteindre un volume utile.
Ils ont été relus un par un, et tout ce qui n'était pas d'une évidence absolue a été
**supprimé** plutôt que signalé. Ce qui reste est du vocabulaire élémentaire et concret.

**Une limite à connaître.** Cette relecture a été faite par le même auteur que les listes.
L'environnement de génération n'a accès à aucun dictionnaire — PyPI répond 403, `apt`
n'a pas les droits, les requêtes web expirent. Ce n'est donc **pas une vérification
indépendante** : c'est un durcissement du critère d'admission. Si tu veux une preuve
extérieure, il faut faire relire par un professeur ou un locuteur.

## Critère appliqué

Un mot est retiré si l'un des trois motifs suivants s'applique.

| Motif | Ce qu'il désigne |
|---|---|
| **POLYSÉMIE** | Le mot a deux sens courants dans sa langue. Un QCM ne sait pas afficher « ça dépend ». |
| **GLOSE AMBIGUË** | La traduction française elle-même se comprend de deux façons. |
| **RÉGIONAL / REGISTRE** | Le mot ne veut pas dire la même chose partout. Ce motif pèse lourd : l'élève est en Belgique. |

## Néerlandais — 553 mots (396 des lexiques, 157 d'extension)

**12 mot(s) retiré(s)**, 5 traduction(s) corrigée(s).

### Retirés

| Mot | Motif |
|---|---|
| `de dochter` | GLOSE — « la fille » se comprend aussi comme « jeune fille » ; le sens visé est l'enfant de quelqu'un. |
| `de neef` | POLYSÉMIE — neef = cousin ET neveu. |
| `de nicht` | POLYSÉMIE — nicht = cousine ET nièce. |
| `de man` | POLYSÉMIE — man = homme ET mari. |
| `de vrouw` | POLYSÉMIE — vrouw = femme ET épouse. |
| `het fruit` | POLYSÉMIE — fruit est collectif en néerlandais (les fruits) ; un fruit se dit « de vrucht ». |
| `het bad` | POLYSÉMIE — bad = le bain ET la baignoire. |
| `het onderzoek` | POLYSÉMIE — onderzoek = recherche, enquête, examen médical. |
| `het hemd` | REGISTRE — hemd désigne plutôt le maillot de corps ; la chemise est « het overhemd ». |
| `de lucht` | POLYSÉMIE — lucht = air, ciel ET odeur. |
| `lopen` | RÉGIONAL — lopen = marcher aux Pays-Bas, mais couramment COURIR en Belgique. |
| `schoon` | RÉGIONAL — schoon = propre aux Pays-Bas, mais BEAU en Flandre. |

### Traductions corrigées

| Mot | Nouvelle traduction | Motif |
|---|---|---|
| `de keuken` | la cuisine (pièce) | keuken = la pièce, pas l'art culinaire. |
| `de hobby` | le passe-temps | « le loisir » chevauchait « de vrije tijd » (le temps libre). |
| `de les` | la leçon | « le cours » désigne aussi un cursus entier. |
| `het kantoor` | le bureau (lieu de travail) | en néerlandais « het bureau » est le meuble ; le français confond les deux. |
| `veilig` | sûr (sans danger) | « sûr » se comprend aussi comme « certain ». |

## Anglais — 657 mots (400 des lexiques, 257 d'extension)

**7 mot(s) retiré(s)**, 1 traduction(s) corrigée(s).

### Retirés

| Mot | Motif |
|---|---|
| `shower` | POLYSÉMIE — shower = la douche avant d'être une averse ; le sens premier n'est pas celui donné. |
| `boot` | POLYSÉMIE — boot = la botte ET le coffre d'une voiture (anglais britannique). |
| `light` | POLYSÉMIE — light = léger ET clair/lumineux. |
| `pavement` | RÉGIONAL — pavement = le trottoir au Royaume-Uni, mais la CHAUSSÉE aux États-Unis. |
| `wage` | DOUBLON — le lexique enseigne déjà salary et wages ; un troisième mot pour « salaire » n'apprend rien. |
| `to carry` | GLOSE — « porter » recouvre aussi to wear ; l'élève ne peut pas trancher. |
| `fare` | GLOSE — « tarif » est plus large que fare, qui désigne le seul prix du transport. |

### Traductions corrigées

| Mot | Nouvelle traduction | Motif |
|---|---|---|
| `safe` | sans danger | « sûr » se comprend aussi comme « certain ». |

## Espagnol — 667 mots (397 des lexiques, 270 d'extension)

**13 mot(s) retiré(s)**, 2 traduction(s) corrigée(s).

### Retirés

| Mot | Motif |
|---|---|
| `la comida` | POLYSÉMIE — comida = la nourriture, le repas, et le DÉJEUNER en Espagne. |
| `el plato` | POLYSÉMIE — plato = l'assiette ET le plat. |
| `la estación` | POLYSÉMIE — estación = la gare ET la saison. |
| `la estación del año` | CONSÉQUENCE — retiré avec « la estación » : la périphrase n'a plus lieu d'être seule. |
| `el techo` | CONTESTÉ — techo désigne le plafond ; le toit se dit « el tejado ». |
| `el piso` | POLYSÉMIE — piso = l'appartement, l'étage, et le sol en Amérique latine. |
| `el título` | POLYSÉMIE — título = le titre ET le diplôme. |
| `el anuncio` | GLOSE — anuncio = l'annonce ; « publicité » est déjà enseigné par le lexique (la publicidad). |
| `tirar` | POLYSÉMIE — tirar = jeter ET tirer. |
| `esperar` | POLYSÉMIE — esperar = attendre ET espérer. |
| `llevar` | POLYSÉMIE — llevar = porter, emmener, amener. |
| `listo` | POLYSÉMIE — listo = prêt (estar) ET malin (ser). |
| `ya` | POLYSÉMIE — ya = déjà, maintenant, désormais, ne… plus, selon la phrase. |

### Traductions corrigées

| Mot | Nouvelle traduction | Motif |
|---|---|---|
| `el plazo` | le délai | plazo = le délai imparti ; « échéance » est la date, pas la durée. |
| `seguro` | sûr (sans danger) | « sûr » se comprend aussi comme « certain ». |

## Allemand — 655 mots (400 des lexiques, 255 d'extension)

**12 mot(s) retiré(s)**, 4 traduction(s) corrigée(s).

### Retirés

| Mot | Motif |
|---|---|
| `der Erwachsene` | GRAMMAIRE — nom adjectival : la forme change avec le déterminant (ein Erwachsener). |
| `der Boden` | POLYSÉMIE — Boden = le sol, le fond ET le grenier. |
| `das Schloss` | POLYSÉMIE — Schloss = le château ET la serrure. |
| `das Viertel` | POLYSÉMIE — Viertel = le quartier ET le quart. |
| `der Abschluss` | POLYSÉMIE — Abschluss = la fin, la conclusion, le diplôme. |
| `die Trauer` | GLOSE — Trauer = le deuil, le chagrin ; la tristesse se dit Traurigkeit. |
| `die Nachricht` | POLYSÉMIE — Nachricht = le message ET la nouvelle (die Nachrichten = les informations). |
| `leihen` | POLYSÉMIE — leihen = prêter ET emprunter selon la construction. |
| `tragen` | POLYSÉMIE — tragen = porter un objet ET porter un vêtement. |
| `schwer` | POLYSÉMIE — schwer = lourd ET difficile. |
| `leicht` | POLYSÉMIE — leicht = léger ET facile. |
| `wie` | POLYSÉMIE — wie = comment ET comme. |

### Traductions corrigées

| Mot | Nouvelle traduction | Motif |
|---|---|---|
| `die Frist` | le délai | Frist = le délai imparti, pas la date d'échéance. |
| `sicher` | sûr (sans danger) | « sûr » se comprend aussi comme « certain ». |
| `vorher` | auparavant | vorher est un adverbe ; la préposition « avant » se dit vor. |
| `nachher` | ensuite | nachher est un adverbe ; la préposition « après » se dit nach. |

**Total : 44 mots retirés, 12 traductions corrigées.**

## Contester la revue

Tout se corrige dans `_outils/vocabulaire/` : les listes dans `vocab_ext_<code>.py`, les suppressions et corrections dans `revue_extension.py`. Puis on relance `python3 vocabgen2.py` et `node _verify_vocab.js`. Les fichiers `vocab-data-*.js` sont générés : les modifier à la main ne sert à rien, la génération suivante les écrase.

Un mot listé dans la revue mais absent des extensions fait **échouer le générateur** — sans quoi une faute de frappe passerait pour une suppression effectuée.
