import React, { useState, useEffect } from 'react';
import { getPalletDetails } from '../../api/endpoints';
import { error as logError } from '../../utils/logger';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  Stack,
} from '../ui';

interface PalletDetails {
  codigo: string;
  tipo: 'pallet';
  estado: string;
  ubicacion: string;
  fechaCreacion: string;
  numeroCajas: number;
  cajas: Array<{
    codigo: string;
    producto: string;
    estado: string;
    fechaIngreso: string;
  }>;
  producto?: string;
  lote?: string;
  fechaVencimiento?: string;
  responsable?: string;
}

interface PalletConfirmationModalProps {
  isOpen: boolean;
  palletCode: string;
  onConfirm: () => void;
  onReportIssue: (reason?: string) => void;
  onClose: () => void;
  processing?: boolean;
  processingError?: string | null;
}

const PalletConfirmationModal: React.FC<PalletConfirmationModalProps> = ({
  isOpen,
  palletCode,
  onConfirm,
  onReportIssue,
  onClose,
  processing = false,
  processingError = null,
}) => {
  const [palletDetails, setPalletDetails] = useState<PalletDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && palletCode) {
      fetchPalletDetails();
    }
  }, [isOpen, palletCode]);

  const fetchPalletDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPalletDetails(palletCode);
      if (response.success && response.data) {
        setPalletDetails(response.data);
      } else {
        setError('No se pudo obtener la información del pallet');
      }
    } catch (err) {
      logError('Error fetching pallet details:', err);
      setError('Error al cargar la información del pallet');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const handleReportIssue = (reason: string) => {
    onReportIssue(reason);
    handleClose();
  };

  const handleClose = () => {
    setPalletDetails(null);
    setError('');
    onClose();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const cajasDañadas = palletDetails?.cajas.filter(caja => caja.estado === 'dañado').length || 0;

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>📦 Confirmación de Pallet</span>
        <IconButton aria-label="cerrar" onClick={handleClose} disabled={loading} size="small">
          ✕
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading && (
          <Box py={3} textAlign="center">
            <Typography color="text.secondary">Cargando información del pallet...</Typography>
          </Box>
        )}

        {error && !processingError && (
          <Alert severity="error" sx={{ mb: 2 }} action={<Button size="small" onClick={fetchPalletDetails}>Reintentar</Button>}>
            {error}
          </Alert>
        )}

        {processingError && (
          <Alert severity="error" sx={{ mb: 2 }} action={<Button size="small" onClick={fetchPalletDetails}>Reintentar</Button>}>
            <Typography variant="subtitle2">Error de conexión con el servidor</Typography>
            <Typography variant="body2">{processingError}</Typography>
            <Typography variant="caption">💡 Verifica tu conexión a internet e intenta nuevamente</Typography>
          </Alert>
        )}

        {processing && (
          <Box py={2} textAlign="center">
            <Typography color="text.secondary">Procesando recepción del pallet...</Typography>
          </Box>
        )}

        {palletDetails && (
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Typography variant="subtitle1"><strong>Código: {palletDetails.codigo}</strong></Typography>
              <Typography variant="body2" color="text.secondary">{palletDetails.estado.toUpperCase()}</Typography>
            </Box>
            <Stack spacing={0.5}>
              <Typography variant="body2">📍 Ubicación: {palletDetails.ubicacion}</Typography>
              {palletDetails.producto && <Typography variant="body2">📋 Producto: {palletDetails.producto}</Typography>}
              {palletDetails.lote && <Typography variant="body2">🏷️ Lote: {palletDetails.lote}</Typography>}
              {palletDetails.fechaVencimiento && <Typography variant="body2">📅 Vencimiento: {formatDate(palletDetails.fechaVencimiento)}</Typography>}
              <Typography variant="body2">⏰ Creado: {formatDate(palletDetails.fechaCreacion)}</Typography>
              {palletDetails.responsable && <Typography variant="body2">👤 Responsable: {palletDetails.responsable}</Typography>}
            </Stack>
            <Box>
              <Typography variant="subtitle2" gutterBottom>📦 Resumen de Cajas</Typography>
              <Typography variant="body2">{palletDetails.numeroCajas} total de cajas</Typography>
              {cajasDañadas > 0 && (
                <Alert severity="warning" sx={{ mt: 1 }}>⚠️ {cajasDañadas} caja(s) con problemas</Alert>
              )}
            </Box>
            <Typography variant="subtitle2">¿Confirma que hay {palletDetails.numeroCajas} cajas en este pallet?</Typography>
            <Typography variant="body2" color="text.secondary">Revise físicamente el pallet antes de confirmar</Typography>
          </Stack>
        )}
      </DialogContent>
      {palletDetails && (
        <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1, p: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            disabled={processing || loading}
          >
            {processing ? '⏳ Procesando...' : `✅ Sí, confirmo ${palletDetails.numeroCajas} cajas`}
          </Button>
          <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center">
            <Button size="small" variant="outlined" onClick={() => handleReportIssue('Número de cajas no coincide')} disabled={processing || loading}>📊 El número no coincide</Button>
            <Button size="small" variant="outlined" onClick={() => handleReportIssue('Cajas dañadas')} disabled={processing || loading}>📦 Cajas dañadas</Button>
            <Button size="small" variant="outlined" onClick={() => handleReportIssue('Producto incorrecto')} disabled={processing || loading}>🏷️ Producto incorrecto</Button>
            <Button size="small" variant="outlined" onClick={() => handleReportIssue('Otro problema operacional')} disabled={processing || loading}>❓ Otro problema</Button>
          </Stack>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default PalletConfirmationModal;
