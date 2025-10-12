const express = require("express");
const router = express.Router();
const {
  getSeeds,
  createSeed,
  updateSeedById,
  deleteSeedById,
  toggleFavorite,
  addComment,
  deleteComment,
} = require("../controllers/seedController");

// Add authentication middleware
const { protect } = require("../middleware/authMiddleware");

router.get("/seed", protect, getSeeds);
router.post("/seed", protect, createSeed);
router.put("/seed/:id", protect, updateSeedById);
router.delete("/seed/:id", protect, deleteSeedById);
router.put("/seed/:id/favorite", protect, toggleFavorite);
router.post("/seed/:id/comment", protect, addComment);
router.delete("/seed/:id/comment/:commentId", protect, deleteComment);

module.exports = router;
