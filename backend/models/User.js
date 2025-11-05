const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Personal Details Schema - Step 1
const personalDetailsSchema = new mongoose.Schema({
  dateOfBirth: { type: Date },
  address: { type: String },
  profileImage: { type: String }, // Base64 compressed image
  showEmailOnProfile: { type: Boolean, default: true },
  showMobileOnProfile: { type: Boolean, default: true }
}, { _id: false });

// Personal Summary Schema - Step 2
const personalSummarySchema = new mongoose.Schema({
  summary: { type: String }
}, { _id: false });

// Work Experience Schema - Step 3
const workExperienceSchema = new mongoose.Schema({
  workStatus: { 
    type: String, 
    enum: ['first-job', 'worked-before', 'currently-working'] 
  },
  employmentTypes: [{ type: String }], // ['full-time', 'part-time', 'casual']
  industry: { type: String },
  role: { type: String },
  yearsOfExperience: { type: String },
  highestEducation: { type: String },
  currentJobTitle: { type: String },
  currentCompany: { type: String },
  employmentDurationFrom: { type: String },
  employmentDurationTo: { type: String },
  workExperienceSummary: { type: String }
}, { _id: false });

// Availability Schema - Step 4
const availabilitySchema = new mongoose.Schema({
  dateRange: {
    from: { type: Date },
    to: { type: Date }
  },
  noticePreference: { 
    type: String, 
    enum: ['immediately', '1-week', '2-weeks', '1-month', 'flexible'] 
  },
  preferredWorkTimes: [{ type: String }] // ['morning', 'afternoon', 'evening']
}, { _id: false });

// Business Summary Schema - For Employers
const businessSummarySchema = new mongoose.Schema({
  companyName: { type: String },
  companySize: { type: String },
  industry: { type: String },
  website: { type: String },
  description: { type: String },
  companyLogo: { type: String }, // Base64 compressed image
  country: { type: String },
  address: { type: String },
  abn: { type: String },
  yourRole: { type: String }
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
    minlength: [8, 'Password must be at least 8 characters']
  },
  
  // Basic Information (from signup page)
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  mobileNumber: {
    type: String,
    trim: true
  },
  
  // User Role & Goal (from role selection)
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
  
  // Onboarding Data - Each page stored as separate object
  personalDetails: personalDetailsSchema,
  personalSummary: personalSummarySchema,
  workExperience: workExperienceSchema,
  availability: availabilitySchema,
  businessSummary: businessSummarySchema,
  
  // Onboarding Progress Tracking
  onboarding: {
    personalDetailsCompleted: { type: Boolean, default: false },
    personalSummaryCompleted: { type: Boolean, default: false },
    workExperienceCompleted: { type: Boolean, default: false },
    availabilityCompleted: { type: Boolean, default: false },
    businessSummaryCompleted: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    currentStep: { type: Number, default: 1 }
  },
  
  // Subscription
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  subscriptionStatus: {
    type: String,
    enum: ['none', 'pending', 'active', 'cancelled', 'expired', 'failed'],
    default: 'none'
  },
  subscriptionCustomerId: { type: String }, // Stripe customer ID
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
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
userSchema.index({ 'workExperience.industry': 1 });
userSchema.index({ 'workExperience.role': 1 });
userSchema.index({ subscriptionStatus: 1 });
userSchema.index({ subscriptionCustomerId: 1 });

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
  const total = this.role === 'employer' ? 5 : 6;
  
  // Basic info
  if (this.fullName) completed++;
  if (this.email) completed++;
  
  if (this.role === 'employee') {
    if (this.onboarding.personalDetailsCompleted) completed++;
    if (this.onboarding.personalSummaryCompleted) completed++;
    if (this.onboarding.workExperienceCompleted) completed++;
    if (this.onboarding.availabilityCompleted) completed++;
  } else if (this.role === 'employer') {
    if (this.onboarding.personalDetailsCompleted) completed++;
    if (this.onboarding.businessSummaryCompleted) completed++;
    if (this.subscriptionStatus === 'active') completed++;
  }
  
  return Math.round((completed / total) * 100);
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
