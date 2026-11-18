# Pwn environment for the SNT internal CTF.
#
#   docker build -t snt-pwn docker/pwn
#   docker run --rm -it -v "$PWD:/work" snt-pwn
#
# Ubuntu 22.04 (glibc 2.35) runs every binary in public/challenges/pwn-*.
# The binaries need glibc >= 2.34, so Kali 2023+, Ubuntu 22.04+ and Debian 12
# work natively; anything older should use this image.
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 python3-pip python3-dev \
      gdb gcc make file binutils \
      netcat-openbsd xxd less vim \
      ruby \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache-dir pwntools==4.13.1

# gef makes the pwn-03/pwn-04 work bearable.
RUN bash -c "$(curl -fsSL https://raw.githubusercontent.com/bata24/gef/dev/install.sh)" || true

WORKDIR /work
CMD ["/bin/bash"]
