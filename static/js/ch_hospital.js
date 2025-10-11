const lang = document.documentElement.lang || 'en';

const normalizeString = (value) =>
  (value || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();

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

const MAP_BOUNDS = {
  latMin: 45.817216,
  latMax: 47.808048,
  lonMin: 5.956532,
  lonMax: 10.492377,
  width: 1224.3984,
  height: 783.07391
};

const SWITZERLAND_PATH = `
m 674.70453,276.70045 2.7,-1.86 3.8,-3.28 3.59,5.02 -0.19,5.22 0,0 -4.4,-2.29 -0
.48,-2.13 -0.43,-0.28 -0.35,0.16 -0.49,-0.35 -1.64,0.75 -0.7,-0.55 -0.43,0.24 -0
.11,-0.55 -0.65,0.28 -0.22,-0.38 z m -62.22,-195.19 0.86,-0.28 2.32,-2.59 2.38,-
0.12 2.83,-1.16 0.87,0.28 0.92,1.92 0.46,0.28 3.13,-0.8 1.94,0.12 1.7,0.64 1.86,
1.36 0.19,1.12 -0.76,3.55 0.78,2.03 1.08,1.12 2.32,1.04 2.73,3.43 1.78,1.28 1.35
,0.4 7.53,0.32 6.31,1.6 0.59,-0.36 0.46,-1.79 0.86,-1.12 1.27,-1 1.02,-0.2 5.67,
3.19 0,0 -0.46,3.75 -0.62,1.56 0.19,3.55 -1.62,0.4 -1.62,2.87 0.3,1 -0.86,0.8 -1
.67,0.72 0.19,1.31 -0.81,1.03 -2.13,-1.19 -0.81,0.88 -0.24,3.03 -0.81,2.31 -2.08
,1.08 -2.32,0.04 0.03,0.96 -0.76,0.8 -0.32,1.51 0.08,0.52 0.97,0.44 -0.92,0.8 0.
95,1.83 0,2.71 0.51,2.03 2.56,-0.16 0.19,0.32 -0.13,2.15 0.48,1.51 -1,0.48 -1,0.
04 -0.43,1.39 0.81,0.48 0.16,0.96 0.92,0.92 0.14,0.68 0.67,0.44 0.49,-0.28 0.24,
0.2 0.16,0.95 1.38,0.16 0.92,1.75 -0.84,0.68 -0.67,0.12 -0.38,1.27 0.27,1.95 0.4
8,0.28 0.03,0.91 0.3,0.36 -0.11,0.52 -0.68,1.03 -2.19,0.04 0.11,0.84 0.92,0.64 2
.4,0.4 0.59,3.82 -0.89,1.07 -0.62,-0.44 -0.32,0.44 0.43,0.44 -0.97,1.91 0.54,1.1
1 -0.21,1.39 -1.51,0.91 -0.27,0.72 1.02,-0.04 0.92,1.35 0.4,1.31 2.65,1.31 0.65,
5.09 0.38,0.75 0.76,0.44 0.03,1.27 1.89,0.44 0.03,0.87 -0.48,1.11 0.38,1.27 0.06
,2.15 0.43,0.68 -0.62,0.95 -0.73,2.42 0.89,2.02 0.7,0.36 0.57,0.91 1.16,0.48 0,1
.23 -1.05,2.3 0.3,0.79 0.46,0.08 0.38,0.52 3.7,-0.91 1.38,0.6 0.54,-0.63 1.11,-0
.2 0.38,-0.6 1.84,-0.71 0.35,-1.11 1.08,0.04 -1.54,2.82 -0.16,1.43 -0.94,1.23 -1
.22,0.79 0.08,0.75 -1.32,0.32 -1.13,1.59 -0.03,1.07 -0.94,0.48 0.54,1.11 -0.41,1
.47 -2.27,1.39 -1.19,1.47 -3.27,0.87 -0.13,0.4 -1.59,0.95 -1.08,-0.95 -0.67,-0.0
8 -0.65,0.32 0.92,1.71 0.62,2.94 2.02,2.06 0.06,1.15 -0.54,1.74 1.14,2.18 -0.54,
2.06 1.73,2.14 0,0 0.59,1.23 -1.22,2.26 -0.11,1.47 -2.54,2.77 -0.59,1.74 0.54,2.
69 1.16,1.78 -0.19,2.34 0.4,2.67 0.92,2.34 -0.11,0.87 -1.08,1.78 -0.21,0.99 0.4,
3.56 0.24,0.44 1.51,0.36 0.76,0.55 1.11,3.84 0,2.26 -0.89,1.94 0.68,2.06 0.11,1.
5 -0.76,1.7 0,0 -1.56,1.07 -0.84,-0.24 -1.51,0.16 -0.4,-0.47 -0.68,0.32 -0.7,-0.
51 -5.18,-1.42 -2.67,-1.07 -0.27,-2.65 -0.68,-0.32 -0.05,-1.19 -2.56,-3.16 0.06,
-0.67 -0.62,-0.51 0.24,-0.36 -0.94,-1.66 -0.78,-0.39 -0.57,-1.5 -0.19,-4.35 -2.1
3,-3.6 0,-1.67 -0.65,-1.58 0.16,-0.99 -0.62,-2.06 -0.38,-0.51 -1.32,-0.24 -0.19,
-0.35 0.43,-2.26 -1.02,-1.31 -0.78,-4.44 0.38,-1.23 -0.89,-2.3 -1.92,-2.85 -0.38
,0.36 -0.78,-0.59 -1.19,-2.38 -0.05,-1.31 -0.46,-1.11 1.38,-2.54 -1.43,-0.48 -1.
57,-2.06 -2.37,-1.27 -0.22,-0.4 -1.94,0.56 -0.3,-0.99 -2.4,0.2 -0.49,-1.59 -2.4,
0.2 -0.51,1.9 -1.13,0.16 0,0.52 -0.65,0.6 0.11,0.79 -0.32,0.2 0,0.44 0.24,0.91 -
1.7,0.04 -1.7,-0.56 -0.46,0.16 -2.19,8.36 -3.35,2.18 -0.76,1.7 0.27,1.59 -0.32,0
.99 -0.35,-0.08 0,2.46 0.46,0.2 -0.14,1.51 -2.99,-0.32 -0.05,0.59 -2,1.11 -1.35,
-0.12 -0.97,0.4 -0.89,-2.22 -0.65,-0.63 -0.65,0.4 -0.54,-0.51 -0.4,0.16 -1.54,-1
.39 0.05,-2.02 -1.19,-0.28 0.05,-0.67 3.18,-0.56 0.65,-0.44 0.97,0.75 0.49,-0.12
 -0.67,-4.87 -2.21,1.11 -7.72,1.23 -1.32,0.48 -0.08,0.67 -1.32,0.83 -1.81,-0.83 
-2.81,-0.36 -0.84,-1.82 0.03,-1.43 -1.78,-2.81 -2.67,-1.19 -2.91,1.23 -0.4,0.99 
-0.84,0.2 -0.32,0.79 -2.16,0 -0.81,-0.63 -1.27,0.36 0.19,1.31 1.59,2.06 -0.59,0.
4 -2.51,0.87 -0.54,-0.28 -5.34,0.95 -0.43,0.59 -3.48,-1.43 0.19,-5.98 -3.05,-4.2
8 -0.32,-1.94 -2.4,-2.54 -2.62,2.26 -3.29,0.56 -0.51,-0.67 -4.29,-0.36 -1.4,0.91
 0.27,2.34 2.7,6.06 -7.53,6.98 -3.27,-0.83 -2.94,-2.54 -3.59,0.48 -5.67,1.47 -2.
91,0.99 -2.78,1.47 -2.37,-0.36 -1.19,-0.67 -1,0.04 -0.35,-0.63 -1.32,-0.79 0,0 -
1.08,-4.56 -0.46,-0.4 0.4,-0.59 0.35,-1.66 -0.46,-3.61 0,0 0,0 0,0 1.46,-0.48 2.
4,-2.5 0.68,-1.31 0.3,-2.06 2.16,-3.69 2.43,-6.03 1.94,-0.95 0.78,-0.79 1.59,-0.
32 2.19,0.44 0.76,-0.12 0.54,-1.59 1.59,-1.63 0,-3.33 1.81,-3.29 1.08,-1.31 -0.0
8,-1.39 3.43,3.53 7.53,0.64 0.24,0.91 -0.46,4.37 0.76,0.79 6.5,-1.98 0.51,-0.99 
1.84,-1.27 0.51,-0.24 0.32,0.28 0.65,-0.56 0.81,-1.51 1.35,-0.24 2.54,-1.39 0.38
,-0.95 -0.67,-1.59 -0.03,-0.91 2,-1.71 0.35,-1.98 -0.54,-0.87 1.54,-1.47 1,-1.47
 0.94,-0.32 0.59,-1.43 0.24,0 0.35,-1.91 -0.19,-0.99 0.78,-2.46 -0.08,-1.43 -1,-
3.97 -1.65,-0.08 -0.08,0.68 -1.7,-0.79 0.19,-3.42 -1.48,-1.91 -3.43,-0.36 -1.22,
-0.52 -0.46,-0.99 -1.43,-0.2 -0.89,0.24 -2.19,-2.19 -2.91,-1.35 0,0 0,0 0,0 5.4,
-2.35 0.32,0.04 0.19,2.19 0.41,0 0.49,-2.74 -0.65,-0.72 0.35,-0.48 -0.78,-2.19 0
.14,-1.87 -1,-2.39 -1.35,-1.31 0.32,-0.76 -0.35,-1.75 -2,-1.63 -1.73,1.47 -0.22,
1.35 -1.21,0 0,0 0,0 0,0 0.46,-1.35 -0.73,-0.28 -1.24,-1.15 -0.54,-0.36 -2.13,0.
32 1.11,-4.62 0.22,-4.3 -1.83,1 -3.08,0.16 -2.16,-0.08 -2.19,-0.83 -1.46,-0.12 -
0.35,-0.76 -0.14,-2.07 -1.27,-1.83 -0.27,-1.71 -0.86,-0.44 -0.38,-1.55 -2.54,-0.
96 -1.48,-1.91 -0.35,-0.16 -0.46,0.32 0.05,-4.02 -1.24,0.6 -0.38,0.84 -1.54,0 0.
14,-0.95 -0.54,-1.87 -1.38,-2.63 -0.84,-0.48 -0.51,-0.24 -0.54,0.16 -1.19,0.84 -
1.97,-0.8 -1.59,0.28 0.54,0.92 -0.13,0.48 -0.3,0.04 0,3.86 -0.3,1.24 -0.65,1.03 
-2.1,2.51 -2.43,2.23 -1.59,2.19 -1.11,0 -1.24,-0.68 -0.24,0.32 0.24,0.72 -0.27,0
.32 -0.7,-0.32 -0.51,0.16 -0.86,1.03 -0.7,-0.12 0.97,-1.43 0.51,-1.47 -0.05,-1.1
5 -0.81,-0.84 0.11,-2.03 -0.3,-1.27 0.59,-1.15 -0.11,-0.68 -1,-0.72 -1.27,0.04 -
6.34,-2.19 -0.7,0.28 -1.48,-0.04 -2.51,-0.96 -0.48,-2.19 -1.56,0.44 -1.19,-0.48 
-0.51,0.08 -0.81,-1.35 -1,0.32 -1.38,-0.28 -0.32,-1.04 0,0 1.62,-0.84 3.99,0.12 
2.89,-0.68 1.35,-0.52 1.97,-1.43 4.08,-1.47 2.27,-0.32 3.62,-1.79 1.16,-2.39 3,-
2.27 1.48,-5.9 0.62,-1.16 0.76,-0.4 2.83,0.52 0.67,0.4 0.76,1.04 1,0.36 1.59,-0.
08 3.75,-2.07 1.86,-0.4 4.32,0.04 2,0.44 3.02,2.67 1.73,3.67 0.35,1.87 -0.92,2.8
7 0.46,2.07 0.94,1.59 1.73,1.16 3.72,0.32 2.94,1.12 1.3,-0.8 1.16,-3.47 0.81,-0.
88 0.89,-0.44 4.18,1.04 7.5,-0.4 1.38,0.44 2,1.48 1.62,0.32 5.15,-1.12 2.08,-1.0
4 3.83,-2.83 1.62,-0.56 1.27,0.4 2.43,2.15 1.16,0.28 1.22,-0.2 1.51,-1.04 0.89,-
1.16 1.08,-5.14 1.4,-2.03 1.59,-0.92 5.72,-0.16 0.51,-0.68 0.22,-1.67 2.62,-2.35
 1.46,0 1.89,0.92 1.24,-0.4 2.48,-2.75 2.7,-1.32 2.59,-4.63 2.08,-1.56 1.97,-0.1
2 2.56,1.08 0.73,1.2 0.68,3.43 0.52,0.47 z
`;


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
  const procedureCatalog = [
    {
      id: 'cardiology',
      label: 'Cardiology',
      procedures: [
        { code: 'A.3.1.F', name: 'Coronary catheterization' },
        { code: 'A.4.1.F', name: 'Cardiac rhythm disorders' },
        { code: 'A.5.1.F', name: 'Pacemaker/ICD implantation' },
        { code: 'A.7.2.F', name: 'Valve surgery' },
        { code: 'A.7.3.F', name: 'Coronary bypass surgery' }
      ]
    },
    {
      id: 'neurosciences',
      label: 'Neurosciences',
      procedures: [
        { code: 'B.2.3.F', name: 'Stroke unit – complex treatment' },
        { code: 'B.3.1.F', name: 'Brain tumour treatments' },
        { code: 'B.4.1.F', name: 'Epilepsy treatments' },
        { code: 'Z.4.5.F', name: 'CNS vascular interventions' }
      ]
    },
    {
      id: 'oncology',
      label: 'Oncology',
      procedures: [
        { code: 'D.3.1.F', name: 'Lung cancer treatments' },
        { code: 'E.4.11.F', name: 'Colorectal cancer treatments' },
        { code: 'G.4.1.F', name: 'Breast cancer treatments' },
        { code: 'K.1.1.F', name: 'Melanoma inpatient treatments' },
        { code: 'Z.4.42.F', name: 'Gynecologic tumour treatments' }
      ]
    },
    {
      id: 'urology',
      label: 'Urology',
      procedures: [
        { code: 'H.2.1.F', name: 'Kidney stone treatments' },
        { code: 'H.3.1.F', name: 'Bladder cancer treatments' },
        { code: 'H.3.2.F', name: 'Transurethral bladder resections' },
        { code: 'H.5.1.F', name: 'Prostate cancer treatments' }
      ]
    },
    {
      id: 'transplantation',
      label: 'Transplantation',
      procedures: [
        { code: 'L.5.1.F', name: 'Kidney transplant' },
        { code: 'Z.4.33.F', name: 'Lung transplant (CIMHS)' },
        { code: 'Z.4.34.F', name: 'Liver transplant (CIMHS)' },
        { code: 'Z.4.35.F', name: 'Pancreas transplant (CIMHS)' },
        { code: 'Z.4.36.F', name: 'Kidney transplant (CIMHS)' }
      ]
    },
    {
      id: 'musculoskeletal',
      label: 'Musculoskeletal',
      procedures: [
        { code: 'Z.4.37.F', name: 'Primary hip prosthesis' },
        { code: 'Z.4.38.F', name: 'Primary knee prosthesis' },
        { code: 'Z.4.39.F', name: 'Specialized spine surgery' },
        { code: 'Z.4.40.F', name: 'Bone tumour treatments' }
      ]
    }
  ];

  const cantonOptions = [
    'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE',
    'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'
  ];

  const PAGE_SIZE = 10;

  const defaultCategory = procedureCatalog[0] ?? null;
  const defaultProcedure = defaultCategory?.procedures?.[0] ?? null;

  const state = {
    selectedCategory: defaultCategory?.id ?? null,
    selectedProc: defaultProcedure,
    selectedCanton: 'BE',
    search: '',
    procedureQuery: '',
    typeFilter: { university: true, kanton: true, private: true },
    listPage: 0
  };

  const typeLabels = {
    university: 'University',
    kanton: 'Cantonal',
    private: 'Private',
    other: 'Other'
  };
  const typeOrder = ['university', 'kanton', 'private', 'other'];

  function initializeFinderUi() {
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
        finderProcedureList.innerHTML =
          '<p class="finder-procedure-empty">No procedures match your search. Try a different keyword.</p>';
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

    const cantonHosp = hospitalsWithShare.filter((h) => h.canton === state.selectedCanton);

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
    if (!agg.total) {
      finderKpis.innerHTML = `
        <div class="finder-kpi"><small>Total cases (CH)</small><strong>0</strong></div>
        <div class="finder-kpi"><small>Hospitals performing</small><strong>0</strong></div>
        <div class="finder-kpi"><small>Share at Univ. hospitals</small><strong>${Math.round(
          agg.uniShare * 100
        )}%</strong></div>
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
    const procedureLabel = state.selectedProc
      ? `${state.selectedProc.name} (${state.selectedProc.code})`
      : 'Selected procedure';
    finderListTitle.textContent = `Top hospitals — ${procedureLabel}`;

    if (!agg.hospitals.length) {
      finderListMeta.textContent = 'No hospitals match the current filters.';
      finderList.innerHTML = '<p class="finder-empty">No hospital volumes available for this selection.</p>';
      return;
    }

    const maxCases = agg.hospitals[0]?.cases || 1;
    const searchLower = normalizeString(state.search.trim());
    const filteredBySearch = agg.hospitals.filter((h) =>
      normalizeString(h.hospital).includes(searchLower)
    );
    if (!filteredBySearch.length) {
      finderListMeta.textContent = 'No hospitals match your search.';
      finderList.innerHTML = '<p class="finder-empty">Try adjusting the filters or search query.</p>';
      return;
    }

    const totalPages = Math.max(1, Math.ceil(filteredBySearch.length / PAGE_SIZE));
    if (state.listPage >= totalPages) {
      state.listPage = totalPages - 1;
    }
    const startIndex = state.listPage * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, filteredBySearch.length);
    const toDisplay = filteredBySearch.slice(startIndex, endIndex);

    const hasPrevious = state.listPage > 0;
    const hasNext = endIndex < filteredBySearch.length;

    finderListMeta.innerHTML = `
      <div class="finder-pagination">
        <button class="finder-page-btn" data-direction="prev" aria-label="Previous hospitals" ${
          hasPrevious ? '' : 'disabled'
        }>
          <span aria-hidden="true">&#8592;</span>
        </button>
        <span>Showing ${startIndex + 1}–${endIndex} of ${filteredBySearch.length}</span>
        <button class="finder-page-btn" data-direction="next" aria-label="Next hospitals" ${
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
        return `
          <div class="finder-row">
            <span class="finder-rank">${startIndex + idx + 1}</span>
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
    const { latMin, latMax, lonMin, lonMax, width: mapWidth, height: mapHeight } = MAP_BOUNDS;

    const circles = hospitals
      .map((h) => {
        const x = ((h.lon - lonMin) / (lonMax - lonMin)) * mapWidth;
        const y = (1 - (h.lat - latMin) / (latMax - latMin)) * mapHeight;
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
      <svg viewBox="0 0 ${mapWidth} ${mapHeight}" role="img" aria-label="Hospital locations by volume">
        <rect x="0" y="0" width="${mapWidth}" height="${mapHeight}" fill="#f8fafc"></rect>
        <path d="${SWITZERLAND_PATH}" fill="#eef2f7" stroke="#cbd5e1" stroke-width="2"></path>
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
      summaryText = `In canton ${state.selectedCanton}, ${cantonHosp.length} hospitals report volumes for ${state.selectedProc.name} (${state.selectedProc.code}). ${leader.hospital} accounts for ${cantonShare}% of cantonal cases and ${nationalShare}% nationally.`;
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
    renderProcedureControls();
    renderTypeToggle();

    const selectedProcedure = state.selectedProc;
    const procedureLabel = selectedProcedure
      ? `${selectedProcedure.name} (${selectedProcedure.code})`
      : 'Select a procedure';

    finderListTitle.textContent = `Top hospitals — ${procedureLabel}`;

    if (!selectedProcedure) {
      finderListMeta.textContent = 'Choose a procedure to explore hospital volumes.';
      finderKpis.innerHTML =
        '<div class="finder-empty">Select a procedure above to see national volumes.</div>';
      finderList.innerHTML = '';
      finderMap.innerHTML =
        '<h3>Map preview</h3><p class="finder-empty">Select a procedure to display hospital locations.</p>';
      finderCantonSummary.textContent = 'Select a procedure to view cantonal details.';
      finderCantonList.innerHTML = '';
      return;
    }

    if (!finderDataset) {
      finderListMeta.textContent = 'Loading data…';
      finderKpis.innerHTML = '<div class="finder-loading">Loading data…</div>';
      finderList.innerHTML = '';
      finderMap.innerHTML = '<h3>Map preview</h3><p class="finder-loading">Loading map…</p>';
      finderCantonSummary.textContent = 'Loading data…';
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

  initializeFinderUi();
}
