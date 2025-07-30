import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Establecer NODE_ENV basado en el modo de Vite
  process.env.NODE_ENV = mode
  
  return {
    plugins: [react()],
    // Configuración adicional según el entorno
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  }
})