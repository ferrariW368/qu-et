// DOM behavior checks; this does not drive a browser or claim visual rendering QA.
// revS (17 Oct): bilingual directory build (EN at /, TR at /tr/). Every group runs on both languages.
// revS2 (17 Oct): the bag and checkout flow are back (Eren); the bag lives in localStorage only, so the old
// file:// URL/tab transport groups are retired with that mechanism. Payment step = Shopier, closed until wired.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const qaModules = process.env.QUET_QA_MODULES;
if (!qaModules) throw new Error('Set QUET_QA_MODULES to a directory containing jsdom and css-tree.');
const { JSDOM, VirtualConsole } = require(path.join(qaModules, 'jsdom'));
const cssTree = require(path.join(qaModules, 'css-tree'));
const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'assets/site.js'), 'utf8');
const comparisonScript = fs.readFileSync(path.join(root, 'assets/comparison.js'), 'utf8');
const ROUTES = {
  en: { home: '/', collection: '/collection/', about: '/about/', peak: '/peak/', 'mid-levels': '/mid-levels/', bag: '/bag/', checkout: '/checkout/', privacy: '/privacy/' },
  tr: { home: '/tr/', collection: '/tr/koleksiyon/', about: '/tr/hakkimizda/', peak: '/tr/peak/', 'mid-levels': '/tr/mid-levels/', bag: '/tr/sepet/', checkout: '/tr/siparis/', privacy: '/tr/kvkk/' },
};
const fileOf = route => path.join(root, decodeURIComponent(route), route.endsWith('/') ? 'index.html' : '');
const pages = [];
for (const lang of Object.keys(ROUTES)) for (const [key, route] of Object.entries(ROUTES[lang])) pages.push({ lang, key, route, file: fileOf(route) });
const extra = [{ lang: 'en', key: '404', route: '/404.html', file: path.join(root, '404.html') }, { lang: 'tr', key: '404', route: '/tr/404.html', file: path.join(root, 'tr/404.html') }, { lang: 'tr', key: 'review', route: '/hero-karsilastirma.html', file: path.join(root, 'hero-karsilastirma.html') }];
const passed = [];
const errors = [];
function done(label) { passed.push(label); console.log('PASS', label); }
function makePage(route, bag) {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(String(error)));
  const file = route.endsWith('.html') ? path.join(root, route) : fileOf(route);
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { url: 'https://quet.test' + route, runScripts: 'outside-only', virtualConsole });
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  dom.window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  if (bag !== undefined) dom.window.localStorage.setItem('quet-bag-v1', typeof bag === 'string' ? bag : JSON.stringify(bag));
  dom.window.eval(script);
  dom.window.eval(comparisonScript);
  return dom;
}
function click(dom, selector) {
  const node = dom.window.document.querySelector(selector);
  assert.ok(node, selector);
  node.click();
  return node;
}
function documentOf(dom) { return dom.window.document; }
// Absolute site paths resolve against the Site folder; directory routes resolve to their index.html.
function localTarget(ref) {
  const clean = decodeURIComponent(ref.split('#')[0].split('?')[0]);
  const target = path.join(root, clean);
  return clean.endsWith('/') ? path.join(target, 'index.html') : target;
}
const allowedRemote = ['https://www.instagram.com/pinar.ink/'];
const isShopier = ref => ref.startsWith('https://www.shopier.com/');

