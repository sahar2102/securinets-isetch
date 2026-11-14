#!/usr/bin/env python3
"""
Local timing-oracle simulator for the "One Byte at a Time" challenge.

There is no network service. This script answers one guess and exits; the
leak is a tiny per-matching-byte delay, well below the noise of a single
measurement. Usage:

    python3 oracle.py "SNT{aaaa}"

Requires Python 3.8+. No third-party packages.
"""
import sys
import time

FLAG = "SNT{0n3_byt3_4t_4_t1m3}"
PER_BYTE = 0.00004  # 40 microseconds per correct prefix byte


def check(guess: str) -> None:
    start = time.perf_counter()
    for i, ch in enumerate(guess):
        if i >= len(FLAG) or ch != FLAG[i]:
            break
        # the leak: the comparison is not constant-time
        time.sleep(PER_BYTE)
    elapsed = time.perf_counter() - start
    print(f"elapsed={elapsed:.6f}s")


if __name__ == "__main__":
    check(sys.argv[1] if len(sys.argv) > 1 else "")
