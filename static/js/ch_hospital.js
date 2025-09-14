const procedureData = {
  "A.3.1.F": {
    label: "Coronary catheterization (age >19)",
    cases: { CHUV: 1299, HUG: 1188, Inselspital: 3057, USB: 1960, USZ: 2099 }
  },
  "A.4.1.F": {
    label: "Cardiac rhythm disorders (hospitalizations)",
    cases: { CHUV: 703, HUG: 615, Inselspital: 1974, USB: 1539, USZ: 764 }
  },
  "A.5.1.F": {
    label: "Pacemaker/ICD implantation or replacement",
    cases: { CHUV: 265, HUG: 264, Inselspital: 714, USB: 540, USZ: 486 }
  },
  "B.2.3.F": {
    label: "Stroke unit – complex treatment",
    cases: { CHUV: 751, HUG: 958, Inselspital: 1907, USB: 1206, USZ: 909 }
  },
  "G.4.1.F": {
    label: "Breast cancer (inpatient treatments)",
    cases: { CHUV: 341, HUG: 349, Inselspital: 278, USB: 339, USZ: 199 }
  }
};

const ctx = document.getElementById('casesChart').getContext('2d');
let casesChart;

function updateChart(code) {
  const proc = procedureData[code];
  const hospitals = Object.keys(proc.cases);
  const values = Object.values(proc.cases);

  document.getElementById('procedure-description').textContent = `${code} – ${proc.label}`;

  if (casesChart) {
    casesChart.destroy();
  }

  casesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: hospitals,
      datasets: [{
        label: proc.label,
        data: values,
        backgroundColor: 'rgba(218, 41, 28, 0.6)',
        borderColor: 'rgba(218, 41, 28, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of cases'
          }
        }
      }
    }
  });
}

const buttons = document.querySelectorAll('.procedure-btn');
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateChart(btn.dataset.code);
  });
});

// initialize with first button
updateChart(document.querySelector('.procedure-btn.active').dataset.code);
