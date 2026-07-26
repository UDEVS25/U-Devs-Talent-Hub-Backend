const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // Explicit absolute path

// Config layers import kar rahe hain
const db = require('./config/db');
const { createUserTable, createJobTable, createApplicationTable, createAssessmentTable } = require('./model/table');
const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 🛡️ GLOBAL MIDDLEWARES
// ==========================================
app.use(cors());
app.use(express.json()); // Senior practice: Body parser replacement for json payloads
app.use(express.urlencoded({ extended: true }));


// ==========================================
// 🛣️ ROUTING MIDDLEWARE SYSTEM
// ==========================================
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes); // All endpoints in authRoutes will now prefix with /api/auth


// Job Routes
const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes); // All endpoints in jobRoutes will prefix with /api/jobs

// Application Routes
const applicationRoutes = require('./routes/applicationRoutes');
app.use('/api/applications', applicationRoutes); // Prefixing all endpoints with /api/applications

// Assessment Routes
const assessmentRoutes = require('./routes/assessmentRoutes');
app.use('/api/assessments', assessmentRoutes); // Prefixing endpoints with /api/assessments

// Payment Routes
// Routes Imports
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes')); // <-- Add this line here

// ==========================================
// 🌐 BASE HEALTH CHECK ROUTE
// ==========================================
app.get('/api/health', async (req, res) => {
  try {
    // Database connectivity verification thread query
    const dbTest = await db.query('SELECT NOW()');
    return res.status(200).json({
      success: true,
      message: '--- uDevs Career Engine Server API Health Status: OPTIMAL ---',
      database_timestamp: dbTest.rows[0].now
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '--- Critical Alert: Database Thread Unreachable ---',
      error: error.message
    });
  }
});


// ==========================================
// 🚀 SERVER LIFECYCLE INITIALIZATION
// ==========================================
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 Server Running on Port: http://localhost:${PORT}`);
  console.log(`⚡ Engine Environment Active: Development`);
  console.log(`====================================================`);

  // Server bootstrap hot hi database check karega
  try {
    await db.query('SELECT 1');
    console.log('✅ POSTGRESQL INTEGRITY VERIFIED: Connection Pool Operational!');
  } catch (err) {
    console.error('❌ POSTGRESQL CONNECTIVITY CRITICAL ERROR:', err.message);
  }
});