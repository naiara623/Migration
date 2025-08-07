import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './ThemeContext'; // Certifique-se de que o caminho está correto
import App from './App';
import './index.css';

// Obtenha o elemento root
const container = document.getElementById('root');

// Crie uma root
const root = createRoot(container);

// Renderize o aplicativo
root.render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);