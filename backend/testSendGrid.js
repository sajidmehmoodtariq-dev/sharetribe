const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Test SendGrid configuration
async function testSendGrid() {
  console.log('🧪 Testing SendGrid Configuration...\n');
  
  // Check if API key is set
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY is not set in .env file');
    process.exit(1);
  }
  
  console.log('✅ API Key found:', process.env.SENDGRID_API_KEY.substring(0, 15) + '...');
  console.log('✅ Verified Sender:', process.env.SENDGRID_VERIFIED_SENDER);
  console.log('');
  
  // Initialize SendGrid
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  // Test email
  const testEmail = {
    to: 'sajidmehmoodtariq5@gmail.com', // Change this to your email
    from: process.env.SENDGRID_VERIFIED_SENDER || 'lojezilo@fxzig.com',
    subject: 'SendGrid Test Email - Head Huntd',
    text: 'This is a test email to verify SendGrid integration is working correctly.',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #00EA72;">SendGrid Test Email</h1>
        <p>This is a test email to verify that SendGrid integration is working correctly.</p>
        <p><strong>If you receive this email, your SendGrid configuration is working! 🎉</strong></p>
        <hr>
        <p style="font-size: 12px; color: #666;">Sent from Head Huntd Application</p>
      </body>
      </html>
    `,
  };
  
  try {
    console.log('📧 Sending test email to:', testEmail.to);
    console.log('📤 From:', testEmail.from);
    console.log('');
    
    const response = await sgMail.send(testEmail);
    
    console.log('✅ Email sent successfully!');
    console.log('📊 Response Status:', response[0].statusCode);
    console.log('📋 Response Headers:', JSON.stringify(response[0].headers, null, 2));
    console.log('');
    console.log('✨ Check your inbox at:', testEmail.to);
    console.log('⏱️  Email should arrive within 1-2 minutes');
    
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    
    if (error.response) {
      console.error('');
      console.error('📋 Error Details:');
      console.error('Status Code:', error.response.statusCode);
      console.error('Body:', JSON.stringify(error.response.body, null, 2));
      console.error('');
      
      // Common error messages
      if (error.response.statusCode === 401) {
        console.error('🔑 Authentication Error: Your API key may be invalid or expired.');
        console.error('   Please check your SENDGRID_API_KEY in .env file.');
      } else if (error.response.statusCode === 403) {
        console.error('🚫 Forbidden: Your sender email may not be verified.');
        console.error('   Please verify', process.env.SENDGRID_VERIFIED_SENDER, 'in SendGrid dashboard.');
      }
    }
    
    process.exit(1);
  }
}

// Run test
testSendGrid();
