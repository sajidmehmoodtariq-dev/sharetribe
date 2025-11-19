const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  const Chat = require('./models/Chat');
  const Job = require('./models/Job');
  
  console.log('=== MIGRATING OLD CHATS TO DIRECT MESSAGE TYPE ===\n');
  
  // Find all job-type chats
  const jobChats = await Chat.find({
    $or: [
      { chatType: 'job' },
      { chatType: { $exists: false } }
    ]
  }).populate('employerId', 'fullName email')
    .populate('jobSeekerId', 'fullName email');
  
  console.log(`Found ${jobChats.length} job-type chat(s) to check:\n`);
  
  const orphanedChats = [];
  
  // Check each chat to see if the job still exists
  for (const chat of jobChats) {
    if (chat.jobId) {
      const jobExists = await Job.findById(chat.jobId);
      if (!jobExists) {
        console.log(`❌ Job ${chat.jobId} not found for chat ${chat._id}`);
        orphanedChats.push(chat);
      }
    } else {
      console.log(`❌ Chat ${chat._id} has no jobId`);
      orphanedChats.push(chat);
    }
  }
  
  console.log(`\nFound ${orphanedChats.length} orphaned chat(s) to migrate:\n`);
  
  if (orphanedChats.length === 0) {
    console.log('✅ No orphaned chats found. All chats are properly configured.');
    mongoose.connection.close();
    return;
  }
  
  for (const chat of orphanedChats) {
    console.log(`Migrating Chat ID: ${chat._id}`);
    console.log(`  Employer: ${chat.employerId?.fullName} (${chat.employerId?.email})`);
    console.log(`  Job Seeker: ${chat.jobSeekerId?.fullName} (${chat.jobSeekerId?.email})`);
    console.log(`  Current chatType: ${chat.chatType || 'undefined'}`);
    console.log(`  Current isPermanent: ${chat.isPermanent}`);
    console.log(`  Messages: ${chat.messages.length}`);
    
    // Update to direct message type
    chat.chatType = 'direct';
    chat.isPermanent = true;
    chat.jobId = null;
    chat.acceptedByEmployer = true; // Direct messages are auto-accepted
    chat.closedByEmployer = false;
    
    await chat.save();
    
    console.log(`  ✅ Migrated to chatType: 'direct', isPermanent: true\n`);
  }
  
  console.log(`\n✅ Successfully migrated ${orphanedChats.length} chat(s) to direct message type.`);
  console.log('\nThese chats will now:');
  console.log('  - Be treated as permanent direct messages');
  console.log('  - Skip all job closure checks');
  console.log('  - Be accessible as long as users are connected');
  
  mongoose.connection.close();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
