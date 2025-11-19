const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['employer', 'jobSeeker', 'employee'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

const chatSchema = new mongoose.Schema({
  chatType: {
    type: String,
    enum: ['job', 'direct'],
    default: 'job'
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: false // Not required for direct messages
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobSeekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSchema],
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    employer: { type: Number, default: 0 },
    jobSeeker: { type: Number, default: 0 }
  },
  acceptedByEmployer: {
    type: Boolean,
    default: false
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  closedByEmployer: {
    type: Boolean,
    default: false
  },
  closedAt: {
    type: Date,
    default: null
  },
  isPermanent: {
    type: Boolean,
    default: false // Direct chats are permanent and cannot be closed
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ jobId: 1, employerId: 1, jobSeekerId: 1 });
chatSchema.index({ employerId: 1 });
chatSchema.index({ jobSeekerId: 1 });
chatSchema.index({ chatType: 1, employerId: 1, jobSeekerId: 1 });

module.exports = mongoose.model('Chat', chatSchema);
