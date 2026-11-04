/* Section alignment: every section's outer edges follow the About section's box (.about-m) at every screen
   width, so the left and right edges line up down the whole page. Measured from layout offsets, so the
   reveal animations' translate/scale never skew the numbers. */
(function () {
  var ref = document.querySelector('#about .about-m');
  if (!ref) return;
  var targets = [].slice.call(document.querySelectorAll(
    '.wa-band-inner, .ecosystem-section, .ghattas-section, .services-section, .insights-section, .ba-section, .dv-section, .tst-section'
  ));

  function pageLeft(el) { var x = 0; while (el) { x += el.offsetLeft; el = el.offsetParent; } return x; }

  function align() {
    targets.forEach(function (el) {
      el.style.removeProperty('margin-left');
      el.style.removeProperty('margin-right');
      el.style.removeProperty('max-width');
    });
    var L = pageLeft(ref), R = L + ref.offsetWidth;
    targets.forEach(function (el) {
      var cs = getComputedStyle(el);
      var l = pageLeft(el), r = l + el.offsetWidth;
      var ml = parseFloat(cs.marginLeft) || 0, mr = parseFloat(cs.marginRight) || 0;
      el.style.setProperty('max-width', 'none', 'important');
      el.style.setProperty('margin-left', (ml + (L - l)).toFixed(1) + 'px', 'important');
      el.style.setProperty('margin-right', (mr + (r - R)).toFixed(1) + 'px', 'important');
    });
  }

  var t;
  function later() { clearTimeout(t); t = setTimeout(align, 120); }
  window.addEventListener('resize', later);
  window.addEventListener('load', align);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(align);
  // some containers settle their size after load (their own intro animations), so follow them
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(later), watched = new Set([ref]);
    targets.forEach(function (el) { if (el.parentElement) watched.add(el.parentElement); });
    watched.forEach(function (el) { ro.observe(el); });
  }
  align();
})();
