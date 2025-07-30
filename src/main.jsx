import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';


// Importa tus providers
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./providers/CartProvider";
import InventoryProvider from './context/InventoryContext';
import { InsigniasProvider } from "./context/InsigniasContext";
import InsigniasProviderWrapper from "./InsigniasProviderWrapper";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <InventoryProvider>
          <InsigniasProviderWrapper>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <App />
            </ThemeProvider>
          </InsigniasProviderWrapper>
        </InventoryProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)