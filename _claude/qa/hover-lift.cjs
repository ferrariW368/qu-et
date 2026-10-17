const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://127.0.0.1:8766/qu-et-home-masaustu.html', { waitUntil: 'load' });
  await p.waitForTimeout(800);
  const r = await p.evaluate(() => [...document.querySelectorAll('.scene-tattoo')].map(i => ({ src: i.currentSrc.split('/').pop(), ok: i.complete && i.naturalWidth > 0 })));
  const m = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }).then(c => c.newPage());
  await m.goto('http://127.0.0.1:8766/peak.html', { waitUntil: 'load' });
  const t = await m.evaluate(() => [...document.querySelectorAll('.site-header nav a, .footer-links a, .text-link')].filter(a => a.offsetParent).map(a => { const s = getComputedStyle(a, '::before'); const r = a.getBoundingClientRect(); return Math.round(r.height + (parseFloat(s.top) < 0 ? -parseFloat(s.top) - parseFloat(s.bottom) : 0)); }));
  const open = await m.evaluate(() => document.querySelector('.product-details details').open);
  console.log(JSON.stringify({ desktopTattoo: r, mobileHitHeights: t, malzemeOpen: open }));
  await b.close();
})();
