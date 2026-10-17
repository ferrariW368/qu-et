"""revD (16 Ekim, Eren kararları 1-B 2-A 3-A 4-B 5-A): build-pages.py şablon değişiklikleri."""
from pathlib import Path
F = Path(r'C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\Site\tools\build-pages.py')
c = F.read_text(encoding='utf-8')

def rep(old, new):
    global c
    assert c.count(old) == 1, old[:80]
    c = c.replace(old, new)

# sizes for full-bleed and split scenes
rep("""         'related': '(max-width: 760px) calc(100vw - 48px), 60vw'}""",
    """         'related': '(max-width: 760px) calc(100vw - 48px), 60vw',
         'full': '100vw',
         'split': '(max-width: 760px) 100vw, 45vw'}""")

# 1-B + 2-A: one full-screen scene per product; silver gives way to the tattoo on hover/focus (no controls)
rep("""def hero_scene(""", '''def scene(product, name, kind, wide):
    size, sizes, (w, h) = ('full', 'full', (1672, 941)) if wide else ('portrait', 'split', (960, 1200))
    layout = 'scene-wide' if wide else 'scene-split'
    return f\'\'\'<section class="scene {layout}" aria-labelledby="{product}-title">
    <a class="scene-media" href="{product}.html" tabindex="-1" aria-hidden="true">
      <img class="scene-tattoo" src="assets/images/{product}-tattoo-{size}.webp" {srcset(f'{product}-tattoo-{size}', sizes)} alt="" width="{w}" height="{h}" loading="lazy" decoding="async">
      <img class="scene-silver" src="assets/images/{product}-{size}.webp" {srcset(f'{product}-{size}', sizes)} alt="" width="{w}" height="{h}" loading="lazy" decoding="async">
    </a>
    <div class="scene-copy">
      <h2 class="scene-name" id="{product}-title">{name}</h2>
      <p class="scene-state"><span class="state-silver">{kind}, gümüşte</span><span class="state-tattoo" aria-hidden="true">Önce tende</span></p>
      <a class="text-link" href="{product}.html" aria-label="{name} ürününü keşfet">Keşfet</a>
    </div>
  </section>\'\'\'

def hero_scene(''')

rep("""  <section class="home-products" aria-label="Hong Kong tasarımları">
    <div class="product-sequence shell">
      <article class="product-row"><div class="product-visual"><!-- PEAK_COMPARE --></div><h2 class="product-name"><a href="peak.html">Peak</a></h2></article>
      <article class="product-row"><div class="product-visual"><!-- RING_COMPARE --></div><h2 class="product-name"><a href="mid-levels.html">Mid-Levels</a></h2></article>
    </div>
  </section>
  <section class="home-about" aria-labelledby="about-title"><div class="shell">
    <h2 id="about-title">Her parça, Pınar'ın bir dövme çiziminden doğar.</h2>
    <div class="side"><p>Pınar İstanbul'da ince çizgi dövme yapıyor. Tende kalan çizgi stüdyoda, gümüşe geçen çizgi burada.</p><a class="text-link" href="hakkimizda.html">Hakkımızda</a></div>
  </div></section>""",
"""  <!-- PEAK_SCENE -->
  <!-- RING_SCENE -->
  <section class="story" aria-labelledby="about-title"><div class="story-inner">
    <h2 class="story-line" id="about-title">Her parça, Pınar'ın bir dövme çiziminden doğar.</h2>
    <a class="text-link" href="hakkimizda.html">Hakkımızda</a>
  </div></section>""")

rep(""".replace('<!-- PEAK_COMPARE -->', comparison('peak', 'Peak')).replace('<!-- RING_COMPARE -->', comparison('mid-levels', 'Mid-Levels'))""",
    """.replace('<!-- PEAK_SCENE -->', scene('peak', 'Peak', 'Küpe', wide=False)).replace('<!-- RING_SCENE -->', scene('mid-levels', 'Mid-Levels', 'Yüzük', wide=True))""")

# 5-A: giant wordmark closes every page; the small footer logo is replaced by it
rep("""    <div><a class="logo" href="{HOME}" aria-label="qu/et ana sayfa">qu<i>/</i>et</a><p>İstanbul · Hong Kong</p></div>""",
    """    <p class="footer-place">İstanbul · Hong Kong</p>""")
rep("""<span>Türkçe</span></div>
</div></footer>'''""",
    """<span>Türkçe</span></div>
</div><p class="footer-wordmark" aria-hidden="true">qu<i>/</i>et</p></footer>'''""")

# 4-B: big close-up, minimal info, short story; thumbnails become two text toggles
rep("""  <nav aria-label="Sayfa yolu"><ol class="breadcrumbs"><li><a href="koleksiyon.html">Hong Kong</a></li><li aria-current="page">{p['name']}</li></ol></nav>
  <section class="product-layout" data-product="{p['id']}">""",
    """  <section class="product-layout" data-product="{p['id']}">""")
rep("""data-gallery-srcset="{candidates(p['id'] + '-portrait')}"><img src="assets/images/{p['id']}-portrait-720.webp" alt="" width="960" height="1200"></button>""",
    """data-gallery-srcset="{candidates(p['id'] + '-portrait')}">Takılı görünüm</button>""")
rep("""data-gallery-caption="Detay"><img src="assets/images/{p['id']}-detail.webp" alt="" width="800" height="1000"></button>""",
    """data-gallery-caption="Detay">Detay</button>""")
rep("""      <div class="gallery-main">{comparison(p['id'], p['name'], detail=True)}</div>
      <p class="gallery-caption" id="gallery-caption" aria-live="polite">Takılı görünüm</p>""",
    """      <div class="gallery-main">{comparison(p['id'], p['name'], detail=True)}</div>
      <p class="gallery-caption sr-only" id="gallery-caption" aria-live="polite">Takılı görünüm</p>""")
rep("""      <a class="eyebrow" href="koleksiyon.html">Hong Kong</a><h1>{p['name']}</h1><p class="product-kind">{p['kind']}</p>""",
    """      <a class="product-back" href="koleksiyon.html">Hong Kong</a><h1>{p['name']}</h1><p class="product-kind">{p['kind']}</p>
      <p class="product-story">{p['copy']}</p>""")

# gallery thumbs above the image in the source order, so they follow the image visually via CSS grid
F.write_text(c, encoding='utf-8', newline='\n')
print('revD template patched')
