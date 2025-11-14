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
  boxCode?: string;
  type?: 'DEFECT' | 'DAMAGE' | 'OTHER';
  ubicacion?: string;
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
 * Process Scan Response
 */
export interface ProcessScanResult {
  success: boolean;
  message: string;
  data?: {
    codigo: string;
    tipo: 'BOX' | 'PALLET';
    ubicacion: string;
    estado: string;
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * ===================================================================
 * NEW CLEAN ARCHITECTURE TYPES
 * ===================================================================
 */

/**
 * Consolidated API Request format for Clean Architecture backend
 */
export interface ConsolidatedApiRequest<P = any> {
  resource: string; // e.g., 'box', 'pallet', 'order', 'customer', 'issue'
  action: string; // e.g., 'get', 'create', 'update', 'delete', 'move', 'close'
  params: P;
}

/**
 * Standardized API Response from Clean Architecture backend
 */
export interface StandardApiResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  message: string;
  data?: T;
  meta: {
    requestId: string;
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  limit?: number;
  lastKey?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  nextKey?: string | null;
}

/**
 * Filter options for queries
 */
export interface FilterParams {
  calibre?: string;
  formato?: string;
  empresa?: string;
  horario?: string;
  codigoPrefix?: string;
  [key: string]: any;
}

/**
 * ===================================================================
 * INVENTORY RESOURCE TYPES
 * ===================================================================
 */

/**
 * Box resource - Get action params
 */
export interface GetBoxesParams {
  ubicacion?: 'PACKING' | 'BODEGA' | 'TRANSITO' | 'PREVENTA' | 'VENTA' | 'UNSUBSCRIBED';
  filters?: FilterParams;
  pagination?: PaginationParams;
  codigo?: string; // For getting single box by code
}

/**
 * Box resource - Create action params
 */
export interface CreateBoxParams {
  codigo: string;
  calibre: string;
  formato: string;
  empresa: string;
  ubicacion: string;
  operario?: string;
  horario?: string;
  customInfo?: string;
}

/**
 * Box resource - Assign action params
 */
export interface AssignBoxParams {
  boxCode: string;
  palletCode: string;
}

/**
 * Box resource - Update action params
 */
export interface UpdateBoxParams {
  codigo: string;
  updates: Partial<{
    calibre: string;
    formato: string;
    empresa: string;
    ubicacion: string;
    operario: string;
    horario: string;
    customInfo: string;
  }>;
}

/**
 * Box resource - Move action params
 */
export interface MoveBoxParams {
  codigo: string;
  ubicacion: string;
}

/**
 * Box resource - Move between pallets params
 */
export interface MoveBoxBetweenPalletsParams {
  boxCode?: string;
  codigo?: string;
  boxCodes?: string[]; // For batch mode
  palletCode: string;
  destinationPalletCode?: string;
}

/**
 * Box resource - Compatible pallets params
 */
export interface CompatiblePalletsParams {
  codigo?: string;
  boxCode?: string;
  ubicacion?: string;
  autoAssign?: boolean;
}

/**
 * Box resource - Compatible pallets batch params
 */
export interface CompatiblePalletsBatchParams {
  ubicacion: string;
  filters?: FilterParams;
}

/**
 * Pallet resource - Get action params
 */
export interface GetPalletsParams {
  estado?: 'open' | 'closed' | 'dismantled';
  ubicacion?: string;
  pagination?: PaginationParams;
  codigo?: string; // For getting single pallet by code
}

/**
 * Pallet resource - Create action params
 */
export interface CreatePalletParams {
  codigo: string; // Base code (11 digits)
  ubicacion?: string;
  maxBoxes?: number;
  calibre?: string;
  formato?: string;
  empresa?: string;
}

/**
 * Pallet resource - Close action params
 */
export interface ClosePalletParams {
  codigo: string;
}

/**
 * Pallet resource - Update action params
 */
export interface UpdatePalletParams {
  codigo: string;
  updates: Partial<{
    ubicacion: string;
    maxBoxes: number;
    calibre: string;
    formato: string;
    empresa: string;
  }>;
}

/**
 * Pallet resource - Create single box pallet params
 */
export interface CreateSingleBoxPalletParams {
  boxCode: string;
  ubicacion?: string;
}

/**
 * Pallet resource - Move action params
 */
export interface MovePalletParams {
  codigo: string;
  ubicacion: string;
}

/**
 * ===================================================================
 * SALES RESOURCE TYPES
 * ===================================================================
 */

/**
 * Order resource - Get action params
 */
export interface GetOrdersParams {
  filters?: {
    state?: 'DRAFT' | 'CONFIRMED' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';
    customerId?: string;
    startDate?: string;
    endDate?: string;
  };
  pagination?: PaginationParams;
  id?: string; // For getting single order by ID
}

/**
 * Order resource - Create action params
 */
export interface CreateOrderParams {
  customerId: string;
  type: 'Venta' | 'Reposición' | 'Donación' | 'Inutilizado' | 'Ración';
  items: Array<{ palletCode: string }>;
  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * Customer resource - Get action params
 */
export interface GetCustomersParams {
  filters?: {
    status?: 'ACTIVE' | 'INACTIVE' | 'DELETED';
    search?: string;
  };
  pagination?: PaginationParams;
  id?: string; // For getting single customer by ID
}

/**
 * Customer resource - Create action params
 */
export interface CreateCustomerParams {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  contactPerson?: string;
  metadata?: Record<string, any>;
}

/**
 * ===================================================================
 * ADMIN RESOURCE TYPES
 * ===================================================================
 */

/**
 * Issue resource - Get action params
 */
export interface GetIssuesParams {
  filters?: {
    status?: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
    ubicacion?: string;
    startDate?: string;
    endDate?: string;
  };
  pagination?: PaginationParams;
  id?: string; // For getting single issue by ID
}

/**
 * Issue resource - Create action params
 */
export interface CreateIssueParams {
  descripcion: string;
  boxCode?: string;
  type?: 'DEFECT' | 'DAMAGE' | 'OTHER';
  ubicacion?: string;
}

/**
 * Issue resource - Update action params
 */
export interface UpdateIssueParams {
  issueId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  resolution?: string;
}

/**
 * Report resource - Generate action params
 */
export interface GenerateReportParams {
  type: 'inventory' | 'sales' | 'audit' | 'daily-production';
  filters?: {
    startDate?: string;
    endDate?: string;
    ubicacion?: string;
    date?: string;
  };
  format?: 'excel' | 'json';
} 