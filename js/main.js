/* ==========================================================
   Kabob Express — main.js  (Rustic Bazaar Redesign)
   Values to swap in:
     • FOODBOOKING_BASE — update if restaurant_uid ever changes
     • buildOrderUrl() — once Foodbooking's per-item deep-link
       pattern is confirmed, wire the `item` arg into the URL
       (likely a hash or query param — TBD from vendor docs).
   Modules:
     1. Footer year
     2. Scroll-driven UI (nav .scrolled after 80px, back-to-top after 400px)
     3. Mobile nav (hamburger + body.mobile-nav-open + .open on .nav-links)
     4. Menu filter (fade-out → DOM swap → fade-in, reduced-motion aware)
     5. Reveal on scroll (.is-visible via IntersectionObserver)
     6. Active nav link highlighting
     7. buildOrderUrl(item) helper — wires every menu card's href
========================================================== */

(() => {
  'use strict';

  const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  const FOODBOOKING_BASE =
    'https://www.foodbooking.com/ordering/restaurant/menu?restaurant_uid=f6103d83-5b9a-4239-a2ed-28c141ca7d15';

  /**
   * Build an ordering URL for a given menu item.
   * TODO: Foodbooking's per-item deep-link pattern is unconfirmed.
   *   When we know the pattern (hash like `#item-<slug>` or a `?item=<id>`
   *   query param), incorporate `item` into the returned URL. Until then,
   *   every card points at the base menu page and the `data-item` attr
   *   is preserved on the DOM so this function can be a one-line swap.
   */
  function buildOrderUrl(_item) {
    return FOODBOOKING_BASE;
  }

  /* ── Wire each menu card's href via buildOrderUrl ─────────── */
  document.querySelectorAll('.menu-card[data-item]').forEach((card) => {
    const item = card.dataset.item;
    card.setAttribute('href', buildOrderUrl(item));
  });

  /* ── 1. Footer year ───────────────────────────────────────── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── 2. Scroll-driven UI ──────────────────────────────────── */
  const header    = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    const y = window.scrollY;
    if (header)    header.classList.toggle('scrolled', y > 80);
    if (backToTop) backToTop.classList.toggle('visible', y > 400);
  };

  let rafPending = false;
  window.addEventListener('scroll', () => {
    if (rafPending) return;
    rafPending = true;
    window.requestAnimationFrame(() => { onScroll(); rafPending = false; });
  }, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
  }

  /* ── 3. Mobile nav ────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  const closeNav = () => {
    if (!navLinks) return;
    navLinks.classList.remove('open');
    document.body.classList.remove('mobile-nav-open');
    hamburger?.setAttribute('aria-expanded', 'false');
    hamburger?.setAttribute('aria-label', 'Open menu');
  };

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      document.body.classList.toggle('mobile-nav-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    navLinks.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', closeNav)
    );

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) closeNav();
    });
  }

  /* ── 4. Menu filter ───────────────────────────────────────── */
  const filterButtons = document.querySelectorAll('.filter-pill');
  const cardWraps     = document.querySelectorAll('.card-wrap');

  if (filterButtons.length && cardWraps.length) {
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        filterButtons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-selected', String(active));
        });

        const applyFilter = () => {
          cardWraps.forEach((w) => {
            const visible = filter === 'all' || w.dataset.category === filter;
            w.classList.toggle('hidden', !visible);
            w.classList.remove('fade-out');
          });
        };

        if (prefersReducedMotion) {
          applyFilter();
          return;
        }

        cardWraps.forEach((w) => w.classList.add('fade-out'));
        setTimeout(applyFilter, 180);
      });
    });
  }

  /* ── 5. Reveal on scroll ──────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const revealObs = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
      );
      revealEls.forEach((el) => revealObs.observe(el));
    }
  }

  /* ── 6. Active nav link highlighting ──────────────────────── */
  const sections = document.querySelectorAll('section[id]');

  if (sections.length && 'IntersectionObserver' in window) {
    const linkObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = document.querySelector(
            `.nav-links a[href="#${entry.target.id}"]`
          );
          if (link && !link.classList.contains('btn')) {
            link.classList.toggle('active', entry.isIntersecting);
          }
        });
      },
      { threshold: 0.45 }
    );
    sections.forEach((s) => linkObs.observe(s));
  }
})();
