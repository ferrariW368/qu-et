// External a11y opinion: axe-core WCAG 2.2 A/AA in real Chrome. Fails on critical/serious.
const { chromium } = require('playwright-core');
const axeSource = require('fs').readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const base = process.env.QUET_BASE || 'http://127.0.0.1:8766/';
const pages = ['', 'collection/', 'about/', 'peak/', 'mid-levels/', 'bag/', 'checkout/', 'tr/', 'tr/koleksiyon/', 'tr/hakkimizda/', 'tr/peak/', 'tr/mid-levels/', 'tr/sepet/', 'tr/siparis/', '404.html'];
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const out = []; let blocking = 0;
  for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const ctx = await browser.newContext({ viewport: vp, reducedMotion: 'reduce', bypassCSP: true }); // CSP correctly blocks injected axe; bypass for the audit only
    await ctx.addInitScript(() => { try { localStorage.setItem('quet-bag-v1', JSON.stringify({ items: { peak: 1 }, at: 1 })); } catch {} });
    for (const p of pages) {
      const page = await ctx.newPage();
      await page.goto(base + p, { waitUntil: 'load' });
      await page.waitForTimeout(800);
      await page.addScriptTag({ content: axeSource });
      const res = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }));
      for (const v of res.violations) {
        if (['critical', 'serious'].includes(v.impact)) blocking++;
        out.push(`${vp.width} ${p.split('?')[0]} [${v.impact}] ${v.id}: ${v.help} -> ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`);
      }
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  console.log(out.length ? out.join('\n') : 'axe: 0 violations');
  console.log(`blocking (critical/serious): ${blocking}`);
  process.exit(blocking ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
