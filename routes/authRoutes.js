const express = require('express');
const router = express.Router();

// Controllers import kar rahe hain
const authController = require('../controllers/authController');

/**
 * 🔐 IAM / AUTHENTICATION ENDPOINTS
 */

// Route 1: User Registration Pipeline
router.post('/register', authController.registerUser);

// Route 2: User Login Session Verification
router.post('/login', authController.loginUser);

module.exports = router;