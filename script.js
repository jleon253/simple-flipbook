/**
 * Mobile Slider for Flip Book
 *
 * On mobile (viewport <= 768px), the standard CSS-only flip book
 * is hidden and replaced by a horizontal slider showing one page at a time.
 * On desktop, the slider is hidden and the flip book works as normal.
 */

(() => {
  const MOBILE_BREAKPOINT = 768;

  /** Collect all "slides" in display order:
   *  - front cover  (single side)
   *  - for each .page: front_page content, then back_page content
   *  - back cover   (single side)
   *
   *  Each slide is { label, content } where label mirrors what's on the page.
   */
  function buildSlides() {
    const slides = [];

    // Front cover
    const frontCover = document.querySelector('.front_cover');
    if (frontCover) {
      slides.push({ node: frontCover.cloneNode(true), type: 'cover-front' });
    }

    // Pages (each .page has .front_page and .back_page)
    document.querySelectorAll('.page').forEach((page) => {
      const front = page.querySelector('.front_page');
      const back = page.querySelector('.back_page');
      if (front) slides.push({ node: front.cloneNode(true), type: 'page' });
      if (back) slides.push({ node: back.cloneNode(true), type: 'page' });
    });

    // Back cover
    const backCover = document.querySelector('.back_cover');
    if (backCover) {
      slides.push({ node: backCover.cloneNode(true), type: 'cover-back' });
    }

    return slides;
  }

  function createMobileSlider() {
    const existing = document.getElementById('mobile_slider');
    if (existing) existing.remove();

    const slides = buildSlides();
    let currentIndex = 0;

    // Wrapper
    const wrapper = document.createElement('div');
    wrapper.id = 'mobile_slider';

    // Track
    const track = document.createElement('div');
    track.className = 'ms-track';

    slides.forEach((s, i) => {
      const slide = document.createElement('div');
      slide.className = 'ms-slide';

      const inner = document.createElement('div');
      inner.className = 'ms-slide-inner';

      // Strip old labels from clone to avoid checkbox side effects
      inner.appendChild(s.node);
      inner.querySelectorAll('label').forEach((l) => l.remove());

      slide.appendChild(inner);
      track.appendChild(slide);
    });

    wrapper.appendChild(track);

    // Navigation arrows
    const prevBtn = document.createElement('button');
    prevBtn.className = 'ms-btn ms-prev';
    prevBtn.setAttribute('aria-label', 'Página anterior');
    prevBtn.innerHTML = '&#8249;';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'ms-btn ms-next';
    nextBtn.setAttribute('aria-label', 'Página siguiente');
    nextBtn.innerHTML = '&#8250;';

    // Dots
    const dots = document.createElement('div');
    dots.className = 'ms-dots';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'ms-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Ir a la página ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dots.appendChild(dot);
    });

    wrapper.appendChild(prevBtn);
    wrapper.appendChild(nextBtn);
    wrapper.appendChild(dots);

    function updateDots() {
      dots.querySelectorAll('.ms-dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentIndex);
      });
    }

    function goTo(index) {
      currentIndex = Math.max(0, Math.min(index, slides.length - 1));
      track.style.transform = `translateX(${-currentIndex * 100}%)`;
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === slides.length - 1;
      updateDots();
    }

    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    // Swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 40) {
        goTo(currentIndex + (delta > 0 ? 1 : -1));
      }
    }, { passive: true });

    goTo(0);

    // Insert after <main> or in body
    const main = document.querySelector('main');
    main.insertAdjacentElement('afterend', wrapper);
  }

  function init() {
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const flipBook = document.getElementById('flip_book');
    const main = document.querySelector('main');
    const existingSlider = document.getElementById('mobile_slider');

    if (isMobile) {
      if (main) main.style.display = 'none';
      if (!existingSlider) createMobileSlider();
      else existingSlider.style.display = '';
    } else {
      if (main) main.style.display = '';
      if (existingSlider) existingSlider.style.display = 'none';
    }
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 150);
  });

  document.addEventListener('DOMContentLoaded', init);
})();
