const db = require('../config/db');

const createUserTable = async() =>{
   await db.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'intern',
    skills_portfolio TEXT[] DEFAULT '{}',
    is_premium_plus BOOLEAN DEFAULT FALSE,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`)
console.log('created user table')
}

const createJobTable = async()=>{
    await db.query(`CREATE TABLE IF NOT EXISTS jobs (
 id SERIAL PRIMARY KEY,
 title VARCHAR(255) NOT NULL,
 description TEXT NOT NULL,
 skills_required TEXT[] NOT NULL,
 job_type VARCHAR(100) NOT NULL,
 salary_range VARCHAR(100),
 status VARCHAR(50) NOT NULL DEFAULT 'active',
 posted_by INT REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`)
console.log('created job table')
}

const createApplicationTable = async()=>{
    await db.query(`CREATE TABLE IF NOT EXISTS applications (
 id SERIAL PRIMARY KEY,
 job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
 user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 cover_letter TEXT,
 resume_url VARCHAR(500) NOT NULL,
 match_score INT DEFAULT 0,
 current_stage VARCHAR(100) DEFAULT 'applied',
 applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT unique_user_job_application UNIQUE (user_id, job_id)
 );
`)
console.log('created application table')
}

const createAssessmentTable = async()=>{
    await db.query(`CREATE TABLE IF NOT EXISTS assessment_submissions (
 id SERIAL PRIMARY KEY,
 application_id INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
 intern_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 task_repository_url VARCHAR(500),
 evaluation_score INT DEFAULT 0,
 evaluator_remarks TEXT,
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`)
console.log('created assessment table')
}

const initializeDB = async () => {
  try {
    await createUserTable();
    await createJobTable();
    await createApplicationTable();
    await createAssessmentTable();

    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
};

initializeDB();

module.exports= { createUserTable, createJobTable, createApplicationTable, createAssessmentTable };