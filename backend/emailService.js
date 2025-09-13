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
  return nodemailer.createTransporter(SMTP_CONFIG);
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
 * Send verification email
 */
app.post('/api/email/send-verification', async (req, res) => {
  try {
    const { email, from, project_id } = req.body;
    
    if (!email || !email.to || !email.subject || !email.html) {
      return res.status(400).json({
        success: false,
        message: 'Missing required email fields'
      });
    }
    
    console.log(`[EMAIL API] Sending verification email to: ${email.to}`);
    console.log(`[EMAIL API] Project ID: ${project_id}`);
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: from?.name || 'Crisis Connect',
        address: from?.email || 'conflictconnect@neffcreative.co',
      },
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    };
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log(`[EMAIL API] Email sent successfully:`, result.messageId);
    
    res.json({
      success: true,
      message: `Verification email sent to ${email.to}`,
      messageId: result.messageId
    });
    
  } catch (error) {
    console.error('[EMAIL API] Failed to send email:', error);
    
    // Enhanced error logging
    if (error.code) {
      console.error('[EMAIL API] SMTP Error Code:', error.code);
    }
    if (error.response) {
      console.error('[EMAIL API] SMTP Response:', error.response);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email',
      error: error.message
    });
  }
});

/**
 * Send general email
 */
app.post('/api/email/send', async (req, res) => {
  try {
    const { to, subject, html, text, from, project_id } = req.body;
    
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, and html or text'
      });
    }
    
    console.log(`[EMAIL API] Sending email to: ${to}`);
    console.log(`[EMAIL API] Subject: ${subject}`);
    console.log(`[EMAIL API] Project ID: ${project_id}`);
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: from?.name || 'Crisis Connect',
        address: from?.email || 'conflictconnect@neffcreative.co',
      },
      to,
      subject,
      html,
      text,
    };
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log(`[EMAIL API] Email sent successfully:`, result.messageId);
    
    res.json({
      success: true,
      message: `Email sent to ${to}`,
      messageId: result.messageId
    });
    
  } catch (error) {
    console.error('[EMAIL API] Failed to send email:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
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
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Crisis Connect Email Service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Test connection: http://localhost:${PORT}/api/email/test-connection`);
});

module.exports = app;