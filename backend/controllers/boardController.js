const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Board = require("../models/boardModel");
const User = require("../models/userModel");

//-----------------------------------------------------------------------------------
//--------------------------------------HELPERS--------------------------------------
//-----------------------------------------------------------------------------------
const idStr = (x) => String(x?._id ?? x);
const uniq = (arr) => Array.from(new Set(arr.map(idStr)));
const union = (a, b) => Array.from(new Set([...a.map(idStr), ...b.map(idStr)]));
const diff = (a, b) => {
  const B = new Set(b.map(idStr));
  return a.map(idStr).filter((x) => !B.has(x));
};

// Sync both sides of the relationship
async function syncUserBoards({ boardId, addedUserIds, removedUserIds, session = null }) {
  const addList = uniq(addedUserIds);
  const remList = uniq(removedUserIds);

  if (addList.length) {
    await User.updateMany(
      { _id: { $in: addList } },
      { $addToSet: { boards: boardId } },
      { session }
    );
  }
  if (remList.length) {
    await User.updateMany(
      { _id: { $in: remList } },
      { $pull: { boards: boardId } },
      { session }
    );
  }
}

function canAccessBoard(req, boardDoc) {
  const isAdmin = (req.user?.roles || []).includes("admin");
  const inBoardList = (req.user?.boards || [])
    .map(String)
    .includes(String(boardDoc._id));
  return isAdmin || inBoardList;
}

//-----------------------------------------------------------------------------------
//--------------------------------------GETTERS--------------------------------------
//-----------------------------------------------------------------------------------

// @desc    Get all project boards visible to the current user
// @route   GET /api/board/board
// @access  Private
const getBoard = asyncHandler(async (req, res) => {
  const allowedBoardIds = (req.user?.boards || []).map(String);

  if (!allowedBoardIds.length) {
    return res.status(200).json([]);
  }

  const boards = await Board.find({ _id: { $in: allowedBoardIds } })
    .populate("seeds")
    .populate("admins", "firstName lastName email")
    .populate("users", "firstName lastName email");

  res.status(200).json(boards);
});

//-----------------------------------------------------------------------------------
//--------------------------------------CREATORS-------------------------------------
//-----------------------------------------------------------------------------------

// @desc    Create a new board
// @route   POST /api/board/board
// @access  Private
const createBoard = asyncHandler(async (req, res) => {
  const {
    projectName,
    seeds = [],
    admins = [],
    users = [],
    weight1,
    weight2,
    weight3,
    weight4,
    weight5,
    weight6,
    weight7,
  } = req.body;

  const newBoard = new Board({
    projectName,
    seeds,
    admins,
    users,
    weight1,
    weight2,
    weight3,
    weight4,
    weight5,
    weight6,
    weight7,
  });

  const savedBoard = await newBoard.save();

  // Add this board to each member’s boards list
  const members = union(admins, users);
  if (members.length) {
    await User.updateMany(
      { _id: { $in: members } },
      { $addToSet: { boards: savedBoard._id } }
    );
  }

  const populatedBoard = await Board.findById(savedBoard._id)
    .populate("seeds")
    .populate("admins", "firstName lastName email")
    .populate("users", "firstName lastName email");

  res.status(201).json(populatedBoard);
});

//-----------------------------------------------------------------------------------
//--------------------------------------UPDATERS-------------------------------------
//-----------------------------------------------------------------------------------

// @desc    Update a board by ID
// @route   PUT /api/board/board/:id
// @access  Private
const updateBoardById = asyncHandler(async (req, res) => {
  const boardId = req.params.id;
  const existingBoard = await Board.findById(boardId);
  if (!existingBoard) {
    res.status(404);
    throw new Error("Board not found");
  }

  if (!canAccessBoard(req, existingBoard)) {
    res.status(403);
    throw new Error("Forbidden: you do not have access to this board");
  }

  const isAdmin = (req.user?.roles || []).includes("admin");

  const {
    projectName,
    seeds,
    admins,
    users,
    weight1,
    weight2,
    weight3,
    weight4,
    weight5,
    weight6,
    weight7,
  } = req.body;

  const update = {
    projectName,
    seeds,
    weight1,
    weight2,
    weight3,
    weight4,
    weight5,
    weight6,
    weight7,
  };
  if (isAdmin) {
    if (admins) update.admins = admins;
    if (users) update.users = users;
  }

  // Determine membership changes
  const oldMembers = union(existingBoard.admins || [], existingBoard.users || []);
  const newAdmins = isAdmin && Array.isArray(admins) ? admins : existingBoard.admins;
  const newUsers = isAdmin && Array.isArray(users) ? users : existingBoard.users;
  const newMembers = union(newAdmins || [], newUsers || []);
  const added = diff(newMembers, oldMembers);
  const removed = diff(oldMembers, newMembers);

  // Try to update in a transaction (falls back if unavailable)
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const updatedBoard = await Board.findByIdAndUpdate(boardId, update, {
      new: true,
      runValidators: true,
      session,
    })
      .populate("seeds")
      .populate("admins", "firstName lastName email")
      .populate("users", "firstName lastName email");

    await syncUserBoards({ boardId, addedUserIds: added, removedUserIds: removed, session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(updatedBoard);
  } catch (err) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    const updatedBoard = await Board.findByIdAndUpdate(boardId, update, {
      new: true,
      runValidators: true,
    })
      .populate("seeds")
      .populate("admins", "firstName lastName email")
      .populate("users", "firstName lastName email");

    await syncUserBoards({ boardId, addedUserIds: added, removedUserIds: removed });
    res.status(200).json(updatedBoard);
  }
});

//-----------------------------------------------------------------------------------
//--------------------------------------DELETERS--------------------------------------
//-----------------------------------------------------------------------------------

// @desc    Delete a board by ID
// @route   DELETE /api/board/board/:id
// @access  Private
const deleteBoardById = asyncHandler(async (req, res) => {
  const boardId = req.params.id;
  const board = await Board.findById(boardId);
  if (!board) {
    res.status(404);
    throw new Error("Board not found");
  }

  if (!canAccessBoard(req, board)) {
    res.status(403);
    throw new Error("Forbidden: you do not have access to this board");
  }

  // Remove board reference from all users
  const members = union(board.admins || [], board.users || []);
  if (members.length) {
    await User.updateMany(
      { _id: { $in: members } },
      { $pull: { boards: boardId } }
    );
  }

  await Board.findByIdAndDelete(boardId);
  res.status(200).json({ message: "Board deleted" });
});

module.exports = {
  getBoard,
  createBoard,
  updateBoardById,
  deleteBoardById,
};
