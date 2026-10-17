// Every visible text string per page (desktop 1440), for the copy-reduction audit.
const { chromium } = require('playwright-core');
const fs = require('fs');
const pages = ['qu-et-home-masaustu', 'koleksiyon', 'peak', 'mid-levels', 'hakkimizda', 'sepet', 'siparis'];
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  let out = '';
  for (const name of pages) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(`http://127.0.0.1:8766/${name}.html?bag=peak:1&bagAt=${Date.now()}`);
    await p.waitForTimeout(800);
    const items = await p.evaluate(() => {
      const res = []; const seen = new Set();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const n = walker.currentNode; const t = n.textContent.replace(/\s+/g, ' ').trim();
        if (!t) continue; const el = n.parentElement; if (!el) continue;
        if (el.closest('dialog:not([open]), [hidden], .sr-only, script, style, svg, header, footer.site-footer')) continue;
        const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
        const key = el.tagName + '|' + t; if (seen.has(key)) continue; seen.add(key);
        res.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}: ${t}`);
      }
      return res;
    });
    out += `\n## ${name}.html\n` + items.map(s => '- ' + s).join('\n') + '\n';
    await p.close();
  }
  out += '\n## Ortak (header + footer)\n- Koleksiyon / Hakkında / Sepet · footer: Koleksiyon, Hakkında, Stüdyo, Instagram, E-posta, İstanbul/Hong Kong saatleri, © 2026\n';
  fs.writeFileSync('../metin-envanteri.md', out);
  console.log(out.length);
  await b.close();
})();
