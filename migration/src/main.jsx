import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './ThemeContext';
import App from './App';
import BoasVindas from './pages/BoasVinda';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <StrictMode>
    <ThemeProvider>
      <BoasVindas />
      <App />
    </ThemeProvider>
  </StrictMode>
);
