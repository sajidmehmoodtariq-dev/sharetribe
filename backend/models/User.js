const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Sub-schemas for better organization
const availabilitySchema = new mongoose.Schema({
  morning: { type: Boolean, default: false },
  afternoon: { type: Boolean, default: false },
  evening: { type: Boolean, default: false },
  dateFrom: { type: Date },
  dateTo: { type: Date },
  noticePreference: { 
    type: String, 
    enum: ['immediately', 'any-other', '1-week', '2-weeks'] 
  }
}, { _id: false });

const employmentTypeSchema = new mongoose.Schema({
  fullTime: { type: Boolean, default: false },
  partTime: { type: Boolean, default: false },
  casual: { type: Boolean, default: false }
}, { _id: false });

const workExperienceSchema = new mongoose.Schema({
  workStatus: { 
    type: String, 
    enum: ['first-job', 'worked-before', 'currently-working'] 
  },
  employmentTypes: employmentTypeSchema,
  selectedIndustry: { type: String },
  selectedRole: { type: String },
  jobTitle: { type: String },
  companyName: { type: String },
  employmentDurationFrom: { type: Date },
  employmentDurationTo: { type: Date },
  workExperienceSummary: { type: String },
  highestEducation: { type: String },
  skills: [{ type: String }],
  licenses: [{ type: String }]
}, { _id: false });

const businessDetailsSchema = new mongoose.Schema({
  businessName: { type: String },
  country: { type: String },
  businessAddress: { type: String },
  industry: { type: String },
  businessSize: { type: String },
  yourRole: { type: String },
  website: { type: String },
  abn: { type: String },
  businessSummary: { type: String }
}, { _id: false });

const userSchema = new mongoose.Schema({
  // Basic Authentication
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  // Basic Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  mobileNumber: {
    type: String,
    trim: true
  },
  
  // User Role & Goal
  role: {
    type: String,
    enum: ['employee', 'employer', 'admin'],
    required: true,
    default: 'employee'
  },
  selectedGoal: {
    type: String,
    enum: ['find-work', 'find-workers', 'search-companies']
  },
  
  // Personal Details (Employee)
  dateOfBirth: { type: Date },
  address: { type: String },
  profileImage: { type: String }, // Base64 or URL
  showEmailOnProfile: { type: Boolean, default: true },
  showMobileOnProfile: { type: Boolean, default: true },
  personalSummary: { type: String },
  
  // Additional Profile Fields
  profile: {
    firstName: { type: String },
    lastName: { type: String },
    gender: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
    profilePicture: { type: String }, // Base64 compressed image
    companyName: { type: String },
    companySize: { type: String },
    industry: { type: String },
    website: { type: String },
    description: { type: String },
    companyLogo: { type: String }, // Base64 compressed image
    summary: { type: String },
    skills: [{ type: String }],
    certifications: [{ type: String }],
    languages: [{ type: String }],
    workExperience: [{ type: Object }],
    availability: { type: Object }
  },
  
  // Onboarding tracking
  onboarding: {
    personalDetailsCompleted: { type: Boolean, default: false },
    workExperienceCompleted: { type: Boolean, default: false },
    availabilityCompleted: { type: Boolean, default: false },
    businessSummaryCompleted: { type: Boolean, default: false },
    personalSummaryCompleted: { type: Boolean, default: false },
    completed: { type: Boolean, default: false }
  },
  
  // Work Experience (Employee)
  workExperience: workExperienceSchema,
  
  // Availability (Employee)
  availability: availabilitySchema,
  
  // Business Details (Employer)
  businessDetails: businessDetailsSchema,
  
  // Subscription
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  subscriptionStatus: {
    type: String,
    enum: ['none', 'pending', 'active', 'cancelled', 'expired'],
    default: 'none'
  },
  
  // Profile Completion
  profileCompleted: {
    type: Boolean,
    default: false
  },
  onboardingStep: {
    type: Number,
    default: 0
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: { type: String },
  
  // Metadata
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'workExperience.selectedIndustry': 1 });
userSchema.index({ 'workExperience.selectedRole': 1 });
userSchema.index({ subscriptionStatus: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Increment attempts
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Virtual for profile completion percentage
userSchema.virtual('profileCompletionPercentage').get(function() {
  let completed = 0;
  const total = this.role === 'employer' ? 8 : 10;
  
  if (this.fullName) completed++;
  if (this.email) completed++;
  if (this.mobileNumber) completed++;
  
  if (this.role === 'employee') {
    if (this.personalSummary) completed++;
    if (this.workExperience && this.workExperience.workStatus) completed++;
    if (this.workExperience && this.workExperience.selectedIndustry) completed++;
    if (this.workExperience && this.workExperience.selectedRole) completed++;
    if (this.availability && this.availability.dateFrom) completed++;
    if (this.profileImage) completed++;
    if (this.address) completed++;
  } else if (this.role === 'employer') {
    if (this.businessDetails && this.businessDetails.businessName) completed++;
    if (this.businessDetails && this.businessDetails.businessAddress) completed++;
    if (this.businessDetails && this.businessDetails.industry) completed++;
    if (this.businessDetails && this.businessDetails.businessSummary) completed++;
    if (this.subscriptionStatus === 'active') completed++;
  }
  
  return Math.round((completed / total) * 100);
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
