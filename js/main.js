/* ==========================================================
   Kabob Express — main.js
   Values to swap in:  (none — all behaviour is self-contained)
   Modules:
     1. Footer year
     2. Sticky nav (transparent → scrolled at 80px)
     3. Back-to-top button (visible after 400px)
     4. Mobile nav (hamburger toggle + Escape key + link close)
     5. Menu filter (pill tabs with fade animation)
     6. Reveal animations (IntersectionObserver → .is-visible)
     7. Active nav link highlighting (IntersectionObserver)
========================================================== */

(() => {
  'use strict';

  /* ── 1. Footer year ─────────────────────────────────────── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── 2 & 3. Scroll-driven UI (nav + back-to-top) ────────── */
  const header    = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    const y = window.scrollY;

    // Nav becomes opaque with gold top-border after 80px
    if (header) header.classList.toggle('scrolled', y > 80);

    // Back-to-top appears after 400px (desktop only — hidden via CSS on mobile)
    if (backToTop) backToTop.classList.toggle('visible', y > 400);
  };

  // Throttle via rAF to keep scroll handler cheap
  let rafPending = false;
  window.addEventListener('scroll', () => {
    if (!rafPending) {
      rafPending = true;
      window.requestAnimationFrame(() => { onScroll(); rafPending = false; });
    }
  }, { passive: true });
  onScroll(); // run once on load

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── 4. Mobile nav ──────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  const closeNav = () => {
    if (!navLinks) return;
    navLinks.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    hamburger?.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('mobile-nav-open');
  };

  hamburger?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('mobile-nav-open', isOpen);
  });

  // Close nav when any link inside it is clicked
  navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

  // Escape key closes nav
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks?.classList.contains('open')) closeNav();
  });

  /* ── 5. Menu filter with fade animation ─────────────────── */
  const filterButtons = document.querySelectorAll('.filter-pill');
  const menuCards     = document.querySelectorAll('.menu-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update pill active states + ARIA
      filterButtons.forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', String(active));
      });

      // Briefly flash cards out, swap visibility, then fade back in
      menuCards.forEach(card => {
        card.classList.add('fade-out');
      });

      // After 180ms (matches CSS transition), hide/show and remove fade
      setTimeout(() => {
        menuCards.forEach(card => {
          const visible = filter === 'all' || card.dataset.category === filter;
          card.classList.toggle('hidden', !visible);
          card.classList.remove('fade-out');
        });
      }, 180);
    });
  });

  /* ── 6. Reveal on scroll ────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObs.observe(el));
  } else {
    // Fallback for browsers without IntersectionObserver
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ── 7. Active nav link highlighting ────────────────────── */
  const sections = document.querySelectorAll('section[id]');

  if ('IntersectionObserver' in window) {
    const linkObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (link && !link.classList.contains('btn')) {
          link.classList.toggle('active', entry.isIntersecting);
        }
      });
    }, { threshold: 0.45 });

    sections.forEach(s => linkObs.observe(s));
  }

})();
