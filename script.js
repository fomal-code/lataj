/* ============================================
   Lataj — script.js
   Nav · Mobile menu · Parallax · Reveal · Toast · Contact form
   Shared helpers exposed on window.Lataj for shop.js
   ============================================ */

(function () {
  'use strict';

  const CFG = window.Lataj_CONFIG || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- SCROLL LOCK (shared by mobile menu, quick view, cart) ---- */
  let lockCount = 0;
  function lockScroll() {
    if (lockCount++ === 0) document.body.style.overflow = 'hidden';
  }
  function unlockScroll() {
    if (lockCount > 0 && --lockCount === 0) document.body.style.overflow = '';
  }

  /* ---- TOAST ---- */
  const toast = document.getElementById('toast');
  let toastTimer;

  function showToast(msg) {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  /* ---- NAV + HERO PARALLAX (single rAF-throttled scroll handler) ---- */
  const nav    = document.getElementById('nav');
  const heroBg = document.getElementById('heroBg');
  let ticking  = false;

  function onFrame() {
    ticking = false;
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    if (heroBg && !reduceMotion && y < window.innerHeight * 1.2) {
      heroBg.style.transform = `translateY(${y * 0.35}px)`;
    }
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onFrame);
    }
  }, { passive: true });
  onFrame();

  /* ---- MOBILE MENU ---- */
  const burger      = document.getElementById('navBurger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function openMenu() {
    if (mobileMenu.classList.contains('open')) return;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    lockScroll();
    mobileClose.focus({ preventScroll: true });
  }

  function closeMenu(restoreFocus) {
    if (!mobileMenu.classList.contains('open')) return;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    unlockScroll();
    if (restoreFocus) burger.focus({ preventScroll: true });
  }

  burger.addEventListener('click', openMenu);
  mobileClose.addEventListener('click', () => closeMenu(true));
  mobileLinks.forEach(link => link.addEventListener('click', () => closeMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu(true);
  });
  // Close the menu if the viewport grows to desktop size
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
    if (e.matches) closeMenu(false);
  });

  /* ---- SCROLL REVEAL ---- */
  const revealEls = document.querySelectorAll(
    '.reveal-up, .reveal-fade, .reveal-up-delay'
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => revealObserver.observe(el));

  /* ---- SMOOTH NAV LINK SCROLL ---- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;          // placeholder links: ignore safely
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = window.scrollY + target.getBoundingClientRect().top - 80;
      window.scrollTo({ top: offset, behavior: reduceMotion ? 'auto' : 'smooth' });
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* ---- CONTACT FORM ---- */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name    = document.getElementById('contactName').value.trim();
      const email   = document.getElementById('contactEmail').value.trim();
      const subject = document.getElementById('contactSubject').value;
      const message = document.getElementById('contactMessage').value.trim();

      if (!name || !email || !message) {
        showToast('Please fill in all required fields.');
        return;
      }

      const brand  = CFG.brand || 'Lataj';
      const waText = `Hello ${brand},\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject || 'General Inquiry'}\n\n${message}`;
      const waNumber = CFG.whatsappNumber || '2349138947809';
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

      contactForm.style.display = 'none';
      formSuccess.classList.add('visible');

      setTimeout(() => window.open(waUrl, '_blank', 'noopener,noreferrer'), 600);
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- LOOKBOOK HOVER IMAGE SWAP (optional) ---- */
  document.querySelectorAll('.lookbook-item').forEach(item => {
    const img = item.querySelector('img');
    const alt = item.dataset.hover;
    if (!img || !alt) return;

    const original = img.src;

    item.addEventListener('mouseenter', () => { img.src = alt; });
    item.addEventListener('mouseleave', () => { img.src = original; });
  });

  /* ---- SUBTLE CURSOR GLOW (desktop, motion allowed) ---- */
  if (window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
    const glow = document.createElement('div');
    glow.setAttribute('aria-hidden', 'true');
    glow.style.cssText = `
      position: fixed;
      width: 360px;
      height: 360px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(107,33,168,0.07) 0%, transparent 70%);
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: left 0.8s cubic-bezier(0.22,1,0.36,1), top 0.8s cubic-bezier(0.22,1,0.36,1);
      z-index: 0;
      will-change: left, top;
    `;
    document.body.appendChild(glow);

    let gx = 0, gy = 0, gTick = false;
    document.addEventListener('mousemove', (e) => {
      gx = e.clientX; gy = e.clientY;
      if (gTick) return;
      gTick = true;
      requestAnimationFrame(() => {
        glow.style.left = gx + 'px';
        glow.style.top  = gy + 'px';
        gTick = false;
      });
    }, { passive: true });
  }

  /* ---- SHARED API ---- */
  window.Lataj = Object.assign(window.Lataj || {}, { showToast, lockScroll, unlockScroll });

})();
