import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography } from '../ui';
import Footer from '../Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = (): string => {
    const path = location.pathname;
    if (path.includes('/configuracion')) return 'configuracion';
    if (path.includes('/historial')) return 'historial';
    return 'escaneo';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  const footerTabs = [
    { id: 'escaneo', icon: '📱', label: 'Escaneo', isActive: activeTab === 'escaneo' },
    { id: 'historial', icon: '📋', label: 'Historial', isActive: activeTab === 'historial' },
    { id: 'configuracion', icon: '⚙️', label: 'Config', isActive: activeTab === 'configuracion' },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
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
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Box
        component="header"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={2}
        py={1.5}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Box>
          <Typography variant="h6" component="h1">
            Terminal de Escaneo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Terminal ID: TRM-001
          </Typography>
        </Box>
        <Typography variant="body2" color="success.main">
          En línea
        </Typography>
      </Box>
      <Box
        component="main"
        flex={1}
        p={2}
        sx={{
          overflow: 'auto',
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        {children}
      </Box>
      <Footer tabs={footerTabs} onTabClick={handleTabClick} />
    </Box>
  );
};

export default Layout;
