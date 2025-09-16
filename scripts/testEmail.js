#!/usr/bin/env node
const nodemailer = require('nodemailer');

// SMTP Configuration from the app
const SMTP_CONFIG = {
  host: 'mail.privateemail.com',
  port: 465,
  secure: true, // SSL
  auth: {
<<<<<<< HEAD
    user: 'crisisconnect@neffcreative.co',
=======
    user: 'conflictconnect@neffcreative.co',
>>>>>>> 99ea8a17b977be2e268c62c2469b89c7368b1c40
    pass: 'MutualAid13',
  },
};

async function testEmailConnection() {
  try {
    console.log('Creating transporter...');
    const transporter = nodemailer.createTransporter(SMTP_CONFIG);
    
    console.log('Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    
    console.log('Sending test email...');
    const testEmail = {
      from: {
<<<<<<< HEAD
        name: 'Crisis Connect Test',
        address: 'crisisconnect@neffcreative.co',
      },
      to: 'crisisconnect@neffcreative.co', // Send to self for testing
=======
        name: 'Conflict Connect Test',
        address: 'conflictconnect@neffcreative.co',
      },
      to: 'conflictconnect@neffcreative.co', // Send to self for testing
>>>>>>> 99ea8a17b977be2e268c62c2469b89c7368b1c40
      subject: 'Email Service Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Service Test</h2>
          <p>This is a test email to verify the SMTP configuration is working.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
      text: `Email Service Test\n\nThis is a test email to verify the SMTP configuration is working.\nTimestamp: ${new Date().toISOString()}`,
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
    
    return true;
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

// Run the test
testEmailConnection().then((success) => {
  console.log('Test completed:', success ? 'SUCCESS' : 'FAILED');
  process.exit(success ? 0 : 1);
});