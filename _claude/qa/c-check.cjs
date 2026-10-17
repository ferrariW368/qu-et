// C grubu doğrulaması (gerçek Chrome, CSP'li sunucu): logo dönüşü, fiyat etiketi (metal buton K2-B ile kaldırıldı).
const path = require('node:path');
const { chromium } = require('playwright-core');
const base = process.env.QUET_BASE || 'http://127.0.0.1:8766/';
const out = path.resolve(__dirname, '../shots');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const r = {};

  await page.goto(base);
  await page.waitForTimeout(1000);
  r.firstVisit = await page.evaluate(() => ({ seen: document.documentElement.classList.contains('intro-seen'), logo: getComputedStyle(document.querySelector('.site-header .logo')).opacity }));
  await page.reload();
  await page.waitForTimeout(300);
  r.returnVisit = await page.evaluate(() => ({ seen: document.documentElement.classList.contains('intro-seen'), logo: getComputedStyle(document.querySelector('.site-header .logo')).opacity, wordmark: getComputedStyle(document.querySelector('.hero-mark-animated')).opacity }));

  await page.goto(base + 'peak/');
  await page.locator('.price-block').screenshot({ path: path.join(out, 'c-price.png') });
  r.price = await page.evaluate(() => ({ label: getComputedStyle(document.querySelector('.price-label')).textTransform, size: getComputedStyle(document.querySelector('.sample-price')).fontSize }));
  r.errors = errors;
  console.log(JSON.stringify(r, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
