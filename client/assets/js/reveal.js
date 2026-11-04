/* Scroll reveal: tags sections, headings, text and cards, then animates each one in the first time it
   scrolls into view (styles in reveal.css). Cards in the same group come in one after another. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var groups = [
    ['rv--frame', '.ecosystem-section, .ghattas-section, .services-section, .insights-section, .ba-section, .dv-section, .tst-section, .about-m, .wa-band-inner'],
    ['rv--side', '.ecosystem-title, .services-title, .insights-title, .ghattas-title, .ba-title, .tst-title, .about-m-name, .hbf-title'],
    ['rv--text', '.ecosystem-lead, .services-header > p, .insights-header > p, .ghattas-lead, .ecosystem-note, .ghattas-pill, .ghattas-copy .gold-outline-btn, .tst-subtitle, .medical-disclaimer'],
    ['rv--card', '.brand-card, .expertise-card, .insight-card, .specialty-list span, .ach-card, .dv-card, .ghattas-offering, .interest-panel']
  ];

  var tagged = [];
  groups.forEach(function (g) {
    var seen = new Map(); // stagger index per parent
    [].forEach.call(document.querySelectorAll(g[1]), function (el) {
      if (el.classList.contains('rv')) return;
      var i = seen.get(el.parentElement) || 0;
      seen.set(el.parentElement, i + 1);
      el.classList.add('rv', g[0]);
      el.style.setProperty('--rv-i', i);
      if (g[0] === 'rv--frame') {
        var glint = document.createElement('span');
        glint.className = 'rv-glint';
        glint.setAttribute('aria-hidden', 'true');
        el.appendChild(glint);
      }
      tagged.push(el);
    });
  });
  if (!tagged.length) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('rv-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  document.documentElement.classList.add('rv-on');
  tagged.forEach(function (el) { io.observe(el); });

  // jumping down (anchor links, fast scrolls) can skip past elements without them ever intersecting:
  // anything already above the bottom of the screen is shown straight away
  var ticking = false;
  function sweep() {
    ticking = false;
    var limit = window.innerHeight;
    tagged = tagged.filter(function (el) {
      if (el.classList.contains('rv-in')) return false;
      if (el.getBoundingClientRect().top < limit) { el.classList.add('rv-in'); io.unobserve(el); return false; }
      return true;
    });
    if (!tagged.length) window.removeEventListener('scroll', onScroll);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(sweep); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', sweep);
})();
