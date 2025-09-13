const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
    createOrGetReport,
    getMyReports,
    getReportById,
    updateReport,
    submitReport,
    getAllReports,
    reviewReport
} = require('../controllers/reportController');

// Apply authentication middleware to all routes
router.use(protect);

// Superadmin route for fetching all reports must be defined before '/:id' to prevent route parameter collision
router.route('/all')
    .get(requireRole('superadmin'), getAllReports);

// Community user routes
router.route('/event/:eventId')
    .post(requireRole('community'), createOrGetReport);

router.route('/')
    .get(requireRole('community'), getMyReports);

router.route('/:id')
    .get(getReportById)
    .put(requireRole('community'), updateReport);

router.route('/:id/submit')
    .put(requireRole('community'), submitReport);

// Superadmin routes handled above
router.route('/:id/review')
    .put(requireRole('superadmin'), reviewReport);

module.exports = router;