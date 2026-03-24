const db = require('../db');
const { sendSMS } = require('../utils/sms');

exports.createJob = async (req, res) => {
  try {
    const { title, description, budget, deadline, required_skills, client_id } = req.body;
    const result = await db.query(
      'INSERT INTO jobs (title, description, budget, deadline, required_skills, client_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, budget, deadline, JSON.stringify(required_skills || []), client_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM jobs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Job not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// AI Matching Logic mvp: (Matched Skills / Required Skills) * 100
exports.applyForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { freelancer_id } = req.body;
    
    // Get job
    const jobResult = await db.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (jobResult.rows.length === 0) return res.status(404).json({ message: 'Job not found' });
    const job = jobResult.rows[0];
    
    // Get freelancer
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [freelancer_id]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const freelancer = userResult.rows[0];
    
    // Calculate match score
    let matchScore = 0;
    const required = job.required_skills ? JSON.parse(job.required_skills) : [];
    const available = freelancer.skills ? JSON.parse(freelancer.skills) : [];
    
    if (required.length > 0) {
      const matched = required.filter(r => available.includes(r.toLowerCase().trim()));
      matchScore = (matched.length / required.length) * 100;
    } else {
      matchScore = 100; // No specific skills required if array is empty
    }
    
    const result = await db.query(
      'INSERT INTO applications (job_id, freelancer_id, match_score) VALUES ($1, $2, $3) RETURNING *',
      [id, freelancer_id, matchScore]
    );
    
    try {
      const clientResult = await db.query('SELECT phone FROM users WHERE id = ?', [job.client_id]);
      if (clientResult.rows.length > 0 && clientResult.rows[0].phone) {
        sendSMS(clientResult.rows[0].phone, `${freelancer.name} applied for your job with a ${matchScore}% match! Check your dashboard.`);
      }
    } catch (e) { console.error('Client SMS error', e); }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT a.*, u.name, u.phone, u.skills FROM applications a 
       JOIN users u ON a.freelancer_id = u.id 
       WHERE a.job_id = $1 ORDER BY a.match_score DESC`, 
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFreelancerJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT j.*, a.status as application_status, a.match_score 
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       WHERE a.freelancer_id = $1`, 
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
