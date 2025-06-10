// API Base URL with development fallback
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('🌐 API Configuration:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API,
    API_BASE_URL,
    isDev: true,
    willUseMock: !import.meta.env.VITE_API_URL || 
                 import.meta.env.VITE_API_URL.includes('localhost') ||
                 import.meta.env.VITE_USE_MOCK_API === 'true'
  });
}

// API Client and Configuration
export { apiClient, ApiClientError } from './apiClient';

// Types and Interfaces
export type {
  ApiResponse,
  ApiError,
  RequestConfig,
  GetInfoFromScannedCodeRequest,
  ScannedCodeInfo,
  CodeValidationResult,
  RegisterBoxRequest,
  RegisterBoxResult,
  ProcessScanRequest,
  ProcessScanResult,
} from './types';

// Endpoints
export { 
  endpoints, 
  getInfoFromScannedCode, 
  registerBox,
  submitBoxRegistration,
  processScan,
  submitScan
} from './endpoints';

// Utilities (re-export for convenience)
export {
  validateScannedCode,
  isValidBoxCode,
  isValidPalletCode,
  sanitizeCode,
  formatCodeForDisplay,
} from '../utils/validators';