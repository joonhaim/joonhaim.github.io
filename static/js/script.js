// --- Atmosphere functions (ported from Java) ---
const T0 = 288.15, P0 = 101325, g = 9.80665;
const a0_a1 = -0.0065, a2_a3 = 0.001, a3_a4 = 0.0028, R = 287.00;

function getTemp(alt) {
  if (alt <= 11000) return T0 + a0_a1 * alt;
  if (alt <= 20000) return T0 + a0_a1 * 11000;
  if (alt <= 32000) return T0 + a0_a1 * 11000 + a2_a3 * (alt - 20000);
  if (alt <= 47000) return T0 + a0_a1 * 11000 + a2_a3 * 12000 + a3_a4 * (alt - 32000);
  return T0;
}

function getPres(alt) {
  if (alt <= 11000) return P0 * Math.pow(getTemp(alt) / T0, -g / (a0_a1 * R));
  if (alt <= 20000) return getPres(11000) * Math.exp(-g * (alt - 11000) / (R * getTemp(alt)));
  if (alt <= 32000) return getPres(20000) * Math.pow(getTemp(alt) / getTemp(20000), -g / (a2_a3 * R));
  if (alt <= 47000) return getPres(32000) * Math.pow(getTemp(alt) / getTemp(32000), -g / (a3_a4 * R));
  return P0;
}

function getDens(alt) {
  return getPres(alt) / (R * getTemp(alt));
}
// --- end Atmosphere functions ---


document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('altitude-input');
  const button = document.getElementById('calc-btn');
  const err = document.getElementById('error-msg');
  const tempOut = document.getElementById('temp-output');
  const presOut = document.getElementById('pres-output');
  const densOut = document.getElementById('dens-output');

  function calculateAtmosphere() {
    const alt = parseFloat(input.value);
    if (isNaN(alt)) {
      err.textContent = 'Please enter a number.';
      return;
    }
    if (alt < 0 || alt > 47000) {
      err.textContent = 'Enter altitude between 0 m and 47 000 m.';
      return;
    }
    err.textContent = '';
    const t = getTemp(alt),
          p = getPres(alt),
          d = getDens(alt);
    tempOut.textContent = `Temperature: ${t.toFixed(2)} K (${(t - 273.15).toFixed(2)} °C)`;
    const pFormatted = p.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    presOut.textContent = `Pressure: ${pFormatted} Pa`;
    densOut.textContent = `Density: ${d.toFixed(5)} kg/m³`;
  }

  // click handler
  if (button) {
    button.addEventListener('click', calculateAtmosphere);
  }

  // enter‐key handler
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        calculateAtmosphere();
      }
    });
  }
});
