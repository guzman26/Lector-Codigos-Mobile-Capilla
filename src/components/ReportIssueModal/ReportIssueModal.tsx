import React, { useState } from 'react';
import { useScannedCodeContext } from '../../context/ScannedCodeContext';
import { submitIssueReport } from '../../api/endpoints';
import { validateIssueDescription } from '../../utils/validators';
import './ReportIssueModal.css';

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

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ isOpen, onClose }) => {
  const { data: lastScan } = useScannedCodeContext();
  
  const [formData, setFormData] = useState<IssueReport>({
    type: 'inventory',
    priority: 'medium',
    description: '',
    lastScannedCode: lastScan?.codigo || '',
    terminalId: 'TRM-001'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitResult, setSubmitResult] = useState<{id: string; mensaje: string; estado: string; fechaReporte: string} | null>(null);
  const [validationError, setValidationError] = useState<string>('');

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
    { value: 'other', label: 'Otro Problema', icon: '❓' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Baja', color: '#28a745', description: 'No bloquea operaciones' },
    { value: 'medium', label: 'Media', color: '#ffc107', description: 'Afecta eficiencia' },
    { value: 'high', label: 'Alta', color: '#fd7e14', description: 'Limita funcionalidad' },
    { value: 'critical', label: 'Crítica', color: '#dc3545', description: 'Bloquea operaciones' }
  ];

  const handleInputChange = (field: keyof IssueReport, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (field === 'description' && validationError) {
      setValidationError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate description before submitting
    const validation = validateIssueDescription(formData.description);
    if (!validation.isValid) {
      setValidationError(validation.errorMessage || 'Descripción inválida');
      return;
    }

    setIsSubmitting(true);
    setValidationError('');
    
    try {
      // Crear la descripción completa con toda la información del reporte
      const fullDescription = `
Descripción: ${issueTypes.find(t => t.value === formData.type)?.label}
Prioridad: ${priorityLevels.find(p => p.value === formData.priority)?.label}
Terminal: ${formData.terminalId}
${formData.lastScannedCode ? `Último Código: ${formData.lastScannedCode}` : ''}

Inforamción adicional:
${formData.description.trim()}

---
Reportado el: ${new Date().toLocaleString('es-ES')}
`.trim();

      // Llamar al endpoint de la API
      const result = await submitIssueReport(fullDescription);
      
      // Sanitizar el resultado para evitar objetos en el render
      const sanitizedResult = {
        id: typeof result?.id === 'string' ? result.id : 
            typeof result?.issueNumber === 'string' ? result.issueNumber : '',
        mensaje: typeof result?.mensaje === 'string' ? result.mensaje : 
                 typeof result?.message === 'string' ? result.message : '',
        estado: result?.estado || 'recibido',
        fechaReporte: result?.fechaReporte || new Date().toISOString()
      };
            
      setSubmitResult(sanitizedResult);
      setSubmitSuccess(true);
      
      // Auto-cerrar después de 3 segundos (más tiempo para leer el ID)
      setTimeout(() => {
        handleClose();
      }, 3000);
      
    } catch (error) {
      console.error('Error enviando reporte:', error);
      
      let errorMessage = 'Error enviando el reporte. Intenta nuevamente.';
      
      if (error instanceof Error) {
        if (error.message.includes('NETWORK_ERROR') || error.message.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet o contacta al administrador.';
        } else if (error.message.includes('VALIDATION_ERROR')) {
          errorMessage = 'Error de validación: ' + error.message;
        } else {
          errorMessage = `Error: ${error.message}`;
        }
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
        terminalId: 'TRM-001'
      });
      setSubmitSuccess(false);
      setSubmitResult(null);
      setValidationError('');
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">🚨 Reportar Problema</h2>
          <button 
            className="modal-close-btn"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {submitSuccess ? (
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h3>Reporte Enviado</h3>
            <p>Tu reporte ha sido enviado exitosamente.</p>
            {submitResult?.id && typeof submitResult.id === 'string' && (
              <p><strong>ID del Reporte:</strong> {submitResult.id}</p>
            )}
            {submitResult?.mensaje && typeof submitResult.mensaje === 'string' && (
              <p><em>{submitResult.mensaje}</em></p>
            )}
            <p>El equipo técnico será notificado.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-section">
              <label className="form-label">Tipo de Problema</label>
              <div className="issue-types-grid">
                {issueTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    className={`issue-type-btn ${formData.type === type.value ? 'active' : ''}`}
                    onClick={() => handleInputChange('type', type.value)}
                    disabled={isSubmitting}
                  >
                    <span className="issue-icon">{type.icon}</span>
                    <span className="issue-label">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Prioridad</label>
              <div className="priority-grid">
                {priorityLevels.map(priority => (
                  <button
                    key={priority.value}
                    type="button"
                    className={`priority-btn ${formData.priority === priority.value ? 'active' : ''}`}
                    onClick={() => handleInputChange('priority', priority.value)}
                    disabled={isSubmitting}
                    style={{
                      borderColor: formData.priority === priority.value ? priority.color : undefined,
                      backgroundColor: formData.priority === priority.value ? `${priority.color}15` : undefined
                    }}
                  >
                    <span className="priority-label" style={{ color: priority.color }}>
                      {priority.label}
                    </span>
                    <span className="priority-description">{priority.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="description">
                Descripción del Problema *
              </label>
              <textarea
                id="description"
                className={`form-textarea ${validationError ? 'error' : ''}`}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe detalladamente el problema que estás experimentando..."
                rows={4}
                disabled={isSubmitting}
                required
              />
              {validationError && (
                <div className="validation-error">
                  {validationError}
                </div>
              )}
              <div className="character-count">
                {formData.description.length}/1000 caracteres
              </div>
            </div>

            {formData.lastScannedCode && (
              <div className="form-section">
                <label className="form-label">Último Código Escaneado</label>
                <div className="code-info">
                  <span className="code-display">{formData.lastScannedCode}</span>
                  <span className="code-note">Se incluirá en el reporte para contexto</span>
                </div>
              </div>
            )}

            <div className="form-section">
              <label className="form-label">Terminal ID</label>
              <input
                type="text"
                className="form-input"
                value={formData.terminalId}
                onChange={(e) => handleInputChange('terminalId', e.target.value)}
                disabled={isSubmitting}
                readOnly
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting || !formData.description.trim()}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner">⏳</span>
                    Enviando...
                  </>
                ) : (
                  'Enviar Reporte'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportIssueModal; 