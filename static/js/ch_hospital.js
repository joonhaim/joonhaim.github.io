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

if (procedureSelector && catalogToggle) {
  const setCatalogExpanded = (expanded) => {
    procedureSelector.classList.toggle('catalog-collapsed', !expanded);
    catalogToggle.setAttribute('aria-expanded', String(expanded));
  };

  setCatalogExpanded(!procedureSelector.classList.contains('catalog-collapsed'));

  catalogToggle.addEventListener('click', () => {
    const shouldExpand = procedureSelector.classList.contains('catalog-collapsed');
    setCatalogExpanded(shouldExpand);
  });

  const procedureSearch = document.getElementById('finder-procedure-search');
  if (procedureSearch) {
    const autoExpand = () => setCatalogExpanded(true);
    procedureSearch.addEventListener('focus', autoExpand);
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
  if (!value) {
    return 0;
  }
  const cleaned = value
    .replace(/['\u00A0\s]/g, '')
    .replace(/%$/, '')
    .trim();
  if (!cleaned || cleaned === '*' || cleaned === '-') {
    return 0;
  }
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isFinite(parsed) ? parsed : 0;
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

function parseHospitalCsv(text, coordinatesMap) {
  const lines = text.split(/\r?\n/);
  if (!lines.length) {
    return { byProcedure: new Map(), meta: new Map(), types: new Set() };
  }
  if (lines[0] && lines[0].charCodeAt(0) === 0xfeff) {
    lines[0] = lines[0].slice(1);
  }
  lines.shift();

  const byProcedure = new Map();
  const meta = new Map();

  lines.forEach(line => {
    if (!line.trim()) {
      return;
    }
    const cols = line.split(';');
    if (cols.length < 10) {
      return;
    }
    const institution = cols[0].trim();
    if (!institution || excludedInstitutions.has(institution)) {
      return;
    }
    const indicator = cols[1].trim();
    if (!indicator) {
      return;
    }
    const code = indicator.split(' ', 1)[0].trim();
    if (!code) {
      return;
    }
    const cases = parseInteger(cols[9]);
    if (cases <= 0) {
      return;
    }

    if (!meta.has(institution)) {
      meta.set(institution, inferHospitalMeta(institution, coordinatesMap));
    }

    const entry = { institution, code, cases };
    if (!byProcedure.has(code)) {
      byProcedure.set(code, []);
    }
    byProcedure.get(code).push(entry);
  });

  const types = new Set();
  meta.forEach(details => types.add(details.type));

  return { byProcedure, meta, types };
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
      fetch('static/data/qip23_tabdaten.csv').then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load dataset (${response.status})`);
        }
        return response.text();
      })
    ])
      .then(([coordinateData, csvText]) => {
        const coordinateMap = new Map(Object.entries(coordinateData || {}));
        hospitalDatasetCache.coordinates = coordinateMap;
        const parsed = parseHospitalCsv(csvText, coordinateMap);
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
        hospitalsPerforming: 'Hospitals performing',
        universityShare: 'Share at Univ. hospitals',
        centralization: 'Centralization (HHI)',
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
        tryAdjustFilters: 'Try a different search term or adjust the filters.',
        paginationShowing: 'Showing {start}–{end} of {total} hospitals',
        ariaPrevHospitals: 'Previous page of hospitals',
        ariaNextHospitals: 'Next page of hospitals',
        topHospitals: 'Number of cases by hospital',
        topHospitalsIn: 'Hospitals in canton {canton}',
        cantonSelectPrompt: 'Select a canton to view local hospital details.',
        cantonNoHospitals: 'No hospitals in canton {canton} match the current selection.',
        cantonSummary:
          'In canton {canton}, {count} hospitals reported cases for {procedure}. {leader} accounts for {cantonShare}% of cantonal cases and {nationalShare}% of the national total.',
        cantonRowCases: '{cases} cases',
        mapTitle: 'Hospital map',
        mapAriaLabel: 'Hospital locations by case volume',
        mapNoData: 'No map data available for this selection.',
        mapUnavailable: 'The interactive map could not be loaded.',
        mapTooltip: '{hospital} — {cases} cases',
        quickPicksTitle: 'Popular procedures',
        quickPicksDescription: 'Jump straight to a CH-IQI procedure people look up most often.'
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
        hospitalsPerforming: 'Durchführende Spitäler',
        universityShare: 'Anteil universitäre Spitäler',
        centralization: 'Zentralisierung (HHI)',
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
        tryAdjustFilters: 'Versuchen Sie einen anderen Suchbegriff oder passen Sie die Filter an.',
        paginationShowing: 'Anzeige {start}–{end} von {total} Spitälern',
        ariaPrevHospitals: 'Vorherige Spitalseite',
        ariaNextHospitals: 'Nächste Spitalseite',
        topHospitals: 'Fallzahlen nach Spital',
        topHospitalsIn: 'Spitäler im Kanton {canton}',
        cantonSelectPrompt: 'Wählen Sie einen Kanton, um lokale Spitaldetails zu sehen.',
        cantonNoHospitals: 'Im Kanton {canton} passt kein Spital zur aktuellen Auswahl.',
        cantonSummary:
          'Im Kanton {canton} meldeten {count} Spitäler Fälle für {procedure}. {leader} steht für {cantonShare}% der kantonalen Fälle und {nationalShare}% des schweizweiten Totals.',
        cantonRowCases: '{cases} Fälle',
        mapTitle: 'Spitalkarte',
        mapAriaLabel: 'Spitalstandorte nach Fallzahl',
        mapNoData: 'Für diese Auswahl sind keine Kartendaten vorhanden.',
        mapUnavailable: 'Die interaktive Karte konnte nicht geladen werden.',
        mapTooltip: '{hospital} — {cases} Fälle',
        quickPicksTitle: 'Beliebte Behandlungen',
        quickPicksDescription: 'Springen Sie direkt zu einer häufig nachgefragten CH-IQI-Behandlung.'
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
          university: 'Universitaires',
          kanton: 'Cantonaux / Régionaux',
          private: 'Privés',
          other: 'Autres'
        },
        badges: {
          university: 'Universitaire',
          kanton: 'Cantonal / Régional',
          private: 'Privé',
          other: 'Autre'
        },
        legend: {
          university: 'Universitaires',
          kanton: 'Cantonaux / Régionaux',
          private: 'Privés'
        }
      },
      hhi: {
        labels: { low: 'Faible', moderate: 'Modérée', high: 'Élevée' },
        footnote:
          "L'indice Herfindahl-Hirschman (HHI) additionne les parts de marché au carré des hôpitaux. Les scores vont de 0 (offre dispersée) à 10&nbsp;000 (monopole). &lt;1500 Faible · 1500–2500 Modérée · &gt;2500 Élevée"
      },
      kpi: {
        totalCases: 'Cas totaux (2023)',
        hospitalsPerforming: 'Hôpitaux actifs',
        universityShare: 'Part des hôpitaux universitaires',
        centralization: 'Centralisation (HHI)',
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
        tryAdjustFilters: 'Essayez un autre terme de recherche ou ajustez les filtres.',
        paginationShowing: 'Affichage {start}–{end} sur {total} hôpitaux',
        ariaPrevHospitals: 'Page précédente des hôpitaux',
        ariaNextHospitals: 'Page suivante des hôpitaux',
        topHospitals: 'Nombre de cas par hôpital',
        topHospitalsIn: 'Hôpitaux dans le canton {canton}',
        cantonSelectPrompt: 'Sélectionnez un canton pour voir les détails locaux.',
        cantonNoHospitals: 'Aucun hôpital du canton {canton} ne correspond à cette sélection.',
        cantonSummary:
          'Dans le canton {canton}, {count} hôpitaux ont déclaré des cas pour {procedure}. {leader} représente {cantonShare}% des cas cantonaux et {nationalShare}% du total national.',
        cantonRowCases: '{cases} cas',
        mapTitle: 'Carte des hôpitaux',
        mapAriaLabel: 'Localisation des hôpitaux selon le volume de cas',
        mapNoData: 'Aucune donnée cartographique disponible pour cette sélection.',
        mapUnavailable: 'La carte interactive n’a pas pu être chargée.',
        mapTooltip: '{hospital} — {cases} cas',
        quickPicksTitle: 'Interventions populaires',
        quickPicksDescription: 'Accédez directement à une intervention CH-IQI très consultée.'
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
        hospitalsPerforming: 'Ospedali attivi',
        universityShare: 'Quota ospedali universitari',
        centralization: 'Centralizzazione (HHI)',
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
        tryAdjustFilters: 'Prova un altro termine di ricerca o modifica i filtri.',
        paginationShowing: 'Visualizzazione {start}–{end} di {total} ospedali',
        ariaPrevHospitals: 'Pagina precedente di ospedali',
        ariaNextHospitals: 'Pagina successiva di ospedali',
        topHospitals: 'Numero di casi per ospedale',
        topHospitalsIn: 'Ospedali nel cantone {canton}',
        cantonSelectPrompt: 'Seleziona un cantone per vedere i dettagli locali.',
        cantonNoHospitals: 'Nel cantone {canton} nessun ospedale corrisponde a questa selezione.',
        cantonSummary:
          'Nel cantone {canton}, {count} ospedali hanno riportato casi per {procedure}. {leader} rappresenta il {cantonShare}% dei casi cantonali e il {nationalShare}% del totale nazionale.',
        cantonRowCases: '{cases} casi',
        mapTitle: 'Mappa degli ospedali',
        mapAriaLabel: 'Posizioni degli ospedali in base al volume di casi',
        mapNoData: 'Nessun dato cartografico disponibile per questa selezione.',
        mapUnavailable: 'Impossibile caricare la mappa interattiva.',
        mapTooltip: '{hospital} — {cases} casi',
        quickPicksTitle: 'Interventi più richiesti',
        quickPicksDescription: 'Vai subito a un intervento CH-IQI molto consultato.'
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
  const cantonCodes = [
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

  const cantonOptions = [
    {
      value: ALL_CANTONS_OPTION,
      label: translate('messages.allCantons'),
      icon: cantonIconPath('CH')
    },
    ...cantonCodes.map((code) => ({
      value: code,
      label: code,
      icon: cantonIconPath(code)
    }))
  ];

  const cantonOptionMap = new Map(cantonOptions.map((option) => [option.value, option]));
  const getCantonOptionByValue = (value) =>
    cantonOptionMap.get(value) ?? cantonOptionMap.get(ALL_CANTONS_OPTION);

  const typeLabels = getObjectTranslation('types.labels');
  const typeBadges = getObjectTranslation('types.badges');
  const typeLegend = getObjectTranslation('types.legend');
  const hhiLabels = getObjectTranslation('hhi.labels');
  const hhiFootnote = translate('hhi.footnote');
  const kpiLabels = {
    totalCases: translate('kpi.totalCases'),
    hospitalsPerforming: translate('kpi.hospitalsPerforming'),
    universityShare: translate('kpi.universityShare'),
    centralization: translate('kpi.centralization')
  };
  const quickPickLabels = getObjectTranslation('quickPickLabels');
  const msg = (key, replacements) => translate(`messages.${key}`, replacements);

  const PAGE_SIZE = 7;
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
    const finderQuickPicks = document.getElementById('finder-quick-picks');
    const finderQuickTitle = document.getElementById('finder-quick-title');
    const finderQuickList = document.getElementById('finder-quick-list');
    const finderQuickDescription = document.getElementById('finder-quick-description');

    const quickPickButtons = new Map();

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
      const activeCode = state.selectedProc?.code;
      quickPickButtons.forEach((button, code) => {
        const isActive = code === activeCode;
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

        const top = anchor.getBoundingClientRect().top + window.scrollY - 24;
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
          optionEl.scrollIntoView({ block: 'nearest' });
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
            <span data-type="university"><i style="background:#059669"></i><span class="legend-label"></span></span>
            <span data-type="kanton"><i style="background:#0ea5e9"></i><span class="legend-label"></span></span>
            <span data-type="private"><i style="background:#f59e0b"></i><span class="legend-label"></span></span>
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

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
      shouldScrollToResults: false
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
          const isActive = category.id === state.selectedCategory;
          const dimmed = isSearching && !category.hasMatch && !isActive;
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
        finderProcedureList.innerHTML = `<p class="finder-procedure-empty">${msg('noProceduresMatch')}</p>`;
        return;
      }

      finderProcedureList.innerHTML = groupsToRender
        .map((group) => {
          const showHeading = isSearching || groupsToRender.length > 1;
          const heading = showHeading ? `<p class="finder-procedure-group-title">${group.label}</p>` : '';
          const options = group.procedures
            .map((proc) => {
              const isActive = state.selectedProc?.code === proc.code;
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
          state.shouldScrollToResults = true;
          render();
        });
      });

      updateQuickPickState();
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
          : null
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
          lon: meta.lon
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
          : null
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
          : null
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

    return {
      total,
      hospitals: hospitalsWithShare,
      hospitalCount: hospitalsWithShare.length,
      uniShare: overallUniShare,
      hhi,
      hhiLabel: labelFromHHI(hhi),
      cantonHosp,
      cantonTotals
    };
  }

  function renderKpis(agg) {
    let switzerlandLabel = translate('kpi.switzerland');
    if (typeof switzerlandLabel !== 'string' || switzerlandLabel === 'kpi.switzerland') {
      switzerlandLabel = 'Switzerland';
    }

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

    const createValueMarkup = (label, value, options = {}) => {
      const { isSecondary = false, allowHtmlValue = false } = options;
      const safeLabel = escapeAttribute(label);
      const safeValue = allowHtmlValue ? value : escapeAttribute(value);
      return `
        <div class="finder-kpi-value${isSecondary ? ' finder-kpi-value--secondary' : ''}">
          <span class="finder-kpi-value-label">${safeLabel}</span>
          <span class="finder-kpi-value-number">${safeValue}</span>
        </div>
      `;
    };

    const createValuesBlock = (primaryValue, secondaryValue) => {
      const rows = [createValueMarkup(switzerlandLabel, primaryValue)];
      if (hasCantonSelection && secondaryValue != null) {
        rows.push(createValueMarkup(state.selectedCanton, secondaryValue, { isSecondary: true }));
      }
      return `<div class="finder-kpi-values">${rows.join('')}</div>`;
    };

    const tiles = [
      {
        label: kpiLabels.totalCases,
        type: 'dual',
        primary: formatCount(agg.total),
        secondary: cantonTotals ? formatCount(cantonTotals.totalCases) : null,
        footnote: ''
      },
      {
        label: kpiLabels.hospitalsPerforming,
        type: 'dual',
        primary: formatCount(agg.hospitalCount ?? agg.hospitals.length),
        secondary: cantonTotals ? formatCount(cantonTotals.hospitalCount) : null,
        footnote: ''
      },
      {
        label: kpiLabels.centralization,
        type: 'single',
        value: `${escapeHtml(String(agg.hhi))} – <span class="finder-kpi-hhi-label">${escapeHtml(agg.hhiLabel)}</span>`,
        footnote: '',
        info: hhiFootnote,
        allowHtmlValue: true
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
            ? createValuesBlock(tile.primary, tile.secondary)
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
  }

  function renderTopList(agg) {
    const procedureLabel = state.selectedProc
      ? `${state.selectedProc.name} (${state.selectedProc.code})`
      : msg('selectedProcedure');
    const listLocationLabel =
      state.selectedCanton === ALL_CANTONS_OPTION
        ? msg('topHospitals')
        : msg('topHospitalsIn', { canton: state.selectedCanton });
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
      finderListMeta.textContent = msg('cantonNoHospitals', { canton: state.selectedCanton });
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

    finderListMeta.innerHTML = `
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
          <div class="finder-row">
            <span class="finder-rank">${startIndex + idx + 1}</span>
            <div class="finder-hospital">
              <div class="finder-hospital-header">
                <strong>${h.hospital}</strong>
                <span class="finder-badge ${badgeClass}">${badgeLabel}</span>
                <span class="finder-badge" style="background: none; border: none; color: #6b7280;">${h.canton}</span>
              </div>
              <div class="finder-progress"><div class="finder-progress-bar" style="width: ${width}%;"></div></div>
            </div>
            <div class="finder-figures">
              <strong>${h.cases.toLocaleString()}</strong>
              <span>${share}%</span>
            </div>
          </div>
        `;
      })
      .join('');
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
      const color = h.type === 'university' ? '#059669' : h.type === 'kanton' ? '#0ea5e9' : '#f59e0b';
      const radius = 6 + (h.cases / maxCases) * 9;
      const marker = L.circleMarker([h.lat, h.lon], {
        radius,
        color,
        fillColor: color,
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.9
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

  function renderCantonDetails(agg) {
    const cantonHosp = agg.cantonHosp;

    if (state.selectedCanton === ALL_CANTONS_OPTION) {
      finderCantonSummary.textContent = msg('cantonSelectPrompt');
      finderCantonList.innerHTML = '';
      return;
    }

    const totalCanton = cantonHosp.reduce((sum, h) => sum + h.cases, 0);
    const leader = cantonHosp[0];
    let summaryText;

    if (!leader) {
      summaryText = msg('cantonNoHospitals', { canton: state.selectedCanton });
    } else {
      const cantonShare = totalCanton ? Math.round((leader.cases / totalCanton) * 100) : 0;
      const nationalShare = agg.total ? ((leader.cases / agg.total) * 100).toFixed(1) : '0.0';
      const procedureLabel = `${state.selectedProc.name} (${state.selectedProc.code})`;
      summaryText = msg('cantonSummary', {
        canton: state.selectedCanton,
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
            <span><strong>${h.hospital}</strong> <span class="finder-badge ${badgeClass}">${badgeLabel}</span></span>
            <span>${msg('cantonRowCases', { cases: h.cases.toLocaleString() })}</span>
          </div>
        `;
      })
      .join('');
  }

  function render() {
    renderProcedureControls();
    renderTypeToggle();

    const selectedProcedure = state.selectedProc;
    const procedureLabel = selectedProcedure
      ? `${selectedProcedure.name} (${selectedProcedure.code})`
      : msg('selectedProcedure');

    const listLocationLabel =
      state.selectedCanton === ALL_CANTONS_OPTION
        ? msg('topHospitals')
        : msg('topHospitalsIn', { canton: state.selectedCanton });

    if (finderListContext) {
      finderListContext.textContent = listLocationLabel;
    }
    finderListTitle.textContent = procedureLabel;

    if (!selectedProcedure) {
      finderListMeta.textContent = msg('chooseProcedure');
      finderKpis.innerHTML = `<div class="finder-empty">${msg('selectProcedureNational')}</div>`;
      finderList.innerHTML = '';
      displayMapMessage(msg('selectProcedureMap'));
      finderCantonSummary.textContent = msg('selectProcedureCantonal');
      finderCantonList.innerHTML = '';
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
      scrollToResultsIfNeeded();
      return;
    }

    const aggregation = computeAggregation(selectedProcedure.code);
    renderKpis(aggregation);
    renderTopList(aggregation);
    renderMap(aggregation);
    renderCantonDetails(aggregation);
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
