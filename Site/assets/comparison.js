(() => {
  'use strict';

  for (const scene of document.querySelectorAll('[data-comparison]')) {
    const surface = scene.querySelector('[data-comparison-surface]');
    const range = scene.querySelector('[data-comparison-range]');
    const toggle = scene.querySelector('[data-comparison-toggle]');
    if (!surface || !range || !toggle) continue; // one malformed block must not break the others
    const label = toggle.dataset.label || '';
    let enabled = true;
    let pointer = null;
    let pointerUsed = false;

    function setReveal(value) {
      const percent = Math.min(100, Math.max(0, Math.round(Number(value) || 0)));
      scene.style.setProperty('--reveal', percent + '%');
      scene.dataset.endpoint = percent === 100 ? 'silver' : percent === 0 ? 'tattoo' : 'mixed';
      range.value = String(percent);
      range.setAttribute('aria-valuetext', percent === 100 ? 'Gümüş' : percent === 0 ? 'Ten' : `Yüzde ${percent} gümüş`);
    }

    function revealAt(event) {
      if (!enabled || scene.classList.contains('is-detail') || event.target.closest('button')) return;
      const rect = surface.getBoundingClientRect();
      if (!rect.width) return;
      pointerUsed = true;
      setReveal((event.clientX - rect.left) / rect.width * 100);
    }

    surface.addEventListener('pointermove', event => {
      if (event.pointerType === 'mouse' || event.pointerId === pointer) revealAt(event);
    });
    surface.addEventListener('pointerdown', event => {
      if (!enabled || scene.classList.contains('is-detail') || event.target.closest('button')) return;
      if (event.button !== 0) return;
      pointer = event.pointerId;
      if (event.pointerType !== 'mouse') surface.setPointerCapture?.(pointer);
      revealAt(event);
    });
    function release(event) {
      if (pointer !== event.pointerId) return;
      if (surface.hasPointerCapture?.(pointer)) surface.releasePointerCapture(pointer);
      pointer = null;
    }
    surface.addEventListener('pointerup', release);
    surface.addEventListener('pointercancel', release);
    surface.addEventListener('lostpointercapture', () => { pointer = null; });
    surface.addEventListener('pointerleave', event => {
      if (event.pointerType === 'mouse' && pointerUsed && enabled) {
        setReveal(100);
        pointerUsed = false;
      }
    });
    range.addEventListener('input', () => { if (enabled) { pointerUsed = false; setReveal(range.value); } });
    toggle.addEventListener('click', () => {
      enabled = !enabled;
      scene.classList.toggle('is-disabled', !enabled);
      toggle.setAttribute('aria-pressed', String(enabled));
      // WCAG 2.5.3: the accessible name starts with the visible text.
      toggle.textContent = enabled ? 'Geçiş açık' : 'Geçiş kapalı';
      toggle.setAttribute('aria-label', `${toggle.textContent} (${label})`);
      range.disabled = !enabled;
      pointerUsed = false;
      setReveal(100);
    });
    scene.addEventListener('comparison:reset', () => { pointerUsed = false; setReveal(100); });
    setReveal(100);
  }

  const preview = document.querySelector('.hero-preview');
  if (preview) {
    const mark = preview.querySelector('.hero-mark');
    document.querySelectorAll('[data-hero-variant]').forEach(button => {
      button.addEventListener('click', () => {
        preview.classList.remove('is-playing');
        const variant = button.dataset.heroVariant;
        mark.classList.toggle('hero-mark-b', variant === 'b');
        mark.classList.toggle('hero-mark-c', variant === 'c');
        document.querySelectorAll('[data-hero-variant]').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
        document.querySelector('[data-hero-description]').textContent = variant === 'b'
          ? 'B · Net kırık beyaz; bütün harfler aynı tonda.'
          : 'C · Mat gümüş; fotoğraftaki güneş hattı harflerin üstünde sabit kalır.';
      });
    });
    document.querySelector('[data-hero-replay]').addEventListener('click', () => {
      preview.classList.remove('is-playing');
      void preview.offsetWidth;
      preview.classList.add('is-playing');
    });
  }
})();
