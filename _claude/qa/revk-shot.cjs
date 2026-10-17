// revK captures: full homepage, band link, editorial pair (rest + hover).
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://127.0.0.1:8766/qu-et-home-masaustu.html');
  for (let y = 0; y < 7000; y += 600) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(120); }
  await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 15000 });
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(3500);
  await p.screenshot({ path: '../shots/revk-full.jpg', type: 'jpeg', quality: 70, fullPage: true });
  const band = await p.locator('.collection-band .copy').boundingBox();
  await p.evaluate(v => scrollTo(0, v), (await p.evaluate(() => document.querySelector('.collection-band').offsetTop)));
  await p.waitForTimeout(400);
  await p.screenshot({ path: '../shots/revk-band.jpg', type: 'jpeg', quality: 80 });
  const duo = p.locator('.scene-duo');
  await duo.scrollIntoViewIfNeeded();
  await duo.screenshot({ path: '../shots/revk-duo.jpg', type: 'jpeg', quality: 80 });
  await p.locator('.scene-duo .scene').first().hover(); await p.waitForTimeout(1200);
  await duo.screenshot({ path: '../shots/revk-duo-hover.jpg', type: 'jpeg', quality: 80 });
  console.log('ok', JSON.stringify(band));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
