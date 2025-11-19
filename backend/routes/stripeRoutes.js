const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const { protect } = require('../middleware/auth');

// Public route for signup checkout
router.post('/create-checkout-session', stripeController.createCheckoutSession);

// Verify session after payment (public) - must be before webhook
router.post('/verify-session', stripeController.verifySession);

// Webhook route (public but verified with Stripe signature)
// Note: Raw body parser is applied in server.js for this specific route
router.post('/webhook', stripeController.handleWebhook);

// Protected routes
router.get('/subscription', protect, stripeController.getSubscription);
router.post('/cancel-subscription', protect, stripeController.cancelSubscription);

// TEST ONLY - Manually activate subscription (remove in production)
router.post('/test-activate', protect, stripeController.testActivateSubscription);

module.exports = router;
