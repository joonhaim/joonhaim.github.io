const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function comb(n, k) {
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - (k - i))) / i;
  return r;
}

function bernstein(n, i, t) {
  return comb(n, i) * (t ** i) * ((1 - t) ** (n - i));
}

function ensureMinPoints(pts) {
  if (pts.length >= 2) return pts;
  const p = pts[0];
  return [p, { ...p, x: p.x + 1e-6 }];
}

function R(points, t) {
  const n = points.length - 1;
  let numX = 0, numY = 0, den = 0;

  for (let i = 0; i <= n; i++) {
    const B = bernstein(n, i, t);
    const { w, x, y } = points[i];
    numX += B * w * x;
    numY += B * w * y;
    den  += B * w;
  }
  return { x: numX / den, y: numY / den, t };
}

function sampleSegment(points, N = 240) {
  const pts = ensureMinPoints(points);
  const out = [];
  for (let j = 0; j <= N; j++) out.push(R(pts, j / N));
  return out;
}

function baselineSegment(x0, x1, y = 0) {
  return [{ w: 1, x: x0, y }, { w: 1, x: x1, y }];
}

function toObjPoints(arr) {
  return arr.map(([w, x, y]) => ({ w, x, y }));
}

const POINTS = {
  normal: {
    P: [
      [1,0.0,0],[1.5,0.132366,0.03],[1,0.264732,0.12],[1,0.397099,0.3],[1.5,1.058929,0.9],
      [3,1.72076,1.3],[1,2.382591,0.8],[1,2.58114,0.5],[1,2.77969,0.16],[1.5,2.912056,0.04],[1,3.044422,0]
    ],
    preQRS: [
      [1,3.21088,0],[1,3.37634,0],[1,3.54180,0],[1,3.70725,0],[1,3.87271,0],[1,4.03817,0],[1,4.36909,0]
    ],
    QRS: [
      [10,4.36909,0],[10,4.56909,0],[100,4.66909,-0.05],[1,4.74909,-0.2],[1,4.96909,-0.65],
      [700,5.46909,-1.5],[10,5.61909,0],[1,5.76909,2.5],[10,5.96909,5.5],[1000,6.36909,11],
      [10,6.71909,5.5],[1,6.86909,2.5],[1,7.01909,0],[700,7.21909,-3.3],[1,7.71909,-1.5],
      [10,8.06909,-0.1],[100,8.16909,-0.03],[10,8.26909,0]
    ],
    preT: [
      [1,8.36909,0],[1,8.86909,0],[1,9.11909,0],[1,9.36909,0],[1,9.86909,0],[1,10.36909,0],[1,10.86909,0]
    ],
    T: [
      [1,11.26909,0],[5,11.36909,0],[2,11.41909,0.04],[1,11.56909,0.1],[1,12.36909,1],
      [2,13.36909,1.9],[10,13.96909,2.1],[2,15.36909,0.55],[1,15.56909,0.15],[5,15.66909,0.05],[1,15.78909,0]
    ],
    endX: 15.78909
  },

  vpaced: {
    P: [
      [1,0.0,0.0],[1.5,0.132366,0.045],[1,0.264732,0.18],[1,0.397099,0.45],[1.5,1.058929,1.35],[3,1.72076,1.95],
      [1,2.382591,1.2],[1,2.58114,0.75],[1,2.77969,0.24],[1.5,2.912056,0.06],[1,3.044422,0.0]
    ],
    spike: [
      [1,4.286229,0],[10,4.380709,14],[1,4.475189,0]
    ],
    QRS: [
      [2,4.931608,-0.8],[1,5.395389,-3.1],[5,5.763607,-7.1],[5,6.046174,-7.6],[1,6.315471,-11.5],
      [10,6.827175,-16.8],[1,7.243828,-14.6],[1,7.703432,-10.5],[1,8.162635,-6.4],[1,8.621839,-3],[10,9.179848,0]
    ],
    T: [
      [10,9.189848,0],[1,9.379848,0.4],[1,9.579848,0.75],[1,10.079848,1.8],[1,10.579848,2.75],[1,11.079848,3.6],
      [1,11.579848,4.15],[5,12.079848,4.75],[5,12.579848,5.4],[15,13.029848,5.7],[5,13.579848,5.3],[5,14.079848,4.4],
      [1,14.579848,3],[1,15.079848,1.6],[1,15.579848,0.5],[1,15.979848,0]
    ],
    endX: 15.979848
  },

  mobitzPonly: {
    Ponly: [
      [1,0,0],[1.5,0.2,0.03],[1,0.4,0.12],[1,0.6,0.3],[1.5,1.6,0.9],[3,2.6,1.3],
      [1,3.6,0.8],[1,3.9,0.5],[1,4.2,0.16],[1.5,4.4,0.04],[1,4.6,0]
    ],
    endX: 4.6
  }
};

