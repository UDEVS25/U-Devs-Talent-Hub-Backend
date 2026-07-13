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

//fetch all of my appplications
exports.getMyApplications = async (req,res) =>{
  try{
     const {user_id} = req.params;
     const applications = await db.query('SELECT * FROM applications WHERE user_id=$1',[user_id]);
     if(applications.rows.length === 0){
      return res.status(404).json({
        success:false,
        message:'No application found'
      })
     }
     res.status(200).json({
      success:true,
      message:"Applications fetched successfully",
      data:applications.rows
     })
  }
  catch(err){
    console.error("Error fetching application",err.message)
    res.status(500).json({
      success:false,
      message:"Internal server error ",
      error:err.message
    })
  }
}

//track application status
exports.trackApplicationStatus = async (req,res)=>{
  try{
    const {job_id} = req.params;
    const applications = await db.query('SELECT current_stage FROM applications WHERE job_id=$1',[job_id])
      if(applications.rows.length === 0){
      return res.status(404).json({
        success:false,
        message:'No application found'
      })
     }
    res.status(200).json({
      success:true,
      data:applications.rows
    })
  }
  catch(err){
console.error("Error fetching status application",err.message)
    res.status(500).json({
      success:false,
      message:"Internal server error ",
      error:err.message
    })
  }
}

//Update data of an application
exports.updateApplicationData =  async (req,res) =>{
  try{
    const {id} = req.params;
    const {cover_letter, resume_url} = req.body;
    const application = await db.query('SELECT * FROM applications WHERE id=$1',[id]);
      if(application.rows.length === 0){
      return res.status(404).json({
        success:false,
        message:'No application found'
      })
     }
     const updatedApplication= await db.query('UPDATE applications SET cover_letter=$1 , resume_url=$2 WHERE id=$3 RETURNING * ',[cover_letter,resume_url,id])
      res.status(200).json({
      success:true,
      message:'Application updated successfully',
      data:updatedApplication.rows
    })
  }
  catch(err){
    console.error("Error updating application",err.message)
    res.status(500).json({
      success:false,
      message:"Internal server error ",
      error:err.message
    })
  }
  
}

//Delete application
exports.deleteApplicationData =  async (req,res) =>{
  try{
    const {id} = req.params;
    const application = await db.query('SELECT * FROM applications WHERE id=$1',[id]);
      if(application.rows.length === 0){
      return res.status(404).json({
        success:false,
        message:'No application found'
      })
     }
     const delApplication= await db.query('DELETE FROM applications WHERE id=$1 RETURNING * ',[id])
      res.status(200).json({
      success:true,
      message:'Application deleted successfully'
    })
  }
  catch(err){
    console.error("Error deleting application",err.message)
    res.status(500).json({
      success:false,
      message:"Internal server error ",
      error:err.message
    })
  }
  
}
