(() => {
  const target = document
    .querySelector('meta[name="redirect-target"]')
    ?.getAttribute('content');

  if (!target) {
    return;
  }

  const destination = new URL(target, document.baseURI || window.location.href);
  destination.search = window.location.search;
  destination.hash = window.location.hash;

  const current = `${window.location.href}`;
  const next = `${destination.href}`;

  if (current !== next) {
    window.location.replace(destination.href);
  }
})();
