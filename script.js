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
  // Home‐page mini‐widget
  const homeBtn = document.getElementById('home-calc-btn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      const alt = parseFloat(document.getElementById('home-altitude').value);
      const err = document.getElementById('home-error');
      if (isNaN(alt)) return err.textContent = 'Please enter a number.';
      if (alt < 0 || alt > 47000) return err.textContent = 'Enter altitude between 0 m and 47 000 m.';
      err.textContent = '';
      document.getElementById('home-temp').textContent = `Temp: ${getTemp(alt).toFixed(2)} K`;
      document.getElementById('home-pres').textContent = `Pres: ${getPres(alt).toFixed(2)} Pa`;
      document.getElementById('home-dens').textContent = `Dens: ${getDens(alt).toExponential(5)} kg/m³`;
    });
  }

  // Full‐page widget
  const fullBtn = document.getElementById('calc-btn');
  if (fullBtn) {
    fullBtn.addEventListener('click', () => {
      const alt = parseFloat(document.getElementById('altitude-input').value);
      const err = document.getElementById('error-msg');
      if (isNaN(alt)) return err.textContent = 'Please enter a number.';
      if (alt < 0 || alt > 47000) return err.textContent = 'Enter altitude between 0 m and 47 000 m.';
      err.textContent = '';
      const t = getTemp(alt), p = getPres(alt), d = getDens(alt);
      document.getElementById('temp-output').textContent =
        `Temperature: ${t.toFixed(2)} K (${(t - 273.15).toFixed(2)} °C)`;
      document.getElementById('pres-output').textContent = `Pressure: ${p.toFixed(2)} Pa`;
      document.getElementById('dens-output').textContent = `Density: ${d.toExponential(5)} kg/m³`;
    });
  }
});
