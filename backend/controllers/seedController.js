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
    description,
    creatorName,
    creatorEmail,
    dateRecorded,
    group,
    subGroup,
    type,
    weeksLeadTime,
    priority,
    userAssigned,
    startTime,
    expectedEndTime,
    completionDate,
    status,
  } = req.body;

  // Validate required fields
  if (!description || !creatorName) {
    res.status(400);
    throw new Error("Description and creatorName are required");
  }

  const newSeed = new Seed({
    description,
    creatorName,
    creatorEmail,
    dateRecorded,
    group,
    subGroup,
    type,
    weeksLeadTime,
    priority,
    userAssigned,
    startTime,
    expectedEndTime,
    completionDate,
    status,
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
    description,
    creatorName,
    creatorEmail,
    dateRecorded,
    group,
    subGroup,
    type,
    weeksLeadTime,
    priority,
    userAssigned,
    startTime,
    expectedEndTime,
    completionDate,
    status,
  } = req.body;

  const existingSeed = await Seed.findById(seedId);

  if (!existingSeed) {
    res.status(404);
    throw new Error("Seed not found");
  }

  const updatedSeed = await Seed.findByIdAndUpdate(
    seedId,
    {
      description,
      creatorName,
      creatorEmail,
      dateRecorded,
      group,
      subGroup,
      type,
      weeksLeadTime,
      priority,
      userAssigned,
      startTime,
      expectedEndTime,
      completionDate,
      status,
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

module.exports = {
  getSeeds,
  createSeed,
  updateSeedById,
  deleteSeedById,
};
