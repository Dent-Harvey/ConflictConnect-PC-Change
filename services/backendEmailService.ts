import { errorHandler } from '@/utils/errorHandler';
import { project_id } from '@/9gen_config.json';

/**
 * Backend-compatible email service for React Native
 * This service makes HTTP requests to a backend API for email functionality
 */

export interface EmailVerificationResponse {
  success: boolean;
  code: string;
  message: string;
}

export interface EmailServiceRequest {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Backend API base URL
// Using deployed Heroku instance provided by user
const BACKEND_API_BASE = process.env.EXPO_PUBLIC_BACKEND_API_URL || 'https://crisis-connectv2-email-api-6e60d3cf962a.herokuapp.com/api';

/**
 * Generates a random 6-digit verification code
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sends a verification email via backend API
 */
export const sendVerificationEmail = async (
  email: string, 
  code: string
): Promise<EmailVerificationResponse> => {
  try {
    console.log(`[BACKEND EMAIL SERVICE] Requesting verification email for: ${email}`);
    console.log(`[BACKEND EMAIL SERVICE] Verification code: ${code}`);
    
    const emailRequest: EmailServiceRequest = {
      to: email,
      subject: 'Crisis Connect - Verify Your Email',
      html: createVerificationEmailHTML(code),
      text: createVerificationEmailText(code),
    };
    
    const response = await fetch(`${BACKEND_API_BASE}/email/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id,
        email: emailRequest,
        from: {
          name: 'Crisis Connect',
          email: 'conflictconnect@neffcreative.co',
        },
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Backend API Error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log(`[BACKEND EMAIL SERVICE] Email request sent successfully to backend`);
    
    return {
      success: true,
      code,
      message: `Verification code sent to ${email}`,
    };
    
  } catch (error) {
    console.error('[BACKEND EMAIL SERVICE] Failed to send email request:', error);
    
    // Handle API errors without using errorHandler (API calls don't use errorHandler)
    console.error('[BACKEND EMAIL SERVICE] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      email,
      timestamp: new Date().toISOString(),
    });
    
    return {
      success: false,
      code: '',
      message: 'Failed to send verification email. Please try again.',
    };
  }
};

/**
 * Alternative: Use 9gen AI service to send emails (if your backend supports it)
 */
export const sendVerificationEmailViaAI = async (
  email: string, 
  code: string
): Promise<EmailVerificationResponse> => {
  try {
    console.log(`[AI EMAIL SERVICE] Requesting verification email via AI service for: ${email}`);
    
    const prompt = `Send a verification email to ${email} with the code ${code}. Use the following details:
- From: Crisis Connect <conflictconnect@neffcreative.co>
- Subject: Crisis Connect - Verify Your Email
- Include the 6-digit code prominently in the email
- Make it professional and friendly
- Explain that the code expires in 10 minutes`;
    
    const response = await fetch('https://api.9gen.dev/api/ai/text-generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: 'gpt-4.1-mini',
        max_tokens: 200,
        temperature: 0.3,
        system_message: 'You are an email service that can send verification emails. Generate appropriate email content and send the email.',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`AI Service Error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`[AI EMAIL SERVICE] Email generation successful`);
      return {
        success: true,
        code,
        message: `Verification code sent to ${email}`,
      };
    } else {
      throw new Error('AI service failed to generate email');
    }
    
  } catch (error) {
    console.error('[AI EMAIL SERVICE] Failed to send email via AI:', error);
    
    return {
      success: false,
      code: '',
      message: 'Failed to send verification email. Please try again.',
    };
  }
};

/**
 * Creates HTML content for verification email
 */
const createVerificationEmailHTML = (code: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Email Verification</h2>
      <p style="color: #666; font-size: 16px; line-height: 1.5;">
        Thank you for joining Crisis Connect. Please enter the verification code below in the app to verify your email:
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
  `;
};

/**
 * Creates plain text content for verification email
 */
const createVerificationEmailText = (code: string): string => {
  return `
Email Verification

Thank you for joining Crisis Connect. Please enter the verification code below in the app to verify your email:

${code}

This code will expire in 10 minutes.

If you didn't request this verification, please ignore this email.

Crisis Connect - Connecting those who can help with those who need it
  `;
};

/**
 * Validates a verification code format
 */
export const validateVerificationCode = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};

/**
 * Test backend email service health
 */
export const checkEmailServiceHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_API_BASE}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('[BACKEND EMAIL SERVICE] Backend service is healthy');
      return true;
    } else {
      console.error('[BACKEND EMAIL SERVICE] Backend service health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('[BACKEND EMAIL SERVICE] Backend service is unreachable:', error);
    return false;
  }
};