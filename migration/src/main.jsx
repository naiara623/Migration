import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './ThemeContext'; // Certifique-se de que o caminho está correto
import App from './App';
import './index.css';
import { RouterProvider } from 'react-router-dom'
import router from './router/Router.jsx'

// Obtenha o elemento root
const container = document.getElementById('root');

// Crie uma root
const root = createRoot(container);

// Renderize o aplicativo
createRoot(document.getElementById('root')).render(

  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router}/>
      <App />
    </ThemeProvider>
  </StrictMode>
);