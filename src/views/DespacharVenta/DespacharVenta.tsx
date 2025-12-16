import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConfirmedSales } from '@/api/endpoints';
import './DespacharVenta.css';

interface Sale {
  saleId: string;
  saleNumber?: string;
  customerName?: string;
  type?: string;
  totalBoxes?: number;
  totalEggs?: number;
  metadata?: {
    requestedBoxesByCalibre?: Array<{ calibre: string; boxCount: number }>;
    totalRequestedBoxes?: number;
    boxesByCalibre?: Record<string, number>;
  };
  createdAt: string;
}

const DespacharVenta: React.FC = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getConfirmedSales({
        pagination: { limit: 50 },
      });
      
      // Handle different response formats
      const salesList = response?.items || response?.sales || response || [];
      setSales(Array.isArray(salesList) ? salesList : []);
    } catch (err) {
      console.error('Error loading sales:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = (sale: Sale) => {
    navigate(`/escanear-venta/${sale.saleId}`);
  };

  const getProgressPercentage = (sale: Sale): number => {
    const requested = sale.metadata?.totalRequestedBoxes || 0;
    const current = sale.totalBoxes || 0;
    if (requested === 0) return 0;
    return Math.round((current / requested) * 100);
  };

  const isComplete = (sale: Sale): boolean => {
    const requested = sale.metadata?.totalRequestedBoxes || 0;
    const current = sale.totalBoxes || 0;
    return requested > 0 && current >= requested;
  };

  if (loading) {
    return (
      <div className="despachar-venta-container">
        <div className="header">
          <h1>Despachar Ventas</h1>
        </div>
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <div>Cargando ventas...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="despachar-venta-container">
        <div className="error-message">{error}</div>
        <button onClick={loadSales} className="retry-button">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="despachar-venta-container">
      <div className="header">
        <h1>Despachar Ventas</h1>
        <button onClick={loadSales} className="refresh-button">
          Actualizar
        </button>
      </div>

      {sales.length === 0 ? (
        <div className="no-sales-message">
          <div className="empty-icon">📦</div>
          <p className="empty-title">No hay ventas confirmadas para despachar</p>
          <p className="empty-subtitle">
            Las ventas aparecerán aquí una vez que sean confirmadas
          </p>
        </div>
      ) : (
        <div className="sales-list">
          {sales.map((sale) => {
            const progress = getProgressPercentage(sale);
            const complete = isComplete(sale);

            return (
              <div key={sale.saleId} className={`sale-card ${complete ? 'complete' : ''}`}>
                <div className="sale-header">
                  <div className="sale-header-left">
                    <div className="sale-number">
                      {sale.saleNumber || sale.saleId.substring(0, 8)}
                    </div>
                    {complete && (
                      <span className="status-badge complete-badge">
                        ✓ Completa
                      </span>
                    )}
                  </div>
                  <div className="sale-customer">
                    {sale.customerName || 'Cliente sin nombre'}
                  </div>
                </div>

                <div className="sale-progress">
                  <div className="progress-info">
                    <span className="progress-label">
                      {sale.totalBoxes || 0} / {sale.metadata?.totalRequestedBoxes || 0} cajas
                    </span>
                    <span className="progress-percentage">{progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>

                {sale.metadata?.requestedBoxesByCalibre && (
                  <div className="calibre-breakdown">
                    <div className="calibre-breakdown-title">Por Calibre:</div>
                    <div className="calibre-grid">
                      {sale.metadata.requestedBoxesByCalibre.map((req) => {
                        const current =
                          sale.metadata?.boxesByCalibre?.[req.calibre] || 0;
                        const calibreComplete = current >= req.boxCount;
                        return (
                          <div key={req.calibre} className={`calibre-chip ${calibreComplete ? 'complete' : ''}`}>
                            <span className="calibre-label">Calibre {req.calibre}</span>
                            <span className="calibre-count">
                              {current} / {req.boxCount}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {sale.totalEggs !== undefined && sale.totalEggs > 0 && (
                  <div className="sale-eggs">
                    <span className="eggs-icon">🥚</span>
                    <span className="eggs-text">
                      {sale.totalEggs.toLocaleString()} huevos
                    </span>
                  </div>
                )}

                <button
                  onClick={() => handleDispatch(sale)}
                  className="dispatch-button"
                  disabled={complete}
                  aria-label={complete ? 'Venta completa' : `Despachar venta ${sale.saleNumber || sale.saleId}`}
                >
                  {complete ? (
                    <>
                      <span className="button-icon">✓</span>
                      <span>Completa</span>
                    </>
                  ) : (
                    <>
                      <span className="button-icon">📦</span>
                      <span>Despachar</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DespacharVenta;

