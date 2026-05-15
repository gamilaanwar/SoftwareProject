const db = require('../config/db');

const getWorkers = async (req, res) => {
  try {
    const result = await db.query('SELECT user_id, name, email, is_active FROM users WHERE role = $1', ['worker']);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const updateWorkerStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  try {
    await db.query('UPDATE users SET is_active = $1 WHERE user_id = $2 AND role = $3', [is_active, id, 'worker']);
    res.json({ success: true, message: 'Worker status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = { getWorkers, updateWorkerStatus };
