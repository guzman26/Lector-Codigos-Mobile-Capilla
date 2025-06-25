import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScannedCodeContext } from '../context/ScannedCodeContext';
import { useScanContext } from '../context/ScanContext';
import { formatCodeForDisplay } from '../api';
import ReportIssueModal from '../components/ReportIssueModal/ReportIssueModal';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: oldData, history: oldHistory } = useScannedCodeContext();
  const { data: scanData, history: scanHistory } = useScanContext();
  const [showReportModal, setShowReportModal] = useState(false);

  // Use the new scan data if available, otherwise fallback to old data
  const history = scanHistory.length > 0 ? scanHistory : oldHistory;

  const handleRegistrarCaja = () => {
    navigate('/registrar-caja');
  };

  const handleReportClick = () => {
    setShowReportModal(true);
  };

  const renderData = () => {
    if (scanData) {
      // New scan data format
      return (
        <div className="last-scan-section">
          <h3 className="section-title">Último Código Procesado</h3>
          <div className="scan-result-card">
            <div className="result-header">
              <span className="code-display">
                {formatCodeForDisplay(scanData.data?.codigo || '')}
              </span>
              <span className={`code-type ${scanData.data?.tipo?.toLowerCase()}`}>
                {scanData.data?.tipo === 'BOX' ? 'Caja' : 'Pallet'}
              </span>
            </div>
            
            <div className="result-details">
              <div className="detail-row">
                <span className="detail-label">Ubicación:</span>
                <span className="detail-value">{scanData.data?.ubicacion}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Estado:</span>
                <span className={`status-badge ${scanData.data?.estado}`}>
                  {scanData.data?.estado ? 
                    scanData.data.estado.charAt(0).toUpperCase() + scanData.data.estado.slice(1) :
                    'Desconocido'
                  }
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Mensaje:</span>
                <span className="detail-value">{scanData.message}</span>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (oldData) {
      // Legacy data format
      return (
        <div className="last-scan-section">
          <h3 className="section-title">Último Código Escaneado</h3>
          <div className="scan-result-card">
            <div className="result-header">
              <span className="code-display">
                {formatCodeForDisplay(oldData.codigo)}
              </span>
              <span className={`code-type ${oldData.tipo}`}>
                {oldData.tipo === 'caja' ? 'Caja' : 'Pallet'}
              </span>
            </div>
            
            <div className="result-details">
              {oldData.producto && (
                <div className="detail-row">
                  <span className="detail-label">Producto:</span>
                  <span className="detail-value">{oldData.producto.nombre}</span>
                </div>
              )}
              
              {oldData.ubicacion && (
                <div className="detail-row">
                  <span className="detail-label">Ubicación:</span>
                  <span className="detail-value">
                    {oldData.ubicacion.almacen} - {oldData.ubicacion.zona}
                  </span>
                </div>
              )}
              
              <div className="detail-row">
                <span className="detail-label">Estado:</span>
                <span className={`status-badge ${oldData.estado}`}>
                  {oldData.estado.charAt(0).toUpperCase() + oldData.estado.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="dashboard-content">
      {/* Sección de Acciones */}
      <div className="actions-section">
        <button 
          className="action-btn primary"
          onClick={handleRegistrarCaja}
        >
          <span className="btn-text">Recibir Pallets o Cajas</span>
        </button>

        <button 
          className="action-btn"
          onClick={() => navigate('/consultar-codigo')}
        >
          <span className="btn-text">Consultar Código</span>
        </button>

        <button 
          className="action-btn"
          onClick={() => navigate('/crear-pallet')}
        >
          <span className="btn-text">Crear Pallet</span>
        </button>
        
        
        <button className="action-btn"
        onClick={handleReportClick}>
          <span className="btn-text">Registrar Problema</span>
        </button>
      </div>

      {/* Último Código Procesado */}
      {renderData()}

      {/* Modal de Reporte de Problemas */}
      <ReportIssueModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
};

export default Dashboard; 