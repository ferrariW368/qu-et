// Full homepage capture after the intro has finished and lazy images loaded; plus CTA close-up at rest.
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://127.0.0.1:8766/qu-et-home-masaustu.html');
  await p.waitForTimeout(3600);
  await p.screenshot({ path: '../shots/home-hero-yazi.jpg', type: 'jpeg', quality: 78 });
  await p.waitForTimeout(6500);
  await p.screenshot({ path: '../shots/home-hero-son.jpg', type: 'jpeg', quality: 78 });
  for (let y = 0; y < 7000; y += 500) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(200); }
  await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 15000 });
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800);
  await p.screenshot({ path: '../shots/home-full.jpg', type: 'jpeg', quality: 76, fullPage: true });
  const band = p.locator('.collection-band'); await band.scrollIntoViewIfNeeded(); await p.waitForTimeout(1500);
  await band.screenshot({ path: '../shots/home-band.jpg', type: 'jpeg', quality: 80 });
  await p.locator('.liquid-metal-button').screenshot({ path: '../shots/home-cta.png' });
  console.log('ok');
  await b.close();
})();
