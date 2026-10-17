// Measure the INK box of the footer wordmark (baseline y=292, x=0) by rasterising it with the site font.
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://127.0.0.1:8766/hakkimizda.html');
  const r = await p.evaluate(async () => {
    await document.fonts.load('200 400px Jost'); await document.fonts.ready;
    const c = document.createElement('canvas'); c.width = 1400; c.height = 900;
    const g = c.getContext('2d');
    g.font = '200 400px Jost'; g.letterSpacing = '-8px'; g.fillStyle = '#000'; g.textBaseline = 'alphabetic';
    g.fillText('qu/et', 200, 492); // == svg (0, 292) shifted by (200, 200)
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    return { x: minX - 200, y: minY - 200, w: maxX - minX + 1, h: maxY - minY + 1, family: getComputedStyle(document.querySelector('svg.footer-wordmark text')).fontFamily };
  });
  console.log(JSON.stringify(r));
  await b.close();
})();
