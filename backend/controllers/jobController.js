const db = require('../db');
const { sendSMS } = require('../utils/sms');

exports.createJob = async (req, res) => {
  try {
    const { title, description, budget, deadline, required_skills, client_id, requires_escrow } = req.body;
    const isEscrowReq = requires_escrow !== undefined ? requires_escrow : true;
    const result = await db.query(
      'INSERT INTO jobs (title, description, budget, deadline, required_skills, client_id, requires_escrow) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, budget, deadline, JSON.stringify(required_skills || []), client_id, isEscrowReq ? 1 : 0]
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

// Escrow Automation Logic
exports.depositEscrow = async (req, res) => {
  try {
    const { id } = req.params; 
    const { client_id, freelancer_id, amount, escrow_agent_id } = req.body;
    
    // Only insert escrow transaction if amount > 0 or it's genuinely escrow.
    // If not using escrow, this acts as simple acceptance.
    if (escrow_agent_id) {
      const result = await db.query(
        "INSERT INTO escrow_transactions (job_id, client_id, freelancer_id, amount, status, escrow_agent_id) VALUES ($1, $2, $3, $4, 'held', $5) RETURNING *",
        [id, client_id, freelancer_id, amount, escrow_agent_id]
      );
    }
    
    await db.query("UPDATE jobs SET status = 'in_progress' WHERE id = $1", [id]);
    
    // SMS Notification
    try {
      const fResult = await db.query("SELECT phone FROM users WHERE id = $1", [freelancer_id]);
      if (fResult.rows.length > 0) sendSMS(fResult.rows[0].phone, `Great news! Your proposal was accepted. You can start working on the job!`);
    } catch(e) {}

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.releaseEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      "UPDATE escrow_transactions SET status = 'released' WHERE job_id = $1 RETURNING *",
      [id]
    );
    await db.query("UPDATE jobs SET status = 'completed' WHERE id = $1", [id]);
    
    // SMS Notification
    try {
      if (result.rows.length > 0) {
        const { freelancer_id, amount } = result.rows[0];
        const fResult = await db.query("SELECT phone FROM users WHERE id = $1", [freelancer_id]);
        if (fResult.rows.length > 0) sendSMS(fResult.rows[0].phone, `Payment Released: $${amount} has been released from Escrow to your account!`);
      }
    } catch(e) {}

    res.json(result.rows[0]? result.rows[0] : {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.disputeEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "UPDATE escrow_transactions SET status = 'disputed' WHERE job_id = $1 RETURNING *",
      [id]
    );
    await db.query("UPDATE jobs SET status = 'disputed' WHERE id = $1", [id]);
    res.json(result.rows[0]? result.rows[0] : {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAgentDisputes = async (req, res) => {
  try {
    const { agent_id } = req.params;
    const result = await db.query(
      `SELECT j.*, e.amount as disputed_amount 
       FROM jobs j 
       JOIN escrow_transactions e ON j.id = e.job_id 
       WHERE e.escrow_agent_id = $1 AND j.status = 'disputed'`,
      [agent_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resolveEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, agent_id } = req.body; // resolution: 'released' or 'refunded'
    const result = await db.query(
      "UPDATE escrow_transactions SET status = $1, escrow_agent_id = $2 WHERE job_id = $3 RETURNING *",
      [resolution, agent_id, id]
    );
    await db.query("UPDATE jobs SET status = 'resolved' WHERE id = $1", [id]);
    res.json(result.rows[0]? result.rows[0] : {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
