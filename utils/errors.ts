// Custom error classes for better error handling
export class RecipeAPIError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'RecipeAPIError';
    this.code = code;
    this.details = details;
    
    // This is needed to make instanceof work correctly with custom errors
    Object.setPrototypeOf(this, RecipeAPIError.prototype);
  }
}

// Common error codes
export const ErrorCodes = {
  RATE_LIMITED: 'RATE_LIMITED',
  NOT_FOUND: 'NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  API_ERROR: 'API_ERROR',
  UNKNOWN: 'UNKNOWN'
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]; 