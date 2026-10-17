// 21st.dev component previews: one viewport screenshot each (preview renders in the page).
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright-core');
const out = path.resolve(__dirname, '../referans');
fs.mkdirSync(out, { recursive: true });
const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'ref-21st.json'), 'utf8'));
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const log = [];
  for (const c of list) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    try {
      await page.goto(c.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(9000);
      await page.screenshot({ path: path.join(out, `${c.id}.jpg`), type: 'jpeg', quality: 70 });
      log.push({ id: c.id, ok: true });
    } catch (e) { log.push({ id: c.id, ok: false, error: e.message.slice(0, 100) }); }
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(log));
})();
