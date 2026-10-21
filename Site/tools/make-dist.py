"""revS (17 Oct): build the deploy folder for Cloudflare Pages from a whitelist.

Site/ also holds arsiv/, review/, tools/, CONSTRAINTS.md and internal review pages; none of them may go live.
This copies only the public pages plus the assets they actually reference into qu.et/dist/, so the upload is
exactly what visitors should see. Run after build-pages.py; upload dist/ (Pages: Direct Upload, or wrangler).
"""
from pathlib import Path
import re, shutil, sys

SITE = Path(__file__).resolve().parents[1]
DIST = SITE.parent / 'dist'
PAGES = ['index.html', '404.html', 'collection/index.html', 'about/index.html', 'peak/index.html', 'mid-levels/index.html', 'bag/index.html', 'checkout/index.html',
         'tr/index.html', 'tr/404.html', 'tr/koleksiyon/index.html', 'tr/hakkimizda/index.html', 'tr/peak/index.html', 'tr/mid-levels/index.html', 'tr/sepet/index.html', 'tr/siparis/index.html', 'privacy/index.html', 'tr/kvkk/index.html']
ALWAYS = ['_headers', 'assets/favicon.svg', 'assets/apple-touch-icon.png', 'assets/og-image.jpg', 'robots.txt', 'sitemap.xml']  # revW

if DIST.exists():
    try:
        shutil.rmtree(DIST)
    except OSError as error:
        sys.exit(f'dist/ exists and could not be cleared ({error}); delete it and run again.')

refs = set(ALWAYS)
for name in PAGES:
    html = (SITE / name).read_text(encoding='utf-8')
    for attr in re.findall(r'(?:src|href|data-src)="(/assets/[^"#?]+)(?:\?[^"]*)?"', html):
        refs.add(attr.lstrip('/'))
    for group in re.findall(r'(?:srcset|data-srcset)="([^"]+)"', html):
        refs.update(part.strip().split()[0].split('?')[0].lstrip('/') for part in group.split(','))
    refs.add(name)
# Images the bag draws from JavaScript (site.js) are not in any HTML attribute.
refs.update(m.lstrip('/') for m in re.findall(r"'(/assets/images/[^']+)'", (SITE / 'assets/site.js').read_text(encoding='utf-8')))
for css in ('assets/site.css',):
    for url in re.findall(r'url\(([^)]+)\)', (SITE / css).read_text(encoding='utf-8')):
        url = url.strip('\'" ')
        if not url.startswith(('data:', 'http', '#')):
            refs.add('assets/' + url)

missing = sorted(r for r in refs if not (SITE / r).is_file())
if missing:
    sys.exit('Referenced but missing: ' + ', '.join(missing))
for rel in sorted(refs):
    target = DIST / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SITE / rel, target)
size = sum(f.stat().st_size for f in DIST.rglob('*') if f.is_file())
print(f'dist/: {len(refs)} files, {size / 1024 / 1024:.1f} MB')
