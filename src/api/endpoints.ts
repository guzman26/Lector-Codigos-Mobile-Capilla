import { apiClient } from './apiClient';
import { validateScannedCode } from '../utils/validators';
import type { 
  GetInfoFromScannedCodeRequest, 
  ScannedCodeInfo,
  ApiResponse 
} from './types';

/**
 * Gets information from a scanned code
 * Validates the code before making the request
 */
export const getInfoFromScannedCode = async (
  request: GetInfoFromScannedCodeRequest
): Promise<ApiResponse<ScannedCodeInfo>> => {
  // Client-side validation
  const validation = validateScannedCode(request.codigo);
  
  if (!validation.isValid) {
    throw new apiClient.ApiClientError(
      validation.errorMessage || 'Código inválido',
      'VALIDATION_ERROR'
    );
  }

  // Make the API request
  try {
    const response = await apiClient.get<ScannedCodeInfo>(
      '/getInfoFromScannedCode',
      { codigo: request.codigo.trim() }
    );

    return response;
  } catch (error) {
    // Re-throw with more context if needed
    if (error instanceof apiClient.ApiClientError) {
      throw error;
    }
    
    throw new apiClient.ApiClientError(
      'Error al obtener información del código escaneado',
      'REQUEST_FAILED',
      error
    );
  }
};

/**
 * Alternative method that returns only the data or throws an error
 * Useful for simpler error handling in components
 */
export const getScannedCodeInfo = async (codigo: string): Promise<ScannedCodeInfo> => {
  const response = await getInfoFromScannedCode({ codigo });
  
  if (!response.success || !response.data) {
    throw new apiClient.ApiClientError(
      response.error || 'No se pudo obtener la información del código',
      'NO_DATA'
    );
  }
  
  return response.data;
};

/**
 * API endpoints object for easy access
 */
export const endpoints = {
  getInfoFromScannedCode,
  getScannedCodeInfo,
} as const; 