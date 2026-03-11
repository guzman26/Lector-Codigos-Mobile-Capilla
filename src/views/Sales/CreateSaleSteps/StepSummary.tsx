import React from 'react';
import type { CalibreSelection, Customer, InventoryValidationResult, SaleType } from '../../../api';
import { Box, Card, CardContent, Chip, Stack, TextField, Typography } from '../../../components/ui';

interface StepSummaryProps {
  customer: Customer;
  saleType: SaleType;
  calibres: CalibreSelection[];
  notes: string;
  validationResult: InventoryValidationResult | null;
  onNotesChange: (value: string) => void;
}

const StepSummary: React.FC<StepSummaryProps> = ({
  customer,
  saleType,
  calibres,
  notes,
  validationResult,
  onNotesChange,
}) => {
  const totalBoxes = calibres.reduce((sum, item) => sum + item.boxCount, 0);

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={600}>
        Resumen de la Solicitud
      </Typography>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={0.75}>
            <Typography variant="body2">
              <strong>Tipo:</strong> {saleType}
            </Typography>
            <Typography variant="body2">
              <strong>Cliente:</strong> {customer.name}
            </Typography>
            <Typography variant="body2">
              <strong>ID Cliente:</strong> {customer.customerId}
            </Typography>
            <Typography variant="body2">
              <strong>Total Cajas:</strong> {totalBoxes}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Calibres solicitados
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {calibres.map((item) => (
              <Chip
                key={item.calibre}
                label={`Calibre ${item.calibre}: ${item.boxCount}`}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      {validationResult?.calibreAvailability &&
        validationResult.calibreAvailability.length > 0 && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Disponibilidad por calibre
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                {validationResult.calibreAvailability.map((entry) => (
                  <Chip
                    key={entry.calibre}
                    label={`Calibre ${entry.calibre}: ${entry.available} disponibles`}
                    color={entry.missing > 0 ? 'warning' : 'success'}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Notas (opcional)
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={2}
          size="small"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Agregar observaciones para esta solicitud..."
        />
      </Box>
    </Stack>
  );
};

export default StepSummary;
