const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

exports.registerUser = async (req, res) => {
  try {
    const { name, phone, password, role, skills } = req.body;
    
    const check = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (check.rows.length > 0) return res.status(400).json({ message: 'User already exists' });
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    const result = await db.query(
      'INSERT INTO users (name, phone, password, role, skills) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, phone, role',
      [name, phone, hash, role, JSON.stringify(skills || [])]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
    
    if (result.rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });
    
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    
    res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
