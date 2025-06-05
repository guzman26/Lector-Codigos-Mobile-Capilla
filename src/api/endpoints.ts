import { apiClient } from './apiClient';
import { validateScannedCode, validateIssueDescription } from '../utils/validators';
import type { 
  GetInfoFromScannedCodeRequest, 
  ScannedCodeInfo,
  PostIssueRequest,
  IssueReportResult,
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

  // Development mode: simulate API response
  if (import.meta.env.DEV && (!import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL.includes('localhost'))) {
    console.log('🔧 Development Mode: Simulating getInfoFromScannedCode API call', {
      codigo: request.codigo,
      type: validation.type
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate success response with mock data
    return {
      success: true,
      data: {
        codigo: request.codigo.trim(),
        tipo: validation.type === 'box' ? 'caja' : 'pallet',
        producto: {
          id: `PROD-${Math.floor(Math.random() * 1000)}`,
          nombre: validation.type === 'box' ? 'Producto de Caja' : 'Producto de Pallet',
          descripcion: `Descripción del producto para ${validation.type === 'box' ? 'caja' : 'pallet'}`
        },
        ubicacion: {
          almacen: 'ALM-001',
          zona: `ZONA-${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
          posicion: `${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 10) + 1}`
        },
        estado: 'activo' as const,
        fechaCreacion: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
        ultimaActualizacion: new Date().toISOString()
      }
    };
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
 * Posts an issue report to the server
 * Validates the description before making the request
 */
export const postIssue = async (
  request: PostIssueRequest
): Promise<ApiResponse<IssueReportResult>> => {
  // Client-side validation
  const validation = validateIssueDescription(request.descripcion);
  
  if (!validation.isValid) {
    throw new apiClient.ApiClientError(
      validation.errorMessage || 'Descripción inválida',
      'VALIDATION_ERROR'
    );
  }

  // Development mode: simulate API response (also used as fallback if real API fails)
  const shouldUseMockMode = import.meta.env.DEV && (
    !import.meta.env.VITE_API_URL || 
    import.meta.env.VITE_API_URL.includes('localhost') ||
    import.meta.env.VITE_USE_MOCK_API === 'true'
  );

  if (shouldUseMockMode) {
    console.log('🔧 Development Mode: Simulating postIssue API call', {
      descripcion: request.descripcion,
      timestamp: new Date().toISOString(),
      reason: !import.meta.env.VITE_API_URL ? 'No API URL' : 
              import.meta.env.VITE_API_URL.includes('localhost') ? 'Localhost URL' : 
              'Mock mode enabled'
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate success response
    return {
      success: true,
      data: {
        id: `RPT-${Date.now()}`,
        mensaje: 'Reporte recibido exitosamente (modo desarrollo)',
        fechaReporte: new Date().toISOString(),
        estado: 'recibido'
      },
      message: 'Reporte enviado correctamente'
    };
  }

  // Make the API request
  try {
    console.log('📡 Making real API request to:', `${import.meta.env.VITE_API_URL}/postIssue`);
    
    const response = await apiClient.post<IssueReportResult>(
      '/postIssue',
      { descripcion: request.descripcion.trim() }
    );

    console.log('✅ API Response received:', response);
    return response;
  } catch (error) {
    console.error('❌ API Request failed:', error);
    
    // In development, if the real API fails, fall back to mock mode
    if (import.meta.env.DEV) {
      console.warn('🔄 Falling back to mock mode due to API failure');
      
      // Simulate success response as fallback
      return {
        success: true,
        data: {
          id: `RPT-FALLBACK-${Date.now()}`,
          mensaje: 'Reporte recibido (fallback - API no disponible)',
          fechaReporte: new Date().toISOString(),
          estado: 'recibido'
        },
        message: 'Reporte enviado correctamente (modo fallback)'
      };
    }
    
    // Re-throw with more context if needed
    if (error instanceof apiClient.ApiClientError) {
      throw error;
    }
    
    throw new apiClient.ApiClientError(
      'Error al enviar el reporte',
      'REQUEST_FAILED',
      error
    );
  }
};

/**
 * Alternative method that returns only the data or throws an error
 * Useful for simpler error handling in components
 */
export const submitIssueReport = async (descripcion: string): Promise<IssueReportResult> => {
  const response = await postIssue({ descripcion });
  
  console.log('🔍 Analyzing API response in submitIssueReport:', response);
  
  // Handle different response formats from the API
  // Check if response indicates success (either explicit success flag or presence of data)
  const isSuccessful = response.success !== false && (
    response.data || 
    (response as any).issueNumber || 
    (response as any).message
  );
  
  if (!isSuccessful) {
    throw new apiClient.ApiClientError(
      response.error || 'No se pudo enviar el reporte',
      'NO_DATA'
    );
  }
  
  // Return the appropriate data based on response structure
  if (response.data) {
    return response.data;
  }
  
  // If data is null but we have other response fields, construct our own result
  if ((response as any).issueNumber || (response as any).message) {
    return {
      id: (response as any).issueNumber || `RPT-${Date.now()}`,
      mensaje: (response as any).message || 'Reporte enviado exitosamente',
      fechaReporte: new Date().toISOString(),
      estado: 'recibido'
    };
  }
  
  // Fallback
  return {
    mensaje: 'Reporte enviado exitosamente',
    fechaReporte: new Date().toISOString(),
    estado: 'recibido'
  };
};

/**
 * API endpoints object for easy access
 */
export const endpoints = {
  getInfoFromScannedCode,
  getScannedCodeInfo,
  postIssue,
  submitIssueReport,
} as const; 