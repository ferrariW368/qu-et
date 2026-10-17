// Sector research: follow each reference brand's About/Story link and capture the first two screens.
const { chromium } = require('playwright-core');
const sites = {
  sophiebuhai: 'https://www.sophiebuhai.com/',
  charlottechesnais: 'https://charlottechesnais.fr/',
  tomwood: 'https://www.tomwoodproject.com/',
  kinn: 'https://kinnstudio.com/',
  completedworks: 'https://www.completedworks.com/',
  ore: 'https://ore.co/',
  sarahsebastian: 'https://www.sarahandsebastian.com/en-us',
  coutumes: 'https://www.coutumes.com',
};
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const log = {};
  for (const [id, url] of Object.entries(sites)) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      await p.goto(url, { timeout: 30000, waitUntil: 'domcontentloaded' });
      await p.waitForTimeout(2500);
      const href = await p.evaluate(() => {
        const a = [...document.querySelectorAll('a[href]')].find(a => /about|story|maison|our-world|who-we|designer|atelier|hakk/i.test(a.getAttribute('href') + ' ' + a.textContent));
        return a ? a.href : null;
      });
      log[id] = { href };
      if (!href) { await p.close(); continue; }
      await p.goto(href, { timeout: 30000, waitUntil: 'domcontentloaded' });
      await p.waitForTimeout(3000);
      await p.keyboard.press('Escape').catch(() => {});
      await p.screenshot({ path: `../referans/about-${id}.jpg`, type: 'jpeg', quality: 70, fullPage: true });
      log[id].text = (await p.evaluate(() => document.querySelector('main')?.innerText || document.body.innerText)).replace(/\s+/g, ' ').slice(0, 900);
    } catch (e) { log[id] = { error: String(e).slice(0, 160) }; }
    await p.close();
  }
  require('fs').writeFileSync('../referans/about-log.json', JSON.stringify(log, null, 1));
  console.log('ok'); await b.close();
})();
