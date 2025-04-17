// includes.js
document.addEventListener('DOMContentLoaded', () => {
    const load = (sel, url) =>
      fetch(url)
        .then(r => r.ok ? r.text() : Promise.reject(r.statusText))
        .then(html => { document.querySelector(sel).innerHTML = html; })
        .catch(err => console.error(`Error loading ${url}:`, err));
  
    // inject header & footer
    load('#site-header', 'partials/header.html');
    load('#site-footer', 'partials/footer.html');
  
    // once header is in place, highlight active link
    load('#site-header', 'partials/header.html').then(() => {
      const path = location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.main-nav a').forEach(a => {
        if (a.getAttribute('href') === path) a.classList.add('active');
      });
    });
  });
  