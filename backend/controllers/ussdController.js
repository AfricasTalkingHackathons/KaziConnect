const db = require('../db');
const sms = require('../utils/sms');

exports.handleUssd = async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  
  let response = '';
  
  if (text === '') {
    // This is the first request
    response = `CON Welcome to KaziConnect
1. Register
2. View Matched Jobs
3. My Active Jobs`;
  } else if (text === '1') {
    response = `CON Enter your name:`;
  } else if (text.startsWith('1*')) {
    const parts = text.split('*');
    if (parts.length === 2) {
      response = `CON Enter your email address:`;
    } else if (parts.length === 3) {
      response = `CON Select your role:
1. Freelancer
2. Client
3. Escrow Agent`;
    } else if (parts.length === 4) {
      const name = parts[1];
      const email = parts[2];
      let role = 'client';
      if (parts[3] === '1') role = 'freelancer';
      else if (parts[3] === '3') role = 'escrow';
      
      if (role === 'freelancer') {
        response = `CON Enter your primary skills (comma separated):`;
      } else {
        // Register Client or Escrow Agent directly
        try {
          await db.query(
            'INSERT INTO users (name, email, phone, role, password) VALUES ($1, $2, $3, $4, $5)',
            [name, email, phoneNumber, role, '1234']
          );
          response = `END Registration successful, ${name}!`;
          const message = `Thank you for registering on KaziConnect as a ${role}, ${name}! Welcome aboard.`;
          sms.sendSMS(phoneNumber, message);
        } catch (err) {
          console.error("USSD Registration Error:", err);
          if (err.code === '23505' || err.code === 'SQLITE_CONSTRAINT') {
            response = `END You are already registered. Please use the web app to manage your account.`;
          } else {
            response = `END Registration failed. Try again later.`;
          }
        }
      }
    } else if (parts.length === 5) {
      // Complete Freelancer Registration
      const name = parts[1];
      const email = parts[2];
      const role = 'freelancer';
      const skills = parts[4];
      
      try {
        await db.query(
          'INSERT INTO users (name, email, phone, role, password, skills) VALUES ($1, $2, $3, $4, $5, $6)',
          [name, email, phoneNumber, role, '1234', skills]
        );
        response = `END Registration successful, ${name}!`;
        const message = `Welcome to KaziConnect, ${name}! Your skills (${skills}) are saved. We'll send you updates on matching jobs.`;
        sms.sendSMS(phoneNumber, message);
      } catch (err) {
        console.error("USSD Registration Error:", err);
        if (err.code === '23505' || err.code === 'SQLITE_CONSTRAINT') {
          response = `END You are already registered. Please use the web app to manage your account.`;
        } else {
          response = `END Registration failed. Try again later.`;
        }
      }
    }
  } else if (text === '2') {
    // View matched jobs based on user skills
    try {
      const userResult = await db.query('SELECT skills FROM users WHERE phone = $1 AND role = $2', [phoneNumber, 'freelancer']);
      if (userResult.rows && userResult.rows.length > 0) {
        const skillsString = userResult.rows[0].skills || '';
        if (!skillsString) {
          response = `END You haven't added any skills. Update your profile to see matches.`;
        } else {
          const mainSkill = skillsString.split(',')[0].trim();
          // Query jobs matching the main skill
          const jobsResult = await db.query("SELECT title, budget FROM jobs WHERE status = 'open' AND required_skills LIKE $1 LIMIT 3", [`%${mainSkill}%`]);
          
          if (jobsResult.rows && jobsResult.rows.length > 0) {
            response = `END Matched Jobs for ${mainSkill}:\n`;
            jobsResult.rows.forEach((job, index) => {
              response += `${index + 1}. ${job.title} - $${job.budget || 0}\n`;
            });
            response += `(Log in to web dashboard to apply)`;
          } else {
            response = `END No active jobs found matching your skills (${skillsString}).`;
          }
        }
      } else {
        response = `END You are not registered as a freelancer.`;
      }
    } catch (err) {
      console.error("View Jobs Error:", err);
      response = `END Could not retrieve jobs. Try again later.`;
    }
  } else if (text === '3') {
    response = `END You have no active jobs currently.`;
  } else {
    response = `END Invalid choice. Please try again.`;
  }

  // Send the response back to the API
  res.set('Content-Type', 'text/plain');
  res.send(response);
};
