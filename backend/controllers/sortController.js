const asyncHandler = require("express-async-handler");
const Board = require("../models/boardModel");
const MetricSort = require("../algorithms/metricSort");
const NameSort = require("../algorithms/nameSort");

/**
 * GET /api/board/board/:id/seeds/sort?by=metric|name&order=asc|desc
 * Returns the seeds of a board sorted in the backend.
 */
const getSortedSeedsForBoard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const by = (req.query.by || "metric").toLowerCase();   // default metric
  const order = (req.query.order || "asc").toLowerCase(); // default asc

  // Pull the board (we need weights to compute metric scores)
  const board = await Board.findById(id).populate("seeds");
  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  const seeds = board.seeds || [];

  // Strategy selection
  let sorter;
  if (by === "name" || by === "title" || by === "alpha" || by === "alphabetical") {
    sorter = new NameSort(order, "title");
  } else if (by === "metric" || by === "score") {
    sorter = new MetricSort(board, order, { mode: "average", scale: 100 });
  } else {
    return res.status(400).json({ message: "Invalid sort 'by' parameter. Use 'metric' or 'name'." });
  }

  const sorted = sorter.calculate(seeds);
  res.status(200).json({
    boardId: board._id,
    projectName: board.projectName,
    count: sorted.length,
    by,
    order,
    seeds: sorted,
  });
});

module.exports = {
  getSortedSeedsForBoard,
};
