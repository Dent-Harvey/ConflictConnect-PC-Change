import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

// Initialize Firebase Admin
admin.initializeApp();

// SMTP Configuration - Use your existing email server
const SMTP_CONFIG = {
  host: 'mail.privateemail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'conflictconnect@neffcreative.co',
    // IMPORTANT: Store password in Firebase environment config
    // Run: firebase functions:config:set smtp.password="YOUR_PASSWORD"
    pass: functions.config().smtp?.password || process.env.SMTP_PASSWORD,
  },
};

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport(SMTP_CONFIG);
};

/**
 * Cloud Function to send verification emails
 * Called from the React Native app
 */
export const sendVerificationEmail = functions.https.onCall(async (data, context) => {
  try {
    // Validate input
    const { email, code } = data;
    
    if (!email || !code) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email and verification code are required'
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid email address'
      );
    }

    // Create email content
    const mailOptions = {
      from: '"Conflict Connect" <conflictconnect@neffcreative.co>',
      to: email,
      subject: 'Verify Your Email - Conflict Connect',
      html: createVerificationEmailHTML(code),
      text: createVerificationEmailText(code),
    };

    // Send email
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);

    console.log('Verification email sent:', {
      email,
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      code,
      message: 'Verification email sent successfully',
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send verification email',
      error.message
    );
  }
});

/**
 * Cloud Function to send general emails
 * For notifications, alerts, etc.
 */
export const sendEmail = functions.https.onCall(async (data, context) => {
  try {
    // Optional: Add authentication check
    // if (!context.auth) {
    //   throw new functions.https.HttpsError(
    //     'unauthenticated',
    //     'Must be authenticated to send emails'
    //   );
    // }

    const { to, subject, html, text } = data;

    if (!to || !subject || (!html && !text)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required email fields'
      );
    }

    const mailOptions = {
      from: '"Conflict Connect" <conflictconnect@neffcreative.co>',
      to,
      subject,
      html: html || text,
      text: text || html,
    };

    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', {
      to,
      subject,
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send email',
      error.message
    );
  }
});

/**
 * Test endpoint to verify SMTP configuration
 */
export const testSmtpConnection = functions.https.onCall(async (data, context) => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    
    return {
      success: true,
      message: 'SMTP connection successful',
      config: {
        host: SMTP_CONFIG.host,
        port: SMTP_CONFIG.port,
        user: SMTP_CONFIG.auth.user,
      },
    };
  } catch (error: any) {
    console.error('SMTP connection test failed:', error);
    throw new functions.https.HttpsError(
      'internal',
      'SMTP connection failed',
      error.message
    );
  }
});

// Helper functions for email templates
function createVerificationEmailHTML(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification - Conflict Connect</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
        .container { background-color: #ffffff; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #D32F2F; margin-bottom: 10px; }
        .subtitle { color: #666; font-size: 14px; }
        .code-container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0; }
        .code { font-size: 42px; font-weight: bold; color: #ffffff; letter-spacing: 10px; font-family: 'Courier New', monospace; }
        .message { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
        .warning { background-color: #fff3cd; border-left: 4px solid: #ffc107; padding: 15px; margin-top: 20px; border-radius: 5px; color: #856404; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌍 CONFLICT CONNECT</div>
          <div class="subtitle">Mutual Aid & Resource Matching</div>
        </div>
        
        <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
        
        <p style="text-align: center; color: #666;">
          Thank you for registering with Conflict Connect. Please use the verification code below to complete your registration:
        </p>
        
        <div class="code-container">
          <div class="code">${code}</div>
        </div>
        
        <p class="message">
          Enter this code in the app to verify your email address and activate your account.
          <br><br>
          <strong>This code will expire in 10 minutes.</strong>
        </p>
        
        <div class="warning">
          <strong>⚠️ Security Notice:</strong><br>
          If you didn't request this verification code, please ignore this email. Your account security is important to us.
        </div>
        
        <div class="footer">
          <p>
            This is an automated message from Conflict Connect<br>
            Please do not reply to this email
          </p>
          <p style="margin-top: 10px;">
            © ${new Date().getFullYear()} Conflict Connect. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function createVerificationEmailText(code: string): string {
  return `
CONFLICT CONNECT - Email Verification

Thank you for registering with Conflict Connect!

Your verification code is: ${code}

Enter this code in the app to verify your email address and activate your account.

This code will expire in 10 minutes.

SECURITY NOTICE:
If you didn't request this verification code, please ignore this email.

---
This is an automated message from Conflict Connect
Please do not reply to this email

© ${new Date().getFullYear()} Conflict Connect. All rights reserved.
  `.trim();
}

