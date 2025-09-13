import { errorHandler } from '@/utils/errorHandler';
import * as nodemailer from 'nodemailer';

/**
 * Email verification service using SMTP
 */

export interface EmailVerificationResponse {
  success: boolean;
  code: string;
  message: string;
}

// SMTP Configuration
const SMTP_CONFIG = {
  host: 'mail.privateemail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: 'conflictconnect@neffcreative.co',
    pass: 'MutualAid13',
  },
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport(SMTP_CONFIG);
};

/**
 * Generates a random 6-digit verification code
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sends a verification email with a 6-digit code using SMTP
 */
export const sendVerificationEmail = async (
  email: string, 
  code: string
): Promise<EmailVerificationResponse> => {
  try {
    console.log(`[EMAIL SERVICE] Sending verification email to: ${email}`);
    console.log(`[EMAIL SERVICE] Verification code: ${code}`);
    
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
    
    console.log(`[EMAIL SERVICE] Verification email sent successfully to: ${email}`);
    
    return {
      success: true,
      code,
      message: `Verification code sent to ${email}`,
    };
    
  } catch (error) {
    console.error('[EMAIL SERVICE] Failed to send email:', error);
    
    // Enhanced error logging for debugging
    if (error instanceof Error) {
      console.error('[EMAIL SERVICE] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        // @ts-ignore - accessing potential nodemailer-specific properties
        code: error.code,
        // @ts-ignore
        command: error.command,
        // @ts-ignore
        response: error.response,
        // @ts-ignore
        responseCode: error.responseCode,
      });
    }
    
    errorHandler({
      filePath: 'services/emailService.ts',
      functionName: 'sendVerificationEmail',
      error: error as Error
    });
    
    return {
      success: false,
      code: '',
      message: 'Failed to send verification email. Please try again.',
    };
  }
};

/**
 * Validates a verification code format
 */
export const validateVerificationCode = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};

/**
 * Tests SMTP connection health
 */
export const checkEmailServiceHealth = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('[EMAIL SERVICE] SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('[EMAIL SERVICE] SMTP connection failed:', error);
    
    // Enhanced error logging for connection issues
    if (error instanceof Error) {
      console.error('[EMAIL SERVICE] Connection error details:', {
        name: error.name,
        message: error.message,
        // @ts-ignore
        code: error.code,
        // @ts-ignore
        errno: error.errno,
        // @ts-ignore
        syscall: error.syscall,
        // @ts-ignore
        address: error.address,
        // @ts-ignore
        port: error.port,
      });
    }
    
    errorHandler({
      filePath: 'services/emailService.ts',
      functionName: 'checkEmailServiceHealth',
      error: error as Error
    });
    return false;
  }
};