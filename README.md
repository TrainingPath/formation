# Mes formations

Un site de formation statique : programmation, système d'exploitation, bureautique et langues.
Chaque leçon propose de la théorie, des exercices auto-corrigés et des exercices d'écriture.

## Contenu

| Catégorie | Contenu |
| --- | --- |
| 💻 Programmation | 41 cours : algorithmique, langages (Java, C#, PHP, Python, C, C++, assembleur), frameworks, bases de données, projets full-stack, outillage et sécurité |
| 🖥️ Système d'exploitation | Linux · Active Directory (interface graphique et scripts PowerShell) |
| 📊 Office | Excel (débutant et avancé/pro), Word, PowerPoint |
| 🗣️ Langues | Anglais, néerlandais, espagnol, allemand — de A1 à B2, avec lexiques et ateliers d'exercices |

## Par où commencer ? (un parcours à la fois)

Le site contient des milliers de leçons : **n'essaie pas de tout faire.** La bonne méthode est de suivre
**un seul parcours à la fois** (par exemple le parcours Python, de l'algorithmique jusqu'au projet outillé),
et de traiter tout le reste — réseau, Cisco, langues, Office, les autres langages — comme une **bibliothèque**
dans laquelle tu piocheras selon tes besoins ponctuels.

La page **`orientation.html`** (lien « Trouver mon parcours » sur l'accueil) pose 3 questions et recommande
un parcours unique avec un planning réaliste. Reviens-y quand ton objectif change.

## Qualité vérifiée automatiquement (intégration continue)

À **chaque push et chaque pull request**, une **GitHub Action** (`.github/workflows/verify.yml`) vérifie le site :

- **Les solutions de référence sont réellement exécutées contre leurs propres tests** — Python, JavaScript et
  SQL, mais aussi **C, C++ et Java compilés** sur le runner (`gcc`/`g++`/`javac`). Un exercice dont la solution
  ne passe plus ses tests fait **échouer le build**.
- **L'intégrité des QCM** est contrôlée : index de bonne réponse valide, et le mélange déterministe des options
  préserve bien la bonne réponse.
- Un **filet anti-artefact** vérifie qu'aucune exécution n'a laissé de fichier dans le dépôt.

Autrement dit, `_verify.js` n'est plus un audit manuel : c'est un garde-fou. Un commit qui casse une solution
est bloqué avant d'atteindre le site en ligne.

## Utilisation

Le site est entièrement statique : **aucune installation** à faire.
Ouvre `index.html` dans un navigateur, ou consulte la version en ligne publiée avec GitHub Pages.

La progression (scores des exercices) est enregistrée localement dans le navigateur.

### Connexion Internet : quand est-elle nécessaire ?

Presque tout fonctionne **hors ligne** : lire les leçons, répondre aux exercices auto-corrigés,
suivre sa progression. **Une seule fonctionnalité a besoin d'Internet** : l'exécution du code
directement dans le navigateur (bouton ▶ des exercices d'écriture Python), car l'interpréteur
Pyodide est chargé depuis un CDN au premier clic. Sans connexion, le bouton ▶ affiche un message
clair et tout le reste continue de marcher normalement.

### Ouvrir le site en local

Ouvrir un simple fichier (`file://`) suffit pour lire les leçons. En revanche, le **mode examen**
lit les autres leçons via `fetch()`, ce que les navigateurs bloquent en `file://`. Pour l'utiliser
en local, lance un petit serveur dans le dossier du site puis ouvre l'adresse indiquée :

```
python -m http.server
# puis http://localhost:8000
```
