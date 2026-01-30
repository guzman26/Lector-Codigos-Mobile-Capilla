import { ThemeProvider, createTheme } from './components/ui';
import AppRoutes from './routes/AppRoutes';
import { ScannedCodeProvider } from './context/ScannedCodeContext';
import { ScanProvider } from './context/ScanContext';
import './App.css';

const theme = createTheme({ palette: { mode: 'light' } });

function App() {
  return (
    <ScanProvider>
      <ScannedCodeProvider>
        <ThemeProvider theme={theme}>
          <AppRoutes />
        </ThemeProvider>
      </ScannedCodeProvider>
    </ScanProvider>
  );
}

export default App;
