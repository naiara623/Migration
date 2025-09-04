// ThemeContext.jsx - COMPATÍVEL
import React, { createContext, useState, useEffect, useContext } from 'react';

// Crie o contexto
const ThemeContext = createContext();

// Componente Provider que também funciona como ThemeContext
export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('darkMode') : null;
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const value = {
    darkMode,
    toggleTheme,
    setDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personalizado
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// ✅ Exporte como ThemeContext também (para compatibilidade)
export const ThemeContextComponent = ThemeProvider;

// ✅ Ou se preferir, exporte diretamente:
export { ThemeProvider as ThemeContext };