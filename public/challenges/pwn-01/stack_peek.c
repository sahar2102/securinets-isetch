#include <stdio.h>
#include <stdlib.h>
/* Your first stack layout challenge. Build:
   gcc -O0 -fno-stack-protector -no-pie stack_peek.c -o stack_peek */
struct frame {
    char name[32];
    unsigned int key;
};
static void win(void) {
    puts("SNT{st4ck5_4r3_ju5t_m3m0ry}");
    exit(0);
}
int main(void) {
    struct frame f;
    f.key = 0;
    puts("name?");
    gets(f.name);                /* deliberately unsafe, sample only */
    printf("key = 0x%x\n", f.key);
    if (f.key == 0x1337) win();
    puts("not quite.");
    return 0;
}
