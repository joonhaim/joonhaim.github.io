document.addEventListener("DOMContentLoaded", () => {
  const widget = document.querySelector(".ecg-widget");
  if (!widget) {
    return;
  }

  const canvas = widget.querySelector("#ecgCanvas");
  const scenarioSelect = widget.querySelector("#ecgScenario");
  const rateInput = widget.querySelector("#ecgRate");
  const outputInput = widget.querySelector("#ecgOutput");
  const senseInput = widget.querySelector("#ecgSense");
  const valueMap = {
    rate: widget.querySelector('[data-value="rate"]'),
    output: widget.querySelector('[data-value="output"]'),
    sense: widget.querySelector('[data-value="sense"]'),
  };

  if (!canvas || !scenarioSelect || !rateInput || !outputInput || !senseInput) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const scenarios = {
    nsr: { baseRate: 75, amplitude: 1, irregularity: 0.02, dropEvery: 0 },
    third: { baseRate: 40, amplitude: 0.85, irregularity: 0.1, dropEvery: 0 },
    mobitz: { baseRate: 60, amplitude: 0.95, irregularity: 0.06, dropEvery: 3 },
    slow: { baseRate: 52, amplitude: 0.8, irregularity: 0.03, dropEvery: 0 },
  };

  const updateLabels = () => {
    valueMap.rate.textContent = `${rateInput.value} bpm`;
    valueMap.output.textContent = `${outputInput.value} mA`;
    valueMap.sense.textContent = `${senseInput.value} mV`;
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
    const scenarioKey = scenarioSelect.value;
    const scenario = scenarios[scenarioKey];
    const rateValue = parseFloat(rateInput.value);
    const outputValue = parseFloat(outputInput.value);
    const senseValue = parseFloat(senseInput.value);
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

  const handleInput = () => {
    updateLabels();
    drawWaveform();
  };

  [scenarioSelect, rateInput, outputInput, senseInput].forEach((control) => {
    control.addEventListener("input", handleInput);
    control.addEventListener("change", handleInput);
  });

  updateLabels();
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
});
