const db = require('../config/db');

const getUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT user_id, name, email, role, is_active FROM users');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  try {
    await db.query('UPDATE users SET is_active = $1 WHERE user_id = $2', [is_active, id]);
    res.json({ success: true, message: 'User status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = { getUsers, updateUserStatus };
