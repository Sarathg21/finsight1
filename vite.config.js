import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Serve index.html for all routes so React Router handles them client-side.
    // Without this, refreshing on /dashboard returns a 404 from the dev server.
    historyApiFallback: true,
  },
  preview: {
    // Same fix for `vite preview` (production preview mode).
    historyApiFallback: true,
  },
})
