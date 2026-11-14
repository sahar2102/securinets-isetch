#include <stdio.h>
#include <string.h>
/* Rolling XOR: key = seed[i % 4]. The seed is derived at runtime. */
static unsigned char blob[] = { 0x00, 0x00, 0x00, 0x5a, 0x21, 0x7e, 0x38, 0x4d, 0x62, 0x20, 0x33, 0x7e, 0x2b, 0x7e, 0x26, 0x7e, 0x38, 0x7d, 0x2d, 0x5c };
static const unsigned char seed[4] = {0x53, 0x4e, 0x54, 0x21};
int main(void) {
    char buf[64];
    size_t n = sizeof blob;
    for (size_t i = 0; i < n; i++) blob[i] ^= seed[i % 4];
    printf("key> ");
    fflush(stdout);
    if (!fgets(buf, sizeof buf, stdin)) return 1;
    buf[strcspn(buf, "\n")] = 0;
    if (strlen(buf) == n && memcmp(buf, blob, n) == 0) { puts("access granted."); return 0; }
    puts("denied.");
    return 1;
}
