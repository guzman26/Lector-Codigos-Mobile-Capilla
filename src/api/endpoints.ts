/**
 * API Endpoints - Clean Architecture
 * 
 * Wrappers simplificados alrededor de la API consolidada.
 * Mantiene las mismas firmas de funciones para compatibilidad con componentes existentes.
 */

import { apiClient } from './apiClient';
import { consolidatedApi } from './consolidatedClient';
import {
  validateScannedCode,
  validateIssueDescription,
} from '../utils/validators';
import type {
  GetInfoFromScannedCodeRequest,
  ScannedCodeInfo,
  PostIssueRequest,
  IssueReportResult,
  RegisterBoxRequest,
  RegisterBoxResult,
  ProcessScanRequest,
  ProcessScanResult,
  ApiResponse,
  CreateBoxParams,
  CreatePalletParams,
} from './types';

/**
 * Gets information from a scanned code (box or pallet)
 */
export const getInfoFromScannedCode = async (
  request: GetInfoFromScannedCodeRequest
): Promise<ApiResponse<ScannedCodeInfo>> => {
  const validation = validateScannedCode(request.codigo);

  if (!validation.isValid) {
    throw new apiClient.ApiClientError(
      validation.errorMessage || 'Código inválido',
      'VALIDATION_ERROR'
    );
  }

  // Mock mode for development
  const shouldUseMockMode = import.meta.env.VITE_USE_MOCK_API === 'true';

  if (shouldUseMockMode) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockResponse: ScannedCodeInfo = {
      codigo: request.codigo.trim(),
      tipo: validation.type === 'box' ? 'caja' : 'pallet',
      producto: {
        id: 'PROD-001',
        nombre: 'Huevos Frescos',
        descripcion: 'Huevos de gallina frescos',
      },
      ubicacion: {
        almacen: 'Almacén Principal',
        zona: 'Zona A',
        posicion: 'A1-B2-C3',
      },
      estado: 'activo',
      fechaCreacion: new Date().toISOString(),
      ultimaActualizacion: new Date().toISOString(),
    };

    return {
      success: true,
      data: mockResponse,
      message: 'Información obtenida exitosamente (modo desarrollo)',
    };
  }

  // Use consolidated API
  const resource = validation.type === 'box' ? 'box' : 'pallet';
  const response = await consolidatedApi.inventory[resource].get({
    codigo: request.codigo.trim(),
  });

  return response as ApiResponse<ScannedCodeInfo>;
};

/**
 * Posts an issue report
 */
export const postIssue = async (
  request: PostIssueRequest
): Promise<ApiResponse<IssueReportResult>> => {
  const validation = validateIssueDescription(request.descripcion);

  if (!validation.isValid) {
    throw new apiClient.ApiClientError(
      validation.errorMessage || 'Descripción inválida',
      'VALIDATION_ERROR'
    );
  }

  const shouldUseMockMode = import.meta.env.VITE_USE_MOCK_API === 'true';

  if (shouldUseMockMode) {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      success: true,
      data: {
        id: `RPT-${Date.now()}`,
        mensaje: 'Reporte recibido exitosamente (modo desarrollo)',
        fechaReporte: new Date().toISOString(),
        estado: 'recibido',
      },
      message: 'Reporte enviado correctamente',
    };
  }

  const response = await consolidatedApi.admin.issue.create({
    descripcion: request.descripcion.trim(),
    ...(request.boxCode && { boxCode: request.boxCode.trim() }),
    ...(request.type && { type: request.type }),
    ...(request.ubicacion && { ubicacion: request.ubicacion }),
  });

  return response as ApiResponse<IssueReportResult>;
};

/**
 * Register a new box
 */
export const registerBox = async (
  request: RegisterBoxRequest
): Promise<ApiResponse<RegisterBoxResult>> => {
  const validation = validateScannedCode(request.codigo);

  if (!validation.isValid || validation.type !== 'box') {
    throw new apiClient.ApiClientError(
      'El código debe ser de una caja (16 dígitos)',
      'VALIDATION_ERROR'
    );
  }

  if (!request.producto?.trim()) {
    throw new apiClient.ApiClientError(
      'El producto es obligatorio',
      'VALIDATION_ERROR'
    );
  }

  const params: CreateBoxParams = {
    codigo: request.codigo.trim(),
    calibre: '01', // Default
    formato: '1',  // Default
    empresa: '1',  // Default
    ubicacion: request.ubicacion || 'PACKING',
    operario: request.producto.trim(),
  };

  const response = await consolidatedApi.inventory.box.create(params);

  // Adapt response
  if (response.success && response.data) {
    return {
      success: true,
      data: {
        id: (response.data as any).codigo || `BOX-${Date.now()}`,
        codigo: request.codigo.trim(),
        mensaje: response.message || 'Caja registrada exitosamente',
        fechaRegistro: new Date().toISOString(),
        estado: 'registrado',
      },
      message: response.message,
    };
  }

  return response as ApiResponse<RegisterBoxResult>;
};

