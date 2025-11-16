const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getOrCreateChat,
  getUserChats,
  getJobChats,
  sendMessage,
  markAsRead,
  deleteChat,
  acceptChat
} = require('../controllers/chatController');

// Get all chats for logged-in user
router.get('/', protect, getUserChats);

// Get or create a chat for a specific job
router.get('/job/:jobId', protect, getOrCreateChat);

// Get all chats for a specific job (employer only)
router.get('/job/:jobId/all', protect, getJobChats);

// Send a message in a chat
router.post('/:chatId/message', protect, sendMessage);

// Mark messages as read
router.put('/:chatId/read', protect, markAsRead);

// Accept a chat request (employer only)
router.post('/:chatId/accept', protect, acceptChat);

// Delete a chat
router.delete('/:chatId', protect, deleteChat);

module.exports = router;
