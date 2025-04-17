// Highlight the current nav link based on page URL
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav a');
    const path = window.location.pathname.split('/').pop() || 'index.html';
  
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === path || (href === '/' && path === 'index.html')) {
        link.classList.add('active');
      }
    });
  
    // Auto‑update footer copyright year
    const footer = document.querySelector('footer');
    const year = new Date().getFullYear();
    footer.textContent = `© ${year} Joon‑Ha`;
  });
  