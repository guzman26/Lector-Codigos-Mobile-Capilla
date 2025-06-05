export const API_BASE_URL = import.meta.env.VITE_API_URL;

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
} from './types';

// Endpoints
export { endpoints, getInfoFromScannedCode, getScannedCodeInfo } from './endpoints';

// Utilities (re-export for convenience)
export {
  validateScannedCode,
  isValidBoxCode,
  isValidPalletCode,
  sanitizeCode,
  formatCodeForDisplay,
} from '../utils/validators';