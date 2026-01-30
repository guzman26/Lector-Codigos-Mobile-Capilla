import { useState, useRef, useEffect } from 'react';

/**
 * Hook for managing scan mode state and input focus
 * When scan mode is enabled, automatically focuses the input field
 */
export const useScanMode = (initialEnabled: boolean = false) => {
  const [scanMode, setScanMode] = useState(initialEnabled);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scanMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [scanMode]);

  const toggleScanMode = () => setScanMode((prev) => !prev);

  return { scanMode, setScanMode, toggleScanMode, inputRef };
};
