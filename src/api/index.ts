import { debug } from '../utils/logger';

// API Base URL with development fallback
// Lambda API Gateway endpoints are at root level (no /api suffix)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Log configuration in development
if (import.meta.env.DEV) {
  debug('🌐 API Configuration:', {
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

// NEW: Consolidated API Client (Clean Architecture)
export { consolidatedApi, inventoryApi, salesApi, adminApi, healthCheck } from './consolidatedClient';

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
  // NEW: Clean Architecture Types
  ConsolidatedApiRequest,
  StandardApiResponse,
  PaginationParams,
  PaginatedResponse,
  FilterParams,
  GetBoxesParams,
  CreateBoxParams,
  AssignBoxParams,
  UpdateBoxParams,
  MoveBoxParams,
  MoveBoxBetweenPalletsParams,
  CompatiblePalletsParams,
  CompatiblePalletsBatchParams,
  GetPalletsParams,
  CreatePalletParams,
  UpdatePalletParams,
  CreateSingleBoxPalletParams,
  ClosePalletParams,
  MovePalletParams,
  GetOrdersParams,
  CreateOrderParams,
  GetCustomersParams,
  CreateCustomerParams,
  GetIssuesParams,
  CreateIssueParams,
  UpdateIssueParams,
  GenerateReportParams,
} from './types';

// Endpoints
export { 
  endpoints, 
  getInfoFromScannedCode, 
  registerBox,
  submitBoxRegistration,
  processScan,
  submitScan,
  createPallet,
  getPalletDetails,
} from './endpoints';

// Utilities (re-export for convenience)
export {
  validateScannedCode,
  isValidBoxCode,
  isValidPalletCode,
  sanitizeCode,
  formatCodeForDisplay,
} from '../utils/validators';