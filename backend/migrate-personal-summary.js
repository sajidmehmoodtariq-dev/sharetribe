const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ibitbytesoft_db_user:REztZuXccGs4upVz@headhuntd.mpib0ii.mongodb.net/';

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Find all users where personalSummary is a string (not an object)
    const users = await db.collection('users').find({
      personalSummary: { $type: 'string' }
    }).toArray();

    console.log(`Found ${users.length} users with string personalSummary`);

    // Update each user - convert string to object format
    for (const user of users) {
      const summaryText = user.personalSummary || '';
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { 
          personalSummary: { 
            summary: summaryText 
          } 
        } }
      );
      console.log(`✅ Updated user: ${user.email} - converted string to object`);
    }

    console.log('Migration complete!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
