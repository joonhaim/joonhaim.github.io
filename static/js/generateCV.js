document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('download-cv');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const element = document.querySelector('main');
    if (!element) return;
    element.classList.add('pdf-export');
    const opt = {
      margin:       0.4,
      filename:     'Adrien_Joon-Ha_Im_CV.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all'] }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      element.classList.remove('pdf-export');
    });
  });
});
