const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  dateOfJoining: {
    type: Date,
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);