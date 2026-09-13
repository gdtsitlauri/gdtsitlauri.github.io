'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── SECTION / CARD REVEALS ── */
const animatedSections = document.querySelectorAll('.section-anim');
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      sectionObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0,
    rootMargin: '0px 0px -10% 0px'
  });

  animatedSections.forEach((section) => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.classList.contains('visible')) return;

      const siblings = Array.from(entry.target.parentElement?.children ?? [])
        .filter((element) => element.classList.contains('reveal'));
      const index = Math.max(0, siblings.indexOf(entry.target));

      window.setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 70);

      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0,
    rootMargin: '0px 0px -8% 0px'
  });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  animatedSections.forEach((section) => section.classList.add('in-view'));
  revealElements.forEach((element) => element.classList.add('visible'));
}

/* ── PROJECT CARDS ──
   Pointer users can click the whole card. Keyboard semantics remain on the
   real anchor inside each card, avoiding duplicate interactive tab stops. */
document.querySelectorAll('.pc').forEach((card) => {
  const projectLink = card.querySelector('.pl');
  if (!projectLink) return;

  card.addEventListener('click', (event) => {
    if (event.target.closest('a')) return;
    window.open(projectLink.href, '_blank', 'noopener,noreferrer');
  });
});

/* ── FOOTER: BACK TO TOP ──
   The footer control is now a <button>, so no URL preview/hash is exposed.
   Keep the same smooth scroll-to-top behavior. */
const footerTopButton = document.querySelector('.footer-top-btn');

footerTopButton?.addEventListener('click', (event) => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  });

  if (event.detail === 0) {
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }

  if (window.location.hash) {
    history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search
    );
  }
});

/* ── SITE LOADER ── */
const loader = document.getElementById('site-loader');
let loaderHidden = false;
let loaderFallbackTimer = null;

function hideLoader(delay = 0) {
  if (!loader || loaderHidden) return;

  loaderHidden = true;

  if (loaderFallbackTimer !== null) {
    window.clearTimeout(loaderFallbackTimer);
    loaderFallbackTimer = null;
  }

  const bar = loader.querySelector('.loader-bar-fill');

  if (bar) {
    bar.style.animation = 'none';
    bar.style.transition = 'transform 0.3s ease-out';

    requestAnimationFrame(() => {
      bar.style.transform = 'scaleX(1)';
    });
  }

  const settleDelay = prefersReducedMotion ? 0 : delay + 350;
  const cleanupDelay = prefersReducedMotion ? 0 : 550;

  window.setTimeout(() => {
    loader.classList.add('hide');

    // Remove the fixed full-screen layer after its fade. This also keeps
    // Safari's browser-chrome color sampling from seeing an invisible overlay.
    window.setTimeout(() => loader.remove(), cleanupDelay);
  }, settleDelay);
}

// Never let a slow/failed external 3D dependency keep the full-screen loader
// blocking the portfolio indefinitely.
loaderFallbackTimer = window.setTimeout(() => hideLoader(), 6000);

window.addEventListener('chip3d-ready', () => {
  hideLoader(220);
}, { once: true });
