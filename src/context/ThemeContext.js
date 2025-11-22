import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '../constants/theme';

const THEME_KEY = '@onyx_theme_preference';

export const ThemeContext = createContext({
  theme: darkTheme,
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(darkTheme);
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    const newTheme = isDark ? lightTheme : darkTheme;
    setTheme(newTheme);
    setIsDark(!isDark);
  };

  const setThemePreference = (dark) => {
    const newTheme = dark ? darkTheme : lightTheme;
    setTheme(newTheme);
    setIsDark(dark);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
        setTheme: setThemePreference,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};