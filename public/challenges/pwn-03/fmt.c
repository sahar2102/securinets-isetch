#include <stdio.h>
/* Format-string leak. Build:
   gcc -O0 -fno-stack-protector -no-pie fmt.c -o fmt */
int main(void) {
    char flag[64] = "SNT{%p_%p_%p_l34k5}";
    char buf[128];
    (void)flag;
    puts("what is your name?");
    fgets(buf, sizeof buf, stdin);
    printf(buf);                 /* no format constant: the bug */
    puts("");
    return 0;
}
