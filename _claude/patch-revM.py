# revM: Collection A removes the last slider; drop the now-unused comparison builder and its tests.
import re, pathlib
root = pathlib.Path(r'C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et')
bp = root / 'Site/tools/build-pages.py'
t = bp.read_text(encoding='utf-8')
a = t.index('def comparison(product, name, wide=False, detail=False):')
b = t.index('def scene(product, name, kind, wide')
t = t[:a] + t[b:]
assert 'comparison(' not in t.replace('comparison.js', '')
bp.write_text(t, encoding='utf-8', newline='\n')

cs = root / 'Site/tools/check-site.cjs'
t = cs.read_text(encoding='utf-8')
a = t.index('function pointerAt(dom, surface, x')
b = t.index("done('Product details, sample-price label")
t = t[:a] + t[b:]
t = t.replace("done('Product details, sample-price label and full related photo (comparison is now tested on the collection page)');",
              "done('Product details, material, edition note, sample-price label and full related photo');")
old = """assert.ok(doc.querySelector('.collection-entrance .comparison-tattoo').src.endsWith('mid-levels-tattoo-full.webp'));
assert.ok(doc.querySelector('.collection-entrance .comparison-silver').src.endsWith('mid-levels-full.webp'));
checkComparison(collection,'[data-comparison]');"""
new = """const cards = doc.querySelectorAll('.collection-grid .collection-card');
assert.equal(cards.length, 2, 'Collection A: two cards');
assert.ok(cards[0].querySelector('.card-still').src.endsWith('peak-still.webp'), 'piece alone first');
assert.ok(cards[1].querySelector('.card-still').src.endsWith('mid-levels-still.webp'));
assert.ok(cards[0].querySelector('.card-worn').src.endsWith('peak-portrait.webp'), 'worn view under it');
assert.equal(cards[0].querySelector('.card-worn').getAttribute('alt'), '', 'worn layer is decorative');
assert.equal(doc.querySelector('[data-comparison], input[type=range]'), null, 'Collection A: no slider');
assert.equal(doc.querySelector('.collection-head h1').textContent, 'Hong Kong');
assert.ok(doc.querySelector('.collection-head p').textContent.includes('50 adet'));"""
assert old in t
t = t.replace(old, new).replace("done('Collection finger transition and hero B/C comparison with replay');", "done('Collection A cards and hero B/C comparison with replay');")
cs.write_text(t, encoding='utf-8', newline='\n')

bf = root / '_claude/qa/browser-flows.cjs'
t = bf.read_text(encoding='utf-8')
a = t.index('  // 2. Comparison at 50%')
b = t.index('  // 3. Checkout')
t = t[:a] + t[b:]
bf.write_text(t, encoding='utf-8', newline='\n')
print('ok')
