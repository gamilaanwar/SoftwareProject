const express = require('express');
const { getWorkers, updateWorkerStatus } = require('../controllers/manager.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/workers', authenticate, authorize(['facility_manager']), getWorkers);
router.put('/workers/:id/status', authenticate, authorize(['facility_manager']), updateWorkerStatus);

module.exports = router;