for (const { route, file } of [...pages, ...extra]) {
  assert.ok(fs.existsSync(file), 'built ' + route);
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'));
  const doc = documentOf(dom);
  assert.equal(doc.querySelectorAll('h1').length, 1, route + ' h1');
  assert.ok(doc.title.includes('qu/et'));
  const ids = Array.from(doc.querySelectorAll('[id]'), node => node.id);
  assert.equal(ids.length, new Set(ids).size, route + ' duplicate IDs');
  assert.ok(!doc.querySelector('x-dc'));
  for (const node of doc.querySelectorAll('[href], [src]')) {
    const ref = node.getAttribute('href') ?? node.getAttribute('src');
    if (!ref) continue;
    assert.notEqual(ref, '#', route + ' dead link');
    // Only the deliberate outbound links (K4: Instagram; SİTE 04: Shopier) may be remote, and only as <a> with rel=noopener.
    if (ref === 'mailto:pnar.akdemiir@gmail.com') continue; // K4: the one contact address
    if (allowedRemote.includes(ref) || isShopier(ref)) { assert.ok(node.tagName === 'A' && /noopener/.test(node.getAttribute('rel') || ''), route + ' outbound link without noopener'); continue; }
    assert.ok(!/^https?:/.test(ref), route + ' unintended remote asset/link');
    if (ref.startsWith('#')) { assert.ok(ids.includes(ref.slice(1)), route + ' anchor ' + ref); continue; }
    assert.ok(ref.startsWith('/'), route + ' relative path breaks at /tr/ depth: ' + ref);
    const target = localTarget(ref);
    assert.ok(fs.existsSync(target), route + ' missing ' + target);
    const hash = ref.split('#')[1];
    if (hash && target.endsWith('.html')) {
      const linked = new JSDOM(fs.readFileSync(target, 'utf8'));
      assert.ok(linked.window.document.getElementById(hash), route + ' anchor target ' + ref);
      linked.window.close();
    }
  }
  // revAB guard: every srcset candidate exists; mobile (smallest) candidate <= 120 KB, any candidate <= 300 KB.
  for (const node of doc.querySelectorAll('[srcset], [data-srcset]')) {
    const sizes = (node.getAttribute('srcset') || node.dataset.srcset).split(',').map(part => {
      const ref = part.trim().split(/\s+/)[0];
      const target = localTarget(ref);
      assert.ok(fs.existsSync(target), route + ' missing srcset ' + ref);
      const size = fs.statSync(target).size;
      assert.ok(size <= 300 * 1024, route + ' over image budget ' + ref);
      return size;
    });
    assert.ok(sizes[0] <= 120 * 1024, route + ' mobile candidate over 120 KB');
  }
  // revT2: every local CSS/JS/image URL carries ?v=<hash> so a deploy reaches phones despite the 1-hour asset cache.
  for (const node of doc.querySelectorAll('link[href^="/assets/"], script[src^="/assets/"], img[src^="/assets/"]')) {
    assert.ok(/\?v=[0-9a-f]{8}$/.test(node.getAttribute('href') || node.getAttribute('src')), route + ' unversioned asset ' + (node.getAttribute('href') || node.getAttribute('src')));
  }
  dom.window.close();
}
done(`All ${pages.length + extra.length} pages: headings, IDs, absolute local assets, srcset budget, navigation and anchors`);

const css = fs.readFileSync(path.join(root, 'assets/site.css'), 'utf8');
const parseErrors = [];
const ast = cssTree.parse(css, { onParseError: error => parseErrors.push(error.message) });
assert.deepEqual(parseErrors, []);
cssTree.walk(ast, node => {
  if (node.type === 'Url') assert.ok(fs.existsSync(path.join(root, 'assets', node.value)), node.value);
  if (node.type === 'Url' && node.value.startsWith('fonts/')) assert.ok(node.value.endsWith('.woff2'), 'font budget: woff2 only ' + node.value);
});
done('CSS parses and all local font files exist');

// revS: every page exists in both languages, declares its language, lists both alternates and switches to its own counterpart.
for (const { lang, key, route, file } of pages) {
  const doc = new JSDOM(fs.readFileSync(file, 'utf8')).window.document;
  const other = lang === 'en' ? 'tr' : 'en';
  assert.equal(doc.documentElement.lang, lang, route + ' html lang');
  assert.equal(doc.querySelector(`link[rel=alternate][hreflang=${lang}]`)?.getAttribute('href'), route, route + ' self alternate');
  assert.equal(doc.querySelector(`link[rel=alternate][hreflang=${other}]`)?.getAttribute('href'), ROUTES[other][key], route + ' other alternate');
  assert.equal(doc.querySelector('link[rel=alternate][hreflang=x-default]')?.getAttribute('href'), ROUTES.en[key], route + ' x-default is English');
  const sw = doc.querySelector('.site-header .lang-switch');
  assert.equal(sw?.getAttribute('href'), ROUTES[other][key], route + ' switch goes to the same page');
  assert.equal(sw.getAttribute('lang'), other);
  assert.equal(doc.querySelector('.site-header .logo').getAttribute('href'), ROUTES[lang].home, route + ' logo stays in language');
  for (const a of doc.querySelectorAll('main a[href^="/"], .site-footer a[href^="/"]')) {
    const href = a.getAttribute('href').split('#')[0];
    assert.ok(lang === 'tr' ? href.startsWith('/tr/') : !href.startsWith('/tr/'), route + ' link leaves its language: ' + href);
  }
}
done('Language pairs: lang, hreflang alternates, same-page switch, links stay in language');

