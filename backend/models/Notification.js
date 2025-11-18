const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'job_created',
      'application_received',
      'application_status_changed',
      'job_closed',
      'job_assigned',
      'new_message',
      'chat_closed',
      'chat_reopened',
      'interview_scheduled'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Job', 'Application', 'Chat', 'User']
  },
  metadata: {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    jobTitle: String,
    applicantName: String,
    senderName: String,
    status: String
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient querying
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
