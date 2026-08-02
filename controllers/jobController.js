const db = require('../config/db');

/**
 * 💼 POST A NEW JOB (Admin / Employer Feature)
 * Route: POST /api/jobs/create
 */
exports.createJob = async (req, res) => {
  try {
    // 1. Postman se aane wale data ko explicitly pull karna
    const title = req.body.title;
    const description = req.body.description;
    const job_type = req.body.job_type;
    const salary = req.body.salary || null;
    const company = req.body.company || 'uDevs Systems';
    const posted_by = req.user.id;
    
    // SKILLS ARRAY CHECK: Agar postman se array nahi aaya toh empty array bhejna taake NOT NULL break na ho
    const skills_required = req.body.skills_required && Array.isArray(req.body.skills_required) 
      ? req.body.skills_required 
      : [];

    // 2. Field Validation
    if (!title || !description || !job_type) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: title, description, and job_type are required fields.'
      });
    }

    // 3. High-Performance SQL Insertion matching our precise DB script
    const newJob = await db.query(
      `INSERT INTO jobs 
       (title, description, skills_required, job_type, salary_range, posted_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [title, description, skills_required, job_type, salary, posted_by]
    );

    return res.status(201).json({
      success: true,
      message: 'New job posted successfully into uDevs Marketplace!',
      job: newJob.rows[0]
    });

  } catch (error) {
    console.error('❌ JOB CREATION ERROR:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while creating job posting.',
      error: error.message
    });
  }
};

/**
 * 🔍 GET ALL JOBS (Intern Feed Feature)
 * Route: GET /api/jobs/all
 */
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await db.query('SELECT * FROM jobs ORDER BY created_at DESC');
    return res.status(200).json({
      success: true,
      count: jobs.rows.length,
      jobs: jobs.rows
    });
  } catch (error) {
    console.error('❌ FETCH JOBS ERROR:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching job data.',
      error: error.message
    });
  }
};

exports.updateJob = async(req,res)=>{
  try{
 const {id} = req.params;
    const {title,description,job_type,salary_range} = req.body;
    const job = await db.query('SELECT * FROM jobs WHERE id=$1',[id]);
      if(job.rows.length === 0){
      return res.status(404).json({
        success:false,
        message:'No job found'
      })
     }
     const updatedJob= await db.query('UPDATE jobs SET title=$1, description=$2, job_type=$3, salary_range=$4 WHERE id=$5 RETURNING * ',[title,description,job_type,salary_range,id])
      res.status(200).json({
      success:true,
      message:'Job updated successfully',
      data:updatedJob.rows
    })
  }
  catch(err){
    console.error('❌ UPDATE JOBS ERROR:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error while updating job data.',
      error: err.message
    });
  }
}

exports.deleteJob =  async (req,res) =>{
  try{
    const {id} = req.params;
    const Job = await db.query('SELECT * FROM jobs WHERE id=$1',[id]);
      if(Job.rows.length === 0){
      return res.status(404).json({
        success:false,
        message:'No job found'
      })
     }
     const delJob= await db.query('DELETE FROM jobs WHERE id=$1 RETURNING * ',[id])
      res.status(200).json({
      success:true,
      message:'Job deleted successfully'
    })
  }
  catch(err){
    console.error("Error deleting job",err.message)
    res.status(500).json({
      success:false,
      message:"Internal server error ",
      error:err.message
    })
  }
  
}