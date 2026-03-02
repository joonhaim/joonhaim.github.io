(() => {
  const target = document
    .querySelector('meta[name="redirect-target"]')
    ?.getAttribute('content');

  if (!target) {
    return;
  }

  const destination = new URL(target, window.location.origin);
  destination.search = window.location.search;
  destination.hash = window.location.hash;

  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const next = `${destination.pathname}${destination.search}${destination.hash}`;

  if (current !== next) {
    window.location.replace(next);
  }
})();
