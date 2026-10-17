// LCP / CLS / transfer per page over local HTTP with mobile 4G throttling. 3 runs, median.
const { chromium } = require('playwright-core');
const base = process.env.QUET_BASE || 'http://127.0.0.1:8765/';
const pages = ['', 'collection/', 'peak/', 'bag/', 'tr/'];
const runs = 3;
const median = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const result = {};
  for (const file of pages) {
    const lcp = [], cls = [], bytes = [];
    let top = [];
    for (let i = 0; i < runs; i++) {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
      const page = await ctx.newPage();
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await page.addInitScript(() => {
        window.__lcp = 0; window.__cls = 0;
        new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto(base + file, { waitUntil: 'load', timeout: 120000 });
      await page.waitForTimeout(1500);
      const m = await page.evaluate(() => ({ lcp: window.__lcp, cls: window.__cls, res: performance.getEntriesByType('resource').map(r => [r.name.split('/').pop(), r.transferSize]) }));
      lcp.push(m.lcp); cls.push(m.cls); bytes.push(m.res.reduce((s, r) => s + r[1], 0));
      top = m.res.sort((a, b) => b[1] - a[1]).slice(0, 6).map(([n, s]) => `${n} ${Math.round(s / 1024)}KB`);
      await ctx.close();
    }
    result[file || 'home'] = { lcp_ms: Math.round(median(lcp)), cls: +median(cls).toFixed(3), kb: Math.round(median(bytes) / 1024), top };
  }
  await browser.close();
  console.log(JSON.stringify(result, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
