// backend/metric/roi.js
class ROI {
    /**
     * ROI% = ((gained - spent) / spent) * 100
     * Accepts numbers or numeric strings.
     * If only a single value is provided, treat it as a precomputed ROI%.
     */
    calculateROI(amountGained, amountSpent) {
      // Precomputed ROI% fallback
      if (amountSpent === undefined || amountSpent === null) {
        const roiPct = Number(amountGained);
        if (Number.isNaN(roiPct)) throw new Error("ROI must be a number.");
        return roiPct;
      }
  
      const gained = Number(amountGained);
      const spent  = Number(amountSpent);
  
      if (!Number.isFinite(gained)) throw new Error("Amount gained must be a number.");
      if (!Number.isFinite(spent))  throw new Error("Amount spent must be a number.");
      if (spent === 0) throw new Error("Amount spent cannot be zero.");
  
      return ((gained - spent) / spent) * 100;
    }
  }
  
  module.exports = new ROI();
  