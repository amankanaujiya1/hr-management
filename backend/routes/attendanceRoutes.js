const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  markAttendance
} = require('../controllers/attendanceController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Specific routes first
router.post('/checkin', protect, authorizeRoles('employee'), checkIn);
router.put('/checkout', protect, authorizeRoles('employee'), checkOut);
router.get('/my', protect, authorizeRoles('employee'), getMyAttendance);
router.get('/', protect, authorizeRoles('admin', 'hr'), getAllAttendance);
router.post('/mark', protect, authorizeRoles('admin', 'hr'), markAttendance);

// Dynamic route LAST — always put /:id at the bottom
router.put('/:id', protect, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const Attendance = require('../models/Attendance')
    const attendance = await Attendance.findById(req.params.id)
    if (!attendance) return res.status(404).json({ message: 'Record not found' })
    attendance.status = req.body.status || attendance.status
    await attendance.save()
    return res.json(attendance)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

module.exports = router;