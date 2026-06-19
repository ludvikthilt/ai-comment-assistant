import { createTheme, type ThemeOptions } from '@mui/material/styles';

const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, fontSize: '2.5rem' },
    h2: { fontWeight: 700, fontSize: '2rem' },
    h3: { fontWeight: 700, fontSize: '1.5rem' },
    h4: { fontWeight: 600, fontSize: '1.25rem' },
    h5: { fontWeight: 600, fontSize: '1.1rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: { main: '#1877F2', contrastText: '#fff' },
    secondary: { main: '#42B72A' },
    background: { default: '#f0f2f5', paper: '#ffffff' },
    text: { primary: '#1c1e21', secondary: '#65676b' },
    success: { main: '#42B72A', light: '#e8f5e9' },
    error: { main: '#f44336', light: '#ffebee' },
    warning: { main: '#ff9800', light: '#fff3e0' },
    info: { main: '#2196f3', light: '#e3f2fd' },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: { main: '#1877F2', contrastText: '#fff' },
    secondary: { main: '#42B72A' },
    background: { default: '#18191a', paper: '#242526' },
    text: { primary: '#e4e6eb', secondary: '#b0b3b8' },
    success: { main: '#42B72A', light: '#1b3a1b' },
    error: { main: '#f44336', light: '#3a1b1b' },
    warning: { main: '#ff9800', light: '#3a2a1b' },
    info: { main: '#2196f3', light: '#1b2a3a' },
  },
});
