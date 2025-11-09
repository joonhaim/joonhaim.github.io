const languageSwitcher = document.querySelector('.language-switcher');
if (languageSwitcher) {
  const languageButtons = Array.from(languageSwitcher.querySelectorAll('.lang-btn'));
  if (languageButtons.length) {
    const slider = document.createElement('span');
    slider.className = 'lang-slider';
    languageSwitcher.appendChild(slider);
    languageSwitcher.classList.add('has-slider');

    const moveSlider = (target) => {
      slider.style.width = `${target.offsetWidth}px`;
      slider.style.height = `${target.offsetHeight}px`;
      slider.style.transform = `translate(${target.offsetLeft}px, ${target.offsetTop}px)`;
    };

    const setActive = (target) => {
      languageButtons.forEach(btn => btn.classList.remove('active'));
      target.classList.add('active');
      moveSlider(target);
    };

    const initialActive = languageSwitcher.querySelector('.lang-btn.active') || languageButtons[0];
    if (initialActive) {
      slider.style.transition = 'none';
      moveSlider(initialActive);
      requestAnimationFrame(() => {
        slider.style.transition = 'transform 0.3s ease, width 0.3s ease, height 0.3s ease';
      });
    }

    languageButtons.forEach(button => {
      if (button.tagName === 'A') {
        button.addEventListener('click', (event) => {
          const href = button.getAttribute('href');
          if (href) {
            event.preventDefault();
            setActive(button);
            setTimeout(() => {
              window.location.href = href;
            }, 200);
          }
        });
      }
    });

    window.addEventListener('resize', () => {
      const currentActive = languageSwitcher.querySelector('.lang-btn.active');
      if (currentActive) {
        moveSlider(currentActive);
      }
    });
  }
}

const scrollHideElements = document.querySelectorAll('.header-left, .swiss-cross');
if (scrollHideElements.length) {
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  let lastScrollY = window.scrollY;
  let isHidden = false;
  const hideThreshold = 120;

  const setHidden = (shouldHide) => {
    if (shouldHide === isHidden) {
      return;
    }
    scrollHideElements.forEach((element) => {
      element.classList.toggle('is-hidden-mobile', shouldHide);
    });
    isHidden = shouldHide;
  };

  const handleScroll = () => {
    const currentY = window.scrollY;

    if (!mobileQuery.matches) {
      setHidden(false);
      lastScrollY = currentY;
      return;
    }

    const isScrollingDown = currentY > lastScrollY;

    if (isScrollingDown && currentY > hideThreshold) {
      setHidden(true);
    } else if (!isScrollingDown || currentY <= hideThreshold) {
      setHidden(false);
    }

    lastScrollY = currentY;
  };

  const handleViewportChange = (event) => {
    if (!event.matches) {
      setHidden(false);
    }
    lastScrollY = window.scrollY;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener('change', handleViewportChange);
  } else if (mobileQuery.addListener) {
    mobileQuery.addListener(handleViewportChange);
  }

  handleScroll();
}

const normalizeString = (value) =>
  (value || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();

const normalizeAlphanumeric = (value) => normalizeString(value).replace(/[^a-z0-9]/g, '');
const decodeHtml = (html) => {
  if (!html) {
    return '';
  }
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
};
const escapeAttribute = (value) =>
  (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
const escapeHtml = (value) =>
  (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
const fadeObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
});

document.querySelectorAll('.fade-element').forEach(el => fadeObserver.observe(el));

const procedureSelector = document.querySelector('.finder-procedure-selector');
const catalogToggle = document.querySelector('.finder-catalog-toggle');
const catalogPanels = document.getElementById('finder-catalog-panels');

if (procedureSelector && catalogToggle && catalogPanels) {
  const toggleLabel = catalogToggle.querySelector('.finder-catalog-toggle-label');
  const collapsedLabel = catalogToggle.dataset.labelCollapsed || 'Browse the full catalogue';
  const expandedLabel = catalogToggle.dataset.labelExpanded || 'Hide the full catalogue';

  const setCatalogExpanded = (expanded) => {
    const isExpanded = !procedureSelector.classList.contains('catalog-collapsed');
    if (expanded === isExpanded) {
      catalogPanels.hidden = !expanded;
      if (expanded) {
        catalogPanels.style.maxHeight = 'none';
      } else {
        catalogPanels.style.maxHeight = '0px';
      }
      catalogToggle.setAttribute('aria-expanded', String(expanded));
      if (toggleLabel) {
        toggleLabel.textContent = expanded ? expandedLabel : collapsedLabel;
      }
      return;
    }

    if (expanded) {
      catalogPanels.hidden = false;
      procedureSelector.classList.remove('catalog-collapsed');
      catalogPanels.style.maxHeight = 'none';
      const fullHeight = catalogPanels.scrollHeight;
      catalogPanels.style.maxHeight = '0px';
      // Force reflow so the browser recognises the starting height before animating.
      void catalogPanels.offsetHeight;
      catalogPanels.style.maxHeight = `${fullHeight}px`;
    } else {
      const currentHeight = catalogPanels.scrollHeight;
      catalogPanels.style.maxHeight = `${currentHeight}px`;
      void catalogPanels.offsetHeight;
      procedureSelector.classList.add('catalog-collapsed');
      catalogPanels.style.maxHeight = '0px';
    }

    catalogToggle.setAttribute('aria-expanded', String(expanded));
    if (toggleLabel) {
      toggleLabel.textContent = expanded ? expandedLabel : collapsedLabel;
    }
  };

  if (procedureSelector.classList.contains('catalog-collapsed')) {
    catalogPanels.style.maxHeight = '0px';
    catalogPanels.hidden = true;
    catalogToggle.setAttribute('aria-expanded', 'false');
    if (toggleLabel) {
      toggleLabel.textContent = collapsedLabel;
    }
  } else {
    catalogPanels.style.maxHeight = 'none';
    catalogPanels.hidden = false;
    catalogToggle.setAttribute('aria-expanded', 'true');
    if (toggleLabel) {
      toggleLabel.textContent = expandedLabel;
    }
  }

  catalogPanels.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'max-height') {
      return;
    }
    if (!procedureSelector.classList.contains('catalog-collapsed')) {
      catalogPanels.style.maxHeight = 'none';
      catalogPanels.hidden = false;
    } else {
      catalogPanels.hidden = true;
      catalogPanels.style.maxHeight = '0px';
    }
  });

  catalogToggle.addEventListener('click', () => {
    const shouldExpand = procedureSelector.classList.contains('catalog-collapsed');
    setCatalogExpanded(shouldExpand);
  });

  const procedureSearch = document.getElementById('finder-procedure-search');
  if (procedureSearch) {
    let userInteracted = false;
    const markUserInteracted = () => {
      userInteracted = true;
    };

    window.addEventListener('pointerdown', markUserInteracted, { once: true });
    window.addEventListener('keydown', markUserInteracted, { once: true });

    const autoExpand = () => setCatalogExpanded(true);

    procedureSearch.addEventListener('focus', () => {
      if (userInteracted) {
        autoExpand();
      }
    });
    procedureSearch.addEventListener('input', autoExpand);
  }
}

const cantonCentroids = {
  AG: { lat: 47.39, lon: 8.16 },
  AI: { lat: 47.32, lon: 9.41 },
  AR: { lat: 47.38, lon: 9.28 },
  BE: { lat: 46.95, lon: 7.45 },
  BL: { lat: 47.45, lon: 7.6 },
  BS: { lat: 47.56, lon: 7.59 },
  FR: { lat: 46.8, lon: 7.15 },
  GE: { lat: 46.2, lon: 6.14 },
  GL: { lat: 47.04, lon: 9.07 },
  GR: { lat: 46.66, lon: 9.57 },
  JU: { lat: 47.35, lon: 7.15 },
  LU: { lat: 47.05, lon: 8.27 },
  NE: { lat: 46.99, lon: 6.93 },
  NW: { lat: 46.95, lon: 8.41 },
  OW: { lat: 46.9, lon: 8.25 },
  SG: { lat: 47.42, lon: 9.37 },
  SH: { lat: 47.7, lon: 8.63 },
  SO: { lat: 47.21, lon: 7.53 },
  SZ: { lat: 47.05, lon: 8.73 },
  TG: { lat: 47.58, lon: 8.9 },
  TI: { lat: 46.16, lon: 8.96 },
  UR: { lat: 46.77, lon: 8.63 },
  VD: { lat: 46.62, lon: 6.64 },
  VS: { lat: 46.24, lon: 7.36 },
  ZG: { lat: 47.16, lon: 8.52 },
  ZH: { lat: 47.37, lon: 8.54 }
};

const SWITZERLAND_BOUNDS = {
  latMin: 45.8,
  latMax: 47.8,
  lonMin: 5.9,
  lonMax: 10.5
};

// Approximate lat/lon span (in degrees) for each canton to derive custom bounds.
const cantonSpan = {
  AG: { lat: 0.8, lon: 1.1 },
  AI: { lat: 0.35, lon: 0.35 },
  AR: { lat: 0.45, lon: 0.55 },
  BE: { lat: 1.6, lon: 1.7 },
  BL: { lat: 0.4, lon: 0.45 },
  BS: { lat: 0.28, lon: 0.28 },
  FR: { lat: 0.9, lon: 1.1 },
  GE: { lat: 0.4, lon: 0.45 },
  GL: { lat: 0.65, lon: 0.75 },
  GR: { lat: 1.8, lon: 2.1 },
  JU: { lat: 0.7, lon: 0.85 },
  LU: { lat: 0.9, lon: 1.05 },
  NE: { lat: 0.75, lon: 0.85 },
  NW: { lat: 0.45, lon: 0.5 },
  OW: { lat: 0.5, lon: 0.55 },
  SG: { lat: 1.2, lon: 1.6 },
  SH: { lat: 0.55, lon: 0.7 },
  SO: { lat: 0.85, lon: 1.0 },
  SZ: { lat: 0.7, lon: 0.85 },
  TG: { lat: 0.9, lon: 1.2 },
  TI: { lat: 1.2, lon: 1.3 },
  UR: { lat: 1.1, lon: 0.75 },
  VD: { lat: 1.2, lon: 1.3 },
  VS: { lat: 1.6, lon: 1.1 },
  ZG: { lat: 0.45, lon: 0.55 },
  ZH: { lat: 0.9, lon: 1.1 }
};

const cantonBounds = Object.fromEntries(
  Object.entries(cantonCentroids).map(([code, centroid]) => {
    const span = cantonSpan[code] ?? { lat: 0.8, lon: 0.8 };
    const latHalf = span.lat / 2;
    const lonHalf = span.lon / 2;
    return [
      code,
      {
        latMin: Math.max(SWITZERLAND_BOUNDS.latMin, centroid.lat - latHalf),
        latMax: Math.min(SWITZERLAND_BOUNDS.latMax, centroid.lat + latHalf),
        lonMin: Math.max(SWITZERLAND_BOUNDS.lonMin, centroid.lon - lonHalf),
        lonMax: Math.min(SWITZERLAND_BOUNDS.lonMax, centroid.lon + lonHalf)
      }
    ];
  })
);

const hospitalMetadataOverrides = {
  "AMEOS Spital Einsiedeln AG": { type: "private", canton: "SZ" },
  "Andreas Klinik": { type: "private", canton: "ZG" },
  "ArKa SA": { type: "private", canton: "TI" },
  "Asana Spital Leuggern AG": { type: "kanton", canton: "AG" },
  "Asana Spital Menziken AG": { type: "kanton", canton: "AG" },
  "Berit Klinik AG": { type: "private", canton: "AR" },
  "Berit Klinik Wattwil": { type: "private", canton: "SG" },
  "Bethesda Spital AG": { type: "private", canton: "BS" },
  "CHUV Centre Hospitalier Universitaire Vaudois": { type: "university", canton: "VD" },
  "Center da Sanadad Savognin SA": { type: "kanton", canton: "GR" },
  "Center da Sanda Engiadina Bassa Ospidal d'Engiadina Bassa": { type: "kanton", canton: "GR" },
  "Center da Sanda Val Müstair Akutabteilung": { type: "kanton", canton: "GR" },
  "Centro Sanitario Bregaglia Reparto Acuto": { type: "kanton", canton: "GR" },
  "Centro Sanitario Valposchiavo Ospedale San Sisto": { type: "kanton", canton: "GR" },
  "Clinique Bois-Cerf": { type: "private", canton: "VD" },
  "Clinique CIC Riviera": { type: "private", canton: "VD" },
  "Clinique CIC Valais SA": { type: "private", canton: "VS" },
  "Clinique Cecil": { type: "private", canton: "VD" },
  "Clinique Générale-Beaulieu": { type: "private", canton: "GE" },
  "Clinique de La Source": { type: "private", canton: "VD" },
  "Clinique de la Plaine": { type: "private", canton: "GE" },
  "Clinique des Grangettes SA": { type: "private", canton: "GE" },
  "Clinique la Colline": { type: "private", canton: "GE" },
  "EHC Ensemble hospitalier de la Côte": { type: "kanton", canton: "VD" },
  "EOC Ente ospedaliero cantonale": { type: "kanton", canton: "TI" },
  "Etablissements Hospitaliers du Nord Vaudois (eHnv)": { type: "kanton", canton: "VD" },
  "Flury Stiftung Spital Schiers": { type: "kanton", canton: "GR" },
  "GSMN Schweiz AG Clinique de Genolier": { type: "private", canton: "VD" },
  "GSMN Schweiz AG Clinique de Montchoisi": { type: "private", canton: "VD" },
  "GSMN Schweiz AG Privatklinik Bethanien": { type: "private", canton: "ZH" },
  "GSMN Schweiz AG Privatklinik Lindberg": { type: "private", canton: "ZH" },
  "GZO Spital Wetzikon": { type: "kanton", canton: "ZH" },
  "Gesundheitszentrum Fricktal": { type: "kanton", canton: "AG" },
  "Groupement Hospitalier de l'Ouest Lémanique (GHOL) SA": { type: "kanton", canton: "VD" },
  "Gruppo ospedaliero Moncucco Clinica Moncucco": { type: "private", canton: "TI" },
  "Gruppo ospedaliero Moncucco Clinica Santa Chiara SA": { type: "private", canton: "TI" },
  "HFR - Hôpital fribourgeois": { type: "kanton", canton: "FR" },
  "Herz-Neuro-Zentrum Bodensee AG": { type: "private", canton: "TG" },
  "Hirslanden Bern AG": { type: "private", canton: "BE" },
  "Hirslanden Klinik Aarau": { type: "private", canton: "AG" },
  "Hirslanden Klinik Am Rosenberg AG": { type: "private", canton: "AR" },
  "Hirslanden Klinik Birshof": { type: "private", canton: "BL" },
  "Hirslanden Klinik Linde AG": { type: "private", canton: "BE" },
  "Hirslanden Klinik St. Anna AG": { type: "private", canton: "LU" },
  "Hirslanden Klinik Stephanshorn": { type: "private", canton: "SG" },
  "Hôpital Intercantonal de la Broye (HIB)": { type: "kanton", canton: "VD" },
  "Hôpital Jules Daler": { type: "private", canton: "FR" },
  "Hôpital Riviera-Chablais Vaud-Valais": { type: "kanton", canton: "VD" },
  "Hôpital de la Tour": { type: "private", canton: "GE" },
  "Hôpital du Jura": { type: "kanton", canton: "JU" },
  "Hôpital du Valais Centre hospitalier du Valais Romand CHVR": { type: "kanton", canton: "VS" },
  "Insel Gruppe AG (nicht-universitär)": { type: "kanton", canton: "BE" },
  "Insel Gruppe AG (universitär)": { type: "university", canton: "BE" },
  "Kantonsspital Aarau AG": { type: "kanton", canton: "AG" },
  "Kantonsspital Baden AG": { type: "kanton", canton: "AG" },
  "Kantonsspital Baselland": { type: "kanton", canton: "BL" },
  "Kantonsspital Glarus": { type: "kanton", canton: "GL" },
  "Kantonsspital Graubünden": { type: "kanton", canton: "GR" },
  "Kantonsspital Obwalden": { type: "kanton", canton: "OW" },
  "Kantonsspital St. Gallen": { type: "kanton", canton: "SG" },
  "Kantonsspital Uri": { type: "kanton", canton: "UR" },
  "Kantonsspital Winterthur": { type: "kanton", canton: "ZH" },
  "Klinik Arlesheim AG": { type: "private", canton: "BL" },
  "Klinik Gut St. Moritz AG": { type: "private", canton: "GR" },
  "Klinik Hirslanden AG": { type: "private", canton: "ZH" },
  "Klinik Hohmad AG": { type: "private", canton: "BE" },
  "Klinik Im Park": { type: "private", canton: "ZH" },
  "Klinik Pyramide am See AG": { type: "private", canton: "ZH" },
  "Klinik Seeschau AG": { type: "private", canton: "TG" },
  "LUKS Spitalbetriebe AG": { type: "kanton", canton: "LU" },
  "Les Hôpitaux Universitaires de Genève HUG": { type: "university", canton: "GE" },
  "Lindenhofgruppe AG": { type: "private", canton: "BE" },
  "Matthea Geburtshaus": { type: "private", canton: "BE" },
  "Merian Iselin Klinik AG": { type: "private", canton: "BS" },
  "PALLIATIVKLINIK IM PARK": { type: "private", canton: "ZH" },
  "Praxisklinik Rennbahn AG": { type: "private", canton: "BL" },
  "Pôle santé Vallée de Joux Hôpital de la Vallée de Joux": { type: "kanton", canton: "VD" },
  "Pôle santé du Pays-d'Enhaut": { type: "kanton", canton: "VD" },
  "Regionalspital Emmental AG": { type: "kanton", canton: "BE" },
  "Regionalspital Surselva AG": { type: "kanton", canton: "GR" },
  "Rosenklinik AG": { type: "private", canton: "SG" },
  "Réseau Santé Balcon du Jura.vd (RSBJ)": { type: "kanton", canton: "VD" },
  "Réseau de l'Arc SA": { type: "private", canton: "JU" },
  "Réseau hospitalier neuchâtelois RHNe": { type: "kanton", canton: "NE" },
  "SRO AG": { type: "kanton", canton: "SO" },
  "Schulthess Klinik": { type: "private", canton: "ZH" },
  "See-Spital": { type: "kanton", canton: "ZH" },
  "Solothurner Spitäler AG": { type: "kanton", canton: "SO" },
  "Spezialklinik Gynäkologie, Neonatologie": { type: "private", canton: "BE" },
  "Spital Affoltern AG": { type: "kanton", canton: "ZH" },
  "Spital Bülach AG": { type: "kanton", canton: "ZH" },
  "Spital Davos AG Akutabteilung": { type: "kanton", canton: "GR" },
  "Spital Lachen": { type: "kanton", canton: "SZ" },
  "Spital Limmattal": { type: "kanton", canton: "ZH" },
  "Spital Linth": { type: "kanton", canton: "SG" },
  "Spital Männedorf AG": { type: "kanton", canton: "ZH" },
  "Spital Nidwalden AG": { type: "kanton", canton: "NW" },
  "Spital Oberengadin": { type: "kanton", canton: "GR" },
  "Spital STS AG": { type: "kanton", canton: "BE" },
  "Spital Schwyz": { type: "kanton", canton: "SZ" },
  "Spital Thurgau AG Kantonsspitäler Frauenfeld & Münsterlingen": { type: "kanton", canton: "TG" },
  "Spital Thusis": { type: "kanton", canton: "GR" },
  "Spital Uster AG": { type: "kanton", canton: "ZH" },
  "Spital Walenstadt": { type: "kanton", canton: "SG" },
  "Spital Wallis - Spitalzentrum Oberwallis (SZO)": { type: "kanton", canton: "VS" },
  "Spital Zofingen AG": { type: "kanton", canton: "AG" },
  "Spital Zollikerberg": { type: "private", canton: "ZH" },
  "Spitalregion Fürstenland Toggenburg": { type: "kanton", canton: "SG" },
  "Spitalregion Rheintal Werdenberg Sarganserland": { type: "kanton", canton: "SG" },
  "Spitalverbund Appenzell Ausserrhoden": { type: "kanton", canton: "AR" },
  "Spitalzentrum Biel AG": { type: "kanton", canton: "BE" },
  "Spitäler Frutigen Meiringen Interlaken AG": { type: "kanton", canton: "BE" },
  "Spitäler Schaffhausen": { type: "kanton", canton: "SH" },
  "St. Claraspital": { type: "private", canton: "BS" },
  "Stadtspital Zürich": { type: "kanton", canton: "ZH" },
  "Stiftung Diaconis Palliative Care": { type: "private", canton: "BE" },
  "Stiftung Ostschweizer Kinderspital": { type: "kanton", canton: "SG" },
  "Stiftung Spital Muri": { type: "private", canton: "AG" },
  "Swiss Medical Network Hospitals SA Clinica Ars Medica": { type: "private", canton: "TI" },
  "Swiss Medical Network Hospitals SA Clinica Sant'Anna": { type: "private", canton: "TI" },
  "Swiss Medical Network Hospitals SA Clinique Générale Ste-Anne": { type: "private", canton: "FR" },
  "Swiss Medical Network Hospitals SA Clinique de Valère": { type: "private", canton: "VS" },
  "Swiss Medical Network Hospitals SA Neuchâtel": { type: "private", canton: "NE" },
  "Swiss Medical Network Hospitals SA Privatklinik Belair": { type: "private", canton: "SH" },
  "Swiss Medical Network Hospitals SA Privatklinik Obach": { type: "private", canton: "SO" },
  "Swiss Medical Network Hospitals SA Privatklinik Siloah": { type: "private", canton: "BE" },
  "Swiss Medical Network Hospitals SA Privatklinik Villa im Park": { type: "private", canton: "AG" },
  "Thurklinik AG": { type: "private", canton: "TG" },
  "Universitäts-Kinderspital Zürich das Spital der Eleonorenstiftung": { type: "university", canton: "ZH" },
  "Universitäts-Kinderspital beider Basel (UKBB)": { type: "university", canton: "BS" },
  "Universitätsklinik Balgrist": { type: "university", canton: "ZH" },
  "Universitätsspital Basel": { type: "university", canton: "BS" },
  "Universitätsspital Zürich": { type: "university", canton: "ZH" },
  "Zuger Kantonsspital AG": { type: "kanton", canton: "ZG" }
};

