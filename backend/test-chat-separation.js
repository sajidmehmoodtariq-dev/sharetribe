const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Chat = require('./models/Chat');
  const User = require('./models/User');
  const Job = require('./models/Job');
  
  console.log('=== Testing Chat Separation ===\n');
  
  // Get all chats
  const chats = await Chat.find()
    .populate('jobId', 'jobDetails.jobTitle')
    .populate('employerId', 'fullName email role')
    .populate('jobSeekerId', 'fullName email role');
  
  console.log('Total chats:', chats.length);
  console.log('\n=== Chat Details ===\n');
  
  chats.forEach((chat, i) => {
    console.log(`Chat ${i+1}:`);
    console.log('  Chat ID:', chat._id);
    console.log('  Job:', chat.jobId?.jobDetails?.jobTitle || 'Unknown');
    console.log('  Employer:', chat.employerId?.fullName || chat.employerId?.email || 'Unknown');
    console.log('  Job Seeker:', chat.jobSeekerId?.fullName || chat.jobSeekerId?.email || 'Unknown');
    console.log('  Messages:', chat.messages.length);
    console.log('  Last Message:', chat.lastMessage || 'No messages');
    console.log('  Accepted:', chat.acceptedByEmployer);
    console.log('');
  });
  
  // Group chats by job
  const chatsByJob = {};
  chats.forEach(chat => {
    const jobId = chat.jobId?._id?.toString() || 'unknown';
    if (!chatsByJob[jobId]) {
      chatsByJob[jobId] = [];
    }
    chatsByJob[jobId].push(chat);
  });
  
  console.log('\n=== Chats Grouped by Job ===\n');
  Object.entries(chatsByJob).forEach(([jobId, jobChats]) => {
    const jobTitle = jobChats[0]?.jobId?.jobDetails?.jobTitle || 'Unknown Job';
    console.log(`Job: ${jobTitle}`);
    console.log(`  Total chats: ${jobChats.length}`);
    jobChats.forEach((chat, i) => {
      console.log(`  Chat ${i+1}: ${chat.jobSeekerId?.fullName || 'Unknown'} → ${chat.employerId?.fullName || 'Unknown'}`);
    });
    console.log('');
  });
  
  // Get all users for reference
  const users = await User.find({}, 'fullName email role');
  console.log('\n=== Available Users ===\n');
  users.forEach(user => {
    console.log(`${user.role}: ${user.fullName} (${user.email})`);
  });
  
  mongoose.connection.close();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
