import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScanContext } from '../../../context/ScanContext';
import { validateScannedCode } from '../../../utils/validators';
import './RecibirCaja.css';

const RegistrarCaja: React.FC = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [scanBoxMode, setScanBoxMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, loading, error, processScan, reset } = useScanContext();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Prevenir llamadas duplicadas
    if (isProcessing || loading || !codigo.trim()) {
      return;
    }

    const validation = validateScannedCode(codigo);
    if (!validation.isValid) {
      return;
    }

    const codigoToProcess = codigo.trim();
    setIsProcessing(true);
    try {
      // Procesar directamente tanto cajas como pallets
      await processScan({
        codigo: codigoToProcess,
        ubicacion: 'BODEGA'
      });
      
      // Limpiar el input inmediatamente después de un escaneo exitoso
      setCodigo('');
      
      // Re-enfocar automáticamente después de limpiar
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevenir el submit del formulario
      handleSubmit();
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const toggleScanBoxMode = () => {
    setScanBoxMode(prev => !prev);
  };


  // Mantener foco automático en el input siempre
  useEffect(() => {
    // Enfocar al cargar el componente
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Re-enfocar después de limpiar el código o cambiar el modo scanner
  useEffect(() => {
    if (inputRef.current && !loading) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [codigo, scanBoxMode, loading]);

  // El input ya se limpia en handleSubmit después de un escaneo exitoso
  // Este useEffect solo mantiene el foco en modo scanner cuando cambia el código

  const validation = validateScannedCode(codigo);
  const showValidationError = codigo.length > 0 && !validation.isValid;
  const showTypeError = codigo.length > 0 && validation.isValid && validation.type !== 'box' && validation.type !== 'pallet';

  // Debug: Log para verificar los datos recibidos
  useEffect(() => {
    if (data) {
      console.log('📦 Datos recibidos en RecibirCaja:', data);
      console.log('✅ Tipo:', data.tipo);
      console.log('📋 Código:', data.codigo);
      console.log('📍 Ubicación:', data.ubicacion);
      if (data.boxesMoved) {
        console.log('📦 Cajas movidas:', data.boxesMoved);
      }
    }
  }, [data]);

  return (
    <div className="registrar-caja-content">
      <div className="registrar-caja-header">
        <button onClick={handleBack} className="back-btn">
          ← Volver
        </button>
        <h1>Recibir Pallets o Cajas</h1>
        <p>Escanea o ingresa el código de caja o pallet para recepción en BODEGA</p>
        
        {/* Toggle Scanner Mode */}
        <div className="scanner-mode-toggle">
          <button 
            onClick={toggleScanBoxMode}
            className={`toggle-btn ${scanBoxMode ? 'active' : ''}`}
            disabled={loading}
          >
            <span className="toggle-icon">
              {scanBoxMode ? '📱' : '⚡'}
            </span>
            <span className="toggle-text">
              {scanBoxMode ? 'Modo Scanner: ON' : 'Modo Scanner: OFF'}
            </span>
          </button>
          {scanBoxMode && (
            <p className="scanner-mode-info">
              🔍 Modo scanner activo - El campo permanecerá enfocado para escaneo consecutivo
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="error-section">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
            <button onClick={reset} className="error-close">✕</button>
          </div>
        </div>
      )}

      {/* Notificación de éxito en la parte inferior */}
      {data && data.codigo && (
        <div className="success-notification">
          <div className="success-notification-content">
            <span className="success-notification-icon">✅</span>
            <div className="success-notification-text">
              <strong>¡Éxito!</strong> {data.tipo === 'PALLET' ? 'Pallet' : 'Caja'} {data.codigo} recepcionado en {data.ubicacion}
              {data.boxesMoved && data.boxesMoved > 0 && ` (${data.boxesMoved} cajas)`}
            </div>
            <button 
              className="success-notification-close"
              onClick={() => reset()}
              aria-label="Cerrar notificación"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="scan-form">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="codigo" className="form-label">
              Código de Caja o Pallet
            </label>
            <input
              ref={inputRef}
              type="text"
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={() => {
                // Volver a enfocar automáticamente después de perder el foco
                setTimeout(() => {
                  if (inputRef.current && !loading) {
                    inputRef.current.focus();
                  }
                }, 100);
              }}
              placeholder={scanBoxMode ? "Escanea códigos consecutivamente..." : "Escanea código de caja (15 dig.) o pallet (14 dig.)"}
              className={`form-input code-input ${showValidationError || showTypeError ? 'error' : ''} ${scanBoxMode ? 'scanner-mode' : ''}`}
              disabled={loading}
              autoFocus
              maxLength={15}
            />
            
            {showValidationError && (
              <span className="validation-error">
                {validation.errorMessage}
              </span>
            )}

            {showTypeError && (
              <span className="validation-error">
                Tipo de código no reconocido. Use códigos de caja (15 dígitos) o pallet (14 dígitos).
              </span>
            )}

            {codigo.length > 0 && validation.isValid && validation.type === 'box' && (
              <span className="validation-success">
                ✓ Código válido - Presiona Enter para procesar
              </span>
            )}

            {codigo.length > 0 && validation.isValid && validation.type === 'pallet' && (
              <span className="validation-success">
                ✓ Código de pallet válido - Presiona Enter para procesar
              </span>
            )}
          </div>

          <div className="info-box">
            <h4>Información</h4>
            <ul>
              <li>• Ubicación: <strong>BODEGA</strong> (automática)</li>
              <li>• Códigos de caja (15 dígitos): procesamiento directo</li>
              <li>• Códigos de pallet (14 dígitos): procesamiento directo</li>
              <li>• Presiona <kbd>Enter</kbd> para procesar</li>
              {scanBoxMode ? (
                <li>• <strong>Modo Scanner:</strong> Campo siempre enfocado para escaneo consecutivo</li>
              ) : (
                <li>• Activa el <strong>Modo Scanner</strong> para escaneo con dispositivo físico</li>
              )}
            </ul>
          </div>

          {/* Códigos de prueba para desarrollo */}
          <div className="test-codes">
            <p>Códigos de prueba:</p>
            <div className="test-buttons">
              <button
                type="button"
                onClick={() => setCodigo('123456789012345')}
                className="test-btn"
                disabled={loading}
              >
                Caja: 123456789012345
              </button>
              <button
                type="button"
                onClick={() => setCodigo('987654321098765')}
                className="test-btn"
                disabled={loading}
              >
                Caja: 987654321098765
              </button>
              <button
                type="button"
                onClick={() => setCodigo('12345678901234')}
                className="test-btn"
                disabled={loading}
              >
                Pallet: 12345678901234
              </button>
            </div>
          </div>
        </div>
      </form>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Procesando...</p>
        </div>
      )}

    </div>
  );
};

export default RegistrarCaja; 