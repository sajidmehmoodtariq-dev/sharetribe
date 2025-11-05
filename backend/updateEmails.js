const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Email mappings
const emailUpdates = [
  {
    oldEmail: 'employee@test.com',
    newEmail: 'sajidmehmoodtariq5@gmail.com',
    role: 'employee'
  },
  {
    oldEmail: 'employer@test.com',
    newEmail: 'sajidmehmoodtariq12@gmail.com',
    role: 'employer'
  }
];

// Update emails in database
const updateEmails = async () => {
  try {
    console.log('📧 Starting email update process...\n');

    for (const update of emailUpdates) {
      // Check if old email exists
      const oldUser = await User.findOne({ email: update.oldEmail });
      
      if (!oldUser) {
        console.log(`⚠️  User with email ${update.oldEmail} not found. Skipping...`);
        continue;
      }

      // Check if new email already exists
      const existingUser = await User.findOne({ email: update.newEmail });
      
      if (existingUser && existingUser._id.toString() !== oldUser._id.toString()) {
        console.log(`⚠️  Email ${update.newEmail} already exists in database. Skipping...`);
        continue;
      }

      // Update the email using updateOne to bypass validation
      await User.updateOne(
        { _id: oldUser._id },
        { $set: { email: update.newEmail } }
      );

      console.log(`✅ Updated ${update.role} email:`);
      console.log(`   Old: ${update.oldEmail}`);
      console.log(`   New: ${update.newEmail}`);
      console.log(`   Name: ${oldUser.fullName}`);
      console.log(`   Role: ${oldUser.role}`);
      console.log('');
    }

    console.log('✨ Email update completed successfully!\n');
    console.log('📝 Updated Credentials:');
    console.log('   Employee Login:');
    console.log('   - Email: sajidmehmoodtariq5@gmail.com');
    console.log('   - Password: password123\n');
    console.log('   Employer Login:');
    console.log('   - Email: sajidmehmoodtariq12@gmail.com');
    console.log('   - Password: password123\n');

  } catch (error) {
    console.error('❌ Error updating emails:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the update script
connectDB().then(() => updateEmails());
