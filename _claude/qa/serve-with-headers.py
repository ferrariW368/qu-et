"""Local static server that applies Site/_headers, to verify CSP before deploy."""
import http.server, functools, pathlib, fnmatch

SITE = pathlib.Path(__file__).resolve().parents[2] / 'Site'
rules, current = [], None
for line in (SITE / '_headers').read_text(encoding='utf-8').splitlines():
    if not line.strip() or line.lstrip().startswith('#'):
        continue
    if not line.startswith(' '):
        current = (line.strip(), []); rules.append(current)
    else:
        key, value = line.strip().split(':', 1); current[1].append((key, value.strip()))

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        path = self.path.split('?')[0]
        for pattern, headers in rules:
            if fnmatch.fnmatch(path, pattern.replace('/*', '/*')):
                for key, value in headers:
                    if key == 'Strict-Transport-Security' or 'upgrade-insecure' in value:
                        value = value.replace('; upgrade-insecure-requests', '')  # plain-http local test
                        if key == 'Strict-Transport-Security': continue
                    self.send_header(key, value)
        super().end_headers()

http.server.ThreadingHTTPServer(('127.0.0.1', 8766), functools.partial(Handler, directory=str(SITE))).serve_forever()
