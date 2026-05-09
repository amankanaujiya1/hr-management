const express = require('express');
const router = express.Router();
const {
  generatePayroll,
  getAllPayroll,
  getMyPayroll,
  markAsPaid
} = require('../controllers/payrollController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/generate/:employeeId', protect, authorizeRoles('admin'), generatePayroll);
router.get('/', protect, authorizeRoles('admin', 'hr'), getAllPayroll);
router.get('/my', protect, authorizeRoles('employee'), getMyPayroll);
router.put('/:id', protect, authorizeRoles('admin'), markAsPaid);

router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const payroll = await require('../models/Payroll').findById(req.params.id)
    if (!payroll) return res.status(404).json({ message: 'Payroll not found' })
    await require('../models/Payroll').findByIdAndDelete(req.params.id)
    return res.json({ message: 'Payroll deleted successfully' })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.put('/edit/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const Payroll = require('../models/Payroll')
    const payroll = await Payroll.findById(req.params.id)
    if (!payroll) return res.status(404).json({ message: 'Payroll not found' })

    const { allowances, deductions } = req.body

    payroll.allowances = allowances || payroll.allowances
    payroll.deductions = deductions || payroll.deductions

    // Recalculate totals
    payroll.totalAllowances = 
      (allowances.hra || 0) + 
      (allowances.transport || 0) + 
      (allowances.medical || 0) + 
      (allowances.other || 0)

    payroll.totalDeductions = 
      (deductions.tax || 0) + 
      (deductions.providentFund || 0) + 
      (deductions.other || 0)

    payroll.netSalary = payroll.basicSalary + payroll.totalAllowances - payroll.totalDeductions

    await payroll.save()

    const result = await Payroll.findById(payroll._id)
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email' }
      })
    return res.json(result)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

module.exports = router;