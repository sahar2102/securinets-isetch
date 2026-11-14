#include <stdio.h>
/* Ret2win warm-up. Build:
   gcc -O0 -fno-stack-protector -no-pie baby.c -o baby
   win() writes the flag with a raw syscall so it needs no libc setup. */
void win(void) {
    const char msg[] = "SNT{41_byt35_t00_m4ny}\n";
    __asm__ volatile(
        "syscall"
        :
        : "a"(1), "D"(1), "S"(msg), "d"(sizeof(msg) - 1)
        : "rcx", "r11", "memory");
}
int main(void) {
    char buf[64];
    puts("say something:");
    gets(buf);                   /* deliberately unsafe, sample only */
    puts("thanks.");
    return 0;
}
