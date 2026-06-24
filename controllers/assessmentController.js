const db = require('../config/db');

/**
 * 📝 SUBMIT ASSESSMENT TASK (Intern Feature)
 * Route: POST /api/assessments/submit
 */
exports.submitAssessment = async (req, res) => {
  try {
    const { application_id, intern_id, task_repository_url } = req.body;

    if (!application_id || !intern_id || !task_repository_url) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: application_id, intern_id, and task_repository_url are required.'
      });
    }

    const newSubmission = await db.query(
      `INSERT INTO assessment_submissions 
       (application_id, intern_id, task_repository_url, evaluation_score, evaluator_remarks) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [application_id, intern_id, task_repository_url, 0, 'Pending Evaluation']
    );

    return res.status(201).json({
      success: true,
      message: 'Practical task assessment repository submitted successfully!',
      submission: newSubmission.rows[0]
    });

  } catch (error) {
    console.error('❌ ASSESSMENT SUBMISSION ERROR:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while submitting assessment.',
      error: error.message
    });
  }
};

/**
 * 🎯 EVALUATE & GRADE SUBMISSION (Admin Feature)
 * Route: PATCH /api/assessments/:id/evaluate
 */
exports.evaluateSubmission = async (req, res) => {
  try {
    const { id } = req.params; // Get submission ID from URL parameters
    const { evaluation_score, evaluator_remarks } = req.body;

    // 1. Validation Check
    if (evaluation_score === undefined || !evaluator_remarks) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: evaluation_score and evaluator_remarks are required fields.'
      });
    }

    // 2. Update the assessment record in database
    const updatedAssessment = await db.query(
      `UPDATE assessment_submissions 
       SET evaluation_score = $1, evaluator_remarks = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [evaluation_score, evaluator_remarks, id]
    );

    // 3. Check if the assessment record actually existed
    if (updatedAssessment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Error: Assessment submission record with ID ${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Assessment graded and evaluated successfully by Admin!',
      assessment: updatedAssessment.rows[0]
    });

  } catch (error) {
    console.error('❌ ASSESSMENT EVALUATION ERROR:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while evaluating submission.',
      error: error.message
    });
  }
};