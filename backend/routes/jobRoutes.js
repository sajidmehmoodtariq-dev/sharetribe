const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

// Create a new job (starts job creation process)
router.post('/create', protect, jobController.createJob);

// Step 1: Save Job Details
router.put('/:jobId/job-details', protect, jobController.saveJobDetails);

// Step 2: Save Job Summary
router.put('/:jobId/job-summary', protect, jobController.saveJobSummary);

// Step 3: Save Qualifications
router.put('/:jobId/qualifications', protect, jobController.saveQualifications);

// Step 4: Save Post Job Details (and optionally publish)
router.put('/:jobId/post-job', protect, jobController.savePostJob);

// Get a single job by ID
router.get('/:jobId', jobController.getJob);

// Get all jobs for an employer
router.get('/employer/:employerId', protect, jobController.getEmployerJobs);

// Get all published jobs (for job seekers to browse)
router.get('/published/list', jobController.getAllPublishedJobs);

// Update job status (publish, close, archive, etc.)
router.patch('/:jobId/status', protect, jobController.updateJobStatus);

// Delete a job
router.delete('/:jobId', protect, jobController.deleteJob);

// Save job (for job seekers)
router.post('/:jobId/save', protect, jobController.saveJob);

// Unsave job (for job seekers)
router.post('/:jobId/unsave', protect, jobController.unsaveJob);

module.exports = router;
