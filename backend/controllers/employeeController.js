const Employee = require('../models/Employee');
const User = require('../models/User');

// @GET /api/employees - Admin & HR only
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate('user', 'name email role');
    return res.json(employees);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @POST /api/employees - Admin & HR only
const createEmployee = async (req, res) => {
  try {
    const {
      name, email, password,
      employeeId, department, designation,
      phone, address, dateOfJoining, salary
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user account for employee
    const user = new User({ name, email, password, role: 'employee' });
    await user.save();

    // Create employee profile
    const employee = new Employee({
      user: user._id,
      employeeId,
      department,
      designation,
      phone,
      address,
      dateOfJoining,
      salary
    });
    await employee.save();

    const result = await Employee.findById(employee._id).populate('user', 'name email role');
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @GET /api/employees/:id - Admin, HR & own employee
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('user', 'name email role');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    return res.json(employee);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @PUT /api/employees/:id - Admin & HR only
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { employeeId, department, designation, phone, address, salary, status } = req.body;

    employee.department = department || employee.department;
    employee.designation = designation || employee.designation;
    employee.phone = phone || employee.phone;
    employee.address = address || employee.address;
    employee.salary = salary || employee.salary;
    employee.status = status || employee.status;
    employee.employeeId = employeeId || employee.employeeId ;

    await employee.save();
    const result = await Employee.findById(employee._id).populate('user', 'name email role');
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/employees/:id - Admin only
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    await User.findByIdAndDelete(employee.user);
    await Employee.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};