// revS2: one form only, on the checkout pages; its fields keep autofill purpose tokens (WCAG 1.3.5).
// revU: no payment button anywhere; the last step sends a pre-order request (tested below with a mocked fetch).
for (const { route, key, file } of [...pages, ...extra]) {
  const doc = new JSDOM(fs.readFileSync(file, 'utf8')).window.document;
  assert.equal(doc.querySelectorAll('form').length, key === 'checkout' ? 1 : 0, route + ' forms');
  if (key === 'checkout') {
    for (const input of doc.querySelectorAll('#checkout-form input')) assert.ok(input.autocomplete && input.autocomplete !== 'off', 'autocomplete ' + input.name);
    assert.equal(doc.querySelector('.payment-closed, a[href*="shopier"]'), null, 'no payment step before the tax certificate');
    assert.ok(doc.getElementById('send-preorder') && doc.getElementById('preorder-result').dataset.sent, 'request button and its result text');
  }
}
for (const file of ['404.html', 'tr/404.html']) assert.ok(fs.existsSync(path.join(root, file)), file);
done('Checkout: single local form, autofill tokens, request step instead of payment; 404 pages exist');

// revS2: the bag in both languages — product quantity, add, drawer, carried to the next page through storage, bag totals, removal.
const KEY = 'quet-bag-v1';
const REQUIRED = { en: 'Please fill in this field.', tr: 'Lütfen bu alanı doldur.' };
const SAMPLE = { en: 'Sample price', tr: 'Örnek fiyat' };
const cartPages = [];
for (const lang of ['en', 'tr']) {
  const r = ROUTES[lang];
  const peak = makePage(r.peak, { items: {}, at: 0 });
  let doc = documentOf(peak);
  assert.equal(doc.querySelector('[data-open-cart]').hidden, true, 'header bag hidden while empty');
  click(peak, '[data-product-quantity="1"]');
  assert.equal(doc.getElementById('product-quantity').value, '2');
  click(peak, '[data-add-to-cart]');
  assert.equal(doc.querySelector('[data-cart-count]').textContent, '2');
  assert.equal(doc.getElementById('cart-dialog').open, true);
  click(peak, '#cart-dialog [data-cart-change="1"]');
  assert.equal(doc.querySelector('[data-cart-count]').textContent, '3');
  assert.equal(doc.querySelector('.drawer-bottom a').getAttribute('href'), r.bag);
  assert.equal(doc.querySelector('#cart-dialog .bag-item-title').getAttribute('href'), r.peak, 'bag item links stay in language');
  const ring = makePage(r['mid-levels'], peak.window.localStorage.getItem(KEY));
  doc = documentOf(ring);
  assert.equal(doc.querySelector('[data-cart-count]').textContent, '3', 'bag carried to the next page');
  click(ring, '[data-add-to-cart]');
  assert.equal(doc.querySelector('[data-cart-count]').textContent, '4');
  const bag = makePage(r.bag, ring.window.localStorage.getItem(KEY));
  doc = documentOf(bag);
  assert.equal(doc.querySelectorAll('.bag-page-items .bag-item').length, 2);
  assert.equal(doc.querySelector('.bag-layout').hidden, false);
  assert.equal(doc.querySelector('[data-cart-total]').textContent, '€700');
  assert.ok(doc.querySelector('.bag-item-price').textContent.includes(SAMPLE[lang]));
  assert.equal(doc.querySelector('.summary-panel .primary-button').getAttribute('href'), r.checkout);
  click(bag, '.bag-page-items [data-remove-item="peak"]');
  click(bag, '.bag-page-items [data-remove-item="mid-levels"]');
  assert.equal(doc.querySelector('[data-cart-count]').textContent, '0');
  assert.equal(doc.querySelector('[data-cart-empty]').hidden, false);
  assert.equal(doc.querySelector('.bag-layout').hidden, true);
  assert.equal(doc.querySelector('[data-open-cart]').hidden, true);
  cartPages.push(peak, ring, bag);
}
done('Bag in both languages: quantity, add-to-bag, drawer, carried across pages, totals, removal back to empty');

