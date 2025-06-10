import AppRoutes from './routes/AppRoutes';
import { ScannedCodeProvider } from './context/ScannedCodeContext';
import { ScanProvider } from './context/ScanContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <ScanProvider>
        <ScannedCodeProvider>
          <AppRoutes />
        </ScannedCodeProvider>
      </ScanProvider>
    </ThemeProvider>
  );
}

export default App; 