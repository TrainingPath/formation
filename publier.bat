@echo off
REM ===========================================================================
REM  publier.bat - envoie tout le site sur GitHub.
REM
REM  A lancer en double-cliquant dessus, ou en tapant  publier  dans l'invite
REM  de commandes ouverte sur ce dossier.
REM
REM  Ce script ne supprime JAMAIS le verrou index.lock tout seul : si un autre
REM  git travaille reellement, l'effacer corromprait l'index du depot. Il se
REM  contente de le signaler et de t'expliquer quoi faire.
REM ===========================================================================
setlocal
cd /d "%~dp0"

echo.
echo === Depot : %CD%
echo.

REM --- 1. Verrou laisse par un git interrompu ? -----------------------------
if exist ".git\index.lock" (
    echo [ARRET] Un fichier .git\index.lock est present.
    echo.
    echo Cela veut dire qu'un git a ete interrompu, OU qu'un autre programme
    echo travaille en ce moment sur ce depot.
    echo.
    echo   1. Ferme GitHub Desktop, VS Code et tout terminal ouvert ici.
    echo   2. Attends dix secondes.
    echo   3. Si le fichier est toujours la, supprime-le a la main :
    echo          del ".git\index.lock"
    echo   4. Relance ce script.
    echo.
    pause
    exit /b 1
)

REM --- 2. Y a-t-il quelque chose a envoyer ? --------------------------------
git add -A
if errorlevel 1 (
    echo [ERREUR] git add a echoue. Rien n'a ete envoye.
    pause
    exit /b 1
)

git diff --cached --quiet
if not errorlevel 1 (
    echo Aucune modification a envoyer : le depot est deja a jour.
    echo Tentative de push au cas ou des commits attendraient...
    git push
    echo.
    pause
    exit /b 0
)

REM --- 3. Message de commit ------------------------------------------------
REM  Tape ton message et valide. Laisse vide pour un message date automatique.
set "MSG="
set /p MSG=Message de commit (Entree pour un message date) :
if "%MSG%"=="" set "MSG=Mise a jour du site - %DATE% %TIME%"

echo.
echo === Commit : %MSG%
git commit -m "%MSG%"
if errorlevel 1 (
    echo [ERREUR] Le commit a echoue. Rien n'a ete envoye.
    pause
    exit /b 1
)

REM --- 4. Envoi ------------------------------------------------------------
echo.
echo === Envoi vers GitHub...
git push
if errorlevel 1 (
    echo.
    echo [ERREUR] Le push a echoue.
    echo   - Si le message parle de "no upstream branch", lance une seule fois :
    echo         git push -u origin main
    echo   - Si le message parle d'authentification, reconnecte ton compte GitHub.
    pause
    exit /b 1
)

echo.
echo === Termine. Le site est en ligne.
echo     GitHub Pages met une a deux minutes a rafraichir la version publiee.
echo.
pause
endlocal
