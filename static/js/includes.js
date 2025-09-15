document.addEventListener('DOMContentLoaded', () => {
    const load = (sel, url) =>
      fetch(url)
        .then(r => r.ok ? r.text() : Promise.reject(r.statusText))
        .then(html => { document.querySelector(sel).innerHTML = html; })
        .catch(err => console.error(`Error loading ${url}:`, err));
  
    // inject header & footer
    const headerLoaded = load('#site-header', 'partials/header.html');
    load('#site-footer', 'partials/footer.html');

  // once header is in place, highlight active link and enable mobile nav
  headerLoaded.then(() => {
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav a').forEach(a => {
      if (a.getAttribute('href') === path) a.classList.add('active');
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
