// backend/metric/metric.js

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

/**
 * Weighted scoring table.
 *
 * Options:
 * - mode: 'sum'      -> returns raw weighted sum of 1–5 values
 * - mode: 'average'  -> returns weighted average on a 0–scale range (default scale=100)
 * - scale: number    -> only used when mode='average' (default 100)
 *
 * Mapping of metrics -> weights:
 * - maintainingCompliance -> weight1
 * - reducingCost -> weight2
 * - reducingRisk -> weight3
 * - improvingProductivity -> weight4
 * - improvingProcesses -> weight5
 * - creatingNewRevenueStreams -> weight6
 */
function calculateMetricScore(seedLike, boardLike, { mode = "average", scale = 100 } = {}) {
  const weights = {
    w1: toNum(boardLike?.weight1, 0),
    w2: toNum(boardLike?.weight2, 0),
    w3: toNum(boardLike?.weight3, 0),
    w4: toNum(boardLike?.weight4, 0),
    w5: toNum(boardLike?.weight5, 0),
    w6: toNum(boardLike?.weight6, 0),
    w7: toNum(boardLike?.weight7, 0), // Kept for potential future use
    w8: toNum(boardLike?.weight8, 0), // Kept for potential future use
  };

  // --- Categorical metrics -> 1..5 ---
  const cats = [
    { v: catTo5(seedLike?.maintainingCompliance), w: weights.w1 },
    { v: catTo5(seedLike?.reducingCost), w: weights.w2 },
    { v: catTo5(seedLike?.reducingRisk), w: weights.w3 },
    { v: catTo5(seedLike?.improvingProductivity), w: weights.w4 },
    { v: catTo5(seedLike?.improvingProcesses), w: weights.w5 },
    { v: catTo5(seedLike?.creatingNewRevenueStreams), w: weights.w6 },
  ];

  const entries = cats.filter(({ v, w }) => v != null && w > 0);

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
};
