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
  'G.4.1.F': [341, 349, 278, 339, 199]
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
  'G.4.1.F': {
    en: 'Breast cancer (inpatient treatments)',
    de: 'Brustkrebs (stationäre Behandlungen)',
    fr: 'Cancer du sein (traitements stationnaires)',
    it: 'Cancro al seno (trattamenti ospedalieri)'
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
  ['rgba(218, 41, 28, 0.6)', 'rgba(218, 41, 28, 1)'],
  ['rgba(0, 122, 51, 0.6)', 'rgba(0, 122, 51, 1)'],
  ['rgba(0, 45, 149, 0.6)', 'rgba(0, 45, 149, 1)'],
  ['rgba(255, 195, 0, 0.6)', 'rgba(255, 195, 0, 1)'],
  ['rgba(128, 0, 128, 0.6)', 'rgba(128, 0, 128, 1)']
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

  if (casesChart) {
    casesChart.destroy();
  }

  casesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: hospitalLabels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
}

const buttons = document.querySelectorAll('.procedure-btn');
const selectedCodes = new Set(
  Array.from(document.querySelectorAll('.procedure-btn.active')).map(b => b.dataset.code)
);

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const code = btn.dataset.code;
    if (selectedCodes.has(code)) {
      selectedCodes.delete(code);
      btn.classList.remove('active');
    } else {
      selectedCodes.add(code);
      btn.classList.add('active');
    }
    updateChart(Array.from(selectedCodes));
  });
});

updateChart(Array.from(selectedCodes));
