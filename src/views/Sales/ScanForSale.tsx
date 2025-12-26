import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validateScannedCode, formatCodeForDisplay } from '../../api';
import { submitAddBoxesToSale, type AddBoxesToSaleResponse } from '../../api';
import './ScanForSale.css';

interface ScannedItem {
  code: string;
  type: 'box' | 'pallet';
  timestamp: string;
  success: boolean;
}

const ScanForSale: React.FC = () => {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [saleInfo, setSaleInfo] = useState<AddBoxesToSaleResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo.trim()) {
      setError('Por favor ingresa un código');
      return;
    }

    if (!saleId) {
      setError('ID de venta no válido');
      return;
    }

    // Client-side validation
    const validation = validateScannedCode(codigo);
    if (!validation.isValid) {
      setError(validation.errorMessage || 'Código inválido');
      return;
    }

    // Check if already scanned in this session
    if (scannedItems.some((item) => item.code === codigo.trim())) {
      setError('Este código ya fue escaneado en esta sesión');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const request = {
        saleId,
        ...(validation.type === 'box'
          ? { boxCode: codigo.trim() }
          : { palletCode: codigo.trim() }),
      };

      const response = await submitAddBoxesToSale(request);
      setSaleInfo(response);

      // Add to scanned items
      const newItem: ScannedItem = {
        code: codigo.trim(),
        type: validation.type || 'box',
        timestamp: new Date().toISOString(),
        success: true,
      };
      setScannedItems([...scannedItems, newItem]);

      setSuccess(
        `${validation.type === 'box' ? 'Caja' : 'Pallet'} agregado exitosamente`
      );
      setCodigo('');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

      // Refocus input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err: any) {
      console.error('Error adding to sale:', err);
      setError(err.message || 'Error al agregar el item a la venta');

      // Add failed item to list
      const newItem: ScannedItem = {
        code: codigo.trim(),
        type: validation.type || 'box',
        timestamp: new Date().toISOString(),
        success: false,
      };
      setScannedItems([...scannedItems, newItem]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/sales/select');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInSeconds = Math.floor(diffInMs / 1000);

      if (diffInSeconds < 60) {
        return 'hace unos segundos';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
      } else {
        return date.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="scan-for-sale">
      <div className="header">
        <button onClick={handleBack} className="back-btn">
          ← Volver
        </button>
        <h2>📦 Agregar a Venta</h2>
        <p>Escanea códigos de cajas o pallets para agregarlos</p>
        {saleId && (
          <div className="sale-id-display">Venta: {saleId.slice(0, 8)}...</div>
        )}
      </div>

      {/* Scan Form */}
      <form onSubmit={handleSubmit} className="scan-form">
        <div className="input-group">
          <input
            ref={inputRef}
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Escanea o ingresa el código (14 o 15 dígitos)"
            className="code-input"
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="scan-button"
            disabled={loading || !codigo.trim()}
          >
            {loading ? '🔄' : '✓'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            ✅ {success}
          </div>
        )}
      </form>

      {/* Sale Progress */}
      {saleInfo && (
        <div className="sale-progress">
          <h3>Progreso de la Venta</h3>
          <div className="progress-stats">
            <div className="stat-item">
              <span className="stat-label">Cajas Totales:</span>
              <span className="stat-value">
                {saleInfo.sale.totalBoxCount || saleInfo.sale.totalBoxes || 0}
              </span>
            </div>
            {saleInfo.sale.totalEggs && (
              <div className="stat-item">
                <span className="stat-label">Huevos Totales:</span>
                <span className="stat-value">{saleInfo.sale.totalEggs}</span>
              </div>
            )}
            {saleInfo.isComplete && (
              <div className="complete-badge">✓ Completa</div>
            )}
          </div>

          {Object.keys(saleInfo.boxesByCalibre).length > 0 && (
            <div className="calibre-breakdown">
              <h4>Cajas por Calibre:</h4>
              <div className="calibre-list">
                {Object.entries(saleInfo.boxesByCalibre).map(([calibre, count]) => (
                  <div key={calibre} className="calibre-item">
                    <span className="calibre-label">Calibre {calibre}:</span>
                    <span className="calibre-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(saleInfo.remainingBoxes).length > 0 && (
            <div className="remaining-boxes">
              <h4>Faltan:</h4>
              <div className="remaining-list">
                {Object.entries(saleInfo.remainingBoxes).map(([calibre, count]) => (
                  <div key={calibre} className="remaining-item">
                    <span className="remaining-label">Calibre {calibre}:</span>
                    <span className="remaining-count">{count} cajas</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scanned Items List */}
      {scannedItems.length > 0 && (
        <div className="scanned-items">
          <h3>Items Escaneados ({scannedItems.length})</h3>
          <div className="items-list">
            {scannedItems.map((item, index) => (
              <div
                key={`${item.code}-${index}`}
                className={`item-card ${item.success ? 'success' : 'error'}`}
              >
                <div className="item-header">
                  <div className="item-code">
                    {formatCodeForDisplay(item.code)}
                  </div>
                  <div className="item-type">
                    {item.type === 'box' ? '📦 Caja' : '🚛 Pallet'}
                  </div>
                </div>
                <div className="item-footer">
                  <div className="item-status">
                    {item.success ? '✅ Agregado' : '❌ Error'}
                  </div>
                  <div className="item-time">{formatDate(item.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanForSale;









