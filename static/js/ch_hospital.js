const lang = document.documentElement.lang || 'en';

const hospitals = {
  en: ['CHUV (Lausanne)', 'HUG (Geneva)', 'Inselspital (Bern)', 'USB (Basel)', 'USZ (Zurich)'],
  de: ['CHUV (Lausanne)', 'HUG (Genf)', 'Inselspital (Bern)', 'USB (Basel)', 'USZ (Zürich)'],
  fr: ['CHUV (Lausanne)', 'HUG (Genève)', 'Inselspital (Berne)', 'USB (Bâle)', 'USZ (Zurich)'],
  it: ['CHUV (Losanna)', 'HUG (Ginevra)', 'Inselspital (Berna)', 'USB (Basilea)', 'USZ (Zurigo)']
};

const cases = {
  'A.3.1.F': [1299, 1188, 3057, 1960, 2099],
  'A.4.1.F': [703, 615, 1974, 1539, 764],
  'A.5.1.F': [265, 264, 714, 540, 486],
  'B.2.3.F': [751, 958, 1907, 1206, 909],
  'B.4.1.F': [301, 296, 379, 526, 235],
  'D.3.1.F': [460, 377, 298, 509, 417],
  'E.4.11.F': [228, 295, 162, 158, 220],
  'G.4.1.F': [341, 349, 278, 339, 199],
  'L.5.1.F': [61, 46, 78, 71, 109],
  'Z.4.37.F': [308, 531, 133, 284, 67]
};

const procedureLabels = {
  'A.3.1.F': {
    en: 'Coronary catheterization (age >19)',
    de: 'Koronarangiographie (Alter >19)',
    fr: 'Cathétérisme coronarien (âge >19)',
    it: 'Cateterismo coronarico (età >19)'
  },
  'A.4.1.F': {
    en: 'Cardiac rhythm disorders (hospitalizations)',
    de: 'Herzrhythmusstörungen (Hospitalisationen)',
    fr: 'Troubles du rythme cardiaque (hospitalisations)',
    it: 'Disturbi del ritmo cardiaco (ricoveri)'
  },
  'A.5.1.F': {
    en: 'Pacemaker/ICD implantation or replacement',
    de: 'Implantation/Wechsel von Schrittmacher/ICD',
    fr: 'Implantation/remplacement de pacemaker/DIC',
    it: 'Impianto/sostituzione di pacemaker/ICD'
  },
  'B.2.3.F': {
    en: 'Stroke unit – complex treatment',
    de: 'Schlaganfallstation – komplexe Behandlung',
    fr: 'Unité AVC – traitement complexe',
    it: 'Unità ictus – trattamento complesso'
  },
  'B.4.1.F': {
    en: 'Epilepsy (inpatient, age >19)',
    de: 'Epilepsie (stationär, Alter >19)',
    fr: 'Épilepsie (hospitalisations, âge >19)',
    it: 'Epilessia (ricoveri, età >19)'
  },
  'D.3.1.F': {
    en: 'Lung cancer (inpatient treatments)',
    de: 'Lungenkrebs (stationäre Behandlungen)',
    fr: 'Cancer du poumon (traitements stationnaires)',
    it: 'Cancro ai polmoni (trattamenti ospedalieri)'
  },
  'E.4.11.F': {
    en: 'Colorectal cancer (inpatient treatments)',
    de: 'Kolorektales Karzinom (stationäre Behandlungen)',
    fr: 'Cancer colorectal (traitements stationnaires)',
    it: 'Cancro colorettale (trattamenti ospedalieri)'
  },
  'G.4.1.F': {
    en: 'Breast cancer (inpatient treatments)',
    de: 'Brustkrebs (stationäre Behandlungen)',
    fr: 'Cancer du sein (traitements stationnaires)',
    it: 'Cancro al seno (trattamenti ospedalieri)'
  },
  'L.5.1.F': {
    en: 'Kidney transplant',
    de: 'Nierentransplantation',
    fr: 'Transplantation rénale',
    it: 'Trapianto di rene'
  },
  'Z.4.37.F': {
    en: 'Primary hip prosthesis',
    de: 'Erstprothese Hüfte',
    fr: 'Prothèse totale de hanche',
    it: "Protesi d'anca primaria"
  }
};

