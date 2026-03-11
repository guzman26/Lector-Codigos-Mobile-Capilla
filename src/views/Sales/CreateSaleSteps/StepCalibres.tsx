import React from 'react';
import { Box, Card, CardContent, Stack, TextField, Typography } from '../../../components/ui';
import { CALIBRE_OPTIONS } from '../hooks/useCreateSaleFlow';

interface StepCalibresProps {
  counts: Record<string, number>;
  onCountChange: (code: string, value: number) => void;
}

const StepCalibres: React.FC<StepCalibresProps> = ({ counts, onCountChange }) => {
  return (
    <Stack spacing={1.25}>
      <Typography variant="subtitle1" fontWeight={600}>
        Seleccionar Calibres y Cantidades
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Ingresa la cantidad de cajas por calibre. Solo se crearán los que tengan cantidad mayor a 0.
      </Typography>

      {CALIBRE_OPTIONS.map((option) => (
        <Card key={option.code} variant="outlined">
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
              <Box>
                <Typography variant="subtitle2">
                  Calibre {option.code}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.label}
                </Typography>
              </Box>
              <TextField
                type="number"
                size="small"
                value={counts[option.code] ?? 0}
                onChange={(e) => onCountChange(option.code, Number(e.target.value))}
                inputProps={{ min: 0 }}
                sx={{ width: 110 }}
              />
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default StepCalibres;
