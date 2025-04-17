// --- Atmosphere functions (ported from Java) ---
const T0=288.15,P0=101325,g=9.80665,a0_a1=-0.0065,a2_a3=0.001,a3_a4=0.0028,R=287;
function getTemp(alt){
  if(alt<=11000) return T0+a0_a1*alt;
  if(alt<=20000) return T0+a0_a1*11000;
  if(alt<=32000) return T0+a0_a1*11000 + a2_a3*(alt-20000);
  if(alt<=47000) return T0+a0_a1*11000 + a2_a3*12000 + a3_a4*(alt-32000);
  return T0;
}
function getPres(alt){
  if(alt<=11000) return P0*Math.pow(getTemp(alt)/T0,-g/(a0_a1*R));
  if(alt<=20000) return getPres(11000)*Math.exp(-g*(alt-11000)/(R*getTemp(alt)));
  if(alt<=32000) return getPres(20000)*Math.pow(getTemp(alt)/getTemp(20000),-g/(a2_a3*R));
  if(alt<=47000) return getPres(32000)*Math.pow(getTemp(alt)/getTemp(32000),-g/(a3_a4*R));
  return P0;
}
function getDens(alt){ return getPres(alt)/(R*getTemp(alt)); }
// --- end Atmosphere functions ---


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
  