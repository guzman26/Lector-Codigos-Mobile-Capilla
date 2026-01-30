import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScanContext } from '../../../context/ScanContext';
import { validateScannedCode } from '../../../utils/validators';
import { useScanMode } from '../../../hooks/useScanMode';
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  Alert,
} from '../../../components/ui';

const RegistrarCaja: React.FC = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { scanMode, toggleScanMode, inputRef } = useScanMode();
  const { data, loading, error, processScan, reset } = useScanContext();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isProcessing || loading || !codigo.trim()) return;
    const validation = validateScannedCode(codigo);
    if (!validation.isValid) return;
    const codigoToProcess = codigo.trim();
    setIsProcessing(true);
    try {
      await processScan({ codigo: codigoToProcess, ubicacion: 'BODEGA' });
      setCodigo('');
      if (scanMode && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleBack = () => navigate('/dashboard');

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (scanMode && inputRef.current && !loading) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [codigo, scanMode, loading]);

  const validation = validateScannedCode(codigo);
  const showValidationError = codigo.length > 0 && !validation.isValid;
  const showTypeError = codigo.length > 0 && validation.isValid && validation.type !== 'box' && validation.type !== 'pallet';

  return (
    <Box>
      <Stack spacing={2} mb={2}>
        <Button variant="outlined" size="small" onClick={handleBack}>← Volver</Button>
        <Typography variant="h5">Recibir Pallets o Cajas</Typography>
        <Typography variant="body2" color="text.secondary">
          Escanea o ingresa el código de caja o pallet para recepción en BODEGA
        </Typography>
        <Button
          variant={scanMode ? 'contained' : 'outlined'}
          size="small"
          onClick={toggleScanMode}
          disabled={loading}
        >
          {scanMode ? '📱 Modo Scanner: ON' : '⚡ Modo Scanner: OFF'}
        </Button>
        {scanMode && (
          <Typography variant="caption" color="text.secondary">
            🔍 Modo scanner activo - El campo permanecerá enfocado para escaneo consecutivo
          </Typography>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={reset}>
          {error}
        </Alert>
      )}

      {data && data.codigo && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={reset}>
          <strong>¡Éxito!</strong> {data.tipo === 'PALLET' ? 'Pallet' : 'Caja'} {data.codigo} recepcionado en {data.ubicacion}
          {data.boxesMoved && data.boxesMoved > 0 && ` (${data.boxesMoved} cajas)`}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={1} mb={2}>
          <TextField
            inputRef={inputRef}
            label="Código de Caja o Pallet"
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSubmit())}
            onBlur={() => {
              if (scanMode && inputRef.current && !loading) {
                setTimeout(() => inputRef.current?.focus(), 100);
              }
            }}
            placeholder={scanMode ? 'Escanea códigos consecutivamente...' : 'Escanea código de caja (15 dig.) o pallet (14 dig.)'}
            error={showValidationError || showTypeError}
            helperText={
              showValidationError
                ? validation.errorMessage
                : showTypeError
                  ? 'Tipo de código no reconocido. Use códigos de caja (15 dígitos) o pallet (14 dígitos).'
                  : codigo.length > 0 && validation.isValid
                    ? `✓ Código válido - Presiona Enter para procesar`
                    : undefined
            }
            disabled={loading}
            autoFocus
            inputProps={{ maxLength: 15 }}
            fullWidth
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ubicación: BODEGA · Códigos caja (15 dígitos) o pallet (14 dígitos) · Presiona Enter para procesar
          {scanMode ? ' · Modo Scanner: campo siempre enfocado' : ' · Activa Modo Scanner para escaneo con dispositivo físico'}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
          <Button type="button" size="small" variant="outlined" onClick={() => setCodigo('123456789012345')} disabled={loading}>Caja: 123456789012345</Button>
          <Button type="button" size="small" variant="outlined" onClick={() => setCodigo('987654321098765')} disabled={loading}>Caja: 987654321098765</Button>
          <Button type="button" size="small" variant="outlined" onClick={() => setCodigo('12345678901234')} disabled={loading}>Pallet: 12345678901234</Button>
        </Stack>
        <Button type="submit" variant="contained" fullWidth disabled={loading || !codigo.trim()}>
          {loading ? 'Procesando...' : 'Procesar'}
        </Button>
      </form>
    </Box>
  );
};

export default RegistrarCaja;
