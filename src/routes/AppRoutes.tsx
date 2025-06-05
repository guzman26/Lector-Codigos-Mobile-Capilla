import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../views/Dashboard';
import Configuracion from '../views/Configuracion';
import Historial from '../views/Historial';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Default route redirects to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard route */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Configuration route */}
          <Route path="/configuracion" element={<Configuracion />} />
          
          {/* History route */}
          <Route path="/historial" element={<Historial />} />
          
          {/* Future routes can be added here */}
          {/* <Route path="/scanner" element={<Scanner />} /> */}
          
          {/* Catch all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default AppRoutes; 