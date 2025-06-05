import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScannedCodeContext } from '../context/ScannedCodeContext';
import { formatCodeForDisplay } from '../api';
import ReportIssueModal from '../components/ReportIssueModal/ReportIssueModal';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [inputCode, setInputCode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const { data, loading, error, history, getCodeInfo, reset } = useScannedCodeContext();
  const [showReportModal, setShowReportModal] = useState(false);
  const handleScanClick = () => {
    setShowScanner(!showScanner);
  };

  const handleScanSubmit = async () => {
    if (inputCode.trim()) {
      await getCodeInfo(inputCode.trim());
      setInputCode('');
      setShowScanner(false);
    }
  };

  const handleQuickScan = async (code: string) => {
    await getCodeInfo(code);
  };

  const handleReportClick = () => {
    setShowReportModal(true);
  };

  return (
    <div className="dashboard-content">
      {/* Sección de Acciones */}
      <div className="actions-section">
        <button 
          className={`action-btn primary ${loading ? 'loading' : ''}`}
          onClick={handleScanClick}
          disabled={loading}
        >
          <span className="btn-text">
            {loading ? 'Procesando...' : showScanner ? 'Ocultar Escáner' : 'Escanear Código'}
          </span>
        </button>
        
        <button 
          className="action-btn"
          onClick={() => navigate('/historial')}
        >
          <span className="btn-text">Ver Historial ({history.length})</span>
        </button>
        
        <button className="action-btn"
        onClick={handleReportClick}>
          <span className="btn-text">Reportes</span>
        </button>
      </div>

      {/* Escáner Rápido */}
      {showScanner && (
        <div className="scanner-section">
          <h3>Escanear Código</h3>
          <div className="scanner-input-group">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Código de 12 o 15 dígitos"
              className="scanner-input"
              disabled={loading}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleScanSubmit();
                }
              }}
            />
            <button
              onClick={handleScanSubmit}
              disabled={loading || !inputCode.trim()}
              className="scan-submit-btn"
            >
              {loading ? '⏳' : '🔍'}
            </button>
          </div>
          
          {/* Botones de código de ejemplo */}
          <div className="quick-codes">
            <p>Códigos de prueba:</p>
            <button 
              onClick={() => handleQuickScan('123456789012345')}
              className="quick-code-btn"
              disabled={loading}
            >
              Caja: 123456789012345
            </button>
            <button 
              onClick={() => handleQuickScan('123456789012')}
              className="quick-code-btn"
              disabled={loading}
            >
              Pallet: 123456789012
            </button>
          </div>
        </div>
      )}

      {/* Mostrar Error */}
      {error && (
        <div className="error-section">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
            <button onClick={reset} className="error-close">✕</button>
          </div>
        </div>
      )}

      {/* Último Código Escaneado */}
      {data && (
        <div className="last-scan-section">
          <h3 className="section-title">Último Código Escaneado</h3>
          <div className="scan-result-card">
            <div className="result-header">
              <span className="code-display">
                {formatCodeForDisplay(data.codigo)}
              </span>
              <span className={`code-type ${data.tipo}`}>
                {data.tipo === 'caja' ? 'Caja' : 'Pallet'}
              </span>
            </div>
            
            <div className="result-details">
              {data.producto && (
                <div className="detail-row">
                  <span className="detail-label">Producto:</span>
                  <span className="detail-value">{data.producto.nombre}</span>
                </div>
              )}
              
              {data.ubicacion && (
                <div className="detail-row">
                  <span className="detail-label">Ubicación:</span>
                  <span className="detail-value">
                    {data.ubicacion.almacen} - {data.ubicacion.zona}
                  </span>
                </div>
              )}
              
              <div className="detail-row">
                <span className="detail-label">Estado:</span>
                <span className={`status-badge ${data.estado}`}>
                  {data.estado.charAt(0).toUpperCase() + data.estado.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historial Rápido */}
      {history.length > 0 && (
        <div className="quick-history-section">
          <h3 className="section-title">Últimos Escaneos</h3>
          <div className="history-list">
            {history.slice(0, 3).map((item, index) => (
              <div key={`${item.codigo}-${index}`} className="history-item">
                <span className="history-code">{formatCodeForDisplay(item.codigo)}</span>
                <span className={`history-type ${item.tipo}`}>
                  {item.tipo === 'caja' ? 'Caja' : 'Pallet'}
                </span>
                <span className={`history-status ${item.estado}`}>
                  {item.estado}
                </span>
              </div>
            ))}
          </div>
          {history.length > 3 && (
            <p className="history-more">
              +{history.length - 3} códigos más en el historial
            </p>
          )}
        </div>
      )}

      {/* Estado del Sistema */}
      <div className="status-section">
        <h3 className="section-title">Estado del Sistema</h3>
        <div className="status-list">
          <div className="status-item">
            <span className="status-label">Escáner:</span>
            <span className="status-value active">Operativo</span>
          </div>
          <div className="status-item">
            <span className="status-label">Conexión:</span>
            <span className="status-value active">Conectado</span>
          </div>
          <div className="status-item">
            <span className="status-label">Base de datos:</span>
            <span className="status-value active">Sincronizado</span>
          </div>
          <div className="status-item">
            <span className="status-label">Códigos escaneados:</span>
            <span className="status-value">{history.length}</span>
          </div>
        </div>
      </div>

      {/* Modal de Reporte de Problemas */}
      <ReportIssueModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
};

export default Dashboard; 