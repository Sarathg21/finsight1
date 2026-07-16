import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // ── Backend target ────────────────────────────────────────────────────────────
  // Override with: set VITE_BACKEND=http://localhost:8000 (for local uvicorn dev)
  // Default: http://13.233.207.68:8000 (remote dev backend per .env / authApi specs)
  const BACKEND = process.env.VITE_BACKEND || env.VITE_BACKEND || env.VITE_API_BASE_URL || 'http://13.233.207.68:8000';

  const proxyConfig = {
    target: BACKEND,
    changeOrigin: true,
    secure: false,
    configure: (proxy, _options) => {
      proxy.on('error', (err, _req, _res) => {
        console.warn(`[Vite Proxy] Error proxying request to ${BACKEND}:`, err.message);
      });
    },
  };

  return {
    plugins: [react()],
    server: {
      // Serve index.html for all routes so React Router handles them client-side.
      historyApiFallback: true,

      // ── Dev Proxy ────────────────────────────────────────────────────
      // All /api, /auth, /health requests are forwarded to the backend.
      // This avoids browser CORS blocks (requests appear same-origin to browser).
      proxy: {
        '/api': proxyConfig,
        '/auth': proxyConfig,
        '/health': proxyConfig,
      },
    },
    preview: {
      // Same fix for `vite preview` (production preview mode).
      historyApiFallback: true,
    },
  };
})
