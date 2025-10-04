// backend/controllers/seedController.js
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Seed = require("../models/seedModel");
const Board = require("../models/boardModel");
const { calculateMetricScore } = require("../metric/metric");

// ----------------------------------------------------------------------------------
// --------------------------------------HELPERS-------------------------------------
// ----------------------------------------------------------------------------------

/**
 * Resolve the board to use for weights:
 * - Prefer explicit boardId if provided
 * - Otherwise, find the board that already contains this seed in its `seeds` array
 * Returns null if nothing found (we'll still proceed with zeroed weights).
 */
async function resolveBoardForSeed({ seedId, boardId }) {
  if (boardId) {
    const board = await Board.findById(boardId);
    return board || null;
  }
  if (seedId && mongoose.isValidObjectId(seedId)) {
    const existing = await Board.findOne({ seeds: seedId });
    return existing || null;
  }
  return null;
}

// ----------------------------------------------------------------------------------
// --------------------------------------GETTERS-------------------------------------
// ----------------------------------------------------------------------------------

/**
 * @desc    Get all seeds
 * @route   GET /api/seeds/seed
 * @access  Private
 */
const getSeeds = asyncHandler(async (req, res) => {
  // Optional: allow filtering by boardId (keeps existing default behavior if not supplied)
  const { boardId } = req.query;

  if (boardId) {
    const board = await Board.findById(boardId).lean();
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    // Return only seeds that belong to this board
    const seeds = await Seed.find({ _id: { $in: board.seeds || [] } });
    return res.status(200).json(seeds);
  }

  const seeds = await Seed.find({});
  res.status(200).json(seeds);
});

// ----------------------------------------------------------------------------------
// --------------------------------------CREATORS------------------------------------
// ----------------------------------------------------------------------------------

/**
 * @desc    Create a new seed
 * @route   POST /api/seeds/seed
 * @access  Private
 */
const createSeed = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    creatorName,
    creatorEmail,
    dateRecorded,
    boardId,
    metric1, metric2, metric3, metric4, metric5, metric6, metric7, metric8,
    priority,
    status,
    isFavorite,
  } = req.body;

  if (!description || !creatorName) {
    res.status(400);
    throw new Error("Description and creatorName are required");
  }

  let board = null;
  if (boardId) {
    board = await Board.findById(boardId);
    if (!board) {
      res.status(404);
      throw new Error("Board not found");
    }
  }

  const metricScore = calculateMetricScore(
    { metric1, metric2, metric3, metric4, metric5, metric6, metric7, metric8 },
    board
  );

  const newSeed = new Seed({
    title,
    description,
    creatorName,
    creatorEmail,
    dateRecorded,
    metric1, metric2, metric3, metric4, metric5, metric6, metric7, metric8,
    metricScore,
    priority,
    status,
    isFavorite: !!isFavorite,
  });

  const savedSeed = await newSeed.save();

  if (boardId) {
    await Board.findByIdAndUpdate(
      boardId,
      { $push: { seeds: savedSeed._id } },
      { new: true }
    );
  }

  res.status(201).json(savedSeed);
});

// ----------------------------------------------------------------------------------
// --------------------------------------UPDATERS------------------------------------
// ----------------------------------------------------------------------------------

/**
 * @desc    Update a seed by ID
 * @route   PUT /api/seeds/seed/:id
 * @access  Private
 */
