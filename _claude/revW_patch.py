from pathlib import Path
S = Path('tools/build-pages.py'); s = S.read_text(encoding='utf-8')

# 1) SITE_URL constant
anchor = "# Copy: TR as approved;"
assert anchor in s and 'SITE_URL' not in s
s = s.replace(anchor, """# revW (20 Oct): absolute origin for OG tags, robots.txt and sitemap.xml. Domain not chosen yet (SİTE 04/09):
# change this one line when it is, then rebuild + make-dist.
SITE_URL = 'https://qu-et.pages.dev'
OG_LOCALE = {'en': 'en_US', 'tr': 'tr_TR'}

""" + anchor, 1)

# 2) OG + apple-touch-icon in <head>
old = '  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">\n'
assert old in s
s = s.replace(old, old + '''  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  {og_tags(lang, key, title, description, path)}
''', 1)
old = "def page(lang, key, title, description, main"
s = s.replace(old, '''def og_tags(lang, key, title, description, path):
    # revW: link previews (Instagram/WhatsApp/X). One shared 1200x630 image; og:url only for routed pages.
    full = 'qu/et' if title == 'qu/et' else f'{title} · qu/et'
    url = f'<meta property="og:url" content="{SITE_URL}{ROUTES[lang][key]}">' if path is None and key in ROUTES[lang] else ''
    return (f'<meta property="og:type" content="website"><meta property="og:site_name" content="qu/et">'
            f'<meta property="og:title" content="{escape(full, quote=True)}"><meta property="og:description" content="{escape(description, quote=True)}">'
            f'<meta property="og:image" content="{SITE_URL}/assets/og-image.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
            f'<meta property="og:image:alt" content="{escape(T[lang]["band_alt"], quote=True)}"><meta property="og:locale" content="{OG_LOCALE[lang]}">'
            f'{url}<meta name="twitter:card" content="summary_large_image">')

''' + old, 1)

# 3) Hong Kong band: phone-only crop (same pixel density as today, fewer bytes)
old = '''    <img src="/assets/images/hong-kong.webp" alt="{t['band_alt']}" width="1672" height="941" fetchpriority="low" decoding="async">'''
assert old in s
s = s.replace(old, '''    <picture><source media="(max-width: 760px)" srcset="/assets/images/hong-kong-m.webp"><img src="/assets/images/hong-kong.webp" alt="{t['band_alt']}" width="1672" height="941" fetchpriority="low" decoding="async"></picture>''', 1)

# 4) generated files at the end
tail = "print('Built 7 pages"
assert tail in s
s = s.replace(tail, r'''# revW: PNG icon for iOS home screen, OG image, robots.txt, sitemap.xml (generated, never hand-edited).
from PIL import ImageDraw
_icon = Image.new('RGB', (180, 180), '#121211'); ImageDraw.Draw(_icon).line([(112.5, 33.75), (67.5, 146.25)], fill='#e9e5df', width=5)
_icon.save(SITE/'assets'/'apple-touch-icon.png', optimize=True)
_hk = Image.open(IMAGES/'hong-kong.webp').convert('RGB'); _h = round(_hk.width * 630 / 1200)
_hk.crop((0, 0, _hk.width, _h)).resize((1200, 630), Image.LANCZOS).save(SITE/'assets'/'og-image.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
_m = (_hk.width - 1100) // 2
_hk.crop((_m, 0, _m + 1100, _hk.height)).save(IMAGES/'hong-kong-m.webp', 'WEBP', quality=90, method=6)
(SITE/'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n', encoding='utf-8', newline='\n')
_urls = []
for _k in ('home', 'collection', 'about', 'peak', 'mid-levels', 'privacy'):
    _alt = ''.join(f'<xhtml:link rel="alternate" hreflang="{l}" href="{SITE_URL}{ROUTES[l][_k]}"/>' for l in ('en', 'tr'))
    _alt += f'<xhtml:link rel="alternate" hreflang="x-default" href="{SITE_URL}{ROUTES["en"][_k]}"/>'
    _urls += [f'  <url><loc>{SITE_URL}{ROUTES[l][_k]}</loc>{_alt}</url>' for l in ('en', 'tr')]
(SITE/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + '\n'.join(_urls) + '\n</urlset>\n', encoding='utf-8', newline='\n')
''' + tail, 1)
S.write_text(s, encoding='utf-8', newline='\n')

D = Path('tools/make-dist.py'); d = D.read_text(encoding='utf-8')
old = "ALWAYS = ['_headers', 'assets/favicon.svg']"; assert old in d
D.write_text(d.replace(old, "ALWAYS = ['_headers', 'assets/favicon.svg', 'assets/apple-touch-icon.png', 'assets/og-image.jpg', 'robots.txt', 'sitemap.xml']  # revW"), encoding='utf-8', newline='\n')

C = Path('assets/site.css')
with C.open('a', encoding='utf-8', newline='\n') as f:
    f.write('''
/* revW (20 Ekim): sticky add-to-bag on phones. Stays pinned to the bottom while the product info is on screen,
   so the action is always one tap away while reading the details. */
@media(max-width:760px){
 .product-info .order-actions{position:sticky;bottom:0;z-index:5;margin-inline:calc(-1 * var(--gutter));padding:12px var(--gutter) calc(12px + env(safe-area-inset-bottom,0px));background:var(--night);border-top:1px solid var(--line)}
}
''')
print('ok')
