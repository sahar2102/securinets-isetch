#include <stdio.h>
#include <string.h>

/* Licence checker, "hardened" release build.
 *
 * Neither the key nor the flag appears in plaintext: both arrays below are
 * obfuscated with a single-byte XOR, and the decoy banner is there to waste
 * the time of anyone who stops at `strings`. */

static const char banner[] = "Securinets Licence Manager 2.1 — evaluation copy";
static const char decoy[]  = "SNT{str1ng5_4r3_ch34p}";

static const unsigned char k[] = { 0x4f, 0x12, 0x40, 0x10, 0x4d, 0x50, 0x10, 0x0e, 0x11, 0x13, 0x11, 0x15 };
static const unsigned char e[] = { 0x09, 0x14, 0x0e, 0x21, 0x34, 0x69, 0x2c, 0x69, 0x28, 0x05, 0x6d, 0x28, 0x2f, 0x6f, 0x2e, 0x05, 0x29, 0x2e, 0x28, 0x6b, 0x34, 0x3d, 0x29, 0x27 };

int main(void)
{
    char in[64];
    char key[sizeof(k) + 1];
    for (unsigned i = 0; i < sizeof(k); i++) key[i] = (char)(k[i] ^ 0x23);
    key[sizeof(k)] = 0;

    puts(banner);
    printf("licence key: ");
    if (!fgets(in, sizeof(in), stdin)) return 1;
    in[strcspn(in, "\n")] = 0;

    if (strcmp(in, key) != 0) {
        puts("licence rejected");
        return 1;
    }

    char out[sizeof(e) + 1];
    for (unsigned i = 0; i < sizeof(e); i++) out[i] = (char)(e[i] ^ 0x5a);
    out[sizeof(e)] = 0;
    printf("licensed. welcome: %s\n", out);
    return 0;
}
