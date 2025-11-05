// Update user email in database
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

const updateUserEmail = async () => {
  try {
    const oldEmail = 'salmonella@gmail.com';
    const newEmail = 'sajidmehmoodtariq5@gmail.com';
    
    console.log(`📧 Updating email from ${oldEmail} to ${newEmail}...\n`);
    
    // Find user
    const user = await User.findOne({ email: oldEmail });
    
    if (!user) {
      console.log(`❌ User with email ${oldEmail} not found`);
      return;
    }
    
    // Update using updateOne to avoid validation issues
    await User.updateOne(
      { email: oldEmail },
      { $set: { email: newEmail } }
    );
    
    console.log('✅ Email updated successfully!\n');
    console.log('📝 Login credentials:');
    console.log(`   Email: ${newEmail}`);
    console.log('   Password: password123');
    console.log('');
    console.log('🔐 You can now use this email for forgot password!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

connectDB().then(() => updateUserEmail());
