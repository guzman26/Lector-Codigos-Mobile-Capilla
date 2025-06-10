import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { getInfoFromScannedCode, ApiClientError } from '../api';
import type { ScannedCodeInfo } from '../api/types';

interface ScannedCodeContextType {
  data: ScannedCodeInfo | null;
  loading: boolean;
  error: string | null;
  history: ScannedCodeInfo[];
  getCodeInfo: (codigo: string) => Promise<void>;
  reset: () => void;
  clearHistory: () => void;
}

const ScannedCodeContext = createContext<ScannedCodeContextType | undefined>(undefined);

interface ScannedCodeProviderProps {
  children: ReactNode;
}

export const ScannedCodeProvider: React.FC<ScannedCodeProviderProps> = ({ children }) => {
  const [data, setData] = useState<ScannedCodeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ScannedCodeInfo[]>([]);

  const getCodeInfo = useCallback(async (codigo: string) => {
    if (!codigo?.trim()) {
      setError('El código es requerido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getInfoFromScannedCode({ codigo });
      if (result.data) {
        setData(result.data);
      } else {
        setError('No se encontró información para este código');
        setData(null);
      }
      
      
      
    } catch (error) {
      const errorMessage = error instanceof ApiClientError 
        ? error.message 
        : 'Error desconocido al obtener información del código';
      
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const value: ScannedCodeContextType = {
    data,
    loading,
    error,
    history,
    getCodeInfo,
    reset,
    clearHistory,
  };

  return (
    <ScannedCodeContext.Provider value={value}>
      {children}
    </ScannedCodeContext.Provider>
  );
};

export const useScannedCodeContext = (): ScannedCodeContextType => {
  const context = useContext(ScannedCodeContext);
  if (!context) {
    throw new Error('useScannedCodeContext must be used within ScannedCodeProvider');
  }
  return context;
}; 