// src/constants/theme.js
export const lightTheme = {
  colors: {
    primary: '#8A2BE2',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#212529',
    textSecondary: '#6C757D',
    border: '#E9ECEF',
    notification: '#FF6B6B',
  },
  typography: {
    small: {
      fontSize: 12,
      lineHeight: 16,
    },
    medium: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
    },
    large: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

export const darkTheme = {
  colors: {
    primary: '#9D4EDD',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#F8F9FA',
    textSecondary: '#ADB5BD',
    border: '#343A40',
    notification: '#FF8787',
  },
  typography: {
    small: {
      fontSize: 12,
      lineHeight: 16,
    },
    medium: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
    },
    large: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

export const theme = darkTheme; // Varsayılan tema