require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true }));

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the CampusCare API!');
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/issues', require('./routes/issues.routes'));
app.use('/api/manager', require('./routes/manager.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.use((err, _req, res, _next) => {
  console.error('--- GLOBAL ERROR HANDLER ---');
  console.error(err);
  console.error('----------------------------');
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error', 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`CampusCare API listening on http://0.0.0.0:${PORT}`);
  console.log(`Access locally: http://localhost:${PORT}`);
  console.log(`Access on network: http://10.0.0.19:${PORT}`);
});
