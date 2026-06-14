document.addEventListener("DOMContentLoaded", () => {
  const siteBaseUrl = new URL(document.baseURI || window.location.href);
  const siteBasePath = siteBaseUrl.pathname.endsWith("/")
    ? siteBaseUrl.pathname
    : `${siteBaseUrl.pathname}/`;

  const fallbackModel = {
    socialLinks: [
      { href: "https://www.linkedin.com/in/aj-im/", label: "LinkedIn" },
      { href: "https://github.com/joonhaim", label: "GitHub" },
    ],
    menu: [
      { href: "./", label: "Home" },
      { href: "about/", label: "About" },
      {
        href: "projects/",
        label: "Projects",
        children: [
          { href: "projects/edupace/", label: "EduPace" },
          {
            href: "projects/swiss-hospital-insights/",
            label: "Swiss Hospital Insights",
          },
          {
            href: "projects/reinforcement-learning/",
            label: "Reinforcement Learning",
          },
          { href: "projects/neural-networks/", label: "Neural Networks" },
          { href: "projects/", label: "All Projects →" },
        ],
      },
      { href: "contact/", label: "Contact" },
    ],
    footerText: "© 2026 Adrien Joon-Ha Im",
  };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const renderFallbackHeader = () => {
    const socialMarkup = fallbackModel.socialLinks
      .map(
        ({ href, label }) =>
          `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`,
      )
      .join("");

    const navMarkup = fallbackModel.menu
      .map((item) => {
        if (!item.children?.length) {
          return `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`;
        }

        const childrenMarkup = item.children
          .map(
            ({ href, label }) =>
              `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`,
          )
          .join("");

        return `
          <li class="has-dropdown">
            <a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}<span class="arrow">▾</span></a>
            <ul class="dropdown-menu">${childrenMarkup}</ul>
          </li>
        `;
      })
      .join("");

    return `
      <header class="site-header fallback-shell" data-fallback="true">
        <a class="site-mark" href="./" aria-label="Adrien Im, home">
          <span class="site-mark__name">Adrien Im</span>
          <span class="site-mark__role">Data Science / Biomedical AI</span>
        </a>
        <button id="nav-toggle" class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">Menu</button>
        <div class="site-header__nav">
          <nav class="main-nav" aria-label="Primary navigation">
            <ul>${navMarkup}</ul>
          </nav>
          <div class="social-links">${socialMarkup}</div>
        </div>
      </header>
    `;
  };

  const renderFallbackFooter = () => `
    <footer class="site-footer fallback-shell" data-fallback="true">
      <p>${escapeHtml(fallbackModel.footerText)}</p>
      <p>Leiden / Bern</p>
    </footer>
  `;

  const minimalFallbacks = {
    "#site-header": renderFallbackHeader,
    "#site-footer": renderFallbackFooter,
  };

  const normalisePath = (pathname) => {
    if (!pathname || pathname === "/") {
      return "/";
    }

    let next = pathname.replace(/\/index\.html$/, "/");
    if (!next.endsWith("/")) {
      next = `${next}/`;
    }

    return next.replace(/\/{2,}/g, "/");
  };

  const toSitePath = (value) => {
    const url = value instanceof URL ? value : new URL(value, siteBaseUrl);
    let { pathname } = url;

    if (
      window.location.protocol === "file:" &&
      pathname.startsWith(siteBasePath)
    ) {
      pathname = `/${pathname.slice(siteBasePath.length)}`;
    }

    return normalisePath(pathname || "/");
  };

  const load = (sel, url) => {
    const container = document.querySelector(sel);
    if (!container) return Promise.resolve(null);

    const hasMarkup =
      container.childElementCount > 0 ||
      container.textContent.trim().length > 0;
    if (hasMarkup) return Promise.resolve(container);

    return fetch(url)
      .then((r) => (r.ok ? r.text() : Promise.reject(r.statusText)))
      .then((html) => {
        container.innerHTML = html;
        return container;
      })
      .catch((err) => {
        console.error(`Error loading ${url}:`, err);
        const renderFallback = minimalFallbacks[sel];
        if (renderFallback) {
          container.innerHTML = renderFallback();
        } else {
          container.textContent = "Unable to load shared include.";
        }
        return container;
      });
  };

  const headerLoaded = load(
    "#site-header",
    new URL("static/includes/header.html", siteBaseUrl).href,
  );
  load(
    "#site-footer",
    new URL("static/includes/footer.html", siteBaseUrl).href,
  );

  headerLoaded.then(() => {
    const currentPath = toSitePath(window.location.href);
    document.querySelectorAll(".main-nav a").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;

      const linkPath = toSitePath(href);
      const isActive =
        linkPath === "/"
          ? currentPath === "/"
          : currentPath === linkPath || currentPath.startsWith(linkPath);

      a.classList.toggle("active", isActive);
    });

    const navToggle = document.getElementById("nav-toggle");
    const mainNav = document.querySelector(".main-nav");
    if (navToggle && mainNav) {
      navToggle.addEventListener("click", () => {
        mainNav.classList.toggle("open");
        const expanded = mainNav.classList.contains("open");
        navToggle.setAttribute("aria-expanded", expanded);
      });
    }
  });
});
