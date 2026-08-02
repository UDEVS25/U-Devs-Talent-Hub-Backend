const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

// Import authentication and authorization security gates
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * 📩 INTERN APPLICATIONS ENDPOINTS
 */

// Route: Only authenticated users with the 'intern' role can submit an application
router.post('/apply', protect, authorize('intern'), applicationController.applyToJob);
router.get('/getall', protect, applicationController.getAllApplications); // moved up
router.get('/track/:job_id', protect, authorize('intern'), applicationController.trackApplicationStatus);
router.put('/update/:id', protect, authorize('intern'), applicationController.updateApplicationData);
router.delete('/delete/:id', protect, authorize('intern'), applicationController.deleteApplicationData);
router.get('/:user_id', protect, authorize('intern'), applicationController.getMyApplications); // moved to bottom
module.exports = router;