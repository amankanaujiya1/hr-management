const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  salary: {
    min: { type: Number },
    max: { type: Number }
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'contract'],
    default: 'full-time'
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);