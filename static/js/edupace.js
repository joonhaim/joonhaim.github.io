document.addEventListener("DOMContentLoaded", () => {
  const widget = document.querySelector(".ecg-widget");
  if (!widget) {
    return;
  }

  const canvas = widget.querySelector("#ecgCanvas");
  const scenarioButtons = Array.from(widget.querySelectorAll(".ecg-scenario"));
  const stepButtons = Array.from(widget.querySelectorAll(".ecg-step"));
  const valueMap = {
    rate: widget.querySelector('[data-value="rate"]'),
    output: widget.querySelector('[data-value="output"]'),
    sense: widget.querySelector('[data-value="sense"]'),
  };

  if (!canvas || scenarioButtons.length === 0 || stepButtons.length === 0) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const scenarios = {
    nsr: { baseRate: 75, amplitude: 1, irregularity: 0.02, dropEvery: 0 },
    third: { baseRate: 40, amplitude: 0.85, irregularity: 0.1, dropEvery: 0 },
    mobitz: { baseRate: 60, amplitude: 0.95, irregularity: 0.06, dropEvery: 3 },
    slow: { baseRate: 52, amplitude: 0.8, irregularity: 0.03, dropEvery: 0 },
  };
  const limits = {
    rate: { min: 30, max: 140, step: 1, unit: "bpm" },
    output: { min: 1, max: 10, step: 1, unit: "mA" },
    sense: { min: 1, max: 10, step: 1, unit: "mV" },
  };
  const state = {
    scenario: "nsr",
    rate: 80,
    output: 6,
    sense: 5,
  };

  const updateLabels = () => {
    valueMap.rate.textContent = `${state.rate} ${limits.rate.unit}`;
    valueMap.output.textContent = `${state.output} ${limits.output.unit}`;
    valueMap.sense.textContent = `${state.sense} ${limits.sense.unit}`;
  };

  const resizeCanvas = () => {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    drawWaveform();
  };

  const gaussian = (x, center, width, amplitude) => {
    return amplitude * Math.exp(-Math.pow((x - center) / width, 2));
  };

  const ecgShape = (phase) => {
    const p = gaussian(phase, 0.15, 0.035, 0.22);
    const q = gaussian(phase, 0.3, 0.015, -0.3);
    const r = gaussian(phase, 0.32, 0.012, 1.05);
    const s = gaussian(phase, 0.35, 0.02, -0.35);
    const t = gaussian(phase, 0.6, 0.07, 0.35);
    return p + q + r + s + t;
  };

  const drawWaveform = () => {
    const scenarioKey = state.scenario;
    const scenario = scenarios[scenarioKey];
    const rateValue = state.rate;
    const outputValue = state.output;
    const senseValue = state.sense;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const baseline = height * 0.55;
    const beatRate = scenario.baseRate + (rateValue - 70) * 0.6;
    const cycles = (beatRate / 60) * 2.4;
    const amplitude = scenario.amplitude * (0.6 + outputValue / 12);
    const noise = (11 - senseValue) * 0.0015;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= width; x += width / 6) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += height / 4) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x <= width; x++) {
      const t = (x / width) * cycles;
      const beatIndex = Math.floor(t);
      const phase = t % 1;
      const isDropped = scenario.dropEvery > 0 && beatIndex % scenario.dropEvery === scenario.dropEvery - 1;
      const irregularOffset = Math.sin(phase * Math.PI * 2) * scenario.irregularity;
      const baseValue = isDropped ? 0.02 : ecgShape(phase + irregularOffset);
      const jitter = (Math.random() - 0.5) * noise;
      const y = baseline - (baseValue + jitter) * amplitude * height * 0.32;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 1.5;
    for (let beat = 0; beat < Math.ceil(cycles); beat++) {
      const isDropped = scenario.dropEvery > 0 && beat % scenario.dropEvery === scenario.dropEvery - 1;
      if (isDropped) {
        continue;
      }
      const spikeX = ((beat + 0.28) / cycles) * width;
      const spikeHeight = (outputValue / 10) * height * 0.25;
      ctx.beginPath();
      ctx.moveTo(spikeX, baseline - spikeHeight);
      ctx.lineTo(spikeX, baseline + spikeHeight * 0.15);
      ctx.stroke();
    }
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const handleScenarioChange = (button) => {
    const scenario = button.dataset.scenario;
    if (!scenario || !scenarios[scenario]) {
      return;
    }
    state.scenario = scenario;
    scenarioButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    updateLabels();
    drawWaveform();
  };

  const handleStep = (button) => {
    const target = button.dataset.target;
    const step = parseInt(button.dataset.step, 10);
    if (!target || Number.isNaN(step) || !limits[target]) {
      return;
    }
    const { min, max } = limits[target];
    state[target] = clamp(state[target] + step, min, max);
    updateLabels();
    drawWaveform();
  };

  scenarioButtons.forEach((button) => {
    button.addEventListener("click", () => handleScenarioChange(button));
  });

  stepButtons.forEach((button) => {
    button.addEventListener("click", () => handleStep(button));
  });

  updateLabels();
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
});
