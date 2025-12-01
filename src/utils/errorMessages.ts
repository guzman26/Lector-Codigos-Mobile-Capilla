/**
 * Error Message Translation System
 * Translates technical error codes and messages into user-friendly Spanish messages
 * with actionable suggestions when possible
 */

interface ErrorTranslation {
  message: string;
  suggestion?: string;
  userFriendly?: boolean;
}

/**
 * Common error patterns that need translation
 */
const ERROR_TRANSLATIONS: Record<string, ErrorTranslation> = {
  // Network Errors
  NETWORK_ERROR: {
    message: 'Error de conexión con el servidor',
    suggestion: 'Verifica tu conexión a internet e intenta nuevamente',
  },
  TIMEOUT_ERROR: {
    message: 'Tiempo de espera agotado',
    suggestion: 'La petición tardó demasiado. Intenta nuevamente',
  },
  
  // Validation Errors
  VALIDATION_ERROR: {
    message: 'Error de validación',
    suggestion: 'Verifica que los datos ingresados sean correctos',
  },
  'Box code must be 16 digits': {
    message: 'El código de caja debe tener 16 dígitos',
    suggestion: 'Verifica que hayas escaneado correctamente el código',
  },
  'Invalid box code: must be 16 digits': {
    message: 'Código de caja inválido: debe tener 16 dígitos',
    suggestion: 'Asegúrate de escanear el código completo',
  },
  'Invalid pallet code: must be 14 digits': {
    message: 'Código de pallet inválido: debe tener 14 dígitos',
    suggestion: 'Asegúrate de escanear el código completo de la tarja',
  },
  
  // Not Found Errors
  NOT_FOUND: {
    message: 'No encontrado',
    suggestion: 'Verifica que el código sea correcto',
  },
  'Box not found': {
    message: 'Caja no encontrada',
    suggestion: 'El código de caja no existe en el sistema. Verifica que hayas escaneado correctamente',
  },
  'Pallet not found': {
    message: 'Tarja no encontrada',
    suggestion: 'El código de tarja no existe en el sistema. Verifica que hayas escaneado correctamente',
  },
  'no fue encontrada': {
    message: 'El código no fue encontrado en el sistema',
    suggestion: 'Verifica que el código escaneado sea correcto. Si es una caja nueva, asegúrate de registrarla primero',
  },
  'no fue encontrado': {
    message: 'El código no fue encontrado en el sistema',
    suggestion: 'Verifica que el código escaneado sea correcto',
  },
  
  // Conflict Errors
  CONFLICT: {
    message: 'Conflicto en la operación',
    suggestion: 'El recurso ya existe o fue modificado. Intenta actualizar la página',
  },
  'Box with code': {
    message: 'La caja ya existe en el sistema',
    suggestion: 'Esta caja ya fue registrada anteriormente',
  },
  
  // Location/Operation Errors
  'Invalid location': {
    message: 'Ubicación inválida',
    suggestion: 'Verifica que la ubicación sea correcta',
  },
  'Cannot move': {
    message: 'No se puede mover',
    suggestion: 'La operación de movimiento no es válida para este estado',
  },
  
  // Server Errors
  INTERNAL_ERROR: {
    message: 'Error interno del servidor',
    suggestion: 'Ocurrió un error inesperado. Si el problema persiste, contacta al administrador',
  },
  
  // DynamoDB Errors
  'ResourceNotFoundException': {
    message: 'Recurso no encontrado',
    suggestion: 'El recurso solicitado no existe en la base de datos',
  },
  'ConditionalCheckFailedException': {
    message: 'La operación falló porque el recurso fue modificado',
    suggestion: 'Intenta actualizar la página y vuelve a intentar',
  },
  'ThrottlingException': {
    message: 'El servicio está temporalmente sobrecargado',
    suggestion: 'Espera unos segundos e intenta nuevamente',
  },
};

/**
 * Context-specific error translations
 * Provides more specific messages based on the operation context
 */
const CONTEXT_ERROR_MESSAGES: Record<string, Record<string, ErrorTranslation>> = {
  scan: {
    'NOT_FOUND': {
      message: 'Código no encontrado',
      suggestion: 'El código escaneado no existe en el sistema. Verifica que sea correcto',
    },
    'VALIDATION_ERROR': {
      message: 'Código inválido',
      suggestion: 'El formato del código no es válido. Debe ser de 12 dígitos (tarja) o 16 dígitos (caja)',
    },
  },
  move: {
    'NOT_FOUND': {
      message: 'No se puede mover: el código no existe',
      suggestion: 'Verifica que el código sea correcto antes de intentar moverlo',
    },
    'VALIDATION_ERROR': {
      message: 'No se puede mover: ubicación inválida',
      suggestion: 'Verifica que la ubicación de destino sea válida',
    },
  },
  create: {
    'CONFLICT': {
      message: 'El código ya existe',
      suggestion: 'Este código ya fue registrado anteriormente. Verifica que no sea un duplicado',
    },
    'VALIDATION_ERROR': {
      message: 'Datos inválidos',
      suggestion: 'Revisa que todos los campos requeridos estén completos y sean válidos',
    },
  },
};