const yAxisLabel = {
  en: 'Number of cases',
  de: 'Anzahl Fälle',
  fr: 'Nombre de cas',
  it: 'Numero di casi'
};

const ctx = document.getElementById('casesChart').getContext('2d');
let casesChart;

const palette = [
  ['rgba(218, 41, 28, 0.7)', 'rgba(218, 41, 28, 1)'],
  ['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 1)'],
  ['rgba(128, 128, 128, 0.7)', 'rgba(128, 128, 128, 1)'],
  ['rgba(69, 123, 157, 0.7)', 'rgba(69, 123, 157, 1)'],
  ['rgba(42, 157, 143, 0.7)', 'rgba(42, 157, 143, 1)'],
  ['rgba(233, 196, 106, 0.7)', 'rgba(233, 196, 106, 1)'],
  ['rgba(141, 59, 114, 0.7)', 'rgba(141, 59, 114, 1)'],
  ['rgba(90, 90, 90, 0.7)', 'rgba(90, 90, 90, 1)'],
  ['rgba(200, 200, 200, 0.7)', 'rgba(200, 200, 200, 1)'],
  ['rgba(120, 0, 0, 0.7)', 'rgba(120, 0, 0, 1)']
];

function updateChart(codes) {
  const hospitalLabels = hospitals[lang];
  const descriptionEl = document.getElementById('procedure-description');

  const datasets = codes.map((code, idx) => ({
    label: procedureLabels[code][lang],
    data: cases[code],
    backgroundColor: palette[idx % palette.length][0],
    borderColor: palette[idx % palette.length][1],
    borderWidth: 1
  }));

  descriptionEl.innerHTML = codes
    .map(code => `${code} – ${procedureLabels[code][lang]}`)
    .join('<br>');

  if (!casesChart) {
    casesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: hospitalLabels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 800,
          easing: 'easeInOutQuart'
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: yAxisLabel[lang]
            }
          }
        }
      }
    });
  } else {
    casesChart.data.datasets = datasets;
    casesChart.update();
  }
}

const buttons = document.querySelectorAll('.procedure-btn');
const selectedCodes = new Set(
  Array.from(document.querySelectorAll('.procedure-btn.active')).map(b => b.dataset.code)
);

buttons.forEach(btn => {
  const toggle = () => {
    const code = btn.dataset.code;
    if (selectedCodes.has(code)) {
      selectedCodes.delete(code);
      btn.classList.remove('active');
      btn.classList.add('no-hover');
    } else {
      selectedCodes.add(code);
      btn.classList.add('active');
      btn.classList.remove('no-hover');
    }
    updateChart(Array.from(selectedCodes));
  };

  btn.addEventListener('click', toggle);
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
  btn.addEventListener('mouseleave', () => btn.classList.remove('no-hover'));
});

const fadeObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
});

document.querySelectorAll('.fade-element').forEach(el => fadeObserver.observe(el));

updateChart(Array.from(selectedCodes));

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

