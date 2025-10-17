/**
 * Configuration for Firebase Cloud Functions
 * 
 * To set the SMTP password:
 * firebase functions:config:set smtp.password="YOUR_PASSWORD_HERE"
 * 
 * To view current config:
 * firebase functions:config:get
 */

export const EMAIL_CONFIG = {
  from: {
    name: 'Conflict Connect',
    email: 'conflictconnect@neffcreative.co',
  },
  smtp: {
    host: 'mail.privateemail.com',
    port: 465,
    secure: true,
    user: 'conflictconnect@neffcreative.co',
  },
  templates: {
    verification: {
      subject: 'Verify Your Email - Conflict Connect',
      expiryMinutes: 10,
    },
  },
};

