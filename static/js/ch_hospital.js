const procedureData = {
  "A.3.1.F": {
    label: "Coronary catheterizations",
    cases: { USZ: 120, HUG: 110, CHUV: 95, USB: 80, Inselspital: 100 }
  },
  "A.7.1.F": {
    label: "Cardiac surgery",
    cases: { USZ: 75, HUG: 90, CHUV: 85, USB: 60, Inselspital: 70 }
  },
  "B.1.18.F": {
    label: "Thrombectomies",
    cases: { USZ: 30, HUG: 25, CHUV: 20, USB: 18, Inselspital: 22 }
  },
  "E.4.1.F": {
    label: "Colorectal resections",
    cases: { USZ: 55, HUG: 60, CHUV: 50, USB: 45, Inselspital: 48 }
  },
  "I.3.1.F": {
    label: "Hip fracture surgery",
    cases: { USZ: 65, HUG: 70, CHUV: 60, USB: 58, Inselspital: 62 }
  }
};

const ctx = document.getElementById('casesChart').getContext('2d');
let casesChart;

function updateChart(code) {
  const proc = procedureData[code];
  const hospitals = Object.keys(proc.cases);
  const values = Object.values(proc.cases);

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

const select = document.getElementById('procedure-select');
select.addEventListener('change', (e) => updateChart(e.target.value));

// initialize with first procedure
updateChart(select.value);
