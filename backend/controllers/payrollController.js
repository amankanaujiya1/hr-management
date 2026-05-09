const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

// @POST /api/payroll/generate/:employeeId - Admin only
const generatePayroll = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { month, year, allowances, deductions } = req.body;

    // Check if payroll already generated for this month
    const existing = await Payroll.findOne({
      employee: employee._id,
      month,
      year
    });
    if (existing) {
      return res.status(400).json({ message: 'Payroll already generated for this month' });
    }

    const basicSalary = employee.salary;

    // Calculate allowances
    const hra = allowances?.hra || basicSalary * 0.4;
    const transport = allowances?.transport || 2000;
    const medical = allowances?.medical || 1500;
    const otherAllowances = allowances?.other || 0;
    const totalAllowances = hra + transport + medical + otherAllowances;

    // Calculate deductions
    const tax = deductions?.tax || basicSalary * 0.1;
    const providentFund = deductions?.providentFund || basicSalary * 0.12;
    const otherDeductions = deductions?.other || 0;
    const totalDeductions = tax + providentFund + otherDeductions;

    // Calculate net salary
    const netSalary = basicSalary + totalAllowances - totalDeductions;

    const payroll = new Payroll({
      employee: employee._id,
      month,
      year,
      basicSalary,
      allowances: { hra, transport, medical, other: otherAllowances },
      deductions: { tax, providentFund, other: otherDeductions },
      totalAllowances,
      totalDeductions,
      netSalary,
      generatedBy: req.user._id
    });

    await payroll.save();
    const result = await Payroll.findById(payroll._id)
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('generatedBy', 'name email');

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @GET /api/payroll - Admin & HR views all
const getAllPayroll = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('generatedBy', 'name email')
      .sort({ year: -1, month: -1 });
    return res.json(payrolls);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @GET /api/payroll/my - Employee views own payslips
const getMyPayroll = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const payrolls = await Payroll.find({ employee: employee._id })
      .sort({ year: -1, month: -1 });
    return res.json(payrolls);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @PUT /api/payroll/:id - Admin marks as paid
const markAsPaid = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    if (payroll.status === 'paid') {
      return res.status(400).json({ message: 'Salary already marked as paid' });
    }

    payroll.status = 'paid';
    payroll.paidOn = new Date();
    await payroll.save();

    const result = await Payroll.findById(payroll._id)
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email' }
      });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { generatePayroll, getAllPayroll, getMyPayroll, markAsPaid };