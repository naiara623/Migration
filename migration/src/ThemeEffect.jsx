// useThemeEffect.js
import { useEffect } from 'react';
import { useTheme } from './ThemeContext';

export const ThemeEffect = () => {
  const { darkMode } = useTheme();

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);
};