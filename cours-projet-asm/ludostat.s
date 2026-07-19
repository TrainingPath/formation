.intel_syntax noprefix
.section .data
    lbl_jeux:  .ascii "Jeux    : "
    .set lbl_jeux_len, . - lbl_jeux
    lbl_total: .ascii "Total   : "
    .set lbl_total_len, . - lbl_total
    lbl_moy:   .ascii "Moyenne : "
    .set lbl_moy_len, . - lbl_moy
    nl:        .byte 10
.section .bss
    .lcomm buf, 65536
    .lcomm numbuf, 32
.section .text
.global _start
_start:
    xor r13, r13              # total octets lus
.read_loop:
    xor rax, rax              # sys_read = 0
    xor rdi, rdi              # fd 0 (stdin)
    lea rsi, [buf + r13]
    mov rdx, 65536
    sub rdx, r13
    syscall
    cmp rax, 0
    jle .read_done            # 0 = EOF, <0 = erreur
    add r13, rax
    cmp r13, 65536
    jl .read_loop
.read_done:
    xor r12, r12              # somme
    xor r14, r14              # nombre
    xor rbx, rbx              # index
    xor r15, r15              # nombre courant
    xor r8, r8                # drapeau "dans un nombre"
.parse:
    cmp rbx, r13
    jge .parse_end
    movzx rax, byte ptr [buf + rbx]
    cmp al, 48                # '0'
    jb .sep
    cmp al, 57                # '9'
    ja .sep
    imul r15, r15, 10
    sub al, 48
    movzx rax, al
    add r15, rax
    mov r8, 1
    jmp .parse_next
.sep:
    cmp r8, 0
    je .parse_next
    add r12, r15
    inc r14
    xor r15, r15
    xor r8, r8
.parse_next:
    inc rbx
    jmp .parse
.parse_end:
    cmp r8, 0
    je .after
    add r12, r15
    inc r14
.after:
    lea rsi, [lbl_jeux]
    mov rdx, lbl_jeux_len
    call write_str
    mov rax, r14
    call print_num
    call print_nl

    lea rsi, [lbl_total]
    mov rdx, lbl_total_len
    call write_str
    mov rax, r12
    call print_num
    call print_nl

    lea rsi, [lbl_moy]
    mov rdx, lbl_moy_len
    call write_str
    xor rax, rax
    cmp r14, 0
    je .print_avg
    mov rax, r12
    xor rdx, rdx
    div r14
.print_avg:
    call print_num
    call print_nl

    mov rax, 60               # sys_exit
    xor rdi, rdi
    syscall

write_str:                    # rsi=ptr, rdx=len
    mov rax, 1
    mov rdi, 1
    syscall
    ret

print_nl:
    lea rsi, [nl]
    mov rdx, 1
    mov rax, 1
    mov rdi, 1
    syscall
    ret

print_num:                    # rax = valeur non signée
    lea r9, [numbuf + 31]
    mov r10, 10
    test rax, rax
    jnz .pn_loop
    dec r9
    mov byte ptr [r9], 48
    jmp .pn_write
.pn_loop:
    test rax, rax
    jz .pn_write
    xor rdx, rdx
    div r10
    add dl, 48
    dec r9
    mov [r9], dl
    jmp .pn_loop
.pn_write:
    lea rdx, [numbuf + 31]
    sub rdx, r9
    mov rsi, r9
    mov rax, 1
    mov rdi, 1
    syscall
    ret
