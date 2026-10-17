// Interaction flows checked in a real browser.
// revS2 (17 Oct): bilingual site with the bag kept (localStorage). Flows: bag drawer motion, checkout errors,
// language switch keeps the page, image zoom.
const path = require('node:path');
module.exports = async (browser, url, out, report) => {
  const flows = report.flows = {};
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', e => report.errors.push(`flow pageerror ${e.message}`));

  // 1. Bag drawer should slide in from the right, not pop.
  await page.goto(url('peak/'));
  await page.evaluate(() => localStorage.removeItem('quet-bag-v1'));
  await page.reload();
  // revT: sample in-page on the next frames after the click. A fixed 60 ms wait measured from Node was
  // flaky under CPU load: the .28 s ease-out curve is ~95% done by then, so a real slide could read as a pop.
  const mid = await page.evaluate(() => new Promise(resolve => {
    document.querySelector('[data-add-to-cart]').click();
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(document.getElementById('cart-dialog').getBoundingClientRect().left)));
  }));
  await page.waitForTimeout(600);
  const end = await page.$eval('#cart-dialog', d => d.getBoundingClientRect().left);
  flows.drawer = { leftAtFrame2: Math.round(mid), leftAt600ms: Math.round(end), slides: mid > end + 20 };
  await page.screenshot({ path: path.join(out, 'flow-drawer.png') });
  await page.click('#cart-dialog .icon-close');
  await page.waitForTimeout(500);

  // 2. Checkout (bag kept in storage from step 1): empty submit shows persistent linked errors.
  await page.goto(url('checkout/'));
  await page.click('#checkout-form button[type=submit]');
  await page.waitForTimeout(400);
  flows.checkout = await page.evaluate(() => ({
    invalid: document.querySelectorAll('[aria-invalid=true]').length,
    errors: document.querySelectorAll('.field-error').length,
    focused: document.activeElement?.name || null,
    status: document.getElementById('site-status').textContent,
  }));
  flows.checkout.ok = flows.checkout.invalid > 0 && flows.checkout.errors === flows.checkout.invalid && flows.checkout.focused === 'email';
  await page.screenshot({ path: path.join(out, 'flow-checkout-errors.png'), fullPage: true });

  // 3. Language switch: EN product page -> same product in Turkish, and back; the bag survives the switch.
  await page.goto(url('peak/'));
  await page.click('.site-header .lang-switch');
  await page.waitForLoadState('load');
  const tr = await page.evaluate(() => ({ path: location.pathname, lang: document.documentElement.lang, bag: document.querySelector('[data-cart-count]').textContent }));
  await page.click('.site-header .lang-switch');
  await page.waitForLoadState('load');
  const en = await page.evaluate(() => ({ path: location.pathname, lang: document.documentElement.lang }));
  flows.lang = { tr, en, ok: tr.path === '/tr/peak/' && tr.lang === 'tr' && tr.bag === '1' && en.path === '/peak/' && en.lang === 'en' };

  // 4. Image zoom opens the clicked frame and closes again.
  await page.click('.product-frame-item:nth-child(2) [data-zoom]');
  await page.waitForTimeout(300);
  const open = await page.evaluate(() => document.getElementById('image-dialog').open && document.getElementById('zoom-image').src.split('?')[0].endsWith('peak-still.webp'));
  await page.click('#image-dialog .icon-close');
  await page.waitForTimeout(300);
  const closed = await page.evaluate(() => !document.getElementById('image-dialog').open);
  flows.zoom = { open, closed, ok: open && closed };
  await ctx.close();
};
