import type { CodeValidationResult } from '../api/types';

/**
 * Validates if a code is a valid box code (15 digits)
 */
export const isValidBoxCode = (code: string): boolean => {
  if (!code || typeof code !== 'string') return false;
  
  // Remove any whitespace
  const cleanCode = code.trim();
  
  // Check if it's exactly 15 digits
  return /^\d{15}$/.test(cleanCode);
};

/**
 * Validates if a code is a valid pallet code (14 digits)
 */
export const isValidPalletCode = (code: string): boolean => {
  if (!code || typeof code !== 'string') return false;
  
  // Remove any whitespace
  const cleanCode = code.trim();
  
  // Check if it's exactly 14 digits
  return /^\d{14}$/.test(cleanCode);
};

/**
 * Validates a scanned code and returns detailed validation result
 */
export const validateScannedCode = (code: string): CodeValidationResult => {
  if (!code || typeof code !== 'string') {
    return {
      isValid: false,
      errorMessage: 'El código es requerido'
    };
  }

  const cleanCode = code.trim();

  if (cleanCode.length === 0) {
    return {
      isValid: false,
      errorMessage: 'El código no puede estar vacío'
    };
  }

  // Check for box code (15 digits)
  if (isValidBoxCode(cleanCode)) {
    return {
      isValid: true,
      type: 'box'
    };
  }

  // Check for pallet code (14 digits)
  if (isValidPalletCode(cleanCode)) {
    return {
      isValid: true,
      type: 'pallet'
    };
  }

  // Invalid code
  return {
    isValid: false,
    errorMessage: 'El código debe ser válido: código de caja (15 dígitos) o código de pallet (14 dígitos)'
  };
};

/**
 * Sanitizes a code by removing whitespace and non-numeric characters
 */
export const sanitizeCode = (code: string): string => {
  if (!code || typeof code !== 'string') return '';
  
  return code.replace(/\D/g, ''); // Remove all non-digit characters
};

/**
 * Formats a code for display purposes
 */
export const formatCodeForDisplay = (code: string): string => {
  const clean = sanitizeCode(code);
  
  if (clean.length === 14) {
    // Format pallet code: XXXX-XXXX-XXXX-XX
    return clean.replace(/(\d{4})(\d{4})(\d{4})(\d{2})/, '$1-$2-$3-$4');
  }
  
  if (clean.length === 15) {
    // Format box code: XXXXX-XXXXX-XXXXX
    return clean.replace(/(\d{5})(\d{5})(\d{5})/, '$1-$2-$3');
  }
  
  return clean;
};

/**
 * Validates issue report description
 */
export const validateIssueDescription = (description: string): { isValid: boolean; errorMessage?: string } => {
  if (!description || typeof description !== 'string') {
    return {
      isValid: false,
      errorMessage: 'La descripción es requerida'
    };
  }

  const trimmed = description.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      errorMessage: 'La descripción no puede estar vacía'
    };
  }

  if (trimmed.length > 1000) {
    return {
      isValid: false,
      errorMessage: 'La descripción no puede exceder los 1000 caracteres'
    };
  }

  if (trimmed.length < 10) {
    return {
      isValid: false,
      errorMessage: 'La descripción debe tener al menos 10 caracteres'
    };
  }

  return {
    isValid: true
  };
}; 