const hospitalInfoOverrides = {
  "Les Hôpitaux Universitaires de Genève HUG": {
    address: "Rue Gabrielle-Perret-Gentil 4\n1205 Genève",
    locality: "Genève",
    website: "https://www.hug.ch"
  },
  "CHUV Centre Hospitalier Universitaire Vaudois": {
    address: "Rue du Bugnon 46\n1011 Lausanne",
    locality: "Lausanne",
    website: "https://www.chuv.ch"
  },
  "AMEOS Spital Einsiedeln AG": {
    address: "Spitalstrasse 28\n8840 Einsiedeln",
    locality: "Einsiedeln",
    website: "https://www.ameos.ch/einsiedeln"
  },
  "Andreas Klinik": {
    address: "Rigistrasse 1\n6330 Cham",
    locality: "Cham",
    website: "https://www.hirslanden.ch/de/andreas-klinik"
  },
  "Asana Spital Leuggern AG": {
    address: "Spitalstrasse 1\n5316 Leuggern",
    locality: "Leuggern",
    website: "https://www.asana-ag.ch"
  },
  "Asana Spital Menziken AG": {
    address: "Spitalstrasse 60\n5737 Menziken",
    locality: "Menziken",
    website: "https://www.asana-ag.ch"
  },
  "Berit Klinik AG": {
    address: "Breitenstrasse 12\n9042 Speicher",
    locality: "Speicher",
    website: "https://www.beritklinik.ch"
  },
  "Berit Klinik Wattwil": {
    address: "Ebnaterstrasse 26\n9630 Wattwil",
    locality: "Wattwil",
    website: "https://www.beritklinik.ch"
  },
  "Bethesda Spital AG": {
    address: "Gellertstrasse 144\n4052 Basel",
    locality: "Basel",
    website: "https://www.bethesda.ch"
  },
  "Insel Gruppe AG (universitär)": {
    address: "Freiburgstrasse 18\n3010 Bern",
    locality: "Bern",
    website: "https://www.insel.ch"
  },
  "Insel Gruppe AG (nicht-universitär)": {
    address: "Freiburgstrasse 18\n3010 Bern",
    locality: "Bern",
    website: "https://www.insel.ch"
  },
  "Universitätsspital Basel": {
    address: "Spitalstrasse 21\n4031 Basel",
    locality: "Basel",
    website: "https://www.unispital-basel.ch"
  },
  "Universitätsspital Zürich": {
    address: "Rämistrasse 100\n8091 Zürich",
    locality: "Zürich",
    website: "https://www.usz.ch"
  },
  "Universitätsklinik Balgrist": {
    address: "Forchstrasse 340\n8008 Zürich",
    locality: "Zürich",
    website: "https://www.balgrist.ch"
  },
  "Universitäts-Kinderspital Zürich das Spital der Eleonorenstiftung": {
    address: "Steinwiesstrasse 75\n8032 Zürich",
    locality: "Zürich",
    website: "https://www.kispi.uzh.ch"
  },
  "Universitäts-Kinderspital beider Basel (UKBB)": {
    address: "Spitalstrasse 33\n4056 Basel",
    locality: "Basel",
    website: "https://www.ukbb.ch"
  },
  "GZO Spital Wetzikon": {
    address: "Spitalstrasse 66\n8620 Wetzikon",
    locality: "Wetzikon",
    website: "https://www.gzo.ch"
  },
  "Gesundheitszentrum Fricktal": {
    address: "Rheinstrasse 91\n4310 Rheinfelden",
    locality: "Rheinfelden",
    website: "https://www.gzf.ch"
  },
  "LUKS Spitalbetriebe AG": {
    address: "Spitalstrasse 16\n6000 Luzern 16",
    locality: "Luzern",
    website: "https://www.luks.ch"
  },
  "Kantonsspital Baden AG": {
    address: "Im Ergel 1\n5404 Baden",
    locality: "Baden",
    website: "https://www.kantonsspitalbaden.ch"
  },
  "Kantonsspital Graubünden": {
    address: "Loestrasse 170\n7000 Chur",
    locality: "Chur",
    website: "https://www.ksgr.ch"
  },
  "Kantonsspital Winterthur": {
    address: "Brauerstrasse 15\n8400 Winterthur",
    locality: "Winterthur",
    website: "https://www.ksw.ch"
  },
  "Kantonsspital St. Gallen": {
    address: "Rorschacher Strasse 95\n9007 St. Gallen",
    locality: "St. Gallen",
    website: "https://www.kssg.ch"
  },
  "Klinik Arlesheim AG": {
    address: "Pfeffingerweg 1\n4144 Arlesheim",
    locality: "Arlesheim",
    website: "https://www.klinik-arlesheim.ch"
  },
  "Klinik Gut St. Moritz AG": {
    address: "Via Nouva 3\n7500 St. Moritz",
    locality: "St. Moritz",
    website: "https://www.klinik-gut.ch"
  },
  "Klinik Hirslanden AG": {
    address: "Witellikerstrasse 40\n8032 Zürich",
    locality: "Zürich",
    website: "https://www.hirslanden.ch/"
  },
  "Klinik Im Park": {
    address: "Seestrasse 220\n8027 Zürich",
    locality: "Zürich",
    website: "https://www.hirslanden.ch/de/klinik-im-park"
  },
  "Klinik Pyramide am See AG": {
    address: "Bellerivestrasse 34\n8008 Zürich",
    locality: "Zürich",
    website: "https://www.pyramide.ch"
  },
  "Klinik Seeschau AG": {
    address: "Seestrasse 107\n8266 Steckborn",
    locality: "Steckborn",
    website: "https://www.klinikseeschau.ch"
  },
  "Stadtspital Zürich": {
    address: "Birmensdorferstrasse 497\n8063 Zürich",
    locality: "Zürich",
    website: "https://www.stadtspital.ch"
  },
  "Clinique Bois-Cerf": {
    address: "Avenue d'Ouchy 31\n1006 Lausanne",
    locality: "Lausanne",
    website: "https://www.hirslanden.ch/fr/clinique-bois-cerf"
  },
  "Clinique CIC Riviera": {
    address: "Avenue de Corsier 19\n1814 La Tour-de-Peilz",
    locality: "La Tour-de-Peilz",
    website: "https://www.cicriviera.ch"
  },
  "Clinique CIC Valais SA": {
    address: "Avenue du Grand-Champsec 80\n1950 Sion",
    locality: "Sion",
    website: "https://www.cicvalais.ch"
  },
  "Clinique Cecil": {
    address: "Avenue Ruchonnet 53\n1003 Lausanne",
    locality: "Lausanne",
    website: "https://www.hirslanden.ch/fr/clinique-cecil"
  },
  "Clinique Générale-Beaulieu": {
    address: "Chemin de Beau-Soleil 20\n1206 Genève",
    locality: "Genève",
    website: "https://www.hirslanden.ch/fr/clinique-generale-beaulieu"
  },
  "Clinique de La Source": {
    address: "Avenue J.-J. Mercier 3\n1003 Lausanne",
    locality: "Lausanne",
    website: "https://www.lasource.ch"
  },
  "Clinique des Grangettes SA": {
    address: "Chemin des Grangettes 7\n1224 Chêne-Bougeries",
    locality: "Chêne-Bougeries",
    website: "https://www.hirslanden.ch/fr/clinique-des-grangettes"
  },
  "Clinique la Colline": {
    address: "Avenue de Beau-Séjour 6\n1206 Genève",
    locality: "Genève",
    website: "https://www.hirslanden.ch/fr/clinique-la-colline"
  },
  "EHC Ensemble hospitalier de la Côte": {
    address: "Chemin du Crêt 2\n1110 Morges",
    locality: "Morges",
    website: "https://www.ehc.vd.ch"
  },
  "Etablissements Hospitaliers du Nord Vaudois (eHnv)": {
    address: "Rue d'Entremonts 11\n1400 Yverdon-les-Bains",
    locality: "Yverdon-les-Bains",
    website: "https://www.ehnv.ch"
  },
  "GSMN Schweiz AG Clinique de Genolier": {
    address: "Route du Muids 3\n1272 Genolier",
    locality: "Genolier",
    website: "https://www.genolier.net"
  },
  "GSMN Schweiz AG Clinique de Montchoisi": {
    address: "Avenue de Montchoisi 35\n1006 Lausanne",
    locality: "Lausanne",
    website: "https://www.montchoisi.ch"
  },
  "GSMN Schweiz AG Privatklinik Bethanien": {
    address: "Toblerstrasse 51\n8044 Zürich",
    locality: "Zürich",
    website: "https://www.bethanien.ch"
  },
  "GSMN Schweiz AG Privatklinik Lindberg": {
    address: "Lindbergstrasse 25\n8400 Winterthur",
    locality: "Winterthur",
    website: "https://www.lindberg.ch"
  },
  "Gruppo ospedaliero Moncucco Clinica Moncucco": {
    address: "Via Moncucco 10\n6900 Lugano",
    locality: "Lugano",
    website: "https://www.gomsa.ch"
  },
  "Gruppo ospedaliero Moncucco Clinica Santa Chiara SA": {
    address: "Via San Pietro 6\n6600 Locarno",
    locality: "Locarno",
    website: "https://www.moncucco.ch/clinica-santa-chiara.php"
  },
  "HFR - Hôpital fribourgeois": {
    address: "Chemin des Pensionnats 2-6\n1708 Fribourg",
    locality: "Fribourg",
    website: "https://www.h-fr.ch"
  },
  "Hirslanden Klinik Aarau": {
    address: "Schänisweg 1\n5001 Aarau",
    locality: "Aarau",
    website: "https://www.hirslanden.ch/de/klinik-aarau"
  },
  "Hôpital Intercantonal de la Broye (HIB)": {
    address: "Route de Payerne 20\n1530 Payerne",
    locality: "Payerne",
    website: "https://www.hib-op.ch"
  },
  "Hôpital Riviera-Chablais Vaud-Valais": {
    address: "Route du Vieux-Séquoia 20\n1847 Rennaz",
    locality: "Rennaz",
    website: "https://www.hopitalrivierachablais.ch"
  },
  "Hôpital de la Tour": {
    address: "Avenue J.-D. Maillard 3\n1217 Meyrin",
    locality: "Meyrin",
    website: "https://www.latour.ch"
  },
  "Hôpital du Jura": {
    address: "Rue du 18-Novembre 2\n2800 Delémont",
    locality: "Delémont",
    website: "https://www.hopitaldujura.ch"
  },
  "Hôpital du Valais Centre hospitalier du Valais Romand CHVR": {
    address: "Avenue du Grand-Champsec 80\n1950 Sion",
    locality: "Sion",
    website: "https://www.hopitalduvalais.ch"
  },
  "Kantonsspital Aarau AG": {
    address: "Tellstrasse 25\n5001 Aarau",
    locality: "Aarau",
    website: "https://www.ksaarau.ch"
  },
  "Klinik Hohmad AG": {
    address: "Hohmadstrasse 1\n3600 Thun",
    locality: "Thun",
    website: "https://www.klinikhohmad.ch"
  },
  "Merian Iselin Klinik AG": {
    address: "Froburgstrasse 20\n4052 Basel",
    locality: "Basel",
    website: "https://www.merianiselin.ch"
  },
  "Praxisklinik Rennbahn AG": {
    address: "Rennbahnweg 12\n4133 Pratteln",
    locality: "Pratteln",
    website: "https://www.praxisklinik-rennbahn.ch"
  },
  "Regionalspital Emmental AG": {
    address: "Bernstrasse 7\n3400 Burgdorf",
    locality: "Burgdorf",
    website: "https://www.spital-emmental.ch"
  },
  "Regionalspital Surselva AG": {
    address: "Spitalstrasse 27\n7130 Ilanz/Glion",
    locality: "Ilanz/Glion",
    website: "https://www.spitalsurselva.ch"
  },
  "Réseau hospitalier neuchâtelois RHNe": {
    address: "Rue de Chasseral 20\n2300 La Chaux-de-Fonds",
    locality: "La Chaux-de-Fonds",
    website: "https://www.rhne.ch"
  },
  "See-Spital": {
    address: "Asylstrasse 19\n8810 Horgen",
    locality: "Horgen",
    website: "https://www.see-spital.ch"
  },
  "Solothurner Spitäler AG": {
    address: "Schöngrünstrasse 42\n4500 Solothurn",
    locality: "Solothurn",
    website: "https://www.so-h.ch"
  },
  "Spital Bülach AG": {
    address: "Spitalstrasse 24\n8180 Bülach",
    locality: "Bülach",
    website: "https://www.spitalbuelach.ch"
  },
  "Spital Limmattal": {
    address: "Urdorferstrasse 100\n8952 Schlieren",
    locality: "Schlieren",
    website: "https://www.spital-limmattal.ch"
  },
  "Spital Männedorf AG": {
    address: "Asylstrasse 10\n8708 Männedorf",
    locality: "Männedorf",
    website: "https://www.spitalmaennedorf.ch"
  },
  "Spital Nidwalden AG": {
    address: "Ennetmooserstrasse 19\n6370 Stans",
    locality: "Stans",
    website: "https://www.spitalnidwalden.ch"
  },
  "Spital Oberengadin": {
    address: "Via Nouva 3\n7503 Samedan",
    locality: "Samedan",
    website: "https://www.spitaloberengadin.ch"
  },
  "Spital Thusis": {
    address: "Neudorfstrasse 47\n7430 Thusis",
    locality: "Thusis",
    website: "https://www.spitalthusis.ch"
  },
  "Spital Uster AG": {
    address: "Brunnenstrasse 42\n8610 Uster",
    locality: "Uster",
    website: "https://www.spitaluster.ch"
  },
  "Spital Wallis - Spitalzentrum Oberwallis (SZO)": {
    address: "Spitalstrasse 14\n3900 Brig-Glis",
    locality: "Brig-Glis",
    website: "https://www.spitalwallis.ch"
  },
  "Spital Zofingen AG": {
    address: "Mühlethalstrasse 27\n4800 Zofingen",
    locality: "Zofingen",
    website: "https://www.spitalzofingen.ch"
  },
  "Spital Zollikerberg": {
    address: "Trichtenhauserstrasse 20\n8125 Zollikerberg",
    locality: "Zollikerberg",
    website: "https://www.spitalzollikerberg.ch"
  },
  "Spitalzentrum Biel AG": {
    address: "Vogelsang 84\n2501 Biel/Bienne",
    locality: "Biel/Bienne",
    website: "https://www.swissmedical.net/de/standorte/spitalzentrum-biel"
  },
  "Spitäler Schaffhausen": {
    address: "Geissbergstrasse 81\n8208 Schaffhausen",
    locality: "Schaffhausen",
    website: "https://www.spitaeler-sh.ch"
  },
  "St. Claraspital": {
    address: "Kleinriehenstrasse 30\n4058 Basel",
    locality: "Basel",
    website: "https://www.claraspital.ch"
  },
  "Stiftung Spital Muri": {
    address: "Spitalstrasse 3\n5630 Muri",
    locality: "Muri",
    website: "https://www.spital-muri.ch"
  },
  "Swiss Medical Network Hospitals SA Clinica Ars Medica": {
    address: "Via ai Saleggi 15\n6616 Losone",
    locality: "Losone",
    website: "https://www.clinicaarsmedica.ch"
  },
  "Swiss Medical Network Hospitals SA Clinica Sant'Anna": {
    address: "Via Sant'Anna 1\n6974 Sorengo",
    locality: "Sorengo",
    website: "https://www.clinicasantanna.ch"
  },
  "Swiss Medical Network Hospitals SA Clinique de Valère": {
    address: "Avenue Grand-Champsec 90\n1950 Sion",
    locality: "Sion",
    website: "https://www.cliniquedevalere.ch"
  },
  "Swiss Medical Network Hospitals SA Neuchâtel": {
    address: "Rue de la Maladière 45\n2000 Neuchâtel",
    locality: "Neuchâtel",
    website: "https://www.clinique-neuchatel.ch"
  },
  "Swiss Medical Network Hospitals SA Privatklinik Belair": {
    address: "Rietstrasse 30\n8201 Schaffhausen",
    locality: "Schaffhausen",
    website: "https://www.privatklinik-belair.ch"
  },
  "Swiss Medical Network Hospitals SA Privatklinik Obach": {
    address: "Schänzlistrasse 39\n4500 Solothurn",
    locality: "Solothurn",
    website: "https://www.privatklinik-obach.ch"
  },
  "Swiss Medical Network Hospitals SA Privatklinik Siloah": {
    address: "Worbstrasse 316\n3073 Gümligen",
    locality: "Gümligen",
    website: "https://www.privatklinik-siloah.ch"
  },
  "Swiss Medical Network Hospitals SA Privatklinik Villa im Park": {
    address: "Bahnhofstrasse 19\n5012 Schönenwerd",
    locality: "Schönenwerd",
    website: "https://www.privatklinik-villaimpark.ch"
  },
  "Zuger Kantonsspital AG": {
    address: "Aegeristrasse 57\n6300 Zug",
    locality: "Zug",
    website: "https://www.zgks.ch"
  },
  "Adus Medica AG": {
    address: "Breitestrasse 11\n8157 Dielsdorf",
    locality: "Dielsdorf",
    website: "https://www.adus-klinik.ch"
  },
  "Berit Klinik Goldach": {
    address: "Klosterstrasse 19\n9403 Goldach",
    locality: "Goldach",
    website: "https://goldach.beritklinik.ch"
  },
  "Center da Sanadad Savognin SA": {
    address: "Stradung 52\n7460 Savognin",
    locality: "Savognin",
    website: "https://www.cds-savognin.ch"
  },
  "Center da Sanda Engiadina Bassa Ospidal d'Engiadina Bassa": {
    address: "Via da l'Ospidal 280\n7550 Scuol",
    locality: "Scuol",
    website: "https://www.cseb.ch"
  },
  "Center da Sanda Val Müstair Akutabteilung": {
    address: "Via Val Müstair 186\n7536 Sta. Maria Val Müstair",
    locality: "Sta. Maria Val Müstair",
    website: "https://www.cdem.ch"
  },
  "Centro Sanitario Bregaglia Reparto acuto": {
    address: "Flin 5\n7606 Promontogno",
    locality: "Promontogno",
    website: "https://www.csbregaglia.ch"
  },
  "Centro Sanitario Valposchiavo Ospedale San Sisto": {
    address: "Via da li Clüsuri 1\n7742 Poschiavo",
    locality: "Poschiavo",
    website: "https://www.csvp.ch"
  },
  "Clinique de la Plaine": {
    address: "Rue Micheli-du-Crest 4\n1205 Genève",
    locality: "Genève",
    website: "https://www.klinik-seeschau.ch/"
  },
  "EOC Ente ospedaliero cantonale": {
    address: "Viale Officina 3\n6500 Bellinzona",
    locality: "Bellinzona",
    website: "https://www.eoc.ch"
  },
  "Flury Stiftung Spital Schiers": {
    address: "Spitalstrasse 1\n7220 Schiers",
    locality: "Schiers",
    website: "https://www.flurystiftung.ch/de/spital/ueber-uns/spital"
  },
  "Geburtshaus Delphys": {
    address: "Rue Agasse 66\n1208 Genève",
    locality: "Genève",
    website: "https://www.delphys.ch"
  },
  "Geburtshaus Luna AG": {
    address: "Obere Zollgasse 77\n3072 Ostermundigen",
    locality: "Ostermundigen",
    website: "https://www.geburtshaus-luna.ch"
  },
  "Geburtshaus St.Gallen GmbH": {
    address: "Linsebühlstrasse 49\n9000 St. Gallen",
    locality: "St. Gallen",
    website: "https://www.geburtshaus-stgallen.ch"
  },
  "Geburtshaus Stans GmbH": {
    address: "Hansmatt 13a\n6370 Stans",
    locality: "Stans",
    website: "https://www.geburtshaus-stans.ch"
  },
  "Geburtshaus Tagmond GmbH": {
    address: "Wannenweg 30\n4133 Pratteln",
    locality: "Pratteln",
    website: "https://www.tagmond.ch"
  },
  "Geburtshaus Terra Alta": {
    address: "Seedorferstrasse 21\n6204 Sempach",
    locality: "Sempach",
    website: "https://www.terra-alta.ch"
  },
  "Geburtshaus Winterthur AG": {
    address: "Lindstrasse 16\n8400 Winterthur",
    locality: "Winterthur",
    website: "https://www.geburtshaus-winterthur.ch"
  },
  "Geburtshaus Zürcher Oberland AG": {
    address: "Schürlistrasse 3\n8344 Bäretswil",
    locality: "Bäretswil",
    website: "https://www.geburtshaus-zho.ch"
  },
  "Geburtshaus ambra GmbH": {
    address: "Lutzenbergstrasse 13\n4443 Wittinsburg",
    locality: "Wittinsburg",
    website: "https://www.geburtshaus-ambra.ch"
  },
  "Genossenschaft Geburtshaus Simmental-Saanenland Maternité Alpine": {
    address: "Ledi 494\n3770 Zweisimmen",
    locality: "Zweisimmen",
    website: "https://www.maternite-alpine.ch"
  },
  "Groupement Hospitalier de l'Ouest Lémanique (GHOL) SA": {
    address: "Chemin Monastier 10\n1260 Nyon",
    locality: "Nyon",
    website: "https://www.ghol.ch"
  },
  "Herz-Neuro-Zentrum Bodensee AG": {
    address: "Spitalcampus 1\n8596 Münsterlingen",
    locality: "Münsterlingen",
    website: "https://www.herz-neuro-zentrum.ch"
  },
  "Hirslanden Bern AG": {
    address: "Schänzlistrasse 39\n3013 Bern",
    locality: "Bern",
    website: "https://www.hirslanden.ch"
  },
  "Hirslanden Klinik Am Rosenberg AG": {
    address: "Walzenhauserstrasse 70\n9410 Heiden",
    locality: "Heiden",
    website: "https://www.hirslanden.ch/de/klinik-am-rosenberg/home.html"
  },
  "Hirslanden Klinik Birshof": {
    address: "Reinacherstrasse 28\n4142 Münchenstein",
    locality: "Münchenstein",
    website: "https://www.hirslanden.ch/de/klinik-birshof/home.html"
  },
  "Hirslanden Klinik Linde AG": {
    address: "Vogelsang 84\n2502 Biel/Bienne",
    locality: "Biel/Bienne",
    website: "https://www.hirslanden.ch/de/klinik-linde/home.html"
  },
  "Hirslanden Klinik St. Anna AG": {
    address: "St. Anna-Strasse 32\n6006 Luzern",
    locality: "Luzern",
    website: "https://www.hirslanden.ch/de/klinik-st-anna/home.html"
  },
  "Hirslanden Klinik Stephanshorn": {
    address: "Brauerstrasse 95\n9016 St. Gallen",
    locality: "St. Gallen",
    website: "https://www.hirslanden.ch/de/klinik-stephanshorn/home.html"
  },
  "Hôpital Jules Daler": {
    address: "Route de Bertigny 34\n1700 Fribourg",
    locality: "Fribourg",
    website: "https://www.daler.ch"
  },
  "Kantonsspital Baselland": {
    address: "Rheinstrasse 26\n4410 Liestal",
    locality: "Liestal",
    website: "https://www.ksbl.ch"
  },
  "Kantonsspital Glarus": {
    address: "Burgstrasse 99\n8750 Glarus",
    locality: "Glarus",
    website: "https://www.ksgl.ch"
  },
  "Kantonsspital Obwalden": {
    address: "Brünigstrasse 118\n6060 Sarnen",
    locality: "Sarnen",
    website: "https://www.spital-obwalden.ch"
  },
  "Kantonsspital Uri": {
    address: "Spitalweg 11\n6460 Altdorf",
    locality: "Altdorf",
    website: "https://www.ksuri.ch"
  },
  "Klinik Tiefenbrunnen AG": {
    address: "Dammstrasse 29\n8702 Zollikon",
    locality: "Zollikon",
    website: "https://www.klinik-tiefenbrunnen.ch"
  },
  "Limmatklinik AG": {
    address: "Hardturmstrasse 133\n8005 Zürich",
    locality: "Zürich",
    website: "https://www.limmatklinik.ch"
  },
  "Lindenhofgruppe AG": {
    address: "Bremgartenstrasse 117\n3001 Bern",
    locality: "Bern",
    website: "https://www.lindenhofgruppe.ch"
  },
  "Maison de Naissance Tilia Sàrl": {
    address: "Chemin des Valangines 9\n2000 Neuchâtel",
    locality: "Neuchâtel",
    website: "https://tilia-naissance.ch"
  },
  "Maison de Naissance le Petit Prince": {
    address: "Route du Petit-Moncor 1d\n1752 Villars-sur-Glâne",
    locality: "Villars-sur-Glâne",
    website: "https://www.le-petit-prince.ch"
  },
  "Maison de naissance La Roseraie": {
    address: "Chemin du Châtelet 3\n1208 Genève",
    locality: "Genève",
    website: "https://www.laroseraie.ch"
  },
  "Maison de naissance Les Cigognes": {
    address: "Route Principale 21\n2824 Vicques",
    locality: "Vicques",
    website: "https://www.les-cigognes.ch"
  },
  "Matthea Geburtshaus": {
    address: "Klybeckstrasse 64/70\n4057 Basel",
    locality: "Basel",
    website: "https://www.geburtshaus-matthea.ch"
  },
  "Nouvelle Clinique Vert-Pré": {
    address: "Chemin de la Colombe 15\n1231 Conches",
    locality: "Conches",
    website: "https://www.cliniquevertpre.ch"
  },
  "PALLIATIVKLINIK IM PARK": {
    address: "Birseckstrasse 59\n4144 Arlesheim",
    locality: "Arlesheim",
    website: "https://www.palliativklinik.ch"
  },
  "Pôle santé Vallée de Joux Hôpital de la Vallée de Joux": {
    address: "Rue de l'Hôpital 3\n1347 Le Sentier",
    locality: "Le Sentier",
    website: ""
  },
  "Pôle santé du Pays-d'Enhaut": {
    address: "Route de l'Hôpital 17\n1660 Château-d'Oex",
    locality: "Château-d'Oex",
    website: ""
  },
  "Rosenklinik AG": {
    address: "St. Gallerstrasse 43\n8645 Jona",
    locality: "Jona",
    website: "https://www.rosenklinik.ch"
  },
  "Réseau Santé Balcon du Jura.vd (RSBJ)": {
    address: "Avenue de l'Hôtel-de-Ville 9\n1450 Sainte-Croix",
    locality: "Sainte-Croix",
    website: "https://www.rsbj.ch"
  },
  "Réseau de l'Arc SA": {
    address: "Rue Baptiste-Savoye 27-29\n2610 St-Imier",
    locality: "St-Imier",
    website: "https://www.reseaudelarc.ch"
  },
  "SRO AG": {
    address: "St. Urbanstrasse 67\n4900 Langenthal",
    locality: "Langenthal",
    website: "https://www.sro.ch"
  },
  "Schulthess Klinik": {
    address: "Lengghalde 2\n8008 Zürich",
    locality: "Zürich",
    website: "https://www.schulthess-klinik.ch"
  },
  "Spezialklinik Gynäkologie, Neonatologie": {
    address: "",
    locality: "Bern",
    website: ""
  },
  "Spital Affoltern AG": {
    address: "Sonnenbergstrasse 27\n8910 Affoltern am Albis",
    locality: "Affoltern am Albis",
    website: "https://www.spitalaffoltern.ch"
  },
  "Spital Davos AG Akutabteilung": {
    address: "Promenade 4\n7270 Davos Platz",
    locality: "Davos Platz",
    website: "https://www.spitaldavos.ch"
  },
  "Spital Lachen": {
    address: "Oberdorfstrasse 41\n8853 Lachen",
    locality: "Lachen",
    website: "https://www.spital-lachen.ch"
  },
  "Spital Linth": {
    address: "Gasterstrasse 25\n8730 Uznach",
    locality: "Uznach",
    website: "https://www.h-och.ch"
  },
  "Spital STS AG": {
    address: "Krankenhausstrasse 12\n3600 Thun",
    locality: "Thun",
    website: "https://www.spitalthun.ch"
  },
  "Spital Schwyz": {
    address: "Waldeggstrasse 10\n6430 Schwyz",
    locality: "Schwyz",
    website: "https://www.spital-schwyz.ch"
  },
  "Spital Thurgau AG Kantonsspitäler Frauenfeld & Münsterlingen": {
    address: "Pfaffenholzstrasse 4\n8501 Frauenfeld",
    locality: "Frauenfeld",
    website: "https://www.stgag.ch"
  },
  "Spital Walenstadt": {
    address: "Spitalstrasse 1\n8880 Walenstadt",
    locality: "Walenstadt",
    website: "https://www.h-och.ch"
  },
  "Spitalregion Fürstenland Toggenburg": {
    address: "Fürstenlandstrasse 32\n9500 Wil",
    locality: "Wil",
    website: "https://www.srft.ch"
  },
  "Spitalregion Rheintal Werdenberg Sarganserland": {
    address: "Spitalstrasse 44\n9472 Grabs",
    locality: "Grabs",
    website: "https://www.srrws.ch"
  },
  "Spitalverbund Appenzell Ausserrhoden": {
    address: "Krombach 3\n9102 Herisau",
    locality: "Herisau",
    website: "https://www.spitalverbund.ch"
  },
  "Spitäler Frutigen Meiringen Interlaken AG": {
    address: "Weissenaustrasse 27\n3800 Unterseen",
    locality: "Unterseen",
    website: "https://www.spitalfmi.ch"
  },
  "Stiftung Diaconis Palliative Care": {
    address: "Schänzlistrasse 15\n3013 Bern",
    locality: "Bern",
    website: "https://diaconis.ch/palliative-care/"
  },
  "Stiftung Ostschweizer Kinderspital": {
    address: "Claudiusstrasse 6\n9006 St. Gallen",
    locality: "St. Gallen",
    website: "https://www.kispisg.ch"
  },
  "Swiss Medical Network Hospitals SA Clinique Générale Ste-Anne": {
    address: "Rue Hans-Geiler 6\n1700 Fribourg",
    locality: "Fribourg",
    website: "https://www.cliniquegenerale.ch"
  },
  "Thurklinik AG": {
    address: "Ulmenstrasse 1\n8500 Frauenfeld",
    locality: "Frauenfeld",
    website: "https://www.thurklinik.ch"
  },
  "Uroviva Klinik AG": {
    address: "Zürichstrasse 5\n8180 Bülach",
    locality: "Bülach",
    website: "https://www.uroviva.ch"
  },
  "Venenklinik Bellevue AG": {
    address: "Brückenstrasse 9\n8280 Kreuzlingen",
    locality: "Kreuzlingen",
    website: "https://www.venenklinik.ch"
  }
};