for (const lang of ['en', 'tr']) {
  const r = ROUTES[lang];
  const hostile = makePage(r.bag, '{"items":{"constructor":9,"__proto__":3,"peak":-5,"mid-levels":999999},"at":999999999999999}');
  let doc = documentOf(hostile);
  assert.equal(doc.querySelector('[data-cart-count]').textContent, '50');
  assert.equal(doc.querySelectorAll('.bag-page-items .bag-item').length, 1);
  assert.ok(doc.querySelector('.bag-page-items').textContent.includes('Mid-Levels'));
  const broken = makePage(r.bag, '{not json');
  assert.equal(documentOf(broken).querySelector('[data-cart-empty]').hidden, false, 'corrupt storage = empty bag');

  const checkout = makePage(r.checkout, { items: { peak: 1 }, at: 1 });
  doc = documentOf(checkout);
  const form = doc.getElementById('checkout-form');
  assert.equal(form.querySelector('button[type="submit"]').disabled, false);
  form.dispatchEvent(new checkout.window.Event('submit', { bubbles: true, cancelable: true }));
  assert.equal(form.hidden, false, 'Invalid form must not progress');
  const email = form.elements.namedItem('email');
  assert.equal(email.getAttribute('aria-invalid'), 'true', 'Empty required field is marked invalid');
  assert.equal(doc.getElementById(email.getAttribute('aria-describedby')).textContent, REQUIRED[lang], 'error text in the page language');
  assert.equal(form.elements.namedItem('phone').getAttribute('aria-invalid'), null, 'Optional field stays valid');
  const values = { email: 'preview@example.com', firstName: '<img src=x onerror=alert(1)>', lastName: 'Örnek', country: 'Türkiye', address: 'Örnek adres 1', city: 'İstanbul', postal: '34000', phone: '' };
  for (const [key, value] of Object.entries(values)) {
    form.elements.namedItem(key).value = value;
    form.elements.namedItem(key).dispatchEvent(new checkout.window.Event('input', { bubbles: true }));
  }
  form.dispatchEvent(new checkout.window.Event('submit', { bubbles: true, cancelable: true }));
  assert.equal(form.hidden, true);
  assert.equal(form.querySelectorAll('[aria-invalid], .field-error').length, 0, 'Errors clear once fields are valid');
  assert.equal(doc.getElementById('checkout-review').hidden, false);
  assert.equal(doc.querySelector('#review-address img'), null, 'Customer text must not create HTML');
  assert.ok(doc.getElementById('review-address').textContent.includes(values.firstName));
  assert.ok(!checkout.window.location.href.includes('preview%40') && !checkout.window.location.href.includes('address'), 'no PII in the URL');
  assert.ok(!(checkout.window.localStorage.getItem(KEY) || '').includes('preview'), 'no PII in storage');
  click(checkout, '#edit-checkout');
  assert.equal(form.hidden, false);
  assert.equal(form.elements.namedItem('email').value, values.email);
  cartPages.push(hostile, broken, checkout);
}
done('Untrusted/corrupt bag data sanitized; checkout validation, review/edit, safe text, no PII kept (both languages)');

const COPY = {
  tr: { summaries: ['Malzeme', 'Ölçü', 'Ön sipariş ve teslim'], material: '925 ayar gümüş', limited: 'Sınırlı üretim', sample: 'Örnek fiyat', band: 'Koleksiyonu keşfet' },
  en: { summaries: ['Material', 'Size', 'Pre-order and delivery'], material: '925 sterling silver', limited: 'Limited edition', sample: 'Sample price', band: 'Explore the collection' },
};
const opened = [];
for (const lang of ['en', 'tr']) {
  const c = COPY[lang];
  const peak = makePage(ROUTES[lang].peak);
  const ring = makePage(ROUTES[lang]['mid-levels']);
  opened.push(peak, ring);
  let doc = documentOf(peak);
  const frames = doc.querySelectorAll('.product-frames .product-frame-item');
  assert.equal(frames.length, 3, 'A: three frames');
  assert.equal(doc.querySelectorAll('.product-frame-item figcaption').length, 0, 'A: frames carry no captions');
  assert.ok(frames[0].querySelector('img').src.split('?')[0].endsWith('peak-portrait.webp'));
  assert.ok(frames[1].querySelector('img').src.split('?')[0].endsWith('peak-still.webp'));
  assert.ok(frames[2].querySelector('img').src.split('?')[0].endsWith('peak-tattoo-portrait.webp'));
  assert.equal(frames[0].querySelector('img').getAttribute('fetchpriority'), 'high', 'first frame is the LCP image');
  assert.equal(doc.querySelector('.product-layout [data-comparison], .product-layout input[type=range], .gallery-thumbs'), null, 'A: no slider or thumbnail buttons');
  click(peak, '.product-frame-item:nth-child(2) [data-zoom]');
  assert.equal(doc.getElementById('image-dialog').open, true);
  assert.ok(doc.getElementById('zoom-image').src.split('?')[0].endsWith('peak-still.webp'), 'zoom shows the clicked frame');
  assert.ok(documentOf(ring).querySelectorAll('.product-frames .product-frame-item').length === 3);
  click(peak, '#image-dialog [data-close-dialog]');
  assert.equal(doc.getElementById('image-dialog').open, false);
  assert.ok(doc.querySelector('.related-photo img').src.split('?')[0].endsWith('mid-levels-still.webp'), 'related piece shown as its 4:5 still');
  assert.deepEqual(Array.from(doc.querySelectorAll('.product-details summary'), el => el.textContent), c.summaries);
  assert.ok(doc.querySelector('.product-details details p').textContent.includes(c.material), 'material stated by Eren (17 Oct)');
  assert.equal(doc.querySelector('.edition-note')?.textContent, c.limited);
  assert.equal(doc.querySelector('.product-description'), null);
  assert.equal(doc.querySelector('.price-block .price-label')?.textContent, c.sample, 'C: sample-price label sits above the figure');
  assert.ok(/^\d{2}:\d{2}$/.test(doc.querySelector('[data-clock]').textContent), 'clock renders');
}
done('Product page A in both languages: three frames, zoom per frame, details, edition note, sample-price label');

