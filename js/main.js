/* ==========================================================
   Kabob Express — main.js
   Mobile nav · sticky order bar · menu filter · reveal anims
   · reviews carousel · active link highlighting
========================================================== */

(() => {
  'use strict';

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  const closeNav = () => {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('mobile-nav-open');
  };

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('mobile-nav-open', open);
  });

  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) closeNav();
  });

  /* ---------- Sticky order strip ---------- */
  const orderStrip = document.getElementById('orderStrip');
  const hero       = document.getElementById('home');

  const updateStrip = () => {
    if (!hero || !orderStrip) return;
    const past = window.scrollY > hero.offsetHeight - 100;
    orderStrip.classList.toggle('visible', past);
    orderStrip.setAttribute('aria-hidden', String(!past));
    document.body.classList.toggle('strip-visible', past);
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => { updateStrip(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  updateStrip();

  /* ---------- Menu filter ---------- */
  const filterButtons = document.querySelectorAll('.filter-pill');
  const menuCards     = document.querySelectorAll('.menu-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterButtons.forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', String(active));
      });

      menuCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);
      });
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ---------- Active nav link highlight ---------- */
  const sections = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window) {
    const linkObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const id   = entry.target.id;
        const link = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (link && !link.classList.contains('btn')) {
          link.classList.toggle('active', entry.isIntersecting);
        }
      });
    }, { threshold: 0.45 });
    sections.forEach(s => linkObs.observe(s));
  }

  /* ---------- Reviews carousel ---------- */
  const track    = document.getElementById('reviewsTrack');
  const prevBtn  = document.getElementById('reviewPrev');
  const nextBtn  = document.getElementById('reviewNext');

  if (track && prevBtn && nextBtn) {
    const scrollByCard = (dir) => {
      const card = track.querySelector('.review-card');
      if (!card) return;
      const step = card.getBoundingClientRect().width + 24; // gap
      track.scrollBy({ left: step * dir, behavior: 'smooth' });
    };
    prevBtn.addEventListener('click', () => scrollByCard(-1));
    nextBtn.addEventListener('click', () => scrollByCard(1));

    /* Auto-scroll on mobile only, pause on interaction */
    const mq = window.matchMedia('(max-width: 768px)');
    let autoTimer = null;

    const startAuto = () => {
      if (autoTimer || !mq.matches) return;
      autoTimer = setInterval(() => {
        const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
        if (atEnd) track.scrollTo({ left: 0, behavior: 'smooth' });
        else scrollByCard(1);
      }, 5000);
    };
    const stopAuto = () => { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } };

    startAuto();
    track.addEventListener('touchstart', stopAuto, { passive: true });
    track.addEventListener('mouseenter', stopAuto);
    mq.addEventListener('change', () => { stopAuto(); startAuto(); });
  }
})();
