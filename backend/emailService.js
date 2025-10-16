/**
 * Backend Email Service for Crisis Connect
 * This is a Node.js/Express server that handles email sending
 * Deploy this as a separate backend service
 */

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// SMTP Configuration
const SMTP_CONFIG = {
  host: 'mail.privateemail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'conflictconnect@neffcreative.co',
    pass: 'MutualAid13',
  },
};

// Create transporter
const createTransporter = () => {
  // Nodemailer API: createTransport (not createTransporter)
  return nodemailer.createTransport(SMTP_CONFIG);
};

// Routes

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Crisis Connect Email Service',
    timestamp: new Date().toISOString() 
  });
});

/**
 * Test SMTP connection
 */
app.get('/api/email/test-connection', async (req, res) => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    
    res.json({
      success: true,
      message: 'SMTP connection verified successfully'
    });
  } catch (error) {
    console.error('SMTP connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'SMTP connection failed',
      error: error.message
    });
  }
});

/**
 * API endpoint to send a verification email
 */
app.post('/api/email/send-verification', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: 'Email and code are required.'
    });
  }

  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Crisis Connect',
        address: 'conflictconnect@neffcreative.co',
      },
      to: email,
      subject: 'Happy to Help? Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Email Verification</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Happy to Help? Enter the below code within the app to verify your email:
          </p>
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
            ">${code}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">
            This code will expire in 10 minutes.
          </p>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this verification, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">
            Crisis Connect - Connecting those who can help with those who need it
          </p>
        </div>
      `,
      text: `
        Email Verification
        
        Happy to Help? Enter the below code within the app to verify your email:
        
        ${code}
        
        This code will expire in 10 minutes.
        
        If you didn't request this verification, please ignore this email.
        
        Crisis Connect - Connecting those who can help with those who need it
      `,
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: `Verification code sent to ${email}`,
    });
    
  } catch (error) {
    console.error('Failed to send verification email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email. Please try again.',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Email service backend listening on port ${PORT}`);
});
