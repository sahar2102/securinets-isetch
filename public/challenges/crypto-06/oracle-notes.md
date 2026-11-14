# Padding oracle — analyst notes

The cookie is `AES-256-CBC`, 16-byte blocks, PKCS#7 padding.
The endpoint answers with three distinguishable errors:

| Response | Meaning |
| --- | --- |
| 500 + `bad padding` | padding invalid |
| 403 + `bad mac` | padding valid, MAC wrong |
| 200 | both valid |

Because the MAC is checked *after* decryption, the difference between
the first two responses is an oracle.

Block layout: `IV | C1 | C2 | C3`, plaintext is `JSON` with a `role` field.
You may request up to 5,000 decryptions; budget accordingly.
