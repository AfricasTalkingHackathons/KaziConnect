const db = require('../db');

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
      response = `CON Select your role:
1. Freelancer
2. Client`;
    } else if (parts.length === 3) {
      const name = parts[1];
      const role = parts[2] === '1' ? 'freelancer' : 'client';
      
      try {
        await db.query(
          'INSERT INTO users (name, phone, role, password) VALUES ($1, $2, $3, $4)',
          [name, phoneNumber, role, '1234'] // default pin for ussd
        );
        response = `END Registration successful, ${name}!`;
      } catch (err) {
        if (err.code === '23505') {
          response = `END You are already registered. Please use the web app to manage your account.`;
        } else {
          response = `END Registration failed. Try again later.`;
        }
      }
    }
  } else if (text === '2') {
    // View matched jobs mock
    response = `END 1. Web Developer - 90% Match
2. Graphic Designer - 80% Match
(Log in to web dashboard to apply)`;
  } else if (text === '3') {
    response = `END You have no active jobs currently.`;
  } else {
    response = `END Invalid choice. Please try again.`;
  }

  // Send the response back to the API
  res.set('Content-Type', 'text/plain');
  res.send(response);
};
