const express = require("express");
const router = express.Router();
const { getBoard, createBoard, updateBoardById, deleteBoardById } = require("../controllers/boardController");
const { getSortedSeedsForBoard } = require("../controllers/sortController");
const { protect } = require("../middleware/authMiddleware");

router.get("/board", protect, getBoard);
router.post("/board", protect, createBoard);
router.put("/board/:id", protect, updateBoardById);
router.delete("/board/:id", protect, deleteBoardById);
router.get("/board/:id/seeds/sort", protect, getSortedSeedsForBoard);

module.exports = router;