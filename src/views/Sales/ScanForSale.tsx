import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validateScannedCode, formatCodeForDisplay } from '../../api';
import { submitAddBoxesToSale, type AddBoxesToSaleResponse } from '../../api';
import { formatDate } from '../../utils/dateFormatters';
import { error as logError } from '../../utils/logger';
import { getErrorMessage } from '../../utils/errorHandler';
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  Alert,
  Card,
  CardContent,
  Chip,
} from '../../components/ui';

interface ScannedItem {
  code: string;
  type: 'box' | 'pallet';
  timestamp: string;
  success: boolean;
}

const ScanForSale: React.FC = () => {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [saleInfo, setSaleInfo] = useState<AddBoxesToSaleResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo.trim()) {
      setError('Por favor ingresa un código');
      return;
    }

    if (!saleId) {
      setError('ID de venta no válido');
      return;
    }

    const validation = validateScannedCode(codigo);
    if (!validation.isValid) {
      setError(validation.errorMessage || 'Código inválido');
      return;
    }

    if (scannedItems.some((item) => item.code === codigo.trim())) {
      setError('Este código ya fue escaneado en esta sesión');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const request = {
        saleId,
        ...(validation.type === 'box'
          ? { boxCode: codigo.trim() }
          : { palletCode: codigo.trim() }),
      };

      const response = await submitAddBoxesToSale(request);
      setSaleInfo(response);

      const newItem: ScannedItem = {
        code: codigo.trim(),
        type: validation.type || 'box',
        timestamp: new Date().toISOString(),
        success: true,
      };
      setScannedItems([...scannedItems, newItem]);

      setSuccess(
        `${validation.type === 'box' ? 'Caja' : 'Pallet'} agregado exitosamente`
      );
      setCodigo('');

      setTimeout(() => setSuccess(null), 3000);

      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Error al agregar el item a la venta');
      logError('Error adding to sale:', err);
      setError(message);

      const newItem: ScannedItem = {
        code: codigo.trim(),
        type: validation.type || 'box',
        timestamp: new Date().toISOString(),
        success: false,
      };
      setScannedItems([...scannedItems, newItem]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/sales/select');
  };


  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <Button onClick={handleBack} size="small">
            ← Volver
          </Button>
          <Typography variant="h6">Agregar a Venta</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Escanea códigos de cajas o pallets para agregarlos
        </Typography>
        {saleId && (
          <Typography variant="caption" color="text.secondary">
            Venta: {saleId.slice(0, 8)}...
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={1.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
              <TextField
                inputRef={inputRef}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Escanea o ingresa el código (14 o 15 dígitos)"
                disabled={loading}
                autoFocus
                fullWidth
                size="small"
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !codigo.trim()}
                fullWidth
                sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 48 } }}
              >
                {loading ? '…' : '✓'}
              </Button>
            </Stack>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
          </Stack>
        </Box>

        {saleInfo && (
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Progreso de la Venta
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
                  <Typography variant="body2">
                    Cajas Totales:{' '}
                    <strong>
                      {saleInfo.sale.totalBoxCount ?? saleInfo.sale.totalBoxes ?? 0}
                    </strong>
                  </Typography>
                  {saleInfo.sale.totalEggs != null && (
                    <Typography variant="body2">
                      Huevos Totales: <strong>{saleInfo.sale.totalEggs}</strong>
                    </Typography>
                  )}
                  {saleInfo.isComplete && (
                    <Chip label="Completa" color="success" size="small" />
                  )}
                </Stack>

                {Object.keys(saleInfo.boxesByCalibre).length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Cajas por Calibre
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {Object.entries(saleInfo.boxesByCalibre).map(([calibre, count]) => (
                        <Chip
                          key={calibre}
                          label={`Calibre ${calibre}: ${count}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {Object.keys(saleInfo.remainingBoxes).length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Faltan
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {Object.entries(saleInfo.remainingBoxes).map(([calibre, count]) => (
                        <Chip
                          key={calibre}
                          label={`Calibre ${calibre}: ${count} cajas`}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {scannedItems.length > 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Items Escaneados ({scannedItems.length})
            </Typography>
            <Stack spacing={1}>
              {scannedItems.map((item, index) => (
                <Card
                  key={`${item.code}-${index}`}
                  variant="outlined"
                  sx={{
                    borderLeft: 3,
                    borderLeftColor: item.success ? 'success.main' : 'error.main',
                  }}
                >
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      flexWrap="wrap"
                      gap={0.5}
                    >
                      <Typography variant="body2" fontFamily="monospace">
                        {formatCodeForDisplay(item.code)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.type === 'box' ? 'Caja' : 'Pallet'}
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mt={0.5}
                    >
                      <Typography variant="caption">
                        {item.success ? 'Agregado' : 'Error'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(item.timestamp)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default ScanForSale;
