import React from 'react';
import './Configuracion.css';

const Configuracion: React.FC = () => {
  return (
    <div className="configuracion-content">
      <div className="config-section">
        <h2 className="config-title">Configuración del Terminal</h2>
        
        <div className="config-group">
          <h3 className="group-title">General</h3>
          <div className="config-item">
            <label className="config-label">ID Terminal:</label>
            <input 
              type="text" 
              className="config-input" 
              value="TRM-001" 
              readOnly 
            />
          </div>
          <div className="config-item">
            <label className="config-label">Modo de escaneo:</label>
            <select className="config-select">
              <option value="auto">Automático</option>
              <option value="manual">Manual</option>
            </select>
          </div>
        </div>

        <div className="config-group">
          <h3 className="group-title">Conectividad</h3>
          <div className="config-item">
            <label className="config-label">Servidor:</label>
            <input 
              type="text" 
              className="config-input" 
              placeholder="192.168.1.100"
            />
          </div>
          <div className="config-item">
            <label className="config-label">Puerto:</label>
            <input 
              type="number" 
              className="config-input" 
              placeholder="8080"
            />
          </div>
        </div>

        <div className="config-actions">
          <button className="config-btn primary">
            Guardar Configuración
          </button>
          <button className="config-btn secondary">
            Restaurar Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default Configuracion; 