/**
 * Translates an error message to a user-friendly version
 * @param error - Error object or message string
 * @param context - Operation context (scan, move, create, etc.)
 * @returns User-friendly error message with suggestion
 */
export function translateError(
  error: Error | string | unknown,
  context?: string
): { message: string; suggestion?: string } {
  let errorMessage = '';
  let errorCode = '';
  
  // Extract error message and code
  if (error instanceof Error) {
    errorMessage = error.message;
    errorCode = (error as any).code || '';
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    errorMessage = (error as any).message || (error as any).error?.message || '';
    errorCode = (error as any).code || (error as any).error?.code || '';
  }
  
  // First, try context-specific translations
  if (context && CONTEXT_ERROR_MESSAGES[context]) {
    const contextTranslations = CONTEXT_ERROR_MESSAGES[context];
    
    // Try error code first
    if (errorCode && contextTranslations[errorCode]) {
      const translation = contextTranslations[errorCode];
      return {
        message: translation.message,
        suggestion: translation.suggestion,
      };
    }
    
    // Then try matching message patterns
    for (const [pattern, translation] of Object.entries(contextTranslations)) {
      if (errorMessage.includes(pattern) || errorMessage === pattern) {
        return {
          message: translation.message,
          suggestion: translation.suggestion,
        };
      }
    }
  }
  
  // Try general error code translations
  if (errorCode && ERROR_TRANSLATIONS[errorCode]) {
    const translation = ERROR_TRANSLATIONS[errorCode];
    return {
      message: translation.message,
      suggestion: translation.suggestion,
    };
  }
  
  // Try to match message patterns
  for (const [pattern, translation] of Object.entries(ERROR_TRANSLATIONS)) {
    if (errorMessage.includes(pattern) || errorMessage === pattern) {
      return {
        message: translation.message,
        suggestion: translation.suggestion,
      };
    }
  }
  
  // Default: return original message if no translation found
  // But make it slightly more user-friendly
  if (errorMessage) {
    // Check if message is already in Spanish and user-friendly (from backend improvements)
    const isSpanishMessage = /[áéíóúñüÁÉÍÓÚÑÜ]/.test(errorMessage);
    const isTechnicalMessage = errorMessage.includes('Exception') || 
                                errorMessage.includes('Error:') ||
                                errorMessage.includes('code:') ||
                                errorMessage.startsWith('Error ');
    
    // If message is already in Spanish and not technical, use it directly
    if (isSpanishMessage && !isTechnicalMessage) {
      return {
        message: errorMessage,
        suggestion: 'Si el problema persiste, contacta al administrador',
      };
    }
    
    // Remove technical prefixes
    let friendlyMessage = errorMessage
      .replace(/^Error \d+: /, '')
      .replace(/^\[.*?\] /, '')
      .replace(/Error:/g, '')
      .trim();
    
    // If it's still very technical, add a generic prefix
    if (friendlyMessage.includes('Exception') || friendlyMessage.includes('Error:')) {
      friendlyMessage = `Error: ${friendlyMessage}`;
    }
    
    return {
      message: friendlyMessage,
      suggestion: 'Si el problema persiste, contacta al administrador',
    };
  }
  
  // Ultimate fallback
  return {
    message: 'Ocurrió un error inesperado',
    suggestion: 'Por favor intenta nuevamente o contacta al administrador si el problema persiste',
  };
}

/**
 * Gets a user-friendly error message for display in UI
 * @param error - Error object or message
 * @param context - Operation context
 * @returns Formatted error message string
 */
export function getUserFriendlyError(
  error: Error | string | unknown,
  context?: string
): string {
  const { message } = translateError(error, context);
  return message;
}

/**
 * Gets error message with suggestion for display
 * @param error - Error object or message
 * @param context - Operation context
 * @returns Object with message and optional suggestion
 */
export function getErrorWithSuggestion(
  error: Error | string | unknown,
  context?: string
): { message: string; suggestion?: string } {
  return translateError(error, context);
}

