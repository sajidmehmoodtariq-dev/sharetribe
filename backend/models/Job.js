const mongoose = require('mongoose');

// Job Details Schema - Step 1
const jobDetailsSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'casual', 'contract'],
    required: [true, 'Employment type is required']
  },
  industryType: {
    type: String,
    required: [true, 'Industry type is required'],
    trim: true
  },
  minimumExperience: {
    type: String,
    enum: ['no-experience', '1-2-years', '2-5-years', '5-10-years', '10plus-years'],
    required: [true, 'Minimum experience is required']
  }
}, { _id: false });

// Job Summary Schema - Step 2
const jobSummarySchema = new mongoose.Schema({
  summary: {
    type: String,
    required: [true, 'Job summary is required'],
    maxlength: [5000, 'Job summary cannot exceed 5000 characters']
  }
}, { _id: false });

// Qualifications Schema - Step 3
const qualificationsSchema = new mongoose.Schema({
  qualifications: [{
    type: String,
    trim: true
  }]
}, { _id: false });

// Post Job Schema - Step 4
const postJobSchema = new mongoose.Schema({
  salary: {
    type: String,
    trim: true
  },
  salaryRange: {
    min: Number,
    max: Number
  },
  salaryFrequency: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'hourly'
  },
  numberOfPositions: {
    type: Number,
    default: 1,
    min: 1
  },
  applicationDeadline: Date,
  closingDate: Date,
  workLocation: {
    type: String,
    enum: ['on-site', 'remote', 'hybrid'],
    required: [true, 'Work location is required']
  },
  address: String,
  city: String,
  state: String,
  postcode: String,
  country: {
    type: String,
    default: 'Australia'
  }
}, { _id: false });

// Main Job Schema
const jobSchema = new mongoose.Schema({
  // Job Information
  jobDetails: jobDetailsSchema,
  jobSummary: jobSummarySchema,
  qualifications: qualificationsSchema,
  postJob: postJobSchema,

  // Employer Reference
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employer ID is required']
  },
  
  // Company Information
  companyName: {
    type: String,
    required: [true, 'Company name is required']
  },
  
  // Job Status & Progress
  status: {
    type: String,
    enum: ['draft', 'published', 'closed', 'filled', 'archived'],
    default: 'draft'
  },
  
  // Onboarding Progress
  onboarding: {
    jobDetailsCompleted: { type: Boolean, default: false },
    jobSummaryCompleted: { type: Boolean, default: false },
    qualificationsCompleted: { type: Boolean, default: false },
    postJobCompleted: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    currentStep: { type: Number, default: 1 }
  },

  // Application Tracking
  totalApplications: {
    type: Number,
    default: 0
  },
  savedByUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Statistics
  views: {
    type: Number,
    default: 0
  },
  
  // Metadata
  publishDate: Date,
  closeDate: Date,
  lastModified: Date,
  
  // Visibility
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
jobSchema.index({ employerId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ 'jobDetails.employmentType': 1 });
jobSchema.index({ 'postJob.workLocation': 1 });
jobSchema.index({ companyName: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ publishDate: -1 });

// Virtual for job completion percentage
jobSchema.virtual('completionPercentage').get(function() {
  const totalSteps = 4;
  let completed = 0;

  if (this.onboarding.jobDetailsCompleted) completed++;
  if (this.onboarding.jobSummaryCompleted) completed++;
  if (this.onboarding.qualificationsCompleted) completed++;
  if (this.onboarding.postJobCompleted) completed++;

  return Math.round((completed / totalSteps) * 100);
});

// Ensure virtuals are included in JSON
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);
