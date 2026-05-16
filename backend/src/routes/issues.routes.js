const express = require('express');
const { 
  submitIssue, 
  getAllIssues, 
  getMyIssues, 
  getTicketById, 
  updateStatus, 
  updatePriority,
  assignWorker, 
  addComment, 
  uploadCompletionPhoto 
} = require('../controllers/issues.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }); 
const router = express.Router();

router.post('/', authenticate, authorize(['community_member']), upload.single('image'), submitIssue);
router.get('/', authenticate, authorize(['facility_manager']), getAllIssues);
router.get('/my', authenticate, authorize(['community_member', 'worker']), getMyIssues);
router.get('/:id', authenticate, getTicketById);
router.put('/:id/status', authenticate, authorize(['facility_manager', 'worker']), updateStatus);
router.put('/:id/priority', authenticate, authorize(['facility_manager']), updatePriority);
router.put('/:id/assign', authenticate, authorize(['facility_manager']), assignWorker);
router.post('/:id/comments', authenticate, authorize(['worker', 'facility_manager']), addComment);
router.post('/:id/photo', authenticate, authorize(['worker']), upload.single('photo'), uploadCompletionPhoto);

module.exports = router;
