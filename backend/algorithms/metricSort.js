/*
 * Merge sort strategy for sorting seeds by computed metric score.
 * Asc/Desc supported via constructor option.
 */
const Calculate = require("./calculate");
const { calculateMetricScore } = require("../metric/metric");

class MetricSort extends Calculate {
  /**
   * @param {Object} board - board document (for weights)
   * @param {'asc'|'desc'} order
   * @param {Object} [metricOpts] - optional { mode, scale } passed to calculateMetricScore
   */
  constructor(board, order = "asc", metricOpts = { mode: "average", scale: 100 }) {
    super();
    this.board = board;
    this.order = order === "desc" ? "desc" : "asc";
    this.metricOpts = metricOpts;
  }

  _score(seed) {
    // Uses your metric function; safe if metrics are strings/numbers
    return calculateMetricScore(seed, this.board, this.metricOpts) ?? 0;
  }

  _cmp(a, b) {
    const sa = this._score(a);
    const sb = this._score(b);
    if (sa === sb) return 0;
    return this.order === "asc" ? (sa < sb ? -1 : 1) : (sa > sb ? -1 : 1);
  }

  _merge(left, right) {
    const out = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
      if (this._cmp(left[i], right[j]) <= 0) {
        out.push(left[i++]);
      } else {
        out.push(right[j++]);
      }
    }
    while (i < left.length) out.push(left[i++]);
    while (j < right.length) out.push(right[j++]);
    return out;
  }

  _mergeSort(arr) {
    const n = arr.length;
    if (n <= 1) return arr;
    const mid = Math.floor(n / 2);
    const left = this._mergeSort(arr.slice(0, mid));
    const right = this._mergeSort(arr.slice(mid));
    return this._merge(left, right);
  }

  calculate(array) {
    // Return a sorted copy; do not mutate the original input array
    return this._mergeSort(Array.isArray(array) ? [...array] : []);
  }
}

module.exports = MetricSort;
