import React from 'react';

interface PalletCodePreviewProps {
  code: string;
}

/**
 * Component to preview the generated pallet code
 */
export const PalletCodePreview: React.FC<PalletCodePreviewProps> = ({ code }) => {
  return (
    <div className="pallet-code-preview">
      <div className="preview-header">
        <span className="preview-icon">📋</span>
        <h3>Código de Pallet Generado</h3>
      </div>
      <div className="preview-code">
        <span className="code-display">{code}</span>
        <span className="code-type">Pallet</span>
      </div>
    </div>
  );
}; 