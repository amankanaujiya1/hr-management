const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// @POST /api/leaves - Employee applies for leave
const applyLeave = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;
    const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays <= 0) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const leave = new Leave({
      employee: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason
    });

    await leave.save();
    return res.status(201).json(leave);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @GET /api/leaves/my - Employee views own leaves
const getMyLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const leaves = await Leave.find({ employee: employee._id })
      .sort({ createdAt: -1 });
    return res.json(leaves);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @GET /api/leaves - Admin & HR views all leaves
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });
    return res.json(leaves);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @PUT /api/leaves/:id - Admin & HR approves or rejects
const updateLeaveStatus = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

  
    const { status, reviewNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewNote = reviewNote || '';

    await leave.save();

    const result = await Leave.findById(leave._id)
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('reviewedBy', 'name email');

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// @DELETE /api/leaves/:id - Employee cancels own pending leave
const cancelLeave = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.employee.toString() !== employee._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this leave' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: `Cannot cancel a ${leave.status} leave` });
    }

    await Leave.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Leave request cancelled successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, cancelLeave };