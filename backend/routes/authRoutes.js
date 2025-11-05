const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/check-email', authController.checkEmail);
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Password reset routes (public)
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-code', authController.verifyResetCode);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);
router.put('/profile', protect, authController.updateProfile);
router.put('/onboarding/:step', protect, authController.updateOnboardingStep);

module.exports = router;
