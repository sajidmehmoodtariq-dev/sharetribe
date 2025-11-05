const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Test with multiple configurations
async function comprehensiveTest() {
  console.log('🔍 Comprehensive SendGrid Diagnostic Test\n');
  console.log('='.repeat(60));
  console.log('');
  
  // 1. Configuration Check
  console.log('📋 Configuration Status:');
  console.log('  API Key:', process.env.SENDGRID_API_KEY ? '✅ Present' : '❌ Missing');
  console.log('  API Key Preview:', process.env.SENDGRID_API_KEY?.substring(0, 20) + '...');
  console.log('  Sender Email:', process.env.SENDGRID_VERIFIED_SENDER || 'lojezilo@fxzig.com');
  console.log('');
  
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  // 2. Simple Text Email Test
  console.log('📧 Test 1: Sending Simple Text Email...');
  const simpleEmail = {
    to: 'sajidmehmoodtariq5@gmail.com',
    from: {
      email: process.env.SENDGRID_VERIFIED_SENDER || 'lojezilo@fxzig.com',
      name: 'Head Huntd'
    },
    subject: `🧪 SendGrid Test - ${new Date().toLocaleString()}`,
    text: 'If you receive this email, SendGrid is working!\n\nThis is a plain text test email.',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #00EA72; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h1 style="color: #000; margin: 0;">✅ SendGrid Test Success!</h1>
        </div>
        <p style="font-size: 16px;">If you receive this email, your SendGrid integration is working correctly!</p>
        <p style="font-size: 14px; color: #666;">
          <strong>Sent at:</strong> ${new Date().toLocaleString()}<br>
          <strong>From:</strong> ${process.env.SENDGRID_VERIFIED_SENDER || 'lojezilo@fxzig.com'}<br>
          <strong>Message ID:</strong> Will be shown in response
        </p>
        <div style="margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 5px;">
          <p style="margin: 0; font-size: 14px;"><strong>Next Steps:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Check your inbox at sajidmehmoodtariq5@gmail.com</li>
            <li>Check spam/junk folder</li>
            <li>Check Promotions tab (Gmail)</li>
            <li>Check All Mail folder</li>
          </ul>
        </div>
      </div>
    `,
    // Additional options to improve deliverability
    trackingSettings: {
      clickTracking: { enable: false },
      openTracking: { enable: false }
    }
  };
  
  try {
    const response = await sgMail.send(simpleEmail);
    console.log('  ✅ Status:', response[0].statusCode, response[0].statusMessage || 'Accepted');
    console.log('  📨 Message ID:', response[0].headers['x-message-id']);
    console.log('');
    
    console.log('🎯 Important Information:');
    console.log('  • Email was ACCEPTED by SendGrid (Status 202)');
    console.log('  • This means SendGrid will attempt delivery');
    console.log('  • Check the following locations:');
    console.log('    1. Gmail Inbox');
    console.log('    2. Gmail Spam/Junk folder');
    console.log('    3. Gmail Promotions tab');
    console.log('    4. Gmail All Mail folder');
    console.log('');
    console.log('📊 To check delivery status:');
    console.log('  1. Go to: https://app.sendgrid.com/email_activity');
    console.log('  2. Search for: sajidmehmoodtariq5@gmail.com');
    console.log('  3. Look for Message ID:', response[0].headers['x-message-id']);
    console.log('');
    console.log('⚠️  Common Issues:');
    console.log('  • Sender not verified → Verify lojezilo@fxzig.com in SendGrid');
    console.log('  • Domain authentication → Set up domain authentication');
    console.log('  • Account in sandbox mode → Check SendGrid account status');
    console.log('  • Gmail filtering → Emails from unknown senders may be filtered');
    console.log('');
    
  } catch (error) {
    console.error('❌ Send Error:', error.message);
    if (error.response) {
      console.error('');
      console.error('Error Details:');
      console.error('  Status:', error.response.statusCode);
      console.error('  Body:', JSON.stringify(error.response.body, null, 2));
      
      // Specific error guidance
      if (error.response.body?.errors) {
        console.error('');
        console.error('🔧 Suggested Fixes:');
        error.response.body.errors.forEach(err => {
          console.error('  •', err.message);
          if (err.message.includes('not verified')) {
            console.error('    → Go to SendGrid Dashboard → Sender Authentication');
            console.error('    → Verify the sender email:', process.env.SENDGRID_VERIFIED_SENDER);
          }
        });
      }
    }
  }
  
  console.log('');
  console.log('='.repeat(60));
  console.log('');
  console.log('💡 Recommendation:');
  console.log('   If emails still don\'t arrive after 5-10 minutes:');
  console.log('   1. Check SendGrid Activity Feed (link above)');
  console.log('   2. Verify sender email in SendGrid dashboard');
  console.log('   3. Consider using your own verified domain');
  console.log('');
}

comprehensiveTest();
