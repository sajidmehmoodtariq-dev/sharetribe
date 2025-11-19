const mongoose = require('mongoose');
require('dotenv').config();

// You can change these emails to check different users
const email1 = 'jobseeker1763566814606@test.com'; // New job seeker
const email2 = 'sajidmehmoodtariq12@gmail.com'; // Your employer account

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  const Chat = require('./models/Chat');
  const Connection = require('./models/Connection');
  const Job = require('./models/Job');
  
  console.log('=== CHECKING CHATS BETWEEN USERS ===\n');
  
  const user1 = await User.findOne({ email: email1 });
  const user2 = await User.findOne({ email: email2 });
  
  if (!user1) {
    console.log(`❌ User ${email1} not found`);
    mongoose.connection.close();
    return;
  }
  
  if (!user2) {
    console.log(`❌ User ${email2} not found`);
    mongoose.connection.close();
    return;
  }
  
  console.log('User 1:', user1.fullName, `(${user1.email})`, '- Role:', user1.role);
  console.log('User 2:', user2.fullName, `(${user2.email})`, '- Role:', user2.role);
  console.log('');
  
  // Check connection
  const connection = await Connection.findOne({
    $or: [
      { senderId: user1._id, receiverId: user2._id },
      { senderId: user2._id, receiverId: user1._id }
    ]
  });
  
  console.log('=== CONNECTION STATUS ===');
  if (connection) {
    console.log('✅ Connected - Status:', connection.status);
  } else {
    console.log('❌ No connection found');
  }
  console.log('');
  
  // Get all chats
  const chats = await Chat.find({
    $or: [
      { employerId: user1._id, jobSeekerId: user2._id },
      { employerId: user2._id, jobSeekerId: user1._id }
    ]
  }).populate('jobId', 'jobDetails.jobTitle status isActive');
  
  console.log(`=== CHATS (${chats.length} total) ===\n`);
  
  for (let i = 0; i < chats.length; i++) {
    const chat = chats[i];
    console.log(`--- CHAT ${i + 1} ---`);
    console.log('Chat ID:', chat._id);
    console.log('Chat Type:', chat.chatType || 'undefined (defaults to "job")');
    console.log('Is Permanent:', chat.isPermanent);
    console.log('Job ID:', chat.jobId ? chat.jobId._id : 'null');
    
    if (chat.jobId) {
      console.log('Job Title:', chat.jobId.jobDetails?.jobTitle || 'N/A');
      console.log('Job Status:', chat.jobId.status);
      console.log('Job Active:', chat.jobId.isActive);
    } else {
      console.log('Job: None (Direct Message)');
    }
    
    console.log('Closed By Employer:', chat.closedByEmployer);
    console.log('Messages:', chat.messages.length);
    console.log('Created:', chat.createdAt);
    console.log('');
  }
  
  // Check if there are any problematic chats
  const jobChatsWithIssues = chats.filter(c => {
    return (c.chatType !== 'direct' && !c.isPermanent) && 
           (!c.jobId || c.jobId.status === 'closed' || !c.jobId.isActive);
  });
  
  if (jobChatsWithIssues.length > 0) {
    console.log('⚠️ PROBLEM CHATS FOUND:', jobChatsWithIssues.length);
    console.log('These chats are job-type but have closed/missing jobs:\n');
    
    jobChatsWithIssues.forEach((chat, index) => {
      console.log(`${index + 1}. Chat ID: ${chat._id}`);
      console.log(`   Type: ${chat.chatType || 'undefined'}, Permanent: ${chat.isPermanent}`);
      console.log(`   Job: ${chat.jobId ? 'Closed/Inactive' : 'Missing'}`);
    });
    
    console.log('\n💡 SOLUTION: Run the migration script to convert these to direct messages');
    console.log('   Command: node migrate-orphaned-chats.js');
  } else {
    console.log('✅ All chats are properly configured!');
  }
  
  mongoose.connection.close();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
