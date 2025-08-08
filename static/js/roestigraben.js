document.addEventListener('DOMContentLoaded', () => {
  const switcher = document.querySelector('.language-switcher');
  if (switcher) {
    const buttons = switcher.querySelectorAll('.lang-btn');
    const slider = document.createElement('span');
    slider.className = 'lang-slider';
    switcher.appendChild(slider);

    function moveSlider(target) {
      slider.style.width = `${target.offsetWidth}px`;
      slider.style.height = `${target.offsetHeight}px`;
      slider.style.transform = `translate(${target.offsetLeft}px, ${target.offsetTop}px)`;
    }

    const active = switcher.querySelector('.active');
    if (active) {
      slider.style.transition = 'none';
      moveSlider(active);
      requestAnimationFrame(() => {
        slider.style.transition = 'transform 0.3s ease, width 0.3s ease';
      });
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', e => {
        const href = btn.getAttribute('href');
        if (href) {
          e.preventDefault();
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          moveSlider(btn);
          setTimeout(() => {
            window.location.href = href;
          }, 200);
        }
      });
    });
  }

  const sections = document.querySelectorAll('.section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.fade-element').forEach(el => el.classList.add('visible'));
        entry.target.querySelectorAll('img.map').forEach(img => img.classList.add('visible'));
        const bg = entry.target.getAttribute('data-bg');
        document.documentElement.style.setProperty('--bg-color', bg);
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(sec => observer.observe(sec));
});
