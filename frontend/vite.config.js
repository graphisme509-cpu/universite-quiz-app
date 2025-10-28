import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',  // très important pour Vercel
  server: {
    proxy: {
      '/api': 'http://localhost:3000'  // uniquement pour le dev local
    }
  }
});
