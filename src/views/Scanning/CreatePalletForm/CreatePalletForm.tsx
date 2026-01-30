/**
 * Create Pallet Form Component
 */
import React from 'react';
import { CreatePalletFormProps } from './PalletForm.types';
import { usePalletForm } from '../../../hooks/usePalletForm';
import { PalletCodePreview } from './PalletCodePreview';
import { TURNO_OPTIONS, CALIBRE_OPTIONS, FORMATO_OPTIONS } from './PalletFormConstants';
import {
  Box,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
} from '../../../components/ui';

/**
 * Form for creating a new pallet
 */
export const CreatePalletForm: React.FC<CreatePalletFormProps> = ({
  onPalletCreated,
  onCancel,
}) => {
  const {
    formData,
    errors,
    isSubmitting,
    generatedCode,
    alertMessage,
    alertType,
    handleInputChange,
    handleSubmit,
    resetForm,
  } = usePalletForm(onPalletCreated);

  const handleCancel = () => {
    resetForm();
    if (onCancel) {
      onCancel();
    }
  };

  const adapterChange = (name: string, value: string) =>
    handleInputChange({
      target: { name, value, type: 'text' },
    } as React.ChangeEvent<HTMLInputElement>);

  return (
    <Box>
      {alertMessage && alertType && (
        <Alert severity={alertType} sx={{ mb: 2 }}>
          {alertMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>🚛 Crear Nuevo Pallet</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Complete los datos para generar el código del pallet
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              name="useManualCode"
              checked={formData.useManualCode}
              onChange={(e) =>
                handleInputChange({
                  target: {
                    name: 'useManualCode',
                    type: 'checkbox',
                    checked: e.target.checked,
                  },
                } as React.ChangeEvent<HTMLInputElement>)
              }
            />
          }
          label={
            formData.useManualCode
              ? 'Ingresar código manualmente'
              : 'Generar código automáticamente'
          }
          sx={{ mb: 2, display: 'block' }}
        />

        {formData.useManualCode ? (
          <Stack spacing={2} sx={{ mb: 2 }}>
            <TextField
              name="codigoManual"
              label="Código del Pallet *"
              value={formData.codigoManual}
              onChange={handleInputChange}
              placeholder="Ingrese el código de 14 dígitos"
              error={Boolean(errors.codigoManual)}
              helperText={errors.codigoManual}
              inputProps={{ maxLength: 14, pattern: '[0-9]{14}' }}
              required
              fullWidth
            />
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ mb: 2 }}>
            <FormControl fullWidth error={Boolean(errors.turno)} size="small">
              <InputLabel>Turno *</InputLabel>
              <Select
                name="turno"
                value={formData.turno}
                label="Turno *"
                onChange={(e) => adapterChange('turno', e.target.value as string)}
                required
              >
                {TURNO_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.turno && (
                <Typography variant="caption" color="error">
                  {errors.turno}
                </Typography>
              )}
            </FormControl>
            <FormControl fullWidth error={Boolean(errors.calibre)} size="small">
              <InputLabel>Calibre *</InputLabel>
              <Select
                name="calibre"
                value={formData.calibre}
                label="Calibre *"
                onChange={(e) => adapterChange('calibre', e.target.value as string)}
                required
              >
                {CALIBRE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.calibre && (
                <Typography variant="caption" color="error">
                  {errors.calibre}
                </Typography>
              )}
            </FormControl>
            <FormControl fullWidth error={Boolean(errors.formato)} size="small">
              <InputLabel>Formato *</InputLabel>
              <Select
                name="formato"
                value={formData.formato}
                label="Formato *"
                onChange={(e) => adapterChange('formato', e.target.value as string)}
                required
              >
                {FORMATO_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.formato && (
                <Typography variant="caption" color="error">
                  {errors.formato}
                </Typography>
              )}
            </FormControl>
          </Stack>
        )}

        {generatedCode && <PalletCodePreview code={generatedCode} />}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={handleCancel}
            disabled={isSubmitting}
            fullWidth
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !generatedCode}
            fullWidth
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {isSubmitting ? 'Creando...' : 'Crear Pallet'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default CreatePalletForm;
