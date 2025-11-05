// IMPORTANT: Load dotenv FIRST before any other modules
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');
const { sendPasswordResetEmail } = require('./utils/emailService');
const crypto = require('crypto');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully\n');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test forgot password flow
const testForgotPassword = async () => {
  try {
    // Get the first user from database
    const users = await User.find().limit(5);
    
    console.log('📋 Users in database:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.fullName}) - Role: ${user.role}`);
    });
    console.log('');

    if (users.length === 0) {
      console.log('❌ No users found in database. Please run seed script first.');
      return;
    }

    // Test with first user
    const testUser = users[0];
    console.log(`🧪 Testing forgot password with: ${testUser.email}\n`);

    // Generate 5-digit verification code
    const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
    console.log(`📧 Generated verification code: ${resetCode}`);
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log(`🔑 Generated reset token: ${resetToken.substring(0, 20)}...\n`);

    // Hash the code
    const hashedCode = crypto
      .createHash('sha256')
      .update(resetCode)
      .digest('hex');

    // Update user
    testUser.resetPasswordToken = resetToken;
    testUser.resetPasswordCode = hashedCode;
    testUser.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await testUser.save({ validateBeforeSave: false });
    console.log('✅ User updated with reset token\n');

    // Send email
    console.log('📤 Sending password reset email...');
    await sendPasswordResetEmail(testUser.email, resetCode, testUser.fullName);
    console.log('✅ Email sent successfully!\n');

    console.log('📬 Check your inbox for the email!');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Code: ${resetCode}`);
    console.log(`   Expires: ${new Date(testUser.resetPasswordExpires).toLocaleString()}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('SendGrid Error:', error.response.body);
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run test
connectDB().then(() => testForgotPassword());
