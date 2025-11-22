require('dotenv').config();
const { sendPasswordResetEmail } = require('./utils/emailService');

(async () => {
  try {
    const email = 'huzaifadev99@gmail.com';
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const userName = 'Huzaifa Dev';
    console.log('Sending test password reset email to', email, 'with code', code);
    const result = await sendPasswordResetEmail(email, code, userName);
    console.log('Result:', result);
  } catch (err) {
    console.error('Failed to send test email:', err);
    process.exit(1);
  }
})();