function buildWaveform(key) {
  if (key === "Normal") {
    const n = POINTS.normal;
    return {
      name: "Normal",
      segments: [
        { name: "P wave",      points: toObjPoints(n.P) },
        { name: "PR segment",  points: toObjPoints(n.preQRS) },
        { name: "QRS complex", points: toObjPoints(n.QRS) },
        { name: "ST segment",  points: toObjPoints(n.preT) },
        { name: "T wave",      points: toObjPoints(n.T) },
      ]
    };
  }

  if (key === "Ventricular pacing") {
    const v = POINTS.vpaced;
    const pEnd = v.P[v.P.length - 1][1];
    const spikeStart = v.spike[0][1];
    const spikeEnd = v.spike[v.spike.length - 1][1];
    const qrsStart = v.QRS[0][1];

    return {
      name: "Ventricular pacing",
      segments: [
        { name: "P wave",        points: toObjPoints(v.P) },
        { name: "Baseline",      points: baselineSegment(pEnd, spikeStart, 0) },
        { name: "Pacing spike",  points: toObjPoints(v.spike) },
        { name: "Baseline",      points: baselineSegment(spikeEnd, qrsStart, 0) },
        { name: "Wide QRS",      points: toObjPoints(v.QRS) },
        { name: "T wave",        points: toObjPoints(v.T) },
      ]
    };
  }

  if (key === "Mobitz II") {
    const n = POINTS.normal;
    const pOnly = POINTS.mobitzPonly;

    const beatLen = n.endX;
    const gap = 0.9;
    const dropOffset = beatLen + gap;

    const droppedP = toObjPoints(pOnly.Ponly).map(p => ({ ...p, x: p.x + dropOffset }));
    const baseLine = baselineSegment(dropOffset + pOnly.endX, dropOffset + beatLen, 0);

    return {
      name: "Mobitz II",
      segments: [
        { name: "Beat 1: P wave",      points: toObjPoints(n.P) },
        { name: "Beat 1: PR segment",  points: toObjPoints(n.preQRS) },
        { name: "Beat 1: QRS complex", points: toObjPoints(n.QRS) },
        { name: "Beat 1: ST segment",  points: toObjPoints(n.preT) },
        { name: "Beat 1: T wave",      points: toObjPoints(n.T) },
        { name: "Beat 2: P wave",      points: droppedP },
        { name: "Beat 2: Baseline",    points: baseLine },
      ]
    };
  }

  return buildWaveform("Normal");
}

function buildPolyline(wave) {
  const segSamples = wave.segments.map(seg => sampleSegment(seg.points, 240));
  const full = [];
  segSamples.forEach((arr, segIdx) => {
    arr.forEach((p, i) => {
      if (segIdx > 0 && i === 0) return;
      full.push({ ...p, segIdx });
    });
  });

  // enforce monotonic x (robust for binary search)
  for (let i = 1; i < full.length; i++) {
    if (full[i].x <= full[i - 1].x) full[i].x = full[i - 1].x + 1e-6;
  }

  return { full };
}

function bounds(pts) {
  let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
  for (const p of pts) {
    xmin = Math.min(xmin, p.x); xmax = Math.max(xmax, p.x);
    ymin = Math.min(ymin, p.y); ymax = Math.max(ymax, p.y);
  }
  const px = (xmax - xmin) * 0.06 || 1;
  const py = (ymax - ymin) * 0.14 || 1;
  return { xmin: xmin - px, xmax: xmax + px, ymin: ymin - py, ymax: ymax + py };
}

function createMapper(getSize, B) {
  return (x, y) => {
    const { W, H } = getSize();
    const xRange = (B.xmax - B.xmin) || 1;
    const yRange = (B.ymax - B.ymin) || 1;

    const pad = 12;
    const sx = (W - 2 * pad) / xRange;
    const sy = (H - 2 * pad) / yRange;

    // uniform scale -> less stretched horizontally
    const s = Math.min(sx, sy) * 0.98;

    const usedW = xRange * s;
    const usedH = yRange * s;
    const x0 = (W - usedW) / 2;
    const y0 = (H - usedH) / 2;

    const px = x0 + (x - B.xmin) * s;
    const py = (H - y0) - (y - B.ymin) * s;

    return { px, py, W, H };
  };
}

function drawGrid(ctx, W, H) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);

  const minor = 16;
  const major = minor * 5;

  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;

  for (let x = 0; x <= W; x += minor) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += minor) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = "#d1d5db";
  for (let x = 0; x <= W; x += major) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += major) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();
}

function pointAtX(full, x) {
  let lo = 0, hi = full.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (full[mid].x < x) lo = mid + 1;
    else hi = mid;
  }
  const i = Math.max(1, lo);
  const a = full[i - 1], b = full[i];
  const span = (b.x - a.x) || 1e-9;
  const u = (x - a.x) / span;

  return {
    x: a.x + (b.x - a.x) * u,
    y: a.y + (b.y - a.y) * u,
    segIdx: (u < 0.5 ? a.segIdx : b.segIdx),
    tApprox: (u < 0.5 ? a.t : b.t)
  };
}

