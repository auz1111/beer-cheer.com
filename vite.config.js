import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['quill'],
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
