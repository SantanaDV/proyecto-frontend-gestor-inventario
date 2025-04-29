import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Asegúrate de importar el módulo `path`
import tailwindcss from '@tailwindcss/vite' // Mantén la importación de tailwindcss

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // Configuración del alias
    },
  },
})
