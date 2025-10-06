const express = require("express");
const router = express.Router();
const {
  getBoard,
  createBoard,
  updateBoardById,
  deleteBoardById,
} = require("../controllers/boardController");

// Add authentication middleware
const { protect } = require("../middleware/authMiddleware");

router.get("/board", protect, getBoard);
router.post("/board", protect, createBoard);
router.put("/board/:id", protect, updateBoardById);
router.delete("/board/:id", protect, deleteBoardById);

module.exports = router;