for (const lang of ['en', 'tr']) {
  const c = COPY[lang], r = ROUTES[lang];
  const home = makePage(r.home);
  opened.push(home);
  const doc = documentOf(home);
  // revD (1-B, 2-A): one scene per product, each with a registered silver/tattoo pair and no controls.
  const scenes = doc.querySelectorAll('.scene');
  assert.equal(scenes.length, 2);
  for (const s of scenes) {
    const silver = s.querySelector('.scene-silver'), tattoo = s.querySelector('.scene-tattoo');
    assert.ok(silver, 'scene silver image');
    assert.notEqual(silver.getAttribute('loading'), 'lazy', 'revR: visible scene photo loads eagerly');
    if (tattoo) {
      assert.ok(!tattoo.hasAttribute('src') && tattoo.dataset.src, 'revR: hover-only sketch layer is deferred');
      assert.ok(fs.existsSync(localTarget(tattoo.dataset.src)), 'revR: deferred sketch exists ' + tattoo.dataset.src);
      assert.equal(silver.getAttribute('width'), tattoo.getAttribute('width'), 'pair registered (width)');
      assert.equal(silver.getAttribute('height'), tattoo.getAttribute('height'), 'pair registered (height)');
      assert.ok(s.querySelector('.state-tattoo'), 'tattoo state text present with tattoo layer');
    } else {
      assert.ok(s.classList.contains('scene-static') && !s.querySelector('.state-tattoo'), 'no hover promise without a tattoo layer');
    }
    assert.equal(s.querySelector('[data-comparison], input[type=range]'), null, 'no controls on homepage scenes');
    assert.ok(s.querySelector('.scene-name').id && s.getAttribute('aria-labelledby') === s.querySelector('.scene-name').id);
    assert.ok(Object.values(r).includes(s.querySelector('.scene-copy .text-link').getAttribute('href')), 'scene links to its product page');
  }
  assert.equal(doc.querySelector('.story'), null, 'revQ: the story sentence is gone');
  assert.ok(doc.querySelector('.sketch-strip img').src.split('?')[0].endsWith('hk-strip.webp'), 'revQ: closing shows the real flash-sheet row');
  assert.equal(doc.querySelector('.sketch-strip .text-link').getAttribute('href'), r.about);
  assert.equal(doc.querySelector('.footer-wordmark').getAttribute('aria-hidden'), 'true', '5-A wordmark is decorative');
  assert.equal(doc.querySelector('textPath'), null);
  assert.equal(doc.querySelector('.hero-paint'), null);
  assert.ok(doc.querySelector('.hero-mark-c .hero-sunlight').getAttribute('mask').includes('sun-area-home'));
  assert.equal(doc.querySelector('.collection-band .eyebrow'), null);
  assert.equal(doc.querySelector('.collection-band .band-link').getAttribute('href'), r.collection);
  assert.ok(doc.querySelector('.collection-band .band-link').textContent.includes(c.band));
  assert.equal(doc.querySelector('script[src*="liquid-metal"]'), null, 'K2-B: no shader on the homepage');
  assert.equal(doc.querySelectorAll('.scene-duo > .scene-pair').length, 2, 'K3-B: Peak and Mid-Levels as an editorial pair');
  assert.ok(!doc.body.textContent.includes('Önce tende.'));
  assert.equal(home.window.document.documentElement.style.getPropertyValue('--hero-fade'), '1.000', 'revT: wordmark fully visible at the top, fades with scroll');
}
done('Home in both languages: silver wordmark fading with scroll, fixed sunlight mask, product scenes, text link and editorial pair');

