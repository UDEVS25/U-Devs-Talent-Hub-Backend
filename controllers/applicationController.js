const db = require('../config/db');

/**
 * 📩 SUBMIT APPLICATION WITH AUTO MATCH SCORE (Intern Feature)
 * Route: POST /api/applications/apply
 */
exports.applyToJob = async (req, res) => {
  try {
    const { job_id, user_id, cover_letter, resume_url } = req.body;

    // 1. Strict Field Validation
    if (!job_id || !user_id || !resume_url) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: job_id, user_id, and resume_url are mandatory fields.'
      });
    }

    // 2. Fetch target job posting to analyze 'skills_required' array
    const jobQuery = await db.query('SELECT skills_required FROM jobs WHERE id = $1', [job_id]);
    
    if (jobQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Error: The targeted job posting does not exist.'
      });
    }

    const requiredSkills = jobQuery.rows[0].skills_required || []; // Example: ['React', 'Node.js', 'PostgreSQL']
    let matchScore = 0;

    // 3. Automated Match Scoring Logic (Text Intersection Matching)
    if (requiredSkills.length > 0 && cover_letter) {
      const textToAnalyze = cover_letter.toLowerCase();
      let matchedCount = 0;

      // Check how many required skills are mentioned in the applicant's cover letter
      requiredSkills.forEach(skill => {
        if (textToAnalyze.includes(skill.toLowerCase())) {
          matchedCount++;
        }
      });

      // Calculate percentage score (rounded off)
      matchScore = Math.round((matchedCount / requiredSkills.length) * 100);
    }

    // 4. Insert application into database with the dynamically calculated match score
    const newApplication = await db.query(
      `INSERT INTO applications 
       (job_id, user_id, cover_letter, resume_url, match_score) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [job_id, user_id, cover_letter || null, resume_url, matchScore]
    );

    return res.status(201).json({
      success: true,
      message: 'Application processed and submitted successfully!',
      match_score_calculated: `${matchScore}%`,
      application: newApplication.rows[0]
    });

  } catch (error) {
    console.error('❌ APPLICATION SUBMISSION ERROR:', error.message);

    // Handle unique constraint violation (Error 23505) for duplicate applications
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Duplicate Error: You have already applied for this job opening.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while processing your application.',
      error: error.message
    });
  }
};