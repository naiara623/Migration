// ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Verifica se há um tema salvo no localStorage, caso contrário, usa o padrão (light)
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('darkMode') : null;
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  // Atualiza o localStorage sempre que o tema mudar
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => React.useContext(ThemeContext);