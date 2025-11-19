const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnections,
  getPendingRequests,
  getSentRequests,
  getConnectionStatus,
  getAllEmployees,
  cancelConnectionRequest
} = require('../controllers/connectionController');

// Get all connections (accepted)
router.get('/', protect, getConnections);

// Get pending requests received
router.get('/pending', protect, getPendingRequests);

// Get sent requests
router.get('/sent', protect, getSentRequests);

// Get all employees (for employers to browse)
router.get('/employees', protect, getAllEmployees);

// Get connection status with specific user
router.get('/status/:otherUserId', protect, getConnectionStatus);

// Send connection request
router.post('/request', protect, sendConnectionRequest);

// Accept connection request
router.put('/:connectionId/accept', protect, acceptConnectionRequest);

// Reject connection request
router.put('/:connectionId/reject', protect, rejectConnectionRequest);

// Cancel sent connection request
router.delete('/:connectionId/cancel', protect, cancelConnectionRequest);

module.exports = router;
