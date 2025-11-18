const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get user notifications
router.get('/', notificationController.getNotifications);

// Mark notification as read
router.put('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;
