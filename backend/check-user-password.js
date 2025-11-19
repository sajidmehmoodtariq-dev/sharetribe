const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const email = 'jobseeker1763566814606@test.com';
const newPassword = 'Test123!';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  
  console.log('=== CHECKING USER AND TESTING PASSWORD ===\n');
  
  const user = await User.findOne({ email: email });
  
  if (!user) {
    console.log('❌ User not found');
    mongoose.connection.close();
    return;
  }
  
  console.log('✅ User found:');
  console.log('Email:', user.email);
  console.log('Full Name:', user.fullName);
  console.log('Role:', user.role);
  console.log('Stored password hash:', user.password.substring(0, 30) + '...');
  console.log('');
  
  // Test the current password
  console.log('Testing password:', newPassword);
  const isValid = await bcrypt.compare(newPassword, user.password);
  console.log('Password matches:', isValid ? '✅ YES' : '❌ NO');
  console.log('');
  
  if (!isValid) {
    console.log('Resetting password...');
    // Pass plain password - pre-save hook will hash it
    user.password = newPassword;
    await user.save();
    
    console.log('✅ Password has been reset!');
    console.log('New password hash:', user.password.substring(0, 30) + '...');
    console.log('');
    
    // Test again
    const isValidNow = await bcrypt.compare(newPassword, user.password);
    console.log('Password now matches:', isValidNow ? '✅ YES' : '❌ NO');
  }
  
  console.log('\n✅ You can now login with:');
  console.log('Email:', email);
  console.log('Password:', newPassword);
  
  mongoose.connection.close();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
