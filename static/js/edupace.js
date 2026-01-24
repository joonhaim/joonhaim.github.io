import { stitchBeats } from "./edupace/ecgStitcher.js";
import { thirdDegHeartBlock } from "./edupace/ecgThirdDegree.js";
import { mobitzTypeII } from "./edupace/ecgMobitz2.js";
import { slowConduction } from "./edupace/ecgSlowConduction.js";

const initSectionObserver = () => {
  const tocLinks = Array.from(document.querySelectorAll(".edupace-toc__link"));
  if (tocLinks.length === 0) {
    return;
  }

  const sectionMap = new Map(
    tocLinks.map((link) => [link, document.getElementById(link.dataset.section)])
  );

  const setActive = (activeId) => {
    tocLinks.forEach((link) => {
      const isActive = link.dataset.section === activeId;
      link.classList.toggle("is-active", isActive);
      link.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const sections = Array.from(sectionMap.values()).filter(Boolean);
  if (sections.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    {
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0.2,
    }
  );

  sections.forEach((section) => observer.observe(section));

  tocLinks.forEach((link) => {
    link.addEventListener("click", () => setActive(link.dataset.section));
  });
};

const initEcgWidget = () => {
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
  const state = {
    scenario: "nsr",
    rate: 80,
    output: 6,
    sense: 5,
  };

  const limits = {
    rate: { min: 30, max: 140, step: 1, unit: "bpm" },
    output: { min: 1, max: 10, step: 1, unit: "mA" },
    sense: { min: 1, max: 10, step: 1, unit: "mV" },
  };

  const waveformState = {
    samples: new Float32Array(0),
    duration: 2.8,
    window: 2.6,
    lastUpdate: 0,
  };

  const updateLabels = () => {
    valueMap.rate.textContent = `${state.rate} ${limits.rate.unit}`;
    valueMap.output.textContent = `${state.output} ${limits.output.unit}`;
    valueMap.sense.textContent = `${state.sense} ${limits.sense.unit}`;
  };

  const buildWaveform = () => {
    const baseConfig = {
      patientHR: state.rate,
      sensitivity: state.sense / 10,
      rate: state.rate,
      output: state.output,
      asynchronous: false,
      iterations: 22,
    };

    let result;
    switch (state.scenario) {
      case "third":
        result = thirdDegHeartBlock(baseConfig);
        break;
      case "mobitz":
        result = mobitzTypeII(baseConfig);
        break;
      case "slow":
        result = slowConduction(baseConfig);
        break;
      case "nsr":
      default:
        result = stitchBeats(baseConfig);
        break;
    }

    const { x, y } = result;
    if (!x || !y || x.length === 0 || y.length === 0) {
      return;
    }

    const maxX = Math.max(...x);
    const duration = Math.max(2.6, maxX || 2.6);
    const sampleCount = Math.max(1500, Math.floor(duration * 600));
    const samples = new Float32Array(sampleCount);

    let cursor = 0;
    for (let i = 0; i < sampleCount; i++) {
      const t = (i / (sampleCount - 1)) * duration;
      while (cursor < x.length - 2 && x[cursor + 1] < t) {
        cursor += 1;
      }
      const t0 = x[cursor];
      const t1 = x[cursor + 1] ?? t0;
      const y0 = y[cursor];
      const y1 = y[cursor + 1] ?? y0;
      const ratio = t1 === t0 ? 0 : (t - t0) / (t1 - t0);
      samples[i] = y0 + (y1 - y0) * ratio;
    }

    waveformState.samples = samples;
    waveformState.duration = duration;
  };

  const resizeCanvas = () => {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
  };

  const drawGrid = (width, height) => {
    ctx.strokeStyle = "rgba(51, 255, 102, 0.12)";
    ctx.lineWidth = 1;
    const minor = 24;
    for (let x = 0; x <= width; x += minor) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += minor) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(51, 255, 102, 0.2)";
    ctx.lineWidth = 1.2;
    const major = minor * 5;
    for (let x = 0; x <= width; x += major) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += major) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const sampleAt = (time) => {
    const { samples, duration } = waveformState;
    if (!samples.length || duration <= 0) {
      return 0;
    }
    const normalized = ((time % duration) + duration) % duration;
    const idx = Math.floor((normalized / duration) * (samples.length - 1));
    return samples[idx] ?? 0;
  };

  const drawWaveform = (timestamp) => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) {
      return;
    }

    ctx.clearRect(0, 0, width, height);
    drawGrid(width, height);

    const baseline = height * 0.58;
    const amplitude = height * 0.32;
    const speed = 0.9;
    const windowDuration = waveformState.window;
    const startTime = (timestamp / 1000) * speed;

    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(51, 255, 102, 0.9)";
    ctx.shadowColor = "rgba(51, 255, 102, 0.6)";
    ctx.shadowBlur = 8;
    ctx.beginPath();

    for (let x = 0; x <= width; x++) {
      const t = startTime + (x / width) * windowDuration;
      const y = baseline - sampleAt(t) * amplitude;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
    ctx.restore();
  };

  const animate = (timestamp) => {
    if (!waveformState.lastUpdate || timestamp - waveformState.lastUpdate > 16) {
      drawWaveform(timestamp);
      waveformState.lastUpdate = timestamp;
    }
    requestAnimationFrame(animate);
  };

  const handleScenarioChange = (button) => {
    const scenario = button.dataset.scenario;
    if (!scenario) {
      return;
    }
    state.scenario = scenario;
    scenarioButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    buildWaveform();
    updateLabels();
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const handleStep = (button) => {
    const target = button.dataset.target;
    const step = parseInt(button.dataset.step, 10);
    if (!target || Number.isNaN(step) || !limits[target]) {
      return;
    }
    const { min, max } = limits[target];
    state[target] = clamp(state[target] + step, min, max);
    updateLabels();
    buildWaveform();
  };

  scenarioButtons.forEach((button) => {
    button.addEventListener("click", () => handleScenarioChange(button));
  });

  stepButtons.forEach((button) => {
    button.addEventListener("click", () => handleStep(button));
  });

  updateLabels();
  resizeCanvas();
  buildWaveform();
  window.addEventListener("resize", () => {
    resizeCanvas();
  });
  requestAnimationFrame(animate);
};

document.addEventListener("DOMContentLoaded", () => {
  initSectionObserver();
  initEcgWidget();
});
