import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite dev server proxies API calls to backend services during local development
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/auth': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/fitness': { target: 'http://localhost:3002', changeOrigin: true },
      '/api/goals': { target: 'http://localhost:3003', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
  },
});
