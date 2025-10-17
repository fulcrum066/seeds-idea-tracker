const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { searchSeeds } = require("../controllers/searchController");

router.get("/search/seeds", protect, searchSeeds);

module.exports = router;
