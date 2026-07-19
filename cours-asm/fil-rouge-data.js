/* ===== Fil rouge « La Ludothèque » — cours Assembleur (21 étapes) =====
   Le même projet que dans tous les cours, réduit à ses briques élémentaires.
   Fil principal : x86-64 (NASM, Linux). On code des fragments pour voir ce
   qui se passe sous le C. Assembler : nasm -f elf64 f.asm -o f.o && ld f.o -o f */
var FIL = {
  prefix: "asm21",
  app: "La Ludothèque",
  placeholder: "Écris ton assembleur (NASM x86-64) ici…",
  etapes: {
    1: {
      titre: "le programme minimal",
      etat: "Le projet démarre : avant tout affichage, un programme qui se lance et se termine proprement.",
      objectif: "Écris un programme NASM x86-64 qui ne fait rien d'autre que se terminer avec le code de sortie 0, via l'appel système exit (numéro 60).",
      hints: [
        "section .text ; global _start ; _start:",
        "exit : mov rax, 60 (numéro du syscall) ; mov rdi, 0 (code retour) ; syscall.",
        "Sans exit, le programme planterait à la fin de _start."
      ],
      solution: `section .text
    global _start
_start:
    mov rax, 60         ; syscall « exit »
    mov rdi, 0          ; code de retour 0
    syscall
; nasm -f elf64 prog.asm -o prog.o && ld prog.o -o prog ; ./prog ; echo $?`,
      note: "En x86-64 Linux, on demande un service au noyau en mettant le NUMERO du syscall dans rax, les arguments dans rdi, rsi, rdx… puis l'instruction syscall. exit (60) termine le programme. En ARM64 : mov x8, 93 ; mov x0, 0 ; svc 0."
    },
    2: {
      titre: "mettre un prix dans un registre",
      etat: "Le programme se lance. Un registre est la « variable » de l'assembleur : rangeons-y une donnée.",
      objectif: "Charge le prix d'un jeu (44) dans un registre, puis termine en renvoyant ce prix comme code de sortie (pour le voir avec echo $?).",
      hints: [
        "mov rax, 44 place la valeur 44 dans rax.",
        "Pour le renvoyer : mov rdi, rax avant l'exit.",
        "Le code de sortie se lit avec echo $? (0 à 255)."
      ],
      solution: `section .text
    global _start
_start:
    mov rax, 44         ; « prix » du jeu dans un registre
    mov rdi, rax        ; le passer comme code de retour
    mov rax, 60         ; exit
    syscall
; ./prog ; echo $?  -> 44`,
      note: "Un registre (rax, rbx, rcx, rdx, rsi, rdi, r8..r15) contient un entier de 64 bits : c'est le stockage le plus rapide, mais il n'y en a qu'une poignée. mov copie une valeur. En AT&T : movq $44, %rax (destination à droite !). En ARM64 : mov x0, 44."
    },
    3: {
      titre: "l'écran d'accueil (write)",
      etat: "Affichons enfin quelque chose : la bannière de la ludothèque, avec l'appel système write.",
      objectif: "Affiche « La Ludotheque\\n » avec le syscall write (numéro 1) sur la sortie standard (fd 1), puis termine.",
      hints: [
        "Le texte va dans section .data : msg db \"La Ludotheque\", 10 ; len equ $ - msg.",
        "write : rax=1, rdi=1 (stdout), rsi=msg, rdx=len ; syscall.",
        "10 est le code du saut de ligne ('\\n')."
      ],
      solution: `section .data
    msg db "La Ludotheque", 10       ; 10 = saut de ligne
    len equ $ - msg                  ; longueur = adresse courante - msg

section .text
    global _start
_start:
    mov rax, 1          ; syscall write
    mov rdi, 1          ; fd 1 = sortie standard
    mov rsi, msg        ; adresse du texte
    mov rdx, len        ; nombre d'octets
    syscall
    mov rax, 60         ; exit
    mov rdi, 0
    syscall`,
      note: "write(fd, adresse, longueur) écrit des octets bruts : pas de printf, c'est à toi de fournir l'adresse et la longueur. $ - msg calcule la longueur à l'assemblage. En ARM64, le syscall write est x8=64."
    },
    4: {
      titre: "additionner deux valeurs",
      etat: "L'accueil s'affiche. Manipulons des nombres : additionnons deux quantités.",
      objectif: "Range 3 (stock) et 5 (arrivage) dans deux registres, additionne-les, et renvoie le total (8) comme code de sortie.",
      hints: [
        "mov rax, 3 ; mov rbx, 5.",
        "add rax, rbx additionne rbx dans rax (rax = rax + rbx).",
        "Passe rax dans rdi avant l'exit."
      ],
      solution: `section .text
    global _start
_start:
    mov rax, 3          ; stock
    mov rbx, 5          ; arrivage
    add rax, rbx        ; rax = rax + rbx = 8
    mov rdi, rax
    mov rax, 60
    syscall
; echo $? -> 8`,
      note: "add dest, src fait dest = dest + src : le résultat écrase la première opérande. De même sub, and, or, xor. En AT&T : add %rbx, %rax (src, dest). En ARM64, trois opérandes : add x0, x1, x2 (x0 = x1 + x2) — plus lisible."
    },
    5: {
      titre: "le catalogue en mémoire",
      etat: "Deux nombres ne font pas un catalogue. Stockons plusieurs prix en mémoire.",
      objectif: "Déclare en section .data un tableau de 4 prix (entiers sur 8 octets), et charge le premier dans un registre.",
      hints: [
        "prix dq 44, 12, 39, 20   ; dq = define quad (8 octets chacun).",
        "mov rax, [prix] charge le premier élément (déréférencement).",
        "Les crochets [] lisent la MEMOIRE à cette adresse."
      ],
      solution: `section .data
    prix dq 44, 12, 39, 20     ; 4 entiers de 8 octets

section .text
    global _start
_start:
    mov rax, [prix]     ; charge prix[0] = 44 (les [] lisent la memoire)
    mov rdi, rax
    mov rax, 60
    syscall
; echo $? -> 44`,
      note: "La mémoire (section .data) stocke ce qui ne tient pas dans les registres. dq réserve 8 octets par valeur. mov rax, [prix] LIT la mémoire (les crochets = déréférencement) ; mov rax, prix chargerait l'ADRESSE. En AT&T : mov prix(%rip), %rax. En ARM64 : ldr x0, =prix puis ldr x0, [x0]."
    },
    6: {
      titre: "calculer un tarif",
      etat: "Un prix par jour est en mémoire. Calculons le coût d'une location de plusieurs jours.",
      objectif: "Multiplie le prix par jour (5) par le nombre de jours (4) et renvoie le total (20).",
      hints: [
        "mov rax, 5 ; mov rbx, 4.",
        "imul rax, rbx multiplie (rax = rax * rbx).",
        "imul = multiplication signée."
      ],
      solution: `section .text
    global _start
_start:
    mov rax, 5          ; prix par jour
    mov rbx, 4          ; jours
    imul rax, rbx       ; rax = 5 * 4 = 20
    mov rdi, rax
    mov rax, 60
    syscall
; echo $? -> 20`,
      note: "imul dest, src multiplie deux entiers signés. La division (idiv) est plus subtile : elle divise le couple rdx:rax par l'opérande, quotient dans rax, reste dans rdx (penser à mettre rdx à 0 ou à étendre le signe avant). En ARM64 : mul x0, x1, x2 ; sdiv pour diviser."
    },
    7: {
      titre: "classer un stock",
      etat: "Aidons le vendeur : comparons un stock à un seuil et branchons selon le résultat.",
      objectif: "Compare un stock (3) à 5 : s'il est inférieur à 5, renvoie 1 (faible), sinon renvoie 0. Utilise cmp et un saut conditionnel.",
      hints: [
        "cmp rax, 5 compare rax à 5 (positionne les drapeaux).",
        "jl faible saute si rax < 5 (jump if less, signé).",
        "Structure : cmp ; saut conditionnel ; branches avec des étiquettes."
      ],
      solution: `section .text
    global _start
_start:
    mov rax, 3          ; stock
    cmp rax, 5          ; compare stock a 5
    jl faible           ; si stock < 5, sauter
    mov rdi, 0          ; sinon : stock ok
    jmp fin
faible:
    mov rdi, 1          ; stock faible
fin:
    mov rax, 60
    syscall
; echo $? -> 1`,
      note: "cmp fait une soustraction « pour voir » (sans stocker), et positionne des drapeaux (flags). Les sauts conditionnels lisent ces drapeaux : jl (<), jg (>), je (==), jne (!=), jle, jge… En ARM64 : cmp x0, 5 puis b.lt faible."
    },
    8: {
      titre: "afficher un tarif dégressif",
      etat: "Répétons un calcul : le tarif cumulé pour plusieurs durées, avec une boucle.",
      objectif: "Avec une boucle, calcule dans un registre la somme 5+5+5+5 (4 jours à 5 €) — c'est-à-dire boucle 4 fois en ajoutant 5. Renvoie le total (20).",
      hints: [
        "Compteur : mov rcx, 4 ; accumulateur : mov rax, 0.",
        "Étiquette de boucle ; add rax, 5 ; dec rcx ; jnz boucle.",
        "dec rcx décrémente ; jnz saute tant que rcx != 0."
      ],
      solution: `section .text
    global _start
_start:
    mov rcx, 4          ; compteur (jours)
    mov rax, 0          ; total
boucle:
    add rax, 5          ; +5 par jour
    dec rcx             ; jours--
    jnz boucle          ; recommence tant que rcx != 0
    mov rdi, rax        ; total = 20
    mov rax, 60
    syscall
; echo $? -> 20`,
      note: "Une boucle = une étiquette + un saut conditionnel en arrière. Ici dec/jnz : on décrémente rcx et on reboucle tant qu'il n'est pas nul. x86 a aussi l'instruction loop (utilise rcx). En ARM64 : subs x1, x1, 1 puis b.ne boucle."
    },
    9: {
      titre: "sauvegarder via la pile",
      etat: "Nos registres sont peu nombreux : apprenons à mettre une valeur de côté sur la pile.",
      objectif: "Range une valeur importante (le prix, 44) sur la pile avec push, écrase le registre par autre chose, puis récupère la valeur avec pop et renvoie-la.",
      hints: [
        "push rax empile rax (rsp diminue de 8).",
        "pop rbx dépile dans rbx (rsp augmente de 8).",
        "La pile est LIFO : dernier entré, premier sorti."
      ],
      solution: `section .text
    global _start
_start:
    mov rax, 44         ; prix
    push rax            ; le mettre de cote sur la pile
    mov rax, 999        ; on ecrase rax (autre calcul)
    pop rbx             ; on recupere le prix dans rbx
    mov rdi, rbx        ; -> 44
    mov rax, 60
    syscall
; echo $? -> 44`,
      note: "La pile croît vers le bas (rsp diminue à chaque push). Elle sert à sauvegarder des registres, passer des arguments et stocker les variables locales. LIFO : l'ordre des pop est l'inverse des push. En ARM64, pas de push/pop dédiés : on ajuste sp et on utilise str/ldr (ou stp/ldp par paires)."
    },
    10: {
      titre: "une fonction tarif",
      etat: "Isolons le calcul du tarif dans une routine appelable, avec call et ret.",
      objectif: "Écris une routine tarif qui multiplie rdi (prix/jour) par rsi (jours) et renvoie le résultat dans rax. Appelle-la avec 5 et 4, renvoie 20.",
      hints: [
        "call tarif empile l'adresse de retour et saute ; ret revient.",
        "Convention System V : arguments dans rdi, rsi, rdx… ; retour dans rax.",
        "Dans tarif : mov rax, rdi ; imul rax, rsi ; ret."
      ],
      solution: `section .text
    global _start
_start:
    mov rdi, 5          ; 1er argument : prix/jour
    mov rsi, 4          ; 2e argument : jours
    call tarif          ; resultat dans rax
    mov rdi, rax
    mov rax, 60
    syscall

tarif:                  ; rax = rdi * rsi
    mov rax, rdi
    imul rax, rsi
    ret                 ; revient a l'appelant
; echo $? -> 20`,
      note: "call empile l'adresse de retour puis saute ; ret dépile cette adresse et y retourne. La convention d'appel System V AMD64 place les 6 premiers arguments entiers dans rdi, rsi, rdx, rcx, r8, r9, et la valeur de retour dans rax. En ARM64 (AAPCS) : arguments x0..x7, retour x0, bl pour appeler, ret."
    },
    11: {
      titre: "passer prix et jours",
      etat: "Notre fonction reçoit ses arguments par registres : appliquons-lui la vraie règle de remise.",
      objectif: "Complète tarif pour appliquer 10 % de remise dès 3 jours : total = prix*jours, et si jours >= 3, retirer un dixième (total = total - total/10). Renvoie 18 pour (5, 4).",
      hints: [
        "Calcule total = rdi*rsi dans rax.",
        "cmp rsi, 3 ; jl fin (pas de remise si jours < 3).",
        "Remise : idiv par 10 pour obtenir total/10, puis sub. Pense à mettre rdx=0 avant idiv."
      ],
      solution: `section .text
    global _start
_start:
    mov rdi, 5
    mov rsi, 4
    call tarif
    mov rdi, rax
    mov rax, 60
    syscall

tarif:
    mov rax, rdi
    imul rax, rsi       ; total = prix * jours = 20
    cmp rsi, 3
    jl .fin             ; jours < 3 : pas de remise
    mov rcx, rax        ; garder total
    xor rdx, rdx        ; rdx = 0 (haute partie du dividende)
    mov rbx, 10
    idiv rbx            ; rax = total / 10 (= 2), rdx = reste
    sub rcx, rax        ; total - total/10 = 18
    mov rax, rcx
.fin:
    ret
; echo $? -> 18`,
      note: "idiv divise rdx:rax (128 bits) par l'opérande : il FAUT préparer rdx (ici xor rdx, rdx pour un positif). Le quotient va dans rax, le reste dans rdx. Les étiquettes locales (.fin) commencent par un point en NASM. En ARM64 : udiv/sdiv sont bien plus simples (une seule instruction, pas de rdx)."
    },
    12: {
      titre: "parcourir le catalogue",
      etat: "Additionnons tous les prix du catalogue en mémoire, avec une boucle et l'adressage indexé.",
      objectif: "Somme les 4 prix du tableau (44,12,39,20 = 115) en parcourant la mémoire avec un index, et renvoie le total modulo 256 (115 tient sur un octet).",
      hints: [
        "prix dq 44,12,39,20. Compteur rcx=4, index rbx=0, total rax=0.",
        "Adressage : mov rdx, [prix + rbx*8] lit le prix courant (8 octets/élément).",
        "add rax, rdx ; add rbx, 1 ; dec rcx ; jnz."
      ],
      solution: `section .data
    prix dq 44, 12, 39, 20

section .text
    global _start
_start:
    xor rax, rax        ; total = 0
    xor rbx, rbx        ; index = 0
    mov rcx, 4          ; compteur
boucle:
    add rax, [prix + rbx*8]   ; total += prix[index] (adressage indexe)
    inc rbx                   ; index++
    dec rcx
    jnz boucle
    mov rdi, rax        ; total = 115
    mov rax, 60
    syscall
; echo $? -> 115`,
      note: "L'adressage indexé [base + index*taille] accède à un élément de tableau en une instruction : ici *8 car chaque entier fait 8 octets. C'est ce que le C écrit prix[i] en une ligne. En AT&T : prix(,%rbx,8). En ARM64 : ldr x2, [x0, x1, lsl 3] (lsl 3 = ×8)."
    },
    13: {
      titre: "la longueur d'un nom",
      etat: "Manipulons du texte : mesurons la longueur du nom d'un jeu, octet par octet.",
      objectif: "Compte les caractères de la chaîne « Catan » (terminée par un 0) en parcourant la mémoire jusqu'au zéro, et renvoie la longueur (5).",
      hints: [
        "nom db \"Catan\", 0   ; chaîne terminée par 0 (comme en C).",
        "Charge un octet : movzx rdx, byte [nom + rbx].",
        "Tant que l'octet n'est pas 0 : incrémenter l'index."
      ],
      solution: `section .data
    nom db "Catan", 0

section .text
    global _start
_start:
    xor rbx, rbx        ; index = 0
boucle:
    movzx rdx, byte [nom + rbx]   ; charge 1 octet (etendu a 64 bits)
    cmp rdx, 0                    ; caractere de fin ?
    je fin
    inc rbx                       ; longueur++
    jmp boucle
fin:
    mov rdi, rbx        ; longueur = 5
    mov rax, 60
    syscall
; echo $? -> 5`,
      note: "Une chaîne « à la C » est une suite d'octets terminée par 0. On lit octet par octet (byte) : movzx étend un octet en 64 bits sans surprise de signe. C'est exactement ce que fait strlen. En ARM64 : ldrb w2, [x0, x1] charge un octet."
    },
    14: {
      titre: "lire un choix au clavier",
      etat: "Rendons le programme interactif : lisons un caractère saisi par l'utilisateur.",
      objectif: "Lis un octet depuis l'entrée standard avec le syscall read (numéro 0) dans un tampon, puis termine en renvoyant ce caractère comme code de sortie.",
      hints: [
        "Réserve un tampon : section .bss ; buf resb 1.",
        "read : rax=0, rdi=0 (stdin), rsi=buf, rdx=1 ; syscall.",
        "Récupère l'octet lu : movzx rdi, byte [buf]."
      ],
      solution: `section .bss
    buf resb 1          ; tampon de 1 octet (non initialise)

section .text
    global _start
_start:
    mov rax, 0          ; syscall read
    mov rdi, 0          ; fd 0 = entree standard
    mov rsi, buf        ; ou ranger l'octet
    mov rdx, 1          ; lire 1 octet
    syscall
    movzx rdi, byte [buf]   ; le caractere lu
    mov rax, 60
    syscall
; echo -n A | ./prog ; echo $?  -> 65 (code ASCII de 'A')`,
      note: "read(fd, adresse, longueur) lit des octets bruts dans un tampon (section .bss pour la mémoire non initialisée : resb réserve des octets). L'utilisateur tape 'A' → on récupère 65 (son code ASCII). En ARM64, read est x8=63."
    },
    15: {
      titre: "accéder via un pointeur",
      etat: "Un registre peut contenir une ADRESSE : utilisons-le comme un pointeur vers un prix.",
      objectif: "Charge l'adresse d'un prix en mémoire dans un registre (le pointeur), puis lis la valeur pointée et renvoie-la.",
      hints: [
        "mov rbx, prix charge l'ADRESSE (le pointeur) ; lea rbx, [prix] aussi.",
        "mov rax, [rbx] lit la valeur À cette adresse (déréférencement).",
        "C'est exactement le pointeur du C : une adresse dans un registre."
      ],
      solution: `section .data
    prix dq 44

section .text
    global _start
_start:
    lea rbx, [prix]     ; rbx = adresse de prix (un pointeur)
    mov rax, [rbx]      ; rax = valeur pointee = 44
    mov rdi, rax
    mov rax, 60
    syscall
; echo $? -> 44`,
      note: "lea (load effective address) calcule une adresse sans lire la mémoire : rbx contient alors un POINTEUR. mov rax, [rbx] déréférence. C'est le mécanisme exact du pointeur en C, mis à nu. En ARM64 : adr/ldr =prix pour l'adresse, ldr x0, [x1] pour déréférencer."
    },
    16: {
      titre: "afficher un nombre (libc)",
      etat: "Afficher un entier « à la main » est fastidieux : appelons printf de la bibliothèque C.",
      objectif: "Appelle printf pour afficher le stock total (« Stock: %d\\n », 115). Explique la liaison avec gcc et la mise à zéro de rax avant printf (fonction variadique).",
      hints: [
        "extern printf ; global main (on lie avec gcc, pas ld).",
        "Format dans .data : fmt db \"Stock: %d\", 10, 0.",
        "rdi = fmt, rsi = 115, xor eax, eax (0 registre vectoriel), call printf. Assembler : gcc prog.asm -o prog -no-pie."
      ],
      solution: `section .data
    fmt db "Stock: %d", 10, 0     ; format C, termine par 0

section .text
    global main
    extern printf
main:
    push rbp                ; alignement de la pile (16 octets)
    mov rdi, fmt            ; 1er arg : la chaine de format
    mov rsi, 115            ; 2e arg : la valeur
    xor eax, eax           ; 0 registre XMM (printf est variadique)
    call printf
    pop rbp
    xor eax, eax           ; return 0
    ret
; gcc prog.asm -o prog -no-pie && ./prog   ->  Stock: 115`,
      note: "En appelant la libc, on profite de printf (formatage) : on suit la convention System V (rdi, rsi…) et on met eax à 0 car printf est variadique (eax = nombre de registres vectoriels utilisés). On lie avec gcc (main, pas _start). La pile doit être alignée à 16 octets à l'appel — d'où le push rbp."
    },
    17: {
      titre: "le même code, trois façons",
      etat: "Prenons une brique simple (prix + arrivage) et écrivons-la dans les trois cibles, pour comparer.",
      objectif: "Écris « rax = 3 + 5 » dans les trois formes : NASM (Intel), AT&T (GAS) et ARM64, et note la principale différence de chaque syntaxe.",
      hints: [
        "NASM : destination à gauche (mov rax, 3).",
        "AT&T : destination à DROITE, préfixes % et $ (movq $3, %rax).",
        "ARM64 : trois opérandes, registres x0..x30 (add x0, x1, x2)."
      ],
      solution: `; --- x86-64 NASM (Intel) : dest a GAUCHE ---
    mov rax, 3
    mov rbx, 5
    add rax, rbx        ; rax = rax + rbx

; --- x86-64 AT&T (GAS) : dest a DROITE, prefixes % $ ---
    movq $3, %rax
    movq $5, %rbx
    addq %rbx, %rax     ; meme effet, ordre inverse

; --- ARM64 (AArch64) : 3 operandes, registres x0.. ---
    mov x0, 3
    mov x1, 5
    add x0, x0, x1      ; x0 = x0 + x1`,
      note: "Deux SYNTAXES pour la même machine x86-64 : NASM/Intel (dest à gauche, immédiats sans préfixe) et AT&T (dest à droite, % pour les registres, $ pour les immédiats, suffixe de taille q/l/w/b). ARM64 est une ARCHITECTURE différente : instructions à trois opérandes, plus régulières, registres x0–x30."
    },
    18: {
      titre: "ce que devient une fonction C",
      etat: "Observons l'assembleur qu'un compilateur produit pour une fonction C simple.",
      objectif: "Écris une fonction C tarif(prix, jours) = prix*jours, génère son assembleur avec gcc -S -O0, et repère où sont les arguments et le retour.",
      hints: [
        "gcc -S -O0 tarif.c produit tarif.s (syntaxe AT&T).",
        "Les arguments arrivent dans edi/esi (System V), sauvegardés sur la pile en -O0.",
        "imul fait la multiplication ; le retour est dans eax."
      ],
      solution: `/* tarif.c */
int tarif(int prix, int jours) { return prix * jours; }

; gcc -S -O0 tarif.c  ->  tarif.s (extrait, AT&T) :
tarif:
    push %rbp
    mov  %rsp, %rbp
    mov  %edi, -4(%rbp)    ; 1er arg (prix) sauve sur la pile
    mov  %esi, -8(%rbp)    ; 2e arg (jours)
    mov  -4(%rbp), %eax
    imul -8(%rbp), %eax    ; eax = prix * jours
    pop  %rbp
    ret                    ; retour dans eax`,
      note: "gcc -S traduit le C en assembleur : le meilleur outil pour comprendre ce que ton code devient. En -O0 (sans optimisation), le compilateur copie bêtement les arguments sur la pile — instructif pour voir la convention d'appel. edi/esi sont les moitiés 32 bits de rdi/rsi (types int)."
    },
    19: {
      titre: "l'effet de l'optimisation",
      etat: "Comparons le code non optimisé (-O0) et optimisé (-O2) de la même fonction.",
      objectif: "Génère l'assembleur de tarif en -O2 et observe qu'il se réduit à l'essentiel : une multiplication et un retour, sans allers-retours sur la pile.",
      hints: [
        "gcc -S -O2 tarif.c.",
        "En -O2, plus de sauvegarde sur la pile : tout reste en registres.",
        "imul edi/esi directement, résultat dans eax."
      ],
      solution: `; gcc -S -O2 tarif.c  ->  (extrait, AT&T) :
tarif:
    mov  %edi, %eax        ; prix -> eax
    imul %esi, %eax        ; eax = prix * jours
    ret                    ; retour direct, aucune pile utilisee

; a comparer avec la version -O0 (leçon 18), bien plus longue !`,
      note: "Le compilateur optimiseur élimine les copies inutiles : la version -O2 tient en trois instructions, contre une dizaine en -O0. Lire l'assembleur généré permet de comprendre les performances et de vérifier ce que le compilateur a fait. L'assembleur écrit à la main n'a d'intérêt que là où l'humain bat le compilateur (cas très rares et pointus)."
    },
    20: {
      titre: "l'utilitaire complet",
      etat: "Assemblons les briques : un petit programme qui affiche la bannière puis le total d'un catalogue.",
      objectif: "Écris un programme NASM qui : affiche « La Ludotheque\\n » (write), calcule la somme des prix du catalogue (boucle + adressage indexé), et renvoie ce total comme code de sortie.",
      hints: [
        "Réutilise write (leçon 3) pour la bannière.",
        "Réutilise la boucle indexée (leçon 12) pour la somme.",
        "Renvoie le total via rdi + exit."
      ],
      solution: `section .data
    msg  db "La Ludotheque", 10
    len  equ $ - msg
    prix dq 44, 12, 39, 20

section .text
    global _start
_start:
    ; 1) bannière
    mov rax, 1
    mov rdi, 1
    mov rsi, msg
    mov rdx, len
    syscall
    ; 2) somme du catalogue
    xor rax, rax
    xor rbx, rbx
    mov rcx, 4
.som:
    add rax, [prix + rbx*8]
    inc rbx
    dec rcx
    jnz .som
    ; 3) renvoyer le total
    mov rdi, rax        ; 115
    mov rax, 60
    syscall`,
      note: "Ce petit utilitaire réunit tout : appel système d'affichage, tableau en mémoire, boucle avec adressage indexé, code de sortie. Chaque ligne fait une opération minuscule — c'est la nature de l'assembleur. On voit concrètement le travail qu'un simple printf + boucle for du C nous épargne."
    },
    21: {
      titre: "bilan",
      etat: "La Ludothèque est réduite à ses atomes : registres, mémoire, syscalls, boucles, appels.",
      objectif: "Récapitule le trajet d'un appel système (ex. write) : quels registres, quelle instruction, et l'équivalent ARM64 — pour ancrer le modèle mental de la machine.",
      hints: [
        "x86-64 : numéro dans rax, arguments dans rdi, rsi, rdx…, puis syscall.",
        "write = rax 1 ; exit = rax 60 ; read = rax 0.",
        "ARM64 : numéro dans x8, arguments x0.., puis svc 0."
      ],
      solution: `; Appel systeme write(1, msg, len) — le modele complet :
;   x86-64 (Linux)                 ARM64 (Linux)
;   mov rax, 1     ; write         mov x8, 64     ; write
;   mov rdi, 1     ; fd stdout     mov x0, 1      ; fd
;   mov rsi, msg   ; adresse       ldr x1, =msg   ; adresse
;   mov rdx, len   ; longueur      mov x2, len    ; longueur
;   syscall                        svc 0
;
; Numeros differents, meme IDEE : registres d'arguments + instruction de trappe.`,
      note: "Bravo : tu as parlé directement à la machine — registres, mémoire, drapeaux, pile, appels et syscalls, dans les trois cibles. Tu comprends maintenant ce que TOUS les autres langages du parcours compilent en dessous. C'est le socle ultime : au-delà, il n'y a que des 0 et des 1."
    }
  }
};
