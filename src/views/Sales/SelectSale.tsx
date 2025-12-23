import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDraftSales, type SalesOrder } from '../../api';
import './SelectSale.css';

const SelectSale: React.FC = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDraftSales();
  }, []);

  const loadDraftSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDraftSales();
      if (response.success && response.data) {
        setSales(response.data.sales || []);
      } else {
        setError(response.error || 'No se pudieron cargar las ventas');
      }
    } catch (err: any) {
      console.error('Error loading draft sales:', err);
      setError(err.message || 'Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSale = (saleId: string) => {
    navigate(`/sales/scan/${saleId}`);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const filteredSales = sales.filter((sale) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      sale.saleId.toLowerCase().includes(term) ||
      sale.customerInfo.name.toLowerCase().includes(term) ||
      sale.customerInfo.email?.toLowerCase().includes(term) ||
      sale.customerInfo.phone?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="select-sale">
      <div className="header">
        <button onClick={handleBack} className="back-btn">
          ← Volver
        </button>
        <h2>📋 Seleccionar Venta</h2>
        <p>Selecciona una venta en borrador para agregar items</p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por ID, cliente, email o teléfono..."
          className="search-input"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner">🔄</div>
          <p>Cargando ventas...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="error-container">
          <div className="error-message">⚠️ {error}</div>
          <button onClick={loadDraftSales} className="retry-btn">
            Reintentar
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredSales.length === 0 && (
        <div className="empty-container">
          <div className="empty-icon">📭</div>
          <p>
            {searchTerm
              ? 'No se encontraron ventas que coincidan con la búsqueda'
              : 'No hay ventas en borrador disponibles'}
          </p>
          {!searchTerm && (
            <button onClick={loadDraftSales} className="refresh-btn">
              Actualizar
            </button>
          )}
        </div>
      )}

      {/* Sales List */}
      {!loading && !error && filteredSales.length > 0 && (
        <div className="sales-list">
          {filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="sale-card"
              onClick={() => handleSelectSale(sale.id)}
            >
              <div className="sale-header">
                <div className="sale-id">Venta: {sale.saleId.slice(0, 8)}...</div>
                <span className="state-badge draft">DRAFT</span>
              </div>

              <div className="sale-customer">
                <div className="customer-name">
                  👤 {sale.customerInfo.name}
                </div>
                {sale.customerInfo.email && (
                  <div className="customer-email">📧 {sale.customerInfo.email}</div>
                )}
                {sale.customerInfo.phone && (
                  <div className="customer-phone">📞 {sale.customerInfo.phone}</div>
                )}
              </div>

              <div className="sale-stats">
                <div className="stat-item">
                  <span className="stat-label">Cajas:</span>
                  <span className="stat-value">
                    {sale.totalBoxCount || sale.totalBoxes || 0}
                  </span>
                </div>
                {sale.totalEggs && (
                  <div className="stat-item">
                    <span className="stat-label">Huevos:</span>
                    <span className="stat-value">{sale.totalEggs}</span>
                  </div>
                )}
              </div>

              <div className="sale-footer">
                <div className="sale-date">
                  Creada: {formatDate(sale.createdAt)}
                </div>
                <div className="select-arrow">→</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectSale;









