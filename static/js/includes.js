document.addEventListener('DOMContentLoaded', () => {
  const load = (sel, url) => {
    const container = document.querySelector(sel);
    if (!container) return Promise.resolve(null);

    const hasMarkup = container.childElementCount > 0 || container.textContent.trim().length > 0;
    if (hasMarkup) return Promise.resolve(container);

    return fetch(url)
      .then(r => (r.ok ? r.text() : Promise.reject(r.statusText)))
      .then(html => {
        container.innerHTML = html;
        return container;
      })
      .catch(err => {
        console.error(`Error loading ${url}:`, err);
        return container;
      });
  };

  // inject header & footer when needed
  const headerLoaded = load('#site-header', '/partials/header.html');
  load('#site-footer', '/partials/footer.html');

  // once header is in place, highlight active link and enable mobile nav
  headerLoaded.then(() => {
    const currentPath = location.pathname.replace(/\/$/, '') || '/index.html';
    document.querySelectorAll('.main-nav a').forEach(a => {
      const linkPath = new URL(a.href).pathname.replace(/\/$/, '');
      if (linkPath === currentPath) a.classList.add('active');
    });

    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (navToggle && mainNav) {
      navToggle.addEventListener('click', () => {
        mainNav.classList.toggle('open');
        const expanded = mainNav.classList.contains('open');
        navToggle.setAttribute('aria-expanded', expanded);
      });
    }
  });
});
