// backend/controllers/searchController.js
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Seed = require("../models/seedModel");
const Board = require("../models/boardModel");

/**
 * GET /api/search/seeds?q=...&boardId=...&limit=...
 * Private (uses protect)
 *
 * Behavior:
 * - If q is present: try $text search first (uses index); if it fails (no index) falls back to case-insensitive regex on title/description.
 * - If boardId is present: restrict results to seeds on that board.
 * - Returns minimal fields needed by your Seeds board, sorted by:
 *      1) textScore if using $text
 *      2) otherwise by created date desc
 */
const searchSeeds = asyncHandler(async (req, res) => {
  const { q = "", boardId = "", limit = 100 } = req.query;

  // Build base filter
  const filter = {};
  let useText = false;

  // Restrict to a board if provided
  if (boardId && mongoose.isValidObjectId(boardId)) {
    const board = await Board.findById(boardId).lean();
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    // restrict to seeds on this board
    filter._id = { $in: (board.seeds || []).map((id) => new mongoose.Types.ObjectId(id)) };
  }

  // Text / regex search portion
  if (q && q.trim().length > 0) {
    // Try $text (preferred)
    try {
      // If index exists, this will work
      filter.$text = { $search: q.trim() };
      useText = true;
    } catch (_) {
      // If no index, fallback to regex (no-op here; we add regex below)
      useText = false;
    }

    if (!useText) {
      const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: rx }, { description: rx }];
    }
  }

  // Projection: keep payload light but compatible with your board UI
  const projection = useText
    ? { score: { $meta: "textScore" }, title: 1, description: 1, creatorEmail: 1, priority: 1, status: 1, isFavorite: 1, metric1: 1, metric2: 1, metric3: 1, metric4: 1, metric5: 1, metric6: 1, metric7: 1, metric8: 1, comments: 1, metricScore: 1 }
    : { title: 1, description: 1, creatorEmail: 1, priority: 1, status: 1, isFavorite: 1, metric1: 1, metric2: 1, metric3: 1, metric4: 1, metric5: 1, metric6: 1, metric7: 1, metric8: 1, comments: 1, metricScore: 1 };

  // Sorting
  const sort = useText ? { score: { $meta: "textScore" } } : { dateRecorded: -1 };

  const seeds = await Seed.find(filter, projection).sort(sort).limit(Number(limit) || 100).lean();

  res.status(200).json({ results: seeds, count: seeds.length });
});

module.exports = { searchSeeds };