/**
 * Process a scan (box or pallet)
 */
export const processScan = async (
  request: ProcessScanRequest
): Promise<ApiResponse<ProcessScanResult>> => {
  const validation = validateScannedCode(request.codigo);

  if (!validation.isValid) {
    throw new apiClient.ApiClientError(
      validation.errorMessage || 'Código inválido',
      'VALIDATION_ERROR'
    );
  }

  const validLocations = ['PACKING', 'BODEGA', 'VENTA', 'TRANSITO'];
  if (!validLocations.includes(request.ubicacion)) {
    throw new apiClient.ApiClientError(
      'Ubicación inválida',
      'VALIDATION_ERROR'
    );
  }

  const tipo = request.tipo || (validation.type === 'box' ? 'BOX' : 'PALLET');
  const resource = tipo === 'BOX' ? 'box' : 'pallet';
  
  const response = await consolidatedApi.inventory[resource].move({
    codigo: request.codigo.trim(),
    ubicacion: request.ubicacion,
  });

  // Adapt response
  if (response.success) {
    return {
      success: true,
      data: {
        success: true,
        message: response.message || 'Procesado exitosamente',
        data: {
          codigo: request.codigo.trim(),
          tipo: tipo as 'BOX' | 'PALLET',
          ubicacion: request.ubicacion,
          estado: 'activo',
          timestamp: new Date().toISOString(),
        },
      },
      message: response.message,
    };
  }

  return response as ApiResponse<ProcessScanResult>;
};

/**
 * Creates a new pallet
 */
export const createPallet = async (
  codigo: string,
  maxBoxes?: number
): Promise<ApiResponse<any>> => {
  const base = (codigo || '').trim();
  if (!/^\d{11}$/.test(base)) {
    throw new apiClient.ApiClientError(
      'El código base debe tener 11 dígitos',
      'VALIDATION_ERROR'
    );
  }

  const params: CreatePalletParams = {
    codigo: base,
    maxBoxes,
  };

  const response = await consolidatedApi.inventory.pallet.create(params);
  return response;
};

/**
 * Gets detailed information from a pallet including box count
 */
export const getPalletDetails = async (
  codigo: string
): Promise<ApiResponse<any>> => {
  const validation = validateScannedCode(codigo);

  if (!validation.isValid) {
    throw new apiClient.ApiClientError(
      validation.errorMessage || 'Código inválido',
      'VALIDATION_ERROR'
    );
  }

  if (validation.type !== 'pallet') {
    throw new apiClient.ApiClientError(
      'El código debe ser de un pallet (13-14 dígitos)',
      'VALIDATION_ERROR'
    );
  }

  // Mock mode for development
  const shouldUseMockMode = import.meta.env.VITE_USE_MOCK_API === 'true';

  if (shouldUseMockMode) {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate mock data
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
        producto: 'Producto de prueba',
        lote: 'LT-' + Date.now().toString().slice(-6),
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        responsable: 'Operador de turno'
      },
      message: 'Información del pallet obtenida correctamente'
    };
  }

  const response = await consolidatedApi.inventory.pallet.get({
    codigo: codigo.trim(),
  });

  return response;
};

/**
 * Simplified wrapper functions
 */
export const submitIssueReport = async (
  descripcion: string
): Promise<IssueReportResult> => {
  const response = await postIssue({ descripcion });

  if (!response.success || !response.data) {
    throw new apiClient.ApiClientError(
      response.error || 'No se pudo enviar el reporte',
      'NO_DATA'
    );
  }

  return response.data;
};

export const submitBoxRegistration = async (
  boxData: RegisterBoxRequest
): Promise<RegisterBoxResult> => {
  const response = await registerBox(boxData);

  if (!response.success || !response.data) {
    throw new apiClient.ApiClientError(
      response.error || 'No se pudo registrar la caja',
      'NO_DATA'
    );
  }

  return response.data;
};

export const submitScan = async (
  scanData: ProcessScanRequest
): Promise<ProcessScanResult> => {
  const response = await processScan(scanData);

  if (!response.success || !response.data) {
    throw new apiClient.ApiClientError(
      response.error || 'No se pudo procesar el escaneo',
      'NO_DATA'
    );
  }

  return response.data;
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
