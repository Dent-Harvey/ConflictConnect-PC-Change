/**
 * Email verification service for the frontend.
 * This service makes API calls to a separate backend to handle email sending.
 */

import { errorHandler } from '@/utils/errorHandler';

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
}

// TODO: Replace this with your deployed Heroku backend URL.
// Example: 'https://your-heroku-app-name.herokuapp.com'
const BACKEND_URL = 'https://salty-lowlands-58490-5fc433b57f0a.herokuapp.com/'; 

/**
 * Sends a verification email with a 6-digit code by making an API call to the backend.
 */
export const sendVerificationEmail = async (
  email: string,
  code: string,
): Promise<EmailVerificationResponse> => {
  try {
    console.log(`[EMAIL SERVICE] Sending verification email via backend to: ${email}`);
    
    const response = await fetch(`${BACKEND_URL}/api/email/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[EMAIL SERVICE] Failed to send email:', data.error);
      return {
        success: false,
        message: data.message || 'Failed to send verification email. Please try again.',
      };
    }

    console.log(`[EMAIL SERVICE] Verification email sent successfully to ${email}`);
    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error('[EMAIL SERVICE] Network or server error:', error);
    errorHandler({
      filePath: 'services/emailService.ts',
      functionName: 'sendVerificationEmail',
      error: error as Error
    });
    
    return {
      success: false,
      message: 'Network error. Could not connect to the email service.',
    };
  }
};
