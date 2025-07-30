import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    primary: {
      main: '#2c3e50',
      light: '#34495e',
      dark: '#1a252f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3498db',
      light: '#5dade2',
      dark: '#2980b9',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
    },
  },
  typography: {
    fontFamily: [
      'Segoe UI',
      '-apple-system',
      'BlinkMacSystemFont',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif'
    ].join(','),
    h1: {
      fontWeight: 600,
      color: '#2c3e50',
    },
    h2: {
      fontWeight: 600,
      color: '#2c3e50',
    },
    h3: {
      fontWeight: 600,
      color: '#2c3e50',
    },
    h4: {
      fontWeight: 600,
      color: '#2c3e50',
    },
    h5: {
      fontWeight: 600,
      color: '#2c3e50',
    },
    h6: {
      fontWeight: 600,
      color: '#2c3e50',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          }
        },
      },
    },
  },
});

// Hacer que las fuentes sean responsivas
theme = responsiveFontSizes(theme);

export default theme;