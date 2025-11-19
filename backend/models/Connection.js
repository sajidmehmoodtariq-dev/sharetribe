const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 300
  },
  respondedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for faster queries
connectionSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
connectionSchema.index({ receiverId: 1, status: 1 });
connectionSchema.index({ senderId: 1, status: 1 });

// Prevent duplicate connections (A->B same as B->A)
connectionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const reverseConnection = await this.constructor.findOne({
      senderId: this.receiverId,
      receiverId: this.senderId
    });
    
    if (reverseConnection) {
      const error = new Error('Connection already exists in reverse direction');
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Connection', connectionSchema);
