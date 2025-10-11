const normalizeString = (value) =>
  (value || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
const fadeObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
});

document.querySelectorAll('.fade-element').forEach(el => fadeObserver.observe(el));

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
  const SUPPORTED_LOCALES = ['en', 'de', 'fr', 'it'];
  const pageLocale = document.documentElement.lang?.toLowerCase() ?? 'en';
  const activeLocale = SUPPORTED_LOCALES.includes(pageLocale) ? pageLocale : 'en';

  const translations = {
    en: {
      categories: {
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
      types: {
        labels: { university: 'University', kanton: 'Cantonal', private: 'Private', other: 'Other' },
        badges: { university: 'University', kanton: 'Cantonal', private: 'Private', other: 'Other' },
        legend: { university: 'University', kanton: 'Cantonal', private: 'Private' }
      },
      hhi: {
        labels: { low: 'Low', moderate: 'Moderate', high: 'High' },
        footnote: '&lt;1500 Low · 1500–2500 Moderate · &gt;2500 High'
      },
      kpi: {
        totalCases: 'Total cases (CH)',
        hospitalsPerforming: 'Hospitals performing',
        universityShare: 'Share at Univ. hospitals',
        centralization: 'Centralization (HHI)'
      },
      messages: {
        allCantons: 'All cantons',
        selectedProcedure: 'Select a procedure',
        chooseProcedure: 'Choose a procedure to explore hospital volumes.',
        selectProcedureNational: 'Select a procedure above to see national volumes.',
        selectProcedureMap: 'Select a procedure to display hospital locations.',
        selectProcedureCantonal: 'Select a procedure to view cantonal details.',
        loadingData: 'Loading data…',
        loadingMap: 'Loading map…',
        failedToLoad: 'Failed to load data.',
        datasetError: 'Unable to load hospital dataset.',
        noHospitalsFilters: 'No hospitals match the current filters.',
        noHospitalVolumes: 'No hospital volumes available for this selection.',
        noHospitalsSearch: 'No hospitals match your search.',
        noProceduresMatch: 'No procedures match your search. Try a different keyword.',
        tryAdjustFilters: 'Try adjusting the filters or search query.',
        paginationShowing: 'Showing {start}–{end} of {total}',
        ariaPrevHospitals: 'Previous hospitals',
        ariaNextHospitals: 'Next hospitals',
        topHospitals: 'Top hospitals',
        topHospitalsIn: 'Top hospitals in {canton}',
        cantonSelectPrompt: 'Select a canton to view local hospital details.',
        cantonNoHospitals: 'No hospitals in canton {canton} match the current selection.',
        cantonSummary:
          'In canton {canton}, {count} hospitals report volumes for {procedure}. {leader} accounts for {cantonShare}% of cantonal cases and {nationalShare}% nationally.',
        cantonRowCases: '{cases} cases',
        mapTitle: 'Map preview',
        mapAriaLabel: 'Hospital locations by volume',
        mapNoData: 'No map data available for this selection.',
        mapTooltip: '{hospital} — {cases} cases'
      }
    },
    de: {
      categories: {
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
      types: {
        labels: { university: 'Universitär', kanton: 'Kantonale', private: 'Private', other: 'Weitere' },
        badges: { university: 'Universitär', kanton: 'Kanton', private: 'Privat', other: 'Weitere' },
        legend: { university: 'Universitär', kanton: 'Kantonale', private: 'Private' }
      },
      hhi: {
        labels: { low: 'Niedrig', moderate: 'Mittel', high: 'Hoch' },
        footnote: '&lt;1500 Niedrig · 1500–2500 Mittel · &gt;2500 Hoch'
      },
      kpi: {
        totalCases: 'Fallzahlen gesamt (CH)',
        hospitalsPerforming: 'Durchführende Spitäler',
        universityShare: 'Anteil universitäre Spitäler',
        centralization: 'Zentralisierung (HHI)'
      },
      messages: {
        allCantons: 'Alle Kantone',
        selectedProcedure: 'Behandlung wählen',
        chooseProcedure: 'Wählen Sie eine Behandlung, um Spitalvolumen zu erkunden.',
        selectProcedureNational: 'Wählen Sie oben eine Behandlung, um nationale Fallzahlen zu sehen.',
        selectProcedureMap: 'Wählen Sie eine Behandlung, um Spitalstandorte anzuzeigen.',
        selectProcedureCantonal: 'Wählen Sie eine Behandlung, um kantonale Details zu sehen.',
        loadingData: 'Daten werden geladen…',
        loadingMap: 'Karte wird geladen…',
        failedToLoad: 'Fehler beim Laden der Daten.',
        datasetError: 'Spitaldaten konnten nicht geladen werden.',
        noHospitalsFilters: 'Keine Spitäler passen zu den aktuellen Filtern.',
        noHospitalVolumes: 'Für diese Auswahl liegen keine Spitalvolumen vor.',
        noHospitalsSearch: 'Keine Spitäler entsprechen Ihrer Suche.',
        noProceduresMatch: 'Keine Behandlungen passen zur Suche. Versuchen Sie einen anderen Begriff.',
        tryAdjustFilters: 'Passen Sie Filter oder Suchbegriff an.',
        paginationShowing: 'Anzeige {start}–{end} von {total}',
        ariaPrevHospitals: 'Vorherige Spitäler',
        ariaNextHospitals: 'Weitere Spitäler',
        topHospitals: 'Top-Spitäler',
        topHospitalsIn: 'Top-Spitäler im Kanton {canton}',
        cantonSelectPrompt: 'Wählen Sie einen Kanton, um lokale Spitaldetails zu sehen.',
        cantonNoHospitals: 'Keine Spitäler im Kanton {canton} erfüllen die aktuelle Auswahl.',
        cantonSummary:
          'Im Kanton {canton} melden {count} Spitäler Volumen für {procedure}. {leader} steht für {cantonShare}% der kantonalen Fälle und {nationalShare}% schweizweit.',
        cantonRowCases: '{cases} Fälle',
        mapTitle: 'Kartenübersicht',
        mapAriaLabel: 'Spitalstandorte nach Fallzahlen',
        mapNoData: 'Für diese Auswahl stehen keine Kartendaten zur Verfügung.',
        mapTooltip: '{hospital} — {cases} Fälle'
      }
    },
    fr: {
      categories: {
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
      types: {
        labels: { university: 'Universitaires', kanton: 'Cantonaux', private: 'Privés', other: 'Autres' },
        badges: { university: 'Universitaire', kanton: 'Cantonal', private: 'Privé', other: 'Autre' },
        legend: { university: 'Universitaires', kanton: 'Cantonaux', private: 'Privés' }
      },
      hhi: {
        labels: { low: 'Faible', moderate: 'Modérée', high: 'Élevée' },
        footnote: '&lt;1500 Faible · 1500–2500 Modérée · &gt;2500 Élevée'
      },
      kpi: {
        totalCases: 'Cas totaux (CH)',
        hospitalsPerforming: 'Hôpitaux actifs',
        universityShare: 'Part des hôpitaux universitaires',
        centralization: 'Centralisation (HHI)'
      },
      messages: {
        allCantons: 'Tous les cantons',
        selectedProcedure: 'Sélectionner une intervention',
        chooseProcedure: 'Choisissez une intervention pour explorer les volumes hospitaliers.',
        selectProcedureNational: 'Sélectionnez une intervention ci-dessus pour voir les volumes nationaux.',
        selectProcedureMap: 'Sélectionnez une intervention pour afficher les emplacements des hôpitaux.',
        selectProcedureCantonal: 'Sélectionnez une intervention pour voir les détails cantonaux.',
        loadingData: 'Chargement des données…',
        loadingMap: 'Chargement de la carte…',
        failedToLoad: 'Échec du chargement des données.',
        datasetError: "Impossible de charger l’ensemble de données hospitalier.",
        noHospitalsFilters: 'Aucun hôpital ne correspond aux filtres actuels.',
        noHospitalVolumes: 'Aucun volume hospitalier disponible pour cette sélection.',
        noHospitalsSearch: 'Aucun hôpital ne correspond à votre recherche.',
        noProceduresMatch: 'Aucune intervention ne correspond à votre recherche. Essayez un autre mot-clé.',
        tryAdjustFilters: 'Modifiez les filtres ou la requête de recherche.',
        paginationShowing: 'Affichage {start}–{end} sur {total}',
        ariaPrevHospitals: 'Hôpitaux précédents',
        ariaNextHospitals: 'Hôpitaux suivants',
        topHospitals: 'Hôpitaux principaux',
        topHospitalsIn: 'Hôpitaux principaux dans le canton {canton}',
        cantonSelectPrompt: 'Sélectionnez un canton pour voir les détails locaux.',
        cantonNoHospitals: 'Aucun hôpital du canton {canton} ne correspond à la sélection actuelle.',
        cantonSummary:
          'Dans le canton {canton}, {count} hôpitaux déclarent des volumes pour {procedure}. {leader} représente {cantonShare}% des cas cantonaux et {nationalShare}% au niveau national.',
        cantonRowCases: '{cases} cas',
        mapTitle: 'Aperçu cartographique',
        mapAriaLabel: 'Localisation des hôpitaux selon le volume',
        mapNoData: 'Aucune donnée cartographique disponible pour cette sélection.',
        mapTooltip: '{hospital} — {cases} cas'
      }
    },
    it: {
      categories: {
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
      types: {
        labels: { university: 'Universitari', kanton: 'Cantonali', private: 'Privati', other: 'Altri' },
        badges: { university: 'Universitario', kanton: 'Cantonale', private: 'Privato', other: 'Altro' },
        legend: { university: 'Universitari', kanton: 'Cantonali', private: 'Privati' }
      },
      hhi: {
        labels: { low: 'Bassa', moderate: 'Moderata', high: 'Alta' },
        footnote: '&lt;1500 Bassa · 1500–2500 Moderata · &gt;2500 Alta'
      },
      kpi: {
        totalCases: 'Casi totali (CH)',
        hospitalsPerforming: 'Ospedali attivi',
        universityShare: 'Quota ospedali universitari',
        centralization: 'Centralizzazione (HHI)'
      },
      messages: {
        allCantons: 'Tutti i cantoni',
        selectedProcedure: 'Seleziona un intervento',
        chooseProcedure: 'Scegli un intervento per esplorare i volumi ospedalieri.',
        selectProcedureNational: 'Seleziona un intervento per vedere i volumi nazionali.',
        selectProcedureMap: 'Seleziona un intervento per visualizzare le posizioni degli ospedali.',
        selectProcedureCantonal: 'Seleziona un intervento per vedere i dettagli cantonali.',
        loadingData: 'Caricamento dati…',
        loadingMap: 'Caricamento mappa…',
        failedToLoad: 'Errore nel caricamento dei dati.',
        datasetError: 'Impossibile caricare il dataset ospedaliero.',
        noHospitalsFilters: 'Nessun ospedale corrisponde ai filtri correnti.',
        noHospitalVolumes: 'Nessun volume ospedaliero disponibile per questa selezione.',
        noHospitalsSearch: 'Nessun ospedale corrisponde alla ricerca.',
        noProceduresMatch: 'Nessun intervento corrisponde alla ricerca. Prova con un’altra parola chiave.',
        tryAdjustFilters: 'Modifica filtri o termine di ricerca.',
        paginationShowing: 'Visualizzazione {start}–{end} di {total}',
        ariaPrevHospitals: 'Ospedali precedenti',
        ariaNextHospitals: 'Ospedali successivi',
        topHospitals: 'Ospedali principali',
        topHospitalsIn: 'Ospedali principali nel cantone {canton}',
        cantonSelectPrompt: 'Seleziona un cantone per vedere i dettagli locali.',
        cantonNoHospitals: 'Nessun ospedale nel cantone {canton} corrisponde alla selezione corrente.',
        cantonSummary:
          'Nel cantone {canton}, {count} ospedali riportano volumi per {procedure}. {leader} rappresenta il {cantonShare}% dei casi cantonali e il {nationalShare}% a livello nazionale.',
        cantonRowCases: '{cases} casi',
        mapTitle: 'Anteprima mappa',
        mapAriaLabel: 'Posizioni ospedaliere per volume',
        mapNoData: 'Nessun dato cartografico disponibile per questa selezione.',
        mapTooltip: '{hospital} — {cases} casi'
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

  const getObjectTranslation = (path) => {
    const base = resolvePath(defaultTranslations, path) ?? {};
    const value = resolvePath(localeTranslations, path);
    if (value && typeof value === 'object') {
      return { ...base, ...value };
    }
    return { ...base };
  };

  const procedureCatalogSchema = [
    { id: 'cardiology', procedures: ['A.3.1.F', 'A.4.1.F', 'A.5.1.F', 'A.7.2.F', 'A.7.3.F'] },
    { id: 'neurosciences', procedures: ['B.2.3.F', 'B.3.1.F', 'B.4.1.F', 'Z.4.5.F'] },
    { id: 'oncology', procedures: ['D.3.1.F', 'E.4.11.F', 'G.4.1.F', 'K.1.1.F', 'Z.4.42.F'] },
    { id: 'urology', procedures: ['H.2.1.F', 'H.3.1.F', 'H.3.2.F', 'H.5.1.F'] },
    { id: 'transplantation', procedures: ['L.5.1.F', 'Z.4.33.F', 'Z.4.34.F', 'Z.4.35.F', 'Z.4.36.F'] },
    { id: 'musculoskeletal', procedures: ['Z.4.37.F', 'Z.4.38.F', 'Z.4.39.F', 'Z.4.40.F'] }
  ];

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

  const buildProcedureCatalog = () =>
    procedureCatalogSchema.map((category) => ({
      id: category.id,
      label: translate(`categories.${category.id}`),
      procedures: category.procedures.map((code) => ({
        code,
        name: getProcedureName(code)
      }))
    }));

  const ALL_CANTONS_OPTION = 'ALL';

  const cantonOptions = [
    { value: ALL_CANTONS_OPTION, label: translate('messages.allCantons') },
    { value: 'AG', label: 'AG' },
    { value: 'AI', label: 'AI' },
    { value: 'AR', label: 'AR' },
    { value: 'BE', label: 'BE' },
    { value: 'BL', label: 'BL' },
    { value: 'BS', label: 'BS' },
    { value: 'FR', label: 'FR' },
    { value: 'GE', label: 'GE' },
    { value: 'GL', label: 'GL' },
    { value: 'GR', label: 'GR' },
    { value: 'JU', label: 'JU' },
    { value: 'LU', label: 'LU' },
    { value: 'NE', label: 'NE' },
    { value: 'NW', label: 'NW' },
    { value: 'OW', label: 'OW' },
    { value: 'SG', label: 'SG' },
    { value: 'SH', label: 'SH' },
    { value: 'SO', label: 'SO' },
    { value: 'SZ', label: 'SZ' },
    { value: 'TG', label: 'TG' },
    { value: 'TI', label: 'TI' },
    { value: 'UR', label: 'UR' },
    { value: 'VD', label: 'VD' },
    { value: 'VS', label: 'VS' },
    { value: 'ZG', label: 'ZG' },
    { value: 'ZH', label: 'ZH' }
  ];

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
    const finderListTitle = document.getElementById('finder-list-title');
    const finderListMeta = document.getElementById('finder-list-meta');
    const finderMap = document.getElementById('finder-map');
    const finderCantonSummary = document.getElementById('finder-canton-summary');
    const finderCantonList = document.getElementById('finder-canton-list');

    if (!finderProcedureSearch || !finderCategoryTabs || !finderProcedureList) {
      console.warn('Procedure finder UI is missing required elements.');
      return;
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
      listPage: 0
    };

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
      const normalized = query.trim().toLowerCase();
      if (!normalized) {
        return true;
      }
      const haystack = `${procedure.name} ${procedure.code}`.toLowerCase();
      return haystack.includes(normalized);
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
          render();
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
        state.listPage = 0;
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
    const enrichedAll = entries
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
      });

    const totalAll = enrichedAll.reduce((sum, h) => sum + h.cases, 0);

    if (!totalAll) {
      return {
        total: 0,
        hospitals: [],
        uniShare: 0,
        hhi: 0,
        hhiLabel: labelFromHHI(0),
        cantonHosp: []
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
        uniShare: overallUniShare,
        hhi: 0,
        hhiLabel: labelFromHHI(0),
        cantonHosp: []
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

    return {
      total,
      hospitals: hospitalsWithShare,
      uniShare: overallUniShare,
      hhi,
      hhiLabel: labelFromHHI(hhi),
      cantonHosp
    };
  }

  function renderKpis(agg) {
    const tiles = [
      {
        label: kpiLabels.totalCases,
        value: agg.total ? agg.total.toLocaleString() : '0',
        footnote: ''
      },
      {
        label: kpiLabels.hospitalsPerforming,
        value: agg.hospitals.length.toLocaleString(),
        footnote: ''
      },
      {
        label: kpiLabels.universityShare,
        value: `${Math.round(agg.uniShare * 100)}%`,
        footnote: ''
      },
      {
        label: kpiLabels.centralization,
        value: `${agg.hhi} – ${agg.hhiLabel}`,
        footnote: hhiFootnote
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
    const procedureLabel = state.selectedProc
      ? `${state.selectedProc.name} (${state.selectedProc.code})`
      : msg('selectedProcedure');
    const listLocationLabel =
      state.selectedCanton === ALL_CANTONS_OPTION
        ? msg('topHospitals')
        : msg('topHospitalsIn', { canton: state.selectedCanton });
    finderListTitle.textContent = `${listLocationLabel} — ${procedureLabel}`;

    if (!agg.hospitals.length) {
      finderListMeta.textContent = msg('noHospitalsFilters');
      finderList.innerHTML = `<p class="finder-empty">${msg('noHospitalVolumes')}</p>`;
      return;
    }

    const searchLower = normalizeString(state.search.trim());
    const filteredBySearch = agg.hospitals.filter((h) =>
      normalizeString(h.hospital).includes(searchLower)
    );
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
    const hospitalsWithCoords = agg.hospitals.filter((h) => h.lat != null && h.lon != null);
    const hospitals =
      state.selectedCanton === ALL_CANTONS_OPTION
        ? hospitalsWithCoords
        : hospitalsWithCoords.filter((h) => h.canton === state.selectedCanton);

    if (!hospitals.length) {
      finderMap.innerHTML = `<h3>${msg('mapTitle')}</h3><p class="finder-empty">${msg('mapNoData')}</p>`;
      return;
    }

    const maxCases = hospitals[0]?.cases || 1;
    const latMin = 45.8;
    const latMax = 47.8;
    const lonMin = 5.9;
    const lonMax = 10.5;

    const circles = hospitals
      .map((h) => {
        const x = ((h.lon - lonMin) / (lonMax - lonMin)) * 1000;
        const y = (1 - (h.lat - latMin) / (latMax - latMin)) * 600;
        const radius = 4 + (h.cases / maxCases) * 10;
        const color =
          h.type === 'university' ? '#059669' : h.type === 'kanton' ? '#0ea5e9' : '#f59e0b';
        const tooltip = msg('mapTooltip', { hospital: h.hospital, cases: h.cases.toLocaleString() });
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(
          1
        )}" fill="${color}" opacity="0.9">
          <title>${tooltip}</title>
        </circle>`;
      })
      .join('');

    finderMap.innerHTML = `
      <h3>${msg('mapTitle')}</h3>
      <svg viewBox="0 0 1000 600" role="img" aria-label="${msg('mapAriaLabel')}">
        <rect x="0" y="0" width="1000" height="600" fill="#f8fafc"></rect>
        <image
          href="static/images/roestigraben/switzerland.svg"
          x="0"
          y="0"
          width="1000"
          height="600"
          preserveAspectRatio="none"
          opacity="0.35"
          aria-hidden="true"
          class="finder-map-background"
          pointer-events="none"
        ></image>
        ${circles}
      </svg>
      <div class="finder-map-legend">
        <span><i style="background:#059669"></i>${typeLegend.university}</span>
        <span><i style="background:#0ea5e9"></i>${typeLegend.kanton}</span>
        <span><i style="background:#f59e0b"></i>${typeLegend.private}</span>
      </div>
    `;
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

    finderListTitle.textContent = `${listLocationLabel} — ${procedureLabel}`;

    if (!selectedProcedure) {
      finderListMeta.textContent = msg('chooseProcedure');
      finderKpis.innerHTML = `<div class="finder-empty">${msg('selectProcedureNational')}</div>`;
      finderList.innerHTML = '';
      finderMap.innerHTML = `<h3>${msg('mapTitle')}</h3><p class="finder-empty">${msg('selectProcedureMap')}</p>`;
      finderCantonSummary.textContent = msg('selectProcedureCantonal');
      finderCantonList.innerHTML = '';
      return;
    }

    if (!finderDataset) {
      finderListMeta.textContent = msg('loadingData');
      finderKpis.innerHTML = `<div class="finder-loading">${msg('loadingData')}</div>`;
      finderList.innerHTML = '';
      finderMap.innerHTML = `<h3>${msg('mapTitle')}</h3><p class="finder-loading">${msg('loadingMap')}</p>`;
      finderCantonSummary.textContent = msg('loadingData');
      finderCantonList.innerHTML = '';
      return;
    }

    const aggregation = computeAggregation(selectedProcedure.code);
    renderKpis(aggregation);
    renderTopList(aggregation);
    renderMap(aggregation);
    renderCantonDetails(aggregation);
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
    finderCanton.addEventListener('change', (event) => {
      const value = event.target.value;
      state.selectedCanton = cantonOptions.some((option) => option.value === value)
        ? value
        : ALL_CANTONS_OPTION;
      state.listPage = 0;
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
        finderMap.innerHTML = `<h3>${msg('mapTitle')}</h3><p class="finder-error">${msg('datasetError')}</p>`;
        finderCantonSummary.textContent = msg('datasetError');
      });
  }

  const bootstrapFinder = () => {
    const procedureCatalog = buildProcedureCatalog();
    initializeFinderUi(procedureCatalog);
  };

  loadProcedureTranslationDataset()
    .then((entries) => {
      applyProcedureTranslations(entries);
    })
    .catch((error) => {
      console.warn('Unable to load procedure descriptions', error);
    })
    .finally(() => {
      bootstrapFinder();
    });
}
