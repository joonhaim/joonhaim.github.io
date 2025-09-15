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
