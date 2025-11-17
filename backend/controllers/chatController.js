const Chat = require('../models/Chat');
const Job = require('../models/Job');
const User = require('../models/User');

// Get or create a chat between job seeker and employer for a specific job
exports.getOrCreateChat = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get job details to find employer
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    let employerId, jobSeekerId;

    if (userRole === 'employer') {
      employerId = userId;
      // For employer, we need jobSeekerId from query params
      jobSeekerId = req.query.jobSeekerId;
      if (!jobSeekerId) {
        return res.status(400).json({ message: 'Job seeker ID required' });
      }
    } else {
      employerId = job.employerId;
      jobSeekerId = userId;
    }

    // Find or create chat
    let chat = await Chat.findOne({
      jobId,
      employerId,
      jobSeekerId
    }).populate('jobId', 'jobDetails.jobTitle jobDetails.businessName')
      .populate('employerId', 'fullName email')
      .populate('jobSeekerId', 'fullName email');

    if (!chat) {
      chat = await Chat.create({
        jobId,
        employerId,
        jobSeekerId,
        messages: []
      });

      chat = await Chat.findById(chat._id)
        .populate('jobId', 'jobDetails.jobTitle jobDetails.businessName')
        .populate('employerId', 'fullName email')
        .populate('jobSeekerId', 'fullName email');
    }

    res.json({ chat });
  } catch (error) {
    console.error('Error in getOrCreateChat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query;
    if (userRole === 'employer') {
      query = { employerId: userId };
    } else {
      query = { jobSeekerId: userId };
    }

    const chats = await Chat.find(query)
      .populate('jobId', 'jobDetails.jobTitle jobDetails.businessName status')
      .populate('employerId', 'fullName email')
      .populate('jobSeekerId', 'fullName email')
      .sort({ lastMessageTime: -1 });

    res.json({ chats });
  } catch (error) {
    console.error('Error in getUserChats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get chats for a specific job (for employer)
exports.getJobChats = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Verify user is the employer of this job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const chats = await Chat.find({ jobId, employerId: userId })
      .populate('jobSeekerId', 'fullName email')
      .populate('jobId', 'jobDetails.jobTitle')
      .sort({ lastMessageTime: -1 });

    res.json({ chats });
  } catch (error) {
    console.error('Error in getJobChats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user is part of this chat
    if (chat.employerId.toString() !== userId && chat.jobSeekerId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if chat is closed
    if (chat.closedByEmployer) {
      // Only employer can send messages in closed chat
      if (userRole !== 'employer') {
        return res.status(403).json({ message: 'This conversation has been closed by the employer' });
      }
    }

    // Add message
    const newMessage = {
      senderId: userId,
      senderRole: userRole,
      message: message.trim(),
      timestamp: new Date(),
      read: false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = message.trim();
    chat.lastMessageTime = new Date();

    // Update unread count for recipient
    if (userRole === 'employer') {
      chat.unreadCount.jobSeeker += 1;
    } else if (userRole === 'jobSeeker' || userRole === 'employee') {
      chat.unreadCount.employer += 1;
    }

    await chat.save();

    // Populate and return updated chat
    const updatedChat = await Chat.findById(chatId)
      .populate('jobId', 'jobDetails.jobTitle jobDetails.businessName')
      .populate('employerId', 'fullName email')
      .populate('jobSeekerId', 'fullName email');

    res.json({ chat: updatedChat });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user is part of this chat
    if (chat.employerId.toString() !== userId && chat.jobSeekerId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Mark all unread messages from the other party as read
    chat.messages.forEach(msg => {
      if (msg.senderId.toString() !== userId && !msg.read) {
        msg.read = true;
      }
    });

    // Reset unread count for this user
    if (userRole === 'employer') {
      chat.unreadCount.employer = 0;
    } else if (userRole === 'jobSeeker' || userRole === 'employee') {
      chat.unreadCount.jobSeeker = 0;
    }

    await chat.save();

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a chat
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user is part of this chat
    if (chat.employerId.toString() !== userId && chat.jobSeekerId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Chat.findByIdAndDelete(chatId);

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error in deleteChat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Accept a chat request (employer only) - creates an application
exports.acceptChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'employer') {
      return res.status(403).json({ message: 'Only employers can accept chat requests' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user is the employer of this chat
    if (chat.employerId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if already accepted
    if (chat.acceptedByEmployer) {
      return res.status(400).json({ message: 'Chat request already accepted' });
    }

    // Mark chat as accepted
    chat.acceptedByEmployer = true;
    chat.acceptedAt = new Date();
    await chat.save();

    // Create an application record
    const Application = require('../models/Application');
    
    // Check if application already exists
    const existingApplication = await Application.findOne({
      jobId: chat.jobId,
      applicantId: chat.jobSeekerId
    });

    if (!existingApplication) {
      await Application.create({
        jobId: chat.jobId,
        applicantId: chat.jobSeekerId,
        status: 'pending',
        coverLetter: 'Application created from chat request',
        appliedAt: new Date()
      });
    }

    // Populate and return updated chat
    const updatedChat = await Chat.findById(chatId)
      .populate('jobId', 'jobDetails.jobTitle jobDetails.businessName')
      .populate('employerId', 'fullName email')
      .populate('jobSeekerId', 'fullName email');

    res.json({ 
      message: 'Chat request accepted successfully',
      chat: updatedChat 
    });
  } catch (error) {
    console.error('Error in acceptChat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Close a chat (employer only) - prevents job seeker from sending messages
exports.closeChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'employer') {
      return res.status(403).json({ message: 'Only employers can close chats' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user is the employer of this chat
    if (chat.employerId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if already closed
    if (chat.closedByEmployer) {
      return res.status(400).json({ message: 'Chat is already closed' });
    }

    // Mark chat as closed
    chat.closedByEmployer = true;
    chat.closedAt = new Date();
    await chat.save();

    // Populate and return updated chat
    const updatedChat = await Chat.findById(chatId)
      .populate('jobId', 'jobDetails.jobTitle jobDetails.businessName')
      .populate('employerId', 'fullName email')
      .populate('jobSeekerId', 'fullName email');

    res.json({ 
      message: 'Chat closed successfully',
      chat: updatedChat 
    });
  } catch (error) {
    console.error('Error in closeChat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reopen a chat (employer only)
exports.reopenChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'employer') {
      return res.status(403).json({ message: 'Only employers can reopen chats' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user is the employer of this chat
    if (chat.employerId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if chat is closed
    if (!chat.closedByEmployer) {
      return res.status(400).json({ message: 'Chat is not closed' });
    }

    // Reopen chat
    chat.closedByEmployer = false;
    chat.closedAt = null;
    await chat.save();

    // Populate and return updated chat
    const updatedChat = await Chat.findById(chatId)
      .populate('jobId', 'jobDetails.jobTitle jobDetails.businessName')
      .populate('employerId', 'fullName email')
      .populate('jobSeekerId', 'fullName email');

    res.json({ 
      message: 'Chat reopened successfully',
      chat: updatedChat 
    });
  } catch (error) {
    console.error('Error in reopenChat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