for (const lang of ['en', 'tr']) {
  const collection = makePage(ROUTES[lang].collection);
  opened.push(collection);
  const doc = documentOf(collection);
  const cards = doc.querySelectorAll('.collection-grid .collection-card');
  assert.equal(cards.length, 2, 'Collection A: two cards');
  assert.ok(cards[0].querySelector('.card-still').src.split('?')[0].endsWith('peak-still.webp'), 'piece alone first');
  assert.ok(cards[1].querySelector('.card-still').src.split('?')[0].endsWith('mid-levels-still.webp'));
  assert.ok(cards[0].querySelector('.card-worn').dataset.src.split('?')[0].endsWith('peak-portrait.webp') && !cards[0].querySelector('.card-worn').hasAttribute('src'), 'revR: worn view under it, deferred until hover is possible');
  assert.equal(cards[0].querySelector('.card-worn').getAttribute('alt'), '', 'worn layer is decorative');
  assert.equal(doc.querySelector('[data-comparison], input[type=range]'), null, 'Collection A: no slider');
  assert.equal(doc.querySelector('.collection-head h1').textContent, 'Hong Kong');
  assert.equal(doc.querySelector('.collection-head p').textContent, COPY[lang].limited);
}
const preview = makePage('/hero-karsilastirma.html');
opened.push(preview);
let doc = documentOf(preview);
click(preview, '[data-hero-variant="b"]');
assert.ok(doc.querySelector('.hero-mark-b'));
click(preview, '[data-hero-replay]');
assert.ok(doc.querySelector('.hero-preview.is-playing'));
click(preview, '[data-hero-variant="c"]');
assert.ok(doc.querySelector('.hero-mark-c'));
assert.equal(doc.querySelector('.hero-preview.is-playing'), null);
done('Collection A cards in both languages and hero B/C comparison with replay');

// revU: sending the request posts only bag + typed details to /api/preorder; success empties the stored bag, failure keeps it.
(async () => {
  for (const [lang, ok] of [['en', true], ['tr', false]]) {
    const page = makePage(ROUTES[lang].checkout, { items: { peak: 2 }, at: 1 });
    const doc = documentOf(page), form = doc.getElementById('checkout-form');
    const calls = [];
    page.window.fetch = async (url, init) => { calls.push({ url, init }); return { ok, json: async () => ({ ok }) }; };
    const values = { email: 'a@b.co', firstName: 'A', lastName: 'B', country: 'HK', address: 'X 1', city: 'Hong Kong', postal: '000', phone: '' };
    for (const [k, v] of Object.entries(values)) form.elements.namedItem(k).value = v;
    form.dispatchEvent(new page.window.Event('submit', { bubbles: true, cancelable: true }));
    click(page, '#send-preorder');
    await new Promise(r => setTimeout(r, 20));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, '/api/preorder');
    const sent = JSON.parse(calls[0].init.body);
    assert.deepEqual(sent.items, { peak: 2 });
    assert.equal(sent.lang, lang);
    assert.equal(sent.email, 'a@b.co');
    const result = doc.getElementById('preorder-result');
    assert.equal(result.hidden, false);
    assert.equal(result.textContent, ok ? result.dataset.sent : result.dataset.error);
    const stored = JSON.parse(page.window.localStorage.getItem(KEY));
    assert.deepEqual(stored.items, ok ? {} : { peak: 2 }, ok ? 'success empties the bag' : 'failure keeps the bag');
    assert.equal(doc.getElementById('send-preorder').disabled, !ok ? false : true);
    page.window.close();
  }
  done('Pre-order request: posts bag + details once, success message and empty bag, error keeps the bag (both languages)');
for (const dom of [...opened, ...cartPages]) dom.window.close();
assert.deepEqual(errors, []);
const report = { checkedAt: new Date().toISOString(), groups: passed, jsdomErrors: errors, browserVisualVerification: false, paymentEnabled: false };
fs.mkdirSync(path.join(root, 'review'), { recursive: true });
fs.writeFileSync(path.join(root, 'review/check-results.json'), JSON.stringify(report, null, 2));
console.log(`Completed ${passed.length} groups. Browser rendering and live payment are not covered.`);
})().catch(error => { console.error(error); process.exit(1); });
