const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  cancelLeave
} = require('../controllers/leaveController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, authorizeRoles('employee'), applyLeave);
router.get('/my', protect, authorizeRoles('employee'), getMyLeaves);
router.get('/', protect, authorizeRoles('admin', 'hr'), getAllLeaves);
router.put('/:id', protect, authorizeRoles('admin', 'hr'), updateLeaveStatus);
router.delete('/:id', protect, authorizeRoles('employee'), cancelLeave);

module.exports = router;