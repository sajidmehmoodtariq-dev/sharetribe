const Job = require('../models/Job');
const User = require('../models/User');

// Create a new job (Initialize job creation)
exports.createJob = async (req, res) => {
  try {
    const { employerId } = req.body;

    // Verify employer exists and is an employer
    const employer = await User.findById(employerId);
    if (!employer) {
      return res.status(404).json({ error: 'Employer not found' });
    }
    if (employer.role !== 'employer') {
      return res.status(403).json({ error: 'User is not an employer' });
    }

    // Create a new job in draft status
    const job = await Job.create({
      employerId,
      companyName: employer.businessSummary?.companyName || employer.fullName,
      status: 'draft',
      onboarding: {
        jobDetailsCompleted: false,
        jobSummaryCompleted: false,
        qualificationsCompleted: false,
        postJobCompleted: false,
        completed: false,
        currentStep: 1
      }
    });

    res.status(201).json({
      success: true,
      message: 'Job creation started',
      job
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Step 1: Save Job Details
exports.saveJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { jobTitle, employmentType, shiftPreference, workersRights, minimumExperience } = req.body;

    // Validate required fields
    if (!jobTitle || !employmentType || !shiftPreference || workersRights === undefined || !minimumExperience) {
      return res.status(400).json({ error: 'All job details fields are required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Update job details
    job.jobDetails = {
      jobTitle,
      employmentType,
      shiftPreference,
      workersRights,
      minimumExperience
    };

    // Mark step as completed and move to next
    job.onboarding.jobDetailsCompleted = true;
    job.onboarding.currentStep = 2;
    job.lastModified = new Date();

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job details saved successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Step 2: Save Job Summary
exports.saveJobSummary = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { summary } = req.body;

    if (!summary || summary.trim().length === 0) {
      return res.status(400).json({ error: 'Job summary is required' });
    }

    if (summary.length > 5000) {
      return res.status(400).json({ error: 'Job summary cannot exceed 5000 characters' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Update job summary
    job.jobSummary = { summary };

    // Mark step as completed and move to next
    job.onboarding.jobSummaryCompleted = true;
    job.onboarding.currentStep = 3;
    job.lastModified = new Date();

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job summary saved successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Step 3: Save Qualifications
exports.saveQualifications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { qualifications } = req.body;

    if (!qualifications || !Array.isArray(qualifications) || qualifications.length === 0) {
      return res.status(400).json({ error: 'At least one qualification is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Filter out empty qualifications
    const filteredQualifications = qualifications.filter(q => q && q.trim().length > 0);

    if (filteredQualifications.length === 0) {
      return res.status(400).json({ error: 'At least one qualification is required' });
    }

    // Update qualifications
    job.qualifications = { qualifications: filteredQualifications };

    // Mark step as completed and move to next
    job.onboarding.qualificationsCompleted = true;
    job.onboarding.currentStep = 4;
    job.lastModified = new Date();

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Qualifications saved successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Step 4: Save Post Job Details and Publish
exports.savePostJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      salary,
      salaryRange,
      salaryFrequency,
      numberOfPositions,
      applicationDeadline,
      workLocation,
      address,
      city,
      state,
      postcode,
      publish = false
    } = req.body;

    if (!workLocation) {
      return res.status(400).json({ error: 'Work location is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Update post job details
    job.postJob = {
      salary: salary || null,
      salaryRange: salaryRange || { min: null, max: null },
      salaryFrequency: salaryFrequency || 'hourly',
      numberOfPositions: numberOfPositions || 1,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      workLocation,
      address: address || null,
      city: city || null,
      state: state || null,
      postcode: postcode || null,
      country: 'Australia'
    };

    // Mark step as completed
    job.onboarding.postJobCompleted = true;
    job.onboarding.completed = true;
    job.onboarding.currentStep = 5; // Completed

    // Publish job if requested
    if (publish) {
      job.status = 'published';
      job.publishDate = new Date();
      job.isActive = true;
    }

    job.lastModified = new Date();
    await job.save();

    res.status(200).json({
      success: true,
      message: publish ? 'Job published successfully' : 'Job details saved successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get job by ID
exports.getJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId).populate('employerId', 'fullName email businessSummary');
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all jobs for an employer
exports.getEmployerJobs = async (req, res) => {
  try {
    const { employerId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    let query = { employerId };
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
      jobs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all published jobs (for job seekers)
exports.getAllPublishedJobs = async (req, res) => {
  try {
    const { page = 1, limit = 100, employmentType, shiftPreference, workLocation, search } = req.query;

    let query = { status: 'published' };

    if (employmentType) {
      query['jobDetails.employmentType'] = employmentType;
    }

    if (shiftPreference) {
      query['jobDetails.shiftPreference'] = shiftPreference;
    }

    if (workLocation) {
      query['postJob.workLocation'] = workLocation;
    }

    if (search) {
      query.$or = [
        { 'jobDetails.jobTitle': { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { 'jobSummary.summary': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
      .populate('employerId', 'fullName email businessSummary mobileNumber')
      .sort({ publishDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
      jobs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update job status
exports.updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;

    const validStatuses = ['draft', 'published', 'closed', 'filled', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid job status' });
    }

    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        status,
        lastModified: new Date(),
        ...(status === 'published' && { publishDate: new Date(), isActive: true }),
        ...(status === 'closed' && { closeDate: new Date(), isActive: false }),
        ...(status === 'draft' && { isActive: false })
      },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      message: `Job status updated to ${status}`,
      job
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if the user is the employer who created this job
    if (job.employerId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(jobId);

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Save job (by job seeker)
exports.saveJob = async (req, res) => {
  try {
    const { jobId, userId } = req.body;

    if (!jobId || !userId) {
      return res.status(400).json({ error: 'Job ID and User ID are required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if already saved
    if (job.savedByUsers.includes(userId)) {
      return res.status(400).json({ error: 'Job already saved' });
    }

    job.savedByUsers.push(userId);
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job saved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unsave job (by job seeker)
exports.unsaveJob = async (req, res) => {
  try {
    const { jobId, userId } = req.body;

    if (!jobId || !userId) {
      return res.status(400).json({ error: 'Job ID and User ID are required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    job.savedByUsers = job.savedByUsers.filter(id => id.toString() !== userId);
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job unsaved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get saved jobs (by job seeker)
exports.getSavedJobs = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find all jobs that have this user in their savedByUsers array
    const savedJobs = await Job.find({
      savedByUsers: userId,
      status: 'published' // Only return published jobs
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      savedJobs: savedJobs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
