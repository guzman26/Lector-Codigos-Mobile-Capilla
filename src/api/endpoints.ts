import { apiClient } from './apiClient';
import { validateScannedCode, validateIssueDescription } from '../utils/validators';
import type { 
  GetInfoFromScannedCodeRequest, 
  ScannedCodeInfo,
  PostIssueRequest,
  IssueReportResult,
  RegisterBoxRequest,
  RegisterBoxResult,
  ProcessScanRequest,
  ProcessScanResult,
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
    console.log('📡 Making API request with params:', { codigo: request.codigo.trim() });
    console.log('📡 Full URL will be:', `${import.meta.env.VITE_API_URL}/getInfoFromScannedCode?codigo=${encodeURIComponent(request.codigo.trim())}`);
    
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
 * Register a new box in the system
 * Validates the box code and required fields before making the request
 */
export const registerBox = async (
  request: RegisterBoxRequest
): Promise<ApiResponse<RegisterBoxResult>> => {
  // Client-side validation
  const validation = validateScannedCode(request.codigo);
  
  if (!validation.isValid) {
    throw new apiClient.ApiClientError(
      validation.errorMessage || 'Código de caja inválido',
      'VALIDATION_ERROR'
    );
  }

  if (validation.type !== 'box') {
    throw new apiClient.ApiClientError(
      'El código debe ser de una caja (15 dígitos)',
      'VALIDATION_ERROR'
    );
  }

  if (!request.producto?.trim()) {
    throw new apiClient.ApiClientError(
      'El producto es obligatorio',
      'VALIDATION_ERROR'
    );
  }

  // Development mode: simulate API response
  const shouldUseMockMode = import.meta.env.DEV && (
    !import.meta.env.VITE_API_URL || 
    import.meta.env.VITE_API_URL.includes('localhost') ||
    import.meta.env.VITE_USE_MOCK_API === 'true'
  );

  if (shouldUseMockMode) {
    console.log('🔧 Development Mode: Simulating registerBox API call', {
      codigo: request.codigo,
      producto: request.producto,
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
        id: `BOX-${Date.now()}`,
        codigo: request.codigo.trim(),
        mensaje: 'Caja registrada exitosamente (modo desarrollo)',
        fechaRegistro: new Date().toISOString(),
        estado: 'registrado'
      },
      message: 'Caja registrada correctamente'
    };
  }

  // Make the API request
  try {
    console.log('📡 Making real API request to:', `${import.meta.env.VITE_API_URL}/registerBox`);
    
    const response = await apiClient.post<RegisterBoxResult>(
      '/registerBox',
      {
        codigo: request.codigo.trim(),
        producto: request.producto.trim(),
        lote: request.lote?.trim(),
        fechaVencimiento: request.fechaVencimiento,
        ubicacion: request.ubicacion,
        observaciones: request.observaciones?.trim()
      }
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
          id: `BOX-FALLBACK-${Date.now()}`,
          codigo: request.codigo.trim(),
          mensaje: 'Caja registrada (fallback - API no disponible)',
          fechaRegistro: new Date().toISOString(),
          estado: 'registrado'
        },
        message: 'Caja registrada correctamente (modo fallback)'
      };
    }
    
    // Re-throw with more context if needed
    if (error instanceof apiClient.ApiClientError) {
      throw error;
    }
    
    throw new apiClient.ApiClientError(
      'Error al registrar la caja',
      'REQUEST_FAILED',
      error
    );
  }
};

/**
 * Alternative method that returns only the data or throws an error
 * Useful for simpler error handling in components
 */
export const submitBoxRegistration = async (boxData: RegisterBoxRequest): Promise<RegisterBoxResult> => {
  const response = await registerBox(boxData);
  
  console.log('🔍 Analyzing API response in submitBoxRegistration:', response);
  
  if (!response.success || !response.data) {
    throw new apiClient.ApiClientError(
      response.error || 'No se pudo registrar la caja',
      'NO_DATA'
    );
  }
  
  return response.data;
};

export const processScan = async (scanData: ProcessScanRequest): Promise<ApiResponse<ProcessScanResult>> => {
  console.log('🔍 Analyzing scan response in processScan:', scanData);

  const type = scanData.codigo.length === 15 ? 'box' : 'pallet';
  if (type === 'box') {
    return await apiClient.post<ProcessScanResult>(
      '/processScan',
      scanData
    );
  } else if (type === 'pallet') {
    return await apiClient.post<ProcessScanResult>(
      '/movePallet',
      {
        codigo: scanData.codigo.trim(),
        ubicacion: scanData.ubicacion.trim()
      } 
    );
  } else {
    throw new apiClient.ApiClientError(
      'Tipo de escaneo no válido',
      'VALIDATION_ERROR'
    );
  }
};
/**
 * Alternative method that returns only the data or throws an error
 * Useful for simpler error handling in components
 */
export const submitScan = async (scanData: ProcessScanRequest): Promise<ProcessScanResult> => {
  const response = await processScan(scanData);
  
  console.log('🔍 Analyzing scan response in submitScan:', response);
  
  if (!response.data) {
    throw new apiClient.ApiClientError(
      response.error || 'No se pudo procesar el escaneo',
      'NO_DATA'
    );
  }
  
  return response.data;
};

/**
 * Creates a new pallet
 * Validates the pallet code before making the request
 */
