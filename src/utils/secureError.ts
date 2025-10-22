/**
 * Security utility to sanitize error messages and prevent information leakage
 */

interface SecureErrorOptions {
  showDetails?: boolean;
  logError?: boolean;
}

export const createSecureError = (
  error: any, 
  fallbackMessage: string = "An error occurred. Please try again.",
  options: SecureErrorOptions = {}
) => {
  const { showDetails = false, logError = true } = options;

  // Log the full error for debugging (server-side or development)
  if (logError && process.env.NODE_ENV === 'development') {
    console.error('Secure Error Log:', error);
  }

  // In production or when showDetails is false, return sanitized message
  if (!showDetails || process.env.NODE_ENV === 'production') {
    return fallbackMessage;
  }

  // For development, show more details but still sanitize sensitive info
  if (error?.message) {
    const message = error.message.toLowerCase();
    
    // Block potentially sensitive error messages
    const sensitivePatterns = [
      'database',
      'sql',
      'connection',
      'timeout',
      'internal',
      'server error',
      'authentication failed',
      'invalid session',
      'token',
      'unauthorized'
    ];

    const containsSensitive = sensitivePatterns.some(pattern => 
      message.includes(pattern)
    );

    if (containsSensitive) {
      return fallbackMessage;
    }

    return error.message;
  }

  return fallbackMessage;
};

export const sanitizeAuthError = (error: any): string => {
  if (!error?.message) {
    return "Authentication failed. Please try again.";
  }

  const message = error.message.toLowerCase();

  // Map common auth errors to user-friendly messages
  const errorMappings: Record<string, string> = {
    'invalid login credentials': 'Invalid email or password.',
    'email not confirmed': 'Please check your email and click the confirmation link.',
    'user already registered': 'An account with this email already exists.',
    'weak password': 'Password is too weak. Please use a stronger password.',
    'invalid email': 'Please enter a valid email address.',
    'signup disabled': 'Account registration is currently disabled.',
    'too many requests': 'Too many attempts. Please wait before trying again.',
  };

  // Check for mapped errors
  for (const [key, value] of Object.entries(errorMappings)) {
    if (message.includes(key)) {
      return value;
    }
  }

  // Default fallback for unmapped auth errors
  return "Authentication failed. Please try again.";
};