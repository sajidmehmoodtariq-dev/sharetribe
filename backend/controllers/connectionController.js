const Connection = require('../models/Connection');
const User = require('../models/User');
const Chat = require('../models/Chat');

// Send connection request
exports.sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, message } = req.body;

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if sender is trying to connect with themselves
    if (senderId === receiverId) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    // Check for existing connection in either direction
    const existingConnection = await Connection.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    });

    if (existingConnection) {
      if (existingConnection.status === 'accepted') {
        return res.status(400).json({ message: 'Already connected' });
      } else if (existingConnection.status === 'pending') {
        return res.status(400).json({ message: 'Connection request already sent' });
      } else if (existingConnection.status === 'rejected') {
        // Allow resending after rejection
        existingConnection.status = 'pending';
        existingConnection.message = message;
        existingConnection.respondedAt = null;
        await existingConnection.save();
        
        const populatedConnection = await Connection.findById(existingConnection._id)
          .populate('senderId', 'fullName email role businessSummary')
          .populate('receiverId', 'fullName email role businessSummary');
        
        return res.status(200).json({ 
          message: 'Connection request resent',
          connection: populatedConnection 
        });
      }
    }

    // Create new connection request
    const connection = await Connection.create({
      senderId,
      receiverId,
      message,
      status: 'pending'
    });

    const populatedConnection = await Connection.findById(connection._id)
      .populate('senderId', 'fullName email role businessSummary')
      .populate('receiverId', 'fullName email role businessSummary');

    res.status(201).json({ 
      message: 'Connection request sent successfully',
      connection: populatedConnection 
    });
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Accept connection request
exports.acceptConnectionRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { connectionId } = req.params;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    // Verify user is the receiver
    if (connection.receiverId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    if (connection.status === 'accepted') {
      return res.status(400).json({ message: 'Connection already accepted' });
    }

    connection.status = 'accepted';
    connection.respondedAt = new Date();
    await connection.save();

    const populatedConnection = await Connection.findById(connection._id)
      .populate('senderId', 'fullName email role businessSummary')
      .populate('receiverId', 'fullName email role businessSummary');

    res.status(200).json({ 
      message: 'Connection accepted',
      connection: populatedConnection 
    });
  } catch (error) {
    console.error('Error accepting connection:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject connection request
exports.rejectConnectionRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { connectionId } = req.params;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    // Verify user is the receiver
    if (connection.receiverId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    connection.status = 'rejected';
    connection.respondedAt = new Date();
    await connection.save();

    res.status(200).json({ message: 'Connection request rejected' });
  } catch (error) {
    console.error('Error rejecting connection:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all connections (accepted only)
exports.getConnections = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, role, page = 1, limit = 20 } = req.query;

    // Build query for accepted connections
    const query = {
      $or: [
        { senderId: userId, status: 'accepted' },
        { receiverId: userId, status: 'accepted' }
      ]
    };

    const connections = await Connection.find(query)
      .populate('senderId', 'fullName email role businessSummary personalSummary onboardingData')
      .populate('receiverId', 'fullName email role businessSummary personalSummary onboardingData')
      .sort({ respondedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Format connections to show the other user
    const formattedConnections = connections.map(conn => {
      const isReceiver = conn.receiverId._id.toString() === userId;
      const otherUser = isReceiver ? conn.senderId : conn.receiverId;
      
      // Apply filters
      if (search && !otherUser.fullName.toLowerCase().includes(search.toLowerCase())) {
        return null;
      }
      if (role && otherUser.role !== role) {
        return null;
      }

      return {
        connectionId: conn._id,
        userId: otherUser._id,
        fullName: otherUser.fullName,
        email: otherUser.email,
        role: otherUser.role,
        businessSummary: otherUser.businessSummary,
        personalSummary: otherUser.personalSummary,
        onboardingData: otherUser.onboardingData,
        connectedAt: conn.respondedAt,
        status: conn.status
      };
    }).filter(Boolean);

    const count = formattedConnections.length;

    res.status(200).json({
      connections: formattedConnections,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get pending requests (received by user)
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Connection.find({
      receiverId: userId,
      status: 'pending'
    })
      .populate('senderId', 'fullName email role businessSummary')
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get sent requests (sent by user)
exports.getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Connection.find({
      senderId: userId
    })
      .populate('receiverId', 'fullName email role businessSummary')
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error('Error fetching sent requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get connection status between two users
exports.getConnectionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    const connection = await Connection.findOne({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    });

    if (!connection) {
      return res.status(200).json({ 
        status: 'none',
        canSendRequest: true 
      });
    }

    const isSender = connection.senderId.toString() === userId;

    res.status(200).json({
      status: connection.status,
      isSender,
      connectionId: connection._id,
      canSendRequest: connection.status === 'rejected'
    });
  } catch (error) {
    console.error('Error checking connection status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all employees for employers to browse
exports.getAllEmployees = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, skills, location, page = 1, limit = 20 } = req.query;

    // Only employers can view all employees
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can view employees' });
    }

    // Build query
    const query = { 
      role: { $in: ['employee', 'jobSeeker'] },
      _id: { $ne: userId } // Exclude self
    };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await User.find(query)
      .select('fullName email role personalSummary onboardingData createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get connection status for each employee
    const employeesWithStatus = await Promise.all(
      employees.map(async (employee) => {
        const connection = await Connection.findOne({
          $or: [
            { senderId: userId, receiverId: employee._id },
            { senderId: employee._id, receiverId: userId }
          ]
        });

        return {
          ...employee.toObject(),
          connectionStatus: connection ? connection.status : 'none',
          connectionId: connection ? connection._id : null,
          isSender: connection ? connection.senderId.toString() === userId : false
        };
      })
    );

    const count = await User.countDocuments(query);

    res.status(200).json({
      employees: employeesWithStatus,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel sent connection request
exports.cancelConnectionRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { connectionId } = req.params;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    // Verify user is the sender
    if (connection.senderId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this request' });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending requests' });
    }

    await Connection.findByIdAndDelete(connectionId);

    res.status(200).json({ message: 'Connection request cancelled' });
  } catch (error) {
    console.error('Error cancelling connection:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
