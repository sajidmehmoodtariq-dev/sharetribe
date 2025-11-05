// Check what users exist in database
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');

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

const listUsers = async () => {
  try {
    const users = await User.find({}, 'email fullName role');
    
    console.log('📋 All users in database:\n');
    
    if (users.length === 0) {
      console.log('   ⚠️  No users found!');
      console.log('   Run "npm run seed" to create test users\n');
    } else {
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email}`);
        console.log(`      Name: ${user.fullName}`);
        console.log(`      Role: ${user.role}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

connectDB().then(() => listUsers());
