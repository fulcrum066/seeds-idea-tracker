const express = require("express");
const router = express.Router();
const { uploadSeedFiles, deleteSeedFile } = require("../controllers/mediaController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

// Upload files to a seed
router.post("/seed/:seedId/upload", protect, upload.array('files', 5), uploadSeedFiles);

// Delete a specific file from a seed
router.delete("/seed/:seedId/file/:attachmentId", protect, deleteSeedFile);

module.exports = router;