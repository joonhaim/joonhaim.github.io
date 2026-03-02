document.addEventListener('DOMContentLoaded', () => {
  const siteBaseUrl = new URL(document.baseURI || window.location.href);
  const siteBasePath = siteBaseUrl.pathname.endsWith('/')
    ? siteBaseUrl.pathname
    : `${siteBaseUrl.pathname}/`;
  const includeFallbacks = {
    '#site-header': `
      <header class="site-header">
        <div class="social-links">
          <a href="https://www.linkedin.com/in/aj-im/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://github.com/joonhaim" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
        <button id="nav-toggle" class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">&#9776; Menu</button>
        <nav class="main-nav">
          <ul>
            <li><a href="./">Home</a></li>
            <li><a href="about/">About</a></li>
            <li class="has-dropdown">
              <a href="projects/">Projects<span class="arrow">&#9662;</span></a>
              <ul class="dropdown-menu">
                <li><a href="projects/edupace/">EduPace <span class="flagship-star" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false"><path d="M12 3.4l2.6 5.4 6 0.9-4.3 4.1 1 5.9-5.3-2.8-5.3 2.8 1-5.9L3.4 9.7l6-0.9z" fill="currentColor" /></svg></span></a></li>
                <li><a href="projects/swiss-hospital-insights/">Swiss Hospital Insights <span class="flagship-star" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false"><path d="M12 3.4l2.6 5.4 6 0.9-4.3 4.1 1 5.9-5.3-2.8-5.3 2.8 1-5.9L3.4 9.7l6-0.9z" fill="currentColor" /></svg></span></a></li>
                <li><a href="projects/reinforcement-learning/">Reinforcement Learning</a></li>
                <li><a href="projects/neural-networks/">Neural Networks</a></li>
                <li><a href="projects/">All Projects&nbsp;&rarr;</a></li>
              </ul>
            </li>
            <li><a href="contact/">Contact</a></li>
          </ul>
        </nav>
      </header>
    `,
    '#site-footer': `
      <footer class="site-footer">
        <p>&copy; 2025 Adrien Joon-Ha Im</p>
      </footer>
    `
  };

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

  const toSitePath = (value) => {
    const url = value instanceof URL ? value : new URL(value, siteBaseUrl);
    let { pathname } = url;

    if (window.location.protocol === 'file:' && pathname.startsWith(siteBasePath)) {
      pathname = `/${pathname.slice(siteBasePath.length)}`;
    }

    return normalisePath(pathname || '/');
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
        const fallback = includeFallbacks[sel];
        if (fallback) {
          container.innerHTML = fallback;
        }
        return container;
      });
  };

  // inject header & footer when needed
  const headerLoaded = load('#site-header', new URL('static/includes/header.html', siteBaseUrl).href);
  load('#site-footer', new URL('static/includes/footer.html', siteBaseUrl).href);

  // once header is in place, highlight active link and enable mobile nav
  headerLoaded.then(() => {
    const currentPath = toSitePath(window.location.href);
    document.querySelectorAll('.main-nav a').forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;

      const linkPath = toSitePath(href);
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
