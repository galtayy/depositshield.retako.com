/**
 * Environment configuration for the application
 * This centralizes all environment-specific flags and settings
 */

// Determine if we're in a development environment
const isDevelopment = process.env.NODE_ENV === 'development';

// Safe development mode flag - by default, only allow demo accounts in development
const ENABLE_DEMO_MODE = isDevelopment;

// Configuration for demo/test accounts
const DEMO_ACCOUNTS = {
  // Demo accounts that will work in development mode
  EMAILS: ['demo@example.com', 'test@depositshield.com'],
  
  // Admin accounts should never be used for demos in a production setting
  ADMIN_EMAILS: isDevelopment ? ['admin@depositshield.com'] : [],
  
  // Demo verification code - only works in development
  VERIFICATION_CODE: '1234',
  
  // Demo token - only used in development
  TOKEN: 'demo-token'
};

// Determine if a given email is a demo account
const isDemoAccount = (email) => {
  if (!email || !ENABLE_DEMO_MODE) return false;
  
  const lowerEmail = email.toLowerCase();
  return [
    ...DEMO_ACCOUNTS.EMAILS,
    ...DEMO_ACCOUNTS.ADMIN_EMAILS
  ].includes(lowerEmail);
};

// Debug logging helper - only logs in development
const debugLog = (message, data) => {
  if (isDevelopment) {
    console.log(`[DEBUG] ${message}`, data || '');
  }
};

// Export configuration
module.exports = {
  IS_DEVELOPMENT: isDevelopment,
  ENABLE_DEMO_MODE,
  DEMO_ACCOUNTS,
  isDemoAccount,
  debugLog
};