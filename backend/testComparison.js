// Test direct SendGrid call vs email service
require('dotenv').config();

const sgMail = require('@sendgrid/mail');

console.log('🧪 Testing Direct SendGrid vs Email Service\n');
console.log('API Key:', process.env.SENDGRID_API_KEY.substring(0, 15) + '...');
console.log('Verified Sender:', process.env.SENDGRID_VERIFIED_SENDER);
console.log('');

// Test 1: Direct SendGrid call (like testSendGrid.js)
async function testDirect() {
  console.log('📧 Test 1: Direct SendGrid call');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: 'sajidmehmoodtariq5@gmail.com',
    from: process.env.SENDGRID_VERIFIED_SENDER,
    subject: 'Direct Test',
    text: 'Direct test message',
  };
  
  try {
    const response = await sgMail.send(msg);
    console.log('✅ Direct call SUCCESS - Status:', response[0].statusCode);
  } catch (error) {
    console.error('❌ Direct call FAILED:', error.message);
    if (error.response) {
      console.error('   Error body:', error.response.body);
    }
  }
  console.log('');
}

// Test 2: Using email service module
async function testModule() {
  console.log('📧 Test 2: Email service module');
  const { sendPasswordResetEmail } = require('./utils/emailService');
  
  try {
    await sendPasswordResetEmail('sajidmehmoodtariq5@gmail.com', '12345', 'Test User');
    console.log('✅ Module call SUCCESS');
  } catch (error) {
    console.error('❌ Module call FAILED:', error.message);
    if (error.response) {
      console.error('   Error body:', error.response.body);
    }
  }
  console.log('');
}

// Run tests
(async () => {
  await testDirect();
  await testModule();
  process.exit(0);
})();
