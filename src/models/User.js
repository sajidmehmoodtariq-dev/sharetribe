// User schema structure for MongoDB
export const UserSchema = {
  // Common fields
  email: String,
  password: String, // hashed
  fullName: String,
  mobileNumber: String,
  role: String, // 'employee' or 'employer'
  createdAt: Date,
  updatedAt: Date,

  // Employee (job seeker) specific fields
  profileImage: String,
  showEmailOnProfile: Boolean,
  showMobileOnProfile: Boolean,
  dateOfBirth: String,
  address: String,
  personalSummary: String,
  
  // Work Experience
  hasWorkedBefore: Boolean,
  currentlyWorking: Boolean,
  highestEducation: String,
  jobTitle: String,
  companyName: String,
  employmentDuration: {
    from: String,
    to: String,
  },
  workExperienceSummary: String,
  employmentType: [String], // ['full-time', 'part-time', 'casual']
  industryType: [String],
  mainRole: [String],
  searchIndustry: [String],
  
  // Skills
  skills: [String],
  
  // Availability
  workAvailability: {
    timePreference: [String], // ['morning', 'afternoon', 'evening']
    availableDates: [String],
    immediately: Boolean,
    weekNotice: String, // '1-week', '2-weeks', etc.
  },

  // Employer specific fields
  subscriptionPackage: {
    type: String, // 'user-plus', 'business', etc.
    price: Number,
    benefits: [String],
  },
  selectedGoal: String, // 'find-work', 'find-workers', 'search-companies'
};

export function createUserDocument(data) {
  return {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function sanitizeUser(user) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
