const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// User data
const users = [
  {
    // Employee/Job Hunter
    email: 'employee@test.com',
    password: 'password123',
    fullName: 'John Smith',
    mobileNumber: '+61412345678',
    role: 'employee',
    selectedGoal: 'find-work',
    
    // Personal Details
    dateOfBirth: new Date('1990-05-15'),
    address: '123 Main Street, Sydney, NSW 2000',
    profileImage: 'https://via.placeholder.com/150',
    showEmailOnProfile: true,
    showMobileOnProfile: true,
    personalSummary: 'Experienced software developer with 8+ years in full-stack development. Passionate about creating efficient and scalable applications. Strong problem-solving skills and excellent team player.',
    
    // Work Experience
    workExperience: {
      workStatus: 'currently-working',
      employmentTypes: {
        fullTime: true,
        partTime: false,
        casual: false
      },
      selectedIndustry: 'Technology',
      selectedRole: 'Software Developer',
      jobTitle: 'Senior Full Stack Developer',
      companyName: 'Tech Solutions Pty Ltd',
      employmentDurationFrom: new Date('2018-03-01'),
      employmentDurationTo: null,
      workExperienceSummary: 'Led development of multiple web applications using React, Node.js, and MongoDB. Mentored junior developers and implemented best practices for code quality and testing.',
      highestEducation: 'Bachelor of Computer Science',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'TypeScript', 'Python', 'AWS'],
      licenses: ['Driver\'s License', 'Working with Children Check']
    },
    
    // Availability
    availability: {
      morning: true,
      afternoon: true,
      evening: false,
      dateFrom: new Date('2024-12-01'),
      dateTo: new Date('2025-06-30'),
      noticePreference: '2-weeks'
    },
    
    // Onboarding
    onboarding: {
      personalDetailsCompleted: true,
      workExperienceCompleted: true,
      availabilityCompleted: true,
      businessSummaryCompleted: false,
      personalSummaryCompleted: true,
      completed: true
    },
    
    // Profile Completion
    profileCompleted: true,
    onboardingStep: 4,
    
    // Account Status
    isActive: true,
    isVerified: true,
    subscriptionStatus: 'none',
    
    // Metadata
    lastLogin: new Date(),
    loginAttempts: 0
  },
  {
    // Employer/Head Hunter
    email: 'employer@test.com',
    password: 'password123',
    fullName: 'Sarah Johnson',
    mobileNumber: '+61498765432',
    role: 'employer',
    selectedGoal: 'find-workers',
    
    // Personal Details
    dateOfBirth: new Date('1985-08-22'),
    address: '456 Business Ave, Melbourne, VIC 3000',
    profileImage: 'https://via.placeholder.com/150',
    showEmailOnProfile: true,
    showMobileOnProfile: true,
    
    // Business Details
    businessDetails: {
      businessName: 'Innovation Corp',
      country: 'Australia',
      businessAddress: '456 Business Ave, Melbourne, VIC 3000',
      industry: 'Technology & IT Services',
      businessSize: '50-200 employees',
      yourRole: 'HR Manager',
      website: 'https://innovationcorp.com.au',
      abn: '12 345 678 901',
      businessSummary: 'Innovation Corp is a leading technology company specializing in enterprise software solutions. We provide cutting-edge products and services to clients across Australia and the Asia-Pacific region. Our team is passionate about innovation and creating impactful technology solutions.'
    },
    
    // Onboarding
    onboarding: {
      personalDetailsCompleted: true,
      workExperienceCompleted: false,
      availabilityCompleted: false,
      businessSummaryCompleted: true,
      personalSummaryCompleted: false,
      completed: true
    },
    
    // Profile Completion
    profileCompleted: true,
    onboardingStep: 4,
    
    // Account Status
    isActive: true,
    isVerified: true,
    subscriptionStatus: 'active',
    
    // Metadata
    lastLogin: new Date(),
    loginAttempts: 0
  }
];

// Seed database
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing users (optional - comment out if you want to keep existing data)
    await User.deleteMany({ email: { $in: ['employee@test.com', 'employer@test.com'] } });
    console.log('🗑️  Cleared existing test users\n');

    // Create users
    for (const userData of users) {
      const user = await User.create(userData);
      console.log(`✅ Created ${user.role}: ${user.email}`);
      console.log(`   Name: ${user.fullName}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Profile Completed: ${user.profileCompleted}`);
      console.log(`   Onboarding Step: ${user.onboardingStep}`);
      if (user.role === 'employee') {
        console.log(`   Industry: ${user.workExperience.selectedIndustry}`);
        console.log(`   Job Title: ${user.workExperience.jobTitle}`);
        console.log(`   Skills: ${user.workExperience.skills.join(', ')}`);
      } else {
        console.log(`   Business: ${user.businessDetails.businessName}`);
        console.log(`   Industry: ${user.businessDetails.industry}`);
        console.log(`   Subscription: ${user.subscriptionStatus}`);
      }
      console.log('');
    }

    console.log('✨ Database seeding completed successfully!\n');
    console.log('📝 Test Credentials:');
    console.log('   Employee Login:');
    console.log('   - Email: employee@test.com');
    console.log('   - Password: password123\n');
    console.log('   Employer Login:');
    console.log('   - Email: employer@test.com');
    console.log('   - Password: password123\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding script
connectDB().then(() => seedDatabase());
