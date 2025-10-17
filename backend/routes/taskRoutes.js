const express = require("express");
const router = express.Router();
const {
  getTasksForSeed,
  getAllTasks,
  createTask,
  updateTaskById,
  deleteTaskById
} = require("../controllers/taskController");

// Add authentication middleware
const { protect } = require("../middleware/authMiddleware");

router.get("/seed/:seedId", protect, getTasksForSeed);
router.get("/", protect, getAllTasks);
router.post("/", protect, createTask);
router.put("/:id", protect, updateTaskById);
router.delete("/:id", protect, deleteTaskById);

module.exports = router;