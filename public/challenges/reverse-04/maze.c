#include <stdio.h>
#include <string.h>
#include <sys/ptrace.h>
/* Anti-debug + chained XOR. Static analysis still wins. */
static unsigned char enc[] = { 0x00, 0x1d, 0x1a, 0x2f, 0x0b, 0x04, 0x06, 0x11, 0x57, 0x6b, 0x6e, 0x42, 0x2c, 0x28, 0x43, 0x40, 0x17, 0x0b, 0x59, 0x5f, 0x09, 0x38, 0x26, 0x49, 0x45, 0x08 };
int main(void) {
    if (ptrace(PTRACE_TRACEME, 0, 1, 0) == -1) {
        puts("nice try."); return 1;
    }
    char in[64];
    unsigned char out[64];
    unsigned char prev = 0x53;
    for (size_t i = 0; i < sizeof enc; i++) {
        out[i] = enc[i] ^ prev;
        prev = out[i];
    }
    printf("flag> "); fflush(stdout);
    if (!fgets(in, sizeof in, stdin)) return 1;
    in[strcspn(in, "\n")] = 0;
    if (strlen(in) == sizeof enc && memcmp(in, out, sizeof enc) == 0) {
        puts("the maze lets you through."); return 0;
    }
    puts("wall.");
    return 1;
}
