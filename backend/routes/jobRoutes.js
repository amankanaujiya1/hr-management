const express = require('express');
const router = express.Router();
const { createJob, getAllJobs, getJobById, updateJob, deleteJob } = require('../controllers/jobController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getAllJobs);
router.get('/:id', getJobById);
router.post('/', protect, authorizeRoles('admin', 'hr'), createJob);
router.put('/:id', protect, authorizeRoles('admin', 'hr'), updateJob);
router.delete('/:id', protect, authorizeRoles('admin', 'hr'), deleteJob);

module.exports = router;