#include <stdio.h>
/* ret2win with two arguments. Build:
   gcc -O0 -fno-stack-protector -no-pie twist.c -o twist */
__attribute__((naked)) static void gadget(void) {
    __asm__ volatile("pop %rdi; pop %rsi; ret");
}
void win(unsigned long a, unsigned long b) {
    if (a != 0x1337 || b != 0x2026) return;
    const char msg[] = "SNT{r3t2w1n_1s_4_g4t3w4y}\n";
    __asm__ volatile("syscall"
                     :
                     : "a"(1), "D"(1), "S"(msg), "d"(sizeof(msg) - 1)
                     : "rcx", "r11", "memory");
}
int main(void) {
    char buf[64];
    puts("give me a payload:");
    gets(buf);                   /* deliberately unsafe, sample only */
    return 0;
}
