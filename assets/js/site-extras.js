/* ══════════════════════════════════════════════════════════════
   Dr. Osama Ghattas — shared page behaviour (AR + EN)
   · Achievements: cards reveal on scroll + horizontal slider
   · English WhatsApp booking form
   Works in both RTL and LTR.
══════════════════════════════════════════════════════════════ */
(function () {
  var isRTL = document.documentElement.dir === 'rtl';
  var isAR  = (document.documentElement.lang || '').indexOf('ar') === 0;

  /* ── Achievements: reveal cards as they come into view ── */
  (function () {
    var sec = document.querySelector('.ach-section');
    if (!sec) return;
    var cards = sec.querySelectorAll('.ach-card');
    if (!cards.length) return;
    if (!('IntersectionObserver' in window)) return;          // cards stay visible
    sec.classList.add('ach-anim');
    var io = new IntersectionObserver(function (entries) {
      // cards arriving together come in one after another (in reading order)
      var n = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, d = 250 + n++ * 140;
        setTimeout(function () { el.classList.add('is-in'); }, d);
        io.unobserve(el);
      });
    }, { threshold: 0.2 });
    cards.forEach(function (c) { io.observe(c); });
  })();

  /* ── Achievements slider: snap track + arrows, dots, autoplay ── */
  (function () {
    var sec   = document.querySelector('.ach-section');
    var track = sec && sec.querySelector('.ach-grid');
    var ctrl  = sec && sec.querySelector('.ach-slider-ctrl');
    if (!track || !ctrl) return;
    var cards = Array.prototype.slice.call(track.querySelectorAll('.ach-card'));
    var dotsWrap = ctrl.querySelector('.ach-dots');
    var prev = ctrl.querySelector('.ach-prev'), next = ctrl.querySelector('.ach-next');
    var cur = 0, last = 0, timer = null, inView = false, hover = false;

    function startEdge(el) { var r = el.getBoundingClientRect(); return isRTL ? r.right : r.left; }
    function span(fromCard) {                       // width from a card's start to the end of the last card
      var end = cards[cards.length - 1].getBoundingClientRect();
      return isRTL ? startEdge(fromCard) - end.left : end.right - startEdge(fromCard);
    }
    function calcLast() {
      var w = track.clientWidth;
      for (var i = 0; i < cards.length; i++) if (span(cards[i]) <= w + 2) return i;
      return cards.length - 1;
    }
    function mark() { var ds = dotsWrap.children; for (var k = 0; k < ds.length; k++) ds[k].classList.toggle('active', k === cur); }
    function buildDots() {
      last = calcLast();
      dotsWrap.innerHTML = '';
      for (var i = 0; i <= last; i++) {
        var d = document.createElement('button');
        d.type = 'button'; d.className = 'ach-dot';
        d.setAttribute('aria-label', (isAR ? 'الشريحة ' : 'Slide ') + (i + 1));
        d.addEventListener('click', (function (k) { return function () { go(k); restart(); }; })(i));
        dotsWrap.appendChild(d);
      }
      ctrl.style.display = last ? '' : 'none';
      if (cur > last) cur = last;
      mark();
    }
    function go(i, wrap) {
      if (i > last) i = wrap ? 0 : last;
      if (i < 0)    i = wrap ? last : 0;
      cur = i;
      track.scrollBy({ left: startEdge(cards[cur]) - startEdge(track), behavior: 'smooth' });
      mark();
    }
    function nearest() {
      var edge = startEdge(track), best = 0, bd = Infinity;
      for (var i = 0; i <= last; i++) { var dd = Math.abs(startEdge(cards[i]) - edge); if (dd < bd) { bd = dd; best = i; } }
      return best;
    }
    var st, rt;
    track.addEventListener('scroll', function () { clearTimeout(st); st = setTimeout(function () { cur = nearest(); mark(); }, 120); });
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(buildDots, 150); });
    next.addEventListener('click', function () { go(cur + 1, true); restart(); });
    prev.addEventListener('click', function () { go(cur - 1, true); restart(); });
    track.addEventListener('mouseenter', function () { hover = true; });
    track.addEventListener('mouseleave', function () { hover = false; });
    track.addEventListener('touchstart', function () { restart(); }, { passive: true });

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function tick() { if (inView && !hover && !document.hidden) go(cur + 1, true); }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(tick, 4500); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { inView = e[0].isIntersecting; }, { threshold: 0.35 }).observe(sec);
    } else { inView = true; }
    buildDots(); restart();
  })();

  /* ── English WhatsApp booking form ── */
  (function () {
    var f = document.getElementById('waFormEn');
    if (!f) return;
    var WA_NUMBER = '201201118082';
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      ['name', 'area'].forEach(function (n) {
        var el = f[n];
        if (!el.value.trim()) { el.classList.add('error'); ok = false; } else el.classList.remove('error');
      });
      if (!ok) return;
      var lines = ["Hello, I'd like to book a consultation with Dr. Osama Ghattas.", 'Name: ' + f.name.value.trim()];
      if (f.phone.value.trim()) lines.push('Mobile: ' + f.phone.value.trim());
      lines.push('Consultation area: ' + f.area.value);
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  })();
})();

