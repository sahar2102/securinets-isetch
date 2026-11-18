#!/usr/bin/env python3
"""Local stand-in for the student dashboard.

    python3 app.py        # listens on 127.0.0.1:8080

The server trusts the `session` cookie completely: it base64-decodes the JSON
and believes whatever role it finds there.
"""
import base64, json, http.server

FLAG = "SNT{c00k13s_4r3_cl13nt_s1d3}"
PAGE = "<html><body><h1>{title}</h1><p>{body}</p></body></html>"


class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        role, user = "guest", "nobody"
        for part in self.headers.get("Cookie", "").split(";"):
            if part.strip().startswith("session="):
                raw = part.strip()[len("session="):]
                try:
                    raw += "=" * (-len(raw) % 4)
                    data = json.loads(base64.b64decode(raw))
                    role, user = data.get("role", "user"), data.get("user", "student")
                except Exception:
                    pass
        if self.path.startswith("/admin"):
            ok = role == "admin"
            body = PAGE.format(title="Admin panel" if ok else "403",
                               body=("welcome %s. %s" % (user, FLAG)) if ok else "admins only")
            code = 200 if ok else 403
        elif self.path.startswith("/dashboard"):
            body = PAGE.format(title="Dashboard", body="hello %s, role=%s" % (user, role))
            code = 200
        else:
            body = PAGE.format(title="404", body="nothing here")
            code = 404
        self.send_response(code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(body.encode())

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    print("dashboard on http://127.0.0.1:8080")
    http.server.HTTPServer(("127.0.0.1", 8080), Handler).serve_forever()
