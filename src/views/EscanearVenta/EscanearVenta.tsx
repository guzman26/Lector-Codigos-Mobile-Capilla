import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getSaleById,
  addBoxToSale,
  addPalletToSale,
  removeBoxFromSale,
  removePalletFromSale,
  getInfoFromScannedCode,
} from '@/api/endpoints';
import { translateError } from '@/utils/errorMessages';
import './EscanearVenta.css';

interface ScannedItem {
  code: string;
  type: 'box' | 'pallet';
  calibre?: string;
  eggs?: number;
  timestamp: string;
}

const EscanearVenta: React.FC = () => {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();
  const [sale, setSale] = useState<any>(null);
  const [scanInput, setScanInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (saleId) {
      loadSale();
    }
  }, [saleId]);

  useEffect(() => {
    // Auto-focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const loadSale = async () => {
    if (!saleId) return;
    try {
      setLoading(true);
      setError(null);
      const saleData = await getSaleById(saleId);
      setSale(saleData);
      
      // Load existing scanned items
      if (saleData.boxes || saleData.pallets) {
        const items: ScannedItem[] = [];
        if (saleData.boxes) {
          for (const boxCode of saleData.boxes) {
            try {
              const info = await getInfoFromScannedCode({ codigo: boxCode });
              if (info.data) {
                items.push({
                  code: boxCode,
                  type: 'box',
                  calibre: info.data.calibre,
                  eggs: info.data.eggs,
                  timestamp: new Date().toISOString(),
                });
              }
            } catch (err) {
              // Skip if can't load
            }
          }
        }
        if (saleData.pallets) {
          for (const palletCode of saleData.pallets) {
            items.push({
              code: palletCode,
              type: 'pallet',
              timestamp: new Date().toISOString(),
            });
          }
        }
        setScannedItems(items);
      }
    } catch (err) {
      console.error('Error loading sale:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar la venta');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (code: string) => {
    if (!code || !saleId) return;

    const trimmedCode = code.trim();
    if (trimmedCode.length === 0) return;

    try {
      setScanning(true);
      setError(null);
      setSuccess(null);

      // Determine if it's a box (16 digits) or pallet (13-14 digits)
      const isBox = trimmedCode.length === 16;
      const isPallet = trimmedCode.length === 13 || trimmedCode.length === 14;

      if (!isBox && !isPallet) {
        throw new Error('Código inválido. Debe ser una caja (16 dígitos) o pallet (13-14 dígitos)');
      }

      // Get info from scanned code
      const info = await getInfoFromScannedCode({ codigo: trimmedCode });
      
      if (!info.success || !info.data) {
        throw new Error('No se pudo obtener información del código escaneado');
      }

      // Add to sale
      if (isBox) {
        await addBoxToSale({ saleId, boxCode: trimmedCode });
        setScannedItems((prev) => [
          ...prev,
          {
            code: trimmedCode,
            type: 'box',
            calibre: info.data.calibre,
            eggs: info.data.eggs,
            timestamp: new Date().toISOString(),
          },
        ]);
        setSuccess(`Caja ${trimmedCode} agregada exitosamente`);
      } else if (isPallet) {
        await addPalletToSale({ saleId, palletCode: trimmedCode });
        setScannedItems((prev) => [
          ...prev,
          {
            code: trimmedCode,
            type: 'pallet',
            timestamp: new Date().toISOString(),
          },
        ]);
        setSuccess(`Pallet ${trimmedCode} agregado exitosamente`);
      }

      // Reload sale to get updated data
      await loadSale();
      
      // Clear input
      setScanInput('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      console.error('Error scanning:', err);
      const { message, suggestion } = translateError(err, 'dispatch');
      setError(suggestion ? `${message}. ${suggestion}` : message);
    } finally {
      setScanning(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScanInput(e.target.value);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && scanInput.trim()) {
      handleScan(scanInput);
    }
  };

  const handleRemoveItem = async (item: ScannedItem) => {
    if (!saleId) return;
    try {
      setError(null);
      if (item.type === 'box') {
        await removeBoxFromSale({ saleId, boxCode: item.code });
      } else {
        await removePalletFromSale({ saleId, palletCode: item.code });
      }
      setScannedItems((prev) => prev.filter((i) => i.code !== item.code));
      await loadSale();
      setSuccess('Item removido exitosamente');
    } catch (err) {
      const { message, suggestion } = translateError(err, 'dispatch');
      setError(suggestion ? `${message}. ${suggestion}` : message);
    }
  };

  const getProgressPercentage = (): number => {
    const requested = sale?.metadata?.totalRequestedBoxes || 0;
    const current = sale?.totalBoxes || 0;
    if (requested === 0) return 0;
    return Math.round((current / requested) * 100);
  };

  const isComplete = (): boolean => {
    const requested = sale?.metadata?.totalRequestedBoxes || 0;
    const current = sale?.totalBoxes || 0;
    return requested > 0 && current >= requested;
  };

  if (loading) {
    return (
      <div className="escanear-venta-container">
        <div className="header">
          <button onClick={() => navigate('/despachar-venta')} className="back-button">
            ← Volver
          </button>
          <h1>Escanear Venta</h1>
        </div>
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <div>Cargando venta...</div>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="escanear-venta-container">
        <div className="error-message">Venta no encontrada</div>
        <button onClick={() => navigate('/despachar-venta')} className="back-button">
          Volver
        </button>
      </div>
    );
  }

  const progress = getProgressPercentage();
  const complete = isComplete();

  return (
    <div className="escanear-venta-container">
      <div className="header">
        <button onClick={() => navigate('/despachar-venta')} className="back-button">
          ← Volver
        </button>
        <h1>Escanear Venta</h1>
      </div>

      <div className="sale-info-card">
        <div className="sale-card-header">
          <div className="sale-number">{sale.saleNumber || sale.saleId.substring(0, 8)}</div>
          {complete && (
            <span className="status-badge complete-badge">
              ✓ Completa
            </span>
          )}
        </div>
        <div className="sale-customer">{sale.customerName || 'Cliente sin nombre'}</div>
        
        <div className="progress-section">
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

        {sale.totalEggs !== undefined && sale.totalEggs > 0 && (
          <div className="total-eggs">
            <span className="eggs-icon">🥚</span>
            <span className="eggs-text">
              {sale.totalEggs.toLocaleString()} huevos
            </span>
          </div>
        )}

        {sale.metadata?.requestedBoxesByCalibre && (
          <div className="calibre-breakdown">
            <div className="calibre-breakdown-title">Por Calibre:</div>
            <div className="calibre-grid">
              {sale.metadata.requestedBoxesByCalibre.map((req: any) => {
                const current = sale.metadata?.boxesByCalibre?.[req.calibre] || 0;
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
      </div>

      <div className="scan-section">
        <div className="scan-section-header">
          <h3 className="scan-title">Escanear Código</h3>
          {scanning && (
            <div className="scanning-indicator">
              <span className="scanning-dot"></span>
              <span className="scanning-text">Procesando...</span>
            </div>
          )}
        </div>
        <div className="scan-input-container">
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={scanInput}
              onChange={handleInputChange}
              onKeyPress={handleInputKeyPress}
              placeholder="Escanear código de caja o pallet..."
              className={`scan-input ${scanning ? 'scanning' : ''} ${complete ? 'complete' : ''}`}
              disabled={scanning || complete}
              autoFocus
              autoComplete="off"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Campo de escaneo de código"
            />
            {scanInput.length > 0 && !scanning && (
              <div className="input-length-indicator">
                {scanInput.length} dígitos
              </div>
            )}
          </div>
          <button
            onClick={() => handleScan(scanInput)}
            disabled={!scanInput.trim() || scanning || complete}
            className="scan-button"
            aria-label={scanning ? 'Escaneando código' : 'Agregar código escaneado'}
          >
            {scanning ? (
              <>
                <span className="button-icon spinning">⏳</span>
                <span>Escaneando...</span>
              </>
            ) : (
              <>
                <span className="button-icon">✓</span>
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {success && (
          <div className="success-message">{success}</div>
        )}

        {complete && (
          <div className="complete-message">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓</div>
            <div>Venta completa. Todas las cajas han sido escaneadas.</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.9 }}>
              Puedes confirmar la venta desde el sistema administrativo
            </div>
          </div>
        )}
      </div>

      <div className="scanned-items-section">
        <div className="section-header">
          <h2>Items Escaneados</h2>
          <div className="items-counter">
            <span className="counter-number">{scannedItems.length}</span>
            <span className="counter-label">items</span>
          </div>
        </div>
        {scannedItems.length === 0 ? (
          <div className="no-items">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No hay items escaneados aún</div>
            <div className="empty-subtitle">
              Escanea cajas o pallets para agregarlos a la venta
            </div>
          </div>
        ) : (
          <div className="items-list">
            {scannedItems.map((item, index) => (
              <div 
                key={item.code} 
                className="scanned-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="item-info">
                  <div className="item-header-row">
                    <div className="item-code">{item.code}</div>
                    <span className={`item-type-badge ${item.type}`}>
                      {item.type === 'box' ? 'Caja' : 'Pallet'}
                    </span>
                  </div>
                  <div className="item-details">
                    {item.calibre && (
                      <div className="item-detail">
                        <span className="detail-label">Calibre:</span>
                        <span className="detail-value">{item.calibre}</span>
                      </div>
                    )}
                    {item.eggs && (
                      <div className="item-detail">
                        <span className="detail-label">Huevos:</span>
                        <span className="detail-value">{item.eggs.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="remove-button"
                  disabled={complete}
                  aria-label={`Remover ${item.type} ${item.code}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EscanearVenta;

