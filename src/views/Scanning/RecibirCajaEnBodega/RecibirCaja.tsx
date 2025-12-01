import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScanContext } from '../../../context/ScanContext';
import { validateScannedCode } from '../../../utils/validators';
import { PalletConfirmationModal } from '../../../components/PalletConfirmationModal';
import ReportIssueModal from '../../../components/ReportIssueModal';
import { Button } from '../../../components/ui';
import './RecibirCaja.css';

const RegistrarCaja: React.FC = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [scanBoxMode, setScanBoxMode] = useState(false);
  const [showPalletModal, setShowPalletModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [pendingPalletCode, setPendingPalletCode] = useState('');
  const [reportReason, setReportReason] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, loading, error, errorInfo, processScan, reset } = useScanContext();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!codigo.trim()) {
      return;
    }

    const validation = validateScannedCode(codigo);
    if (!validation.isValid) {
      return;
    }

    // Si es un pallet, mostrar modal de confirmación
    if (validation.type === 'pallet') {
      setPendingPalletCode(codigo.trim());
      setShowPalletModal(true);
      return;
    }

    // Si es una caja, procesar directamente
    await processScan({
      codigo: codigo.trim(),
      ubicacion: 'BODEGA'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const toggleScanBoxMode = () => {
    setScanBoxMode(prev => !prev);
  };

  const handlePalletConfirm = async () => {
    // Procesar el pallet normalmente
    await processScan({
      codigo: pendingPalletCode,
      ubicacion: 'BODEGA'
    });
    
    // Limpiar estados
    setPendingPalletCode('');
    setShowPalletModal(false);
  };

  const handlePalletReportIssue = (reason?: string) => {
    setReportReason(reason || 'Problema operacional con pallet');
    setShowPalletModal(false);
    setShowReportModal(true);
  };

  const handleReportModalClose = () => {
    setShowReportModal(false);
    setReportReason('');
    setPendingPalletCode('');
    // Limpiar el código escaneado para permitir nuevo escaneo
    setCodigo('');
  };

  const handlePalletModalClose = () => {
    setShowPalletModal(false);
    setPendingPalletCode('');
    // Limpiar el código escaneado para permitir nuevo escaneo
    setCodigo('');
  };

  // Mantener foco en input cuando está en modo scanner
  useEffect(() => {
    if (scanBoxMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [scanBoxMode, codigo]);

  // Limpiar código después de un escaneo exitoso
  useEffect(() => {
    if (data && data.success) {
      const timer = setTimeout(() => {
        setCodigo('');
        // Mantener foco si está en modo scanner
        if (scanBoxMode && inputRef.current) {
          inputRef.current.focus();
        }
      }, 1000); // Reducido a 1 segundo para mejor flujo
      return () => clearTimeout(timer);
    }
  }, [data, scanBoxMode]);

  const validation = validateScannedCode(codigo);
  const showValidationError = codigo.length > 0 && !validation.isValid;
  const showTypeError = codigo.length > 0 && validation.isValid && validation.type !== 'box' && validation.type !== 'pallet';

  return (
    <div className="registrar-caja-content">
      <div className="registrar-caja-header">
        <Button onClick={handleBack} className="back-btn">
          ← Volver
        </Button>
        <h1>Recibir Pallets o Cajas</h1>
        <p>Escanea o ingresa el código de caja o pallet para recepción en BODEGA</p>
        
        {/* Toggle Scanner Mode */}
        <div className="scanner-mode-toggle">
          <Button
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
          </Button>
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
            <div className="error-content">
              <span className="error-text">{error}</span>
              {errorInfo?.suggestion && (
                <p className="error-suggestion">💡 {errorInfo.suggestion}</p>
              )}
            </div>
            <Button onClick={reset} className="error-close">✕</Button>
          </div>
        </div>
      )}

      {/* Resultado exitoso */}
      {data && data.success && (
        <div className="success-section">
          <div className="success-message">
            <span className="success-icon">✅</span>
            <div className="success-content">
              <h3>¡Caja procesada exitosamente!</h3>
              <div className="success-details">
                <p><strong>Código:</strong> {data.data?.codigo}</p>
                <p><strong>Ubicación:</strong> {data.data?.ubicacion}</p>
                <p><strong>Estado:</strong> {data.data?.estado}</p>
              </div>
              <p className="success-note">Puede escanear otra caja</p>
            </div>
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
                // Si está en modo scanner, volver a enfocar después de un breve delay
                if (scanBoxMode) {
                  setTimeout(() => {
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }, 100);
                }
              }}
              placeholder={scanBoxMode ? "Escanea códigos consecutivamente..." : "Escanea código de caja (15 dig.) o pallet (12 dig.)"}
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
                Tipo de código no reconocido. Use códigos de caja (15 dígitos) o pallet (12 dígitos).
              </span>
            )}

            {codigo.length > 0 && validation.isValid && validation.type === 'box' && (
              <span className="validation-success">
                ✓ Código válido - Presiona Enter para procesar
              </span>
            )}

            {codigo.length > 0 && validation.isValid && validation.type === 'pallet' && (
              <span className="validation-success">
                ✓ Código de pallet válido - Presiona Enter para confirmar recepción
              </span>
            )}
          </div>

          <div className="info-box">
            <h4>Información</h4>
            <ul>
              <li>• Ubicación: <strong>BODEGA</strong> (automática)</li>
              <li>• Códigos de caja (15 dígitos): procesamiento directo</li>
              <li>• Códigos de pallet (12 dígitos): requieren confirmación</li>
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
              <Button
                type="button"
                onClick={() => setCodigo('123456789012345')}
                className="test-btn"
                disabled={loading}
              >
                Caja: 123456789012345
              </Button>
              <Button
                type="button"
                onClick={() => setCodigo('987654321098765')}
                className="test-btn"
                disabled={loading}
              >
                Caja: 987654321098765
              </Button>
              <Button
                type="button"
                onClick={() => setCodigo('123456789012')}
                className="test-btn"
                disabled={loading}
              >
                Pallet: 123456789012
              </Button>
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

      {/* Modal de confirmación de pallet */}
      <PalletConfirmationModal
        isOpen={showPalletModal}
        palletCode={pendingPalletCode}
        onConfirm={handlePalletConfirm}
        onReportIssue={handlePalletReportIssue}
        onClose={handlePalletModalClose}
      />

      {/* Modal de reportar problemas */}
      <ReportIssueModal
        isOpen={showReportModal}
        onClose={handleReportModalClose}
      />
    </div>
  );
};

export default RegistrarCaja; 