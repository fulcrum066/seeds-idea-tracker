// backend/metric/metric.js
const roi = require("./roi");

// Map categorical strings to a 1–5 score
const CATEGORY_MAP = new Map([
  ["very high", 5],
  ["high", 4],
  ["medium", 3],
  ["low", 2],
  ["very low", 1],
]);

function toNum(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function catTo5(value) {
  if (value == null) return null;
  // Allow numeric inputs (e.g., 1–5) as well as strings
  const n = Number(value);
  if (Number.isFinite(n)) {
    if (n <= 0) return null;
    return Math.max(1, Math.min(5, n));
  }
  const key = String(value).trim().toLowerCase();
  return CATEGORY_MAP.get(key) ?? null;
}

// Convert ROI % into a 1–5 band (tweak thresholds to your policy)
function roiPctTo5(roiPct) {
  if (!Number.isFinite(roiPct)) return null;
  if (roiPct <= 0)    return 1;   // losing/neutral
  if (roiPct <= 50)   return 2;
  if (roiPct <= 100)  return 3;
  if (roiPct <= 200)  return 4;
  return 5;                         // >200%
}

/**
 * Weighted scoring table.
 *
 * Options:
 * - mode: 'sum'      -> returns raw weighted sum of 1–5 values (e.g., 284)
 * - mode: 'average'  -> returns weighted average on a 0–scale range (default scale=100 => % like 0–100)
 * - scale: number    -> only used when mode='average' (default 100)
 *
 * Mapping of metrics -> weights:
 * - metric1+metric2 => ROI block -> weight1
 * - metric3..metric7 => categorical -> weight2..weight6
 * - metric8 (optional) => categorical -> weight7 (if present)
 */
function calculateMetricScore(seedLike, boardLike, { mode = "average", scale = 100 } = {}) {
  const weights = {
    w1: toNum(boardLike?.weight1, 0),
    w2: toNum(boardLike?.weight2, 0),
    w3: toNum(boardLike?.weight3, 0),
    w4: toNum(boardLike?.weight4, 0),
    w5: toNum(boardLike?.weight5, 0),
    w6: toNum(boardLike?.weight6, 0),
    w7: toNum(boardLike?.weight7, 0),
    w8: toNum(boardLike?.weight8, 0), // harmless if unused
  };

  // --- ROI (metric1, metric2) -> 1..5 band ---
  let roiPct = null;
  try {
    const m1 = seedLike?.metric1;
    const m2 = seedLike?.metric2;
    if (m1 != null || m2 != null) {
      roiPct = (m1 != null && m2 != null) ? roi.calculateROI(m1, m2) : Number(m1);
    }
  } catch {
    roiPct = null;
  }
  const roi5 = roiPct == null ? null : roiPctTo5(roiPct);

  // --- Categorical metrics -> 1..5 ---
  const cats = [
    { v: catTo5(seedLike?.metric3), w: weights.w2 },
    { v: catTo5(seedLike?.metric4), w: weights.w3 },
    { v: catTo5(seedLike?.metric5), w: weights.w4 },
    { v: catTo5(seedLike?.metric6), w: weights.w5 },
    { v: catTo5(seedLike?.metric7), w: weights.w6 },
    { v: catTo5(seedLike?.metric8), w: weights.w7 }, // if you use weight8, shift this to w8
  ];

  const entries = [
    { v: roi5, w: weights.w1 },
    ...cats,
  ].filter(({ v, w }) => v != null && w > 0);

  if (entries.length === 0) return 0;

  const sumWeighted = entries.reduce((acc, { v, w }) => acc + v * w, 0);
  const sumWeights  = entries.reduce((acc, { w })    => acc + w, 0);

  if (mode === "sum") {
    // Classic weighted sum (units depend on weights)
    return sumWeighted;
  }

  // Weighted average normalized to 0–`scale` (default 0–100)
  const avg5 = sumWeighted / sumWeights;     // in [1..5]
  return (avg5 / 5) * scale;                 // e.g., [0..100]
}

module.exports = {
  calculateMetricScore,
  catTo5,
  roiPctTo5,
};
