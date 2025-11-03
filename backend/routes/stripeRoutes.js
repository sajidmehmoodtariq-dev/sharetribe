const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const { protect } = require('../middleware/auth');

// Public route for signup checkout
router.post('/create-checkout-session', stripeController.createCheckoutSession);

// Webhook route (public but verified with Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

// Protected routes
router.get('/subscription', protect, stripeController.getSubscription);
router.post('/cancel-subscription', protect, stripeController.cancelSubscription);

module.exports = router;
