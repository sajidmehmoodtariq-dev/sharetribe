const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  
  console.log('=== Creating Test Job Seeker ===\n');
  
  // Create a second job seeker for testing
  const hashedPassword = await bcrypt.hash('test123', 10);
  
  const testJobSeeker = await User.create({
    fullName: 'Test Job Hunter',
    email: 'testjobhunter@example.com',
    password: hashedPassword,
    role: 'employee',
    phone: '1234567890',
    isEmailVerified: true,
    onboardingCompleted: true
  });
  
  console.log('Created test job seeker:');
  console.log('  Name:', testJobSeeker.fullName);
  console.log('  Email:', testJobSeeker.email);
  console.log('  Password: test123');
  console.log('  Role:', testJobSeeker.role);
  console.log('\nYou can now:');
  console.log('1. Login with testjobhunter@example.com / test123');
  console.log('2. Request the same job that sajid requested');
  console.log('3. The employer will see 2 separate chat tabs');
  
  mongoose.connection.close();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
