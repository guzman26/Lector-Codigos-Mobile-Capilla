/**
 * Constants for the pallet form
 */

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Este campo es obligatorio',
  INVALID_OPTION: 'Seleccione una opción válida',
  INVALID_CODE: 'El código debe tener 14 dígitos',
  FORM_INCOMPLETE: 'Por favor complete todos los campos requeridos',
  GENERIC_ERROR: 'Ha ocurrido un error al procesar la solicitud',
  UNEXPECTED_ERROR: 'Error inesperado. Por favor intente nuevamente',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  CODE_GENERATION_ERROR: 'Error al generar el código del pallet'
};

/**
 * Shift options (turnos)
 */
export const TURNO_OPTIONS = [
  { value: '', label: 'Seleccione un turno' },
  { value: '1', label: 'Turno 1 (Mañana)' },
  { value: '2', label: 'Turno 2 (Tarde)' },
  { value: '3', label: 'Turno 3 (Noche)' }
];

/**
 * Caliber options (calibres)
 */
export const CALIBRE_OPTIONS = [
  { value: '', label: 'Seleccione un calibre' },
  { value: '01', label: 'ESPECIAL BCO' },
  { value: '02', label: 'EXTRA BCO' },
  { value: '04', label: 'GRANDE BCO' },
  { value: '07', label: 'MEDIANO BCO' },
  { value: '09', label: 'TERCERA BCO' },
  { value: '15', label: 'CUARTA BCO' },
  { value: '12', label: 'JUMBO BCO' },
  { value: '03', label: 'ESPECIAL COLOR' },
  { value: '05', label: 'EXTRA COLOR' },
  { value: '06', label: 'GRANDE COLOR' },
  { value: '13', label: 'MEDIANO COLOR' },
  { value: '11', label: 'TERCERA COLOR' },
  { value: '16', label: 'CUARTA COLOR' },
  { value: '14', label: 'JUMBO COLOR' },
  { value: '08', label: 'SUCIO / TRIZADO' }
];

/**
 * Format options (formatos)
 */
export const FORMATO_OPTIONS = [
  { value: '', label: 'Seleccione un formato' },
  { value: '1', label: 'Formato 1 (180 unidades)' },
  { value: '2', label: 'Formato 2 (360 unidades)' },
  { value: '3', label: 'Formato 3 (Custom)' }
];

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  PALLET_CREATED: 'Pallet creado correctamente'
};

/**
 * Form field names
 */
export const FORM_FIELDS = {
  TURNO: 'turno',
  CALIBRE: 'calibre',
  FORMATO: 'formato',
  CODIGO_MANUAL: 'codigoManual',
  USE_MANUAL_CODE: 'useManualCode'
} as const; 