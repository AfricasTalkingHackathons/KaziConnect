const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, skills } = req.body;
    
    const check = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (check.rows.length > 0) return res.status(400).json({ message: 'User already exists' });
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    const result = await db.query(
      'INSERT INTO users (name, email, phone, password, role, skills) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, phone, role',
      [name, email, phone, hash, role, JSON.stringify(skills || [])]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getEscrows = async (req, res) => {
  try {
    const result = await db.query("SELECT id, name, phone FROM users WHERE role = 'escrow'");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const loginId = req.body.loginId || req.body.phone;
    const password = req.body.password;
    const result = await db.query('SELECT * FROM users WHERE phone = $1 OR email = $1', [loginId]);
    
    if (result.rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });
    
    const user = result.rows[0];
    let isMatch = await bcrypt.compare(password, user.password);
    
    // Fallback: support plaintext passwords for accounts registered via USSD
    if (!isMatch && password === user.password) {
      isMatch = true;
    }
    
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    
    res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
