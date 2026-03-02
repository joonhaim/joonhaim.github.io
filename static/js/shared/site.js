document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.featured-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.featured-track');
  const slides = Array.from(track?.querySelectorAll('.promo-banner') || []);
  if (!track || slides.length === 0) return;

  const controls = Array.from(carousel.querySelectorAll('.featured-control'));
  const intervalMs = Number.parseInt(carousel.dataset.interval || '5000', 10);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentIndex = 0;
  let timerId = null;

  const updateSlides = () => {
    const offset = currentIndex * -100;
    track.style.transform = `translateX(${offset}%)`;
    slides.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', index === currentIndex ? 'false' : 'true');
    });
  };

  const goTo = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    updateSlides();
  };

  const next = () => goTo(currentIndex + 1);
  const prev = () => goTo(currentIndex - 1);

  const startTimer = () => {
    if (prefersReducedMotion || slides.length < 2) return;
    stopTimer();
    timerId = window.setInterval(next, intervalMs);
  };

  const stopTimer = () => {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  };

  controls.forEach(control => {
    control.addEventListener('click', () => {
      const direction = control.dataset.direction;
      if (direction === 'next') {
        next();
      } else {
        prev();
      }
      startTimer();
    });
  });

  carousel.addEventListener('mouseenter', stopTimer);
  carousel.addEventListener('mouseleave', startTimer);
  carousel.addEventListener('focusin', stopTimer);
  carousel.addEventListener('focusout', startTimer);

  updateSlides();
  startTimer();
});
