// revR: mobile home on throttled 4G — when do the product scene photos finish, and how many image bytes load.
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
  let bytes = 0; const got = [];
  p.on('response', async r => { if (r.request().resourceType() === 'image') { try { const n = (await r.body()).length; bytes += n; got.push(r.url().split('/').pop() + ' ' + Math.round(n / 1024) + 'KB'); } catch {} } });
  const t0 = Date.now();
  await p.goto('http://127.0.0.1:8766/qu-et-home-masaustu.html', { waitUntil: 'load' });
  const tLoad = Date.now() - t0;
  // user scrolls to the product pair right after load
  await p.evaluate(() => document.querySelector('.scene-duo').scrollIntoView());
  const tScroll = Date.now() - t0;
  await p.waitForFunction(() => [...document.querySelectorAll('.scene-silver')].every(i => i.complete && i.naturalWidth), null, { timeout: 60000 });
  const tScene = Date.now() - t0;
  await p.waitForTimeout(1500);
  console.log(JSON.stringify({ loadMs: tLoad, scrolledAtMs: tScroll, scenesReadyMs: tScene, waitAfterScrollMs: tScene - tScroll, imageKB: Math.round(bytes / 1024), images: got }, null, 1));
  await b.close();
})();
