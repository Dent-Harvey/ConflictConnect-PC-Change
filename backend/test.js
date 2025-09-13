/**
 * Test script for Crisis Connect Email Service
 */

const fetch = require('node-fetch'); // You'll need to install: npm install node-fetch@2

const BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = 'test@example.com'; // Replace with a real email for testing

async function testEmailService() {
  console.log('🧪 Testing Crisis Connect Email Service...\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test 2: SMTP connection test
    console.log('\n2️⃣ Testing SMTP connection...');
    const connectionResponse = await fetch(`${BASE_URL}/api/email/test-connection`);
    const connectionData = await connectionResponse.json();
    console.log('✅ SMTP connection:', connectionData);
    
    // Test 3: Send verification email
    console.log('\n3️⃣ Testing verification email...');
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const emailPayload = {
      email: {
        to: TEST_EMAIL,
        subject: 'Crisis Connect - Test Verification Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; text-align: center;">Test Verification Email</h2>
            <p>This is a test email from the Crisis Connect backend service.</p>
            <div style="text-align: center; margin: 30px 0;">
              <h1 style="
                font-size: 32px; 
                color: #007AFF; 
                text-align: center; 
                letter-spacing: 4px;
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border: 2px dashed #007AFF;
                margin: 20px 0;
              ">${verificationCode}</h1>
            </div>
            <p>If you received this, the email service is working correctly!</p>
          </div>
        `,
        text: `
          Test Verification Email
          
          This is a test email from the Crisis Connect backend service.
          
          Verification Code: ${verificationCode}
          
          If you received this, the email service is working correctly!
        `
      },
      from: {
        name: 'Crisis Connect Test',
        email: 'conflictconnect@neffcreative.co'
      },
      project_id: '4e5617ee-08cd-4dcb-be30-a0923ebd5e6c'
    };
    
    const emailResponse = await fetch(`${BASE_URL}/api/email/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });
    
    const emailData = await emailResponse.json();
    console.log('✅ Verification email test:', emailData);
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testEmailService();
}

module.exports = { testEmailService };