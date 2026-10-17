// Repro: does a product page open scrolled down after clicking from home/related links?
const { chromium } = require('playwright-core');
const base = 'http://127.0.0.1:8766/';
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const r = {};
  await p.goto(base + 'qu-et-home-masaustu.html');
  await p.locator('#peak-title').scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
  await p.click('.scene-copy a[href="peak.html"]'); await p.waitForLoadState('load'); await p.waitForTimeout(800);
  r.fromHomeKesfet = await p.evaluate(() => ({ url: location.pathname, y: scrollY, active: document.activeElement?.tagName + '.' + document.activeElement?.className }));
  await p.goto(base + 'qu-et-home-masaustu.html'); await p.locator('#peak-title').scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
  await p.click('.scene-media[href="peak.html"]', { force: true }); await p.waitForLoadState('load'); await p.waitForTimeout(800);
  r.fromHomeImage = await p.evaluate(() => ({ url: location.pathname, y: scrollY }));
  await p.evaluate(() => scrollTo(0, 1600)); await p.waitForTimeout(300);
  await p.click('.related-product a.text-link'); await p.waitForLoadState('load'); await p.waitForTimeout(800);
  r.fromRelated = await p.evaluate(() => ({ url: location.pathname, y: scrollY }));
  await p.goto(base + 'koleksiyon.html'); await p.evaluate(() => scrollTo(0, 900)); await p.waitForTimeout(300);
  await p.click('.collection-card[href="peak.html"]'); await p.waitForLoadState('load'); await p.waitForTimeout(800);
  r.fromCollection = await p.evaluate(() => ({ url: location.pathname, y: scrollY }));
  await p.goBack(); await p.waitForTimeout(800); await p.goForward(); await p.waitForTimeout(800);
  r.afterBackForward = await p.evaluate(() => ({ url: location.pathname, y: scrollY }));
  console.log(JSON.stringify(r));
  await b.close();
})();
