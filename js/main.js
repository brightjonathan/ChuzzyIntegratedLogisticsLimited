(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var body = document.body, header = $('#header'), burger = $('#burger');

  /* Mobile menu */
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(!body.classList.contains('menu-open')); });
  $$('#nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });

  /* Scroll: header shadow, progress bar, back-to-top */
  var bar = $('#progress'), totop = $('#totop');
  function onScroll() {
    var y = window.pageYOffset, h = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 10);
    bar.style.width = (h > 0 ? y / h * 100 : 0) + '%';
    totop.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* Reveal on scroll */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  /* Animated counters */
  function count(el) {
    var end = +el.dataset.count, dur = 1800, t0 = null;
    if (reduce) { el.textContent = end; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('.count');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  } else { counters.forEach(function (c) { c.textContent = c.dataset.count; }); }

  /* Contact page: pre-select service from ?service= */
  var sel = $('#f-service');
  if (sel) {
    try {
      var q = new URLSearchParams(window.location.search).get('service');
      if (q) Array.prototype.forEach.call(sel.options, function (o) { if (o.text === q) sel.value = o.value || o.text; });
    } catch (e) {}
  }

  /* Enquiry form (static site: opens the visitor's email app addressed to the company) */
  var form = $('#enquiry'), msg = $('#form-msg');
  if (!form) return;
  function show(type, text) { msg.className = 'form-msg show ' + type; msg.textContent = text; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true, f = form.elements;
    ['name', 'email', 'message'].forEach(function (n) {
      var bad = !f[n].value.trim() || (n === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f[n].value.trim()));
      f[n].classList.toggle('bad', bad); if (bad) ok = false;
    });
    if (!ok) { show('err', 'Please complete your name, a valid email address and your message.'); return; }
    var lines = [
      'Name: ' + f.name.value.trim(), 'Company: ' + (f.company.value.trim() || '-'),
      'Email: ' + f.email.value.trim(), 'Phone: ' + (f.phone.value.trim() || '-'),
      'Service required: ' + (f.service.value || '-'), '', f.message.value.trim()
    ];
    var url = 'mailto:info.cilltd@gmail.com?subject=' + encodeURIComponent('Website Enquiry – ' + (f.service.value || 'General') + ' – ' + f.name.value.trim()) +
      '&body=' + encodeURIComponent(lines.join('\n'));
    window.location.href = url;
    show('ok', 'Thank you! Your email app is opening with your enquiry ready to send to info.cilltd@gmail.com. If nothing opens, please email us directly.');
    form.reset();
  });
  $$('input,textarea', form).forEach(function (i) { i.addEventListener('input', function () { i.classList.remove('bad'); }); });
})();
