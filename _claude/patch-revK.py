# revK: liquid-metal butonu kaldırılıyor (K2-B). Testler ve CSP buna göre güncellenir.
import re, pathlib, shutil
root = pathlib.Path(r'C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et')
site = root / 'Site'

def sub(path, old, new, count=1):
    t = path.read_text(encoding='utf-8')
    assert t.count(old) == count, (path.name, old[:60], t.count(old))
    path.write_text(t.replace(old, new), encoding='utf-8', newline='\n')

# 1) CSS: drop the liquid-metal block (comment line + rules through the ripple keyframes)
css = site / 'assets/site.css'
lines = css.read_text(encoding='utf-8').split('\n')
start = next(i for i, l in enumerate(lines) if 'One restrained liquid-metal action' in l)
end = start + 1
while end < len(lines) and ('liquid-metal' in lines[end] or lines[end].startswith('.cta')):
    end += 1
print('css removed:', *lines[start:end], sep='\n  ')
del lines[start:end]
css.write_text('\n'.join(lines), encoding='utf-8', newline='\n')

# 2) check-site.cjs: the band link replaces the metal button
cs = site / 'tools/check-site.cjs'
t = cs.read_text(encoding='utf-8')
t = t.replace("assert.equal(doc.querySelector('.liquid-metal-button').getAttribute('href'), 'koleksiyon.html');",
              "assert.equal(doc.querySelector('.collection-band .band-link').getAttribute('href'), 'koleksiyon.html');\nassert.ok(doc.querySelector('.collection-band .band-link').textContent.includes('Koleksiyonu keşfet'));\nassert.equal(doc.querySelector('script[src*=\"liquid-metal\"]'), null, 'K2-B: no shader on the homepage');\nassert.equal(doc.querySelectorAll('.scene-duo > .scene-pair').length, 2, 'K3-B: Peak and Mid-Levels as an editorial pair');")
t = re.sub(r"home\.window\.HTMLCanvasElement[^\n]*\nhome\.window\.matchMedia[^\n]*\nhome\.window\.eval\([^\n]*liquid-metal-button\.js[^\n]*\nassert\.equal\(doc\.querySelector\('\.liquid-metal-button'\)[^\n]*\nassert\.ok\(doc\.querySelector\('\.liquid-metal-label'\)[^\n]*\n", '', t)
t = t.replace("story line and usable WebGL fallback", "story line, text link and editorial pair")
assert 'liquid-metal-button.js' not in t
cs.write_text(t, encoding='utf-8', newline='\n')

# 3) c-check.cjs: drop the metal checks, keep logo + price
cc = root / '_claude/qa/c-check.cjs'
t = cc.read_text(encoding='utf-8')
a = t.index("  const btn = page.locator('.liquid-metal-button');")
b = t.index("  await page.goto(base + 'peak.html');")
t = t[:a] + t[b:]
t = t.replace('logo dönüşü, durağan metal buton, fiyat etiketi', 'logo dönüşü, fiyat etiketi (metal buton K2-B ile kaldırıldı)')
cc.write_text(t, encoding='utf-8', newline='\n')
sub(root / '_claude/qa/check-all.ps1', " -or -not $c.restStatic -or -not $c.hoverMoves -or -not $c.leaveStops", "")

# 4) CSP: the style hash existed only for the shader's injected <style>
h = site / '_headers'
t = h.read_text(encoding='utf-8')
t = re.sub(r"# The sha256 is the constant <style data-paper-shader>[^\n]*\n(#[^\n]*\n)*", '', t)
t = t.replace(" 'sha256-bcX2M6hOeEgeI9Ttj3KtXWZuoRsKenyQAlXswSnLakA='", '')
assert 'sha256' not in t
h.write_text(t, encoding='utf-8', newline='\n')

# 5) CONSTRAINTS: exception E1 closed
c = site / 'CONSTRAINTS.md'
t = c.read_text(encoding='utf-8')
line = next(l for l in t.split('\n') if l.startswith('| E1 |'))
t = t.replace(line, line.replace('| E1 |', '| ~~E1~~ |', 1) + ' **Kapandı 16 Ekim (K2-B): buton ve hash kaldırıldı.**')
c.write_text(t, encoding='utf-8', newline='\n')

# 6) prepare-preview + unused assets to the archive
sub(site / 'tools/prepare-preview.py', "'assets/liquid-metal-button-NOTICE.txt', 'assets/paper-shaders-LICENSE.txt', 'assets/paper-shaders-NOTICE.txt', ", '')
dest = site / 'arsiv/kullanilmayan-assets-20261016'
dest.mkdir(parents=True, exist_ok=True)
for n in ['liquid-metal-button.js', 'liquid-metal-button.source.js', 'liquid-metal-button-NOTICE.txt', 'paper-shaders-LICENSE.txt', 'paper-shaders-NOTICE.txt']:
    shutil.move(str(site / 'assets' / n), str(dest / n))
print('ok')