const updateSeedById = asyncHandler(async (req, res) => {
  const seedId = req.params.id;
  const {
    title,
    description,
    creatorName,
    creatorEmail,
    dateRecorded,
    boardId, // optional; if absent we fall back to the board containing this seed
    metric1, metric2, metric3, metric4, metric5, metric6, metric7, metric8,
    priority,
    status,
    isFavorite,
  } = req.body;

  const existingSeed = await Seed.findById(seedId);
  if (!existingSeed) {
    res.status(404);
    throw new Error("Seed not found");
  }

  // Prefer explicit boardId; otherwise use the board that currently contains this seed
  const board = await resolveBoardForSeed({ seedId, boardId }); // may be null (that’s OK)

  // Merge new metrics with existing values
  const merged = {
    metric1: metric1 ?? existingSeed.metric1,
    metric2: metric2 ?? existingSeed.metric2,
    metric3: metric3 ?? existingSeed.metric3,
    metric4: metric4 ?? existingSeed.metric4,
    metric5: metric5 ?? existingSeed.metric5,
    metric6: metric6 ?? existingSeed.metric6,
    metric7: metric7 ?? existingSeed.metric7,
    metric8: metric8 ?? existingSeed.metric8,
  };

  const metricScore = calculateMetricScore(merged, board);

  const updatedSeed = await Seed.findByIdAndUpdate(
    seedId,
    {
      title: title ?? existingSeed.title,
      description: description ?? existingSeed.description,
      creatorName: creatorName ?? existingSeed.creatorName,
      creatorEmail: creatorEmail ?? existingSeed.creatorEmail,
      dateRecorded: dateRecorded ?? existingSeed.dateRecorded,
      ...merged,
      metricScore,
      priority: priority ?? existingSeed.priority,
      status: status ?? existingSeed.status,
      isFavorite:
        typeof isFavorite === "boolean" ? isFavorite : existingSeed.isFavorite,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedSeed);
});

// ----------------------------------------------------------------------------------
// --------------------------------------DELETERS------------------------------------
// ----------------------------------------------------------------------------------

/**
 * @desc    Delete a seed by ID
 * @route   DELETE /api/seeds/seed/:id
 * @access  Private
 */
const deleteSeedById = asyncHandler(async (req, res) => {
  const seedId = req.params.id;

  const deletedSeed = await Seed.findByIdAndDelete(seedId);
  if (!deletedSeed) {
    res.status(404);
    throw new Error("Seed not found");
  }

  // Remove this seed reference from any boards that contain it
  await Board.updateMany({ seeds: seedId }, { $pull: { seeds: seedId } });

  res.status(200).json({ message: "Seed removed and board updated" });
});

// ----------------------------------------------------------------------------------
// --------------------------------------OTHERS--------------------------------------
// ----------------------------------------------------------------------------------

/**
 * @desc    Toggle favorite status of a seed
 * @route   PUT /api/seeds/seed/:id/favorite
 * @access  Private
 */
const toggleFavorite = asyncHandler(async (req, res) => {
  const seedId = req.params.id;

  const existingSeed = await Seed.findById(seedId);
  if (!existingSeed) {
    res.status(404);
    throw new Error("Seed not found");
  }

  const updatedSeed = await Seed.findByIdAndUpdate(
    seedId,
    { isFavorite: !existingSeed.isFavorite },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedSeed);
});

/**
 * @desc    Add a comment to a seed
 * @route   POST /api/seeds/seed/:id/comment
 * @access  Private
 */
const addComment = asyncHandler(async (req, res) => {
  const seedId = req.params.id;
  const { text, author, authorEmail } = req.body;

  if (!text || !author) {
    res.status(400);
    throw new Error("Comment text and author are required");
  }

  const existingSeed = await Seed.findById(seedId);
  if (!existingSeed) {
    res.status(404);
    throw new Error("Seed not found");
  }

  const newComment = {
    text,
    author,
    authorEmail,
    createdAt: new Date(),
  };

  const updatedSeed = await Seed.findByIdAndUpdate(
    seedId,
    { $push: { comments: newComment } },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedSeed);
});

/**
 * @desc    Delete a comment from a seed
 * @route   DELETE /api/seeds/seed/:id/comment/:commentId
 * @access  Private
 */
const deleteComment = asyncHandler(async (req, res) => {
  const seedId = req.params.id;
  const commentId = req.params.commentId;

  const existingSeed = await Seed.findById(seedId);
  if (!existingSeed) {
    res.status(404);
    throw new Error("Seed not found");
  }

  const updatedSeed = await Seed.findByIdAndUpdate(
    seedId,
    { $pull: { comments: { _id: commentId } } },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedSeed);
});

module.exports = {
  getSeeds,
  createSeed,
  updateSeedById,
  deleteSeedById,
  toggleFavorite,
  addComment,
  deleteComment,
};
