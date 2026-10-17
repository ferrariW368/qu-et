"""Builds the artifact entry page (index.html, no doctype/head/body) from the generated home page
and lists the asset files to publish alongside it."""
import re
from pathlib import Path
SITE = Path(r'C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\Site')
OUT = Path(r'C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\_claude\artifact-index.html')
home = (SITE / 'qu-et-home-masaustu.html').read_text(encoding='utf-8')
body = re.search(r'<body[^>]*>(.*)</body>', home, re.S).group(1)
head = '''<title>qu/et Önizleme</title>
<meta name="description" content="Pınar’ın çizgilerinden doğan gümüş takılar. Hong Kong koleksiyonunu keşfet.">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#121211">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/site.css">
<link rel="preload" as="image" href="assets/images/hero-clean.webp">
<script src="assets/intro.js"></script>
<script>document.body.classList.add('home');document.body.dataset.page='qu-et-home-masaustu';</script>
'''
OUT.write_text(head + body, encoding='utf-8', newline='\n')
skip = {'liquid-metal-button.source.js'}
files = [p for p in (SITE / 'assets').rglob('*') if p.is_file() and p.name not in skip and p.suffix != '.ttf']
files += [SITE / f for f in ['qu-et-home-masaustu.html', 'koleksiyon.html', 'hakkimizda.html', 'peak.html', 'mid-levels.html', 'sepet.html', 'siparis.html', 'hero-karsilastirma.html']]
print(len(files))
print('\n'.join(str(p) for p in files))
