import { stitchBeats } from "./edupace/ecgStitcher.js";
import { thirdDegHeartBlock } from "./edupace/ecgThirdDegree.js";
import { mobitzTypeII } from "./edupace/ecgMobitz2.js";
import { slowConduction } from "./edupace/ecgSlowConduction.js";
import { knobPresets } from "./edupace/knobPresets.js";

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

  let ticking = false;

  const updateActiveSection = () => {
    const marker = window.innerHeight * 0.35;
    let activeId = sections[0].id;

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= marker) {
        activeId = section.id;
      }
    });

    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (nearBottom) {
      activeId = sections[sections.length - 1].id;
    }

    setActive(activeId);
    ticking = false;
  };

  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateActiveSection);
    }
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  requestUpdate();

  tocLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActive(link.dataset.section);
    });
  });
};

const initAutoHideToc = () => {
  const toc = document.querySelector(".edupace-toc");
  if (!toc) {
    return;
  }

  document.body.classList.add("edupace-toc-auto");

  let hideTimer = null;
  const HIDE_DELAY = 2000;

  const scheduleHide = () => {
    if (hideTimer) {
      window.clearTimeout(hideTimer);
    }
    hideTimer = window.setTimeout(() => {
      toc.classList.add("is-hidden");
      toc.classList.remove("is-visible");
    }, HIDE_DELAY);
  };

  const showToc = () => {
    toc.classList.add("is-visible");
    toc.classList.remove("is-hidden");
    scheduleHide();
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(() => {
      showToc();
      ticking = false;
    });
  };

  toc.classList.add("is-hidden");
  window.addEventListener("scroll", onScroll, { passive: true });

  toc.addEventListener("mouseenter", () => {
    if (hideTimer) {
      window.clearTimeout(hideTimer);
    }
    toc.classList.add("is-visible");
    toc.classList.remove("is-hidden");
  });
  toc.addEventListener("mouseleave", scheduleHide);
  toc.addEventListener("focusin", () => {
    if (hideTimer) {
      window.clearTimeout(hideTimer);
    }
    toc.classList.add("is-visible");
    toc.classList.remove("is-hidden");
  });
  toc.addEventListener("focusout", scheduleHide);
};

