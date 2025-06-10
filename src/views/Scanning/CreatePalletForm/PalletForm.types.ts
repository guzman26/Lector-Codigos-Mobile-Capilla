import React from 'react';

/**
 * Type definitions for the Pallet Form components
 */

/**
 * Form data interface for the pallet creation form
 */
export interface PalletFormData {
  turno: string;
  calibre: string;
  formato: string;
  codigoManual: string;
  useManualCode: boolean;
}

/**
 * Interface for form validation errors
 */
export interface PalletFormErrors {
  [key: string]: string;
}

/**
 * State of the pallet form
 */
export interface PalletFormState {
  formData: PalletFormData;
  errors: PalletFormErrors;
  isSubmitting: boolean;
  generatedCode: string | null;
  alertMessage: string | null;
  alertType: 'success' | 'error' | null;
}

/**
 * Interface for pallet creation response
 */
export interface CreatePalletResponse {
  success: boolean;
  message: string;
  data?: {
    codigo: string;
    id?: string;
    estado?: string;
    fechaCreacion?: string;
  };
}

/**
 * Props for the CreatePalletForm component
 */
export interface CreatePalletFormProps {
  onPalletCreated?: (palletCode: string) => void;
  onCancel?: () => void;
}

/**
 * Return type for the usePalletForm hook
 */
export interface UsePalletFormReturn extends PalletFormState {
  handleInputChange: (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  handleToggleManualCode: () => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  resetForm: () => void;
}

/**
 * Pallet code generation parameters
 */
export interface PalletCodeParams {
  turno: string;
  calibre: string;
  formato: string;
} 