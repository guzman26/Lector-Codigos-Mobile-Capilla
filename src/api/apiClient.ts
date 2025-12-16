import type { ApiResponse, ApiError, RequestConfig } from './types';
import { API_BASE_URL } from './index';
import { translateError } from '../utils/errorMessages';

/**
 * Default configuration for API requests
 */
const DEFAULT_CONFIG: RequestConfig = {
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  retries: 3,
};
/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  public code?: string | number;
  public details?: unknown;

  constructor(message: string, code?: string | number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Creates a fetch request with timeout support
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

/**
 * Makes a retry-enabled request
 */
const makeRequestWithRetries = async (
  url: string,
  options: RequestInit,
  config: RequestConfig,
  retries: number = 0
): Promise<Response> => {
  try {
    return await fetchWithTimeout(url, options, config.timeout!);
  } catch (error) {
    if (retries < config.retries! && shouldRetry(error)) {
      console.warn(`Request failed, retrying (${retries + 1}/${config.retries})...`);
      await delay(Math.pow(2, retries) * 1000); // Exponential backoff
      return makeRequestWithRetries(url, options, config, retries + 1);
    }
    throw error;
  }
};

/**
 * Determines if an error should trigger a retry
 */
const shouldRetry = (error: unknown): boolean => {
  if (error instanceof Error) {
    // Retry on network errors, not on application errors
    return error.name === 'AbortError' || error.message.includes('fetch');
  }
  return false;
};

/**
 * Utility function to add delay for retries
 */
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Processes the API response and handles errors
 * Handles unified format: { status: 'success'|'fail'|'error', message, error?: { code, message, field?, details?, suggestion? }, data?, meta }
 * Also supports legacy format: { success: boolean, data, error: { code, message }, meta }
 */
const processResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const contentType = response.headers.get('content-type');
  
  let data: unknown;
  try {
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch (parseError) {
    throw new ApiClientError(
      'Error al procesar la respuesta del servidor',
      'PARSE_ERROR',
      parseError
    );
  }

  // Handle unified format and legacy format from response body
  if (typeof data === 'object' && data !== null) {
    const responseData = data as any;
    
    // Nuevo formato unificado: { status: 'success'|'fail'|'error', message, error?: {...}, data?, meta }
    if ('status' in responseData && typeof responseData.status === 'string') {
      const status = responseData.status;
      
      // Error response (status: 'fail' or 'error')
      if (status === 'fail' || status === 'error') {
        const errorInfo = responseData.error || {};
        const errorMessage = errorInfo.message || responseData.message || 'Error desconocido';
        const errorCode = errorInfo.code || response.status || 'UNKNOWN_ERROR';
        
        // Include additional error information
        const errorDetails: any = {
          ...responseData,
          field: errorInfo.field,
          suggestion: errorInfo.suggestion,
          details: errorInfo.details,
        };
        
        throw new ApiClientError(
          errorMessage,
          errorCode,
          errorDetails
        );
      }
      
      // Success response (status: 'success')
      if (status === 'success') {
        return {
          success: true,
          data: responseData.data,
          message: responseData.message,
        } as ApiResponse<T>;
      }
    }
    
    // Legacy format: { success: boolean, data, error: { code, message }, meta }
    if ('success' in responseData || ('error' in responseData && typeof responseData.error === 'object') || 'meta' in responseData) {
      // If Lambda returned an error object in the body (even with 200 status)
      if (responseData.error && typeof responseData.error === 'object' && responseData.error.message) {
        const errorMessage = responseData.error.message || responseData.message || 'Error desconocido';
        const errorCode = responseData.error.code || response.status || 'UNKNOWN_ERROR';
        
        throw new ApiClientError(
          errorMessage,
          errorCode,
          responseData
        );
      }
      
      // Failed response (success: false) - Lambda indicates failure
      if (responseData.success === false) {
        const errorMessage = responseData.error?.message || responseData.message || 'Operación fallida';
        const errorCode = responseData.error?.code || response.status || 'OPERATION_FAILED';
        
        throw new ApiClientError(
          errorMessage,
          errorCode,
          responseData
        );
      }
      
      // Success response from Lambda (success: true or success is not false)
      if (responseData.success !== false) {
        return {
          success: true,
          data: responseData.data,
          message: responseData.message,
        } as ApiResponse<T>;
      }
    }
  }

  // Handle HTTP status errors (non-200 responses)
  // This handles cases where Lambda returned non-200 status codes
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    let errorCode: string | number = response.status;
    let errorDetails: any = null;
    
    // Try to extract error message from response body
    if (typeof data === 'object' && data !== null) {
      const responseData = data as any;
      
      // Nuevo formato unificado
      if (responseData.error && typeof responseData.error === 'object') {
        errorMessage = responseData.error.message || responseData.message || errorMessage;
        errorCode = responseData.error.code || errorCode;
        errorDetails = {
          ...responseData,
          field: responseData.error.field,
          suggestion: responseData.error.suggestion,
          details: responseData.error.details,
        };
      }
      // Legacy format
      else if (responseData.error && typeof responseData.error === 'object' && responseData.error.message) {
        errorMessage = responseData.error.message;
        errorCode = responseData.error.code || errorCode;
      } else if (responseData.message) {
        errorMessage = responseData.message;
      }
    }
    
    // Handle common HTTP errors with more descriptive messages
    if (errorMessage.includes('Error ')) {
      switch (response.status) {
        case 404:
          errorMessage = 'Endpoint no encontrado - verifica la configuración de la API';
          break;
        case 405:
          errorMessage = 'Método no permitido - el endpoint no soporta esta operación';
          break;
        case 500:
          errorMessage = 'Error interno del servidor - contacta al administrador';
          break;
        case 503:
          errorMessage = 'Servicio no disponible - intenta nuevamente más tarde';
          break;
      }
    }
    
    throw new ApiClientError(
      errorMessage,
      errorCode,
      errorDetails || data
    );
  }

  // Handle successful responses that don't follow Lambda format
  // If it's a successful response but doesn't have the expected structure, normalize it
  if (typeof data === 'object' && data) {
    const responseData = data as any;
    
    // If it already has our expected structure, return as-is
    if ('success' in responseData || 'data' in responseData) {
      return data as ApiResponse<T>;
    }
    
    // Otherwise, wrap it in our standard format
    return {
      success: true,
      data: responseData,
      message: responseData.message || 'Request successful'
    } as ApiResponse<T>;
  }

  return data as ApiResponse<T>;
};

