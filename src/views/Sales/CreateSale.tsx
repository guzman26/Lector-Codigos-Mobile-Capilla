import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Chip, Stack, Typography } from '../../components/ui';
import StepCalibres from './CreateSaleSteps/StepCalibres';
import StepSummary from './CreateSaleSteps/StepSummary';
import StepTypeAndCustomer from './CreateSaleSteps/StepTypeAndCustomer';
import { useCreateSaleFlow } from './hooks/useCreateSaleFlow';

const STEP_TITLES = [
  'Tipo y Cliente',
  'Calibres',
  'Resumen',
];

const CreateSale: React.FC = () => {
  const navigate = useNavigate();
  const {
    step,
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
  } = useCreateSaleFlow();

  useEffect(() => {
    void loadCustomers();
  }, []);

  const handleCreate = async () => {
    const ok = await submit();
    if (ok) {
      setTimeout(() => navigate('/sales/select'), 1200);
    }
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <StepTypeAndCustomer
          customerQuery={customerQuery}
          selectedCustomer={selectedCustomer}
          selectedSaleType={selectedSaleType}
          customers={filteredCustomers}
          isLoadingCustomers={isLoadingCustomers}
          onCustomerQueryChange={setCustomerQuery}
          onCustomerSelect={setSelectedCustomer}
          onSaleTypeSelect={setSelectedSaleType}
        />
      );
    }

    if (step === 1) {
      return (
        <StepCalibres counts={calibreCounts} onCountChange={updateCalibreCount} />
      );
    }

    if (!selectedCustomer || !selectedSaleType) {
      return null;
    }

    return (
      <StepSummary
        customer={selectedCustomer}
        saleType={selectedSaleType}
        calibres={selectedCalibres}
        notes={notes}
        validationResult={validationResult}
        onNotesChange={setNotes}
      />
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Button variant="outlined" size="small" onClick={() => navigate('/sales/select')}>
            ← Volver
          </Button>
          <Typography variant="h6">Crear Venta</Typography>
        </Stack>

        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {STEP_TITLES.map((title, index) => (
                <Chip
                  key={title}
                  label={`${index + 1}. ${title}`}
                  color={step === index ? 'primary' : 'default'}
                  variant={step === index ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Stack>
          </CardContent>
        </Card>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {createdSale && (
          <Alert severity="success">
            Venta creada: {createdSale.saleId}. Redirigiendo a ventas en borrador...
          </Alert>
        )}

        {renderStep()}

        <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ pt: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              clearFeedback();
              if (step === 0) {
                navigate('/sales/select');
                return;
              }
              goBack();
            }}
            disabled={isSubmitting}
          >
            {step === 0 ? 'Cancelar' : 'Atrás'}
          </Button>

          {step < 2 ? (
            <Button
              variant="contained"
              onClick={goNext}
              disabled={
                isSubmitting ||
                (step === 0 && !canContinueFromStep1) ||
                (step === 1 && !canContinueFromStep2)
              }
            >
              Siguiente
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={isSubmitting || selectedCalibres.length === 0}
            >
              {isSubmitting ? 'Creando...' : 'Crear Solicitud'}
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default CreateSale;
