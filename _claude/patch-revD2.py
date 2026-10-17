"""revD2: scene() takes explicit image stems; the tattoo layer switches on automatically once its file exists."""
from pathlib import Path
F = Path(r'C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\Site\tools\build-pages.py')
c = F.read_text(encoding='utf-8')
old_start = c.index("def scene(product, name, kind, wide):")
old_end = c.index("def hero_scene(")
new = '''def scene(product, name, kind, wide, silver=None, tattoo=None):
    size, sizes, (w, h) = ('full', 'full', (1672, 941)) if wide else ('portrait', 'split', (960, 1200))
    silver = silver or f'{product}-{size}'
    tattoo = tattoo or f'{product}-tattoo-{size}'
    has_tattoo = (IMAGES / f'{tattoo}.webp').exists()
    layout = ('scene-wide' if wide else 'scene-split') + ('' if has_tattoo else ' scene-static')
    tattoo_img = f\'\'\'<img class="scene-tattoo" src="assets/images/{tattoo}.webp" {srcset(tattoo, sizes)} alt="" width="{w}" height="{h}" loading="lazy" decoding="async">\'\'\' if has_tattoo else ''
    tattoo_state = '<span class="state-tattoo" aria-hidden="true">Önce tende</span>' if has_tattoo else ''
    return f\'\'\'<section class="scene {layout}" aria-labelledby="{product}-title">
    <a class="scene-media" href="{product}.html" tabindex="-1" aria-hidden="true">
      {tattoo_img}
      <img class="scene-silver" src="assets/images/{silver}.webp" {srcset(silver, sizes)} alt="" width="{w}" height="{h}" loading="lazy" decoding="async">
    </a>
    <div class="scene-copy">
      <h2 class="scene-name" id="{product}-title">{name}</h2>
      <p class="scene-state"><span class="state-silver">{kind}, gümüşte</span>{tattoo_state}</p>
      <a class="text-link" href="{product}.html" aria-label="{name} ürününü keşfet">Keşfet</a>
    </div>
  </section>\'\'\'

'''
c = c[:old_start] + new + c[old_end:]
old = "scene('peak', 'Peak', 'Küpe', wide=False)"
assert c.count(old) == 1
c = c.replace(old, "scene('peak', 'Peak', 'Küpe', wide=True, silver='peak-wide', tattoo='peak-tattoo-wide')")
F.write_text(c, encoding='utf-8', newline='\n')
print('revD2 patched')
