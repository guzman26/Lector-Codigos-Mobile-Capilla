import React, { useState } from 'react';
import { useScannedCodeContext } from '../context/ScannedCodeContext';
import { formatCodeForDisplay } from '../api';
import { Button } from '../components/ui';
import './Historial.css';

const Historial: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'caja' | 'pallet'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'activo' | 'inactivo' | 'bloqueado'>('all');
  
  const { data: currentScan, history, loading, clearHistory, getCodeInfo } = useScannedCodeContext();

  // Filtrar historial
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
  };

  return (
    <div className="historial-content">
      {/* Header */}
      <div className="historial-header">
        <h1 className="historial-title">Historial de Escaneos</h1>
        <p className="historial-subtitle">
          {history.length} código{history.length !== 1 ? 's' : ''} escaneado{history.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Current Scan Banner */}
      {currentScan && (
        <div className="current-scan-banner">
          <div className="current-scan-icon">📱</div>
          <div className="current-scan-info">
            <span className="current-scan-label">Último escaneo:</span>
            <span className="current-scan-code">{formatCodeForDisplay(currentScan.codigo)}</span>
            <span className={`current-scan-type ${currentScan.tipo}`}>
              {currentScan.tipo === 'caja' ? 'Caja' : 'Pallet'}
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-group">
          <input
            type="text"
            placeholder="Buscar por código, producto o almacén..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">Todos los tipos</option>
            <option value="caja">Solo Cajas</option>
            <option value="pallet">Solo Pallets</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
            <option value="bloqueado">Bloqueados</option>
          </select>
        </div>

        {history.length > 0 && (
          <Button
            onClick={clearHistory}
            className="clear-history-btn"
          >
            Limpiar Historial
          </Button>
        )}
      </div>

      {/* Results Count */}
      {searchTerm || filterType !== 'all' || filterStatus !== 'all' ? (
        <div className="results-info">
          {filteredHistory.length} de {history.length} resultados
          {filteredHistory.length !== history.length && (
            <Button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterStatus('all');
              }}
              className="clear-filters-btn"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : null}

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="empty-state">
          {history.length === 0 ? (
            <>
              <div className="empty-icon">📋</div>
              <h3>No hay códigos escaneados</h3>
              <p>Los códigos que escanees aparecerán aquí automáticamente</p>
            </>
          ) : (
            <>
              <div className="empty-icon">🔍</div>
              <h3>No se encontraron resultados</h3>
              <p>Prueba con otros filtros o términos de búsqueda</p>
            </>
          )}
        </div>
      ) : (
        <div className="history-grid">
          {filteredHistory.map((item, index) => (
            <div key={`${item.codigo}-${index}`} className="history-card">
              <div className="card-header">
                <div className="card-code">
                  <span className="code-text">{formatCodeForDisplay(item.codigo)}</span>
                  <span className={`code-type-badge ${item.tipo}`}>
                    {item.tipo === 'caja' ? 'Caja' : 'Pallet'}
                  </span>
                </div>
                <span className={`status-indicator ${item.estado}`}>
                  {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
                </span>
              </div>

              <div className="card-body">
                {item.producto && (
                  <div className="card-field">
                    <span className="field-label">Producto:</span>
                    <span className="field-value">{item.producto.nombre}</span>
                  </div>
                )}

                {item.ubicacion && (
                  <div className="card-field">
                    <span className="field-label">Ubicación:</span>
                    <span className="field-value">
                      {item.ubicacion.almacen} - {item.ubicacion.zona}
                      {item.ubicacion.posicion && ` (${item.ubicacion.posicion})`}
                    </span>
                  </div>
                )}

                <div className="card-field">
                  <span className="field-label">Escaneado:</span>
                  <span className="field-value time-value">
                    {getTimeAgo(item.ultimaActualizacion)}
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <Button
                  onClick={() => handleRescan(item.codigo)}
                  disabled={loading}
                  className="rescan-btn"
                >
                  {loading ? '⏳' : '🔄'} Re-escanear
                </Button>
                
                <span className="scan-date">
                  {new Date(item.fechaCreacion).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {history.length > 0 && (
        <div className="stats-footer">
          <div className="stat-item">
            <span className="stat-number">{history.filter(h => h.tipo === 'caja').length}</span>
            <span className="stat-label">Cajas</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{history.filter(h => h.tipo === 'pallet').length}</span>
            <span className="stat-label">Pallets</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{history.filter(h => h.estado === 'activo').length}</span>
            <span className="stat-label">Activos</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historial; 