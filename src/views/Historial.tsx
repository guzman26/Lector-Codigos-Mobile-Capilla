import React, { useState } from 'react';
import { useScannedCodeContext } from '../context/ScannedCodeContext';
import { formatCodeForDisplay } from '../api';
import { getTimeAgo } from '../utils/dateFormatters';
import {
  Box,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Chip,
} from '../components/ui';

const Historial: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'caja' | 'pallet'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'activo' | 'inactivo' | 'bloqueado'>('all');

  const { data: currentScan, history, loading, clearHistory, getCodeInfo } = useScannedCodeContext();

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.producto?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ubicacion?.almacen?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.tipo === filterType;
    const matchesStatus = filterStatus === 'all' || item.estado === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleRescan = async (codigo: string) => {
    await getCodeInfo(codigo);
  };


  return (
    <Box>
      <Typography variant="h5" gutterBottom>Historial de Escaneos</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {history.length} código{history.length !== 1 ? 's' : ''} escaneado{history.length !== 1 ? 's' : ''}
      </Typography>

      {currentScan && (
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" color="text.secondary">Último escaneo:</Typography>
              <Typography variant="subtitle1">{formatCodeForDisplay(currentScan.codigo)}</Typography>
              <Chip size="small" label={currentScan.tipo === 'caja' ? 'Caja' : 'Pallet'} variant="outlined" />
            </Stack>
          </CardContent>
        </Card>
      )}

      <Stack spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Buscar por código, producto o almacén..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          size="small"
          fullWidth
        />
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 }, width: { xs: '100%', sm: 'auto' } }}>
            <InputLabel>Tipo</InputLabel>
            <Select value={filterType} label="Tipo" onChange={e => setFilterType(e.target.value as 'all' | 'caja' | 'pallet')}>
              <MenuItem value="all">Todos los tipos</MenuItem>
              <MenuItem value="caja">Solo Cajas</MenuItem>
              <MenuItem value="pallet">Solo Pallets</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 }, width: { xs: '100%', sm: 'auto' } }}>
            <InputLabel>Estado</InputLabel>
            <Select value={filterStatus} label="Estado" onChange={e => setFilterStatus(e.target.value as 'all' | 'activo' | 'inactivo' | 'bloqueado')}>
              <MenuItem value="all">Todos los estados</MenuItem>
              <MenuItem value="activo">Activos</MenuItem>
              <MenuItem value="inactivo">Inactivos</MenuItem>
              <MenuItem value="bloqueado">Bloqueados</MenuItem>
            </Select>
          </FormControl>
          {history.length > 0 && (
            <Button variant="outlined" size="small" onClick={clearHistory}>
              Limpiar Historial
            </Button>
          )}
        </Stack>
        {searchTerm || filterType !== 'all' || filterStatus !== 'all' ? (
          <Typography variant="body2" color="text.secondary">
            {filteredHistory.length} de {history.length} resultados
            {filteredHistory.length !== history.length && (
              <Button size="small" sx={{ ml: 1 }} onClick={() => { setSearchTerm(''); setFilterType('all'); setFilterStatus('all'); }}>
                Limpiar filtros
              </Button>
            )}
          </Typography>
        ) : null}
      </Stack>

      {filteredHistory.length === 0 ? (
        <Box textAlign="center" py={4}>
          {history.length === 0 ? (
            <>
              <Typography variant="h6" gutterBottom>📋 No hay códigos escaneados</Typography>
              <Typography variant="body2" color="text.secondary">Los códigos que escanees aparecerán aquí automáticamente</Typography>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>🔍 No se encontraron resultados</Typography>
              <Typography variant="body2" color="text.secondary">Prueba con otros filtros o términos de búsqueda</Typography>
            </>
          )}
        </Box>
      ) : (
        <Stack spacing={2}>
          {filteredHistory.map((item, index) => (
            <Card key={`${item.codigo}-${index}`} variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1">{formatCodeForDisplay(item.codigo)}</Typography>
                    <Chip size="small" label={item.tipo === 'caja' ? 'Caja' : 'Pallet'} variant="outlined" />
                  </Stack>
                  <Chip size="small" label={item.estado.charAt(0).toUpperCase() + item.estado.slice(1)} variant="outlined" />
                </Stack>
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  {item.producto && <Typography variant="body2"><strong>Producto:</strong> {item.producto.nombre}</Typography>}
                  {item.ubicacion && <Typography variant="body2"><strong>Ubicación:</strong> {item.ubicacion.almacen} - {item.ubicacion.zona}{item.ubicacion.posicion ? ` (${item.ubicacion.posicion})` : ''}</Typography>}
                  <Typography variant="body2" color="text.secondary">Escaneado: {getTimeAgo(item.ultimaActualizacion)}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }} flexWrap="wrap" gap={1}>
                  <Button variant="outlined" size="small" onClick={() => handleRescan(item.codigo)} disabled={loading}>
                    {loading ? '⏳' : '🔄'} Re-escanear
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.fechaCreacion).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {history.length > 0 && (
        <Stack direction="row" spacing={2} sx={{ mt: 2 }} flexWrap="wrap">
          <Typography variant="body2"><strong>{history.filter(h => h.tipo === 'caja').length}</strong> Cajas</Typography>
          <Typography variant="body2"><strong>{history.filter(h => h.tipo === 'pallet').length}</strong> Pallets</Typography>
          <Typography variant="body2"><strong>{history.filter(h => h.estado === 'activo').length}</strong> Activos</Typography>
        </Stack>
      )}
    </Box>
  );
};

export default Historial;
