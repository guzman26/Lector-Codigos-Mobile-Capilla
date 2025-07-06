import React, { useState, useEffect } from 'react';
import { getPalletDetails } from '../../api/endpoints';
import './PalletConfirmationModal.css';
import { Modal, Button } from '../ui';

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
}

const PalletConfirmationModal: React.FC<PalletConfirmationModalProps> = ({
  isOpen,
  palletCode,
  onConfirm,
  onReportIssue,
  onClose
}) => {
  const [palletDetails, setPalletDetails] = useState<PalletDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch pallet details when modal opens
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
      console.error('Error fetching pallet details:', err);
      setError('Error al cargar la información del pallet');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
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
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const cajasDañadas = palletDetails?.cajas.filter(caja => caja.estado === 'dañado').length || 0;

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="pallet-modal-container">
        <div className="pallet-modal-header">
          <h2>📦 Confirmación de Pallet</h2>
          <Button
            className="pallet-modal-close"
            onClick={handleClose}
            disabled={loading}
            aria-label="Cerrar"
          >
            ✕
          </Button>
        </div>

        <div className="pallet-modal-content">
          {loading && (
            <div className="pallet-loading">
              <div className="loading-spinner"></div>
              <p>Cargando información del pallet...</p>
            </div>
          )}

          {error && (
            <div className="pallet-error">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button onClick={fetchPalletDetails} className="retry-btn">
                Reintentar
              </button>
            </div>
          )}

          {palletDetails && (
            <div className="pallet-details">
              <div className="pallet-info-header">
                <div className="pallet-code">
                  <strong>Código: {palletDetails.codigo}</strong>
                </div>
                <div className={`pallet-status ${palletDetails.estado}`}>
                  {palletDetails.estado.toUpperCase()}
                </div>
              </div>

              <div className="pallet-info-grid">
                <div className="info-item">
                  <label>📍 Ubicación:</label>
                  <span>{palletDetails.ubicacion}</span>
                </div>
                
                {palletDetails.producto && (
                  <div className="info-item">
                    <label>📋 Producto:</label>
                    <span>{palletDetails.producto}</span>
                  </div>
                )}
                
                {palletDetails.lote && (
                  <div className="info-item">
                    <label>🏷️ Lote:</label>
                    <span>{palletDetails.lote}</span>
                  </div>
                )}
                
                {palletDetails.fechaVencimiento && (
                  <div className="info-item">
                    <label>📅 Vencimiento:</label>
                    <span>{formatDate(palletDetails.fechaVencimiento)}</span>
                  </div>
                )}
                
                <div className="info-item">
                  <label>⏰ Creado:</label>
                  <span>{formatDate(palletDetails.fechaCreacion)}</span>
                </div>
                
                {palletDetails.responsable && (
                  <div className="info-item">
                    <label>👤 Responsable:</label>
                    <span>{palletDetails.responsable}</span>
                  </div>
                )}
              </div>

              <div className="cajas-summary">
                <div className="cajas-count">
                  <h3>📦 Resumen de Cajas</h3>
                  <div className="count-display">
                    <span className="total-count">{palletDetails.numeroCajas}</span>
                    <span className="count-label">Total de cajas</span>
                  </div>
                  
                  {cajasDañadas > 0 && (
                    <div className="damaged-alert">
                      <span className="warning-icon">⚠️</span>
                      <span>{cajasDañadas} caja(s) con problemas</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="confirmation-question">
                <h3>¿Confirma que hay {palletDetails.numeroCajas} cajas en este pallet?</h3>
                <p>Revise físicamente el pallet antes de confirmar</p>
              </div>

              <div className="pallet-actions">
                <Button
                  onClick={handleConfirm}
                  className="confirm-btn"
                >
                  ✅ Sí, confirmo {palletDetails.numeroCajas} cajas
                </Button>

                <div className="issue-buttons">
                  <Button
                    onClick={() => handleReportIssue('Número de cajas no coincide')}
                    className="issue-btn count-issue"
                  >
                    📊 El número no coincide
                  </Button>

                  <Button
                    onClick={() => handleReportIssue('Cajas dañadas')}
                    className="issue-btn damage-issue"
                  >
                    📦 Cajas dañadas
                  </Button>

                  <Button
                    onClick={() => handleReportIssue('Producto incorrecto')}
                    className="issue-btn product-issue"
                  >
                    🏷️ Producto incorrecto
                  </Button>

                  <Button
                    onClick={() => handleReportIssue('Otro problema operacional')}
                    className="issue-btn other-issue"
                  >
                    ❓ Otro problema
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PalletConfirmationModal; 