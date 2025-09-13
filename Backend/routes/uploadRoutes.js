const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadFile } = require('../controllers/uploadController');

// Protect all routes with authentication
router.use(protect);

// Upload file
router.post('/upload', uploadFile);

module.exports = router;
