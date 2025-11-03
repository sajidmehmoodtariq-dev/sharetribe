const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Onboarding routes
router.post('/personal-details', onboardingController.updatePersonalDetails);
router.post('/work-experience', onboardingController.updateWorkExperience);
router.post('/availability', onboardingController.updateAvailability);
router.post('/business-summary', onboardingController.updateBusinessSummary);
router.post('/personal-summary', onboardingController.updatePersonalSummary);
router.get('/profile', onboardingController.getCurrentProfile);

module.exports = router;
