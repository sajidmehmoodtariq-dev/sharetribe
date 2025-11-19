const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  const Chat = require('./models/Chat');
  const Connection = require('./models/Connection');
  const Job = require('./models/Job');
  
  console.log('=== DEBUGGING CHATS FOR SAJID USERS ===\n');
  
  // Get both users
  const user1 = await User.findOne({ email: 'sajidmehmoodtariq5@gmail.com' });
  const user2 = await User.findOne({ email: 'sajidmehmoodtariq12@gmail.com' });
  
  if (!user1) {
    console.log('❌ User sajidmehmoodtariq5@gmail.com not found');
  } else {
    console.log('✅ User 1 Found:');
    console.log('  ID:', user1._id);
    console.log('  Name:', user1.fullName);
    console.log('  Email:', user1.email);
    console.log('  Role:', user1.role);
    console.log('');
  }
  
  if (!user2) {
    console.log('❌ User sajidmehmoodtariq12@gmail.com not found');
  } else {
    console.log('✅ User 2 Found:');
    console.log('  ID:', user2._id);
    console.log('  Name:', user2.fullName);
    console.log('  Email:', user2.email);
    console.log('  Role:', user2.role);
    console.log('');
  }
  
  if (!user1 || !user2) {
    mongoose.connection.close();
    return;
  }
  
  // Get connection between users
  console.log('=== CONNECTION STATUS ===\n');
  const connection = await Connection.findOne({
    $or: [
      { senderId: user1._id, receiverId: user2._id },
      { senderId: user2._id, receiverId: user1._id }
    ]
  }).populate('senderId', 'fullName email')
    .populate('receiverId', 'fullName email');
  
  if (connection) {
    console.log('✅ Connection Found:');
    console.log('  ID:', connection._id);
    console.log('  Status:', connection.status);
    console.log('  Sender:', connection.senderId.fullName, '(' + connection.senderId.email + ')');
    console.log('  Receiver:', connection.receiverId.fullName, '(' + connection.receiverId.email + ')');
    console.log('  Created:', connection.createdAt);
    console.log('  Responded:', connection.respondedAt);
  } else {
    console.log('❌ No connection found between these users');
  }
  console.log('');
  
  // Get all chats between these users (without populate to see raw jobId)
  console.log('=== ALL CHATS BETWEEN USERS (RAW) ===\n');
  const chatsRaw = await Chat.find({
    $or: [
      { employerId: user1._id, jobSeekerId: user2._id },
      { employerId: user2._id, jobSeekerId: user1._id }
    ]
  }).sort({ createdAt: -1 });
  
  console.log(`Found ${chatsRaw.length} chat(s) (raw data):\n`);
  
  chatsRaw.forEach((chat, index) => {
    console.log(`--- CHAT ${index + 1} (RAW) ---`);
    console.log('Chat ID:', chat._id);
    console.log('Chat Type:', chat.chatType || 'NOT SET');
    console.log('Job ID (raw):', chat.jobId || 'null');
    console.log('Is Permanent:', chat.isPermanent);
    console.log('');
  });
  
  // Now get with populate
  console.log('=== ALL CHATS BETWEEN USERS (POPULATED) ===\n');
  const chats = await Chat.find({
    $or: [
      { employerId: user1._id, jobSeekerId: user2._id },
      { employerId: user2._id, jobSeekerId: user1._id }
    ]
  }).populate('jobId', 'jobDetails.jobTitle status isActive')
    .populate('employerId', 'fullName email role')
    .populate('jobSeekerId', 'fullName email role')
    .sort({ createdAt: -1 });
  
  console.log(`Found ${chats.length} chat(s):\n`);
  
  chats.forEach((chat, index) => {
    console.log(`--- CHAT ${index + 1} ---`);
    console.log('Chat ID:', chat._id);
    console.log('Chat Type:', chat.chatType || 'NOT SET (defaults to "job")');
    console.log('Is Permanent:', chat.isPermanent);
    console.log('Employer:', chat.employerId?.fullName, '(' + chat.employerId?.email + ')');
    console.log('Job Seeker:', chat.jobSeekerId?.fullName, '(' + chat.jobSeekerId?.email + ')');
    
    if (chat.jobId) {
      console.log('Job:');
      console.log('  Title:', chat.jobId.jobDetails?.jobTitle || 'N/A');
      console.log('  Status:', chat.jobId.status);
      console.log('  IsActive:', chat.jobId.isActive);
    } else {
      console.log('Job: NULL (Direct Message)');
    }
    
    console.log('Accepted By Employer:', chat.acceptedByEmployer);
    console.log('Closed By Employer:', chat.closedByEmployer);
    console.log('Closed At:', chat.closedAt);
    console.log('Messages:', chat.messages.length);
    console.log('Last Message:', chat.lastMessage || 'No messages');
    console.log('Created:', chat.createdAt);
    console.log('');
  });
  
  // Identify the issue
  console.log('=== ANALYSIS ===\n');
  
  const directChats = chats.filter(c => c.chatType === 'direct' || !c.jobId);
  const jobChats = chats.filter(c => c.chatType !== 'direct' && c.jobId);
  
  console.log('Direct Message Chats:', directChats.length);
  console.log('Job-Related Chats:', jobChats.length);
  console.log('');
  
  if (jobChats.length > 0) {
    console.log('⚠️ ISSUE IDENTIFIED:');
    console.log('There are job-related chats that may be showing "job closed" errors.');
    console.log('These chats have jobId set and chatType is likely "job" or undefined.');
    console.log('');
    console.log('Job-related chats details:');
    jobChats.forEach((chat, index) => {
      console.log(`  ${index + 1}. Chat ID: ${chat._id}`);
      console.log(`     chatType: ${chat.chatType || 'undefined (defaults to "job")'}`);
      console.log(`     isPermanent: ${chat.isPermanent}`);
      console.log(`     closedByEmployer: ${chat.closedByEmployer}`);
      if (chat.jobId) {
        console.log(`     Job Status: ${chat.jobId.status}`);
        console.log(`     Job Active: ${chat.jobId.isActive}`);
      }
      console.log('');
    });
  }
  
  if (directChats.length > 0) {
    console.log('✅ Direct message chats found:');
    directChats.forEach((chat, index) => {
      console.log(`  ${index + 1}. Chat ID: ${chat._id}`);
      console.log(`     chatType: ${chat.chatType || 'undefined'}`);
      console.log(`     jobId: ${chat.jobId ? 'HAS JOB ID (PROBLEM!)' : 'null (correct)'}`);
      console.log(`     isPermanent: ${chat.isPermanent}`);
      console.log('');
    });
  }
  
  console.log('=== RECOMMENDATION ===\n');
  console.log('The old chats created before the direct message feature have:');
  console.log('  - chatType: undefined (defaults to "job")');
  console.log('  - jobId: set to a job reference');
  console.log('  - isPermanent: false');
  console.log('');
  console.log('To fix this, you need to either:');
  console.log('1. Create a NEW direct message chat (recommended)');
  console.log('2. Migrate existing chat to direct message type');
  console.log('');
  
  mongoose.connection.close();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
