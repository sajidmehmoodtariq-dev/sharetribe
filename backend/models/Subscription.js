const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packageName: {
    type: String,
    enum: ['user-plus', 'premium', 'enterprise'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  interval: {
    type: String,
    enum: ['month', 'year'],
    default: 'month'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'cancelled', 'expired', 'failed'],
    default: 'pending'
  },
  
  // Stripe integration
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  stripePaymentIntentId: { type: String },
  stripeCheckoutSessionId: { type: String },
  
  // Subscription dates
  startDate: { type: Date },
  endDate: { type: Date },
  nextBillingDate: { type: Date },
  cancelledAt: { type: Date },
  
  // Payment history
  paymentHistory: [{
    amount: Number,
    currency: String,
    status: String,
    paidAt: Date,
    stripePaymentId: String
  }],
  
  // Features (based on package)
  features: {
    unlimitedJobListings: { type: Boolean, default: false },
    verifiedCandidates: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false },
    support: { type: String, enum: ['basic', '24/7'], default: 'basic' },
    mobileApp: { type: Boolean, default: false }
  },
  
  // Auto-renewal
  autoRenew: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });
subscriptionSchema.index({ endDate: 1 });

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && this.endDate > new Date();
};

// Method to cancel subscription
subscriptionSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.autoRenew = false;
  return this.save();
};

// Static method to find active subscription for user
subscriptionSchema.statics.findActiveForUser = function(userId) {
  return this.findOne({
    user: userId,
    status: 'active',
    endDate: { $gt: new Date() }
  });
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
