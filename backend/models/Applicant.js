const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  resumeLink: {
    type: String
  },
  coverLetter: {
    type: String
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'interviewed', 'selected', 'rejected'],
    default: 'applied'
  }
}, { timestamps: true });

module.exports = mongoose.model('Applicant', applicantSchema);