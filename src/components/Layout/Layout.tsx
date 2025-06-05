import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from '../Footer';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determinar la pestaña activa basada en la ruta actual
  const getActiveTab = (): string => {
    const path = location.pathname;
    if (path.includes('/configuracion')) return 'configuracion';
    if (path.includes('/historial')) return 'historial';
    return 'escaneo'; // Default
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  const footerTabs = [
    {
      id: 'escaneo',
      icon: '📱',
      label: 'Escaneo',
      isActive: activeTab === 'escaneo'
    },
    {
      id: 'historial',
      icon: '📋',
      label: 'Historial',
      isActive: activeTab === 'historial'
    },
    {
      id: 'configuracion',
      icon: '⚙️',
      label: 'Config',
      isActive: activeTab === 'configuracion'
    }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    
    // Navegación basada en el tab seleccionado
    switch (tabId) {
      case 'escaneo':
        navigate('/dashboard');
        break;
      case 'historial':
        navigate('/historial');
        break;
      case 'configuracion':
        navigate('/configuracion');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-info">
          <h1 className="header-title">Terminal de Escaneo</h1>
          <span className="terminal-id">Terminal ID: TRM-001</span>
        </div>
        <div className="status-indicator">
          <span className="status-text">En línea</span>
        </div>
      </header>
      
      <main className="layout-content">
        {children}
      </main>

      <Footer tabs={footerTabs} onTabClick={handleTabClick} />
    </div>
  );
};

export default Layout; 