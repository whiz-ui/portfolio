(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header: solid on scroll, hide on scroll down ---------- */
  const header = $('#header');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle('stuck', y > 24);
    header.classList.toggle('hide', y > lastY && y > 400 && !document.body.classList.contains('menu-open'));
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = $('#burger'), nav = $('#nav');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
    header.classList.remove('hide');
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  matchMedia('(min-width:1024px)').addEventListener('change', e => e.matches && setMenu(false));

  /* ---------- active nav link ---------- */
  const links = $$('.nav a[href^="#"]:not(.btn)');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['work', 'services', 'products', 'contact'].forEach(id => { const el = document.getElementById(id); el && spy.observe(el); });

  /* ---------- scroll reveal (staggered inside grids) ---------- */
  $$('.work-grid,.svc-grid,.mentor-grid,.tags,.pills,.checks').forEach(g =>
    [...g.children].forEach((c, i) => c.style.setProperty('--d', i * 0.08 + 's')));
  const rev = new IntersectionObserver((es, o) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => rev.observe(el));

  /* ---------- count-up stats ---------- */
  const count = el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end.toLocaleString('en-US') + suf; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased).toLocaleString('en-US') + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver((es, o) => es.forEach(e => {
    if (e.isIntersecting) { count(e.target); o.unobserve(e.target); }
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- project modal ---------- */
  const projects = {
    banq: { k: 'Product Design · Mobile Banking', t: 'Banq — Fintech Mobile App', d: 'A personal finance and payments app designed to simplify how people manage money, track expenses, and make seamless transfers. Role: Lead Product Designer · 10 weeks · iOS.', url: 'https://www.behance.net/gallery/251278513/Fintech-mobile-Application-(Banq)' },
    poundation: { k: 'Website · E-commerce', t: 'Poundation — Brand Website Redesign', d: 'A dark, data-rich NFT marketplace experience: live auctions, trending collections and a dashboard built for fast scanning, with a responsive layout focused on conversion.' },
    klocker: { k: 'UX Research · Prototyping', t: 'Clocklocker — Luxury Watch Storefront', d: 'A premium e-commerce experience for a luxury watch brand, shaped by UX research, interactive prototypes and usability testing to streamline browsing and onboarding.' },
    sente: { k: 'Website Design · Event', t: 'Sente — Conference Website', d: 'A website for a startup that gets educators and therapists together and advocates for inclusive learning, with clear paths to register, learn about the event and meet partners. Role: Lead Product Designer · 8 weeks · Figma, Framer, VS Code.', url: 'https://www.senteconference.org/' },
    kab: { k: 'Design System · Mobile App', t: 'KAB — Car Hire App & Design System', d: 'A mobile car-hire product with a reusable component library, tokens and documentation, covering onboarding, vehicle discovery, map-based pick-up and pricing flows.' }
  };
  const modal = $('#modal'); let lastFocus;
  const openM = id => {
    const p = projects[id]; if (!p) return;
    const card = $(`[data-project="${id}"]`);
    $('#mImg').src = $('img', card).src; $('#mImg').alt = $('img', card).alt;
    $('#mKick').textContent = p.k; $('#mTitle').textContent = p.t; $('#mText').textContent = p.d;
    const L = $('#mLink'); L.hidden = !p.url; if (p.url) L.href = p.url;
    lastFocus = document.activeElement; modal.hidden = false; document.body.style.overflow = 'hidden';
    $('.modal-x').focus();
  };
  const closeM = () => { modal.hidden = true; document.body.style.overflow = ''; lastFocus && lastFocus.focus(); };
  $$('[data-project]').forEach(c => {
    c.addEventListener('click', () => openM(c.dataset.project));
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openM(c.dataset.project); } });
  });
  $$('[data-close]', modal).forEach(b => b.addEventListener('click', closeM));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeM(); });

  /* ---------- TikTok topics + dots ---------- */
  const topics = $$('#topics li'), dots = $$('#ttDots button');
  let ti = 0, tTimer;
  const setTopic = i => {
    ti = i;
    topics.forEach((t, n) => t.classList.toggle('on', n === i));
    dots.forEach((d, n) => d.classList.toggle('on', n === i));
  };
  const auto = () => { clearInterval(tTimer); if (!reduce) tTimer = setInterval(() => setTopic((ti + 1) % topics.length), 4500); };
  topics.forEach((t, i) => $('button', t).addEventListener('click', () => { setTopic(i); auto(); }));
  dots.forEach((d, i) => d.addEventListener('click', () => { setTopic(i); auto(); }));
  auto();

  /* ---------- 3D tilt on the book ---------- */
  const book = $('#book');
  if (book && matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce) {
    const wrap = book.parentElement;
    wrap.addEventListener('pointermove', e => {
      const r = book.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      book.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 12}deg)`;
    });
    wrap.addEventListener('pointerleave', () => { book.style.transform = ''; });
  }

  /* ---------- CTA → prefill contact form ---------- */
  const typeSel = $('#type');
  $$('[data-subject],[data-service]').forEach(a => a.addEventListener('click', () => {
    const v = a.dataset.subject || a.dataset.service;
    [...typeSel.options].some(o => o.text === v && (typeSel.value = o.value));
  }));

  /* ---------- contact form ---------- */
  const form = $('#form'), msg = $('#formMsg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const bad = [];
    ['name', 'email', 'type', 'message'].forEach(k => {
      const el = form.elements[k]; const v = (f.get(k) || '').toString().trim();
      let ok = !!v; if (k === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      el.classList.toggle('bad', !ok); if (!ok) bad.push(el);
    });
    msg.className = 'form-msg';
    if (bad.length) { msg.textContent = 'Please complete the highlighted fields.'; msg.classList.add('err'); bad[0].focus(); return; }
    /* Netlify Forms: posts to the site itself; submissions appear in the Netlify dashboard (Forms tab). */
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true; msg.textContent = 'Sending…';
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(r => {
      if (!r.ok) throw new Error(r.status);
      msg.textContent = 'Thank you! Your message has been sent. I will reply within 24 hours.';
      msg.className = 'form-msg ok'; form.reset();
    }).catch(() => {
      msg.textContent = 'Something went wrong. Please try again or email whizdezigns@gmail.com.';
      msg.className = 'form-msg err';
    }).finally(() => { btn.disabled = false; });
  });
  $$('input,select,textarea', form).forEach(el => el.addEventListener('input', () => el.classList.remove('bad')));

  $('#yr').textContent = new Date().getFullYear();
})();
