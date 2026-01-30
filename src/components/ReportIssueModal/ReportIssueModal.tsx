import React, { useState } from 'react';
import { useScannedCodeContext } from '../../context/ScannedCodeContext';
import { submitIssueReport } from '../../api/endpoints';
import { validateIssueDescription } from '../../utils/validators';
import { error as logError } from '../../utils/logger';
import { getErrorMessage } from '../../utils/errorHandler';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
  Stack,
} from '../ui';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IssueReport {
  type: 'inventory' | 'damaged_goods' | 'wrong_product' | 'missing_items' | 'quality_issue' | 'access_problem' | 'equipment_failure' | 'process_error' | 'safety_concern' | 'scanner' | 'network' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  lastScannedCode?: string;
  terminalId: string;
}

const issueTypes = [
  { value: 'inventory', label: 'Discrepancia de Inventario', icon: '📊' },
  { value: 'damaged_goods', label: 'Productos Dañados', icon: '📦' },
  { value: 'wrong_product', label: 'Producto Incorrecto', icon: '🏷️' },
  { value: 'missing_items', label: 'Elementos Faltantes', icon: '❌' },
  { value: 'quality_issue', label: 'Problema de Calidad', icon: '⚠️' },
  { value: 'access_problem', label: 'Problema de Acceso', icon: '🚪' },
  { value: 'equipment_failure', label: 'Falla de Equipo', icon: '⚙️' },
  { value: 'process_error', label: 'Error en Proceso', icon: '🔄' },
  { value: 'safety_concern', label: 'Problema de Seguridad', icon: '🛡️' },
  { value: 'scanner', label: 'Problema con Escáner', icon: '📱' },
  { value: 'network', label: 'Problema de Conexión', icon: '🌐' },
  { value: 'other', label: 'Otro Problema', icon: '❓' },
];

const priorityLevels = [
  { value: 'low', label: 'Baja', description: 'No bloquea operaciones' },
  { value: 'medium', label: 'Media', description: 'Afecta eficiencia' },
  { value: 'high', label: 'Alta', description: 'Limita funcionalidad' },
  { value: 'critical', label: 'Crítica', description: 'Bloquea operaciones' },
];

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ isOpen, onClose }) => {
  const { data: lastScan } = useScannedCodeContext();

  const [formData, setFormData] = useState<IssueReport>({
    type: 'inventory',
    priority: 'medium',
    description: '',
    lastScannedCode: lastScan?.codigo || '',
    terminalId: 'TRM-001',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ id: string; mensaje: string; estado: string; fechaReporte: string } | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  const handleInputChange = (field: keyof IssueReport, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'description' && validationError) setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateIssueDescription(formData.description);
    if (!validation.isValid) {
      setValidationError(validation.errorMessage || 'Descripción inválida');
      return;
    }
    setIsSubmitting(true);
    setValidationError('');
    try {
      const fullDescription = `
Descripción: ${issueTypes.find(t => t.value === formData.type)?.label}
Prioridad: ${priorityLevels.find(p => p.value === formData.priority)?.label}
Terminal: ${formData.terminalId}
${formData.lastScannedCode ? `Último Código: ${formData.lastScannedCode}` : ''}

Información adicional:
${formData.description.trim()}

---
Reportado el: ${new Date().toLocaleString('es-ES')}
`.trim();
      const result = await submitIssueReport(fullDescription);
      const sanitizedResult = {
        id: typeof result?.id === 'string' ? result.id : typeof result?.issueNumber === 'string' ? result.issueNumber : '',
        mensaje: typeof result?.mensaje === 'string' ? result.mensaje : typeof result?.message === 'string' ? result.message : '',
        estado: result?.estado || 'recibido',
        fechaReporte: result?.fechaReporte || new Date().toISOString(),
      };
      setSubmitResult(sanitizedResult);
      setSubmitSuccess(true);
      setTimeout(() => handleClose(), 3000);
    } catch (error) {
      logError('Error enviando reporte:', error);
      let errorMessage = 'Error enviando el reporte. Intenta nuevamente.';
      const errorMsg = getErrorMessage(error, '');
      if (errorMsg.includes('NETWORK_ERROR') || errorMsg.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet o contacta al administrador.';
      } else if (errorMsg.includes('VALIDATION_ERROR')) {
        errorMessage = 'Error de validación: ' + errorMsg;
      } else if (errorMsg) {
        errorMessage = `Error: ${errorMsg}`;
      }
      setValidationError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        type: 'inventory',
        priority: 'medium',
        description: '',
        lastScannedCode: lastScan?.codigo || '',
        terminalId: 'TRM-001',
      });
      setSubmitSuccess(false);
      setSubmitResult(null);
      setValidationError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>🚨 Reportar Problema</span>
        <IconButton aria-label="cerrar" onClick={handleClose} disabled={isSubmitting} size="small">
          ✕
        </IconButton>
      </DialogTitle>
      {submitSuccess ? (
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Reporte Enviado</Typography>
            <Typography variant="body2">Tu reporte ha sido enviado exitosamente.</Typography>
            {submitResult?.id && <Typography variant="body2"><strong>ID del Reporte:</strong> {submitResult.id}</Typography>}
            {submitResult?.mensaje && <Typography variant="body2" component="em">{submitResult.mensaje}</Typography>}
            <Typography variant="body2">El equipo técnico será notificado.</Typography>
          </Alert>
        </DialogContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {validationError && <Alert severity="error" sx={{ mb: 2 }}>{validationError}</Alert>}
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo de Problema</InputLabel>
                <Select
                  value={formData.type}
                  label="Tipo de Problema"
                  onChange={e => handleInputChange('type', e.target.value)}
                  disabled={isSubmitting}
                >
                  {issueTypes.map(t => (
                    <MenuItem key={t.value} value={t.value}>{t.icon} {t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={formData.priority}
                  label="Prioridad"
                  onChange={e => handleInputChange('priority', e.target.value)}
                  disabled={isSubmitting}
                >
                  {priorityLevels.map(p => (
                    <MenuItem key={p.value} value={p.value}>{p.label} – {p.description}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Descripción del Problema *"
                multiline
                rows={4}
                fullWidth
                size="small"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Describe detalladamente el problema..."
                error={Boolean(validationError)}
                helperText={validationError || `${formData.description.length}/1000 caracteres`}
                disabled={isSubmitting}
                inputProps={{ maxLength: 1000 }}
              />
              {formData.lastScannedCode && (
                <TextField label="Último Código Escaneado" value={formData.lastScannedCode} size="small" fullWidth InputProps={{ readOnly: true }} helperText="Se incluirá en el reporte para contexto" />
              )}
              <TextField label="Terminal ID" value={formData.terminalId} size="small" fullWidth InputProps={{ readOnly: true }} disabled={isSubmitting} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting || !formData.description.trim()}>
              {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
};

export default ReportIssueModal;
