import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDraftSales, type SalesOrder } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import { formatFullDate } from '../../utils/dateFormatters';
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

const SelectSale: React.FC = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDraftSales();
  }, []);

  const loadDraftSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDraftSales();
      if (response.success && response.data) {
        setSales(response.data.sales || []);
      } else {
        setError(response.error || 'No se pudieron cargar las ventas');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al cargar las ventas'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSale = (saleId: string) => navigate(`/sales/scan/${saleId}`);
  const handleBack = () => navigate('/dashboard');


  const filteredSales = sales.filter((sale) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      sale.saleId.toLowerCase().includes(term) ||
      sale.customerInfo.name.toLowerCase().includes(term) ||
      sale.customerInfo.email?.toLowerCase().includes(term) ||
      sale.customerInfo.phone?.toLowerCase().includes(term)
    );
  });

  return (
    <Box>
      <Stack spacing={2} mb={2}>
        <Button variant="outlined" size="small" onClick={handleBack}>← Volver</Button>
        <Typography variant="h5">📋 Seleccionar Venta</Typography>
        <Typography variant="body2" color="text.secondary">Selecciona una venta en borrador para agregar items</Typography>
        <Button variant="contained" onClick={() => navigate('/sales/create')}>
          + Crear Nueva Venta
        </Button>
      </Stack>

      <TextField
        placeholder="Buscar por ID, cliente, email o teléfono..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        size="small"
        fullWidth
        sx={{ mb: 2 }}
      />

      {loading && (
        <Box py={3} textAlign="center">
          <Typography color="text.secondary">🔄 Cargando ventas...</Typography>
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button size="small" onClick={loadDraftSales}>Reintentar</Button>}>
          {error}
        </Alert>
      )}

      {!loading && !error && filteredSales.length === 0 && (
        <Box py={3} textAlign="center">
          <Typography color="text.secondary">
            {searchTerm ? 'No se encontraron ventas que coincidan con la búsqueda' : 'No hay ventas en borrador disponibles'}
          </Typography>
          {!searchTerm && <Button variant="outlined" sx={{ mt: 1 }} onClick={loadDraftSales}>Actualizar</Button>}
        </Box>
      )}

      {!loading && !error && filteredSales.length > 0 && (
        <Stack spacing={2}>
          {filteredSales.map((sale) => (
            <Card key={sale.id} variant="outlined" sx={{ cursor: 'pointer' }} onClick={() => handleSelectSale(sale.id)}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={1}>
                  <Typography variant="subtitle1">Venta: {sale.saleId.slice(0, 8)}...</Typography>
                  <Chip label="DRAFT" size="small" variant="outlined" />
                </Stack>
                <Typography variant="body2">👤 {sale.customerInfo.name}</Typography>
                {sale.customerInfo.email && <Typography variant="caption">📧 {sale.customerInfo.email}</Typography>}
                {sale.customerInfo.phone && <Typography variant="caption">📞 {sale.customerInfo.phone}</Typography>}
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">Cajas: {sale.totalBoxCount ?? sale.totalBoxes ?? 0}</Typography>
                  {sale.totalEggs != null && <Typography variant="body2" color="text.secondary">Huevos: {sale.totalEggs}</Typography>}
                </Stack>
                <Typography variant="caption" color="text.secondary">Creada: {formatFullDate(sale.createdAt)}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default SelectSale;
