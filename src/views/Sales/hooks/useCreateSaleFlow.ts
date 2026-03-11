import { useMemo, useState } from 'react';
import type {
  CalibreSelection,
  Customer,
  InventoryValidationResult,
  SaleType,
  SalesOrder,
} from '../../../api';
import { createSale, getCustomers, validateInventoryByCalibres } from '../../../api';
import { getErrorMessage } from '../../../utils/errorHandler';

export interface CalibreOption {
  code: string;
  label: string;
}

export const CALIBRE_OPTIONS: CalibreOption[] = [
  { code: '01', label: 'Especial Bco' },
  { code: '02', label: 'Extra Bco' },
  { code: '03', label: 'Especial Color' },
  { code: '04', label: 'Grande Bco' },
  { code: '07', label: 'Mediano Bco' },
  { code: '08', label: 'Sucio/Trizado' },
  { code: '12', label: 'Jumbo Bco' },
  { code: '13', label: 'Mediano Color' },
];

export const SALE_TYPE_OPTIONS: SaleType[] = [
  'Venta',
  'Reposición',
  'Donación',
  'Inutilizado',
  'Ración',
];

const DEFAULT_CALIBRE_COUNTS: Record<string, number> = CALIBRE_OPTIONS.reduce(
  (acc, option) => {
    acc[option.code] = 0;
    return acc;
  },
  {} as Record<string, number>
);

export const useCreateSaleFlow = () => {
  const [step, setStep] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerQuery, setCustomerQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSaleType, setSelectedSaleType] = useState<SaleType | null>(null);
  const [calibreCounts, setCalibreCounts] = useState<Record<string, number>>(
    DEFAULT_CALIBRE_COUNTS
  );
  const [notes, setNotes] = useState('');
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdSale, setCreatedSale] = useState<SalesOrder | null>(null);
  const [validationResult, setValidationResult] =
    useState<InventoryValidationResult | null>(null);

  const selectedCalibres = useMemo<CalibreSelection[]>(
    () =>
      Object.entries(calibreCounts)
        .map(([calibre, boxCount]) => ({
          calibre,
          boxCount: Number(boxCount) || 0,
        }))
        .filter((entry) => entry.boxCount > 0),
    [calibreCounts]
  );

  const filteredCustomers = useMemo(() => {
    const query = customerQuery.trim().toLowerCase();
    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.customerId.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query)
      );
    });
  }, [customerQuery, customers]);

  const loadCustomers = async () => {
    setIsLoadingCustomers(true);
    setError(null);
    try {
      const response = await getCustomers({
        filters: { status: 'ACTIVE' },
        pagination: { limit: 100 },
      });
      if (response.success && response.data) {
        setCustomers(response.data.items || []);
      } else {
        setError(response.error || 'No se pudieron cargar los clientes');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al cargar clientes'));
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const updateCalibreCount = (code: string, value: number) => {
    setCalibreCounts((prev) => ({
      ...prev,
      [code]: Math.max(0, value || 0),
    }));
  };

  const clearFeedback = () => {
    setError(null);
    setSuccess(null);
  };

  const goNext = () => {
    clearFeedback();
    setStep((prev) => Math.min(prev + 1, 2));
  };

  const goBack = () => {
    clearFeedback();
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const canContinueFromStep1 = Boolean(selectedSaleType && selectedCustomer);
  const canContinueFromStep2 = selectedCalibres.length > 0;

  const submit = async () => {
    if (!selectedCustomer || !selectedSaleType) {
      setError('Debe seleccionar tipo de venta y cliente');
      return false;
    }
    if (selectedCalibres.length === 0) {
      setError('Debe ingresar al menos un calibre con cantidad mayor a 0');
      return false;
    }

    setIsSubmitting(true);
    clearFeedback();

    try {
      const validation = await validateInventoryByCalibres(selectedCalibres);
      if (!validation.success || !validation.data) {
        throw new Error(validation.error || 'No se pudo validar inventario');
      }

      setValidationResult(validation.data);
      if (!validation.data.valid) {
        const missingCalibres = validation.data.calibreAvailability
          ?.filter((entry) => entry.missing > 0)
          .map((entry) => `Calibre ${entry.calibre}: faltan ${entry.missing}`)
          .join(', ');

        setError(
          missingCalibres ||
            validation.data.message ||
            'No hay stock suficiente en BODEGA'
        );
        return false;
      }

      const createResponse = await createSale({
        customerId: selectedCustomer.customerId,
        type: selectedSaleType,
        calibres: selectedCalibres,
        notes: notes.trim() || undefined,
      });

      if (!createResponse.success || !createResponse.data) {
        throw new Error(createResponse.error || 'No se pudo crear la venta');
      }

      setCreatedSale(createResponse.data);
      setSuccess('Solicitud de venta creada correctamente');
      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al crear la solicitud de venta'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    customers,
    filteredCustomers,
    customerQuery,
    selectedCustomer,
    selectedSaleType,
    calibreCounts,
    selectedCalibres,
    notes,
    isLoadingCustomers,
    isSubmitting,
    error,
    success,
    createdSale,
    validationResult,
    canContinueFromStep1,
    canContinueFromStep2,
    setCustomerQuery,
    setSelectedCustomer,
    setSelectedSaleType,
    setNotes,
    loadCustomers,
    updateCalibreCount,
    goNext,
    goBack,
    submit,
    clearFeedback,
  };
};
