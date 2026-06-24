const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Import route security mechanisms
const { protect } = require('../middleware/authMiddleware');

/**
 * 💳 STRIPE ECOSYSTEM MANAGEMENT ENDPOINTS
 */

// Route 1: Initialize a premium tier payment checkout funnel
router.post('/checkout', protect, paymentController.createCheckoutSession);

module.exports = router;