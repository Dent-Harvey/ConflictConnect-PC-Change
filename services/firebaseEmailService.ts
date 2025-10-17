/**
 * Firebase Cloud Functions Email Service
 * Uses Firebase Cloud Functions instead of external backend
 */

import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
import { app } from '@/config/firebase';

export interface EmailVerificationResponse {
  success: boolean;
  code: string;
  message: string;
  messageId?: string;
}

export interface EmailServiceRequest {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Initialize Firebase Functions
let functions: Functions;
try {
  functions = getFunctions(app);
  // Uncomment for local emulator testing:
  // import { connectFunctionsEmulator } from 'firebase/functions';
  // connectFunctionsEmulator(functions, 'localhost', 5001);
} catch (error) {
  console.error('[FIREBASE EMAIL] Error initializing Firebase Functions:', error);
  throw error;
}

/**
 * Generates a random 6-digit verification code
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sends a verification email via Firebase Cloud Function
 */
export const sendVerificationEmail = async (
  email: string, 
  code: string
): Promise<EmailVerificationResponse> => {
  try {
    console.log(`[FIREBASE EMAIL] Requesting verification email for: ${email}`);
    console.log(`[FIREBASE EMAIL] Verification code: ${code}`);
    
    // Call Firebase Cloud Function
    const sendEmailFunction = httpsCallable<
      { email: string; code: string },
      EmailVerificationResponse
    >(functions, 'sendVerificationEmail');
    
    const result = await sendEmailFunction({ email, code });
    
    console.log(`[FIREBASE EMAIL] Email sent successfully via Cloud Function`);
    
    return {
      success: true,
      code,
      message: result.data.message || `Verification code sent to ${email}`,
      messageId: result.data.messageId,
    };
    
  } catch (error: any) {
    console.error('[FIREBASE EMAIL] Failed to send email via Cloud Function:', error);
    
    // Log error details
    console.error('[FIREBASE EMAIL] Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      email,
      timestamp: new Date().toISOString(),
    });
    
    return {
      success: false,
      code: '',
      message: error.message || 'Failed to send verification email. Please try again.',
    };
  }
};

/**
 * Sends a general email via Firebase Cloud Function
 */
export const sendEmail = async (
  emailData: EmailServiceRequest
): Promise<{ success: boolean; message: string; messageId?: string }> => {
  try {
    console.log(`[FIREBASE EMAIL] Sending email to: ${emailData.to}`);
    
    const sendEmailFunction = httpsCallable<
      EmailServiceRequest,
      { success: boolean; message: string; messageId?: string }
    >(functions, 'sendEmail');
    
    const result = await sendEmailFunction(emailData);
    
    console.log(`[FIREBASE EMAIL] Email sent successfully`);
    
    return result.data;
    
  } catch (error: any) {
    console.error('[FIREBASE EMAIL] Failed to send email:', error);
    
    return {
      success: false,
      message: error.message || 'Failed to send email',
    };
  }
};

/**
 * Tests SMTP connection via Firebase Cloud Function
 */
export const testSmtpConnection = async (): Promise<{
  success: boolean;
  message: string;
  config?: any;
}> => {
  try {
    console.log('[FIREBASE EMAIL] Testing SMTP connection...');
    
    const testFunction = httpsCallable<
      Record<string, never>,
      { success: boolean; message: string; config?: any }
    >(functions, 'testSmtpConnection');
    
    const result = await testFunction({});
    
    console.log('[FIREBASE EMAIL] SMTP test result:', result.data);
    
    return result.data;
    
  } catch (error: any) {
    console.error('[FIREBASE EMAIL] SMTP test failed:', error);
    
    return {
      success: false,
      message: error.message || 'SMTP connection test failed',
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
 * Check if Firebase Functions are available
 */
export const checkEmailServiceHealth = async (): Promise<boolean> => {
  try {
    const result = await testSmtpConnection();
    return result.success;
  } catch (error) {
    console.error('[FIREBASE EMAIL] Service health check failed:', error);
    return false;
  }
};

/**
 * Utility to get Functions instance (for testing/debugging)
 */
export const getFunctionsInstance = (): Functions => {
  return functions;
};

