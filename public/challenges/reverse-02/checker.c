#include <stdio.h>
#include <string.h>
/* Sample reverse-engineering target: input is XOR-ed with 0x2a and compared. */
static const unsigned char enc[] = {
    0x79, 0x64, 0x7e, 0x51, 0x49, 0x42, 0x1e, 0x58, 0x75, 0x48, 0x53, 0x75,
    0x49, 0x42, 0x1e, 0x58, 0x57
};
int main(void) {
    char in[128];
    printf("enter the flag: ");
    fflush(stdout);
    if (!fgets(in, sizeof in, stdin)) return 1;
    in[strcspn(in, "\n")] = 0;
    if (strlen(in) != sizeof enc) { puts("nope."); return 1; }
    for (size_t i = 0; i < sizeof enc; i++) {
        if ((unsigned char)(in[i] ^ 0x2a) != enc[i]) { puts("nope."); return 1; }
    }
    puts("correct.");
    return 0;
}
