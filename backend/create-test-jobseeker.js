const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  
  console.log('=== CREATING TEST JOB SEEKER ACCOUNT ===\n');
  
  // Generate random email to avoid duplicates
  const timestamp = Date.now();
  const email = `jobseeker${timestamp}@test.com`;
  
  const testJobSeeker = {
    fullName: 'Test Job Hunter',
    email: email,
    password: 'Test123!', // Plain password - will be hashed by pre-save hook
    mobileNumber: '+1234567890',
    role: 'employee',
    isVerified: true,
    selectedGoal: 'find-work',
    personalDetails: {
      dateOfBirth: new Date('1995-05-15'),
      address: '123 Main St, New York, NY 10001',
      profileImage: 'https://ui-avatars.com/api/?name=Test+Hunter&background=10b981&color=fff',
      showEmailOnProfile: true,
      showMobileOnProfile: true
    },
    personalSummary: {
      summary: 'Experienced professional looking for new opportunities. Skilled in various domains with a passion for excellence. Strong background in technology and software development.'
    },
    workExperience: {
      workStatus: 'worked-before',
      employmentTypes: ['full-time', 'part-time'],
      industry: 'Technology',
      role: 'Software Developer',
      yearsOfExperience: '3-5 years',
      highestEducation: 'Bachelor\'s Degree',
      currentJobTitle: 'Senior Developer',
      currentCompany: 'Tech Solutions Inc',
      employmentDurationFrom: '2020-01',
      employmentDurationTo: '2023-06',
      workExperienceSummary: 'Experienced developer with 5+ years in web development. Skilled in JavaScript, React, Node.js, and MongoDB. Built scalable applications for various clients.'
    },
    availability: {
      dateRange: {
        from: new Date(),
        to: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
      },
      noticePreference: '2-weeks',
      preferredWorkTimes: ['morning', 'afternoon']
    }
  };
  
  try {
    const existingUser = await User.findOne({ email: testJobSeeker.email });
    
    if (existingUser) {
      console.log('❌ User with this email already exists');
      mongoose.connection.close();
      return;
    }
    
    const newUser = await User.create(testJobSeeker);
    
    console.log('✅ Test Job Seeker Created Successfully!\n');
    console.log('Account Details:');
    console.log('================');
    console.log('Name:', newUser.fullName);
    console.log('Email:', newUser.email);
    console.log('Password: Test123!');
    console.log('Role:', newUser.role);
    console.log('User ID:', newUser._id);
    console.log('\nProfile:');
    console.log('Mobile:', newUser.mobileNumber);
    console.log('Address:', newUser.personalDetails?.address);
    console.log('Summary:', newUser.personalSummary?.summary?.substring(0, 60) + '...');
    console.log('Work Status:', newUser.workExperience?.workStatus);
    console.log('Industry:', newUser.workExperience?.industry);
    console.log('Current Role:', newUser.workExperience?.role);
    console.log('Years of Experience:', newUser.workExperience?.yearsOfExperience);
    console.log('\n✅ You can now login with these credentials!');
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  }
  
  mongoose.connection.close();
}).catch(err => {
  console.error('Error connecting to database:', err);
  process.exit(1);
});
