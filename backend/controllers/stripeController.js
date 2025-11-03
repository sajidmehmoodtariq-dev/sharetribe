const Stripe = require('stripe');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Subscription packages
const PACKAGES = {
  'user-plus': {
    name: 'User +',
    price: 8.00,
    features: {
      unlimitedJobListings: true,
      verifiedCandidates: true,
      analytics: true,
      support: '24/7',
      mobileApp: true
    }
  }
};

// @desc    Create Stripe checkout session for signup
// @route   POST /api/stripe/create-checkout-session
// @access  Public
exports.createCheckoutSession = async (req, res) => {
  try {
    const { email, password, fullName, mobileNumber, role, selectedGoal, packageId, successUrl, cancelUrl } = req.body;

    if (!packageId || !PACKAGES[packageId]) {
      return res.status(400).json({ error: 'Invalid package selected' });
    }

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Missing required signup information' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const package = PACKAGES[packageId];

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: email,
      name: fullName,
      metadata: {
        signupEmail: email,
        fullName: fullName,
        role: role || 'employee',
        selectedGoal: selectedGoal || ''
      }
    });
    const stripeCustomerId = customer.id;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: package.name,
              description: 'Monthly subscription'
            },
            unit_amount: Math.round(package.price * 100), // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: successUrl || `${process.env.FRONTEND_URL}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/signup/subscription`,
      metadata: {
        email: email,
        password: password,
        fullName: fullName,
        mobileNumber: mobileNumber || '',
        role: role || 'employee',
        selectedGoal: selectedGoal || '',
        packageId: packageId,
        stripeCustomerId: stripeCustomerId
      }
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

// @desc    Handle Stripe webhook
// @route   POST /api/stripe/webhook
// @access  Public (but verified with Stripe signature)
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// @desc    Get subscription status
// @route   GET /api/stripe/subscription
// @access  Private
exports.getSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({ user: userId })
      .sort({ createdAt: -1 });
    
    if (!subscription) {
      return res.json({
        success: true,
        subscription: null,
        hasActiveSubscription: false
      });
    }

    res.json({
      success: true,
      subscription,
      hasActiveSubscription: subscription.isActive()
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
};

// @desc    Cancel subscription
// @route   POST /api/stripe/cancel-subscription
// @access  Private
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({
      user: userId,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel in Stripe
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    // Update local subscription
    await subscription.cancel();

    // Update user
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: 'cancelled'
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

// Helper functions for webhook events
async function handleCheckoutCompleted(session) {
  try {
    const metadata = session.metadata;
    
    // Check if user already exists
    let user = await User.findOne({ email: metadata.email });
    
    if (!user) {
      // Create new user account
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(metadata.password, 10);
      
      user = await User.create({
        email: metadata.email,
        password: hashedPassword,
        fullName: metadata.fullName,
        mobileNumber: metadata.mobileNumber || '',
        role: metadata.role || 'employee',
        selectedGoal: metadata.selectedGoal || '',
        subscriptionCustomerId: metadata.stripeCustomerId,
        subscriptionStatus: 'active',
        isEmailVerified: true
      });
    }

    // Create subscription record
    const packageInfo = PACKAGES[metadata.packageId];
    const subscription = await Subscription.create({
      user: user._id,
      packageName: metadata.packageId,
      price: packageInfo.price,
      currency: 'usd',
      status: 'active',
      stripeCustomerId: metadata.stripeCustomerId,
      stripeCheckoutSessionId: session.id,
      stripePaymentId: session.payment_intent,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      features: packageInfo.features,
      paymentHistory: [{
        amount: packageInfo.price,
        currency: 'usd',
        status: 'paid',
        paidAt: new Date()
      }]
    });

    // Update user with subscription
    user.subscription = subscription._id;
    user.subscriptionStatus = 'active';
    await user.save();
    
    console.log('User account created successfully:', user.email);
  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error);
  }
}

async function handleSubscriptionCreated(stripeSubscription) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id
  });

  if (subscription) {
    subscription.status = 'active';
    subscription.startDate = new Date(stripeSubscription.current_period_start * 1000);
    subscription.endDate = new Date(stripeSubscription.current_period_end * 1000);
    subscription.nextBillingDate = subscription.endDate;
    await subscription.save();
  }
}

async function handleSubscriptionUpdated(stripeSubscription) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id
  });

  if (subscription) {
    subscription.status = stripeSubscription.status === 'active' ? 'active' : stripeSubscription.status;
    subscription.endDate = new Date(stripeSubscription.current_period_end * 1000);
    subscription.nextBillingDate = subscription.endDate;
    await subscription.save();

    // Update user status
    await User.findByIdAndUpdate(subscription.user, {
      subscriptionStatus: subscription.status
    });
  }
}

async function handleSubscriptionDeleted(stripeSubscription) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id
  });

  if (subscription) {
    await subscription.cancel();
    
    await User.findByIdAndUpdate(subscription.user, {
      subscriptionStatus: 'cancelled'
    });
  }
}

async function handleInvoicePaid(invoice) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: invoice.subscription
  });

  if (subscription) {
    subscription.paymentHistory.push({
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: 'paid',
      paidAt: new Date(invoice.status_transitions.paid_at * 1000),
      stripePaymentId: invoice.payment_intent
    });
    await subscription.save();
  }
}

async function handleInvoicePaymentFailed(invoice) {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: invoice.subscription
  });

  if (subscription) {
    subscription.status = 'failed';
    await subscription.save();
    
    await User.findByIdAndUpdate(subscription.user, {
      subscriptionStatus: 'failed'
    });
  }
}

module.exports = exports;
