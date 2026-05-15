const db = require('../config/db');

const submitIssue = async (req, res) => {
  console.log('--- SUBMIT ISSUE START ---');
  console.log('Received Body:', req.body);
  console.log('Received File:', req.file);

  const { category, description, building_name, floor, room_number, location_notes } = req.body;
  
  // LOGGING TO DEBUG - Log what we have
  console.log('Field Check:', { 
    category: !!category, 
    description: !!description, 
    building_name: !!building_name, 
    floor: !!floor, 
    room_number: !!room_number 
  });

  // Proceed even if fields are missing to see if the DB insert succeeds
  const reporter_id = req.user.userId;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    console.log('Inserting location...');
    const locResult = await db.query(
      'INSERT INTO locations (building_name, floor, room_number, location_notes) VALUES ($1, $2, $3, $4) RETURNING location_id',
      [building_name || 'N/A', floor || 'N/A', room_number || 'N/A', location_notes || '']
    );
    const location_id = locResult.rows[0].location_id;

    console.log('Inserting ticket...');
    const ticketResult = await db.query(
      'INSERT INTO tickets (reporter_id, location_id, category, description, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING ticket_id',
      [reporter_id, location_id, category || 'General', description || 'No description', image_url]
    );

    res.status(201).json({ success: true, message: 'Issue submitted successfully', data: { ticket_id: ticketResult.rows[0].ticket_id } });
  } catch (err) {
    console.error('Submit Issue Full Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const getAllIssues = async (req, res) => {
  const { status } = req.query;
  try {
    let query = `
      SELECT t.*, u.name as reporter_name, l.building_name, l.floor, l.room_number, l.location_notes
      FROM tickets t
      JOIN users u ON t.reporter_id = u.user_id
      JOIN locations l ON t.location_id = l.location_id
    `;
    const params = [];
    
    if (status && status !== 'all' && status.trim() !== '') {
      query += ` WHERE t.status = $1`;
      params.push(status);
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const getMyIssues = async (req, res) => {
    try {
      let query;
      let params = [req.user.userId];
      
      if (req.user.role === 'worker') {
        query = 'SELECT t.*, u.name as reporter_name, l.building_name, l.floor, l.room_number, l.location_notes FROM tickets t JOIN users u ON t.reporter_id = u.user_id JOIN locations l ON t.location_id = l.location_id WHERE t.assigned_worker_id = $1 ORDER BY t.created_at DESC';
      } else {
        query = 'SELECT t.*, u.name as reporter_name, l.building_name, l.floor, l.room_number, l.location_notes FROM tickets t JOIN users u ON t.reporter_id = u.user_id JOIN locations l ON t.location_id = l.location_id WHERE t.reporter_id = $1 ORDER BY t.created_at DESC';
      }
      
      const result = await db.query(query, params);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  };

const getTicketById = async (req, res) => {
  const { id } = req.params;
  try {
    const ticketResult = await db.query(`
      SELECT t.*, u.name as reporter_name, l.building_name, l.floor, l.room_number, l.location_notes
      FROM tickets t
      JOIN users u ON t.reporter_id = u.user_id
      JOIN locations l ON t.location_id = l.location_id
      WHERE t.ticket_id = $1
    `, [id]);
    
    if (ticketResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Ticket not found' });
    
    const commentsResult = await db.query(`
      SELECT c.*, u.name as author_name 
      FROM comments c
      JOIN users u ON c.author_id = u.user_id
      WHERE c.ticket_id = $1
      ORDER BY c.created_at ASC
    `, [id]);
    
    const ticket = ticketResult.rows[0];
    ticket.comments = commentsResult.rows;
    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const uploadCompletionPhoto = async (req, res) => {
  const { id } = req.params;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  
  if (!image_url) return res.status(400).json({ success: false, message: 'No photo provided' });

  try {
    await db.query(
        'INSERT INTO comments (ticket_id, author_id, body, completion_photo_url) VALUES ($1, $2, $3, $4)', 
        [id, req.user.userId, 'Photo proof uploaded', image_url]
    );
    res.json({ success: true, message: 'Photo uploaded', data: { image_url } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query('UPDATE tickets SET status = $1, updated_at = NOW() WHERE ticket_id = $2', [status, id]);
    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const updatePriority = async (req, res) => {
  const { id } = req.params;
  const { priority } = req.body;
  console.log(`Updating priority for ticket ${id} to ${priority}`);
  try {
    const result = await db.query('UPDATE tickets SET priority = $1, updated_at = NOW() WHERE ticket_id = $2', [priority, id]);
    console.log('Update result:', result.rowCount);
    res.json({ success: true, message: 'Priority updated' });
  } catch (err) {
    console.error('Update Priority Database Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message, detail: err.detail });
  }
};

const assignWorker = async (req, res) => {
  const { id } = req.params;
  const { worker_id } = req.body;
  try {
    await db.query('UPDATE tickets SET assigned_worker_id = $1, status = $2, updated_at = NOW() WHERE ticket_id = $3', [worker_id, 'assigned', id]);
    res.json({ success: true, message: 'Worker assigned' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const addComment = async (req, res) => {
  const { id } = req.params;
  const { body } = req.body;
  try {
    await db.query('INSERT INTO comments (ticket_id, author_id, body) VALUES ($1, $2, $3)', [id, req.user.userId, body]);
    res.json({ success: true, message: 'Comment added' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = { submitIssue, getAllIssues, getMyIssues, getTicketById, updateStatus, updatePriority, assignWorker, addComment, uploadCompletionPhoto };
