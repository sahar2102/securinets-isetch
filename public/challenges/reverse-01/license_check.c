#include <stdio.h>
#include <string.h>
/* Sample reverse-engineering target. The key is intentionally recoverable
   with `strings`. Built for the Securinets ISET Charguia challenge hub. */
int main(void) {
    char buf[128];
    const char *key = "SNT{str1ng5_4r3_ch34p}";
    printf("Securinets licence server v0.1\nkey> ");
    fflush(stdout);
    if (!fgets(buf, sizeof buf, stdin)) return 1;
    buf[strcspn(buf, "\n")] = 0;
    if (strcmp(buf, key) == 0) { puts("licence accepted. welcome."); return 0; }
    puts("invalid key.");
    return 1;
}
