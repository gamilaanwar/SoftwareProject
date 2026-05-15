const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const register = async (req, res) => {
  const { name, email, password, role, phone_number } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password, role, phone_number) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, name, email, role',
      [name, email, hashedPassword, role, phone_number]
    );

    res.status(201).json({ success: true, message: 'Registration successful. Awaiting account activation.', data: result.rows[0] });
  } catch (err) {
    console.error('Registration Error:', err); // Log the actual error
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.is_active) {
        return res.status(403).json({ success: false, message: 'Account not yet activated' });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: { 
        token, 
        user: { 
          user_id: user.user_id, 
          name: user.name, 
          email: user.email,
          role: user.role,
          phone_number: user.phone_number,
          is_active: user.is_active
        } 
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = { register, login, logout };
