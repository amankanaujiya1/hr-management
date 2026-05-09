const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', protect, authorizeRoles('admin', 'hr'), getAllEmployees);
router.post('/', protect, authorizeRoles('admin', 'hr'), createEmployee);
router.get('/:id', protect, authorizeRoles('admin', 'hr'), getEmployeeById);
router.put('/:id', protect, authorizeRoles('admin', 'hr'), updateEmployee);
router.delete('/:id', protect, authorizeRoles('admin'), deleteEmployee);

module.exports = router;