const hospitalMetadataOverrides = {
  "AMEOS Spital Einsiedeln AG": { type: "kanton", canton: "SZ" },
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
  "Hôpital Jules Daler": { type: "kanton", canton: "FR" },
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
  "Réseau de l'Arc SA": { type: "kanton", canton: "JU" },
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
  "Stiftung Spital Muri": { type: "kanton", canton: "AG" },
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
  data: null
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

function inferHospitalMeta(name) {
  const override = hospitalMetadataOverrides[name];
  if (!override) {
    console.warn(`Missing metadata for ${name}`);
  }
  const type = override?.type ?? 'kanton';
  const canton = override?.canton ?? '??';
  const centroid = cantonCentroids[canton];
  return {
    type,
    canton,
    lat: centroid?.lat ?? null,
    lon: centroid?.lon ?? null
  };
}

function parseHospitalCsv(text) {
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
      meta.set(institution, inferHospitalMeta(institution));
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
    hospitalDatasetCache.promise = fetch('static/data/qip23_tabdaten.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load dataset (${response.status})`);
        }
        return response.text();
      })
      .then(text => {
        const parsed = parseHospitalCsv(text);
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
  const procedures = [
    { code: 'A.3.1.F', name: 'Coronary catheterization' },
    { code: 'A.5.1.F', name: 'Pacemaker/ICD implantation' },
    { code: 'B.2.3.F', name: 'Stroke unit – complex treatment' },
    { code: 'L.5.1.F', name: 'Kidney transplant' },
    { code: 'Z.4.37.F', name: 'Primary hip prosthesis' }
  ];

  const cantonOptions = ['ZH', 'BE', 'VD', 'GE', 'BS', 'SG', 'AG', 'FR', 'VS', 'LU', 'GR'];

  const state = {
    selectedProc: procedures[0],
    selectedCanton: 'BE',
    search: '',
    typeFilter: { university: true, kanton: true, private: true }
  };

  const typeLabels = {
    university: 'University',
    kanton: 'Cantonal',
    private: 'Private',
    other: 'Other'
  };
  const typeOrder = ['university', 'kanton', 'private', 'other'];

  const finderChips = document.getElementById('finder-procedure-chips');
  const finderTypeToggle = document.getElementById('finder-type-toggle');
  const finderSearch = document.getElementById('finder-search');
  const finderCanton = document.getElementById('finder-canton');
  const finderKpis = document.getElementById('finder-kpis');
  const finderList = document.getElementById('finder-list');
  const finderListTitle = document.getElementById('finder-list-title');
  const finderListMeta = document.getElementById('finder-list-meta');
  const finderMap = document.getElementById('finder-map');
  const finderCantonSummary = document.getElementById('finder-canton-summary');
  const finderCantonList = document.getElementById('finder-canton-list');

  const labelFromHHI = (hhi) => (hhi < 1500 ? 'Low' : hhi <= 2500 ? 'Moderate' : 'High');

  let finderDataset = null;
  let availableTypes = [];

  function ensureTypeFilter() {
    availableTypes.forEach((type) => {
      if (state.typeFilter[type] === undefined) {
        state.typeFilter[type] = true;
      }
    });
  }

  function renderChips() {
    finderChips.innerHTML = procedures
      .map(
        (procedure) => `
          <button class="finder-chip${
            procedure.code === state.selectedProc.code ? ' active' : ''
          }" data-code="${procedure.code}">${procedure.name}</button>
        `
      )
      .join('');

    finderChips.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const newProc = procedures.find((p) => p.code === btn.dataset.code);
        if (newProc && newProc.code !== state.selectedProc.code) {
          state.selectedProc = newProc;
          render();
        }
      });
    });
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
        render();
      });
    });
  }

  function computeAggregation(procCode) {
    if (!finderDataset) {
      return {
        total: 0,
        hospitals: [],
        uniShare: 0,
        hhi: 0,
        hhiLabel: labelFromHHI(0),
        cantonHosp: []
      };
    }

    const entries = finderDataset.byProcedure.get(procCode) || [];
    const enriched = entries
      .map((entry) => {
        const meta = finderDataset.meta.get(entry.institution) || inferHospitalMeta(entry.institution);
        return {
          hospital: entry.institution,
          cases: entry.cases,
          type: meta.type,
          canton: meta.canton,
          lat: meta.lat,
          lon: meta.lon
        };
      })
      .filter((h) => state.typeFilter[h.type] !== false);

    const total = enriched.reduce((sum, h) => sum + h.cases, 0);

    if (!total) {
      return {
        total: 0,
        hospitals: [],
        uniShare: 0,
        hhi: 0,
        hhiLabel: labelFromHHI(0),
        cantonHosp: []
      };
    }

    const hospitalsWithShare = enriched
      .map((h) => ({ ...h, share: h.cases / total }))
      .sort((a, b) => b.cases - a.cases);

    const uniCases = hospitalsWithShare
      .filter((h) => h.type === 'university')
      .reduce((sum, h) => sum + h.cases, 0);

    const cantonHosp = hospitalsWithShare.filter((h) => h.canton === state.selectedCanton);

    const hhi = Math.round(
      hospitalsWithShare.reduce((sum, h) => sum + (h.share * 100) ** 2, 0)
    );

    return {
      total,
      hospitals: hospitalsWithShare,
      uniShare: uniCases / total,
      hhi,
      hhiLabel: labelFromHHI(hhi),
      cantonHosp
    };
  }

  function renderKpis(agg) {
    if (!agg.total) {
      finderKpis.innerHTML = `
        <div class="finder-kpi"><small>Total cases (CH)</small><strong>0</strong></div>
        <div class="finder-kpi"><small>Hospitals performing</small><strong>0</strong></div>
        <div class="finder-kpi"><small>Share at Univ. hospitals</small><strong>0%</strong></div>
        <div class="finder-kpi">
          <small>Centralization (HHI)</small>
          <strong>0 – ${labelFromHHI(0)}</strong>
          <span>&lt;1500 Low · 1500–2500 Moderate · &gt;2500 High</span>
        </div>
      `;
      return;
    }

    const tiles = [
      { label: 'Total cases (CH)', value: agg.total.toLocaleString(), footnote: '' },
      { label: 'Hospitals performing', value: agg.hospitals.length, footnote: '' },
      {
        label: 'Share at Univ. hospitals',
        value: `${Math.round(agg.uniShare * 100)}%`,
        footnote: ''
      },
      {
        label: 'Centralization (HHI)',
        value: `${agg.hhi} – ${agg.hhiLabel}`,
        footnote: '<1500 Low · 1500–2500 Moderate · >2500 High'
      }
    ];

    finderKpis.innerHTML = tiles
      .map(
        (tile) => `
          <div class="finder-kpi">
            <small>${tile.label}</small>
            <strong>${tile.value}</strong>
            ${tile.footnote ? `<span>${tile.footnote}</span>` : ''}
          </div>
        `
      )
      .join('');
  }

  function renderTopList(agg) {
    finderListTitle.textContent = `Top hospitals — ${state.selectedProc.name}`;

    if (!agg.hospitals.length) {
      finderListMeta.textContent = 'No hospitals match the current filters.';
      finderList.innerHTML = '<p class="finder-empty">No hospital volumes available for this selection.</p>';
      return;
    }

    const maxCases = agg.hospitals[0]?.cases || 1;
    const searchLower = state.search.trim().toLowerCase();
    const filteredBySearch = agg.hospitals.filter((h) =>
      h.hospital.toLowerCase().includes(searchLower)
    );
    const toDisplay = filteredBySearch.slice(0, 12);

    finderListMeta.textContent = `Showing ${toDisplay.length} of ${filteredBySearch.length}`;

    finderList.innerHTML = toDisplay
      .map((h, idx) => {
        const share = (h.share * 100).toFixed(1);
        const width = Math.round((h.cases / maxCases) * 100);
        const badgeClass =
          h.type === 'university' ? 'badge-university' : h.type === 'kanton' ? 'badge-kanton' : 'badge-private';
        return `
          <div class="finder-row">
            <span class="finder-rank">${idx + 1}</span>
            <div class="finder-hospital">
              <div class="finder-hospital-header">
                <strong>${h.hospital}</strong>
                <span class="finder-badge ${badgeClass}">${h.type.toUpperCase()}</span>
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
    const hospitals = agg.hospitals.filter((h) => h.lat != null && h.lon != null);

    if (!hospitals.length) {
      finderMap.innerHTML = '<h3>Map preview</h3><p class="finder-empty">No map data available for this selection.</p>';
      return;
    }

    const maxCases = hospitals[0]?.cases || 1;
    const latMin = 45.7;
    const latMax = 47.9;
    const lonMin = 5.7;
    const lonMax = 10.6;

    const circles = hospitals
      .map((h) => {
        const x = ((h.lon - lonMin) / (lonMax - lonMin)) * 1000;
        const y = (1 - (h.lat - latMin) / (latMax - latMin)) * 600;
        const radius = 4 + (h.cases / maxCases) * 10;
        const color =
          h.type === 'university' ? '#059669' : h.type === 'kanton' ? '#0ea5e9' : '#f59e0b';
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(
          1
        )}" fill="${color}" opacity="0.9">
          <title>${h.hospital} — ${h.cases} cases</title>
        </circle>`;
      })
      .join('');

    finderMap.innerHTML = `
      <h3>Map preview</h3>
      <svg viewBox="0 0 1000 600" role="img" aria-label="Hospital locations by volume">
        <rect x="0" y="0" width="1000" height="600" fill="#f8fafc"></rect>
        <path d="M1000.00,600.00 M88.37,246.10 M89.86,244.30 M89.58,254.84 M84.45,255.10 M84.71,248.46 M78.74,245.55 M84.05,245.76 M84.12,248.11 M84.23,248.67 M84.04,248.02 M82.48,249.42 M83.76,247.76 M84.12,248.77 M84.56,247.76 M83.82,248.82 M84.41,247.98 M0.00,0.00 M85.87,248.11 M87.85,245.17 M87.93,248.31 M88.54,246.99 M85.89,248.82 M85.95,250.90 M85.33,248.82 M88.95,247.45 M87.34,248.62 M87.01,249.28 M87.23,250.19 M84.96,249.89 M83.67,252.97 M85.76,251.04 M86.17,249.89 M87.85,249.78 M88.41,252.82 M87.12,250.09 M86.54,248.97 M94.92,248.87 M93.27,250.50 M85.51,248.01 M85.33,246.19 M85.87,247.04 M86.43,247.19 M86.09,248.21 M92.40,252.52 M84.71,248.46 M84.08,253.23 M83.86,250.45 M84.96,252.97 M82.51,248.97 M82.51,252.11 M85.11,249.73 M83.54,249.48 M82.44,249.38 M84.96,250.13 M83.61,249.77 M81.82,246.95 M83.61,249.58 M84.38,252.31 M83.61,251.40 M81.88,249.84 M81.56,248.51 M84.75,249.68 M83.67,249.48 M84.27,250.38 M84.81,249.12 M86.02,249.02 M83.46,249.48 M85.99,250.79 M84.71,251.91 M85.40,251.04 M88.18,248.26 M84.96,248.87 M84.53,251.20 M85.36,250.38 M83.35,249.07 M83.35,248.51 M84.12,250.23 M85.80,249.07 M84.92,249.68 M85.95,249.63 M84.90,249.33 M85.61,249.02 M85.37,248.11 M85.03,248.72 M84.92,249.67 M86.58,248.67 M85.95,250.69 M83.57,249.33 M83.80,248.62 M84.19,250.08 M85.07,250.94 M85.36,248.82 M84.75,249.62 M85.11,248.92 M84.56,249.12 M83.78,249.77 M81.73,248.51 M84.85,249.53 M85.95,249.28 M87.96,248.97 M85.51,253.32 M83.50,249.82 M83.86,247.90 M84.27,249.02 M85.29,249.02 M83.39,250.89 M85.44,249.87 M84.42,250.23 M82.66,249.62 M84.34,249.38 M86.09,248.41 M85.95,250.18 M85.25,250.13 M88.30,250.13 M85.59,254.93 M85.22,249.42 M85.74,249.02 M84.75,250.08 M87.27,249.02 M84.75,249.57 M84.05,249.87 M85.22,250.08 M84.79,251.20 M85.29,249.33 M83.86,249.67 M83.71,251.54 M85.91,251.03 M85.65,248.92 M85.48,249.62 M86.28,249.07 M84.71,250.03 M83.28,251.39 M85.11,249.47 M85.33,248.57 M85.22,249.12 M89.72,247.31 M86.58,249.23 M85.44,247.66 M86.21,248.21 M85.22,247.70 M87.20,247.56 M85.18,247.05 M86.17,248.51 M82.62,252.05 M84.49,250.28 M83.43,250.03 M83.05,249.47 M84.81,249.42 M82.91,248.87 M83.17,250.48 M84.66,249.82 M83.43,249.07 M85.44,249.87 M84.15,250.33 M81.63,250.23 M83.09,250.33 M80.27,249.57 M84.53,248.97 M82.55,249.67 M83.24,247.26 M83.80,248.36 M83.82,248.87 M85.95,250.64 M85.55,252.20 M87.45,251.08 M84.79,249.92 M83.97,250.67 M86.25,251.23 M83.97,251.08 M87.05,251.18 M84.71,248.46 M85.51,250.03 M83.05,251.33 M84.56,250.33 M81.26,251.98 M83.90,250.67 M85.44,251.88 M86.28,250.72 M84.45,251.44 M85.25,251.86 M85.95,251.44 M84.56,249.57 M83.24,250.72 M84.42,249.72 M85.25,252.99 M85.03,249.02 M86.75,248.92 M85.74,249.16 M86.21,253.34 M84.71,251.33 M83.50,250.93 M85.63,251.08 M84.85,250.37 M83.67,250.62 M84.71,248.46 M82.59,249.82 M83.57,248.16 M82.66,248.67 M84.16,247.87 M83.78,248.87 M83.76,247.82 M77.68,246.66 M81.08,247.10 M84.34,245.10 M83.78,248.06 M84.64,246.95 M81.23,244.45 M84.79,247.61 M83.86,247.82 M85.03,248.01 M83.43,246.35 M83.65,247.97 M83.93,246.56 M84.45,242.94 M81.82,243.89 M84.71,246.34 M83.82,246.46 M84.92,247.21 M83.86,245.85 M84.19,247.82 M82.91,248.16 M84.45,248.02 M85.29,245.59 M83.32,246.80 M83.65,242.82 M85.22,246.90 M83.50,245.54 M82.10,244.84 M84.19,248.92 M83.65,247.71 M83.09,245.44 M84.64,246.80 M84.08,247.05 M86.58,245.24 M82.77,247.85 M82.58,245.85 M81.49,246.85 M84.41,247.96 M82.07,249.18 M84.30,247.21 M81.45,248.72 M84.04,246.44 M81.45,248.72 M84.01,250.88 M83.17,248.67 M84.71,249.12 M83.82,249.23 M84.85,249.47 M84.27,248.72 M84.71,249.02 M85.03,249.62 M82.40,248.51 M82.40,247.75 M84.08,248.67 M81.73,259.08 M80.16,251.23 M83.67,250.62 M85.07,250.48 M84.27,249.72 M84.23,248.36 M84.71,251.59 M85.33,248.72 M84.52,250.38 M80.65,248.06 M84.64,249.21 M81.99,249.87 M82.87,248.31 M83.39,248.97 M83.50,245.64 M83.82,247.66 M83.82,248.97 M83.97,247.82 M84.16,248.67 M82.62,246.70 M84.77,245.90 M83.09,248.11 M84.77,247.61 M89.02,247.75 M85.59,247.90 M86.02,249.42 M85.37,248.31 M83.80,242.28 M81.71,249.87 M74.23,250.03 M82.91,249.07 M84.60,249.31 M82.91,249.52 M82.25,247.41 M80.89,248.01 M83.57,246.15 M84.75,246.65 M82.29,244.89 M81.08,246.95 M80.76,250.03 M84.16,249.72 M83.57,248.72 M84.27,249.47 M81.78,248.46 M83.61,247.66 M82.98,248.92 M84.96,250.13 M86.86,251.08 M83.90,248.97 M81.30,249.57 M83.97,248.11 M77.46,249.67 M84.12,249.21 M79.98,246.65 M84.96,240.87 M80.57,243.03 M84.27,246.00 M81.45,245.24 M81.15,251.33 M80.24,249.18 M84.01,247.61 M78.89,248.01 M82.81,249.62 M85.07,251.44 M88.37,256.16 M74.49,257.33 M80.27,247.41 M80.72,245.24 M79.84,249.07 M77.01,250.33 M80.76,249.72 M80.93,250.33 M81.49,248.01 M83.09,247.61 M83.35,248.51 M84.23,247.66 M82.91,247.46 M84.71,248.46 M83.24,242.67 M84.08,247.96 M85.25,247.71 M85.18,246.35 M84.08,243.88 M84.71,248.46 M84.71,248.46 M84.71,248.46 M86.69,247.85 M87.96,245.29 M85.63,246.80 M85.11,245.85 M87.64,243.78 M88.00,240.80 M87.34,247.26 M85.76,247.46 M86.86,248.06 M87.68,249.02 M85.74,248.31 M85.44,246.44 M86.86,246.39 M84.71,244.23 M87.16,244.28 M86.17,246.80 M84.60,246.70 M89.36,252.95 M94.92,249.28 M85.03,249.62 M84.08,254.02 M85.74,249.47 M93.52,245.95 M85.40,247.21 M87.20,246.85 M85.40,248.16 M85.14,248.82 M85.59,247.75 M85.80,246.55 M86.54,248.16 M88.15,246.70 M85.22,247.26 M83.80,246.44 M84.66,247.31 M87.42,246.29 M85.18,245.95 M83.97,247.36 M86.79,246.60 M86.06,246.60 M85.98,248.06 M85.51,246.65 M85.03,248.46 M85.18,246.04 M84.45,247.21 M85.76,245.34 M84.60,246.65 M83.35,243.42 M82.47,248.36 M84.60,249.33 M82.40,247.46 M84.96,244.12 M82.70,246.04 M80.05,248.01 M83.05,247.80 M84.08,247.21 M82.77,248.21 M83.50,248.77 M81.73,245.68 M80.76,246.75 M84.71,248.46 M84.71,248.46 M84.71,248.46 M92.03,245.48 M85.14,248.51 M84.96,251.25 M85.26,248.46 M85.37,244.98 M83.82,247.55 M85.18,247.85 M83.65,245.68 M84.90,246.09 M83.35,245.43 M82.87,246.80 M85.14,247.50 M84.23,246.24 M81.99,246.39 M82.36,250.33 M84.41,250.18 M83.06,248.46 M84.71,248.46 M84.71,248.46 M84.71,248.46 M85.33,246.75 M83.71,248.11 M83.02,247.00 M83.97,248.01 M81.82,248.87 M86.21,242.59 M85.00,243.00 M82.22,249.73 M80.53,248.67 M81.78,248.36 M81.73,247.41 M82.72,248.31 M84.23,247.50 M84.52,245.83 M82.98,246.14 M84.34,246.29 M83.54,247.90 M84.19,246.49 M81.26,247.24 M82.70,246.04 M84.23,248.26 M84.08,248.87 M84.77,243.36 M83.02,249.23 M84.19,249.53 M82.62,248.46 M84.90,247.26 M83.97,246.09 M82.83,245.12 M83.57,247.85 M84.01,248.16 M83.97,248.67 M83.09,249.53 M82.03,247.45 M82.55,248.82 M85.44,249.63 M84.53,249.07 M84.30,248.51 M84.71,253.37 M84.30,250.04 M83.82,249.77 M81.86,251.65 M81.41,251.30 M82.55,251.25 M83.20,248.46 M83.02,247.60 M84.38,248.87 M85.03,249.38 M84.34,248.87 M83.76,248.06 M84.01,248.67 M83.54,249.77 M83.76,248.31 M86.02,246.65 M85.40,246.60 M84.64,247.00 M83.61,247.40 M84.85,245.88 M84.30,246.85 M85.51,247.00 M84.56,247.60 M83.35,247.55 M82.98,248.51 M76.10,245.68 M83.76,248.82 M82.70,248.41 M81.30,247.24 M84.05,245.68 M82.59,249.02 M83.09,247.85 M84.01,248.57 M83.61,246.75 M83.35,248.87 M82.83,248.11 M84.27,247.14 M84.71,248.46 M86.90,247.40 M90.12,248.62 M88.63,247.60 M86.54,247.80 M87.38,246.65 M90.24,246.60 M87.78,248.06 M89.62,246.19 M86.28,245.43 M88.77,245.58 M86.71,240.97 M85.55,246.99 M85.74,247.96 M88.54,249.12 M85.61,248.97 M85.74,249.78 M86.06,248.92 M86.86,248.36 M89.79,245.83 M87.23,247.96 M90.57,248.51 M87.42,249.02 M88.80,251.86 M87.05,253.13 M85.18,250.84 M83.46,252.11 M85.33,251.09 M85.98,250.48 M87.05,249.94 M89.75,248.87 M88.69,249.89 M86.47,247.45 M86.28,244.06 M85.80,247.35 M85.91,247.90 M90.38,249.78 M94.88,247.96 M86.58,249.02 M87.42,250.34 M86.90,248.87 M91.69,247.04 M87.53,247.14 M89.90,244.87 M86.90,247.75 M86.43,248.97 M88.00,251.20 M86.28,248.82 M86.36,248.21 M86.75,247.14 M85.91,246.99 M86.17,241.93 M86.60,245.88 M86.86,247.29 M92.46,248.26 M85.40,247.60 M85.00,246.34 M88.26,245.48 M86.69,248.46 M87.27,249.63 M86.39,247.96 M88.07,244.97 M88.37,246.79 M88.22,242.58 M87.53,246.48 M87.38,248.31 M88.18,249.84 M85.70,249.99 M85.63,252.82 M85.41,249.06" fill="#eef2f7" stroke="#cbd5e1" stroke-width="2"></path>
        ${circles}
      </svg>
      <div class="finder-map-legend">
        <span><i style="background:#059669"></i>University</span>
        <span><i style="background:#0ea5e9"></i>Cantonal</span>
        <span><i style="background:#f59e0b"></i>Private</span>
      </div>
    `;
  }

  function renderCantonDetails(agg) {
    const cantonHosp = agg.cantonHosp;
    const totalCanton = cantonHosp.reduce((sum, h) => sum + h.cases, 0);
    const leader = cantonHosp[0];
    let summaryText;

    if (!leader) {
      summaryText = `No hospitals in canton ${state.selectedCanton} match the current selection.`;
    } else {
      const cantonShare = totalCanton ? Math.round((leader.cases / totalCanton) * 100) : 0;
      const nationalShare = agg.total ? ((leader.cases / agg.total) * 100).toFixed(1) : '0.0';
      summaryText = `In canton ${state.selectedCanton}, ${cantonHosp.length} hospitals report volumes for ${state.selectedProc.name}. ${leader.hospital} accounts for ${cantonShare}% of cantonal cases and ${nationalShare}% nationally.`;
    }

    finderCantonSummary.textContent = summaryText;

    finderCantonList.innerHTML = cantonHosp
      .map((h) => {
        const badgeClass =
          h.type === 'university' ? 'badge-university' : h.type === 'kanton' ? 'badge-kanton' : 'badge-private';
        return `
          <div class="finder-canton-row">
            <span><strong>${h.hospital}</strong> <span class="finder-badge ${badgeClass}">${h.type.toUpperCase()}</span></span>
            <span>${h.cases.toLocaleString()} cases</span>
          </div>
        `;
      })
      .join('');
  }

  function render() {
    renderChips();
    renderTypeToggle();

    finderListTitle.textContent = `Top hospitals — ${state.selectedProc.name}`;

    if (!finderDataset) {
      finderListMeta.textContent = 'Loading data…';
      finderKpis.innerHTML = '<div class="finder-loading">Loading data…</div>';
      finderList.innerHTML = '';
      finderMap.innerHTML = '<h3>Map preview</h3><p class="finder-loading">Loading map…</p>';
      finderCantonSummary.textContent = 'Loading data…';
      finderCantonList.innerHTML = '';
      return;
    }

    const aggregation = computeAggregation(state.selectedProc.code);
    renderKpis(aggregation);
    renderTopList(aggregation);
    renderMap(aggregation);
    renderCantonDetails(aggregation);
  }

  finderSearch.addEventListener('input', (event) => {
    state.search = event.target.value;
    render();
  });

  finderCanton.innerHTML = cantonOptions.map((c) => `<option value="${c}">${c}</option>`).join('');
  finderCanton.value = state.selectedCanton;
  finderCanton.addEventListener('change', (event) => {
    state.selectedCanton = event.target.value;
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
      finderListMeta.textContent = 'Failed to load data.';
      finderKpis.innerHTML = '<div class="finder-error">Unable to load hospital dataset.</div>';
      finderList.innerHTML = '';
      finderMap.innerHTML = '<h3>Map preview</h3><p class="finder-error">Unable to load hospital dataset.</p>';
      finderCantonSummary.textContent = 'Unable to load hospital dataset.';
    });
}
