// Mobile pass: full-page 390x844 (iPhone 14) captures of every page, touch emulation on.
const { chromium } = require('playwright-core');
const pages = ['qu-et-home-masaustu', 'koleksiyon', 'peak', 'mid-levels', 'hakkimizda', 'sepet', 'siparis'];
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  for (const name of pages) {
    const p = await ctx.newPage();
    await p.goto(`http://127.0.0.1:8766/${name}.html`);
    for (let y = 0; y < 12000; y += 700) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(80); }
    await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 15000 }).catch(() => {});
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(name.startsWith('qu-et') ? 4500 : 600);
    const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    await p.screenshot({ path: `../shots/mob-${name}.jpg`, type: 'jpeg', quality: 60, fullPage: true, scale: 'css' });
    console.log(name, 'overflowX', over);
    await p.close();
  }
  await b.close();
})();
