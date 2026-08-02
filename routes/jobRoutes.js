const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Import authentication and authorization security gates
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * 💼 JOB MARKETPLACE ENDPOINTS
 */

// Route 1: Only authenticated users with the 'admin' role can create a job posting
router.post('/create',protect,  jobController.createJob);

// Route 2: Public or authenticated feed to fetch all active job openings
router.get('/all',protect, jobController.getAllJobs);
router.put('/update/:id',protect,jobController.updateJob);
router.delete('/delete/:id',protect,jobController.deleteJob);
module.exports = router;