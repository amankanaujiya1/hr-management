const Applicant = require('../models/Applicant');
const Job = require('../models/Job');

// @POST /api/applicants - Anyone can apply
const applyForJob = async (req, res) => {
  try {
    const { jobId, name, email, phone, experience, resumeLink, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.status === 'closed') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const alreadyApplied = await Applicant.findOne({ job: jobId, email });
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const applicant = new Applicant({
      job: jobId,
      name,
      email,
      phone,
      experience,
      resumeLink,
      coverLetter
    });
    await applicant.save();
    return res.status(201).json(applicant);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @GET /api/applicants - Admin & HR only
const getAllApplicants = async (req, res) => {
  try {
    const applicants = await Applicant.find().populate('job', 'title department');
    return res.json(applicants);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @GET /api/applicants/job/:jobId - Admin & HR only
const getApplicantsByJob = async (req, res) => {
  try {
    const applicants = await Applicant.find({ job: req.params.jobId }).populate('job', 'title department');
    return res.json(applicants);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @PUT /api/applicants/:id - Admin & HR only
const updateApplicantStatus = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }
    applicant.status = req.body.status || applicant.status;
    await applicant.save();
    return res.json(applicant);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { applyForJob, getAllApplicants, getApplicantsByJob, updateApplicantStatus };