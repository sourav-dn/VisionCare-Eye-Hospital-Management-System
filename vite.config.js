import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Suppress noisy proxy errors when backend isn't running yet
const suppressProxyError = (proxy) => {
  proxy.on('error', (err) => {
    if (['ECONNREFUSED', 'ECONNABORTED', 'ECONNRESET'].includes(err.code)) return;
    console.error('[proxy error]', err.message);
  });
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: suppressProxyError,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: suppressProxyError,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
        configure: suppressProxyError,
      },
    },
  },
})

