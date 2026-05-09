const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @POST /api/attendance/checkin - Employee only
const checkIn = async (req, res) => {
  try {
    // Find employee profile linked to logged in user
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const now = new Date();
    // If check in after 9:30 AM mark as late
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);

    const attendance = new Attendance({
      employee: employee._id,
      date: today,
      checkIn: now,
      status: isLate ? 'late' : 'present'
    });

    await attendance.save();
    return res.status(201).json(attendance);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @PUT /api/attendance/checkout - Employee only
const checkOut = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in found for today' });
    }

    // ✅ Allow re-checkout even if already checked out
    const now = new Date();
    attendance.checkOut = now;

    // Recalculate work hours
    const diffMs = now - attendance.checkIn;
    const diffHours = diffMs / (1000 * 60 * 60);
    attendance.workHours = parseFloat(diffHours.toFixed(2));

    // Update status based on hours
    if (diffHours < 4) {
      attendance.status = 'half-day';
    } else {
      attendance.status = 'present';
    }

    await attendance.save();
    return res.json(attendance);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @GET /api/attendance/my - Employee views own attendance
const getMyAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const attendance = await Attendance.find({ employee: employee._id })
      .sort({ date: -1 });
    return res.json(attendance);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @GET /api/attendance - Admin & HR views all
const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ date: -1 });
    return res.json(attendance);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @POST /api/attendance/mark - Admin & HR mark attendance manually
const markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, notes } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: attendanceDate
    });

    if (existingAttendance) {
      existingAttendance.status = status || existingAttendance.status;
      existingAttendance.notes = notes || existingAttendance.notes;
      await existingAttendance.save();
      return res.json(existingAttendance);
    }

    const attendance = new Attendance({
      employee: employeeId,
      date: attendanceDate,
      status,
      notes
    });

    await attendance.save();
    return res.status(201).json(attendance);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  
};

module.exports = { checkIn, checkOut, getMyAttendance, getAllAttendance, markAttendance };