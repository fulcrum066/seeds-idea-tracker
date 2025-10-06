const asyncHandler = require("express-async-handler");
const Board = require("../models/boardModel");

//-----------------------------------------------------------------------------------
//--------------------------------------GETTERS----------------------------------
//-----------------------------------------------------------------------------------

// @desc    Get all project boards (with populated seeds)
// @route   GET /api/board/board
// @access  Private
const getBoard = asyncHandler(async (req, res) => {
    try {
        const boards = await Board.find({})
            .populate("seeds")   // populate seeds with full seed documents
            .populate("admins", "name email")  // optional: only return name/email for admins
            .populate("users", "name email");  // optional: only return name/email for users

        res.status(200).json(boards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//-----------------------------------------------------------------------------------
//--------------------------------------CREATORS----------------------------------
//-----------------------------------------------------------------------------------

// @desc    Create a new board
// @route   POST /api/board/board
// @access  Private
const createBoard = asyncHandler(async (req, res) => {
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

    const newBoard = new Board({
        projectName,
        seeds,   // should be an array of seed IDs
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

    try {
        const savedBoard = await newBoard.save();
        // return the board with populated seeds right after creation
        const populatedBoard = await Board.findById(savedBoard._id).populate("seeds");
        res.status(201).json(populatedBoard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//-----------------------------------------------------------------------------------
//--------------------------------------UPDATERS----------------------------------
//-----------------------------------------------------------------------------------

// @desc    Update a board by ID
// @route   PUT /api/board/board/:id
// @access  Private
const updateBoardById = asyncHandler(async (req, res) => {
    const boardId = req.params.id;
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

    const existingBoard = await Board.findById(boardId);

    if (!existingBoard) {
        res.status(404);
        throw new Error("Board not found");
    }

    const updatedBoard = await Board.findByIdAndUpdate(
        boardId,
        {
            projectName,
            seeds,   // still just IDs, will populate below
            admins,
            users,
            weight1,
            weight2,
            weight3,
            weight4,
            weight5,
            weight6,
            weight7,
        },
        { new: true, runValidators: true }
    ).populate("seeds");

    if (!updatedBoard) {
        res.status(404);
        throw new Error("Board not found");
    }

    res.status(200).json(updatedBoard);
});

//-----------------------------------------------------------------------------------
//--------------------------------------DELETERS----------------------------------
//-----------------------------------------------------------------------------------

// @desc    Delete a board by ID
// @route   DELETE /api/board/board/:id
// @access  Private
const deleteBoardById = asyncHandler(async (req, res) => {
    const boardId = req.params.id;

    const deletedBoard = await Board.findByIdAndDelete(boardId);

    if (!deletedBoard) {
        res.status(404);
        throw new Error("Board not found");
    }

    res.status(200).json({ message: "Board removed" });
});

module.exports = {
    getBoard,
    createBoard,
    updateBoardById,
    deleteBoardById,
};
