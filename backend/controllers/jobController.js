const Job = require('../models/Job');

// @POST /api/jobs - HR & Admin only
const createJob = async (req, res) => {
  try {
    const { title, department, description, requirements, location, salary, jobType } = req.body;

    const job = new Job({
      title,
      department,
      description,
      requirements,
      location,
      salary,
      jobType,
      postedBy: req.user._id
    });
    await job.save();
    return res.status(201).json(job);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @GET /api/jobs - Anyone can view
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' }).populate('postedBy', 'name email');
    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @GET /api/jobs/:id - Anyone can view
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    return res.json(job);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @PUT /api/jobs/:id - HR & Admin only
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const { title, department, description, requirements, location, salary, jobType, status } = req.body;

    job.title = title || job.title;
    job.department = department || job.department;
    job.description = description || job.description;
    job.requirements = requirements || job.requirements;
    job.location = location || job.location;
    job.salary = salary || job.salary;
    job.jobType = jobType || job.jobType;
    job.status = status || job.status;

    await job.save();
    return res.json(job);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/jobs/:id - HR & Admin only
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    await Job.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createJob, getAllJobs, getJobById, updateJob, deleteJob };