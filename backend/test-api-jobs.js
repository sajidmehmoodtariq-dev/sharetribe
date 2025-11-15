const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Job = require('./models/Job');
  
  // Simulate the API call
  const query = { status: 'published' };
  
  const jobs = await Job.find(query)
    .sort({ publishDate: -1 })
    .limit(100);
  
  console.log('API would return:', jobs.length, 'jobs');
  console.log('\nJobs data:');
  
  jobs.forEach((job, i) => {
    console.log(`\nJob ${i+1}:`);
    console.log('  ID:', job._id);
    console.log('  Title:', job.jobDetails?.jobTitle || 'No title');
    console.log('  Business:', job.jobDetails?.businessName || 'No business name');
    console.log('  Location:', job.postJob?.workLocation || 'No location');
    console.log('  Salary:', job.postJob?.salary || 'No salary');
    console.log('  Status:', job.status);
    console.log('  Employer ID:', job.employerId?._id || job.employerId);
    console.log('  Created:', job.createdAt);
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
