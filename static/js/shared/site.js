// Shared page interactions and global integrations.
(function () {
  const host = window.location.hostname;
  const blockedHosts = new Set(["", "localhost", "127.0.0.1"]);

  if (blockedHosts.has(host) || host.endsWith(".local")) {
    return;
  }

  const script = document.createElement("script");
  script.defer = true;
  script.dataset.domain = "joonhaim.github.io";
  script.src = "https://plausible.io/js/script.js";
  document.head.appendChild(script);
})();
