import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1565C0', // Azul corporativo
      light: '#42A5F5',
      dark: '#0D47A1',
    },
    secondary: {
      main: '#37474F', // Gris oscuro
      light: '#546E7A',
      dark: '#263238',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none', // Sin mayúsculas automáticas (más profesional)
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
