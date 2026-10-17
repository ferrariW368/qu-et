// Mock four CTA treatments on the real Hong Kong band (CSS injected only in this capture; site files untouched).
const { chromium } = require('playwright-core');
const variants = {
  'cta-A-simdi': '',
  'cta-B-cizgi': `.collection-band .cta{background:none!important;box-shadow:none!important;border-radius:0!important;min-height:0!important;padding:0 0 8px!important;border-bottom:1px solid #e9e5df!important}
    .collection-band .cta::before,.collection-band .liquid-metal-surface{display:none!important}.collection-band .liquid-metal-label{text-shadow:none!important}`,
  'cta-C-krom-cerceve': `.collection-band .liquid-metal-surface{display:none!important}
    .collection-band .cta{background:linear-gradient(135deg,#f4f4f2,#7d8186 30%,#e6e7e8 52%,#6f7378 74%,#d7d9db)!important;box-shadow:none!important;border-radius:0!important}
    .collection-band .cta::before{inset:1px!important;border-radius:0!important;background:#141413!important;box-shadow:none!important}`,
  'cta-D-hep-akan': 'MOVE',
};
(async () => {
  const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [name, css] of Object.entries(variants)) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 }, bypassCSP: true });
    await p.goto('http://127.0.0.1:8766/qu-et-home-masaustu.html');
    const band = p.locator('.collection-band'); await band.scrollIntoViewIfNeeded();
    if (css && css !== 'MOVE') await p.addStyleTag({ content: css });
    if (css === 'MOVE') { await p.locator('.liquid-metal-button').hover(); }
    await p.waitForTimeout(2500);
    const box = await p.locator('.collection-band .copy').boundingBox();
    await p.screenshot({ path: `../shots/${name}.jpg`, type: 'jpeg', quality: 82, clip: { x: 0, y: box.y - 120, width: 760, height: box.height + 240 } });
    await p.close();
  }
  console.log('ok'); await b.close();
})();
