import React, { useState, useEffect, useRef } from 'react';
import { ScannedCodeInfo } from '../../../api/types';
import { validateScannedCode } from '../../../utils/validators';
import './ConsultarCodigo.css';
import { useNavigate } from 'react-router-dom';
import { useScannedCodeContext } from '../../../context/ScannedCodeContext';
import { Button } from '../../../components/ui';

interface ConsultaResult extends ScannedCodeInfo {
  timestamp: string;
}

const ConsultarCodigo: React.FC = () => {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConsultaResult | null>(null);
  const [recentSearches, setRecentSearches] = useState<ConsultaResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { getCodeInfo, data } = useScannedCodeContext();
  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('consultar-codigo-history');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.warn('Error loading search history:', e);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveToHistory = (searchResult: ConsultaResult) => {
    const updated = [searchResult, ...recentSearches.filter(r => r.codigo !== searchResult.codigo)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('consultar-codigo-history', JSON.stringify(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigo.trim()) {
      setError('Por favor ingresa un código');
      return;
    }

    // Client-side validation
    const validation = validateScannedCode(codigo);
    if (!validation.isValid) {
      setError(validation.errorMessage || 'Código inválido');
      return;
    }

    setLoading(true);
    setError(null);
    console.log('🔍 Consultando código:', codigo.trim());
    try {
      await getCodeInfo(codigo.trim());
      if (data) {
        const resultWithTimestamp: ConsultaResult = {
          ...data,
          timestamp: new Date().toISOString()
        };
        setResult(resultWithTimestamp);
        saveToHistory(resultWithTimestamp);
      } else {
        setError('No se encontró información para este código');
      }
      setCodigo(''); // Clear input after successful search
    } catch (err: any) {
      console.error('Error consultando código:', err);
      setError(err.message || 'Error al consultar el código');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (searchResult: ConsultaResult) => {
    setResult(searchResult);
    setError(null);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMinutes < 1) {
        return 'hace unos segundos';
      } else if (diffInMinutes < 60) {
        return `hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
      } else if (diffInHours < 24) {
        return `hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
      } else if (diffInDays < 30) {
        return `hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
      } else {
        return date.toLocaleDateString('es-ES');
      }
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const getTypeClass = (tipo: string) => {
    return tipo === 'caja' ? 'type-box' : 'type-pallet';
  };

  const getStatusClass = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo':
        return 'status-active';
      case 'inactivo':
        return 'status-inactive';
      case 'bloqueado':
        return 'status-blocked';
      default:
        return 'status-unknown';
    }
  };

  const renderActionButtons = (item: ConsultaResult) => {
    if (item.tipo === 'caja') {
      return (
        <div className="action-buttons">
          <Button className="btn-action btn-move">
            📦 Mover Caja
          </Button>
          <Button className="btn-action btn-details">
            ℹ️ Ver Detalles
          </Button>
        </div>
      );
    } else {
      return (
        <div className="action-buttons">
          <Button className="btn-action btn-move">
            🚛 Mover Pallet
          </Button>
          <Button className="btn-action btn-contents">
            📋 Ver Contenido
          </Button>
          <Button className="btn-action btn-details">
            ℹ️ Ver Detalles
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="consultar-codigo">
      <div className="header">
        <Button onClick={handleBack} className="back-btn">
          ← Volver
        </Button>
        <h2>🔍 Consultar Código</h2>
        <p>Ingresa un código para consultar su información</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-group">
          <input
            ref={inputRef}
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escanea o ingresa el código (12 o 15 dígitos)"
            className="code-input"
            disabled={loading}
            autoFocus
          />
          <Button
            type="submit"
            className="search-button"
            disabled={loading || !codigo.trim()}
          >
            {loading ? '🔄' : '🔍'}
          </Button>
        </div>
        
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}
      </form>

      {/* Search Result */}
      {result && (
        <div className="result-container">
          <div className="result-header">
            <h3>📋 Información del Código</h3>
            <small>Consultado {formatDate(result.timestamp)}</small>
          </div>

          <div className="result-content">
            {/* Code Display */}
            <div className="code-display">
              <div className="code-value">{result.codigo}</div>
              <div className="code-badges">
                <span className={`badge ${getTypeClass(result.tipo)}`}>
                  {result.tipo === 'caja' ? '📦 Caja' : '🚛 Pallet'}
                </span>
                <span className={`badge ${getStatusClass(result.estado)}`}>
                  {result.estado}
                </span>
              </div>
            </div>

            {/* Product Information */}
            {result.producto && (
              <div className="info-section">
                <h4>📋 Información del Producto</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>ID:</label>
                    <span>{result.producto.id}</span>
                  </div>
                  <div className="info-item">
                    <label>Nombre:</label>
                    <span>{result.producto.nombre}</span>
                  </div>
                  <div className="info-item full-width">
                    <label>Descripción:</label>
                    <span>{result.producto.descripcion}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Location Information */}
            {result.ubicacion && (
              <div className="info-section">
                <h4>📍 Ubicación</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Almacén:</label>
                    <span>{result.ubicacion.almacen}</span>
                  </div>
                  <div className="info-item">
                    <label>Zona:</label>
                    <span>{result.ubicacion.zona}</span>
                  </div>
                  <div className="info-item">
                    <label>Posición:</label>
                    <span>{result.ubicacion.posicion}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tracking Information */}
            <div className="info-section">
              <h4>📅 Seguimiento</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Creado:</label>
                  <span>{formatDate(result.fechaCreacion)}</span>
                </div>
                <div className="info-item">
                  <label>Actualizado:</label>
                  <span>{formatDate(result.ultimaActualizacion)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {renderActionButtons(result)}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="recent-searches">
          <h3>📝 Búsquedas Recientes</h3>
          <div className="recent-list">
            {recentSearches.map((item, index) => (
              <div 
                key={`${item.codigo}-${index}`}
                className="recent-item"
                onClick={() => handleQuickSearch(item)}
              >
                <div className="recent-code">
                  <span className="code">{item.codigo}</span>
                  <span className={`badge ${getTypeClass(item.tipo)}`}>
                    {item.tipo === 'caja' ? '📦' : '🚛'}
                  </span>
                </div>
                <div className="recent-info">
                  <div className="product-name">{item.producto?.nombre || 'Producto sin nombre'}</div>
                  <div className="search-time">{formatDate(item.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultarCodigo;
