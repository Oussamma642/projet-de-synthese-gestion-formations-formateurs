import React from 'react';
import { useTheme } from './theme-provider'; // Ensure this import is correct

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    // Directly set the theme based on the current theme
    setTheme(theme === 'light' ? 'dark' : 'light'); // Ensure this is a string
  };

  return (
    <button onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' ? (
        <span role="img" aria-label="Switch to dark theme">🌙</span>
      ) : (
        <span role="img" aria-label="Switch to light theme">☀️</span>
      )}
    </button>
  );
};

export default ThemeToggle; 