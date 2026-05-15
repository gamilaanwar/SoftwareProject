const express = require('express');
const { getUsers, updateUserStatus } = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/users', authenticate, authorize(['admin']), getUsers);
router.put('/users/:id/status', authenticate, authorize(['admin']), updateUserStatus);

module.exports = router;
