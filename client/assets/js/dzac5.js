/* DZAC 5 card: plays its entrance animation each time it scrolls into view (styles in ecosystem.css). */
(function () {
  var card = document.querySelector('.dzac5-card');
  if (!card || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  card.classList.add('dzac5-anim');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      // replay when it comes back: reset once it is fully out of view
      if (e.isIntersecting && e.intersectionRatio >= 0.25) card.classList.add('is-in');
      else if (!e.isIntersecting) card.classList.remove('is-in');
    });
  }, { threshold: [0, 0.25] });
  io.observe(card);
})();
