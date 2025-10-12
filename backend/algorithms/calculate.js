//const Seed = require("../models/seedModel");
//this file is a part of the strategy pattern to sort ideas. Is interface.
// backend/algorithms/calculate.js
class Calculate {
    /**
     * @param {Array<any>} array - items to sort (e.g., seeds)
     * @returns {Array<any>} sorted copy (do NOT mutate original)
     */
    calculate(array) {
        throw new Error("calculate(array) must be implemented by subclass");
    }
}

module.exports = Calculate;