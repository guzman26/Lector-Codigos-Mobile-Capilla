import React from 'react';
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
} from '../components/ui';

const Configuracion: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Configuración del Terminal</Typography>
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 400 }}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>General</Typography>
          <Stack spacing={2}>
            <TextField label="ID Terminal" value="TRM-001" size="small" fullWidth InputProps={{ readOnly: true }} />
            <FormControl fullWidth size="small">
              <InputLabel>Modo de escaneo</InputLabel>
              <Select label="Modo de escaneo" defaultValue="auto">
                <MenuItem value="auto">Automático</MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>
        <Box>
          <Typography variant="subtitle2" gutterBottom>Conectividad</Typography>
          <Stack spacing={2}>
            <TextField label="Servidor" placeholder="192.168.1.100" size="small" fullWidth />
            <TextField label="Puerto" type="number" placeholder="8080" size="small" fullWidth />
          </Stack>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button variant="contained" fullWidth sx={{ width: { xs: '100%', sm: 'auto' } }}>
            Guardar Configuración
          </Button>
          <Button variant="outlined" fullWidth sx={{ width: { xs: '100%', sm: 'auto' } }}>
            Restaurar Defaults
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Configuracion;
