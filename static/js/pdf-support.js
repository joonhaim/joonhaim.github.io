(function() {
  const ua = navigator.userAgent || '';
  const isIOS = /iP(hone|ad|od)/.test(ua) || (ua.includes('Mac') && 'ontouchend' in window);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const pdfViewerFlag = typeof navigator.pdfViewerEnabled === 'boolean' ? navigator.pdfViewerEnabled : true;
  const pdfSupported = pdfViewerFlag && !(isIOS && isSafari);

  if (!pdfSupported) {
    document.documentElement.classList.add('pdf-preview-unsupported');
    const containers = document.querySelectorAll('.pdf-container');
    containers.forEach(container => container.classList.add('show-fallback'));
  }
})();