/**
 * Generic GET request method
 */
export const get = async <T>(
  endpoint: string,
  params?: Record<string, string | number>,
  config: Partial<RequestConfig> = {}
): Promise<ApiResponse<T>> => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Build URL with query parameters
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const options: RequestInit = {
    method: 'GET',
    headers: mergedConfig.headers,
  };

  try {
    const response = await makeRequestWithRetries(url.toString(), options, mergedConfig);
    return await processResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    
    // Enhanced error handling for common network issues
    let errorMessage = 'Error de conexión con el servidor';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Tiempo de espera agotado - la petición tardó demasiado';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'Error de CORS - verifica la configuración del servidor';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Error de red - verifica tu conexión a internet';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'No se pudo conectar al servidor - verifica la URL de la API';
      }
    }
    
    throw new ApiClientError(
      errorMessage,
      'NETWORK_ERROR',
      error
    );
  }
};

/**
 * Generic POST request method
 */
export const post = async <T>(
  endpoint: string,
  body?: unknown,
  config: Partial<RequestConfig> = {}
): Promise<ApiResponse<T>> => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  const url = `${API_BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method: 'POST',
    headers: mergedConfig.headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await makeRequestWithRetries(url, options, mergedConfig);
    return await processResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    
    // Enhanced error handling for common network issues
    let errorMessage = 'Error de conexión con el servidor';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Tiempo de espera agotado - la petición tardó demasiado';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'Error de CORS - verifica la configuración del servidor';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Error de red - verifica tu conexión a internet';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'No se pudo conectar al servidor - verifica la URL de la API';
      }
    }
    
    throw new ApiClientError(
      errorMessage,
      'NETWORK_ERROR',
      error
    );
  }
};

/**
 * Export a configured API client
 */
export const apiClient = {
  get,
  post,
  ApiClientError,
}; 