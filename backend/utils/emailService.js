const sgMail = require('@sendgrid/mail');

// Track if SendGrid has been initialized
let isInitialized = false;

// Initialize SendGrid with API key (lazy initialization)
const initializeSendGrid = () => {
  if (!isInitialized) {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is not set in environment variables');
    }
    sgMail.setApiKey(apiKey);
    isInitialized = true;
    console.log('✅ SendGrid initialized with API key');
  }
};

/**
 * Send password reset email with verification code
 * @param {string} email - Recipient email address
 * @param {string} code - 5-digit verification code
 * @param {string} userName - User's full name
 */
const sendPasswordResetEmail = async (email, code, userName) => {
  try {
    // Initialize SendGrid if not already done
    initializeSendGrid();
    
    const msg = {
      to: email,
      from: process.env.SENDGRID_VERIFIED_SENDER || 'lojezilo@fxzig.com',
      subject: 'Password Reset Verification Code',
      text: `Hello ${userName},\n\nYou requested to reset your password. Your verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nHead Huntd Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00EA72 0%, #00D66C 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #000; margin: 0; font-size: 28px;">Password Reset Request</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${userName}</strong>,</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              You requested to reset your password for your Head Huntd account. Please use the verification code below to complete the password reset process:
            </p>
            
            <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
              <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Your Verification Code:</p>
              <div style="font-size: 36px; font-weight: bold; color: #00EA72; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
              ⏰ This code will expire in <strong>15 minutes</strong>.
            </p>
            
            <div style="background: #fff9e6; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="font-size: 14px; color: #856404; margin: 0;">
                <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and ensure your account is secure.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              Best regards,<br>
              <strong>Head Huntd Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; font-size: 12px; color: #999;">
            <p>© 2025 Head Huntd. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);
    console.log(`Password reset email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    if (error.response) {
      console.error('SendGrid error response:', error.response.body);
    }
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send welcome email to new users
 * @param {string} email - Recipient email address
 * @param {string} userName - User's full name
 */
const sendWelcomeEmail = async (email, userName) => {
  try {
    // Initialize SendGrid if not already done
    initializeSendGrid();
    
    const msg = {
      to: email,
      from: process.env.SENDGRID_VERIFIED_SENDER || 'lojezilo@fxzig.com',
      subject: 'Welcome to Head Huntd!',
      text: `Hello ${userName},\n\nWelcome to Head Huntd! We're excited to have you on board.\n\nGet started by completing your profile to maximize your opportunities.\n\nBest regards,\nHead Huntd Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Head Huntd</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00EA72 0%, #00D66C 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #000; margin: 0; font-size: 28px;">Welcome to Head Huntd! 🎉</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${userName}</strong>,</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Welcome to Head Huntd! We're thrilled to have you join our community.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              To get the most out of your experience, we recommend completing your profile and exploring the opportunities available.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="display: inline-block; padding: 15px 30px; background: #00EA72; color: #000; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
                Get Started
              </a>
            </div>
            
            <p style="font-size: 14px; color: #999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              Best regards,<br>
              <strong>Head Huntd Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; font-size: 12px; color: #999;">
            <p>© 2025 Head Huntd. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);
    console.log(`Welcome email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    if (error.response) {
      console.error('SendGrid error response:', error.response.body);
    }
    // Don't throw error for welcome emails - they're not critical
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
