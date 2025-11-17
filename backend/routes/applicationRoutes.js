const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

// Job Seeker Routes
router.post('/apply', protect, applicationController.applyForJob);
router.get('/my-applications', protect, applicationController.getMyApplications);
router.put('/:applicationId', protect, applicationController.updateApplication);
router.delete('/:applicationId/withdraw', protect, applicationController.withdrawApplication);

// Employer Routes
router.get('/job/:jobId', protect, applicationController.getJobApplications);
router.get('/employer/all', protect, applicationController.getAllEmployerApplications);
router.patch('/:applicationId/status', protect, applicationController.updateApplicationStatus);
router.get('/stats', protect, applicationController.getApplicationStats);

// Shared Routes
router.get('/:applicationId', protect, applicationController.getApplicationDetails);

module.exports = router;
