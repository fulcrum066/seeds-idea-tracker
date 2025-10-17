const asyncHandler = require("express-async-handler");
const Task = require("../models/taskModel");
const Seed = require("../models/seedModel");

//-----------------------------------------------------------------------------------
//--------------------------------------GETTERS----------------------------------
//-----------------------------------------------------------------------------------

// @desc    Get all tasks for a seed
// @route   GET /api/tasks/seed/:seedId
// @access  Private
const getTasksForSeed = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ seedId: req.params.seedId });
  res.status(200).json(tasks);
});

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({});
  res.status(200).json(tasks);
});

//-----------------------------------------------------------------------------------
//--------------------------------------CREATORS----------------------------------
//-----------------------------------------------------------------------------------

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { taskName, subTaskCategory, dueDate, timeDue, seedId, createdBy } = req.body;

  // Validate required fields
  if (!taskName || !seedId || !createdBy) {
    res.status(400);
    throw new Error("taskName, seedId, and createdBy are required");
  }

  // Check if seed exists
  const seed = await Seed.findById(seedId);
  if (!seed) {
    res.status(404);
    throw new Error("Seed not found");
  }

  const newTask = new Task({
    taskName,
    subTaskCategory,
    dueDate,
    timeDue,
    seedId,
    createdBy
  });

  try {
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//-----------------------------------------------------------------------------------
//--------------------------------------UPDATERS----------------------------------
//-----------------------------------------------------------------------------------

// @desc    Update a task by ID
// @route   PUT /api/tasks/:id
// @access  Private
const updateTaskById = asyncHandler(async (req, res) => {
  const taskId = req.params.id;
  const { taskName, subTaskCategory, dueDate, timeDue } = req.body;

  const existingTask = await Task.findById(taskId);

  if (!existingTask) {
    res.status(404);
    throw new Error("Task not found");
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    {
      taskName,
      subTaskCategory,
      dueDate,
      timeDue
    },
    { new: true, runValidators: true }
  );

  if (!updatedTask) {
    res.status(404);
    throw new Error("Task not found");
  }

  res.status(200).json(updatedTask);
});

//-----------------------------------------------------------------------------------
//--------------------------------------DELETERS----------------------------------
//-----------------------------------------------------------------------------------

// @desc    Delete a task by ID
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTaskById = asyncHandler(async (req, res) => {
  const taskId = req.params.id;

  const deletedTask = await Task.findByIdAndDelete(taskId);

  if (!deletedTask) {
    res.status(404);
    throw new Error("Task not found");
  }

  res.status(200).json({ message: "Task removed" });
});

module.exports = {
  getTasksForSeed,
  getAllTasks,
  createTask,
  updateTaskById,
  deleteTaskById
};