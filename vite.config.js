import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Quill 2 is ESM but depends on CommonJS quill-delta, so it must be pre-bundled (don't exclude it).
  optimizeDeps: {
    include: ['quill'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://www.beer-cheer.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
