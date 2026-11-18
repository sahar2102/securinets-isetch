# Pwn environment

All pwn binaries are ELF 64-bit x86-64, built on Ubuntu 24.04 and linked against
glibc **2.34 or newer**:

| Challenge | Binary | Needs |
|-----------|--------|-------|
| pwn-01 Stack Peek | `stack_peek` | glibc ≥ 2.34 |
| pwn-02 Buffer Overflow Baby | `baby` | glibc ≥ 2.34 |
| pwn-03 Format String Warmup | `fmt` | glibc ≥ 2.34 |
| pwn-04 ret2win With a Twist | `twist` | glibc ≥ 2.34 |
| pwn-05 One Byte at a Time | `oracle.py` | Python 3 only |

Kali 2023+, Ubuntu 22.04+ and Debian 12 run them directly. On older systems
(Ubuntu 20.04, glibc 2.31) you get `GLIBC_2.34 not found` — use the container:

```bash
docker build -t snt-pwn docker/pwn
docker run --rm -it -v "$PWD:/work" snt-pwn
```

Inside the container you have `gdb` (with gef), `pwntools`, `checksec`
via `pwn checksec`, `patchelf`, `objdump`, `nc` and `file`.

## Sanity check before the event

```bash
pwn checksec ./baby        # NX on, PIE off, no canary
python3 -c "from pwn import *; e=ELF('./baby'); print(hex(e.symbols['win']))"
```

Run each binary once with `./baby` and confirm it prints its banner. If a binary
refuses to start, the participant's glibc is older than 2.34 — the container
fixes it.

## Rule of thumb for participants

Attachments are never executed by the platform. Everything runs on their own
machine or in the container. No binary talks to the network.
