"""Package only the current desktop prototype and its referenced public assets."""
from pathlib import Path
from html.parser import HTMLParser
import re
import shutil
import json

site = Path(__file__).resolve().parents[1]
checkout = site.parent / 'preview-site'
dist = checkout / 'dist'
dist.mkdir(parents=True, exist_ok=True)
pages = ['qu-et-home-masaustu.html', 'koleksiyon.html', 'hakkimizda.html', 'peak.html',
         'mid-levels.html', 'sepet.html', 'siparis.html', 'hero-karsilastirma.html']
assets = set()
class References(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('src', 'href', 'data-gallery-src') and value and value.startswith('assets/'):
                assets.add(value)

for filename in pages:
    text = (site / filename).read_text(encoding='utf-8')
    References().feed(text)
    text = text.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <meta name="robots" content="noindex, nofollow">')
    (dist / filename).write_text(text, encoding='utf-8', newline='\n')
shutil.copy2(dist / pages[0], dist / 'index.html')
css = (site / 'assets/site.css').read_text(encoding='utf-8')
for reference in re.findall(r'url\(([^)]+)\)', css):
    assets.add('assets/' + reference.strip('"\''))
for filename in ['assets/fonts/OFL.txt']:
    if (site / filename).is_file(): assets.add(filename)
for filename in sorted(assets):
    source = site / filename
    if not source.is_file(): raise FileNotFoundError(source)
    dest = dist / filename
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, dest)
(dist / 'robots.txt').write_text('User-agent: *\nDisallow: /\n', encoding='utf-8')
(checkout / '.openai').mkdir(exist_ok=True)
manifest_path = checkout / '.openai/hosting.json'
manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
manifest['static'] = {'directory': 'dist'}
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
(checkout / '.gitignore').write_text('.sites-runtime/\nnode_modules/\n*.tar.gz\n*.tar\n', encoding='utf-8')
print(f'Prepared {len(pages)} pages and {len(assets)} assets in {checkout}')
