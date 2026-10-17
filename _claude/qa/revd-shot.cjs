// revD visual check: home below the band (rest + hover), product page top.
const { chromium } = require('playwright-core');
const base = 'http://127.0.0.1:8766/';
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(base + 'qu-et-home-masaustu.html');
  for (let y = 0; y < 6000; y += 600) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(250); }
  await p.waitForTimeout(1200);
  const top = await p.$eval('.collection-band', e => e.getBoundingClientRect().top + scrollY);
  const end = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.screenshot({ path: '../shots/revd-home.jpg', type: 'jpeg', quality: 72, fullPage: true, clip: { x: 0, y: top, width: 1440, height: end - top } });
  const peak = p.locator('.scene').first();
  await peak.scrollIntoViewIfNeeded(); await p.mouse.move(5, 5); await p.waitForTimeout(800);
  await peak.screenshot({ path: '../shots/revd-peak-rest.jpg', type: 'jpeg', quality: 72 });
  await peak.hover({ position: { x: 1100, y: 300 } }); await p.waitForTimeout(900);
  await peak.screenshot({ path: '../shots/revd-peak-hover.jpg', type: 'jpeg', quality: 72 });
  await p.goto(base + 'peak.html'); await p.waitForTimeout(1500);
  await p.screenshot({ path: '../shots/revd-urun.jpg', type: 'jpeg', quality: 72 });
  await p.evaluate(() => scrollTo(0, 700)); await p.waitForTimeout(500);
  await p.screenshot({ path: '../shots/revd-urun-scroll.jpg', type: 'jpeg', quality: 72 });
  console.log(JSON.stringify({ errs, top, end }));
  await b.close();
})();
