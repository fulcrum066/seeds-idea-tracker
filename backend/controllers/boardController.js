const asyncHandler = require("express-async-handler");
const Board = require("../models/boardModel");

//-----------------------------------------------------------------------------------
//--------------------------------------GETTERS----------------------------------
//-----------------------------------------------------------------------------------

// @desc    Get all project boards
// @route   GET /api/board/board
// @access  Private
const getBoard = asyncHandler(async (req, res) => {
    const board = await Board.find({});
    res.status(200).json(board);
});

//-----------------------------------------------------------------------------------
//--------------------------------------CREATORS----------------------------------
//-----------------------------------------------------------------------------------

// @desc    Create a new seed
// @route   POST /api/seeds/seed
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

    // Validate required fields
    //   if (!description || !creatorName) {
    //     res.status(400);
    //     throw new Error("Description and creatorName are required");
    //   }

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

    try {
        const savedBoard = await newBoard.save();
        res.status(201).json(savedBoard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//-----------------------------------------------------------------------------------
//--------------------------------------UPDATERS----------------------------------
//-----------------------------------------------------------------------------------

// @desc    Update a seed by ID
// @route   PUT /api/seeds/seed/:id
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
        throw new Error("board not found");
    }

    const updatedBoard = await Board.findByIdAndUpdate(
        boardId,
        {
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
        },
        { new: true, runValidators: true }
    );

    if (!updatedBoard) {
        res.status(404);
        throw new Error("Board not found");
    }

    res.status(200).json(updatedBoard);
});

//-----------------------------------------------------------------------------------
//--------------------------------------DELETERS----------------------------------
//-----------------------------------------------------------------------------------

// @desc    Delete a seed by ID
// @route   DELETE /api/seeds/seed/:id
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
