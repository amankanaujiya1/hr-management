const express = require('express');
const router = express.Router();
const { applyForJob, getAllApplicants, getApplicantsByJob, updateApplicantStatus } = require('../controllers/applicantController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', applyForJob);
router.get('/', protect, authorizeRoles('admin', 'hr'), getAllApplicants);
router.get('/job/:jobId', protect, authorizeRoles('admin', 'hr'), getApplicantsByJob);
router.put('/:id', protect, authorizeRoles('admin', 'hr'), updateApplicantStatus);

module.exports = router;