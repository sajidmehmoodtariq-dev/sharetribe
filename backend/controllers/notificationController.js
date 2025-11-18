const Notification = require('../models/Notification');
const User = require('../models/User');
const emailService = require('../utils/emailService');

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly } = req.query;

    const query = { userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('metadata.senderId', 'fullName email role personalDetails.profileImage businessSummary.companyLogo');

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({ 
      success: true, 
      notifications,
      unreadCount 
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({ 
      success: true, 
      notification,
      unreadCount 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.json({ 
      success: true, 
      message: 'All notifications marked as read',
      unreadCount: 0
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ 
      success: true, 
      message: 'Notification deleted' 
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Create notification (internal function)
exports.createNotification = async (data) => {
  try {
    const { userId, type, title, message, relatedId, relatedModel, metadata } = data;

    // Create notification
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedModel,
      metadata,
      isRead: false
    });

    // Send email notification
    const user = await User.findById(userId);
    if (user && user.email) {
      try {
        await emailService.sendNotificationEmail({
          to: user.email,
          name: user.fullName,
          subject: title,
          message: message,
          type: type
        });
        
        notification.emailSent = true;
        await notification.save();
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Helper functions for specific notification types

exports.notifyNewJob = async (jobId, job, employerId) => {
  // This would notify relevant job seekers about a new job
  // For now, we'll skip this to avoid spamming all users
  // In production, you'd filter by preferences, location, skills, etc.
};

exports.notifyNewApplication = async (applicationId, application, employerId) => {
  try {
    await exports.createNotification({
      userId: employerId,
      type: 'application_received',
      title: 'New Job Application',
      message: `${application.applicantName || 'A candidate'} has applied for ${application.jobTitle || 'your job'}`,
      relatedId: applicationId,
      relatedModel: 'Application',
      metadata: {
        applicationId,
        jobId: application.jobId,
        jobTitle: application.jobTitle,
        applicantName: application.applicantName
      }
    });
  } catch (error) {
    console.error('Error notifying new application:', error);
  }
};

exports.notifyApplicationStatusChange = async (application, jobSeekerId) => {
  try {
    const statusMessages = {
      'accepted': 'Your application has been accepted! 🎉',
      'rejected': 'Your application status has been updated',
      'interview': 'You have been invited for an interview! 📅',
      'pending': 'Your application is being reviewed'
    };

    await exports.createNotification({
      userId: jobSeekerId,
      type: 'application_status_changed',
      title: 'Application Status Update',
      message: statusMessages[application.status] || 'Your application status has been updated',
      relatedId: application._id,
      relatedModel: 'Application',
      metadata: {
        applicationId: application._id,
        jobId: application.jobId,
        jobTitle: application.jobTitle,
        status: application.status
      }
    });
  } catch (error) {
    console.error('Error notifying application status change:', error);
  }
};

exports.notifyJobClosed = async (job, applicantIds) => {
  try {
    for (const applicantId of applicantIds) {
      await exports.createNotification({
        userId: applicantId,
        type: 'job_closed',
        title: 'Job Closed',
        message: `The job "${job.jobDetails?.jobTitle || 'position'}" has been closed by the employer`,
        relatedId: job._id,
        relatedModel: 'Job',
        metadata: {
          jobId: job._id,
          jobTitle: job.jobDetails?.jobTitle
        }
      });
    }
  } catch (error) {
    console.error('Error notifying job closed:', error);
  }
};

exports.notifyJobAssigned = async (jobId, jobTitle, jobSeekerId, employerId) => {
  try {
    // Notify job seeker
    await exports.createNotification({
      userId: jobSeekerId,
      type: 'job_assigned',
      title: 'Congratulations! Job Assigned',
      message: `You have been assigned the job: ${jobTitle}`,
      relatedId: jobId,
      relatedModel: 'Job',
      metadata: {
        jobId,
        jobTitle
      }
    });
  } catch (error) {
    console.error('Error notifying job assigned:', error);
  }
};

exports.notifyNewMessage = async (chatId, senderId, senderName, recipientId, jobTitle) => {
  try {
    await exports.createNotification({
      userId: recipientId,
      type: 'new_message',
      title: 'New Message',
      message: `${senderName} sent you a message about "${jobTitle}"`,
      relatedId: chatId,
      relatedModel: 'Chat',
      metadata: {
        chatId,
        senderId,
        senderName,
        jobTitle
      }
    });
  } catch (error) {
    console.error('Error notifying new message:', error);
  }
};

exports.notifyChatClosed = async (chatId, jobSeekerId, jobTitle) => {
  try {
    await exports.createNotification({
      userId: jobSeekerId,
      type: 'chat_closed',
      title: 'Chat Closed',
      message: `The chat for "${jobTitle}" has been closed by the employer`,
      relatedId: chatId,
      relatedModel: 'Chat',
      metadata: {
        chatId,
        jobTitle
      }
    });
  } catch (error) {
    console.error('Error notifying chat closed:', error);
  }
};

exports.notifyChatReopened = async (chatId, jobSeekerId, jobTitle) => {
  try {
    await exports.createNotification({
      userId: jobSeekerId,
      type: 'chat_reopened',
      title: 'Chat Reopened',
      message: `The chat for "${jobTitle}" has been reopened by the employer`,
      relatedId: chatId,
      relatedModel: 'Chat',
      metadata: {
        chatId,
        jobTitle
      }
    });
  } catch (error) {
    console.error('Error notifying chat reopened:', error);
  }
};
