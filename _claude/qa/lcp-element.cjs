// Which element is the LCP on a page (mobile, Slow 4G, 4x CPU). 3 runs.
const { chromium } = require('playwright-core');
const file = process.argv[2] || 'qu-et-home-masaustu.html';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  for (let i = 0; i < 3; i++) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript(() => { window.__l = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__l.push([Math.round(e.startTime), e.element ? e.element.tagName + '.' + (e.element.getAttribute('class') || '') : '?', (e.url || '').split('/').pop(), e.size]); }).observe({ type: 'largest-contentful-paint', buffered: true }); });
    await page.goto('http://127.0.0.1:8765/' + file, { waitUntil: 'load', timeout: 120000 });
    await page.waitForTimeout(1500);
    console.log(JSON.stringify(await page.evaluate(() => window.__l)));
    await ctx.close();
  }
  await browser.close();
})();