/* ── Doctor videos: swap the thumbnail for the YouTube player on click ── */
(function () {
  var playing = null;   // { btn, box }
  function stop() {
    if (!playing) return;
    playing.box.parentNode.replaceChild(playing.btn, playing.box);
    playing = null;
  }
  Array.prototype.forEach.call(document.querySelectorAll('.dv-card[data-yt]'), function (btn) {
    btn.addEventListener('click', function () {
      // YouTube refuses embeds without a referrer (Error 153) — e.g. when the page
      // is opened straight from disk (file://). Open the video on YouTube instead.
      if (location.protocol === 'file:') {
        window.open('https://www.youtube.com/shorts/' + btn.getAttribute('data-yt'), '_blank', 'noopener');
        return;
      }
      stop();
      var box = document.createElement('div');
      box.className = 'dv-card is-playing';
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube.com/embed/' + btn.getAttribute('data-yt') + '?autoplay=1&playsinline=1&rel=0&modestbranding=1&origin=' + encodeURIComponent(location.origin);
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.title = btn.getAttribute('aria-label') || 'YouTube video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      box.appendChild(f);
      btn.parentNode.replaceChild(box, btn);
      playing = { btn: btn, box: box };
    });
  });
})();

/* ── Booking form: brand-styled dropdown (the native <select> stays as the
      source of truth, hidden, so validation + WhatsApp message keep working) ── */
(function () {
  var selects = document.querySelectorAll('.wa-band-form select');
  Array.prototype.forEach.call(selects, function (sel, si) {
    var wrap = document.createElement('div');
    wrap.className = 'bs-wrap';
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);
    sel.classList.add('bs-native');
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');

    var listId = 'bsList' + si;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bs-trigger';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', listId);
    var lbl = document.querySelector('label[for="' + sel.id + '"]');
    if (lbl) { lbl.id = lbl.id || sel.id + 'Lbl'; btn.setAttribute('aria-labelledby', lbl.id + ' ' + sel.id + 'Val'); }
    var val = document.createElement('span');
    val.className = 'bs-value';
    val.id = sel.id + 'Val';
    btn.appendChild(val);
    wrap.appendChild(btn);
    if (lbl) lbl.addEventListener('click', function (e) { e.preventDefault(); btn.focus(); });

    var list = document.createElement('ul');
    list.className = 'bs-list';
    list.id = listId;
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    var items = Array.prototype.map.call(sel.options, function (o, i) {
      var li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.textContent = o.textContent;
      li.dataset.i = i;
      if (!o.value) li.classList.add('bs-placeholder');
      list.appendChild(li);
      return li;
    });
    wrap.appendChild(list);

    var active = -1;
    function sync() {
      var i = sel.selectedIndex;
      val.textContent = sel.options[i] ? sel.options[i].textContent : '';
      btn.classList.toggle('is-empty', !sel.value);
      items.forEach(function (li, k) { li.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    }
    function setActive(k) {
      if (active > -1) items[active].classList.remove('is-active');
      active = Math.max(0, Math.min(items.length - 1, k));
      items[active].classList.add('is-active');
      items[active].scrollIntoView({ block: 'nearest' });
    }
    function open() {
      if (!list.hidden) return;
      list.hidden = false;
      wrap.classList.add('is-open');
      var band = wrap.closest('.wa-band'); if (band) band.classList.add('bs-raised');
      btn.setAttribute('aria-expanded', 'true');
      setActive(sel.selectedIndex > 0 ? sel.selectedIndex : 1);
      document.addEventListener('mousedown', outside);
    }
    function close() {
      if (list.hidden) return;
      list.hidden = true;
      wrap.classList.remove('is-open');
      var band = wrap.closest('.wa-band'); if (band) band.classList.remove('bs-raised');
      btn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('mousedown', outside);
    }
    function outside(e) { if (!wrap.contains(e.target)) close(); }
    function choose(k) {
      sel.selectedIndex = k;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      if (sel.value) sel.classList.remove('error');
      sync(); close(); btn.focus();
    }

    btn.addEventListener('click', function () { list.hidden ? open() : close(); });
    btn.addEventListener('keydown', function (e) {
      var k = e.key;
      if (list.hidden) {
        if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Enter' || k === ' ') { e.preventDefault(); open(); }
        return;
      }
      if (k === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
      else if (k === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (k === 'Home') { e.preventDefault(); setActive(0); }
      else if (k === 'End') { e.preventDefault(); setActive(items.length - 1); }
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); choose(active); }
      else if (k === 'Escape' || k === 'Tab') { close(); }
    });
    list.addEventListener('mousemove', function (e) {
      var li = e.target.closest('li'); if (li) setActive(+li.dataset.i);
    });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('li'); if (li) choose(+li.dataset.i);
    });

    // mirror the form's validation state (.error is set on the native select)
    new MutationObserver(function () { btn.classList.toggle('error', sel.classList.contains('error')); })
      .observe(sel, { attributes: true, attributeFilter: ['class'] });
    sel.addEventListener('change', sync);
    if (sel.form) sel.form.addEventListener('reset', function () { setTimeout(sync, 0); });
    sync();
  });
})();

/* ── Footer: hotline number counts up when the footer comes into view ── */
(function () {
  var foot = document.getElementById('contact');
  var num = foot && foot.querySelector('.ogf-number');
  if (!num || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var target = parseInt(num.textContent.replace(/\D/g, ''), 10);
  if (!target) return;
  var final = num.textContent;
  var io = new IntersectionObserver(function (e) {
    if (!e[0].isIntersecting) return;
    io.disconnect();
    var t0 = null, dur = 1500, delay = 300;
    function step(ts) {
      if (t0 === null) t0 = ts + delay;
      var p = Math.max(0, Math.min(1, (ts - t0) / dur));
      var eased = 1 - Math.pow(1 - p, 4);
      num.textContent = p < 1 ? String(Math.round(target * eased)) : final;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, { threshold: 0.3 });
  io.observe(foot);
})();
