# CHANGELOG — Améliorations assistées par IA

Ce fichier trace les modifications apportées au site dans le cadre du plan d'amélioration
(missions 1 à 6). Chaque entrée précise ce qui a changé et, le cas échéant, les corrections
factuelles de contenu.

---

## Pilote — cours-python (missions 1, 2 et 6)

Périmètre : uniquement `cours-python/`. Les autres cours sont inchangés (généralisation à venir).

### Mission 1 — Exécution réelle du code (Pyodide)
- **`cours-python/exo-ecriture.js`** : ajout d'un bouton **« ▶ Exécuter mon code »** sous chaque
  exercice d'écriture. Python tourne dans le navigateur via **Pyodide** (CDN jsdelivr, `v0.26.4`),
  **chargé à la demande** (au premier clic, pas au chargement de la page).
  - Sortie affichée ; erreurs Python nettoyées et lisibles.
  - `input()` est simulé (liste `stdin` de l'exercice) pour ne jamais bloquer le navigateur.
  - La sortie affichée est exposée aux tests sous le nom `__output__`.
- **Tests automatiques** : nouveau champ `tests` (liste d'assertions) dans chaque item `ECRITURE`.
  Affichage « ✅ N/N tests passés ». Le point n'est enregistré **que si tous les tests passent**.
- **Scoring d'écriture séparé** : nouvelle clé localStorage `ecrpass-<id>` + badge « ✍️ écriture validée ».
  **Aucune clé existante modifiée** (`py21-l*`, `ecr-*` intactes) — les scores déjà enregistrés survivent.

### Mission 2 — QCM imprévisibles
- **`cours-python/engine.js`** : les options des QCM sont désormais **mélangées à l'affichage**
  (mélange déterministe par question, index correct recalculé). La bonne réponse n'est plus
  jamais à une position fixe. `balanceOpts()` (équilibrage des longueurs) est conservé.
- **Distracteurs réécrits** sur les 21 leçons : suppression des distracteurs absurdes
  (« Rien », « Impossible », « Par la couleur », etc.) au profit d'erreurs de compréhension
  plausibles, de longueur comparable à la bonne réponse. **L'ordre des options et l'index `a`
  n'ont jamais été modifiés** (seul le texte des options fausses a changé) ; bonnes réponses et
  explications intactes.
- **Mode examen** : nouvelle page **`cours-python/examen.html`** (+ `examen.js`). Tire 10 questions
  au hasard parmi les leçons **déjà validées**, sans explication avant la fin, puis affiche le score.
  100 % statique (lecture des leçons via `fetch`, fonctionne sur GitHub Pages).

### Mission 6 — Approcher le feedback humain
- **Grille d'auto-relecture** : nouveau champ `checklist` (3-4 critères concrets) affiché **avant**
  le bouton « Voir la solution ». Défaut générique si une leçon n'en fournit pas.
- **`tuteur-ia.html`** (racine) : mode d'emploi d'un assistant IA comme tuteur socratique,
  6 prompts prêts à copier, avertissement sur le risque de se faire donner les réponses.
- **`cours-python/index.html`** : liens vers le mode examen et la page tuteur ajoutés.

### Corrections factuelles de contenu
- **`cours-python/lecon09.html`** : le commentaire de la solution indiquait `# 2` pour le nombre
  de « o » dans `"bonjour le monde"` ; il y en a **3**. Commentaire corrigé (`# 3`). Le code était
  déjà correct ; seul le commentaire était faux.

### Outils ajoutés (racine, non publiés dans les cours)
- **`_verify_py.js`** : vérificateur qui exécute la solution de référence + ses tests sous Python
  pour garantir que chaque jeu de tests est correct (la solution doit passer 100 % de ses tests).

### Validation
- 21/21 leçons : `DAY`/`ECRITURE` parsent, tous les QCM ont 4 options et un index `a` valide.
- 21/21 leçons : la solution de référence passe **tous** ses tests (`_verify_py.js`).
- Clés localStorage historiques préservées ; nouvelles clés (`ecrpass-*`) purement additives.

### À vérifier dans un navigateur (nécessite Internet pour le CDN Pyodide)
1. Ouvrir `cours-python/lecon12.html` → écrire la classe → **▶ Exécuter** → « 3/3 tests passés » + badge.
2. Recharger une leçon plusieurs fois → l'ordre des options de QCM change, mais la bonne réponse
   reste correcte.
3. Faire une leçon, puis ouvrir `cours-python/examen.html` → 10 questions, score à la fin.
4. Vérifier qu'un ancien score (`py21-l*`) est toujours affiché sur le sommaire.