const initEcgWidget = () => {
  const widget = document.querySelector(".ecg-widget");
  if (!widget) {
    return;
  }

  const paperCanvas = widget.querySelector("#ecgPaper");
  const monitorCanvas = widget.querySelector("#ecgMonitor");
  const scenarioButtons = Array.from(widget.querySelectorAll(".ecg-scenario"));
  const stepButtons = Array.from(widget.querySelectorAll(".ecg-step"));
  const valueMap = {
    rate: widget.querySelector('[data-value="rate"]'),
    output: widget.querySelector('[data-value="output"]'),
    sense: widget.querySelector('[data-value="sense"]'),
  };

  if (!paperCanvas || !monitorCanvas || scenarioButtons.length === 0 || stepButtons.length === 0) {
    return;
  }

  const paperCtx = paperCanvas.getContext("2d");
  const monitorCtx = monitorCanvas.getContext("2d");
  const parseDisplayValue = (key, fallback) => {
    const element = valueMap[key];
    if (!element) {
      return fallback;
    }
    const parsed = Number.parseFloat(element.textContent);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const state = {
    scenario: "nsr",
    rate: parseDisplayValue("rate", 80),
    output: parseDisplayValue("output", 6),
    sense: parseDisplayValue("sense", 5),
  };

  const precision = {
    rate: 0,
    output: 1,
    sense: 1,
  };

  const presets = {
    rate: knobPresets.rate,
    output: knobPresets.output,
    sense: knobPresets.sensitivity,
  };

  const SMALL_T = 0.04;
  const BIG_T = 0.2;
  const SMALL_A = 0.1;
  const BIG_A = 1.0;
  const VIEW_SEC = 6;
  const Y_MIN = -1;
  const Y_MAX = 1;
  const VERTICAL_SCALE = 1.6;
  const R_Y_MIN = Y_MIN * VERTICAL_SCALE;
  const R_Y_MAX = Y_MAX * VERTICAL_SCALE;
  const SWEEP_TIME_SCALE = 1.0;

  const monitorBuffer = document.createElement("canvas");
  const monitorBufferCtx = monitorBuffer.getContext("2d");
  const monitorScreen = document.createElement("canvas");
  const monitorScreenCtx = monitorScreen.getContext("2d");

  let stripLive = null;
  let sweepX = 0;
  let prevSweepX = 0;
  let lastTs = null;

  const formatValue = (key, value) => {
    const digits = precision[key] ?? 0;
    return value.toFixed(digits);
  };

  const updateLabels = () => {
    valueMap.rate.textContent = `${formatValue("rate", state.rate)} bpm`;
    valueMap.rate.dataset.currentValue = String(state.rate);
    valueMap.output.textContent = `${formatValue("output", state.output)} mA`;
    valueMap.output.dataset.currentValue = String(state.output);
    valueMap.sense.textContent = `${formatValue("sense", state.sense)} mV`;
    valueMap.sense.dataset.currentValue = String(state.sense);
  };

  const buildWaveform = () => {
    const baseConfig = {
      patientHR: 40,
      sensitivity: state.sense,
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
      stripLive = null;
      return;
    }

    stripLive = { x, y };
    renderPaper();
    rebuildMonitorBuffer();
    resetSweep();
  };

  const setCanvasSize = (target, cssW, cssH) => {
    const ratio = window.devicePixelRatio || 1;
    target.style.width = `${cssW}px`;
    target.style.height = `${cssH}px`;
    target.width = Math.floor(cssW * ratio);
    target.height = Math.floor(cssH * ratio);
    const targetCtx = target.getContext("2d");
    targetCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const resizeCanvas = () => {
    const paperWidth = paperCanvas.clientWidth;
    const paperHeight = paperCanvas.clientHeight;
    const monitorWidth = monitorCanvas.clientWidth;
    const monitorHeight = monitorCanvas.clientHeight;
    if (!paperWidth || !paperHeight || !monitorWidth || !monitorHeight) {
      return;
    }
    setCanvasSize(paperCanvas, paperWidth, paperHeight);
    setCanvasSize(monitorCanvas, monitorWidth, monitorHeight);
    setCanvasSize(monitorBuffer, monitorWidth, monitorHeight);
    setCanvasSize(monitorScreen, monitorWidth, monitorHeight);
    renderPaper();
    rebuildMonitorBuffer();
    resetSweep();
  };

  const lowerBound = (arr, val) => {
    let lo = 0;
    let hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (arr[mid] < val) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };

  const drawWaveWindowToSize = (targetCtx, width, height, strip, tLeft, tRight, strokeStyle) => {
    const X = (t) => ((t - tLeft) / (tRight - tLeft)) * width;
    const Y = (v) => height - ((v - R_Y_MIN) / (R_Y_MAX - R_Y_MIN)) * height;

    const i0 = lowerBound(strip.x, tLeft);
    const i1 = lowerBound(strip.x, tRight);
    if (i1 - i0 < 2) return;

    targetCtx.beginPath();
    targetCtx.strokeStyle = strokeStyle;
    targetCtx.lineWidth = 2;
    targetCtx.lineJoin = "round";
    targetCtx.lineCap = "round";
    targetCtx.moveTo(X(strip.x[i0]), Y(strip.y[i0]));
    for (let i = i0 + 1; i < i1; i += 1) {
      targetCtx.lineTo(X(strip.x[i]), Y(strip.y[i]));
    }
    targetCtx.stroke();
  };

  const drawPaperGrid = (width, height) => {
    paperCtx.clearRect(0, 0, width, height);
    paperCtx.fillStyle = "#ffffff";
    paperCtx.fillRect(0, 0, width, height);

    const X = (t) => (t / VIEW_SEC) * width;
    const Y = (v) => height - ((v - R_Y_MIN) / (R_Y_MAX - R_Y_MIN)) * height;

    for (let t = 0; t <= VIEW_SEC + 1e-9; t += SMALL_T) {
      const isBig = Math.abs(t / BIG_T - Math.round(t / BIG_T)) < 1e-6;
      paperCtx.beginPath();
      paperCtx.strokeStyle = isBig ? "rgba(255,0,0,0.65)" : "rgba(255,0,0,0.25)";
      paperCtx.lineWidth = isBig ? 1.2 : 0.8;
      paperCtx.moveTo(X(t), 0);
      paperCtx.lineTo(X(t), height);
      paperCtx.stroke();
    }

    for (let v = R_Y_MIN; v <= R_Y_MAX + 1e-9; v += SMALL_A) {
      const isBig = Math.abs(v / BIG_A - Math.round(v / BIG_A)) < 1e-6;
      paperCtx.beginPath();
      paperCtx.strokeStyle = isBig ? "rgba(255,0,0,0.65)" : "rgba(255,0,0,0.25)";
      paperCtx.lineWidth = isBig ? 1.2 : 0.8;
      paperCtx.moveTo(0, Y(v));
      paperCtx.lineTo(width, Y(v));
      paperCtx.stroke();
    }
  };

  const drawMonitorGrid = (targetCtx, width, height) => {
    targetCtx.clearRect(0, 0, width, height);
    targetCtx.fillStyle = "#000000";
    targetCtx.fillRect(0, 0, width, height);

    const X = (t) => (t / VIEW_SEC) * width;
    const Y = (v) => height - ((v - R_Y_MIN) / (R_Y_MAX - R_Y_MIN)) * height;

    for (let t = 0; t < VIEW_SEC - 1e-9; t += SMALL_T) {
      const isBig = Math.abs(t / BIG_T - Math.round(t / BIG_T)) < 1e-6;
      targetCtx.beginPath();
      targetCtx.strokeStyle = isBig ? "rgba(51,255,102,0.25)" : "rgba(51,255,102,0.12)";
      targetCtx.lineWidth = isBig ? 1.1 : 0.8;
      targetCtx.moveTo(X(t), 0);
      targetCtx.lineTo(X(t), height);
      targetCtx.stroke();
    }

    for (let v = R_Y_MIN + SMALL_A; v < R_Y_MAX - 1e-9; v += SMALL_A) {
      const isBig = Math.abs(v / BIG_A - Math.round(v / BIG_A)) < 1e-6;
      targetCtx.beginPath();
      targetCtx.strokeStyle = isBig ? "rgba(51,255,102,0.25)" : "rgba(51,255,102,0.12)";
      targetCtx.lineWidth = isBig ? 1.1 : 0.8;
      targetCtx.moveTo(0, Y(v));
      targetCtx.lineTo(width, Y(v));
      targetCtx.stroke();
    }
  };

  const renderPaper = () => {
    const width = paperCanvas.clientWidth;
    const height = paperCanvas.clientHeight;
    if (!stripLive || !stripLive.x.length || !width || !height) {
      return;
    }

    drawPaperGrid(width, height);
    drawWaveWindowToSize(paperCtx, width, height, stripLive, 0, VIEW_SEC, "#111827");
  };

  const rebuildMonitorBuffer = () => {
    const width = monitorCanvas.clientWidth;
    const height = monitorCanvas.clientHeight;
    if (!stripLive || !stripLive.x.length || !width || !height) {
      return;
    }

    drawMonitorGrid(monitorBufferCtx, width, height);
    drawWaveWindowToSize(monitorBufferCtx, width, height, stripLive, 0, VIEW_SEC, "#33ff66");

    drawMonitorGrid(monitorScreenCtx, width, height);
  };

  const overwriteSliceOnScreen = (x0, x1) => {
    const width = monitorCanvas.clientWidth;
    const height = monitorCanvas.clientHeight;
    if (x1 <= x0) return;

    const ratio = window.devicePixelRatio || 1;
    const sx = Math.floor(x0 * ratio);
    const sw = Math.ceil((x1 - x0) * ratio);
    const sy = 0;
    const sh = Math.ceil(height * ratio);

    monitorScreenCtx.drawImage(
      monitorBuffer,
      sx,
      sy,
      sw,
      sh,
      x0,
      0,
      x1 - x0,
      height
    );
  };

  const resetSweep = () => {
    sweepX = 0;
    prevSweepX = 0;
    lastTs = null;
    if (monitorCanvas.clientWidth && monitorCanvas.clientHeight) {
      drawMonitorGrid(monitorScreenCtx, monitorCanvas.clientWidth, monitorCanvas.clientHeight);
    }
  };

  const stepSweep = (dt) => {
    const width = monitorCanvas.clientWidth;
    const pxPerSec = (width / VIEW_SEC) * SWEEP_TIME_SCALE;
    prevSweepX = sweepX;
    sweepX += pxPerSec * dt;
    if (sweepX >= width) sweepX %= width;

    if (sweepX >= prevSweepX) {
      overwriteSliceOnScreen(prevSweepX, sweepX);
    } else {
      overwriteSliceOnScreen(prevSweepX, width);
      overwriteSliceOnScreen(0, sweepX);
    }
  };

  const renderMonitor = () => {
    const width = monitorCanvas.clientWidth;
    const height = monitorCanvas.clientHeight;
    monitorCtx.clearRect(0, 0, width, height);
    monitorCtx.drawImage(monitorScreen, 0, 0, width, height);

    monitorCtx.strokeStyle = "rgba(51,255,102,0.95)";
    monitorCtx.lineWidth = 2;
    monitorCtx.beginPath();
    monitorCtx.moveTo(sweepX, 0);
    monitorCtx.lineTo(sweepX, height);
    monitorCtx.stroke();

    monitorCtx.strokeStyle = "rgba(51,255,102,0.18)";
    monitorCtx.lineWidth = 10;
    monitorCtx.beginPath();
    monitorCtx.moveTo(sweepX, 0);
    monitorCtx.lineTo(sweepX, height);
    monitorCtx.stroke();
  };

  const animate = (timestamp) => {
    if (!stripLive) {
      requestAnimationFrame(animate);
      return;
    }

    if (lastTs == null) lastTs = timestamp;
    const dt = (timestamp - lastTs) / 1000;
    lastTs = timestamp;

    stepSweep(dt);
    renderMonitor();
    requestAnimationFrame(animate);
  };

  const findClosestIndex = (values, current) => {
    let closestIndex = 0;
    let closestDiff = Math.abs(values[0] - current);
    for (let i = 1; i < values.length; i += 1) {
      const diff = Math.abs(values[i] - current);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = i;
      }
    }
    return closestIndex;
  };

  const stepPreset = (key, direction) => {
    const values = presets[key];
    if (!values || values.length === 0) {
      return state[key];
    }
    const current = state[key];
    const currentIndex = findClosestIndex(values, current);
    const nextIndex = Math.min(
      values.length - 1,
      Math.max(0, currentIndex + direction)
    );
    return values[nextIndex];
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

  const handleStep = (button) => {
    const target = button.dataset.target;
    const step = parseInt(button.dataset.step, 10);
    if (!target || Number.isNaN(step) || !presets[target]) {
      return;
    }
    const nextValue = stepPreset(target, step);
    if (nextValue === state[target]) {
      return;
    }
    state[target] = nextValue;
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

const initPhotoToggles = () => {
  const toggles = Array.from(document.querySelectorAll("[data-photo-toggle]"));
  if (toggles.length === 0) {
    return;
  }

  toggles.forEach((toggle) => {
    const image = toggle.querySelector("img");
    const caption = toggle.querySelector(".photo-toggle__caption");
    const buttons = Array.from(toggle.querySelectorAll("[data-photo-src]"));
    if (!image || !caption || buttons.length === 0) {
      return;
    }

    let activeIndex = buttons.findIndex((button) => button.classList.contains("is-active"));
    if (activeIndex < 0) {
      activeIndex = 0;
    }

    let timer = null;

    const applyButtonState = (index) => {
      const button = buttons[index];
      if (!button) {
        return;
      }
      const nextSrc = button.dataset.photoSrc;
      const nextAlt = button.dataset.photoAlt;
      const nextCaption = button.dataset.photoCaption;

      if (nextSrc) {
        image.src = nextSrc;
      }
      if (nextAlt) {
        image.alt = nextAlt;
      }
      if (nextCaption) {
        caption.textContent = nextCaption;
      }

      buttons.forEach((item, itemIndex) => {
        const isActive = itemIndex === index;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      activeIndex = index;
    };

    const startTimer = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(() => {
        const nextIndex = (activeIndex + 1) % buttons.length;
        applyButtonState(nextIndex);
      }, 6500);
    };

    buttons.forEach((button, index) => {
      button.setAttribute("aria-pressed", button.classList.contains("is-active") ? "true" : "false");
      button.addEventListener("click", () => {
        applyButtonState(index);
        startTimer();
      });
    });

    applyButtonState(activeIndex);
    startTimer();
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initSectionObserver();
  initAutoHideToc();
  initEcgWidget();
  initPhotoToggles();
});
