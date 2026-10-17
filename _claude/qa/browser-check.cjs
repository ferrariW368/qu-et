// Real-browser QA for qu/et (system Chrome via playwright-core). Read-only on site files.
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright-core');
const site = path.resolve(__dirname, '../../Site');
const out = path.resolve(__dirname, '../shots');
fs.mkdirSync(out, { recursive: true });
// revS: absolute asset paths need a server (check-all.ps1 starts serve-with-headers.py); file:// no longer works.
const url = f => (process.env.QUET_BASE || 'http://127.0.0.1:8766/') + f;
const pages = ['', 'collection/', 'about/', 'peak/', 'mid-levels/', 'bag/', 'checkout/', 'tr/', 'tr/koleksiyon/', 'tr/hakkimizda/', 'tr/peak/', 'tr/mid-levels/', 'tr/sepet/', 'tr/siparis/', '404.html'];
const viewports = { desk: { width: 1440, height: 900 }, mob: { width: 390, height: 844 } };
const report = { errors: [], small: [], overflow: [], metrics: {} };

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const [vp, size] of Object.entries(viewports)) {
    const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
    await ctx.addInitScript(() => { try { if (!localStorage.getItem('quet-bag-v1')) localStorage.setItem('quet-bag-v1', JSON.stringify({ items: { peak: 1 }, at: 1 })); } catch {} });
    for (const file of pages) {
      const page = await ctx.newPage();
      page.on('pageerror', e => report.errors.push(`${vp} ${file} pageerror ${e.message}`));
      page.on('console', m => { if (m.type() === 'error') report.errors.push(`${vp} ${file} console ${m.text()}`); });
      await page.goto(url(file), { waitUntil: 'load' });
      await page.waitForTimeout(file === '' || file === 'tr/' ? 9000 : 600);
      const data = await page.evaluate(() => {
        const small = [];
        for (const el of document.querySelectorAll('a,button,input,select,summary')) {
          const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
          if (!r.width || cs.visibility === 'hidden' || el.closest('[hidden],dialog:not([open])')) continue;
          if (r.width < 24 || r.height < 24) small.push(`${el.tagName.toLowerCase()}.${el.className || ''} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
        }
        const overflow = document.documentElement.scrollWidth > innerWidth ? document.documentElement.scrollWidth : 0;
        const nav = performance.getEntriesByType('navigation')[0];
        return { small, overflow, h: document.documentElement.scrollHeight, load: Math.round(nav?.loadEventEnd || 0) };
      });
      data.small.forEach(s => report.small.push(`${vp} ${file} ${s}`));
      if (data.overflow) report.overflow.push(`${vp} ${file} scrollWidth=${data.overflow}`);
      report.metrics[`${vp} ${file}`] = { height: data.h, load: data.load };
      await page.screenshot({ path: path.join(out, `${vp}-${(file.replace('.html', '').replace(/\//g, '-') || 'home').replace(/-$/, '') || 'home'}.png`), fullPage: true });
      await page.close();
    }
    await ctx.close();
  }
  await require('./browser-flows.cjs')(browser, url, out, report);
  await browser.close();
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ errors: report.errors, small: report.small, overflow: report.overflow, flows: report.flows }, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
