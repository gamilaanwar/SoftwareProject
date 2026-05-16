const express = require('express');
const { register, login, logout, deleteAccount } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.delete('/delete', authenticate, deleteAccount);

module.exports = router;
