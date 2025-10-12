// backend/algorithms/nameSort.js
const Calculate = require("./calculate");

class NameSort extends Calculate {
  /**
   * @param {'asc'|'desc'} order
   * @param {string} [key='title'] - property name to compare alphabetically
   */
  constructor(order = "asc", key = "title") {
    super();
    this.order = order === "desc" ? "desc" : "asc";
    this.key = key;
  }

  _val(x) {
    const v = (x?.[this.key] ?? "").toString();
    return v;
  }

  _cmp(a, b) {
    const A = this._val(a);
    const B = this._val(b);
    const res = A.localeCompare(B, undefined, { sensitivity: "base" });
    return this.order === "asc" ? res : -res;
  }

  calculate(array) {
    const copy = Array.isArray(array) ? [...array] : [];
    return copy.sort((a, b) => this._cmp(a, b));
  }
}

module.exports = NameSort;
