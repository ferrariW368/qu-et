// Full-page 1440px captures of every main page for the second jury round.
const { chromium } = require('playwright-core');
const pages = ['qu-et-home-masaustu', 'koleksiyon', 'peak', 'mid-levels', 'hakkimizda', 'sepet'];
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  for (const name of pages) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(`http://127.0.0.1:8766/${name}.html`);
    for (let y = 0; y < 8000; y += 600) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(100); }
    await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 15000 });
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(name.startsWith('qu-et') ? 4000 : 600);
    await p.screenshot({ path: `../shots/juri2-${name}.jpg`, type: 'jpeg', quality: 72, fullPage: true });
    await p.close();
  }
  console.log('ok'); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
