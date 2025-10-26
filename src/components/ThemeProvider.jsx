'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? 'dark' : 'light');
    setMounted(true);

    // Listen for changes
    const handleChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const getBackgroundStyle = () => ({
    backgroundImage: `url(${theme === 'dark' ? '/bg-dark.jpg' : '/bg-light.jpg'})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed'
  });

  const getCardClassName = () => 
    theme === 'dark' ? 'bg-gray-900' : 'bg-white';

  const getTextClassName = () => 
    theme === 'dark' ? 'text-white' : 'text-black';

  const getSubTextClassName = () => 
    theme === 'dark' ? 'text-gray-300' : 'text-[#464646]';

  const getInputClassName = (hasError = false) => {
    const baseClasses = 'w-full h-12 border rounded-full px-4 focus:ring-0';
    const themeClasses = theme === 'dark' 
      ? 'bg-gray-800 text-white placeholder:text-gray-400 border-gray-600 focus:border-gray-500'
      : 'bg-white text-black placeholder:text-gray-400 border-gray-300 focus:border-gray-300';
    const errorClasses = hasError 
      ? 'border-red-500 focus:border-red-500' 
      : '';
    
    return `${baseClasses} ${themeClasses} ${errorClasses}`;
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      getBackgroundStyle,
      getCardClassName,
      getTextClassName,
      getSubTextClassName,
      getInputClassName
    }}>
      {children}
    </ThemeContext.Provider>
  );
};