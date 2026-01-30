/**
 * Extracts error message from unknown error type
 * @param error - Error object (unknown type)
 * @param defaultMessage - Default message if error is not an Error instance
 * @returns Error message string
 */
export const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return defaultMessage;
};
