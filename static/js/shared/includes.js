document.addEventListener('DOMContentLoaded', () => {
  const normalisePath = (pathname) => {
    if (!pathname || pathname === '/') {
      return '/';
    }

    let next = pathname.replace(/\/index\.html$/, '/');
    if (!next.endsWith('/')) {
      next = `${next}/`;
    }

    return next.replace(/\/{2,}/g, '/');
  };

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
  const headerLoaded = load('#site-header', '/static/includes/header.html');
  load('#site-footer', '/static/includes/footer.html');

  // once header is in place, highlight active link and enable mobile nav
  headerLoaded.then(() => {
    const currentPath = normalisePath(location.pathname);
    document.querySelectorAll('.main-nav a').forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;

      const linkPath = normalisePath(new URL(href, location.origin).pathname);
      const isActive = linkPath === '/'
        ? currentPath === '/'
        : currentPath === linkPath || currentPath.startsWith(linkPath);

      a.classList.toggle('active', isActive);
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
