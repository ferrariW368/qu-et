// Current-state captures with lazy images loaded (scroll first).
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://127.0.0.1:8766/qu-et-home-masaustu.html');
  for (let y = 0; y < 5000; y += 600) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(300); }
  await p.waitForTimeout(1500);
  const top = await p.$eval('.home-products', e => e.getBoundingClientRect().top + scrollY);
  const end = await p.$eval('.site-footer', e => e.getBoundingClientRect().bottom + scrollY);
  await p.screenshot({ path: '../shots/simdi-vitrin.jpg', type: 'jpeg', quality: 75, fullPage: true, clip: { x: 0, y: top - 200, width: 1440, height: end - top + 200 } });
  console.log(top, end);
  await b.close();
})();
