/* ============================================================
   JAASIEL EDUCATION CENTRE – MAIN JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── LOADER ──
  const loader = document.getElementById('loader');
  if (loader) {
    const hideLoader = () => loader.classList.add('hidden');
    // Hide after 2s max — works whether load already fired or not
    const loaderTimer = setTimeout(hideLoader, 2000);
    if (document.readyState === 'complete') {
      // Page already loaded before script ran
      clearTimeout(loaderTimer);
      setTimeout(hideLoader, 500);
    } else {
      window.addEventListener('load', () => {
        clearTimeout(loaderTimer);
        setTimeout(hideLoader, 500);
      });
    }
  }

  // ── NAVBAR SCROLL ──
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // ── HAMBURGER MENU ──
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    // The hamburger spans already animate into an X via CSS (.hamburger.open)
    // No injected button needed — one button, one X, no duplicates.

    const closeMenu = () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    };
    const openMenu = () => {
      hamburger.classList.add('open');
      navLinks.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    // Single toggle — works as both open AND close button
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.contains('open') ? closeMenu() : openMenu();
    });

    // Close when any nav link is tapped
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeMenu);
    });

    // Close when tapping the dark backdrop outside the nav
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') &&
          !navLinks.contains(e.target) &&
          !hamburger.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // ── SCROLL REVEAL ──
  const revealEls = document.querySelectorAll(
    '.feature-card, .program-card, .testi-card, .news-card--big, .news-card-sm, .mvv-card, .team-card, .step, .extra-item, .gallery-item, .about-snap-grid > *, .stat-big'
  );
  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));

  // ── COUNTER ANIMATION ──
  function animateCounter(el, target, suffix, duration = 1600) {
    let start = 0;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const statNums = document.querySelectorAll('.stat-num, .stat-num-big');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const raw = el.textContent.replace(/[^0-9]/g, '');
        const suffix = el.textContent.replace(/[0-9,]/g, '');
        if (raw) {
          // Pre-set to final value dimensions so there's no layout shift
          el.dataset.finalText = el.textContent;
          animateCounter(el, parseInt(raw), suffix);
        }
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => counterObserver.observe(el));

  // ── ACTIVE NAV LINK ──
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPath) a.classList.add('active');
  });

  // ── SMOOTH SCROLL for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});