const express = require("express");
const router = express.Router();
const {
  getSeeds,
  createSeed,
  updateSeedById,
  deleteSeedById,
} = require("../controllers/seedController");

// Add authentication middleware
const { protect } = require("../middleware/authMiddleware");

router.get("/seed", protect, getSeeds);
router.post("/seed", protect, createSeed);
router.put("/seed/:id", protect, updateSeedById);
router.delete("/seed/:id", protect, deleteSeedById);

module.exports = router;
