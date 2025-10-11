const lang = document.documentElement.lang || 'en';

const hospitals = {
  en: ['CHUV (Lausanne)', 'HUG (Geneva)', 'Inselspital (Bern)', 'USB (Basel)', 'USZ (Zurich)'],
  de: ['CHUV (Lausanne)', 'HUG (Genf)', 'Inselspital (Bern)', 'USB (Basel)', 'USZ (Zürich)'],
  fr: ['CHUV (Lausanne)', 'HUG (Genève)', 'Inselspital (Berne)', 'USB (Bâle)', 'USZ (Zurich)'],
  it: ['CHUV (Losanna)', 'HUG (Ginevra)', 'Inselspital (Berna)', 'USB (Basilea)', 'USZ (Zurigo)']
};

const hospitalOrder = ['CHUV', 'HUG', 'Inselspital', 'USB', 'USZ'];

const hospitalNameMapping = {
  'CHUV Centre Hospitalier Universitaire Vaudois': 'CHUV',
  'Les Hôpitaux Universitaires de Genève HUG': 'HUG',
  'Insel Gruppe AG (universitär)': 'Inselspital',
  'Universitätsspital Basel': 'USB',
  'Universitätsspital Zürich': 'USZ'
};

let aggregatedCases = null;

function parseNumeric(value) {
  if (!value) {
    return 0;
  }
  const cleaned = value.replace(/'/g, '').replace(/\s+/g, '');
  const digits = cleaned.match(/\d+/g);
  if (!digits) {
    return 0;
  }
  return Number(digits.join(''));
}

async function loadCasesData() {
  try {
    const response = await fetch('/static/data/qip23_tabdaten.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch cases data: ${response.status}`);
    }

    const rawText = await response.text();
    const text = rawText.replace(/^\uFEFF/, '');
    const rows = text.split(/\r?\n/).filter(row => row.trim().length > 0);
    const data = {};

    rows.forEach((row, idx) => {
      if (idx === 0) {
        return; // skip header
      }

      const columns = row.split(';');
      if (columns.length < 2) {
        return;
      }

      const institution = columns[0].trim();
      const indicatorField = columns[1].trim();
      const indicatorCode = indicatorField.split(' ')[0];

      if (!indicatorCodes.includes(indicatorCode)) {
        return;
      }

      const hospitalKey = hospitalNameMapping[institution];
      if (!hospitalKey) {
        return;
      }

      const casesValue = parseNumeric(columns[columns.length - 1]);
      if (!data[indicatorCode]) {
        data[indicatorCode] = {};
      }
      if (!data[indicatorCode][hospitalKey]) {
        data[indicatorCode][hospitalKey] = 0;
      }
      data[indicatorCode][hospitalKey] += casesValue;
    });

    indicatorCodes.forEach(code => {
      if (!data[code]) {
        data[code] = {};
      }
      hospitalOrder.forEach(hospitalKey => {
        if (!data[code][hospitalKey]) {
          data[code][hospitalKey] = 0;
        }
      });
    });

    aggregatedCases = data;
    updateChart(Array.from(selectedCodes));
  } catch (error) {
    console.error('Error loading hospital cases data:', error);
  }
}

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

const indicatorCodes = Object.keys(procedureLabels);

function getDatasetForCode(code) {
  if (!aggregatedCases) {
    return hospitalOrder.map(() => 0);
  }
  const codeData = aggregatedCases[code] || {};
  return hospitalOrder.map(hospitalKey => codeData[hospitalKey] || 0);
}

function updateChart(codes) {
  if (!aggregatedCases) {
    return;
  }
  const hospitalLabels = hospitals[lang];
  const descriptionEl = document.getElementById('procedure-description');

  const datasets = codes.map((code, idx) => ({
    label: procedureLabels[code][lang],
    data: getDatasetForCode(code),
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
    casesChart.data.labels = hospitalLabels;
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

loadCasesData();

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

  const mockHospitals = [
    { hospital: 'Inselspital Bern (USI)', type: 'university', canton: 'BE', cases: 820, lat: 46.95, lon: 7.44 },
    { hospital: 'CHUV Lausanne', type: 'university', canton: 'VD', cases: 760, lat: 46.52, lon: 6.62 },
    { hospital: 'USZ Zürich', type: 'university', canton: 'ZH', cases: 910, lat: 47.38, lon: 8.55 },
    { hospital: 'HUG Genève', type: 'university', canton: 'GE', cases: 680, lat: 46.2, lon: 6.14 },
    { hospital: 'USB Basel', type: 'university', canton: 'BS', cases: 640, lat: 47.56, lon: 7.59 },
    { hospital: 'Kantonsspital St. Gallen', type: 'kanton', canton: 'SG', cases: 430, lat: 47.43, lon: 9.38 },
    { hospital: 'Kantonsspital Luzern', type: 'kanton', canton: 'LU', cases: 360, lat: 47.05, lon: 8.31 },
    { hospital: 'Kantonsspital Graubünden', type: 'kanton', canton: 'GR', cases: 220, lat: 46.86, lon: 9.53 },
    { hospital: 'Kantonsspital Aarau', type: 'kanton', canton: 'AG', cases: 310, lat: 47.39, lon: 8.05 },
    { hospital: 'Hôpital du Valais (Sion)', type: 'kanton', canton: 'VS', cases: 180, lat: 46.23, lon: 7.36 },
    { hospital: 'Hôpital Fribourgeois', type: 'kanton', canton: 'FR', cases: 150, lat: 46.8, lon: 7.15 },
    { hospital: 'Privatklinik Bethanien (ZH)', type: 'private', canton: 'ZH', cases: 95, lat: 47.37, lon: 8.56 },
    { hospital: 'Hirslanden Clinique La Colline (GE)', type: 'private', canton: 'GE', cases: 105, lat: 46.2, lon: 6.14 }
  ];

  const byProcedureMultiplier = {
    'A.3.1.F': { university: 1.0, kanton: 0.7, private: 0.25 },
    'A.5.1.F': { university: 0.9, kanton: 0.8, private: 0.3 },
    'B.2.3.F': { university: 1.2, kanton: 0.5, private: 0.0 },
    'L.5.1.F': { university: 1.6, kanton: 0.1, private: 0.0 },
    'Z.4.37.F': { university: 0.7, kanton: 1.0, private: 0.5 }
  };

  const cantonOptions = ['ZH', 'BE', 'VD', 'GE', 'BS', 'SG', 'AG', 'FR', 'VS', 'LU', 'GR'];

  const state = {
    selectedProc: procedures[0],
    selectedCanton: 'BE',
    search: '',
    typeFilter: { university: true, kanton: true, private: true }
  };

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

  function computeAggregation(procCode) {
    const mult = byProcedureMultiplier[procCode] || { university: 1, kanton: 1, private: 1 };
    const scaled = mockHospitals.map((h) => ({
      ...h,
      adjCases: Math.round(h.cases * (mult[h.type] ?? 1))
    }));

    const filtered = scaled.filter((h) => state.typeFilter[h.type]);
    const total = filtered.reduce((sum, h) => sum + h.adjCases, 0);
    const hospitalsWithShare = filtered
      .map((h) => ({ ...h, share: total ? h.adjCases / total : 0 }))
      .sort((a, b) => b.adjCases - a.adjCases);

    const uniCases = hospitalsWithShare
      .filter((h) => h.type === 'university')
      .reduce((sum, h) => sum + h.adjCases, 0);

    const cantonHosp = hospitalsWithShare.filter((h) => h.canton === state.selectedCanton);

    const hhi = Math.round(
      hospitalsWithShare.reduce((sum, h) => sum + (h.share * 100) ** 2, 0)
    );

    return {
      total,
      hospitals: hospitalsWithShare,
      uniShare: total ? uniCases / total : 0,
      hhi,
      hhiLabel: labelFromHHI(hhi),
      cantonHosp
    };
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
        if (newProc) {
          state.selectedProc = newProc;
          render();
        }
      });
    });
  }

  function renderTypeToggle() {
    const typeOrder = [
      { key: 'university', label: 'University' },
      { key: 'kanton', label: 'Kanton' },
      { key: 'private', label: 'Private' }
    ];
    finderTypeToggle.innerHTML = typeOrder
      .map(
        ({ key, label }) => `
          <button class="finder-type-btn${state.typeFilter[key] ? ' active' : ''}" data-key="${key}">
            ${label}
          </button>
        `
      )
      .join('');

    finderTypeToggle.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        state.typeFilter[key] = !state.typeFilter[key];
        const hasActive = Object.values(state.typeFilter).some(Boolean);
        if (!hasActive) {
          // ensure at least one type stays active
          state.typeFilter[key] = true;
        }
        render();
      });
    });
  }

  function renderKpis(agg) {
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
    const maxCases = agg.hospitals[0]?.adjCases || 1;
    const filteredBySearch = agg.hospitals.filter((h) =>
      h.hospital.toLowerCase().includes(state.search.toLowerCase())
    );
    const toDisplay = filteredBySearch.slice(0, 12);

    finderListTitle.textContent = `Top hospitals — ${state.selectedProc.name}`;
    finderListMeta.textContent = `Showing ${toDisplay.length} of ${agg.hospitals.length}`;

    finderList.innerHTML = toDisplay
      .map((h, idx) => {
        const share = (h.share * 100).toFixed(1);
        const width = Math.round((h.adjCases / maxCases) * 100);
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
              <strong>${h.adjCases}</strong>
              <span>${share}%</span>
            </div>
          </div>
        `;
      })
      .join('');
  }

  function renderMap(agg) {
    const hospitals = agg.hospitals;
    const maxCases = hospitals[0]?.adjCases || 1;
    const latMin = 45.8;
    const latMax = 47.8;
    const lonMin = 5.9;
    const lonMax = 10.5;

    const circles = hospitals
      .map((h) => {
        const x = ((h.lon - lonMin) / (lonMax - lonMin)) * 1000;
        const y = (1 - (h.lat - latMin) / (latMax - latMin)) * 600;
        const radius = 4 + (h.adjCases / maxCases) * 10;
        const color =
          h.type === 'university' ? '#059669' : h.type === 'kanton' ? '#0ea5e9' : '#f59e0b';
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(
          1
        )}" fill="${color}" opacity="0.9">
          <title>${h.hospital} — ${h.adjCases} cases</title>
        </circle>`;
      })
      .join('');

    finderMap.innerHTML = `
      <h3>Map preview</h3>
      <svg viewBox="0 0 1000 600" role="img" aria-label="Hospital locations by volume">
        <rect x="0" y="0" width="1000" height="600" fill="#f8fafc"></rect>
        <path d="M120,310 C200,180 360,120 520,160 C700,200 820,260 860,360 C760,520 520,520 320,480 C200,450 120,380 120,310 Z" fill="#eef2f7" stroke="#cbd5e1"></path>
        ${circles}
      </svg>
      <div class="finder-map-legend">
        <span><i style="background:#059669"></i>University</span>
        <span><i style="background:#0ea5e9"></i>Kanton</span>
        <span><i style="background:#f59e0b"></i>Private</span>
      </div>
    `;
  }

  function renderCantonDetails(agg) {
    const cantonHosp = agg.cantonHosp;
    const totalCanton = cantonHosp.reduce((sum, h) => sum + h.adjCases, 0);
    const leader = cantonHosp[0];
    let summaryText;

    if (!leader) {
      summaryText = `No providers listed in canton ${state.selectedCanton}.`;
    } else {
      const cantonShare = totalCanton ? Math.round((leader.adjCases / totalCanton) * 100) : 0;
      const nationalShare = agg.total ? ((leader.adjCases / agg.total) * 100).toFixed(1) : '0.0';
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
            <span>${h.adjCases} cases</span>
          </div>
        `;
      })
      .join('');
  }

  function render() {
    renderChips();
    renderTypeToggle();

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
}
