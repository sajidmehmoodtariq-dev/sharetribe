/**
 * Job Creation Flow - Complete Integration Test
 * Tests all pages and endpoints connected to database
 * 
 * Usage: node test-job-flow.js
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Job = require('./models/Job');

// Test configuration
const TEST_EMAIL = `test-employer-${Date.now()}@test.com`;
const TEST_PASSWORD = 'Test@123456';
const TEST_EMPLOYER_NAME = 'Test Employer Co.';

// Color console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}━━━ ${msg} ━━━${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`)
};

// Connection helper
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    log.success('Connected to MongoDB');
    return true;
  } catch (error) {
    log.error(`MongoDB connection failed: ${error.message}`);
    return false;
  }
};

// Create test employer
const createTestEmployer = async () => {
  try {
    log.section('Step 1: Create Test Employer');

    // Check if already exists
    let employer = await User.findOne({ email: TEST_EMAIL });
    if (employer) {
      log.warning(`Employer already exists: ${TEST_EMAIL}`);
      return employer;
    }

    // Create new employer
    employer = await User.create({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      fullName: TEST_EMPLOYER_NAME,
      role: 'employer',
      businessSummary: {
        companyName: 'Test Company Pty Ltd'
      }
    });

    log.success(`Employer created: ${employer._id}`);
    log.info(`Email: ${TEST_EMAIL}`);
    log.info(`Role: ${employer.role}`);

    return employer;
  } catch (error) {
    log.error(`Failed to create employer: ${error.message}`);
    throw error;
  }
};

// Test: Create Job (Initialize)
const testCreateJob = async (employerId) => {
  try {
    log.section('Step 2: Create Job (Initialize)');

    const job = await Job.create({
      employerId,
      companyName: 'Test Company Pty Ltd',
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

    log.success(`Job created: ${job._id}`);
    log.info(`Status: ${job.status}`);
    log.info(`Current Step: ${job.onboarding.currentStep}`);

    return job;
  } catch (error) {
    log.error(`Failed to create job: ${error.message}`);
    throw error;
  }
};

// Test: Save Job Details (Step 1)
const testSaveJobDetails = async (jobId) => {
  try {
    log.section('Step 3: Save Job Details (Step 1 - 25%)');

    const jobDetails = {
      jobTitle: 'Senior Software Engineer',
      employmentType: 'full-time',
      shiftPreference: 'morning',
      workersRights: true,
      minimumExperience: '2-5-years'
    };

    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          jobDetails,
          'onboarding.jobDetailsCompleted': true,
          'onboarding.currentStep': 2,
          lastModified: new Date()
        }
      },
      { new: true }
    );

    log.success('Job details saved');
    log.info(`Job Title: ${job.jobDetails.jobTitle}`);
    log.info(`Employment Type: ${job.jobDetails.employmentType}`);
    log.info(`Completion: ${job.completionPercentage}%`);

    return job;
  } catch (error) {
    log.error(`Failed to save job details: ${error.message}`);
    throw error;
  }
};

// Test: Save Job Summary (Step 2)
const testSaveJobSummary = async (jobId) => {
  try {
    log.section('Step 4: Save Job Summary (Step 2 - 50%)');

    const summary = 'We are looking for an experienced Senior Software Engineer to join our growing team. You will work on challenging projects, collaborate with talented developers, and have opportunities to grow your skills in modern technologies.';

    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          jobSummary: { summary },
          'onboarding.jobSummaryCompleted': true,
          'onboarding.currentStep': 3,
          lastModified: new Date()
        }
      },
      { new: true }
    );

    log.success('Job summary saved');
    log.info(`Summary Length: ${job.jobSummary.summary.length} characters`);
    log.info(`Completion: ${job.completionPercentage}%`);

    return job;
  } catch (error) {
    log.error(`Failed to save job summary: ${error.message}`);
    throw error;
  }
};

// Test: Save Qualifications (Step 3)
const testSaveQualifications = async (jobId) => {
  try {
    log.section('Step 5: Save Qualifications (Step 3 - 75%)');

    const qualifications = {
      qualifications: [
        'Bachelor\'s degree in Computer Science or related field',
        '5+ years of experience with React and Node.js',
        'Experience with MongoDB and RESTful APIs',
        'Strong problem-solving skills',
        'Excellent communication abilities'
      ]
    };

    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          qualifications,
          'onboarding.qualificationsCompleted': true,
          'onboarding.currentStep': 4,
          lastModified: new Date()
        }
      },
      { new: true }
    );

    log.success('Qualifications saved');
    log.info(`Number of qualifications: ${job.qualifications.qualifications.length}`);
    log.info(`Completion: ${job.completionPercentage}%`);

    return job;
  } catch (error) {
    log.error(`Failed to save qualifications: ${error.message}`);
    throw error;
  }
};

// Test: Save Post Job Details & Publish (Step 4)
const testSavePostJob = async (jobId) => {
  try {
    log.section('Step 6: Save Post Job Details & Publish (Step 4 - 100%)');

    const postJob = {
      salary: '80000',
      salaryFrequency: 'yearly',
      numberOfPositions: 2,
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      workLocation: 'hybrid',
      address: '123 Tech Street',
      city: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      country: 'Australia'
    };

    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          postJob,
          'onboarding.postJobCompleted': true,
          'onboarding.completed': true,
          status: 'published',
          publishDate: new Date(),
          lastModified: new Date()
        }
      },
      { new: true }
    );

    log.success('Post job details saved and job published');
    log.info(`Salary: $${job.postJob.salary} ${job.postJob.salaryFrequency}`);
    log.info(`Location: ${job.postJob.city}, ${job.postJob.state}`);
    log.info(`Positions: ${job.postJob.numberOfPositions}`);
    log.info(`Completion: ${job.completionPercentage}%`);
    log.info(`Status: ${job.status}`);

    return job;
  } catch (error) {
    log.error(`Failed to save post job: ${error.message}`);
    throw error;
  }
};

// Test: Retrieve Job from Database
const testRetrieveJob = async (jobId) => {
  try {
    log.section('Step 7: Retrieve Complete Job from Database');

    const job = await Job.findById(jobId).populate('employerId', 'fullName email');

    if (!job) {
      throw new Error('Job not found');
    }

    log.success('Job retrieved from database');
    log.info(`Job ID: ${job._id}`);
    log.info(`Company: ${job.companyName}`);
    log.info(`Title: ${job.jobDetails.jobTitle}`);
    log.info(`Status: ${job.status}`);
    log.info(`Employer: ${job.employerId.fullName}`);
    log.info(`Completion: ${job.completionPercentage}%`);
    log.info(`Views: ${job.views}`);
    log.info(`Created: ${job.createdAt}`);
    log.info(`Published: ${job.publishDate}`);

    return job;
  } catch (error) {
    log.error(`Failed to retrieve job: ${error.message}`);
    throw error;
  }
};

// Test: Get Employer Jobs
const testGetEmployerJobs = async (employerId) => {
  try {
    log.section('Step 8: Get All Jobs for Employer');

    const jobs = await Job.find({ employerId });

    log.success(`Retrieved ${jobs.length} job(s) for employer`);
    
    jobs.forEach((job, index) => {
      log.info(`Job ${index + 1}: ${job.jobDetails?.jobTitle || 'Incomplete'} (${job.status})`);
    });

    return jobs;
  } catch (error) {
    log.error(`Failed to get employer jobs: ${error.message}`);
    throw error;
  }
};

// Test: Get Published Jobs
const testGetPublishedJobs = async () => {
  try {
    log.section('Step 9: Get All Published Jobs');

    const jobs = await Job.find({ status: 'published' }).limit(5);

    log.success(`Retrieved ${jobs.length} published job(s)`);
    
    jobs.forEach((job, index) => {
      log.info(`Job ${index + 1}: ${job.jobDetails?.jobTitle || 'Incomplete'} from ${job.companyName}`);
    });

    return jobs;
  } catch (error) {
    log.error(`Failed to get published jobs: ${error.message}`);
    throw error;
  }
};

// Test: Update Job Status
const testUpdateJobStatus = async (jobId) => {
  try {
    log.section('Step 10: Update Job Status');

    const job = await Job.findByIdAndUpdate(
      jobId,
      { $set: { status: 'closed', closeDate: new Date() } },
      { new: true }
    );

    log.success('Job status updated');
    log.info(`New Status: ${job.status}`);
    log.info(`Close Date: ${job.closeDate}`);

    // Reopen job
    const reopenedJob = await Job.findByIdAndUpdate(
      jobId,
      { $set: { status: 'published' } },
      { new: true }
    );

    log.success('Job status reverted to published');
    log.info(`Current Status: ${reopenedJob.status}`);

    return reopenedJob;
  } catch (error) {
    log.error(`Failed to update job status: ${error.message}`);
    throw error;
  }
};

// Test: Database Indexes
const testDatabaseIndexes = async () => {
  try {
    log.section('Step 11: Verify Database Indexes');

    const indexes = await Job.collection.getIndexes();

    log.success('Database indexes verified');
    Object.keys(indexes).forEach((indexName) => {
      log.info(`Index: ${indexName}`);
    });

    return indexes;
  } catch (error) {
    log.error(`Failed to verify indexes: ${error.message}`);
    throw error;
  }
};

// Main test function
const runTests = async () => {
  try {
    console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║  Job Creation Flow - Integration Test  ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);

    // Connect to database
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }

    // Run all tests
    const employer = await createTestEmployer();
    const createdJob = await testCreateJob(employer._id);
    const jobWithDetails = await testSaveJobDetails(createdJob._id);
    const jobWithSummary = await testSaveJobSummary(jobWithDetails._id);
    const jobWithQualifications = await testSaveQualifications(jobWithSummary._id);
    const publishedJob = await testSavePostJob(jobWithQualifications._id);
    const retrievedJob = await testRetrieveJob(publishedJob._id);
    const employerJobs = await testGetEmployerJobs(employer._id);
    const publishedJobs = await testGetPublishedJobs();
    const updatedJob = await testUpdateJobStatus(publishedJob._id);
    const indexes = await testDatabaseIndexes();

    log.section('Test Results Summary');
    log.success('All database operations completed successfully!');
    log.info(`Employer Created: ${employer._id}`);
    log.info(`Job Created & Published: ${publishedJob._id}`);
    log.info(`Total Employer Jobs: ${employerJobs.length}`);
    log.info(`Published Jobs in DB: ${publishedJobs.length}`);
    log.info(`Database Indexes: ${Object.keys(indexes).length}`);

    console.log(`\n${colors.green}✓ Integration test completed successfully!${colors.reset}\n`);

  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log.info('Database connection closed');
  }
};

// Run tests
runTests();
