const multer = require('multer');

// Simple multer setup - memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

module.exports = { upload };