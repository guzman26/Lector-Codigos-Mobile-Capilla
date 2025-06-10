import { useState, useCallback, useEffect } from 'react';
import { createPallet } from '../api/endpoints';
import { validateScannedCode } from '../utils/validators';
import type {
  PalletFormData,
  PalletFormErrors,
  PalletFormState,
  UsePalletFormReturn,
  PalletCodeParams
} from '../views/Scanning/CreatePalletForm/PalletForm.types';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FORM_FIELDS
} from '../views/Scanning/CreatePalletForm/PalletFormConstants';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek); 

// Si quieres forzar la zona local de tu servidor/navegador:
/**
 * Initial form data
 */
const initialFormData: PalletFormData = {
  turno: '',
  calibre: '',
  formato: '',
  codigoManual: '',
  useManualCode: false
};

/**
 * Generate a pallet code based on form parameters
 */
const generatePalletCode = (params: PalletCodeParams): string => {
  const now = dayjs();

  // 1) día de la semana: 1 (lunes) … 7 (domingo)
  const diaSemana = now.isoWeekday(); // si usas isoWeek
  // const diaSemana = now.day(); // 0 domingo…6 sábado si no usas iso

  // 2) semana del año, dos dígitos
  const semana = now.isoWeek().toString().padStart(2, "0");
  // o bien now.isoWeek()

  // 3) año, últimos dos dígitos
  const año   = now.format("YY"); 
  
  // Generate a 12-digit pallet code: YYMMDDTCFXXX
  // YY = Year, MM = Month, DD = Day, T = Turno, C = Calibre, F = Formato, XXX = Random
  const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${diaSemana}${semana}${año}${params.turno}${params.calibre.slice(-1)}${params.formato}${randomPart}`;
};

/**
 * Validate form data
 */
const validateForm = (formData: PalletFormData): PalletFormErrors => {
  const errors: PalletFormErrors = {};

  if (formData.useManualCode) {
    // Validate manual code
    if (!formData.codigoManual.trim()) {
      errors[FORM_FIELDS.CODIGO_MANUAL] = ERROR_MESSAGES.REQUIRED_FIELD;
    } else {
      const validation = validateScannedCode(formData.codigoManual);
      if (!validation.isValid || validation.type !== 'pallet') {
        errors[FORM_FIELDS.CODIGO_MANUAL] = ERROR_MESSAGES.INVALID_CODE;
      }
    }
  } else {
    // Validate generation parameters
    if (!formData.turno) {
      errors[FORM_FIELDS.TURNO] = ERROR_MESSAGES.REQUIRED_FIELD;
    }
    if (!formData.calibre) {
      errors[FORM_FIELDS.CALIBRE] = ERROR_MESSAGES.REQUIRED_FIELD;
    }
    if (!formData.formato) {
      errors[FORM_FIELDS.FORMATO] = ERROR_MESSAGES.REQUIRED_FIELD;
    }
  }

  return errors;
};

/**
 * Custom hook for managing pallet form state and operations
 */
export const usePalletForm = (
  onPalletCreated?: (palletCode: string) => void
): UsePalletFormReturn => {
  const [state, setState] = useState<PalletFormState>({
    formData: initialFormData,
    errors: {},
    isSubmitting: false,
    generatedCode: null,
    alertMessage: null,
    alertType: null
  });

  /**
   * Generate pallet code when form data changes
   */
  useEffect(() => {
    if (!state.formData.useManualCode && 
        state.formData.turno && 
        state.formData.calibre && 
        state.formData.formato) {
      try {
        const code = generatePalletCode({
          turno: state.formData.turno,
          calibre: state.formData.calibre,
          formato: state.formData.formato
        });
        
        setState(prev => {
          const { generation, ...restErrors } = prev.errors;
          return {
            ...prev,
            generatedCode: code,
            errors: restErrors
          };
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          generatedCode: null,
          errors: { ...prev.errors, generation: ERROR_MESSAGES.CODE_GENERATION_ERROR }
        }));
      }
    } else if (state.formData.useManualCode) {
      setState(prev => ({
        ...prev,
        generatedCode: state.formData.codigoManual || null
      }));
    } else {
      setState(prev => ({
        ...prev,
        generatedCode: null
      }));
    }
  }, [state.formData.turno, state.formData.calibre, state.formData.formato, state.formData.useManualCode, state.formData.codigoManual]);

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = event.target;
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : undefined;
    
    setState(prev => {
      const { [name]: _, ...restErrors } = prev.errors;
      return {
        ...prev,
        formData: {
          ...prev.formData,
          [name]: type === 'checkbox' ? checked : value
        },
        errors: restErrors,
        alertMessage: null,
        alertType: null
      };
    });
  }, []);

  /**
   * Toggle manual code input
   */
  const handleToggleManualCode = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        useManualCode: !prev.formData.useManualCode,
        codigoManual: ''
      },
      errors: {},
      generatedCode: null,
      alertMessage: null,
      alertType: null
    }));
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Validate form
    const errors = validateForm(state.formData);
    if (Object.keys(errors).length > 0) {
      setState(prev => ({
        ...prev,
        errors,
        alertMessage: ERROR_MESSAGES.FORM_INCOMPLETE,
        alertType: 'error'
      }));
      return;
    }

    const codigoToSubmit = state.formData.useManualCode 
      ? state.formData.codigoManual.trim()
      : state.generatedCode;

    if (!codigoToSubmit) {
      setState(prev => ({
        ...prev,
        alertMessage: ERROR_MESSAGES.CODE_GENERATION_ERROR,
        alertType: 'error'
      }));
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, alertMessage: null, alertType: null }));

    try {
      const response = await createPallet(codigoToSubmit);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          alertMessage: SUCCESS_MESSAGES.PALLET_CREATED,
          alertType: 'success'
        }));
        
        // Call success callback
        if (onPalletCreated) {
          onPalletCreated(codigoToSubmit);
        }
        
        // Reset form after a short delay
        setTimeout(() => {
          resetForm();
        }, 2000);
      } else {
        throw new Error(response.error || ERROR_MESSAGES.GENERIC_ERROR);
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        alertMessage: error.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
        alertType: 'error'
      }));
    }
  }, [state.formData, state.generatedCode, onPalletCreated]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setState({
      formData: initialFormData,
      errors: {},
      isSubmitting: false,
      generatedCode: null,
      alertMessage: null,
      alertType: null
    });
  }, []);

  return {
    ...state,
    handleInputChange,
    handleToggleManualCode,
    handleSubmit,
    resetForm
  };
};

export default usePalletForm; 