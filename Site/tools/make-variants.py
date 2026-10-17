"""Responsive image variants for srcset. Resizes the registered webp masters so
paired tattoo/silver images stay pixel-aligned. Re-run after any image change."""
from pathlib import Path
from PIL import Image

IMAGES = Path(__file__).resolve().parents[1] / 'assets' / 'images'
TARGETS = {
    'mid-levels-full': [840, 1280], 'mid-levels-tattoo-full': [840, 1280], 'peak-full': [600],
    'peak-portrait': [720], 'peak-tattoo-portrait': [720],
    'mid-levels-portrait': [720], 'mid-levels-tattoo-portrait': [720],
}
for stem, widths in TARGETS.items():
    src = Image.open(IMAGES / f'{stem}.webp').convert('RGB')
    for w in widths:
        h = round(src.height * w / src.width)
        out = IMAGES / f'{stem}-{w}.webp'
        src.resize((w, h), Image.LANCZOS).save(out, 'WEBP', quality=90, method=6)  # q80 smoothed skin texture (visual check 16 Oct); q90 keeps it
        print(out.name, (w, h), round(out.stat().st_size / 1024), 'KB')
