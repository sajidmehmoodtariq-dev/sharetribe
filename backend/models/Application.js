const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // References
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required']
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Applicant ID is required']
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employer ID is required']
  },

  // Application Details
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'interviewing', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },

  // Employer Notes
  employerNotes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  // Interview Details
  interviewScheduled: {
    type: Boolean,
    default: false
  },
  interviewDate: Date,
  interviewLocation: String,
  interviewNotes: String,

  // Timestamps
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  statusUpdatedAt: Date,
  
  // Flags
  isActive: {
    type: Boolean,
    default: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ applicantId: 1 });
applicationSchema.index({ employerId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ appliedAt: -1 });

// Prevent duplicate applications
applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
