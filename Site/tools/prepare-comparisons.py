"""Crop each tattoo/jewelry pair identically; preserve the supplied product designs."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

site = Path(__file__).resolve().parents[1]
source = site.parent / 'Görseller' / 'qu-et-site-gorselleri'
output = site / 'assets' / 'images'
specs = [('peak', '04-parcalar-peak-A-dovme.png', '05-parcalar-peak-B-kupe.png', (.5, .5)),
         ('mid-levels', '06-midlevels-A-dovme.png', '07-midlevels-B-yuzuk.png', (.60, .5))]
sheet = Image.new('RGB', (1000, 680), '#121211')
draw = ImageDraw.Draw(sheet)
for row, (name, tattoo, silver, center) in enumerate(specs):
    for col, (filename, suffix) in enumerate([(tattoo, 'tattoo-portrait'), (silver, 'portrait')]):
        image = Image.open(source / filename).convert('RGB')
        portrait = ImageOps.fit(image, (960, 1200), Image.Resampling.LANCZOS, centering=center)
        portrait.save(output / f'{name}-{suffix}.webp', quality=94)
        preview = portrait.resize((240, 300), Image.Resampling.LANCZOS)
        sheet.paste(preview, (col * 260 + row * 500, 36))
    if name == 'mid-levels':
        Image.open(source / tattoo).convert('RGB').save(output / 'mid-levels-tattoo-full.webp', quality=94)
    draw.text((row * 500 + 10, 12), name + ' / tattoo - silver', fill='#e9e5df')
sheet.crop((0, 0, 1000, 350)).save(site / 'review' / 'comparison-crops.jpg', quality=92)
print('Prepared aligned tattoo/jewelry crops.')
