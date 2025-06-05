import type { ApiResponse, ApiError, RequestConfig } from './types';
import { API_BASE_URL } from './index';

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

  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    
    // Handle common HTTP errors with more descriptive messages
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
      default:
        if (typeof data === 'object' && data && 'message' in data) {
          errorMessage = (data as ApiError).message;
        }
    }
    
    throw new ApiClientError(
      errorMessage,
      response.status,
      data
    );
  }

  // Handle responses that don't follow our standard ApiResponse format
  // If it's a successful response but doesn't have the expected structure, normalize it
  if (typeof data === 'object' && data) {
    const responseData = data as any;
    
    // If it already has our expected structure, return as-is
    if ('success' in responseData || 'data' in responseData || 'error' in responseData) {
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