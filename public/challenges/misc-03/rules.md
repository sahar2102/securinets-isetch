# Six conditions — exactly one line matches all of them

1. Source IP inside `10.0.0.0/8`
2. Source IP **not** inside `10.0.1.0/24`
3. Status is neither `200` nor `204`
4. User-Agent is `curl/8.5.0`
5. Request path is exactly `/api/v1/session`
6. A `token=` parameter is present

The matching line's token is the flag.
