const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const { protect } = require('../middleware/auth');

// Public route for first onboarding step (creates user)
router.post('/personal-details', onboardingController.updatePersonalDetails);

// Protected routes for subsequent steps
router.use(protect);
router.post('/work-experience', onboardingController.updateWorkExperience);
router.post('/availability', onboardingController.updateAvailability);
router.post('/business-summary', onboardingController.updateBusinessSummary);
router.post('/personal-summary', onboardingController.updatePersonalSummary);
router.get('/profile', onboardingController.getCurrentProfile);

module.exports = router;
