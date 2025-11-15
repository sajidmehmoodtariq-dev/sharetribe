const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Job = require('./models/Job');
  
  const jobs = await Job.find({ status: 'published' });
  console.log('Total published jobs:', jobs.length);
  console.log('\n=== Published Jobs ===\n');
  
  jobs.forEach((job, i) => {
    console.log(`Job ${i+1}:`);
    console.log('  ID:', job._id);
    console.log('  Title:', job.jobDetails?.jobTitle || 'No title');
    console.log('  Business:', job.jobDetails?.businessName || 'No business name');
    console.log('  Status:', job.status);
    console.log('  IsActive:', job.isActive);
    console.log('  Publish Date:', job.publishDate);
    console.log('');
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
