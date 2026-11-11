/* ── Lead source tracking for the WhatsApp booking forms ──
   Keeps the visitor's last ad click (utm_* and Google's gclid / gbraid / wbraid) for 90 days, and when a booking
   form is sent, posts it to the AdMedica dashboard before WhatsApp opens. The dashboard then shows the request as a
   lead from Google (or Facebook, TikTok…) and sends it to the call-center sheet. WhatsApp still opens as before,
   also when the dashboard cannot be reached. */
(function () {
  var LEAD_URL = 'https://ghattas.admedica.net/api/web-lead';
  var KEY = 'ghattasAdClick';
  var KEEP_DAYS = 90;
  var PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid'];
  var FORMS = ['waFormEn', 'aboutWhatsappFormAr'];

  function read() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      return saved && saved.at > Date.now() - KEEP_DAYS * 864e5 ? saved.values : {};
    } catch (e) { return {}; }
  }

  // A visit that carries ad parameters replaces the stored click; a plain visit keeps it.
  var query = new URLSearchParams(location.search);
  var found = {};
  PARAMS.forEach(function (p) { var v = query.get(p); if (v) found[p] = v.slice(0, 255); });
  var external = document.referrer && document.referrer.indexOf(location.host) === -1 ? document.referrer : '';
  if (Object.keys(found).length) {
    if (external) found.referrer = external.slice(0, 255);
    try { localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), values: found })); } catch (e) { /* private mode */ }
  }

  function tracking() {
    var t = read();
    if (!Object.keys(t).length && external) t = { referrer: external.slice(0, 255) };
    return t;
  }

  function send(form) {
    var name = form.name && form.name.value.trim();
    var area = form.area && form.area.value;
    if (!name || !area) return; // the page's own check shows the error; nothing is sent
    var body = JSON.stringify({
      name: name, phone: form.phone ? form.phone.value.trim() : '', service: area,
      website: form.website ? form.website.value : '', page: location.pathname,
      lang: document.documentElement.lang || '', tracking: tracking()
    });
    try {
      fetch(LEAD_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: body, keepalive: true, mode: 'cors' })
        .catch(function () { /* WhatsApp still carries the request */ });
    } catch (e) { /* very old browsers */ }
  }

  document.addEventListener('DOMContentLoaded', function () {
    FORMS.forEach(function (id) {
      var form = document.getElementById(id);
      if (!form) return;
      // Hidden field that people never see; form-filling bots do, and the dashboard drops those requests.
      var trap = document.createElement('input');
      trap.type = 'text'; trap.name = 'website'; trap.tabIndex = -1; trap.autocomplete = 'off';
      trap.setAttribute('aria-hidden', 'true');
      trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
      form.appendChild(trap);
      form.addEventListener('submit', function () { send(form); });
    });
  });
})();
