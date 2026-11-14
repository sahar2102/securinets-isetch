# Analyst note — ICMP traffic, host 10.0.0.66

The host sends a burst of ICMP echo requests to 10.0.0.20 every few minutes.
Nothing else in the capture looks unusual: no TCP, no DNS, no large transfers.

Observed structure:

1. **Sync phase** — the first 16 echo requests are identical except for the
   identifier and a single incrementing byte. Treat them as a header and ignore
   them.
2. **Payload phase** — each following request carries 10 bytes of data:
   `[1 byte] "Heartbeat" [1 byte index]`
3. The **first byte of the payload is XOR-ed with the IP TTL** of that packet.
   The TTL changes per packet (40–47), so the obfuscation is not a fixed key.
4. Packets are in transmission order. Concatenate the decoded first bytes.

Decoding recipe:

```python
for pkt in packets[16:]:
    ttl = pkt.ip.ttl
    yield pkt.icmp.payload[0] ^ ttl
```
