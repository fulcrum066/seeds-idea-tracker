const asyncHandler = require("express-async-handler");
const Seed = require("../models/seedModel");

//-----------------------------------------------------------------------------------
//--------------------------------------GETTERS----------------------------------
//-----------------------------------------------------------------------------------

// @desc    Get all seeds
// @route   GET /api/seeds/seed
// @access  Private
const getSeeds = asyncHandler(async (req, res) => {
  const seeds = await Seed.find({});
  res.status(200).json(seeds);
});

//-----------------------------------------------------------------------------------
//--------------------------------------CREATORS----------------------------------
//-----------------------------------------------------------------------------------

// @desc    Create a new seed
// @route   POST /api/seeds/seed
// @access  Private
const createSeed = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    creatorName,
    creatorEmail,
    dateRecorded,
    metric1,
    metric2,
    metric3,
    metric4,
    metric5,
    metric6,
    metric7,
    metric8,
    priority,
    status,
    isFavorite,
  } = req.body;

  // Validate required fields
  if (!description || !creatorName) {
    res.status(400);
    throw new Error("Description and creatorName are required");
  }

  const newSeed = new Seed({
    title,
    description,
    creatorName,
    creatorEmail,
    dateRecorded,
    metric1,
    metric2,
    metric3,
    metric4,
    metric5,
    metric6,
    metric7,
    metric8,
    priority,
    status,
    isFavorite: isFavorite || false,
    comments: []
  });

  try {
    const savedSeed = await newSeed.save();
    res.status(201).json(savedSeed);
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
const updateSeedById = asyncHandler(async (req, res) => {
  const seedId = req.params.id;
  const {
    title,
    description,
    creatorName,
    creatorEmail,
    dateRecorded,
    metric1,
    metric2,
    metric3,
    metric4,
    metric5,
    metric6,
    metric7,
    metric8,
    priority,
    status,
    isFavorite,
  } = req.body;

  const existingSeed = await Seed.findById(seedId);

  if (!existingSeed) {
    res.status(404);
    throw new Error("Seed not found");
  }

  const updatedSeed = await Seed.findByIdAndUpdate(
    seedId,
    {
      title,
      description,
      creatorName,
      creatorEmail,
      dateRecorded,
      metric1,
      metric2,
      metric3,
      metric4,
      metric5,
      metric6,
      metric7,
      metric8,
      priority,
      status,
      isFavorite,
    },
    { new: true, runValidators: true }
  );

  if (!updatedSeed) {
    res.status(404);
    throw new Error("Seed not found");
  }

  res.status(200).json(updatedSeed);
});

//-----------------------------------------------------------------------------------
//--------------------------------------DELETERS----------------------------------
//-----------------------------------------------------------------------------------

// @desc    Delete a seed by ID
// @route   DELETE /api/seeds/seed/:id
// @access  Private
const deleteSeedById = asyncHandler(async (req, res) => {
  const seedId = req.params.id;

  const deletedSeed = await Seed.findByIdAndDelete(seedId);

  if (!deletedSeed) {
    res.status(404);
    throw new Error("Seed not found");
  }

  res.status(200).json({ message: "Seed removed" });
});

// @desc    Toggle favorite status of a seed
// @route   PUT /api/seeds/seed/:id/favorite
// @access  Private
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

// @desc    Add a comment to a seed
// @route   POST /api/seeds/seed/:id/comment
// @access  Private
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
    createdAt: new Date()
  };

  const updatedSeed = await Seed.findByIdAndUpdate(
    seedId,
    { $push: { comments: newComment } },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedSeed);
});

// @desc    Delete a comment from a seed
// @route   DELETE /api/seeds/seed/:id/comment/:commentId
// @access  Private
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