export const createPallet = async (codigo: string): Promise<ApiResponse<any>> => {
  // Client-side validation
  const validation = validateScannedCode(codigo);
  
  if (!validation.isValid || validation.type !== 'pallet') {
    throw new apiClient.ApiClientError(
      'El código debe ser un código de pallet válido (12 dígitos)',
      'VALIDATION_ERROR'
    );
  }

  // Make the API request
  try {
    console.log('📡 Making API request to:', `${import.meta.env.VITE_API_URL}/createPallet`);
    console.log('📤 Request payload:', { codigo: codigo.trim() });
    
    const response = await apiClient.post<any>(
      '/createPallet',
      { codigo: codigo.trim() }
    );

    console.log('✅ API Response received:', response);
    return response;
  } catch (error) {
    console.error('❌ API Request failed:', error);
    
    // Re-throw with more context if needed
    if (error instanceof apiClient.ApiClientError) {
      throw error;
    }
    
    throw new apiClient.ApiClientError(
      'Error al crear el pallet',
      'REQUEST_FAILED',
      error
    );
  }
};

/**
 * Gets detailed information from a pallet including box count
 * Validates the pallet code before making the request
 */
export const getPalletDetails = async (
  codigo: string
): Promise<ApiResponse<{
  codigo: string;
  tipo: 'pallet';
  estado: string;
  ubicacion: string;
  fechaCreacion: string;
  numeroCajas: number;
  cajas: Array<{
    codigo: string;
    producto: string;
    estado: string;
    fechaIngreso: string;
  }>;
  producto?: string;
  lote?: string;
  fechaVencimiento?: string;
  responsable?: string;
}>> => {
  // Client-side validation
  const validation = validateScannedCode(codigo);
  
  if (!validation.isValid) {
    throw new apiClient.ApiClientError(
      validation.errorMessage || 'Código inválido',
      'VALIDATION_ERROR'
    );
  }

  if (validation.type !== 'pallet') {
    throw new apiClient.ApiClientError(
      'El código debe ser de un pallet (12 dígitos)',
      'VALIDATION_ERROR'
    );
  }

  // Development mode: simulate API response
  const shouldUseMockMode = import.meta.env.DEV && (
    !import.meta.env.VITE_API_URL || 
    import.meta.env.VITE_API_URL.includes('localhost') ||
    import.meta.env.VITE_USE_MOCK_API === 'true'
  );

  if (shouldUseMockMode) {
    console.log('🔧 Development Mode: Simulating getPalletDetails API call', {
      codigo: codigo.trim(),
      timestamp: new Date().toISOString()
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate mock data
    const numeroCajas = Math.floor(Math.random() * 15) + 5; // Entre 5 y 20 cajas
    const cajas = Array.from({ length: numeroCajas }, (_, i) => ({
      codigo: `${Date.now()}${String(i).padStart(3, '0')}00`,
      producto: `Producto ${String.fromCharCode(65 + (i % 26))}`,
      estado: Math.random() > 0.1 ? 'activo' : 'dañado',
      fechaIngreso: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));

    return {
      success: true,
      data: {
        codigo: codigo.trim(),
        tipo: 'pallet',
        estado: 'activo',
        ubicacion: 'BODEGA',
        fechaCreacion: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        numeroCajas,
        cajas,
        producto: 'Producto de prueba',
        lote: 'LT-' + Date.now().toString().slice(-6),
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        responsable: 'Operador de turno'
      },
      message: 'Información del pallet obtenida correctamente'
    };
  }

  // Make the API request
  try {
    console.log('📡 Making API request to:', `${import.meta.env.VITE_API_URL}/getPalletDetails`);
    
    const response = await apiClient.get<any>(
      '/getPalletDetails',
      { codigo: codigo.trim() }
    );

    console.log('✅ API Response received:', response);
    return response;
  } catch (error) {
    console.error('❌ API Request failed:', error);
    
    // In development, if the real API fails, fall back to mock mode
    if (import.meta.env.DEV) {
      console.warn('🔄 Falling back to mock mode due to API failure');
      
      // Use the mock response above
      const numeroCajas = Math.floor(Math.random() * 15) + 5;
      const cajas = Array.from({ length: numeroCajas }, (_, i) => ({
        codigo: `${Date.now()}${String(i).padStart(3, '0')}00`,
        producto: `Producto ${String.fromCharCode(65 + (i % 26))}`,
        estado: Math.random() > 0.1 ? 'activo' : 'dañado',
        fechaIngreso: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      return {
        success: true,
        data: {
          codigo: codigo.trim(),
          tipo: 'pallet',
          estado: 'activo',
          ubicacion: 'BODEGA',
          fechaCreacion: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          numeroCajas,
          cajas,
          producto: 'Producto de prueba (fallback)',
          lote: 'LT-' + Date.now().toString().slice(-6),
          fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          responsable: 'Operador de turno'
        },
        message: 'Información del pallet obtenida correctamente (fallback)'
      };
    }
    
    // Re-throw with more context if needed
    if (error instanceof apiClient.ApiClientError) {
      throw error;
    }
    
    throw new apiClient.ApiClientError(
      'Error al obtener información del pallet',
      'REQUEST_FAILED',
      error
    );
  }
};

/**
 * API endpoints object for easy access
 */
export const endpoints = {
  getInfoFromScannedCode,
  postIssue,
  submitIssueReport,
  registerBox,
  submitBoxRegistration,
  processScan,
  submitScan,
  createPallet,
  getPalletDetails,
} as const; 