function drawScene({ ctx, map, wave, poly, B, xAnim, segChip, degChip, tChip }) {
  const size = map(B.xmin, B.ymin);
  const W = size.W, H = size.H;

  const cur = pointAtX(poly.full, xAnim);
  const seg = wave.segments[cur.segIdx] || wave.segments[0];

  segChip.textContent = `Segment: ${seg?.name ?? "—"}`;
  degChip.textContent = `n = ${Math.max(1, (seg?.points?.length ?? 2)) - 1}`;
  tChip.textContent = `t = ${cur.tApprox.toFixed(2)}`;

  drawGrid(ctx, W, H);

  // main curve
  ctx.save();
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2.3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  poly.full.forEach((p, i) => {
    const m = map(p.x, p.y);
    if (i === 0) ctx.moveTo(m.px, m.py);
    else ctx.lineTo(m.px, m.py);
  });
  ctx.stroke();
  ctx.restore();

  // control points (all)
  ctx.save();
  wave.segments.forEach((s, segIdx) => {
    s.points.forEach(p => {
      const m = map(p.x, p.y);
      const isActive = segIdx === cur.segIdx;

      const lw = Math.log10(Math.max(1, p.w));
      const r = (isActive ? 4.2 : 3.2) + 2.2 * Math.min(3, lw) / 3;

      ctx.globalAlpha = isActive ? 0.55 : 0.18;
      ctx.fillStyle   = isActive ? "rgba(218,41,28,0.18)" : "rgba(17,24,39,0.12)";
      ctx.strokeStyle = isActive ? "rgba(218,41,28,0.42)" : "rgba(17,24,39,0.16)";
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.arc(m.px, m.py, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  });
  ctx.restore();

  // active control polygon
  const activePts = ensureMinPoints(wave.segments[cur.segIdx].points);
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "rgba(218,41,28,0.9)";
  ctx.lineWidth = 1.8;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  activePts.forEach((p, i) => {
    const m = map(p.x, p.y);
    if (i === 0) ctx.moveTo(m.px, m.py);
    else ctx.lineTo(m.px, m.py);
  });
  ctx.stroke();
  ctx.restore();

  // moving dot
  const md = map(cur.x, cur.y);
  ctx.save();
  ctx.fillStyle = "rgba(218,41,28,0.95)";
  ctx.beginPath();
  ctx.arc(md.px, md.py, 5.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.arc(md.px, md.py, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function tryRenderMath(root) {
  const attempt = (n = 0) => {
    if (window.renderMathInElement) {
      window.renderMathInElement(root, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\(", right: "\\)", display: false },
          { left: "$",  right: "$",  display: false }
        ],
        throwOnError: false
      });
      return;
    }
    if (n < 30) setTimeout(() => attempt(n + 1), 50);
  };
  attempt();
}

document.addEventListener("DOMContentLoaded", () => {
  const root = $("#bezierWidget");
  const canvas = $("#bezierEcgCanvas");
  if (!root || !canvas) return;

  const segChip = $("#bezierSegChip");
  const degChip = $("#bezierDegChip");
  const tChip   = $("#bezierTChip");
  const tabs = $$(".bezier-tab", root);

  const ctx = canvas.getContext("2d");

  const getSize = () => {
    const r = canvas.getBoundingClientRect();
    return { W: r.width, H: r.height };
  };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(r.width * dpr);
    canvas.height = Math.floor(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  let state = {
    waveKey: "Normal",
    wave: buildWaveform("Normal"),
    poly: null,
    B: null,
    xMin: 0,
    xMax: 1,
    xAnim: 0
  };

  const setWave = (key) => {
    state.waveKey = key;
    state.wave = buildWaveform(key);
    state.poly = buildPolyline(state.wave);
    state.B = bounds(state.poly.full);

    state.xMin = state.poly.full[0].x;
    state.xMax = state.poly.full[state.poly.full.length - 1].x;
    state.xAnim = state.xMin;

    tabs.forEach(btn => {
      const active = btn.dataset.wave === key;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  };

  tabs.forEach(btn => {
    btn.addEventListener("click", () => setWave(btn.dataset.wave));
  });

  resize();
  window.addEventListener("resize", resize);

  const map = createMapper(getSize, () => state.B);

  // small wrapper to access latest bounds in mapper
  const mapDynamic = (x, y) => {
    const B = state.B;
    const mapper = createMapper(getSize, B);
    return mapper(x, y);
  };

  let last = performance.now();
  const periodSeconds = { "Normal": 3.8, "Ventricular pacing": 4.0, "Mobitz II": 5.0 };

  const frame = (now) => {
    const dt = (now - last) / 1000;
    last = now;

    const period = periodSeconds[state.waveKey] || 4.0;
    const dx = (state.xMax - state.xMin) * (dt / period);

    state.xAnim += dx;
    if (state.xAnim > state.xMax) state.xAnim = state.xMin + (state.xAnim - state.xMax);

    drawScene({
      ctx,
      map: mapDynamic,
      wave: state.wave,
      poly: state.poly,
      B: state.B,
      xAnim: state.xAnim,
      segChip,
      degChip,
      tChip
    });

    requestAnimationFrame(frame);
  };

  setWave("Normal");
  requestAnimationFrame(frame);
  tryRenderMath(root);
});
