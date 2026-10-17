// Reference board captures: homepage (scrolled, full) + first product page per site. Read-only browsing.
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright-core');
const out = path.resolve(__dirname, '../referans');
fs.mkdirSync(out, { recursive: true });
const sites = JSON.parse(fs.readFileSync(path.join(__dirname, 'ref-sites.json'), 'utf8'));
const reject = /^(reject|decline|refuse|deny|reject all|decline all|only necessary|necessary only|essential only|tümünü reddet|reddet)$/i;

async function dismiss(page) {
  for (const b of await page.$$('button, a[role=button]')) {
    const t = ((await b.textContent()) || '').trim();
    if (reject.test(t)) { try { await b.click({ timeout: 1500 }); await page.waitForTimeout(500); return; } catch {} }
  }
}
async function settle(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < Math.min(h, 9000); y += 700) { await page.evaluate(v => scrollTo(0, v), y); await page.waitForTimeout(250); }
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(800);
}
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const log = [];
  for (const s of sites) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
    const page = await ctx.newPage();
    try {
      await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(5000); await dismiss(page); await settle(page);
      const h = Math.min(await page.evaluate(() => document.documentElement.scrollHeight), 7200);
      await page.screenshot({ path: path.join(out, `${s.id}-home.jpg`), type: 'jpeg', quality: 70, clip: { x: 0, y: 0, width: 1440, height: h }, fullPage: true });
      let product = s.product;
      if (!product) product = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.href).find(h => /\/(products?|shop\/[^/]+\/[^/]+|catalog\/[^/]+\/[^/]+|p)\/[^/?#]+/.test(h) && h.startsWith(location.origin)));
      if (product) {
        await page.goto(product, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(4000); await dismiss(page); await settle(page);
        const ph = Math.min(await page.evaluate(() => document.documentElement.scrollHeight), 3600);
        await page.screenshot({ path: path.join(out, `${s.id}-product.jpg`), type: 'jpeg', quality: 70, clip: { x: 0, y: 0, width: 1440, height: ph }, fullPage: true });
      }
      log.push({ id: s.id, ok: true, homeHeight: h, product: product || null });
    } catch (e) { log.push({ id: s.id, ok: false, error: e.message.slice(0, 120) }); }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(out, 'log.json'), JSON.stringify(log, null, 1));
  console.log(JSON.stringify(log, null, 1));
})();
