import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';  
import router from './router/Router.jsx';
import './index.css';
import { ThemeProvider } from './ThemeContext.jsx';
import './i18n'; // importa a configuração do i18next


// Obtenha o elemento root
const container = document.getElementById('root');

// Crie uma root
const root = createRoot(container);

// Renderize o aplicativo
root.render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router}/>
    </ThemeProvider>
  </StrictMode>
);