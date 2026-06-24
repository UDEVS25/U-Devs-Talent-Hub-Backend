const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');

// Import security middlewares for route restriction
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * 📝 PRACTICAL ASSESSMENT SUBMISSIONS ENDPOINTS
 */

// Route 1: Only authenticated 'intern' profiles can submit practical project repositories
router.post('/submit', protect, authorize('intern'), assessmentController.submitAssessment);

// Route 2: Only authenticated users with the 'admin' role can evaluate and grade submissions
router.patch('/:id/evaluate', protect, authorize('admin'), assessmentController.evaluateSubmission);

module.exports = router;