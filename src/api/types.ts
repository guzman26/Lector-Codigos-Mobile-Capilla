// API Types and Interfaces

/**
 * Base API Response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * API Error structure
 */
export interface ApiError {
  message: string;
  code?: string | number;
  details?: unknown;
}

/**
 * Request configuration options
 */
export interface RequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
}

/**
 * Scanned Code Info Request
 */
export interface GetInfoFromScannedCodeRequest {
  codigo: string;
}

/**
 * Scanned Code Info Response
 */
export interface ScannedCodeInfo {
  codigo: string;
  tipo: 'caja' | 'pallet';
  producto?: {
    id: string;
    nombre: string;
    descripcion?: string;
  };
  ubicacion?: {
    almacen: string;
    zona: string;
    posicion?: string;
  };
  estado: 'activo' | 'inactivo' | 'bloqueado';
  fechaCreacion: string;
  ultimaActualizacion: string;
  informacionAdicional?: Record<string, unknown>;
}

/**
 * Code validation result
 */
export interface CodeValidationResult {
  isValid: boolean;
  type?: 'box' | 'pallet';
  errorMessage?: string;
} 