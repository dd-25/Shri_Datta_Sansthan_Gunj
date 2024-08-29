import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: import.meta.env.VITE_PORT,
    open: '/home',
    proxy: {
      '/api': {
        target: import.meta.env.VITE_API_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
});
