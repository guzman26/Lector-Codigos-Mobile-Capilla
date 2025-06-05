import AppRoutes from './routes/AppRoutes';
import { ScannedCodeProvider } from './context/ScannedCodeContext';
import './App.css';

function App() {
  return (
    <ScannedCodeProvider>
      <AppRoutes />
    </ScannedCodeProvider>
  );
}

export default App; 