const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animatedSections = document.querySelectorAll('.section-anim');
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0,
    rootMargin: '0px 0px -10% 0px'
  });

  animatedSections.forEach((section) => {
    sectionObserver.observe(section);
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
        const siblings = Array.from(entry.target.parentElement.children)
          .filter((el) => el.classList.contains('reveal'));
        const index = siblings.indexOf(entry.target);

        window.setTimeout(() => {
          entry.target.classList.add('visible');
        }, Math.max(0, index) * 70);

        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0,
    rootMargin: '0px 0px -8% 0px'
  });

  revealElements.forEach((el) => {
    revealObserver.observe(el);
  });
} else {
  animatedSections.forEach((section) => section.classList.add('in-view'));
  revealElements.forEach((el) => el.classList.add('visible'));
}

/*
 * Keep the whole project card clickable with a pointer, while leaving keyboard
 * semantics to the real <a> element inside the card. This avoids nested
 * interactive roles and duplicate tab stops.
 */
document.querySelectorAll('.pc').forEach((card) => {
  const projectLink = card.querySelector('.pl');
  if (!projectLink) return;

  card.addEventListener('click', (event) => {
    if (event.target.closest('a')) return;
    window.open(projectLink.href, '_blank', 'noopener,noreferrer');
  });
});

const loader = document.getElementById('site-loader');
let loaderHidden = false;

function hideLoader(delay = 0) {
  if (!loader || loaderHidden) return;

  loaderHidden = true;
  const bar = document.querySelector('.loader-bar-fill');

  if (bar) {
    bar.style.animation = 'none';
    bar.style.transition = 'transform 0.3s ease-out';

    requestAnimationFrame(() => {
      bar.style.transform = 'scaleX(1)';
    });
  }

  window.setTimeout(() => {
    loader.classList.add('hide');

    window.setTimeout(() => {
      loader.remove();
    }, 550);
  }, delay + 350);
}


window.addEventListener('chip3d-ready', () => {
  hideLoader(220);
});

window.addEventListener('load', () => {
  window.setTimeout(() => hideLoader(), 4000);
});
