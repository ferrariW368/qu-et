// revS2 (17 Oct): bilingual (EN at /, TR at /tr/). The bag lives in localStorage only: the site is served over
// HTTP now (absolute paths), so the old file:// URL/tab transport was retired. Payment will be Shopier (SİTE 04);
// the checkout keeps its last step closed until that is wired.
(() => {
  'use strict';

  const tr = document.documentElement.lang === 'tr';
  const base = tr ? '/tr/' : '/';
  const L = tr ? {
    locale: 'tr-TR', bag: '/tr/sepet/', earring: 'Küpe', ring: 'Yüzük',
    each: price => `€${price} / adet · Örnek fiyat`, qty: n => `Adet: ${n}`, qtyGroup: name => `${name} adedi`,
    dec: name => `${name} adedini azalt`, inc: name => `${name} adedini artır`, qtyLabel: 'Adet', remove: 'Kaldır',
    bagAria: n => `Sepet, ${n} parça`, empty: 'Sepetin henüz boş.', emptySub: 'Hong Kong koleksiyonunu keşfet.', back: 'Koleksiyona dön',
    added: (name, n) => `${name} sepete eklendi. Sepetinde ${n} parça var.`, changed: (name, n) => `${name}: ${n} adet.`, removed: name => `${name} sepetten çıkarıldı.`,
    required: 'Lütfen bu alanı doldur.', email: 'Geçerli bir e-posta adresi yaz.', addFirst: 'Önce sepetine bir tasarım ekle.',
    invalid: n => `${n} alan eksik veya hatalı.`, review: 'Bilgilerin kontrol için gösteriliyor. Henüz sipariş oluşturulmadı.',
  } : {
    locale: 'en-GB', bag: '/bag/', earring: 'Earring', ring: 'Ring',
    each: price => `€${price} each · Sample price`, qty: n => `Quantity: ${n}`, qtyGroup: name => `${name} quantity`,
    dec: name => `Decrease ${name}`, inc: name => `Increase ${name}`, qtyLabel: 'Quantity', remove: 'Remove',
    bagAria: n => `Bag, ${n} ${n === 1 ? 'piece' : 'pieces'}`, empty: 'Your bag is empty.', emptySub: 'Explore the Hong Kong collection.', back: 'Back to the collection',
    added: (name, n) => `${name} added to your bag. ${n} ${n === 1 ? 'piece' : 'pieces'} in your bag.`, changed: (name, n) => `${name}: ${n}.`, removed: name => `${name} removed from your bag.`,
    required: 'Please fill in this field.', email: 'Enter a valid email address.', addFirst: 'Add a piece to your bag first.',
    invalid: n => `${n} ${n === 1 ? 'field is' : 'fields are'} missing or invalid.`, review: 'Your details are shown for review. No order has been created.',
  };
  const products = Object.freeze({
    peak: { name: 'Peak', type: L.earring, samplePrice: 180, image: '/assets/images/peak-portrait-720.webp', href: base + 'peak/' },
    'mid-levels': { name: 'Mid-Levels', type: L.ring, samplePrice: 160, image: '/assets/images/mid-levels-portrait-720.webp', href: base + 'mid-levels/' },
  });
  const storageKey = 'quet-bag-v1';
  const status = document.getElementById('site-status');
  const bagDialog = document.getElementById('cart-dialog');
  const imageDialog = document.getElementById('image-dialog');
  const quantity = value => Math.min(50, Math.max(1, Math.floor(Number(value) || 1)));
  const hasProduct = id => Object.prototype.hasOwnProperty.call(products, id);

  // Stored data is untrusted: unknown IDs, negative or huge counts and future timestamps are cleaned.
  function cleanState(value) {
    const items = {};
    if (value && typeof value.items === 'object' && value.items !== null) {
      for (const id of Object.keys(products)) {
        const count = Number(value.items[id]);
        if (Number.isFinite(count) && count > 0) items[id] = quantity(count);
      }
    }
    const at = Number(value?.at);
    return { items, at: Number.isFinite(at) ? Math.min(Math.max(0, at), Date.now() + 1000) : 0 };
  }
  function storedState() {
    try { return cleanState(JSON.parse(localStorage.getItem(storageKey))); }
    catch { return cleanState(null); }
  }
  let state = storedState();
  const totalCount = () => Object.values(state.items).reduce((sum, count) => sum + count, 0);
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* storage blocked: the bag lasts for this page only */ }
  }

  // Rapid repeated actions (quantity +/-) collapse into one readable announcement.
  let announceTimer = 0;
  function announce(text) {
    if (!status) return;
    clearTimeout(announceTimer);
    status.textContent = '';
    announceTimer = setTimeout(() => { status.textContent = text; }, 300);
  }

  function emptyMarkup() {
    return `<div class="empty-bag"><h2>${L.empty}</h2><p>${L.emptySub}</p><a class="primary-button" href="${base}${tr ? 'koleksiyon/' : 'collection/'}">${L.back}</a></div>`;
  }
  function itemMarkup(id, count, summary) {
    const product = products[id];
    const controls = summary
      ? `<p class="bag-item-price">${L.qty(count)}</p>`
      : `<div class="bag-controls"><div class="quantity-control" aria-label="${L.qtyGroup(product.name)}"><button type="button" data-cart-change="-1" data-id="${id}" aria-label="${L.dec(product.name)}" ${count === 1 ? 'disabled' : ''}>−</button><output aria-label="${L.qtyLabel}">${count}</output><button type="button" data-cart-change="1" data-id="${id}" aria-label="${L.inc(product.name)}" ${count === 50 ? 'disabled' : ''}>+</button></div><button class="remove-item" type="button" data-remove-item="${id}" aria-label="${L.remove} (${product.name})">${L.remove}</button></div>`;
    return `<article class="bag-item"><a href="${product.href}"><img src="${product.image}" width="960" height="1200" alt="${product.name}"></a><div><a class="bag-item-title" href="${product.href}">${product.name}</a><p class="bag-item-type">${product.type}</p><p class="bag-item-price">${L.each(product.samplePrice)}</p>${controls}</div></article>`;
  }
  function renderBag() {
    const count = totalCount();
    const sampleTotal = Object.entries(state.items).reduce((sum, [id, qty]) => sum + products[id].samplePrice * qty, 0);
    document.querySelectorAll('[data-cart-total]').forEach(node => { node.textContent = `€${sampleTotal.toLocaleString(L.locale)}`; });
    document.querySelectorAll('[data-cart-count]').forEach(node => { node.textContent = String(count); });
    document.querySelectorAll('[data-open-cart]').forEach(node => { node.hidden = count === 0; node.setAttribute('aria-label', L.bagAria(count)); });
    document.querySelectorAll('[data-cart-filled]').forEach(node => { node.hidden = count === 0; });
    document.querySelectorAll('[data-cart-empty]').forEach(node => { node.hidden = count !== 0; });
    document.querySelectorAll('[data-cart-items]').forEach(node => {
      node.innerHTML = count
        ? Object.entries(state.items).map(([id, qty]) => itemMarkup(id, qty, node.dataset.cartItems === 'summary')).join('')
        : node.dataset.cartItems === 'drawer' ? emptyMarkup() : '';
    });
  }
  function commit(message) {
    state.at = Math.max(Date.now(), state.at + 1);
    save(); renderBag(); announce(message);
  }
  function openBag() {
    if (bagDialog?.showModal) { if (!bagDialog.open) bagDialog.showModal(); }
    else location.href = L.bag;
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const close = target.closest('[data-close-dialog]');
    if (close) { close.closest('dialog')?.close(); return; }

    const open = target.closest('[data-open-cart]');
    if (open && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) { event.preventDefault(); openBag(); return; }

    const changeProduct = target.closest('[data-product-quantity]');
    if (changeProduct) {
      const input = document.getElementById('product-quantity');
      input.value = String(quantity(Number(input.value) + Number(changeProduct.dataset.productQuantity)));
      syncProductQuantity();
      // A button that just hit its limit is disabled; keep keyboard focus on the opposite control.
      if (changeProduct.disabled) document.querySelector(`[data-product-quantity="${-Number(changeProduct.dataset.productQuantity)}"]`)?.focus();
      announce(L.qty(input.value));
      return;
    }

    const add = target.closest('[data-add-to-cart]');
    if (add && hasProduct(add.dataset.addToCart)) {
      const id = add.dataset.addToCart;
      state.items[id] = quantity((state.items[id] || 0) + quantity(document.getElementById('product-quantity')?.value || 1));
      commit(L.added(products[id].name, totalCount()));
      openBag(); return;
    }

    const change = target.closest('[data-cart-change]');
    if (change && hasProduct(change.dataset.id) && state.items[change.dataset.id]) {
      const id = change.dataset.id;
      const area = change.closest('[data-cart-items]')?.dataset.cartItems;
      const delta = change.dataset.cartChange;
      state.items[id] = quantity(state.items[id] + Number(delta));
      commit(L.changed(products[id].name, state.items[id]));
      const replacement = document.querySelector(`[data-cart-items="${area}"] [data-id="${id}"][data-cart-change="${delta}"]`);
      if (replacement && !replacement.disabled) replacement.focus();
      else document.querySelector(`[data-cart-items="${area}"] [data-remove-item="${id}"]`)?.focus();
      return;
    }

    const remove = target.closest('[data-remove-item]');
    if (remove && hasProduct(remove.dataset.removeItem)) {
      const id = remove.dataset.removeItem;
      const area = remove.closest('[data-cart-items]')?.dataset.cartItems;
      delete state.items[id];
      commit(L.removed(products[id].name));
      const focusTarget = document.querySelector(`[data-cart-items="${area}"] button, [data-cart-items="${area}"] a`)
        || (bagDialog?.open ? bagDialog.querySelector('[data-close-dialog]') : document.querySelector('[data-cart-empty] a'));
      focusTarget?.focus(); return;
    }

    const zoomTrigger = target.closest('[data-zoom]');
    if (zoomTrigger) {
      // Product page A: each frame zooms its own image (largest master, not the srcset pick).
      const source = zoomTrigger.querySelector('img');
      const zoom = document.getElementById('zoom-image');
      if (source && zoom && imageDialog?.showModal) { zoom.src = source.src; zoom.alt = source.alt; imageDialog.showModal(); }
    }
  });

  for (const dialog of document.querySelectorAll('dialog')) {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
  }

  // Mobile product frames swipe (CSS scroll-snap); the three dots only mirror which frame is in view.
  const frames = document.querySelector('[data-frames]');
  const dots = frames?.parentElement.querySelectorAll('.frame-dots span');
  if (frames && dots?.length) {
    let ticking = false;
    frames.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const item = frames.firstElementChild;
        const step = item ? item.getBoundingClientRect().width + 4 : frames.clientWidth;
        const index = Math.min(dots.length - 1, Math.max(0, Math.round(frames.scrollLeft / step)));
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
        ticking = false;
      });
    }, { passive: true });
  }

  const productQuantity = document.getElementById('product-quantity');
  // Same limit feedback as the bag controls: -/+ disable at 1 and 50.
  function syncProductQuantity() {
    if (!productQuantity) return;
    const value = Number(productQuantity.value);
    const minus = document.querySelector('[data-product-quantity="-1"]');
    const plus = document.querySelector('[data-product-quantity="1"]');
    if (minus) minus.disabled = value <= 1;
    if (plus) plus.disabled = value >= 50;
  }
  productQuantity?.addEventListener('change', () => { productQuantity.value = String(quantity(productQuantity.value)); syncProductQuantity(); });
  syncProductQuantity();

  const checkoutForm = document.getElementById('checkout-form');
  const review = document.getElementById('checkout-review');
  if (checkoutForm && review) {
    // Persistent, programmatically linked error text (WCAG 3.3.1 / 3.3.3).
    const fieldError = (input, message) => {
      const id = `${input.name}-error`;
      let note = document.getElementById(id);
      if (!message) { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); note?.remove(); return; }
      if (!note) {
        note = document.createElement('span');
        note.id = id;
        note.className = 'field-error';
        // Kept out of the label's accessible name; still read via aria-describedby.
        note.setAttribute('aria-hidden', 'true');
        input.insertAdjacentElement('afterend', note);
      }
      note.textContent = message;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', id);
    };
    const validate = input => {
      const value = input.value.trim();
      if (input.required && !value) return L.required;
      if (input.type === 'email' && value && input.validity && input.validity.typeMismatch) return L.email;
      return '';
    };
    checkoutForm.addEventListener('input', event => {
      if (event.target.getAttribute?.('aria-invalid') === 'true') fieldError(event.target, validate(event.target));
    });
    checkoutForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!totalCount()) { announce(L.addFirst); return; }
      const invalid = [];
      for (const input of checkoutForm.querySelectorAll('input')) {
        const message = validate(input);
        fieldError(input, message);
        if (message) invalid.push(input);
      }
      if (invalid.length) { invalid[0].focus(); announce(L.invalid(invalid.length)); return; }
      const field = name => checkoutForm.elements.namedItem(name).value.trim();
      // This text stays in the current DOM only. No storage, query parameters or requests.
      document.getElementById('review-address').textContent = [
        `${field('firstName')} ${field('lastName')}`, field('email'), '', field('address'),
        `${field('postal')} ${field('city')}`, field('country'), field('phone'),
      ].filter((value, index) => value || index === 2).join('\n');
      checkoutForm.hidden = true; review.hidden = false;
      document.querySelector('[data-step="1"]').removeAttribute('aria-current');
      document.querySelector('[data-step="2"]').setAttribute('aria-current', 'step');
      review.focus();
      announce(L.review);
    });
    document.getElementById('edit-checkout').addEventListener('click', () => {
      review.hidden = true; checkoutForm.hidden = false;
      document.querySelector('[data-step="2"]').removeAttribute('aria-current');
      document.querySelector('[data-step="1"]').setAttribute('aria-current', 'step');
      checkoutForm.elements.namedItem('email').focus();
    });
    // revU: payment is not open (no tax certificate yet), so the last step sends a pre-order request instead.
    // Only on this explicit click do the details leave the page (POST /api/preorder, same origin); nothing is stored locally.
    const send = document.getElementById('send-preorder');
    const result = document.getElementById('preorder-result');
    send?.addEventListener('click', async () => {
      if (!totalCount() || send.disabled) return;
      send.disabled = true;
      const body = { lang: tr ? 'tr' : 'en', items: state.items };
      for (const input of checkoutForm.querySelectorAll('input')) body[input.name] = input.value.trim();
      let ok = false;
      try {
        const response = await fetch('/api/preorder', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
        ok = response.ok && (await response.json()).ok === true;
      } catch { ok = false; }
      result.textContent = ok ? result.dataset.sent : result.dataset.error;
      result.hidden = false;
      announce(result.textContent);
      if (ok) {
        state = { items: {}, at: Math.max(Date.now(), state.at + 1) };
        save(); // bag emptied for next visits; this page keeps showing the sent summary
        document.querySelectorAll('[data-open-cart]').forEach(node => { node.hidden = true; });
        document.getElementById('edit-checkout').hidden = true;
        send.hidden = true;
      } else {
        send.disabled = false;
      }
    });
    // Enable submission only after its local-only handler has been attached.
    checkoutForm.querySelector('button[type="submit"]').disabled = false;
  }

  function updateClocks() {
    const now = new Date();
    document.querySelectorAll('[data-clock]').forEach(clock => {
      clock.textContent = new Intl.DateTimeFormat(L.locale, { timeZone: clock.dataset.clock, hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
      clock.dateTime = now.toISOString();
    });
  }
  updateClocks();
  setInterval(updateClocks, 60000);

  // Another tab changed the bag, or Back/Forward restored a cached page: show the latest bag.
  window.addEventListener('storage', event => {
    if (event.key !== storageKey) return;
    const latest = storedState();
    if (latest.at > state.at) { state = latest; renderBag(); }
  });
  window.addEventListener('pageshow', () => {
    const latest = storedState();
    if (latest.at > state.at) { state = latest; renderBag(); }
  });
  renderBag();

  // revT: the hero wordmark fades as the page scrolls and the corner logo takes over (CSS reads --hero-fade).
  // CSSOM writes are allowed under the CSP; only inline style attributes in markup are blocked.
  const hero = document.querySelector('.home .hero');
  if (hero) {
    let frame = 0;
    const fade = () => {
      frame = 0;
      const span = (hero.offsetHeight || 1) * 0.45;
      const progress = Math.min(1, Math.max(0, window.scrollY / span));
      document.documentElement.style.setProperty('--hero-fade', (1 - progress).toFixed(3));
    };
    window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(fade); }, { passive: true });
    fade();
  }

  // Embedded previews can keep the host frame's scroll across page changes: start new pages at the top.
  try {
    const nav = performance.getEntriesByType('navigation')[0];
    if (!location.hash && nav && nav.type === 'navigate' && window.top !== window) document.body.scrollIntoView({ block: 'start' });
  } catch { /* cross-origin or unsupported: browser default applies */ }
})();

// revR: hover-only sketch layers load on fine pointers after page load, or on first keyboard focus inside a scene.
(() => {
  const lift = () => document.querySelectorAll('img[data-src]').forEach(img => {
    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    img.src = img.dataset.src;
    img.removeAttribute('data-src'); img.removeAttribute('data-srcset');
  });
  if (window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    if (document.readyState === 'complete') lift(); else addEventListener('load', lift, { once: true });
  }
  document.addEventListener('focusin', e => { if (e.target.closest && e.target.closest('.scene, .collection-card')) lift(); });
})();
