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

/**
 * Report Issue Request
 */
export interface PostIssueRequest {
  descripcion: string;
}

/**
 * Report Issue Response
 */
export interface IssueReportResult {
  id?: string;
  mensaje?: string;
  fechaReporte?: string;
  estado?: 'recibido' | 'en_proceso' | 'resuelto';
  // Propiedades adicionales que puede devolver la API real
  issueNumber?: string;
  message?: string;
  [key: string]: any; // Para propiedades adicionales no esperadas
}

/**
 * Register Box Request
 */
export interface RegisterBoxRequest {
  codigo: string;
  producto: string;
  lote?: string;
  fechaVencimiento?: string;
  ubicacion?: string;
  observaciones?: string;
}

/**
 * Register Box Response
 */
export interface RegisterBoxResult {
  id: string;
  codigo: string;
  mensaje: string;
  fechaRegistro: string;
  estado: 'registrado' | 'pendiente' | 'error';
}

/**
 * Process Scan Request
 */
export interface ProcessScanRequest {
  codigo: string;
  ubicacion: string;
  tipo?: 'BOX' | 'PALLET';
  palletCodigo?: string;
  scannedCodes?: string;
}

/**
 * Process Scan Response (full API response)
 */
export interface ProcessScanResponse {
  success: boolean;
  message: string;
  data?: ProcessScanResult;
}

/**
 * Process Scan Result (returned by submitScan)
 */
export interface ProcessScanResult {
  codigo: string;
  tipo: 'BOX' | 'PALLET';
  ubicacion: string;
  estado: string;
  timestamp: string;
  boxesMoved?: number;
  [key: string]: any;
}

/**
 * Sales Order structure
 */
export interface SalesOrder {
  id: string;
  saleId: string;
  customerId: string;
  customerInfo: {
    name: string;
    email?: string;
    phone?: string;
  };
  state: 'DRAFT' | 'CONFIRMED' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED' | 'PARTIALLY_RETURNED' | 'FULLY_RETURNED';
  type?: string;
  items?: Array<{
    palletId?: string;
    palletCode?: string;
    boxIds: string[];
  }>;
  boxes?: string[];
  pallets?: string[];
  totalBoxes?: number;
  totalBoxCount?: number;
  totalEggs?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  metadata?: {
    requestedBoxesByCalibre?: Array<{
      calibre: string;
      boxCount: number;
    }>;
    boxesByCalibre?: Record<string, number>;
    palletSummary?: Record<string, any>;
    [key: string]: any;
  };
}

/**
 * Get Draft Sales Request
 */
export interface GetDraftSalesRequest {
  filters?: {
    customerId?: string;
    startDate?: string;
    endDate?: string;
  };
  pagination?: {
    limit?: number;
    lastEvaluatedKey?: string;
  };
}

/**
 * Get Draft Sales Response
 */
export interface GetDraftSalesResponse {
  sales: SalesOrder[];
  pagination?: {
    lastEvaluatedKey?: string;
    hasMore?: boolean;
  };
}

/**
 * Add Boxes to Sale Request
 */
export interface AddBoxesToSaleRequest {
  saleId: string;
  boxCode?: string;
  palletCode?: string;
}

/**
 * Add Boxes to Sale Response
 */
export interface AddBoxesToSaleResponse {
  sale: SalesOrder;
  currentEggs: number;
  isComplete: boolean;
  boxesByCalibre: Record<string, number>;
  remainingBoxes: Record<string, number>;
  addedItem: {
    type: 'box' | 'pallet';
    code: string;
    calibre: string;
    eggs: number;
  };
} 