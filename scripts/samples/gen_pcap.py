#!/usr/bin/env python3
"""Generate the synthetic packet captures used by the Network challenges."""
import base64
import os
import struct

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "public", "challenges")


def csum(data: bytes) -> int:
    if len(data) % 2:
        data += b"\x00"
    s = sum(struct.unpack("!%dH" % (len(data) // 2), data))
    while s >> 16:
        s = (s & 0xFFFF) + (s >> 16)
    return ~s & 0xFFFF


def ip(src, dst, proto, payload, ttl=64):
    total = 20 + len(payload)
    hdr = struct.pack(
        "!BBHHHBBH4s4s",
        0x45, 0, total, 0x1234, 0, ttl, proto, 0,
        bytes(map(int, src.split("."))), bytes(map(int, dst.split("."))),
    )
    hdr = hdr[:10] + struct.pack("!H", csum(hdr)) + hdr[12:]
    return hdr + payload


def tcp(sport, dport, seq, ack, flags, payload=b"", src="10.0.0.66", dst="10.0.0.20"):
    off = (5 << 4)
    hdr = struct.pack("!HHIIBBHHH", sport, dport, seq, ack, off, flags, 8192, 0, 0)
    pseudo = (
        bytes(map(int, src.split("."))) + bytes(map(int, dst.split(".")))
        + struct.pack("!BBH", 0, 6, len(hdr) + len(payload))
    )
    chk = csum(pseudo + hdr + payload)
    hdr = hdr[:16] + struct.pack("!H", chk) + hdr[18:]
    return ip(src, dst, 6, hdr + payload)


def udp(sport, dport, payload, src="10.0.0.66", dst="10.0.0.53"):
    hdr = struct.pack("!HHHH", sport, dport, 8 + len(payload), 0)
    return ip(src, dst, 17, hdr + payload)


def eth(payload, src=b"\x02\x00\x00\x00\x00\x66", dst=b"\x02\x00\x00\x00\x00\x20"):
    return dst + src + b"\x08\x00" + payload


def dns_query(name, qtype=16):
    msg = struct.pack("!HHHHHH", 0xBEEF, 0x0100, 1, 0, 0, 0)
    for label in name.split("."):
        msg += bytes([len(label)]) + label.encode()
    msg += b"\x00" + struct.pack("!HH", qtype, 1)
    return msg


def write_pcap(name, frames):
    path = os.path.join(OUT, name[0], name[1])
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(struct.pack("<IHHiIII", 0xA1B2C3D4, 2, 4, 0, 0, 65535, 1))
        for i, frame in enumerate(frames):
            ts = 1794550000 + i
            f.write(struct.pack("<IIII", ts, i * 1000, len(frame), len(frame)))
            f.write(frame)
    print(f"  {name[0]}/{name[1]} ({os.path.getsize(path)} B, {len(frames)} packets)")


def gen_scan():
    frames = []
    for port in [21, 22, 23, 25, 53, 80, 110, 139, 143, 443, 445, 993, 1433, 3306, 3389, 8080]:
        frames.append(eth(tcp(51234, port, 1000 + port, 0, 0x02)))
    frames.append(eth(tcp(31337, 51234, 9000, 1001, 0x12, dst_fix=True) if False else
                        tcp(31337, 51234, 9000, 1001, 0x12, src="10.0.0.20", dst="10.0.0.66")))
    banner = b"SNT{sc4n_sl0wly_l1ttl3_b0t}\r\nSSH-2.0-OpenSSH_9.6p1 Ubuntu\r\n"
    frames.append(eth(tcp(31337, 51234, 9001, 1002, 0x18, banner, src="10.0.0.20", dst="10.0.0.66"),
                      src=b"\x02\x00\x00\x00\x00\x20", dst=b"\x02\x00\x00\x00\x00\x66"))
    write_pcap(("network-01", "office.pcap"), frames)


def gen_http():
    frames = []
    frames.append(eth(tcp(51515, 80, 5000, 0, 0x02)))
    frames.append(eth(tcp(80, 51515, 7000, 5001, 0x12, src="10.0.0.80", dst="10.0.0.66"),
                      src=b"\x02\x00\x00\x00\x00\x80", dst=b"\x02\x00\x00\x00\x00\x66"))
    req = (
        b"GET /api/v1/profile HTTP/1.1\r\nHost: api.snt-isetch.local\r\n"
        b"User-Agent: curl/8.5.0\r\nAccept: */*\r\n"
        b"X-Debug-Token: SNT{http_1s_pl41n_t3xt}\r\nConnection: close\r\n\r\n"
    )
    frames.append(eth(tcp(51515, 80, 5001, 7001, 0x18, req)))
    write_pcap(("network-02", "capture.pcap"), frames)


def gen_dns():
    flag = b"SNT{dns_1s_4_tr4nsp0rt}"
    chunk = 10
    frames = []
    for i in range(0, len(flag), chunk):
        part = flag[i:i + chunk]
        label = base64.b32encode(part).decode().rstrip("=")
        name = f"{label}.{i // chunk:04x}.tunnel.snt-lab.tn"
        frames.append(eth(udp(40000 + i, 53, dns_query(name))))
    write_pcap(("network-03", "dns-exfil.pcap"), frames)


def icmp_echo(payload, ttl, ident):
    hdr = struct.pack("!BBHHH", 8, 0, 0, ident, 1)
    hdr = hdr[:2] + struct.pack("!H", csum(hdr + payload)) + hdr[4:]
    return hdr + payload


def gen_icmp():
    frames = []
    for i in range(16):
        frames.append(eth(ip("10.0.0.66", "10.0.0.20", 1, icmp_echo(b"SYNC" + bytes([i]) * 12, 64, 1000 + i))))
    flag = b"SNT{1c0ut_0ut_0f_b4nd}"
    for i, b in enumerate(flag):
        ttl = 40 + (i % 8)
        payload = bytes([b ^ ttl]) + b"Heartbeat" + bytes([i])
        frames.append(eth(ip("10.0.0.66", "10.0.0.20", 1, icmp_echo(payload, ttl, 2000 + i), ttl=ttl)))
    write_pcap(("network-04", "icmp.pcap"), frames)


if __name__ == "__main__":
    gen_scan()
    gen_http()
    gen_dns()
    gen_icmp()
