const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const notificationController = require('./notificationController');

// Apply for a job
exports.applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, resumeUrl, resumeFileName, resumeFileSize } = req.body;
    const applicantId = req.user._id;

    // Validate job exists and is published
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'published') {
      return res.status(400).json({ error: 'This job is not accepting applications' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ jobId, applicantId });
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Create application
    const application = await Application.create({
      jobId,
      applicantId,
      employerId: job.employerId,
      coverLetter,
      resumeUrl,
      resumeFileName,
      resumeFileSize,
      status: 'pending'
    });

    // Increment job application count
    await Job.findByIdAndUpdate(jobId, { $inc: { totalApplications: 1 } });

    // Get applicant details
    const applicant = await User.findById(applicantId);

    // Notify employer about new application
    await notificationController.notifyNewApplication(application._id, {
      jobId,
      jobTitle: job.jobDetails?.jobTitle,
      applicantName: applicant.fullName
    }, job.employerId);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all applications for a job seeker
exports.getMyApplications = async (req, res) => {
  try {
    const applicantId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { applicantId };
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get applications with pagination
    const applications = await Application.find(query)
      .populate('jobId', 'jobDetails companyName status postJob')
      .populate('employerId', 'fullName businessSummary')
      .sort({ appliedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      applications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all applications for an employer's job
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    // Verify job belongs to employer
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to view these applications' });
    }

    // Build query
    const query = { jobId };
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get applications
    const applications = await Application.find(query)
      .populate('applicantId', 'fullName email personalSummary workExperience availability')
      .sort({ appliedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      applications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all applications for employer (across all jobs)
exports.getAllEmployerApplications = async (req, res) => {
  try {
    const employerId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { employerId };
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get applications
    const applications = await Application.find(query)
      .populate('applicantId', 'fullName email personalSummary')
      .populate('jobId', 'jobDetails companyName')
      .sort({ appliedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      applications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update application status (employer only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, employerNotes, interviewDate, interviewLocation } = req.body;

    // Find application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify employer owns the job
    if (application.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this application' });
    }

    // Update application
    application.status = status || application.status;
    application.statusUpdatedAt = new Date();
    
    if (employerNotes) application.employerNotes = employerNotes;
    if (interviewDate) {
      application.interviewScheduled = true;
      application.interviewDate = interviewDate;
      application.interviewLocation = interviewLocation;
    }

    if (status === 'reviewing' || status === 'shortlisted') {
      application.reviewedAt = new Date();
    }

    await application.save();

    // Get job details for notification
    const job = await Job.findById(application.jobId);
    
    // Notify applicant about status change
    await notificationController.notifyApplicationStatusChange({
      _id: application._id,
      jobId: application.jobId,
      jobTitle: job?.jobDetails?.jobTitle,
      status: application.status
    }, application.applicantId);

    // If assigned, notify about job assignment
    if (status === 'accepted') {
      await notificationController.notifyJobAssigned(
        application.jobId,
        job?.jobDetails?.jobTitle,
        application.applicantId,
        application.employerId
      );
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      application
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Withdraw application (job seeker only)
exports.withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Find application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify applicant owns the application
    if (application.applicantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to withdraw this application' });
    }

    // Update status
    application.status = 'withdrawn';
    application.statusUpdatedAt = new Date();
    await application.save();

    // Decrement job application count
    await Job.findByIdAndUpdate(application.jobId, { $inc: { totalApplications: -1 } });

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update/Edit application (job seeker only)
exports.updateApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { coverLetter, resumeUrl, resumeFileName, resumeFileSize } = req.body;

    // Find application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify applicant owns the application
    if (application.applicantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this application' });
    }

    // Don't allow updates if application is not in pending or reviewing status
    if (!['pending', 'reviewing'].includes(application.status)) {
      return res.status(400).json({ 
        error: 'Cannot update application in current status. Applications can only be edited when pending or under review.' 
      });
    }

    // Update fields
    if (coverLetter !== undefined) application.coverLetter = coverLetter;
    if (resumeUrl !== undefined) application.resumeUrl = resumeUrl;
    if (resumeFileName !== undefined) application.resumeFileName = resumeFileName;
    if (resumeFileSize !== undefined) application.resumeFileSize = resumeFileSize;

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get application statistics for employer
exports.getApplicationStats = async (req, res) => {
  try {
    const employerId = req.user._id;

    const stats = await Application.aggregate([
      { $match: { employerId: mongoose.Types.ObjectId(employerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Application.countDocuments({ employerId });

    res.status(200).json({
      success: true,
      stats,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single application details
exports.getApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate('jobId')
      .populate('applicantId', '-password')
      .populate('employerId', 'fullName businessSummary');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify user has access
    const userId = req.user._id.toString();
    const isApplicant = application.applicantId._id.toString() === userId;
    const isEmployer = application.employerId._id.toString() === userId;

    if (!isApplicant && !isEmployer) {
      return res.status(403).json({ error: 'Not authorized to view this application' });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