const hospitalDisplayNameOverrides = {
  "Universitäts-Kinderspital Zürich das Spital der Eleonorenstiftung": "Kinderspital Zürich (Eleonorenstiftung)",
  "Spital Thurgau AG Kantonsspitäler Frauenfeld & Münsterlingen": "Spital Thurgau – KSp Frauenfeld & Münsterlingen",
  "Hôpital du Valais Centre hospitalier du Valais Romand CHVR": "Hôpital du Valais – CHVR (Valais Romand)",
  "Etablissements Hospitaliers du Nord Vaudois (eHnv)": "eHnv – Etablissements du Nord Vaudois",
  "Groupement Hospitalier de l'Ouest Lémanique (GHOL) SA": "GHOL – Ouest Lémanique",
  "Center da Sanda Engiadina Bassa Ospidal d'Engiadina Bassa": "CSEB – Ospidal d’Engiadina Bassa",
  "Pôle santé Vallée de Joux Hôpital de la Vallée de Joux": "Hôpital de la Vallée (Vallée de Joux)",
  "Swiss Medical Network Hospitals SA Clinica Sant'Anna": "Swiss Medical Network – Clinica Sant’Anna",
  "Gruppo ospedaliero Moncucco Clinica Santa Chiara SA": "Gruppo Moncucco – Clinica Santa Chiara",
  "Swiss Medical Network Hospitals SA Clinica Ars Medica": "Swiss Medical Network – Clinica Ars Medica",
  "Swiss Medical Network Hospitals SA Clinique Générale Ste-Anne": "Swiss Medical Network – Clinique Générale Ste-Anne",
  "Swiss Medical Network Hospitals SA Clinique de Valère": "Swiss Medical Network – Clinique de Valère",
  "Swiss Medical Network Hospitals SA Privatklinik Obach": "Swiss Medical Network – Privatklinik Obach",
  "Swiss Medical Network Hospitals SA Privatklinik Siloah": "Swiss Medical Network – Privatklinik Siloah",
  "Swiss Medical Network Hospitals SA Privatklinik Villa im Park": "Swiss Medical Network – Privatklinik Villa im Park",
  "Swiss Medical Network Hospitals SA Privatklinik Belair": "Swiss Medical Network – Privatklinik Belair"
};

const getHospitalDisplayName = (name) => hospitalDisplayNameOverrides[name] ?? name;

const excludedInstitutions = new Set([
  'CH',
  'Allgemeinspital, Grundversorgung (Niveau 4)',
  'Allgemeinspital, Zentrumsversorgung (Niveau 1, Universitätsspital)',
  'Cliniche specializzate chirurgia',
  'Clinique spécialisée Pédiatrie',
  'Hôpital de soins généraux, prise en charge centralisée (niveau 2)',
  'Hôpital de soins généraux, soins de base (niveau 5)',
  'Ospedali per cure generali, cure di base (livello 3)'
]);

const hospitalDatasetCache = {
  promise: null,
  data: null,
  coordinates: new Map()
};

