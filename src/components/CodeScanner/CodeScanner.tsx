import React, { useState } from 'react';
import { useScannedCode, formatCodeForDisplay } from '../../api';
import './CodeScanner.css';

const CodeScanner: React.FC = () => {
  const [inputCode, setInputCode] = useState('');
  const { data, loading, error, getCodeInfo, reset } = useScannedCode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      await getCodeInfo(inputCode.trim());
    }
  };

  const handleReset = () => {
    setInputCode('');
    reset();
  };

  return (
    <div className="code-scanner">
      <div className="scanner-section">
        <h2 className="scanner-title">Escanear Código</h2>
        
        <form onSubmit={handleSubmit} className="scanner-form">
          <div className="input-group">
            <label htmlFor="code-input" className="input-label">
              Código (12 o 15 dígitos):
            </label>
            <input
              id="code-input"
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Ingrese el código escaneado"
              className="code-input"
              disabled={loading}
              maxLength={15}
            />
          </div>
          
          <div className="button-group">
            <button
              type="submit"
              disabled={loading || !inputCode.trim()}
              className="scan-btn primary"
            >
              {loading ? 'Procesando...' : 'Obtener Información'}
            </button>
            
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="scan-btn secondary"
            >
              Limpiar
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}
      </div>

      {data && (
        <div className="result-section">
          <h3 className="result-title">Información del Código</h3>
          
          <div className="result-card">
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
                <div className="detail-group">
                  <h4 className="detail-title">Producto</h4>
                  <p className="detail-text">
                    <strong>{data.producto.nombre}</strong>
                  </p>
                  {data.producto.descripcion && (
                    <p className="detail-description">
                      {data.producto.descripcion}
                    </p>
                  )}
                </div>
              )}

              {data.ubicacion && (
                <div className="detail-group">
                  <h4 className="detail-title">Ubicación</h4>
                  <p className="detail-text">
                    <strong>Almacén:</strong> {data.ubicacion.almacen}
                  </p>
                  <p className="detail-text">
                    <strong>Zona:</strong> {data.ubicacion.zona}
                  </p>
                  {data.ubicacion.posicion && (
                    <p className="detail-text">
                      <strong>Posición:</strong> {data.ubicacion.posicion}
                    </p>
                  )}
                </div>
              )}

              <div className="detail-group">
                <h4 className="detail-title">Estado</h4>
                <span className={`status-badge ${data.estado}`}>
                  {data.estado.charAt(0).toUpperCase() + data.estado.slice(1)}
                </span>
              </div>

              <div className="detail-group">
                <h4 className="detail-title">Fechas</h4>
                <p className="detail-text">
                  <strong>Creación:</strong> {new Date(data.fechaCreacion).toLocaleDateString()}
                </p>
                <p className="detail-text">
                  <strong>Última actualización:</strong> {new Date(data.ultimaActualizacion).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeScanner; 