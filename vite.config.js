import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = 'http://13.233.207.68:8000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Serve index.html for all routes so React Router handles them client-side.
    historyApiFallback: true,

    // ── Dev Proxy ────────────────────────────────────────────────────
    // All /api, /auth, /health requests are forwarded to the backend.
    // This avoids browser CORS blocks (requests appear same-origin to browser).
    proxy: {
      '/api': {
        target:      BACKEND,
        changeOrigin: true,
        secure:       false,
      },
      '/auth': {
        target:      BACKEND,
        changeOrigin: true,
        secure:       false,
      },
      '/health': {
        target:      BACKEND,
        changeOrigin: true,
        secure:       false,
      },
    },
  },
  preview: {
    // Same fix for `vite preview` (production preview mode).
    historyApiFallback: true,
  },
})