function parseInteger(value) {
  if (value == null) {
    return 0;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.trunc(value) : 0;
  }
  const cleaned = String(value)
    .replace(/['\u00A0\s]/g, '')
    .replace(/%$/, '')
    .trim();
  if (!cleaned || cleaned === '*' || cleaned === '-') {
    return 0;
  }
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseFloatValue(value) {
  if (value == null) {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  const cleaned = String(value)
    .replace(/["'\u00A0\s]/g, '')
    .replace(/%$/, '')
    .replace(/,/g, '.')
    .trim();
  if (!cleaned || cleaned === '*' || cleaned === '-') {
    return null;
  }
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePercentage(value) {
  const parsed = parseFloatValue(value);
  return parsed == null ? null : parsed;
}

function inferHospitalMeta(name, coordinatesMap = hospitalDatasetCache.coordinates) {
  const override = hospitalMetadataOverrides[name];
  const coordinateEntry = coordinatesMap?.get?.(name);
  if (!override && !coordinateEntry) {
    console.warn(`Missing metadata for ${name}`);
  }
  const type = override?.type ?? 'kanton';
  const canton = override?.canton ?? coordinateEntry?.canton ?? '??';
  const fallback = cantonCentroids[canton];
  return {
    type,
    canton,
    lat: coordinateEntry?.lat ?? fallback?.lat ?? null,
    lon: coordinateEntry?.lon ?? fallback?.lon ?? null
  };
}

function buildHospitalDataset(entries, coordinatesMap) {
  const byProcedure = new Map();
  const byHospital = new Map();
  const meta = new Map();

  entries.forEach(rawEntry => {
    if (!rawEntry) {
      return;
    }
    const institution = typeof rawEntry.institution === 'string'
      ? rawEntry.institution.trim()
      : String(rawEntry.institution ?? '').trim();
    if (!institution || excludedInstitutions.has(institution)) {
      return;
    }

    const code = typeof rawEntry.code === 'string'
      ? rawEntry.code.trim()
      : String(rawEntry.code ?? '').trim();
    if (!code) {
      return;
    }

    const cases = parseInteger(rawEntry.cases2023);
    if (cases <= 0) {
      return;
    }

    if (!meta.has(institution)) {
      meta.set(institution, inferHospitalMeta(institution, coordinatesMap));
    }

    if (!byHospital.has(institution)) {
      const infoOverride = hospitalInfoOverrides[institution];
      byHospital.set(institution, {
        institution,
        displayName: getHospitalDisplayName(institution),
        totals: { cases2023: 0, fCases2023: 0 },
        procedures: new Map(),
        info: infoOverride ? { ...infoOverride } : {}
      });
    }

    const metrics = {
      observedHistorical: parsePercentage(rawEntry.observedHistorical),
      expectedHistorical: parsePercentage(rawEntry.expectedHistorical),
      smrHistorical: parseFloatValue(rawEntry.smrHistorical),
      casesHistorical: parseInteger(rawEntry.casesHistorical),
      observed2023: parsePercentage(rawEntry.observed2023),
      expected2023: parsePercentage(rawEntry.expected2023),
      smr2023: parseFloatValue(rawEntry.smr2023),
      cases2023: cases
    };

    const entry = { institution, code, cases, metrics };

    const hospitalRecord = byHospital.get(institution);
    if (hospitalRecord) {
      hospitalRecord.totals.cases2023 += cases;
      if (/\.F\b/.test(code)) {
        hospitalRecord.totals.fCases2023 += cases;
        if (!hospitalRecord.procedures.has(code)) {
          hospitalRecord.procedures.set(code, { code, cases: 0, metrics });
        }
        const procedureRecord = hospitalRecord.procedures.get(code);
        if (procedureRecord) {
          procedureRecord.cases += cases;
          procedureRecord.metrics = metrics;
        }
      }
    }
    if (!byProcedure.has(code)) {
      byProcedure.set(code, []);
    }
    byProcedure.get(code).push(entry);
  });

  const types = new Set();
  meta.forEach(details => types.add(details.type));

  return { byProcedure, byHospital, meta, types };
}

const POPULATION_DATASET_URL = 'static/data/je-e-01.02.03.csv';

const POPULATION_NAME_TO_CODE = new Map([
  ['Switzerland', 'CH'],
  ['Zurich', 'ZH'],
  ['Bern', 'BE'],
  ['Lucerne', 'LU'],
  ['Uri', 'UR'],
  ['Schwyz', 'SZ'],
  ['Obwalden', 'OW'],
  ['Nidwalden', 'NW'],
  ['Glarus', 'GL'],
  ['Zug', 'ZG'],
  ['Fribourg', 'FR'],
  ['Solothurn', 'SO'],
  ['Basel-Stadt', 'BS'],
  ['Basel-Landschaft', 'BL'],
  ['Schaffhausen', 'SH'],
  ['Appenzell A. Rh.', 'AR'],
  ['Appenzell I. Rh.', 'AI'],
  ['St. Gallen', 'SG'],
  ['Graubünden', 'GR'],
  ['Aargau', 'AG'],
  ['Thurgau', 'TG'],
  ['Ticino', 'TI'],
  ['Vaud', 'VD'],
  ['Valais', 'VS'],
  ['Neuchâtel', 'NE'],
  ['Geneva', 'GE'],
  ['Jura', 'JU']
]);

const REQUIRED_POPULATION_CODES = [
  'CH',
  'AG',
  'AI',
  'AR',
  'BE',
  'BL',
  'BS',
  'FR',
  'GE',
  'GL',
  'GR',
  'JU',
  'LU',
  'NE',
  'NW',
  'OW',
  'SG',
  'SH',
  'SO',
  'SZ',
  'TG',
  'TI',
  'UR',
  'VD',
  'VS',
  'ZG',
  'ZH'
];

const cantonCodes = REQUIRED_POPULATION_CODES.filter((code) => code !== 'CH');

let REGION_POPULATION = Object.create(null);

function parsePopulationDataset(csvText) {
  if (typeof csvText !== 'string' || !csvText.trim()) {
    return {};
  }

  const population = {};
  const lines = csvText.split(/\r?\n/);
  let inLatestSection = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    if (line.startsWith('Structure of the permanent resident population by canton,')) {
      if (line.includes('31.12.2023')) {
        inLatestSection = true;
        continue;
      }
      if (inLatestSection) {
        break;
      }
      continue;
    }

    if (!inLatestSection) {
      continue;
    }

    if (line.startsWith(';') || line.startsWith('"') || line.toLowerCase().startsWith('source:')) {
      continue;
    }

    const [nameRaw, totalRaw] = line.split(';');
    if (!nameRaw || !totalRaw) {
      continue;
    }

    const regionName = nameRaw.trim();
    const regionCode = POPULATION_NAME_TO_CODE.get(regionName);
    if (!regionCode) {
      continue;
    }

    const numericValue = Number(totalRaw.replace(/[\s.]/g, ''));
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      continue;
    }

    population[regionCode] = numericValue;
  }

  return population;
}

function applyPopulationDataset(populationMap) {
  const next = Object.create(null);
  const missing = [];

  REQUIRED_POPULATION_CODES.forEach((code) => {
    const value = populationMap?.[code];
    if (Number.isFinite(value) && value > 0) {
      next[code] = value;
    } else {
      missing.push(code);
    }
  });

  if (missing.length) {
    console.warn('Population dataset missing codes:', missing.join(', '));
  }

  REGION_POPULATION = next;
}

function loadHospitalDataset() {
  if (!hospitalDatasetCache.promise) {
    hospitalDatasetCache.promise = Promise.all([
      fetch('static/data/hospital_coordinates.json').then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load coordinate dataset (${response.status})`);
        }
        return response.json();
      }),
      fetch('static/data/qip23_f_procedures.json').then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load dataset (${response.status})`);
        }
        return response.json();
      }),
      fetch(POPULATION_DATASET_URL).then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load population dataset (${response.status})`);
        }
        return response.text();
      })
    ])
      .then(([coordinateData, dataset, populationCsv]) => {
        const coordinateMap = new Map(Object.entries(coordinateData || {}));
        hospitalDatasetCache.coordinates = coordinateMap;
        const populationData = parsePopulationDataset(populationCsv);
        applyPopulationDataset(populationData);
        const rows = Array.isArray(dataset?.rows)
          ? dataset.rows
          : Array.isArray(dataset)
            ? dataset
            : [];
        const parsed = buildHospitalDataset(rows, coordinateMap);
        hospitalDatasetCache.data = parsed;
        return parsed;
      })
      .catch(error => {
        console.error('Unable to load CH-IQI dataset', error);
        throw error;
      });
  }
  return hospitalDatasetCache.promise;
}

// ---------------------------------------------------------------------------
// Procedure finder interactive section (vanilla JS, placeholder values)
// ---------------------------------------------------------------------------

const finderRoot = document.getElementById('procedure-finder');

if (finderRoot) {
  const SUPPORTED_LOCALES = ['en', 'de', 'fr', 'it'];
  const pageLocale = document.documentElement.lang?.toLowerCase() ?? 'en';
  const activeLocale = SUPPORTED_LOCALES.includes(pageLocale) ? pageLocale : 'en';

  const translations = {
    en: {
      categories: {
        all: 'All procedures',
        cardiology: 'Cardiology',
        neurosciences: 'Neurosciences',
        oncology: 'Oncology',
        urology: 'Urology',
        transplantation: 'Transplantation',
        musculoskeletal: 'Musculoskeletal'
      },
      procedures: {
        'A.3.1.F': 'Coronary catheterization',
        'A.4.1.F': 'Cardiac rhythm disorders',
        'A.5.1.F': 'Pacemaker/ICD implantation',
        'A.7.2.F': 'Valve surgery',
        'A.7.3.F': 'Coronary bypass surgery',
        'B.2.3.F': 'Stroke unit – complex treatment',
        'B.3.1.F': 'Brain tumour treatments',
        'B.4.1.F': 'Epilepsy treatments',
        'Z.4.5.F': 'CNS vascular interventions',
        'D.3.1.F': 'Lung cancer treatments',
        'E.4.11.F': 'Colorectal cancer treatments',
        'G.4.1.F': 'Breast cancer treatments',
        'K.1.1.F': 'Melanoma inpatient treatments',
        'Z.4.42.F': 'Gynecologic tumour treatments',
        'H.2.1.F': 'Kidney stone treatments',
        'H.3.1.F': 'Bladder cancer treatments',
        'H.3.2.F': 'Transurethral bladder resections',
        'H.5.1.F': 'Prostate cancer treatments',
        'L.5.1.F': 'Kidney transplant',
        'Z.4.33.F': 'Lung transplant (CIMHS)',
        'Z.4.34.F': 'Liver transplant (CIMHS)',
        'Z.4.35.F': 'Pancreas transplant (CIMHS)',
        'Z.4.36.F': 'Kidney transplant (CIMHS)',
        'Z.4.37.F': 'Primary hip prosthesis',
        'Z.4.38.F': 'Primary knee prosthesis',
        'Z.4.39.F': 'Specialized spine surgery',
        'Z.4.40.F': 'Bone tumour treatments'
      },
      quickPickLabels: {
        'A.3.1.F': 'Heart catheter',
        'A.7.3.F': 'Heart bypass',
        'G.4.1.F': 'Breast cancer',
        'Z.4.37.F': 'Hip replacement',
        'L.5.1.F': 'Kidney transplant'
      },
      types: {
        labels: {
          university: 'University',
          kanton: 'Cantonal / Regional',
          private: 'Private',
          other: 'Other'
        },
        badges: {
          university: 'University',
          kanton: 'Cantonal / Regional',
          private: 'Private',
          other: 'Other'
        },
        legend: {
          university: 'University',
          kanton: 'Cantonal / Regional',
          private: 'Private'
        }
      },
      hhi: {
        labels: { low: 'Low', moderate: 'Moderate', high: 'High' },
        footnote:
          'The Herfindahl–Hirschman Index (HHI) sums the squared market shares of hospitals. Scores range from 0 (many providers) to 10&nbsp;000 (single provider). &lt;1500 Low · 1500–2500 Moderate · &gt;2500 High'
      },
      kpi: {
        totalCases: 'Total Cases (2023)',
        casesPer100k: 'Cases per 100k residents',
        universityShare: 'Share at Univ. hospitals',
        centralization: 'Centralization (HHI Index)',
        switzerland: 'Switzerland'
      },
      messages: {
        allCantons: 'All cantons',
        letterCategoryLabel: '{letter} - {example}',
        letterCategories: {
          A: 'Cardiology',
          B: 'Neurology & stroke',
          C: 'Geriatric rehabilitation',
          D: 'Thoracic oncology',
          E: 'Endocrine & gastrointestinal oncology',
          F: 'Vascular surgery',
          G: 'Maternity & neonatology',
          H: 'Urology',
          I: 'Spine & orthopedics',
          J: 'Critical care & ECMO',
          K: 'Dermatology',
          L: 'Transplantation',
          M: 'Palliative care',
          N: 'Robotic surgery',
          Z: 'Specialized centers'
        },
        selectedProcedure: 'Select a procedure',
        chooseProcedure: 'Select a procedure to view hospital volumes.',
        selectProcedureNational: 'Choose a procedure to display national case totals.',
        selectProcedureMap: 'Choose a procedure to load the hospital map.',
        selectProcedureCantonal: 'Choose a procedure to see canton details.',
        loadingData: 'Loading data…',
        loadingMap: 'Loading map…',
        failedToLoad: 'Failed to load data.',
        datasetError: 'Unable to load hospital dataset.',
        noHospitalsFilters: 'No hospitals match the current filters.',
        noHospitalVolumes: 'No case data is available for this selection.',
        noHospitalsSearch: 'No hospitals match your search.',
        noProceduresMatch: 'No procedures match your search. Try a different keyword.',
        tryAdjustFilters: 'Try a different procedure or adjust the filters.',
        paginationShowing: 'Showing {start}–{end} of {total} hospitals',
        hospitalsPerformingSingle: '{count} hospital performing this procedure',
        hospitalsPerformingPlural: '{count} hospitals performing this procedure',
        ariaPrevHospitals: 'Previous page of hospitals',
        ariaNextHospitals: 'Next page of hospitals',
        topHospitals: 'Cases by hospital (2023)',
        topHospitalsIn: 'Hospitals in canton {canton}',
        cantonSelectPrompt: 'Select a canton to view local hospital details.',
        cantonNoHospitals: 'No hospitals in canton {canton} match the current selection.',
        cantonSummary:
          'In the canton of {canton}, {count} hospitals reported cases for {procedure}. {leader} accounts for {cantonShare}% of cantonal cases and {nationalShare}% of the national total.',
        cantonRowCases: '{cases} cases',
        cantonNames: {
          AG: 'Aargau',
          AI: 'Appenzell Innerrhoden',
          AR: 'Appenzell Ausserrhoden',
          BE: 'Bern',
          BL: 'Basel-Landschaft',
          BS: 'Basel-Stadt',
          FR: 'Fribourg',
          GE: 'Geneva',
          GL: 'Glarus',
          GR: 'Graubünden',
          JU: 'Jura',
          LU: 'Lucerne',
          NE: 'Neuchâtel',
          NW: 'Nidwalden',
          OW: 'Obwalden',
          SG: 'St. Gallen',
          SH: 'Schaffhausen',
          SO: 'Solothurn',
          SZ: 'Schwyz',
          TG: 'Thurgau',
          TI: 'Ticino',
          UR: 'Uri',
          VD: 'Vaud',
          VS: 'Valais',
          ZG: 'Zug',
          ZH: 'Zurich'
        },
        cantonComparisonPrompt: 'Select a canton to compare against the national average.',
        selectProcedureComparison: 'Choose a procedure to display the canton comparison.',
        cantonComparisonNoData: 'Not enough data to calculate rates for this canton.',
        cantonComparisonTitle: 'Case frequency per 100k residents',
        cantonComparisonLead: 'Cases per 100k residents: {cantonRate} in {canton} vs {nationalRate} nationwide.',
        cantonComparisonHigher:
          'In {canton}, the rate is {difference} cases per 100,000 residents higher than the national average.',
        cantonComparisonLower:
          'In {canton}, the rate is {difference} cases per 100,000 residents lower than the national average.',
        cantonComparisonEven: '{canton} is on par with the national average.',
        cantonComparisonLabelNational: 'Switzerland',
        cantonComparisonLabelCanton: 'Canton {canton}',
        cantonComparisonAxisLabel: 'Cases per 100k residents',
        mapTitle: 'Hospital map',
        mapAriaLabel: 'Hospital locations by case volume',
        mapNoData: 'No map data available for this selection.',
        mapUnavailable: 'The interactive map could not be loaded.',
        mapTooltip: '{hospital} — {cases} cases',
        quickPicksTitle: 'Most searched procedures',
        quickPicksDescription: 'Jump straight to a CH-IQI procedure people look up most often.',
        hospitalDetail: {
          title: 'Hospital details',
          subtitle: 'Procedure: {procedure}',
          close: 'Close',
          type: 'Hospital type',
          canton: 'Canton',
          share: 'Share of selected hospitals',
          cases2023: 'Cases 2023',
          section2023: '2023 quality metrics',
          observed2023: 'Observed rate 2023',
          expected2023: 'Expected rate 2023',
          smr2023: 'Standardized mortality ratio 2023',
          sectionHistorical: '2018–2022 benchmark',
          observedHistorical: 'Observed rate 2018–2022',
          expectedHistorical: 'Expected rate 2018–2022',
          smrHistorical: 'Standardized mortality ratio 2018–2022',
          casesHistorical: 'Cases 2018–2022',
          note:
            'Rates are shown as published in CH-IQI reporting and may be suppressed when case volumes are low.',
          infoAddress: 'Address',
          infoLocation: 'Location',
          infoWebsite: 'Website',
          infoWebsiteMap: 'Open map',
          infoCoordinates: 'Coordinates',
          infoUnavailable: 'Not available',
          infoTotalCases: 'Total F cases (2023)',
          infoTotalProcedures: 'Distinct F procedures',
          proceduresTitle: 'Procedure mix',
          proceduresDescription: 'CH-IQI tracks {count} specialized procedures in this hospital ({total} total cases in 2023).',
          proceduresCode: 'Code',
          proceduresName: 'Procedure',
          proceduresCases: 'Cases 2023',
          proceduresShare: 'Share of F volume',
          proceduresEmpty: 'No F-coded procedures were reported for this hospital.',
          originalName: 'Reported as {original}',
          openAria: 'Show details for {hospital}'
        }
      }
    },
    de: {
      categories: {
        all: 'Alle Behandlungen',
        cardiology: 'Kardiologie',
        neurosciences: 'Neurowissenschaften',
        oncology: 'Onkologie',
        urology: 'Urologie',
        transplantation: 'Transplantation',
        musculoskeletal: 'Bewegungsapparat'
      },
      procedures: {
        'A.3.1.F': 'Koronarangiographie',
        'A.4.1.F': 'Herzrhythmusstörungen',
        'A.5.1.F': 'Implantation von Schrittmacher/ICD',
        'A.7.2.F': 'Herzklappenoperationen',
        'A.7.3.F': 'Koronar-Bypass-Operationen',
        'B.2.3.F': 'Schlaganfallstation – komplexe Behandlung',
        'B.3.1.F': 'Behandlungen von Hirntumoren',
        'B.4.1.F': 'Behandlungen bei Epilepsie',
        'Z.4.5.F': 'Gefässeingriffe am ZNS',
        'D.3.1.F': 'Lungenkrebsbehandlungen',
        'E.4.11.F': 'Behandlungen bei Darmkrebs',
        'G.4.1.F': 'Behandlungen bei Brustkrebs',
        'K.1.1.F': 'Stationäre Behandlungen bei Melanom',
        'Z.4.42.F': 'Behandlungen gynäkologischer Tumoren',
        'H.2.1.F': 'Behandlungen bei Nierensteinen',
        'H.3.1.F': 'Behandlungen bei Blasenkrebs',
        'H.3.2.F': 'Transurethrale Blasenresektionen',
        'H.5.1.F': 'Behandlungen bei Prostatakrebs',
        'L.5.1.F': 'Nierentransplantation',
        'Z.4.33.F': 'Lungentransplantation (CIMHS)',
        'Z.4.34.F': 'Lebertransplantation (CIMHS)',
        'Z.4.35.F': 'Pankreastransplantation (CIMHS)',
        'Z.4.36.F': 'Nierentransplantation (CIMHS)',
        'Z.4.37.F': 'Primärprothese Hüfte',
        'Z.4.38.F': 'Primärprothese Knie',
        'Z.4.39.F': 'Spezialisierte Wirbelsäulenchirurgie',
        'Z.4.40.F': 'Behandlungen von Knochentumoren'
      },
      quickPickLabels: {
        'A.3.1.F': 'Herzkatheter',
        'A.7.3.F': 'Bypass-OP',
        'G.4.1.F': 'Brustkrebs',
        'Z.4.37.F': 'Hüftprothese',
        'L.5.1.F': 'Nierentransplantation'
      },
      types: {
        labels: {
          university: 'Universitär',
          kanton: 'Kantonale / Regionale',
          private: 'Private',
          other: 'Weitere'
        },
        badges: {
          university: 'Universitär',
          kanton: 'Kanton / Region',
          private: 'Privat',
          other: 'Weitere'
        },
        legend: {
          university: 'Universitär',
          kanton: 'Kantonale / Regionale',
          private: 'Private'
        }
      },
      hhi: {
        labels: { low: 'Niedrig', moderate: 'Mittel', high: 'Hoch' },
        footnote:
          'Der Herfindahl-Hirschman-Index (HHI) summiert die quadrierten Marktanteile der Spitäler. Werte reichen von 0 (viele Anbieter) bis 10&nbsp;000 (ein Anbieter). &lt;1500 Niedrig · 1500–2500 Mittel · &gt;2500 Hoch'
      },
      kpi: {
        totalCases: 'Fallzahlen gesamt (2023)',
        casesPer100k: 'Fälle pro 100 000 Einwohner',
        universityShare: 'Anteil universitäre Spitäler',
        centralization: 'Zentralisierung (HHI-Index)',
        switzerland: 'Schweiz'
      },
      messages: {
        allCantons: 'Alle Kantone',
        letterCategoryLabel: '{letter} - {example}',
        letterCategories: {
          A: 'Kardiologie',
          B: 'Neurologie & Schlaganfall',
          C: 'Geriatrische Rehabilitation',
          D: 'Thoraxonkologie',
          E: 'Endokrinologie & Gastroenterologie',
          F: 'Gefässchirurgie',
          G: 'Geburtshilfe & Neonatologie',
          H: 'Urologie',
          I: 'Wirbelsäule & Orthopädie',
          J: 'Intensivmedizin & ECMO',
          K: 'Dermatologie',
          L: 'Transplantationen',
          M: 'Palliative Care',
          N: 'Robotische Chirurgie',
          Z: 'Spezialzentren'
        },
        selectedProcedure: 'Behandlung wählen',
        chooseProcedure: 'Wählen Sie eine Behandlung, um die Spitalliste zu sehen.',
        selectProcedureNational: 'Wählen Sie eine Behandlung, um die nationalen Fallzahlen anzuzeigen.',
        selectProcedureMap: 'Wählen Sie eine Behandlung, um die Spitalkarte zu laden.',
        selectProcedureCantonal: 'Wählen Sie eine Behandlung, um kantonale Details zu sehen.',
        loadingData: 'Daten werden geladen…',
        loadingMap: 'Karte wird geladen…',
        failedToLoad: 'Fehler beim Laden der Daten.',
        datasetError: 'Spitaldaten konnten nicht geladen werden.',
        noHospitalsFilters: 'Keine Spitäler passen zu den aktuellen Filtern.',
        noHospitalVolumes: 'Für diese Auswahl liegen keine Falldaten vor.',
        noHospitalsSearch: 'Keine Spitäler entsprechen Ihrer Suche.',
        noProceduresMatch: 'Keine Behandlungen passen zur Suche. Versuchen Sie einen anderen Begriff.',
        tryAdjustFilters: 'Versuchen Sie einen anderen Eingriff oder passen Sie die Filter an.',
        paginationShowing: 'Angezeigt {start}–{end} von {total} Spitälern',
        hospitalsPerformingSingle: '{count} Spital führt diesen Eingriff durch',
        hospitalsPerformingPlural: '{count} Spitäler führen diesen Eingriff durch',
        ariaPrevHospitals: 'Vorherige Spitalseite',
        ariaNextHospitals: 'Nächste Spitalseite',
        topHospitals: 'Fälle nach Spital (2023)',
        topHospitalsIn: 'Spitäler im Kanton {canton}',
        cantonSelectPrompt: 'Wählen Sie einen Kanton, um lokale Spitaldetails zu sehen.',
        cantonNoHospitals: 'Im Kanton {canton} passt kein Spital zur aktuellen Auswahl.',
        cantonSummary:
          'Im Kanton {canton} meldeten {count} Spitäler Fälle für {procedure}. {leader} steht für {cantonShare}% der kantonalen Fälle und {nationalShare}% des schweizweiten Totals.',
        cantonRowCases: '{cases} Fälle',
        cantonNames: {
          AG: 'Aargau',
          AI: 'Appenzell Innerrhoden',
          AR: 'Appenzell Ausserrhoden',
          BE: 'Bern',
          BL: 'Basel-Landschaft',
          BS: 'Basel-Stadt',
          FR: 'Freiburg',
          GE: 'Genf',
          GL: 'Glarus',
          GR: 'Graubünden',
          JU: 'Jura',
          LU: 'Luzern',
          NE: 'Neuenburg',
          NW: 'Nidwalden',
          OW: 'Obwalden',
          SG: 'St. Gallen',
          SH: 'Schaffhausen',
          SO: 'Solothurn',
          SZ: 'Schwyz',
          TG: 'Thurgau',
          TI: 'Tessin',
          UR: 'Uri',
          VD: 'Waadt',
          VS: 'Wallis',
          ZG: 'Zug',
          ZH: 'Zürich'
        },
        cantonComparisonPrompt: 'Wählen Sie einen Kanton, um ihn mit dem nationalen Durchschnitt zu vergleichen.',
        selectProcedureComparison: 'Wählen Sie eine Behandlung, um den Kantonsvergleich anzuzeigen.',
        cantonComparisonNoData: 'Für diesen Kanton können keine Raten berechnet werden.',
        cantonComparisonTitle: 'Fallhäufigkeit pro 100 000 Einwohner',
        cantonComparisonLead: 'Fälle pro 100 000 Einwohner: {cantonRate} in {canton} vs {nationalRate} schweizweit.',
        cantonComparisonHigher:
          'Im Kanton {canton} liegt die Rate um {difference} Fälle pro 100 000 Einwohner über dem nationalen Durchschnitt.',
        cantonComparisonLower:
          'Im Kanton {canton} liegt die Rate um {difference} Fälle pro 100 000 Einwohner unter dem nationalen Durchschnitt.',
        cantonComparisonEven: '{canton} entspricht dem nationalen Durchschnitt.',
        cantonComparisonLabelNational: 'Schweiz',
        cantonComparisonLabelCanton: 'Kanton {canton}',
        cantonComparisonAxisLabel: 'Fälle pro 100 000 Einwohner',
        mapTitle: 'Spitalkarte',
        mapAriaLabel: 'Spitalstandorte nach Fallzahl',
        mapNoData: 'Für diese Auswahl sind keine Kartendaten vorhanden.',
        mapUnavailable: 'Die interaktive Karte konnte nicht geladen werden.',
        mapTooltip: '{hospital} — {cases} Fälle',
        quickPicksTitle: 'Meistgesuchte Behandlungen',
        quickPicksDescription: 'Springen Sie direkt zu einer häufig nachgefragten CH-IQI-Behandlung.',
        hospitalDetail: {
          title: 'Spitaldetails',
          subtitle: 'Leistung: {procedure}',
          close: 'Schliessen',
          type: 'Spitaltyp',
          canton: 'Kanton',
          share: 'Anteil der ausgewählten Spitäler',
          cases2023: 'Fälle 2023',
          section2023: 'Qualitätskennzahlen 2023',
          observed2023: 'Beobachtete Rate 2023',
          expected2023: 'Erwartete Rate 2023',
          smr2023: 'Standardisierte Mortalitätsrate 2023',
          sectionHistorical: 'Referenz 2018–2022',
          observedHistorical: 'Beobachtete Rate 2018–2022',
          expectedHistorical: 'Erwartete Rate 2018–2022',
          smrHistorical: 'Standardisierte Mortalitätsrate 2018–2022',
          casesHistorical: 'Fälle 2018–2022',
          note:
            'Die Kennzahlen entsprechen den CH-IQI-Veröffentlichungen und können bei kleinen Fallzahlen unterdrückt werden.',
          infoAddress: 'Adresse',
          infoLocation: 'Ort',
          infoWebsite: 'Webseite',
          infoWebsiteMap: 'Karte öffnen',
          infoCoordinates: 'Koordinaten',
          infoUnavailable: 'Keine Angaben',
          infoTotalCases: 'Fälle F-Codes (2023)',
          infoTotalProcedures: 'Anzahl F-Codes',
          proceduresTitle: 'Leistungsspektrum',
          proceduresDescription: 'Der CH-IQI erfasst in diesem Spital {count} spezialisierte Leistungen (insgesamt {total} Fälle 2023).',
          proceduresCode: 'Code',
          proceduresName: 'Leistung',
          proceduresCases: 'Fälle 2023',
          proceduresShare: 'Anteil am F-Volumen',
          proceduresEmpty: 'Für dieses Spital liegen keine F-Codes vor.',
          originalName: 'Gemeldet als {original}',
          openAria: 'Details für {hospital} anzeigen'
        }
      }
    },
    fr: {
      categories: {
        all: 'Toutes les interventions',
        cardiology: 'Cardiologie',
        neurosciences: 'Neurosciences',
        oncology: 'Oncologie',
        urology: 'Urologie',
        transplantation: 'Transplantation',
        musculoskeletal: 'Appareil locomoteur'
      },
      procedures: {
        'A.3.1.F': 'Cathétérisme coronarien',
        'A.4.1.F': 'Troubles du rythme cardiaque',
        'A.5.1.F': 'Implantation de pacemaker/défibrillateur',
        'A.7.2.F': 'Chirurgie valvulaire',
        'A.7.3.F': 'Pontage coronarien',
        'B.2.3.F': 'Unité AVC – prise en charge complexe',
        'B.3.1.F': 'Traitements des tumeurs cérébrales',
        'B.4.1.F': "Prise en charge de l'épilepsie",
        'Z.4.5.F': 'Interventions vasculaires du SNC',
        'D.3.1.F': 'Traitements du cancer du poumon',
        'E.4.11.F': 'Traitements du cancer colorectal',
        'G.4.1.F': 'Traitements du cancer du sein',
        'K.1.1.F': 'Traitements stationnaires du mélanome',
        'Z.4.42.F': 'Traitements des tumeurs gynécologiques',
        'H.2.1.F': 'Traitements des calculs rénaux',
        'H.3.1.F': 'Traitements du cancer de la vessie',
        'H.3.2.F': 'Résections transurétrales de la vessie',
        'H.5.1.F': 'Traitements du cancer de la prostate',
        'L.5.1.F': 'Transplantation rénale',
        'Z.4.33.F': 'Transplantation pulmonaire (CIMHS)',
        'Z.4.34.F': 'Transplantation hépatique (CIMHS)',
        'Z.4.35.F': 'Transplantation pancréatique (CIMHS)',
        'Z.4.36.F': 'Transplantation rénale (CIMHS)',
        'Z.4.37.F': 'Prothèse totale de hanche primaire',
        'Z.4.38.F': 'Prothèse totale de genou primaire',
        'Z.4.39.F': 'Chirurgie spécialisée de la colonne vertébrale',
        'Z.4.40.F': 'Traitements des tumeurs osseuses'
      },
      quickPickLabels: {
        'A.3.1.F': 'Cathéter cardiaque',
        'A.7.3.F': 'Pontage cardiaque',
        'G.4.1.F': 'Cancer du sein',
        'Z.4.37.F': 'Prothèse de hanche',
        'L.5.1.F': 'Transplantation rénale'
      },
      types: {
        labels: {
          university: 'Universitaire',
          kanton: 'Cantonal / Régional',
          private: 'Privé',
          other: 'Autre'
        },
        badges: {
          university: 'Universitaire',
          kanton: 'Cantonal / Régional',
          private: 'Privé',
          other: 'Autre'
        },
        legend: {
          university: 'Universitaire',
          kanton: 'Cantonal / Régional',
          private: 'Privé'
        }
      },
      hhi: {
        labels: { low: 'Faible', moderate: 'Modérée', high: 'Élevée' },
        footnote:
          "L'indice Herfindahl-Hirschman (HHI) additionne les parts de marché au carré des hôpitaux. Les scores vont de 0 (offre dispersée) à 10&nbsp;000 (monopole). &lt;1500 Faible · 1500–2500 Modérée · &gt;2500 Élevée"
      },
      kpi: {
        totalCases: 'Cas totaux (2023)',
        casesPer100k: 'Cas pour 100 000 habitants',
        universityShare: 'Part des hôpitaux univ.',
        centralization: 'Centralisation (indice HHI)',
        switzerland: 'Suisse'
      },
      messages: {
        allCantons: 'Tous les cantons',
        letterCategoryLabel: '{letter} - {example}',
        letterCategories: {
          A: 'Cardiologie',
          B: 'Neurologie & AVC',
          C: 'Réadaptation gériatrique',
          D: 'Oncologie thoracique',
          E: 'Endocrinologie & gastroentérologie',
          F: 'Chirurgie vasculaire',
          G: 'Maternité & néonatologie',
          H: 'Urologie',
          I: 'Rachis & orthopédie',
          J: 'Soins intensifs & ECMO',
          K: 'Dermatologie',
          L: 'Transplantation',
          M: 'Soins palliatifs',
          N: 'Chirurgie robotique',
          Z: 'Centres spécialisés'
        },
        selectedProcedure: 'Sélectionner une intervention',
        chooseProcedure: 'Sélectionnez une intervention pour afficher la liste des hôpitaux.',
        selectProcedureNational: 'Sélectionnez une intervention pour afficher les totaux nationaux.',
        selectProcedureMap: 'Sélectionnez une intervention pour charger la carte des hôpitaux.',
        selectProcedureCantonal: 'Sélectionnez une intervention pour voir les détails cantonaux.',
        loadingData: 'Chargement des données…',
        loadingMap: 'Chargement de la carte…',
        failedToLoad: 'Échec du chargement des données.',
        datasetError: "Impossible de charger l’ensemble de données hospitalier.",
        noHospitalsFilters: 'Aucun hôpital ne correspond aux filtres actuels.',
        noHospitalVolumes: 'Aucune donnée de cas n’est disponible pour cette sélection.',
        noHospitalsSearch: 'Aucun hôpital ne correspond à votre recherche.',
        noProceduresMatch: 'Aucune intervention ne correspond à votre recherche. Essayez un autre mot-clé.',
        tryAdjustFilters: 'Essayez une autre intervention ou ajustez les filtres.',
        paginationShowing: 'Affichage {start}–{end} sur {total} hôpitaux',
        hospitalsPerformingSingle: '{count} hôpital réalise cette intervention',
        hospitalsPerformingPlural: '{count} hôpitaux réalisent cette intervention',
        ariaPrevHospitals: 'Page précédente des hôpitaux',
        ariaNextHospitals: 'Page suivante des hôpitaux',
        topHospitals: 'Cas par hôpital (2023)',
        topHospitalsIn: 'Hôpitaux dans le canton {canton}',
        cantonSelectPrompt: 'Sélectionnez un canton pour voir les détails locaux.',
        cantonNoHospitals: 'Aucun hôpital du canton {canton} ne correspond à cette sélection.',
        cantonSummary:
          'Dans le canton de {canton}, {count} hôpitaux ont déclaré des cas pour {procedure}. {leader} représente {cantonShare}% des cas cantonaux et {nationalShare}% du total national.',
        cantonRowCases: '{cases} cas',
        cantonNames: {
          AG: 'Argovie',
          AI: 'Appenzell Rhodes-Intérieures',
          AR: 'Appenzell Rhodes-Extérieures',
          BE: 'Berne',
          BL: 'Bâle-Campagne',
          BS: 'Bâle-Ville',
          FR: 'Fribourg',
          GE: 'Genève',
          GL: 'Glaris',
          GR: 'Grisons',
          JU: 'Jura',
          LU: 'Lucerne',
          NE: 'Neuchâtel',
          NW: 'Nidwald',
          OW: 'Obwald',
          SG: 'Saint-Gall',
          SH: 'Schaffhouse',
          SO: 'Soleure',
          SZ: 'Schwytz',
          TG: 'Thurgovie',
          TI: 'Tessin',
          UR: 'Uri',
          VD: 'Vaud',
          VS: 'Valais',
          ZG: 'Zoug',
          ZH: 'Zurich'
        },
        cantonComparisonPrompt: 'Sélectionnez un canton pour le comparer à la moyenne nationale.',
        selectProcedureComparison: 'Choisissez une intervention pour afficher la comparaison cantonale.',
        cantonComparisonNoData: 'Impossible de calculer un taux pour ce canton.',
        cantonComparisonTitle: 'Fréquence des cas pour 100 000 habitants',
        cantonComparisonLead: 'Cas pour 100 000 habitants : {cantonRate} dans {canton} contre {nationalRate} au niveau suisse.',
        cantonComparisonHigher:
          'Dans le canton de {canton}, le taux dépasse la moyenne nationale de {difference} cas pour 100 000 habitants.',
        cantonComparisonLower:
          'Dans le canton de {canton}, le taux est inférieur à la moyenne nationale de {difference} cas pour 100 000 habitants.',
        cantonComparisonEven: '{canton} est aligné sur la moyenne nationale.',
        cantonComparisonLabelNational: 'Suisse',
        cantonComparisonLabelCanton: 'Canton {canton}',
        cantonComparisonAxisLabel: 'Cas pour 100 000 habitants',
        mapTitle: 'Carte des hôpitaux',
        mapAriaLabel: 'Localisation des hôpitaux selon le volume de cas',
        mapNoData: 'Aucune donnée cartographique disponible pour cette sélection.',
        mapUnavailable: 'La carte interactive n’a pas pu être chargée.',
        mapTooltip: '{hospital} — {cases} cas',
        quickPicksTitle: 'Interventions les plus recherchées',
        quickPicksDescription: 'Accédez directement à une intervention CH-IQI très consultée.',
        hospitalDetail: {
          title: 'Détails de l’hôpital',
          subtitle: 'Prestation : {procedure}',
          close: 'Fermer',
          type: 'Type d’hôpital',
          canton: 'Canton',
          share: 'Part des hôpitaux sélectionnés',
          cases2023: 'Cas 2023',
          section2023: 'Indicateurs de qualité 2023',
          observed2023: 'Taux observé 2023',
          expected2023: 'Taux attendu 2023',
          smr2023: 'Rapport de mortalité standardisé 2023',
          sectionHistorical: 'Référence 2018-2022',
          observedHistorical: 'Taux observé 2018-2022',
          expectedHistorical: 'Taux attendu 2018-2022',
          smrHistorical: 'Rapport de mortalité standardisé 2018-2022',
          casesHistorical: 'Cas 2018-2022',
          note:
            'Les valeurs proviennent des publications CH-IQI et peuvent être masquées lorsque les volumes sont faibles.',
          infoAddress: 'Adresse',
          infoLocation: 'Localisation',
          infoWebsite: 'Site web',
          infoWebsiteMap: 'Voir sur la carte',
          infoCoordinates: 'Coordonnées',
          infoUnavailable: 'Non disponible',
          infoTotalCases: 'Cas F totaux (2023)',
          infoTotalProcedures: 'Nombre de codes F',
          proceduresTitle: 'Profil des interventions',
          proceduresDescription: 'Le CH-IQI recense {count} interventions spécialisées dans cet hôpital (total {total} cas en 2023).',
          proceduresCode: 'Code',
          proceduresName: 'Intervention',
          proceduresCases: 'Cas 2023',
          proceduresShare: 'Part du volume F',
          proceduresEmpty: 'Aucun code F n’est publié pour cet hôpital.',
          originalName: 'Déclaré comme {original}',
          openAria: 'Afficher les détails pour {hospital}'
        }
      }
    },
    it: {
      categories: {
        all: 'Tutte le procedure',
        cardiology: 'Cardiologia',
        neurosciences: 'Neuroscienze',
        oncology: 'Oncologia',
        urology: 'Urologia',
        transplantation: 'Trapianti',
        musculoskeletal: 'Apparato muscoloscheletrico'
      },
      procedures: {
        'A.3.1.F': 'Cateterismo coronarico',
        'A.4.1.F': 'Disturbi del ritmo cardiaco',
        'A.5.1.F': 'Impianto di pacemaker/ICD',
        'A.7.2.F': 'Chirurgia valvolare',
        'A.7.3.F': 'Chirurgia di bypass coronarico',
        'B.2.3.F': 'Stroke unit – trattamento complesso',
        'B.3.1.F': 'Trattamenti dei tumori cerebrali',
        'B.4.1.F': 'Trattamenti per l’epilessia',
        'Z.4.5.F': 'Interventi vascolari SNC',
        'D.3.1.F': 'Trattamenti per il cancro al polmone',
        'E.4.11.F': 'Trattamenti per il cancro colorettale',
        'G.4.1.F': 'Trattamenti per il cancro al seno',
        'K.1.1.F': 'Trattamenti ospedalieri del melanoma',
        'Z.4.42.F': 'Trattamenti dei tumori ginecologici',
        'H.2.1.F': 'Trattamenti per i calcoli renali',
        'H.3.1.F': 'Trattamenti per il cancro alla vescica',
        'H.3.2.F': 'Resezioni transuretrali della vescica',
        'H.5.1.F': 'Trattamenti per il cancro alla prostata',
        'L.5.1.F': 'Trapianto di rene',
        'Z.4.33.F': 'Trapianto di polmone (CIMHS)',
        'Z.4.34.F': 'Trapianto di fegato (CIMHS)',
        'Z.4.35.F': 'Trapianto di pancreas (CIMHS)',
        'Z.4.36.F': 'Trapianto di rene (CIMHS)',
        'Z.4.37.F': 'Protesi d’anca primaria',
        'Z.4.38.F': 'Protesi di ginocchio primaria',
        'Z.4.39.F': 'Chirurgia specialistica della colonna vertebrale',
        'Z.4.40.F': 'Trattamenti dei tumori ossei'
      },
      quickPickLabels: {
        'A.3.1.F': 'Catetere cardiaco',
        'A.7.3.F': 'Bypass cardiaco',
        'G.4.1.F': 'Tumore al seno',
        'Z.4.37.F': 'Protesi all’anca',
        'L.5.1.F': 'Trapianto di rene'
      },
      types: {
        labels: {
          university: 'Universitari',
          kanton: 'Cantonali / Regionali',
          private: 'Privati',
          other: 'Altri'
        },
        badges: {
          university: 'Universitario',
          kanton: 'Cantonale / Regionale',
          private: 'Privato',
          other: 'Altro'
        },
        legend: {
          university: 'Universitari',
          kanton: 'Cantonali / Regionali',
          private: 'Privati'
        }
      },
      hhi: {
        labels: { low: 'Bassa', moderate: 'Moderata', high: 'Alta' },
        footnote:
          "L'indice di Herfindahl-Hirschman (HHI) somma le quote di mercato al quadrato degli ospedali. I punteggi vanno da 0 (molti fornitori) a 10&nbsp;000 (monopolio). &lt;1500 Bassa · 1500–2500 Moderata · &gt;2500 Alta"
      },
      kpi: {
        totalCases: 'Casi totali (2023)',
        casesPer100k: 'Casi per 100 000 abitanti',
        universityShare: 'Quota ospedali universitari',
        centralization: 'Centralizzazione (indice HHI)',
        switzerland: 'Svizzera'
      },
      messages: {
        allCantons: 'Tutti i cantoni',
        letterCategoryLabel: '{letter} - {example}',
        letterCategories: {
          A: 'Cardiologia',
          B: 'Neurologia e ictus',
          C: 'Riabilitazione geriatrica',
          D: 'Oncologia toracica',
          E: 'Endocrinologia e gastroenterologia',
          F: 'Chirurgia vascolare',
          G: 'Maternità e neonatologia',
          H: 'Urologia',
          I: 'Colonna vertebrale e ortopedia',
          J: 'Terapia intensiva ed ECMO',
          K: 'Dermatologia',
          L: 'Trapianti',
          M: 'Cure palliative',
          N: 'Chirurgia robotica',
          Z: 'Centri specializzati'
        },
        selectedProcedure: 'Seleziona un intervento',
        chooseProcedure: 'Seleziona un intervento per visualizzare l’elenco degli ospedali.',
        selectProcedureNational: 'Seleziona un intervento per mostrare i totali nazionali.',
        selectProcedureMap: 'Seleziona un intervento per caricare la mappa degli ospedali.',
        selectProcedureCantonal: 'Seleziona un intervento per vedere i dettagli cantonali.',
        loadingData: 'Caricamento dati…',
        loadingMap: 'Caricamento mappa…',
        failedToLoad: 'Errore nel caricamento dei dati.',
        datasetError: 'Impossibile caricare il dataset ospedaliero.',
        noHospitalsFilters: 'Nessun ospedale corrisponde ai filtri correnti.',
        noHospitalVolumes: 'Non sono disponibili dati di casi per questa selezione.',
        noHospitalsSearch: 'Nessun ospedale corrisponde alla ricerca.',
        noProceduresMatch: 'Nessun intervento corrisponde alla ricerca. Prova con un’altra parola chiave.',
        tryAdjustFilters: 'Prova un’altra procedura o modifica i filtri.',
        paginationShowing: 'Visualizzazione {start}–{end} di {total} ospedali',
        hospitalsPerformingSingle: '{count} ospedale esegue questa procedura',
        hospitalsPerformingPlural: '{count} ospedali eseguono questa procedura',
        ariaPrevHospitals: 'Pagina precedente di ospedali',
        ariaNextHospitals: 'Pagina successiva di ospedali',
        topHospitals: 'Casi per ospedale (2023)',
        topHospitalsIn: 'Ospedali nel cantone {canton}',
        cantonSelectPrompt: 'Seleziona un cantone per vedere i dettagli locali.',
        cantonNoHospitals: 'Nel cantone {canton} nessun ospedale corrisponde a questa selezione.',
        cantonSummary:
          'Nel cantone di {canton}, {count} ospedali hanno riportato casi per {procedure}. {leader} rappresenta il {cantonShare}% dei casi cantonali e il {nationalShare}% del totale nazionale.',
        cantonRowCases: '{cases} casi',
        cantonNames: {
          AG: 'Argovia',
          AI: 'Appenzello Interno',
          AR: 'Appenzello Esterno',
          BE: 'Berna',
          BL: 'Basilea Campagna',
          BS: 'Basilea Città',
          FR: 'Friburgo',
          GE: 'Ginevra',
          GL: 'Glarona',
          GR: 'Grigioni',
          JU: 'Giura',
          LU: 'Lucerna',
          NE: 'Neuchâtel',
          NW: 'Nidvaldo',
          OW: 'Obvaldo',
          SG: 'San Gallo',
          SH: 'Sciaffusa',
          SO: 'Soletta',
          SZ: 'Svitto',
          TG: 'Turgovia',
          TI: 'Ticino',
          UR: 'Uri',
          VD: 'Vaud',
          VS: 'Vallese',
          ZG: 'Zugo',
          ZH: 'Zurigo'
        },
        cantonComparisonPrompt: 'Seleziona un cantone per confrontarlo con la media nazionale.',
        selectProcedureComparison: 'Scegli una procedura per mostrare il confronto cantonale.',
        cantonComparisonNoData: 'Non è possibile calcolare il tasso per questo cantone.',
        cantonComparisonTitle: 'Frequenza dei casi per 100 000 abitanti',
        cantonComparisonLead: 'Casi per 100 000 abitanti: {cantonRate} in {canton} rispetto a {nationalRate} a livello svizzero.',
        cantonComparisonHigher:
          'Nel cantone {canton} il tasso supera la media nazionale di {difference} casi ogni 100 000 abitanti.',
        cantonComparisonLower:
          'Nel cantone {canton} il tasso è inferiore alla media nazionale di {difference} casi ogni 100 000 abitanti.',
        cantonComparisonEven: '{canton} è in linea con la media nazionale.',
        cantonComparisonLabelNational: 'Svizzera',
        cantonComparisonLabelCanton: 'Cantone {canton}',
        cantonComparisonAxisLabel: 'Casi per 100 000 abitanti',
        mapTitle: 'Mappa degli ospedali',
        mapAriaLabel: 'Posizioni degli ospedali in base al volume di casi',
        mapNoData: 'Nessun dato cartografico disponibile per questa selezione.',
        mapUnavailable: 'Impossibile caricare la mappa interattiva.',
        mapTooltip: '{hospital} — {cases} casi',
        quickPicksTitle: 'Interventi più cercati',
        quickPicksDescription: 'Vai subito a un intervento CH-IQI molto consultato.',
        hospitalDetail: {
          title: 'Dettagli dell’ospedale',
          subtitle: 'Prestazione: {procedure}',
          close: 'Chiudi',
          type: 'Tipo di ospedale',
          canton: 'Cantone',
          share: 'Quota degli ospedali selezionati',
          cases2023: 'Casi 2023',
          section2023: 'Indicatori di qualità 2023',
          observed2023: 'Tasso osservato 2023',
          expected2023: 'Tasso atteso 2023',
          smr2023: 'Rapporto di mortalità standardizzato 2023',
          sectionHistorical: 'Confronto 2018-2022',
          observedHistorical: 'Tasso osservato 2018-2022',
          expectedHistorical: 'Tasso atteso 2018-2022',
          smrHistorical: 'Rapporto di mortalità standardizzato 2018-2022',
          casesHistorical: 'Casi 2018-2022',
          note:
            'I valori corrispondono alle pubblicazioni CH-IQI e possono essere nascosti con bassi volumi di casi.',
          infoAddress: 'Indirizzo',
          infoLocation: 'Località',
          infoWebsite: 'Sito web',
          infoWebsiteMap: 'Apri mappa',
          infoCoordinates: 'Coordinate',
          infoUnavailable: 'Non disponibile',
          infoTotalCases: 'Casi totali F (2023)',
          infoTotalProcedures: 'Numero di codici F',
          proceduresTitle: 'Mix di interventi',
          proceduresDescription: 'Il CH-IQI rileva {count} interventi specialistici in questo ospedale (totale {total} casi nel 2023).',
          proceduresCode: 'Codice',
          proceduresName: 'Intervento',
          proceduresCases: 'Casi 2023',
          proceduresShare: 'Quota del volume F',
          proceduresEmpty: 'Nessun codice F è pubblicato per questo ospedale.',
          originalName: 'Registrato come {original}',
          openAria: 'Mostra i dettagli per {hospital}'
        }
      }
    }
  };

  const defaultTranslations = translations.en;
  const localeTranslations = translations[activeLocale] ?? defaultTranslations;

  const resolvePath = (target, path) =>
    path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), target);

  const translate = (path, replacements = {}) => {
    const template =
      resolvePath(localeTranslations, path) ?? resolvePath(defaultTranslations, path) ?? path;
    if (typeof template !== 'string') {
      return template;
    }
    return template.replace(/\{(\w+)\}/g, (_, key) => (replacements[key] ?? ''));
  };

  const getProcedureName = (code) => {
    const defaultName = translations.en?.procedures?.[code] ?? code;
    const localeName = translations[activeLocale]?.procedures?.[code];
    return localeName || defaultName || code;
  };

  const getLetterCategoryName = (letter) => {
    if (!letter) {
      return '';
    }
    const key = `messages.letterCategories.${letter}`;
    const label = translate(key);
    return typeof label === 'string' && label !== key ? label : '';
  };

  const getObjectTranslation = (path) => {
    const base = resolvePath(defaultTranslations, path) ?? {};
    const value = resolvePath(localeTranslations, path);
    if (value && typeof value === 'object') {
      return { ...base, ...value };
    }
    return { ...base };
  };

  const FALLBACK_PROCEDURE_SCHEMA = [
    { id: 'cardiology', procedures: ['A.3.1.F', 'A.4.1.F', 'A.5.1.F', 'A.7.2.F', 'A.7.3.F'] },
    { id: 'neurosciences', procedures: ['B.2.3.F', 'B.3.1.F', 'B.4.1.F', 'Z.4.5.F'] },
    { id: 'oncology', procedures: ['D.3.1.F', 'E.4.11.F', 'G.4.1.F', 'K.1.1.F', 'Z.4.42.F'] },
    { id: 'urology', procedures: ['H.2.1.F', 'H.3.1.F', 'H.3.2.F', 'H.5.1.F'] },
    { id: 'transplantation', procedures: ['L.5.1.F', 'Z.4.33.F', 'Z.4.34.F', 'Z.4.35.F', 'Z.4.36.F'] },
    { id: 'musculoskeletal', procedures: ['Z.4.37.F', 'Z.4.38.F', 'Z.4.39.F', 'Z.4.40.F'] }
  ];

  const QUICK_PICK_CODES = ['A.3.1.F', 'A.7.3.F', 'G.4.1.F', 'Z.4.37.F', 'L.5.1.F'];

  const procedureTranslationCache = {
    promise: null,
    data: null
  };

  function parseProcedureTranslationCsv(text) {
    const lines = text.split(/\r?\n/);
    lines.shift();
    return lines
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [code, descriptionDe, descriptionFr, descriptionIt, descriptionEn] = line
          .split(';')
          .map((value) => value?.trim() ?? '');
        return {
          code,
          de: descriptionDe,
          fr: descriptionFr,
          it: descriptionIt,
          en: descriptionEn
        };
      })
      .filter((entry) => entry.code);
  }

  function loadProcedureTranslationDataset() {
    if (!procedureTranslationCache.promise) {
      procedureTranslationCache.promise = fetch('static/data/f_code_description_translated.csv')
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load procedure descriptions (${response.status})`);
          }
          return response.text();
        })
        .then((text) => {
          const parsed = parseProcedureTranslationCsv(text);
          procedureTranslationCache.data = parsed;
          return parsed;
        });
    }
    return procedureTranslationCache.promise;
  }

  function applyProcedureTranslations(entries) {
    entries.forEach((entry) => {
      const code = entry.code?.trim();
      if (!code) {
        return;
      }

      const updateLocale = (localeKey, value) => {
        if (!value) {
          return;
        }
        const localeTranslations = translations[localeKey];
        if (!localeTranslations) {
          return;
        }
        if (!localeTranslations.procedures) {
          localeTranslations.procedures = {};
        }
        localeTranslations.procedures[code] = value;
      };

      updateLocale('de', entry.de);
      updateLocale('fr', entry.fr);
      updateLocale('it', entry.it);
      updateLocale('en', entry.en);
    });
  }

  const buildProcedureCatalog = (entries) => {
    if (entries && entries.length) {
      const collator = new Intl.Collator(activeLocale === 'en' ? 'en' : `${activeLocale}-CH`, {
        sensitivity: 'base'
      });
      const sortedCodes = entries
        .map((entry) => entry.code)
        .filter((code) => Boolean(code))
        .sort((a, b) => collator.compare(getProcedureName(a), getProcedureName(b)));

      const groupedByLetter = sortedCodes.reduce((groups, code) => {
        const letter = (code && code.charAt(0).toUpperCase()) || '#';
        if (!groups.has(letter)) {
          groups.set(letter, []);
        }
        groups.get(letter).push({
          code,
          name: getProcedureName(code)
        });
        return groups;
      }, new Map());

      return Array.from(groupedByLetter.entries())
        .sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
        .map(([letter, procedures]) => {
          const categoryName = getLetterCategoryName(letter);
          const fallbackName = procedures.find((proc) => typeof proc?.name === 'string')?.name ?? '';
          const exampleName = categoryName || fallbackName;
          let label = letter;
          if (exampleName) {
            const translatedLabel = translate('messages.letterCategoryLabel', {
              letter,
              example: exampleName
            });
            label =
              typeof translatedLabel === 'string' && translatedLabel !== 'messages.letterCategoryLabel'
                ? translatedLabel
                : `${letter} - ${exampleName}`;
          }
          return {
            id: `letter-${letter}`,
            label,
            procedures
          };
        });
    }

    return FALLBACK_PROCEDURE_SCHEMA.map((category) => ({
      id: category.id,
      label: translate(`categories.${category.id}`),
      procedures: category.procedures.map((code) => ({
        code,
        name: getProcedureName(code)
      }))
    }));
  };

  const ALL_CANTONS_OPTION = 'ALL';
  const cantonIconPath = (code) => `static/images/cantons/${code.toLowerCase()}.svg`;

  const cantonNames = getObjectTranslation('messages.cantonNames');

  const getCantonShortLabel = (value) => {
    if (typeof value !== 'string') {
      return '';
    }
    const trimmed = value.trim();
    return trimmed ? trimmed.toUpperCase() : '';
  };

  const cantonOptions = [
    {
      value: ALL_CANTONS_OPTION,
      label: translate('messages.allCantons'),
      icon: cantonIconPath('CH')
    },
    ...cantonCodes.map((code) => ({
      value: code,
      label: cantonNames[code] ?? code,
      icon: cantonIconPath(code)
    }))
  ];

  const cantonOptionMap = new Map(cantonOptions.map((option) => [option.value, option]));
  const getCantonOptionByValue = (value) =>
    cantonOptionMap.get(value) ?? cantonOptionMap.get(ALL_CANTONS_OPTION);

  const getCantonLabel = (value) => {
    if (!value) {
      return '';
    }
    if (value === ALL_CANTONS_OPTION) {
      return translate('messages.allCantons');
    }
    const option = getCantonOptionByValue(value);
    return option?.label ?? cantonNames[value] ?? value;
  };

  const typeLabels = getObjectTranslation('types.labels');
  const typeBadges = getObjectTranslation('types.badges');
  const typeLegend = getObjectTranslation('types.legend');
  const typeColors = {
    university: '#0f766e',
    kanton: '#2563eb',
    private: '#ca8a04'
  };
  const hhiLabels = getObjectTranslation('hhi.labels');
  const hhiFootnote = translate('hhi.footnote');
  const kpiLabels = {
    totalCases: translate('kpi.totalCases'),
    casesPer100k: translate('kpi.casesPer100k'),
    universityShare: translate('kpi.universityShare'),
    centralization: translate('kpi.centralization')
  };
  const quickPickLabels = getObjectTranslation('quickPickLabels');
  const msg = (key, replacements) => translate(`messages.${key}`, replacements);

  const PAGE_SIZE = 7;
  let hasFinderResizeListener = false;
  const typeOrder = ['university', 'kanton', 'private', 'other'];

  function initializeFinderUi(procedureCatalog) {
    const finderProcedureSearch = document.getElementById('finder-procedure-search');
    const finderCategoryTabs = document.getElementById('finder-category-tabs');
    const finderProcedureList = document.getElementById('finder-procedure-list');
    const finderTypeToggle = document.getElementById('finder-type-toggle');
    const finderSearch = document.getElementById('finder-search');
    const finderCanton = document.getElementById('finder-canton');
    const finderKpis = document.getElementById('finder-kpis');
    const finderList = document.getElementById('finder-list');
    const finderListContext = document.getElementById('finder-list-context');
    const finderListTitle = document.getElementById('finder-list-title');
    const finderListMeta = document.getElementById('finder-list-meta');
    const finderMap = document.getElementById('finder-map');
    const finderCantonSummary = document.getElementById('finder-canton-summary');
    const finderCantonList = document.getElementById('finder-canton-list');
    const finderCantonComparisonCard = document.getElementById('finder-canton-comparison-card');
    const finderCantonComparisonCaption = document.getElementById('finder-canton-comparison-caption');
    const finderCantonComparisonChart = document.getElementById('finder-canton-comparison-chart');
    const finderCantonFlag = document.getElementById('finder-canton-flag');
    const finderCantonFlagImage = finderCantonFlag ? finderCantonFlag.querySelector('img') : null;
    const finderQuickPicks = document.getElementById('finder-quick-picks');
    const finderQuickTitle = document.getElementById('finder-quick-title');
    const finderQuickList = document.getElementById('finder-quick-list');
    const finderQuickDescription = document.getElementById('finder-quick-description');

    let latestSwitzerlandLabel = 'Switzerland';

    const quickPickButtons = new Map();

    const detailFallbacks = {
      title: 'Hospital details',
      subtitle: 'Procedure: {procedure}',
      close: 'Close',
      type: 'Hospital type',
      canton: 'Canton',
      share: 'Share of selected hospitals',
      cases2023: 'Cases 2023',
      section2023: '2023 quality metrics',
      observed2023: 'Observed rate 2023',
      expected2023: 'Expected rate 2023',
      smr2023: 'Standardized mortality ratio 2023',
      sectionHistorical: '2018–2022 benchmark',
      observedHistorical: 'Observed rate 2018–2022',
      expectedHistorical: 'Expected rate 2018–2022',
      smrHistorical: 'Standardized mortality ratio 2018–2022',
      casesHistorical: 'Cases 2018–2022',
      note: 'Rates are shown as reported in CH-IQI publications and may be suppressed when data volumes are low.',
      infoAddress: 'Address',
      infoLocation: 'Location',
      infoWebsite: 'Website',
      infoWebsiteMap: 'Open map',
      infoCoordinates: 'Coordinates',
      infoUnavailable: 'Not available',
      infoTotalCases: 'Total F cases (2023)',
      infoTotalProcedures: 'Distinct F procedures',
      proceduresTitle: 'Procedure mix',
      proceduresDescription: 'CH-IQI tracks {count} specialized procedures in this hospital ({total} total cases in 2023).',
      proceduresCode: 'Code',
      proceduresName: 'Procedure',
      proceduresCases: 'Cases 2023',
      proceduresShare: 'Share of F volume',
      proceduresEmpty: 'No F-coded procedures were reported for this hospital.',
      originalName: 'Reported as {original}',
      openAria: 'Show details for {hospital}'
    };

    const detailMessage = (key, replacements = {}) => {
      const messageKey = `hospitalDetail.${key}`;
      const translation = msg(messageKey, replacements);
      if (typeof translation === 'string' && translation !== `messages.${messageKey}`) {
        return translation;
      }
      const fallback = detailFallbacks[key];
      if (typeof fallback === 'string') {
        return fallback.replace(/\{(\w+)\}/g, (_, name) => replacements[name] ?? '');
      }
      return '';
    };

    const hospitalDetail = (() => {
      const overlay = document.createElement('div');
      overlay.className = 'hospital-detail-overlay';
      overlay.hidden = true;
      overlay.innerHTML = `
        <div class="hospital-detail" role="dialog" aria-modal="true" aria-labelledby="hospital-detail-title" tabindex="-1">
          <button type="button" class="hospital-detail__close"></button>
          <div class="hospital-detail__content"></div>
        </div>
      `;
      document.body.appendChild(overlay);

      const dialog = overlay.querySelector('.hospital-detail');
      const closeBtn = overlay.querySelector('.hospital-detail__close');
      const content = overlay.querySelector('.hospital-detail__content');

      let lastActiveElement = null;
      let isOpen = false;

      const updateCloseButton = () => {
        const label = detailMessage('close') || 'Close';
        closeBtn.innerHTML = '<span aria-hidden="true">&times;</span>';
        closeBtn.setAttribute('aria-label', label);
        closeBtn.setAttribute('title', label);
      };

      const formatInteger = (value) =>
        Number.isFinite(value) ? value.toLocaleString() : '—';

      const formatPercent = (value) =>
        Number.isFinite(value)
          ? `${value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
          : '—';

      const formatFraction = (value) =>
        Number.isFinite(value)
          ? `${(value * 100).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
          : '—';

      const formatRatio = (value) =>
        Number.isFinite(value)
          ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : '—';

      const formatCoordinate = (value, axis) => {
        if (!Number.isFinite(value)) {
          return null;
        }
        const absolute = Math.abs(value);
        const direction = axis === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
        return `${absolute.toFixed(3)}° ${direction}`;
      };

      const buildExternalLink = (url, label) => {
        if (!url) {
          return '';
        }
        const trimmed = url.trim();
        if (!trimmed) {
          return '';
        }
        const safeUrl = escapeAttribute(trimmed);
        const display =
          label && typeof label === 'string' && label.trim()
            ? label.trim()
            : trimmed.replace(/^https?:\/\//i, '').replace(/\/$/, '');
        return `<a href="${safeUrl}" class="hospital-detail__link" target="_blank" rel="noopener">${escapeHtml(display)}</a>`;
      };

      const renderMetricsSection = (title, rows) => {
        const safeTitle = escapeHtml(title);
        const items = rows
          .map((row) => {
            const safeLabel = escapeHtml(row.label);
            const safeValue = escapeHtml(row.value);
            return `
              <div class="hospital-detail__metric">
                <span class="hospital-detail__metric-label">${safeLabel}</span>
                <span class="hospital-detail__metric-value">${safeValue}</span>
              </div>
            `;
          })
          .join('');
        return `
          <div class="hospital-detail__metrics-section">
            <h3>${safeTitle}</h3>
            <div class="hospital-detail__metrics-grid">${items}</div>
          </div>
        `;
      };

      const buildContent = (entry, context = {}) => {
        const procedure = context.procedure;
        const procedureLabel = procedure ? `${procedure.name} (${procedure.code})` : '';
        const eyebrow = detailMessage('title');
        const subtitleRaw = procedureLabel ? detailMessage('subtitle', { procedure: procedureLabel }) : '';
        const subtitle = subtitleRaw && subtitleRaw !== 'Procedure: ' ? subtitleRaw : subtitleRaw;
        const typeLabel = typeBadges[entry.type] ?? entry.type;
        const badgeClass =
          entry.type === 'university' ? 'badge-university' : entry.type === 'kanton' ? 'badge-kanton' : 'badge-private';

        const summaryItems = [
          { label: detailMessage('cases2023'), value: formatInteger(entry.cases) },
          { label: detailMessage('share'), value: formatFraction(entry.share) }
        ];

        const summaryMarkup = summaryItems
          .map((item) => {
            const safeLabel = escapeHtml(item.label);
            const safeValue = escapeHtml(item.value ?? '');
            return `
              <div class="hospital-detail__summary-item">
                <span class="hospital-detail__summary-label">${safeLabel}</span>
                <span class="hospital-detail__summary-value">${safeValue}</span>
              </div>
            `;
          })
          .join('');

        const metrics = entry.metrics || {};
        const hasCurrentMetrics =
          Number.isFinite(metrics.observed2023) ||
          Number.isFinite(metrics.expected2023) ||
          Number.isFinite(metrics.smr2023);

        const metricsSections = [];

        if (hasCurrentMetrics) {
          metricsSections.push(
            renderMetricsSection(detailMessage('section2023'), [
              { label: detailMessage('observed2023'), value: formatPercent(metrics.observed2023) },
              { label: detailMessage('expected2023'), value: formatPercent(metrics.expected2023) },
              { label: detailMessage('smr2023'), value: formatRatio(metrics.smr2023) }
            ])
          );
        }

        const noDataMessage = detailMessage('noData');
        const metricsMarkup = metricsSections.length
          ? metricsSections.join('')
          : noDataMessage
              ? `<p class="hospital-detail__empty">${escapeHtml(noDataMessage)}</p>`
              : '';

        const hospitalKey = entry.originalName ?? entry.hospital;
        const hospitalRecord = finderDataset?.byHospital?.get(hospitalKey);
        const recordInfo = hospitalRecord?.info ?? {};
        const totalFcases = hospitalRecord?.totals?.fCases2023 ?? 0;

        const procedures = hospitalRecord
          ? Array.from(hospitalRecord.procedures.values()).map((proc) => ({
              code: proc.code,
              name: getProcedureName(proc.code),
              cases: proc.cases,
              share: totalFcases ? proc.cases / totalFcases : 0
            }))
          : [];
        procedures.sort((a, b) => b.cases - a.cases);

        let switzerlandLabel = translate('kpi.switzerland');
        if (typeof switzerlandLabel !== 'string' || switzerlandLabel === 'kpi.switzerland') {
          switzerlandLabel = 'Switzerland';
        }

        const locationText = recordInfo.locality
          ? `${recordInfo.locality}, ${switzerlandLabel}`
          : entry.canton
          ? `${entry.canton}, ${switzerlandLabel}`
          : '';

        const coordinatesParts = [];
        const latFormatted = formatCoordinate(entry.lat, 'lat');
        const lonFormatted = formatCoordinate(entry.lon, 'lon');
        if (latFormatted) {
          coordinatesParts.push(latFormatted);
        }
        if (lonFormatted) {
          coordinatesParts.push(lonFormatted);
        }
        const coordinatesText = coordinatesParts.join(' · ');

        const infoItems = [];

        if (recordInfo.address) {
          const addressMarkup = recordInfo.address
            .split('\n')
            .map((line) => escapeHtml(line.trim()))
            .join('<br />');
          infoItems.push({
            label: detailMessage('infoAddress'),
            value: addressMarkup,
            allowHtml: true
          });
        } else {
          infoItems.push({
            label: detailMessage('infoAddress'),
            value: detailMessage('infoUnavailable')
          });
        }

        infoItems.push({
          label: detailMessage('infoLocation'),
          value: locationText || detailMessage('infoUnavailable')
        });

        const websiteUrl = typeof recordInfo.website === 'string' ? recordInfo.website.trim() : '';
        const mapUrl =
          entry.lat != null && entry.lon != null
            ? `https://www.openstreetmap.org/?mlat=${entry.lat}&mlon=${entry.lon}&zoom=14`
            : '';
        const websiteMarkup = websiteUrl
          ? buildExternalLink(websiteUrl)
          : mapUrl
          ? buildExternalLink(mapUrl, detailMessage('infoWebsiteMap'))
          : '';
        infoItems.push({
          label: detailMessage('infoWebsite'),
          value: websiteMarkup || detailMessage('infoUnavailable'),
          allowHtml: Boolean(websiteMarkup)
        });

        infoItems.push({
          label: detailMessage('infoTotalProcedures'),
          value: formatInteger(procedures.length)
        });

        infoItems.push({
          label: detailMessage('infoTotalCases'),
          value: formatInteger(totalFcases)
        });

        infoItems.push({
          label: detailMessage('infoCoordinates'),
          value: coordinatesText || detailMessage('infoUnavailable')
        });

        infoItems.push({
          label: detailMessage('type'),
          value: typeLabel || detailMessage('infoUnavailable')
        });

        const infoHeading = detailMessage('infoHeading');
        const infoMarkup = `
          <section class="hospital-detail__info">
            ${infoHeading ? `<h3>${escapeHtml(infoHeading)}</h3>` : ''}
            <div class="hospital-detail__info-grid">
              ${infoItems
                .map((item) => {
                  const safeLabel = escapeHtml(item.label);
                  const safeValue = item.allowHtml
                    ? item.value
                    : escapeHtml(item.value ?? '');
                  return `
                    <div class="hospital-detail__info-item">
                      <span class="hospital-detail__info-label">${safeLabel}</span>
                      <span class="hospital-detail__info-value">${safeValue}</span>
                    </div>
                  `;
                })
                .join('')}
            </div>
          </section>
        `;

        const proceduresHeading = detailMessage('proceduresTitle');
        const proceduresDescription = procedures.length
          ? detailMessage('proceduresDescription', {
              count: formatInteger(procedures.length),
              total: formatInteger(totalFcases)
            })
          : '';
        let proceduresMarkup = '';

        if (procedures.length) {
          const rowsMarkup = procedures
            .map((proc) => {
              const shareValue = Number.isFinite(proc.share) ? proc.share : 0;
              const isActive = procedure && procedure.code === proc.code;
              return `
                <tr data-code="${escapeAttribute(proc.code)}" data-name="${escapeAttribute(proc.name)}" data-cases="${proc.cases}" data-share="${shareValue}"${
                  isActive ? ' class="is-active"' : ''
                }>
                  <td><span class="hospital-detail__code">${escapeHtml(proc.code)}</span></td>
                  <td>${escapeHtml(proc.name)}</td>
                  <td class="hospital-detail__cell--numeric">${formatInteger(proc.cases)}</td>
                  <td class="hospital-detail__cell--numeric">${formatFraction(shareValue)}</td>
                </tr>
              `;
            })
            .join('');
          proceduresMarkup = `
            <section class="hospital-detail__procedures">
              <div class="hospital-detail__section-header">
                <h3>${escapeHtml(proceduresHeading)}</h3>
                ${proceduresDescription ? `<p>${escapeHtml(proceduresDescription)}</p>` : ''}
              </div>
              <div class="hospital-detail__table-wrapper">
                <table class="hospital-detail__table" data-sort-key="cases" data-sort-direction="desc">
                  <thead>
                    <tr>
                      <th scope="col" data-sort-key="code" data-default-direction="asc">
                        <span>${escapeHtml(detailMessage('proceduresCode'))}</span>
                        <span class="hospital-detail__sort-icon" aria-hidden="true"></span>
                      </th>
                      <th scope="col" data-sort-key="name" data-default-direction="asc">
                        <span>${escapeHtml(detailMessage('proceduresName'))}</span>
                        <span class="hospital-detail__sort-icon" aria-hidden="true"></span>
                      </th>
                      <th scope="col" class="hospital-detail__cell--numeric" data-sort-key="cases" data-default-direction="desc">
                        <span>${escapeHtml(detailMessage('proceduresCases'))}</span>
                        <span class="hospital-detail__sort-icon" aria-hidden="true"></span>
                      </th>
                      <th scope="col" class="hospital-detail__cell--numeric" data-sort-key="share" data-default-direction="desc">
                        <span>${escapeHtml(detailMessage('proceduresShare'))}</span>
                        <span class="hospital-detail__sort-icon" aria-hidden="true"></span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rowsMarkup}
                  </tbody>
                </table>
              </div>
            </section>
          `;
        } else {
          proceduresMarkup = `
            <section class="hospital-detail__procedures">
              <div class="hospital-detail__section-header">
                <h3>${escapeHtml(proceduresHeading)}</h3>
              </div>
              <p class="hospital-detail__empty">${escapeHtml(detailMessage('proceduresEmpty'))}</p>
            </section>
          `;
        }

        const originalNameMarkup =
          entry.originalName && entry.originalName !== entry.hospital
            ? `<p class="hospital-detail__original">${escapeHtml(
                detailMessage('originalName', { original: entry.originalName })
              )}</p>`
            : '';

        const noteText = detailMessage('note');

        const eyebrowMarkup = eyebrow
          ? `<span class="hospital-detail__eyebrow">${escapeHtml(eyebrow)}</span>`
          : '';

        const subtitleMarkup = subtitle
          ? `<p class="hospital-detail__subtitle">${escapeHtml(subtitle)}</p>`
          : '';

        return `
          <header class="hospital-detail__header">
            ${eyebrowMarkup}
            <h2 id="hospital-detail-title">${escapeHtml(entry.hospital)}</h2>
            <div class="hospital-detail__tags">
              <span class="finder-badge ${badgeClass}">${escapeHtml(typeLabel)}</span>
              <span class="finder-badge finder-badge--neutral">${escapeHtml(entry.canton)}</span>
            </div>
          </header>
          ${infoMarkup}
          ${subtitleMarkup}
          <section class="hospital-detail__summary">${summaryMarkup}</section>
          ${proceduresMarkup}
          <section class="hospital-detail__metrics">${metricsMarkup}</section>
          ${originalNameMarkup}
          <p class="hospital-detail__note">${escapeHtml(noteText)}</p>
        `;
      };

      const enhanceContent = () => {
        const table = content.querySelector('.hospital-detail__table');
        if (!table) {
          return;
        }

        const tbody = table.querySelector('tbody');
        if (!tbody) {
          return;
        }

        let rowsData = Array.from(tbody.querySelectorAll('tr')).map((row) => ({
          row,
          code: row.dataset.code ?? '',
          name: row.dataset.name ?? '',
          cases: Number(row.dataset.cases ?? '0'),
          share: Number(row.dataset.share ?? '0')
        }));

        if (!rowsData.length) {
          return;
        }

        const headers = Array.from(table.querySelectorAll('th[data-sort-key]'));
        if (!headers.length) {
          return;
        }

        const defaultKey = table.dataset.sortKey || 'cases';
        const defaultDirection = table.dataset.sortDirection === 'asc' ? 'asc' : 'desc';
        let currentSort = { key: defaultKey, direction: defaultDirection };

        const getDefaultDirection = (key) => {
          const header = headers.find((h) => h.dataset.sortKey === key);
          return header?.dataset.defaultDirection || (key === 'cases' || key === 'share' ? 'desc' : 'asc');
        };

        const sortRows = (key, direction) => {
          const factor = direction === 'asc' ? 1 : -1;
          rowsData.sort((a, b) => {
            const valueA = a[key];
            const valueB = b[key];
            const bothNumeric =
              typeof valueA === 'number' && typeof valueB === 'number' && !Number.isNaN(valueA) && !Number.isNaN(valueB);
            if (bothNumeric) {
              if (valueA === valueB) {
                return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) * factor;
              }
              return (valueA - valueB) * factor;
            }
            return String(valueA).localeCompare(String(valueB), undefined, { sensitivity: 'base' }) * factor;
          });
        };

        const updateHeaders = () => {
          headers.forEach((header) => {
            const isActive = header.dataset.sortKey === currentSort.key;
            header.classList.toggle('is-sorted', isActive);
            header.classList.toggle('is-desc', isActive && currentSort.direction === 'desc');
            header.classList.toggle('is-asc', isActive && currentSort.direction === 'asc');
            header.setAttribute('role', 'columnheader');
            header.setAttribute('tabindex', '0');
            if (isActive) {
              header.setAttribute('aria-sort', currentSort.direction === 'asc' ? 'ascending' : 'descending');
              header.dataset.sortDirection = currentSort.direction;
            } else {
              header.removeAttribute('aria-sort');
              header.removeAttribute('data-sort-direction');
            }
          });
        };

        const applySort = (key, direction) => {
          currentSort = { key, direction };
          sortRows(key, direction);
          const fragment = document.createDocumentFragment();
          rowsData.forEach(({ row }) => fragment.appendChild(row));
          tbody.appendChild(fragment);
          updateHeaders();
        };

        applySort(currentSort.key, currentSort.direction);

        headers.forEach((header) => {
          header.addEventListener('click', () => {
            const key = header.dataset.sortKey;
            if (!key) {
              return;
            }
            let direction;
            if (currentSort.key === key) {
              direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
              direction = header.dataset.defaultDirection || getDefaultDirection(key);
            }
            applySort(key, direction);
          });
          header.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              header.click();
            }
          });
        });
      };

      const handleKeydown = (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
        }
      };

      const close = () => {
        if (!isOpen) {
          return;
        }
        isOpen = false;
        overlay.classList.remove('is-visible');
        document.removeEventListener('keydown', handleKeydown);
        const finish = () => {
          overlay.hidden = true;
          overlay.removeEventListener('transitionend', finish);
          if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
            lastActiveElement.focus();
          }
          lastActiveElement = null;
        };
        overlay.addEventListener('transitionend', finish);
        setTimeout(finish, 220);
      };

      const open = (entry, context) => {
        if (!entry) {
          return;
        }
        updateCloseButton();
        content.innerHTML = buildContent(entry, context);
        enhanceContent();
        overlay.hidden = false;
        requestAnimationFrame(() => {
          overlay.classList.add('is-visible');
          dialog.focus({ preventScroll: true });
        });
        lastActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        document.addEventListener('keydown', handleKeydown);
        isOpen = true;
      };

      closeBtn.addEventListener('click', (event) => {
        event.preventDefault();
        close();
      });

      overlay.addEventListener('mousedown', (event) => {
        if (event.target === overlay) {
          close();
        }
      });

      return { open, close };
    })();

    const findProcedureEntry = (code) => {
      if (!code) {
        return null;
      }
      for (const category of procedureCatalog) {
        const match = category.procedures?.find((proc) => proc.code === code);
        if (match) {
          return { category, procedure: match };
        }
      }
      return null;
    };

    const setQuickPickCopy = () => {
      if (finderQuickTitle) {
        const title = msg('quickPicksTitle');
        finderQuickTitle.textContent =
          typeof title === 'string' && title !== 'messages.quickPicksTitle'
            ? title
            : 'Popular procedures';
      }
      if (finderQuickDescription) {
        const description = msg('quickPicksDescription');
        finderQuickDescription.textContent =
          typeof description === 'string' && description !== 'messages.quickPicksDescription'
            ? description
            : 'Jump straight to a CH-IQI procedure people look up most often.';
      }
      if (finderQuickList) {
        const labelText = finderQuickTitle?.textContent?.trim();
        if (labelText) {
          finderQuickList.setAttribute('aria-label', labelText);
        } else {
          finderQuickList.removeAttribute('aria-label');
        }
      }
    };

    const updateQuickPickState = () => {
      const activeCode = state.hasUserSelection ? state.selectedProc?.code : null;
      quickPickButtons.forEach((button, code) => {
        const isActive = state.hasUserSelection && code === activeCode;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    };

    const setupQuickPicks = () => {
      if (!finderQuickPicks || !finderQuickList) {
        return;
      }

      const picks = QUICK_PICK_CODES.map((code) => findProcedureEntry(code)).filter(Boolean);
      if (!picks.length) {
        finderQuickPicks.hidden = true;
        return;
      }

      setQuickPickCopy();
      finderQuickPicks.hidden = false;
      quickPickButtons.clear();
      finderQuickList.innerHTML = picks
        .map(({ procedure }) => {
          const safeCode = escapeAttribute(procedure.code);
          const displayName = quickPickLabels?.[procedure.code] || procedure.name;
          const safeName = escapeHtml(displayName);
          return `
            <button type="button" class="finder-quick-btn" data-code="${safeCode}" aria-pressed="false">
              <span>${safeName}</span>
              <span class="finder-quick-code">${safeCode}</span>
            </button>
          `;
        })
        .join('');

      finderQuickList.querySelectorAll('.finder-quick-btn').forEach((btn) => {
        quickPickButtons.set(btn.dataset.code, btn);
        btn.addEventListener('click', () => {
          const entry = findProcedureEntry(btn.dataset.code);
          if (!entry) {
            return;
          }
          state.selectedCategory = entry.category.id;
          state.selectedProc = entry.procedure;
          state.procedureQuery = '';
          finderProcedureSearch.value = '';
          state.listPage = 0;
          state.hasUserSelection = true;
          state.shouldScrollToResults = true;
          render();
        });
      });

      updateQuickPickState();
    };

    let cantonDropdown;
    let cantonDropdownToggle;
    let cantonDropdownMenu;
    let cantonDropdownOptions = [];
    let cantonDropdownOpen = false;
    let cantonDropdownActiveIndex = -1;
    const cantonDropdownMenuId = 'finder-canton-dropdown-menu';

    function getResultsScrollAnchor() {
      if (finderRoot) {
        const explicitAnchor = finderRoot.querySelector('[data-finder-results-anchor]');
        if (explicitAnchor) {
          return explicitAnchor;
        }
      }

      return (
        finderListTitle?.closest('.finder-list-card') ||
        finderRoot?.querySelector('.finder-main') ||
        finderList
      );
    }

    function scrollToResultsIfNeeded() {
      if (!state.shouldScrollToResults) {
        return;
      }

      state.shouldScrollToResults = false;
      requestAnimationFrame(() => {
        const anchor = getResultsScrollAnchor();
        if (!anchor) {
          return;
        }

        let offset = 24;
        const header = document.querySelector('.header-left');
        if (header) {
          const rect = header.getBoundingClientRect();
          const headerOffset = rect.bottom + 16;
          if (!Number.isNaN(headerOffset)) {
            offset = Math.max(offset, headerOffset);
          }
        }

        const top = anchor.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      });
    }

    function renderCantonDropdownOption(option) {
      if (!option) {
        return '';
      }
      return `
        <span class="finder-canton-dropdown__label">${option.label}</span>
        <span class="finder-canton-dropdown__icon" aria-hidden="true">
          <img src="${option.icon}" alt="" loading="lazy" />
        </span>
      `;
    }

    function updateCantonDropdownDisplay(value) {
      if (!cantonDropdownToggle) {
        return;
      }
      const option = getCantonOptionByValue(value);
      cantonDropdownToggle.innerHTML = renderCantonDropdownOption(option);
      cantonDropdownToggle.dataset.value = option.value;
      cantonDropdownOptions.forEach((optionEl, index) => {
        const isSelected = optionEl.dataset.value === option.value;
        optionEl.classList.toggle('is-selected', isSelected);
        optionEl.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        if (isSelected) {
          cantonDropdownActiveIndex = index;
          if (!cantonDropdownOpen && cantonDropdownMenu) {
            cantonDropdownMenu.setAttribute('aria-activedescendant', optionEl.id);
          }
        }
      });
    }

    function focusCantonDropdownOption(index) {
      if (!cantonDropdownOptions.length) {
        return;
      }
      const clampedIndex = Math.max(0, Math.min(index, cantonDropdownOptions.length - 1));
      cantonDropdownActiveIndex = clampedIndex;
      cantonDropdownOptions.forEach((optionEl, optionIndex) => {
        const isActive = optionIndex === clampedIndex;
        optionEl.classList.toggle('is-focused', isActive);
        if (isActive) {
          optionEl.focus();
          optionEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          if (cantonDropdownMenu) {
            cantonDropdownMenu.setAttribute('aria-activedescendant', optionEl.id);
          }
        }
      });
    }

    function handleDocumentClickForDropdown(event) {
      if (!cantonDropdown || cantonDropdown.contains(event.target)) {
        return;
      }
      closeCantonDropdown();
    }

    function handleDocumentKeydownForDropdown(event) {
      if (event.key === 'Escape' && cantonDropdownOpen) {
        closeCantonDropdown();
        cantonDropdownToggle?.focus();
      }
    }

    function closeCantonDropdown() {
      if (!cantonDropdownOpen || !cantonDropdown || !cantonDropdownMenu || !cantonDropdownToggle) {
        return;
      }
      cantonDropdownOpen = false;
      cantonDropdown.classList.remove('is-open');
      cantonDropdownToggle.setAttribute('aria-expanded', 'false');
      cantonDropdownOptions.forEach((optionEl) => optionEl.classList.remove('is-focused'));
      const menuRef = cantonDropdownMenu;
      const hideMenu = () => {
        menuRef.hidden = true;
        menuRef.removeEventListener('transitionend', hideMenu);
        menuRef.removeEventListener('transitioncancel', hideMenu);
      };
      menuRef.addEventListener('transitionend', hideMenu);
      menuRef.addEventListener('transitioncancel', hideMenu);
      setTimeout(() => {
        if (!cantonDropdownOpen) {
          hideMenu();
        }
      }, 220);
      cantonDropdownMenu.removeAttribute('aria-activedescendant');
      document.removeEventListener('mousedown', handleDocumentClickForDropdown);
      document.removeEventListener('keydown', handleDocumentKeydownForDropdown);
    }

    function openCantonDropdown() {
      if (cantonDropdownOpen || !cantonDropdown || !cantonDropdownMenu || !cantonDropdownToggle) {
        return;
      }
      cantonDropdownOpen = true;
      cantonDropdownMenu.hidden = false;
      cantonDropdownToggle.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => {
        if (cantonDropdownOpen) {
          cantonDropdown.classList.add('is-open');
        }
      });
      const selectedIndex = cantonDropdownOptions.findIndex(
        (optionEl) => optionEl.dataset.value === finderCanton?.value
      );
      focusCantonDropdownOption(selectedIndex >= 0 ? selectedIndex : 0);
      document.addEventListener('mousedown', handleDocumentClickForDropdown);
      document.addEventListener('keydown', handleDocumentKeydownForDropdown);
    }

    function selectCantonFromDropdown(value) {
      if (!finderCanton) {
        return;
      }
      const option = getCantonOptionByValue(value);
      finderCanton.value = option.value;
      finderCanton.dispatchEvent(new Event('change', { bubbles: true }));
      closeCantonDropdown();
      cantonDropdownToggle?.focus();
    }

    function ensureCantonDropdown() {
      if (!finderCanton || cantonDropdown) {
        return;
      }
      const wrapper = finderCanton.closest('.finder-control');
      if (!wrapper) {
        return;
      }

      cantonDropdownOptions = [];
      const dropdown = document.createElement('div');
      dropdown.className = 'finder-canton-dropdown';

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.id = 'finder-canton-dropdown-toggle';
      toggle.className = 'finder-canton-dropdown__toggle';
      toggle.setAttribute('aria-haspopup', 'listbox');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', cantonDropdownMenuId);

      const menu = document.createElement('ul');
      menu.id = cantonDropdownMenuId;
      menu.className = 'finder-canton-dropdown__menu';
      menu.setAttribute('role', 'listbox');
      menu.setAttribute('aria-labelledby', toggle.id);
      menu.hidden = true;

      dropdown.appendChild(toggle);
      dropdown.appendChild(menu);

      cantonOptions.forEach((option) => {
        const optionEl = document.createElement('li');
        optionEl.className = 'finder-canton-dropdown__option';
        optionEl.setAttribute('role', 'option');
        optionEl.dataset.value = option.value;
        optionEl.id = `finder-canton-option-${option.value}`;
        optionEl.tabIndex = -1;
        optionEl.innerHTML = renderCantonDropdownOption(option);
        menu.appendChild(optionEl);
        cantonDropdownOptions.push(optionEl);
      });

      finderCanton.insertAdjacentElement('afterend', dropdown);
      wrapper.classList.add('finder-canton--enhanced');

      cantonDropdown = dropdown;
      cantonDropdownToggle = toggle;
      cantonDropdownMenu = menu;

      cantonDropdownToggle.addEventListener('click', (event) => {
        event.preventDefault();
        if (cantonDropdownOpen) {
          closeCantonDropdown();
        } else {
          openCantonDropdown();
        }
      });

      cantonDropdownToggle.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          if (!cantonDropdownOpen) {
            openCantonDropdown();
          }
          const selectedIndex = cantonDropdownOptions.findIndex(
            (optionEl) => optionEl.dataset.value === finderCanton.value
          );
          if (event.key === 'ArrowDown') {
            focusCantonDropdownOption(selectedIndex >= 0 ? selectedIndex : 0);
          } else {
            const lastIndex = cantonDropdownOptions.length - 1;
            focusCantonDropdownOption(selectedIndex >= 0 ? selectedIndex : lastIndex);
          }
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (cantonDropdownOpen && cantonDropdownActiveIndex >= 0) {
            const selectedEl = cantonDropdownOptions[cantonDropdownActiveIndex];
            selectCantonFromDropdown(selectedEl.dataset.value);
          } else {
            openCantonDropdown();
          }
        } else if (event.key === 'Escape' && cantonDropdownOpen) {
          event.preventDefault();
          closeCantonDropdown();
        }
      });

      cantonDropdownMenu.addEventListener('click', (event) => {
        const optionEl = event.target.closest('.finder-canton-dropdown__option');
        if (optionEl) {
          event.preventDefault();
          selectCantonFromDropdown(optionEl.dataset.value);
        }
      });

      cantonDropdownMenu.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          const nextIndex = Math.min(
            cantonDropdownOptions.length - 1,
            (cantonDropdownActiveIndex === -1 ? 0 : cantonDropdownActiveIndex + 1)
          );
          focusCantonDropdownOption(nextIndex);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          const prevIndex = Math.max(0, (cantonDropdownActiveIndex === -1 ? 0 : cantonDropdownActiveIndex - 1));
          focusCantonDropdownOption(prevIndex);
        } else if (event.key === 'Home') {
          event.preventDefault();
          focusCantonDropdownOption(0);
        } else if (event.key === 'End') {
          event.preventDefault();
          focusCantonDropdownOption(cantonDropdownOptions.length - 1);
        } else if (event.key === 'Enter' || event.key === ' ') {
          const optionEl = event.target.closest('.finder-canton-dropdown__option');
          if (optionEl) {
            event.preventDefault();
            selectCantonFromDropdown(optionEl.dataset.value);
          }
        } else if (event.key === 'Escape') {
          event.preventDefault();
          closeCantonDropdown();
          cantonDropdownToggle.focus();
        }
      });
    }

    if (!finderProcedureSearch || !finderCategoryTabs || !finderProcedureList) {
      console.warn('Procedure finder UI is missing required elements.');
      return;
    }

    const mapState = {
      ready: false,
      map: null,
      markersLayer: null,
      container: null,
      messageEl: null,
      legendEls: { university: null, kanton: null, private: null }
    };

    function ensureMapStructure() {
      if (!finderMap) {
        return false;
      }
      if (typeof window.L === 'undefined') {
        return false;
      }
      if (!mapState.ready) {
        finderMap.innerHTML = `
          <div class="finder-map-view" role="img"></div>
          <p class="finder-map-message finder-empty" hidden></p>
          <div class="finder-map-legend">
            <span data-type="university"><i style="background:${typeColors.university}"></i><span class="legend-label"></span></span>
            <span data-type="kanton"><i style="background:${typeColors.kanton}"></i><span class="legend-label"></span></span>
            <span data-type="private"><i style="background:${typeColors.private}"></i><span class="legend-label"></span></span>
          </div>
        `;
        mapState.container = finderMap.querySelector('.finder-map-view');
        mapState.messageEl = finderMap.querySelector('.finder-map-message');
        mapState.legendEls = {
          university: finderMap.querySelector('[data-type="university"] .legend-label'),
          kanton: finderMap.querySelector('[data-type="kanton"] .legend-label'),
          private: finderMap.querySelector('[data-type="private"] .legend-label')
        };

        mapState.map = L.map(mapState.container, {
          zoomSnap: 0.5,
          scrollWheelZoom: false,
          attributionControl: true
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attribution">CARTO</a>'
        }).addTo(mapState.map);

        if (mapState.map.attributionControl?.setPrefix) {
          mapState.map.attributionControl.setPrefix('');
        }

        mapState.markersLayer = L.layerGroup().addTo(mapState.map);
        mapState.ready = true;
        requestAnimationFrame(() => mapState.map.invalidateSize());
      }
      mapState.container.setAttribute('aria-label', msg('mapAriaLabel'));
      mapState.legendEls.university.textContent = typeLegend.university;
      mapState.legendEls.kanton.textContent = typeLegend.kanton;
      mapState.legendEls.private.textContent = typeLegend.private;
      mapState.messageEl.hidden = true;

      return true;
    }

    function displayMapMessage(message, className = 'finder-empty') {
      if (!finderMap) {
        return;
      }
      if (!ensureMapStructure()) {
        finderMap.innerHTML = `<p class="${className}">${message}</p>`;
        return;
      }
      mapState.markersLayer?.clearLayers();
      mapState.messageEl.className = `finder-map-message ${className}`;
      mapState.messageEl.textContent = message;
      mapState.messageEl.hidden = false;
    }

    const defaultCategory = procedureCatalog[0] ?? null;
    const defaultProcedure = defaultCategory?.procedures?.[0] ?? null;

    const state = {
      selectedCategory: defaultCategory?.id ?? null,
      selectedProc: defaultProcedure,
      selectedCanton: ALL_CANTONS_OPTION,
      search: '',
      procedureQuery: '',
      typeFilter: { university: true, kanton: true, private: true },
      listPage: 0,
      shouldScrollToResults: false,
      shouldScrollToProcedures: false,
      hasUserSelection: false
    };

    setupQuickPicks();

    const labelFromHHI = (hhi) => (hhi < 1500 ? hhiLabels.low : hhi <= 2500 ? hhiLabels.moderate : hhiLabels.high);

    let finderDataset = null;
    let availableTypes = [];

    function ensureTypeFilter() {
      availableTypes.forEach((type) => {
        if (state.typeFilter[type] === undefined) {
          state.typeFilter[type] = true;
        }
      });
    }

    function matchesProcedure(procedure, query) {
      if (!query) {
        return true;
      }

      const normalizedQuery = normalizeString(query.trim());
      if (!normalizedQuery) {
        return true;
      }

      const haystack = `${procedure.name} ${procedure.code}`;
      if (normalizeString(haystack).includes(normalizedQuery)) {
        return true;
      }

      const condensedQuery = normalizedQuery.replace(/[^a-z0-9]/g, '');
      if (!condensedQuery) {
        return false;
      }

      const condensedCode = normalizeAlphanumeric(procedure.code);
      return condensedCode.includes(condensedQuery);
    }

    function renderProcedureControls() {
      finderProcedureSearch.value = state.procedureQuery;

      let activeCategory = procedureCatalog.find((cat) => cat.id === state.selectedCategory) ?? null;
      if (!activeCategory && procedureCatalog.length) {
        activeCategory = procedureCatalog[0];
        state.selectedCategory = activeCategory.id;
        if (!state.selectedProc) {
          state.selectedProc = activeCategory.procedures?.[0] ?? null;
        }
      }

      if (activeCategory && activeCategory.procedures && activeCategory.procedures.length) {
        const hasSelected = activeCategory.procedures.some((proc) => proc.code === state.selectedProc?.code);
        if (!hasSelected && activeCategory.procedures[0]) {
          state.selectedProc = activeCategory.procedures[0];
        }
      }

      const query = state.procedureQuery.trim().toLowerCase();
      const isSearching = Boolean(query);

      const categoriesWithMatches = procedureCatalog.map((category) => ({
        ...category,
        hasMatch: category.procedures.some((proc) => matchesProcedure(proc, query))
      }));

      finderCategoryTabs.innerHTML = categoriesWithMatches
        .map((category) => {
          const isActive = !isSearching && category.id === state.selectedCategory;
          const dimmed = isSearching && !category.hasMatch;
          return `
          <button type="button" class="finder-chip finder-category-btn${
            isActive ? ' active' : ''
          }${dimmed ? ' dimmed' : ''}" data-category="${category.id}">
            ${category.label}
          </button>
        `;
        })
        .join('');

      finderCategoryTabs.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          const category = procedureCatalog.find((cat) => cat.id === btn.dataset.category);
          if (!category) {
            return;
          }
          state.selectedCategory = category.id;
          state.selectedProc = category.procedures?.[0] ?? state.selectedProc;
          state.procedureQuery = '';
          finderProcedureSearch.value = '';
          state.listPage = 0;
          state.shouldScrollToResults = false;
          const shouldAutoScroll =
            typeof window !== 'undefined' && typeof window.matchMedia === 'function'
              ? window.matchMedia('(max-width: 768px)').matches
              : false;
          state.shouldScrollToProcedures = shouldAutoScroll;
          render();
        });
      });

      let groupsToRender = [];
      if (isSearching) {
        groupsToRender = categoriesWithMatches
          .filter((category) => category.hasMatch)
          .map((category) => ({
            id: category.id,
            label: category.label,
            procedures: category.procedures.filter((proc) => matchesProcedure(proc, query))
          }));
      } else if (activeCategory) {
        groupsToRender = [
          {
            id: activeCategory.id,
            label: activeCategory.label,
            procedures: activeCategory.procedures
          }
        ];
      }

      const hasProcedures = groupsToRender.some((group) => group.procedures && group.procedures.length);

      if (!hasProcedures) {
        finderProcedureList.innerHTML = `<p class="finder-procedure-empty">${msg(
          'noProceduresMatch'
        )}</p>`;
        if (state.shouldScrollToProcedures) {
          state.shouldScrollToProcedures = false;
          const target = finderProcedureList.closest('.finder-procedure-panel') ?? finderProcedureList;
          if (target) {
            requestAnimationFrame(() => {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
          }
        }
        return;
      }

      finderProcedureList.innerHTML = groupsToRender
        .map((group) => {
          const showHeading = isSearching || groupsToRender.length > 1;
          const heading = showHeading ? `<p class="finder-procedure-group-title">${group.label}</p>` : '';
          const options = group.procedures
            .map((proc) => {
              const isActive = state.hasUserSelection && state.selectedProc?.code === proc.code;
              return `
              <button type="button" class="finder-procedure-option${
                isActive ? ' active' : ''
              }" data-code="${proc.code}" data-category="${group.id}">
                <span class="finder-procedure-name">${proc.name}</span>
                <span class="finder-procedure-code">${proc.code}</span>
              </button>
            `;
            })
            .join('');
          return `
          <div class="finder-procedure-group">
            ${heading}
            <div class="finder-procedure-options">
              ${options}
            </div>
          </div>
        `;
        })
        .join('');

      finderProcedureList.querySelectorAll('.finder-procedure-option').forEach((btn) => {
        btn.addEventListener('click', () => {
          const { code, category } = btn.dataset;
          const categoryEntry =
            procedureCatalog.find((cat) => cat.id === category) ||
            procedureCatalog.find((cat) => cat.procedures.some((proc) => proc.code === code));
          if (!categoryEntry) {
            return;
          }
          const selected = categoryEntry.procedures.find((proc) => proc.code === code);
          if (!selected) {
            return;
          }
          state.selectedCategory = categoryEntry.id;
          state.selectedProc = selected;
          state.procedureQuery = '';
          finderProcedureSearch.value = '';
          state.listPage = 0;
          state.hasUserSelection = true;
          state.shouldScrollToResults = true;
          render();
        });
      });

      updateQuickPickState();

      if (state.shouldScrollToProcedures) {
        state.shouldScrollToProcedures = false;
        const target = finderProcedureList.closest('.finder-procedure-panel') ?? finderProcedureList;
        if (target) {
          requestAnimationFrame(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }
      }
    }

  function renderTypeToggle() {
    if (!availableTypes.length) {
      finderTypeToggle.innerHTML = '';
      return;
    }

    const buttons = availableTypes
      .slice()
      .sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b))
      .map((type) => {
        const active = state.typeFilter[type] !== false;
        const label = typeLabels[type] || type;
        return `
          <button class="finder-type-btn${active ? ' active' : ''}" data-type="${type}">
            ${label}
          </button>
        `;
      })
      .join('');

    finderTypeToggle.innerHTML = buttons;
    finderTypeToggle.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.type;
        state.typeFilter[key] = !(state.typeFilter[key] !== false && state.typeFilter[key]);
        const hasActive = Object.values(state.typeFilter).some(Boolean);
        if (!hasActive) {
          state.typeFilter[key] = true;
        }
        state.listPage = 0;
        render();
      });
    });
  }

  function computeAggregation(procCode) {
    const hasCantonSelection = state.selectedCanton !== ALL_CANTONS_OPTION;

    if (!finderDataset) {
      return {
        total: 0,
        hospitals: [],
        hospitalCount: 0,
        uniShare: 0,
        hhi: 0,
        hhiLabel: labelFromHHI(0),
        cantonHosp: [],
        cantonTotals: hasCantonSelection
          ? { totalCases: 0, hospitalCount: 0, uniShare: 0 }
          : null,
        cantonHhi: hasCantonSelection ? 0 : null,
        cantonHhiLabel: hasCantonSelection ? labelFromHHI(0) : null
      };
    }

    const entries = finderDataset.byProcedure.get(procCode) || [];
    const enrichedAll = entries
      .map((entry) => {
        const meta = finderDataset.meta.get(entry.institution) || inferHospitalMeta(entry.institution);
        const displayName = getHospitalDisplayName(entry.institution);
        return {
          hospital: displayName,
          originalName: entry.institution,
          cases: entry.cases,
          type: meta.type,
          canton: meta.canton,
          lat: meta.lat,
          lon: meta.lon,
          metrics: entry.metrics
        };
      });

    const totalAll = enrichedAll.reduce((sum, h) => sum + h.cases, 0);

    if (!totalAll) {
      return {
        total: 0,
        hospitals: [],
        hospitalCount: 0,
        uniShare: 0,
        hhi: 0,
        hhiLabel: labelFromHHI(0),
        cantonHosp: [],
        cantonTotals: hasCantonSelection
          ? { totalCases: 0, hospitalCount: 0, uniShare: 0 }
          : null,
        cantonHhi: hasCantonSelection ? 0 : null,
        cantonHhiLabel: hasCantonSelection ? labelFromHHI(0) : null
      };
    }

    const overallUniShare = enrichedAll
      .filter((h) => h.type === 'university')
      .reduce((sum, h) => sum + h.cases, 0) / totalAll;

    const enriched = enrichedAll.filter((h) => state.typeFilter[h.type] !== false);

    const total = enriched.reduce((sum, h) => sum + h.cases, 0);

    if (!total) {
      return {
        total: 0,
        hospitals: [],
        hospitalCount: 0,
        uniShare: overallUniShare,
        hhi: 0,
        hhiLabel: labelFromHHI(0),
        cantonHosp: [],
        cantonTotals: hasCantonSelection
          ? { totalCases: 0, hospitalCount: 0, uniShare: 0 }
          : null,
        cantonHhi: hasCantonSelection ? 0 : null,
        cantonHhiLabel: hasCantonSelection ? labelFromHHI(0) : null
      };
    }

    const hospitalsWithShare = enriched
      .map((h) => ({ ...h, share: h.cases / total }))
      .sort((a, b) => b.cases - a.cases);

    const cantonHosp =
      state.selectedCanton === ALL_CANTONS_OPTION
        ? hospitalsWithShare
        : hospitalsWithShare.filter((h) => h.canton === state.selectedCanton);

    const hhi = Math.round(
      hospitalsWithShare.reduce((sum, h) => sum + (h.share * 100) ** 2, 0)
    );

    const cantonTotals = hasCantonSelection
      ? (() => {
          const cantonTotalCases = cantonHosp.reduce((sum, h) => sum + h.cases, 0);
          const cantonUniCases = cantonHosp
            .filter((h) => h.type === 'university')
            .reduce((sum, h) => sum + h.cases, 0);
          return {
            totalCases: cantonTotalCases,
            hospitalCount: cantonHosp.length,
            uniShare: cantonTotalCases ? cantonUniCases / cantonTotalCases : 0
          };
        })()
      : null;

    const cantonHhiData = hasCantonSelection
      ? (() => {
          const cantonTotalCases = cantonTotals?.totalCases ?? 0;
          if (!cantonTotalCases) {
            return { hhi: 0, label: labelFromHHI(0) };
          }
          const cantonHhiValue = Math.round(
            cantonHosp.reduce((sum, h) => {
              const share = (h.cases / cantonTotalCases) * 100;
              return sum + share ** 2;
            }, 0)
          );
          return { hhi: cantonHhiValue, label: labelFromHHI(cantonHhiValue) };
        })()
      : null;

    return {
      total,
      hospitals: hospitalsWithShare,
      hospitalCount: hospitalsWithShare.length,
      uniShare: overallUniShare,
      hhi,
      hhiLabel: labelFromHHI(hhi),
      cantonHosp,
      cantonTotals,
      cantonHhi: cantonHhiData?.hhi ?? null,
      cantonHhiLabel: cantonHhiData?.label ?? null
    };
  }

  function renderKpis(agg) {
    let switzerlandLabel = translate('kpi.switzerland');
    if (typeof switzerlandLabel !== 'string' || switzerlandLabel === 'kpi.switzerland') {
      switzerlandLabel = 'Switzerland';
    }

    latestSwitzerlandLabel = switzerlandLabel;

    const hasCantonSelection = state.selectedCanton !== ALL_CANTONS_OPTION;
    const cantonTotals = hasCantonSelection
      ? {
          totalCases: agg.cantonTotals?.totalCases ?? 0,
          hospitalCount: agg.cantonTotals?.hospitalCount ?? 0,
          uniShare: agg.cantonTotals?.uniShare ?? 0
        }
      : null;

    const formatCount = (value) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric.toLocaleString() : '0';
    };

    const formatPercent = (value) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? `${Math.round(numeric * 100)}%` : '0%';
    };

    const formatPer100k = (cases, population) => {
      const populationValue = Number(population);
      if (!Number.isFinite(populationValue) || populationValue <= 0) {
        return '—';
      }
      const casesValue = Number(cases);
      const safeCases = Number.isFinite(casesValue) ? casesValue : 0;
      const rate = (safeCases / populationValue) * 100000;
      return rate.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      });
    };

    const createValueMarkup = (label, value, options = {}) => {
      const {
        isSecondary = false,
        allowHtmlValue = false,
        valueClassName = '',
        labelType = ''
      } = options;
      const safeLabel = escapeAttribute(label);
      const safeValue = allowHtmlValue ? value : escapeAttribute(value);
      const valueClass = valueClassName ? ` ${valueClassName}` : '';
      const labelTypeAttr = labelType
        ? ` data-label-type="${escapeAttribute(labelType)}"`
        : '';
      return `
        <div class="finder-kpi-value${isSecondary ? ' finder-kpi-value--secondary' : ''}">
          <span class="finder-kpi-value-label"${labelTypeAttr}>${safeLabel}</span>
          <span class="finder-kpi-value-number${valueClass}">${safeValue}</span>
        </div>
      `;
    };

    const valueConfig = (input) =>
      input && typeof input === 'object' && 'value' in input
        ? {
            value: input.value,
            allowHtml: Boolean(input.allowHtml),
            className: typeof input.className === 'string' ? input.className : ''
          }
        : { value: input, allowHtml: false, className: '' };

    const createValuesBlock = (primaryValue, secondaryValue, options = {}) => {
      const primary = valueConfig(primaryValue);
      const primaryLabel =
        typeof options.primaryLabel === 'string' && options.primaryLabel.trim()
          ? options.primaryLabel
          : switzerlandLabel;
      const rows = [
        createValueMarkup(primaryLabel, primary.value, {
          allowHtmlValue: primary.allowHtml,
          valueClassName: primary.className,
          labelType: 'switzerland'
        })
      ];
      if (hasCantonSelection && secondaryValue != null) {
        const secondary = valueConfig(secondaryValue);
        const fallbackLabel = getCantonShortLabel(state.selectedCanton) || getCantonLabel(state.selectedCanton);
        const secondaryLabel =
          typeof options.secondaryLabel === 'string' && options.secondaryLabel.trim()
            ? options.secondaryLabel
            : fallbackLabel;
        rows.push(
          createValueMarkup(secondaryLabel, secondary.value, {
            isSecondary: true,
            allowHtmlValue: secondary.allowHtml,
            valueClassName: secondary.className,
            labelType: 'canton'
          })
        );
      }
      return `<div class="finder-kpi-values">${rows.join('')}</div>`;
    };

    const applySwitzerlandLabel = (preferredLabel) => {
      if (!finderKpis) {
        return;
      }

      const cards = Array.from(finderKpis.querySelectorAll('.finder-kpi'));
      if (!cards.length) {
        return;
      }

      const rowCounts = cards.reduce((acc, card) => {
        const key = Math.round(card.offsetTop);
        acc.set(key, (acc.get(key) || 0) + 1);
        return acc;
      }, new Map());

      const counts = Array.from(rowCounts.values());
      const isTwoRows = counts.length === 2;
      const isTwoByTwo = isTwoRows && counts.every((count) => count === 2);
      const isThreePlusOne =
        isTwoRows && counts[0] === 3 && counts[1] === 1;

      const fallbackLabel = typeof preferredLabel === 'string' && preferredLabel.trim()
        ? preferredLabel.trim()
        : 'Switzerland';
      const labelText = isTwoByTwo || isThreePlusOne ? 'CH' : fallbackLabel;

      finderKpis
        .querySelectorAll('.finder-kpi-value-label[data-label-type="switzerland"]')
        .forEach((labelEl) => {
          if (labelEl.textContent !== labelText) {
            labelEl.textContent = labelText;
          }
        });
    };

    if (typeof window !== 'undefined' && !hasFinderResizeListener) {
      window.addEventListener('resize', () => {
        applySwitzerlandLabel(latestSwitzerlandLabel);
      });
      hasFinderResizeListener = true;
    }

    const createHhiValue = (value, label) => ({
      value: [
        `<span class="finder-kpi-hhi-number">${escapeHtml(String(value ?? 0))}</span>`,
        `<span class="finder-kpi-hhi-label">${escapeHtml(label ?? labelFromHHI(value ?? 0))}</span>`
      ].join(''),
      allowHtml: true,
      className: 'finder-kpi-value-number--hhi'
    });

    const cantonPopulation = hasCantonSelection ? REGION_POPULATION[state.selectedCanton] : null;

    const tiles = [
      {
        label: kpiLabels.totalCases,
        type: 'dual',
        primary: formatCount(agg.total),
        secondary: cantonTotals ? formatCount(cantonTotals.totalCases) : null,
        footnote: ''
      },
      {
        label: kpiLabels.casesPer100k,
        type: 'dual',
        primary: formatPer100k(agg.total, REGION_POPULATION.CH),
        secondary:
          cantonTotals && cantonPopulation
            ? formatPer100k(cantonTotals.totalCases, cantonPopulation)
            : null,
        footnote: ''
      },
      {
        label: kpiLabels.centralization,
        type: 'dual',
        primary: createHhiValue(agg.hhi, agg.hhiLabel),
        secondary: hasCantonSelection
          ? createHhiValue(agg.cantonHhi, agg.cantonHhiLabel)
          : null,
        footnote: '',
        info: hhiFootnote,
        valueOptions: {
          primaryLabel: switzerlandLabel,
          secondaryLabel:
            typeof state.selectedCanton === 'string'
              ? getCantonShortLabel(state.selectedCanton)
              : getCantonLabel(state.selectedCanton)
        }
      },
      {
        label: kpiLabels.universityShare,
        type: 'dual',
        primary: formatPercent(agg.uniShare),
        secondary: cantonTotals ? formatPercent(cantonTotals.uniShare) : null,
        footnote: ''
      }
    ];

    finderKpis.innerHTML = tiles
      .map((tile, index) => {
        const infoMarkup = tile.info
          ? (() => {
              const decoded = decodeHtml(tile.info);
              const ariaLabel = escapeAttribute(decoded);
              return `
                <span class="finder-kpi-info" tabindex="0" aria-label="${ariaLabel}">
                  <span class="finder-kpi-info-icon" aria-hidden="true">i</span>
                  <span class="finder-kpi-tooltip" role="tooltip">${tile.info}</span>
                </span>
              `;
            })()
          : '';

        const labelMarkup = tile.info
          ? `
              <div class="finder-kpi-header">
                <small>${tile.label}</small>
                ${infoMarkup}
              </div>
            `
          : `<small>${tile.label}</small>`;

        const valueMarkup =
          tile.type === 'dual'
            ? createValuesBlock(tile.primary, tile.secondary, tile.valueOptions)
            : `<strong>${tile.allowHtmlValue ? tile.value : escapeAttribute(tile.value)}</strong>`;

        return `
          <div class="finder-kpi"${index === 0 ? ' data-finder-results-anchor' : ''}>
            ${labelMarkup}
            ${valueMarkup}
            ${tile.footnote ? `<span class="finder-kpi-footnote">${tile.footnote}</span>` : ''}
          </div>
        `;
      })
      .join('');

    applySwitzerlandLabel(switzerlandLabel);
  }

  function renderTopList(agg) {
    const procedureLabel = state.selectedProc
      ? `${state.selectedProc.name} (${state.selectedProc.code})`
      : msg('selectedProcedure');
    const listLocationLabel =
      state.selectedCanton === ALL_CANTONS_OPTION
        ? msg('topHospitals')
        : msg('topHospitalsIn', { canton: getCantonLabel(state.selectedCanton) });
    if (finderListContext) {
      finderListContext.textContent = listLocationLabel;
    }
    finderListTitle.textContent = procedureLabel;

    if (!agg.hospitals.length) {
      finderListMeta.textContent = msg('noHospitalsFilters');
      finderList.innerHTML = `<p class="finder-empty">${msg('noHospitalVolumes')}</p>`;
      return;
    }

    const searchLower = normalizeString(state.search.trim());
    const filteredBySearch = agg.hospitals.filter((h) => {
      const normalizedDisplay = normalizeString(h.hospital);
      const normalizedOriginal = normalizeString(h.originalName ?? '');
      return normalizedDisplay.includes(searchLower) || normalizedOriginal.includes(searchLower);
    });
    if (!filteredBySearch.length) {
      finderListMeta.textContent = msg('noHospitalsSearch');
      finderList.innerHTML = `<p class="finder-empty">${msg('tryAdjustFilters')}</p>`;
      return;
    }

    const filteredByCanton =
      state.selectedCanton === ALL_CANTONS_OPTION
        ? filteredBySearch
        : filteredBySearch.filter((h) => h.canton === state.selectedCanton);

    if (!filteredByCanton.length) {
      finderListMeta.textContent = msg('cantonNoHospitals', { canton: getCantonLabel(state.selectedCanton) });
      finderList.innerHTML = `<p class="finder-empty">${msg('tryAdjustFilters')}</p>`;
      return;
    }

    const maxCases = filteredByCanton[0]?.cases || 1;

    const totalPages = Math.max(1, Math.ceil(filteredByCanton.length / PAGE_SIZE));
    if (state.listPage >= totalPages) {
      state.listPage = totalPages - 1;
    }
    const startIndex = state.listPage * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, filteredByCanton.length);
    const toDisplay = filteredByCanton.slice(startIndex, endIndex);

    const hasPrevious = state.listPage > 0;
    const hasNext = endIndex < filteredByCanton.length;

    const hospitalsCountKey =
      filteredByCanton.length === 1
        ? 'hospitalsPerformingSingle'
        : 'hospitalsPerformingPlural';
    const hospitalsCountText = msg(hospitalsCountKey, {
      count: filteredByCanton.length.toLocaleString(activeLocale)
    });

    const paginationMarkup = `
      <div class="finder-pagination">
        <button class="finder-page-btn" data-direction="prev" aria-label="${msg('ariaPrevHospitals')}" ${
          hasPrevious ? '' : 'disabled'
        }>
          <span aria-hidden="true">&#8592;</span>
        </button>
        <span>${msg('paginationShowing', {
          start: startIndex + 1,
          end: endIndex,
          total: filteredByCanton.length
        })}</span>
        <button class="finder-page-btn" data-direction="next" aria-label="${msg('ariaNextHospitals')}" ${
          hasNext ? '' : 'disabled'
        }>
          <span aria-hidden="true">&#8594;</span>
        </button>
      </div>
    `;

    finderListMeta.innerHTML = `
      <div class="finder-list-count">${escapeHtml(hospitalsCountText)}</div>
      ${paginationMarkup}
    `;

    finderListMeta.querySelectorAll('.finder-page-btn').forEach((btn) => {
      if (btn.disabled) {
        return;
      }
      btn.addEventListener('click', () => {
        const direction = btn.dataset.direction === 'next' ? 1 : -1;
        state.listPage = Math.min(Math.max(0, state.listPage + direction), totalPages - 1);
        renderTopList(agg);
      });
    });

    finderList.innerHTML = toDisplay
      .map((h, idx) => {
        const share = (h.share * 100).toFixed(1);
        const width = Math.round((h.cases / maxCases) * 100);
        const badgeClass =
          h.type === 'university' ? 'badge-university' : h.type === 'kanton' ? 'badge-kanton' : 'badge-private';
        const badgeLabel = typeBadges[h.type] ?? h.type;
        return `
          <div class="finder-row finder-row--interactive">
            <span class="finder-rank">${startIndex + idx + 1}</span>
            <div class="finder-hospital">
              <div class="finder-hospital-header">
                <strong class="finder-hospital-name">${h.hospital}</strong>
                <span class="finder-badge finder-hospital-type ${badgeClass}">${badgeLabel}</span>
                <span class="finder-badge finder-badge--canton finder-hospital-canton">${h.canton}</span>
              </div>
              <div class="finder-progress" aria-hidden="true">
                <div class="finder-progress-bar" style="width: ${width}%;"></div>
              </div>
            </div>
            <div class="finder-figures">
              <strong>${h.cases.toLocaleString()}</strong>
              <span>${share}%</span>
            </div>
          </div>
        `;
      })
      .join('');

    const rows = finderList.querySelectorAll('.finder-row');
    rows.forEach((row, rowIndex) => {
      const entry = toDisplay[rowIndex];
      if (!entry) {
        return;
      }
      const ariaLabel = detailMessage('openAria', { hospital: entry.hospital });
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      row.setAttribute('aria-label', ariaLabel);
      row.addEventListener('click', () => {
        hospitalDetail.open(entry, { procedure: state.selectedProc });
      });
      row.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          hospitalDetail.open(entry, { procedure: state.selectedProc });
        }
      });
    });
  }

  function renderMap(agg) {
    if (!finderMap) {
      return;
    }

    if (!ensureMapStructure()) {
      finderMap.innerHTML = `<p class="finder-error">${msg('mapUnavailable')}</p>`;
      return;
    }

    const hospitalsWithCoords = agg.hospitals.filter((h) => h.lat != null && h.lon != null);
    if (!hospitalsWithCoords.length) {
      mapState.markersLayer.clearLayers();
      mapState.messageEl.className = 'finder-map-message finder-empty';
      mapState.messageEl.textContent = msg('mapNoData');
      mapState.messageEl.hidden = false;
      return;
    }

    const hospitals =
      state.selectedCanton === ALL_CANTONS_OPTION
        ? hospitalsWithCoords
        : hospitalsWithCoords.filter((h) => h.canton === state.selectedCanton);

    const referenceHospitals = hospitals.length ? hospitals : hospitalsWithCoords;
    const maxCases = referenceHospitals[0]?.cases || 1;

    const targetBounds =
      state.selectedCanton === ALL_CANTONS_OPTION
        ? SWITZERLAND_BOUNDS
        : cantonBounds[state.selectedCanton] ?? SWITZERLAND_BOUNDS;

    const latExtent = Math.max(0, targetBounds.latMax - targetBounds.latMin);
    const lonExtent = Math.max(0, targetBounds.lonMax - targetBounds.lonMin);
    const latPadding = Math.max(0.02, latExtent * 0.05);
    const lonPadding = Math.max(0.02, lonExtent * 0.05);
    const bounds = {
      latMin: Math.max(SWITZERLAND_BOUNDS.latMin, targetBounds.latMin - latPadding),
      latMax: Math.min(SWITZERLAND_BOUNDS.latMax, targetBounds.latMax + latPadding),
      lonMin: Math.max(SWITZERLAND_BOUNDS.lonMin, targetBounds.lonMin - lonPadding),
      lonMax: Math.min(SWITZERLAND_BOUNDS.lonMax, targetBounds.lonMax + lonPadding)
    };

    const leafletBounds = L.latLngBounds(
      [bounds.latMin, bounds.lonMin],
      [bounds.latMax, bounds.lonMax]
    );

    mapState.markersLayer.clearLayers();

    hospitals.forEach((h) => {
      const color = typeColors[h.type] ?? typeColors.private;
      const radius = 6 + (h.cases / maxCases) * 8;
      const marker = L.circleMarker([h.lat, h.lon], {
        radius,
        color: '#ffffff',
        fillColor: color,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
        className: `finder-map-marker finder-map-marker--${h.type}`
      });
      marker.bindTooltip(msg('mapTooltip', { hospital: h.hospital, cases: h.cases.toLocaleString() }), {
        direction: 'top',
        offset: [0, -8]
      });
      marker.addTo(mapState.markersLayer);
    });

    if (!hospitals.length) {
      mapState.messageEl.className = 'finder-map-message finder-empty';
      mapState.messageEl.textContent = msg('mapNoData');
      mapState.messageEl.hidden = false;
    } else {
      mapState.messageEl.hidden = true;
    }

    if (leafletBounds.isValid()) {
      const northEast = leafletBounds.getNorthEast();
      const southWest = leafletBounds.getSouthWest();
      const samePoint =
        Math.abs(northEast.lat - southWest.lat) < 0.0001 &&
        Math.abs(northEast.lng - southWest.lng) < 0.0001;
      if (samePoint) {
        mapState.map.setView([northEast.lat, northEast.lng], 9);
      } else {
        mapState.map.fitBounds(leafletBounds.pad(0.12), { animate: false });
      }
    }

    mapState.map.invalidateSize();
  }

  const updateCantonFlag = (option) => {
    if (!finderCantonFlag || !finderCantonFlagImage) {
      return;
    }

    if (!option || option.value === ALL_CANTONS_OPTION || !option.icon) {
      finderCantonFlag.hidden = true;
      finderCantonFlag.setAttribute('aria-hidden', 'true');
      finderCantonFlagImage.removeAttribute('src');
      finderCantonFlagImage.alt = '';
      return;
    }

    finderCantonFlag.hidden = false;
    finderCantonFlag.removeAttribute('aria-hidden');
    finderCantonFlagImage.src = option.icon;
    const flagLabel = option.label || option.value;
    finderCantonFlagImage.alt = `Flag of canton ${flagLabel}`;
  };

  function renderCantonDetails(agg) {
    const cantonHosp = agg.cantonHosp;
    const hasCantonSelection = state.selectedCanton !== ALL_CANTONS_OPTION;
    const cantonOption = hasCantonSelection ? getCantonOptionByValue(state.selectedCanton) : null;
    const cantonLabel = hasCantonSelection ? getCantonLabel(state.selectedCanton) : '';

    updateCantonFlag(cantonOption);

    if (!hasCantonSelection) {
      finderCantonSummary.textContent = msg('cantonSelectPrompt');
      finderCantonList.innerHTML = '';
      return;
    }

    const totalCanton = cantonHosp.reduce((sum, h) => sum + h.cases, 0);
    const leader = cantonHosp[0];
    let summaryText;

    if (!leader) {
      summaryText = msg('cantonNoHospitals', { canton: cantonLabel });
    } else {
      const cantonShare = totalCanton ? Math.round((leader.cases / totalCanton) * 100) : 0;
      const nationalShare = agg.total ? ((leader.cases / agg.total) * 100).toFixed(1) : '0.0';
      const procedureLabel = `${state.selectedProc.name} (${state.selectedProc.code})`;
      summaryText = msg('cantonSummary', {
        canton: cantonLabel,
        count: cantonHosp.length,
        procedure: procedureLabel,
        leader: leader.hospital,
        cantonShare,
        nationalShare
      });
    }

    finderCantonSummary.textContent = summaryText;

    finderCantonList.innerHTML = cantonHosp
      .map((h) => {
        const badgeClass =
          h.type === 'university' ? 'badge-university' : h.type === 'kanton' ? 'badge-kanton' : 'badge-private';
        const badgeLabel = typeBadges[h.type] ?? h.type;
        return `
          <div class="finder-canton-row">
            <span class="finder-canton-hospital">${h.hospital}</span>
            <span class="finder-canton-type"><span class="finder-badge ${badgeClass}">${badgeLabel}</span></span>
            <span class="finder-canton-cases">${msg('cantonRowCases', { cases: h.cases.toLocaleString() })}</span>
          </div>
        `;
      })
      .join('');
  }

  function renderCantonComparison(agg) {
    if (!finderCantonComparisonCard || !finderCantonComparisonCaption || !finderCantonComparisonChart) {
      return;
    }

    const setEmptyState = (captionMessage) => {
      finderCantonComparisonCard.classList.add('finder-comparison-card--empty');
      const hasCaption = Boolean(captionMessage);
      finderCantonComparisonCaption.textContent = captionMessage ?? '';
      finderCantonComparisonCaption.hidden = !hasCaption;
      finderCantonComparisonChart.innerHTML = '';
    };

    if (state.selectedCanton === ALL_CANTONS_OPTION) {
      setEmptyState('');
      return;
    }

    if (!agg) {
      setEmptyState(msg('loadingData'));
      return;
    }

    const cantonLabel = getCantonLabel(state.selectedCanton);
    const cantonCode =
      typeof state.selectedCanton === 'string'
        ? state.selectedCanton.toUpperCase()
        : '';
    const cantonShortLabel = getCantonShortLabel(state.selectedCanton);
    const cantonMessageValue = cantonCode || cantonLabel;
    const cantonPopulation = REGION_POPULATION[state.selectedCanton];
    const nationalPopulation = REGION_POPULATION.CH;
    const cantonCases = agg.cantonTotals?.totalCases ?? 0;
    const nationalCases = agg.total ?? 0;

    const toRate = (cases, population) => {
      const popValue = Number(population);
      if (!Number.isFinite(popValue) || popValue <= 0) {
        return Number.NaN;
      }
      const casesValue = Number(cases);
      const safeCases = Number.isFinite(casesValue) && casesValue > 0 ? casesValue : 0;
      return (safeCases / popValue) * 100000;
    };

    const cantonRate = toRate(cantonCases, cantonPopulation);
    const nationalRate = toRate(nationalCases, nationalPopulation);

    if (!Number.isFinite(cantonRate) || !Number.isFinite(nationalRate)) {
      const message = msg('cantonComparisonNoData', { canton: cantonLabel });
      setEmptyState(message);
      return;
    }

    finderCantonComparisonCard.classList.remove('finder-comparison-card--empty');
    const comparisonTitle = msg('cantonComparisonTitle');
    finderCantonComparisonCaption.textContent = comparisonTitle ?? '';
    finderCantonComparisonCaption.hidden = !comparisonTitle;

    const formatRate = (value) =>
      Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      });

    const nationalLabel = msg('cantonComparisonLabelNational');
    const cantonChartLabel = msg('cantonComparisonLabelCanton', {
      canton: cantonShortLabel || cantonLabel
    });

    const comparisonLead = msg('cantonComparisonLead', {
      cantonRate: formatRate(cantonRate),
      nationalRate: formatRate(nationalRate),
      canton: cantonMessageValue
    });

    const rows = [
      { key: 'national', label: nationalLabel, value: nationalRate, abbr: 'CH' },
      {
        key: 'canton',
        label: cantonChartLabel,
        value: cantonRate,
        abbr:
          typeof state.selectedCanton === 'string'
            ? state.selectedCanton.toUpperCase()
            : ''
      }
    ];

    const maxValue = rows.reduce((max, row) => (row.value > max ? row.value : max), 0);
    const safeMax = maxValue > 0 ? maxValue : 1;

    const getAxisScale = (value) => {
      if (!Number.isFinite(value) || value <= 0) {
        const fallbackTicks = [0, 0.25, 0.5, 0.75, 1];
        return { axisMax: 1, tickValues: fallbackTicks };
      }

      const desiredTickCount = 6;
      const roughStep = value / (desiredTickCount - 1);
      const magnitude = 10 ** Math.floor(Math.log10(roughStep));
      const residual = roughStep / magnitude;
      let niceResidual;

      if (residual >= 5) {
        niceResidual = 10;
      } else if (residual >= 2) {
        niceResidual = 5;
      } else if (residual >= 1) {
        niceResidual = 2;
      } else {
        niceResidual = 1;
      }

      const niceStep = niceResidual * magnitude;
      const axisMax = Math.ceil(value / niceStep) * niceStep;
      const tickValues = [];
      for (let tick = 0; tick <= axisMax + niceStep / 2; tick += niceStep) {
        tickValues.push(Number(tick.toFixed(10)));
      }

      if (tickValues.length < 2) {
        tickValues.push(axisMax);
      }

      return { axisMax, tickValues };
    };

    const { axisMax, tickValues } = getAxisScale(safeMax * 1.05);

    const tickMarkup = tickValues
      .map((tickValue) => {
        const position = axisMax > 0 ? (tickValue / axisMax) * 100 : 0;
        const safePosition = Math.max(0, Math.min(100, position));
        const safeLabel = escapeHtml(formatRate(tickValue));
        const tickClass = tickValue === 0 ? ' finder-comparison-tick--zero' : '';
        return `
          <div class="finder-comparison-tick${tickClass}" style="--tick-position: ${safePosition}%;">
            <span class="finder-comparison-tick-label">${safeLabel}</span>
            <span class="finder-comparison-tick-line" aria-hidden="true"></span>
          </div>
        `;
      })
      .join('');

    const barsMarkup = rows
      .map((row) => {
        const height = axisMax > 0 ? (row.value / axisMax) * 100 : 0;
        const heightValue = Math.max(0, Math.min(100, height)).toFixed(1);
        const safeAbbr = escapeHtml(row.abbr ?? '');
        return `
          <div class="finder-comparison-bar-column finder-comparison-bar-column--${row.key}">
            <span class="finder-comparison-bar-key" aria-hidden="true">${safeAbbr}</span>
            <div class="finder-comparison-bar-outer">
              <span class="finder-comparison-bar finder-comparison-bar--${row.key}" style="--bar-height: ${heightValue}%;" aria-hidden="true"></span>
            </div>
          </div>
        `;
      })
      .join('');

    const legendMarkup = rows
      .map((row) => {
        const safeLabel = escapeHtml(row.label);
        const safeValue = escapeHtml(formatRate(row.value));
        return `
          <div class="finder-comparison-bar-meta finder-comparison-bar-meta--${row.key}">
            <span class="finder-comparison-bar-label">${safeLabel}</span>
            <span class="finder-comparison-bar-value">${safeValue}</span>
          </div>
        `;
      })
      .join('');

    const axisLabel = escapeHtml(msg('cantonComparisonAxisLabel'));
    const chartMarkup = `
      <div class="finder-comparison-plot">
        <div class="finder-comparison-axis" role="img" aria-label="${escapeHtml(comparisonLead)}">
          <div class="finder-comparison-grid">${tickMarkup}</div>
          <div class="finder-comparison-bars">${barsMarkup}</div>
        </div>
        <div class="finder-comparison-bar-legend">${legendMarkup}</div>
        <div class="finder-comparison-axis-caption">${axisLabel}</div>
      </div>
    `;

    finderCantonComparisonChart.innerHTML = chartMarkup;
  }

  function render() {
    renderProcedureControls();
    renderTypeToggle();

    const selectedProcedure = state.hasUserSelection ? state.selectedProc : null;
    const hasSelection = Boolean(selectedProcedure);

    if (finderRoot) {
      finderRoot.classList.toggle('finder-awaiting-selection', !hasSelection);
    }

    const procedureLabel = selectedProcedure
      ? `${selectedProcedure.name} (${selectedProcedure.code})`
      : msg('selectedProcedure');

    const listLocationLabel =
      state.selectedCanton === ALL_CANTONS_OPTION
        ? msg('topHospitals')
        : msg('topHospitalsIn', { canton: getCantonLabel(state.selectedCanton) });

    if (finderListContext) {
      finderListContext.textContent = listLocationLabel;
    }
    finderListTitle.textContent = procedureLabel;

    if (!hasSelection) {
      finderListMeta.textContent = msg('chooseProcedure');
      finderKpis.innerHTML = `<div class="finder-empty">${msg('selectProcedureNational')}</div>`;
      finderList.innerHTML = '';
      displayMapMessage(msg('selectProcedureMap'));
      finderCantonSummary.textContent = msg('selectProcedureCantonal');
      finderCantonList.innerHTML = '';
      updateCantonFlag(null);
      if (finderCantonComparisonCard && finderCantonComparisonCaption && finderCantonComparisonChart) {
        finderCantonComparisonCard.classList.add('finder-comparison-card--empty');
        finderCantonComparisonCaption.textContent = '';
        finderCantonComparisonCaption.hidden = true;
        finderCantonComparisonChart.innerHTML = '';
      }
      scrollToResultsIfNeeded();
      return;
    }

    if (!finderDataset) {
      finderListMeta.textContent = msg('loadingData');
      finderKpis.innerHTML = `<div class="finder-loading">${msg('loadingData')}</div>`;
      finderList.innerHTML = '';
      displayMapMessage(msg('loadingMap'), 'finder-loading');
      finderCantonSummary.textContent = msg('loadingData');
      finderCantonList.innerHTML = '';
      updateCantonFlag(null);
      if (finderCantonComparisonCard && finderCantonComparisonCaption && finderCantonComparisonChart) {
        finderCantonComparisonCard.classList.add('finder-comparison-card--empty');
        finderCantonComparisonCaption.textContent = msg('loadingData');
        finderCantonComparisonCaption.hidden = false;
        finderCantonComparisonChart.innerHTML = '';
      }
      scrollToResultsIfNeeded();
      return;
    }

    const aggregation = computeAggregation(selectedProcedure.code);
    renderKpis(aggregation);
    renderTopList(aggregation);
    renderMap(aggregation);
    renderCantonDetails(aggregation);
    renderCantonComparison(aggregation);
    scrollToResultsIfNeeded();
  }

    finderProcedureSearch.addEventListener('input', (event) => {
      state.procedureQuery = event.target.value;
      renderProcedureControls();
    });

    finderProcedureSearch.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        state.procedureQuery = '';
        finderProcedureSearch.value = '';
        renderProcedureControls();
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (!state.shouldScrollToProcedures) {
          state.shouldScrollToProcedures = true;
        }
        renderProcedureControls();
      }
    });

    finderSearch.addEventListener('input', (event) => {
      state.search = event.target.value;
      state.listPage = 0;
      render();
    });

    finderCanton.innerHTML = cantonOptions
      .map((option) => `<option value="${option.value}">${option.label}</option>`)
      .join('');
    finderCanton.value = state.selectedCanton;

    ensureCantonDropdown();
    updateCantonDropdownDisplay(state.selectedCanton);

    finderCanton.addEventListener('change', (event) => {
      const value = event.target.value;
      const selectedOption = getCantonOptionByValue(value);
      if (finderCanton.value !== selectedOption.value) {
        finderCanton.value = selectedOption.value;
      }
      state.selectedCanton = selectedOption.value;
      state.listPage = 0;
      updateCantonDropdownDisplay(state.selectedCanton);
      render();
    });

    render();

    loadHospitalDataset()
      .then((data) => {
        finderDataset = data;
        availableTypes = Array.from(data.types);
        availableTypes.sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b));
        ensureTypeFilter();
        render();
      })
      .catch(() => {
        finderListMeta.textContent = msg('failedToLoad');
        finderKpis.innerHTML = `<div class="finder-error">${msg('datasetError')}</div>`;
        finderList.innerHTML = '';
        displayMapMessage(msg('datasetError'), 'finder-error');
        finderCantonSummary.textContent = msg('datasetError');
        updateCantonFlag(null);
        if (finderCantonComparisonCard && finderCantonComparisonCaption && finderCantonComparisonChart) {
          finderCantonComparisonCard.classList.add('finder-comparison-card--empty');
          finderCantonComparisonCaption.textContent = msg('datasetError');
          finderCantonComparisonCaption.hidden = false;
          finderCantonComparisonChart.innerHTML = '';
        }
      });
  }

  const bootstrapFinder = (entries) => {
    const procedureCatalog = buildProcedureCatalog(entries);
    initializeFinderUi(procedureCatalog);
  };

  loadProcedureTranslationDataset()
    .then((entries) => {
      applyProcedureTranslations(entries);
      bootstrapFinder(entries);
    })
    .catch((error) => {
      console.warn('Unable to load procedure descriptions', error);
      bootstrapFinder();
    });
}
